"use client"

import { useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Trash2, Save, Loader2, Tag, X, Check, Upload, XCircle } from "lucide-react"
import Link from "next/link"
import { QUESTION_TYPE_LABEL, QUESTION_TYPE_LABEL_FULL, DIFFICULTY_LABEL } from "@/lib/questionTypes"

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

const TYPE_LABELS = QUESTION_TYPE_LABEL as Record<QuestionType, string>
const DIFFICULTY_LABELS = DIFFICULTY_LABEL as Record<Difficulty, string>

function getDefaultOptions(type: QuestionType): Option[] {
  if (type === "abcdef") return [{ text: "", isCorrect: false }, { text: "", isCorrect: false }]
  if (type === "bonus")  return [{ text: "", isCorrect: true  }, { text: "", isCorrect: true  }]
  return []
}

function buildInitialForm(question: QuestionData | null): FormState {
  if (!question) return {
    text: "", type: "simple", selectedTagIds: [], difficulty: "medium",
    points: 1, correct_answer: "", media_url: "", options: [],
  }
  return {
    text: question.text || "",
    type: question.type || "simple",
    selectedTagIds: Array.isArray(question.tag_ids) ? question.tag_ids : [],
    difficulty: question.difficulty || "medium",
    points: question.points || 1,
    correct_answer: question.correct_answer ?? "",
    media_url: question.media_url ?? "",
    options: Array.isArray(question.options) && question.options.length > 0
      ? question.options : getDefaultOptions(question.type),
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

  const bonusTagId = tags.find(t => t.name === "Bonusové otázky")?.id ?? null
  const [form, setForm] = useState<FormState>(() => buildInitialForm(question))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tagSearch, setTagSearch] = useState("")
  const [localTags, setLocalTags] = useState<TagItem[]>(tags)
  const [newTagOpen, setNewTagOpen] = useState(false)
  const [newTagName, setNewTagName] = useState("")
  const [newTagColor, setNewTagColor] = useState("#7c3aed")
  const [newTagSaving, setNewTagSaving] = useState(false)
  const [uploadingMedia, setUploadingMedia] = useState(false)

  async function uploadMedia(file: File) {
    setUploadingMedia(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) setForm(p => ({ ...p, media_url: data.url }))
      else alert(data.error || 'Chyba při nahrávání')
    } finally {
      setUploadingMedia(false)
    }
  }

  async function clearMedia() {
    const url = form.media_url
    setForm(p => ({ ...p, media_url: '' }))
    // If it's a server-uploaded file, delete it from disk
    if (url && url.startsWith('/api/media/')) {
      const filename = url.split('/api/media/')[1]
      await fetch(`/api/media/${filename}`, { method: 'DELETE' }).catch(() => {})
    }
  }
  const newTagInputRef = useRef<HTMLInputElement>(null)

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return
    setNewTagSaving(true)
    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTagName.trim(), color: newTagColor }),
      })
      if (!res.ok) {
        const b = await res.json().catch(() => ({}))
        throw new Error((b as any).error || `HTTP ${res.status}`)
      }
      const created: TagItem = await res.json()
      setLocalTags(prev => [...prev, created])
      setForm(prev => ({ ...prev, selectedTagIds: [...prev.selectedTagIds, created.id] }))
      setNewTagName("")
      setNewTagColor("#7c3aed")
      setNewTagOpen(false)
    } catch (err: any) {
      alert(`Chyba: ${err.message}`)
    } finally {
      setNewTagSaving(false)
    }
  }

  const handleTypeChange = useCallback((newType: QuestionType) => {
    setForm(prev => ({
      ...prev,
      type: newType,
      options: getDefaultOptions(newType),
      selectedTagIds: newType === "bonus" && bonusTagId && !prev.selectedTagIds.includes(bonusTagId)
        ? [...prev.selectedTagIds, bonusTagId] : prev.selectedTagIds,
    }))
  }, [bonusTagId])

  const toggleTag = (tagId: string) => setForm(prev => ({
    ...prev,
    selectedTagIds: prev.selectedTagIds.includes(tagId)
      ? prev.selectedTagIds.filter(id => id !== tagId)
      : [...prev.selectedTagIds, tagId],
  }))

  const setOption = (index: number, field: "text" | "isCorrect", value: string | boolean) =>
    setForm(prev => {
      const opts = [...prev.options]
      opts[index] = { ...opts[index], [field]: value }
      if (prev.type === "bonus") opts[index].isCorrect = true
      return { ...prev, options: opts }
    })

  const addOption = () => setForm(prev => ({
    ...prev,
    options: [...prev.options, { text: "", isCorrect: prev.type === "bonus" }],
  }))

  const removeOption = (index: number) => setForm(prev => {
    if (prev.options.length <= 2) return prev
    return { ...prev, options: prev.options.filter((_, i) => i !== index) }
  })

  const validate = (): string | null => {
    if (!form.text.trim()) return "Text otázky je povinný."
    if (form.type === "simple" && !form.correct_answer.trim()) return "Správná odpověď je povinná."
    if (form.type === "abcdef") {
      if (form.options.some(o => !o.text.trim())) return "Všechny možnosti musí mít text."
      if (!form.options.some(o => o.isCorrect)) return "Alespoň jedna možnost musí být správná."
    }
    if (form.type === "bonus") {
      if (form.options.some(o => !o.text.trim())) return "Všechny odpovědi musí mít text."
      if (form.options.length < 2) return "Bonusová otázka musí mít alespoň 2 odpovědi."
    }
    if (form.type === "audio" || form.type === "video") {
      if (!form.media_url.trim()) return "URL média je povinné."
      if (!form.correct_answer.trim()) return "Správná odpověď je povinná."
    }
    if (form.type === "image" && !form.media_url.trim()) return "URL obrázku je povinné."
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }
    setError(null)
    setLoading(true)
    const payload = {
      text: form.text.trim(),
      type: form.type,
      tag_ids: form.selectedTagIds,
      difficulty: form.difficulty,
      points: form.points,
      correct_answer: form.type === "bonus"
        ? (form.options[0]?.text || "")
        : form.correct_answer.trim() || null,
      media_url: ["audio","video","image"].includes(form.type) ? form.media_url.trim() : null,
      options: ["abcdef","bonus"].includes(form.type) ? form.options : [],
    }
    try {
      const res = await fetch(isEdit ? `/api/questions/${editId}` : "/api/questions", {
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

  const filteredTags = tagSearch.trim()
    ? localTags.filter(t => t.name.toLowerCase().includes(tagSearch.toLowerCase()))
    : localTags

  // Shared class strings
  const inputCls = "w-full rounded-lg border border-white/[0.1] bg-[#191b2e] px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
  const selectCls = "w-full rounded-lg border border-white/[0.1] bg-[#191b2e] px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer [color-scheme:dark]"
  const labelCls = "block text-xs font-semibold text-gray-400 mb-1.5"
  const sectionCls = "bg-white/[0.03] border border-white/[0.07] rounded-xl p-5 space-y-4"

  return (
    <div>
      {/* Sticky header */}
      <div className="px-8 pt-8 pb-6 border-b border-white/[0.08] bg-[#0f1120] sticky top-0 z-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link href="/admin/questions"
              className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 mb-2 transition-colors">
              <ArrowLeft size={12} /> Zpět na otázky
            </Link>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {isEdit ? "Upravit otázku" : "Nová otázka"}
            </h1>
          </div>
          <button
            type="button"
            onClick={handleSubmit as any}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/25 disabled:opacity-50 transition-all active:scale-95"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {isEdit ? "Uložit změny" : "Vytvořit otázku"}
          </button>
        </div>
      </div>

      {/* Form body */}
      <form onSubmit={handleSubmit} className="px-8 py-6 max-w-2xl space-y-4">

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-4 text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Text otázky */}
        <div className={sectionCls}>
          <label className={labelCls}>Text otázky <span className="text-red-400">*</span></label>
          <textarea
            value={form.text}
            onChange={e => setForm(p => ({ ...p, text: e.target.value }))}
            rows={3}
            className={inputCls + " resize-none"}
            placeholder="Zadejte text otázky…"
          />
        </div>

        {/* Typ + Obtížnost + Body */}
        <div className={sectionCls}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Typ otázky</label>
              <select value={form.type} onChange={e => handleTypeChange(e.target.value as QuestionType)}
                className={selectCls}>
                {(Object.keys(TYPE_LABELS) as QuestionType[]).map(t => (
                  <option key={t} value={t} className="bg-[#191b2e] text-white">{TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Obtížnost</label>
              <select value={form.difficulty} onChange={e => setForm(p => ({ ...p, difficulty: e.target.value as Difficulty }))}
                className={selectCls}>
                {(Object.keys(DIFFICULTY_LABELS) as Difficulty[]).map(d => (
                  <option key={d} value={d} className="bg-[#191b2e] text-white">{DIFFICULTY_LABELS[d]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Body</label>
              <input type="number" min={1} max={10} value={form.points}
                onChange={e => setForm(p => ({ ...p, points: Math.max(1, parseInt(e.target.value) || 1) }))}
                className={inputCls} />
            </div>
          </div>
        </div>

        {/* Tagy */}
        <div className={sectionCls}>
          <div className="flex items-center gap-2">
            <Tag size={14} className="text-violet-400" />
            <span className="text-xs font-semibold text-gray-400">
              Tagy {form.selectedTagIds.length > 0 && <span className="text-violet-400">({form.selectedTagIds.length})</span>}
            </span>
            <button type="button"
              onClick={() => { setNewTagOpen(o => !o); setTimeout(() => newTagInputRef.current?.focus(), 50) }}
              className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold text-violet-400 hover:bg-violet-500/15 border border-violet-500/30 transition-colors"
              title="Přidat nový tag">
              <Plus size={11} /> Nový tag
            </button>
          </div>

          {/* Inline new tag form */}
          {newTagOpen && (
            <div className="flex items-center gap-2 p-3 bg-violet-500/5 border border-violet-500/20 rounded-lg">
              <input type="color" value={newTagColor} onChange={e => setNewTagColor(e.target.value)}
                className="h-7 w-8 rounded cursor-pointer border border-white/10 bg-transparent p-0.5 shrink-0" />
              <input ref={newTagInputRef} type="text" value={newTagName}
                onChange={e => setNewTagName(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleCreateTag() } if (e.key === "Escape") setNewTagOpen(false) }}
                placeholder="Název tagu…"
                className="flex-1 rounded-md border border-white/[0.1] bg-[#191b2e] px-2.5 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-violet-500" />
              <button type="button" onClick={handleCreateTag}
                disabled={newTagSaving || !newTagName.trim()}
                className="p-1.5 rounded-md bg-violet-600 hover:bg-violet-500 disabled:opacity-40 transition-colors" title="Uložit">
                {newTagSaving ? <Loader2 size={12} className="animate-spin text-white" /> : <Check size={12} className="text-white" />}
              </button>
              <button type="button" onClick={() => { setNewTagOpen(false); setNewTagName("") }}
                className="p-1.5 rounded-md text-gray-500 hover:text-white hover:bg-white/[0.06] transition-colors" title="Zrušit">
                <X size={12} />
              </button>
            </div>
          )}

          {form.selectedTagIds.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {form.selectedTagIds.map(id => {
                const tag = localTags.find(t => t.id === id)
                if (!tag) return null
                return (
                  <span key={id}
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-white"
                    style={{ backgroundColor: (tag.color || "#7c3aed") + "cc" }}>
                    {tag.name}
                    <button type="button" onClick={() => toggleTag(id)} className="ml-0.5 hover:opacity-70 leading-none">×</button>
                  </span>
                )
              })}
            </div>
          )}

          <div className="rounded-lg border border-white/[0.08] overflow-hidden">
            <input type="text" value={tagSearch} onChange={e => setTagSearch(e.target.value)}
              placeholder="Hledat tag…"
              className="w-full px-3 py-2 text-xs bg-white/[0.03] border-b border-white/[0.08] text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-violet-500/50" />
            <div className="max-h-36 overflow-y-auto">
              {filteredTags.length === 0
                ? <p className="px-3 py-2 text-xs text-gray-600">Žádný tag nenalezen</p>
                : filteredTags.map(tag => (
                  <label key={tag.id}
                    className="flex items-center gap-2.5 px-3 py-2 hover:bg-white/[0.04] cursor-pointer transition-colors">
                    <input type="checkbox"
                      checked={form.selectedTagIds.includes(tag.id)}
                      onChange={() => toggleTag(tag.id)}
                      className="h-3.5 w-3.5 rounded border-gray-600 bg-transparent text-violet-500 focus:ring-violet-500/50" />
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: tag.color || "#7c3aed" }} />
                    <span className="text-xs text-gray-300">{tag.name}</span>
                  </label>
                ))}
            </div>
          </div>
        </div>

        {/* Jednoduchá */}
        {form.type === "simple" && (
          <div className={sectionCls}>
            <label className={labelCls}>Správná odpověď <span className="text-red-400">*</span></label>
            <input type="text" value={form.correct_answer}
              onChange={e => setForm(p => ({ ...p, correct_answer: e.target.value }))}
              className={inputCls} placeholder="Zadejte správnou odpověď…" />
          </div>
        )}

        {/* ABCDEF */}
        {form.type === "abcdef" && (
          <div className={sectionCls}>
            <div className="flex items-center justify-between">
              <label className={labelCls + " mb-0"}>
                Možnosti <span className="text-red-400">*</span>
                <span className="ml-2 text-gray-600 font-normal">— zaškrtněte správnou</span>
              </label>
            </div>
            <div className="space-y-2">
              {form.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-6 text-sm font-bold text-violet-400 shrink-0">{OPTION_LETTERS[i]}</span>
                  <input type="text" value={opt.text} onChange={e => setOption(i, "text", e.target.value)}
                    className={inputCls} placeholder={`Možnost ${OPTION_LETTERS[i]}…`} />
                  <label className="flex items-center gap-1.5 text-xs text-gray-400 shrink-0 cursor-pointer whitespace-nowrap">
                    <input type="checkbox" checked={opt.isCorrect}
                      onChange={e => setOption(i, "isCorrect", e.target.checked)}
                      className="h-4 w-4 rounded border-gray-600 text-emerald-500 focus:ring-emerald-500/50" />
                    Správná
                  </label>
                  <button type="button" onClick={() => removeOption(i)} disabled={form.options.length <= 2}
                    className="p-1.5 rounded text-gray-600 hover:text-red-400 disabled:opacity-30 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            {form.options.length < 6 && (
              <button type="button" onClick={addOption}
                className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors">
                <Plus size={14} /> Přidat možnost {OPTION_LETTERS[form.options.length]}
              </button>
            )}
          </div>
        )}

        {/* Bonus */}
        {form.type === "bonus" && (
          <div className={sectionCls}>
            <label className={labelCls + " mb-0"}>
              Správné odpovědi <span className="text-red-400">*</span>
              <span className="ml-2 text-gray-600 font-normal">— každý klik odhalí další</span>
            </label>
            <div className="space-y-2">
              {form.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-5 text-sm font-bold text-amber-400 shrink-0">{i + 1}.</span>
                  <input type="text" value={opt.text} onChange={e => setOption(i, "text", e.target.value)}
                    className={inputCls} placeholder={`Odpověď ${i + 1}…`} />
                  <button type="button" onClick={() => removeOption(i)} disabled={form.options.length <= 2}
                    className="p-1.5 rounded text-gray-600 hover:text-red-400 disabled:opacity-30 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            {form.options.length < 6 && (
              <button type="button" onClick={addOption}
                className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors">
                <Plus size={14} /> Přidat odpověď
              </button>
            )}
          </div>
        )}

        {/* Audio */}
        {form.type === "audio" && (
          <div className={sectionCls + " space-y-4"}>
            <div>
              <label className={labelCls}>Audio soubor (MP3) <span className="text-red-400">*</span></label>
              <input type="text" value={form.media_url}
                onChange={e => setForm(p => ({ ...p, media_url: e.target.value }))}
                className={inputCls} placeholder="https://example.com/audio.mp3" />
              <label className={"mt-2 flex items-center gap-2 cursor-pointer justify-center py-2 rounded-lg border border-dashed text-xs font-semibold transition-all " + (uploadingMedia ? "border-violet-500/40 text-violet-400" : "border-white/[0.12] text-gray-400 hover:border-violet-500/50 hover:text-violet-300")}>
                <Upload size={13} />
                {uploadingMedia ? "Nahrávám…" : "Nahrát MP3 ze zařízení"}
                <input type="file" accept="audio/*" className="hidden" disabled={uploadingMedia}
                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadMedia(f) }} />
              </label>
              {form.media_url && (
                <div className="mt-2 space-y-1.5">
                  <audio src={form.media_url} controls className="w-full h-10" />
                  <button type="button" onClick={clearMedia}
                    className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors">
                    <XCircle size={13} /> Odebrat médium
                  </button>
                </div>
              )}
            </div>
            <div>
              <label className={labelCls}>Správná odpověď <span className="text-red-400">*</span></label>
              <input type="text" value={form.correct_answer}
                onChange={e => setForm(p => ({ ...p, correct_answer: e.target.value }))}
                className={inputCls} placeholder="Název skladby, interpreta…" />
            </div>
          </div>
        )}

        {/* Video */}
        {form.type === "video" && (
          <div className={sectionCls + " space-y-4"}>
            <div>
              <label className={labelCls}>Video soubor <span className="text-red-400">*</span></label>
              <input type="text" value={form.media_url}
                onChange={e => setForm(p => ({ ...p, media_url: e.target.value }))}
                className={inputCls} placeholder="https://example.com/video.mp4" />
              <label className={"mt-2 flex items-center gap-2 cursor-pointer justify-center py-2 rounded-lg border border-dashed text-xs font-semibold transition-all " + (uploadingMedia ? "border-violet-500/40 text-violet-400" : "border-white/[0.12] text-gray-400 hover:border-violet-500/50 hover:text-violet-300")}>
                <Upload size={13} />
                {uploadingMedia ? "Nahrávám…" : "Nahrát video ze zařízení"}
                <input type="file" accept="video/*" className="hidden" disabled={uploadingMedia}
                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadMedia(f) }} />
              </label>
              {form.media_url && (
                <div className="mt-2 space-y-1.5">
                  <video src={form.media_url} controls className="w-full max-h-40 rounded-lg" />
                  <button type="button" onClick={clearMedia}
                    className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors">
                    <XCircle size={13} /> Odebrat médium
                  </button>
                </div>
              )}
            </div>
            <div>
              <label className={labelCls}>Správná odpověď <span className="text-red-400">*</span></label>
              <input type="text" value={form.correct_answer}
                onChange={e => setForm(p => ({ ...p, correct_answer: e.target.value }))}
                className={inputCls} placeholder="Název videa, díla…" />
            </div>
          </div>
        )}

        {/* Image */}
        {form.type === "image" && (
          <div className={sectionCls + " space-y-4"}>
            <div>
              <label className={labelCls}>Obrázek <span className="text-red-400">*</span></label>
              <input type="text" value={form.media_url}
                onChange={e => setForm(p => ({ ...p, media_url: e.target.value }))}
                className={inputCls} placeholder="https://example.com/obrazek.jpg" />
              <label className={"mt-2 flex items-center gap-2 cursor-pointer justify-center py-2 rounded-lg border border-dashed text-xs font-semibold transition-all " + (uploadingMedia ? "border-violet-500/40 text-violet-400" : "border-white/[0.12] text-gray-400 hover:border-violet-500/50 hover:text-violet-300")}>
                <Upload size={13} />
                {uploadingMedia ? "Nahrávám…" : "Nahrát obrázek ze zařízení"}
                <input type="file" accept="image/*" className="hidden" disabled={uploadingMedia}
                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadMedia(f) }} />
              </label>
              {form.media_url && (
                <div className="mt-2 space-y-1.5">
                  <img src={form.media_url} alt="Náhled"
                    className="max-h-48 rounded-lg border border-white/[0.08] object-contain w-full"
                    onError={e => { (e.target as HTMLImageElement).style.display = "none" }}
                    onLoad={e => { (e.target as HTMLImageElement).style.display = "block" }} />
                  <button type="button" onClick={clearMedia}
                    className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors">
                    <XCircle size={13} /> Odebrat médium
                  </button>
                </div>
              )}
              <p className="text-[11px] text-gray-600 mt-1.5">
                Klik 1 = text otázky · Klik 2 = celá obrazovka · Klik 3 = další otázka
              </p>
            </div>
            <div>
              <label className={labelCls}>Správná odpověď <span className="text-gray-600 font-normal">(volitelné)</span></label>
              <input type="text" value={form.correct_answer}
                onChange={e => setForm(p => ({ ...p, correct_answer: e.target.value }))}
                className={inputCls} placeholder="Popis obrázku…" />
            </div>
          </div>
        )}
        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/25 disabled:opacity-50 transition-all active:scale-95">
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {isEdit ? "Uložit změny" : "Vytvořit otázku"}
          </button>
          <Link href="/admin/questions"
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors">
            Zrušit
          </Link>
        </div>
      </form>
    </div>
  )
}
