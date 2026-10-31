"use client"
// Everything that lives outside React: the loaded 3D parts, the model loader queue and the visibility/glow sync.
import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js"
import { anatomySystems, prettyName, systemById, type AnatomySystem, type SystemId } from "@/data/anatomy-systems"
import { CLIP_BELOW, baseName, classifyTissue, isJunk, normalize, regionOf, sideOf, type RegionId, type SearchEntry, type Side, type Tissue } from "./catalog.ts"
import { TISSUES, ghostMaterial, makeMaterial, principalAxis, type Tier } from "./materials.ts"
import { store, type State } from "./store.ts"

export interface Part {
  key: string
  name: string
  label: string
  system: AnatomySystem
  tissue: Tissue
  region: RegionId
  side: Side
  node: THREE.Object3D
  meshes: THREE.Mesh[]
  materials: THREE.MeshPhysicalMaterial[]
  center: THREE.Vector3
  radius: number
  rest: THREE.Vector3
  dir: THREE.Vector3
}

export interface IndexRow { key: string; name: string; system: SystemId; center: THREE.Vector3; radius: number }

export const registry = {
  parts: new Map<string, Part>(),
  groups: new Map<SystemId, THREE.Group>(),
  pickList: [] as THREE.Mesh[],
  entries: [] as SearchEntry[],
  rows: new Map<string, IndexRow>(),
  entryByKey: new Map<string, SearchEntry>(),
  meshOwner: new Map<string, Part>(),
  hoverKey: null as string | null,
  tier: "high" as Tier,
}

export const key = (system: SystemId, name: string) => `${system}:${name}`

// ---------- search index (centres and radii of every structure, available before any model loads) ----------

let indexPromise: Promise<void> | null = null
export function loadIndex() {
  indexPromise ??= fetch("/models/index.json")
    .then((r) => r.json())
    .then((j: { systems: Record<SystemId, [string, number, number, number, number][]> }) => {
      const entries: SearchEntry[] = []
      for (const sys of anatomySystems) {
        for (const [name, x, y, z, r] of j.systems[sys.id] ?? []) {
          if (isJunk(name)) continue
          const k = key(sys.id, name)
          registry.rows.set(k, { key: k, name, system: sys.id, center: new THREE.Vector3(x, y, z), radius: r })
          entries.push({ key: k, label: prettyName(name), norm: normalize(baseName(name)), system: sys.id, region: regionOf(sys.id, name, { x, y }), side: sideOf(name, x) })
        }
      }
      registry.entries = entries
      for (const e of entries) registry.entryByKey.set(e.key, e)
      store.set((s) => ({ version: s.version + 1 }))
    })
    .catch(() => { indexPromise = null })
  return indexPromise
}

// ---------- building parts from a parsed GLB ----------

function buildParts(sys: AnatomySystem, scene: THREE.Group) {
  scene.updateMatrixWorld(true)
  const defaultHidden: string[] = []
  // the models are flat: every direct child of the scene is one structure
  for (const node of [...scene.children]) {
    const name = (node.userData.name as string) || node.name.replace(/\.\d{3}$/, "")
    if (isJunk(name)) { node.visible = false; continue }
    const k = key(sys.id, name)
    const meshes: THREE.Mesh[] = []
    const materials: THREE.MeshPhysicalMaterial[] = []
    let tissue: Tissue | null = null
    node.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (!mesh.isMesh) return
      const old = mesh.material as THREE.MeshStandardMaterial
      const t = classifyTissue(sys.id, old.name ?? "", name)
      tissue ??= t
      const axis = (TISSUES[t].fibre ?? 0) > 0 ? principalAxis(mesh.geometry) : new THREE.Vector3(0, 1, 0)
      const m = makeMaterial(t, old.color ?? null, name, axis, registry.tier, sys.color)
      const clip = CLIP_BELOW.find((c) => c.re.test(name))
      if (clip) m.clippingPlanes = [new THREE.Plane(new THREE.Vector3(0, 1, 0), -clip.y)]
      mesh.material = m
      old.dispose()
      meshes.push(mesh)
      materials.push(m)
    })
    if (!meshes.length) continue
    // keep the original position on the node so a part that is still exploded can be measured at rest
    const rest = (node.userData.restPosition ??= node.position.clone()) as THREE.Vector3
    node.position.copy(rest)
    const box = new THREE.Box3().setFromObject(node)
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())
    // spread sideways and front/back more than up/down so the body opens like an exploded diagram
    const flat = new THREE.Vector3(center.x, 0, center.z)
    const dir = new THREE.Vector3(center.x * 1.6, center.y * 0.5, center.z * 2.2).addScaledVector(flat.normalize(), 0.12)
    const part: Part = {
      key: k, name, label: prettyName(name), system: sys, tissue: tissue ?? "generic",
      region: regionOf(sys.id, name, center), side: sideOf(name, center.x),
      node, meshes, materials, center, radius: size.length() / 2, rest, dir,
    }
    registry.parts.set(k, part)
    for (const m of meshes) registry.meshOwner.set(m.uuid, part)
    // the overlapping liver segments would z-fight with the whole liver, so they start hidden
    if (/segment of liver/i.test(name)) defaultHidden.push(k)
  }
  registry.groups.set(sys.id, scene)
  if (defaultHidden.length) store.set((s) => ({ hidden: new Set([...s.hidden, ...defaultHidden]) }))
}

