// components/SimpleQuizPlayer.tsx - Jednoduchý funkční přehrávač kvízů
"use client"

import { useState, useEffect, useCallback } from "react"
import QuizRendererAdapter from "./QuizRendererAdapter"
import { TemplateConfig } from "@/types/template"
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Maximize2, Volume2 } from "lucide-react"

// Definice typů pro kompatibilitu
export type QuestionData = {
  id: string
  type: "simple" | "abcd" | "abcdef" | "bonus" | "audio" | "video"
  text: string
  answers: string[]
  correctAnswer: number | number[]
  points: number
  mediaUrl?: string
  category?: string
  bonusAnswers?: string[] // Pro bonusové otázky
  questionNumber?: number // Číslo otázky v rámci kola
  difficulty?: 'easy' | 'medium' | 'hard' // Obtížnost
  roundNumber?: number // Číslo kola
}

export type QuizState = 'question' | 'answers' | 'revealed' | 'media' | 'bonus_step'

export type Slide = {
  id: string
  type: 'question' | 'separator' | 'intro' | 'outro'
  question?: QuestionData
  duration: number // ms
  autoAdvance: boolean
}

interface SimpleQuizPlayerProps {
  slides: Slide[]
  template: TemplateConfig
  autoPlay?: boolean
  showControls?: boolean
  className?: string
  onSlideChange?: (index: number) => void
  onQuizEnd?: () => void
}

