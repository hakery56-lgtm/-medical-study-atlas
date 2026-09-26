"use client"

import { Suspense, useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from "react"
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber"
import { OrbitControls, useGLTF, useProgress } from "@react-three/drei"
import * as THREE from "three"
import { Crosshair, Eye, EyeOff, RotateCcw, Search, SlidersHorizontal, X } from "lucide-react"
import { anatomySystems, MAX_DEPTH, prettyName, type AnatomySystem } from "@/data/anatomy-systems"

// One named structure. A structure with several materials is a group of meshes (one per material).
interface Part {
  node: THREE.Object3D
  materials: THREE.MeshStandardMaterial[]
  system: AnatomySystem
  name: string
  rest: THREE.Vector3
  dir: THREE.Vector3
  center: THREE.Vector3
  radius: number
}
type Parts = MutableRefObject<Map<string, Part>>

const HOME = { target: new THREE.Vector3(0, 0, 0), pos: new THREE.Vector3(0, 0.05, 3.4) }
const EXPLODE_DISTANCE = 0.7
const LAYER_NAMES = ["Skin", "Muscles", "Vessels, nerves & lymph", "Organs", "Skeleton"]
const ACCENT = new THREE.Color("#14b8a6")
const clamp01 = (x: number) => Math.min(1, Math.max(0, x))

function SystemModel({ sys, onLoad }: { sys: AnatomySystem; onLoad: (sys: AnatomySystem, scene: THREE.Group) => void }) {
  const { scene } = useGLTF(sys.file)
  useEffect(() => onLoad(sys, scene), [sys, scene, onLoad])
  return <primitive object={scene} />
}

// Moves every part along its explode direction, easing towards the slider value.
function Exploder({ parts, explode, version }: { parts: Parts; explode: number; version: number }) {
  const current = useRef(0)
  const applied = useRef({ value: -1, version: -1 })
  useFrame(() => {
    const d = explode - current.current
    current.current = Math.abs(d) < 0.001 ? explode : current.current + d * 0.12
    if (applied.current.value === current.current && applied.current.version === version) return
    applied.current = { value: current.current, version }
    const k = current.current * EXPLODE_DISTANCE
    parts.current.forEach((p) => p.node.position.copy(p.rest).addScaledVector(p.dir, k))
  })
  return null
}

// Smoothly flies the camera to a part (or home); any user drag cancels the flight.
function CameraRig({ parts, focus }: { parts: Parts; focus: { uuid: string; n: number } | null }) {
  const { camera, controls } = useThree() as unknown as { camera: THREE.Camera; controls: { target: THREE.Vector3; update: () => void; addEventListener: (t: string, f: () => void) => void; removeEventListener: (t: string, f: () => void) => void } | null }
  const goal = useRef<{ target: THREE.Vector3; pos: THREE.Vector3 } | null>(null)

  useEffect(() => {
    if (!controls) return
    const stop = () => (goal.current = null)
    controls.addEventListener("start", stop)
    return () => controls.removeEventListener("start", stop)
  }, [controls])

  useEffect(() => {
    if (!focus || !controls) return
    if (focus.uuid === "home") {
      goal.current = { target: HOME.target.clone(), pos: HOME.pos.clone() }
      return
    }
    const p = parts.current.get(focus.uuid)
    if (!p) return
    const target = p.center.clone().add(p.node.position).sub(p.rest)
    const view = camera.position.clone().sub(controls.target).normalize()
    goal.current = { target, pos: target.clone().addScaledVector(view, Math.max(p.radius * 5, 0.45)) }
  }, [focus, controls, camera, parts])

  useFrame(() => {
    const g = goal.current
    if (!g || !controls) return
    controls.target.lerp(g.target, 0.12)
    camera.position.lerp(g.pos, 0.12)
    controls.update()
    if (camera.position.distanceTo(g.pos) < 0.002) goal.current = null
  })
  return null
}

function LoadingBadge() {
  const { active, progress } = useProgress()
  if (!active) return null
  return (
    <div className="pointer-events-none absolute bottom-20 left-1/2 -translate-x-1/2 rounded-full px-4 py-1.5 text-xs font-semibold shadow" style={{ backgroundColor: "var(--bg-card)", color: "var(--text-muted)" }}>
      Loading models… {Math.round(progress)}%
    </div>
  )
}

export default function BodyViewer() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>(() => Object.fromEntries(anatomySystems.map((s) => [s.id, !!s.defaultOn])))
  const [mounted, setMounted] = useState<Set<string>>(() => new Set(anatomySystems.filter((s) => s.defaultOn).map((s) => s.id)))
  const [opacity, setOpacity] = useState<Record<string, number>>(() => Object.fromEntries(anatomySystems.map((s) => [s.id, 1])))
  const [peel, setPeel] = useState(0)
  const [explode, setExplode] = useState(0)
  const [hidden, setHidden] = useState<Set<string>>(() => new Set())
  const [isolated, setIsolated] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const [focus, setFocus] = useState<{ uuid: string; n: number } | null>(null)
  const [pending, setPending] = useState<string | null>(null)
  const [index, setIndex] = useState<Record<string, string[]>>({})
  const [query, setQuery] = useState("")
  const [panelOpen, setPanelOpen] = useState(false)
  const [version, setVersion] = useState(0)
  const parts = useRef(new Map<string, Part>())
  const meshOwner = useRef(new Map<string, string>()) // mesh uuid -> part key
  const tooltip = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch("/models/index.json").then((r) => r.json()).then(setIndex).catch(() => setIndex({}))
  }, [])

  const onLoad = useCallback((sys: AnatomySystem, scene: THREE.Group) => {
    scene.updateMatrixWorld(true)
    // the models are flattened: every direct child of the scene is one structure
    scene.children.forEach((node) => {
      if (parts.current.has(node.uuid)) return
      const materials: THREE.MeshStandardMaterial[] = []
      node.traverse((o) => {
        const mesh = o as THREE.Mesh
        if (!mesh.isMesh) return
        const material = (mesh.material as THREE.MeshStandardMaterial).clone()
        const c = material.color
        if (c.r > 0.99 && c.g > 0.99 && c.b > 0.99) c.set(sys.color)
        material.metalness = 0
        material.roughness = 0.65
        mesh.material = material
        materials.push(material)
        meshOwner.current.set(mesh.uuid, node.uuid)
      })
      if (!materials.length) return
      const box = new THREE.Box3().setFromObject(node)
      const center = box.getCenter(new THREE.Vector3())
      // spread sideways and front/back more than up/down so the body opens like an exploded diagram
      const flat = new THREE.Vector3(center.x, 0, center.z)
      const dir = new THREE.Vector3(center.x * 1.6, center.y * 0.5, center.z * 2.2).addScaledVector(flat.normalize(), 0.12)
      parts.current.set(node.uuid, {
        node, materials, system: sys, center, dir,
        name: (node.userData.name as string) || node.name,
        rest: node.position.clone(),
        radius: box.getSize(new THREE.Vector3()).length() / 2,
      })
    })
    setVersion((v) => v + 1)
  }, [])

  const findByName = (name: string) => {
    let found: string | null = null
    parts.current.forEach((p, uuid) => {
      if (p.name === name) found = uuid
    })
    return found
  }

  // select a search result once its system has loaded
  useEffect(() => {
    if (!pending) return
    const uuid = findByName(pending)
    if (!uuid) return
    setSelected(uuid)
    setFocus({ uuid, n: Date.now() })
    setPending(null)
  }, [pending, version])

  // visibility, ghosting, peeling and highlight for every part
  useEffect(() => {
    parts.current.forEach((p, uuid) => {
      const fade = opacity[p.system.id] * clamp01(p.system.depth + 1 - peel)
      const shown = isolated ? uuid === isolated : enabled[p.system.id] && fade > 0.02 && !hidden.has(uuid)
      const o = isolated ? 1 : fade
      const glow = uuid === selected ? 0.55 : uuid === hovered ? 0.3 : 0
      p.node.visible = shown
      for (const m of p.materials) {
        m.opacity = o
        m.transparent = o < 0.999
        m.depthWrite = o >= 0.999
        m.emissive.copy(ACCENT).multiplyScalar(glow)
      }
    })
  }, [enabled, opacity, peel, hidden, isolated, selected, hovered, version])

  const pick = (e: ThreeEvent<PointerEvent | MouseEvent>) => {
    for (const i of e.intersections) {
      const key = meshOwner.current.get(i.object.uuid)
      const p = key ? parts.current.get(key) : undefined
      if (p && p.node.visible && p.materials[0].opacity > 0.35) return key!
    }
    return null
  }

  const onPointerMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    const uuid = pick(e)
    setHovered(uuid)
    const el = tooltip.current
    if (!el) return
    const box = el.parentElement!.getBoundingClientRect()
    el.style.transform = `translate(${e.nativeEvent.clientX - box.left + 14}px, ${e.nativeEvent.clientY - box.top + 14}px)`
    el.textContent = uuid ? prettyName(parts.current.get(uuid)!.name) : ""
    el.style.opacity = uuid ? "1" : "0"
  }
  const onPointerOut = () => {
    setHovered(null)
    if (tooltip.current) tooltip.current.style.opacity = "0"
  }
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 4) return // was a drag
    e.stopPropagation()
    setSelected(pick(e))
  }

  const toggleSystem = (id: string) => {
    setEnabled((s) => ({ ...s, [id]: !s[id] }))
    setMounted((m) => new Set(m).add(id))
  }

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q.length < 2) return []
    const out: { name: string; sys: AnatomySystem }[] = []
    for (const sys of anatomySystems)
      for (const name of index[sys.id] ?? []) if (prettyName(name).toLowerCase().includes(q)) out.push({ name, sys })
    return out.slice(0, 8)
  }, [query, index])

  const openResult = (name: string, sys: AnatomySystem) => {
    setQuery("")
    setIsolated(null)
    setPeel(sys.depth) // peel away the layers covering it
    setOpacity((o) => ({ ...o, [sys.id]: Math.max(o[sys.id], 0.6) }))
    setEnabled((s) => ({ ...s, [sys.id]: true }))
    setMounted((m) => new Set(m).add(sys.id))
    const uuid = findByName(name)
    if (uuid) {
      setHidden((h) => { const n = new Set(h); n.delete(uuid); return n })
      setSelected(uuid)
      setFocus({ uuid, n: Date.now() })
    } else setPending(name)
  }

  const showAll = () => {
    setHidden(new Set())
    setIsolated(null)
  }
  const sel = selected ? parts.current.get(selected) : undefined

  const panel = (
    <div className="space-y-6">
      <section>
        <h3 className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: "var(--text-muted)" }}>Body systems</h3>
        <ul className="space-y-1">
          {anatomySystems.map((s) => (
            <li key={s.id} className="rounded-lg px-2 py-1.5" style={{ backgroundColor: enabled[s.id] ? "var(--bg-inset)" : "transparent" }}>
              <label className="flex cursor-pointer items-center gap-2.5 text-sm">
                <input type="checkbox" aria-label={s.label} checked={enabled[s.id]} onChange={() => toggleSystem(s.id)} className="h-4 w-4 accent-[var(--accent)]" />
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="flex-1" style={{ color: "var(--text-main)" }}>{s.label}</span>
              </label>
              {enabled[s.id] && (
                <input
                  type="range" min={0.1} max={1} step={0.05} value={opacity[s.id]}
                  onChange={(e) => setOpacity((o) => ({ ...o, [s.id]: Number(e.target.value) }))}
                  aria-label={`${s.label} opacity`}
                  className="mt-1 w-full accent-[var(--accent)]"
                />
              )}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <div className="mb-1 flex items-baseline justify-between">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: "var(--text-muted)" }}>Peel layers</h3>
          <span className="text-xs font-semibold" style={{ color: "var(--accent)" }}>{LAYER_NAMES[Math.min(MAX_DEPTH, Math.floor(peel))]}</span>
        </div>
        <input type="range" min={0} max={MAX_DEPTH} step={0.05} value={peel} onChange={(e) => setPeel(Number(e.target.value))} aria-label="Peel layers" className="w-full accent-[var(--accent)]" />
        <div className="flex justify-between text-[10px]" style={{ color: "var(--text-muted)" }}><span>Skin</span><span>Skeleton</span></div>
      </section>

      <section>
        <div className="mb-1 flex items-baseline justify-between">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: "var(--text-muted)" }}>Explode view</h3>
          <span className="text-xs font-semibold tabular-nums" style={{ color: "var(--accent)" }}>{Math.round(explode * 100)}%</span>
        </div>
        <input type="range" min={0} max={1} step={0.01} value={explode} onChange={(e) => setExplode(Number(e.target.value))} aria-label="Explode view" className="w-full accent-[var(--accent)]" />
      </section>

      <div className="flex gap-2">
        <button onClick={showAll} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-semibold" style={{ borderColor: "var(--border-color)", color: "var(--text-main)" }}>
          <Eye size={14} /> Show all
        </button>
        <button onClick={() => setFocus({ uuid: "home", n: Date.now() })} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-semibold" style={{ borderColor: "var(--border-color)", color: "var(--text-main)" }}>
          <RotateCcw size={14} /> Reset view
        </button>
      </div>
    </div>
  )

  return (
    <div className="relative flex h-full w-full">
      <aside className="hidden w-72 shrink-0 overflow-y-auto border-r p-5 md:block" style={{ backgroundColor: "var(--bg-pane)", borderColor: "var(--border-color)" }}>
        {panel}
      </aside>

      <div className="relative min-w-0 flex-1" style={{ touchAction: "none" }}>
        <Canvas camera={{ position: HOME.pos.toArray(), fov: 35, near: 0.01, far: 50 }} dpr={[1, 2]} onPointerMissed={() => setSelected(null)}>
          <hemisphereLight args={["#ffffff", "#8a8070", 1.3]} />
          <directionalLight position={[2, 3, 4]} intensity={1.6} />
          <directionalLight position={[-3, 1, -3]} intensity={0.7} />
          <group onPointerMove={onPointerMove} onPointerOut={onPointerOut} onClick={onClick}>
            {anatomySystems.filter((s) => mounted.has(s.id)).map((s) => (
              <Suspense key={s.id} fallback={null}>
                <SystemModel sys={s} onLoad={onLoad} />
              </Suspense>
            ))}
          </group>
          <Exploder parts={parts} explode={explode} version={version} />
          <CameraRig parts={parts} focus={focus} />
          <OrbitControls makeDefault enableDamping target={HOME.target.toArray()} minDistance={0.1} maxDistance={6} />
        </Canvas>

        <LoadingBadge />
        <div ref={tooltip} className="pointer-events-none absolute left-0 top-0 max-w-[16rem] rounded-md px-2 py-1 text-xs font-medium shadow transition-opacity" style={{ opacity: 0, backgroundColor: "var(--bg-card)", color: "var(--text-main)" }} />

        {/* search */}
        <div className="absolute left-3 right-3 top-3 md:left-4 md:right-auto md:w-80">
          <div className="flex items-center gap-2 rounded-xl border px-3 py-2 shadow-sm" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}>
            <Search size={15} style={{ color: "var(--text-muted)" }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search 3,000+ structures…"
              aria-label="Search structures"
              className="w-full bg-transparent text-sm outline-none"
              style={{ color: "var(--text-main)" }}
            />
            {query && <button onClick={() => setQuery("")} aria-label="Clear search"><X size={15} style={{ color: "var(--text-muted)" }} /></button>}
          </div>
          {results.length > 0 && (
            <ul className="mt-1 overflow-hidden rounded-xl border shadow-lg" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}>
              {results.map((r) => (
                <li key={r.sys.id + r.name}>
                  <button onClick={() => openResult(r.name, r.sys)} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-black/[0.04] dark:hover:bg-white/[0.06]" style={{ color: "var(--text-main)" }}>
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: r.sys.color }} />
                    <span className="flex-1 truncate">{prettyName(r.name)}</span>
                    <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{r.sys.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* selected structure */}
        {sel && (
          <div className="absolute bottom-16 left-3 right-3 rounded-2xl border p-4 shadow-lg md:bottom-10 md:left-auto md:right-4 md:w-80" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="text-sm font-bold leading-snug" style={{ color: "var(--text-main)" }}>{prettyName(sel.name)}</h4>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: sel.system.color }} /> {sel.system.label} system
                </p>
              </div>
              <button onClick={() => setSelected(null)} aria-label="Close"><X size={16} style={{ color: "var(--text-muted)" }} /></button>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <button onClick={() => { setHidden((h) => new Set(h).add(selected!)); setSelected(null) }} className="flex items-center justify-center gap-1 rounded-lg border py-1.5 text-xs font-semibold" style={{ borderColor: "var(--border-color)", color: "var(--text-main)" }}>
                <EyeOff size={13} /> Hide
              </button>
              <button onClick={() => setIsolated((i) => (i === selected ? null : selected))} className="rounded-lg border py-1.5 text-xs font-semibold" style={{ borderColor: "var(--border-color)", color: isolated === selected ? "var(--accent)" : "var(--text-main)" }}>
                {isolated === selected ? "Exit isolate" : "Isolate"}
              </button>
              <button onClick={() => setFocus({ uuid: selected!, n: Date.now() })} className="flex items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-semibold" style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)" }}>
                <Crosshair size={13} /> Focus
              </button>
            </div>
          </div>
        )}

        {/* mobile controls */}
        <button
          onClick={() => setPanelOpen(true)}
          className="absolute bottom-10 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-lg md:hidden"
          style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)" }}
        >
          <SlidersHorizontal size={15} /> Controls
        </button>
        {panelOpen && (
          <div className="absolute inset-x-0 bottom-0 z-10 max-h-[70%] overflow-y-auto rounded-t-2xl border-t p-5 shadow-2xl md:hidden" style={{ backgroundColor: "var(--bg-pane)", borderColor: "var(--border-color)" }}>
            <div className="mb-3 flex justify-end">
              <button onClick={() => setPanelOpen(false)} aria-label="Close controls"><X size={18} style={{ color: "var(--text-muted)" }} /></button>
            </div>
            {panel}
          </div>
        )}

        <p className="pointer-events-none absolute bottom-2 left-0 right-0 px-3 text-center text-[10px]" style={{ color: "var(--text-muted)" }}>
          3D models: Z-Anatomy (CC-BY-SA 4.0) · BodyParts3D © DBCLS (CC-BY-SA 2.1 JP)
        </p>
      </div>
    </div>
  )
}
