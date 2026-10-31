"use client"

import { useMemo } from "react"
import { ArrowLeftRight, Crosshair, EyeOff, Lightbulb, SkipForward, X } from "lucide-react"
import { LAYERS, regionLabel } from "@/lib/anatomy/catalog"
import { systemById } from "@/data/anatomy-systems"
import { ROUND, actions } from "@/lib/anatomy/actions"
import { registry } from "@/lib/anatomy/registry"
import { useStore } from "@/lib/anatomy/store"

const border = { borderColor: "var(--border-color)" }
const btn = "flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg border px-2 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"

export function SelectionCard() {
  const selected = useStore((s) => s.selected)
  const isolated = useStore((s) => s.isolated)
  const quiz = useStore((s) => s.quiz.active)
  const version = useStore((s) => s.version)

  const info = useMemo(() => {
    if (!selected) return null
    const e = registry.entryByKey.get(selected)
    const row = registry.rows.get(selected)
    if (!e || !row) return null
    const sys = systemById[e.system]
    const layer = LAYERS.find((l) => l.id === sys.layer)?.label ?? sys.label
    const other = selected.endsWith(".l") ? selected.slice(0, -2) + ".r" : selected.endsWith(".r") ? selected.slice(0, -2) + ".l" : null
    const near = [...registry.rows.values()]
      .filter((r) => r.key !== selected && r.system === row.system && r.key !== other)
      .map((r) => ({ r, d: r.center.distanceToSquared(row.center) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 5)
      .map((x) => registry.entryByKey.get(x.r.key)!)
      .filter(Boolean)
    return { e, sys, layer, other: other && registry.entryByKey.has(other) ? other : null, near }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, version])

  if (!info || quiz) return null
  const { e, layer, other, near } = info
  const side = e.side === "l" ? "Left" : e.side === "r" ? "Right" : null
  return (
    <div role="region" aria-label="Selected structure" className="w-full rounded-2xl border p-4 shadow-lg" style={{ backgroundColor: "var(--bg-card)", ...border }}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-[15px] font-bold leading-snug" style={{ color: "var(--text-main)" }}>{e.label.replace(/ \((left|right)\)$/, "")}</h2>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: info.sys.color }} />
            {layer} · {regionLabel(e.region)}{side ? ` · ${side}` : ""}
          </p>
        </div>
        <button onClick={() => actions.select(null)} aria-label="Close" className="flex h-9 w-9 shrink-0 items-center justify-center"><X size={16} style={{ color: "var(--text-muted)" }} /></button>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <button onClick={() => actions.hide(selected!)} className={btn} style={{ ...border, color: "var(--text-main)", outlineColor: "var(--accent)" }}><EyeOff size={13} /> Hide</button>
        <button onClick={() => actions.isolate(selected!)} aria-pressed={isolated === selected} className={btn} style={{ ...border, color: isolated === selected ? "var(--accent)" : "var(--text-main)", outlineColor: "var(--accent)" }}>{isolated === selected ? "Show all" : "Isolate"}</button>
        <button onClick={() => actions.focus(selected!)} className={btn} style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)", borderColor: "var(--accent)", outlineColor: "var(--accent)" }}><Crosshair size={13} /> Focus</button>
      </div>
      {other && (
        <button onClick={() => actions.reveal(other)} className={btn + " mt-2 w-full"} style={{ ...border, color: "var(--text-main)", outlineColor: "var(--accent)" }}><ArrowLeftRight size={13} /> Show the {side === "Left" ? "right" : "left"} side</button>
      )}
      {near.length > 0 && (
        <div className="mt-3">
          <p className="mb-1.5 text-[11px] font-semibold" style={{ color: "var(--text-muted)" }}>Nearby</p>
          <div className="flex flex-wrap gap-1.5">
            {near.map((n) => (
              <button key={n.key} onClick={() => actions.reveal(n.key)} className="max-w-full truncate rounded-full border px-2.5 py-1 text-[11px]" style={{ ...border, color: "var(--text-main)" }}>{n.label}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function QuizBar() {
  const q = useStore((s) => s.quiz)
  useStore((s) => s.version)
  if (!q.active) return null
  const target = q.target ? registry.parts.get(q.target) : null
  const done = q.message === "done"
  return (
    <div role="status" aria-live="polite" className="w-full rounded-2xl border p-3 shadow-lg" style={{ backgroundColor: "var(--bg-card)", ...border }}>
      {done ? (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-bold" style={{ color: "var(--text-main)" }}>Round complete: {q.score} of {ROUND} correct</p>
          <div className="flex gap-2">
            <button onClick={actions.startQuiz} className={btn} style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)", borderColor: "var(--accent)" }}>Again</button>
            <button onClick={actions.stopQuiz} className={btn} style={{ ...border, color: "var(--text-main)" }}>Stop</button>
          </div>
        </div>
      ) : q.message === "empty" ? (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm" style={{ color: "var(--text-main)" }}>Switch on a layer with visible structures to practise.</p>
          <button onClick={actions.stopQuiz} className={btn} style={{ ...border, color: "var(--text-main)" }}>Stop</button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between gap-2">
            <p className="min-w-0 text-[15px] font-bold" style={{ color: "var(--text-main)" }}>
              Tap the {target ? target.label : "…"}
            </p>
            <span className="shrink-0 text-xs tabular-nums" style={{ color: "var(--text-muted)" }}>{q.asked}/{ROUND} · {q.score} correct{q.streak > 1 ? ` · streak ${q.streak}` : ""}</span>
          </div>
          {q.message && <p className="mt-1 text-xs font-semibold" style={{ color: q.flash?.ok ? "#16a34a" : "#dc2626" }}>{q.message}</p>}
          <div className="mt-2 flex gap-2">
            <button onClick={actions.quizHint} className={btn} style={{ ...border, color: "var(--text-main)" }}><Lightbulb size={13} /> Hint</button>
            <button onClick={actions.quizSkip} className={btn} style={{ ...border, color: "var(--text-main)" }}><SkipForward size={13} /> Skip</button>
            <button onClick={actions.stopQuiz} className={btn} style={{ ...border, color: "var(--text-main)" }}><X size={13} /> Stop</button>
          </div>
        </>
      )}
    </div>
  )
}
