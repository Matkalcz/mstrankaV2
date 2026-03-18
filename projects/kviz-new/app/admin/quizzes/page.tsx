// app/admin/quizzes/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Plus, Search, Play, Pencil, Trash2, PlayCircle, Layers, CheckCircle2, Archive, X, Palette, Loader2 } from "lucide-react"
import { AdminPageHeader, ActionButton, StatCard, DarkCard } from "@/components/AdminLayoutDark"

interface Quiz {
  id: string
  name: string
  description?: string
  status: "draft" | "published" | "archived"
  questionCount: number
  roundCount: number
  created_at: string
  updated_at: string
}

function formatDate(s: string) {
  if (!s) return "—"
  const d = new Date(s)
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("cs-CZ")
}

const STATUS_META = {
  published: { label: "Publikován",  bg: "bg-emerald-500/20", text: "text-emerald-300", dot: "bg-emerald-400" },
  draft:     { label: "Návrh",       bg: "bg-amber-500/20",   text: "text-amber-300",   dot: "bg-amber-400"  },
  archived:  { label: "Archivován",  bg: "bg-gray-500/20",    text: "text-gray-400",    dot: "bg-gray-500"   },
}

// ─── NewQuizModal ──────────────────────────────────────────────────────────────

interface TemplateForModal {
  id: string
  name: string
  config?: {
    skeleton?: Array<{ type: string; count?: number; title?: string; roundNumber?: number }>
    textColor?: string
    accentColor?: string
    bg1?: string
  }
}

function skeletonSummary(skeleton: TemplateForModal['config']['skeleton']): string {
  if (!skeleton || skeleton.length === 0) return 'Prázdná šablona'
  const parts: string[] = []
  let qTotal = 0
  let rounds = 0
  for (const b of skeleton) {
    if (b.type === 'round_start') rounds++
    if (b.type === 'question_block') qTotal += (b.count || 5)
  }
  if (rounds > 0) parts.push(`${rounds} kol`)
  if (qTotal > 0) parts.push(`${qTotal} otázek`)
  return parts.length > 0 ? parts.join(' · ') : `${skeleton.length} bloků`
}

function applySkeletonToSequence(skeleton: TemplateForModal['config']['skeleton']): any[] {
  if (!skeleton) return []
  const sequence: any[] = []
  for (const block of skeleton) {
    const id = Math.random().toString(36).slice(2)
    if (block.type === 'round_start') {
      sequence.push({ type: 'round_start', id, roundNumber: block.roundNumber || 1, title: block.title || '', subtitle: '' })
    } else if (block.type === 'question_block') {
      for (let i = 0; i < (block.count || 5); i++) {
        sequence.push({ type: 'question', id: Math.random().toString(36).slice(2), questionId: null })
      }
    } else if (block.type === 'separator') {
      sequence.push({ type: 'separator', id, title: block.title || '' })
    } else if (block.type === 'qr_page') {
      sequence.push({ type: 'qr_page', id })
    } else if (block.type === 'page') {
      sequence.push({ type: 'page', id })
    }
  }
  return sequence
}

