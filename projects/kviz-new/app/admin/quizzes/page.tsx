// app/admin/quizzes/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Plus, Search, Play, Pencil, Trash2, PlayCircle, Layers, CheckCircle2, Archive } from "lucide-react"
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

export default function QuizzesPage() {
  const router = useRouter()
  const [quizzes, setQuizzes]     = useState<Quiz[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [search, setSearch]       = useState("")
  const [statusFilter, setStatusFilter] = useState<Quiz["status"] | "">("")

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
        action={<ActionButton href="/admin/quizzes/new"><Plus size={15} /> Nový kvíz</ActionButton>}
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
                      className="grid grid-cols-[minmax(0,1fr)_120px_108px_96px_132px_110px] items-center px-6 py-5 hover:bg-white/[0.03] transition-colors">
                      {/* Name + description */}
                      <div className="pr-4 min-w-0">
                        <Link href={`/admin/quizzes/${q.id}`}
                          className="text-[15px] font-semibold text-gray-200 hover:text-violet-300 leading-snug truncate block transition-colors">
                          {q.name}
                        </Link>
                        {q.description && (
                          <p className="text-xs text-gray-500 mt-0.5 truncate">{q.description}</p>
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
                      <div className="text-[15px] font-semibold text-gray-300">{q.questionCount}</div>
                      {/* Round count */}
                      <div className="text-[15px] text-gray-400">{q.roundCount || "—"}</div>
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
    </div>
  )
}
