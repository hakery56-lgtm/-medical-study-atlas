"use client"

import { useEffect, useState } from "react"
import { Stethoscope, Landmark, ArrowRight, ArrowLeft, GraduationCap } from "lucide-react"

export type University = "warith" | "ameed"
export type Stage = 2 | 3

export const universities: { id: University; name: string; arabic: string; note: string }[] = [
  { id: "warith", name: "Al-Warith University", arabic: "جامعة وارث الأنبياء", note: "Full library: lectures, quizzes & flash cards" },
  { id: "ameed", name: "Al-Ameed University", arabic: "جامعة العميد", note: "Choose your stage: 2nd or 3rd" },
]

export const stages: { id: Stage; name: string; arabic: string; note: string }[] = [
  { id: 2, name: "2nd Stage", arabic: "المرحلة الثانية", note: "Weeks 1–2: anatomy, physiology, biochemistry & more" },
  { id: 3, name: "3rd Stage", arabic: "المرحلة الثالثة", note: "Lectures coming soon" },
]

// full-screen chooser shown when a visitor opens the site; the page behind stays locked until they pick
export default function UniversityPicker({ onChoose }: { onChoose: (u: University, stage?: Stage) => void }) {
  // Al-Ameed has a second step: pick the study stage
  const [step, setStep] = useState<"uni" | "stage">("uni")
  const options = step === "uni" ? universities : stages
  const Icon = step === "uni" ? Landmark : GraduationCap

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
              {step === "uni" ? "Choose your university" : "Choose your stage"}
            </h1>
            <p dir="rtl" lang="ar" className="mt-1 text-xl font-bold" style={{ color: "var(--accent)" }}>
              {step === "uni" ? "اختر جامعتك" : "اختر مرحلتك"}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {options.map((u, i) => (
              <button
                key={`${step}-${u.id}`}
                autoFocus={i === 0}
                onClick={() => (step === "stage" ? onChoose("ameed", u.id as Stage) : u.id === "ameed" ? setStep("stage") : onChoose(u.id as University))}
                className="uni-option group flex flex-col items-start gap-5 rounded-2xl border p-6 text-left"
                style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", boxShadow: "var(--shadow-card)" }}
              >
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ backgroundColor: "var(--accent-soft)", color: "var(--accent)" }}
                >
                  <Icon size={24} />
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

          {step === "stage" ? (
            <button
              onClick={() => setStep("uni")}
              className="mx-auto mt-6 flex items-center gap-1.5 text-xs font-semibold hover:underline"
              style={{ color: "var(--accent)" }}
            >
              <ArrowLeft size={14} /> Back to universities
            </button>
          ) : (
            <p className="mt-6 text-center text-xs" style={{ color: "var(--text-muted)" }}>
              You can switch university anytime from the sidebar.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
