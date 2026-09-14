"use client";

import { useState, useEffect } from "react";
import { Moon, Sun, Book, BookMarked, FileText, ClipboardList, Download, Info } from "lucide-react";
import QuizModal from "@/components/QuizModal";
import { quizBank } from "@/data/quizzes";

interface Subject {
  id: string;
  name: string;
  resources: Resource[];
}

interface Resource {
  id: string | number;
  title: string;
  cleanTitle: string;
  type: "lecture" | "lab" | "note" | "exam";
  topic: string;
  summary: string;
  file_url?: string;
  isQuiz?: boolean;
  lectureId?: string | number;
}

// Sample data structure matching HTML
const defaultData: Record<string, Subject> = {
  msk: {
    id: "msk",
    name: "Musculoskeletal",
    resources: [
      {
        id: 1,
        title: "lab1[1] unit tyree week one ahmad shoulder.pdf",
        cleanTitle: "Shoulder Lab - Unit 3 Week 1",
        type: "lab",
        topic: "Shoulder",
        summary: "Practical laboratory session focused on shoulder anatomy and palpation techniques.",
      },
      {
        id: 2,
        title: "LEC 1 (2).pdf",
        cleanTitle: "MSK Introduction - Lecture 1",
        type: "lecture",
        topic: "General",
        summary: "Foundational concepts of the musculoskeletal system and clinical approach.",
      },
      {
        id: 4,
        title: "MSK -second stage-shoulder impngement syndrome.pdf",
        cleanTitle: "Shoulder Impingement Syndrome",
        type: "lecture",
        topic: "Shoulder",
        summary: "Clinical analysis of subacromial impingement, diagnosis, and management.",
      },
      {
        id: 7,
        title: "Shoulder joint.pdf",
        cleanTitle: "The Shoulder Joint",
        type: "note",
        topic: "Shoulder",
        summary: "Comprehensive notes on the glenohumeral joint and associated ligaments.",
      },
    ],
  },
  cvs: {
    id: "cvs",
    name: "Cardiovascular (CVS)",
    resources: [
      {
        id: 31,
        title: "ANATOMY OF HEART(EXTERNAL FEATURES) 1.pdf",
        cleanTitle: "Heart Anatomy - External",
        type: "lecture",
        topic: "Anatomy",
        summary: "External features of the heart.",
      },
      {
        id: 76,
        title: "Cardiac cycle.pptx",
        cleanTitle: "The Cardiac Cycle",
        type: "lecture",
        topic: "Physiology",
        summary: "Mechanical and electrical events of the cardiac cycle.",
      },
      {
        id: 81,
        title: "CVS lab .pdf",
        cleanTitle: "CVS Laboratory",
        type: "lab",
        topic: "General",
        summary: "Practical CVS lab session.",
      },
    ],
  },
  resp: {
    id: "resp",
    name: "Respiratory",
    resources: [
      {
        id: 9,
        title: "10. COPD PPT.pdf",
        cleanTitle: "COPD Presentation",
        type: "lecture",
        topic: "Clinical",
        summary: "Chronic Obstructive Pulmonary Disease study.",
      },
      {
        id: 24,
        title: "9. Bronchial Asthma PPT.pptx.pdf",
        cleanTitle: "Bronchial Asthma",
        type: "lecture",
        topic: "Clinical",
        summary: "Asthma pathophysiology and management.",
      },
    ],
  },
};

