"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Trash2, Save, Loader2, Tag } from "lucide-react"
import Link from "next/link"

type QuestionType = "simple" | "abcdef" | "bonus" | "audio" | "video" | "image"
type Difficulty = "easy" | "medium" | "hard"

interface Option {
  text: string
  isCorrect: boolean
}

export interface TagItem {
  id: string
  name: string
  color: string
}

export interface QuestionData {
  id: string
  text: string
  type: QuestionType
  tag_ids: string[]
  difficulty: Difficulty
  points: number
  correct_answer: string | null
  media_url: string | null
  options: Option[]
}

interface FormState {
  text: string
  type: QuestionType
  selectedTagIds: string[]
  difficulty: Difficulty
  points: number
  correct_answer: string
  media_url: string
  options: Option[]
}

const TYPE_LABELS: Record<QuestionType, string> = {
  simple: "Jednoduchá",
  abcdef: "ABCDEF (2–6 možností)",
  bonus: "Bonusová",
  audio: "Audio",
  video: "Video",
  image: "Obrázková",
}

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "Lehká",
  medium: "Střední",
  hard: "Těžká",
}

function getDefaultOptions(type: QuestionType): Option[] {
  if (type === "abcdef") {
    return [
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ]
  }
  if (type === "bonus") {
    return [
      { text: "", isCorrect: true },
      { text: "", isCorrect: true },
    ]
  }
  return []
}

function buildInitialForm(question: QuestionData | null, bonusTagId: string | null): FormState {
  if (!question) {
    return {
      text: "",
      type: "simple",
      selectedTagIds: [],
      difficulty: "medium",
      points: 1,
      correct_answer: "",
      media_url: "",
      options: [],
    }
  }
  return {
    text: question.text || "",
    type: question.type || "simple",
    selectedTagIds: Array.isArray(question.tag_ids) ? question.tag_ids : [],
    difficulty: question.difficulty || "medium",
    points: question.points || 1,
    correct_answer: question.correct_answer ?? "",
    media_url: question.media_url ?? "",
    options:
      Array.isArray(question.options) && question.options.length > 0
        ? question.options
        : getDefaultOptions(question.type),
  }
}

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"]

interface Props {
  tags: TagItem[]
  question: QuestionData | null
  editId: string | null
}

