export type ResourceType = "lecture" | "lab" | "note" | "exam"

export interface Resource {
  id: string | number
  title: string
  cleanTitle: string
  type: ResourceType
  topic: string
  summary: string
  file_url?: string
  bilingual_url?: string
  isQuiz?: boolean
  lectureId?: string | number
}

export interface Subject {
  id: string
  name: string
  icon: "bone" | "heart" | "lungs" | "blood" | "pill" | "microscope"
  resources: Resource[]
}

const BASE_URL = "https://fkrhjhfwzaqdntyoysog.supabase.co/storage/v1/object/public/resources"

export const subjects: Subject[] = [
  {
    id: "patho",
    name: "Pathology",
    icon: "microscope",
    resources: [
      {
        id: 1,
        title: "lecture_2_inflammation_and_chemical_mediators_2d5bff50804563987f10cff7400a38f4.pdf",
        cleanTitle: "lecture_2_inflammation_and_chemical_mediators_2d5bff50804563987f10cff7400a38f4",
        type: "lecture",
        topic: "Inflammation",
        summary: "Study of acute and chronic inflammation and the mediators involved.",
        file_url: `${BASE_URL}/lecture_2_inflammation_and_chemical_mediators_2d5bff50804563987f10cff7400a38f4.pdf`,
        bilingual_url: "/bilingual/Lecture2_Acute_Inflammation_and_Chemical_Mediators_Bilingual.pdf"
      },
      {
        id: 2,
        title: "lecture_1_cell_injury_and_adaptation_e8e86e3ed226ee1f5c4ab01e9112c4.pdf",
        cleanTitle: "lecture_1_cell_injury_and_adaptation_e8e86e3ed226ee1f5c4ab01e9112c4",
        type: "lecture",
        topic: "Cell Injury",
        summary: "Foundational study of cellular responses to stress and injury.",
        file_url: `${BASE_URL}/lecture_1_cell_injury_and_adaptation_e8e86e3ed226ee1f5c4ab01e9112c4.pdf`,
        bilingual_url: "/bilingual/Lecture1_Cell_Injury_and_Adaptation_Bilingual.pdf"
      },
      {
        id: 3,
        title: "lecture_4_eicosanoids_and_lipid_mediators.pdf",
        cleanTitle: "lecture_4_eicosanoids_and_lipid_mediators",
        type: "lecture",
        topic: "Eicosanoids",
        summary: "Detailed look at lipid mediators of inflammation.",
        file_url: `${BASE_URL}/lecture_4_eicosanoids_and_lipid_mediators.pdf`,
        bilingual_url: "/bilingual/MSS1_NSAIDs_Bilingual.pdf"
      },
    ],
  },
  {
    id: "msk",
    name: "Musculoskeletal",
    icon: "bone",
    resources: [
      {
        id: 4,
        title: "impenging shoulder.pdf",
        cleanTitle: "impenging shoulder",
        type: "lecture",
        topic: "Shoulder Impingement",
        summary: "Clinical approach to shoulder impingement syndrome.",
        file_url: `${BASE_URL}/impenging shoulder.pdf`,
        bilingual_url: "/bilingual/Shoulder_Impingement_Syndrome_Bilingual.pdf"
      },
      {
        id: 5,
        title: "(Ortho 2) Anatomy_and_Fractures_of_the_Clavicle.pdf",
        cleanTitle: "(Ortho 2) Anatomy_and_Fractures_of_the_Clavicle",
        type: "lecture",
        topic: "Clavicle",
        summary: "Comprehensive review of clavicle anatomy and fracture management.",
        file_url: `${BASE_URL}/(Ortho 2) Anatomy_and_Fractures_of_the_Clavicle.pdf`,
        bilingual_url: "/bilingual/Ortho2_Clavicle_Anatomy_and_Fractures_Bilingual.pdf"
      },
      {
        id: 6,
        title: "Shoulder joint - 27.pdf",
        cleanTitle: "Shoulder joint - 27",
        type: "lecture",
        topic: "Shoulder Joint",
        summary: "Anatomical and functional study of the shoulder joint.",
        file_url: `${BASE_URL}/Shoulder joint - 27.pdf`,
        bilingual_url: "/bilingual/Shoulder_Joint_27_Bilingual.pdf"
      },
      {
        id: 7,
        title: "(Ortho 1) Shoulder_Dislocation_Lecture.pdf",
        cleanTitle: "(Ortho 1) Shoulder_Dislocation_Lecture",
        type: "lecture",
        topic: "Shoulder Dislocation",
        summary: "Mechanisms and management of shoulder dislocations.",
        file_url: `${BASE_URL}/(Ortho 1) Shoulder_Dislocation_Lecture.pdf`,
        bilingual_url: "/bilingual/Ortho1_Shoulder_Dislocation_Bilingual.pdf"
      },
      {
        id: 8,
        title: "muscles of shoulder rigion...pdf",
        cleanTitle: "muscles of shoulder rigion..",
        type: "lecture",
        topic: "Shoulder Muscles",
        summary: "Detailed study of muscles acting on the shoulder girdle.",
        file_url: `${BASE_URL}/muscles of shoulder rigion...pdf`,
        bilingual_url: "/bilingual/Muscles_of_Shoulder_Region_Bilingual.pdf"
      },
      {
        id: 9,
        title: "Shoulder joint_9e5186719eea03a9b64eaab71114339e.pdf",
        cleanTitle: "The Shoulder Joint",
        type: "note",
        topic: "Shoulder",
        summary: "Comprehensive notes on shoulder anatomy.",
        file_url: `${BASE_URL}/Shoulder joint_9e5186719eea03a9b64eaab71114339e.pdf`
      },
      {
        id: 10,
        title: "lab1 - 2026.pdf",
        cleanTitle: "MSK Lab 1",
        type: "lab",
        topic: "Lab",
        summary: "Practical session for the first week.",
        file_url: `${BASE_URL}/lab1 - 2026.pdf`
      },
      {
        id: 11,
        title: "skill lab unit 3 week 1 (2) warith.pdf",
        cleanTitle: "Skill Lab - Week 1",
        type: "lab",
        topic: "Lab",
        summary: "Practical skill development for unit 3.",
        file_url: `${BASE_URL}/skill lab unit 3 week 1 (2) warith.pdf`
      },
    ],
  },
]
