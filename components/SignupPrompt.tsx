"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Flame, X } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { isFreeAccess } from "@/lib/free-access"

const AUTH_PAGES = ["/login", "/signup", "/redeem"]
const DISMISS_KEY = "atlas-signup-prompt-dismissed" // per visit, so it comes back next time

// While login is off, nudge signed-out visitors to make a free account so they aren't anonymous when access codes return
export default function SignupPrompt() {
  const pathname = usePathname()
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!isFreeAccess()) return
    let dismissed = false
    try {
      dismissed = sessionStorage.getItem(DISMISS_KEY) === "1"
    } catch {}
    if (dismissed) return
    supabase.auth.getSession().then(({ data: { session } }) => setShow(!session))
    const { data } = supabase.auth.onAuthStateChange((_, session) => setShow(!session && !dismissed))
    return () => data.subscription.unsubscribe()
  }, [])

  const dismiss = () => {
    setShow(false)
    try {
      sessionStorage.setItem(DISMISS_KEY, "1")
    } catch {}
  }

  if (!show || AUTH_PAGES.includes(pathname)) return null

  return (
    <div
      role="region"
      aria-label="Create a free account"
      className="fixed inset-x-4 bottom-4 z-50 rounded-xl border p-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-[340px]"
      style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", boxShadow: "var(--shadow-card)", color: "var(--text-main)" }}
    >
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="absolute right-2 top-2 rounded-md p-1 hover:opacity-70"
        style={{ color: "var(--text-muted)" }}
      >
        <X size={16} />
      </button>
      <div className="flex items-start gap-3 pr-5">
        <Flame size={22} className="mt-0.5 shrink-0" style={{ color: "#f97316" }} fill="#fdba74" />
        <div>
          <p className="text-sm font-semibold">Everything is free until Oct 15</p>
          <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
            Create a free account to track your daily study streak. No access code needed.
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <Link
          href="/signup"
          className="flex-1 rounded-lg px-3 py-2 text-center text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)" }}
        >
          Create free account
        </Link>
        <Link href="/login" className="text-sm font-medium hover:underline" style={{ color: "var(--accent)" }}>
          Sign in
        </Link>
      </div>
    </div>
  )
}
