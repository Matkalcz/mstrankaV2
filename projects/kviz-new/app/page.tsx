// app/quiz/[id]/page.tsx - Přehrávání kvízu
"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { ManualQuizController, Slide } from "@/components/ManualQuizController"
import { SequenceGenerator, QuizConfig, RoundConfig } from "@/lib/sequence-generator"
import { adaptSlidesForManualController, createDemoManualSlides } from "@/lib/manual-sequence-adapter"
import { ArrowLeft, Home, Settings, Download, Share2, Clock, Users, Maximize2 } from "lucide-react"
import Link from "next/link"
import { TemplateConfig, DEFAULT_TEMPLATE } from "@/types/template"

// Mock data kvízu
const mockQuizConfig: QuizConfig = {
  title: "Hospodský kvíz #1",
  subtitle: "Kvíz o pivech a hospodách",
  author: "Admin",
  
  // Časování
  defaultQuestionDuration: 30000, // 30 sekund
  defaultAnswerDuration: 15000, // 15 sekund
  introDuration: 10000, // 10 sekund
  separatorDuration: 5000, // 5 sekund
  outroDuration: 10000, // 10 sekund
  
  // Průběh
  showIntro: true,
  showSeparators: true,
  showOutro: true,
  autoAdvance: true,
  
  // Kola
  rounds: [
    {
      number: 1,
      name: "Kolo 1 - Lehké otázky",
      questions: [
        {
          id: "q1",
          type: "simple",
          text: "Které pivo se vaří v Plzni?",
          correctAnswer: "Plzeňský Prazdroj",
          category: "Piva",
          difficulty: "easy",
          questionNumber: 1,
          roundNumber: 1
        },
        {
          id: "q2",
          type: "abcdef",
          text: "Kolik stupňů má ležák?",
          options: [
            { label: "A", text: "8°" },
            { label: "B", text: "10°" },
            { label: "C", text: "12°", isCorrect: true },
            { label: "D", text: "14°" }
          ],
          correctAnswer: "Ležák má typicky 12°",
          category: "Piva",
          difficulty: "medium",
          questionNumber: 2,
          roundNumber: 1
        },
        {
          id: "q3",
          type: "bonus",
          text: "Bonusová otázka: Která značka piva má logo s červeným jelenem?",
          correctAnswer: "Jelen",
          bonusAnswers: ["Je", "len"], // Pro postupné odhalování
          category: "Piva",
          difficulty: "hard",
          questionNumber: 3,
          roundNumber: 1
        }
      ],
      showRoundSeparator: true,
      roundSeparatorText: "Konec 1. kola"
    },
    {
      number: 2,
      name: "Kolo 2 - Těžší otázky",
      questions: [
        {
          id: "q4",
          type: "simple",
          text: "Které pivo vaří Budvar?",
          correctAnswer: "Budweiser Budvar",
          category: "Piva",
          difficulty: "medium",
          questionNumber: 1,
          roundNumber: 2
        },
        {
          id: "q5",
          type: "audio",
          text: "Poslechněte si zvuk a poznáte, které pivo se otevírá?",
          correctAnswer: "Kozel",
          mediaUrl: "/audio/beer-open.mp3", // demo URL
          category: "Piva",
          difficulty: "hard",
          questionNumber: 2,
          roundNumber: 2
        }
      ]
    }
  ]
}

// Výchozí šablona
const defaultTemplate: TemplateConfig = {
  id: 'default',
  name: "classic",
  description: "Výchozí šablona pro kvíz",
  background: {
    type: 'color' as const,
    value: "#0f172a",
    overlayColor: 'rgba(0, 0, 0, 0.3)'
  },
  colors: {
    primary: "#3b82f6",
    secondary: "#10b981",
    correct: "#e53e3e",
    text: "#f8fafc",
    answerBg: "rgba(255, 255, 255, 0.05)",
    answerBorder: "rgba(255, 255, 255, 0.1)"
  },
  fonts: {
    question: {
      family: "'Inter', sans-serif",
      size: '2.5rem',
      weight: 'bold'
    },
    answer: {
      family: "'Inter', sans-serif",
      size: '1.5rem',
      weight: 'normal'
    },
    number: {
      family: "'Inter', sans-serif",
      size: '3rem',
      weight: 'bold',
      color: '#3b82f6'
    },
    label: {
      family: "'Inter', sans-serif",
      size: '1rem',
      weight: 'bold'
    }
  },
  layout: {
    questionNumber: {
      position: 'top-right' as const,
      offsetX: '5%',
      offsetY: '5%',
      size: '3rem'
    },
    roundNumber: {
      position: 'bottom-left' as const,
      offsetX: '5%',
      offsetY: '5%',
      size: '2rem'
    },
    questionText: {
      top: '15%',
      left: '10%',
      right: '10%',
      maxWidth: '80%',
      textAlign: 'center' as const
    },
    image: {
      top: '40%',
      left: '20%',
      width: '60%',
      height: 'auto',
      maxHeight: '40vh'
    },
    answers: {
      grid: {
        top: '50%',
        bottom: '15%',
        left: '10%',
        right: '10%',
        columns: 2,
        gap: '1rem'
      },
      single: {
        top: '50%',
        left: '20%',
        right: '20%',
        textAlign: 'center' as const
      },
      bonus: {
        top: '50%',
        left: '20%',
        right: '20%',
        gap: '1rem'
      }
    },
    media: {
      audio: {
        top: '40%',
        left: '30%',
        width: '40%'
      },
      video: {
        thumbnail: {
          top: '40%',
          left: '25%',
          width: '50%',
          height: '225px'
        },
        fullscreen: true
      }
    }
  },
  animations: {
    enabled: true,
    answerReveal: 'highlight' as const,
    bonusReveal: 'sequential' as const,
    transition: 'fade' as const,
    duration: 500
  },
  specialPages: {
    intro: {
      titlePosition: { top: '30%', left: '10%', right: '10%' },
      subtitlePosition: { top: '45%', left: '10%', right: '10%' }
    },
    separator: {
      text: 'ODPOVĚDI',
      style: 'box' as const,
      color: '#3b82f6'
    },
    outro: {
      titlePosition: { top: '40%', left: '10%', right: '10%' }
    }
  }
}

