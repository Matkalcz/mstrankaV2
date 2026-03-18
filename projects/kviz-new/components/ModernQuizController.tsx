// components/ModernQuizController.tsx
// Moderní controller kompatibilní s novým UniversalQuizRenderer

"use client"

import { useState, useEffect, useCallback } from "react"
import QuizRendererAdapter from "./QuizRendererAdapter"
import { TemplateConfig } from "@/types/template"

export type SlideType = 
  | 'question'      // Otázka (jakéhokoli typu)
  | 'separator'     // Oddělovač mezi otázkami a odpověďmi
  | 'intro'         // Úvodní slide
  | 'outro'         // Závěrečný slide

export interface Slide {
  id: string
  type: SlideType
  question?: any // QuestionData
  duration: number // ms, 0 = manuální přechod
  autoAdvance: boolean // true = automaticky přejít po duration
  title?: string
  subtitle?: string
}

export interface ModernQuizControllerProps {
  // Data
  slides: Slide[]
  template: TemplateConfig
  
  // Ovládání
  autoPlay?: boolean
  onSlideChange?: (slideIndex: number, slide: Slide) => void
  onQuizEnd?: () => void
  
  // UI
  showControls?: boolean
  className?: string
}

export function ModernQuizController({
  slides,
  template,
  autoPlay = false,
  onSlideChange,
  onQuizEnd,
  showControls = true,
  className = ""
}: ModernQuizControllerProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [showAnswer, setShowAnswer] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  
  const currentSlide = slides[currentSlideIndex]
  const currentQuestion = currentSlide?.question

  // Timer pro automatické přechody
  useEffect(() => {
    if (!isPlaying || !currentSlide.autoAdvance || currentSlide.duration === 0) {
      setTimeRemaining(0)
      return
    }
    
    setTimeRemaining(currentSlide.duration)
    setShowAnswer(false)
    
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1000) {
          // Čas vypršel - zobrazit odpověď nebo přejít na další slide
          if (currentSlide.type === 'question' && !showAnswer) {
            setShowAnswer(true)
            // Po zobrazení odpovědi počkáme 3 sekundy před přechodem
            setTimeout(() => {
              if (currentSlideIndex < slides.length - 1) {
                nextSlide()
              } else {
                setIsPlaying(false)
                onQuizEnd?.()
              }
            }, 3000)
            return 0
          }
          return 0
        }
        return prev - 1000
      })
    }, 1000)
    
    return () => clearInterval(interval)
  }, [isPlaying, currentSlideIndex, currentSlide.duration, currentSlide.autoAdvance, currentSlide.type, showAnswer, slides.length, onQuizEnd])

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
          if (currentSlide.type === 'question' && !showAnswer) {
            setShowAnswer(true)
          } else {
            nextSlide()
          }
          break
          
        case 'ArrowLeft':
          e.preventDefault()
          prevSlide()
          break
          
        case 'r':
        case 'R':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            restartQuiz()
          }
          break
          
        case 'Escape':
          e.preventDefault()
          setIsPlaying(false)
          break
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentSlide.type, showAnswer])

  const nextSlide = useCallback(() => {
    if (currentSlideIndex < slides.length - 1) {
      const newIndex = currentSlideIndex + 1
      setCurrentSlideIndex(newIndex)
      setShowAnswer(false)
      onSlideChange?.(newIndex, slides[newIndex])
    } else {
      // Konec kvízu
      setIsPlaying(false)
      onQuizEnd?.()
    }
  }, [currentSlideIndex, slides.length, onSlideChange, onQuizEnd])

  const prevSlide = useCallback(() => {
    if (currentSlideIndex > 0) {
      const newIndex = currentSlideIndex - 1
      setCurrentSlideIndex(newIndex)
      setShowAnswer(false)
      onSlideChange?.(newIndex, slides[newIndex])
    }
  }, [currentSlideIndex, onSlideChange])

  const restartQuiz = () => {
    setCurrentSlideIndex(0)
    setShowAnswer(false)
    setIsPlaying(autoPlay)
  }

  const togglePlay = () => setIsPlaying(prev => !prev)

  const formatTime = (ms: number) => {
    const seconds = Math.ceil(ms / 1000)
    return `${seconds}s`
  }

  // Render podle typu slidu
  const renderCurrentSlide = () => {
    switch (currentSlide.type) {
      case 'intro':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700 text-white p-8">
            <h1 className="text-5xl font-bold mb-4 text-center">
              {currentSlide.title || "Kvíz začíná!"}
            </h1>
            <p className="text-xl opacity-90 text-center mb-8">
              {currentSlide.subtitle || `Připravte se na ${slides.filter(s => s.type === 'question').length} otázek`}
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
            <h2 className="text-4xl font-bold mb-4">
              {currentSlide.title || "Připravte se na odpověď!"}
            </h2>
            <p className="text-xl opacity-90 text-center mb-8">
              {currentSlide.subtitle || "Další otázka za chvíli..."}
            </p>
            <div className="text-6xl mb-6">⏳</div>
            {currentSlide.autoAdvance && timeRemaining > 0 && (
              <div className="text-lg">
                Automatický přechod za {formatTime(timeRemaining)}
              </div>
            )}
          </div>
        )
        
      case 'outro':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-green-600 to-emerald-700 text-white p-8">
            <h1 className="text-5xl font-bold mb-4 text-center">
              {currentSlide.title || "Kvíz ukončen!"}
            </h1>
            <p className="text-xl opacity-90 text-center mb-8">
              {currentSlide.subtitle || "Děkujeme za účast"}
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
        
        return (
          <div className="w-full h-full">
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
            
            {/* Indikátor stavu */}
            <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1.5 rounded-lg text-sm">
              {showAnswer ? "Odpověď" : "Otázka"}
            </div>
          </div>
        )
        
      default:
        return null
    }
  }

  return (
    <div className={`modern-quiz-controller ${className}`}>
      {/* Hlavní obsah */}
      <div className="relative w-full h-[80vh] rounded-xl border border-gray-800 bg-black overflow-hidden">
        {renderCurrentSlide()}
        
        {/* Progress bar pro automatické přehrávání */}
        {currentSlide.autoAdvance && timeRemaining > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
            <div 
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ 
                width: `${((currentSlide.duration - timeRemaining) / currentSlide.duration) * 100}%` 
              }}
            />
          </div>
        )}
      </div>
      
      {/* Ovládací panel */}
      {showControls && (
        <div className="mt-6 bg-gray-900 rounded-xl p-4 border border-gray-800">
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
                {isPlaying ? '⏸' : '▶'}
              </button>
              
              <button
                onClick={prevSlide}
                disabled={currentSlideIndex === 0}
                className="p-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Předchozí slide"
              >
                ←
              </button>
              
              <button
                onClick={nextSlide}
                disabled={currentSlideIndex === slides.length - 1}
                className="p-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Další slide"
              >
                →
              </button>
              
              <button
                onClick={restartQuiz}
                className="p-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white transition-colors"
                title="Restartovat kvíz"
              >
                ↻
              </button>
              
              {currentSlide.type === 'question' && (
                <button
                  onClick={() => setShowAnswer(prev => !prev)}
                  className="p-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                  title={showAnswer ? "Skrýt odpověď" : "Zobrazit odpověď"}
                >
                  {showAnswer ? "🙈" : "👁️"}
                </button>
              )}
            </div>
            
            {/* Střed - informace */}
            <div className="text-center text-white">
              <div className="text-sm text-gray-400">
                {currentSlide.type === 'intro' && 'Úvodní slide'}
                {currentSlide.type === 'question' && `Otázka ${currentSlideIndex + 1}`}
                {currentSlide.type === 'separator' && 'Oddělovač'}
                {currentSlide.type === 'outro' && 'Závěrečný slide'}
              </div>
              <div className="font-medium">
                {currentSlide.autoAdvance && timeRemaining > 0
                  ? `Auto-přechod za ${formatTime(timeRemaining)}`
                  : 'Manuální ovládání'}
              </div>
            </div>
            
            {/* Pravý panel - další informace */}
            <div className="text-sm text-gray-400">
              <div>Slide {currentSlideIndex + 1} / {slides.length}</div>
              <div className="text-xs mt-1">Šipky ←→ • Mezerník • Enter</div>
            </div>
          </div>
          
          {/* Progress slider pro celý kvíz */}
          <div className="mt-4">
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-400 min-w-[60px]">
                {currentSlideIndex + 1}/{slides.length}
              </div>
              
              <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${((currentSlideIndex + 1) / slides.length) * 100}%` }}
                />
              </div>
              
              <div className="text-sm text-gray-400 min-w-[80px] text-right">
                {formatTime(
                  slides.slice(0, currentSlideIndex + 1).reduce((sum, slide) => sum + slide.duration, 0)
                )} / {formatTime(
                  slides.reduce((sum, slide) => sum + slide.duration, 0)
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Nápověda */}
      {showControls && (
        <div className="mt-3 text-center text-sm text-gray-500">
          Použijte <kbd className="px-2 py-1 bg-gray-800 rounded text-gray-300">šipky</kbd> pro navigaci,{' '}
          <kbd className="px-2 py-1 bg-gray-800 rounded text-gray-300">mezerník</kbd> pro play/pause,{' '}
          <kbd className="px-2 py-1 bg-gray-800 rounded text-gray-300">Enter</kbd> pro zobrazení odpovědi
        </div>
      )}
    </div>
  )
}