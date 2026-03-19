// app/watch/[id]/page.tsx — Veřejný fullscreen pohled (diváci / projektor)
'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Volume2, Video } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

// ─── Typy ─────────────────────────────────────────────────────────────────────

interface QuestionData {
  id: string
  text: string
  type: 'simple' | 'abcdef' | 'bonus' | 'audio' | 'video' | 'image'
  correct_answer?: string
  options?: { label?: string; text: string; correct?: boolean; isCorrect?: boolean }[]
  media_url?: string
  points: number
}

type SlideType = 'page' | 'round_start' | 'question' | 'separator' | 'qr_page'

interface BgCfg {
  bgType?: string; bg1?: string; bg2?: string; bgImage?: string
}

interface Slide {
  type: SlideType
  title?: string
  content?: string
  subtitle?: string
  roundNumber?: number
  templatePageId?: string
  question?: QuestionData
  showAnswer?: boolean
  noAnswerPhase?: boolean
}

interface TemplateConfig {
  textColor?: string
  accentColor?: string
  correctColor?: string
  fontFamily?: string
  questionTypes?: Record<string, BgCfg>
  separator?: BgCfg
  qrPage?: BgCfg
  roundStart?: BgCfg
  pages?: Array<{ id: string; name?: string } & BgCfg>
}

