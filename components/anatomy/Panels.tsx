"use client"

import { useMemo } from "react"
import { Check, GraduationCap, RotateCcw } from "lucide-react"
import { anatomySystems } from "@/data/anatomy-systems"
import { LAYERS, PRESETS, REGIONS } from "@/lib/anatomy/catalog"
import { actions } from "@/lib/anatomy/actions"
import { registry, requestSystem } from "@/lib/anatomy/registry"
import { store, useStore } from "@/lib/anatomy/store"

const border = { borderColor: "var(--border-color)" }
const mb = (b: number) => `${(b / 1048576).toFixed(b > 1048576 * 9.5 ? 0 : 1)} MB`

export function Heading({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-2 flex items-baseline justify-between">
      <h3 className="text-[13px] font-bold" style={{ color: "var(--text-main)" }}>{children}</h3>
      {hint && <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>{hint}</span>}
    </div>
  )
}

function Switch({ on, label, onChange }: { on: boolean; label: string; onChange: () => void }) {
  return (
    <button
      role="switch" aria-checked={on} aria-label={label} onClick={onChange}
      className="relative h-6 w-10 shrink-0 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{ backgroundColor: on ? "var(--accent)" : "var(--border-color)", outlineColor: "var(--accent)" }}
    >
      <span className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all" style={{ left: on ? 18 : 2 }} />
    </button>
  )
}

function LayerStatus({ systems }: { systems: string[] }) {
  const load = useStore((s) => s.load)
  const rows = systems.map((id) => load[id as keyof typeof load])
  const bytes = anatomySystems.filter((s) => systems.includes(s.id)).reduce((a, s) => a + s.bytes, 0)
  const err = systems.find((id) => load[id as keyof typeof load].status === "error")
  if (err) return <button onClick={() => requestSystem(err as never, true)} className="text-[11px] font-semibold underline" style={{ color: "#dc2626" }}>Retry</button>
  if (rows.every((r) => r.status === "ready")) return <Check size={13} style={{ color: "var(--accent)" }} aria-label="Loaded" />
  const busy = rows.some((r) => r.status === "loading")
  if (busy) {
    const done = anatomySystems.filter((s) => systems.includes(s.id)).reduce((a, s) => a + s.bytes * (load[s.id].status === "ready" ? 1 : load[s.id].p), 0)
    return <span className="text-[11px] tabular-nums" style={{ color: "var(--accent)" }}>{Math.round((done / bytes) * 100)}%</span>
  }
  if (rows.some((r) => r.status === "queued")) return <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>Waiting…</span>
  return <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>{mb(bytes)}</span>
}

export function LayersPanel() {
  const systemsOn = useStore((s) => s.systemsOn)
  const outline = useStore((s) => s.outline)
  const preset = useStore((s) => s.preset)
  const opacity = useStore((s) => s.opacity)
  const explode = useStore((s) => s.explode)
  const hiddenN = useStore((s) => { void s.hidden; return actions.hiddenCount() })

  return (
    <div className="space-y-6">
      <section>
        <Heading hint="Pick a view of the body">Dissect</Heading>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.id} aria-pressed={preset === p.id} onClick={() => actions.setPreset(p.id)}
              className="min-h-[40px] rounded-full border px-3.5 text-[13px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ ...border, outlineColor: "var(--accent)", backgroundColor: preset === p.id ? "var(--accent)" : "var(--bg-card)", color: preset === p.id ? "var(--accent-contrast)" : "var(--text-main)" }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <Heading>Layers</Heading>
        <ul className="divide-y rounded-xl border" style={{ ...border, backgroundColor: "var(--bg-card)" }}>
          <li className="flex min-h-[48px] items-center gap-3 px-3 py-2" style={border}>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold" style={{ color: "var(--text-main)" }}>Body outline</p>
              <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>Faint silhouette to stay oriented</p>
            </div>
            <Switch on={outline} label="Body outline" onChange={actions.toggleOutline} />
          </li>
          {LAYERS.map((l) => {
            const on = l.systems.some((id) => systemsOn[id])
            return (
              <li key={l.id} className="flex min-h-[48px] items-center gap-3 px-3 py-2" style={border}>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold" style={{ color: "var(--text-main)" }}>{l.label}</p>
                  <p className="truncate text-[11px]" style={{ color: "var(--text-muted)" }}>{l.hint}</p>
                </div>
                <span className="w-12 text-right"><LayerStatus systems={l.systems} /></span>
                <Switch on={on} label={l.label} onChange={() => actions.toggleLayer(l.id)} />
              </li>
            )
          })}
        </ul>
      </section>

      <details className="group rounded-xl border" style={{ ...border, backgroundColor: "var(--bg-card)" }}>
        <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between px-3 text-sm font-semibold" style={{ color: "var(--text-main)" }}>
          Fine tune
          <span className="text-xs transition-transform group-open:rotate-180" style={{ color: "var(--text-muted)" }}>▾</span>
        </summary>
        <div className="space-y-4 border-t p-3" style={border}>
          <div>
            <div className="mb-1 flex justify-between text-xs" style={{ color: "var(--text-muted)" }}>
              <label htmlFor="spread">Spread apart</label><span className="tabular-nums">{Math.round(explode * 100)}%</span>
            </div>
            <input id="spread" type="range" min={0} max={1} step={0.01} value={explode} onChange={(e) => actions.setExplode(Number(e.target.value))} className="w-full accent-[var(--accent)]" />
          </div>
          <ul className="space-y-2">
            {anatomySystems.map((s) => (
              <li key={s.id}>
                <label className="flex min-h-[32px] cursor-pointer items-center gap-2.5 text-sm" style={{ color: "var(--text-main)" }}>
                  <input type="checkbox" checked={systemsOn[s.id]} onChange={() => actions.toggleSystem(s.id)} className="h-4 w-4 accent-[var(--accent)]" />
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="flex-1">{s.label}</span>
                </label>
                {systemsOn[s.id] && (
                  <input type="range" min={0.1} max={1} step={0.05} value={opacity[s.id]} aria-label={`${s.label} opacity`} onChange={(e) => actions.setOpacity(s.id, Number(e.target.value))} className="mt-0.5 w-full accent-[var(--accent)]" />
                )}
              </li>
            ))}
          </ul>
          <button
            onClick={actions.showAll} disabled={!hiddenN}
            className="min-h-[40px] w-full rounded-lg border text-[13px] font-semibold disabled:opacity-40" style={{ ...border, color: "var(--text-main)" }}
          >
            Show hidden structures{hiddenN ? ` (${hiddenN})` : ""}
          </button>
        </div>
      </details>
    </div>
  )
}