function NewQuizModal({ templates, onClose, onCreated }: {
  templates: TemplateForModal[]
  onClose: () => void
  onCreated: (id: string) => void
}) {
  const [step, setStep] = useState<'pick' | 'name'>('pick')
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateForModal | null>(null)
  const [quizName, setQuizName] = useState('')
  const [creating, setCreating] = useState(false)

  const pickTemplate = (t: TemplateForModal | null) => {
    setSelectedTemplate(t)
    setQuizName(t ? `Kvíz – ${t.name}` : 'Nový kvíz')
    setStep('name')
  }

  const handleCreate = async () => {
    if (!quizName.trim()) return
    setCreating(true)
    try {
      const skeleton = selectedTemplate?.config?.skeleton
      const sequence = skeleton && skeleton.length > 0 ? applySkeletonToSequence(skeleton) : []
      const payload: any = {
        name: quizName.trim(),
        status: 'draft',
        template_id: selectedTemplate?.id || null,
      }
      if (sequence.length > 0) payload.sequence = JSON.stringify(sequence)
      const res = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Chyba')
      const data = await res.json()
      onCreated(data.id)
    } catch {
      alert('Nepodařilo se vytvořit kvíz')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#13152a] border border-white/[0.1] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white">
              {step === 'pick' ? 'Nový kvíz' : 'Pojmenuj kvíz'}
            </h2>
            {step === 'pick' && <p className="text-sm text-gray-500 mt-0.5">Vyber šablonu nebo vytvoř prázdný kvíz</p>}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/[0.06] transition-colors">
            <X size={18} />
          </button>
        </div>

        {step === 'pick' ? (
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {/* Prázdný kvíz */}
            <button onClick={() => pickTemplate(null)}
              className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-dashed border-white/[0.12] hover:border-violet-500/50 hover:bg-violet-500/5 transition-all text-left group">
              <div className="w-12 h-12 rounded-xl bg-white/[0.05] flex items-center justify-center shrink-0 group-hover:bg-violet-500/10 transition-colors">
                <Plus size={22} className="text-gray-500 group-hover:text-violet-400" />
              </div>
              <div>
                <div className="text-[15px] font-semibold text-gray-300 group-hover:text-white transition-colors">Prázdný kvíz</div>
                <div className="text-[13px] text-gray-600 mt-0.5">Bez šablony, vše nastavíš ručně</div>
              </div>
            </button>

            {/* Templates */}
            {templates.length > 0 && (
              <>
                <div className="text-xs font-bold text-gray-600 uppercase tracking-wider pt-1">Šablony</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {templates.map(t => {
                    const hasSkeleton = t.config?.skeleton && t.config.skeleton.length > 0
                    return (
                      <button key={t.id} onClick={() => pickTemplate(t)}
                        className="flex items-start gap-3 p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:border-violet-500/40 hover:bg-violet-500/5 transition-all text-left group">
                        <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center border border-white/10"
                          style={{ backgroundColor: t.config?.accentColor ? t.config.accentColor + '22' : '#7c3aed22' }}>
                          <Palette size={18} style={{ color: t.config?.accentColor || '#7c3aed' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[14px] font-semibold text-gray-200 group-hover:text-white transition-colors truncate">{t.name}</div>
                          <div className="flex items-center gap-1.5 mt-1">
                            {hasSkeleton ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[11px] font-semibold">
                                ✓ {skeletonSummary(t.config?.skeleton)}
                              </span>
                            ) : (
                              <span className="text-[12px] text-gray-600">Jen vizuální šablona</span>
                            )}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex-1 p-6 space-y-5">
            {selectedTemplate && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: selectedTemplate.config?.accentColor ? selectedTemplate.config.accentColor + '22' : '#7c3aed22' }}>
                  <Palette size={15} style={{ color: selectedTemplate.config?.accentColor || '#7c3aed' }} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-200">{selectedTemplate.name}</div>
                  {selectedTemplate.config?.skeleton && selectedTemplate.config.skeleton.length > 0 && (
                    <div className="text-xs text-emerald-400 mt-0.5">{skeletonSummary(selectedTemplate.config.skeleton)}</div>
                  )}
                </div>
                <button onClick={() => setStep('pick')} className="ml-auto text-xs text-gray-500 hover:text-gray-300 transition-colors">Změnit</button>
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Název kvízu</label>
              <input
                value={quizName}
                onChange={e => setQuizName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                autoFocus
                className="w-full rounded-xl border border-white/[0.1] bg-[#191b2e] px-4 py-3 text-[15px] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                placeholder="Název kvízu…"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={handleCreate} disabled={creating || !quizName.trim()}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-sm disabled:opacity-50 transition-all active:scale-[0.98]">
                {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                Vytvořit kvíz
              </button>
              <button onClick={() => setStep('pick')}
                className="px-5 py-3 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors">
                Zpět
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function QuizzesPage() {
  const router = useRouter()
  const [quizzes, setQuizzes]     = useState<Quiz[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [search, setSearch]       = useState("")
  const [statusFilter, setStatusFilter] = useState<Quiz["status"] | "">("")
  const [showModal, setShowModal] = useState(false)
  const [templatesForModal, setTemplatesForModal] = useState<TemplateForModal[]>([])

  const load = () => {
    setLoading(true)
    fetch("/api/quizzes?_t=" + Date.now())
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
      .then(data => {
        setQuizzes(Array.isArray(data) ? data : [])
        setError(null)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    fetch('/api/templates')
      .then(r => r.json())
      .then(data => setTemplatesForModal(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Smazat kvíz?\n\n"${name}"`)) return
    setDeletingId(id)
    try {
      const r = await fetch(`/api/quizzes/${id}`, { method: "DELETE" })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      setQuizzes(prev => prev.filter(q => q.id !== id))
    } catch { alert("Nepodařilo se smazat kvíz.") }
    finally { setDeletingId(null) }
  }

  const filtered = quizzes.filter(q => {
    if (search && !q.name.toLowerCase().includes(search.toLowerCase()) &&
        !(q.description ?? "").toLowerCase().includes(search.toLowerCase())) return false
    if (statusFilter && q.status !== statusFilter) return false
    return true
  })

  const countOf = (s: Quiz["status"]) => quizzes.filter(q => q.status === s).length

  return (
    <div>
      <AdminPageHeader
        title="Kvízy"
        subtitle={`${quizzes.length} kvízů celkem`}
        action={
          <button onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/25 transition-all active:scale-95">
            <Plus size={15} /> Nový kvíz
          </button>
        }
      />

      <div className="px-8 py-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Celkem kvízů"   value={quizzes.length}       icon={PlayCircle}    color="amber"   />
          <StatCard label="Publikováno"    value={countOf("published")} icon={CheckCircle2}  color="emerald" />
          <StatCard label="Návrhy"         value={countOf("draft")}     icon={Layers}        color="violet"  />
          <StatCard label="Archivováno"    value={countOf("archived")}  icon={Archive}       color="cyan"    />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Hledat kvízy…"
              className="w-full pl-9 pr-4 py-2.5 bg-[#191b2e] border border-white/[0.1] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-violet-500/50" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}
            className="px-3 py-2.5 bg-[#191b2e] border border-white/[0.1] rounded-lg text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-violet-500/50">
            <option value="">Všechny stavy</option>
            <option value="published">Publikován</option>
            <option value="draft">Návrh</option>
            <option value="archived">Archivován</option>
          </select>
          {(search || statusFilter) && (
            <button onClick={() => { setSearch(""); setStatusFilter("") }}
              className="px-3 py-2.5 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/[0.05] border border-white/[0.08] transition-colors">
              Zrušit filtry
            </button>
          )}
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5 text-red-300 text-sm">
            {error} — <button onClick={load} className="underline hover:text-white">zkusit znovu</button>
          </div>
        ) : (
          <DarkCard>
            {/* Column header */}
            <div className="grid grid-cols-[minmax(0,1fr)_120px_108px_96px_132px_110px] px-6 py-3.5 border-b border-white/[0.08] text-xs font-bold text-gray-500 uppercase tracking-wider">
              <span>Název</span>
              <span>Stav</span>
              <span>Otázek</span>
              <span>Kol</span>
              <span>Vytvořeno</span>
              <span className="text-right">Akce</span>
            </div>

            {filtered.length === 0 ? (
              <div className="py-16 text-center text-gray-500 text-[15px]">
                {quizzes.length === 0 ? "Žádné kvízy v databázi" : "Žádné kvízy nevyhovují filtru"}
              </div>
            ) : (
              <div className="divide-y divide-white/[0.05]">
                {filtered.map(q => {
                  const sm = STATUS_META[q.status] ?? STATUS_META.draft
                  return (
                    <div key={q.id}
                      className="grid grid-cols-[minmax(0,1fr)_120px_108px_96px_132px_110px] items-center px-6 py-4 hover:bg-white/[0.03] transition-colors">
                      {/* Name + description */}
                      <div className="pr-4 min-w-0">
                        <Link href={`/admin/quizzes/${q.id}`}
                          className="text-[16px] font-medium text-gray-100 hover:text-violet-300 leading-snug truncate block transition-colors">
                          {q.name}
                        </Link>
                        {q.description && (
                          <p className="text-[13px] text-gray-500 mt-0.5 truncate">{q.description}</p>
                        )}
                      </div>
                      {/* Status */}
                      <div>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[13px] font-semibold ${sm.bg} ${sm.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sm.dot}`} />
                          {sm.label}
                        </span>
                      </div>
                      {/* Question count */}
                      <div className="text-[15px] font-medium text-gray-300">{q.questionCount}</div>
                      {/* Round count */}
                      <div className="text-[15px] font-medium text-gray-400">{q.roundCount || "—"}</div>
                      {/* Date */}
                      <div className="text-[13px] text-gray-500">{formatDate(q.created_at)}</div>
                      {/* Actions */}
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => router.push(`/play/${q.id}`)}
                          className="p-2 rounded-lg text-gray-500 hover:bg-emerald-500/15 hover:text-emerald-300 transition-colors" title="Spustit moderátorský přehrávač">
                          <Play size={14} />
                        </button>
                        <button onClick={() => router.push(`/admin/quizzes/${q.id}`)}
                          className="p-2 rounded-lg text-gray-500 hover:bg-blue-500/15 hover:text-blue-300 transition-colors" title="Sestavovač">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDelete(q.id, q.name)} disabled={deletingId === q.id}
                          className="p-2 rounded-lg text-gray-500 hover:bg-red-500/15 hover:text-red-300 transition-colors disabled:opacity-40" title="Smazat">
                          {deletingId === q.id
                            ? <span className="w-3.5 h-3.5 inline-block rounded-full border border-red-400 border-t-transparent animate-spin" />
                            : <Trash2 size={14} />}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {filtered.length > 0 && (
              <div className="px-6 py-3.5 border-t border-white/[0.08] text-[13px] text-gray-600 font-medium">
                Zobrazeno {filtered.length} z {quizzes.length} kvízů
              </div>
            )}
          </DarkCard>
        )}
      </div>

      {showModal && (
        <NewQuizModal
          templates={templatesForModal}
          onClose={() => setShowModal(false)}
          onCreated={(id) => { setShowModal(false); router.push(`/admin/quizzes/${id}`) }}
        />
      )}
    </div>
  )
}
