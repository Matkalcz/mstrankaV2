// app/play/[id]/page.tsx — Moderátorský přehrávač
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Eye, X, Volume2, Video, Music, ImageIcon, Layers, AlignLeft, QrCode, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

// ─── Typy ─────────────────────────────────────────────────────────────────────

interface QuestionData {
  id: string
  text: string
  type: 'simple' | 'ab' | 'abcdef' | 'bonus' | 'audio' | 'video' | 'image'
  correct_answer?: string
  options?: { label?: string; text: string; correct?: boolean; isCorrect?: boolean }[]
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
    } else if (item.type === 'round_start') {
      slides.push({ type: 'round_start', title: item.title, subtitle: item.subtitle, roundNumber: item.roundNumber })
    } else if (item.type === 'qr_page') {
      slides.push({ type: 'qr_page', title: item.title, content: item.content })
    } else if (item.type === 'page') {
      slides.push({ type: 'page', title: item.title, content: item.content })
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

// ─── Slide icon for sidebar ───────────────────────────────────────────────────

function slideIcon(slide: Slide) {
  if (slide.type === 'separator') return <Layers size={12} />
  if (slide.type === 'qr_page') return <QrCode size={12} />
  if (slide.type === 'round_start') return <Layers size={12} className="text-violet-400" />
  if (!slide.question) return <AlignLeft size={12} />
  const t = slide.question.type
  if (t === 'audio') return <Music size={12} className="text-cyan-400" />
  if (t === 'video') return <Video size={12} className="text-pink-400" />
  if (t === 'image') return <ImageIcon size={12} className="text-rose-400" />
  return <AlignLeft size={12} />
}

function slideLabel(slide: Slide, idx: number): string {
  if (slide.type === 'separator') return slide.title || 'Oddělovač'
  if (slide.type === 'qr_page') return 'QR stránka'
  if (slide.type === 'round_start') return slide.title || `Kolo ${slide.roundNumber}`
  if (slide.type === 'page') return slide.title || 'Stránka'
  if (slide.question) return slide.question.text
  return `Slide ${idx + 1}`
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

const OPTION_COLORS = [
  'bg-blue-600 border-blue-500',
  'bg-emerald-600 border-emerald-500',
  'bg-amber-600 border-amber-500',
  'bg-red-600 border-red-500',
  'bg-violet-600 border-violet-500',
  'bg-pink-600 border-pink-500',
]
const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

function QuestionSlide({ slide, phase }: { slide: Slide; phase: number }) {
  const q = slide.question!
  const showAnswer = slide.showAnswer || phase >= 1
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (q.type === 'audio' && phase === 1 && audioRef.current) {
      audioRef.current.play().catch(() => {})
    }
  }, [phase, q.type])

  const opts = (q.options || []).map(o => ({
    text: o.text,
    correct: o.correct ?? (o as any).isCorrect ?? false,
  }))

  return (
    <div className="flex flex-col h-full px-12 py-10 gap-8">
      <div className="flex-1 flex items-center justify-center">
        <h2 className="text-4xl font-bold text-white text-center leading-tight max-w-4xl">{q.text}</h2>
      </div>

      {/* simple */}
      {q.type === 'simple' && showAnswer && (
        <div className="flex justify-center">
          <div className="bg-emerald-500/20 border border-emerald-500/50 rounded-2xl px-10 py-5 text-3xl font-bold text-emerald-300">
            {q.correct_answer}
          </div>
        </div>
      )}

      {/* abcdef / ab */}
      {(q.type === 'ab' || q.type === 'abcdef') && opts.length > 0 && (
        <div className="grid grid-cols-2 gap-4 max-w-4xl mx-auto w-full">
          {opts.map((opt, i) => (
            <div key={i}
              className={`rounded-2xl px-5 py-4 flex items-center gap-4 border transition-all duration-300 ${
                showAnswer && opt.correct
                  ? 'bg-emerald-500/25 border-emerald-400 scale-[1.02] shadow-lg shadow-emerald-500/20'
                  : showAnswer && !opt.correct
                  ? 'bg-white/[0.03] border-white/[0.06] opacity-35'
                  : 'bg-white/[0.08] border-white/[0.12]'
              }`}>
              <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white shrink-0 border ${OPTION_COLORS[i] || 'bg-gray-600 border-gray-500'}`}>
                {OPTION_LETTERS[i]}
              </span>
              <span className="text-lg font-semibold text-white leading-snug">{opt.text}</span>
              {showAnswer && opt.correct && <span className="ml-auto text-emerald-400 text-2xl font-bold">✓</span>}
            </div>
          ))}
        </div>
      )}

      {/* bonus */}
      {q.type === 'bonus' && (
        <div className="flex flex-col gap-3 max-w-3xl mx-auto w-full">
          {opts.map((opt, i) => (
            <div key={i}
              className={`rounded-xl px-6 py-3.5 flex items-center gap-4 border transition-all duration-300 ${
                phase > i
                  ? 'bg-emerald-500/20 border-emerald-500/40'
                  : 'bg-white/[0.04] border-white/[0.06]'
              }`}>
              <span className={`text-sm font-black w-6 shrink-0 ${phase > i ? 'text-emerald-400' : 'text-gray-600'}`}>{i + 1}.</span>
              <span className={`text-xl font-semibold transition-all ${phase > i ? 'text-white' : 'text-transparent select-none'}`}>
                {opt.text}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* audio */}
      {q.type === 'audio' && (
        <div className="flex flex-col items-center gap-6">
          {phase >= 1 && (
            <div className="flex flex-col items-center gap-3">
              <Volume2 size={48} className="text-cyan-400 animate-pulse" />
              <audio ref={audioRef} controls src={q.media_url || ''} className="w-80" />
            </div>
          )}
          {phase >= 2 && (
            <div className="bg-emerald-500/20 border border-emerald-500/50 rounded-2xl px-10 py-5 text-3xl font-bold text-emerald-300">
              {q.correct_answer}
            </div>
          )}
        </div>
      )}

      {/* video */}
      {q.type === 'video' && (
        <div className="flex flex-col items-center gap-6">
          {phase === 0 && q.media_url && (
            <div className="flex items-center gap-3 text-gray-400 text-lg">
              <Video size={28} className="text-pink-400" />
              <span className="truncate max-w-md font-mono text-sm">{q.media_url}</span>
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

      {/* image */}
      {q.type === 'image' && (
        <div className="flex flex-col items-center gap-4">
          {q.media_url && (
            <img src={q.media_url} alt="" className="max-h-64 rounded-xl border border-white/10 object-contain" />
          )}
          {showAnswer && q.correct_answer && (
            <div className="bg-emerald-500/20 border border-emerald-500/50 rounded-2xl px-10 py-4 text-2xl font-bold text-emerald-300">
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
      <div className="w-1/2 flex flex-col items-center justify-center gap-6 px-16">
        <div className="bg-white p-5 rounded-3xl shadow-2xl">
          <QRCodeSVG value={startUrl} size={260} level="M" />
        </div>
        <p className="text-gray-400 text-sm text-center font-mono">{startUrl}</p>
      </div>
      <div className="w-1/2 flex flex-col items-center justify-center gap-6 px-16 text-center border-l border-white/[0.08]">
        {slide.title && <h2 className="text-4xl font-black text-white leading-tight">{slide.title}</h2>}
        {slide.content && <p className="text-xl text-gray-300 max-w-xl">{slide.content}</p>}
        {!slide.title && !slide.content && (
          <p className="text-gray-500 text-lg">Naskenuj QR kód a sleduj kvíz na telefonu</p>
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
  const [tmpl, setTmpl] = useState<TemplateConfig | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    fetch(`/api/quizzes/${quizId}`)
      .then(r => r.json())
      .then((data: QuizData) => {
        setQuiz(data)
        const built = buildSlides(data)
        setSlides(built)
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
    fetch(`/api/quizzes/${quizId}/state`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body,
    }).catch(() => {})
    fetch('/api/active', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quizId, slideIndex: si, phase: ph }),
    }).catch(() => {})
  }, [quizId])

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
      const p = phase + 1; setPhase(p); pushState(slideIndex, p)
    } else if (slideIndex < slides.length - 1) {
      const si = slideIndex + 1; setSlideIndex(si); setPhase(0); pushState(si, 0)
    }
  }, [currentSlide, phase, maxPhase, slideIndex, slides.length, pushState])

  const handleBack = useCallback(() => {
    if (phase > 0) {
      const p = phase - 1; setPhase(p); pushState(slideIndex, p)
    } else if (slideIndex > 0) {
      const si = slideIndex - 1
      const prevMax = getMaxPhase(slides[si])
      setSlideIndex(si); setPhase(prevMax); pushState(si, prevMax)
    }
  }, [phase, slideIndex, slides, pushState])

  const goToSlide = (idx: number) => {
    setSlideIndex(idx); setPhase(0); pushState(idx, 0)
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); handleForward() }
      if (e.key === 'ArrowLeft') { e.preventDefault(); handleBack() }
      if (e.key === 'Escape') handleClose()
      if (e.key === 's' || e.key === 'S') setSidebarOpen(v => !v)
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
      <div className="text-center space-y-4">
        <p className="text-2xl font-bold">Kvíz nenalezen nebo neobsahuje otázky</p>
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

  const nextLabel = phase < maxPhase
    ? (slide.question?.type === 'bonus' ? `Odhal #${phase + 1}` : 'Zobraz odpověď')
    : slideIndex < slides.length - 1 ? 'Další' : 'Konec'

  return (
    <div className="h-screen bg-[#08090f] text-white flex flex-col select-none overflow-hidden" style={tmplStyle}>

      {/* ── Top bar ── */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-black/70 border-b border-white/[0.08] shrink-0 text-sm">
        <button onClick={handleClose}
          className="flex items-center gap-1.5 text-gray-500 hover:text-white transition-colors mr-1">
          <X size={14} /> Zavřít
        </button>
        <span className="text-white/20">|</span>
        <span className="font-semibold text-white/90 truncate max-w-[200px]">{quiz.name}</span>
        <span className="text-white/20">|</span>
        <span className="text-gray-400 tabular-nums">
          <span className="text-white font-bold">{slideIndex + 1}</span>/{slides.length}
        </span>
        {maxPhase > 0 && <>
          <span className="text-white/20">|</span>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: maxPhase + 1 }).map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full transition-all ${i <= phase ? 'bg-violet-400' : 'bg-white/20'}`} />
            ))}
          </div>
        </>}
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => window.open('/start', '_blank')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-violet-600/25 border border-violet-500/30 text-violet-300 hover:bg-violet-600/40 transition-colors text-xs font-semibold">
            <Eye size={12} /> Divák
          </button>
          <button onClick={() => setSidebarOpen(v => !v)}
            className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/[0.06] transition-colors"
            title="Přepnout panel slidů (S)">
            {sidebarOpen ? <PanelLeftClose size={15} /> : <PanelLeftOpen size={15} />}
          </button>
        </div>
      </div>

      {/* ── Body: sidebar + main ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left sidebar — slide list */}
        {sidebarOpen && (
          <div className="w-64 shrink-0 bg-black/40 border-r border-white/[0.07] flex flex-col overflow-hidden">
            <div className="px-3 py-2 border-b border-white/[0.06]">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                Slidy ({slides.length})
              </p>
            </div>
            <div className="flex-1 overflow-y-auto py-1">
              {slides.map((s, idx) => {
                const isCurrent = idx === slideIndex
                const isAnswer = s.showAnswer
                const isSep = s.type === 'separator'
                const isSpecial = s.type !== 'question'
                return (
                  <button
                    key={idx}
                    onClick={() => goToSlide(idx)}
                    className={`w-full text-left flex items-start gap-2.5 px-3 py-2.5 transition-all border-l-2 ${
                      isCurrent
                        ? 'bg-violet-600/20 border-violet-500 text-white'
                        : 'border-transparent hover:bg-white/[0.04] text-gray-400 hover:text-gray-200'
                    } ${isSep ? 'border-t border-white/[0.06] mt-1 pt-3' : ''}`}
                  >
                    <span className={`mt-0.5 shrink-0 ${isCurrent ? 'text-violet-400' : isSpecial ? 'text-gray-500' : 'text-gray-600'}`}>
                      {slideIcon(s)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs leading-snug line-clamp-2 ${isCurrent ? 'text-white font-medium' : ''}`}>
                        {isAnswer ? <span className="text-emerald-400 font-semibold text-[10px] block mb-0.5">↩ odpověď</span> : null}
                        {slideLabel(s, idx)}
                      </p>
                      {s.question && (
                        <p className="text-[10px] text-gray-600 mt-0.5 uppercase tracking-wide">{s.question.type}</p>
                      )}
                    </div>
                    {isCurrent && (
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0 mt-1.5" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Main slide area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 relative overflow-hidden transition-all duration-300" style={slideStyle}>
            {slide.type === 'page' && <PageSlide slide={slide} />}
            {slide.type === 'round_start' && <RoundStartSlide slide={slide} />}
            {slide.type === 'separator' && <SeparatorSlide slide={slide} />}
            {slide.type === 'question' && <QuestionSlide slide={slide} phase={phase} />}
            {slide.type === 'qr_page' && <QrPageSlide slide={slide} />}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between px-6 py-4 bg-black/50 border-t border-white/[0.06] shrink-0 gap-4">
            <button onClick={handleBack} disabled={!canGoBack}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.07] hover:bg-white/[0.13] border border-white/[0.08] disabled:opacity-20 disabled:cursor-not-allowed transition-all font-semibold text-sm">
              <ChevronLeft size={18} /> Zpět
            </button>

            <div className="flex-1 flex items-center justify-center">
              {slide.type === 'question' && slide.question && (
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="px-2 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] font-mono uppercase">
                    {slide.question.type}
                  </span>
                  {slide.question.points && (
                    <span>{slide.question.points} b.</span>
                  )}
                  {slide.question.difficulty && (
                    <span className="capitalize">{slide.question.difficulty}</span>
                  )}
                </div>
              )}
            </div>

            <button onClick={handleForward} disabled={!canGoForward}
              className="flex items-center gap-2 px-7 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-20 disabled:cursor-not-allowed transition-all font-bold text-sm shadow-lg shadow-violet-500/25 border border-violet-500/50">
              {nextLabel}
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
