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
  // which university's library it belongs to; no value = Al-Warith
  university?: "warith" | "ameed"
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
        id: 19,
        title: "anatomy of arm-27.pdf",
        cleanTitle: "Anatomy of the Arm (complete)",
        type: "lecture",
        discipline: "Anatomy",
        topic: "Arm (Complete)",
        summary: "The full arm lecture: compartments and muscles, brachial artery and elbow anastomosis, elbow and radio-ulnar joints, cubital fossa, and humeral fractures.",
        file_url: lectureUrl("anatomy of arm-27.pdf"),
        bilingual_url: "/bilingual/Anatomy_of_Arm_Complete_Bilingual.pdf",
        summary_url: "/summary/arm-complete"
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
        id: 20,
        title: "Bone fracture.pdf",
        cleanTitle: "Bone Fracture: Classification & First Aid",
        type: "lecture",
        discipline: "Orthopedics",
        topic: "Bone Fractures",
        summary: "Classification of fractures, clinical picture, first aid, emergency signs and key points.",
        file_url: lectureUrl("Bone fracture.pdf"),
        bilingual_url: "/bilingual/Bone_Fracture_Bilingual.pdf",
        summary_url: "/summary/bone-fracture"
      },
      {
        id: 21,
        title: "Fracture neck of humerus.pdf",
        cleanTitle: "Fracture of the Proximal (Neck) Humerus",
        type: "lecture",
        discipline: "Orthopedics",
        topic: "Proximal Humerus Fracture",
        summary: "Neer classification, complications and clinical assessment of proximal humerus fractures.",
        file_url: lectureUrl("Fracture neck of humerus.pdf"),
        bilingual_url: "/bilingual/Fracture_Neck_of_Humerus_Bilingual.pdf",
        summary_url: "/summary/humerus-neck-fracture"
      },
      {
        id: 22,
        title: "Axillary nerve.pdf",
        cleanTitle: "Axillary Nerve: Course & Lesion",
        type: "lecture",
        discipline: "Orthopedics",
        topic: "Axillary Nerve",
        summary: "Root values, course through the quadrangular space, functions, effects of injury and clinical examination.",
        file_url: lectureUrl("Axillary nerve.pdf"),
        bilingual_url: "/bilingual/Axillary_Nerve_Bilingual.pdf",
        summary_url: "/summary/axillary-nerve"
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
        id: 25,
        title: "Psychiatric pain disorder.pdf",
        cleanTitle: "Psychiatric Pain Disorder",
        type: "lecture",
        discipline: "Psychiatry",
        topic: "Psychiatric Pain Disorder",
        summary: "Psychogenic pain: behavioral symptoms, emotional distress, avoidance, cognitive distortions and treatment alternatives.",
        file_url: lectureUrl("Psychiatric pain disorder.pdf"),
        bilingual_url: "/bilingual/Psychiatric_Pain_Disorder_Bilingual.pdf",
        summary_url: "/summary/pain-disorder"
      },
      {
        id: 26,
        title: "Anatomy of Forearm.pdf",
        cleanTitle: "Anatomy of the Forearm",
        type: "lecture",
        discipline: "Anatomy",
        topic: "Anatomy of the Forearm",
        summary: "Forearm bones, flexor and extensor compartments, nerves and vessels, radioulnar and wrist joints, carpal tunnel and anatomical snuffbox.",
        file_url: lectureUrl("Anatomy of Forearm.pdf"),
        bilingual_url: "/bilingual/Anatomy_of_Forearm_Bilingual.pdf",
        summary_url: "/summary/forearm"
      },
      {
        id: 27,
        title: "Applied Anatomy of Upper Limb IV.pdf",
        cleanTitle: "Applied Anatomy of Upper Limb IV",
        type: "lecture",
        discipline: "Anatomy",
        topic: "Applied Anatomy of Upper Limb IV",
        summary: "Humeral fractures and their nerve injuries, the elbow on X-ray (CRITOE, radiological lines) and nursemaid's elbow.",
        file_url: lectureUrl("Applied Anatomy of Upper Limb IV.pdf"),
        bilingual_url: "/bilingual/Applied_Anatomy_of_Upper_Limb_IV_Bilingual.pdf",
        summary_url: "/summary/applied-anatomy-4"
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
        id: 23,
        title: "LAB 2 - arm.pdf",
        cleanTitle: "MSK Lab 2 - Arm",
        type: "lab",
        discipline: "Labs",
        topic: "Arm Lab",
        summary: "Arm specimens plus applied anatomy questions: deltopectoral approach, veins, humeral fractures, nerve injuries and the elbow.",
        file_url: lectureUrl("LAB 2 - arm.pdf"),
        bilingual_url: "/bilingual/LAB2_Arm_Bilingual.pdf",
        summary_url: "/summary/lab2-arm"
      },
      {
        id: 24,
        title: "skill lab unit 3 week 2 - shoulder joint.pdf",
        cleanTitle: "Skill Lab - Week 2 (Shoulder Joint)",
        type: "lab",
        discipline: "Labs",
        topic: "Shoulder Examination",
        summary: "Shoulder examination, impingement tests (painful arc, Neer, Hawkins-Kennedy), OSCE checklist and clinical reasoning.",
        file_url: lectureUrl("skill lab unit 3 week 2 - shoulder joint.pdf"),
        bilingual_url: "/bilingual/Skill_Lab_Shoulder_Joint_Bilingual.pdf",
        summary_url: "/summary/skill-lab-shoulder"
      },
      {
        id: 28,
        title: "LAB 3 - Forearm.pdf",
        cleanTitle: "MSK Lab 3 - Forearm",
        type: "lab",
        discipline: "Labs",
        topic: "Forearm Lab",
        summary: "Forearm specimens: shoulder and arm review, the 8 rules of the forearm muscles, cubital fossa, axial section and the front of the wrist.",
        file_url: lectureUrl("LAB 3 - Forearm.pdf"),
        bilingual_url: "/bilingual/LAB3_Forearm_Bilingual.pdf",
        summary_url: "/summary/lab3-forearm"
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
  {
    id: "ameed-w12",
    name: "Weeks 1–2",
    icon: "microscope",
    university: "ameed",
    resources: [
      {
        id: 101,
        title: "Skull Anatomy - Slides.pdf",
        cleanTitle: "Skull Anatomy (Slides)",
        type: "lecture",
        discipline: "Anatomy",
        topic: "Skull Anatomy Slides",
        summary: "Bones of the skull, the five views, foramina and their contents, and the three cranial fossae.",
        file_url: lectureUrl("Skull Anatomy - Slides.pdf"),
        bilingual_url: "/bilingual/Skull_Anatomy_Slides_Bilingual.pdf",
        summary_url: "/summary/skull-slides"
      },
      {
        id: 102,
        title: "The Skull - Lecture Notes.pdf",
        cleanTitle: "The Skull (Lecture Notes)",
        type: "lecture",
        discipline: "Anatomy",
        topic: "The Skull",
        summary: "Detailed notes on the norma views, temporal, infratemporal and pterygopalatine fossae, skull base and cranial fossae.",
        file_url: lectureUrl("The Skull - Lecture Notes.pdf"),
        bilingual_url: "/bilingual/The_Skull_Lecture_Notes_Bilingual.pdf",
        summary_url: "/summary/skull-notes"
      },
      {
        id: 103,
        title: "Scalp and Face.pdf",
        cleanTitle: "Scalp and Face",
        type: "lecture",
        discipline: "Anatomy",
        topic: "Scalp and Face",
        summary: "Cranial cavity, the five layers of the scalp, facial muscles, vessels, nerves and Bell's palsy.",
        file_url: lectureUrl("Scalp and Face.pdf"),
        bilingual_url: "/bilingual/Scalp_and_Face_Bilingual.pdf",
        summary_url: "/summary/scalp-face"
      },
      {
        id: 104,
        title: "Autonomic Nervous System.pdf",
        cleanTitle: "Autonomic Nervous System",
        type: "lecture",
        discipline: "Physiology",
        topic: "Autonomic Nervous System",
        summary: "Sympathetic and parasympathetic divisions, central control, ganglia and effects on each organ.",
        file_url: lectureUrl("Autonomic Nervous System.pdf"),
        bilingual_url: "/bilingual/Autonomic_Nervous_System_Bilingual.pdf",
        summary_url: "/summary/ans"
      },
      {
        id: 105,
        title: "Body Fluids.pdf",
        cleanTitle: "Body Fluids",
        type: "lecture",
        discipline: "Physiology",
        topic: "Body Fluids",
        summary: "Fluid compartments, ionic composition, tonicity, transport across membranes, osmosis and capillary filtration.",
        file_url: lectureUrl("Body Fluids.pdf"),
        bilingual_url: "/bilingual/Body_Fluids_Bilingual.pdf",
        summary_url: "/summary/body-fluids"
      },
      {
        id: 106,
        title: "CVS Physiology - Lecture 1.pdf",
        cleanTitle: "CVS Physiology - Lecture 1",
        type: "lecture",
        discipline: "Physiology",
        topic: "CVS Physiology 1",
        summary: "Heart functions, circulations, valves, cardiac muscle properties and the conductive system.",
        file_url: lectureUrl("CVS Physiology - Lecture 1.pdf"),
        bilingual_url: "/bilingual/CVS_Physiology_Lecture1_Bilingual.pdf",
        summary_url: "/summary/cvs-physiology-1"
      },
      {
        id: 107,
        title: "Cell Physiology.pdf",
        cleanTitle: "Cell Physiology",
        type: "lecture",
        discipline: "Physiology",
        topic: "Cell Physiology",
        summary: "Plasma membrane, ion channels, junctions, cell signaling, Ca and H regulation, apoptosis and necrosis.",
        file_url: lectureUrl("Cell Physiology.pdf"),
        bilingual_url: "/bilingual/Cell_Physiology_Bilingual.pdf",
        summary_url: "/summary/cell-physiology"
      },
      {
        id: 108,
        title: "Cells of the Nervous System.pdf",
        cleanTitle: "Cells of the Nervous System",
        type: "lecture",
        discipline: "Physiology",
        topic: "Cells of the Nervous System",
        summary: "Neuron structure, structural and functional classification, nerve fiber types and glial cells.",
        file_url: lectureUrl("Cells of the Nervous System.pdf"),
        bilingual_url: "/bilingual/Cells_of_the_Nervous_System_Bilingual.pdf",
        summary_url: "/summary/nervous-cells"
      },
      {
        id: 109,
        title: "Resting Membrane Potential and Action Potential.pdf",
        cleanTitle: "Resting Membrane Potential and Action Potential",
        type: "lecture",
        discipline: "Physiology",
        topic: "Resting Membrane Potential and Action Potential",
        summary: "Resting potential, graded potentials, phases and properties of the action potential, refractory periods.",
        file_url: lectureUrl("Resting Membrane Potential and Action Potential.pdf"),
        bilingual_url: "/bilingual/Resting_Membrane_Potential_and_Action_Potential_Bilingual.pdf",
        summary_url: "/summary/resting-potential"
      },
      {
        id: 110,
        title: "Digestion of Carbohydrates.pdf",
        cleanTitle: "Digestion of Carbohydrates",
        type: "lecture",
        discipline: "Biochemistry",
        topic: "Digestion of Carbohydrates",
        summary: "Carbohydrate digestion, lactose intolerance, glucose absorption and the GLUT transporters.",
        file_url: lectureUrl("Digestion of Carbohydrates.pdf"),
        bilingual_url: "/bilingual/Digestion_of_Carbohydrates_Bilingual.pdf",
        summary_url: "/summary/cho-digestion"
      },
      {
        id: 111,
        title: "Digestion of Lipids.pdf",
        cleanTitle: "Digestion of Lipids",
        type: "lecture",
        discipline: "Biochemistry",
        topic: "Digestion of Lipids",
        summary: "Lipases, emulsification, pancreatic enzymes, micelles, chylomicrons and steatorrhoea.",
        file_url: lectureUrl("Digestion of Lipids.pdf"),
        bilingual_url: "/bilingual/Digestion_of_Lipids_Bilingual.pdf",
        summary_url: "/summary/lipid-digestion"
      },
      {
        id: 112,
        title: "Protein Digestion.pdf",
        cleanTitle: "Protein Digestion",
        type: "lecture",
        discipline: "Biochemistry",
        topic: "Protein Digestion",
        summary: "Pepsin, rennin, pancreatic zymogens, brush-border peptidases, amino acid absorption and the Meister cycle.",
        file_url: lectureUrl("Protein Digestion.pdf"),
        bilingual_url: "/bilingual/Protein_Digestion_Bilingual.pdf",
        summary_url: "/summary/protein-digestion"
      },
      {
        id: 113,
        title: "Glycolysis.pdf",
        cleanTitle: "Glycolysis",
        type: "lecture",
        discipline: "Biochemistry",
        topic: "Glycolysis",
        summary: "The 10 reactions, hexokinase vs glucokinase, regulation, ATP yield and the fate of pyruvate.",
        file_url: lectureUrl("Glycolysis.pdf"),
        bilingual_url: "/bilingual/Glycolysis_Bilingual.pdf",
        summary_url: "/summary/glycolysis"
      },
      {
        id: 114,
        title: "Mitosis and Meiosis.pdf",
        cleanTitle: "Mitosis and Meiosis",
        type: "lecture",
        discipline: "Embryology",
        topic: "Mitosis and Meiosis",
        summary: "Mitosis, meiosis and crossover, chromosomal abnormalities, classic syndromes and gene mutations.",
        file_url: lectureUrl("Mitosis and Meiosis.pdf"),
        bilingual_url: "/bilingual/General_Embryology_L1_Mitosis_and_Meiosis_Bilingual.pdf",
        summary_url: "/summary/mitosis-meiosis"
      },
      {
        id: 115,
        title: "Histology of the Circulatory System - L1.pdf",
        cleanTitle: "Histology of the Circulatory System - L1",
        type: "lecture",
        discipline: "Histology",
        topic: "Histology of the Circulatory System 1",
        summary: "Vessel wall layers, endothelium, arteries, atherosclerosis, capillaries and pericytes.",
        file_url: lectureUrl("Histology of the Circulatory System - L1.pdf"),
        bilingual_url: "/bilingual/Histology_of_Circulatory_System_L1_Bilingual.pdf",
        summary_url: "/summary/histology-circulatory-1"
      },
      {
        id: 116,
        title: "Histology of the Circulatory System - L2.pdf",
        cleanTitle: "Histology of the Circulatory System - L2",
        type: "lecture",
        discipline: "Histology",
        topic: "Histology of the Circulatory System 2",
        summary: "Capillary beds, AV shunts, portal systems, veins, the heart wall, Purkinje fibers and lymphatics.",
        file_url: lectureUrl("Histology of the Circulatory System - L2.pdf"),
        bilingual_url: "/bilingual/Histology_of_Circulatory_System_L2_Bilingual.pdf",
        summary_url: "/summary/histology-circulatory-2"
      },
    ],
  },
]
