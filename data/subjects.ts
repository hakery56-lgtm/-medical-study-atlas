export type ResourceType = "lecture" | "lab" | "note" | "exam"

export interface Resource {
  id: string | number
  title: string
  cleanTitle: string
  type: ResourceType
  // sub-subject shown as a filter chip inside its unit (Anatomy, Pathology, …)
  discipline: string
  topic: string
  summary: string
  file_url?: string
  bilingual_url?: string
  summary_url?: string
  isQuiz?: boolean
  lectureId?: string | number
}

// a teaching unit in the sidebar (e.g. Musculoskeletal); its disciplines are the chips,
// in the order they first appear in `resources`
export interface Subject {
  id: string
  name: string
  icon: "bone" | "heart" | "lungs" | "blood" | "pill" | "microscope"
  resources: Resource[]
}

// link to a file in the private "resources" bucket: app/api/file hands a short-lived signed URL
// to users with access (checked by middleware). Accepts a bare name or a full local path.
export function storageUrl(path: string) {
  const name = path.split(/[\\/]/).pop() ?? path
  return `/api/file/${encodeURIComponent(name)}`
}

// lecture PDFs committed under public/lectures (protected by middleware like every non-root path)
export function lectureUrl(name: string) {
  return `/lectures/${encodeURIComponent(name)}`
}

