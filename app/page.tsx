"use client"

import { useCallback, useMemo, useState, useEffect } from "react"
import { subjects, type Resource, type Subject } from "@/data/subjects"
import { quizBank } from "@/data/quizzes"
import Sidebar from "@/components/sidebar"
import ResourceList from "@/components/resource-list"
import ResourceDetail from "@/components/resource-detail"
import QuizModal from "@/components/QuizModal"
import { useStreak } from "@/lib/streak"
import UniversityPicker, { universities, type University } from "@/components/UniversityPicker"

const UNI_KEY = "atlas-university" // remembered on this device (localStorage); "Change" in the sidebar reopens the chooser

// each lecture is followed by its quiz, in the same discipline (labs too, once they have their own summary and exam)
function withGeneratedQuizzes(subject: Subject): Resource[] {
  return subject.resources.flatMap((r): Resource[] =>
    r.type !== "lecture" && !(r.type === "lab" && r.summary_url)
      ? [r]
      : [
          r,
          {
            id: `quiz-${r.id}`,
            title: `Quiz for ${r.title}`,
            cleanTitle: `Quiz: ${r.cleanTitle}`,
            type: "exam",
            discipline: r.discipline,
            topic: r.topic,
            summary: "Test your understanding of this lecture with a short interactive quiz.",
            isQuiz: true,
            lectureId: r.id,
          },
        ]
  )
}

export default function AtlasPage() {
  const [dark, setDark] = useState(false)
  const [currentSubject, setCurrentSubject] = useState(subjects[0].id)
  const [filter, setFilter] = useState<string>("all")
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Resource | null>(null)
  const [quiz, setQuiz] = useState<{ questions: typeof quizBank[string]; title: string; topic: string } | null>(null)
  const [showQuiz, setShowQuiz] = useState(false)
  // undefined = not read yet, null = not chosen (show the chooser)
  const [university, setUniversity] = useState<University | null | undefined>(undefined)

  useEffect(() => {
    let saved: string | null = null
    try {
      saved = localStorage.getItem(UNI_KEY)
    } catch {}
    setUniversity(universities.some((u) => u.id === saved) ? (saved as University) : null)
  }, [])

  const chooseUniversity = (u: University) => {
    try {
      localStorage.setItem(UNI_KEY, u)
    } catch {}
    setUniversity(u)
    setSelected(null)
    setFilter("all")
    setSearch("")
  }

  // Al-Ameed gets the same site with an empty library until its own lectures are added
  const visibleSubjects = useMemo(
    () => (university === "ameed" ? subjects.map((s) => ({ ...s, resources: [] })) : subjects),
    [university]
  )

  useEffect(() => {
    if (localStorage.getItem("atlas-theme") === "dark") {
      setDark(true)
      document.documentElement.setAttribute("data-theme", "dark")
      document.documentElement.classList.add("dark")
    }
  }, [])

  const toggleTheme = () => {
    setDark((prev) => {
      const next = !prev
      const root = document.documentElement
      if (next) {
        root.setAttribute("data-theme", "dark")
        root.classList.add("dark")
        localStorage.setItem("atlas-theme", "dark")
      } else {
        root.removeAttribute("data-theme")
        root.classList.remove("dark")
        localStorage.setItem("atlas-theme", "light")
      }
      return next
    })
  }

  const subjectData = useMemo(() => visibleSubjects.find((s) => s.id === currentSubject)!, [visibleSubjects, currentSubject])
  const allResources = useMemo(() => withGeneratedQuizzes(subjectData), [subjectData])
  const disciplines = useMemo(() => Array.from(new Set(subjectData.resources.map((r) => r.discipline))), [subjectData])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return allResources.filter((r) => {
      const matchesFilter = filter === "all" || r.discipline === filter
      const matchesSearch =
        q === "" ||
        r.cleanTitle.toLowerCase().includes(q) ||
        r.topic.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q)
      return matchesFilter && matchesSearch
    })
  }, [allResources, filter, search])

  const related = useMemo(() => {
    if (!selected) return []
    return allResources.filter((r) => r.id !== selected.id && r.topic === selected.topic).slice(0, 6)
  }, [allResources, selected])

  const [streak, recordStudy] = useStreak()

  const openQuiz = (resource: Resource) => {
    recordStudy()
    const questions = quizBank[resource.topic] || quizBank["General"]
    setQuiz({ questions, title: resource.cleanTitle, topic: resource.topic })
    setShowQuiz(true)
  }

  const handleSelect = (resource: Resource) => {
    if (resource.isQuiz) openQuiz(resource)
    else {
      recordStudy()
      setSelected(resource)
    }
  }

  const closeDetail = useCallback(() => setSelected(null), [])

  const selectSubject = (id: string) => {
    setCurrentSubject(id)
    setSelected(null)
    setFilter("all")
    setSearch("")
  }

  return (
    <div className="md:grid md:h-screen md:grid-cols-[minmax(240px,280px)_minmax(300px,380px)_1fr] md:overflow-hidden">
      <Sidebar
        subjects={visibleSubjects}
        university={universities.find((u) => u.id === university)?.name}
        onSwitchUniversity={() => setUniversity(null)}
        currentSubject={currentSubject}
        onSelectSubject={selectSubject}
        dark={dark}
        onToggleTheme={toggleTheme}
        streak={streak}
      />
      <ResourceList
        subjectName={subjectData.name}
        disciplines={disciplines}
        resources={filtered}
        filter={filter}
        onFilter={setFilter}
        search={search}
        onSearch={setSearch}
        selectedId={selected?.id ?? null}
        onSelect={handleSelect}
        emptyText={university === "ameed" ? "Al-Ameed lectures are coming soon." : undefined}
      />
      <ResourceDetail
        resource={selected}
        related={related}
        onSelectRelated={handleSelect}
        onOpenQuiz={openQuiz}
        onClose={closeDetail}
      />

      <QuizModal isOpen={showQuiz} quiz={quiz} onClose={() => setShowQuiz(false)} />
      {university === null && <UniversityPicker onChoose={chooseUniversity} />}
    </div>
  )
}
