// app/admin/quizzes/[id]/page.tsx — Sestavovač kvízu
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, Play, Save, Loader2, Plus, Trash2, GripVertical,
  FileText, Flag, Minus, HelpCircle, Search, X, ChevronDown, Check,
  SlidersHorizontal, QrCode, LayoutTemplate, Pencil
} from 'lucide-react'
import Link from 'next/link'
import { QUESTION_TYPE_LABEL, DIFFICULTY_LABEL } from '@/lib/questionTypes'

// ─── Typy ─────────────────────────────────────────────────────────────────────

type SlideType = 'page' | 'round_start' | 'separator' | 'question' | 'qr_page'

interface SlideItem {
  _key: string
  type: SlideType
  title?: string
  content?: string
  templatePageId?: string   // odkaz na page.id v šabloně
  roundNumber?: number
  subtitle?: string
  questionId?: string
  questionText?: string
  questionType?: string
}

interface TemplateData {
  id: string
  name: string
  config: {
    pages?: { id: string; name: string }[]
    separator?: { name: string }
    qrPage?: { name: string }
  } | null
}

interface QuestionData {
  id: string
  text: string
  type: string
  difficulty?: string
  points: number
  tags: { id: string; name: string; color: string }[]
  correct_answer?: string
}

interface QuizData {
  id: string
  name: string
  description?: string
  status: string
  template_id?: string
  sequence: any[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

let keyCounter = 0
const uid = () => `k${++keyCounter}`

const SLIDE_META: Record<SlideType, { label: string; color: string; bg: string; border: string; icon: any }> = {
  page:        { label: 'Stránka',     color: 'text-gray-300',   bg: 'bg-gray-500/10',   border: 'border-gray-500/25',   icon: FileText },
  round_start: { label: 'Start kola',  color: 'text-violet-300', bg: 'bg-violet-500/10', border: 'border-violet-500/25', icon: Flag },
  separator:   { label: 'Oddělovač',   color: 'text-amber-300',  bg: 'bg-amber-500/10',  border: 'border-amber-500/25',  icon: Minus },
  question:    { label: 'Otázka',      color: 'text-blue-300',   bg: 'bg-blue-500/10',   border: 'border-blue-500/25',   icon: HelpCircle },
  qr_page:     { label: 'QR stránka',  color: 'text-cyan-300',   bg: 'bg-cyan-500/10',   border: 'border-cyan-500/25',   icon: QrCode },
}

const TYPE_LABELS = QUESTION_TYPE_LABEL as Record<string, string>
const DIFF_LABELS = DIFFICULTY_LABEL as Record<string, string>
const DIFF_COLORS: Record<string, string> = {
  easy: 'text-emerald-400', medium: 'text-amber-400', hard: 'text-red-400'
}

function sequenceToItems(seq: any[], questions: QuestionData[]): SlideItem[] {
  const qMap = new Map(questions.map(q => [q.id, q]))
  return (seq || []).map(item => {
    if (item.type === 'question') {
      const q = qMap.get(item.questionId)
      return {
        _key: uid(),
        type: 'question' as SlideType,
        questionId: item.questionId,
        questionText: q?.text || item.questionId,
        questionType: q?.type || '?',
      }
    }
    return { ...item, _key: uid() }
  })
}

function itemsToSequence(items: SlideItem[]): any[] {
  return items.map(({ _key, questionText, questionType, ...rest }) => rest)
}

// ─── FilterPill — styled custom dropdown ──────────────────────────────────────

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
        className={`flex items-center gap-1.5 px-3 py-2 text-sm border rounded-lg transition-colors whitespace-nowrap ${
          value
            ? 'bg-violet-500/15 border-violet-500/30 text-violet-200 hover:bg-violet-500/25'
            : 'bg-white/[0.05] border-white/[0.08] text-gray-300 hover:bg-white/[0.08]'
        }`}
      >
        {displayLabel}
        <ChevronDown size={13} className={`transition-transform opacity-60 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-1.5 left-0 z-20 bg-[#13152a] border border-white/[0.12] rounded-xl shadow-2xl shadow-black/50 py-1 min-w-[150px]">
            {options.map(opt => (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false) }}
                className={`w-full text-left px-3.5 py-2 text-sm transition-colors flex items-center gap-2 ${
                  value === opt.value
                    ? 'text-violet-300 bg-violet-500/10'
                    : 'text-gray-300 hover:bg-white/[0.05] hover:text-white'
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

// ─── Modal pro výběr otázek (multi-select nebo single-select pro slot) ────────

function QuestionModal({ questions, onSelect, onClose, singleMode = false }: {
  questions: QuestionData[]
  onSelect: (qs: QuestionData[]) => void
  onClose: () => void
  singleMode?: boolean
}) {
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterDiff, setFilterDiff] = useState('')
  const [filterTag, setFilterTag] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  // Extract unique tags from all questions
  const allTags = Array.from(
    new Map(questions.flatMap(q => q.tags).map(t => [t.id, t])).values()
  ).sort((a, b) => a.name.localeCompare(b.name, 'cs'))

  const filtered = questions.filter(q => {
    const matchSearch = !search || q.text.toLowerCase().includes(search.toLowerCase())
    const matchType = !filterType || q.type === filterType
    const matchDiff = !filterDiff || q.difficulty === filterDiff
    const matchTag = !filterTag || q.tags.some(t => t.id === filterTag)
    return matchSearch && matchType && matchDiff && matchTag
  })

  const toggle = (id: string) => {
    if (singleMode) {
      // Single mode: okamžitý výběr
      const q = questions.find(q => q.id === id)
      if (q) { onSelect([q]) }
      return
    }
    setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })
  }

  const toggleAll = () => {
    if (filtered.every(q => selected.has(q.id))) {
      setSelected(prev => { const s = new Set(prev); filtered.forEach(q => s.delete(q.id)); return s })
    } else {
      setSelected(prev => { const s = new Set(prev); filtered.forEach(q => s.add(q.id)); return s })
    }
  }

  const allFilteredSelected = filtered.length > 0 && filtered.every(q => selected.has(q.id))

  const handleConfirm = () => {
    const toAdd = questions.filter(q => selected.has(q.id))
    if (toAdd.length > 0) onSelect(toAdd)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#13152a] border border-white/[0.1] rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
          <h2 className="text-lg font-bold text-white">{singleMode ? 'Vybrat otázku' : 'Vybrat otázky'}</h2>
          <div className="flex items-center gap-3">
            <a
              href="/admin/questions/new"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/15 border border-blue-500/25 text-blue-300 hover:bg-blue-500/25 transition-colors"
            >
              <Plus size={13} /> Vytvořit novou otázku
            </a>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X size={20} /></button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-3 border-b border-white/[0.06] flex gap-2 flex-wrap items-center">
          {allTags.length > 0 && (
            <FilterPill
              label="Kategorie"
              value={filterTag}
              onChange={setFilterTag}
              options={[
                { value: '', label: 'Všechny kategorie' },
                ...allTags.map(t => ({ value: t.id, label: t.name }))
              ]}
            />
          )}
          <FilterPill
            label="Typ"
            value={filterType}
            onChange={setFilterType}
            options={[
              { value: '', label: 'Všechny typy' },
              ...Object.entries(TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))
            ]}
          />
          <FilterPill
            label="Obtížnost"
            value={filterDiff}
            onChange={setFilterDiff}
            options={[
              { value: '', label: 'Obtížnost' },
              { value: 'easy', label: 'Lehká' },
              { value: 'medium', label: 'Střední' },
              { value: 'hard', label: 'Těžká' },
            ]}
          />
          <div className="relative flex-1 min-w-[160px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Hledat otázku…"
              className="w-full pl-8 pr-3 py-2 text-sm bg-white/[0.05] border border-white/[0.08] rounded-lg text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-violet-500" />
          </div>
          {(filterType || filterDiff || filterTag) && (
            <button
              onClick={() => { setFilterType(''); setFilterDiff(''); setFilterTag('') }}
              className="px-2.5 py-2 text-xs text-gray-500 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors"
            >
              × Vše
            </button>
          )}
        </div>

        {/* Select all row — jen multi mode */}
        {!singleMode && filtered.length > 0 && (
          <div className="px-6 py-2 border-b border-white/[0.04] flex items-center gap-3">
            <button onClick={toggleAll}
              className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                allFilteredSelected
                  ? 'bg-violet-600 border-violet-600'
                  : 'border-white/30 bg-transparent hover:border-violet-400'
              }`}>
              {allFilteredSelected && <Check size={10} className="text-white" />}
            </button>
            <span className="text-xs text-gray-500">
              {allFilteredSelected ? 'Odznačit vše' : `Označit vše (${filtered.length})`}
            </span>
          </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-white/[0.05] admin-scroll">
          {filtered.length === 0 ? (
            <p className="px-6 py-8 text-center text-gray-600">Žádná otázka nenalezena</p>
          ) : filtered.map(q => {
            const isSelected = selected.has(q.id)
            return (
              <button key={q.id} onClick={() => toggle(q.id)}
                className={`w-full text-left px-6 py-3.5 transition-colors group ${
                  isSelected ? 'bg-violet-500/10' : 'hover:bg-white/[0.03]'
                }`}>
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                    isSelected ? 'bg-violet-600 border-violet-600' : 'border-white/25 group-hover:border-violet-400'
                  }`}>
                    {isSelected && <Check size={10} className="text-white" />}
                  </div>
                  {/* Type + diff badges */}
                  <div className="flex flex-col items-center gap-1 shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
                      {TYPE_LABELS[q.type] || q.type}
                    </span>
                    <span className={`text-[10px] font-medium ${DIFF_COLORS[q.difficulty || ''] || 'text-gray-500'}`}>
                      {DIFF_LABELS[q.difficulty || ''] || ''}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug line-clamp-2 transition-colors ${isSelected ? 'text-white' : 'text-gray-200 group-hover:text-white'}`}>
                      {q.text}
                    </p>
                    {q.tags.length > 0 && (
                      <div className="flex gap-1 mt-1.5 flex-wrap">
                        {q.tags.map(t => (
                          <span key={t.id} className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                            style={{ backgroundColor: t.color + '28', color: t.color }}>
                            {t.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Footer — jen multi mode */}
        {!singleMode && (
          <div className="px-6 py-3 border-t border-white/[0.08] flex items-center justify-between gap-4">
            <span className="text-xs text-gray-500">
              {selected.size > 0
                ? <span className="text-violet-300 font-semibold">{selected.size} vybraných</span>
                : `${filtered.length} otázek`}
            </span>
            <div className="flex gap-2">
              <button onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors">
                Zrušit
              </button>
              <button onClick={handleConfirm} disabled={selected.size === 0}
                className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-lg shadow-violet-500/20">
                <Plus size={14} /> Přidat {selected.size > 0 ? `(${selected.size})` : ''}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Modal výběru šablony ─────────────────────────────────────────────────────

function TemplateModal({ templates, currentId, onSelect, onClose }: {
  templates: TemplateData[]
  currentId?: string
  onSelect: (t: TemplateData | null) => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#13152a] border border-white/[0.1] rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
          <div>
            <h2 className="text-lg font-bold text-white">Vybrat šablonu</h2>
            <p className="text-xs text-gray-500 mt-0.5">Šablona určuje vzhled a dostupné typy stránek</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X size={20} /></button>
        </div>

        <div className="divide-y divide-white/[0.06] max-h-[60vh] overflow-y-auto">
          {/* Bez šablony */}
          <button onClick={() => onSelect(null)}
            className={`w-full text-left px-6 py-4 hover:bg-white/[0.04] transition-colors flex items-center justify-between ${!currentId ? 'bg-white/[0.04]' : ''}`}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/[0.07] border border-white/[0.1] flex items-center justify-center shrink-0">
                <X size={14} className="text-gray-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-300">Bez šablony</p>
                <p className="text-xs text-gray-600">Generické typy slidů</p>
              </div>
            </div>
            {!currentId && <Check size={15} className="text-violet-400" />}
          </button>

          {templates.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <p className="text-gray-500 text-sm">Žádná šablona nenalezena.</p>
              <Link href="/admin/templates/new" className="text-xs text-violet-400 hover:text-violet-300 mt-1 inline-block">
                Vytvořit šablonu →
              </Link>
            </div>
          ) : templates.map(t => {
            const isSel = currentId === t.id
            const pc = t.config?.pages?.length ?? 0
            return (
              <button key={t.id} onClick={() => onSelect(t)}
                className={`w-full text-left px-6 py-4 hover:bg-white/[0.04] transition-colors flex items-center justify-between ${isSel ? 'bg-violet-500/10' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${isSel ? 'bg-violet-500/30 border-violet-500/40' : 'bg-white/[0.07] border-white/[0.1]'}`}>
                    <LayoutTemplate size={14} className={isSel ? 'text-violet-300' : 'text-gray-500'} />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${isSel ? 'text-white' : 'text-gray-200'}`}>{t.name}</p>
                    <p className="text-xs text-gray-500">
                      {pc} {pc === 1 ? 'stránka' : pc < 5 ? 'stránky' : 'stránek'}
                      {t.config?.separator ? ' · oddělovač' : ''}
                      {t.config?.qrPage ? ' · QR' : ''}
                    </p>
                  </div>
                </div>
                {isSel && <Check size={15} className="text-violet-400" />}
              </button>
            )
          })}
        </div>

        <div className="px-6 py-3 border-t border-white/[0.08] flex justify-between items-center">
          <Link href="/admin/templates/new"
            className="text-xs text-gray-500 hover:text-violet-400 transition-colors flex items-center gap-1">
            <Plus size={12} /> Nová šablona
          </Link>
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors">Zavřít</button>
        </div>
      </div>
    </div>
  )
}

