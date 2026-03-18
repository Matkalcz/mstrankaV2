'use client'

import { TemplateConfig } from '@/types/template'
import SimpleQuizRenderer from './SimpleQuizRenderer'
import { QuestionData } from '@/components/universal-quiz-renderer'

// Konverze z SimpleQuizPlayer QuestionData do universal-quiz-renderer QuestionData
interface SimpleQuizPlayerQuestion {
    id: string
    type: "simple" | "abcd" | "abcdef" | "bonus" | "audio" | "video"
    text: string
    answers: string[]
    correctAnswer: number | number[]
    points: number
    mediaUrl?: string
    category?: string
    bonusAnswers?: string[]
    questionNumber?: number
    difficulty?: 'easy' | 'medium' | 'hard'
    roundNumber?: number
}

interface QuizRendererAdapterProps {
    question: SimpleQuizPlayerQuestion
    template: TemplateConfig
    showAnswer?: boolean
    onNext?: () => void
    onPrev?: () => void
    onAnswerReveal?: (isCorrect: boolean) => void
}

export default function QuizRendererAdapter({
    question,
    template,
    showAnswer = false,
    onNext,
    onPrev,
    onAnswerReveal
}: QuizRendererAdapterProps) {
    // Konvertovat SimpleQuizPlayer formát na universal-quiz-renderer formát
    const convertQuestion = (q: SimpleQuizPlayerQuestion): QuestionData => {
        // Mapování typu
        let type: QuestionData['type'] = 'simple'
        if (q.type === 'abcd') type = 'ab'
        else if (q.type === 'abcdef') type = 'abcdef'
        else if (q.type === 'bonus') type = 'bonus'
        else if (q.type === 'audio') type = 'audio'
        else if (q.type === 'video') type = 'video'
        else type = 'simple'

        // Konverze options z answers array
        let options: QuestionData['options'] = undefined
        if (q.type === 'abcd' || q.type === 'abcdef') {
            const labels = ['A', 'B', 'C', 'D', 'E', 'F']
            const correctIndices = Array.isArray(q.correctAnswer) 
                ? q.correctAnswer 
                : [q.correctAnswer]
            
            options = q.answers.map((answer, index) => ({
                label: labels[index] || String(index + 1),
                text: answer,
                isCorrect: correctIndices.includes(index)
            }))
        }

        // Získat správnou odpověď jako text
        let correctAnswerText: string | undefined = undefined
        if (q.type === 'simple' || q.type === 'audio' || q.type === 'video') {
            if (typeof q.correctAnswer === 'number' && q.answers[q.correctAnswer]) {
                correctAnswerText = q.answers[q.correctAnswer]
            } else if (q.answers.length > 0) {
                correctAnswerText = q.answers[0]
            }
        }

        return {
            id: q.id,
            text: q.text,
            type,
            correctAnswer: correctAnswerText,
            options,
            bonusAnswers: q.bonusAnswers,
            mediaUrl: q.mediaUrl,
            mediaType: q.type === 'audio' ? 'audio' : q.type === 'video' ? 'video' : undefined,
            questionNumber: q.questionNumber,
            roundNumber: q.roundNumber,
            category: q.category,
            difficulty: q.difficulty
        }
    }

    const convertedQuestion = convertQuestion(question)

    const handleAnswerSubmit = (isCorrect: boolean, points: number) => {
        if (onAnswerReveal) {
            onAnswerReveal(isCorrect)
        }
    }

    // Aplikovat template styly
    const containerStyle: React.CSSProperties = {
        backgroundColor: template.background?.value || '#ffffff',
        color: template.colors?.text || '#1f2937',
        fontFamily: 'inherit',
        minHeight: '100%',
        padding: '2rem'
    }

    return (
        <div style={containerStyle} className="w-full h-full flex flex-col">
            {/* Header s číslem otázky */}
            <div className="flex justify-between items-center mb-6">
                <div 
                    className="text-sm font-medium px-3 py-1 rounded-full"
                    style={{ 
                        backgroundColor: template.colors?.primary || '#3b82f6',
                        color: '#ffffff'
                    }}
                >
                    Otázka {question.questionNumber || 1}
                    {question.roundNumber && ` • Kolo ${question.roundNumber}`}
                </div>
                
                {question.category && (
                    <div className="text-sm text-gray-500">
                        {question.category}
                    </div>
                )}
            </div>

            {/* Hlavní obsah otázky */}
            <div className="flex-1">
                <SimpleQuizRenderer
                    question={convertedQuestion}
                    onAnswerSubmit={handleAnswerSubmit}
                    showAnswer={showAnswer}
                />
            </div>

            {/* Navigace je řízena ManualQuizController — zde žádná tlačítka */}
        </div>
    )
}