// ---------- loader queue (one download at a time so the skeleton is not slowed down) ----------

const queue: SystemId[] = []
const done = new Map<SystemId, Promise<void>>()
let running = false

export function requestSystem(id: SystemId, urgent = true) {
  const st = store.get().load[id].status
  if (st === "ready" || st === "loading" || st === "queued") {
    if (st === "queued" && urgent) { queue.splice(queue.indexOf(id), 1); queue.unshift(id) }
    return
  }
  setLoad(id, { status: "queued", p: 0 })
  if (urgent) queue.unshift(id)
  else queue.push(id)
  void pump()
}

function setLoad(id: SystemId, patch: Partial<State["load"][SystemId]>) {
  store.set((s) => ({ load: { ...s.load, [id]: { ...s.load[id], ...patch } } }))
}

async function pump() {
  if (running) return
  running = true
  while (queue.length) {
    const id = queue.shift()!
    const p = loadOne(id).catch((e) => { console.error("anatomy load failed", id, e); setLoad(id, { status: "error" }) })
    done.set(id, p)
    await p
  }
  running = false
}

async function loadOne(id: SystemId) {
  const sys = systemById[id]
  setLoad(id, { status: "loading", p: 0 })
  const res = await fetch(sys.file)
  if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`)
  const reader = res.body.getReader()
  const chunks: Uint8Array[] = []
  let got = 0, last = 0
  for (;;) {
    const { done: end, value } = await reader.read()
    if (end) break
    chunks.push(value)
    got += value.length
    const now = performance.now()
    if (now - last > 100) { last = now; setLoad(id, { p: Math.min(0.99, got / sys.bytes) }) }
  }
  const buf = new Uint8Array(got)
  let off = 0
  for (const c of chunks) { buf.set(c, off); off += c.length }
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder)
  const gltf = await loader.parseAsync(buf.buffer, "")
  buildParts(sys, gltf.scene)
  setLoad(id, { status: "ready", p: 1 })
  store.set((s) => ({ version: s.version + 1 }))
}

// ---------- visibility, opacity, ghost outline, highlight ----------

const ACCENT = new THREE.Color("#14b8a6")
const GOOD = new THREE.Color("#22c55e")
const BAD = new THREE.Color("#ef4444")

export function glowOf(p: Part, s: State) {
  const f = s.quiz.flash
  if (f && f.key === p.key) return { color: f.ok ? GOOD : BAD, k: 0.6 }
  if (s.quiz.active && s.quiz.mode === "name") return { color: ACCENT, k: p.key === s.quiz.target ? 0.7 : 0 }
  if (s.quiz.active) return { color: ACCENT, k: 0 }
  if (p.key === s.selected) return { color: ACCENT, k: 0.6 }
  if (p.key === registry.hoverKey) return { color: ACCENT, k: 0.25 }
  return { color: ACCENT, k: 0 }
}

export function applyGlow(p: Part, s: State) {
  const g = glowOf(p, s)
  for (const m of p.materials) m.emissive.copy(g.color).multiplyScalar(g.k)
}

export function applyVisuals(s: State) {
  const pick: THREE.Mesh[] = []
  const ghostOn = s.outline && !s.systemsOn.muscular && registry.groups.has("muscular")
  registry.parts.forEach((p) => {
    const sysId = p.system.id
    const isGhost = !s.isolated && sysId === "muscular" && ghostOn
    const on = s.isolated ? p.key === s.isolated : (s.systemsOn[sysId] || isGhost) && !s.hidden.has(p.key)
    p.node.visible = on
    if (!on) return
    for (let i = 0; i < p.meshes.length; i++) {
      const mesh = p.meshes[i]
      const m = p.materials[i]
      if (isGhost) { mesh.material = ghostMaterial; continue }
      mesh.material = m
      const base = (m.userData.baseOpacity as number) ?? 1
      // in a name test everything of that system except the question is faded so the target stands out
      const faded = s.quiz.active && s.quiz.mode === "name" && !!s.quiz.target && sysId === s.quiz.system && p.key !== s.quiz.target
      const o = s.isolated ? 1 : faded ? 0.07 : base * s.opacity[sysId]
      const translucent = o < 0.999
      if (m.transparent !== translucent) { m.transparent = translucent; m.needsUpdate = true }
      m.opacity = o
      m.depthWrite = !translucent
      if (o > 0.35) pick.push(mesh)
    }
    applyGlow(p, s)
  })
  registry.pickList = pick
}

// ---------- layout (set by the shell, read by the camera) ----------

export const layout = {
  // fractions of the canvas covered by UI, so the body is framed in the part that stays visible
  insets: { top: 0, bottom: 0, left: 0, right: 0 },
  aspect: 1,
  fov: 35,
}
