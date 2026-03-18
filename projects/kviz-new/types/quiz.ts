// types/quiz.ts - Data modely podle specifikace ZADANI.md

// ===================== ŠABLONA =====================
export interface TemplateConfig {
  id: string;
  name: string;
  
  // Pozadí
  background: {
    type: 'color' | 'image';
    color?: string; // hex color
    imageUrl?: string; // URL obrázku
  };
  
  // Barvy
  colors: {
    primary: string; // Hlavní barva
    secondary: string; // Sekundární barva
    correctAnswer: string; // Barva správné odpovědi (červená)
    text: {
      primary: string;
      secondary: string;
    };
  };
  
  // Fonty
  fonts: {
    question: {
      family: string;
      size: string; // px nebo rem
      weight: string; // normal, bold, 600...
    };
    answer: {
      family: string;
      size: string;
      weight: string;
    };
    numbers: {
      family: string;
      size: string;
      weight: string;
    };
  };
  
  // Pozice elementů (podle specifikace)
  positions: {
    questionNumber: 'top-left' | 'top-right';
    roundNumber: 'bottom-left' | 'bottom-right';
    questionText: 'center-top' | 'center';
    image: 'below-question' | 'right-of-question';
    answers: {
      simple: 'center' | 'center-large';
      abcdef: 'grid' | 'list-below';
    };
    media: {
      audio: 'below-question';
      video: 'thumbnail-below';
    };
  };
  
  createdAt: Date;
  updatedAt: Date;
}

// ===================== OTÁZKA =====================
export type QuestionType = 'simple' | 'abcdef' | 'bonus' | 'audio' | 'video';

export interface Question {
  id: string;
  title: string;
  text: string;
  type: QuestionType;
  
  // Odpovědi podle typu
  answers: {
    // Pro simple otázky
    simple?: string;
    
    // Pro ABCDEF otázky
    abcdef?: {
      A?: string;
      B?: string;
      C?: string;
      D?: string;
      E?: string;
      F?: string;
      correct: 'A' | 'B' | 'C' | 'D' | 'E' | 'F'; // Správná odpověď
    };
    
    // Pro bonusové otázky - všechny odpovědi jsou správné
    bonus?: string[];
  };
  
  // Media
  media?: {
    imageUrl?: string;
    audioUrl?: string;
    videoUrl?: string;
    videoThumbnailUrl?: string;
  };
  
  // Metadata
  difficulty: 'easy' | 'medium' | 'hard';
  category?: string;
  tags: string[];
  
  // Časování (pro automatické řízení)
  timing: {
    questionDuration: number; // ms pro zobrazení otázky
    answerDuration: number; // ms pro zobrazení odpovědi
    audioDuration?: number; // ms délka audio
    videoDuration?: number; // ms délka videa
  };
  
  // Pozice v kvízu
  position?: {
    roundNumber: number; // Číslo kola
    questionInRound: number; // Pořadí v kole (1-10)
  };
  
  createdAt: Date;
  updatedAt: Date;
}

// ===================== KVIZ =====================
export interface Quiz {
  id: string;
  title: string;
  description: string;
  slug: string; // URL identifikátor
  
  // Struktura kvízu
  rounds: {
    number: number;
    title?: string;
    background?: string; // ID šablony nebo custom pozadí
    questions: string[]; // IDs otázek
  }[];
  
  // Šablona
  templateId: string;
  customTemplate?: Partial<TemplateConfig>; // Přepsání výchozí šablony
  
  // Nastavení prezentace
  settings: {
    autoAdvance: boolean; // Automatické přepínání
    showQuestionNumbers: boolean;
    showRoundNumbers: boolean;
    transitionDuration: number; // ms mezi slidami
    // Pro bonusové otázky
    bonusRevealDelay: number; // ms mezi odhalením odpovědí u bonusové otázky
  };
  
  // Status
  status: 'draft' | 'published' | 'archived';
  
  // Metadata
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  
  // Statistiky
  stats?: {
    totalPlays: number;
    averageScore: number;
    lastPlayed?: Date;
  };
}

// ===================== DEMO DATA =====================
// Pro vývoj - demo data podle specifikace

