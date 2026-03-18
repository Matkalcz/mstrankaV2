// app/demo/page.tsx - Demo stránka s testovacími otázkami
"use client"

import { useState, useEffect } from "react"
import UniversalQuizRenderer from "@/components/UniversalQuizRenderer"
import { Play, Pause, SkipBack, SkipForward, Settings, Palette, Zap, Volume2, Video, Award } from "lucide-react"

type QuestionType = "simple" | "abcd" | "abcdef" | "bonus" | "audio" | "video"

interface Question {
  id: string
  type: QuestionType
  text: string
  answers: string[]
  correctAnswer: number | number[]
  points: number
  category: string
  description: string
}

const demoQuestions: Question[] = [
  {
    id: "1",
    type: "simple",
    text: "Které pivo vaří pivovar Pilsner Urquell?",
    answers: ["Pilsner Urquell"],
    correctAnswer: 0,
    points: 1,
    category: "Piva",
    description: "Jednoduchá otázka s jednou správnou odpovědí"
  },
  {
    id: "2",
    type: "abcd",
    text: "Vyberte správné české pivo:",
    answers: ["Pilsner Urquell", "Budweiser Budvar", "Staropramen", "Kozel"],
    correctAnswer: 0,
    points: 2,
    category: "Piva",
    description: "Výběr ze 4 možností (ABCD)"
  },
  {
    id: "3",
    type: "abcdef",
    text: "Které z těchto piv jsou česká?",
    answers: ["Pilsner Urquell", "Budweiser Budvar", "Staropramen", "Kozel", "Guinness", "Heineken"],
    correctAnswer: [0, 1, 2, 3],
    points: 3,
    category: "Piva",
    description: "Výběr z 6 možností (ABCDEF) - více správných odpovědí"
  },
  {
    id: "4",
    type: "bonus",
    text: "Bonusová otázka: Který rok byl založen Budvar?",
    answers: ["1895", "Budějovický Budvar", "České Budějovice", "Státní podnik"],
    correctAnswer: 0,
    points: 5,
    category: "Historie",
    description: "Postupné odhalování informací"
  },
  {
    id: "5",
    type: "audio",
    text: "Poslechněte si zvuk a určete pivo:",
    answers: ["Pilsner Urquell", "Budweiser Budvar", "Staropramen", "Kozel"],
    correctAnswer: 1,
    points: 4,
    category: "Zvuky",
    description: "Audio otázka s přehráváním zvuku"
  },
  {
    id: "6",
    type: "video",
    text: "Sledujte video a odpovězte na otázku:",
    answers: ["Plzeň", "České Budějovice", "Praha", "Brno"],
    correctAnswer: 0,
    points: 4,
    category: "Videa",
    description: "Video otázka s ukázkou"
  }
]

const templatePresets = [
  {
    id: "blue",
    name: "Modrý gradient",
    backgroundColor: "linear-gradient(135deg, #1e3a8a, #3b82f6)",
    textColor: "#ffffff",
    primaryColor: "#60a5fa",
    fontFamily: "Inter, sans-serif",
    borderRadius: "1rem",
    showAnimations: true
  },
  {
    id: "dark",
    name: "Tmavý profesionální",
    backgroundColor: "#111827",
    textColor: "#f9fafb",
    primaryColor: "#8b5cf6",
    fontFamily: "Roboto, sans-serif",
    borderRadius: "0.5rem",
    showAnimations: true
  },
  {
    id: "green",
    name: "Zelená příroda",
    backgroundColor: "linear-gradient(135deg, #065f46, #10b981)",
    textColor: "#f0fdf4",
    primaryColor: "#34d399",
    fontFamily: "Poppins, sans-serif",
    borderRadius: "2rem",
    showAnimations: true
  },
  {
    id: "simple",
    name: "Jednoduchý bílý",
    backgroundColor: "#ffffff",
    textColor: "#1f2937",
    primaryColor: "#3b82f6",
    fontFamily: "Arial, sans-serif",
    borderRadius: "0.25rem",
    showAnimations: false
  }
]

