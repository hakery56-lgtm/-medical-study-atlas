"use client"

import { Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import ApplyStoredTheme from "@/components/ApplyStoredTheme"
import PdfViewer, { isViewable } from "@/components/PdfViewer"

function Viewer() {
  const params = useSearchParams()
  const src = params.get("src") ?? ""
  const title = params.get("title") || "Document"

  if (!isViewable(src)) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center" style={{ backgroundColor: "var(--bg-main)", color: "var(--text-main)" }}>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>This file link is not valid.</p>
        <Link href="/" className="rounded-xl px-5 py-3 text-sm font-semibold" style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)" }}>
          Main menu
        </Link>
      </main>
    )
  }
  return <PdfViewer src={src} title={title} />
}

export default function ViewPage() {
  return (
    <>
      <ApplyStoredTheme />
      <Suspense fallback={null}>
        <Viewer />
      </Suspense>
    </>
  )
}
