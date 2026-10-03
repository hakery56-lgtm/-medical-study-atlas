"use client"

import { useEffect, useState } from "react"
import { Download, Share, X } from "lucide-react"

const DISMISSED = "atlas-install-dismissed"
const VISITS = "atlas-visits"
const SNOOZE_MS = 14 * 24 * 60 * 60 * 1000

// minimal typing for Chrome's install event
type InstallEvent = Event & { prompt: () => Promise<void> }

// small "add to home screen" card for returning mobile visitors
export default function InstallPrompt() {
  const [event, setEvent] = useState<InstallEvent | null>(null)
  const [ios, setIos] = useState(false)
  const [show, setShow] = useState(false)

  useEffect(() => {
    try {
      const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone
      const snoozed = Date.now() - Number(localStorage.getItem(DISMISSED) || 0) < SNOOZE_MS
      const visits = Number(localStorage.getItem(VISITS) || 0) + 1
      localStorage.setItem(VISITS, String(visits))
      if (standalone || snoozed || visits < 2) return // ask only people who came back
    } catch {
      return
    }
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const onPrompt = (e: Event) => {
      e.preventDefault()
      setEvent(e as InstallEvent)
      setShow(true)
    }
    window.addEventListener("beforeinstallprompt", onPrompt)
    if (isIos) {
      setIos(true)
      setShow(true)
    }
    return () => window.removeEventListener("beforeinstallprompt", onPrompt)
  }, [])

  const close = () => {
    setShow(false)
    try { localStorage.setItem(DISMISSED, String(Date.now())) } catch {}
  }
  const install = async () => {
    await event?.prompt()
    close()
  }

  if (!show) return null
  return (
    <div className="fixed inset-x-3 bottom-3 z-40 mx-auto flex max-w-md items-center gap-3 rounded-2xl border p-3"
      style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", color: "var(--text-main)", boxShadow: "var(--shadow-card)" }}
      role="dialog"
      aria-label="Install the app">
      <div className="min-w-0 flex-1 text-sm">
        <p className="text-left font-semibold" dir="rtl">ثبّت الموقع على هاتفك</p>
        {ios ? (
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Tap <Share className="inline h-3.5 w-3.5" /> then &ldquo;Add to Home Screen&rdquo;
          </p>
        ) : (
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Add Study Atlas to your home screen</p>
        )}
      </div>
      {!ios && (
        <button onClick={install} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold"
          style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)" }}>
          <Download className="h-3.5 w-3.5" /> Install
        </button>
      )}
      <button onClick={close} aria-label="Dismiss" className="rounded-md p-1.5"
        style={{ color: "var(--text-muted)" }}>
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
