import { readFileSync } from "node:fs"
import path from "node:path"
import Link from "next/link"
import { notFound } from "next/navigation"
import { marked } from "marked"
import { ArrowLeft } from "lucide-react"
import { subjects } from "@/data/subjects"
import ApplyStoredTheme from "@/components/ApplyStoredTheme"

// one Markdown file per lecture in content/summaries, linked from each lecture's summary_url
const lectures = subjects.flatMap((s) => s.resources).filter((r) => r.summary_url)
const idOf = (url: string) => url.split("/").pop()!

export function generateStaticParams() {
  return lectures.map((r) => ({ id: idOf(r.summary_url!) }))
}

export default function SummaryPage({ params }: { params: { id: string } }) {
  const lecture = lectures.find((r) => idOf(r.summary_url!) === params.id)
  if (!lecture) notFound()

  // our own trusted content, rendered at build time
  const markdown = readFileSync(path.join(process.cwd(), "content/summaries", `${params.id}.md`), "utf8")
  const html = marked.parse(markdown) as string

  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--bg-main)", color: "var(--text-main)" }}>
      <ApplyStoredTheme />
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b px-4 py-3" style={{ backgroundColor: "var(--bg-pane)", borderColor: "var(--border-color)" }}>
        <Link href="/" aria-label="Back to library" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-card)" }}>
          <ArrowLeft size={17} />
        </Link>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--accent)" }}>Exam Summary · {lecture.topic}</p>
          <h1 className="truncate text-sm font-bold [overflow-wrap:anywhere]">{lecture.cleanTitle}</h1>
        </div>
      </header>
      <article dir="rtl" lang="ar" className="summary mx-auto max-w-3xl px-4 py-8 lg:px-8" dangerouslySetInnerHTML={{ __html: html }} />
    </main>
  )
}