// ─── Inline editor slide ───────────────────────────────────────────────────────

function SlideEditor({ item, onChange }: { item: SlideItem; onChange: (patch: Partial<SlideItem>) => void }) {
  if (item.type === 'question') return null

  const inputCls = "w-full rounded-lg border border-white/[0.1] bg-[#191b2e] px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-violet-500"

  if (item.type === 'page') return (
    <div className="mt-2 space-y-1.5">
      <input value={item.title || ''} onChange={e => onChange({ title: e.target.value })}
        placeholder="Název stránky…" className={inputCls} />
      <textarea value={item.content || ''} onChange={e => onChange({ content: e.target.value })}
        placeholder="Obsah stránky…" rows={2} className={inputCls + ' resize-none'} />
    </div>
  )

  if (item.type === 'round_start') return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400 font-semibold">Číslo kola</label>
          <input
            type="number"
            value={item.roundNumber || 1}
            min={1}
            onChange={e => onChange({ roundNumber: parseInt(e.target.value) || 1 })}
            className={inputCls + ' w-20 [color-scheme:dark]'}
          />
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-xs text-gray-400 font-semibold">Název kola</label>
          <input value={item.title || ''} onChange={e => onChange({ title: e.target.value })}
            placeholder="Název kola…" className={inputCls} />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-400 font-semibold">Popisek</label>
        <input value={item.subtitle || ''} onChange={e => onChange({ subtitle: e.target.value })}
          placeholder="Popisek kola (nepovinný)…" className={inputCls} />
      </div>
    </div>
  )

  if (item.type === 'separator') return (
    <div className="mt-2">
      <input value={item.title || ''} onChange={e => onChange({ title: e.target.value })}
        placeholder="Text oddělovače (např. Opakování odpovědí)…" className={inputCls} />
    </div>
  )

  if (item.type === 'qr_page') return (
    <div className="mt-2 space-y-1.5">
      <input value={item.title || ''} onChange={e => onChange({ title: e.target.value })}
        placeholder="Nadpis (vpravo od QR kódu)…" className={inputCls} />
      <textarea value={item.content || ''} onChange={e => onChange({ content: e.target.value })}
        placeholder="Text (vpravo od QR kódu)…" rows={2} className={inputCls + ' resize-none'} />
    </div>
  )

  return null
}

