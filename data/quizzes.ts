export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export const quizBank: Record<string, QuizQuestion[]> = {
  "Cell Injury": [
    { id: 'ci1', question: 'Which of the following is a hallmark of irreversible cell injury?', options: ['Cellular swelling', 'Fatty change', 'Membrane rupture', 'Ribosomal detachment'], correctAnswer: 2 },
    { id: 'ci2', question: 'What is the primary mechanism of coagulative necrosis?', options: ['Enzymatic digestion', 'Protein denaturation', 'Liquefaction', 'Caseous change'], correctAnswer: 1 },
    { id: 'ci3', question: 'Apoptosis is characterized by:', options: ['Inflammation', 'Cell swelling', 'Programmed cell death', 'Rupture of plasma membrane'], correctAnswer: 2 },
    { id: 'ci4', question: 'Atrophy is defined as:', options: ['Increase in cell size', 'Decrease in cell size', 'Change in cell type', 'Increase in cell number'], correctAnswer: 1 },
    { id: 'ci5', question: 'Which organelle is primarily involved in the intrinsic pathway of apoptosis?', options: ['Lysosome', 'Mitochondria', 'Golgi apparatus', 'Endoplasmic reticulum'], correctAnswer: 1 },
  ],
  "Inflammation": [
    { id: 'inf1', question: 'Which of the following is a cardinal sign of acute inflammation?', options: [' Pallor', 'Coldness', 'Rubor (Redness)', 'Hypesthesia'], correctAnswer: 2 },
    { id: 'inf2', question: 'What is the primary cell type in acute inflammation?', options: ['Lymphocyte', 'Plasma cell', 'Neutrophil', 'Macrophage'], correctAnswer: 2 },
    { id: 'inf3', question: 'Which mediator is primarily responsible for increasing vascular permeability?', options: ['Histamine', 'Interleukin-10', 'Tryptase', 'Cortisol'], correctAnswer: 0 },
    { id: 'inf4', question: 'Chronic inflammation is characterized by the presence of:', options: ['Neutrophils only', 'Macrophages and Lymphocytes', 'Platelets only', 'Edema only'], correctAnswer: 1 },
    { id: 'inf5', question: 'What is the main function of prostaglandins in inflammation?', options: ['Vasoconstriction', 'Pain and Fever induction', 'Reducing permeability', 'Suppressing leukocytes'], correctAnswer: 1 },
  ],
  "Shoulder": [
    { id: 'sh1', question: 'Which direction is the most common for shoulder dislocation?', options: ['Posterior', 'Superior', 'Anterior', 'Inferior'], correctAnswer: 2 },
    { id: 'sh2', question: 'Which nerve is most at risk during a shoulder dislocation?', options: ['Radial nerve', 'Axillary nerve', 'Ulnar nerve', 'Median nerve'], correctAnswer: 1 },
    { id: 'sh3', question: 'What is the "lightbulb sign" associated with on X-ray?', options: ['Anterior dislocation', 'Posterior dislocation', 'Fracture', 'Arthritis'], correctAnswer: 1 },
    { id: 'sh4', question: 'The glenohumeral joint is categorized as what type of joint?', options: ['Hinge', 'Pivot', 'Ball and Socket', 'Saddle'], correctAnswer: 2 },
    { id: 'sh5', question: 'Which muscle is the primary initiator of shoulder abduction?', options: ['Deltoid', 'Supraspinatus', 'Infraspinatus', 'Teres minor'], correctAnswer: 1 },
  ],
  "Lab": [
    { id: 'lb1', question: 'What is the primary goal of a skill lab in medical education?', options: ['Reading textbooks', 'Hands-on practical application', 'Watching videos', 'Writing essays'], correctAnswer: 1 },
    { id: 'lb2', question: 'Which tool is essential for palpating bony landmarks of the shoulder?', options: ['Stethoscope', 'Reflex hammer', 'Hands/Fingers', 'Sphygmomanometer'], correctAnswer: 2 },
    { id: 'lb3', question: 'Proper positioning of the patient is critical for:', options: [' reducing lab cost', ' Accurate assessment', ' Increasing speed', ' Documentation'], correctAnswer: 1 },
  ],
  "General": [
    { id: 'g1', question: 'What does MSS stand for in the context of this course?', options: ['Medical Study System', 'Musculoskeletal System', 'Medical Science Society', 'Muscle Study Section'], correctAnswer: 1 },
  ]
}
