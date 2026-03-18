import { NextRequest, NextResponse } from 'next/server'
import { quizzes, questions as questionsDb } from '@/lib/database'

// Define types for database quizzes
interface DatabaseQuiz {
    id: string
    name: string
    description?: string
    template_id?: string
    sequence?: string
    status: string
    created_at: string
    updated_at: string
    author?: string
}

// Define types for quiz questions
interface QuizQuestion {
    id: string
    text: string
    type: string
    correct_answer?: string
    options?: string
    media_url?: string
    points: number
    category?: string
    difficulty?: string
    created_at: string
    updated_at: string
    order_index: number
    round_number: number
}

// GET /api/quizzes/[id] - Get a single quiz by ID with questions
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const quiz = quizzes.getById(id) as DatabaseQuiz | undefined

        if (!quiz) {
            return NextResponse.json(
                { error: 'Quiz not found' },
                { status: 404 }
            )
        }

        // Parse sequence — ochrana proti double-stringify (string po JSON.parse → znovu parsuj)
        let sequence: any[] = []
        if (quiz.sequence) {
          try {
            const p = JSON.parse(quiz.sequence)
            if (Array.isArray(p)) sequence = p
            else if (typeof p === 'string') {
              const p2 = JSON.parse(p)
              sequence = Array.isArray(p2) ? p2 : []
            }
          } catch { sequence = [] }
        }

        // Collect all question IDs from the sequence
        const seqQuestionIds: string[] = sequence
            .filter((item: any) => item.type === 'question' && item.questionId)
            .map((item: any) => item.questionId as string)

        // Fetch questions referenced in sequence (primary source)
        const seqQuestions = seqQuestionIds
            .map(qid => questionsDb.getById(qid) as any)
            .filter(Boolean)
            .map((q: any) => ({
                ...q,
                options: q.options
                    ? (typeof q.options === 'string' ? JSON.parse(q.options) : q.options)
                    : []
            }))

        // Fall back to quiz_questions table if sequence has no questions
        const fallbackQuestions = seqQuestions.length === 0
            ? (quizzes.getQuestions(id) as QuizQuestion[]).map(q => ({
                ...q,
                options: q.options ? JSON.parse(q.options) : []
              }))
            : []

        const allQuestions = seqQuestions.length > 0 ? seqQuestions : fallbackQuestions

        // Parse sequence and options JSON
        const parsedQuiz = {
            ...quiz,
            sequence,
            questions: allQuestions,
            questionCount: allQuestions.length,
            roundCount: 1
        }

        return NextResponse.json(parsedQuiz)
    } catch (error) {
        console.error('GET /api/quizzes/[id] error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch quiz' },
            { status: 500 }
        )
    }
}

// PUT /api/quizzes/[id] - Update a quiz
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const data = await request.json()

        // Check if quiz exists
        const existingQuiz = quizzes.getById(id) as DatabaseQuiz | undefined
        if (!existingQuiz) {
            return NextResponse.json(
                { error: 'Quiz not found' },
                { status: 404 }
            )
        }

        // Validate status if provided
        if (data.status) {
            const validStatuses = ['draft', 'published', 'archived']
            if (!validStatuses.includes(data.status)) {
                return NextResponse.json(
                    { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
                    { status: 400 }
                )
            }
        }

        // Update quiz in database
        quizzes.update(id, data)

        // Get the updated quiz
        const updatedQuiz = quizzes.getById(id) as DatabaseQuiz

        // Get quiz questions
        const quizQuestions = quizzes.getQuestions(id) as QuizQuestion[]

        // Parse sequence JSON — ochrana proti double-stringify
        const parseSeq = (raw?: string): any[] => {
          if (!raw) return []
          try {
            const p = JSON.parse(raw)
            if (Array.isArray(p)) return p
            if (typeof p === 'string') { const p2 = JSON.parse(p); return Array.isArray(p2) ? p2 : [] }
          } catch {}
          return []
        }
        const parsedQuiz = {
            ...updatedQuiz,
            sequence: parseSeq(updatedQuiz.sequence),
            questions: quizQuestions.map(q => ({
                ...q,
                options: q.options ? JSON.parse(q.options) : []
            })),
            questionCount: quizQuestions.length,
            roundCount: quizQuestions.length > 0 ?
                Math.max(...quizQuestions.map(q => q.round_number || 1)) : 0
        }

        return NextResponse.json(parsedQuiz)
    } catch (error) {
        console.error('PUT /api/quizzes/[id] error:', error)
        return NextResponse.json(
            { error: 'Failed to update quiz' },
            { status: 500 }
        )
    }
}

// DELETE /api/quizzes/[id] - Delete a quiz
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        // Check if quiz exists
        const existingQuiz = quizzes.getById(id) as DatabaseQuiz | undefined
        if (!existingQuiz) {
            return NextResponse.json(
                { error: 'Quiz not found' },
                { status: 404 }
            )
        }

        // Delete quiz from database
        quizzes.delete(id)

        return NextResponse.json(
            { message: 'Quiz deleted successfully' },
            { status: 200 }
        )
    } catch (error) {
        console.error('DELETE /api/quizzes/[id] error:', error)
        return NextResponse.json(
            { error: 'Failed to delete quiz' },
            { status: 500 }
        )
    }
}
