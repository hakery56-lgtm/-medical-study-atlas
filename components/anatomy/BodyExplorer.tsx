"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { NeutralToneMapping } from "three"
import { CircleHelp, GraduationCap, Layers, MapPin, RotateCcw, Search, X } from "lucide-react"
import { anatomySystems, systemById } from "@/data/anatomy-systems"
import { actions } from "@/lib/anatomy/actions"
import { layout, registry } from "@/lib/anatomy/registry"
import { store, useStore } from "@/lib/anatomy/store"
import type { Tier } from "@/lib/anatomy/materials"
import Scene from "./Scene"
import SearchBox from "./SearchBox"
import { LayersPanel, RegionsPanel, TestsPanel } from "./Panels"
import { QuizBar, SelectionCard } from "./Cards"

const border = { borderColor: "var(--border-color)" }
const TOOLBAR_PX = 64

function detectTier(): Tier {
  const nav = navigator as Navigator & { deviceMemory?: number }
  return (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4 ? "low" : "high"
}

// A faint body shape that shows at once while the first model downloads
function Placeholder() {
  const ready = useStore((s) => s.load.skeletal.status === "ready")
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-700" style={{ opacity: ready ? 0 : 1 }}>
      <svg viewBox="0 0 100 210" className="h-[74%] max-h-[620px] animate-pulse" style={{ color: "var(--text-muted)", opacity: 0.16 }} fill="currentColor">
        <ellipse cx="50" cy="12" rx="8" ry="10" />
        <path d="M43 22h14l1 6c8 1 16 4 20 9 3 4 4 12 5 22l6 40c1 4-4 5-6 1l-8-30-2 36c3 8 4 20 2 38l-3 58c0 4-6 4-6 0l-4-62h-4l-4 62c0 4-6 4-6 0l-3-58c-2-18-1-30 2-38l-2-36-8 30c-2 4-7 3-6-1l6-40c1-10 2-18 5-22 4-5 12-8 20-9z" />
      </svg>
    </div>
  )
}

function LoadingPill() {
  const load = useStore((s) => s.load)
  const ids = anatomySystems.map((s) => s.id)
  const current = ids.find((id) => load[id].status === "loading")
  const waiting = ids.some((id) => load[id].status === "queued")
  if (!current && !waiting) return null
  const sys = current ? systemById[current] : null
  const p = current ? load[current].p : 0
  const text = sys ? `Loading ${sys.label.toLowerCase().replace(" & sense organs", "")}… ${Math.round(p * 100)}%` : "Getting ready…"
  return (
    <div className="pointer-events-none absolute left-1/2 top-3 z-10 w-[min(20rem,calc(100%-1.5rem))] -translate-x-1/2 rounded-full border px-4 py-2 shadow" style={{ backgroundColor: "var(--bg-card)", ...border }}>
      <p className="text-center text-xs font-semibold" style={{ color: "var(--text-main)" }}>{text}</p>
      <div className="mt-1.5 h-1 overflow-hidden rounded-full" style={{ backgroundColor: "var(--border-color)" }}>
        <div className="h-full rounded-full transition-[width]" style={{ width: `${Math.max(4, p * 100)}%`, backgroundColor: "var(--accent)" }} />
      </div>
    </div>
  )
}

function Hint() {
  const dismissed = useStore((s) => s.hintDismissed)
  const ready = useStore((s) => s.load.skeletal.status === "ready")
  const busy = useStore((s) => Object.values(s.load).some((l) => l.status === "loading" || l.status === "queued"))
  const [touch, setTouch] = useState(false)
  useEffect(() => setTouch(window.matchMedia("(pointer: coarse)").matches), [])
  const show = !dismissed && ready && !busy
  // the tip goes away on its own: at the first touch of the model or after ten seconds
  useEffect(() => {
    if (!show) return
    const t = setTimeout(actions.dismissHint, 10000)
    const on = () => actions.dismissHint()
    window.addEventListener("pointerdown", on, { once: true })
    return () => { clearTimeout(t); window.removeEventListener("pointerdown", on) }
  }, [show])
  if (!show) return null
  return (
    <div className="absolute left-1/2 top-3 z-10 flex w-max max-w-[calc(100%-1.5rem)] -translate-x-1/2 items-center gap-2 rounded-full border py-1.5 pl-4 pr-1.5 text-xs shadow" style={{ backgroundColor: "var(--bg-card)", color: "var(--text-main)", ...border }}>
      {touch ? "Drag to rotate · pinch to zoom · tap a structure to name it" : "Drag to rotate · scroll to zoom · double-click to focus"}
      <button onClick={actions.dismissHint} aria-label="Dismiss tip" className="flex h-8 w-8 items-center justify-center rounded-full"><X size={14} /></button>
    </div>
  )
}