export function RegionsPanel() {
  const side = useStore((s) => s.regionSide)
  const last = useStore((s) => s.lastRegion)
  return (
    <div className="space-y-6">
      <section>
        <Heading hint="Fly to part of the body">Regions</Heading>
        <div className="mb-3 inline-flex rounded-full border p-0.5" style={{ ...border, backgroundColor: "var(--bg-card)" }} role="group" aria-label="Side for arm, hand, leg and foot">
          {([[-1, "Right"], [1, "Left"]] as const).map(([v, label]) => (
            <button key={v} aria-pressed={side === v} onClick={() => { store.set({ regionSide: v }); if (last && ["arm", "hand", "leg", "foot"].includes(last)) actions.region(last, v) }}
              className="min-h-[36px] rounded-full px-4 text-[13px] font-semibold" style={{ backgroundColor: side === v ? "var(--accent)" : "transparent", color: side === v ? "var(--accent-contrast)" : "var(--text-main)" }}>
              {label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {REGIONS.map((r) => (
            <button
              key={r.id} aria-pressed={last === r.id} onClick={() => actions.region(r.id)}
              className="min-h-[44px] rounded-xl border px-3 text-left text-[13px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ ...border, outlineColor: "var(--accent)", backgroundColor: last === r.id ? "var(--bg-inset)" : "var(--bg-card)", color: "var(--text-main)" }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </section>
      <section>
        <Heading>View from</Heading>
        <div className="flex flex-wrap gap-2">
          {(["front", "back", "left", "right", "top"] as const).map((v) => (
            <button key={v} onClick={() => actions.view(v)} className="min-h-[40px] rounded-full border px-3.5 text-[13px] font-semibold capitalize" style={{ ...border, backgroundColor: "var(--bg-card)", color: "var(--text-main)" }}>{v}</button>
          ))}
          <button onClick={() => actions.home()} className="flex min-h-[40px] items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-semibold" style={{ ...border, backgroundColor: "var(--bg-card)", color: "var(--text-main)" }}>
            <RotateCcw size={13} /> Reset
          </button>
        </div>
      </section>
    </div>
  )
}

export function TestsPanel() {
  const version = useStore((s) => s.version)
  const counts = useMemo(() => {
    const c: Record<string, number> = {}
    const seen = new Set<string>()
    registry.entryByKey.forEach((e) => {
      const id = e.system + ":" + e.label.replace(/ \((left|right)\)$/, "")
      if (seen.has(id)) return
      seen.add(id)
      c[e.system] = (c[e.system] ?? 0) + 1
    })
    return c
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version])
  return (
    <section>
      <Heading hint="10 questions each">Test yourself</Heading>
      <ul className="divide-y rounded-xl border" style={{ ...border, backgroundColor: "var(--bg-card)" }}>
        {anatomySystems.map((sys) => (
          <li key={sys.id} style={border}>
            <button onClick={() => actions.startTest(sys.id)} className="flex min-h-[48px] w-full items-center gap-3 px-3 py-2 text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px]" style={{ outlineColor: "var(--accent)" }}>
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: sys.color }} />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold" style={{ color: "var(--text-main)" }}>{sys.label.replace(" & Sense organs", "")}</span>
                <span className="block text-[11px]" style={{ color: "var(--text-muted)" }}>{counts[sys.id] ? `${counts[sys.id]} structures` : "Name the glowing structure"}</span>
              </span>
              <GraduationCap size={16} style={{ color: "var(--accent)" }} aria-hidden />
            </button>
          </li>
        ))}
      </ul>
      <button onClick={actions.startQuiz} className="mt-2 flex min-h-[44px] w-full items-center justify-center rounded-xl border text-[13px] font-semibold" style={{ ...border, color: "var(--text-main)", backgroundColor: "var(--bg-card)" }}>
        Or tap structures in the current view
      </button>
    </section>
  )
}
