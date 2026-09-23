export type ResourceType = "lecture" | "lab" | "note" | "exam"

export interface Resource {
  id: string | number
  title: string
  cleanTitle: string
  type: ResourceType
  topic: string
  summary: string
  file_url?: string
  isQuiz?: boolean
  lectureId?: string | number
}

export interface Subject {
  id: string
  name: string
  icon: "bone" | "heart" | "lungs" | "blood" | "pill" | "microscope"
  resources: Resource[]
}

export const subjects: Subject[] = [
  {
    id: "patho",
    name: "Pathology",
    icon: "microscope",
    resources: [
      { id: 1, title: "lecture_1_cell_injury_and_adaptation_e8e86e3ed226ee1f5c4ab01e9112c4.pdf", cleanTitle: "Cell Injury and Adaptation", type: "lecture", topic: "Cell Injury", summary: "Foundational study of cellular responses to stress and injury." },
      { id: 2, title: "lecture_2_inflammation_and_chemical_mediators_2d5bff50804563987f10cff7400a38f4.pdf", cleanTitle: "Inflammation & Chemical Mediators", type: "lecture", topic: "Inflammation", summary: "Study of acute and chronic inflammation and the mediators involved." },
    ],
  },
  {
    id: "msk",
    name: "Musculoskeletal",
    icon: "bone",
    resources: [
      { id: 3, title: "(Ortho 1) Shoulder_Dislocation_Lecture.pdf", cleanTitle: "Shoulder Dislocation", type: "lecture", topic: "Shoulder", summary: "Analysis of shoulder dislocation mechanisms and management." },
      { id: 4, title: "Shoulder joint_9e5186719eea03a9b64eaab71114339e.pdf", cleanTitle: "The Shoulder Joint", type: "note", topic: "Shoulder", summary: "Comprehensive notes on shoulder anatomy." },
      { id: 5, title: "MSS- 1.pdf", cleanTitle: "MSK Introduction", type: "lecture", topic: "General", summary: "Introduction to the musculoskeletal system." },
      { id: 6, title: "lab1 - 2026.pdf", cleanTitle: "MSK Lab 1", type: "lab", topic: "Lab", summary: "Practical session for the first week." },
      { id: 7, title: "skill lab unit 3 week 1 (2) warith.pdf", cleanTitle: "Skill Lab - Week 1", type: "lab", topic: "Lab", summary: "Practical skill development for unit 3." },
    ],
  },
]