const SHORTCUTS: [string, string][] = [["F", "Focus the selection"], ["H", "Hide it"], ["I", "Isolate it"], ["R", "Reset the view"], ["1–5", "Front, back, left, right, top"], ["/", "Search"], ["Esc", "Clear or close"]]

export default function BodyExplorer() {
  const [tier] = useState<Tier>(() => detectTier())
  const [dpr, setDpr] = useState(tier === "low" ? 1.5 : 2)
  const [help, setHelp] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  const sheet = useStore((s) => s.sheet)
  const quizActive = useStore((s) => s.quiz.active)
  const label = useStore((s) => (s.selected ? registry.entryByKey.get(s.selected)?.label ?? "" : ""))
  useStore((s) => s.version)

  registry.tier = tier
  useEffect(() => { actions.init() }, [])

  // tell the camera how much of the canvas the phone toolbar covers
  useLayoutEffect(() => {
    const el = box.current
    if (!el) return
    const measure = () => {
      const r = el.getBoundingClientRect()
      const phone = window.innerWidth < 768
      layout.insets = { top: 0, left: 0, right: 0, bottom: phone ? (TOOLBAR_PX + 16) / r.height : 0.02 }
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest("input,textarea,select") || e.ctrlKey || e.metaKey || e.altKey) return
      const s = store.get()
      const k = e.key.toLowerCase()
      if (k === "escape") { if (s.quiz.active) actions.stopQuiz(); else if (s.sheet) actions.openSheet(null); else actions.select(null); setHelp(false) }
      else if (k === "r") actions.home()
      else if (k === "f" && s.selected) actions.focus(s.selected)
      else if (k === "h" && s.selected) actions.hide(s.selected)
      else if (k === "i" && s.selected) actions.isolate(s.selected)
      else if (k === "?") setHelp((h) => !h)
      else if ("12345".includes(k) && k.length === 1) actions.view(["front", "back", "left", "right", "top"][Number(k) - 1])
    }
    window.addEventListener("keydown", on)
    return () => window.removeEventListener("keydown", on)
  }, [])

  const tool = (id: "layers" | "regions" | "search" | "tests", text: string, icon: React.ReactNode) => (
    <button key={id} onClick={() => actions.openSheet(sheet === id ? null : id)} aria-pressed={sheet === id} className="flex min-h-[48px] flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold" style={{ color: sheet === id ? "var(--accent)" : "var(--text-main)" }}>
      {icon}{text}
    </button>
  )

  return (
    <div className="relative flex h-full w-full">
      {/* desktop rail */}
      <aside className="hidden w-[22rem] shrink-0 space-y-6 overflow-y-auto border-r p-5 md:block" style={{ backgroundColor: "var(--bg-pane)", ...border }}>
        <SearchBox />
        <LayersPanel />
        <RegionsPanel />
        <TestsPanel />
        <p className="text-[10px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
          Models: Z-Anatomy (CC BY-SA 4.0) and BodyParts3D © DBCLS (CC BY-SA 2.1 JP). <a href="/models/LICENSE.txt" className="underline">Details</a>
        </p>
      </aside>

      <div ref={box} className="relative min-w-0 flex-1 overflow-hidden" style={{ touchAction: "none", background: "radial-gradient(120% 90% at 50% 35%, var(--bg-card), var(--bg-main) 55%, var(--bg-pane))" }}>
        <Placeholder />
        <Canvas
          frameloop="demand" dpr={[1, dpr]} aria-label="3D model of the human body"
          camera={{ fov: layout.fov, near: 0.005, far: 20, position: [0, 0, 3.5] }}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          onCreated={({ gl }) => { gl.toneMapping = NeutralToneMapping; gl.toneMappingExposure = 1.0 }}
        >
          <Scene tier={tier} onDecline={() => setDpr(1)} />
        </Canvas>

        <div id="anatomy-tooltip" className="pointer-events-none absolute left-0 top-0 z-10 max-w-[16rem] rounded-md px-2 py-1 text-xs font-medium opacity-0 shadow transition-opacity" style={{ backgroundColor: "var(--bg-card)", color: "var(--text-main)" }} />
        <p className="sr-only" aria-live="polite">{label ? `Selected ${label}` : ""}</p>

        <LoadingPill />
        <Hint />

        {/* desktop: floating cards */}
        <div className="pointer-events-none absolute right-4 top-4 z-10 hidden w-80 space-y-3 md:block">
          <div className="pointer-events-auto"><QuizBar /></div>
          <div className="pointer-events-auto"><SelectionCard /></div>
        </div>
        <button onClick={() => setHelp((h) => !h)} aria-label="Keyboard shortcuts" aria-pressed={help} className="absolute bottom-3 right-3 z-10 hidden h-9 w-9 items-center justify-center rounded-full border md:flex" style={{ backgroundColor: "var(--bg-card)", color: "var(--text-muted)", ...border }}><CircleHelp size={17} /></button>
        {help && (
          <div className="absolute bottom-14 right-3 z-10 hidden w-64 rounded-xl border p-3 text-xs shadow-lg md:block" style={{ backgroundColor: "var(--bg-card)", color: "var(--text-main)", ...border }}>
            <ul className="space-y-1.5">{SHORTCUTS.map(([k, v]) => <li key={k} className="flex items-center gap-2"><kbd className="min-w-[2rem] rounded border px-1.5 text-center" style={border}>{k}</kbd>{v}</li>)}</ul>
          </div>
        )}

        {/* phone: cards above the toolbar, search on top, sheets from the bottom */}
        <div className="absolute inset-x-3 z-10 space-y-2 md:hidden" style={{ bottom: `calc(${TOOLBAR_PX}px + env(safe-area-inset-bottom) + 10px)` }}>
          {sheet === null && <QuizBar />}
          {sheet === null && <SelectionCard />}
        </div>
        {sheet === "search" && (
          <div className="absolute inset-x-3 top-3 z-30 md:hidden"><SearchBox autoFocus onDone={() => actions.openSheet(null)} /></div>
        )}
        {(sheet === "layers" || sheet === "regions" || sheet === "tests") && (
          <>
            <button aria-label="Close panel" onClick={() => actions.openSheet(null)} className="absolute inset-0 z-20 md:hidden" />
            <div role="dialog" aria-label={sheet === "layers" ? "Layers" : sheet === "regions" ? "Regions" : "Tests"} className="absolute inset-x-0 z-20 max-h-[60dvh] overflow-y-auto rounded-t-2xl border-t p-5 shadow-2xl md:hidden" style={{ bottom: `calc(${TOOLBAR_PX}px + env(safe-area-inset-bottom))`, backgroundColor: "var(--bg-pane)", ...border }}>
              {sheet === "layers" ? <LayersPanel /> : sheet === "regions" ? <RegionsPanel /> : <TestsPanel />}
              <p className="mt-5 text-[10px]" style={{ color: "var(--text-muted)" }}>Models: Z-Anatomy and BodyParts3D (CC BY-SA). <a href="/models/LICENSE.txt" className="underline">Details</a></p>
            </div>
          </>
        )}
        <nav aria-label="Body explorer tools" className="absolute inset-x-0 bottom-0 z-30 flex border-t md:hidden" style={{ height: `calc(${TOOLBAR_PX}px + env(safe-area-inset-bottom))`, paddingBottom: "env(safe-area-inset-bottom)", backgroundColor: "var(--bg-pane)", ...border }}>
          {tool("layers", "Layers", <Layers size={20} />)}
          {tool("regions", "Regions", <MapPin size={20} />)}
          {tool("search", "Search", <Search size={20} />)}
          <button onClick={() => (quizActive ? actions.stopQuiz() : actions.openSheet(sheet === "tests" ? null : "tests"))} aria-pressed={quizActive || sheet === "tests"} className="flex min-h-[48px] flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold" style={{ color: quizActive || sheet === "tests" ? "var(--accent)" : "var(--text-main)" }}><GraduationCap size={20} />{quizActive ? "Stop" : "Test"}</button>
          <button onClick={actions.home} className="flex min-h-[48px] flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold" style={{ color: "var(--text-main)" }}><RotateCcw size={20} />Reset</button>
        </nav>
      </div>
    </div>
  )
}
