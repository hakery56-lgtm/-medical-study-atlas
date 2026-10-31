"use client"
// Everything the UI and the 3D picker can do. Kept in one place so keyboard, toolbar and canvas behave the same.
import { anatomySystems, systemById, type LayerId, type SystemId } from "@/data/anatomy-systems"
import { LAYERS, PRESETS, type RegionId } from "./catalog.ts"
import { registry, requestSystem, loadIndex } from "./registry.ts"
import { store, type CameraReq } from "./store.ts"

let reqN = 0
const camera = (r: Omit<CameraReq, "n">) => store.set({ cameraReq: { ...r, n: ++reqN } })

function ensureLoaded(ids: SystemId[]) {
  for (const id of ids) requestSystem(id, true)
}

export const ROUND = 10
let asked = new Set<string>()
let quizTimer: ReturnType<typeof setTimeout> | undefined

export const actions = {
  init() {
    store.restore()
    void loadIndex()
    const s = store.get()
    // skeleton first, then whatever else the saved layers need
    requestSystem("skeletal", true)
    for (const sys of anatomySystems) if (s.systemsOn[sys.id] && sys.id !== "skeletal") requestSystem(sys.id, false)
  },

  // ----- layers -----
  setPreset(id: string) {
    const p = PRESETS.find((x) => x.id === id)
    if (!p) return
    store.set((s) => ({
      preset: id,
      outline: p.outline,
      systemsOn: Object.fromEntries(anatomySystems.map((x) => [x.id, p.systems.includes(x.id)])) as Record<SystemId, boolean>,
      isolated: null,
      opacity: Object.fromEntries(anatomySystems.map((x) => [x.id, 1])) as Record<SystemId, number>,
      hidden: new Set([...s.hidden].filter((k) => /segment of liver/i.test(k))),
    }))
    ensureLoaded(p.systems)
    if (p.outline) requestSystem("muscular", false)
  },
  toggleLayer(layer: LayerId) {
    const sys = LAYERS.find((l) => l.id === layer)!.systems
    const on = !sys.every((id) => store.get().systemsOn[id])
    store.set((s) => ({ preset: null, systemsOn: { ...s.systemsOn, ...Object.fromEntries(sys.map((id) => [id, on])) } }))
    if (on) ensureLoaded(sys)
  },
  toggleSystem(id: SystemId) {
    const on = !store.get().systemsOn[id]
    store.set((s) => ({ preset: null, systemsOn: { ...s.systemsOn, [id]: on } }))
    if (on) ensureLoaded([id])
  },
  toggleOutline() {
    const on = !store.get().outline
    store.set({ outline: on, preset: null })
    if (on) requestSystem("muscular", false)
  },
  setOpacity(id: SystemId, v: number) {
    store.set((s) => ({ opacity: { ...s.opacity, [id]: v } }))
  },
  setExplode(v: number) { store.set({ explode: v }) },

  // ----- selection -----
  select(k: string | null) { store.set({ selected: k }) },
  hide(k: string) { store.set((s) => ({ hidden: new Set(s.hidden).add(k), selected: null })) },
  isolate(k: string) { store.set((s) => ({ isolated: s.isolated === k ? null : k })) },
  showAll() { store.set((s) => ({ hidden: new Set([...s.hidden].filter((k) => /segment of liver/i.test(k))), isolated: null })) },
  hiddenCount: () => [...store.get().hidden].filter((k) => !/segment of liver/i.test(k)).length,

  // ----- camera -----
  focus(k: string) { camera({ kind: "part", arg: k }) },
  home() { camera({ kind: "home" }) },
  view(name: string) { camera({ kind: "view", arg: name }) },
  region(r: RegionId, side: 1 | -1 = store.get().regionSide) {
    store.set({ lastRegion: r, regionSide: side })
    camera({ kind: "region", arg: r, side })
  },

  // bring a structure into view: its system on and loaded, layers above it peeled away
  reveal(k: string) {
    const row = registry.rows.get(k)
    if (!row) return
    const sys = systemById[row.system]
    store.set((s) => {
      const systemsOn = { ...s.systemsOn, [row.system]: true }
      for (const other of anatomySystems) if (other.id !== row.system && other.depth < sys.depth && systemsOn[other.id]) systemsOn[other.id] = false
      const hidden = new Set(s.hidden)
      hidden.delete(k)
      // bones in front of an organ or vessel turn see-through instead of hiding it; looking at a bone restores them
      const opacity = { ...s.opacity, skeletal: sys.depth < 3 && systemsOn.skeletal ? 0.3 : 1 }
      return { systemsOn, hidden, opacity, isolated: null, preset: null, outline: s.outline || sys.depth > 0, selected: k, sheet: null }
    })
    requestSystem(row.system, true)
    camera({ kind: "part", arg: k })
  },
  addRecent(q: string) {
    const t = q.trim()
    if (t.length < 2) return
    store.set((s) => ({ recent: [t, ...s.recent.filter((r) => r !== t)].slice(0, 6) }))
  },
  openSheet(sheet: "layers" | "regions" | "search" | "more" | null) { store.set({ sheet }) },
  dismissHint() { store.set({ hintDismissed: true }) },

  // ----- test yourself -----
  startQuiz() {
    asked = new Set()
    store.set({ quiz: { active: true, target: null, score: 0, asked: 0, streak: 0, misses: 0, message: "", flash: null }, selected: null, isolated: null, sheet: null })
    actions.quizNext()
  },
  stopQuiz() {
    clearTimeout(quizTimer)
    store.set({ quiz: { active: false, target: null, score: 0, asked: 0, streak: 0, misses: 0, message: "", flash: null } })
  },
  quizNext() {
    const q = store.get().quiz
    if (q.asked >= ROUND) { store.set({ quiz: { ...q, target: null, flash: null, message: "done" } }); return }
    const region = store.get().lastRegion
    const pool: string[] = []
    registry.parts.forEach((p) => {
      if (!p.node.visible || p.radius < 0.006 || asked.has(p.key)) return
      if (region && p.region !== region) return
      if (!p.meshes.some((m) => registry.pickList.includes(m))) return
      pool.push(p.key)
    })
    if (!pool.length) { store.set({ quiz: { ...q, target: null, flash: null, message: "empty" } }); return }
    const target = pool[Math.floor(Math.random() * pool.length)]
    asked.add(target)
    store.set({ quiz: { ...q, target, asked: q.asked + 1, misses: 0, message: "", flash: null } })
  },
  quizAnswer(k: string | null) {
    const q = store.get().quiz
    if (!q.active || !q.target || !k) return
    clearTimeout(quizTimer)
    if (k === q.target) {
      store.set({ quiz: { ...q, score: q.score + 1, streak: q.streak + 1, message: "Correct", flash: { key: k, ok: true, n: Date.now() } } })
      quizTimer = setTimeout(actions.quizNext, 900)
      return
    }
    const misses = q.misses + 1
    const label = registry.parts.get(k)?.label ?? ""
    if (misses >= 2) {
      store.set({ quiz: { ...q, streak: 0, misses, message: `That's ${label}. The answer is highlighted.`, flash: { key: q.target, ok: true, n: Date.now() } } })
      camera({ kind: "part", arg: q.target })
      quizTimer = setTimeout(actions.quizNext, 2200)
    } else {
      store.set({ quiz: { ...q, streak: 0, misses, message: `That's ${label}. Try again.`, flash: { key: k, ok: false, n: Date.now() } } })
    }
  },
  quizHint() {
    const t = store.get().quiz.target
    if (t) camera({ kind: "part", arg: t })
  },
  quizSkip() { clearTimeout(quizTimer); actions.quizNext() },
}
