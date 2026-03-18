'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FileQuestion, Tag, BarChart3, PlusCircle } from 'lucide-react'

interface DashboardStats {
  totalQuizzes: number
  activeQuizzes: number
  totalQuestions: number
  totalCategories: number
}

interface RecentActivity {
  id: string
  label: string
  time: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalQuizzes: 0,
    activeQuizzes: 0,
    totalQuestions: 0,
    totalCategories: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [quizzesRes, questionsRes, categoriesRes] = await Promise.all([
          fetch('/api/quizzes'),
          fetch('/api/questions'),
          fetch('/api/categories'),
        ])

        const [quizzes, questions, categories] = await Promise.all([
          quizzesRes.ok ? quizzesRes.json() : [],
          questionsRes.ok ? questionsRes.json() : [],
          categoriesRes.ok ? categoriesRes.json() : [],
        ])

        setStats({
          totalQuizzes: Array.isArray(quizzes) ? quizzes.length : 0,
          activeQuizzes: Array.isArray(quizzes)
            ? quizzes.filter((q: { status: string }) => q.status === 'published').length
            : 0,
          totalQuestions: Array.isArray(questions) ? questions.length : 0,
          totalCategories: Array.isArray(categories) ? categories.length : 0,
        })
      } catch (err) {
        console.error('Chyba při načítání statistik:', err)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  const statCards = [
    { label: 'Celkem kvízů', value: stats.totalQuizzes, icon: FileQuestion, color: 'text-blue-600' },
    { label: 'Aktivní kvízy', value: stats.activeQuizzes, icon: FileQuestion, color: 'text-green-600' },
    { label: 'Otázek v DB', value: stats.totalQuestions, icon: BarChart3, color: 'text-purple-600' },
    { label: 'Kategorie', value: stats.totalCategories, icon: Tag, color: 'text-orange-600' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Přehled aktivit a statistik kvízového systému</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">{card.label}</p>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {loading ? (
                <span className="inline-block h-8 w-12 animate-pulse rounded bg-gray-200" />
              ) : (
                card.value
              )}
            </p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Rychlé akce</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <Link
            href="/admin/quizzes/new"
            className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-blue-700 hover:bg-blue-100 transition-colors"
          >
            <PlusCircle className="h-5 w-5" />
            <span className="font-medium">Vytvořit kvíz</span>
          </Link>
          <Link
            href="/admin/questions"
            className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-green-700 hover:bg-green-100 transition-colors"
          >
            <PlusCircle className="h-5 w-5" />
            <span className="font-medium">Přidat otázku</span>
          </Link>
          <Link
            href="/admin/categories"
            className="flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 p-3 text-purple-700 hover:bg-purple-100 transition-colors"
          >
            <Tag className="h-5 w-5" />
            <span className="font-medium">Správa kategorií</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
