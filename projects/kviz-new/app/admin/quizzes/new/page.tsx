// app/admin/quizzes/new/page.tsx
"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Save, Loader2, PlayCircle } from "lucide-react"
import Link from "next/link"

interface FormState {
  name: string
  description: string
  status: "draft" | "published" | "archived"
  template_id: string
}

const DEFAULTS: FormState = {
  name: "",
  description: "",
  status: "draft",
  template_id: "",
}

interface Template { id: string; name: string }

function QuizFormInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get("id")
  const isEdit = !!editId

  const [form, setForm]         = useState<FormState>(DEFAULTS)
  const [saving, setSaving]     = useState(false)
  const [loading, setLoading]   = useState(isEdit)
  const [error, setError]       = useState<string | null>(null)
  const [templates, setTemplates] = useState<Template[]>([])

  const set = (key: keyof FormState) => (val: string) =>
    setForm(prev => ({ ...prev, [key]: val }))

  // Load templates for selector
  useEffect(() => {
    fetch("/api/templates")
      .then(r => r.json())
      .then(data => setTemplates(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])

  // Load quiz for edit mode
  useEffect(() => {
    if (!editId) return
    fetch(`/api/quizzes/${editId}`)
      .then(r => r.json())
      .then(data => {
        setForm({
          name:        data.name        ?? "",
          description: data.description ?? "",
          status:      data.status      ?? "draft",
          template_id: data.template_id ?? "",
        })
      })
      .catch(() => alert("Chyba při načítání kvízu"))
      .finally(() => setLoading(false))
  }, [editId])

  const handleSave = async () => {
    if (!form.name.trim()) { setError("Název kvízu je povinný."); return }
    setError(null)
    setSaving(true)
    const payload = {
      name:        form.name.trim(),
      description: form.description.trim() || null,
      status:      form.status,
      template_id: form.template_id || null,
    }
    try {
      const url    = isEdit ? `/api/quizzes/${editId}` : "/api/quizzes"
      const method = isEdit ? "PUT" : "POST"
      const res    = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const b = await res.json().catch(() => ({}))
        throw new Error((b as any).error || `HTTP ${res.status}`)
      }
      router.push("/admin/quizzes")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const inputCls  = "w-full rounded-lg border border-white/[0.1] bg-[#191b2e] px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
  const selectCls = "w-full rounded-lg border border-white/[0.1] bg-[#191b2e] px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
  const labelCls  = "block text-xs font-semibold text-gray-400 mb-1.5"
  const sectionCls = "bg-white/[0.03] border border-white/[0.07] rounded-xl p-5 space-y-4"

  if (loading) return (
    <div className="flex justify-center py-32">
      <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
    </div>
  )

  return (
    <div>
      {/* Sticky header */}
      <div className="px-8 pt-8 pb-6 border-b border-white/[0.08] bg-[#0f1120] sticky top-0 z-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link href="/admin/quizzes"
              className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 mb-2 transition-colors">
              <ArrowLeft size={12} /> Zpět na kvízy
            </Link>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {isEdit ? "Upravit kvíz" : "Nový kvíz"}
            </h1>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || !form.name.trim()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/25 disabled:opacity-50 transition-all active:scale-95"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {isEdit ? "Uložit změny" : "Vytvořit kvíz"}
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="px-8 py-6 max-w-xl space-y-4">

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-4 text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Základní info */}
        <div className={sectionCls}>
          <div className="flex items-center gap-2 mb-1">
            <PlayCircle size={16} className="text-violet-400" />
            <span className="text-sm font-bold text-gray-300">Základní informace</span>
          </div>
          <div>
            <label className={labelCls}>Název kvízu <span className="text-red-400">*</span></label>
            <input value={form.name} onChange={e => set("name")(e.target.value)}
              className={inputCls} placeholder="Např. Hospodský kvíz #1…" autoFocus />
          </div>
          <div>
            <label className={labelCls}>Popis</label>
            <textarea value={form.description} onChange={e => set("description")(e.target.value)}
              rows={3} className={inputCls + " resize-none"} placeholder="Volitelný popis kvízu…" />
          </div>
        </div>

        {/* Stav + šablona */}
        <div className={sectionCls}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Stav</label>
              <select value={form.status} onChange={e => set("status")(e.target.value)} className={selectCls}>
                <option value="draft"     className="bg-[#191b2e]">Návrh</option>
                <option value="published" className="bg-[#191b2e]">Publikován</option>
                <option value="archived"  className="bg-[#191b2e]">Archivován</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Šablona vzhledu</label>
              <select value={form.template_id} onChange={e => set("template_id")(e.target.value)} className={selectCls}>
                <option value="" className="bg-[#191b2e]">— bez šablony —</option>
                {templates.map(t => (
                  <option key={t.id} value={t.id} className="bg-[#191b2e]">{t.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Bottom actions */}
        <div className="flex items-center gap-3 pt-2">
          <button onClick={handleSave} disabled={saving || !form.name.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/25 disabled:opacity-50 transition-all active:scale-95">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {isEdit ? "Uložit změny" : "Vytvořit kvíz"}
          </button>
          <Link href="/admin/quizzes"
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors">
            Zrušit
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function NewQuizPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-32">
        <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
      </div>
    }>
      <QuizFormInner />
    </Suspense>
  )
}