// ─── Hlavní stránka ───────────────────────────────────────────────────────────

export default function QuizBuilderPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.id as string

  const [quiz, setQuiz] = useState<QuizData | null>(null)
  const [allQuestions, setAllQuestions] = useState<QuestionData[]>([])
  const [allTemplates, setAllTemplates] = useState<TemplateData[]>([])
  const [activeTemplate, setActiveTemplate] = useState<TemplateData | null>(null)
  const [items, setItems] = useState<SlideItem[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [slotKey, setSlotKey] = useState<string | null>(null)  // klíč slotu pro single výběr
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOver, setDragOver] = useState<number | null>(null)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')

  // Load quiz + questions + templates
  useEffect(() => {
    Promise.all([
      fetch(`/api/quizzes/${quizId}`).then(r => r.json()),
      fetch('/api/questions').then(r => r.json()),
      fetch('/api/templates').then(r => r.json()),
    ]).then(([quizData, qData, tData]) => {
      setQuiz(quizData)
      const qs = Array.isArray(qData) ? qData : []
      setAllQuestions(qs)
      setItems(sequenceToItems(quizData.sequence || [], qs))
      const ts: TemplateData[] = Array.isArray(tData) ? tData : []
      setAllTemplates(ts)
      if (quizData.template_id) {
        const found = ts.find(t => t.id === quizData.template_id)
        if (found) setActiveTemplate(found)
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [quizId])

  // ── Šablona ────────────────────────────────────────────────────────────────

  const handleSelectTemplate = (t: TemplateData | null) => {
    setActiveTemplate(t)
    setQuiz(prev => prev ? { ...prev, template_id: t?.id } : prev)
    setShowTemplateModal(false)
  }

  // ── Slide akce ─────────────────────────────────────────────────────────────

  const addSlide = (type: SlideType, extra: Partial<SlideItem> = {}) => {
    const newItem: SlideItem = { _key: uid(), type, ...extra }
    if (type === 'round_start' && !newItem.roundNumber) newItem.roundNumber = 1
    setItems(prev => [...prev, newItem])
  }

  const addQuestions = (qs: QuestionData[]) => {
    setItems(prev => [...prev, ...qs.map(q => ({
      _key: uid(),
      type: 'question' as SlideType,
      questionId: q.id,
      questionText: q.text,
      questionType: q.type,
    }))])
    setShowModal(false)
  }

  // Přiřadit otázku do konkrétního slotu (ikona + na prázdné otázce)
  const assignToSlot = (qs: QuestionData[]) => {
    if (!slotKey || qs.length === 0) { setSlotKey(null); return }
    const q = qs[0]
    updateItem(slotKey, { questionId: q.id, questionText: q.text, questionType: q.type })
    setSlotKey(null)
  }

  const removeItem = (key: string) => setItems(prev => prev.filter(i => i._key !== key))

  const updateItem = (key: string, patch: Partial<SlideItem>) =>
    setItems(prev => prev.map(i => i._key === key ? { ...i, ...patch } : i))

  // ── Drag & Drop ────────────────────────────────────────────────────────────

  const handleDragStart = (index: number) => setDragIndex(index)
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOver(index)
  }
  const handleDrop = (targetIndex: number) => {
    if (dragIndex === null || dragIndex === targetIndex) { setDragIndex(null); setDragOver(null); return }
    setItems(prev => {
      const next = [...prev]
      const [moved] = next.splice(dragIndex, 1)
      next.splice(targetIndex, 0, moved)
      return next
    })
    setDragIndex(null)
    setDragOver(null)
  }

  // ── Uložit ─────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch(`/api/quizzes/${quizId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...quiz, template_id: activeTemplate?.id ?? null, sequence: itemsToSequence(items) }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {}
    setSaving(false)
  }

  // ─────────────────────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="flex justify-center items-center h-full py-32">
      <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!quiz) return (
    <div className="px-8 py-16 text-center text-gray-500">Kvíz nenalezen</div>
  )

  const questionCount = items.filter(i => i.type === 'question').length
  const roundCount = items.filter(i => i.type === 'round_start').length

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="px-8 pt-8 pb-5 border-b border-white/[0.08] bg-[#0f1120] sticky top-0 z-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link href="/admin/quizzes"
              className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 mb-2 transition-colors">
              <ArrowLeft size={12} /> Zpět na kvízy
            </Link>
            {editingName ? (
              <input
                autoFocus
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onBlur={() => {
                  setEditingName(false)
                  if (nameInput.trim()) setQuiz(prev => prev ? { ...prev, name: nameInput.trim() } : prev)
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    setEditingName(false)
                    if (nameInput.trim()) setQuiz(prev => prev ? { ...prev, name: nameInput.trim() } : prev)
                  }
                  if (e.key === 'Escape') setEditingName(false)
                }}
                className="text-2xl font-bold text-white bg-transparent border-b-2 border-violet-500 outline-none w-full max-w-lg"
              />
            ) : (
              <h1
                onClick={() => { setNameInput(quiz.name); setEditingName(true) }}
                className="text-2xl font-bold text-white truncate cursor-pointer group flex items-center gap-2 hover:text-violet-200 transition-colors"
                title="Klikněte pro přejmenování"
              >
                {quiz.name}
                <Pencil size={15} className="opacity-40 text-violet-400 transition-opacity shrink-0" />
              </h1>
            )}
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <p className="text-sm text-gray-500">
                {items.length} slidů · {questionCount} otázek · {roundCount} kol
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => router.push(`/play/${quizId}`)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.08] transition-colors">
              <Play size={15} /> Přehrát
            </button>
            <button onClick={handleSave} disabled={saving}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                saved
                  ? 'bg-emerald-600 text-white'
                  : 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/25'
              } disabled:opacity-60`}>
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              {saved ? 'Uloženo!' : 'Uložit'}
            </button>
          </div>
        </div>
      </div>

      {/* Two-panel layout */}
      <div className="flex flex-1 min-h-0">

        {/* ── Levý panel — paleta ─────────────────────────────────────────────── */}
        <div className="w-56 shrink-0 border-r border-white/[0.07] bg-[#0d0f1c] flex flex-col overflow-y-auto admin-scroll">

          {/* Šablona selector */}
          <div className="px-4 pt-4 pb-3 border-b border-white/[0.07]">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Šablona</p>
            <button onClick={() => setShowTemplateModal(true)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-colors ${
                activeTemplate
                  ? 'bg-violet-500/10 border-violet-500/25 text-violet-300 hover:bg-violet-500/20'
                  : 'bg-white/[0.04] border-white/[0.1] text-gray-500 hover:text-gray-300 hover:bg-white/[0.07]'
              }`}>
              <LayoutTemplate size={13} className="shrink-0" />
              <span className="truncate flex-1 text-left">{activeTemplate ? activeTemplate.name : 'Vybrat šablonu…'}</span>
              <ChevronDown size={11} className="opacity-50 shrink-0" />
            </button>
          </div>

          {/* Struktura (vždy dostupná) */}
          <div className="px-4 py-3 border-b border-white/[0.07]">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Struktura</p>
            <div className="space-y-1.5">
              <button onClick={() => addSlide('round_start', { roundNumber: 1 })}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-300 hover:bg-violet-500/20 transition-colors text-sm font-medium">
                <Flag size={15} /> Start kola
              </button>
              <button onClick={() => setShowModal(true)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 hover:bg-blue-500/20 transition-colors text-sm font-medium">
                <HelpCircle size={15} /> + Otázka
              </button>
            </div>
          </div>

          {/* Stránky — ze šablony nebo generické */}
          <div className="px-4 py-3 border-b border-white/[0.07]">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
              {activeTemplate ? 'Prvky šablony' : 'Stránky'}
            </p>
            <div className="space-y-1.5">
              {activeTemplate ? (
                <>
                  {(activeTemplate.config?.pages ?? []).length > 0
                    ? (activeTemplate.config?.pages ?? []).map(p => (
                      <button key={p.id}
                        onClick={() => addSlide('page', { templatePageId: p.id, title: p.name })}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gray-500/10 border border-gray-500/20 text-gray-300 hover:bg-gray-500/20 transition-colors text-sm font-medium">
                        <FileText size={15} className="shrink-0" />
                        <span className="truncate">{p.name}</span>
                      </button>
                    ))
                    : <button onClick={() => addSlide('page')}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gray-500/10 border border-gray-500/20 text-gray-300 hover:bg-gray-500/20 transition-colors text-sm font-medium">
                        <FileText size={15} /> Stránka
                      </button>
                  }
                  <button onClick={() => addSlide('separator')}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:bg-amber-500/20 transition-colors text-sm font-medium">
                    <Minus size={15} className="shrink-0" />
                    <span className="truncate">{activeTemplate.config?.separator?.name || 'Oddělovač'}</span>
                  </button>
                  {activeTemplate.config?.qrPage && (
                    <button onClick={() => addSlide('qr_page')}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 hover:bg-cyan-500/20 transition-colors text-sm font-medium">
                      <QrCode size={15} className="shrink-0" />
                      <span className="truncate">{activeTemplate.config.qrPage.name || 'QR stránka'}</span>
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button onClick={() => addSlide('page')}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gray-500/10 border border-gray-500/20 text-gray-300 hover:bg-gray-500/20 transition-colors text-sm font-medium">
                    <FileText size={15} /> Stránka
                  </button>
                  <button onClick={() => addSlide('separator')}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:bg-amber-500/20 transition-colors text-sm font-medium">
                    <Minus size={15} /> Oddělovač
                  </button>
                  <button onClick={() => addSlide('qr_page')}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 hover:bg-cyan-500/20 transition-colors text-sm font-medium">
                    <QrCode size={15} /> QR stránka
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="px-4 py-4 space-y-2.5">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Sekvence</p>
            {[
              { label: 'Otázek',  value: questionCount, color: 'text-blue-300' },
              { label: 'Kol',     value: roundCount,    color: 'text-violet-300' },
              { label: 'Slidů',   value: items.length,  color: 'text-gray-300' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{label}</span>
                <span className={`text-sm font-bold ${color}`}>{value}</span>
              </div>
            ))}
          </div>

          <div className="mt-auto px-4 pb-4">
            <p className="text-[10px] text-gray-600 leading-relaxed">
              Táhni slidy pro změnu pořadí. Oddělovač vloží opakování odpovědí kola.
            </p>
          </div>
        </div>

        {/* ── Pravý panel — sekvence ─────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 admin-scroll">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <SlidersHorizontal size={40} className="text-gray-700" />
              <div>
                <p className="text-gray-500">Sekvence je prázdná.</p>
                <p className="text-gray-600 text-sm mt-1">Přidej prvky z levého panelu.</p>
              </div>
              {!activeTemplate && (
                <button onClick={() => setShowTemplateModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-300 hover:bg-violet-500/20 transition-colors text-sm">
                  <LayoutTemplate size={15} /> Vybrat šablonu
                </button>
              )}
              <button onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/15 border border-blue-500/25 text-blue-300 hover:bg-blue-500/25 transition-colors text-sm font-semibold">
                <Plus size={15} /> Přidat první otázku
              </button>
            </div>
          ) : (
            <div className="space-y-2 max-w-2xl">
              {items.map((item, index) => {
                const meta = SLIDE_META[item.type]
                const Icon = meta.icon
                const isDragging = dragIndex === index
                const isOver = dragOver === index
                const templatePageName = item.templatePageId
                  ? activeTemplate?.config?.pages?.find(p => p.id === item.templatePageId)?.name
                  : null

                return (
                  <div
                    key={item._key}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={e => handleDragOver(e, index)}
                    onDragEnd={() => { setDragIndex(null); setDragOver(null) }}
                    onDrop={() => handleDrop(index)}
                    className={`group relative rounded-xl border transition-all ${meta.bg} ${meta.border} ${
                      isDragging ? 'opacity-40 scale-95' : isOver ? 'ring-2 ring-violet-500/50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3 px-4 py-3">
                      {/* Drag handle + number */}
                      <div className="flex flex-col items-center gap-1 shrink-0 mt-0.5">
                        <GripVertical size={14} className="text-gray-600 cursor-grab active:cursor-grabbing" />
                        <span className="text-[10px] text-gray-600 font-mono">{index + 1}</span>
                      </div>

                      {/* Icon + content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <Icon size={14} className={meta.color} />
                          <span className={`text-[11px] font-bold uppercase tracking-wider ${meta.color}`}>
                            {templatePageName || meta.label}
                          </span>
                          {item.type === 'round_start' && item.roundNumber !== undefined && (
                            <span className="text-[10px] text-gray-500 font-medium">
                              Kolo {item.roundNumber}{item.title ? ` · ${item.title}` : ''}
                            </span>
                          )}
                          {item.type === 'question' && item.questionType && (
                            <span className="text-[10px] text-gray-500 font-medium">
                              {TYPE_LABELS[item.questionType] || item.questionType}
                            </span>
                          )}
                        </div>

                        {item.type === 'question' ? (
                          item.questionId ? (
                            // Otázka přiřazena — zobraz text + tlačítko Vyměnit
                            <div className="flex items-start gap-2">
                              <p className="text-sm text-gray-300 leading-snug line-clamp-2 flex-1">{item.questionText}</p>
                              <button
                                onClick={() => setSlotKey(item._key)}
                                title="Vyměnit otázku"
                                className="shrink-0 p-1 rounded-lg text-gray-500 hover:text-blue-300 hover:bg-blue-500/10 transition-all">
                                <Pencil size={12} />
                              </button>
                            </div>
                          ) : (
                            // Prázdný slot — výzva k výběru otázky
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <button
                                onClick={() => setSlotKey(item._key)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed border-blue-500/30 text-blue-400/70 hover:border-blue-400/60 hover:text-blue-300 hover:bg-blue-500/10 transition-colors text-xs font-medium">
                                <Plus size={13} /> Vybrat otázku…
                              </button>
                              <a
                                href="/admin/questions/new"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-emerald-500/30 text-emerald-400/70 hover:border-emerald-400/60 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors text-xs font-medium">
                                <Plus size={13} /> Vytvořit otázku
                              </a>
                            </div>
                          )
                        ) : (
                          <SlideEditor item={item} onChange={patch => updateItem(item._key, patch)} />
                        )}
                      </div>

                      {/* Delete */}
                      <button onClick={() => removeItem(item._key)}
                        className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all shrink-0">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                )
              })}

              {/* Přidat otázku na konec */}
              <button onClick={() => setShowModal(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-white/[0.1] text-gray-600 hover:text-gray-400 hover:border-white/[0.2] transition-colors text-sm">
                <Plus size={14} /> Přidat otázku
              </button>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <QuestionModal
          questions={allQuestions}
          onSelect={addQuestions}
          onClose={() => setShowModal(false)}
        />
      )}
      {slotKey && (
        <QuestionModal
          questions={allQuestions}
          onSelect={assignToSlot}
          onClose={() => setSlotKey(null)}
          singleMode
        />
      )}
      {showTemplateModal && (
        <TemplateModal
          templates={allTemplates}
          currentId={activeTemplate?.id}
          onSelect={handleSelectTemplate}
          onClose={() => setShowTemplateModal(false)}
        />
      )}
    </div>
  )
}
