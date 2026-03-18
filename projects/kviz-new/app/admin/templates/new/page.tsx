// app/admin/templates/new/page.tsx
"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Save, Loader2, Palette, Type, ImageIcon } from "lucide-react"
import Link from "next/link"

const FONTS = [
  "Plus Jakarta Sans", "Inter", "Roboto", "Open Sans", "Montserrat",
  "Poppins", "Lato", "Nunito", "Raleway", "Merriweather", "DM Sans",
]

interface FormState {
  name: string
  description: string
  backgroundType: "solid" | "gradient" | "image"
  backgroundColor: string
  backgroundColor2: string
  backgroundImage: string
  textColor: string
  accentColor: string
  correctColor: string
  fontFamily: string
}

const DEFAULTS: FormState = {
  name: "",
  description: "",
  backgroundType: "solid",
  backgroundColor: "#1a1c2e",
  backgroundColor2: "#2d1b69",
  backgroundImage: "",
  textColor: "#ffffff",
  accentColor: "#7c3aed",
  correctColor: "#10b981",
  fontFamily: "Plus Jakarta Sans",
}

function ColorRow({ label, name, value, onChange }: {
  label: string; name: string; value: string; onChange: (v: string) => void
}) {
  const inputCls = "flex-1 rounded-lg border border-white/[0.1] bg-white/[0.05] px-3 py-2 text-sm text-white font-mono focus:outline-none focus:ring-1 focus:ring-violet-500"
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-400 mb-1.5">{label}</label>
      <div className="flex gap-2">
        <input type="color" value={value} onChange={e => onChange(e.target.value)}
          className="h-9 w-12 rounded-lg cursor-pointer border border-white/10 bg-transparent p-0.5" />
        <input type="text" value={value} onChange={e => onChange(e.target.value)}
          className={inputCls} placeholder="#000000" />
      </div>
    </div>
  )
}

