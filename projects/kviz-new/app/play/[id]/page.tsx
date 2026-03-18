// app/play/[id]/page.tsx — Moderátorský přehrávač
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ChevronLeft, ChevronRight, Eye, X, Volume2, Video, Music,
  ImageIcon, Layers, AlignLeft, QrCode, PanelLeftClose, PanelLeftOpen,
  RotateCcw
} from 'lucide-react'
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

interface BgCfg {
  bgType?: string; bg1?: string; bg2?: string; bgImage?: string
}

interface Slide {
  type: SlideType
  title?: string
  content?: string
  subtitle?: string
  roundNumber?: number
  templatePageId?: string   // pro správné pozadí stránky ze šablony
  question?: QuestionData
  showAnswer?: boolean      // slide z opakování po oddělovači — okamžitě zobrazit
  noAnswerPhase?: boolean   // otázka před oddělovačem — přeskočit fázi zobrazení odpovědi
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

// ─── Background helper ────────────────────────────────────────────────────────

function bgStyle(cfg: BgCfg | undefined | null): React.CSSProperties {
  if (!cfg) return {}
  if (cfg.bgType === 'gradient' && cfg.bg1 && cfg.bg2)
    return { background: `linear-gradient(135deg, ${cfg.bg1}, ${cfg.bg2})` }
  if (cfg.bgType === 'image' && cfg.bgImage)
    return { backgroundImage: `url(${cfg.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }
  if (cfg.bg1) return { backgroundColor: cfg.bg1 }
  return {}
}

function slideBackground(slide: Slide, tmpl: TemplateConfig | null): React.CSSProperties {
  if (!tmpl) return {}
  if (slide.type === 'question' && slide.question)
    return bgStyle(tmpl.questionTypes?.[slide.question.type])
  if (slide.type === 'separator')
    return bgStyle(tmpl.separator)
  if (slide.type === 'qr_page')
    return bgStyle(tmpl.qrPage)
  if (slide.type === 'round_start')
    return bgStyle(tmpl.roundStart as BgCfg | undefined)
  if (slide.type === 'page') {
    const page = slide.templatePageId
      ? tmpl.pages?.find(p => p.id === slide.templatePageId)
      : tmpl.pages?.[0]
    return bgStyle(page)
  }
  return {}
}

// ─── Stavba slidů ─────────────────────────────────────────────────────────────

function buildSlides(quiz: QuizData): Slide[] {
  if (!quiz.sequence || quiz.sequence.length === 0) {
    return quiz.questions.map(q => ({ type: 'question' as SlideType, question: q }))
  }

  // Zjistíme, zda je v sekvenci oddělovač — pokud ano, otázky před ním nemají fázi zobrazení odpovědi
  const hasSeparator = quiz.sequence.some(item => item.type === 'separator')

  const qMap = new Map(quiz.questions.map(q => [q.id, q]))
  const slides: Slide[] = []

  for (const item of quiz.sequence) {
    if (item.type === 'question') {
      const q = qMap.get(item.questionId)
      if (q) slides.push({
        type: 'question',
        question: q,
        noAnswerPhase: hasSeparator,   // přeskočíme odpověď — přijde po oddělovači
      })
    } else if (item.type === 'separator') {
      slides.push({ type: 'separator', title: item.title })
      // Přidáme opakování otázek s okamžitě zobrazenou odpovědí
      const prevQuestions = slides
        .filter(s => s.type === 'question' && !s.showAnswer)
        .map(s => ({
          type: 'question' as SlideType,
          question: s.question!,
          showAnswer: true,
          noAnswerPhase: false,
        }))
      slides.push(...prevQuestions)
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

// ─── Fáze slidů ───────────────────────────────────────────────────────────────

function getMaxPhase(slide: Slide): number {
  if (!slide.question) return 0
  if (slide.showAnswer) return 0        // opakování po oddělovači — odpověď ihned, bez fází
  const q = slide.question
  if (q.type === 'bonus') return (q.options?.length ?? 0)
  if (q.type === 'audio') return 2
  if (q.type === 'video') return 2
  if (slide.noAnswerPhase) return 0     // otázka s oddělovačem — přejdi rovnou na další
  return 1                              // otázka bez oddělovače — zobraz odpověď ve fázi
}

// ─── Ikona a popis slidů (sidebar) ───────────────────────────────────────────

function slideIcon(slide: Slide, size = 13) {
  if (slide.type === 'separator') return <Layers size={size} />
  if (slide.type === 'qr_page') return <QrCode size={size} />
  if (slide.type === 'round_start') return <Layers size={size} className="text-violet-400" />
  if (!slide.question) return <AlignLeft size={size} />
  const t = slide.question.type
  if (t === 'audio') return <Music size={size} className="text-cyan-400" />
  if (t === 'video') return <Video size={size} className="text-pink-400" />
  if (t === 'image') return <ImageIcon size={size} className="text-rose-400" />
  return <AlignLeft size={size} />
}

function slideLabel(slide: Slide, idx: number): string {
  if (slide.type === 'separator') return slide.title || 'Oddělovač'
  if (slide.type === 'qr_page') return 'QR stránka'
  if (slide.type === 'round_start') return slide.title || `Kolo ${slide.roundNumber}`
  if (slide.type === 'page') return slide.title || 'Stránka'
  if (slide.question) return slide.question.text
  return `Slide ${idx + 1}`
}

// ─── Thumbnail (mini náhled) ──────────────────────────────────────────────────

function SlideThumbnail({ slide, idx, isCurrent, tmpl, onClick }: {
  slide: Slide; idx: number; isCurrent: boolean; tmpl: TemplateConfig | null; onClick: () => void
}) {
  const bg = slideBackground(slide, tmpl)
  const hasImage = bg.backgroundImage
  const defaultBg = slide.type === 'separator' ? '#1a0a30'
    : slide.type === 'qr_page' ? '#0d1428'
    : slide.type === 'round_start' ? '#1a0f40'
    : '#12141f'

  return (
    <button onClick={onClick}
      className={`w-full text-left flex items-start gap-2.5 px-2.5 py-2 transition-all ${
        isCurrent ? 'bg-white/10' : 'hover:bg-white/[0.05]'
      }`}>
      {/* Number badge */}
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5 ${
        isCurrent ? 'bg-amber-500 text-white' : 'bg-white/15 text-white/50'
      }`}>{idx + 1}</div>

      <div className="flex-1 min-w-0">
        {/* Mini preview box */}
        <div className="w-full rounded-md overflow-hidden relative"
          style={{
            aspectRatio: '16/10',
            border: isCurrent ? '2px solid rgb(245,158,11)' : '2px solid rgba(255,255,255,0.08)',
            backgroundColor: (bg.backgroundColor as string) || defaultBg,
            ...(hasImage ? bg : {}),
          }}>
          {/* Text overlay on images */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 p-1.5 bg-black/20">
            <div className="text-white/80 drop-shadow">{slideIcon(slide, 12)}</div>
            {slide.type === 'question' && slide.question && (
              <p className="text-white text-[7px] leading-tight line-clamp-3 text-center font-medium drop-shadow-lg px-1">
                {slide.question.text}
              </p>
            )}
            {(slide.type === 'page') && slide.title && (
              <p className="text-white text-[8px] leading-tight line-clamp-2 text-center font-bold drop-shadow-lg">
                {slide.title}
              </p>
            )}
          </div>
          {slide.showAnswer && (
            <div className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-500" />
          )}
        </div>
        <p className={`text-[10px] mt-0.5 leading-tight truncate ${
          isCurrent ? 'text-amber-400 font-semibold' : 'text-white/30'
        }`}>
          {slide.showAnswer ? '↩ ' + (slide.question?.text || '').substring(0, 25) : slideLabel(slide, idx).substring(0, 28)}
        </p>
      </div>
    </button>
  )
}

// ─── Slide info (round + question position) ───────────────────────────────────

function computeSlideInfo(slides: Slide[], idx: number) {
  let roundNumber: number | undefined
  let questionInRound: number | undefined
  let totalInRound: number | undefined

  // Find most recent round_start (don't cross a separator)
  let roundStartIdx = -1
  for (let i = idx - 1; i >= 0; i--) {
    if (slides[i].type === 'round_start') { roundStartIdx = i; roundNumber = slides[i].roundNumber; break }
    if (slides[i].type === 'separator') break
  }

  // Count question position within round (only for non-answer slides)
  if (roundStartIdx >= 0 && slides[idx]?.type === 'question' && !slides[idx].showAnswer) {
    let pos = 0, total = 0
    for (let i = roundStartIdx + 1; i < slides.length; i++) {
      if (slides[i].type === 'round_start' || slides[i].type === 'separator') break
      if (slides[i].type === 'question' && !slides[i].showAnswer) {
        total++
        if (i <= idx) pos = total
      }
    }
    questionInRound = pos
    totalInRound = total
  }

  return { roundNumber, questionInRound, totalInRound }
}

// ─── Renderers ────────────────────────────────────────────────────────────────

// Stránka ze šablony — zobrazí jen pozadí (obrázek), bez textového obsahu
function PageSlide({ slide, textColor, roundLabel }: { slide: Slide; textColor: string; roundLabel?: string }) {
  return (
    <div className="relative h-full w-full">
      {/* Stránka zobrazuje pouze pozadí (logo, text jsou součástí obrázku pozadí) */}
      {roundLabel && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2">
          <span className="text-sm font-medium tracking-wide" style={{ color: textColor, opacity: 0.45 }}>
            {roundLabel}
          </span>
        </div>
      )}
    </div>
  )
}

