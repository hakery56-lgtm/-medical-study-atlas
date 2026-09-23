"use client"

import { useState } from "react"
import { X, RotateCcw, ChevronRight, ChevronLeft } from "lucide-react"
import { Flashcard } from "@/data/flashcards"

interface FlashcardModalProps {
  isOpen: boolean
  onClose: () => void
  cards: Flashcard[]
  topic: string
}

export default function FlashcardModal({ isOpen, onClose, cards, topic }: FlashcardModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)

  if (!isOpen) return null

  const handleNext = () => {
    setShowAnswer(false)
    setCurrentIndex((prev) => (prev + 1) % cards.length)
  }

  const handlePrev = () => {
    setShowAnswer(false)
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length)
  }

  const currentCard = cards[currentIndex]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border shadow-2xl animate-scale-in"
        style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: "var(--border-color)" }}>
          <div>
            <h3 className="display-serif text-xl font-bold" style={{ color: "var(--text-main)" }}>Flashcards</h3>
            <p className="text-xs font-medium" style={{ color: "var(--accent)" }}>{topic}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/5"
            style={{ color: "var(--text-muted)" }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Card Content */}
        <div className="p-8 min-h-[300px] flex flex-col items-center justify-center text-center space-y-8">
          <div className="w-full space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-50" style={{ color: "var(--text-muted)" }}>
              Card {currentIndex + 1} of {cards.length}
            </span>
            <div
              className="min-h-[120px] flex items-center justify-center text-xl font-medium leading-relaxed"
              style={{ color: "var(--text-main)" }}
            >
              {currentCard.question}
            </div>
          </div>

          <div className={`w-full transition-all duration-300 ${showAnswer ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
            <div
              className="p-6 rounded-2xl border-2 border-dashed"
              style={{ borderColor: "var(--accent)", backgroundColor: "var(--bg-pane)" }}
            >
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--accent)" }}>Answer</p>
              <p className="text-lg leading-relaxed" style={{ color: "var(--text-main)" }}>{currentCard.answer}</p>
            </div>
          </div>
        </div>

        {/* Footer Controls */}
        <div className="p-6 flex items-center justify-between gap-4 bg-black/[0.02] dark:bg-white/[0.02]">
          <button
            onClick={handlePrev}
            className="p-3 rounded-xl border transition-all hover:scale-95 active:scale-90"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={() => setShowAnswer(!showAnswer)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90 active:scale-95"
            style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)" }}
          >
            {showAnswer ? <RotateCcw size={18} /> : null}
            {showAnswer ? "Hide Answer" : "Show Answer"}
          </button>

          <button
            onClick={handleNext}
            className="p-3 rounded-xl border transition-all hover:scale-95 active:scale-90"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}
