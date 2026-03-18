// app/play/[id]/page.tsx — Moderátorský přehrávač
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Eye, Info, X, Volume2, Video } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

// ─── Typy ─────────────────────────────────────────────────────────────────────

interface QuestionData {
  id: string
  text: string
  type: 'simple' | 'ab' | 'abcdef' | 'bonus' | 'audio' | 'video'
  correct_answer?: string
  options?: { label: string; text: string; correct?: boolean }[]
  media_url?: string
  points: number
  difficulty?: string
}

type SlideType = 'page' | 'round_start' | 'question' | 'separator' | 'qr_page'

interface Slide {
  type: SlideType
  title?: string
  content?: string
  subtitle?: string
  roundNumber?: number
  question?: QuestionData
  showAnswer?: boolean
}

interface TemplateConfig {
  textColor?: string
  accentColor?: string
  correctColor?: string
  fontFamily?: string
  questionTypes?: Record<string, { bg1?: string; bg2?: string; bgType?: string; bgImage?: string }>
  separator?: { bg1?: string; bg2?: string; bgType?: string; bgImage?: string }
  qrPage?: { bg1?: string; bg2?: string; bgType?: string; bgImage?: string }
  pages?: Array<{ id: string; bg1?: string; bg2?: string; bgType?: string; bgImage?: string }>
}

interface QuizData {
  id: string
  name: string
  sequence: any[]
  questions: QuestionData[]
  template_id?: string
}

function bgFromConfig(cfg: TemplateConfig | null, qType?: string, slideType?: string): React.CSSProperties {
  if (!cfg) return {}
  let bg: any = null
  if (slideType === 'separator' && cfg.separator) bg = cfg.separator
  else if (slideType === 'qr_page' && cfg.qrPage) bg = cfg.qrPage
  else if (qType && cfg.questionTypes?.[qType]) bg = cfg.questionTypes[qType]
  if (!bg) return {}
  if (bg.bgType === 'gradient' && bg.bg1 && bg.bg2)
    return { background: `linear-gradient(135deg, ${bg.bg1}, ${bg.bg2})` }
  if (bg.bgType === 'image' && bg.bgImage)
    return { background: `url(${bg.bgImage}) center/cover` }
  if (bg.bg1) return { backgroundColor: bg.bg1 }
  return {}
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildSlides(quiz: QuizData): Slide[] {
  if (!quiz.sequence || quiz.sequence.length === 0) {
    return quiz.questions.map(q => ({ type: 'question' as SlideType, question: q }))
  }

  const qMap = new Map(quiz.questions.map(q => [q.id, q]))
  const slides: Slide[] = []

  for (const item of quiz.sequence) {
    if (item.type === 'question') {
      const q = qMap.get(item.questionId)
      if (q) slides.push({ type: 'question', question: q })
    } else if (item.type === 'separator') {
      slides.push({ type: 'separator', title: item.title || 'Opakování odpovědí' })
      const prevQuestions = slides
        .filter(s => s.type === 'question' && !s.showAnswer)
        .map(s => ({ type: 'question' as SlideType, question: s.question!, showAnswer: true }))
      slides.push(...prevQuestions)
    } else {
      slides.push(item as Slide)
    }
  }

  return slides
}

function getMaxPhase(slide: Slide): number {
  if (!slide.question) return 0
  const q = slide.question
  if (q.type === 'bonus') return (q.options?.length ?? 0)
  if (q.type === 'audio') return 2
  if (q.type === 'video') return 2
  return 1
}

// ─── Slide renderers ──────────────────────────────────────────────────────────

function PageSlide({ slide }: { slide: Slide }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-16 gap-6">
      {slide.title && <h1 className="text-5xl font-black text-white leading-tight">{slide.title}</h1>}
      {slide.content && <p className="text-2xl text-gray-300 max-w-3xl">{slide.content}</p>}
    </div>
  )
}

function RoundStartSlide({ slide }: { slide: Slide }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center gap-4">
      <div className="text-violet-400 text-xl font-bold tracking-widest uppercase">
        Kolo {slide.roundNumber}
      </div>
      <h1 className="text-6xl font-black text-white">{slide.title || `Kolo ${slide.roundNumber}`}</h1>
      {slide.subtitle && <p className="text-2xl text-gray-400 mt-2">{slide.subtitle}</p>}
    </div>
  )
}