export const subjects: Subject[] = [
  {
    id: "msk",
    name: "Musculoskeletal",
    icon: "bone",
    resources: [
      {
        id: 6,
        title: "Shoulder joint - 27.pdf",
        cleanTitle: "Shoulder joint - 27",
        type: "lecture",
        discipline: "Anatomy",
        topic: "Shoulder Joint",
        summary: "Anatomical and functional study of the shoulder joint.",
        file_url: storageUrl("Shoulder joint - 27.pdf"),
        bilingual_url: "/bilingual/Shoulder_Joint_27_Bilingual.pdf",
        summary_url: "/summary/shoulder-joint"
      },
      {
        id: 8,
        title: "muscles of shoulder rigion_0964a24bc5d4933872bc796.pdf",
        cleanTitle: "muscles of shoulder rigion_0964a24bc5d4933872bc796",
        type: "lecture",
        discipline: "Anatomy",
        topic: "Shoulder Muscles",
        summary: "Detailed study of muscles acting on the shoulder girdle.",
        file_url: storageUrl("muscles of shoulder rigion_0964a24bc5d4933872bc796.pdf"),
        bilingual_url: "/bilingual/Muscles_of_Shoulder_Region_Bilingual.pdf",
        summary_url: "/summary/shoulder-muscles"
      },
      {
        id: 9,
        title: "Shoulder joint_9e5186719eea03a9b64eaab71114339e.pdf",
        cleanTitle: "The Shoulder Joint",
        type: "note",
        discipline: "Anatomy",
        topic: "Shoulder",
        summary: "Comprehensive notes on shoulder anatomy.",
        file_url: storageUrl("Shoulder joint_9e5186719eea03a9b64eaab71114339e.pdf")
      },
      {
        id: 12,
        title: "anatomy of arm-I-_d0848c93981ad6818184b164e6b4dafd.pdf",
        cleanTitle: "anatomy of arm-I-_d0848c93981ad6818184b164e6b4dafd",
        type: "lecture",
        discipline: "Anatomy",
        topic: "Arm Compartments",
        summary: "Compartments, muscles and arteries of the arm, and the anastomosis around the elbow.",
        file_url: lectureUrl("anatomy of arm-I-_d0848c93981ad6818184b164e6b4dafd.pdf"),
        bilingual_url: "/bilingual/Anatomy_of_Arm_I_Bilingual.pdf",
        summary_url: "/summary/arm-1"
      },
      {
        id: 13,
        title: "anatomy of arm-II-_a1a5a431c56a6a4da2ab400fcbf3d5ff.pdf",
        cleanTitle: "anatomy of arm-II-_a1a5a431c56a6a4da2ab400fcbf3d5ff",
        type: "lecture",
        discipline: "Anatomy",
        topic: "Elbow & Cubital Fossa",
        summary: "The elbow and proximal radio-ulnar joints, pronation and supination, and the cubital fossa.",
        file_url: lectureUrl("anatomy of arm-II-_a1a5a431c56a6a4da2ab400fcbf3d5ff.pdf"),
        bilingual_url: "/bilingual/Anatomy_of_Arm_II_Bilingual.pdf",
        summary_url: "/summary/arm-2"
      },
      {
        id: 14,
        title: "applied anatomy_57306dc1b0269441453bceef6d7b43ab.pdf",
        cleanTitle: "applied anatomy_57306dc1b0269441453bceef6d7b43ab",
        type: "lecture",
        discipline: "Anatomy",
        topic: "Applied Anatomy of Upper Limb",
        summary: "Clinical cases: dislocations, fractures, degenerative shoulder and nerve injuries of the upper limb.",
        file_url: lectureUrl("applied anatomy_57306dc1b0269441453bceef6d7b43ab.pdf"),
        bilingual_url: "/bilingual/Applied_Anatomy_of_Upper_Limb_I_Bilingual.pdf",
        summary_url: "/summary/applied-anatomy-1"
      },
      {
        id: 2,
        title: "lecture_1_cell_injury_and_adaptation_e8e86e3ed226ee1f5c4ab01e915112c4.pdf",
        cleanTitle: "lecture_1_cell_injury_and_adaptation_e8e86e3ed226ee1f5c4ab01e915112c4",
        type: "lecture",
        discipline: "Pathology",
        topic: "Cell Injury",
        summary: "Foundational study of cellular responses to stress and injury.",
        file_url: storageUrl("lecture_1_cell_injury_and_adaptation_e8e86e3ed226ee1f5c4ab01e915112c4.pdf"),
        bilingual_url: "/bilingual/Lecture1_Cell_Injury_and_Adaptation_Bilingual.pdf",
        summary_url: "/summary/cell-injury"
      },
      {
        id: 1,
        title: "lecture_2_inflammation_and_chemical_mediators_2d5bff50804563987f10cff7400a38f4.pdf",
        cleanTitle: "lecture_2_inflammation_and_chemical_mediators_2d5bff50804563987f10cff7400a38f4",
        type: "lecture",
        discipline: "Pathology",
        topic: "Inflammation",
        summary: "Study of acute and chronic inflammation and the mediators involved.",
        file_url: storageUrl("lecture_2_inflammation_and_chemical_mediators_2d5bff50804563987f10cff7400a38f4.pdf"),
        bilingual_url: "/bilingual/Lecture2_Acute_Inflammation_and_Chemical_Mediators_Bilingual.pdf",
        summary_url: "/summary/inflammation"
      },
      {
        id: 15,
        title: "inflammation_healing_and_repair_c4b5de9119f2fac98b.pdf",
        cleanTitle: "inflammation_healing_and_repair_c4b5de9119f2fac98b",
        type: "lecture",
        discipline: "Pathology",
        topic: "Chronic Inflammation & Repair",
        summary: "Chronic and granulomatous inflammation, tissue repair, wound healing and fracture healing.",
        file_url: lectureUrl("inflammation_healing_and_repair_c4b5de9119f2fac98b.pdf"),
        bilingual_url: "/bilingual/Chronic_Inflammation_Healing_and_Repair_Bilingual.pdf",
        summary_url: "/summary/chronic-inflammation"
      },
      {
        id: 3,
        title: "MSS- 1.pdf",
        cleanTitle: "MSS- 1",
        type: "lecture",
        discipline: "Pharmacology",
        topic: "Eicosanoids",
        summary: "Detailed look at lipid mediators of inflammation.",
        file_url: storageUrl("MSS- 1.pdf"),
        bilingual_url: "/bilingual/MSS1_NSAIDs_Bilingual.pdf",
        summary_url: "/summary/nsaids"
      },
      {
        id: 16,
        title: "MSS- 2.pdf",
        cleanTitle: "MSS- 2",
        type: "lecture",
        discipline: "Pharmacology",
        topic: "Narcotic Analgesics",
        summary: "Opioid receptors, morphine, individual opioids and opioid antagonists.",
        file_url: lectureUrl("MSS- 2.pdf"),
        bilingual_url: "/bilingual/MSS2_Narcotic_Analgesics_Bilingual.pdf",
        summary_url: "/summary/narcotics"
      },
      {
        id: 18,
        title: "Somatosensory lecture.pdf",
        cleanTitle: "Somatosensory lecture",
        type: "lecture",
        discipline: "Physiology",
        topic: "Somatic Sensation",
        summary: "Neurons, sensory receptors, stimulus coding, sensory acuity and the ascending somatosensory pathways.",
        file_url: lectureUrl("Somatosensory lecture.pdf"),
        bilingual_url: "/bilingual/Somatosensory_Lecture_Bilingual.pdf",
        summary_url: "/summary/somatosensory"
      },
      {
        id: 7,
        title: "(Ortho 1) Shoulder_Dislocation_Lecture.pdf",
        cleanTitle: "(Ortho 1) Shoulder_Dislocation_Lecture",
        type: "lecture",
        discipline: "Orthopedics",
        topic: "Shoulder Dislocation",
        summary: "Mechanisms and management of shoulder dislocations.",
        file_url: storageUrl("(Ortho 1) Shoulder_Dislocation_Lecture.pdf"),
        bilingual_url: "/bilingual/Ortho1_Shoulder_Dislocation_Bilingual.pdf",
        summary_url: "/summary/dislocation"
      },
      {
        id: 5,
        title: "(Ortho 2) Anatomy_and_Fractures_of_the_Clavicle.pdf",
        cleanTitle: "(Ortho 2) Anatomy_and_Fractures_of_the_Clavicle",
        type: "lecture",
        discipline: "Orthopedics",
        topic: "Clavicle",
        summary: "Comprehensive review of clavicle anatomy and fracture management.",
        file_url: storageUrl("(Ortho 2) Anatomy_and_Fractures_of_the_Clavicle.pdf"),
        bilingual_url: "/bilingual/Ortho2_Clavicle_Anatomy_and_Fractures_Bilingual.pdf",
        summary_url: "/summary/clavicle"
      },
      {
        id: 4,
        title: "impenging shoulder.pdf",
        cleanTitle: "impenging shoulder",
        type: "lecture",
        discipline: "Medicine",
        topic: "Shoulder Impingement",
        summary: "Clinical approach to shoulder impingement syndrome.",
        file_url: storageUrl("impenging shoulder.pdf"),
        bilingual_url: "/bilingual/Shoulder_Impingement_Syndrome_Bilingual.pdf",
        summary_url: "/summary/impingement"
      },
      {
        id: 10,
        title: "lab1 - 2026.pdf",
        cleanTitle: "MSK Lab 1",
        type: "lab",
        discipline: "Labs",
        topic: "Lab",
        summary: "Practical session for the first week.",
        file_url: storageUrl("lab1 - 2026.pdf")
      },
      {
        id: 11,
        title: "skill lab unit 3 week 1 (2) warith.pdf",
        cleanTitle: "Skill Lab - Week 1",
        type: "lab",
        discipline: "Labs",
        topic: "Lab",
        summary: "Practical skill development for unit 3.",
        file_url: storageUrl("skill lab unit 3 week 1 (2) warith.pdf")
      },
      {
        id: 17,
        title: "lecture_networks_and_security_71788629cb8762ff07fe08b7a4556b8b.pdf",
        cleanTitle: "lecture_networks_and_security_71788629cb8762ff07fe08b7a4556b8b",
        type: "lecture",
        discipline: "Computer Science",
        topic: "Computer Networks",
        summary: "Types and components of computer networks, network threats and security measures.",
        file_url: lectureUrl("lecture_networks_and_security_71788629cb8762ff07fe08b7a4556b8b.pdf"),
        bilingual_url: "/bilingual/Computer_Networks_and_Network_Security_Bilingual.pdf",
        summary_url: "/summary/networks"
      },
    ],
  },
]
