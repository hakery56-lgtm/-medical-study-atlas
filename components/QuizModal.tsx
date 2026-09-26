"use client"

import { X, CheckCircle2, RotateCcw, Trophy, Target } from "lucide-react"
import { useEffect, useState } from "react"
import type { QuizQuestion } from "@/data/quizzes"

interface QuizModalProps {
  isOpen: boolean
  quiz: {
    questions: QuizQuestion[]
    title: string
    topic: string
  } | null
  onClose: () => void
}

export default function QuizModal({ isOpen, quiz, onClose }: QuizModalProps) {
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [submitted, setSubmitted] = useState(false)

  // Reset whenever a new quiz is opened.
  useEffect(() => {
    if (isOpen) {
      setAnswers({})
      setSubmitted(false)
    }
  }, [isOpen, quiz?.title])

  if (!isOpen || !quiz) return null

  const total = quiz.questions.length
  const correctCount = quiz.questions.filter((q) => answers[q.id] === q.correctAnswer).length
  const score = Math.round((correctCount / total) * 100)
  const allAnswered = Object.keys(answers).length === total

  const select = (id: string, idx: number) => {
    if (!submitted) setAnswers((p) => ({ ...p, [id]: idx }))
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(15,18,20,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-fade-in flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl shadow-2xl"
        style={{ backgroundColor: "var(--bg-card)", color: "var(--text-main)", border: "1px solid var(--border-color)" }}
      >
        <div
          className="flex items-center justify-between gap-4 border-b p-6"
          style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-inset)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)" }}
            >
              <Target size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold leading-tight">{quiz.title}</h3>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Topic: {quiz.topic}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close quiz"
            className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 space-y-7 overflow-y-auto p-6 lg:p-8">
          {submitted && (
            <div
              className="flex items-center gap-4 rounded-2xl p-5"
              style={{
                backgroundColor: score >= 70 ? "var(--type-lecture-bg)" : "var(--type-exam-bg)",
                color: score >= 70 ? "var(--type-lecture)" : "var(--type-exam)",
              }}
            >
              {score >= 70 ? <Trophy size={26} /> : <Target size={26} />}
              <div>
                <h4 className="text-lg font-bold">{score >= 70 ? "Great work!" : "Keep practicing!"}</h4>
                <p className="text-sm font-semibold">
                  {correctCount}/{total} correct · {score}%
                </p>
              </div>
            </div>
          )}

          {quiz.questions.map((q, qi) => (
            <div key={q.id} className="space-y-3">
              <h4 className="text-base font-semibold leading-snug">
                <span style={{ color: "var(--text-muted)" }}>{qi + 1}.</span> {q.question}
              </h4>
              <div className="grid gap-2.5">
                {q.options.map((opt, oi) => {
                  const isSelected = answers[q.id] === oi
                  const isCorrect = oi === q.correctAnswer
                  const cls = submitted
                    ? isCorrect
                      ? "correct"
                      : isSelected
                        ? "wrong"
                        : ""
                    : isSelected
                      ? "selected"
                      : ""
                  return (
                    <button
                      key={oi}
                      onClick={() => select(q.id, oi)}
                      disabled={submitted}
                      className={`quiz-option flex items-center gap-3 rounded-xl p-3.5 text-left text-sm ${cls}`}
                      style={{ cursor: submitted ? "default" : "pointer" }}
                    >
                      <span
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-[11px] font-bold"
                        style={{
                          borderColor: isSelected || (submitted && isCorrect) ? "currentColor" : "var(--border-strong)",
                        }}
                      >
                        {submitted && isCorrect ? <CheckCircle2 size={13} /> : String.fromCharCode(65 + oi)}
                      </span>
                      <span>{opt}</span>
                    </button>
                  )
                })}
              </div>
              {submitted && q.explanation && (
                <p className="rounded-xl p-3 text-xs leading-relaxed" style={{ backgroundColor: "var(--bg-pane)", color: "var(--text-muted)" }}>
                  {q.explanation}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 border-t p-5" style={{ borderColor: "var(--border-color)" }}>
          {submitted ? (
            <>
              <button
                onClick={() => {
                  setAnswers({})
                  setSubmitted(false)
                }}
                className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors"
                style={{ backgroundColor: "var(--bg-pane)", color: "var(--text-main)" }}
              >
                <RotateCcw size={15} /> Retry
              </button>
              <button
                onClick={onClose}
                className="rounded-xl px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)" }}
              >
                Done
              </button>
            </>
          ) : (
            <button
              onClick={() => setSubmitted(true)}
              disabled={!allAnswered}
              className="rounded-xl px-6 py-2.5 text-sm font-semibold transition-opacity"
              style={{
                backgroundColor: allAnswered ? "var(--accent)" : "var(--border-strong)",
                color: allAnswered ? "var(--accent-contrast)" : "var(--text-muted)",
                cursor: allAnswered ? "pointer" : "not-allowed",
              }}
            >
              Check Answers
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
