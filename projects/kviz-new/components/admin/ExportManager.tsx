'use client'

import { useState, useEffect } from 'react'

interface Quiz {
    id: string
    name: string
    description?: string
    status: string
    questionCount: number
}

interface Export {
    id: string
    quiz_id: string
    format: string
    file_path?: string
    generated_at: string
    status: string
}

export default function ExportManager() {
    const [quizzes, setQuizzes] = useState<Quiz[]>([])
    const [selectedQuiz, setSelectedQuiz] = useState<string>('')
    const [exportHistory, setExportHistory] = useState<Export[]>([])
    const [loading, setLoading] = useState(true)
    const [exporting, setExporting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    // Fetch quizzes
    const fetchQuizzes = async () => {
        try {
            const response = await fetch('/api/quizzes?status=published')
            if (!response.ok) {
                throw new Error('Failed to fetch quizzes')
            }
            const data = await response.json()
            setQuizzes(data)
            if (data.length > 0 && !selectedQuiz) {
                setSelectedQuiz(data[0].id)
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
        }
    }

    // Fetch export history
    const fetchExportHistory = async (quizId: string) => {
        try {
            const response = await fetch(`/api/export?quizId=${quizId}`)
            if (!response.ok) {
                throw new Error('Failed to fetch export history')
            }
            const data = await response.json()
            setExportHistory(data.exports || [])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
        }
    }

    useEffect(() => {
        const init = async () => {
            setLoading(true)
            await fetchQuizzes()
            setLoading(false)
        }
        init()
    }, [])

    useEffect(() => {
        if (selectedQuiz) {
            fetchExportHistory(selectedQuiz)
        }
    }, [selectedQuiz])

    // Handle export
    const handleExport = async () => {
        if (!selectedQuiz) {
            setError('Vyberte kvíz pro export')
            return
        }

        try {
            setExporting(true)
            setError(null)
            setSuccess(null)

            const response = await fetch('/api/export', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    quizId: selectedQuiz,
                    format: 'pptx'
                })
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Export failed')
            }

            const result = await response.json()
            setSuccess(`Kvíz úspěšně exportován: ${result.fileName}`)

            // Refresh export history
            await fetchExportHistory(selectedQuiz)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
        } finally {
            setExporting(false)
        }
    }

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('cs-CZ') + ' ' + date.toLocaleTimeString('cs-CZ')
    }

    // Get status badge color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800'
            case 'pending':
                return 'bg-yellow-100 text-yellow-800'
            case 'failed':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    // Get status text
    const getStatusText = (status: string) => {
        switch (status) {
            case 'completed':
                return 'Dokončeno'
            case 'pending':
                return 'Čeká'
            case 'failed':
                return 'Chyba'
            default:
                return status
        }
    }

    if (loading) {
        return (
            <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Načítám exporty...</p>
            </div>
        )
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Export kvízů</h2>
                <p className="text-gray-600">Exportujte kvízy do PowerPoint prezentací</p>
            </div>

            {/* Error message */}
            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {/* Success message */}
            {success && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-green-700">{success}</p>
                </div>
            )}

            {/* Export form */}
            <div className="mb-8 p-6 bg-gray-50 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4">Nový export</h3>
                <div className="space-y-4">
                    {/* Quiz selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Vyberte kvíz *
                        </label>
                        <select
                            value={selectedQuiz}
                            onChange={(e) => setSelectedQuiz(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">-- Vyberte kvíz --</option>
                            {quizzes.map((quiz) => (
                                <option key={quiz.id} value={quiz.id}>
                                    {quiz.name} ({quiz.questionCount} otázek)
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Export format */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Formát exportu
                        </label>
                        <div className="flex items-center space-x-4">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="format"
                                    value="pptx"
                                    defaultChecked
                                    className="mr-2"
                                />
                                <span>PowerPoint (PPTX)</span>
                            </label>
                        </div>
                    </div>

                    {/* Export button */}
                    <div className="pt-4">
                        <button
                            onClick={handleExport}
                            disabled={!selectedQuiz || exporting}
                            className={`px-6 py-3 font-medium rounded-md transition-colors ${!selectedQuiz || exporting
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                        >
                            {exporting ? (
                                <>
                                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                                    Exportuji...
                                </>
                            ) : (
                                'Exportovat kvíz'
                            )}
                        </button>
                        <p className="mt-2 text-sm text-gray-500">
                            Kvíz bude exportován do PowerPoint prezentace s automatickým formátováním.
                        </p>
                    </div>
                </div>
            </div>

            {/* Export history */}
            <div>
                <h3 className="text-lg font-semibold mb-4">Historie exportů</h3>
                {exportHistory.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p>Žádné exporty nebyly nalezeny.</p>
                        <p className="mt-1">Exportujte první kvíz pro zobrazení historie.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Kvíz
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Formát
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Soubor
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Čas exportu
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {exportHistory.map((exportItem) => {
                                    const quiz = quizzes.find(q => q.id === exportItem.quiz_id)
                                    return (
                                        <tr key={exportItem.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {quiz?.name || 'Neznámý kvíz'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    {exportItem.format.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(exportItem.status)}`}>
                                                    {getStatusText(exportItem.status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">
                                                    {exportItem.file_path ? (
                                                        <a
                                                            href={`/api/download/${exportItem.file_path}`}
                                                            className="text-blue-600 hover:text-blue-800"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            {exportItem.file_path.split('/').pop()}
                                                        </a>
                                                    ) : (
                                                        '-'
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-500">
                                                    {formatDate(exportItem.generated_at)}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}