import { NextRequest, NextResponse } from 'next/server'
import { quizzes } from '@/lib/database'

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

// Ochrana proti double-stringify sekvence
function parseSequence(raw?: string): any[] {
  if (!raw) return []
  try {
    const p = JSON.parse(raw)
    if (Array.isArray(p)) return p
    if (typeof p === 'string') { const p2 = JSON.parse(p); return Array.isArray(p2) ? p2 : [] }
  } catch {}
  return []
}

// GET /api/quizzes - Get all quizzes
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const status = searchParams.get('status')

        let allQuizzes = quizzes.getAll() as DatabaseQuiz[]

        // Apply filters
        if (status && status !== 'all') {
            allQuizzes = allQuizzes.filter(q => q.status === status)
        }

        // Parse sequence JSON and get question count for each quiz
        const parsedQuizzes = await Promise.all(allQuizzes.map(async (quiz) => {
            const quizQuestions = quizzes.getQuestions(quiz.id) as QuizQuestion[]

            return {
                ...quiz,
                sequence: parseSequence(quiz.sequence),
                questionCount: quizQuestions.length,
                roundCount: quizQuestions.length > 0 ?
                    Math.max(...quizQuestions.map(q => q.round_number || 1)) : 0
            }
        }))

        return NextResponse.json(parsedQuizzes)
    } catch (error) {
        console.error('GET /api/quizzes error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch quizzes' },
            { status: 500 }
        )
    }
}

// POST /api/quizzes - Create a new quiz
export async function POST(request: NextRequest) {
    try {
        const data = await request.json()

        // Validate required fields
        if (!data.name) {
            return NextResponse.json(
                { error: 'Missing required field: name' },
                { status: 400 }
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

        // Create quiz in database
        const id = quizzes.create(data)

        // Get the created quiz
        const createdQuiz = quizzes.getById(id) as DatabaseQuiz

        // Parse sequence JSON
        const parsedQuiz = {
            ...createdQuiz,
            sequence: parseSequence(createdQuiz.sequence),
            questionCount: 0,
            roundCount: 0
        }

        return NextResponse.json(parsedQuiz, { status: 201 })
    } catch (error) {
        console.error('POST /api/quizzes error:', error)
        return NextResponse.json(
            { error: 'Failed to create quiz' },
            { status: 500 }
        )
    }
}