export default function DemoPage() {
  const [mode, setMode] = useState<'questions' | 'separator' | 'answers'>('questions')
  const [currentSequence, setCurrentSequence] = useState<0 | 1>(0) // 0 = first sequence, 1 = second sequence
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedTemplate, setSelectedTemplate] = useState(templatePresets[0])

  // Define sequences: first 3 questions in sequence 0, next 3 in sequence 1
  const sequences = [
    [0, 1, 2], // First sequence: questions 1-3
    [3, 4, 5], // Second sequence: questions 4-6
  ]

  const currentSequenceQuestions = sequences[currentSequence]
  const currentGlobalQuestionIndex = currentSequenceQuestions[currentQuestionIndex]
  const currentQuestion = demoQuestions[currentGlobalQuestionIndex]
  const isFirstQuestion = currentQuestionIndex === 0
  const isLastQuestionInSequence = currentQuestionIndex === currentSequenceQuestions.length - 1
  const isLastSequence = currentSequence === 1
  const showAnswer = mode === 'answers'

  const handleNext = () => {
    if (mode === 'answers') {
      // In answer mode, go to next question with answer
      if (!isLastQuestionInSequence) {
        setCurrentQuestionIndex(prev => prev + 1)
      } else {
        // If last question in answer mode in current sequence
        if (!isLastSequence) {
          // Move to next sequence's questions mode
          setCurrentSequence(1)
          setCurrentQuestionIndex(0)
          setMode('questions')
        } else {
          // If last sequence, cycle back to first sequence's questions mode
          setCurrentSequence(0)
          setCurrentQuestionIndex(0)
          setMode('questions')
        }
      }
    } else if (mode === 'questions') {
      // In question mode, go to next question without answer
      if (!isLastQuestionInSequence) {
        setCurrentQuestionIndex(prev => prev + 1)
      } else {
        // If last question in question mode, go to separator
        setMode('separator')
      }
    } else if (mode === 'separator') {
      // If user clicks separator, move to answers mode for current sequence
      setMode('answers')
      setCurrentQuestionIndex(0) // Start from first question in answer mode for this sequence
    }
  }

  const handlePrev = () => {
    if (mode === 'separator') {
      // Go back to last question in questions mode
      setMode('questions')
      setCurrentQuestionIndex(currentSequenceQuestions.length - 1)
      return
    }
    
    if (mode === 'answers') {
      // In answer mode, go to previous question with answer
      if (currentQuestionIndex > 0) {
        setCurrentQuestionIndex(prev => prev - 1)
      } else {
        // If first question in answer mode, go back to separator
        setMode('separator')
      }
    } else if (mode === 'questions') {
      // In question mode, go to previous question without answer
      if (currentQuestionIndex > 0) {
        setCurrentQuestionIndex(prev => prev - 1)
      } else if (currentSequence > 0) {
        // If first question in sequence and not first sequence, go to previous sequence's separator
        setCurrentSequence(0)
        setCurrentQuestionIndex(sequences[0].length - 1)
        setMode('separator')
      }
    }
  }

  const handleTemplateChange = (template: typeof templatePresets[0]) => {
    setSelectedTemplate(template)
  }

  const handleQuestionClick = (globalIndex: number) => {
    // Find which sequence contains this question
    for (let seqIndex = 0; seqIndex < sequences.length; seqIndex++) {
      const seq = sequences[seqIndex]
      const questionIndexInSeq = seq.indexOf(globalIndex)
      if (questionIndexInSeq !== -1) {
        setCurrentSequence(seqIndex as 0 | 1)
        setCurrentQuestionIndex(questionIndexInSeq)
        setMode('questions')
        return
      }
    }
    // If not found (shouldn't happen), default to first sequence
    setCurrentSequence(0)
    setCurrentQuestionIndex(0)
    setMode('questions')
  }

  const getTypeIcon = (type: QuestionType) => {
    switch (type) {
      case "simple": return <Zap className="h-4 w-4" />
      case "abcd": case "abcdef": return <span className="font-bold">A-D</span>
      case "bonus": return <Award className="h-4 w-4" />
      case "audio": return <Volume2 className="h-4 w-4" />
      case "video": return <Video className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Control panel */}
      <div className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-b z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Demo kvízového rendereru</h1>
              <p className="text-gray-600">Ukázka všech typů otázek a funkcí</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">


              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg">
                  <Palette className="h-4 w-4" />
                  Šablony
                </button>
                
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  {templatePresets.map(template => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateChange(template)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between"
                    >
                      <span>{template.name}</span>
                      {selectedTemplate.id === template.id && (
                        <div className="h-3 w-3 rounded-full bg-blue-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg">
                <Settings className="h-4 w-4" />
                Nastavení
              </button>
            </div>
          </div>

          {/* Progress and question selector */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">
                <div className="mb-1">
                  Sekvence {currentSequence + 1}, Otázka {currentQuestionIndex + 1} z {currentSequenceQuestions.length}
                  <span className="ml-2 text-gray-500">
                    (celkem {demoQuestions.length} otázek)
                  </span>
                </div>
                <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  mode === 'questions' ? 'bg-blue-100 text-blue-800' :
                  mode === 'separator' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {mode === 'questions' ? '❓ Otázky bez odpovědí' :
                   mode === 'separator' ? '⏸️ Oddělovač - klikněte pro pokračování' :
                   '✅ Otázky s odpověďmi'}
                </div>
              </div>
              <div className="text-sm font-medium text-gray-900">
                {currentQuestion.category} • {currentQuestion.points} bodů
              </div>
            </div>

            <div className="flex flex-col gap-3 mb-4">
              {/* Sequence indicator */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Sekvence {currentSequence + 1} z {sequences.length}
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {mode === 'questions' ? '❓ Otázky bez odpovědí' :
                   mode === 'separator' ? '⏸️ Oddělovač' :
                   '✅ Otázky s odpověďmi'}
                </div>
              </div>
              
              {/* Question progress within sequence */}
              <div className="flex items-center gap-2">
                {currentSequenceQuestions.map((questionIdx, index) => (
                  <button
                    key={demoQuestions[questionIdx].id}
                    onClick={() => {
                      // Only allow navigation within current mode
                      if (mode !== 'separator') {
                        setCurrentQuestionIndex(index)
                      }
                    }}
                    className={`flex-1 h-3 rounded-full transition-all ${
                      index === currentQuestionIndex
                        ? mode === 'answers'
                          ? 'bg-green-500'
                          : mode === 'separator'
                          ? 'bg-yellow-500'
                          : 'bg-blue-600'
                        : index < currentQuestionIndex
                        ? mode === 'answers'
                          ? 'bg-green-300'
                          : 'bg-blue-300'
                        : 'bg-gray-300'
                    } ${mode === 'separator' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    title={`${demoQuestions[questionIdx].type}: ${demoQuestions[questionIdx].description}`}
                    disabled={mode === 'separator'}
                  />
                ))}
              </div>
              
              {/* All questions indicator (small dots below) */}
              <div className="flex items-center gap-1 justify-center">
                {demoQuestions.map((q, index) => (
                  <div
                    key={q.id}
                    className={`h-1 w-1 rounded-full ${
                      currentSequenceQuestions.includes(index)
                        ? mode === 'answers'
                          ? 'bg-green-400'
                          : 'bg-blue-400'
                        : 'bg-gray-300'
                    }`}
                    title={`${q.type}: ${q.description}`}
                  />
                ))}
              </div>
            </div>
            
            {/* Phase indicator */}


            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={handlePrev}
                  disabled={mode === 'questions' && isFirstQuestion && currentSequence === 0}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <SkipBack className="h-4 w-4" />
                  Předchozí
                </button>

                <div className="flex items-center gap-3">
                  {getTypeIcon(currentQuestion.type)}
                  <span className="font-medium">{currentQuestion.description}</span>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    mode === 'questions' ? 'bg-blue-100 text-blue-800' :
                    mode === 'separator' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {mode === 'questions' ? 'Otázka bez odpovědi' :
                     mode === 'separator' ? 'Oddělovač' :
                     'Otázka s odpovědí'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={handleNext}
                  disabled={false}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  {mode === 'separator' ? 'Pokračovat na odpovědi' : 
                   mode === 'answers' && isLastQuestionInSequence ? (isLastSequence ? 'Začít znovu' : 'Další sekvence') :
                   mode === 'answers' ? 'Další odpověď' :
                   isLastQuestionInSequence ? 'Přejít na oddělovač' : 'Další otázka'}
                  <SkipForward className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main renderer */}
      <div className="pt-48">
        {mode === 'separator' ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-2xl">
              <div className="text-8xl font-bold text-gray-800 mb-6">---</div>
              <div className="text-2xl text-gray-600">Oddělovač mezi sekvencemi</div>
              <div className="text-lg text-gray-500 mt-4 mb-8">
                {currentSequence === 0 
                  ? 'První sekvence otázek bez odpovědí byla dokončena. Klikněte pro pokračování na zobrazení odpovědí.'
                  : 'Druhá sekvence otázek bez odpovědí byla dokončena. Klikněte pro pokračování na zobrazení odpovědí.'}
              </div>
              
              <button
                onClick={handleNext}
                className="px-8 py-4 bg-blue-600 text-white text-xl font-bold rounded-xl hover:bg-blue-700 transition-colors mb-8"
              >
                Pokračovat na odpovědi →
              </button>

              <div className="bg-gray-100 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-3">Průběh kvízu:</h3>
                <div className="space-y-3 text-left">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${currentSequence === 0 ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>
                      ✓
                    </div>
                    <div>
                      <div className="font-medium">Sekvence 1: Otázky bez odpovědí</div>
                      <div className="text-sm text-gray-600">{sequences[0].length} otázek</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${currentSequence === 0 ? 'bg-yellow-500 text-white' : 'bg-green-500 text-white'}`}>
                      {currentSequence === 0 ? '→' : '✓'}
                    </div>
                    <div>
                      <div className="font-medium">Oddělovač</div>
                      <div className="text-sm text-gray-600">Klikněte pro přechod na zobrazení odpovědí</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${currentSequence === 0 ? 'bg-gray-300' : 'bg-yellow-500 text-white'}`}>
                      {currentSequence === 0 ? '2' : '→'}
                    </div>
                    <div>
                      <div className="font-medium">Sekvence 1: Otázky s odpověďmi</div>
                      <div className="text-sm text-gray-600">{sequences[0].length} otázek se správnými odpověďmi</div>
                    </div>
                  </div>
                  {sequences.length > 1 && (
                    <>
                      <div className="border-l-2 border-gray-300 h-6 ml-4" />
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full flex items-center justify-center bg-gray-300">
                          3
                        </div>
                        <div>
                          <div className="font-medium">Sekvence 2: Otázky bez odpovědí</div>
                          <div className="text-sm text-gray-600">{sequences[1].length} otázek</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <UniversalQuizRenderer
            question={{
              id: currentQuestion.id,
              type: currentQuestion.type,
              text: currentQuestion.text,
              answers: currentQuestion.answers,
              correctAnswer: currentQuestion.correctAnswer,
              points: currentQuestion.points,
              category: currentQuestion.category
            }}
            template={{
              backgroundColor: selectedTemplate.backgroundColor,
              textColor: selectedTemplate.textColor,
              primaryColor: selectedTemplate.primaryColor,
              fontFamily: selectedTemplate.fontFamily,
              borderRadius: selectedTemplate.borderRadius,
              showAnimations: selectedTemplate.showAnimations
            }}
            showAnswer={mode === 'answers'}
            onNext={handleNext}
            onPrev={handlePrev}
            onAnswerReveal={(isCorrect) => {
              console.log(`Odpověď byla ${isCorrect ? 'správná' : 'špatná'}`)
            }}
          />
        )}
      </div>

      {/* Question type grid */}
      <div className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Všechny typy otázek</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {demoQuestions.map((question, index) => (
              <div
                key={question.id}
                className={`p-6 border-2 rounded-xl cursor-pointer transition-all hover:shadow-lg ${
                  currentGlobalQuestionIndex === index
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => {
                  handleQuestionClick(index)
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      currentGlobalQuestionIndex === index ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {getTypeIcon(question.type)}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{question.type.toUpperCase()}</div>
                      <div className="text-sm text-gray-600">{question.category}</div>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium">
                    {question.points} bodů
                  </div>
                </div>

                <div className="text-gray-900 font-medium mb-3">{question.text}</div>
                <div className="text-sm text-gray-600">{question.description}</div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {question.answers.slice(0, 3).map((answer, i) => (
                    <span key={i} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                      {answer}
                    </span>
                  ))}
                  {question.answers.length > 3 && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                      +{question.answers.length - 3} více
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}