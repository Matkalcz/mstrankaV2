// components/ManualQuizController.tsx
// Ruční controller pro moderátora kvízu — sidebar + main + bottom bar layout

"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import QuizRendererAdapter from "./QuizRendererAdapter"
import { TemplateConfig } from "@/types/template"
import { RotateCcw, ChevronLeft, ChevronRight, X, Eye, EyeOff } from "lucide-react"

export type SlideType =
  | 'question'
  | 'separator'
  | 'intro'
  | 'outro'

export interface Slide {
  id: string
  type: SlideType
  question?: any
  title?: string
  subtitle?: string
  // optional fields from ModernQuizController (ignored here)
  duration?: number
  autoAdvance?: boolean
}

export interface ManualQuizControllerProps {
  slides: Slide[]
  template: TemplateConfig
  onSlideChange?: (slideIndex: number, slide: Slide) => void
  onQuizEnd?: () => void
  onClose?: () => void
  showControls?: boolean
  className?: string
}

// ── Slide type meta ───────────────────────────────────────────────────────────

const QUESTION_TYPE_LABEL: Record<string, string> = {
  simple: 'SIMPLE', abcdef: 'A–F', bonus: 'BONUS', audio: 'AUDIO', video: 'VIDEO', image: 'IMAGE'
}
const QUESTION_TYPE_COLOR: Record<string, string> = {
  simple: 'bg-blue-600', abcdef: 'bg-purple-600', bonus: 'bg-amber-500',
  audio: 'bg-cyan-600', video: 'bg-pink-600', image: 'bg-rose-600'
}

// ── Mini preview card (inside the thumbnail) ──────────────────────────────────

