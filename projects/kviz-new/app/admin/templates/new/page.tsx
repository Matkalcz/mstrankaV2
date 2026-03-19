// app/admin/templates/new/page.tsx — Šablona s per-elementovým pozadím
"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ArrowLeft, Save, Loader2, Palette, Plus, Trash2, Upload,
  HelpCircle, FileText, Minus, ChevronDown, ChevronRight, QrCode, GripVertical
} from "lucide-react"
import Link from "next/link"

// ─── Typy ─────────────────────────────────────────────────────────────────────

type BgType = "solid" | "gradient" | "image"

interface BgConfig {
  bgType: BgType
  bg1: string
  bg2: string
  bgImage: string
}

interface QuestionTypeConfig extends BgConfig {
  name: string  // zobrazuje se napříč systémem
}

interface PageConfig extends BgConfig {
  id: string
  name: string
}

interface SkeletonBlock {
  id: string
  type: 'round_start' | 'question_block' | 'separator' | 'qr_page' | 'page'
  title?: string
  subtitle?: string
  roundNumber?: number
  count?: number         // for question_block: number of empty question slots
  questionType?: string  // for question_block: which question type
  templatePageId?: string
}

interface TemplateConfig {
  description: string
  textColor: string
  accentColor: string
  correctColor: string
  fontFamily: string
  questionTypes: Record<string, QuestionTypeConfig>
  pages: PageConfig[]
  separator: { name: string } & BgConfig
  qrPage: { name: string } & BgConfig
  roundStart: { name: string } & BgConfig
  skeleton?: SkeletonBlock[]
}

// ─── Výchozí hodnoty ───────────────────────────────────────────────────────────

const DEFAULT_BG: BgConfig = { bgType: "solid", bg1: "#1a1c2e", bg2: "#2d1b69", bgImage: "" }

const Q_TYPE_DEFAULTS: Record<string, { label: string; defaultName: string; color: string }> = {
  simple:  { label: "Prostá otázka",  defaultName: "Prostá otázka",  color: "#3b82f6" },
  abcdef:  { label: "ABCDEF otázka",  defaultName: "ABCDEF otázka",  color: "#6366f1" },
  bonus:   { label: "Bonusová otázka", defaultName: "Bonusová otázka", color: "#f59e0b" },
  audio:   { label: "Audio otázka",   defaultName: "Audio otázka",   color: "#ec4899" },
  video:   { label: "Video otázka",   defaultName: "Video otázka",   color: "#10b981" },
  image:   { label: "Obrázková",      defaultName: "Obrázková",      color: "#f97316" },
}

const FONTS = [
  "Plus Jakarta Sans", "Inter", "Roboto", "Open Sans", "Montserrat",
  "Poppins", "Lato", "Nunito", "Raleway", "Merriweather", "DM Sans",
]

function makeDefaultConfig(): TemplateConfig {
  return {
    description: "",
    textColor: "#ffffff",
    accentColor: "#7c3aed",
    correctColor: "#10b981",
    fontFamily: "Plus Jakarta Sans",
    questionTypes: Object.fromEntries(
      Object.entries(Q_TYPE_DEFAULTS).map(([k, v]) => [k, { name: v.defaultName, ...DEFAULT_BG }])
    ),
    pages: [{ id: "p1", name: "Uvítací stránka", ...DEFAULT_BG }],
    separator: { name: "Opakování odpovědí", ...DEFAULT_BG, bg1: "#0a0a1a" },
    qrPage: { name: "QR stránka", ...DEFAULT_BG, bg1: "#0d0f2a" },
    roundStart: { name: "Kolo", ...DEFAULT_BG, bg1: "#1a0a3e" },
    skeleton: [],
  }
}

function uid() { return Math.random().toString(36).slice(2) }

// ─── Shared komponenty ─────────────────────────────────────────────────────────

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-300 mb-2">{label}</label>
      <div className="flex gap-2">
        <input type="color" value={value} onChange={e => onChange(e.target.value)}
          className="h-9 w-12 rounded-lg cursor-pointer border border-white/10 bg-transparent p-0.5 shrink-0" />
        <input type="text" value={value} onChange={e => onChange(e.target.value)}
          className="flex-1 rounded-lg border border-white/[0.1] bg-[#191b2e] px-3 py-2 text-sm text-white font-mono focus:outline-none focus:ring-1 focus:ring-violet-500"
          placeholder="#000000" />
      </div>
    </div>
  )
}

