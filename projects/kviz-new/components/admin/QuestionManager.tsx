'use client'

import { useState, useEffect } from 'react'
import { QuestionData } from '@/components/universal-quiz-renderer'

interface Question extends QuestionData {
    id: string
    created_at: string
    updated_at: string
    correct_answer?: string
    media_url?: string
    points?: number
}

export default function QuestionManager() {
    const [questions, setQuestions] = useState<Question[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showForm, setShowForm] = useState(false)
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
    const [formData, setFormData] = useState({
        text: '',
        type: 'simple',
        correct_answer: '',
        options: [] as Array<{ label: string; text: string; isCorrect?: boolean }>,
        bonusAnswers: [] as string[],
        media_url: '',
        points: 1,
        category: '',
        difficulty: 'medium'
    })

    // Fetch questions
    const fetchQuestions = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/questions')
            if (!response.ok) {
                throw new Error('Failed to fetch questions')
            }
            const data = await response.json()
            setQuestions(data)
            setError(null)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchQuestions()
    }, [])

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    // Handle option changes
    const handleOptionChange = (index: number, field: string, value: string | boolean) => {
        const newOptions = [...formData.options]
        newOptions[index] = {
            ...newOptions[index],
            [field]: value
        }
        setFormData(prev => ({
            ...prev,
            options: newOptions
        }))
    }

    // Add new option
    const addOption = () => {
        const label = String.fromCharCode(65 + formData.options.length) // A, B, C, ...
        setFormData(prev => ({
            ...prev,
            options: [...prev.options, { label, text: '', isCorrect: false }]
        }))
    }

    // Remove option
    const removeOption = (index: number) => {
        setFormData(prev => ({
            ...prev,
            options: prev.options.filter((_, i) => i !== index)
        }))
    }

    // Handle bonus answer changes
    const handleBonusAnswerChange = (index: number, value: string) => {
        const newBonusAnswers = [...formData.bonusAnswers]
        newBonusAnswers[index] = value
        setFormData(prev => ({
            ...prev,
            bonusAnswers: newBonusAnswers
        }))
    }

    // Add bonus answer
    const addBonusAnswer = () => {
        setFormData(prev => ({
            ...prev,
            bonusAnswers: [...prev.bonusAnswers, '']
        }))
    }

    // Remove bonus answer
    const removeBonusAnswer = (index: number) => {
        setFormData(prev => ({
            ...prev,
            bonusAnswers: prev.bonusAnswers.filter((_, i) => i !== index)
        }))
    }

    // Reset form
    const resetForm = () => {
        setFormData({
            text: '',
            type: 'simple',
            correct_answer: '',
            options: [],
            bonusAnswers: [],
            media_url: '',
            points: 1,
            category: '',
            difficulty: 'medium'
        })
        setEditingQuestion(null)
        setShowForm(false)
    }

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const url = editingQuestion ? `/api/questions/${editingQuestion.id}` : '/api/questions'
            const method = editingQuestion ? 'PUT' : 'POST'

            const payload = {
                ...formData,
                options: formData.type === 'bonus' ? [] : formData.options,
                bonusAnswers: formData.type === 'bonus' ? formData.bonusAnswers : []
            }

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })

            if (!response.ok) {
                throw new Error('Failed to save question')
            }

            await fetchQuestions()
            resetForm()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
        }
    }

    // Handle edit
    const handleEdit = (question: Question) => {
        setEditingQuestion(question)
        setFormData({
            text: question.text,
            type: question.type,
            correct_answer: question.correctAnswer || question.correct_answer || '',
            options: question.options || [],
            bonusAnswers: question.bonusAnswers || [],
            media_url: question.mediaUrl || question.media_url || '',
            points: question.points || 1,
            category: question.category || '',
            difficulty: question.difficulty || 'medium'
        })
        setShowForm(true)
    }

    // Handle delete
    const handleDelete = async (id: string) => {
        if (!confirm('Opravdu chcete smazat tuto otázku?')) return

        try {
            const response = await fetch(`/api/questions/${id}`, {
                method: 'DELETE'
            })

            if (!response.ok) {
                throw new Error('Failed to delete question')
            }

            await fetchQuestions()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
        }
    }

    if (loading) {
        return (
            <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Načítám otázky...</p>
            </div>
        )
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Správa otázek</h2>
                    <p className="text-gray-600">Celkem otázek: {questions.length}</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                    + Nová otázka
                </button>
            </div>

            {/* Error message */}
            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {/* Question form */}
            {showForm && (
                <div className="mb-8 p-6 bg-gray-50 rounded-lg border">
                    <h3 className="text-lg font-semibold mb-4">
                        {editingQuestion ? 'Upravit otázku' : 'Nová otázka'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Question text */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Text otázky *
                            </label>
                            <textarea
                                name="text"
                                value={formData.text}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={3}
                                required
                            />
                        </div>

                        {/* Question type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Typ otázky *
                            </label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="simple">Otázka</option>
                                <option value="ab">AB otázka</option>
                                <option value="abcdef">A-F</option>
                                <option value="bonus">Bonusová</option>
                                <option value="audio">Audio</option>
                                <option value="video">Video</option>
                            </select>
                        </div>

                        {/* Simple answer */}
                        {formData.type === 'simple' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Správná odpověď *
                                </label>
                                <input
                                    type="text"
                                    name="correct_answer"
                                    value={formData.correct_answer}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                        )}

                        {/* Multiple choice options */}
                        {(formData.type === 'ab' || formData.type === 'abcdef') && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Možnosti odpovědí
                                </label>
                                {formData.options.map((option, index) => (
                                    <div key={index} className="flex items-center space-x-2 mb-2">
                                        <span className="w-8 font-medium">{option.label}</span>
                                        <input
                                            type="text"
                                            value={option.text}
                                            onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Text možnosti"
                                        />
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={option.isCorrect || false}
                                                onChange={(e) => handleOptionChange(index, 'isCorrect', e.target.checked)}
                                                className="mr-1"
                                            />
                                            <span className="text-sm">Správná</span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => removeOption(index)}
                                            className="px-2 py-1 text-red-600 hover:text-red-800"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addOption}
                                    className="mt-2 px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md"
                                >
                                    + Přidat možnost
                                </button>
                            </div>
                        )}

                        {/* Bonus answers */}
                        {formData.type === 'bonus' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Bonusové odpovědi
                                </label>
                                {formData.bonusAnswers.map((answer, index) => (
                                    <div key={index} className="flex items-center space-x-2 mb-2">
                                        <span className="w-8">{index + 1}.</span>
                                        <input
                                            type="text"
                                            value={answer}
                                            onChange={(e) => handleBonusAnswerChange(index, e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Bonusová odpověď"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeBonusAnswer(index)}
                                            className="px-2 py-1 text-red-600 hover:text-red-800"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addBonusAnswer}
                                    className="mt-2 px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md"
                                >
                                    + Přidat odpověď
                                </button>
                            </div>
                        )}

                        {/* Media URL */}
                        {(formData.type === 'audio' || formData.type === 'video') && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    URL média *
                                </label>
                                <input
                                    type="url"
                                    name="media_url"
                                    value={formData.media_url}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                        )}

                        {/* Category and difficulty */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Kategorie
                                </label>
                                <input
                                    type="text"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Obtížnost
                                </label>
                                <select
                                    name="difficulty"
                                    value={formData.difficulty}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="easy">Lehká</option>
                                    <option value="medium">Střední</option>
                                    <option value="hard">Těžká</option>
                                </select>
                            </div>
                        </div>

                        {/* Points */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Body
                            </label>
                            <input
                                type="number"
                                name="points"
                                value={formData.points}
                                onChange={handleInputChange}
                                min="1"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Form buttons */}
                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                            >
                                Zrušit
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
                            >
                                {editingQuestion ? 'Uložit změny' : 'Vytvořit otázku'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Questions list */}
            {questions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <p>Žádné otázky nebyly nalezeny.</p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="mt-2 text-blue-600 hover:text-blue-800"
                    >
                        Vytvořte první otázku
                    </button>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Otázka
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Typ
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Kategorie
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Obtížnost
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Akce
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {questions.map((question) => (
                                <tr key={question.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">
                                            {question.text.length > 50
                                                ? `${question.text.substring(0, 50)}...`
                                                : question.text}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {question.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">{question.category || '-'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${question.difficulty === 'easy' ? 'bg-green-100 text-green-800' : question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                            {question.difficulty === 'easy' ? 'Lehká' : question.difficulty === 'medium' ? 'Střední' : 'Těžká'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleEdit(question)}
                                                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md transition-colors"
                                            >
                                                Upravit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(question.id)}
                                                className="px-3 py-1 text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded-md transition-colors"
                                            >
                                                Smazat
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
