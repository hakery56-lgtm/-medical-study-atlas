"use client"

import { useEffect } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { ArrowLeft, PersonStanding } from "lucide-react"

// WebGL only runs in the browser
const BodyViewer = dynamic(() => import("@/components/anatomy/BodyViewer"), {
  ssr: false,
  loading: () => (
    <p className="flex h-full items-center justify-center text-sm" style={{ color: "var(--text-muted)" }}>
      Loading 3D viewer…
    </p>
  ),
})

export default function AnatomyPage() {
  useEffect(() => {
    if (localStorage.getItem("atlas-theme") === "dark") {
      document.documentElement.setAttribute("data-theme", "dark")
      document.documentElement.classList.add("dark")
    }
  }, [])

  return (
    <main className="flex h-[100dvh] flex-col" style={{ backgroundColor: "var(--bg-main)", color: "var(--text-main)" }}>
      <header className="flex items-center gap-3 border-b px-4 py-3" style={{ backgroundColor: "var(--bg-pane)", borderColor: "var(--border-color)" }}>
        <Link href="/" aria-label="Back to library" className="flex h-9 w-9 items-center justify-center rounded-lg border" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-card)" }}>
          <ArrowLeft size={17} />
        </Link>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)" }}>
          <PersonStanding size={19} />
        </div>
        <div>
          <h1 className="display-serif text-lg font-bold leading-tight">3D Body Explorer</h1>
          <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            Drag to rotate · scroll to zoom at the pointer · double-click a structure to zoom to it
          </p>
        </div>
      </header>
      <div className="relative min-h-0 flex-1">
        <BodyViewer />
      </div>
    </main>
  )
}
