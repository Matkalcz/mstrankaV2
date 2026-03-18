// components/UniversalQuizRenderer.tsx - Renderovací engine pro kvízy
"use client"

import { useState, useEffect, useRef } from "react"
import { Play, Pause, Volume2, Video, Award, ChevronRight, Clock, Check, X } from "lucide-react"

export interface QuestionData {
  id: string
  type: "simple" | "abcd" | "abcdef" | "bonus" | "audio" | "video"
  text: string
  answers: string[]
  correctAnswer: number | number[]
  points: number
  mediaUrl?: string
  category?: string
}

export interface TemplateConfig {
  backgroundColor: string
  textColor: string
  primaryColor: string
  fontFamily: string
  borderRadius: string
  showAnimations: boolean
}

interface UniversalQuizRendererProps {
  question: QuestionData
  template: TemplateConfig
  showAnswer?: boolean
  onNext?: () => void
  onPrev?: () => void
  onAnswerReveal?: (isCorrect: boolean) => void
}

export default function UniversalQuizRenderer({
  question,
  template,
  showAnswer = false,
  onNext,
  onPrev,
  onAnswerReveal
}: UniversalQuizRendererProps) {
  const [revealedAnswers, setRevealedAnswers] = useState<number[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const timerRef = useRef<number | undefined>(undefined)

  // Reset při změně otázky
  useEffect(() => {
    setRevealedAnswers([])
    setIsPlaying(false)
    setCurrentTime(0)
    if (timerRef.current) clearInterval(timerRef.current)
  }, [question.id, question.type])

  // Odhalení bonusových odpovědí postupně
  useEffect(() => {
    if (question.type === "bonus" && showAnswer && revealedAnswers.length < question.answers.length) {
      const interval = setInterval(() => {
        setRevealedAnswers(prev => {
          const next = [...prev, prev.length]
          if (next.length === question.answers.length) {
            clearInterval(interval)
          }
          return next
        })
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [question.type, showAnswer, question.answers.length, revealedAnswers.length])

  // Timer pro audio/video
  useEffect(() => {
    if (isPlaying && (question.type === "audio" || question.type === "video")) {
      timerRef.current = window.setInterval(() => {
        setCurrentTime(prev => {
          const media = question.type === "audio" ? audioRef.current : videoRef.current
          return media?.currentTime || prev + 0.1
        })
      }, 100)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPlaying, question.type])

  const getTypeIcon = () => {
    switch (question.type) {
      case "simple": return <Check className="h-5 w-5" />
      case "abcd": case "abcdef": return <ChevronRight className="h-5 w-5" />
      case "bonus": return <Award className="h-5 w-5" />
      case "audio": return <Volume2 className="h-5 w-5" />
      case "video": return <Video className="h-5 w-5" />
    }
  }

  const getTypeLabel = () => {
    switch (question.type) {
      case "simple": return "Otázka"
      case "abcd": return "ABCD otázka"
      case "abcdef": return "AB otázka"
      case "bonus": return "Bonusová otázka"
      case "audio": return "Audio otázka"
      case "video": return "Video otázka"
    }
  }

  const handleMediaToggle = () => {
    if (question.type === "audio" && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    } else if (question.type === "video" && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const renderQuestionContent = () => {
    switch (question.type) {
      case "simple":
        return (
          <div className="space-y-6">
            <div className="text-3xl font-bold mb-8">{question.text}</div>
            {showAnswer && (
              <div className="animate-fade-in">
                <div className="text-2xl font-bold text-green-600 mb-4">Správná odpověď:</div>
                <div className="text-4xl font-bold text-red-600">
                  {question.answers[question.correctAnswer as number]}
                </div>
              </div>
            )}
          </div>
        )

      case "abcd":
      case "abcdef":
        return (
          <div className="space-y-6">
            <div className="text-3xl font-bold mb-8">{question.text}</div>
            <div className="grid grid-cols-2 gap-4">
              {question.answers.map((answer, index) => {
                const isCorrect = Array.isArray(question.correctAnswer) 
                  ? question.correctAnswer.includes(index)
                  : question.correctAnswer === index
                const isSelected = showAnswer && isCorrect
                
                return (
                  <div
                    key={index}
                    className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                      isSelected
                        ? "bg-green-100 border-green-500 scale-105"
                        : "bg-white border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center text-lg font-bold ${
                        isSelected ? "bg-green-500 text-white" : "bg-gray-100 text-gray-800"
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <div className="text-xl font-medium">{answer}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )

      case "bonus":
        return (
          <div className="space-y-6">
            <div className="text-3xl font-bold mb-8">{question.text}</div>
            <div className="space-y-4">
              {question.answers.map((answer, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border transition-all duration-500 ${
                    revealedAnswers.includes(index)
                      ? "bg-yellow-50 border-yellow-400 opacity-100 translate-x-0"
                      : "bg-gray-100 border-gray-300 opacity-0 -translate-x-4"
                  }`}
                  style={{
                    transitionDelay: `${index * 100}ms`
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-yellow-100 text-yellow-800 flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div className="text-xl">{answer}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case "audio":
        return (
          <div className="space-y-8">
            <div className="text-3xl font-bold mb-4">{question.text}</div>
            
            <div className="bg-gray-900 rounded-2xl p-8">
              <div className="flex flex-col items-center justify-center space-y-6">
                <div className="h-32 w-32 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Volume2 className="h-16 w-16 text-blue-400" />
                </div>
                
                <div className="w-full max-w-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">{formatTime(currentTime)}</span>
                    <span className="text-gray-400">1:30</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all duration-300"
                      style={{ width: `${(currentTime / 90) * 100}%` }}
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <button
                    onClick={handleMediaToggle}
                    className="h-16 w-16 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="h-8 w-8" />
                    ) : (
                      <Play className="h-8 w-8 ml-1" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {showAnswer && (
              <div className="animate-fade-in mt-8">
                <div className="text-2xl font-bold text-green-600 mb-4">Správná odpověď:</div>
                <div className="text-3xl font-bold">
                  {question.answers[question.correctAnswer as number]}
                </div>
              </div>
            )}
          </div>
        )

      case "video":
        return (
          <div className="space-y-6">
            <div className="text-3xl font-bold mb-4">{question.text}</div>
            
            <div className="bg-black rounded-2xl overflow-hidden">
              <div className="aspect-video relative">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
                  <Video className="h-24 w-24 text-gray-600" />
                  <div className="absolute bottom-8 left-8 text-white">
                    <div className="text-lg">Video ukázka</div>
                    <div className="text-gray-400">Kliknutím přehrajete</div>
                  </div>
                </div>
              </div>
            </div>

            {showAnswer && (
              <div className="animate-fade-in mt-8">
                <div className="text-2xl font-bold text-green-600 mb-4">Správná odpověď:</div>
                <div className="text-3xl font-bold">
                  {question.answers[question.correctAnswer as number]}
                </div>
              </div>
            )}
          </div>
        )
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Audio element pro audio otázky
  const renderMediaElements = () => {
    if (question.type === "audio" && question.mediaUrl) {
      return (
        <audio
          ref={audioRef}
          src={question.mediaUrl}
          onEnded={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          className="hidden"
        />
      )
    }
    if (question.type === "video" && question.mediaUrl) {
      return (
        <video
          ref={videoRef}
          src={question.mediaUrl}
          className="hidden"
          controls={false}
        />
      )
    }
    return null
  }

  return (
    <div 
      className="min-h-screen flex flex-col p-8 transition-all duration-300"
      style={{
        backgroundColor: template.backgroundColor,
        color: template.textColor,
        fontFamily: template.fontFamily,
        borderRadius: template.borderRadius
      }}
    >
      {renderMediaElements()}
      
      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <div 
            className="p-3 rounded-lg"
            style={{ backgroundColor: template.primaryColor, color: '#ffffff' }}
          >
            {getTypeIcon()}
          </div>
          <div>
            <div className="text-lg font-bold">{getTypeLabel()}</div>
            <div className="text-gray-500">{question.category || "Obecná kategorie"}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-lg">
            <Award className="h-5 w-5" />
            <span className="font-bold">{question.points} bodů</span>
          </div>
          
          {question.type === "audio" || question.type === "video" ? (
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span>{formatTime(currentTime)}</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="max-w-6xl mx-auto w-full">
          {renderQuestionContent()}
        </div>
      </div>

      {/* Footer controls */}
      <div className="mt-12 pt-8 border-t border-gray-300/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onPrev && (
              <button
                onClick={onPrev}
                className="px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-100/20 transition-colors"
                style={{ color: template.textColor }}
              >
                Předchozí
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {question.type === "audio" || question.type === "video" ? (
              <button
                onClick={handleMediaToggle}
                className="px-6 py-3 rounded-lg flex items-center gap-2"
                style={{ 
                  backgroundColor: template.primaryColor,
                  color: '#ffffff'
                }}
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-5 w-5" />
                    Pozastavit
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5" />
                    Přehrát
                  </>
                )}
              </button>
            ) : null}
            
            {onNext && (
              <button
                onClick={onNext}
                className="px-6 py-3 rounded-lg font-bold transition-all hover:scale-105"
                style={{ 
                  backgroundColor: template.primaryColor,
                  color: '#ffffff'
                }}
              >
                Další otázka
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="mt-8">
        <div className="h-2 bg-gray-300/30 rounded-full overflow-hidden">
          <div 
            className="h-full transition-all duration-500"
            style={{ 
              backgroundColor: template.primaryColor,
              width: showAnswer ? "100%" : "50%"
            }}
          />
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <span>Otázka</span>
          <span>{showAnswer ? "Odpověď" : "Otázka zobrazena"}</span>
        </div>
      </div>
    </div>
  )
}