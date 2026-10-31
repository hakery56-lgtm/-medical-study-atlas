"use client"

import { useEffect, useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { ContactShadows, OrbitControls, PerformanceMonitor } from "@react-three/drei"
import * as THREE from "three"
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js"
import { BODY } from "@/lib/anatomy/catalog"
import { HOME_BOX, VIEWS, fitBox, regionFit, type Box } from "@/lib/anatomy/camera"
import { applyGlow, applyVisuals, layout, registry } from "@/lib/anatomy/registry"
import { actions } from "@/lib/anatomy/actions"
import { store, useStore } from "@/lib/anatomy/store"
import type { RegionId } from "@/lib/anatomy/catalog"
import type { Tier } from "@/lib/anatomy/materials"

type Controls = { target: THREE.Vector3; update: () => void; addEventListener: (t: string, f: () => void) => void; removeEventListener: (t: string, f: () => void) => void }
const v3 = (a: [number, number, number]) => new THREE.Vector3(a[0], a[1], a[2])

// studio-style image based lighting generated on the fly (no HDR downloads)
function Environment() {
  const { gl, scene, invalidate } = useThree()
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const rt = pmrem.fromScene(new RoomEnvironment(), 0.04)
    scene.environment = rt.texture
    invalidate()
    return () => { scene.environment = null; rt.dispose(); pmrem.dispose() }
  }, [gl, scene, invalidate])
  return null
}

// key / fill / rim lights that stay fixed relative to the camera, like a photographer's rig
function LightRig() {
  const rig = useRef<THREE.Group>(null)
  useFrame(({ camera }) => { rig.current?.quaternion.copy(camera.quaternion) })
  return (
    <group ref={rig}>
      <directionalLight color="#fff1e0" intensity={1.7} position={[1.2, 1.6, 2]} />
      <directionalLight color="#e6eeff" intensity={0.5} position={[-2, 0.3, 1.2]} />
      <directionalLight color="#ffffff" intensity={1.2} position={[0.6, 1.2, -2.5]} />
      <hemisphereLight args={["#ffffff", "#6b5f55", 0.12]} />
    </group>
  )
}

function Models() {
  useStore((s) => s.version)
  return <>{[...registry.groups.values()].map((g) => <primitive key={g.uuid} object={g} />)}</>
}

// keeps every part's visibility, opacity and highlight in sync with the store
function Visuals() {
  const { invalidate } = useThree()
  const version = useStore((s) => s.version)
  const systemsOn = useStore((s) => s.systemsOn)
  const outline = useStore((s) => s.outline)
  const opacity = useStore((s) => s.opacity)
  const hidden = useStore((s) => s.hidden)
  const isolated = useStore((s) => s.isolated)
  const selected = useStore((s) => s.selected)
  const flash = useStore((s) => s.quiz.flash)
  const quizActive = useStore((s) => s.quiz.active)
  const quizTarget = useStore((s) => s.quiz.target)
  useEffect(() => {
    applyVisuals(store.get())
    invalidate()
  }, [version, systemsOn, outline, opacity, hidden, isolated, selected, flash, quizActive, quizTarget, invalidate])
  return null
}

const EXPLODE_DISTANCE = 0.7
function Exploder() {
  const { invalidate } = useThree()
  const explode = useStore((s) => s.explode)
  const version = useStore((s) => s.version)
  const current = useRef(0)
  const applied = useRef({ value: -1, version: -1 })
  useEffect(() => { invalidate() }, [explode, version, invalidate])
  useFrame(() => {
    const d = explode - current.current
    current.current = Math.abs(d) < 0.001 ? explode : current.current + d * 0.14
    if (current.current !== explode) invalidate()
    if (applied.current.value === current.current && applied.current.version === version) return
    applied.current = { value: current.current, version }
    const k = current.current * EXPLODE_DISTANCE
    registry.parts.forEach((p) => p.node.position.copy(p.rest).addScaledVector(p.dir, k))
  })
  return null
}

