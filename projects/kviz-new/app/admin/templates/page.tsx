// app/admin/templates/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Palette, Plus, Pencil, Trash2, Loader2 } from "lucide-react"
import { AdminPageHeader, ActionButton, StatCard, DarkCard } from "@/components/AdminLayoutDark"

interface Template {
  id: string
  name: string
  background_color: string
  text_color: string
  accent_color: string
  font_family: string
  created_at: string
  config: any | null
}

function TemplatePreview({ t }: { t: Template }) {
  const cfg = t.config
  const bg = cfg?.backgroundType === 'gradient'
    ? `linear-gradient(135deg, ${cfg.backgroundColor ?? t.background_color}, ${cfg.backgroundColor2 ?? '#4c1d95'})`
    : cfg?.backgroundType === 'image' && cfg.backgroundImage
    ? `url(${cfg.backgroundImage}) center/cover`
    : (cfg?.backgroundColor ?? t.background_color ?? '#1a1c2e')

  return (
    <div
      className="h-36 w-full rounded-t-xl flex flex-col items-center justify-center gap-2 relative overflow-hidden"
      style={{ background: bg }}
    >
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative z-10 text-center px-4">
        <div className="text-xs font-bold uppercase tracking-widest mb-1 opacity-80"
          style={{ color: cfg?.accentColor ?? t.accent_color ?? '#a78bfa', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
          {cfg?.fontFamily ?? t.font_family ?? 'Sans-serif'}
        </div>
        <div className="text-base font-bold leading-snug line-clamp-2 text-white"
          style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>
          {t.name}
        </div>
        <div className="mt-2 flex gap-1.5 justify-center">
          {['A', 'B', 'C'].map((l, i) => (
            <span key={l} className="px-2 py-0.5 rounded text-xs font-semibold text-white"
              style={{
                backgroundColor: i === 0
                  ? (cfg?.accentColor ?? t.accent_color ?? '#7c3aed') + 'cc'
                  : 'rgba(255,255,255,0.18)',
                textShadow: '0 1px 2px rgba(0,0,0,0.6)',
              }}>
              {l}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function TemplatesPage() {
  const router = useRouter()
  const [templatesList, setTemplatesList] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    fetch('/api/templates')
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
      .then(data => { setTemplatesList(data); setError(null) })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (t: Template) => {
    if (!confirm(`Smazat šablonu "${t.name}"?`)) return
    setDeletingId(t.id)
    try {
      const res = await fetch(`/api/templates/${t.id}`, { method: 'DELETE' })
      if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error((b as any).error || `HTTP ${res.status}`) }
      load()
    } catch (err: any) { alert(`Chyba: ${err.message}`) }
    finally { setDeletingId(null) }
  }

  const bgTypes = new Set(templatesList.map(t => t.config?.backgroundType ?? 'solid'))

  return (
    <div>
      <AdminPageHeader
        title="Šablony"
        subtitle={`${templatesList.length} šablon vzhledu kvízu`}
        action={<ActionButton href="/admin/templates/new"><Plus size={15} /> Nová šablona</ActionButton>}
      />

      <div className="px-8 py-6 space-y-5">
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Šablon celkem"   value={templatesList.length}    icon={Palette} color="violet" />
          <StatCard label="Typy pozadí"      value={bgTypes.size}            icon={Palette} color="cyan" />
          <StatCard label="Unikátních fontů" value={new Set(templatesList.map(t => t.font_family)).size} icon={Palette} color="amber" />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-300 text-sm">
            {error} <button onClick={load} className="underline ml-2 hover:text-white">Zkusit znovu</button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
          </div>
        ) : templatesList.length === 0 ? (
          <DarkCard>
            <div className="py-16 text-center">
              <Palette className="h-12 w-12 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 text-sm mb-4">Žádné šablony. Vytvořte první kliknutím na „Nová šablona".</p>
              <ActionButton href="/admin/templates/new"><Plus size={15} /> Nová šablona</ActionButton>
            </div>
          </DarkCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {templatesList.map(t => (
              <div key={t.id} className="bg-[#191b2e] border border-white/[0.08] rounded-xl overflow-hidden hover:border-violet-500/30 transition-colors group">
                <TemplatePreview t={t} />

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <a href={`/admin/templates/new?id=${t.id}`}
                        className="text-[15px] font-medium text-gray-100 truncate block hover:text-violet-300 transition-colors">
                        {t.name}
                      </a>
                      <div className="flex items-center gap-2 mt-1.5">
                        {[
                          { color: t.config?.accentColor ?? t.background_color, label: 'Pozadí' },
                          { color: t.config?.textColor ?? t.text_color, label: 'Text' },
                          { color: t.config?.accentColor ?? t.accent_color, label: 'Akcent' },
                        ].map(({ color, label }) => (
                          <div key={label} className="flex items-center gap-1" title={label}>
                            <div className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                              style={{ backgroundColor: color ?? '#888' }} />
                          </div>
                        ))}
                        <span className="text-[13px] text-gray-400 font-mono ml-1">
                          {t.config?.fontFamily ?? t.font_family ?? '—'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => router.push(`/admin/templates/new?id=${t.id}`)}
                        className="p-2 rounded-lg text-gray-500 hover:bg-violet-500/15 hover:text-violet-300 transition-colors"
                        title="Upravit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(t)}
                        disabled={deletingId === t.id}
                        className="p-2 rounded-lg text-gray-500 hover:bg-red-500/15 hover:text-red-300 transition-colors disabled:opacity-40"
                        title="Smazat"
                      >
                        {deletingId === t.id
                          ? <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                          : <Trash2 className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {t.config?.backgroundType === 'gradient' ? 'Přechod' : t.config?.backgroundType === 'image' ? 'Obrázek' : 'Barva'}
                    </span>
                    <span className="text-xs text-gray-500 font-mono">
                      {t.created_at ? new Date(t.created_at).toLocaleDateString('cs-CZ') : '—'}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Add new card */}
            <a href="/admin/templates/new"
              className="bg-[#191b2e] border-2 border-dashed border-white/[0.08] rounded-xl flex flex-col items-center justify-center py-12 gap-3 hover:border-violet-500/40 hover:bg-violet-500/5 transition-all group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center group-hover:bg-violet-500/20 transition-colors">
                <Plus className="h-5 w-5 text-violet-400" />
              </div>
              <span className="text-sm font-medium text-gray-500 group-hover:text-gray-300 transition-colors">Nová šablona</span>
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