function RoundStartSlide({ slide, textColor, accentColor }: { slide: Slide; textColor: string; accentColor: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center gap-4">
      <div className="text-xl font-bold tracking-widest uppercase" style={{ color: accentColor }}>
        Kolo {slide.roundNumber}
      </div>
      <h1 className="text-6xl font-black" style={{ color: textColor }}>{slide.title || `Kolo ${slide.roundNumber}`}</h1>
      {slide.subtitle && <p className="text-2xl mt-2" style={{ color: textColor, opacity: 0.7 }}>{slide.subtitle}</p>}
    </div>
  )
}

function SeparatorSlide({ slide, textColor, accentColor }: { slide: Slide; textColor: string; accentColor: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6">
      <div className="w-24 h-1 rounded-full" style={{ backgroundColor: accentColor }} />
      {slide.title && (
        <h2 className="text-4xl font-bold" style={{ color: accentColor }}>{slide.title}</h2>
      )}
      <div className="w-24 h-1 rounded-full" style={{ backgroundColor: accentColor }} />
    </div>
  )
}

const OPTION_COLORS = [
  { bg: 'bg-blue-600',    border: 'border-blue-500',    label: 'bg-blue-700' },
  { bg: 'bg-emerald-600', border: 'border-emerald-500', label: 'bg-emerald-700' },
  { bg: 'bg-amber-500',   border: 'border-amber-400',   label: 'bg-amber-600' },
  { bg: 'bg-red-600',     border: 'border-red-500',     label: 'bg-red-700' },
  { bg: 'bg-violet-600',  border: 'border-violet-500',  label: 'bg-violet-700' },
  { bg: 'bg-pink-600',    border: 'border-pink-500',    label: 'bg-pink-700' },
]
const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

