// app/admin/quizzes/page.tsx - Správa kvízů
"use client"

import { useState } from "react"
import { Search, Filter, Plus, Edit, Trash2, Eye, Download, MoreVertical, Play, Copy, BarChart3 } from "lucide-react"
import Link from "next/link"

interface Quiz {
  id: string
  name: string
  description: string
  questions: number
  rounds: number
  status: "draft" | "published" | "archived"
  createdAt: string
  updatedAt: string
  author: string
}

export default function QuizzesPage() {
  const [search, setSearch] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<Quiz["status"] | "all">("all")

  const quizzes: Quiz[] = [
    { id: "1", name: "Hospodský kvíz #1", description: "Základní test znalostí českých piv", questions: 20, rounds: 4, status: "published", createdAt: "2026-03-10", updatedAt: "2026-03-10", author: "admin" },
    { id: "2", name: "Firemní teambuilding", description: "Kvíz pro firemní akce", questions: 15, rounds: 3, status: "published", createdAt: "2026-03-09", updatedAt: "2026-03-09", author: "admin" },
    { id: "3", name: "Vánoční speciál", description: "Vánoční kvíz s tematickými otázkami", questions: 25, rounds: 5, status: "draft", createdAt: "2026-03-08", updatedAt: "2026-03-08", author: "admin" },
    { id: "4", name: "Pivní mistrovství", description: "Soutěžní kvíz pro experty", questions: 30, rounds: 6, status: "published", createdAt: "2026-03-07", updatedAt: "2026-03-07", author: "admin" },
    { id: "5", name: "Test nováčků", description: "Jednoduchý kvíz pro začátečníky", questions: 10, rounds: 2, status: "archived", createdAt: "2026-03-06", updatedAt: "2026-03-06", author: "admin" },
  ]

  const filteredQuizzes = quizzes.filter(q => {
    const matchesSearch = q.name.toLowerCase().includes(search.toLowerCase()) || 
                         q.description.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = selectedStatus === "all" || q.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: Quiz["status"]) => {
    switch (status) {
      case "draft": return "bg-yellow-100 text-yellow-800"
      case "published": return "bg-green-100 text-green-800"
      case "archived": return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: Quiz["status"]) => {
    switch (status) {
      case "draft": return "Návrh"
      case "published": return "Publikováno"
      case "archived": return "Archivováno"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Správa kvízů</h1>
          <p className="text-gray-600">Vytvářejte a spravujte hospodské kvízy podle specifikace</p>
        </div>
        <Link href="/admin/quizzes/new" className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          Vytvořit kvíz
        </Link>
      </div>

      {/* Filters */}
      <div className="rounded-xl border bg-white p-6">
        <div className="grid gap-4 md:grid-cols-3">
          {/* Search */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Hledat</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Hledat kvíz..."
                className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Status filter */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Stav</label>
            <select
              className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 px-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as Quiz["status"] | "all")}
            >
              <option value="all">Všechny stavy</option>
              <option value="draft">Návrh</option>
              <option value="published">Publikováno</option>
              <option value="archived">Archivováno</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-end gap-3">
            <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <Filter className="h-4 w-4" />
              Filtry
            </button>
            <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <div className="rounded-xl border bg-white p-6">
          <p className="text-sm text-gray-600">Celkem kvízů</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">24</p>
        </div>
        <div className="rounded-xl border bg-white p-6">
          <p className="text-sm text-gray-600">Publikováno</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">8</p>
        </div>
        <div className="rounded-xl border bg-white p-6">
          <p className="text-sm text-gray-600">Návrhů</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">3</p>
        </div>
        <div className="rounded-xl border bg-white p-6">
          <p className="text-sm text-gray-600">Spuštění</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">156</p>
        </div>
      </div>

      {/* Quizzes grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredQuizzes.map((quiz) => (
          <div key={quiz.id} className="overflow-hidden rounded-xl border bg-white shadow-sm">
            {/* Quiz header */}
            <div className="border-b p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{quiz.name}</h3>
                  <p className="mt-1 text-sm text-gray-600">{quiz.description}</p>
                </div>
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(quiz.status)}`}>
                  {getStatusLabel(quiz.status)}
                </span>
              </div>
            </div>

            {/* Quiz stats */}
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Otázek</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{quiz.questions}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Kol</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{quiz.rounds}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Vytvořil</p>
                  <p className="mt-1 font-medium text-gray-900">{quiz.author}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Aktualizováno</p>
                  <p className="mt-1 font-medium text-gray-900">{quiz.updatedAt}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Link href={`/quiz/${quiz.id}`} target="_blank" className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50">
                    <Play className="h-4 w-4" />
                    Spustit
                  </Link>
                  <Link href={`/admin/quizzes/${quiz.id}`} className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100">
                    <Edit className="h-4 w-4" />
                    Upravit
                  </Link>
                </div>
                <div className="flex items-center gap-1">
                  <button className="rounded-lg p-2 text-gray-600 hover:bg-gray-200" title="Statistiky">
                    <BarChart3 className="h-4 w-4" />
                  </button>
                  <button className="rounded-lg p-2 text-gray-600 hover:bg-gray-200" title="Exportovat prezentaci">
                    <Download className="h-4 w-4" />
                  </button>
                  <button className="rounded-lg p-2 text-gray-600 hover:bg-gray-200" title="Duplikovat">
                    <Copy className="h-4 w-4" />
                  </button>
                  <button className="rounded-lg p-2 text-red-600 hover:bg-red-100" title="Smazat">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create new quiz card */}
      <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
        <div className="mx-auto max-w-md">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Plus className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">Vytvořte nový kvíz</h3>
          <p className="mb-6 text-gray-600">
            Začněte vytvářet nový hospodský kvíz podle specifikace s automatickým řízením
          </p>
          <Link href="/admin/quizzes/new" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            Vytvořit nový kvíz
          </Link>
        </div>
      </div>
    </div>
  )
}