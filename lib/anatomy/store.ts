"use client"
// A tiny external store (no dependency): low-frequency UI state only. Per-frame and per-hover work never goes through it.
import { useSyncExternalStore } from "react"
import { anatomySystems, type SystemId } from "@/data/anatomy-systems"
import { PRESETS, type RegionId } from "./catalog"

export interface LoadState { status: "idle" | "queued" | "loading" | "ready" | "error"; p: number }
export interface QuizState {
  active: boolean
  target: string | null
  score: number
  asked: number
  streak: number
  misses: number
  message: string
  flash: { key: string; ok: boolean; n: number } | null
}
export type CameraReq = { kind: "home" | "part" | "region" | "view"; arg?: string; side?: 1 | -1; n: number }
export type Sheet = null | "layers" | "regions" | "search" | "more"

export interface State {
  systemsOn: Record<SystemId, boolean>
  outline: boolean
  opacity: Record<SystemId, number>
  explode: number
  hidden: ReadonlySet<string>
  isolated: string | null
  selected: string | null
  load: Record<SystemId, LoadState>
  version: number // bumped whenever parts are added
  quiz: QuizState
  cameraReq: CameraReq | null
  sheet: Sheet
  hintDismissed: boolean
  recent: string[]
  regionSide: 1 | -1
  lastRegion: RegionId | null
  preset: string | null
}

const ids = anatomySystems.map((s) => s.id)
const rec = <T,>(f: (id: SystemId) => T) => Object.fromEntries(ids.map((id) => [id, f(id)])) as Record<SystemId, T>
const DEFAULT_PRESET = PRESETS[0]

const initial: State = {
  systemsOn: rec((id) => DEFAULT_PRESET.systems.includes(id)),
  outline: DEFAULT_PRESET.outline,
  opacity: rec(() => 1),
  explode: 0,
  hidden: new Set(),
  isolated: null,
  selected: null,
  load: rec(() => ({ status: "idle", p: 0 })),
  version: 0,
  quiz: { active: false, target: null, score: 0, asked: 0, streak: 0, misses: 0, message: "", flash: null },
  cameraReq: null,
  sheet: null,
  hintDismissed: false,
  recent: [],
  regionSide: 1,
  lastRegion: null,
  preset: DEFAULT_PRESET.id,
}

let state = initial
const listeners = new Set<() => void>()
const PREFS_KEY = "anatomy-prefs-v1"

function save() {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify({ systemsOn: state.systemsOn, outline: state.outline, recent: state.recent, hintDismissed: state.hintDismissed, preset: state.preset }))
  } catch { /* private mode or blocked storage: preferences just aren't kept */ }
}

export const store = {
  get: () => state,
  set(patch: Partial<State> | ((s: State) => Partial<State>)) {
    const p = typeof patch === "function" ? patch(state) : patch
    state = { ...state, ...p }
    if ("systemsOn" in p || "outline" in p || "recent" in p || "hintDismissed" in p || "preset" in p) save()
    listeners.forEach((l) => l())
  },
  subscribe(l: () => void) {
    listeners.add(l)
    return () => listeners.delete(l)
  },
  // restore saved preferences once, on the client
  restore() {
    try {
      const raw = localStorage.getItem(PREFS_KEY)
      if (!raw) return
      const p = JSON.parse(raw)
      const patch: Partial<State> = {}
      if (p.systemsOn) patch.systemsOn = { ...state.systemsOn, ...p.systemsOn }
      if (typeof p.outline === "boolean") patch.outline = p.outline
      if (Array.isArray(p.recent)) patch.recent = p.recent.slice(0, 6)
      if (p.hintDismissed) patch.hintDismissed = true
      if (typeof p.preset === "string" || p.preset === null) patch.preset = p.preset
      state = { ...state, ...patch }
      listeners.forEach((l) => l())
    } catch { /* ignore a corrupt value */ }
  },
}

export function useStore<T>(select: (s: State) => T): T {
  return useSyncExternalStore(store.subscribe, () => select(state), () => select(initial))
}
