// app/admin/questions/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Pencil, Trash2, Plus, Search, HelpCircle, Tag, Layers, BarChart2, ChevronDown, Check } from "lucide-react"
import { AdminPageHeader, ActionButton, StatCard, DarkCard } from "@/components/AdminLayoutDark"
import { QUESTION_TYPE_LABEL, DIFFICULTY_LABEL } from "@/lib/questionTypes"

type QuestionType = "simple" | "abcdef" | "bonus" | "audio" | "video" | "image"
type Difficulty   = "easy" | "medium" | "hard"

interface Question {
  id: string; text: string; type: QuestionType
  tags: { id: string; name: string; color?: string }[]
  difficulty: Difficulty; createdAt: string
}

interface TagOption {
  id: string; name: string; color?: string
}

function FilterPill({ label, value, options, onChange }: {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const current = options.find(o => o.value === value)
  const displayLabel = current ? current.label : label

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-3 py-2.5 text-sm border rounded-lg transition-colors whitespace-nowrap ${
          value
            ? "bg-violet-500/15 border-violet-500/30 text-violet-200 hover:bg-violet-500/25"
            : "bg-[#191b2e] border-white/[0.1] text-gray-300 hover:bg-white/[0.08]"
        }`}
      >
        {displayLabel}
        <ChevronDown size={13} className={`transition-transform opacity-60 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-1.5 left-0 z-20 bg-[#13152a] border border-white/[0.12] rounded-xl shadow-2xl shadow-black/50 py-1 min-w-[170px]">
            {options.map(opt => (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false) }}
                className={`w-full text-left px-3.5 py-2 text-sm transition-colors flex items-center gap-2 ${
                  value === opt.value
                    ? "text-violet-300 bg-violet-500/10"
                    : "text-gray-300 hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                {value === opt.value && <Check size={12} className="text-violet-400 shrink-0" />}
                {value !== opt.value && <span className="w-3" />}
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function formatDate(s: string) {
  if (!s) return "—"
  const d = new Date(s)
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("cs-CZ")
}

const TYPE_META: Record<QuestionType, { label: string; bg: string; text: string }> = {
  simple: { label: QUESTION_TYPE_LABEL.simple, bg: "bg-blue-500/20",   text: "text-blue-300" },
  abcdef: { label: QUESTION_TYPE_LABEL.abcdef, bg: "bg-violet-500/20", text: "text-violet-300" },
  bonus:  { label: QUESTION_TYPE_LABEL.bonus,  bg: "bg-amber-500/20",  text: "text-amber-300" },
  audio:  { label: QUESTION_TYPE_LABEL.audio,  bg: "bg-cyan-500/20",   text: "text-cyan-300" },
  video:  { label: QUESTION_TYPE_LABEL.video,  bg: "bg-pink-500/20",   text: "text-pink-300" },
  image:  { label: QUESTION_TYPE_LABEL.image,  bg: "bg-rose-500/20",   text: "text-rose-300" },
}

const DIFF_META: Record<Difficulty, { label: string; dot: string }> = {
  easy:   { label: DIFFICULTY_LABEL.easy,   dot: "bg-emerald-400" },
  medium: { label: DIFFICULTY_LABEL.medium, dot: "bg-amber-400" },
  hard:   { label: DIFFICULTY_LABEL.hard,   dot: "bg-red-400" },
}

export default function QuestionsPage() {
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [filterTag, setFilterTag] = useState("")
  const [typeFilter, setTypeFilter] = useState<QuestionType | "">("")
  const [diffFilter, setDiffFilter] = useState<Difficulty | "">("")
  const [allTags, setAllTags] = useState<TagOption[]>([])

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

  useEffect(() => {
    load()
    fetch("/api/tags")
      .then(r => r.ok ? r.json() : [])
      .then((data: TagOption[]) => setAllTags(Array.isArray(data) ? data.sort((a, b) => a.name.localeCompare(b.name, "cs")) : []))
      .catch(() => {})
  }, [])

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
    if (filterTag && !q.tags.some(t => t.id === filterTag)) return false
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
        <div className="flex flex-wrap gap-3 items-center">
          <FilterPill
            label="Kategorie"
            value={filterTag}
            onChange={setFilterTag}
            options={[
              { value: "", label: "Všechny kategorie" },
              ...allTags.map(t => ({ value: t.id, label: t.name }))
            ]}
          />
          <FilterPill
            label="Typ"
            value={typeFilter}
            onChange={v => setTypeFilter(v as QuestionType | "")}
            options={[
              { value: "", label: "Všechny typy" },
              ...Object.entries(TYPE_META).map(([k, v]) => ({ value: k, label: v.label }))
            ]}
          />
          <FilterPill
            label="Obtížnost"
            value={diffFilter}
            onChange={v => setDiffFilter(v as Difficulty | "")}
            options={[
              { value: "", label: "Obtížnost" },
              { value: "easy", label: "Lehká" },
              { value: "medium", label: "Střední" },
              { value: "hard", label: "Těžká" },
            ]}
          />
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Hledat otázky…"
              className="w-full pl-9 pr-4 py-2.5 bg-[#191b2e] border border-white/[0.1] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-violet-500/50" />
          </div>
          {(search || filterTag || typeFilter || diffFilter) && (
            <button onClick={() => { setSearch(""); setFilterTag(""); setTypeFilter(""); setDiffFilter("") }}
              className="px-3 py-2.5 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/[0.05] border border-white/[0.08] transition-colors whitespace-nowrap">
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
