// app/api/export/route.ts — Export kvízu do PPTX
import { NextRequest, NextResponse } from 'next/server'
import { quizzes } from '@/lib/database'
import { PPTXExporter } from '@/lib/export/pptx-exporter'

// POST /api/export — spustí export, vrátí download URL
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    if (!data.quizId) return NextResponse.json({ error: 'Chybí quizId' }, { status: 400 })

    const quiz = quizzes.getById(data.quizId) as any
    if (!quiz) return NextResponse.json({ error: 'Kvíz nenalezen' }, { status: 404 })

    const quizQuestions = quizzes.getQuestions(data.quizId) as any[]

    const questions = quizQuestions.map((q, idx) => ({
      id: q.id,
      text: q.text,
      type: q.type,
      correctAnswer: q.correct_answer,
      options: q.options ? JSON.parse(q.options) : [],
      bonusAnswers: q.type === 'bonus' ? (q.options ? JSON.parse(q.options).map((o: any) => o.text) : []) : undefined,
      mediaUrl: q.media_url,
      mediaType: q.type === 'audio' ? 'audio' : q.type === 'video' ? 'video' : undefined,
      questionNumber: idx + 1,
      roundNumber: q.round_number || 1,
      difficulty: q.difficulty,
    }))

    const exporter = new PPTXExporter({
      title: quiz.name,
      author: quiz.author || 'Hospodský Kvíz',
      theme: 'colorful',
      includeAnswers: true,
      includeNotes: true,
      slideSize: '16:9',
    })

    const quizConfig = {
      title: quiz.name,
      subtitle: quiz.description || '',
      author: quiz.author || 'Hospodský Kvíz',
      defaultQuestionDuration: 10000,
      defaultAnswerDuration: 8000,
      introDuration: 5000,
      separatorDuration: 3000,
      outroDuration: 5000,
      showIntro: true,
      showSeparators: true,
      showOutro: true,
      autoAdvance: true,
      rounds: [{ number: 1, name: 'Kolo 1', questions }],
    }

    const result = await exporter.exportQuiz(questions, quizConfig)

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Export selhal' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      fileName: result.fileName,
      fileSize: result.fileSize,
      slideCount: result.slideCount,
      downloadUrl: result.downloadUrl,
    })

  } catch (error) {
    console.error('POST /api/export error:', error)
    return NextResponse.json({ error: 'Export selhal' }, { status: 500 })
  }
}

// GET /api/export?quizId=xxx — info o kvízu pro export
export async function GET(request: NextRequest) {
  try {
    const quizId = request.nextUrl.searchParams.get('quizId')
    if (!quizId) return NextResponse.json({ error: 'Chybí quizId' }, { status: 400 })

    const quiz = quizzes.getById(quizId) as any
    if (!quiz) return NextResponse.json({ error: 'Kvíz nenalezen' }, { status: 404 })

    const questionCount = (quizzes.getQuestions(quizId) as any[]).length

    return NextResponse.json({ quizId, quizName: quiz.name, questionCount })
  } catch (error) {
    return NextResponse.json({ error: 'Chyba' }, { status: 500 })
  }
}
