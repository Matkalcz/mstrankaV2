// app/admin/questions/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Pencil, Trash2, Plus, Search, HelpCircle, Tag, Layers, BarChart2 } from "lucide-react"
import { AdminPageHeader, ActionButton, StatCard, DarkCard } from "@/components/AdminLayoutDark"

type QuestionType = "simple" | "abcdef" | "bonus" | "audio" | "video" | "image"
type Difficulty   = "easy" | "medium" | "hard"

interface Question {
  id: string; text: string; type: QuestionType
  tags: { id: string; name: string; color?: string }[]
  difficulty: Difficulty; createdAt: string
}

function formatDate(s: string) {
  if (!s) return "—"
  const d = new Date(s)
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("cs-CZ")
}

const TYPE_META: Record<QuestionType, { label: string; bg: string; text: string }> = {
  simple: { label: "Prostá",     bg: "bg-blue-500/20",   text: "text-blue-300" },
  abcdef: { label: "ABCDEF",     bg: "bg-violet-500/20", text: "text-violet-300" },
  bonus:  { label: "Bonus",      bg: "bg-amber-500/20",  text: "text-amber-300" },
  audio:  { label: "Audio",      bg: "bg-cyan-500/20",   text: "text-cyan-300" },
  video:  { label: "Video",      bg: "bg-pink-500/20",   text: "text-pink-300" },
  image:  { label: "Obrázková",  bg: "bg-rose-500/20",   text: "text-rose-300" },
}

const DIFF_META: Record<Difficulty, { label: string; dot: string }> = {
  easy:   { label: "Lehká",   dot: "bg-emerald-400" },
  medium: { label: "Střední", dot: "bg-amber-400" },
  hard:   { label: "Těžká",   dot: "bg-red-400" },
}

