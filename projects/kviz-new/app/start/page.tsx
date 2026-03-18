// app/start/page.tsx — Jednotná veřejná adresa kvízu (kviz.michaljanda.com/start)
'use client'

import { useState, useEffect, useRef } from 'react'
import { Volume2, Video } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

// ─── Typy ──────────────────────────────────────────────────────────────────────

interface QuestionData {
  id: string
  text: string
  type: 'simple' | 'ab' | 'abcdef' | 'bonus' | 'audio' | 'video'
  correct_answer?: string
  options?: { label: string; text: string; correct?: boolean }[]
  media_url?: string
  points: number
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

interface QuizData {
  id: string
  name: string
  sequence: any[]
  questions: QuestionData[]
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

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
      const prevQ = slides
        .filter(s => s.type === 'question' && !s.showAnswer)
        .map(s => ({ type: 'question' as SlideType, question: s.question!, showAnswer: true }))
      slides.push(...prevQ)
    } else {
      slides.push(item as Slide)
    }
  }
  return slides
}

// ─── Slide renderers ───────────────────────────────────────────────────────────

const optionColors = ['bg-blue-600', 'bg-emerald-600', 'bg-amber-600', 'bg-red-600', 'bg-violet-600', 'bg-pink-600']
const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F']

const START_URL = typeof window !== 'undefined'
  ? `${window.location.protocol}//${window.location.host}/start`
  : 'https://kviz.michaljanda.com/start'

