import { NextRequest, NextResponse } from 'next/server'
import mockDatabase from '@/lib/database-mock'
import { PPTXExporter } from '@/lib/export/pptx-exporter'
import { QuestionData } from '@/components/universal-quiz-renderer'

const { quizzes, exports: dbExports } = mockDatabase

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
interface DatabaseQuestion {
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

// POST /api/export - Export a quiz to PPTX
export async function POST(request: NextRequest) {
    try {
        const data = await request.json()

        // Validate required fields
        if (!data.quizId) {
            return NextResponse.json(
                { error: 'Missing required field: quizId' },
                { status: 400 }
            )
        }

        // Check if quiz exists
        const quiz = quizzes.getById(data.quizId) as DatabaseQuiz | undefined
        if (!quiz) {
            return NextResponse.json(
                { error: 'Quiz not found' },
                { status: 404 }
            )
        }

        // Get quiz questions
        const quizQuestions = quizzes.getQuestions(data.quizId) as DatabaseQuestion[]

        // Convert database questions to QuestionData format
        const questions: QuestionData[] = quizQuestions.map((q) => ({
            id: q.id,
            text: q.text,
            type: q.type as any, // Type will be validated by PPTXExporter
            correctAnswer: q.correct_answer,
            options: q.options ? JSON.parse(q.options) : [],
            bonusAnswers: q.type === 'bonus' ? [] : undefined,
            mediaUrl: q.media_url,
            mediaType: q.type === 'audio' ? 'audio' : q.type === 'video' ? 'video' : undefined,
            questionNumber: q.order_index + 1,
            roundNumber: q.round_number || 1,
            category: q.category,
            difficulty: q.difficulty as any
        }))

        // Create exporter
        const exporter = new PPTXExporter({
            title: quiz.name,
            author: quiz.author || 'Hospodský Kvíz System',
            theme: 'colorful',
            includeAnswers: true,
            includeNotes: true,
            slideSize: '16:9'
        })

        // Create quiz config for SequenceGenerator
        const quizConfig = {
            title: quiz.name,
            subtitle: quiz.description || '',
            author: quiz.author || 'Hospodský Kvíz System',
            defaultQuestionDuration: 10000,
            defaultAnswerDuration: 8000,
            introDuration: 5000,
            separatorDuration: 3000,
            outroDuration: 5000,
            showIntro: true,
            showSeparators: true,
            showOutro: true,
            autoAdvance: true,
            rounds: [{
                number: 1,
                name: 'Hlavní kolo',
                questions: questions
            }]
        }

        // Export quiz
        const result = await exporter.exportQuiz(questions, quizConfig)

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || 'Export failed' },
                { status: 500 }
            )
        }

        // Save export record to database
        const exportId = dbExports.create(data.quizId, 'pptx')
        dbExports.updateStatus(exportId, 'completed', result.fileName)

        return NextResponse.json({
            success: true,
            exportId,
            fileName: result.fileName,
            fileSize: result.fileSize,
            slideCount: result.slideCount,
            downloadUrl: result.downloadUrl,
            message: 'Quiz exported successfully'
        })

    } catch (error) {
        console.error('POST /api/export error:', error)
        return NextResponse.json(
            { error: 'Failed to export quiz' },
            { status: 500 }
        )
    }
}

// GET /api/export/[quizId] - Get export history for a quiz
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const quizId = searchParams.get('quizId')

        if (!quizId) {
            return NextResponse.json(
                { error: 'Missing required parameter: quizId' },
                { status: 400 }
            )
        }

        // Check if quiz exists
        const quiz = quizzes.getById(quizId) as DatabaseQuiz | undefined
        if (!quiz) {
            return NextResponse.json(
                { error: 'Quiz not found' },
                { status: 404 }
            )
        }

        // Get export history
        const exportHistory = dbExports.getByQuiz(quizId)

        return NextResponse.json({
            quizId,
            quizName: quiz.name,
            exports: exportHistory
        })

    } catch (error) {
        console.error('GET /api/export error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch export history' },
            { status: 500 }
        )
    }
}
