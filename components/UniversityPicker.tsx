"use client"

import { useEffect } from "react"
import { Stethoscope, Landmark, ArrowRight } from "lucide-react"

export type University = "warith" | "ameed"

export const universities: { id: University; name: string; arabic: string; note: string }[] = [
  { id: "warith", name: "Al-Warith University", arabic: "جامعة وارث الأنبياء", note: "Full library: lectures, quizzes & flash cards" },
  { id: "ameed", name: "Al-Ameed University", arabic: "جامعة العميد", note: "Weeks 1–2: anatomy, physiology, biochemistry & more" },
]

// full-screen chooser shown when a visitor opens the site; the page behind stays locked until they pick
export default function UniversityPicker({ onChoose }: { onChoose: (u: University) => void }) {
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = ""
    }
  }, [])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="uni-picker-title"
      className="fixed inset-0 z-[90] overflow-y-auto"
      style={{ backgroundColor: "var(--bg-main)" }}
    >
      <div className="uni-picker-bg pointer-events-none fixed inset-0" aria-hidden="true" />
      <div className="relative flex min-h-full items-center justify-center p-4 py-10">
        <div className="animate-fade-in w-full max-w-2xl">
          <div className="mb-8 flex flex-col items-center text-center">
            <div
              className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)", boxShadow: "var(--shadow-card)" }}
            >
              <Stethoscope size={28} />
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--text-muted)" }}>
              Medical Study Atlas
            </p>
            <h1 id="uni-picker-title" className="display-serif mt-3 text-3xl font-bold sm:text-4xl">
              Choose your university
            </h1>
            <p dir="rtl" lang="ar" className="mt-1 text-xl font-bold" style={{ color: "var(--accent)" }}>
              اختر جامعتك
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {universities.map((u, i) => (
              <button
                key={u.id}
                autoFocus={i === 0}
                onClick={() => onChoose(u.id)}
                className="uni-option group flex flex-col items-start gap-5 rounded-2xl border p-6 text-left"
                style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", boxShadow: "var(--shadow-card)" }}
              >
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ backgroundColor: "var(--accent-soft)", color: "var(--accent)" }}
                >
                  <Landmark size={24} />
                </span>
                <span className="w-full">
                  <span className="block text-lg font-bold" style={{ color: "var(--text-main)" }}>
                    {u.name}
                  </span>
                  <span dir="rtl" lang="ar" className="mt-0.5 block text-left text-base font-semibold" style={{ color: "var(--text-muted)" }}>
                    {u.arabic}
                  </span>
                </span>
                <span className="flex w-full items-center justify-between gap-3 border-t pt-4 text-xs" style={{ borderColor: "var(--border-color)", color: "var(--text-muted)" }}>
                  {u.note}
                  <ArrowRight size={16} className="shrink-0 transition-transform group-hover:translate-x-1" style={{ color: "var(--accent)" }} />
                </span>
              </button>
            ))}
          </div>

          <p className="mt-6 text-center text-xs" style={{ color: "var(--text-muted)" }}>
            You can switch university anytime from the sidebar.
          </p>
        </div>
      </div>
    </div>
  )
}