// Moves the camera for home / view / region / part requests; a user drag cancels a flight in progress.
function CameraRig() {
  const { camera, controls, size, invalidate } = useThree() as unknown as { camera: THREE.PerspectiveCamera; controls: Controls | null; size: { width: number; height: number }; invalidate: () => void }
  const req = useStore((s) => s.cameraReq)
  const goal = useRef<{ target: THREE.Vector3; pos: THREE.Vector3 } | null>(null)
  const atHome = useRef(true)
  const reduced = useRef(false)
  useEffect(() => { reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches }, [])

  const place = (fit: { target: [number, number, number]; position: [number, number, number] }, instant: boolean) => {
    goal.current = { target: v3(fit.target), pos: v3(fit.position) }
    if (instant || reduced.current) {
      controls?.target.copy(goal.current.target)
      camera.position.copy(goal.current.pos)
      controls?.update()
      goal.current = null
    }
    invalidate()
  }
  const homeFit = () => fitBox(HOME_BOX, VIEWS.front, layout.fov, layout.aspect, layout.insets)

  useEffect(() => {
    if (!controls) return
    const stop = () => { goal.current = null; atHome.current = false }
    controls.addEventListener("start", stop)
    return () => controls.removeEventListener("start", stop)
  }, [controls])

  // first placement, and re-framing on resize while the camera is still at home
  useEffect(() => {
    if (!controls) return
    layout.aspect = size.width / size.height
    if (atHome.current) place(homeFit(), true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controls, size.width, size.height])

  useEffect(() => {
    if (!req || !controls) return
    const aspect = size.width / size.height
    if (req.kind === "home") { atHome.current = true; place(homeFit(), false); return }
    atHome.current = false
    if (req.kind === "view") { place(fitBox(HOME_BOX, VIEWS[req.arg!] ?? VIEWS.front, layout.fov, aspect, layout.insets), false); return }
    if (req.kind === "region") { place(regionFit(req.arg as RegionId, req.side ?? 1, layout.fov, aspect, layout.insets), false); return }
    // part: use the live position if loaded (it may be exploded), the index centre otherwise
    const part = registry.parts.get(req.arg!)
    const row = registry.rows.get(req.arg!)
    const c = part ? part.center.clone().add(part.node.position).sub(part.rest) : row?.center.clone()
    const r = part ? part.radius : row?.radius
    if (!c || r === undefined) return
    const h = Math.max(r * 1.8, 0.06)
    const box: Box = { min: [c.x - h, c.y - h, c.z - h], max: [c.x + h, c.y + h, c.z + h] }
    const view = camera.position.clone().sub(controls.target).normalize()
    place(fitBox(box, [view.x, view.y, view.z], layout.fov, aspect, layout.insets), false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [req])

  useFrame((_, dt) => {
    const g = goal.current
    if (!g || !controls) return
    const k = 1 - Math.exp(-dt * 8)
    controls.target.lerp(g.target, k)
    camera.position.lerp(g.pos, k)
    controls.update()
    if (camera.position.distanceTo(g.pos) < 0.002 && controls.target.distanceTo(g.target) < 0.002) goal.current = null
    else invalidate()
  })
  return null
}

// Picking: no per-move raycasting by the renderer. A tap/click is resolved on release; hover only after the pointer rests.
function Picker() {
  const { gl, camera, invalidate } = useThree()
  const quizActive = useStore((s) => s.quiz.active)
  useEffect(() => {
    const el = gl.domElement
    const ray = new THREE.Raycaster()
    const ndc = new THREE.Vector2()
    const sphere = new THREE.Sphere()
    const hits: THREE.Intersection[] = []
    const cands: { mesh: THREE.Mesh; entry: number }[] = []
    const tip = document.getElementById("anatomy-tooltip")
    let down: { x: number; y: number; t: number; touch: boolean } | null = null
    let lastTap = { key: "", t: 0 }
    let hoverTimer: ReturnType<typeof setTimeout> | undefined

    function pick(clientX: number, clientY: number): string | null {
      const rect = el.getBoundingClientRect()
      ndc.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1)
      ray.setFromCamera(ndc, camera)
      const o = ray.ray.origin, d = ray.ray.direction
      cands.length = 0
      for (const mesh of registry.pickList) {
        if (!mesh.parent?.visible) continue
        const g = mesh.geometry
        if (!g.boundingSphere) g.computeBoundingSphere()
        sphere.copy(g.boundingSphere!).applyMatrix4(mesh.matrixWorld)
        const ocx = sphere.center.x - o.x, ocy = sphere.center.y - o.y, ocz = sphere.center.z - o.z
        const tca = ocx * d.x + ocy * d.y + ocz * d.z
        const d2 = ocx * ocx + ocy * ocy + ocz * ocz - tca * tca
        const r2 = sphere.radius * sphere.radius
        if (d2 > r2) continue
        const thc = Math.sqrt(r2 - d2)
        if (tca + thc < 0) continue
        cands.push({ mesh, entry: Math.max(tca - thc, 0) })
      }
      cands.sort((a, b) => a.entry - b.entry)
      let best: THREE.Mesh | null = null
      let bestDist = Infinity
      for (const c of cands) {
        if (c.entry > bestDist) break
        hits.length = 0
        c.mesh.raycast(ray, hits)
        if (hits.length && hits[0].distance < bestDist) { bestDist = hits[0].distance; best = c.mesh }
      }
      return best ? registry.meshOwner.get(best.uuid)?.key ?? null : null
    }

    function setHover(k: string | null, x = 0, y = 0) {
      if (registry.hoverKey !== k) {
        const prev = registry.hoverKey && registry.parts.get(registry.hoverKey)
        registry.hoverKey = k
        const s = store.get()
        if (prev) applyGlow(prev, s)
        const cur = k && registry.parts.get(k)
        if (cur) applyGlow(cur, s)
        invalidate()
      }
      if (!tip) return
      const part = k ? registry.parts.get(k) : null
      if (!part || store.get().quiz.active) { tip.style.opacity = "0"; return }
      const box = tip.parentElement!.getBoundingClientRect()
      tip.textContent = part.label
      tip.style.transform = `translate(${x - box.left + 14}px, ${y - box.top + 14}px)`
      tip.style.opacity = "1"
    }

    const onDown = (e: PointerEvent) => { down = { x: e.clientX, y: e.clientY, t: performance.now(), touch: e.pointerType !== "mouse" }; setHover(null) }
    const onUp = (e: PointerEvent) => {
      const d = down
      down = null
      if (!d) return
      const slop = d.touch ? 10 : 6
      if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > slop || performance.now() - d.t > 450) return
      const k = pick(e.clientX, e.clientY)
      const s = store.get()
      if (s.quiz.active) { if (s.quiz.mode === "tap") actions.quizAnswer(k); return }
      const now = performance.now()
      if (k && lastTap.key === k && now - lastTap.t < 320) { actions.focus(k); lastTap = { key: "", t: 0 } } else lastTap = { key: k ?? "", t: now }
      actions.select(k)
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.buttons) return
      clearTimeout(hoverTimer)
      const { clientX, clientY } = e
      hoverTimer = setTimeout(() => setHover(pick(clientX, clientY), clientX, clientY), 60)
    }
    const onLeave = () => { clearTimeout(hoverTimer); setHover(null) }

    el.addEventListener("pointerdown", onDown)
    el.addEventListener("pointerup", onUp)
    el.addEventListener("pointermove", onMove)
    el.addEventListener("pointerleave", onLeave)
    return () => {
      clearTimeout(hoverTimer)
      el.removeEventListener("pointerdown", onDown)
      el.removeEventListener("pointerup", onUp)
      el.removeEventListener("pointermove", onMove)
      el.removeEventListener("pointerleave", onLeave)
    }
  }, [gl, camera, invalidate, quizActive])
  return null
}