function QuestionSlide({ slide, phase, textColor, correctColor, roundNumber, questionInRound, totalInRound }: {
  slide: Slide; phase: number; textColor: string; correctColor: string
  roundNumber?: number; questionInRound?: number; totalInRound?: number
}) {
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
    <div className="flex flex-col h-full">

      {/* ── Horní lišta — číslo otázky v kole ── */}
      <div className="flex items-center justify-center pt-7 pb-1 shrink-0 min-h-[52px]">
        {questionInRound && (
          <span className="text-2xl font-bold tracking-wide" style={{ color: textColor, opacity: 0.5 }}>
            {questionInRound}{totalInRound ? `\u00a0/\u00a0${totalInRound}` : ''}
          </span>
        )}
      </div>

      {/* ── Text otázky ── */}
      <div className="flex-1 flex items-center justify-center px-12 py-4">
        <h2 className="text-4xl font-bold text-center leading-tight max-w-4xl" style={{ color: textColor }}>
          {q.text}
        </h2>
      </div>

      {/* ── Odpovědi / možnosti ── */}
      <div className="px-12 pb-2 shrink-0">

        {/* simple */}
        {q.type === 'simple' && showAnswer && (
          <div className="flex justify-center">
            <div className="rounded-2xl px-10 py-5 text-3xl font-bold border border-white/25" style={{ color: textColor }}>
              {q.correct_answer}
            </div>
          </div>
        )}

        {/* abcdef — gray border, colored letter badge, highlight correct */}
        {q.type === 'abcdef' && opts.length > 0 && (
          <div className="grid grid-cols-2 gap-3 max-w-4xl mx-auto w-full">
            {opts.map((opt, i) => (
              <div key={i}
                className={`rounded-2xl px-5 py-3.5 flex items-center gap-4 border transition-all duration-300 ${
                  showAnswer && opt.correct
                    ? 'border-white/40 bg-white/10 scale-[1.02]'
                    : showAnswer && !opt.correct
                    ? 'border-white/8 opacity-30'
                    : 'border-white/20 bg-white/5'
                }`}>
                <span className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-black text-white shrink-0 ${OPTION_COLORS[i]?.label || 'bg-gray-600'}`}>
                  {OPTION_LETTERS[i]}
                </span>
                <span className="text-lg font-semibold leading-snug" style={{ color: textColor }}>{opt.text}</span>
                {showAnswer && opt.correct && <span className="ml-auto text-2xl font-bold" style={{ color: textColor }}>✓</span>}
              </div>
            ))}
          </div>
        )}

        {/* bonus */}
        {q.type === 'bonus' && (
          <div className="flex flex-col gap-3 max-w-3xl mx-auto w-full">
            {opts.map((opt, i) => (
              <div key={i} className="rounded-xl px-6 py-3.5 flex items-center gap-4 border transition-all duration-300"
                style={phase > i
                  ? { backgroundColor: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.25)' }
                  : { backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}>
                <span className="text-sm font-black w-6 shrink-0" style={{ color: phase > i ? textColor : 'rgba(255,255,255,0.3)' }}>
                  {i + 1}.
                </span>
                <span className="text-xl font-semibold transition-all" style={{ color: phase > i ? textColor : 'transparent' }}>
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
              <div className="rounded-2xl px-10 py-5 text-3xl font-bold border border-white/25" style={{ color: textColor }}>
                {q.correct_answer}
              </div>
            )}
          </div>
        )}

        {/* video */}
        {q.type === 'video' && (
          <div className="flex flex-col items-center gap-6">
            {phase === 0 && q.media_url && (
              <div className="flex items-center gap-3" style={{ color: textColor, opacity: 0.5 }}>
                <Video size={28} className="text-pink-400" />
                <span className="truncate max-w-md font-mono text-sm">{q.media_url}</span>
              </div>
            )}
            {phase >= 1 && q.media_url && (
              <video src={q.media_url} controls autoPlay className="max-h-56 rounded-xl border border-white/10" />
            )}
            {phase >= 2 && (
              <div className="rounded-2xl px-10 py-5 text-3xl font-bold border border-white/25" style={{ color: textColor }}>
                {q.correct_answer}
              </div>
            )}
          </div>
        )}

        {/* image */}
        {q.type === 'image' && (
          <div className="flex flex-col items-center gap-4">
            {q.media_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={q.media_url} alt="" className="max-h-56 rounded-xl object-contain" />
            )}
            {showAnswer && q.correct_answer && (
              <div className="rounded-2xl px-10 py-4 text-2xl font-bold border border-white/25" style={{ color: textColor }}>
                {q.correct_answer}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Spodní lišta — číslo kola ── */}
      <div className="flex items-center justify-center pb-5 pt-3 shrink-0 min-h-[72px]">
        {roundNumber !== undefined && (
          <span className="text-5xl font-black tracking-tight" style={{ color: textColor, opacity: 0.65 }}>
            {roundNumber}. kolo
          </span>
        )}
      </div>
    </div>
  )
}

function QrPageSlide({ slide, textColor }: { slide: Slide; textColor: string }) {
  const startUrl = typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.host}/start`
    : 'https://kviz.michaljanda.com/start'
  return (
    <div className="flex h-full">
      <div className="w-1/2 flex flex-col items-center justify-center gap-6 px-16">
        <div className="bg-white p-5 rounded-3xl shadow-2xl">
          <QRCodeSVG value={startUrl} size={260} level="M" />
        </div>
        <p className="text-sm text-center font-mono" style={{ color: textColor, opacity: 0.5 }}>{startUrl}</p>
      </div>
      {(slide.title || slide.content) && (
        <div className="w-1/2 flex flex-col items-center justify-center gap-6 px-16 text-center border-l border-white/10">
          {slide.title && <h2 className="text-4xl font-black leading-tight" style={{ color: textColor }}>{slide.title}</h2>}
          {slide.content && <p className="text-xl max-w-xl" style={{ color: textColor, opacity: 0.8 }}>{slide.content}</p>}
        </div>
      )}
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
    fetch(`/api/quizzes/${quizId}/state`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slideIndex: si, phase: ph }),
    }).catch(() => {})
    fetch('/api/active', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quizId, slideIndex: si, phase: ph }),
    }).catch(() => {})
  }, [quizId])

  useEffect(() => {
    if (!quiz) return
    fetch('/api/active', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quizId, slideIndex: 0, phase: 0 }),
    }).catch(() => {})
  }, [quiz, quizId])

  const handleClose = useCallback(() => {
    fetch('/api/active', { method: 'DELETE' }).catch(() => {})
    router.push('/admin/quizzes')
  }, [router])

  const goToStart = useCallback(() => { setSlideIndex(0); setPhase(0); pushState(0, 0) }, [pushState])
  const goToSlide = useCallback((idx: number) => { setSlideIndex(idx); setPhase(0); pushState(idx, 0) }, [pushState])

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

  const handleSkipForward = useCallback(() => {
    if (slideIndex < slides.length - 1) {
      const si = slideIndex + 1; setSlideIndex(si); setPhase(0); pushState(si, 0)
    }
  }, [slideIndex, slides.length, pushState])

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
        <p className="text-gray-400 text-sm">Přidejte otázky přes builder kvízu</p>
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
  const canSkip = slideIndex < slides.length - 1

  const textColor = tmpl?.textColor || '#ffffff'
  const accentColor = tmpl?.accentColor || '#8b5cf6'
  const correctColor = tmpl?.correctColor || '#10b981'
  const fontFamily = tmpl?.fontFamily || undefined

  const currentBg = slideBackground(slide, tmpl)
  const hasBg = Object.keys(currentBg).length > 0

  // Číslo kola pro stránky (round_start před touto stránkou)
  let roundLabel: string | undefined
  for (let i = slideIndex - 1; i >= 0; i--) {
    if (slides[i].type === 'round_start') {
      roundLabel = `${slides[i].roundNumber}. kolo`
      break
    }
    if (slides[i].type === 'separator') break
  }

  // Round/question info pro otázky
  const { roundNumber, questionInRound, totalInRound } = computeSlideInfo(slides, slideIndex)

  const centerLabel = phase < maxPhase
    ? (slide.question?.type === 'bonus' ? `Odhal #${phase + 1}` : 'Zobrazit odpověď')
    : slideIndex < slides.length - 1 ? 'Další →' : 'Konec'

  return (
    <div className="h-screen flex select-none overflow-hidden" style={{ fontFamily, background: '#111' }}>

      {/* ── Levý sidebar ── */}
      {sidebarOpen && (
        <div className="w-[280px] shrink-0 bg-[#0c0e1a] border-r border-white/[0.07] flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/[0.06] shrink-0">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">Slidy</p>
              <p className="text-xs text-white/60 font-semibold mt-0.5 truncate max-w-[180px]">{quiz.name}</p>
            </div>
            <button onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg text-gray-600 hover:text-white hover:bg-white/[0.06] transition-colors">
              <PanelLeftClose size={14} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-1.5">
            {slides.map((s, idx) => (
              <SlideThumbnail key={idx} slide={s} idx={idx} isCurrent={idx === slideIndex} tmpl={tmpl} onClick={() => goToSlide(idx)} />
            ))}
          </div>
          <div className="px-3 py-2.5 border-t border-white/[0.06] text-center">
            <span className="text-sm font-bold text-white">{slideIndex + 1}</span>
            <span className="text-xs text-gray-600 mx-1">/</span>
            <span className="text-xs text-gray-600">{slides.length}</span>
          </div>
        </div>
      )}

      {/* ── Hlavní oblast ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Slide */}
        <div className="flex-1 relative overflow-hidden"
          style={hasBg ? currentBg : { background: '#0f1020' }}>

          {/* Top overlay */}
          <div className="absolute top-0 left-0 right-0 z-20 flex items-center gap-3 px-4 py-2.5"
            style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 100%)' }}>
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)}
                className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                <PanelLeftOpen size={15} />
              </button>
            )}
            <span className="text-white/80 text-sm font-semibold truncate max-w-[300px] drop-shadow">{quiz.name}</span>
            <div className="ml-auto flex items-center gap-2">
              {maxPhase > 0 && (
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: maxPhase + 1 }).map((_, i) => (
                    <div key={i} className={`w-2 h-2 rounded-full transition-all ${i <= phase ? 'bg-amber-400' : 'bg-white/20'}`} />
                  ))}
                </div>
              )}
              <button onClick={() => window.open('/start', '_blank')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white/80 hover:bg-white/20 transition-colors text-xs font-semibold backdrop-blur-sm">
                <Eye size={11} /> Divák
              </button>
            </div>
          </div>

          {/* Obsah slidů */}
          {slide.type === 'page' && <PageSlide slide={slide} textColor={textColor} roundLabel={roundLabel} />}
          {slide.type === 'round_start' && <RoundStartSlide slide={slide} textColor={textColor} accentColor={accentColor} />}
          {slide.type === 'separator' && <SeparatorSlide slide={slide} textColor={textColor} accentColor={accentColor} />}
          {slide.type === 'question' && <QuestionSlide slide={slide} phase={phase} textColor={textColor} correctColor={correctColor} roundNumber={roundNumber} questionInRound={questionInRound} totalInRound={totalInRound} />}
          {slide.type === 'qr_page' && <QrPageSlide slide={slide} textColor={textColor} />}
        </div>

        {/* ── Spodní ovládání ── */}
        <div className="flex items-center px-3 py-4 shrink-0 gap-3"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.3) 100%)', backdropFilter: 'blur(8px)' }}>

          {/* Restart — modrá, krajní levá */}
          <button onClick={goToStart} title="Začít znovu"
            className="w-14 h-14 rounded-full bg-blue-500 hover:bg-blue-400 active:scale-95 flex items-center justify-center shadow-xl shadow-blue-500/30 transition-all shrink-0">
            <RotateCcw size={22} className="text-white" />
          </button>

          {/* Prostřední blok */}
          <div className="flex items-center justify-center flex-1 gap-10">

            {/* Zpět — oranžová */}
            <button onClick={handleBack} disabled={!canGoBack} title="Zpět (←)"
              className="w-14 h-14 rounded-full bg-orange-500 hover:bg-orange-400 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center shadow-xl shadow-orange-500/30 transition-all shrink-0">
              <ChevronLeft size={28} className="text-white" />
            </button>

            {/* Hlavní akce — modrá pill */}
            <button onClick={handleForward} disabled={!canGoForward}
              className="px-10 py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold text-base shadow-xl shadow-blue-600/30 transition-all min-w-[200px] text-center">
              {centerLabel}
            </button>

            {/* Přeskočit — zelená */}
            <button onClick={handleSkipForward} disabled={!canSkip} title="Přeskočit (→)"
              className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-400 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center shadow-xl shadow-green-500/30 transition-all shrink-0">
              <ChevronRight size={28} className="text-white" />
            </button>

          </div>

          {/* Zavřít — červená, krajní pravá */}
          <button onClick={handleClose} title="Zavřít (Esc)"
            className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-400 active:scale-95 flex items-center justify-center shadow-xl shadow-red-500/30 transition-all shrink-0">
            <X size={22} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}
