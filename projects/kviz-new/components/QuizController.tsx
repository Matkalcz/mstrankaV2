// components/QuizController.tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import QuizRendererAdapter from "./QuizRendererAdapter"
import { TemplateConfig } from "@/types/template"

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

export type SlideType = 
  | 'question'      // Otázka (jakéhokoli typu)
  | 'separator'     // Oddělovač mezi otázkami a odpověďmi
  | 'intro'         // Úvodní slide
  | 'outro'         // Závěrečný slide

export interface Slide {
  id: string
  type: SlideType
  question?: QuestionData
  duration: number // ms, 0 = manuální přechod
  autoAdvance: boolean // true = automaticky přejít po duration
}

export interface QuizControllerProps {
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

export function QuizController({
  slides,
  template,
  autoPlay = false,
  onSlideChange,
  onQuizEnd,
  showControls = true,
  className = ""
}: QuizControllerProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [currentState, setCurrentState] = useState<QuizState>('question')
  const [bonusStep, setBonusStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(autoPlay)
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
    
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1000) {
          // Čas vypršel - přejdi na další stav/slide
          handleAutoAdvance()
          return 0
        }
        return prev - 1000
      })
    }, 1000)
    
    return () => clearInterval(interval)
  }, [isPlaying, currentSlideIndex, currentSlide.duration, currentSlide.autoAdvance])
  
  // Automatické řízení stavu pro různé typy otázek
  useEffect(() => {
    if (!isPlaying || !currentQuestion) return
    
    let timeout: NodeJS.Timeout
    
    switch (currentQuestion.type) {
      case 'simple':
        // Otázka → (po čase) → odpověď
        if (currentState === 'question') {
          timeout = setTimeout(() => {
            setCurrentState('revealed')
          }, currentSlide.duration * 0.6) // 60% času na otázku, 40% na odpověď
        }
        break
        
      case 'abcd':
      case 'abcdef':
        // Otázka → (po čase) → možnosti → (po čase) → správná
        if (currentState === 'question') {
          timeout = setTimeout(() => {
            setCurrentState('answers')
          }, currentSlide.duration * 0.3) // 30% na otázku
        } else if (currentState === 'answers') {
          timeout = setTimeout(() => {
            setCurrentState('revealed')
          }, currentSlide.duration * 0.4) // 40% na možnosti
        }
        break
        
      case 'bonus':
        // Otázka → postupně odpovědi
        if (currentState === 'question') {
          timeout = setTimeout(() => {
            setCurrentState('bonus_step')
            setBonusStep(1)
          }, currentSlide.duration * 0.2) // 20% na otázku
        } else if (currentState === 'bonus_step' && bonusStep < (currentQuestion.bonusAnswers?.length || 0)) {
          const stepDuration = currentSlide.duration * 0.8 / (currentQuestion.bonusAnswers?.length || 1)
          timeout = setTimeout(() => {
            if (bonusStep < (currentQuestion.bonusAnswers?.length || 0)) {
              setBonusStep(prev => prev + 1)
            } else {
              setCurrentState('revealed')
            }
          }, stepDuration)
        }
        break
        
      case 'audio':
      case 'video':
        // Otázka → (po čase/kliknutí) → media → odpověď
        if (currentState === 'question') {
          timeout = setTimeout(() => {
            setCurrentState('media')
          }, currentSlide.duration * 0.3)
        } else if (currentState === 'media') {
          // Media se přehraje a pak automaticky přejde na odpověď
          // (konec media je zachycen v UniversalQuizRenderer)
        }
        break
    }
    
    return () => {
      if (timeout) clearTimeout(timeout)
    }
  }, [isPlaying, currentQuestion, currentState, bonusStep, currentSlide.duration])
  
  const handleAutoAdvance = useCallback(() => {
    if (currentSlide.autoAdvance) {
      if (currentSlideIndex < slides.length - 1) {
        nextSlide()
      } else {
        // Konec kvízu
        setIsPlaying(false)
        onQuizEnd?.()
      }
    }
  }, [currentSlideIndex, slides.length, currentSlide.autoAdvance, onQuizEnd])
  
  const nextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      const newIndex = currentSlideIndex + 1
      setCurrentSlideIndex(newIndex)
      setCurrentState('question')
      setBonusStep(0)
      onSlideChange?.(newIndex, slides[newIndex])
    }
  }
  
  const prevSlide = () => {
    if (currentSlideIndex > 0) {
      const newIndex = currentSlideIndex - 1
      setCurrentSlideIndex(newIndex)
      setCurrentState('question')
      setBonusStep(0)
      onSlideChange?.(newIndex, slides[newIndex])
    }
  }
  
  const play = () => setIsPlaying(true)
  const pause = () => setIsPlaying(false)
  const togglePlay = () => setIsPlaying(prev => !prev)
  
  const handleMediaEnd = () => {
    setCurrentState('revealed')
  }
  
  const handleStateChange = (state: QuizState) => {
    setCurrentState(state)
  }
  
  // Render separator slide
  const renderSeparator = () => {
    const separatorStyle = template.specialPages.separator
    
    return (
      <div 
        className="separator-slide"
        style={{
          position: 'relative',
          width: '100%',
          height: '100vh',
          backgroundColor: template.background.value,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {separatorStyle.style === 'box' && (
          <div 
            style={{
              padding: '3rem 6rem',
              border: `4px solid ${separatorStyle.color}`,
              borderRadius: '20px',
              backgroundColor: 'rgba(0, 0, 0, 0.3)'
            }}
          >
            <div 
              style={{
                fontFamily: template.fonts.question.family,
                fontSize: '4rem',
                fontWeight: template.fonts.question.weight,
                color: separatorStyle.color,
                textAlign: 'center'
              }}
            >
              {separatorStyle.text}
            </div>
          </div>
        )}
        
        {separatorStyle.style === 'line' && (
          <div style={{ width: '80%' }}>
            <div 
              style={{
                height: '4px',
                backgroundColor: separatorStyle.color,
                marginBottom: '2rem'
              }}
            />
            <div 
              style={{
                fontFamily: template.fonts.question.family,
                fontSize: '3rem',
                fontWeight: template.fonts.question.weight,
                color: separatorStyle.color,
                textAlign: 'center'
              }}
            >
              {separatorStyle.text}
            </div>
            <div 
              style={{
                height: '4px',
                backgroundColor: separatorStyle.color,
                marginTop: '2rem'
              }}
            />
          </div>
        )}
        
        {separatorStyle.style === 'text-only' && (
          <div 
            style={{
              fontFamily: template.fonts.question.family,
              fontSize: '4rem',
              fontWeight: template.fonts.question.weight,
              color: separatorStyle.color,
              textAlign: 'center'
            }}
          >
            {separatorStyle.text}
          </div>
        )}
      </div>
    )
  }
  
  // Render intro slide
  const renderIntro = () => {
    const introStyle = template.specialPages.intro
    
    return (
      <div 
        className="intro-slide"
        style={{
          position: 'relative',
          width: '100%',
          height: '100vh',
          backgroundColor: introStyle.background || template.background.value,
          backgroundImage: introStyle.background ? `url(${introStyle.background})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div 
          style={{
            position: 'absolute',
            top: introStyle.titlePosition.top,
            left: introStyle.titlePosition.left,
            right: introStyle.titlePosition.right,
            fontFamily: template.fonts.question.family,
            fontSize: '4rem',
            fontWeight: template.fonts.question.weight,
            color: template.colors.text,
            textAlign: 'center'
          }}
        >
          HOSPODSKÝ KVIZ
        </div>
        
        <div 
          style={{
            position: 'absolute',
            top: introStyle.subtitlePosition.top,
            left: introStyle.subtitlePosition.left,
            right: introStyle.subtitlePosition.right,
            fontFamily: template.fonts.answer.family,
            fontSize: '2rem',
            fontWeight: template.fonts.answer.weight,
            color: template.colors.secondary,
            textAlign: 'center'
          }}
        >
          Vítejte u dnešního kvízu!
        </div>
      </div>
    )
  }
  
  // Render outro slide
  const renderOutro = () => {
    const outroStyle = template.specialPages.outro
    
    return (
      <div 
        className="outro-slide"
        style={{
          position: 'relative',
          width: '100%',
          height: '100vh',
          backgroundColor: outroStyle.background || template.background.value,
          backgroundImage: outroStyle.background ? `url(${outroStyle.background})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div 
          style={{
            position: 'absolute',
            top: outroStyle.titlePosition.top,
            left: outroStyle.titlePosition.left,
            right: outroStyle.titlePosition.right,
            fontFamily: template.fonts.question.family,
            fontSize: '4rem',
            fontWeight: template.fonts.question.weight,
            color: template.colors.text,
            textAlign: 'center'
          }}
        >
          DĚKUJEME ZA ÚČAST!
        </div>
        
        <div 
          style={{
            position: 'absolute',
            top: 'calc(' + outroStyle.titlePosition.top + ' + 6rem)',
            left: '20%',
            right: '20%',
            fontFamily: template.fonts.answer.family,
            fontSize: '2rem',
            fontWeight: template.fonts.answer.weight,
            color: template.colors.secondary,
            textAlign: 'center'
          }}
        >
          Příště na viděnou!
        </div>
      </div>
    )
  }
  
  // Render aktuální slide
  const renderCurrentSlide = () => {
    switch (currentSlide.type) {
      case 'intro':
        return renderIntro()
        
      case 'question':
        if (!currentQuestion) return null
        
        // Určit, zda zobrazit odpověď na základě stavu
        const showAnswer = currentState === 'revealed' || currentState === 'bonus_step'
        
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
        
      case 'separator':
        return renderSeparator()
        
      case 'outro':
        return renderOutro()
        
      default:
        return null
    }
  }
  
  return (
    <div className={`quiz-controller ${className}`}>
      {/* Hlavní obsah */}
      <div className="quiz-content" style={{ position: 'relative', width: '100%', height: '100vh' }}>
        {renderCurrentSlide()}
      </div>
      
      {/* Ovládací panel */}
      {showControls && (
        <div className="quiz-controls" style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          zIndex: 1000,
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: isPlaying ? '#e53e3e' : '#0ea5e9',
              border: 'none',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '16px'
            }}
            title={isPlaying ? "Pozastavit" : "Přehrát"}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          
          {/* Navigace slidů */}
          <button
            onClick={prevSlide}
            disabled={currentSlideIndex === 0}
            style={{
              padding: '8px 16px',
              backgroundColor: currentSlideIndex === 0 ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              cursor: currentSlideIndex === 0 ? 'not-allowed' : 'pointer',
              opacity: currentSlideIndex === 0 ? 0.5 : 1
            }}
            title="Předchozí slide"
          >
            ←
          </button>
          
          {/* Info */}
          <div style={{ minWidth: '120px', textAlign: 'center', color: 'white' }}>
            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
              {currentSlide.type === 'intro' && 'Úvod'}
              {currentSlide.type === 'question' && `Otázka ${currentQuestion?.questionNumber || ''}`}
              {currentSlide.type === 'separator' && 'Oddělovač'}
              {currentSlide.type === 'outro' && 'Závěr'}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>
              {currentSlideIndex + 1} / {slides.length}
              {timeRemaining > 0 && ` • ${Math.ceil(timeRemaining / 1000)}s`}
            </div>
          </div>
          
          {/* Další slide */}
          <button
            onClick={nextSlide}
            disabled={currentSlideIndex === slides.length - 1}
            style={{
              padding: '8px 16px',
              backgroundColor: currentSlideIndex === slides.length - 1 ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              cursor: currentSlideIndex === slides.length - 1 ? 'not-allowed' : 'pointer',
              opacity: currentSlideIndex === slides.length - 1 ? 0.5 : 1
            }}
            title="Další slide"
          >
            →
          </button>
          
          {/* Stav přehrávání */}
          <div style={{
            width: '100px',
            height: '4px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${(currentSlideIndex + 1) / slides.length * 100}%`,
              height: '100%',
              backgroundColor: '#0ea5e9',
              transition: 'width 0.3s'
            }} />
          </div>
        </div>
      )}
      
      {/* Klávesové zkratky */}
      <div style={{ display: 'none' }}>
        {/* Posluchač kláves bude přidán později */}
      </div>
    </div>
  )
}