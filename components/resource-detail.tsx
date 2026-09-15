"use client"

import { CalendarDays, FileText, ExternalLink, Info, Layers, BookOpenCheck, ChevronRight } from "lucide-react"
import type { Resource } from "@/data/subjects"
import { typeIcons, typeLabels, typeBadgeStyle } from "@/lib/resource-ui"

interface ResourceDetailProps {
  resource: Resource | null
  subjectName: string
  related: Resource[]
  onSelectRelated: (r: Resource) => void
  onOpenQuiz: (r: Resource) => void
}

export default function ResourceDetail({ resource, subjectName, related, onSelectRelated, onOpenQuiz }: ResourceDetailProps) {
  if (!resource) {
    return (
      <section className="flex h-full items-center justify-center overflow-y-auto p-8" style={{ backgroundColor: "var(--bg-main)" }}>
        <div className="flex max-w-xs flex-col items-center gap-4 text-center">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ backgroundColor: "var(--bg-pane)", color: "var(--accent)" }}
          >
            <BookOpenCheck size={30} />
          </div>
          <div>
            <h3 className="display-serif text-xl font-bold">Nothing selected yet</h3>
            <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
              Pick a lecture, lab, note, or quiz from the list to see its summary and related study materials.
            </p>
          </div>
        </div>
      </section>
    )
  }

  const Icon = typeIcons[resource.type]
  const isExam = resource.type === "exam"

  return (
    <section className="h-full overflow-y-auto p-6 lg:p-10" style={{ backgroundColor: "var(--bg-main)" }}>
      <div key={resource.id} className="animate-fade-in mx-auto max-w-3xl space-y-8">
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest"
              style={{ ...typeBadgeStyle(resource.type) }}
            >
              <Icon size={12} />
              {typeLabels[resource.type]}
            </span>
            <span
              className="rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest"
              style={{ backgroundColor: "var(--bg-pane)", color: "var(--text-muted)" }}
            >
              {subjectName}
            </span>
            <span
              className="rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest"
              style={{ backgroundColor: "var(--bg-pane)", color: "var(--text-muted)" }}
            >
              {resource.topic}
            </span>
          </div>
          <h2 className="display-serif text-3xl font-bold leading-tight lg:text-4xl">{resource.cleanTitle}</h2>
          <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: "var(--text-muted)" }}>
            <span className="flex items-center gap-1.5">
              <CalendarDays size={15} /> Academic Year 2025–26
            </span>
            <span className="flex items-center gap-1.5">
              <FileText size={15} /> {isExam ? "Interactive quiz" : "PDF document"}
            </span>
          </div>
        </header>

        <div
          className="space-y-5 rounded-2xl border p-6"
          style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", boxShadow: "var(--shadow-card)" }}
        >
          <h4 className="flex items-center gap-2 text-sm font-semibold">
            <Info size={16} style={{ color: "var(--accent)" }} />
            Summary
          </h4>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
            {resource.summary}
          </p>
          {isExam ? (
            <button
              onClick={() => onOpenQuiz(resource)}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)" }}
            >
              <BookOpenCheck size={16} />
              Start Quiz
            </button>
          ) : (
            <button
              onClick={() => {
                const storageUrl = resource.file_url 
                  ? resource.file_url 
                  : `https://fkrhjhfwzaqdntyoysog.supabase.co/storage/v1/object/public/resources/${encodeURIComponent(resource.title)}`;
                window.open(storageUrl, "_blank");
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)" }}
            >
              <ExternalLink size={16} />
              Open Original File
            </button>
          )}
          <p className="truncate text-center text-[11px]" style={{ color: "var(--text-muted)" }}>
            {resource.title}
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="flex items-center gap-2 px-1 text-sm font-semibold">
            <Layers size={16} style={{ color: "var(--accent)" }} />
            Related Materials
          </h4>
          {related.length === 0 ? (
            <p className="px-1 text-xs italic" style={{ color: "var(--text-muted)" }}>
              No directly related materials found for this topic.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-2.5">
              {related.map((r) => {
                const RIcon = typeIcons[r.type]
                return (
                  <button
                    key={r.id}
                    onClick={() => onSelectRelated(r)}
                    className="group flex items-center justify-between gap-3 rounded-xl border p-3 text-left transition-colors hover:border-[var(--accent)]"
                    style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                        style={{ ...typeBadgeStyle(r.type) }}
                      >
                        <RIcon size={15} />
                      </div>
                      <span className="truncate text-xs font-medium" style={{ color: "var(--text-main)" }}>
                        {r.cleanTitle}
                      </span>
                    </div>
                    <ChevronRight size={15} className="shrink-0 opacity-40 transition-transform group-hover:translate-x-0.5" style={{ color: "var(--text-muted)" }} />
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