export default function QuizPlayerPage() {
  const params = useParams()
  const quizId = params.id as string
  const [slides, setSlides] = useState<any[]>([]) // Použijeme any pro kompatibilitu
  const [loading, setLoading] = useState(true)
  const [fullscreen, setFullscreen] = useState(false)
  const [currentTime, setCurrentTime] = useState("00:00")
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [quizConfig, setQuizConfig] = useState<QuizConfig>(mockQuizConfig)

  useEffect(() => {
    // TODO: Načíst skutečnou konfiguraci kvízu z API podle quizId
    setTimeout(() => {
      // Pro demo použijeme demo slid(y)
      const demoSlides = createDemoManualSlides()
      setSlides(demoSlides)
      setTotalQuestions(demoSlides.filter(s => s.type === 'question').length)
      setLoading(false)
      
      // Pro produkci bychom použili:
      // const sequence = SequenceGenerator.generateSequence(mockQuizConfig)
      // const adaptedSlides = adaptSlidesForManualController(sequence.slides)
      // setSlides(adaptedSlides)
      // setTotalQuestions(sequence.questionCount)
    }, 800)
  }, [quizId])

  const toggleFullscreen = () => {
    if (!fullscreen) {
      const elem = document.documentElement
      if (elem.requestFullscreen) {
        elem.requestFullscreen()
      }
      setFullscreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
      setFullscreen(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-300 text-lg">Načítání kvízu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`${fullscreen ? 'fixed inset-0' : 'min-h-screen'} bg-gray-900`}>
      {/* Hlavička (ne ve fullscreen) */}
      {!fullscreen && (
        <header className="bg-gray-800 border-b border-gray-700">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href="/admin/quizzes"
                  className="flex items-center gap-2 text-gray-300 hover:text-white"
                >
                  <ArrowLeft className="h-5 w-5" />
                  Zpět na admin
                </Link>
                <div className="h-6 w-px bg-gray-600"></div>
                <div>
                  <h1 className="text-xl font-bold text-white">{quizConfig.title}</h1>
                  <p className="text-gray-400 text-sm">{quizConfig.subtitle}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-300">{currentTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-300">{totalQuestions} otázek</span>
                  </div>
                  <button
                    onClick={toggleFullscreen}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                  >
                    <Maximize2 className="h-4 w-4" />
                    Celá obrazovka
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Hlavní obsah */}
      <main className={`${fullscreen ? 'h-screen' : 'container mx-auto px-6 py-8'}`}>
        <div className={`${fullscreen ? 'h-full' : ''}`}>
          <ManualQuizController
            slides={slides}
            template={DEFAULT_TEMPLATE}
            showControls={true}
            className={fullscreen ? "h-full" : ""}
            onSlideChange={(index, slide) => {
              console.log("Slide changed:", index, slide.type)
            }}
            onQuizEnd={() => {
              alert("Kvíz dokončen!")
            }}
          />
        </div>
      </main>

      {/* Ovládací panel dole (ne ve fullscreen) */}
      {!fullscreen && (
        <footer className="bg-gray-800 border-t border-gray-700">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                  <Settings className="h-4 w-4" />
                  Nastavení
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg">
                  <Download className="h-4 w-4" />
                  Exportovat
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg">
                  <Share2 className="h-4 w-4" />
                  Sdílet
                </button>
              </div>
              
              <div className="text-sm text-gray-400">
                Kvíz ID: <code className="bg-gray-900 px-2 py-1 rounded">{quizId}</code>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}