"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Home, ExternalLink, Loader2 } from "lucide-react"

// only files the library itself links to can be shown here
const ALLOWED_PREFIXES = ["/api/file/", "/bilingual/", "/lectures/"]
export function isViewable(src: string) {
  return ALLOWED_PREFIXES.some((p) => src.startsWith(p)) && !src.includes("..") && !src.startsWith("//")
}

declare global {
  interface Window {
    pdfjsLib?: any
  }
}

// pdf.js (self-hosted in /public/pdfjs) draws the pages ourselves, so the file opens inside the app on every device
function loadPdfJs(): Promise<any> {
  if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib)
  return new Promise((resolve, reject) => {
    const s = document.createElement("script")
    s.src = "/pdfjs/pdf.min.js"
    s.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.js"
      resolve(window.pdfjsLib)
    }
    s.onerror = () => reject(new Error("pdf.js failed to load"))
    document.head.appendChild(s)
  })
}

export default function PdfViewer({ src, title }: { src: string; title: string }) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [pages, setPages] = useState(0)
  const [ratio, setRatio] = useState(0.75)
  const docRef = useRef<any>(null)
  const holder = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    setStatus("loading")
    ;(async () => {
      try {
        const lib = await loadPdfJs()
        const doc = await lib.getDocument({ url: src }).promise
        if (cancelled) return doc.destroy()
        docRef.current = doc
        const first = await doc.getPage(1)
        const vp = first.getViewport({ scale: 1 })
        setRatio(vp.height / vp.width)
        setPages(doc.numPages)
        setStatus("ready")
      } catch (e) {
        console.error(e)
        if (!cancelled) setStatus("error")
      }
    })()
    return () => {
      cancelled = true
      docRef.current?.destroy()
      docRef.current = null
    }
  }, [src])

  // draw each page only when it is about to scroll into view (long decks stay light on phones)
  useEffect(() => {
    if (status !== "ready" || !holder.current) return
    const doc = docRef.current
    const drawn = new Set<number>()
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (!en.isIntersecting) continue
          const el = en.target as HTMLDivElement
          const n = Number(el.dataset.page)
          if (drawn.has(n)) continue
          drawn.add(n)
          doc.getPage(n).then((page: any) => {
            const base = page.getViewport({ scale: 1 })
            const cssWidth = el.clientWidth
            const dpr = Math.min(window.devicePixelRatio || 1, 2)
            const vp = page.getViewport({ scale: (cssWidth / base.width) * dpr })
            const canvas = document.createElement("canvas")
            canvas.width = Math.floor(vp.width)
            canvas.height = Math.floor(vp.height)
            canvas.style.width = "100%"
            canvas.style.height = "auto"
            canvas.style.display = "block"
            el.style.aspectRatio = `${base.width} / ${base.height}`
            el.replaceChildren(canvas)
            page.render({ canvasContext: canvas.getContext("2d"), viewport: vp })
          })
        }
      },
      { rootMargin: "900px 0px" }
    )
    holder.current.querySelectorAll("[data-page]").forEach((n) => io.observe(n))
    return () => io.disconnect()
  }, [status, pages])

  return (
    <main className="flex min-h-screen flex-col" style={{ backgroundColor: "var(--bg-pane)", color: "var(--text-main)" }}>
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b px-3 py-2.5" style={{ backgroundColor: "var(--bg-main)", borderColor: "var(--border-color)" }}>
        <Link
          href="/"
          className="flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold"
          style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-card)" }}
        >
          <Home size={16} />
          Main menu
        </Link>
        <h1 className="min-w-0 flex-1 truncate text-sm font-bold">{title}</h1>
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open the original file in a new tab"
          title="Open the original file in a new tab"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border"
          style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-card)" }}
        >
          <ExternalLink size={16} />
        </a>
      </header>

      {status === "loading" && (
        <div className="flex flex-1 items-center justify-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
          <Loader2 size={18} className="animate-spin" /> Loading file…
        </div>
      )}

      {status === "error" && (
        <div className="mx-auto flex max-w-sm flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            This file could not be shown here. You can still open the original.
          </p>
          <a
            href={src}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold"
            style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)" }}
          >
            <ExternalLink size={16} /> Open original file
          </a>
        </div>
      )}

      {status === "ready" && (
        <div ref={holder} className="mx-auto w-full max-w-4xl space-y-3 p-3">
          {Array.from({ length: pages }, (_, i) => (
            <div
              key={i}
              data-page={i + 1}
              className="w-full overflow-hidden rounded-md bg-white shadow"
              style={{ aspectRatio: `1 / ${ratio}` }}
            />
          ))}
        </div>
      )}
    </main>
  )
}
