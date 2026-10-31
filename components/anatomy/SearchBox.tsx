"use client"

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react"
import { Search, X } from "lucide-react"
import { systemById } from "@/data/anatomy-systems"
import { baseName, regionLabel, searchIndex, type SearchEntry } from "@/lib/anatomy/catalog"
import { actions } from "@/lib/anatomy/actions"
import { registry } from "@/lib/anatomy/registry"
import { store, useStore } from "@/lib/anatomy/store"

interface Group { id: string; title: string; entries: SearchEntry[] }

// "Biceps brachii (left)" and "(right)" become one row with L / R buttons
function group(list: SearchEntry[]): Group[] {
  const by = new Map<string, Group>()
  for (const e of list) {
    const id = e.system + ":" + baseName(e.key.slice(e.system.length + 1))
    const g = by.get(id)
    if (g) g.entries.push(e)
    else by.set(id, { id, title: e.label.replace(/ \((left|right)\)$/, ""), entries: [e] })
  }
  return [...by.values()].slice(0, 12)
}

export default function SearchBox({ autoFocus, onDone }: { autoFocus?: boolean; onDone?: () => void }) {
  const [q, setQ] = useState("")
  const [active, setActive] = useState(0)
  const [focused, setFocused] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  const version = useStore((s) => s.version)
  const recent = useStore((s) => s.recent)
  const deferred = useDeferredValue(q)

  const groups = useMemo(() => group(searchIndex(registry.entries, deferred, 40)), [deferred, version])
  useEffect(() => setActive(0), [deferred])
  useEffect(() => { if (autoFocus) input.current?.focus() }, [autoFocus])
  // "/" focuses the box from anywhere
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.key !== "/" || (e.target as HTMLElement)?.closest("input,textarea")) return
      e.preventDefault()
      input.current?.focus()
    }
    window.addEventListener("keydown", on)
    return () => window.removeEventListener("keydown", on)
  }, [])

  const open = (g: Group, side?: "l" | "r") => {
    const e = (side && g.entries.find((x) => x.side === side)) || g.entries.find((x) => x.side === (store.get().regionSide === 1 ? "l" : "r")) || g.entries[0]
    actions.addRecent(q)
    actions.reveal(e.key)
    setQ("")
    input.current?.blur()
    onDone?.()
  }

  const showRecent = focused && !q && recent.length > 0
  return (
    <div className="relative w-full">
      <div className="flex min-h-[44px] items-center gap-2 rounded-xl border px-3 shadow-sm" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}>
        <Search size={16} style={{ color: "var(--text-muted)" }} aria-hidden />
        <input
          ref={input} value={q} onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setTimeout(() => setFocused(false), 150)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, groups.length - 1)) }
            else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)) }
            else if (e.key === "Enter" && groups[active]) open(groups[active])
            else if (e.key === "Escape") { setQ(""); input.current?.blur(); onDone?.() }
          }}
          placeholder="Search 2,900 structures…" aria-label="Search structures"
          role="combobox" aria-expanded={groups.length > 0} aria-controls="anatomy-results" aria-activedescendant={groups[active] ? `res-${active}` : undefined}
          className="w-full bg-transparent text-sm outline-none" style={{ color: "var(--text-main)" }}
        />
        {q && <button onClick={() => { setQ(""); input.current?.focus() }} aria-label="Clear search" className="flex h-8 w-8 items-center justify-center"><X size={15} style={{ color: "var(--text-muted)" }} /></button>}
        <kbd className="hidden rounded border px-1.5 text-[11px] md:block" style={{ borderColor: "var(--border-color)", color: "var(--text-muted)" }}>/</kbd>
      </div>

      {(groups.length > 0 || showRecent) && (
        <ul id="anatomy-results" role="listbox" className="absolute left-0 right-0 z-20 mt-1 max-h-[55vh] overflow-y-auto rounded-xl border shadow-lg" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}>
          {showRecent && recent.map((r) => (
            <li key={r}><button onMouseDown={(e) => e.preventDefault()} onClick={() => setQ(r)} className="flex min-h-[44px] w-full items-center gap-2 px-3 text-left text-sm" style={{ color: "var(--text-muted)" }}><Search size={13} /> {r}</button></li>
          ))}
          {groups.map((g, i) => {
            const e = g.entries[0]
            const pair = g.entries.length > 1
            return (
              <li key={g.id} id={`res-${i}`} role="option" aria-selected={i === active} className="flex items-center gap-1 pr-2" style={{ backgroundColor: i === active ? "var(--bg-inset)" : "transparent" }}>
                <button onMouseDown={(ev) => ev.preventDefault()} onClick={() => open(g)} className="flex min-h-[48px] min-w-0 flex-1 items-center gap-2.5 px-3 text-left">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: systemById[e.system].color }} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm" style={{ color: "var(--text-main)" }}>{g.title}</span>
                    <span className="block text-[11px]" style={{ color: "var(--text-muted)" }}>{systemById[e.system].label} · {regionLabel(e.region)}</span>
                  </span>
                </button>
                {pair && (["l", "r"] as const).map((sd) => (
                  <button key={sd} onMouseDown={(ev) => ev.preventDefault()} onClick={() => open(g, sd)} aria-label={sd === "l" ? "Left" : "Right"} className="flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-bold" style={{ borderColor: "var(--border-color)", color: "var(--text-main)" }}>
                    {sd.toUpperCase()}
                  </button>
                ))}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
