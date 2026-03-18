'use client'

import { useState, useEffect } from 'react'

interface Quiz {
    id: string
    name: string
    description?: string
    status: string
    created_at: string
    updated_at: string
    author?: string
    questionCount: number
    roundCount: number
}

export default function QuizManager() {
    const [quizzes, setQuizzes] = useState<Quiz[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Fetch quizzes
    const fetchQuizzes = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/quizzes')
            if (!response.ok) {
                throw new Error('Failed to fetch quizzes')
            }
            const data = await response.json()
            setQuizzes(data)
            setError(null)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchQuizzes()
    }, [])

    // Handle delete
    const handleDelete = async (id: string) => {
        if (!confirm('Opravdu chcete smazat tento kvíz?')) return

        try {
            const response = await fetch(`/api/quizzes/${id}`, {
                method: 'DELETE'
            })

            if (!response.ok) {
                throw new Error('Failed to delete quiz')
            }

            await fetchQuizzes()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
        }
    }

    // Handle status change
    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            const response = await fetch(`/api/quizzes/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            })

            if (!response.ok) {
                throw new Error('Failed to update quiz status')
            }

            await fetchQuizzes()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
        }
    }

    if (loading) {
        return (
            <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Načítám kvízy...</p>
            </div>
        )
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Správa kvízů</h2>
                    <p className="text-gray-600">Celkem kvízů: {quizzes.length}</p>
                </div>
                <button
                    onClick={() => alert('Vytvoření kvízu bude implementováno')}
                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                    + Nový kvíz
                </button>
            </div>

            {/* Error message */}
            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {/* Quizzes list */}
            {quizzes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <p>Žádné kvízy nebyly nalezeny.</p>
                    <button
                        onClick={() => alert('Vytvoření kvízu bude implementováno')}
                        className="mt-2 text-blue-600 hover:text-blue-800"
                    >
                        Vytvořte první kvíz
                    </button>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Název
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Otázky
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Kola
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Vytvořeno
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Akce
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {quizzes.map((quiz) => (
                                <tr key={quiz.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {quiz.name}
                                            </div>
                                            {quiz.description && (
                                                <div className="text-sm text-gray-500">
                                                    {quiz.description.length > 50
                                                        ? `${quiz.description.substring(0, 50)}...`
                                                        : quiz.description}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={quiz.status}
                                            onChange={(e) => handleStatusChange(quiz.id, e.target.value)}
                                            className={`text-sm font-medium rounded-md px-2 py-1 ${quiz.status === 'published'
                                                ? 'bg-green-100 text-green-800'
                                                : quiz.status === 'draft'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                }`}
                                        >
                                            <option value="draft">Návrh</option>
                                            <option value="published">Publikováno</option>
                                            <option value="archived">Archivováno</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">{quiz.questionCount}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">{quiz.roundCount}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-500">
                                            {new Date(quiz.created_at).toLocaleDateString('cs-CZ')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => alert(`Edit quiz ${quiz.id}`)}
                                                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md transition-colors"
                                            >
                                                Upravit
                                            </button>
                                            <button
                                                onClick={() => alert(`Export quiz ${quiz.id}`)}
                                                className="px-3 py-1 text-sm bg-green-100 text-green-700 hover:bg-green-200 rounded-md transition-colors"
                                            >
                                                Export
                                            </button>
                                            <button
                                                onClick={() => handleDelete(quiz.id)}
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