export default function Atlas() {
  const [dark, setDark] = useState(false);
  const [data] = useState<Record<string, Subject>>(defaultData);
  const [currentSubject, setCurrentSubject] = useState<string>("msk");
  const [currentFilter, setCurrentFilter] = useState<string>("all");
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<any>(null);
  const [progress] = useState(35);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDark(true);
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  const toggleTheme = () => {
    const newDark = !dark;
    setDark(newDark);
    if (newDark) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("theme", "light");
    }
  };

  const selectSubject = (subjectId: string) => {
    setCurrentSubject(subjectId);
    setSelectedResource(null);
    setCurrentFilter("all");
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "lecture":
        return <Book className="h-5 w-5" />;
      case "lab":
        return <BookMarked className="h-5 w-5" />;
      case "note":
        return <FileText className="h-5 w-5" />;
      case "exam":
        return <ClipboardList className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getResourceColor = (type: string) => {
    switch (type) {
      case "lecture":
        return "bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300";
      case "lab":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300";
      case "note":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300";
      case "exam":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  const currentSubjectData = data[currentSubject];
  const allResources = currentSubjectData.resources;

  // Generate quizzes for lectures
  const resourcesWithQuizzes = [...allResources];
  allResources.forEach((r) => {
    if (r.type === "lecture") {
      resourcesWithQuizzes.push({
        id: `quiz-${r.id}`,
        title: `Quiz for ${r.title}`,
        cleanTitle: `Interactive Quiz: ${r.cleanTitle}`,
        type: "exam",
        topic: r.topic,
        summary: "Test your knowledge on this specific lecture.",
        isQuiz: true,
        lectureId: r.id,
      });
    }
  });

  const filtered = resourcesWithQuizzes.filter(
    (r) => currentFilter === "all" || r.type === currentFilter
  );

  const startQuiz = (resource: Resource) => {
    const topic = resource.topic || "General";
    const questions = quizBank[topic] || quizBank["General"];
    setActiveQuiz({
      questions,
      answers: {},
      resource,
    });
    setShowQuizModal(true);
  };

  const selectResource = (resource: Resource) => {
    if (resource.isQuiz) {
      startQuiz(resource);
    } else {
      setSelectedResource(resource);
    }
  };

  const getRelatedMaterials = (resource: Resource) => {
    return resourcesWithQuizzes.filter(
      (r) =>
        r.id !== resource.id &&
        r.topic === resource.topic
    );
  };

  return (
    <div
      className={`relative h-screen overflow-hidden ${dark ? "dark" : ""}`}
      style={{
        backgroundColor: "var(--bg-main)",
        color: "var(--text-main)",
      }}
    >
      <QuizModal
        isOpen={showQuizModal}
        quiz={activeQuiz}
        onClose={() => setShowQuizModal(false)}
        dark={dark}
      />

      <div className="grid grid-cols-[280px_400px_1fr] h-full">
        {/* LEFT PANE: Navigation */}
        <aside
          className="pane p-6 overflow-y-auto border-r"
          style={{
            backgroundColor: "var(--bg-pane)",
            borderColor: "var(--border-color)",
          }}
        >
          <div className="flex justify-between items-start mb-10">
            <div>
              <h1 className="display-serif text-2xl font-bold tracking-tight">
                Medical Study Atlas
              </h1>
              <p
                className="text-xs uppercase tracking-widest mt-1"
                style={{ color: "var(--text-muted)" }}
              >
                Academic Repository
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border transition-colors"
              style={{
                borderColor: "var(--border-color)",
                backgroundColor: "var(--bg-card)",
                color: "var(--text-main)",
              }}
            >
              {dark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>

          <nav className="space-y-8">
            <div>
              <h2
                className="text-xs font-semibold uppercase tracking-wider mb-4"
                style={{ color: "var(--text-muted)" }}
              >
                Subjects
              </h2>
              <ul className="space-y-1">
                {Object.entries(data).map(([key, subject]) => (
                  <li key={key}>
                    <button
                      onClick={() => selectSubject(key)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        currentSubject === key ? "active-item" : ""
                      }`}
                      style={{
                        color: currentSubject === key ? "var(--accent-blue)" : "inherit",
                      }}
                    >
                      {subject.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2
                className="text-xs font-semibold uppercase tracking-wider mb-4"
                style={{ color: "var(--text-muted)" }}
              >
                Quick Access
              </h2>
              <ul className="space-y-1">
                <li>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      alert("📅 Exam Calendar: Coming soon...");
                    }}
                    className="block px-3 py-2 rounded-md text-sm transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Exam Calendar
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      alert("📑 Master Index: Coming soon...");
                    }}
                    className="block px-3 py-2 rounded-md text-sm transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Master Index
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      alert("⚙️ Settings: Coming soon...");
                    }}
                    className="block px-3 py-2 rounded-md text-sm transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Settings
                  </a>
                </li>
              </ul>
            </div>
          </nav>

          <div className="absolute bottom-6 left-6 right-6">
            <div
              className="p-4 rounded-xl border shadow-sm"
              style={{
                backgroundColor: "var(--bg-card)",
                borderColor: "var(--border-color)",
              }}
            >
              <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                Current Progress
              </p>
              <div
                className="mt-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5"
              >
                <div
                  className="bg-sky-500 h-1.5 rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-[10px] mt-2" style={{ color: "var(--text-muted)" }}>
                {progress}% of Academic Year mapped
              </p>
            </div>
          </div>
        </aside>

        {/* MIDDLE PANE: Resource List */}
        <main
          className="pane p-6 overflow-y-auto border-r"
          style={{
            backgroundColor: "var(--bg-card)",
            borderColor: "var(--border-color)",
          }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="display-serif text-xl font-bold">
              {currentSubjectData.name}
            </h2>
            <div className="flex gap-2">
              <span
                className="text-[10px] font-bold px-2 py-1 rounded uppercase tracking-tight bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
              >
                {filtered.length} Resources
              </span>
            </div>
          </div>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {["all", "lecture", "lab", "note", "exam"].map((f) => (
              <button
                key={f}
                onClick={() => setCurrentFilter(f)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-all whitespace-nowrap ${
                  currentFilter === f
                    ? "bg-slate-900 dark:bg-sky-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filtered.map((r) => (
              <div
                key={r.id}
                onClick={() => selectResource(r)}
                className="resource-card p-4 rounded-xl cursor-pointer flex items-center justify-between"
                style={{
                  backgroundColor: "var(--bg-main)",
                  border: "1px solid transparent",
                }}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div
                    className="w-10 h-10 flex-shrink-0 rounded-lg flex items-center justify-center text-slate-400"
                    style={{
                      backgroundColor: "var(--bg-card)",
                      borderColor: "var(--border-color)",
                      border: "1px solid var(--border-color)",
                    }}
                  >
                    {getResourceIcon(r.type)}
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="text-sm font-semibold truncate">
                      {r.cleanTitle}
                    </h4>
                    <p className="text-xs opacity-60 truncate">{r.title}</p>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-tighter ${getResourceColor(
                    r.type
                  )}`}
                >
                  {r.type}
                </span>
              </div>
            ))}
          </div>
        </main>

        {/* RIGHT PANE: Detailed View */}
        <section
          className="pane p-8 overflow-y-auto"
          style={{ backgroundColor: "var(--bg-main)" }}
        >
          {!selectedResource ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: "var(--bg-pane)",
                  color: "var(--text-muted)",
                }}
              >
                <Info size={32} />
              </div>
              <div>
                <h3 className="text-lg font-semibold">No Resource Selected</h3>
                <p
                  className="text-sm max-w-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  Select a lecture, lab, or note from the list to view details
                  and related study materials.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-8 max-w-4xl">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest ${getResourceColor(
                      selectedResource.type
                    )}`}
                  >
                    {selectedResource.type}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                    {selectedResource.topic}
                  </span>
                </div>
                <h2 className="display-serif text-3xl font-bold leading-tight">
                  {selectedResource.cleanTitle}
                </h2>
                <div className="flex items-center gap-4 text-sm" style={{ color: "var(--text-muted)" }}>
                  <span className="flex items-center gap-1">
                    📅 Sept 14, 2026
                  </span>
                  <span className="flex items-center gap-1">
                    📄 {selectedResource.type === "exam" ? "Quiz" : "Document"}
                  </span>
                </div>
              </div>

              <div
                className="p-6 rounded-2xl border shadow-sm space-y-4"
                style={{
                  backgroundColor: "var(--bg-card)",
                  borderColor: "var(--border-color)",
                }}
              >
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Info size={16} style={{ color: "var(--accent-blue)" }} />
                  Resource Summary
                </h4>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--text-muted)" }}
                >
                  {selectedResource.summary}
                </p>
                <button
                  onClick={() => {
                    if (selectedResource.file_url) {
                      window.open(selectedResource.file_url, "_blank");
                    } else {
                      alert("File URL not available");
                    }
                  }}
                  className="w-full py-3 text-white text-sm font-medium rounded-xl hover:opacity-90 transition-colors flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: dark ? "#0ea5e9" : "#334155",
                  }}
                >
                  <Download size={16} />
                  Open Original PDF
                </button>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-semibold px-1">Related Materials</h4>
                <div className="grid grid-cols-1 gap-3">
                  {getRelatedMaterials(selectedResource).length === 0 ? (
                    <p
                      className="text-xs opacity-50 italic"
                      style={{ color: "var(--text-muted)" }}
                    >
                      No directly related materials found for this topic.
                    </p>
                  ) : (
                    getRelatedMaterials(selectedResource).map((r) => (
                      <div
                        key={r.id}
                        onClick={() => selectResource(r)}
                        className="p-3 rounded-xl flex items-center justify-between hover:opacity-80 cursor-pointer transition-all"
                        style={{
                          backgroundColor: "var(--bg-card)",
                          borderColor: "var(--border-color)",
                          border: "1px solid var(--border-color)",
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{
                              backgroundColor:
                                r.type === "exam"
                                  ? "#f87171"
                                  : "var(--accent-blue)",
                            }}
                          ></div>
                          <span className="text-xs font-medium">
                            {r.cleanTitle}
                          </span>
                        </div>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase"
                          style={{
                            backgroundColor: "var(--bg-pane)",
                            color: "var(--text-muted)",
                          }}
                        >
                          {r.type}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