function SlidePreviewCard({ slide, active, answered }: { slide: Slide; active: boolean; answered: boolean }) {
  const ring = active ? 'ring-2 ring-blue-500' : answered ? 'ring-1 ring-green-600' : 'ring-1 ring-gray-700'

  switch (slide.type) {
    case 'intro':
      return (
        <div className={`w-full h-16 rounded-lg overflow-hidden flex flex-col justify-center px-3 bg-gradient-to-br from-blue-700 to-purple-800 ${ring}`}>
          <div className="text-base leading-none">🎯</div>
          <div className="text-[11px] font-bold text-white mt-1">{slide.title || 'Kvíz začíná!'}</div>
        </div>
      )
    case 'separator':
      return (
        <div className={`w-full h-16 rounded-lg overflow-hidden flex flex-col justify-center px-3 bg-gradient-to-br from-amber-500 to-orange-600 ${ring}`}>
          <div className="text-base leading-none">⏳</div>
          <div className="text-[11px] font-bold text-white mt-1">{slide.title || 'Pauza'}</div>
        </div>
      )
    case 'outro':
      return (
        <div className={`w-full h-16 rounded-lg overflow-hidden flex flex-col justify-center px-3 bg-gradient-to-br from-green-600 to-emerald-700 ${ring}`}>
          <div className="text-base leading-none">🏆</div>
          <div className="text-[11px] font-bold text-white mt-1">{slide.title || 'Závěr'}</div>
        </div>
      )
    case 'question': {
      const q = slide.question
      const typeColor = QUESTION_TYPE_COLOR[q?.type] || 'bg-gray-600'
      const typeLabel = QUESTION_TYPE_LABEL[q?.type] || q?.type || '?'
      return (
        <div className={`w-full h-16 rounded-lg bg-gray-800 flex flex-col justify-between px-2.5 py-2 ${ring}`}>
          <div className="flex items-start gap-1.5">
            <p className="text-[11px] text-gray-200 leading-tight flex-1 overflow-hidden" style={{
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
            }}>
              {q?.text || '—'}
            </p>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 text-white ${typeColor}`}>
              {typeLabel}
            </span>
          </div>
          {q?.type === 'abcdef' && q?.answers?.length > 0 && (
            <div className="flex gap-1">
              {(q.answers as string[]).slice(0, 4).map((_: string, i: number) => (
                <span key={i} className="text-[9px] bg-gray-700 text-gray-400 px-1.5 rounded font-mono">
                  {['A','B','C','D'][i]}
                </span>
              ))}
              {q.answers.length > 4 && <span className="text-[9px] text-gray-600">+{q.answers.length - 4}</span>}
            </div>
          )}
          {q?.type === 'bonus' && q?.answers?.length > 0 && (
            <div className="text-[9px] text-amber-400">{q.answers.length}× odpověď</div>
          )}
          {(q?.type === 'audio') && (
            <div className="text-[9px] text-cyan-400">🎵 audio</div>
          )}
          {(q?.type === 'video') && (
            <div className="text-[9px] text-pink-400">🎬 video</div>
          )}
        </div>
      )
    }
    default:
      return <div className={`w-full h-16 rounded-lg bg-gray-800 ${ring}`} />
  }
}

// ── Sidebar row: number + preview ─────────────────────────────────────────────

interface ThumbProps {
  slide: Slide
  index: number
  questionNumber: number
  active: boolean
  answered: boolean
  onClick: () => void
}

function SlideThumbnail({ slide, index, questionNumber, active, answered, onClick }: ThumbProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (active && ref.current) {
      ref.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [active])

  return (
    <div ref={ref} className="flex items-center gap-2.5 px-3 py-1">
      {/* Number column — far left, fixed width */}
      <div className="w-7 shrink-0 flex flex-col items-center select-none">
        {slide.type === 'question' ? (
          <span className={`text-sm font-bold tabular-nums ${active ? 'text-blue-400' : 'text-gray-500'}`}>
            {questionNumber}
          </span>
        ) : (
          <span className="text-gray-700 text-base leading-none">
            {slide.type === 'intro' ? '🎯' : slide.type === 'separator' ? '⏳' : '🏆'}
          </span>
        )}
      </div>

      {/* Clickable preview card */}
      <button onClick={onClick} className="flex-1 text-left hover:opacity-90 transition-opacity active:scale-[0.98]">
        <SlidePreviewCard slide={slide} active={active} answered={answered} />
      </button>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function ManualQuizController({
  slides,
  template,
  onSlideChange,
  onQuizEnd,
  onClose,
  showControls = true,
  className = ""
}: ManualQuizControllerProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [answeredSlides, setAnsweredSlides] = useState<Set<string>>(new Set())

  const currentSlide = slides[currentSlideIndex]
  const currentQuestion = currentSlide?.question

  // Build question number map (only 'question' type slides get numbers)
  const questionNumbers: number[] = slides.map((() => {
    let n = 0
    return (slide: Slide) => slide.type === 'question' ? ++n : 0
  })())

  // ── Navigation ──────────────────────────────────────────────────────────────

  const goToSlide = useCallback((index: number) => {
    if (index < 0 || index >= slides.length) return
    setCurrentSlideIndex(index)
    setShowAnswer(false)
    onSlideChange?.(index, slides[index])
  }, [slides, onSlideChange])

  const nextSlide = useCallback(() => {
    if (currentSlideIndex < slides.length - 1) {
      goToSlide(currentSlideIndex + 1)
    } else {
      onQuizEnd?.()
    }
  }, [currentSlideIndex, slides.length, goToSlide, onQuizEnd])

  const prevSlide = useCallback(() => {
    if (currentSlideIndex > 0) {
      goToSlide(currentSlideIndex - 1)
    }
  }, [currentSlideIndex, goToSlide])

  const restartQuiz = () => {
    setCurrentSlideIndex(0)
    setShowAnswer(false)
    setAnsweredSlides(new Set())
    onSlideChange?.(0, slides[0])
  }

  const toggleAnswer = () => {
    setShowAnswer(prev => {
      const next = !prev
      if (next && currentSlide.type === 'question') {
        setAnsweredSlides(s => new Set(s).add(currentSlide.id))
      }
      return next
    })
  }

  // ── Keyboard shortcuts ──────────────────────────────────────────────────────

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      switch (e.key) {
        case 'ArrowRight':
        case 'Enter':
        case ' ':
          e.preventDefault()
          if (currentSlide.type === 'question' && !showAnswer) {
            toggleAnswer()
          } else {
            nextSlide()
          }
          break
        case 'ArrowLeft':
          e.preventDefault()
          if (currentSlide.type === 'question' && showAnswer) {
            setShowAnswer(false)
          } else {
            prevSlide()
          }
          break
        case 'a':
        case 'A':
          if (currentSlide.type === 'question') {
            e.preventDefault()
            toggleAnswer()
          }
          break
        case 'Escape':
          e.preventDefault()
          setShowAnswer(false)
          break
        case 'r':
        case 'R':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            restartQuiz()
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentSlide.type, showAnswer, nextSlide, prevSlide])

  // ── Slide rendering ─────────────────────────────────────────────────────────

  const renderCurrentSlide = () => {
    switch (currentSlide.type) {
      case 'intro':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-700 to-purple-800 text-white p-8 select-none">
            <div className="text-7xl mb-6">🎯</div>
            <h1 className="text-5xl font-extrabold mb-4 text-center drop-shadow">
              {currentSlide.title || "Kvíz začíná!"}
            </h1>
            <p className="text-xl opacity-80 text-center mb-10">
              {currentSlide.subtitle || `Připravte se na ${slides.filter(s => s.type === 'question').length} otázek`}
            </p>
            <button
              onClick={nextSlide}
              className="px-10 py-3.5 bg-white text-blue-700 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg"
            >
              Začít kvíz →
            </button>
          </div>
        )

      case 'separator':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-500 to-orange-600 text-white p-8 select-none">
            <div className="text-7xl mb-6">⏳</div>
            <h2 className="text-4xl font-extrabold mb-4 text-center drop-shadow">
              {currentSlide.title || "Pauza"}
            </h2>
            <p className="text-xl opacity-80 text-center mb-10">
              {currentSlide.subtitle || "Stiskněte → pro pokračování"}
            </p>
            <div className="text-base opacity-70">
              Stiskněte <kbd className="px-2 py-1 bg-white/20 rounded font-mono">→</kbd> nebo{' '}
              <kbd className="px-2 py-1 bg-white/20 rounded font-mono">Enter</kbd> pro pokračování
            </div>
          </div>
        )

      case 'outro':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-green-600 to-emerald-700 text-white p-8 select-none">
            <div className="text-7xl mb-6">🏆</div>
            <h1 className="text-5xl font-extrabold mb-4 text-center drop-shadow">
              {currentSlide.title || "Kvíz ukončen!"}
            </h1>
            <p className="text-xl opacity-80 text-center mb-10">
              {currentSlide.subtitle || "Děkujeme za účast"}
            </p>
            <button
              onClick={restartQuiz}
              className="px-10 py-3.5 bg-white text-green-700 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg"
            >
              ↺ Spustit znovu
            </button>
          </div>
        )

      case 'question':
        if (!currentQuestion) return null
        return (
          <div className="w-full h-full relative">
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
            {/* State badge */}
            <div className="absolute top-4 right-4 bg-black/70 backdrop-blur text-white px-3 py-1.5 rounded-lg text-sm font-medium pointer-events-none">
              {showAnswer ? '📖 Odpověď' : '❓ Otázka'}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (!currentSlide) return null

  // ── Layout ──────────────────────────────────────────────────────────────────

  return (
    <div className={`flex h-screen bg-gray-950 text-white overflow-hidden ${className}`}>

      {/* ── Left sidebar ──────────────────────────────────────────────────── */}
      <aside className="w-72 shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col">
        {/* Sidebar header */}
        <div className="px-4 py-4 border-b border-gray-800">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Přehled slidů</div>
          <div className="text-gray-500 text-xs">
            {currentSlideIndex + 1} / {slides.length}
          </div>
        </div>

        {/* Slide list */}
        <div className="flex-1 overflow-y-auto py-2 space-y-0.5">
          {slides.map((slide, index) => (
            <SlideThumbnail
              key={slide.id}
              slide={slide}
              index={index}
              questionNumber={questionNumbers[index]}
              active={currentSlideIndex === index}
              answered={answeredSlides.has(slide.id)}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>

        {/* Sidebar footer — keyboard hints */}
        <div className="px-4 py-3 border-t border-gray-800 text-xs text-gray-600 space-y-1">
          <div><kbd className="bg-gray-800 text-gray-400 rounded px-1.5 py-0.5">→</kbd> další / odpověď</div>
          <div><kbd className="bg-gray-800 text-gray-400 rounded px-1.5 py-0.5">←</kbd> předchozí / skrýt</div>
          <div><kbd className="bg-gray-800 text-gray-400 rounded px-1.5 py-0.5">A</kbd> přepnout odpověď</div>
        </div>
      </aside>

      {/* ── Right column ──────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Main slide view */}
        <div className="flex-1 relative overflow-hidden bg-black">
          {renderCurrentSlide()}
        </div>

        {/* ── Bottom control bar ──────────────────────────────────────────── */}
        {showControls && (
          <div className="h-24 shrink-0 bg-gray-900 border-t border-gray-800 flex items-center px-8">

            {/* Restart — vlevo */}
            <button
              onClick={restartQuiz}
              title="Restart (Ctrl+R)"
              className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center transition-all shadow-lg active:scale-95"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            {/* Střed — prev + pill + next s větší mezerou */}
            <div className="flex-1 flex items-center justify-center gap-10">

              {/* Prev — oranžový */}
              <button
                onClick={prevSlide}
                disabled={currentSlideIndex === 0}
                title="Předchozí (←)"
                className="w-14 h-14 rounded-full bg-orange-500 hover:bg-orange-400 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all shadow-lg active:scale-95"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>

              {/* Pilulka — odpověď */}
              {currentSlide.type === 'question' ? (
                <button
                  onClick={toggleAnswer}
                  title="Zobrazit/skrýt odpověď (A)"
                  className={`flex items-center gap-2 px-10 py-3.5 rounded-full font-semibold text-base transition-all shadow-lg active:scale-95 ${
                    showAnswer
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-500 text-white'
                  }`}
                >
                  {showAnswer
                    ? <><EyeOff className="w-4 h-4" /> Skrýt odpověď</>
                    : <><Eye className="w-4 h-4" /> Zobrazit odpověď</>
                  }
                </button>
              ) : (
                <div className="px-10 py-3.5 text-gray-600 text-sm">
                  {currentSlide.type === 'intro' && '— Úvodní slide —'}
                  {currentSlide.type === 'separator' && '— Pauza —'}
                  {currentSlide.type === 'outro' && '— Závěrečný slide —'}
                </div>
              )}

              {/* Next — zelený */}
              <button
                onClick={nextSlide}
                disabled={currentSlideIndex === slides.length - 1}
                title="Další (→)"
                className="w-14 h-14 rounded-full bg-green-600 hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all shadow-lg active:scale-95"
              >
                <ChevronRight className="w-7 h-7" />
              </button>
            </div>

            {/* Close — vpravo */}
            <button
              onClick={onClose}
              title="Zavřít přehrávač"
              className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center transition-all shadow-lg active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
