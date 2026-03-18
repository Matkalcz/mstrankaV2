// components/universal-quiz-renderer.tsx
"use client"

import { TemplateConfig } from "@/types/template"
import { useState, useEffect, useRef } from "react"

export type QuestionType = 
  | 'simple'      // Jednoduchá otázka s jednoduchou odpovědí
  | 'ab'          // AB otázka (2 možnosti)
  | 'abcdef'      // ABCDEF otázka (2-6 možností)
  | 'bonus'       // Bonusová otázka
  | 'audio'       // Audio otázka
  | 'video'       // Video otázka

export type QuizState = 
  | 'question'    // Zobrazuje se pouze otázka
  | 'answers'     // Zobrazují se možnosti (pro AB/ABCDEF)
  | 'revealed'    // Zobrazuje se správná odpověď
  | 'media'       // Přehrává se audio/video (pouze pro audio/video otázky)
  | 'bonus_step'  // Bonus: otázka + X odpovědí

export interface QuestionData {
  id: string
  text: string
  type: QuestionType
  
  // Pro simple otázky
  correctAnswer?: string
  
  // Pro ab/abcdef otázky
  options?: Array<{
    label: string // 'A', 'B', 'C', ...
    text: string
    isCorrect?: boolean
  }>
  
  // Pro bonus otázky (všechny odpovědi jsou správné)
  bonusAnswers?: string[]
  
  // Media
  mediaUrl?: string
  mediaType?: 'audio' | 'video'
  thumbnailUrl?: string // pro video
  
  // Metadata
  questionNumber: number // 1-10 v rámci kola
  roundNumber: number // číslo kola
  category?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  hasImage?: boolean
  imageUrl?: string
}

interface UniversalQuizRendererProps {
  // Data
  question: QuestionData
  template: TemplateConfig
  
  // Stav
  state: QuizState
  onStateChange?: (state: QuizState) => void
  
  // Media kontrola
  autoPlayMedia?: boolean
  onMediaEnd?: () => void
  
  // Bonus kontrola
  bonusStep?: number // pro bonusové otázky: kolik odpovědí zobrazit (0 = žádná)
  
  // Zobrazení
  className?: string
  hideNumbers?: boolean
}