export default function QuestionForm({ tags, question, editId }: Props) {
  const router = useRouter()
  const isEdit = !!editId

  const bonusTagId = tags.find((t) => t.name === "Bonusové otázky")?.id ?? null

  const [form, setForm] = useState<FormState>(() => buildInitialForm(question, bonusTagId))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tagSearch, setTagSearch] = useState("")

  const handleTypeChange = useCallback(
    (newType: QuestionType) => {
      setForm((prev) => ({
        ...prev,
        type: newType,
        options: getDefaultOptions(newType),
        selectedTagIds:
          newType === "bonus" && bonusTagId && !prev.selectedTagIds.includes(bonusTagId)
            ? [...prev.selectedTagIds, bonusTagId]
            : prev.selectedTagIds,
      }))
    },
    [bonusTagId]
  )

  const toggleTag = (tagId: string) => {
    setForm((prev) => ({
      ...prev,
      selectedTagIds: prev.selectedTagIds.includes(tagId)
        ? prev.selectedTagIds.filter((id) => id !== tagId)
        : [...prev.selectedTagIds, tagId],
    }))
  }

  const setOption = (index: number, field: "text" | "isCorrect", value: string | boolean) => {
    setForm((prev) => {
      const opts = [...prev.options]
      opts[index] = { ...opts[index], [field]: value }
      if (prev.type === "bonus") opts[index].isCorrect = true
      return { ...prev, options: opts }
    })
  }

  const addOption = () => {
    setForm((prev) => ({
      ...prev,
      options: [...prev.options, { text: "", isCorrect: prev.type === "bonus" }],
    }))
  }

  const removeOption = (index: number) => {
    setForm((prev) => {
      if (prev.options.length <= 2) return prev
      return { ...prev, options: prev.options.filter((_, i) => i !== index) }
    })
  }

  const validate = (): string | null => {
    if (!form.text.trim()) return "Text otázky je povinný."
    if (form.type === "simple" && !form.correct_answer.trim()) return "Správná odpověď je povinná."
    if (form.type === "abcdef") {
      if (form.options.some((o) => !o.text.trim())) return "Všechny možnosti musí mít text."
      if (!form.options.some((o) => o.isCorrect)) return "Alespoň jedna možnost musí být správná."
    }
    if (form.type === "bonus") {
      if (form.options.some((o) => !o.text.trim())) return "Všechny odpovědi musí mít text."
      if (form.options.length < 2) return "Bonusová otázka musí mít alespoň 2 odpovědi."
    }
    if (form.type === "audio" || form.type === "video") {
      if (!form.media_url.trim()) return "URL média je povinné."
      if (!form.correct_answer.trim()) return "Správná odpověď je povinná."
    }
    if (form.type === "image") {
      if (!form.media_url.trim()) return "URL obrázku je povinné."
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) { setError(validationError); return }
    setError(null)
    setLoading(true)

    const payload = {
      text: form.text.trim(),
      type: form.type,
      tag_ids: form.selectedTagIds,
      difficulty: form.difficulty,
      points: form.points,
      correct_answer:
        form.type === "bonus"
          ? (form.options[0]?.text || "")
          : form.correct_answer.trim() || null,
      media_url:
        form.type === "audio" || form.type === "video" || form.type === "image"
          ? form.media_url.trim()
          : null,
      options:
        form.type === "abcdef" || form.type === "bonus"
          ? form.options
          : [],
    }

    try {
      const url = isEdit ? `/api/questions/${editId}` : "/api/questions"
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error((body as any).error || `HTTP ${res.status}`)
      }
      router.push("/admin/questions")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Filtered tags for search
  const filteredTags = tagSearch.trim()
    ? tags.filter((t) => t.name.toLowerCase().includes(tagSearch.toLowerCase()))
    : tags

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Link
            href="/admin/questions"
            className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Zpět na seznam</span>
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            {isEdit ? "Upravit otázku" : "Nová otázka"}
          </h1>

          {error && (
            <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Text otázky <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.text}
                onChange={(e) => setForm((p) => ({ ...p, text: e.target.value }))}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Zadejte text otázky..."
              />
            </div>

            {/* Type + Difficulty */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Typ otázky</label>
                <select
                  value={form.type}
                  onChange={(e) => handleTypeChange(e.target.value as QuestionType)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {(Object.keys(TYPE_LABELS) as QuestionType[]).map((t) => (
                    <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Obtížnost</label>
                <select
                  value={form.difficulty}
                  onChange={(e) => setForm((p) => ({ ...p, difficulty: e.target.value as Difficulty }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {(Object.keys(DIFFICULTY_LABELS) as Difficulty[]).map((d) => (
                    <option key={d} value={d}>{DIFFICULTY_LABELS[d]}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tags (multi-select) + Points */}
            <div className="grid grid-cols-2 gap-4 items-start">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="flex items-center gap-1">
                    <Tag className="h-3.5 w-3.5" />
                    Tagy
                    {form.selectedTagIds.length > 0 && (
                      <span className="ml-1 text-blue-600 font-semibold">({form.selectedTagIds.length})</span>
                    )}
                  </span>
                </label>

                {/* Selected tag chips */}
                {form.selectedTagIds.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {form.selectedTagIds.map((id) => {
                      const tag = tags.find((t) => t.id === id)
                      if (!tag) return null
                      return (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-white"
                          style={{ backgroundColor: tag.color || '#3b82f6' }}
                        >
                          {tag.name}
                          <button
                            type="button"
                            onClick={() => toggleTag(id)}
                            className="ml-0.5 hover:opacity-70"
                          >
                            ×
                          </button>
                        </span>
                      )
                    })}
                  </div>
                )}

                {/* Tag search + checkboxes */}
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <input
                    type="text"
                    value={tagSearch}
                    onChange={(e) => setTagSearch(e.target.value)}
                    placeholder="Hledat tag..."
                    className="w-full px-3 py-1.5 text-xs border-b border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <div className="max-h-36 overflow-y-auto">
                    {filteredTags.length === 0 && (
                      <p className="px-3 py-2 text-xs text-gray-400">Žádný tag nenalezen</p>
                    )}
                    {filteredTags.map((tag) => (
                      <label
                        key={tag.id}
                        className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={form.selectedTagIds.includes(tag.id)}
                          onChange={() => toggleTag(tag.id)}
                          className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: tag.color || '#3b82f6' }}
                        />
                        <span className="text-xs text-gray-700">{tag.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Počet bodů</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={form.points}
                  onChange={(e) => setForm((p) => ({ ...p, points: Math.max(1, parseInt(e.target.value) || 1) }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* simple */}
            {form.type === "simple" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Správná odpověď <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.correct_answer}
                  onChange={(e) => setForm((p) => ({ ...p, correct_answer: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Zadejte správnou odpověď..."
                />
              </div>
            )}

            {/* abcdef */}
            {form.type === "abcdef" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Možnosti <span className="text-red-500">*</span>
                  <span className="ml-2 text-xs text-gray-400 font-normal">zaškrtněte správnou odpověď</span>
                </label>
                <div className="space-y-2">
                  {form.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="w-6 text-sm font-semibold text-gray-500 shrink-0">{OPTION_LETTERS[i]}</span>
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => setOption(i, "text", e.target.value)}
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`Možnost ${OPTION_LETTERS[i]}...`}
                      />
                      <label className="flex items-center gap-1.5 text-sm text-gray-600 shrink-0 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={opt.isCorrect}
                          onChange={(e) => setOption(i, "isCorrect", e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        Správná
                      </label>
                      <button
                        type="button"
                        onClick={() => removeOption(i)}
                        disabled={form.options.length <= 2}
                        className="p-1 text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                {form.options.length < 6 && (
                  <button
                    type="button"
                    onClick={addOption}
                    className="mt-3 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <Plus className="h-4 w-4" />
                    Přidat možnost {OPTION_LETTERS[form.options.length]}
                  </button>
                )}
              </div>
            )}

            {/* bonus */}
            {form.type === "bonus" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Správné odpovědi <span className="text-red-500">*</span>
                  <span className="ml-2 text-xs text-gray-400 font-normal">každý klik odhalí další</span>
                </label>
                <div className="space-y-2">
                  {form.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="w-5 text-sm font-semibold text-purple-500 shrink-0">{i + 1}.</span>
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => setOption(i, "text", e.target.value)}
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder={`Odpověď ${i + 1}...`}
                      />
                      <button
                        type="button"
                        onClick={() => removeOption(i)}
                        disabled={form.options.length <= 2}
                        className="p-1 text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                {form.options.length < 6 && (
                  <button
                    type="button"
                    onClick={addOption}
                    className="mt-3 flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800"
                  >
                    <Plus className="h-4 w-4" />
                    Přidat odpověď
                  </button>
                )}
              </div>
            )}

            {/* audio */}
            {form.type === "audio" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL audio souboru (MP3) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={form.media_url}
                    onChange={(e) => setForm((p) => ({ ...p, media_url: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/audio.mp3"
                  />
                  {form.media_url && <audio src={form.media_url} controls className="mt-2 w-full h-10" />}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Správná odpověď <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.correct_answer}
                    onChange={(e) => setForm((p) => ({ ...p, correct_answer: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Název skladby, interpreta..."
                  />
                </div>
              </div>
            )}

            {/* video */}
            {form.type === "video" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL videa <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={form.media_url}
                    onChange={(e) => setForm((p) => ({ ...p, media_url: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/video.mp4"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Správná odpověď <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.correct_answer}
                    onChange={(e) => setForm((p) => ({ ...p, correct_answer: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Název videa, díla..."
                  />
                </div>
              </div>
            )}

            {/* image */}
            {form.type === "image" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL obrázku <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={form.media_url}
                    onChange={(e) => setForm((p) => ({ ...p, media_url: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/obrazek.jpg"
                  />
                  {form.media_url && (
                    <img
                      src={form.media_url}
                      alt="Náhled obrázku"
                      className="mt-2 max-h-48 rounded-lg border border-gray-200 object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                      onLoad={(e) => { (e.target as HTMLImageElement).style.display = 'block' }}
                    />
                  )}
                  <p className="mt-1 text-xs text-gray-400">
                    Klik 1 = zobrazí text otázky · Klik 2 = zobrazí obrázek přes celou obrazovku · Klik 3 = další otázka
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Správná odpověď <span className="text-gray-400 font-normal">(volitelné)</span>
                  </label>
                  <input
                    type="text"
                    value={form.correct_answer}
                    onChange={(e) => setForm((p) => ({ ...p, correct_answer: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Popis obrázku, správná odpověď..."
                  />
                </div>
              </div>
            )}

            {/* Submit */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {isEdit ? "Uložit změny" : "Vytvořit otázku"}
              </button>
              <Link
                href="/admin/questions"
                className="rounded-lg px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Zrušit
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