function TemplatePreview({ f }: { f: FormState }) {
  const bg = f.backgroundType === "gradient"
    ? `linear-gradient(135deg, ${f.backgroundColor}, ${f.backgroundColor2})`
    : f.backgroundType === "image" && f.backgroundImage
    ? `url(${f.backgroundImage}) center/cover`
    : f.backgroundColor

  return (
    <div className="rounded-xl overflow-hidden border border-white/[0.08] sticky top-24">
      <div className="px-4 py-3 border-b border-white/[0.08] bg-white/[0.02]">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Náhled</span>
      </div>
      <div
        className="p-6 min-h-[340px] flex flex-col gap-4"
        style={{ background: bg, fontFamily: f.fontFamily }}
      >
        {/* Question number */}
        <div className="text-xs font-bold opacity-50" style={{ color: f.accentColor }}>
          OTÁZKA 5 / 20
        </div>

        {/* Question text */}
        <h2 className="text-xl font-bold leading-snug" style={{ color: f.textColor }}>
          Které pivo vaří pivovar Pilsner Urquell?
        </h2>

        {/* Options */}
        <div className="grid grid-cols-2 gap-2 mt-2">
          {[
            { l: "A", t: "Pilsner Urquell", correct: true },
            { l: "B", t: "Budweiser Budvar", correct: false },
            { l: "C", t: "Staropramen", correct: false },
            { l: "D", t: "Kozel Černý", correct: false },
          ].map(opt => (
            <div key={opt.l}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium"
              style={{
                backgroundColor: opt.correct
                  ? f.correctColor + "33"
                  : f.textColor + "12",
                border: `1px solid ${opt.correct ? f.correctColor + "88" : f.textColor + "20"}`,
                color: opt.correct ? f.correctColor : f.textColor,
              }}>
              <span className="font-bold shrink-0" style={{ color: f.accentColor }}>{opt.l}</span>
              {opt.t}
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-auto pt-4 border-t flex items-center justify-between text-xs"
          style={{ borderColor: f.textColor + "18", color: f.textColor + "60" }}>
          <span>Kolo 1</span>
          <span style={{ fontFamily: "monospace" }}>{f.fontFamily}</span>
        </div>
      </div>

      {/* Separator slide preview */}
      <div className="px-4 py-3 border-t border-white/[0.08] bg-white/[0.02] text-center"
        style={{ background: `linear-gradient(90deg, ${f.accentColor}22, transparent)` }}>
        <span className="text-xs text-gray-500">— Oddělovač kola —</span>
      </div>
    </div>
  )
}

function TemplateFormInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get("id")
  const isEdit = !!editId

  const [form, setForm] = useState<FormState>(DEFAULTS)
  const [saving, setSaving] = useState(false)
  const [loadingEdit, setLoadingEdit] = useState(isEdit)

  const set = (key: keyof FormState) => (val: string) =>
    setForm(prev => ({ ...prev, [key]: val }))

  useEffect(() => {
    if (!editId) return
    fetch(`/api/templates/${editId}`)
      .then(r => r.json())
      .then(data => {
        const cfg = data.config ?? {}
        setForm({
          name: data.name ?? "",
          description: cfg.description ?? "",
          backgroundType: cfg.backgroundType ?? "solid",
          backgroundColor: cfg.backgroundColor ?? data.background_color ?? DEFAULTS.backgroundColor,
          backgroundColor2: cfg.backgroundColor2 ?? DEFAULTS.backgroundColor2,
          backgroundImage: cfg.backgroundImage ?? "",
          textColor: cfg.textColor ?? data.text_color ?? DEFAULTS.textColor,
          accentColor: cfg.accentColor ?? data.accent_color ?? DEFAULTS.accentColor,
          correctColor: cfg.correctColor ?? DEFAULTS.correctColor,
          fontFamily: cfg.fontFamily ?? data.font_family ?? DEFAULTS.fontFamily,
        })
      })
      .catch(() => alert("Chyba při načítání šablony"))
      .finally(() => setLoadingEdit(false))
  }, [editId])

  const handleSave = async () => {
    if (!form.name.trim()) { alert("Název je povinný"); return }
    setSaving(true)
    const payload = {
      name: form.name.trim(),
      config: { ...form },
    }
    try {
      const url = isEdit ? `/api/templates/${editId}` : "/api/templates"
      const method = isEdit ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const b = await res.json().catch(() => ({}))
        throw new Error((b as any).error || `HTTP ${res.status}`)
      }
      router.push("/admin/templates")
    } catch (err: any) {
      alert(`Chyba: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const inputCls = "w-full rounded-lg border border-white/[0.1] bg-[#191b2e] px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
  const sectionCls = "bg-white/[0.03] border border-white/[0.07] rounded-xl p-5 space-y-4"
  const labelCls = "block text-xs font-semibold text-gray-400 mb-1.5"

  if (loadingEdit) {
    return (
      <div className="flex justify-center py-32">
        <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
      </div>
    )
  }

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
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {isEdit ? "Upravit šablonu" : "Nová šablona"}
            </h1>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || !form.name.trim()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/25 disabled:opacity-50 transition-all active:scale-95"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {isEdit ? "Uložit změny" : "Vytvořit šablonu"}
          </button>
        </div>
      </div>

      {/* Two-panel layout */}
      <div className="px-8 py-6 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        {/* Left — form */}
        <div className="space-y-4">
          {/* Basic info */}
          <div className={sectionCls}>
            <div className="flex items-center gap-2 mb-1">
              <Palette size={16} className="text-violet-400" />
              <span className="text-sm font-bold text-gray-300">Základní informace</span>
            </div>
            <div>
              <label className={labelCls}>Název šablony <span className="text-red-400">*</span></label>
              <input value={form.name} onChange={e => set("name")(e.target.value)}
                className={inputCls} placeholder="Např. Tmavý kvíz…" autoFocus />
            </div>
            <div>
              <label className={labelCls}>Popis</label>
              <input value={form.description} onChange={e => set("description")(e.target.value)}
                className={inputCls} placeholder="Volitelný popis…" />
            </div>
          </div>

          {/* Background */}
          <div className={sectionCls}>
            <div className="flex items-center gap-2 mb-1">
              <ImageIcon size={16} className="text-violet-400" />
              <span className="text-sm font-bold text-gray-300">Pozadí</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(["solid", "gradient", "image"] as const).map(type => (
                <button key={type} type="button"
                  onClick={() => set("backgroundType")(type)}
                  className={`py-2.5 rounded-lg text-xs font-semibold border transition-all ${
                    form.backgroundType === type
                      ? "border-violet-500 bg-violet-500/20 text-violet-300"
                      : "border-white/[0.08] bg-white/[0.03] text-gray-400 hover:border-white/20"
                  }`}>
                  {type === "solid" ? "Jednolité" : type === "gradient" ? "Přechod" : "Obrázek"}
                </button>
              ))}
            </div>

            {form.backgroundType === "solid" && (
              <ColorRow label="Barva pozadí" name="backgroundColor"
                value={form.backgroundColor} onChange={set("backgroundColor")} />
            )}
            {form.backgroundType === "gradient" && (
              <>
                <ColorRow label="První barva" name="backgroundColor"
                  value={form.backgroundColor} onChange={set("backgroundColor")} />
                <ColorRow label="Druhá barva" name="backgroundColor2"
                  value={form.backgroundColor2} onChange={set("backgroundColor2")} />
              </>
            )}
            {form.backgroundType === "image" && (
              <div>
                <label className={labelCls}>URL obrázku</label>
                <input type="url" value={form.backgroundImage}
                  onChange={e => set("backgroundImage")(e.target.value)}
                  className={inputCls} placeholder="https://example.com/background.jpg" />
              </div>
            )}
          </div>

          {/* Colors & Font */}
          <div className={sectionCls}>
            <div className="flex items-center gap-2 mb-1">
              <Type size={16} className="text-violet-400" />
              <span className="text-sm font-bold text-gray-300">Barvy a typografie</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ColorRow label="Barva textu" name="textColor"
                value={form.textColor} onChange={set("textColor")} />
              <ColorRow label="Akcentová barva (čísla, labely)" name="accentColor"
                value={form.accentColor} onChange={set("accentColor")} />
              <ColorRow label="Barva správné odpovědi" name="correctColor"
                value={form.correctColor} onChange={set("correctColor")} />
              <div>
                <label className={labelCls}>Font</label>
                <select value={form.fontFamily} onChange={e => set("fontFamily")(e.target.value)}
                  className={inputCls + " cursor-pointer [color-scheme:dark]"}>
                  {FONTS.map(f => <option key={f} value={f} className="bg-[#191b2e]">{f}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right — live preview */}
        <div>
          <TemplatePreview f={form} />
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
