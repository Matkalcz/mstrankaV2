// app/admin/quizzes/new/page.tsx - Vytvoření nového kvízu (zjednodušená verze)
"use client"

import { useState } from "react"
import { ArrowLeft, Save, Plus, Eye, Settings, ListOrdered, Users, Clock } from "lucide-react"
import Link from "next/link"

export default function NewQuizPage() {
  const [step, setStep] = useState(1)
  const [quizConfig, setQuizConfig] = useState({
    name: "",
    description: "",
    rounds: 1,
    questionsPerRound: 10,
    timePerQuestion: 30,
    showAnswers: true,
    randomize: false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setQuizConfig(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert(`Kvíz "${quizConfig.name}" vytvořen (demo - zatím bez databáze)`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/quizzes" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2">
            <ArrowLeft className="h-4 w-4" />
            Zpět na kvízy
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Vytvořit nový kvíz</h1>
          <p className="text-gray-600">Nastavte kvíz podle specifikace</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            {[1, 2, 3].map((stepNum) => (
              <button
                key={stepNum}
                type="button"
                onClick={() => setStep(stepNum)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  step === stepNum
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {stepNum === 1 && "Základní info"}
                {stepNum === 2 && "Otázky"}
                {stepNum === 3 && "Nastavení"}
              </button>
            ))}
          </div>

          <button
            type="submit"
            form="quiz-form"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Save className="h-4 w-4" />
            Uložit kvíz
          </button>
        </div>
      </div>

      <form id="quiz-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="rounded border bg-white p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <ListOrdered className="h-5 w-5" />
                  Základní informace
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Název kvízu *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={quizConfig.name}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      placeholder="Např. Hospodský kvíz #1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Popis
                    </label>
                    <textarea
                      name="description"
                      value={quizConfig.description}
                      onChange={handleChange}
                      rows={3}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      placeholder="Popis kvízu pro účastníky..."
                    />
                  </div>
                </div>
              </div>

              <div className="rounded border bg-white p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Struktura kvízu
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Počet kol
                    </label>
                    <input
                      type="number"
                      name="rounds"
                      value={quizConfig.rounds}
                      onChange={handleChange}
                      min="1"
                      max="10"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Otázek na kolo
                    </label>
                    <input
                      type="number"
                      name="questionsPerRound"
                      value={quizConfig.questionsPerRound}
                      onChange={handleChange}
                      min="1"
                      max="50"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded border bg-white p-6">
                <h2 className="text-lg font-semibold mb-4">Náhled kvízu</h2>
                
                <div className="space-y-4">
                  <div className="p-4 bg-gray-900 text-white rounded-lg">
                    <div className="text-xl font-bold mb-2">{quizConfig.name || "Název kvízu"}</div>
                    <div className="text-gray-300">{quizConfig.description || "Popis kvízu..."}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm text-gray-600">Kola</div>
                      <div className="text-2xl font-bold">{quizConfig.rounds}</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-sm text-gray-600">Otázek celkem</div>
                      <div className="text-2xl font-bold">{quizConfig.rounds * quizConfig.questionsPerRound}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Questions */}
        {step === 2 && (
          <div className="rounded border bg-white p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ListOrdered className="h-5 w-5" />
              Výběr otázek
            </h2>

            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-2">Demo režim</div>
                <div className="font-medium">V produkční verzi by zde byl výběr otázek z databáze</div>
                <div className="text-sm text-gray-600 mt-1">
                  Můžete pokračovat krokem 3 - nastavení kvízu
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="p-4 border border-gray-300 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                        Lehká
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium">
                        Jednoduchá
                      </span>
                    </div>
                    <div className="font-medium mb-1">Ukázková otázka #{i}</div>
                    <div className="text-sm text-gray-600">Kategorie: Piva</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Settings */}
        {step === 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="rounded border bg-white p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Nastavení kvízu
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Čas na otázku (sekundy)
                    </label>
                    <input
                      type="number"
                      name="timePerQuestion"
                      value={quizConfig.timePerQuestion}
                      onChange={handleChange}
                      min="10"
                      max="300"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        name="showAnswers"
                        checked={quizConfig.showAnswers}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <div className="font-medium text-gray-700">Zobrazovat správné odpovědi</div>
                        <div className="text-sm text-gray-500">Po každé otázce ukázat správnou odpověď</div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        name="randomize"
                        checked={quizConfig.randomize}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <div className="font-medium text-gray-700">Náhodné pořadí otázek</div>
                        <div className="text-sm text-gray-500">Každé spuštění kvízu v jiném pořadí</div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded border bg-white p-6">
                <h3 className="text-lg font-semibold mb-4">Shrnutí</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm text-gray-600">Otázek celkem</div>
                      <div className="text-2xl font-bold">{quizConfig.rounds * quizConfig.questionsPerRound}</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-sm text-gray-600">Celkový čas</div>
                      <div className="text-2xl font-bold">
                        {Math.round((quizConfig.rounds * quizConfig.questionsPerRound * quizConfig.timePerQuestion) / 60)} min
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="font-medium mb-2">Sekvence kvízu</div>
                    <div className="text-sm text-gray-600">
                      {quizConfig.rounds} kol × {quizConfig.questionsPerRound} otázek
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-6 border-t">
          <button
            type="button"
            onClick={() => setStep(prev => Math.max(1, prev - 1))}
            disabled={step === 1}
            className={`px-6 py-2 rounded-lg border ${
              step === 1
                ? "border-gray-300 text-gray-400 cursor-not-allowed"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            Předchozí
          </button>

          <button
            type="button"
            onClick={() => {
              if (step < 3) {
                setStep(prev => prev + 1)
              }
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {step < 3 ? "Další krok" : "Dokončit"}
          </button>
        </div>
      </form>
    </div>
  )
}