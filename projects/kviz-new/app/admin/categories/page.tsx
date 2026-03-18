// app/admin/categories/page.tsx — Správa tagů (dark redesign)
"use client"

import { useState, useEffect } from "react"
import { Tag, Plus, Pencil, Trash2, Save, X, Loader2 } from "lucide-react"
import { AdminPageHeader, ActionButton, StatCard, DarkCard } from "@/components/AdminLayoutDark"

interface TagItem { id: string; name: string; description: string; color: string; icon: string }

const DEFAULT_COLORS = ['#7c3aed','#3b82f6','#10b981','#f59e0b','#ef4444','#ec4899','#06b6d4','#84cc16','#f97316','#6366f1']

function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2 mt-1">
      {DEFAULT_COLORS.map(c => (
        <button key={c} type="button" onClick={() => onChange(c)}
          className={`h-6 w-6 rounded-full border-2 transition-transform ${value === c ? 'border-white scale-125' : 'border-transparent hover:scale-110'}`}
          style={{ backgroundColor: c }} />
      ))}
      <input type="color" value={value} onChange={e => onChange(e.target.value)}
        className="h-6 w-8 rounded cursor-pointer border border-white/20 bg-transparent" title="Vlastní barva" />
    </div>
  )
}

function TagForm({ initial, onSave, onCancel, saving }: {
  initial?: Partial<TagItem>
  onSave: (d: Partial<TagItem>) => Promise<void>
  onCancel: () => void
  saving: boolean
}) {
  const [name, setName] = useState(initial?.name || "")
  const [description, setDescription] = useState(initial?.description || "")
  const [color, setColor] = useState(initial?.color || DEFAULT_COLORS[0])
  const [icon, setIcon] = useState(initial?.icon || "")

  const inputCls = "w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-violet-500"

  return (
    <div className="bg-white/[0.04] border border-violet-500/30 rounded-xl p-5 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1.5">Název <span className="text-red-400">*</span></label>
          <input value={name} onChange={e => setName(e.target.value)} autoFocus className={inputCls} placeholder="Název tagu…" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1.5">Ikona (emoji)</label>
          <input value={icon} onChange={e => setIcon(e.target.value)} maxLength={4} className={inputCls} placeholder="🏷️" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-400 mb-1.5">Popis</label>
        <input value={description} onChange={e => setDescription(e.target.value)} className={inputCls} placeholder="Volitelný popis…" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-400 mb-1.5">Barva</label>
        <ColorPicker value={color} onChange={setColor} />
      </div>
      <div className="flex items-center gap-3 pt-1">
        <button type="button" onClick={() => onSave({ name: name.trim(), description, color, icon })}
          disabled={saving || !name.trim()}
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 hover:from-violet-500 hover:to-indigo-500">
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          Uložit
        </button>
        <button type="button" onClick={onCancel}
          className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/[0.05]">
          <X className="h-3.5 w-3.5" /> Zrušit
        </button>
        {name && (
          <span className="ml-auto inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-white"
            style={{ backgroundColor: color }}>
            {icon && <span>{icon}</span>}{name}
          </span>
        )}
      </div>
    </div>
  )
}

export default function TagsAdminPage() {
  const [tagsList, setTagsList] = useState<TagItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    fetch('/api/tags?_t=' + Date.now(), { cache: 'no-store' })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
      .then(data => { setTagsList(Array.isArray(data) ? data : []); setError(null) })
      .catch(err => setError(`Nepodařilo se načíst tagy: ${err.message}`))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const handleCreate = async (data: Partial<TagItem>) => {
    setSavingId('new')
    try {
      const res = await fetch('/api/tags', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error((b as any).error || `HTTP ${res.status}`) }
      setCreating(false); load()
    } catch (err: any) { alert(`Chyba: ${err.message}`) }
    finally { setSavingId(null) }
  }

  const handleUpdate = async (id: string, data: Partial<TagItem>) => {
    setSavingId(id)
    try {
      const res = await fetch(`/api/tags/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error((b as any).error || `HTTP ${res.status}`) }
      setEditingId(null); load()
    } catch (err: any) { alert(`Chyba: ${err.message}`) }
    finally { setSavingId(null) }
  }

  const handleDelete = async (tag: TagItem) => {
    if (!confirm(`Smazat tag "${tag.name}"?`)) return
    setDeletingId(tag.id)
    try {
      const res = await fetch(`/api/tags/${tag.id}`, { method: 'DELETE' })
      if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error((b as any).error || `HTTP ${res.status}`) }
      load()
    } catch (err: any) { alert(`Chyba: ${err.message}`) }
    finally { setDeletingId(null) }
  }

  return (
    <div>
      <AdminPageHeader
        title="Tagy"
        subtitle={`${tagsList.length} tagů pro organizaci otázek`}
        action={!creating
          ? <ActionButton onClick={() => { setCreating(true); setEditingId(null) }}><Plus size={15} /> Nový tag</ActionButton>
          : undefined
        }
      />

      <div className="px-8 py-6 space-y-5">
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Tagů celkem"      value={tagsList.length}                           icon={Tag} color="violet" />
          <StatCard label="Unikátních barev" value={new Set(tagsList.map(t => t.color)).size}  icon={Tag} color="cyan" />
          <StatCard label="S ikonou"         value={tagsList.filter(t => t.icon).length}       icon={Tag} color="amber" />
        </div>

        {creating && (
          <TagForm onSave={handleCreate} onCancel={() => setCreating(false)} saving={savingId === 'new'} />
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-300 text-sm">
            {error} <button onClick={load} className="underline ml-2 hover:text-white">Zkusit znovu</button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
          </div>
        ) : (
          <DarkCard>
            {tagsList.length === 0 && !creating ? (
              <div className="py-16 text-center">
                <Tag className="h-12 w-12 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Žádné tagy. Vytvořte první kliknutím na „Nový tag".</p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.05]">
                {tagsList.map(tag => (
                  <div key={tag.id}>
                    {editingId === tag.id ? (
                      <div className="p-4">
                        <TagForm initial={tag} onSave={(d) => handleUpdate(tag.id, d)}
                          onCancel={() => setEditingId(null)} saving={savingId === tag.id} />
                      </div>
                    ) : (
                      <div className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.03] transition-colors">
                        <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0"
                          style={{ backgroundColor: tag.color || '#7c3aed' }}>
                          {tag.icon || tag.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white text-sm">{tag.name}</span>
                            <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold text-white"
                              style={{ backgroundColor: tag.color || '#7c3aed' }}>{tag.name}</span>
                          </div>
                          {tag.description && <p className="text-xs text-gray-500 mt-0.5 truncate">{tag.description}</p>}
                          <p className="text-xs text-gray-600 font-mono mt-0.5">{tag.color}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => { setEditingId(tag.id); setCreating(false) }}
                            className="p-2 rounded-lg text-gray-500 hover:bg-violet-500/15 hover:text-violet-300 transition-colors" title="Upravit">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDelete(tag)} disabled={deletingId === tag.id}
                            className="p-2 rounded-lg text-gray-500 hover:bg-red-500/15 hover:text-red-300 transition-colors disabled:opacity-40" title="Smazat">
                            {deletingId === tag.id
                              ? <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                              : <Trash2 className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </DarkCard>
        )}
      </div>
    </div>
  )
}
