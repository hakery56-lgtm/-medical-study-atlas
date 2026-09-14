export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export const quizBank: Record<string, QuizQuestion[]> = {
  General: [
    {
      id: '1',
      question: 'What is the primary function of the study atlas?',
      options: [
        'To organize medical educational resources',
        'To replace textbooks',
        'To track exam scores only',
        'To provide live consultations'
      ],
      correctAnswer: 0
    },
    {
      id: '2',
      question: 'How many subjects are included in the medical study atlas?',
      options: [
        '2 subjects',
        '3 subjects',
        '5 subjects',
        '10 subjects'
      ],
      correctAnswer: 1
    },
    {
      id: '3',
      question: 'Which of the following is NOT a resource type?',
      options: [
        'Lectures',
        'Laboratory sessions',
        'Video conferences',
        'Study notes'
      ],
      correctAnswer: 2
    }
  ],
  Shoulder: [
    {
      id: 's1',
      question: 'What is the glenohumeral joint commonly known as?',
      options: [
        'Shoulder joint',
        'Hip joint',
        'Knee joint',
        'Elbow joint'
      ],
      correctAnswer: 0
    },
    {
      id: 's2',
      question: 'Which muscle group stabilizes the shoulder joint?',
      options: [
        'Rotator cuff muscles',
        'Hamstring muscles',
        'Quadriceps muscles',
        'Calf muscles'
      ],
      correctAnswer: 0
    },
    {
      id: 's3',
      question: 'Shoulder impingement syndrome involves compression of which structure?',
      options: [
        'Supraspinatus tendon',
        'Biceps tendon',
        'Deltoid muscle',
        'Axillary nerve'
      ],
      correctAnswer: 0
    }
  ],
  Anatomy: [
    {
      id: 'a1',
      question: 'The heart is divided into how many chambers?',
      options: [
        '2 chambers',
        '3 chambers',
        '4 chambers',
        '5 chambers'
      ],
      correctAnswer: 2
    },
    {
      id: 'a2',
      question: 'Which artery supplies the heart muscle itself?',
      options: [
        'Coronary artery',
        'Aorta',
        'Pulmonary artery',
        'Carotid artery'
      ],
      correctAnswer: 0
    }
  ],
  Physiology: [
    {
      id: 'p1',
      question: 'What is the normal resting heart rate for an adult?',
      options: [
        '30-50 bpm',
        '60-100 bpm',
        '120-140 bpm',
        '150-180 bpm'
      ],
      correctAnswer: 1
    },
    {
      id: 'p2',
      question: 'The cardiac cycle consists of which two main phases?',
      options: [
        'Systole and diastole',
        'Inspiration and expiration',
        'Contraction and relaxation only',
        'Blood flow and pressure changes'
      ],
      correctAnswer: 0
    }
  ],
  Clinical: [
    {
      id: 'c1',
      question: 'What does ECG stand for?',
      options: [
        'Electrocardiogram',
        'Electron circulation gauge',
        'Electric cardiac generator',
        'Electro-chemical grid'
      ],
      correctAnswer: 0
    },
    {
      id: 'c2',
      question: 'Atrial fibrillation is characterized by what?',
      options: [
        'Irregular heart rhythm',
        'Slow heart rate',
        'High blood pressure',
        'Chest pain only'
      ],
      correctAnswer: 0
    }
  ],
  Pharmacology: [
    {
      id: 'ph1',
      question: 'What is the primary action of antihypertensive drugs?',
      options: [
        'Lower blood pressure',
        'Increase heart rate',
        'Reduce blood glucose',
        'Prevent blood clots'
      ],
      correctAnswer: 0
    }
  ],
  'Upper Limb': [
    {
      id: 'ul1',
      question: 'How many bones are in the human hand?',
      options: [
        '19 bones',
        '27 bones',
        '32 bones',
        '42 bones'
      ],
      correctAnswer: 1
    }
  ],
  'Lower Limb': [
    {
      id: 'll1',
      question: 'The femur is commonly known as which bone?',
      options: [
        'Thigh bone',
        'Shin bone',
        'Fibula',
        'Pelvis'
      ],
      correctAnswer: 0
    }
  ],
  Joints: [
    {
      id: 'j1',
      question: 'Osteoarthritis is primarily a disease of what?',
      options: [
        'Cartilage degradation',
        'Muscle inflammation',
        'Nerve damage',
        'Blood vessel narrowing'
      ],
      correctAnswer: 0
    },
    {
      id: 'j2',
      question: 'What is the main characteristic of rheumatoid arthritis?',
      options: [
        'Autoimmune joint inflammation',
        'Mechanical wear and tear',
        'Infection of the joint',
        'Nerve compression'
      ],
      correctAnswer: 0
    }
  ],
  Spine: [
    {
      id: 'sp1',
      question: 'How many vertebrae does the cervical spine have?',
      options: [
        '5 vertebrae',
        '7 vertebrae',
        '12 vertebrae',
        '5 lumbar + 5 sacral'
      ],
      correctAnswer: 1
    }
  ],
  Histology: [
    {
      id: 'h1',
      question: 'What is the functional unit of the lung?',
      options: [
        'Alveolus',
        'Bronchus',
        'Trachea',
        'Larynx'
      ],
      correctAnswer: 0
    }
  ],
  Pathology: [
    {
      id: 'pa1',
      question: 'Hydatid cysts in the lung are caused by what?',
      options: [
        'Parasitic infection',
        'Bacterial infection',
        'Viral infection',
        'Fungal infection'
      ],
      correctAnswer: 0
    }
  ],
  Immunology: [
    {
      id: 'im1',
      question: 'What is the primary immune response to tuberculosis?',
      options: [
        'Cell-mediated immunity',
        'Antibody production',
        'Complement activation',
        'Histamine release'
      ],
      correctAnswer: 0
    }
  ]
};
