"use client"

import { useCallback, useEffect, useState } from "react"

// Daily study streak, kept in this browser only.
// ponytail: per-device; move `days` into the profiles table if streaks should follow the account
const KEY = "atlas-streak"
const KEEP_DAYS = 60

export interface Streak {
  current: number
  best: number
  studiedToday: boolean
  lastWeek: { key: string; label: string; studied: boolean }[]
}

// local calendar day as YYYY-MM-DD, so the day flips at the user's midnight
const dayKey = (d: Date) => d.toLocaleDateString("en-CA")
const shift = (d: Date, days: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + days)

function load(): { days: string[]; best: number } {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) ?? "")
    if (Array.isArray(data.days)) return { days: data.days, best: Number(data.best) || 0 }
  } catch {}
  return { days: [], best: 0 }
}

// consecutive studied days ending today, or yesterday if today isn't done yet (the streak is still alive)
export function countStreak(days: string[], today = new Date()) {
  const set = new Set(days)
  let d = set.has(dayKey(today)) ? today : shift(today, -1)
  let n = 0
  while (set.has(dayKey(d))) {
    n++
    d = shift(d, -1)
  }
  return n
}

function summarize(days: string[], best: number): Streak {
  const today = new Date()
  const set = new Set(days)
  const current = countStreak(days, today)
  return {
    current,
    best: Math.max(best, current),
    studiedToday: set.has(dayKey(today)),
    lastWeek: Array.from({ length: 7 }, (_, i) => {
      const d = shift(today, i - 6)
      return { key: dayKey(d), label: d.toLocaleDateString("en", { weekday: "narrow" }), studied: set.has(dayKey(d)) }
    }),
  }
}

export function useStreak(): [Streak | null, () => void] {
  const [streak, setStreak] = useState<Streak | null>(null)

  useEffect(() => {
    const { days, best } = load()
    setStreak(summarize(days, best))
  }, [])

  const recordStudy = useCallback(() => {
    const { days, best } = load()
    const today = dayKey(new Date())
    if (days.includes(today)) return
    const next = [...days, today].slice(-KEEP_DAYS)
    const s = summarize(next, best)
    try {
      localStorage.setItem(KEY, JSON.stringify({ days: next, best: s.best }))
    } catch {}
    setStreak(s)
  }, [])

  return [streak, recordStudy]
}
