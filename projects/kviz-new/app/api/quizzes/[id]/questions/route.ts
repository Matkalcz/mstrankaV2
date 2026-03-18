import { NextRequest, NextResponse } from 'next/server'
import mockDatabase from '@/lib/database-mock'

const { quizzes } = mockDatabase

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

// POST /api/quizzes/[id]/questions - Add a question to a quiz
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const data = await request.json()

        // Validate required fields
        if (!data.questionId) {
            return NextResponse.json(
                { error: 'Missing required field: questionId' },
                { status: 400 }
            )
        }

        // Check if quiz exists
        const existingQuiz = quizzes.getById(id)
        if (!existingQuiz) {
            return NextResponse.json(
                { error: 'Quiz not found' },
                { status: 404 }
            )
        }

        // Get current questions to determine order index
        const currentQuestions = quizzes.getQuestions(id) as QuizQuestion[]
        const orderIndex = currentQuestions.length

        // Add question to quiz
        quizzes.addQuestion(
            id,
            data.questionId,
            orderIndex,
            data.roundNumber || 1
        )

        return NextResponse.json(
            {
                message: 'Question added to quiz successfully',
                quizId: id,
                questionId: data.questionId,
                orderIndex,
                roundNumber: data.roundNumber || 1
            },
            { status: 201 }
        )
    } catch (error) {
        console.error('POST /api/quizzes/[id]/questions error:', error)
        return NextResponse.json(
            { error: 'Failed to add question to quiz' },
            { status: 500 }
        )
    }
}

// GET /api/quizzes/[id]/questions - Get all questions for a quiz
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        // Check if quiz exists
        const existingQuiz = quizzes.getById(id)
        if (!existingQuiz) {
            return NextResponse.json(
                { error: 'Quiz not found' },
                { status: 404 }
            )
        }

        // Get quiz questions
        const quizQuestions = quizzes.getQuestions(id) as QuizQuestion[]

        // Parse options JSON for each question
        const parsedQuestions = quizQuestions.map(q => ({
            ...q,
            options: q.options ? JSON.parse(q.options) : []
        }))

        return NextResponse.json(parsedQuestions)
    } catch (error) {
        console.error('GET /api/quizzes/[id]/questions error:', error)
        return NextResponse.json(
            { error: 'Failed to get quiz questions' },
            { status: 500 }
        )
    }
}

// DELETE /api/quizzes/[id]/questions - Remove a question from a quiz (with questionId in query)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const url = new URL(request.url)
        const questionId = url.searchParams.get('questionId')

        if (!questionId) {
            return NextResponse.json(
                { error: 'Missing required parameter: questionId' },
                { status: 400 }
            )
        }

        // Check if quiz exists
        const existingQuiz = quizzes.getById(id)
        if (!existingQuiz) {
            return NextResponse.json(
                { error: 'Quiz not found' },
                { status: 404 }
            )
        }

        // Check if question exists in quiz
        const quizQuestions = quizzes.getQuestions(id) as QuizQuestion[]
        const questionInQuiz = quizQuestions.find(q => q.id === questionId)

        if (!questionInQuiz) {
            return NextResponse.json(
                { error: 'Question not found in quiz' },
                { status: 404 }
            )
        }

        // Remove question from quiz
        quizzes.removeQuestion(id, questionId)

        return NextResponse.json(
            {
                message: 'Question removed from quiz successfully',
                quizId: id,
                questionId: questionId
            },
            { status: 200 }
        )
    } catch (error) {
        console.error('DELETE /api/quizzes/[id]/questions error:', error)
        return NextResponse.json(
            { error: 'Failed to remove question from quiz' },
            { status: 500 }
        )
    }
}