export function UniversalQuizRenderer({
  question,
  template,
  state,
  onStateChange,
  autoPlayMedia = false,
  onMediaEnd,
  bonusStep = 0,
  className = "",
  hideNumbers = false
}: UniversalQuizRendererProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  
  // Media kontrola
  useEffect(() => {
    if (state === 'media' && autoPlayMedia) {
      if (question.mediaType === 'audio' && audioRef.current) {
        audioRef.current.currentTime = 0
        audioRef.current.play().catch(console.error)
      } else if (question.mediaType === 'video' && videoRef.current) {
        videoRef.current.currentTime = 0
        videoRef.current.play().catch(console.error)
      }
    } else {
      audioRef.current?.pause()
      videoRef.current?.pause()
    }
  }, [state, autoPlayMedia, question.mediaType])
  
  // Poslouchání konce media
  useEffect(() => {
    const audio = audioRef.current
    const video = videoRef.current
    
    const handleMediaEnd = () => {
      if (onMediaEnd) onMediaEnd()
      if (onStateChange) onStateChange('revealed')
    }
    
    if (audio) {
      audio.addEventListener('ended', handleMediaEnd)
    }
    if (video) {
      video.addEventListener('ended', handleMediaEnd)
    }
    
    return () => {
      if (audio) {
        audio.removeEventListener('ended', handleMediaEnd)
      }
      if (video) {
        video.removeEventListener('ended', handleMediaEnd)
      }
    }
  }, [onMediaEnd, onStateChange])
  
  // CSS proměnné z template
  const cssVariables = {
    '--bg-color': template.background.value,
    '--bg-overlay': template.background.overlayColor || 'transparent',
    '--color-primary': template.colors.primary,
    '--color-secondary': template.colors.secondary,
    '--color-correct': template.colors.correct,
    '--color-text': template.colors.text,
    '--color-answer-bg': template.colors.answerBg,
    '--color-answer-border': template.colors.answerBorder,
    
    '--font-question-family': template.fonts.question.family,
    '--font-question-size': template.fonts.question.size,
    '--font-question-weight': template.fonts.question.weight,
    
    '--font-answer-family': template.fonts.answer.family,
    '--font-answer-size': template.fonts.answer.size,
    '--font-answer-weight': template.fonts.answer.weight,
    
    '--font-number-family': template.fonts.number.family,
    '--font-number-size': template.fonts.number.size,
    '--font-number-weight': template.fonts.number.weight,
    '--font-number-color': template.fonts.number.color || template.colors.primary,
    
    '--font-label-family': template.fonts.label.family,
    '--font-label-size': template.fonts.label.size,
    '--font-label-weight': template.fonts.label.weight,
    
    // Layout pozice
    '--qnum-top': template.layout.questionNumber.offsetY,
    '--qnum-left': template.layout.questionNumber.position.includes('left') ? template.layout.questionNumber.offsetX : 'auto',
    '--qnum-right': template.layout.questionNumber.position.includes('right') ? template.layout.questionNumber.offsetX : 'auto',
    '--qnum-size': template.layout.questionNumber.size,
    
    '--rnum-bottom': template.layout.roundNumber.offsetY,
    '--rnum-left': template.layout.roundNumber.position.includes('left') ? template.layout.roundNumber.offsetX : 'auto',
    '--rnum-right': template.layout.roundNumber.position.includes('right') ? template.layout.roundNumber.offsetX : 'auto',
    '--rnum-size': template.layout.roundNumber.size,
    
    '--question-top': template.layout.questionText.top,
    '--question-left': template.layout.questionText.left,
    '--question-right': template.layout.questionText.right,
    '--question-max-width': template.layout.questionText.maxWidth,
    '--question-text-align': template.layout.questionText.textAlign,
    
    '--image-top': template.layout.image.top,
    '--image-left': template.layout.image.left,
    '--image-width': template.layout.image.width,
    '--image-height': template.layout.image.height,
    '--image-max-height': template.layout.image.maxHeight,
    
    '--answers-grid-top': template.layout.answers.grid.top,
    '--answers-grid-bottom': template.layout.answers.grid.bottom,
    '--answers-grid-left': template.layout.answers.grid.left,
    '--answers-grid-right': template.layout.answers.grid.right,
    '--answers-grid-columns': template.layout.answers.grid.columns,
    '--answers-grid-gap': template.layout.answers.grid.gap,
    
    '--answers-single-top': template.layout.answers.single.top,
    '--answers-single-left': template.layout.answers.single.left,
    '--answers-single-right': template.layout.answers.single.right,
    '--answers-single-text-align': template.layout.answers.single.textAlign,
    
    '--answers-bonus-top': template.layout.answers.bonus.top,
    '--answers-bonus-left': template.layout.answers.bonus.left,
    '--answers-bonus-right': template.layout.answers.bonus.right,
    '--answers-bonus-gap': template.layout.answers.bonus.gap,
    
    '--audio-top': template.layout.media.audio.top,
    '--audio-left': template.layout.media.audio.left,
    '--audio-width': template.layout.media.audio.width,
    
    '--video-thumb-top': template.layout.media.video.thumbnail.top,
    '--video-thumb-left': template.layout.media.video.thumbnail.left,
    '--video-thumb-width': template.layout.media.video.thumbnail.width,
    '--video-thumb-height': template.layout.media.video.thumbnail.height,
  } as React.CSSProperties
  
  // Render čísla otázky
  const renderQuestionNumber = () => {
    if (hideNumbers) return null
    
    let numberText: string
    if (question.type === 'bonus') {
      numberText = 'BO'
    } else {
      numberText = question.questionNumber.toString()
    }
    
    return (
      <div 
        className="question-number"
        style={{
          position: 'absolute',
          top: 'var(--qnum-top)',
          left: 'var(--qnum-left)',
          right: 'var(--qnum-right)',
          fontFamily: 'var(--font-number-family)',
          fontSize: 'var(--qnum-size)',
          fontWeight: 'var(--font-number-weight)',
          color: 'var(--font-number-color)',
          textAlign: template.layout.questionNumber.position.includes('center') ? 'center' : 
                    template.layout.questionNumber.position.includes('right') ? 'right' : 'left',
          zIndex: 10
        }}
      >
        {numberText}
      </div>
    )
  }
  
  // Render čísla kola
  const renderRoundNumber = () => {
    if (hideNumbers) return null
    
    return (
      <div 
        className="round-number"
        style={{
          position: 'absolute',
          bottom: 'var(--rnum-bottom)',
          left: 'var(--rnum-left)',
          right: 'var(--rnum-right)',
          fontFamily: 'var(--font-number-family)',
          fontSize: 'var(--rnum-size)',
          fontWeight: 'var(--font-number-weight)',
          color: 'var(--font-number-color)',
          textAlign: template.layout.roundNumber.position.includes('center') ? 'center' : 
                    template.layout.roundNumber.position.includes('right') ? 'right' : 'left',
          zIndex: 10
        }}
      >
        {question.roundNumber}. kolo
      </div>
    )
  }
  
  // Render textu otázky
  const renderQuestionText = () => {
    return (
      <div 
        className="question-text"
        style={{
          position: 'absolute',
          top: 'var(--question-top)',
          left: 'var(--question-left)',
          right: 'var(--question-right)',
          maxWidth: 'var(--question-max-width)',
          fontFamily: 'var(--font-question-family)',
          fontSize: 'var(--font-question-size)',
          fontWeight: 'var(--font-question-weight)',
          color: 'var(--color-text)',
          textAlign: 'var(--question-text-align)' as any,
          zIndex: 10
        }}
      >
        {question.text}
      </div>
    )
  }
  
  // Render obrázku
  const renderImage = () => {
    if (!question.imageUrl) return null
    
    return (
      <div 
        className="question-image"
        style={{
          position: 'absolute',
          top: 'var(--image-top)',
          left: 'var(--image-left)',
          width: 'var(--image-width)',
          height: 'var(--image-height)',
          maxHeight: 'var(--image-max-height)',
          zIndex: 5
        }}
      >
        <img 
          src={question.imageUrl} 
          alt="" 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'contain',
            borderRadius: '8px'
          }}
        />
      </div>
    )
  }
  
  // Render AB/ABCDEF odpovědí (pouze možnosti)
  const renderOptions = () => {
    if (!question.options || question.options.length === 0) return null
    if (state !== 'answers' && state !== 'revealed') return null
    
    const columns = template.layout.answers.grid.columns
    const isRevealed = state === 'revealed'
    
    return (
      <div 
        className="answers-grid"
        style={{
          position: 'absolute',
          top: 'var(--answers-grid-top)',
          bottom: 'var(--answers-grid-bottom)',
          left: 'var(--answers-grid-left)',
          right: 'var(--answers-grid-right)',
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: 'var(--answers-grid-gap)',
          zIndex: 10
        }}
      >
        {question.options.map((option) => {
          const isCorrect = option.isCorrect || false
          const showCorrect = isRevealed && isCorrect
          
          return (
            <div
              key={option.label}
              className="answer-option"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1.5rem',
                backgroundColor: 'var(--color-answer-bg)',
                border: `2px solid ${showCorrect ? 'var(--color-correct)' : 'var(--color-answer-border)'}`,
                borderRadius: '12px',
                transition: template.animations.enabled ? `all ${template.animations.duration}ms` : 'none',
                ...(showCorrect && template.animations.answerReveal === 'highlight' ? {
                  boxShadow: `0 0 20px var(--color-correct)`,
                  transform: 'scale(1.02)'
                } : {})
              }}
            >
              <div 
                className="answer-label"
                style={{
                  fontFamily: 'var(--font-label-family)',
                  fontSize: 'var(--font-label-size)',
                  fontWeight: 'var(--font-label-weight)',
                  color: showCorrect ? 'var(--color-correct)' : 'var(--color-secondary)',
                  marginBottom: '0.5rem'
                }}
              >
                {option.label}
              </div>
              <div 
                className="answer-text"
                style={{
                  fontFamily: 'var(--font-answer-family)',
                  fontSize: 'var(--font-answer-size)',
                  fontWeight: 'var(--font-answer-weight)',
                  color: showCorrect ? 'var(--color-correct)' : 'var(--color-text)',
                  textAlign: 'center'
                }}
              >
                {option.text}
              </div>
            </div>
          )
        })}
      </div>
    )
  }
  
  // Render jednoduché odpovědi
  const renderSingleAnswer = () => {
    if (!question.correctAnswer) return null
    if (state !== 'revealed') return null
    
    return (
      <div 
        className="single-answer"
        style={{
          position: 'absolute',
          top: 'var(--answers-single-top)',
          left: 'var(--answers-single-left)',
          right: 'var(--answers-single-right)',
          textAlign: 'var(--answers-single-text-align)' as any,
          zIndex: 10
        }}
      >
        <div 
          style={{
            padding: '2rem',
            backgroundColor: 'rgba(229, 62, 62, 0.1)',
            border: `3px solid var(--color-correct)`,
            borderRadius: '16px',
            transition: template.animations.enabled ? `all ${template.animations.duration}ms` : 'none',
            ...(template.animations.answerReveal === 'highlight' ? {
              boxShadow: `0 0 30px var(--color-correct)`
            } : {})
          }}
        >
          <div 
            style={{
              fontFamily: 'var(--font-label-family)',
              fontSize: 'var(--font-label-size)',
              fontWeight: 'var(--font-label-weight)',
              color: 'var(--color-correct)',
              marginBottom: '1rem'
            }}
          >
            Správná odpověď
          </div>
          <div 
            style={{
              fontFamily: 'var(--font-answer-family)',
              fontSize: 'calc(var(--font-answer-size) * 1.5)',
              fontWeight: 'var(--font-answer-weight)',
              color: 'var(--color-correct)'
            }}
          >
            {question.correctAnswer}
          </div>
        </div>
      </div>
    )
  }
  
  // Render bonusových odpovědí
  const renderBonusAnswers = () => {
    if (!question.bonusAnswers || question.bonusAnswers.length === 0) return null
    if (state !== 'bonus_step' && state !== 'revealed') return null
    
    const answersToShow = state === 'bonus_step' 
      ? question.bonusAnswers.slice(0, bonusStep)
      : question.bonusAnswers
    
    if (answersToShow.length === 0) return null
    
    return (
      <div 
        className="bonus-answers"
        style={{
          position: 'absolute',
          top: 'var(--answers-bonus-top)',
          left: 'var(--answers-bonus-left)',
          right: 'var(--answers-bonus-right)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--answers-bonus-gap)',
          zIndex: 10
        }}
      >
        {answersToShow.map((answer, index) => (
          <div
            key={index}
            className="bonus-answer"
            style={{
              padding: '1.5rem',
              backgroundColor: 'var(--color-answer-bg)',
              border: `2px solid var(--color-secondary)`,
              borderRadius: '12px',
              opacity: template.animations.bonusReveal === 'sequential' && index === answersToShow.length - 1 ? 1 : 0.8,
              transition: template.animations.enabled ? `all ${template.animations.duration}ms` : 'none',
              ...(template.animations.bonusReveal === 'sequential' && index === answersToShow.length - 1 ? {
                transform: 'translateY(0)',
                boxShadow: `0 0 15px var(--color-secondary)`
              } : {
                transform: 'translateY(10px)'
              })
            }}
          >
            <div 
              style={{
                fontFamily: 'var(--font-answer-family)',
                fontSize: 'var(--font-answer-size)',
                fontWeight: 'var(--font-answer-weight)',
                color: 'var(--color-text)',
                textAlign: 'center'
              }}
            >
              {answer}
            </div>
          </div>
        ))}
      </div>
    )
  }
  
  // Render audio
  const renderAudio = () => {
    if (question.mediaType !== 'audio' || !question.mediaUrl) return null
    
    return (
      <>
        <audio
          ref={audioRef}
          src={question.mediaUrl}
          preload="auto"
          style={{ display: 'none' }}
        />
        
        <div 
          className="audio-player"
          style={{
            position: 'absolute',
            top: 'var(--audio-top)',
            left: 'var(--audio-left)',
            width: 'var(--audio-width)',
            zIndex: 10
          }}
        >
          {state === 'media' ? (
            <div 
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem'
              }}
            >
              <div 
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: template.animations.enabled ? 'pulse 1.5s infinite' : 'none'
                }}
              >
                <svg 
                  width="40" 
                  height="40" 
                  viewBox="0 0 24 24" 
                  fill="white"
                >
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                </svg>
              </div>
              <div 
                style={{
                  fontFamily: 'var(--font-label-family)',
                  fontSize: 'var(--font-label-size)',
                  fontWeight: 'var(--font-label-weight)',
                  color: 'var(--color-primary)'
                }}
              >
                Přehrává se audio...
              </div>
            </div>
          ) : state === 'question' ? (
            <button
              onClick={() => onStateChange?.('media')}
              style={{
                padding: '1rem 2rem',
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontFamily: 'var(--font-label-family)',
                fontSize: 'var(--font-label-size)',
                fontWeight: 'var(--font-label-weight)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              ▶ Přehrát audio
            </button>
          ) : null}
        </div>
      </>
    )
  }
  
  // Render video
  const renderVideo = () => {
    if (question.mediaType !== 'video' || !question.mediaUrl) return null
    
    const showThumbnail = state === 'question' || state === 'revealed'
    const showFullscreen = state === 'media'
    
    return (
      <>
        <video
          ref={videoRef}
          src={question.mediaUrl}
          preload="auto"
          style={{ display: 'none' }}
        />
        
        {showThumbnail && (
          <div 
            className="video-thumbnail"
            style={{
              position: 'absolute',
              top: 'var(--video-thumb-top)',
              left: 'var(--video-thumb-left)',
              width: 'var(--video-thumb-width)',
              height: 'var(--video-thumb-height)',
              zIndex: 10,
              cursor: state === 'question' ? 'pointer' : 'default'
            }}
            onClick={state === 'question' ? () => onStateChange?.('media') : undefined}
          >
            {question.thumbnailUrl ? (
              <img 
                src={question.thumbnailUrl} 
                alt="Video náhled"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  border: `2px solid ${state === 'question' ? 'var(--color-primary)' : 'var(--color-answer-border)'}`
                }}
              />
            ) : (
              <div 
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  border: `2px solid ${state === 'question' ? 'var(--color-primary)' : 'var(--color-answer-border)'}`,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <div 
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: state === 'question' ? 'var(--color-primary)' : 'var(--color-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <svg 
                    width="30" 
                    height="30" 
                    viewBox="0 0 24 24" 
                    fill="white"
                  >
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
            )}
            
            {state === 'question' && (
              <div 
                style={{
                  position: 'absolute',
                  bottom: '10px',
                  left: '10px',
                  fontFamily: 'var(--font-label-family)',
                  fontSize: 'calc(var(--font-label-size) * 0.8)',
                  fontWeight: 'var(--font-label-weight)',
                  color: 'white',
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  padding: '4px 8px',
                  borderRadius: '4px'
                }}
              >
                Klikni pro přehrání
              </div>
            )}
          </div>
        )}
        
        {showFullscreen && template.layout.media.video.fullscreen && (
          <div 
            className="video-fullscreen"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'black',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={() => {
              videoRef.current?.pause()
              onStateChange?.('revealed')
            }}
          >
            <video
              ref={videoRef}
              src={question.mediaUrl}
              autoPlay
              controls
              style={{
                maxWidth: '100%',
                maxHeight: '100%'
              }}
            />
          </div>
        )}
      </>
    )
  }
  
  // Určení, co renderovat podle typu otázky a stavu
  const renderContent = () => {
    switch (question.type) {
      case 'simple':
        return (
          <>
            {renderQuestionText()}
            {renderImage()}
            {(state === 'revealed') && renderSingleAnswer()}
          </>
        )
      
      case 'ab':
      case 'abcdef':
        return (
          <>
            {renderQuestionText()}
            {renderImage()}
            {(state === 'answers' || state === 'revealed') && renderOptions()}
          </>
        )
      
      case 'bonus':
        return (
          <>
            {renderQuestionText()}
            {renderImage()}
            {(state === 'bonus_step' || state === 'revealed') && renderBonusAnswers()}
          </>
        )
      
      case 'audio':
        return (
          <>
            {renderQuestionText()}
            {renderAudio()}
            {state === 'revealed' && renderSingleAnswer()}
          </>
        )
      
      case 'video':
        return (
          <>
            {renderQuestionText()}
            {renderVideo()}
            {state === 'revealed' && renderSingleAnswer()}
          </>
        )
      
      default:
        return renderQuestionText()
    }
  }
  
  return (
    <div 
      className={`universal-quiz-renderer ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        ...cssVariables
      }}
    >
      {/* Pozadí */}
      <div 
        className="background"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: template.background.type === 'color' ? template.background.value : 'transparent',
          backgroundImage: template.background.type === 'image' ? `url(${template.background.value})` : 
                          template.background.type === 'gradient' ? template.background.value : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 1
        }}
      />
      
      {template.background.overlayColor && (
        <div 
          className="background-overlay"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: template.background.overlayColor,
            zIndex: 2
          }}
        />
      )}
      
      {/* Čísla */}
      {renderQuestionNumber()}
      {renderRoundNumber()}
      
      {/* Obsah */}
      <div className="content" style={{ position: 'relative', zIndex: 3 }}>
        {renderContent()}
      </div>
      
      {/* CSS animace */}
      {template.animations.enabled && (
        <style>{`
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.05); opacity: 0.8; }
            100% { transform: scale(1); opacity: 1; }
          }
          
          .universal-quiz-renderer {
            transition: opacity ${template.animations.duration}ms;
          }
        `}</style>
      )}
    </div>
  )
}