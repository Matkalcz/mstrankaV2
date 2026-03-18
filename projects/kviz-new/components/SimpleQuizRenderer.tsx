'use client'

import { QuestionData } from '@/components/universal-quiz-renderer'
import { useState } from 'react'

interface SimpleQuizRendererProps {
    question: QuestionData
    onAnswerSubmit?: (isCorrect: boolean, points: number) => void
    showAnswer?: boolean
    autoAdvance?: boolean
}

export default function SimpleQuizRenderer({
    question,
    onAnswerSubmit,
    showAnswer = false,
    autoAdvance = false
}: SimpleQuizRendererProps) {
    const [selectedOption, setSelectedOption] = useState<string | null>(null)
    const [userAnswer, setUserAnswer] = useState('')
    const [submitted, setSubmitted] = useState(false)

    const handleOptionSelect = (label: string) => {
        if (submitted) return
        setSelectedOption(label)
    }

    const handleSimpleAnswerSubmit = () => {
        if (!userAnswer.trim()) return

        const isCorrect = userAnswer.toLowerCase().trim() === question.correctAnswer?.toLowerCase().trim()
        setSubmitted(true)

        if (onAnswerSubmit) {
            onAnswerSubmit(isCorrect, 1)
        }
    }

    const handleMultipleChoiceSubmit = () => {
        if (!selectedOption) return

        const selectedOptionData = question.options?.find(opt => opt.label === selectedOption)
        const isCorrect = selectedOptionData?.isCorrect || false
        setSubmitted(true)

        if (onAnswerSubmit) {
            onAnswerSubmit(isCorrect, 1)
        }
    }

    const handleBonusSubmit = () => {
        // Pro bonusové otázky - všechny odpovědi jsou správné
        setSubmitted(true)
        if (onAnswerSubmit) {
            onAnswerSubmit(true, question.bonusAnswers?.length || 1)
        }
    }

    const renderSimpleQuestion = () => {
        return (
            <div className="space-y-6">
                <div className="text-2xl font-semibold text-gray-900">{question.text}</div>

                {!submitted && !showAnswer ? (
                    <div className="space-y-4">
                        <input
                            type="text"
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            placeholder="Napište svou odpověď..."
                            className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                            onKeyPress={(e) => e.key === 'Enter' && handleSimpleAnswerSubmit()}
                        />
                        <button
                            onClick={handleSimpleAnswerSubmit}
                            disabled={!userAnswer.trim()}
                            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                            Odeslat odpověď
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg border">
                            <div className="text-sm font-medium text-gray-500 mb-1">Vaše odpověď:</div>
                            <div className="text-lg">{userAnswer || '-'}</div>
                        </div>
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="text-sm font-medium text-green-600 mb-1">Správná odpověď:</div>
                            <div className="text-lg font-semibold text-green-700">{question.correctAnswer}</div>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    const renderMultipleChoice = () => {
        const options = question.options || []

        return (
            <div className="space-y-6">
                <div className="text-2xl font-semibold text-gray-900">{question.text}</div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {options.map((option) => {
                        const isSelected = selectedOption === option.label
                        const isCorrect = option.isCorrect || false
                        const showCorrect = submitted || showAnswer

                        let bgColor = 'bg-white'
                        let borderColor = 'border-gray-300'
                        let textColor = 'text-gray-900'

                        if (isSelected && !showCorrect) {
                            bgColor = 'bg-blue-50'
                            borderColor = 'border-blue-500'
                        }

                        if (showCorrect) {
                            if (isCorrect) {
                                bgColor = 'bg-green-50'
                                borderColor = 'border-green-500'
                                textColor = 'text-green-700'
                            } else if (isSelected && !isCorrect) {
                                bgColor = 'bg-red-50'
                                borderColor = 'border-red-500'
                                textColor = 'text-red-700'
                            }
                        }

                        return (
                            <button
                                key={option.label}
                                onClick={() => handleOptionSelect(option.label)}
                                disabled={submitted || showAnswer}
                                className={`p-4 border-2 ${borderColor} ${bgColor} rounded-lg text-left transition-all ${!submitted && !showAnswer ? 'hover:border-blue-300 hover:bg-blue-50' : ''}`}
                            >
                                <div className="flex items-start">
                                    <div className={`w-8 h-8 flex items-center justify-center rounded-full mr-3 ${isSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                                        {option.label}
                                    </div>
                                    <div className="flex-1">
                                        <div className={`font-medium ${textColor}`}>{option.text}</div>
                                        {showCorrect && isCorrect && (
                                            <div className="text-sm text-green-600 mt-1">✓ Správná odpověď</div>
                                        )}
                                    </div>
                                </div>
                            </button>
                        )
                    })}
                </div>

                {!submitted && !showAnswer && (
                    <button
                        onClick={handleMultipleChoiceSubmit}
                        disabled={!selectedOption}
                        className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        Odeslat odpověď
                    </button>
                )}

                {submitted && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="text-blue-700">
                            {selectedOption && question.options?.find(opt => opt.label === selectedOption)?.isCorrect
                                ? '✅ Správně! Získáváte 1 bod.'
                                : '❌ Špatně. Zkuste to příště!'}
                        </div>
                    </div>
                )}
            </div>
        )
    }

    const renderBonusQuestion = () => {
        return (
            <div className="space-y-6">
                <div className="text-2xl font-semibold text-gray-900">{question.text}</div>

                <div className="space-y-4">
                    <div className="text-gray-600 mb-4">
                        Bonusová otázka - všechny odpovědi jsou správné:
                    </div>

                    <div className="space-y-3">
                        {question.bonusAnswers?.map((answer, index) => (
                            <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-center">
                                    <div className="w-6 h-6 flex items-center justify-center bg-yellow-100 text-yellow-600 rounded-full mr-3">
                                        {index + 1}
                                    </div>
                                    <div className="text-gray-900">{answer}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {!submitted && !showAnswer && (
                        <button
                            onClick={handleBonusSubmit}
                            className="px-6 py-3 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 transition-colors"
                        >
                            Potvrdit bonusové odpovědi
                        </button>
                    )}

                    {submitted && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="text-green-700">
                                ✅ Bonusové odpovědi přijaty! Získáváte {question.bonusAnswers?.length || 1} bodů.
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    const renderMediaQuestion = () => {
        return (
            <div className="space-y-6">
                <div className="text-2xl font-semibold text-gray-900">{question.text}</div>

                <div className="space-y-4">
                    {question.mediaUrl && (
                        <div className="bg-gray-100 rounded-lg p-4">
                            <div className="text-gray-600 mb-2">
                                {question.mediaType === 'audio' ? 'Audio otázka' : 'Video otázka'}
                            </div>
                            <div className="text-sm text-gray-500">
                                Media URL: {question.mediaUrl}
                            </div>
                        </div>
                    )}

                    {question.correctAnswer && (submitted || showAnswer) && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="text-sm font-medium text-green-600 mb-1">Správná odpověď:</div>
                            <div className="text-lg font-semibold text-green-700">{question.correctAnswer}</div>
                        </div>
                    )}

                    {!submitted && !showAnswer && question.correctAnswer && (
                        <div className="space-y-4">
                            <input
                                type="text"
                                value={userAnswer}
                                onChange={(e) => setUserAnswer(e.target.value)}
                                placeholder="Napište svou odpověď..."
                                className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                onKeyPress={(e) => e.key === 'Enter' && handleSimpleAnswerSubmit()}
                            />
                            <button
                                onClick={handleSimpleAnswerSubmit}
                                disabled={!userAnswer.trim()}
                                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                            >
                                Odeslat odpověď
                            </button>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    switch (question.type) {
        case 'simple':
            return renderSimpleQuestion()
        case 'ab':
        case 'abcdef':
            return renderMultipleChoice()
        case 'bonus':
            return renderBonusQuestion()
        case 'audio':
        case 'video':
            return renderMediaQuestion()
        default:
            return (
                <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
                    <div className="text-red-700">Neznámý typ otázky: {question.type}</div>
                </div>
            )
    }
}