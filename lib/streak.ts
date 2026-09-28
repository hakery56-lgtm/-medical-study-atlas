"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { supabase } from "@/lib/supabase"

// Daily study streak, saved on the student's account (table public.study_days, one row per day).
const LEGACY_KEY = "atlas-streak" // days kept in the browser before streaks moved to the account

export interface Streak {
  current: number
  best: number
  studiedToday: boolean
  lastWeek: { key: string; label: string; studied: boolean }[]
}

// local calendar day as YYYY-MM-DD, so the day flips at the user's midnight
const dayKey = (d: Date) => d.toLocaleDateString("en-CA")
const shift = (d: Date, days: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + days)
const nextDay = (key: string) => dayKey(shift(new Date(key + "T12:00:00"), 1))

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

// longest run of consecutive days ever
export function longestRun(days: string[]) {
  const sorted = Array.from(new Set(days)).sort()
  let best = 0
  let run = 0
  sorted.forEach((d, i) => {
    run = i > 0 && nextDay(sorted[i - 1]) === d ? run + 1 : 1
    best = Math.max(best, run)
  })
  return best
}

function summarize(days: string[]): Streak {
  const today = new Date()
  const set = new Set(days)
  return {
    current: countStreak(days, today),
    best: longestRun(days),
    studiedToday: set.has(dayKey(today)),
    lastWeek: Array.from({ length: 7 }, (_, i) => {
      const d = shift(today, i - 6)
      return { key: dayKey(d), label: d.toLocaleDateString("en", { weekday: "narrow" }), studied: set.has(dayKey(d)) }
    }),
  }
}

// move days saved in this browser by the old version onto the account, once
async function migrateLegacyDays() {
  let days: string[] = []
  try {
    days = JSON.parse(localStorage.getItem(LEGACY_KEY) ?? "{}").days ?? []
  } catch {}
  if (!days.length) return
  const { error } = await supabase
    .from("study_days")
    .upsert(days.map((day) => ({ day })), { onConflict: "user_id,day", ignoreDuplicates: true })
  if (!error) localStorage.removeItem(LEGACY_KEY)
}

/** null streak = not signed in (or still loading) */
export function useStreak(): [Streak | null, () => void] {
  const [streak, setStreak] = useState<Streak | null>(null)
  const days = useRef<string[]>([])

  const load = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      days.current = []
      setStreak(null)
      return
    }
    await migrateLegacyDays()
    const { data, error } = await supabase.from("study_days").select("day")
    if (error) return console.error(error)
    days.current = data.map((r) => r.day as string)
    setStreak(summarize(days.current))
  }, [])

  useEffect(() => {
    load()
    // the login popup signs in without a page reload
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") load()
    })
    return () => data.subscription.unsubscribe()
  }, [load])

  const recordStudy = useCallback(async () => {
    const today = dayKey(new Date())
    if (days.current.includes(today)) return
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    days.current = [...days.current, today]
    setStreak(summarize(days.current))
    const { error } = await supabase
      .from("study_days")
      .upsert({ day: today }, { onConflict: "user_id,day", ignoreDuplicates: true })
    if (error) console.error(error)
  }, [])

  return [streak, recordStudy]
}