function BgEditor({ value, onChange, label }: {
  value: BgConfig
  onChange: (patch: Partial<BgConfig>) => void
  label?: string
}) {
  const set = (k: keyof BgConfig) => (v: string) => onChange({ [k]: v })
  const [uploading, setUploading] = useState(false)
  const inputCls = "w-full rounded-lg border border-white/[0.1] bg-[#191b2e] px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-violet-500"

  async function uploadImage(file: File) {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) onChange({ bgImage: data.url })
      else alert(data.error || 'Chyba při nahrávání')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-3">
      {label && <p className="text-sm font-bold text-gray-300 mb-1">{label}</p>}
      <div className="grid grid-cols-3 gap-2">
        {(["solid", "gradient", "image"] as BgType[]).map(t => (
          <button key={t} type="button" onClick={() => set("bgType")(t)}
            className={`py-2 rounded-lg text-xs font-semibold border transition-all ${
              value.bgType === t
                ? "border-violet-500 bg-violet-500/20 text-violet-300"
                : "border-white/[0.08] bg-white/[0.03] text-gray-500 hover:border-white/20"
            }`}>
            {t === "solid" ? "Jednolité" : t === "gradient" ? "Přechod" : "Obrázek"}
          </button>
        ))}
      </div>

      {value.bgType === "solid" && (
        <ColorInput label="Barva pozadí" value={value.bg1} onChange={set("bg1")} />
      )}
      {value.bgType === "gradient" && (
        <div className="grid grid-cols-2 gap-3">
          <ColorInput label="První barva" value={value.bg1} onChange={set("bg1")} />
          <ColorInput label="Druhá barva" value={value.bg2} onChange={set("bg2")} />
        </div>
      )}
      {value.bgType === "image" && (
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-300">URL obrázku</label>
          <input type="text" value={value.bgImage} onChange={e => set("bgImage")(e.target.value)}
            className={inputCls} placeholder="https://…/background.jpg nebo /api/media/…" />
          <label className={"flex items-center gap-2 cursor-pointer w-full justify-center py-2 rounded-lg border border-dashed text-xs font-semibold transition-all " + (uploading ? "border-violet-500/40 text-violet-400" : "border-white/[0.12] text-gray-400 hover:border-violet-500/50 hover:text-violet-300")}>
            <Upload size={14} />
            {uploading ? "Nahrávám…" : "Nahrát obrázek ze zařízení"}
            <input type="file" accept="image/*" className="hidden" disabled={uploading}
              onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f) }} />
          </label>
          {value.bgImage && <img src={value.bgImage} alt="Náhled" className="w-full h-20 object-cover rounded-lg border border-white/10" />}
        </div>
      )}
    </div>
  )
}
function bgStyle(bg: BgConfig): React.CSSProperties {
  if (bg.bgType === "gradient") return { background: `linear-gradient(135deg, ${bg.bg1}, ${bg.bg2})` }
  if (bg.bgType === "image" && bg.bgImage) return { background: `url(${bg.bgImage}) center/cover` }
  return { background: bg.bg1 }
}

// ─── Sekce šablony ─────────────────────────────────────────────────────────────

type Section = { type: "global" } | { type: "qtype"; key: string } | { type: "page"; id: string } | { type: "separator" } | { type: "qrpage" } | { type: "roundstart" }

function SectionBlock({ title, color, preview, open, onToggle, children }: {
  title: string; color?: string; preview?: React.ReactNode
  open: boolean; onToggle: () => void; children: React.ReactNode
}) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl overflow-hidden">
      <button type="button" onClick={onToggle}
        className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
        {color && <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />}
        <span className="text-[15px] font-semibold text-gray-100 flex-1 text-left">{title}</span>
        {preview}
        {open ? <ChevronDown size={15} className="text-gray-500 shrink-0" /> : <ChevronRight size={15} className="text-gray-500 shrink-0" />}
      </button>
      {open && <div className="px-5 pb-6 pt-4 border-t border-white/[0.06] space-y-5">{children}</div>}
    </div>
  )
}

// ─── Skeleton builder ──────────────────────────────────────────────────────────

