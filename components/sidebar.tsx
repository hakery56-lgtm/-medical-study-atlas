"use client"

import { Moon, Sun, Stethoscope, Mail, PersonStanding } from "lucide-react"
import type { Subject } from "@/data/subjects"
import { subjectIcons } from "@/lib/resource-ui"
import Link from "next/link"

interface SidebarProps {
  subjects: Subject[]
  currentSubject: string
  onSelectSubject: (id: string) => void
  dark: boolean
  onToggleTheme: () => void
  totalResources: number
  mappedResources: number
}

const quickAccess = [
  { label: "3D Body Explorer", icon: PersonStanding, href: "/anatomy" },
  { label: "Contact Us", icon: Mail, href: "mailto:hasan.falah.ai261@kus.edu.iq" },
]

export default function Sidebar({
  subjects,
  currentSubject,
  onSelectSubject,
  dark,
  onToggleTheme,
  totalResources,
  mappedResources,
}: SidebarProps) {
  const progress = totalResources === 0 ? 0 : Math.round((mappedResources / totalResources) * 100)

  return (
    <aside
      className="flex h-full flex-col gap-8 overflow-y-auto p-6 md:border-r"
      style={{ backgroundColor: "var(--bg-pane)", borderColor: "var(--border-color)" }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl"
            style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)" }}
          >
            <Stethoscope size={22} />
          </div>
          <div>
            <h1 className="display-serif text-lg font-bold leading-tight">Medical Study Atlas</h1>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--text-muted)" }}>
              Academic Repository
            </p>
          </div>
        </div>
        <button
          onClick={onToggleTheme}
          aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
          className="flex h-9 w-9 items-center justify-center rounded-lg border transition-colors hover:opacity-80"
          style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-card)", color: "var(--text-main)" }}
        >
          {dark ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </div>

      <nav className="flex flex-col gap-8">
        <div>
          <h2 className="mb-3 px-1 text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: "var(--text-muted)" }}>
            Subjects
          </h2>
          <ul className="flex flex-col gap-1">
            {subjects.map((subject) => {
              const Icon = subjectIcons[subject.icon]
              const active = currentSubject === subject.id
              return (
                <li key={subject.id}>
                  <button
                    onClick={() => onSelectSubject(subject.id)}
                    className={`subject-btn flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      active ? "is-active" : "hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
                    }`}
                    style={{ color: active ? "var(--accent)" : "var(--text-main)" }}
                  >
                    <Icon size={17} className="shrink-0" style={{ color: active ? "var(--accent)" : "var(--text-muted)" }} />
                    <span className="flex-1 text-left">{subject.name}</span>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums"
                      style={{
                        backgroundColor: active ? "var(--accent)" : "var(--bg-card)",
                        color: active ? "var(--accent-contrast)" : "var(--text-muted)",
                      }}
                    >
                      {subject.resources.length}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>

        <div>
          <h2 className="mb-3 px-1 text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: "var(--text-muted)" }}>
            Quick Access
          </h2>
          <ul className="flex flex-col gap-1">
            {quickAccess.map(({ label, icon: Icon, href }) => (
              <li key={label}>
                <Link
                  href={href}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
                  style={{ color: "var(--text-muted)" }}
                >
                  <Icon size={16} className="shrink-0" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="mt-auto">
        <div
          className="rounded-xl border p-4"
          style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", boxShadow: "var(--shadow-card)" }}
        >
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold" style={{ color: "var(--text-main)" }}>
              Library Coverage
            </p>
            <span className="text-xs font-bold tabular-nums" style={{ color: "var(--accent)" }}>
              {progress}%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: "var(--border-color)" }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: "var(--accent)" }} />
          </div>
          <p className="mt-2 text-[10px]" style={{ color: "var(--text-muted)" }}>
            {mappedResources} of {totalResources} resources catalogued
          </p>
        </div>
      </div>
    </aside>
  )
}
