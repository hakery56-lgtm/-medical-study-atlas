"use client"

import { useEffect } from "react"

const BUILT_WITH = process.env.NEXT_PUBLIC_BUILD_ID || "dev"
const RELOADED = "atlas-reloaded-for"

// An installed app (home-screen web app) keeps running the page it loaded earlier, so new lectures never show up.
// When the app opens or comes back to the front, ask the server which version is live and reload once if it is newer.
export default function UpdateChecker() {
  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch("/api/version", { cache: "no-store" })
        const { id } = await res.json()
        if (!id || id === "dev" || id === BUILT_WITH) return
        if (sessionStorage.getItem(RELOADED) === id) return // already tried for this version: never loop
        sessionStorage.setItem(RELOADED, id)
        window.location.reload()
      } catch {
        // offline or blocked: keep what we have
      }
    }
    const onShow = () => { if (document.visibilityState === "visible") check() }
    check()
    document.addEventListener("visibilitychange", onShow)
    window.addEventListener("pageshow", onShow) // restored from the back/forward cache
    return () => {
      document.removeEventListener("visibilitychange", onShow)
      window.removeEventListener("pageshow", onShow)
    }
  }, [])
  return null
}
