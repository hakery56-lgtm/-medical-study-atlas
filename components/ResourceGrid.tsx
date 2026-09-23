"use client"

import { useState } from "react"
import FlashcardModal from "./FlashcardModal"
import QuizModal from "./QuizModal"
import { flashcardBank } from "@/data/flashcards"
import { quizBank } from "@/data/quizzes"
import { BookOpen, BrainCircuit } from "lucide-react"

interface ResourceGridProps {
  categoriesMap: Record<string, any[]>
}

export default function ResourceGrid({ categoriesMap }: ResourceGridProps) {
  const [activeTopic, setActiveTopic] = useState<string | null>(null)
  const [isFlashcardOpen, setIsFlashcardOpen] = useState(false)
  const [isQuizOpen, setIsQuizOpen] = useState(false)

  const handleOpenFlashcards = (topic: string) => {
    if (flashcardBank[topic]) {
      setActiveTopic(topic)
      setIsFlashcardOpen(true)
    }
  }

  const handleOpenQuiz = (topic: string) => {
    if (quizBank[topic]) {
      setActiveTopic(topic)
      setIsQuizOpen(true)
    }
  }

  return (
    <div className="grid gap-12">
      {Object.entries(categoriesMap).map(([category, items]) => {
        const hasFlashcards = !!flashcardBank[category]
        const hasQuiz = !!quizBank[category]

        return (
          <section key={category} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-xl font-semibold text-slate-800">{category}</h2>

              <div className="flex gap-2">
                {hasFlashcards && (
                  <button
                    onClick={() => handleOpenFlashcards(category)}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-slate-200 text-slate-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all"
                  >
                    <BrainCircuit size={14} />
                    Flashcards
                  </button>
                )}
                {hasQuiz && (
                  <button
                    onClick={() => handleOpenQuiz(category)}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-slate-200 text-slate-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all"
                  >
                    <BookOpen size={14} />
                    Take Quiz
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
              {items.map((file, idx) => (
                <a
                  key={idx}
                  href={`https://fkrhjhfwzaqdntyoysog.supabase.co/storage/v1/object/public/resources/${file.storage_path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 rounded-lg border border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                >
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded flex items-center justify-center mr-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    PDF
                  </div>
                  <span className="text-sm text-slate-700 truncate">{file.file_name}</span>
                </a>
              ))}
            </div>
          </section>
        )
      })}

      {/* Modals */}
      {activeTopic && (
        <>
          <FlashcardModal
            isOpen={isFlashcardOpen}
            onClose={() => setIsFlashcardOpen(false)}
            cards={flashcardBank[activeTopic] || []}
            topic={activeTopic}
          />
          <QuizModal
            isOpen={isQuizOpen}
            onClose={() => setIsQuizOpen(false)}
            quiz={quizBank[activeTopic] ? {
              title: `Quiz: ${activeTopic}`,
              topic: activeTopic,
              questions: quizBank[activeTopic]
            } : null}
          />
        </>
      )}
    </div>
  )
}