function SeparatorSlide({ slide }: { slide: Slide }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6">
      <div className="w-24 h-1 bg-violet-500 rounded-full" />
      <h2 className="text-4xl font-bold text-violet-300">{slide.title || 'Opakování odpovědí'}</h2>
      <div className="w-24 h-1 bg-violet-500 rounded-full" />
    </div>
  )
}

const optionColors = ['bg-blue-600', 'bg-emerald-600', 'bg-amber-600', 'bg-red-600', 'bg-violet-600', 'bg-pink-600']
const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F']

function QuestionSlide({ slide, phase }: { slide: Slide; phase: number }) {
  const q = slide.question!
  const showAnswer = slide.showAnswer || phase >= 1
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (q.type === 'audio' && phase === 1 && audioRef.current) {
      audioRef.current.play().catch(() => {})
    }
  }, [phase, q.type])

  return (
    <div className="flex flex-col h-full px-16 py-12 gap-8">
      <div className="flex-1 flex items-center justify-center">
        <h2 className="text-4xl font-bold text-white text-center leading-tight max-w-4xl">{q.text}</h2>
      </div>

      {q.type === 'simple' && showAnswer && (
        <div className="flex justify-center">
          <div className="bg-emerald-500/20 border border-emerald-500/50 rounded-2xl px-10 py-5 text-3xl font-bold text-emerald-300">
            {q.correct_answer}
          </div>
        </div>
      )}

      {(q.type === 'ab' || q.type === 'abcdef') && (
        <div className="grid grid-cols-2 gap-4 max-w-4xl mx-auto w-full">
          {(q.options || []).map((opt, i) => (
            <div key={i}
              className={`rounded-2xl px-6 py-4 flex items-center gap-4 transition-all ${
                showAnswer && opt.correct
                  ? 'bg-emerald-500/30 border-2 border-emerald-400 scale-105'
                  : showAnswer && !opt.correct
                  ? 'bg-white/[0.04] border border-white/[0.08] opacity-40'
                  : 'bg-white/[0.08] border border-white/[0.12]'
              }`}>
              <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white shrink-0 ${optionColors[i] || 'bg-gray-600'}`}>
                {optionLetters[i]}
              </span>
              <span className="text-lg font-semibold text-white">{opt.text}</span>
              {showAnswer && opt.correct && <span className="ml-auto text-emerald-400 text-2xl">✓</span>}
            </div>
          ))}
        </div>
      )}

      {q.type === 'bonus' && (
        <div className="flex flex-col gap-3 max-w-3xl mx-auto w-full">
          {(q.options || []).map((opt, i) => (
            <div key={i}
              className={`rounded-xl px-6 py-3 flex items-center gap-4 transition-all duration-300 ${
                phase > i
                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-200'
                  : 'bg-white/[0.04] border border-white/[0.06]'
              }`}>
              <span className="text-sm font-bold text-emerald-400 w-4">{i + 1}.</span>
              <span className={`text-xl font-semibold transition-colors ${phase > i ? 'text-white' : 'text-transparent'}`}>
                {opt.text}
              </span>
            </div>
          ))}
        </div>
      )}

      {q.type === 'audio' && (
        <div className="flex flex-col items-center gap-6">
          {phase >= 1 && (
            <div className="flex flex-col items-center gap-3">
              <Volume2 size={48} className="text-violet-400 animate-pulse" />
              <audio ref={audioRef} controls src={q.media_url || ''} className="w-80 opacity-80" />
            </div>
          )}
          {phase >= 2 && (
            <div className="bg-emerald-500/20 border border-emerald-500/50 rounded-2xl px-10 py-5 text-3xl font-bold text-emerald-300">
              {q.correct_answer}
            </div>
          )}
        </div>
      )}

      {q.type === 'video' && (
        <div className="flex flex-col items-center gap-6">
          {phase === 0 && q.media_url && (
            <div className="flex items-center gap-3 text-gray-400 text-lg">
              <Video size={28} className="text-violet-400" />
              <span className="truncate max-w-md">{q.media_url}</span>
            </div>
          )}
          {phase >= 1 && q.media_url && (
            <video src={q.media_url} controls autoPlay className="max-h-64 rounded-xl border border-white/10" />
          )}
          {phase >= 2 && (
            <div className="bg-emerald-500/20 border border-emerald-500/50 rounded-2xl px-10 py-5 text-3xl font-bold text-emerald-300">
              {q.correct_answer}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function QrPageSlide({ slide }: { slide: Slide }) {
  const startUrl = typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.host}/start`
    : 'https://kviz.michaljanda.com/start'
  return (
    <div className="flex h-full">
      {/* Left half — QR */}
      <div className="w-1/2 flex flex-col items-center justify-center gap-6 px-16">
        <div className="bg-white p-5 rounded-3xl shadow-2xl">
          <QRCodeSVG value={startUrl} size={280} level="M" />
        </div>
        <p className="text-gray-400 text-base text-center font-mono">{startUrl}</p>
      </div>
      {/* Right half — content */}
      <div className="w-1/2 flex flex-col items-center justify-center gap-6 px-16 text-center border-l border-white/[0.08]">
        {slide.title && <h2 className="text-4xl font-black text-white leading-tight">{slide.title}</h2>}
        {slide.content && <p className="text-xl text-gray-300 max-w-xl">{slide.content}</p>}
        {!slide.title && !slide.content && (
          <p className="text-gray-600 text-lg">Naskenuj QR kód a sleduj kvíz na telefonu</p>
        )}
      </div>
    </div>
  )
}

// ─── Hlavní komponenta ────────────────────────────────────────────────────────

export default function PlayPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.id as string

  const [quiz, setQuiz] = useState<QuizData | null>(null)
  const [slides, setSlides] = useState<Slide[]>([])
  const [slideIndex, setSlideIndex] = useState(0)
  const [phase, setPhase] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showInfo, setShowInfo] = useState(true)
  const [tmpl, setTmpl] = useState<TemplateConfig | null>(null)

  useEffect(() => {
    fetch(`/api/quizzes/${quizId}`)
      .then(r => r.json())
      .then((data: QuizData) => {
        setQuiz(data)
        setSlides(buildSlides(data))
        if (data.template_id) {
          fetch(`/api/templates/${data.template_id}`)
            .then(r => r.json())
            .then(t => { if (t.config) setTmpl(t.config) })
            .catch(() => {})
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [quizId])

  const currentSlide = slides[slideIndex]
  const maxPhase = currentSlide ? getMaxPhase(currentSlide) : 0

  const pushState = useCallback((si: number, ph: number) => {
    const body = JSON.stringify({ slideIndex: si, phase: ph })
    // Per-quiz state (watch page compatibility)
    fetch(`/api/quizzes/${quizId}/state`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body,
    }).catch(() => {})
    // Global active state (/start page)
    fetch('/api/active', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quizId, slideIndex: si, phase: ph }),
    }).catch(() => {})
  }, [quizId])

  // Oznámit aktivní kvíz při prvním načtení
  useEffect(() => {
    if (!quiz) return
    fetch('/api/active', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quizId, slideIndex: 0, phase: 0 }),
    }).catch(() => {})
  }, [quiz, quizId])

  const handleClose = useCallback(() => {
    fetch('/api/active', { method: 'DELETE' }).catch(() => {})
    router.push('/admin/quizzes')
  }, [router])

  const handleForward = useCallback(() => {
    if (!currentSlide) return
    if (phase < maxPhase) {
      const p = phase + 1
      setPhase(p)
      pushState(slideIndex, p)
    } else if (slideIndex < slides.length - 1) {
      const si = slideIndex + 1
      setSlideIndex(si)
      setPhase(0)
      pushState(si, 0)
    }
  }, [currentSlide, phase, maxPhase, slideIndex, slides.length, pushState])

  const handleBack = useCallback(() => {
    if (phase > 0) {
      const p = phase - 1
      setPhase(p)
      pushState(slideIndex, p)
    } else if (slideIndex > 0) {
      const si = slideIndex - 1
      const prevMax = getMaxPhase(slides[si])
      setSlideIndex(si)
      setPhase(prevMax)
      pushState(si, prevMax)
    }
  }, [phase, slideIndex, slides, pushState])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); handleForward() }
      if (e.key === 'ArrowLeft') { e.preventDefault(); handleBack() }
      if (e.key === 'Escape') handleClose()
      if (e.key === 'h' || e.key === 'H') setShowInfo(v => !v)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleForward, handleBack, handleClose])

  if (loading) return (
    <div className="min-h-screen bg-[#08090f] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!quiz || slides.length === 0) return (
    <div className="min-h-screen bg-[#08090f] flex items-center justify-center text-white">
      <div className="text-center">
        <p className="text-2xl font-bold mb-4">Kvíz nenalezen nebo neobsahuje otázky</p>
        <button onClick={() => router.push('/admin/quizzes')}
          className="px-6 py-3 bg-violet-600 rounded-xl hover:bg-violet-500 transition-colors">
          Zpět na kvízy
        </button>
      </div>
    </div>
  )

  const slide = slides[slideIndex]
  const canGoBack = slideIndex > 0 || phase > 0
  const canGoForward = slideIndex < slides.length - 1 || phase < maxPhase
  const typeLabel = slide.type === 'question'
    ? `${slide.question?.type?.toUpperCase()}${slide.showAnswer ? ' (odpověď)' : ''}`
    : slide.type.toUpperCase()

  const tmplStyle: React.CSSProperties = tmpl ? {
    fontFamily: tmpl.fontFamily || undefined,
    color: tmpl.textColor || undefined,
  } : {}

  const slideStyle: React.CSSProperties = slide.type === 'question' && slide.question
    ? bgFromConfig(tmpl, slide.question.type)
    : slide.type === 'separator'
    ? bgFromConfig(tmpl, undefined, 'separator')
    : slide.type === 'qr_page'
    ? bgFromConfig(tmpl, undefined, 'qr_page')
    : {}

  return (
    <div className="min-h-screen bg-[#08090f] text-white flex flex-col select-none" style={tmplStyle}>

      {/* Info bar */}
      {showInfo && (
        <div className="flex items-center gap-4 px-6 py-3 bg-black/60 border-b border-white/[0.08] text-sm shrink-0">
          <button onClick={handleClose}
            className="flex items-center gap-1.5 text-gray-500 hover:text-white transition-colors mr-2">
            <X size={14} /> Zavřít
          </button>
          <span className="text-gray-600">|</span>
          <span className="font-bold text-white truncate max-w-xs">{quiz.name}</span>
          <span className="text-gray-600">|</span>
          <span className="text-gray-400">
            Slide <span className="text-white font-bold">{slideIndex + 1}</span>/{slides.length}
          </span>
          <span className="text-gray-600">|</span>
          <span className="text-violet-300 text-xs font-mono">{typeLabel}</span>
          <span className="text-gray-600">|</span>
          <span className="text-gray-500 text-xs">Fáze <span className="text-white">{phase}</span>/{maxPhase}</span>
          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={() => window.open('/start', '_blank')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600/30 border border-violet-500/40 text-violet-300 hover:bg-violet-600/50 hover:text-white transition-colors text-xs font-semibold">
              <Eye size={13} /> Divák (/start)
            </button>
            <span className="text-gray-600 text-xs">H = skryj lištu</span>
          </div>
        </div>
      )}

      {/* Slide content */}
      <div className="flex-1 relative overflow-hidden transition-all duration-500" style={slideStyle}>
        {!showInfo && (
          <button onClick={() => setShowInfo(true)}
            className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-black/40 text-gray-600 hover:text-white transition-colors">
            <Info size={16} />
          </button>
        )}
        {slide.type === 'page' && <PageSlide slide={slide} />}
        {slide.type === 'round_start' && <RoundStartSlide slide={slide} />}
        {slide.type === 'separator' && <SeparatorSlide slide={slide} />}
        {slide.type === 'question' && <QuestionSlide slide={slide} phase={phase} />}
        {slide.type === 'qr_page' && <QrPageSlide slide={slide} />}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between px-8 py-5 bg-black/40 border-t border-white/[0.06] shrink-0">
        <button
          onClick={handleBack}
          disabled={!canGoBack}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] disabled:opacity-20 disabled:cursor-not-allowed transition-colors font-semibold">
          <ChevronLeft size={20} /> Zpět
        </button>

        {maxPhase > 0 && (
          <div className="flex items-center gap-2">
            {Array.from({ length: maxPhase + 1 }).map((_, i) => (
              <div key={i}
                className={`w-2 h-2 rounded-full transition-all ${i <= phase ? 'bg-violet-400 scale-125' : 'bg-white/20'}`}
              />
            ))}
          </div>
        )}

        <button
          onClick={handleForward}
          disabled={!canGoForward}
          className="flex items-center gap-2 px-8 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-20 disabled:cursor-not-allowed transition-colors font-bold shadow-lg shadow-violet-500/30">
          {phase < maxPhase
            ? slide.question?.type === 'bonus'
              ? `Odhal #${phase + 1}`
              : 'Zobraz odpověď'
            : slideIndex < slides.length - 1
            ? 'Další'
            : 'Konec'}
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  )
}