interface QuizData {
  id: string
  name: string
  sequence: any[]
  questions: QuestionData[]
  template_id?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function bgStyle(cfg: BgCfg | undefined | null): React.CSSProperties {
  if (!cfg) return {}
  if (cfg.bgType === 'gradient' && cfg.bg1 && cfg.bg2)
    return { background: `linear-gradient(135deg, ${cfg.bg1}, ${cfg.bg2})` }
  if (cfg.bgType === 'image' && cfg.bgImage)
    return { backgroundColor: cfg.bg1 || '#0a0a1a', backgroundImage: `url(${cfg.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }
  if (cfg.bg1) return { backgroundColor: cfg.bg1 }
  return {}
}

function slideBackground(slide: Slide, tmpl: TemplateConfig | null): React.CSSProperties {
  if (!tmpl) return {}
  if (slide.type === 'question' && slide.question)
    return bgStyle(tmpl.questionTypes?.[slide.question.type])
  if (slide.type === 'separator') return bgStyle(tmpl.separator)
  if (slide.type === 'qr_page') return bgStyle(tmpl.qrPage)
  if (slide.type === 'round_start') return bgStyle(tmpl.roundStart as BgCfg | undefined)
  if (slide.type === 'page') {
    const page = slide.templatePageId
      ? tmpl.pages?.find(p => p.id === slide.templatePageId)
      : tmpl.pages?.[0]
    return bgStyle(page)
  }
  return {}
}

function buildSlides(quiz: QuizData): Slide[] {
  // Guard against bad/error API responses
  if (!quiz || typeof quiz !== 'object' || ('error' in quiz)) return []
  const questions = Array.isArray(quiz.questions) ? quiz.questions : []
  const sequence = Array.isArray(quiz.sequence) ? quiz.sequence : []

  if (sequence.length === 0) {
    return questions.map(q => ({ type: 'question' as SlideType, question: q }))
  }
  const hasSeparator = sequence.some(item => item.type === 'separator')
  const qMap = new Map(questions.map(q => [q.id, q]))
  const slides: Slide[] = []

  for (const item of sequence) {
    if (item.type === 'question') {
      if (!item.questionId) continue // prázdný slot ze skeletonu
      const q = qMap.get(item.questionId)
      if (q) slides.push({ type: 'question', question: q, noAnswerPhase: hasSeparator })
    } else if (item.type === 'separator') {
      slides.push({ type: 'separator', title: item.title })
      const prevQ = slides
        .filter(s => s.type === 'question' && !s.showAnswer)
        .map(s => ({ type: 'question' as SlideType, question: s.question!, noAnswerPhase: false }))
      slides.push(...prevQ)
    } else if (item.type === 'round_start') {
      slides.push({ type: 'round_start', title: item.title, subtitle: item.subtitle, roundNumber: item.roundNumber })
    } else if (item.type === 'qr_page') {
      slides.push({ type: 'qr_page', title: item.title, content: item.content })
    } else if (item.type === 'page') {
      slides.push({ type: 'page', title: item.title, content: item.content, templatePageId: item.templatePageId })
    } else {
      slides.push(item as Slide)
    }
  }
  return slides
}

function computeSlideInfo(slides: Slide[], idx: number) {
  let roundNumber: number | undefined
  let questionInRound: number | undefined

  let roundStartIdx = -1
  for (let i = idx - 1; i >= 0; i--) {
    if (slides[i].type === 'round_start') { roundStartIdx = i; roundNumber = slides[i].roundNumber; break }
    if (slides[i].type === 'separator') break
  }

  if (roundStartIdx >= 0 && slides[idx]?.type === 'question' && !slides[idx].showAnswer) {
    let pos = 0
    for (let i = roundStartIdx + 1; i <= idx; i++) {
      if (slides[i].type === 'round_start' || slides[i].type === 'separator') break
      if (slides[i].type === 'question' && !slides[i].showAnswer) pos++
    }
    questionInRound = pos
  }

  return { roundNumber, questionInRound }
}

// ─── Option colors ─────────────────────────────────────────────────────────────

const OPTION_COLORS = [
  { bg: 'bg-blue-600', border: 'border-blue-500', label: 'bg-blue-700' },
  { bg: 'bg-emerald-600', border: 'border-emerald-500', label: 'bg-emerald-700' },
  { bg: 'bg-amber-500', border: 'border-amber-400', label: 'bg-amber-600' },
  { bg: 'bg-red-600', border: 'border-red-500', label: 'bg-red-700' },
  { bg: 'bg-violet-600', border: 'border-violet-500', label: 'bg-violet-700' },
  { bg: 'bg-pink-600', border: 'border-pink-500', label: 'bg-pink-700' },
]
const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

// ─── SlideView ─────────────────────────────────────────────────────────────────

function SlideView({ slide, phase, tmpl, slideIdx, slides }: {
  slide: Slide; phase: number; tmpl: TemplateConfig | null; slideIdx: number; slides: Slide[]
}) {
  const q = slide.question
  const audioRef = useRef<HTMLAudioElement>(null)

  const textColor = tmpl?.textColor || '#ffffff'
  const accentColor = tmpl?.accentColor || '#8b5cf6'
  const correctColor = tmpl?.correctColor || '#10b981'
  const { roundNumber, questionInRound } = computeSlideInfo(slides, slideIdx)

  useEffect(() => {
    if (q?.type === 'audio' && phase === 1 && audioRef.current) {
      audioRef.current.play().catch(() => {})
    }
  }, [phase, q?.type])

  const startUrl = typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.host}/start`
    : 'https://kviz.michaljanda.com/start'

  // Page slide — pouze pozadí ze šablony, žádný text
  if (slide.type === 'page') {
    return <div className="h-full w-full" />
  }

  if (slide.type === 'round_start') return (
    <div className="flex flex-col h-full">
      {/* Číslo kola — střed, střední velikost */}
      <div className="flex items-center justify-center pt-16 pb-4 shrink-0">
        {slide.roundNumber !== undefined && (
          <span className="text-3xl font-bold tracking-wide" style={{ color: textColor, opacity: 0.55 }}>
            {slide.roundNumber}.kolo
          </span>
        )}
      </div>
      {/* Název kola — velký font uprostřed */}
      <div className="flex-1 flex items-center justify-center px-16">
        <h1 className="text-8xl font-black text-center leading-tight" style={{ color: textColor }}>
          {slide.title || ''}
        </h1>
      </div>
      {/* Popisek */}
      <div className="flex justify-center px-16 pb-4 shrink-0 min-h-[64px]">
        {slide.subtitle && (
          <p className="text-4xl text-center" style={{ color: textColor, opacity: 0.65 }}>
            {slide.subtitle}
          </p>
        )}
      </div>
      {/* Footer — malé "Kolo X" úplně dole */}
      <div className="flex items-center justify-center pb-5 shrink-0">
        {slide.roundNumber !== undefined && (
          <span className="text-base font-semibold tracking-widest uppercase" style={{ color: textColor, opacity: 0.4 }}>
            Kolo {slide.roundNumber}
          </span>
        )}
      </div>
    </div>
  )

  if (slide.type === 'separator') return (
    <div className="flex flex-col items-center justify-center h-full gap-8">
      {slide.title && <h2 className="text-5xl font-bold text-center px-16" style={{ color: textColor }}>{slide.title}</h2>}
    </div>
  )

  if (slide.type === 'qr_page') {
    return (
      <div className="flex flex-col sm:flex-row h-full overflow-hidden">
        <div className="flex flex-col items-center justify-center gap-4 sm:gap-8 sm:w-1/2 h-full px-6 sm:px-20">
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-2xl">
            <QRCodeSVG value={startUrl} size={220} level="M" />
          </div>
          <p className="font-mono text-xs sm:text-lg text-center break-all max-w-xs sm:max-w-none" style={{ color: textColor, opacity: 0.45 }}>{startUrl}</p>
        </div>
        {(slide.title || slide.content) && (
          <div className="hidden sm:flex w-1/2 flex-col items-center justify-center gap-6 px-20 text-center border-l border-white/[0.08]">
            {slide.title && <h2 className="text-5xl font-black leading-tight" style={{ color: textColor }}>{slide.title}</h2>}
            {slide.content && <p className="text-2xl max-w-xl" style={{ color: textColor, opacity: 0.8 }}>{slide.content}</p>}
          </div>
        )}
      </div>
    )
  }

  if (!q) return null

  const showAnswer = slide.showAnswer || phase >= 1
  const opts = (q.options || []).map(o => ({
    text: o.text,
    correct: o.correct ?? (o as any).isCorrect ?? false,
  }))

  return (
    <div className="flex flex-col h-full">

      {/* ── Číslo otázky — velké, uprostřed ── */}
      <div className="flex items-center justify-center pt-10 pb-2 shrink-0">
        {questionInRound !== undefined && (
          <span className="text-7xl font-black leading-none" style={{ color: textColor }}>
            {questionInRound}.
          </span>
        )}
      </div>

      {/* ── Text otázky ── */}
      <div className="flex-1 flex items-center justify-center px-20 py-4">
        <h2 className="text-5xl font-bold text-center leading-tight max-w-5xl" style={{ color: textColor }}>
          {q.text}
        </h2>
      </div>

      {/* ── Odpovědi ── */}
      <div className="px-20 pb-4 shrink-0">

        {q.type === 'simple' && showAnswer && (
          <div className="flex justify-center pb-4">
            <div className="rounded-3xl px-14 py-6 text-4xl font-bold border border-white/25" style={{ color: textColor }}>
              {q.correct_answer}
            </div>
          </div>
        )}

        {q.type === 'abcdef' && opts.length > 0 && (
          <div className="grid grid-cols-2 gap-4 max-w-5xl mx-auto w-full pb-4">
            {opts.map((opt, i) => {
              const col = OPTION_COLORS[i] || OPTION_COLORS[0]
              return (
                <div key={i}
                  className={`rounded-2xl px-8 py-5 flex items-center gap-5 border transition-all duration-300 ${
                    showAnswer && opt.correct ? 'scale-[1.02] shadow-lg'
                    : showAnswer && !opt.correct ? 'opacity-25'
                    : ''
                  }`}
                  style={showAnswer && opt.correct
                    ? { borderColor: correctColor, backgroundColor: correctColor + '22' }
                    : { borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)' }
                  }>
                  <span className={`w-14 h-14 rounded-xl flex items-center justify-center text-lg font-black text-white shrink-0 ${col.label}`}>
                    {OPTION_LETTERS[i]}
                  </span>
                  <span className="text-2xl font-semibold leading-snug" style={{ color: textColor }}>{opt.text}</span>
                  {showAnswer && opt.correct && <span className="ml-auto text-3xl font-bold" style={{ color: correctColor }}>✓</span>}
                </div>
              )
            })}
          </div>
        )}

        {q.type === 'bonus' && (
          <div className="flex flex-col gap-4 max-w-4xl mx-auto w-full pb-4">
            {opts.map((opt, i) => (
              <div key={i} className="rounded-2xl px-8 py-4 flex items-center gap-6 border transition-all duration-500"
                style={phase > i
                  ? { backgroundColor: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.25)' }
                  : { backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' }}>
                <span className="text-xl font-black w-8 shrink-0" style={{ color: phase > i ? textColor : 'rgba(255,255,255,0.2)' }}>
                  {i + 1}.
                </span>
                <span className="text-2xl font-semibold transition-colors duration-500" style={{ color: phase > i ? textColor : 'transparent' }}>
                  {opt.text}
                </span>
              </div>
            ))}
          </div>
        )}

        {q.type === 'audio' && (
          <div className="flex flex-col items-center gap-8 pb-4">
            {phase >= 1 && (
              <div className="flex flex-col items-center gap-4">
                <Volume2 size={72} className="text-cyan-400 animate-pulse" />
                <audio ref={audioRef} controls src={q.media_url || ''} className="w-[500px]" />
              </div>
            )}
            {phase >= 2 && (
              <div className="rounded-3xl px-14 py-6 text-4xl font-bold border border-white/25" style={{ color: textColor }}>
                {q.correct_answer}
              </div>
            )}
          </div>
        )}

        {q.type === 'video' && (
          <div className="flex flex-col items-center gap-6 pb-4">
            {phase >= 1 && q.media_url && (
              <video src={q.media_url} controls autoPlay className="max-h-80 rounded-2xl border border-white/10" />
            )}
            {phase >= 2 && (
              <div className="rounded-3xl px-14 py-6 text-4xl font-bold border border-white/25" style={{ color: textColor }}>
                {q.correct_answer}
              </div>
            )}
          </div>
        )}

        {q.type === 'image' && (
          <div className="flex flex-col items-center gap-6 pb-4">
            {q.media_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={q.media_url} alt="" className="max-h-72 rounded-2xl object-contain" />
            )}
            {showAnswer && q.correct_answer && (
              <div className="rounded-3xl px-14 py-5 text-3xl font-bold border border-white/25" style={{ color: textColor }}>
                {q.correct_answer}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Spodní footer — malé číslo kola ── */}
      <div className="flex items-center justify-center pb-5 pt-2 shrink-0">
        {roundNumber !== undefined && (
          <span className="text-base font-semibold tracking-widest uppercase" style={{ color: textColor, opacity: 0.4 }}>
            Kolo {roundNumber}
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Hlavní komponenta ────────────────────────────────────────────────────────

export default function WatchPage() {
  const params = useParams()
  const quizId = params.id as string

  const [quiz, setQuiz] = useState<QuizData | null>(null)
  const [slides, setSlides] = useState<Slide[]>([])
  const [slideIndex, setSlideIndex] = useState(0)
  const [phase, setPhase] = useState(0)
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState(false)
  const [tmpl, setTmpl] = useState<TemplateConfig | null>(null)

  // Load quiz + template
  useEffect(() => {
    fetch(`/api/quizzes/${quizId}`)
      .then(r => r.json())
      .then((data: any) => {
        if (!data || data.error) { setLoading(false); return }
        const quizData = data as QuizData
        setQuiz(quizData)
        const built = buildSlides(quizData)
        setSlides(built)
        if (quizData.template_id) {
          fetch(`/api/templates/${quizData.template_id}`)
            .then(r => r.json())
            .then(t => { if (t.config) setTmpl(t.config) })
            .catch(() => {})
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [quizId])

  // Poll player state every second
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`/api/quizzes/${quizId}/state`)
        const state = await res.json()
        if (state && typeof state.slideIndex === 'number') {
          setSlideIndex(state.slideIndex)
          setPhase(state.phase ?? 0)
          setActive(true)
        }
      } catch {}
    }
    poll()
    const interval = setInterval(poll, 1000)
    return () => clearInterval(interval)
  }, [quizId])

  if (loading) return (
    <div className="min-h-screen bg-[#08090f] flex items-center justify-center">
      <div className="w-12 h-12 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (slides.length === 0) return (
    <div className="min-h-screen bg-[#08090f] flex flex-col items-center justify-center gap-8 text-white">
      <div className="text-center space-y-3">
        <h1 className="text-5xl font-black tracking-tight">Vítejte na hospodském kvízu</h1>
        <p className="text-2xl text-gray-400">Vyčkejte na zahájení.</p>
      </div>
      <div className="flex items-center gap-3 text-gray-600 text-lg mt-4">
        <div className="w-2.5 h-2.5 bg-violet-500 rounded-full animate-ping" />
        <span>Čeká se na moderátora…</span>
      </div>
    </div>
  )

  const safeIdx = Math.min(slideIndex, slides.length - 1)
  const slide = slides[safeIdx]
  const bg = slideBackground(slide, tmpl)
  const hasBg = Object.keys(bg).length > 0
  const fontFamily = tmpl?.fontFamily || undefined

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden select-none"
      style={{ fontFamily, ...(hasBg ? bg : { background: '#08090f' }) }}>
      <div className="flex-1 overflow-hidden">
        <SlideView slide={slide} phase={phase} tmpl={tmpl} slideIdx={safeIdx} slides={slides} />
      </div>
    </div>
  )
}