export default function QuestionsPage() {
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<QuestionType | "">("")
  const [diffFilter, setDiffFilter] = useState<Difficulty | "">("")

  const load = () => {
    setLoading(true)
    fetch("/api/questions?_t=" + Date.now())
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
      .then(data => {
        setQuestions(data.map((q: any) => ({
          id: q.id, text: q.text || "",
          type: (q.type as QuestionType) || "simple",
          tags: Array.isArray(q.tags) ? q.tags : [],
          difficulty: (q.difficulty as Difficulty) || "medium",
          createdAt: formatDate(q.created_at),
        })))
        setError(null)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id: string, text: string) => {
    if (!confirm(`Smazat otázku?\n\n"${text.substring(0, 80)}…"`)) return
    setDeletingId(id)
    try {
      const r = await fetch(`/api/questions/${id}`, { method: "DELETE" })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      setQuestions(prev => prev.filter(q => q.id !== id))
    } catch { alert("Nepodařilo se smazat otázku.") }
    finally { setDeletingId(null) }
  }

  const filtered = questions.filter(q => {
    if (search && !q.text.toLowerCase().includes(search.toLowerCase())) return false
    if (typeFilter && q.type !== typeFilter) return false
    if (diffFilter && q.difficulty !== diffFilter) return false
    return true
  })

  const uniqueTags  = Array.from(new Set(questions.flatMap(q => q.tags.map(t => t.id)))).length
  const uniqueTypes = Array.from(new Set(questions.map(q => q.type))).length

  return (
    <div>
      <AdminPageHeader
        title="Otázky"
        subtitle={`${questions.length} otázek v databázi`}
        action={<ActionButton href="/admin/questions/new"><Plus size={15} /> Nová otázka</ActionButton>}
      />

      <div className="px-8 py-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Celkem otázek"   value={questions.length} icon={HelpCircle} color="violet" />
          <StatCard label="Unikátních tagů" value={uniqueTags}       icon={Tag}        color="cyan" />
          <StatCard label="Typy otázek"     value={uniqueTypes}      icon={Layers}     color="amber" />
          <StatCard label="Průměrná obt." value={
            questions.filter(q => q.difficulty === "medium").length > questions.length / 2 ? "Střední" : "Různá"
          } icon={BarChart2} color="emerald" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Hledat otázky…"
              className="w-full pl-9 pr-4 py-2.5 bg-[#191b2e] border border-white/[0.1] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-violet-500/50" />
          </div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)}
            className="px-3 py-2.5 bg-[#191b2e] border border-white/[0.1] rounded-lg text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-violet-500/50">
            <option value="">Všechny typy</option>
            {Object.entries(TYPE_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select value={diffFilter} onChange={e => setDiffFilter(e.target.value as any)}
            className="px-3 py-2.5 bg-[#191b2e] border border-white/[0.1] rounded-lg text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-violet-500/50">
            <option value="">Všechny obtížnosti</option>
            <option value="easy">Lehká</option>
            <option value="medium">Střední</option>
            <option value="hard">Těžká</option>
          </select>
          {(search || typeFilter || diffFilter) && (
            <button onClick={() => { setSearch(""); setTypeFilter(""); setDiffFilter("") }}
              className="px-3 py-2.5 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/[0.05] border border-white/[0.08] transition-colors">
              Zrušit filtry
            </button>
          )}
        </div>

        {/* Table */}
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
            <div className="grid grid-cols-[minmax(0,1fr)_155px_200px_130px_130px_80px] px-6 py-3.5 border-b border-white/[0.08] text-xs font-bold text-gray-500 uppercase tracking-wider">
              <span>Otázka</span><span>Typ</span><span>Tagy</span>
              <span>Obtížnost</span><span>Vytvořeno</span><span className="text-right">Akce</span>
            </div>

            {filtered.length === 0 ? (
              <div className="py-16 text-center text-gray-500 text-[15px]">
                {questions.length === 0 ? "Žádné otázky v databázi" : "Žádné otázky nevyhovují filtru"}
              </div>
            ) : (
              <div className="divide-y divide-white/[0.05]">
                {filtered.map(q => {
                  const tm = TYPE_META[q.type]
                  const dm = DIFF_META[q.difficulty]
                  return (
                    <div key={q.id}
                      className="grid grid-cols-[minmax(0,1fr)_155px_200px_130px_130px_80px] items-center px-6 py-4 hover:bg-white/[0.03] transition-colors">
                      <div className="pr-4 min-w-0">
                        <Link href={`/admin/questions/new?id=${q.id}`}
                          className="text-[15px] font-medium text-gray-100 hover:text-violet-300 leading-snug line-clamp-2 block transition-colors">
                          {q.text}
                        </Link>
                      </div>
                      <div>
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-[13px] font-semibold ${tm.bg} ${tm.text}`}>
                          {tm.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {q.tags.length === 0 ? <span className="text-[13px] text-gray-600">—</span>
                          : q.tags.slice(0, 3).map(t => (
                            <span key={t.id}
                              className="inline-flex px-2 py-0.5 rounded-full text-[12px] font-medium bg-white/[0.07] text-gray-300"
                              style={t.color ? { backgroundColor: t.color + "28", color: t.color } : {}}>
                              {t.name}
                            </span>
                          ))}
                        {q.tags.length > 3 && <span className="text-[12px] text-gray-600">+{q.tags.length - 3}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${dm.dot}`} />
                        <span className="text-[13px] text-gray-400">{dm.label}</span>
                      </div>
                      <div className="text-[13px] text-gray-500">{q.createdAt}</div>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => router.push(`/admin/questions/new?id=${q.id}`)}
                          className="p-2 rounded-lg text-gray-500 hover:bg-violet-500/15 hover:text-violet-300 transition-colors" title="Upravit">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDelete(q.id, q.text)} disabled={deletingId === q.id}
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
                Zobrazeno {filtered.length} z {questions.length} otázek
              </div>
            )}
          </DarkCard>
        )}
      </div>
    </div>
  )
}