export function SimpleQuizPlayer({
  slides,
  template,
  autoPlay = false,
  showControls = true,
  className = "",
  onSlideChange,
  onQuizEnd
}: SimpleQuizPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [quizState, setQuizState] = useState<QuizState>('question')
  const [bonusStep, setBonusStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(0)
  
  const currentSlide = slides[currentIndex]
  const currentQuestion = currentSlide.question
  
  // Reset stavu při změně slidu
  useEffect(() => {
    setQuizState('question')
    setBonusStep(0)
    setProgress(0)
    setTimeRemaining(currentSlide.duration)
    onSlideChange?.(currentIndex)
  }, [currentIndex, currentSlide.duration, onSlideChange])
  
  // Timer pro automatické přehrávání
  useEffect(() => {
    if (!isPlaying || !currentSlide.autoAdvance) return
    
    const startTime = Date.now()
    const totalDuration = currentSlide.duration
    
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime
      const newProgress = Math.min(elapsed / totalDuration, 1)
      const newTimeRemaining = Math.max(totalDuration - elapsed, 0)
      
      setProgress(newProgress)
      setTimeRemaining(newTimeRemaining)
      
      // Automatický přechod na další slide
      if (elapsed >= totalDuration) {
        if (currentIndex < slides.length - 1) {
          nextSlide()
        } else {
          setIsPlaying(false)
          onQuizEnd?.()
        }
      }
    }, 100)
    
    return () => clearInterval(timer)
  }, [isPlaying, currentSlide.autoAdvance, currentSlide.duration, currentIndex, slides.length, onQuizEnd])
  
  // Klávesové zkratky
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorovat klávesy při focusu v inputu/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }
      
      switch (e.key) {
        case ' ':
        case 'Spacebar':
          e.preventDefault()
          setIsPlaying(prev => !prev)
          break
          
        case 'ArrowRight':
        case 'Enter':
          e.preventDefault()
          nextSlide()
          break
          
        case 'ArrowLeft':
          e.preventDefault()
          prevSlide()
          break
          
        case 'Escape':
          e.preventDefault()
          setIsPlaying(false)
          break
          
        case 'r':
        case 'R':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            setCurrentIndex(0)
            setQuizState('question')
            setBonusStep(0)
          }
          break
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
  
  const nextSlide = useCallback(() => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      setIsPlaying(false)
      onQuizEnd?.()
    }
  }, [currentIndex, slides.length, onQuizEnd])
  
  const prevSlide = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }, [currentIndex])
  
  const togglePlay = () => {
    setIsPlaying(prev => !prev)
  }
  
  const restartQuiz = () => {
    setCurrentIndex(0)
    setQuizState('question')
    setBonusStep(0)
    setIsPlaying(autoPlay)
  }
  
  const handleStateChange = (newState: QuizState) => {
    setQuizState(newState)
  }
  

  
  const formatTime = (ms: number) => {
    const seconds = Math.ceil(ms / 1000)
    return `${seconds}s`
  }
  
  // Render podle typu slidu
  const renderSlide = () => {
    switch (currentSlide.type) {
      case 'intro':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700 text-white p-8">
            <h1 className="text-5xl font-bold mb-4 text-center">Kvíz začíná!</h1>
            <p className="text-xl opacity-90 text-center mb-8">
              Připravte se na {slides.filter(s => s.type === 'question').length} otázek
            </p>
            <div className="text-6xl mb-6">🎯</div>
            <button
              onClick={nextSlide}
              className="px-8 py-3 bg-white text-blue-700 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors"
            >
              Začít kvíz
            </button>
          </div>
        )
        
      case 'separator':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-500 to-orange-600 text-white p-8">
            <h2 className="text-4xl font-bold mb-4">Připravte se na odpověď!</h2>
            <p className="text-xl opacity-90 text-center mb-8">
              Další otázka za chvíli...
            </p>
            <div className="text-6xl mb-6">⏳</div>
            {currentSlide.autoAdvance && (
              <div className="text-lg">
                Automatický přechod za {formatTime(timeRemaining)}
              </div>
            )}
          </div>
        )
        
      case 'outro':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-green-600 to-emerald-700 text-white p-8">
            <h1 className="text-5xl font-bold mb-4 text-center">Kvíz ukončen!</h1>
            <p className="text-xl opacity-90 text-center mb-8">
              Děkujeme za účast
            </p>
            <div className="text-6xl mb-6">🏆</div>
            <button
              onClick={restartQuiz}
              className="px-8 py-3 bg-white text-green-700 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors"
            >
              Spustit znovu
            </button>
          </div>
        )
        
      case 'question':
        if (!currentQuestion) return null
        
        // Určit, zda zobrazit odpověď na základě stavu
        const showAnswer = quizState === 'revealed' || quizState === 'bonus_step'
        
        return (
          <QuizRendererAdapter
            question={currentQuestion}
            template={template}
            showAnswer={showAnswer}
            onNext={nextSlide}
            onPrev={prevSlide}
            onAnswerReveal={(isCorrect) => {
              console.log(`Odpověď je ${isCorrect ? 'správná' : 'špatná'}`)
            }}
          />
        )
        
      default:
        return null
    }
  }
  
  return (
    <div className={`flex flex-col ${className}`}>
      {/* Hlavní obsah */}
      <div className="flex-1 relative overflow-hidden rounded-xl border border-gray-800 bg-black">
        {renderSlide()}
        
        {/* Overlay s informacemi */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <div className="bg-black/70 text-white px-3 py-1.5 rounded-lg text-sm">
            Slide {currentIndex + 1} / {slides.length}
          </div>
          
          {currentSlide.type === 'question' && currentQuestion && (
            <div className="bg-black/70 text-white px-3 py-1.5 rounded-lg text-sm">
              {currentQuestion.category || 'Obecné'} • 
              {currentQuestion.difficulty === 'easy' ? ' Lehký' :
               currentQuestion.difficulty === 'medium' ? ' Střední' : ' Těžký'}
            </div>
          )}
        </div>
        
        {/* Progress bar */}
        {currentSlide.autoAdvance && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
            <div 
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        )}
      </div>
      
      {/* Ovládací panel */}
      {showControls && (
        <div className="mt-4 bg-gray-900 rounded-xl p-4 border border-gray-800">
          <div className="flex items-center justify-between">
            {/* Levý panel - základní ovládání */}
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className={`p-3 rounded-xl ${
                  isPlaying 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-green-600 hover:bg-green-700'
                } text-white transition-colors`}
                title={isPlaying ? "Pozastavit" : "Přehrát"}
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>
              
              <button
                onClick={prevSlide}
                disabled={currentIndex === 0}
                className="p-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Předchozí slide"
              >
                <SkipBack size={20} />
              </button>
              
              <button
                onClick={nextSlide}
                disabled={currentIndex === slides.length - 1}
                className="p-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Další slide"
              >
                <SkipForward size={20} />
              </button>
              
              <button
                onClick={restartQuiz}
                className="p-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white transition-colors"
                title="Restartovat kvíz"
              >
                <RotateCcw size={20} />
              </button>
            </div>
            
            {/* Střed - informace */}
            <div className="text-center text-white">
              <div className="text-sm text-gray-400">
                {currentSlide.type === 'intro' && 'Úvodní slide'}
                {currentSlide.type === 'question' && `Otázka ${currentQuestion?.questionNumber || ''}`}
                {currentSlide.type === 'separator' && 'Oddělovač'}
                {currentSlide.type === 'outro' && 'Závěrečný slide'}
              </div>
              <div className="font-medium">
                {currentSlide.autoAdvance 
                  ? `Auto-přechod za ${formatTime(timeRemaining)}`
                  : 'Manuální ovládání'}
              </div>
            </div>
            
            {/* Pravý panel - další ovládání */}
            <div className="flex items-center gap-2">
              <button
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-colors"
                title="Zvuk"
              >
                <Volume2 size={18} />
              </button>
              
              <button
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-colors"
                title="Celá obrazovka"
              >
                <Maximize2 size={18} />
              </button>
              
              <div className="ml-4 text-sm text-gray-400">
                Šipky ←→ • Mezerník • Esc
              </div>
            </div>
          </div>
          
          {/* Progress slider */}
          <div className="mt-4">
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-400 min-w-[60px]">
                {currentIndex + 1}/{slides.length}
              </div>
              
              <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / slides.length) * 100}%` }}
                />
              </div>
              
              <div className="text-sm text-gray-400 min-w-[80px] text-right">
                {formatTime(
                  slides.slice(0, currentIndex + 1).reduce((sum, slide) => sum + slide.duration, 0)
                )} / {formatTime(
                  slides.reduce((sum, slide) => sum + slide.duration, 0)
                )}
              </div>
            </div>
            
            {/* Rychlé skoky */}
            <div className="flex justify-between mt-2">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full ${
                    index === currentIndex
                      ? 'bg-blue-500'
                      : index < currentIndex
                      ? 'bg-gray-600'
                      : 'bg-gray-800'
                  } hover:scale-125 transition-transform`}
                  title={`Slide ${index + 1}: ${
                    slide.type === 'intro' ? 'Úvod' :
                    slide.type === 'question' ? `Otázka ${slide.question?.questionNumber}` :
                    slide.type === 'separator' ? 'Oddělovač' : 'Závěr'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Nápověda */}
      {showControls && (
        <div className="mt-3 text-center text-sm text-gray-500">
          Použijte <kbd className="px-2 py-1 bg-gray-800 rounded text-gray-300">šipky</kbd> pro navigaci,{' '}
          <kbd className="px-2 py-1 bg-gray-800 rounded text-gray-300">mezerník</kbd> pro play/pause,{' '}
          <kbd className="px-2 py-1 bg-gray-800 rounded text-gray-300">ESC</kbd> pro stop
        </div>
      )}
    </div>
  )
}