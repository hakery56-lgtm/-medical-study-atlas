import { readFileSync } from "node:fs"
import path from "node:path"
import Link from "next/link"
import { marked } from "marked"
import { ArrowLeft } from "lucide-react"
import ApplyStoredTheme from "@/components/ApplyStoredTheme"

// Terms / Cookies pages: our own Markdown in content/legal, rendered at build time like the exam summaries
export default function LegalPage({ file, title }: { file: string; title: string }) {
  const html = marked.parse(readFileSync(path.join(process.cwd(), "content/legal", file), "utf8")) as string
  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--bg-main)", color: "var(--text-main)" }}>
      <ApplyStoredTheme />
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b px-4 py-3" style={{ backgroundColor: "var(--bg-pane)", borderColor: "var(--border-color)" }}>
        <Link href="/" aria-label="Back to library" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-card)" }}>
          <ArrowLeft size={17} />
        </Link>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--accent)" }}>Medical Study Atlas</p>
          <h1 className="truncate text-sm font-bold">{title}</h1>
        </div>
      </header>
      <article className="summary mx-auto max-w-3xl px-4 py-8 lg:px-8" dangerouslySetInnerHTML={{ __html: html }} />
    </main>
  )
}