function SkeletonBuilder({ value, onChange, cfg }: {
  value: SkeletonBlock[]
  onChange: (v: SkeletonBlock[]) => void
  cfg: TemplateConfig
}) {
  const cls = "rounded-lg border border-white/[0.1] bg-[#191b2e] px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-violet-500 [color-scheme:dark]"
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [dragOver, setDragOver] = useState<number | null>(null)

  const handleDrop = (target: number) => {
    if (dragIdx === null || dragIdx === target) { setDragIdx(null); setDragOver(null); return }
    const arr = [...value]
    const [moved] = arr.splice(dragIdx, 1)
    arr.splice(target, 0, moved)
    onChange(arr)
    setDragIdx(null); setDragOver(null)
  }

  const add = (type: SkeletonBlock['type']) => {
    const id = uid()
    const base: SkeletonBlock = { id, type }
    if (type === 'round_start') { base.roundNumber = value.filter(b => b.type === 'round_start').length + 1; base.title = '' }
    if (type === 'question_block') { base.count = 5; base.questionType = 'simple' }
    if (type === 'page' && cfg.pages.length > 0) base.templatePageId = cfg.pages[0].id
    onChange([...value, base])
  }
  const remove = (id: string) => onChange(value.filter(b => b.id !== id))
  const update = (id: string, patch: Partial<SkeletonBlock>) =>
    onChange(value.map(b => b.id === id ? { ...b, ...patch } : b))
  const move = (idx: number, dir: -1 | 1) => {
    const arr = [...value]
    const to = idx + dir
    if (to < 0 || to >= arr.length) return
    ;[arr[idx], arr[to]] = [arr[to], arr[idx]]
    onChange(arr)
  }

  const BLOCK_META: Record<SkeletonBlock['type'], { label: string; color: string }> = {
    round_start:    { label: 'Start kola',   color: '#7c3aed' },
    question_block: { label: 'Blok otázek',  color: '#3b82f6' },
    separator:      { label: 'Oddělovač',    color: '#f59e0b' },
    qr_page:        { label: 'QR stránka',   color: '#06b6d4' },
    page:           { label: 'Stránka',      color: '#6b7280' },
  }

  // Typy otázek dostupné v šabloně
  const qtypes = Object.entries(cfg.questionTypes || {})

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-500 leading-relaxed">
        Definuj strukturu kvízu — při vytváření nového kvízu z šablony se automaticky vygeneruje tato kostra se všemi komponentami. Otázky v blocích jsou prázdné sloty — moderátor je vyplní v sestavovači.
      </p>
      {value.length === 0 && (
        <div className="text-center py-8 text-gray-600 text-sm border border-dashed border-white/[0.08] rounded-xl">
          Prázdná kostra — přidej komponenty níže
        </div>
      )}
      {value.map((block, idx) => {
        const meta = BLOCK_META[block.type]
        const isDragging = dragIdx === idx
        const isOver = dragOver === idx
        return (
          <div key={block.id}
            draggable
            onDragStart={() => setDragIdx(idx)}
            onDragOver={e => { e.preventDefault(); setDragOver(idx) }}
            onDragEnd={() => { setDragIdx(null); setDragOver(null) }}
            onDrop={() => handleDrop(idx)}
            className={`flex items-start gap-2 bg-white/[0.03] border rounded-xl p-3 transition-all ${
              isDragging ? 'opacity-40 scale-95 border-white/[0.07]' :
              isOver ? 'border-violet-500/50 ring-1 ring-violet-500/30' : 'border-white/[0.07]'
            }`}>
            {/* Drag handle */}
            <div className="shrink-0 pt-1.5 cursor-grab active:cursor-grabbing text-gray-600 hover:text-gray-400 transition-colors">
              <GripVertical size={14} />
            </div>
            <div className="w-2 h-2 rounded-full mt-2.5 shrink-0" style={{ backgroundColor: meta.color }} />
            <div className="flex-1 space-y-2 min-w-0">
              <span className="text-[13px] font-semibold text-gray-200">{meta.label}</span>

              {block.type === 'round_start' && (
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" min={1} value={block.roundNumber || 1}
                    onChange={e => update(block.id, { roundNumber: parseInt(e.target.value) || 1 })}
                    placeholder="Číslo kola" className={cls} />
                  <input value={block.title || ''}
                    onChange={e => update(block.id, { title: e.target.value })}
                    placeholder="Název kola (volitelné)" className={cls} />
                </div>
              )}

              {block.type === 'question_block' && (
                <div className="flex items-center gap-2 flex-wrap">
                  <input type="number" min={1} max={50} value={block.count || 5}
                    onChange={e => update(block.id, { count: parseInt(e.target.value) || 1 })}
                    className={cls + ' w-20'} />
                  <span className="text-xs text-gray-500 shrink-0">otázek typu</span>
                  {qtypes.length > 0 ? (
                    <select value={block.questionType || 'simple'}
                      onChange={e => update(block.id, { questionType: e.target.value })}
                      className={cls + ' flex-1 min-w-[120px]'}>
                      {qtypes.map(([key, qt]) => (
                        <option key={key} value={key}>{qt.name || key}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-xs text-gray-600">(definuj typy otázek výše)</span>
                  )}
                </div>
              )}

              {block.type === 'separator' && (
                <input value={block.title || ''}
                  onChange={e => update(block.id, { title: e.target.value })}
                  placeholder="Název oddělovače (volitelné)"
                  className={cls + ' w-full'} />
              )}

              {block.type === 'page' && (
                cfg.pages.length > 0 ? (
                  <select value={block.templatePageId || ''}
                    onChange={e => update(block.id, { templatePageId: e.target.value })}
                    className={cls + ' w-full'}>
                    {cfg.pages.map(p => (
                      <option key={p.id} value={p.id}>{p.name || 'Bez názvu'}</option>
                    ))}
                  </select>
                ) : (
                  <span className="text-xs text-gray-600">(nejprve přidej stránky výše)</span>
                )
              )}

              {block.type === 'qr_page' && (
                <span className="text-xs text-gray-500">QR kód s veřejnou adresou kvízu</span>
              )}
            </div>
            <button onClick={() => remove(block.id)}
              className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0 mt-0.5">
              <Trash2 size={13} />
            </button>
          </div>
        )
      })}

      {/* Tlačítka přidání */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-white/[0.05]">
        <span className="text-xs text-gray-600 w-full mb-0.5">Přidat komponentu:</span>
        {([
          ['round_start', 'Start kola', '#7c3aed'],
          ['question_block', 'Blok otázek', '#3b82f6'],
          ['separator', 'Oddělovač', '#f59e0b'],
          ['qr_page', 'QR stránka', '#06b6d4'],
          ['page', 'Stránka', '#6b7280'],
        ] as [SkeletonBlock['type'], string, string][]).map(([type, label, color]) => (
          <button key={type} onClick={() => add(type)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors hover:text-white"
            style={{ color, borderColor: color + '44', backgroundColor: color + '11' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = color + '22')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = color + '11')}>
            <Plus size={11} />
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Live preview ──────────────────────────────────────────────────────────────

function Preview({ cfg, active }: { cfg: TemplateConfig; active: Section }) {
  const bg: BgConfig = (() => {
    if (active.type === "qtype") return cfg.questionTypes[active.key] ?? DEFAULT_BG
    if (active.type === "page") return cfg.pages.find(p => p.id === active.id) ?? DEFAULT_BG
    if (active.type === "separator") return cfg.separator
    if (active.type === "qrpage") return cfg.qrPage
    if (active.type === "roundstart") return cfg.roundStart
    return cfg.questionTypes["abcdef"] ?? DEFAULT_BG
  })()

  const name: string = (() => {
    if (active.type === "qtype") return cfg.questionTypes[active.key]?.name ?? ""
    if (active.type === "page") return cfg.pages.find(p => p.id === active.id)?.name ?? ""
    if (active.type === "separator") return cfg.separator.name
    if (active.type === "qrpage") return cfg.qrPage.name
    if (active.type === "roundstart") return cfg.roundStart.name
    return "Náhled"
  })()

  const isSeparator = active.type === "separator"
  const isPage = active.type === "page"
  const isQrPage = active.type === "qrpage"
  const isRoundStart = active.type === "roundstart"

  return (
    <div className="sticky top-24 rounded-xl overflow-hidden border border-white/[0.08]">
      <div className="px-4 py-3 bg-white/[0.02] border-b border-white/[0.08] flex items-center justify-between">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Náhled</span>
        {name && <span className="text-xs text-gray-400 italic">„{name}"</span>}
      </div>

      <div className="min-h-[300px] flex flex-col" style={{ ...bgStyle(bg), fontFamily: cfg.fontFamily }}>
        {isRoundStart ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="text-xs font-bold tracking-widest uppercase opacity-50" style={{ color: cfg.accentColor }}>Kolo 1</div>
            <h2 className="text-3xl font-black" style={{ color: cfg.textColor }}>{cfg.roundStart.name || "Kolo"}</h2>
          </div>
        ) : isSeparator ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
            <div className="w-16 h-0.5 rounded-full" style={{ backgroundColor: cfg.accentColor }} />
            <span className="text-lg font-bold" style={{ color: cfg.textColor }}>{cfg.separator.name || "Oddělovač"}</span>
            <div className="w-16 h-0.5 rounded-full" style={{ backgroundColor: cfg.accentColor }} />
          </div>
        ) : isQrPage ? (
          <div className="flex-1 flex">
            <div className="w-1/2 flex flex-col items-center justify-center gap-3 p-6">
              <div className="bg-white p-2 rounded-xl">
                <div className="w-20 h-20 bg-gray-200 rounded" style={{ backgroundImage: 'repeating-linear-gradient(0deg,#ccc 0,#ccc 2px,transparent 0,transparent 6px),repeating-linear-gradient(90deg,#ccc 0,#ccc 2px,transparent 0,transparent 6px)' }} />
              </div>
              <span className="text-[10px] opacity-50 font-mono" style={{ color: cfg.textColor }}>QR kód</span>
            </div>
            <div className="w-1/2 flex flex-col items-center justify-center gap-2 p-6 text-center border-l border-white/10">
              <span className="text-sm font-bold" style={{ color: cfg.textColor }}>{cfg.qrPage.name}</span>
              <span className="text-xs opacity-50" style={{ color: cfg.textColor }}>Naskenuj a sleduj kvíz</span>
            </div>
          </div>
        ) : isPage ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-4">
            <div className="text-xs font-bold tracking-widest uppercase opacity-50" style={{ color: cfg.accentColor }}>Stránka</div>
            <h2 className="text-3xl font-black" style={{ color: cfg.textColor }}>
              {cfg.pages.find(p => p.id === (active as any).id)?.name || "Název stránky"}
            </h2>
          </div>
        ) : (
          <div className="flex-1 flex flex-col p-6 gap-4">
            <div className="text-xs font-bold opacity-50" style={{ color: cfg.accentColor }}>OTÁZKA 3 / 12</div>
            <h2 className="text-xl font-bold leading-snug flex-1" style={{ color: cfg.textColor }}>
              Které pivo vaří pivovar Pilsner Urquell?
            </h2>
            {(active.type === "global" || (active.type === "qtype" && (active.key === "abcdef" || active.key === "ab"))) && (
              <div className="grid grid-cols-2 gap-2">
                {[{ l: "A", t: "Pilsner Urquell", ok: true }, { l: "B", t: "Budweiser", ok: false },
                  { l: "C", t: "Staropramen", ok: false }, { l: "D", t: "Kozel", ok: false }].map(o => (
                  <div key={o.l} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium"
                    style={{
                      backgroundColor: o.ok ? cfg.correctColor + "33" : cfg.textColor + "12",
                      border: `1px solid ${o.ok ? cfg.correctColor + "88" : cfg.textColor + "20"}`,
                      color: o.ok ? cfg.correctColor : cfg.textColor,
                    }}>
                    <span className="font-bold" style={{ color: cfg.accentColor }}>{o.l}</span>{o.t}
                  </div>
                ))}
              </div>
            )}
            {active.type === "qtype" && active.key === "simple" && (
              <div className="rounded-xl px-5 py-3 text-lg font-bold text-center"
                style={{ backgroundColor: cfg.correctColor + "33", color: cfg.correctColor, border: `1px solid ${cfg.correctColor}66` }}>
                Pilsner Urquell
              </div>
            )}
            {active.type === "qtype" && active.key === "bonus" && (
              <div className="space-y-2">
                {["Praha", "Plzeň", "Brno"].map((ans, i) => (
                  <div key={i} className="rounded-lg px-4 py-2 text-sm font-semibold"
                    style={{ backgroundColor: cfg.correctColor + "33", color: cfg.correctColor, border: `1px solid ${cfg.correctColor}44` }}>
                    {i + 1}. {ans}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="px-6 py-3 flex items-center justify-between text-xs border-t"
          style={{ borderColor: cfg.textColor + "18", color: cfg.textColor + "50" }}>
          <span>Kolo 1</span>
          <span style={{ fontFamily: "monospace" }}>{cfg.fontFamily}</span>
        </div>
      </div>
    </div>
  )
}

// ─── Formulář ─────────────────────────────────────────────────────────────────

function TemplateFormInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get("id")
  const isEdit = !!editId

  const [name, setName] = useState("")
  const [cfg, setCfg] = useState<TemplateConfig>(makeDefaultConfig)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(isEdit)
  const [openSection, setOpenSection] = useState<string>("global")
  const [activePreview, setActivePreview] = useState<Section>({ type: "global" })

  const set = (patch: Partial<TemplateConfig>) => setCfg(prev => ({ ...prev, ...patch }))
  const setQType = (key: string, patch: Partial<QuestionTypeConfig>) =>
    setCfg(prev => ({ ...prev, questionTypes: { ...prev.questionTypes, [key]: { ...prev.questionTypes[key], ...patch } } }))
  const setSeparator = (patch: Partial<typeof cfg.separator>) =>
    setCfg(prev => ({ ...prev, separator: { ...prev.separator, ...patch } }))
  const setQrPage = (patch: Partial<typeof cfg.qrPage>) =>
    setCfg(prev => ({ ...prev, qrPage: { ...prev.qrPage, ...patch } }))
  const setRoundStart = (patch: Partial<typeof cfg.roundStart>) =>
    setCfg(prev => ({ ...prev, roundStart: { ...prev.roundStart, ...patch } }))
  const setSkeleton = (v: SkeletonBlock[]) => setCfg(prev => ({ ...prev, skeleton: v }))

  const addPage = () => {
    const id = uid()
    setCfg(prev => ({ ...prev, pages: [...prev.pages, { id, name: "Nová stránka", ...DEFAULT_BG }] }))
    setOpenSection(`page_${id}`)
    setActivePreview({ type: "page", id })
  }
  const removePage = (id: string) => setCfg(prev => ({ ...prev, pages: prev.pages.filter(p => p.id !== id) }))
  const updatePage = (id: string, patch: Partial<PageConfig>) =>
    setCfg(prev => ({ ...prev, pages: prev.pages.map(p => p.id === id ? { ...p, ...patch } : p) }))

  // Load for edit
  useEffect(() => {
    if (!editId) return
    fetch(`/api/templates/${editId}`)
      .then(r => r.json())
      .then(data => {
        setName(data.name ?? "")
        if (data.config) {
          const c = data.config
          setCfg(prev => ({
            ...prev,
            description: c.description ?? "",
            textColor: c.textColor ?? prev.textColor,
            accentColor: c.accentColor ?? prev.accentColor,
            correctColor: c.correctColor ?? prev.correctColor,
            fontFamily: c.fontFamily ?? prev.fontFamily,
            questionTypes: c.questionTypes ?? prev.questionTypes,
            pages: c.pages ?? prev.pages,
            separator: c.separator ?? prev.separator,
            qrPage: c.qrPage ?? prev.qrPage,
            roundStart: c.roundStart ?? prev.roundStart,
            skeleton: c.skeleton ?? prev.skeleton,
          }))
        }
      })
      .catch(() => alert("Chyba při načítání"))
      .finally(() => setLoading(false))
  }, [editId])

  const handleSave = async () => {
    if (!name.trim()) { alert("Název je povinný"); return }
    setSaving(true)
    try {
      const url = isEdit ? `/api/templates/${editId}` : "/api/templates"
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), config: cfg }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      router.push("/admin/templates")
    } catch (err: any) {
      alert(`Chyba: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const toggle = (key: string, section: Section) => {
    setOpenSection(prev => prev === key ? "" : key)
    setActivePreview(section)
  }

  const inputCls = "w-full rounded-lg border border-white/[0.1] bg-[#191b2e] px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-violet-500"

  if (loading) return (
    <div className="flex justify-center py-32">
      <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div className="px-8 pt-8 pb-6 border-b border-white/[0.08] bg-[#0f1120] sticky top-0 z-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link href="/admin/templates"
              className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 mb-2 transition-colors">
              <ArrowLeft size={12} /> Zpět na šablony
            </Link>
            <h1 className="text-2xl font-bold text-white">{isEdit ? "Upravit šablonu" : "Nová šablona"}</h1>
          </div>
          <button onClick={handleSave} disabled={saving || !name.trim()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/25 disabled:opacity-50 transition-all active:scale-95">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {isEdit ? "Uložit změny" : "Vytvořit šablonu"}
          </button>
        </div>
      </div>

      {/* Two-panel */}
      <div className="px-8 py-6 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">

        {/* Left — sections */}
        <div className="space-y-3">

          {/* Název šablony */}
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Palette size={15} className="text-violet-400" />
              <span className="text-sm font-bold text-gray-300">Název šablony</span>
            </div>
            <input value={name} onChange={e => setName(e.target.value)}
              className={inputCls} placeholder="Např. Tmavý kvíz…" autoFocus />
            <input value={cfg.description} onChange={e => set({ description: e.target.value })}
              className={inputCls} placeholder="Popis (volitelné)…" />
          </div>

          {/* Globální barvy + font */}
          <SectionBlock title="Globální barvy a font" open={openSection === "global"}
            onToggle={() => toggle("global", { type: "global" })}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ColorInput label="Barva textu" value={cfg.textColor} onChange={v => set({ textColor: v })} />
              <ColorInput label="Akcentová barva" value={cfg.accentColor} onChange={v => set({ accentColor: v })} />
              <ColorInput label="Správná odpověď" value={cfg.correctColor} onChange={v => set({ correctColor: v })} />
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Font</label>
                <select value={cfg.fontFamily} onChange={e => set({ fontFamily: e.target.value })}
                  className={inputCls + " cursor-pointer [color-scheme:dark]"}>
                  {FONTS.map(f => <option key={f} value={f} className="bg-[#191b2e]">{f}</option>)}
                </select>
              </div>
            </div>
          </SectionBlock>

          {/* Typy otázek */}
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center gap-2">
              <HelpCircle size={15} className="text-blue-400" />
              <span className="text-sm font-bold text-gray-300">Typy otázek</span>
              <span className="text-xs text-gray-600 ml-auto">každý typ má vlastní pozadí</span>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {Object.entries(Q_TYPE_DEFAULTS).map(([key, meta]) => {
                const qt = cfg.questionTypes[key] ?? { name: meta.defaultName, ...DEFAULT_BG }
                const sKey = `qtype_${key}`
                const isOpen = openSection === sKey
                return (
                  <div key={key}>
                    <button type="button" onClick={() => toggle(sKey, { type: "qtype", key })}
                      className="w-full flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: meta.color }} />
                      <span className="text-sm font-medium text-gray-300 flex-1 text-left">{meta.label}</span>
                      <span className="text-xs text-gray-500 italic mr-2 truncate max-w-[140px]">{qt.name}</span>
                      <div className="w-5 h-5 rounded" style={bgStyle(qt)} />
                      {isOpen ? <ChevronDown size={14} className="text-gray-500 shrink-0" /> : <ChevronRight size={14} className="text-gray-500 shrink-0" />}
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-4 pt-2 bg-white/[0.01] space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-400 mb-1.5">Název (zobrazuje se napříč systémem)</label>
                          <input value={qt.name} onChange={e => setQType(key, { name: e.target.value })}
                            className={inputCls} placeholder={meta.defaultName} />
                        </div>
                        <BgEditor label="Pozadí" value={qt}
                          onChange={patch => setQType(key, patch as any)} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Stránky */}
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center gap-2">
              <FileText size={15} className="text-gray-400" />
              <span className="text-sm font-bold text-gray-300">Stránky</span>
              <span className="text-xs text-gray-600 ml-1">neomezený počet</span>
              <button type="button" onClick={addPage}
                className="ml-auto flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-violet-400 hover:bg-violet-500/15 border border-violet-500/30 transition-colors">
                <Plus size={12} /> Přidat stránku
              </button>
            </div>
            {cfg.pages.length === 0 && (
              <div className="px-5 py-6 text-center text-sm text-gray-600">
                Žádné stránky. Přidej první stránku.
              </div>
            )}
            <div className="divide-y divide-white/[0.04]">
              {cfg.pages.map(page => {
                const sKey = `page_${page.id}`
                const isOpen = openSection === sKey
                return (
                  <div key={page.id}>
                    <button type="button" onClick={() => toggle(sKey, { type: "page", id: page.id })}
                      className="w-full flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                      <FileText size={13} className="text-gray-500 shrink-0" />
                      <span className="text-sm font-medium text-gray-300 flex-1 text-left truncate">{page.name || "Bez názvu"}</span>
                      <div className="w-5 h-5 rounded shrink-0" style={bgStyle(page)} />
                      {isOpen ? <ChevronDown size={14} className="text-gray-500 shrink-0" /> : <ChevronRight size={14} className="text-gray-500 shrink-0" />}
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-4 pt-2 bg-white/[0.01] space-y-3">
                        <div className="flex items-start gap-2">
                          <div className="flex-1">
                            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Název stránky (zobrazuje se napříč systémem)</label>
                            <input value={page.name} onChange={e => updatePage(page.id, { name: e.target.value })}
                              className={inputCls} placeholder="Název stránky…" />
                          </div>
                          <button type="button" onClick={() => removePage(page.id)}
                            className="mt-6 p-2 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0" title="Smazat stránku">
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <BgEditor label="Pozadí" value={page}
                          onChange={patch => updatePage(page.id, patch as any)} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Oddělovač */}
          <SectionBlock title="Oddělovač" color="#f59e0b" open={openSection === "separator"}
            onToggle={() => toggle("separator", { type: "separator" })}
            preview={
              <span className="text-xs text-gray-500 italic mr-1 truncate max-w-[120px]">
                {cfg.separator.name || "Oddělovač"}
              </span>
            }>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Název (zobrazuje se napříč systémem)</label>
              <input value={cfg.separator.name} onChange={e => setSeparator({ name: e.target.value })}
                className={inputCls} placeholder="Opakování odpovědí…" />
            </div>
            <BgEditor label="Pozadí" value={cfg.separator}
              onChange={patch => setSeparator(patch as any)} />
          </SectionBlock>

          {/* QR stránka */}
          <SectionBlock title="QR stránka" color="#06b6d4" open={openSection === "qrpage"}
            onToggle={() => toggle("qrpage", { type: "qrpage" })}
            preview={
              <span className="text-xs text-gray-500 italic mr-1 truncate max-w-[120px]">
                {cfg.qrPage.name || "QR stránka"}
              </span>
            }>
            <p className="text-xs text-gray-500 leading-relaxed -mt-1 mb-1">
              Levá polovina zobrazí QR kód s veřejnou adresou kvízu, pravá polovina zobrazí nadpis a text.
            </p>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Název (zobrazuje se napříč systémem)</label>
              <input value={cfg.qrPage.name} onChange={e => setQrPage({ name: e.target.value })}
                className={inputCls} placeholder="QR stránka…" />
            </div>
            <BgEditor label="Pozadí" value={cfg.qrPage}
              onChange={patch => setQrPage(patch as any)} />
          </SectionBlock>

          {/* Start kola */}
          <SectionBlock title="Start kola" color="#7c3aed" open={openSection === "roundstart"}
            onToggle={() => toggle("roundstart", { type: "roundstart" })}
            preview={
              <span className="text-xs text-gray-500 italic mr-1 truncate max-w-[120px]">
                {cfg.roundStart.name || "Kolo"}
              </span>
            }>
            <p className="text-xs text-gray-500 leading-relaxed -mt-1 mb-1">
              Slide zobrazený na začátku každého kola.
            </p>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Název (zobrazuje se napříč systémem)</label>
              <input value={cfg.roundStart.name} onChange={e => setRoundStart({ name: e.target.value })}
                className={inputCls} placeholder="Kolo…" />
            </div>
            <BgEditor label="Pozadí" value={cfg.roundStart}
              onChange={patch => setRoundStart(patch as any)} />
          </SectionBlock>

          {/* Kostra kvízu */}
          <SectionBlock title="Kostra kvízu" color="#10b981" open={openSection === "skeleton"}
            onToggle={() => { setOpenSection(prev => prev === "skeleton" ? "" : "skeleton") }}
            preview={
              cfg.skeleton && cfg.skeleton.length > 0
                ? <span className="text-xs text-emerald-400 mr-1">{cfg.skeleton.length} bloků</span>
                : <span className="text-xs text-gray-600 mr-1">prázdná</span>
            }>
            <SkeletonBuilder value={cfg.skeleton || []} onChange={setSkeleton} cfg={cfg} />
          </SectionBlock>

        </div>

        {/* Right — live preview */}
        <div>
          <Preview cfg={cfg} active={activePreview} />
        </div>

      </div>
    </div>
  )
}

export default function NewTemplatePage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-32">
        <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
      </div>
    }>
      <TemplateFormInner />
    </Suspense>
  )
}