function SlideView({ slide, phase }: { slide: Slide; phase: number }) {
  const q = slide.question
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (q?.type === 'audio' && phase === 1 && audioRef.current) {
      audioRef.current.play().catch(() => {})
    }
  }, [phase, q?.type])

  if (slide.type === 'page') return (
    <div className="flex flex-col items-center justify-center h-full text-center px-16 gap-6">
      {slide.title && <h1 className="text-6xl font-black text-white leading-tight">{slide.title}</h1>}
      {slide.content && <p className="text-3xl text-gray-300 max-w-3xl">{slide.content}</p>}
    </div>
  )

  if (slide.type === 'round_start') return (
    <div className="flex flex-col items-center justify-center h-full text-center gap-6">
      <div className="text-violet-400 text-2xl font-bold tracking-widest uppercase">Kolo {slide.roundNumber}</div>
      <h1 className="text-7xl font-black text-white">{slide.title || `Kolo ${slide.roundNumber}`}</h1>
      {slide.subtitle && <p className="text-3xl text-gray-400 mt-2">{slide.subtitle}</p>}
    </div>
  )

  if (slide.type === 'separator') return (
    <div className="flex flex-col items-center justify-center h-full gap-8">
      <div className="w-32 h-1.5 bg-violet-500 rounded-full" />
      <h2 className="text-5xl font-bold text-violet-300">{slide.title || 'Opakování odpovědí'}</h2>
      <div className="w-32 h-1.5 bg-violet-500 rounded-full" />
    </div>
  )

  if (slide.type === 'qr_page') return (
    <div className="flex h-full">
      <div className="w-1/2 flex flex-col items-center justify-center gap-6 px-16">
        <div className="bg-white p-5 rounded-3xl shadow-2xl">
          <QRCodeSVG value={START_URL} size={300} level="M" />
        </div>
        <p className="text-gray-400 text-lg text-center">{START_URL}</p>
      </div>
      <div className="w-1/2 flex flex-col items-center justify-center gap-6 px-16 text-center border-l border-white/[0.08]">
        {slide.title && <h2 className="text-5xl font-black text-white leading-tight">{slide.title}</h2>}
        {slide.content && <p className="text-2xl text-gray-300 max-w-xl">{slide.content}</p>}
      </div>
    </div>
  )

  if (!q) return null

  const showAnswer = slide.showAnswer || phase >= 1

  return (
    <div className="flex flex-col h-full px-20 py-16 gap-10">
      <div className="flex-1 flex items-center justify-center">
        <h2 className="text-5xl font-bold text-white text-center leading-tight max-w-5xl">{q.text}</h2>
      </div>

      {q.type === 'simple' && showAnswer && (
        <div className="flex justify-center pb-4">
          <div className="bg-emerald-500/20 border-2 border-emerald-500/50 rounded-3xl px-12 py-6 text-4xl font-bold text-emerald-300">
            {q.correct_answer}
          </div>
        </div>
      )}

      {(q.type === 'ab' || q.type === 'abcdef') && (
        <div className="grid grid-cols-2 gap-5 max-w-5xl mx-auto w-full pb-4">
          {(q.options || []).map((opt, i) => (
            <div key={i}
              className={`rounded-2xl px-8 py-5 flex items-center gap-5 transition-all ${
                showAnswer && opt.correct
                  ? 'bg-emerald-500/30 border-2 border-emerald-400 scale-105'
                  : showAnswer && !opt.correct
                  ? 'bg-white/[0.03] border border-white/[0.06] opacity-30'
                  : 'bg-white/[0.08] border border-white/[0.12]'
              }`}>
              <span className={`w-12 h-12 rounded-xl flex items-center justify-center text-base font-black text-white shrink-0 ${optionColors[i] || 'bg-gray-600'}`}>
                {optionLetters[i]}
              </span>
              <span className="text-2xl font-semibold text-white">{opt.text}</span>
              {showAnswer && opt.correct && <span className="ml-auto text-emerald-400 text-3xl">✓</span>}
            </div>
          ))}
        </div>
      )}

      {q.type === 'bonus' && (
        <div className="flex flex-col gap-4 max-w-4xl mx-auto w-full pb-4">
          {(q.options || []).map((opt, i) => (
            <div key={i}
              className={`rounded-2xl px-8 py-4 flex items-center gap-5 transition-all duration-500 ${
                phase > i ? 'bg-emerald-500/20 border border-emerald-500/40' : 'bg-white/[0.03] border border-white/[0.05]'
              }`}>
              <span className="text-base font-bold text-emerald-400 w-6">{i + 1}.</span>
              <span className={`text-2xl font-semibold transition-colors duration-500 ${phase > i ? 'text-white' : 'text-transparent'}`}>
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
              <Volume2 size={64} className="text-violet-400 animate-pulse" />
              <audio ref={audioRef} controls src={q.media_url || ''} className="w-96" />
            </div>
          )}
          {phase >= 2 && (
            <div className="bg-emerald-500/20 border-2 border-emerald-500/50 rounded-3xl px-12 py-6 text-4xl font-bold text-emerald-300">
              {q.correct_answer}
            </div>
          )}
        </div>
      )}

      {q.type === 'video' && (
        <div className="flex flex-col items-center gap-6 pb-4">
          {phase === 0 && q.media_url && (
            <Video size={36} className="text-violet-400" />
          )}
          {phase >= 1 && q.media_url && (
            <video src={q.media_url} controls autoPlay className="max-h-80 rounded-2xl border border-white/10" />
          )}
          {phase >= 2 && (
            <div className="bg-emerald-500/20 border-2 border-emerald-500/50 rounded-3xl px-12 py-6 text-4xl font-bold text-emerald-300">
              {q.correct_answer}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Hlavní komponenta ─────────────────────────────────────────────────────────

export default function StartPage() {
  const [slideIndex, setSlideIndex] = useState(0)
  const [phase, setPhase] = useState(0)
  const [slides, setSlides] = useState<Slide[]>([])
  const [active, setActive] = useState(false)

  // Ref pro sledování aktuálního quizId bez re-subscribu effectu
  const currentQuizIdRef = useRef<string | null>(null)

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch('/api/active')
        const state = await res.json()

        if (state?.quizId) {
          setSlideIndex(state.slideIndex ?? 0)
          setPhase(state.phase ?? 0)
          setActive(true)

          // Načti kvíz pouze pokud se quizId změnilo
          if (state.quizId !== currentQuizIdRef.current) {
            currentQuizIdRef.current = state.quizId
            const qRes = await fetch(`/api/quizzes/${state.quizId}`)
            const qData: QuizData = await qRes.json()
            setSlides(buildSlides(qData))
          }
        } else {
          // Žádný aktivní kvíz
          if (currentQuizIdRef.current !== null) {
            currentQuizIdRef.current = null
            setSlides([])
          }
          setActive(false)
        }
      } catch {}
    }

    poll()
    const interval = setInterval(poll, 1000)
    return () => clearInterval(interval)
  }, [])

  // Čekací obrazovka
  if (!active || slides.length === 0) return (
    <div className="min-h-screen bg-[#08090f] flex flex-col items-center justify-center gap-8 text-white select-none">
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

  const slide = slides[Math.min(slideIndex, slides.length - 1)]

  return (
    <div className="min-h-screen bg-[#08090f] text-white flex flex-col overflow-hidden select-none">
      <div className="flex-1">
        <SlideView slide={slide} phase={phase} />
      </div>
    </div>
  )
}