// ?debug=1 exposes a few helpers for browser tests (screen position of a structure, render stats)
function Debug() {
  const { camera, gl } = useThree()
  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has("debug")) return
    const w = window as unknown as Record<string, unknown>
    w.__anatomy = {
      store, registry,
      project(key: string) {
        const part = registry.parts.get(key)
        const c = part ? part.center.clone().add(part.node.position).sub(part.rest) : registry.rows.get(key)?.center.clone()
        if (!c) return null
        camera.updateMatrixWorld()
        c.project(camera)
        const r = gl.domElement.getBoundingClientRect()
        return { x: r.left + ((c.x + 1) / 2) * r.width, y: r.top + ((1 - c.y) / 2) * r.height, behind: c.z > 1 }
      },
      stats: () => ({ calls: gl.info.render.calls, programs: gl.info.programs?.length ?? 0, triangles: gl.info.render.triangles }),
      cameraDistance: () => camera.position.length(),
    }
  }, [camera, gl])
  return null
}

function GroundShadow() {
  const loadedKey = useStore((s) => [...Object.entries(s.load)].filter(([, l]) => l.status === "ready").map(([k]) => k).join())
  const explode = useStore((s) => s.explode)
  if (explode > 0.02) return null
  return <ContactShadows key={loadedKey} frames={1} position={[0, BODY.minY - 0.004, 0]} scale={1.4} blur={2.6} far={0.5} opacity={0.38} resolution={256} />
}

export default function Scene({ tier, onDecline }: { tier: Tier; onDecline: () => void }) {
  return (
    <>
      <Environment />
      <LightRig />
      <Models />
      <Visuals />
      <Exploder />
      <CameraRig />
      <Picker />
      <Debug />
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        zoomToCursor
        screenSpacePanning
        minDistance={0.04}
        maxDistance={8}
        touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }}
      />
      {tier === "high" && <GroundShadow />}
      <PerformanceMonitor onDecline={onDecline} />
    </>
  )
}
