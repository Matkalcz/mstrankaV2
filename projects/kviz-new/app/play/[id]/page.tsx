'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { QuestionData } from '@/components/universal-quiz-renderer'
import SimpleQuizRenderer from '@/components/SimpleQuizRenderer'

interface Quiz {
    id: string
    name: string
    description?: string
    questions: QuestionData[]
}

export default function QuizPlayerPage() {
    const params = useParams()
    const quizId = params.id as string

    const [quiz, setQuiz] = useState<Quiz | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [score, setScore] = useState(0)
    const [showResults, setShowResults] = useState(false)

    // Fetch quiz data
    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                setLoading(true)
                const response = await fetch(`/api/quizzes/${quizId}`)
                if (!response.ok) {
                    throw new Error('Failed to fetch quiz')
                }
                const data = await response.json()
                setQuiz(data)
                setError(null)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error')
            } finally {
                setLoading(false)
            }
        }

        if (quizId) {
            fetchQuiz()
        }
    }, [quizId])

    // Handle answer submission
    const handleAnswerSubmit = (isCorrect: boolean, points: number) => {
        if (isCorrect) {
            setScore(prev => prev + points)
        }
    }

    // Handle next question
    const handleNextQuestion = () => {
        if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1)
        } else {
            setShowResults(true)
        }
    }

    // Handle restart
    const handleRestart = () => {
        setCurrentQuestionIndex(0)
        setScore(0)
        setShowResults(false)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 text-lg">Načítám kvíz...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Chyba</h1>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <a
                        href="/"
                        className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Zpět na hlavní stránku
                    </a>
                </div>
            </div>
        )
    }

    if (!quiz) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Kvíz nenalezen</h1>
                    <p className="text-gray-600 mb-6">Požadovaný kvíz neexistuje.</p>
                    <a
                        href="/"
                        className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Zpět na hlavní stránku
                    </a>
                </div>
            </div>
        )
    }

    const currentQuestion = quiz.questions[currentQuestionIndex]
    const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-sm shadow-sm">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{quiz.name}</h1>
                            {quiz.description && (
                                <p className="text-gray-600 mt-1">{quiz.description}</p>
                            )}
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-500">Skóre</div>
                            <div className="text-2xl font-bold text-blue-600">{score} bodů</div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Progress bar */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">
                            Otázka {currentQuestionIndex + 1} z {quiz.questions.length}
                        </span>
                        <span className="text-sm font-medium text-gray-700">
                            {Math.round(progress)}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {showResults ? (
                    // Results screen
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center">
                        <div className="text-6xl mb-6">🏆</div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Kvíz dokončen!</h2>
                        <p className="text-gray-600 mb-8">
                            Gratulujeme! Dokončili jste kvíz "{quiz.name}"
                        </p>

                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8 max-w-md mx-auto">
                            <div className="text-5xl font-bold text-blue-600 mb-2">{score} bodů</div>
                            <div className="text-gray-600">
                                z {quiz.questions.length} možných
                            </div>
                            <div className="mt-4 text-sm text-gray-500">
                                Úspěšnost: {Math.round((score / quiz.questions.length) * 100)}%
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={handleRestart}
                                className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Hrát znovu
                            </button>
                            <a
                                href="/"
                                className="px-8 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Zpět na hlavní stránku
                            </a>
                        </div>
                    </div>
                ) : (
                    // Question screen
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
                        <div className="p-8">
                            <SimpleQuizRenderer
                                question={currentQuestion}
                                onAnswerSubmit={handleAnswerSubmit}
                                showAnswer={false}
                                autoAdvance={false}
                            />
                        </div>

                        <div className="bg-gray-50 px-8 py-6 border-t">
                            <div className="flex justify-between items-center">
                                <div className="text-sm text-gray-500">
                                    {currentQuestion.category && (
                                        <span className="mr-4">Kategorie: {currentQuestion.category}</span>
                                    )}
                                    {currentQuestion.difficulty && (
                                        <span>Obtížnost: {
                                            currentQuestion.difficulty === 'easy' ? 'Lehká' :
                                                currentQuestion.difficulty === 'medium' ? 'Střední' : 'Těžká'
                                        }</span>
                                    )}
                                </div>
                                <button
                                    onClick={handleNextQuestion}
                                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    {currentQuestionIndex < quiz.questions.length - 1 ? 'Další otázka' : 'Zobrazit výsledky'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-gray-500 text-sm">
                <p>Hospodský Kvíz System • Pro zábavu a vzdělání</p>
                <p className="mt-1">Kvíz ID: {quizId}</p>
            </footer>
        </div>
    )
}
