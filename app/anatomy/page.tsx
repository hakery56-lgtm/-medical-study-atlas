"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import ApplyStoredTheme from "@/components/ApplyStoredTheme"

// WebGL only runs in the browser
const BodyExplorer = dynamic(() => import("@/components/anatomy/BodyExplorer"), {
  ssr: false,
  loading: () => (
    <p className="flex h-full items-center justify-center text-sm" style={{ color: "var(--text-muted)" }}>
      Loading 3D viewer…
    </p>
  ),
})

export default function AnatomyPage() {
  return (
    <main className="flex h-[100dvh] flex-col" style={{ backgroundColor: "var(--bg-main)", color: "var(--text-main)" }}>
      <ApplyStoredTheme />
      <header className="flex h-11 shrink-0 items-center gap-3 border-b px-3" style={{ backgroundColor: "var(--bg-pane)", borderColor: "var(--border-color)" }}>
        <Link href="/" aria-label="Back to library" className="flex h-9 w-9 items-center justify-center rounded-lg border" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-card)" }}>
          <ArrowLeft size={17} />
        </Link>
        <h1 className="display-serif text-base font-bold leading-tight">3D Body Explorer</h1>
      </header>
      <div className="relative min-h-0 flex-1">
        <BodyExplorer />
      </div>
    </main>
  )
}