export const demoQuestions: Question[] = [
  {
    id: 'q1',
    title: 'Jednoduchá otázka - příklad',
    text: 'Kdo byl prvním prezidentem Československa?',
    type: 'simple',
    answers: {
      simple: 'Tomáš Garrigue Masaryk'
    },
    media: {
      imageUrl: 'https://example.com/masaryk.jpg'
    },
    difficulty: 'medium',
    tags: ['historie', 'československo'],
    timing: {
      questionDuration: 15000,
      answerDuration: 10000
    },
    createdAt: new Date('2026-03-01'),
    updatedAt: new Date('2026-03-01')
  },
  {
    id: 'q2',
    title: 'ABCDEF otázka - příklad',
    text: 'Které z těchto měst je hlavním městem Francie?',
    type: 'abcdef',
    answers: {
      abcdef: {
        A: 'Londýn',
        B: 'Berlín',
        C: 'Paříž',
        D: 'Řím',
        E: 'Madrid',
        F: 'Varšava',
        correct: 'C'
      }
    },
    difficulty: 'easy',
    tags: ['geografie', 'hlavní města'],
    timing: {
      questionDuration: 20000,
      answerDuration: 15000
    },
    createdAt: new Date('2026-03-02'),
    updatedAt: new Date('2026-03-02')
  },
  {
    id: 'q3',
    title: 'Bonusová otázka - příklad',
    text: 'Jmenujte alespoň tři řeky protékající Prahou.',
    type: 'bonus',
    answers: {
      bonus: ['Vltava', 'Berounka', 'Botič', 'Rokytka']
    },
    difficulty: 'hard',
    tags: ['geografie', 'praha'],
    timing: {
      questionDuration: 30000,
      answerDuration: 20000
    },
    createdAt: new Date('2026-03-03'),
    updatedAt: new Date('2026-03-03')
  }
];

export const demoTemplates: TemplateConfig[] = [
  {
    id: 't1',
    name: 'Výchozí šablona',
    background: {
      type: 'color',
      color: '#1e293b' // slate-800
    },
    colors: {
      primary: '#3b82f6', // blue-500
      secondary: '#64748b', // slate-500
      correctAnswer: '#ef4444', // red-500
      text: {
        primary: '#ffffff',
        secondary: '#cbd5e1'
      }
    },
    fonts: {
      question: {
        family: 'Inter, sans-serif',
        size: '2.5rem',
        weight: 'bold'
      },
      answer: {
        family: 'Inter, sans-serif',
        size: '2rem',
        weight: '600'
      },
      numbers: {
        family: 'Inter, sans-serif',
        size: '1.5rem',
        weight: '500'
      }
    },
    positions: {
      questionNumber: 'top-right',
      roundNumber: 'bottom-right',
      questionText: 'center-top',
      image: 'below-question',
      answers: {
        simple: 'center-large',
        abcdef: 'grid'
      },
      media: {
        audio: 'below-question',
        video: 'thumbnail-below'
      }
    },
    createdAt: new Date('2026-03-01'),
    updatedAt: new Date('2026-03-01')
  }
];

export const demoQuizzes: Quiz[] = [
  {
    id: 'quiz1',
    title: 'Pivní kvíz - Jaro 2026',
    description: 'Zábavný kvíz o pivu pro jarní večer',
    slug: 'pivni-kviz-jaro-2026',
    rounds: [
      {
        number: 1,
        title: 'Historie piva',
        questions: ['q1', 'q2']
      },
      {
        number: 2,
        title: 'Světové pivní značky',
        questions: ['q3']
      }
    ],
    templateId: 't1',
    settings: {
      autoAdvance: true,
      showQuestionNumbers: true,
      showRoundNumbers: true,
      transitionDuration: 1000,
      bonusRevealDelay: 2000
    },
    status: 'published',
    tags: ['zábava', 'pivo', 'jaro'],
    createdAt: new Date('2026-03-01'),
    updatedAt: new Date('2026-03-05'),
    publishedAt: new Date('2026-03-05'),
    stats: {
      totalPlays: 142,
      averageScore: 78,
      lastPlayed: new Date('2026-03-07')
    }
  },
  {
    id: 'quiz2',
    title: 'Filmový maraton',
    description: 'Znáte slavné filmové citáty a scény?',
    slug: 'filmovy-maraton',
    rounds: [
      {
        number: 1,
        title: 'Oscarové filmy',
        questions: []
      }
    ],
    templateId: 't1',
    settings: {
      autoAdvance: true,
      showQuestionNumbers: true,
      showRoundNumbers: true,
      transitionDuration: 1500,
      bonusRevealDelay: 2500
    },
    status: 'draft',
    tags: ['filmy', 'zábava'],
    createdAt: new Date('2026-03-02'),
    updatedAt: new Date('2026-03-02')
  }
];

// ===================== POMOCNÉ FUNKCE =====================

export function getQuestionTypeLabel(type: QuestionType): string {
  const labels = {
    simple: 'Jednoduchá otázka',
    abcdef: 'ABCDEF otázka',
    bonus: 'Bonusová otázka',
    audio: 'Audio otázka',
    video: 'Video otázka'
  };
  return labels[type];
}

export function getDifficultyLabel(difficulty: 'easy' | 'medium' | 'hard'): string {
  const labels = {
    easy: 'Lehká',
    medium: 'Střední',
    hard: 'Těžká'
  };
  return labels[difficulty];
}

export function getStatusLabel(status: 'draft' | 'published' | 'archived'): string {
  const labels = {
    draft: 'Návrh',
    published: 'Publikováno',
    archived: 'Archivováno'
  };
  return labels[status];
}