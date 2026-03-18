// app/admin/settings/page.tsx — Nastavení systému
'use client'

import { useState, useEffect } from 'react'
import { HardDrive, Trash2, RefreshCw, AlertTriangle, Music, Video, FileImage, File } from 'lucide-react'

interface MediaQuestion {
  id: string; text: string; type: string; media_url: string
  fileSize: number; fileSizeStr: string; fileExists: boolean
}
interface OrphanedFile { filename: string; size: number; sizeStr: string }
interface DiskStats {
  totalBytes: number; totalStr: string; fileCount: number
  mediaQuestions: MediaQuestion[]; orphanedFiles: OrphanedFile[]
}

function typeIcon(type: string) {
  if (type === 'audio') return <Music size={14} className="text-cyan-400" />
  if (type === 'video') return <Video size={14} className="text-pink-400" />
  if (type === 'image') return <FileImage size={14} className="text-rose-400" />
  return <File size={14} className="text-gray-400" />
}

const MAX_DISK_MB = 500

export default function SettingsPage() {
  const [stats, setStats] = useState<DiskStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedQIds, setSelectedQIds] = useState<Set<string>>(new Set())
  const [selectedOrphans, setSelectedOrphans] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)

  async function loadStats() {
    setLoading(true)
    try {
      const res = await fetch('/api/settings/disk')
      const data = await res.json()
      setStats(data)
    } finally { setLoading(false) }
  }

  useEffect(() => { loadStats() }, [])

  function toggleQ(id: string) {
    setSelectedQIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }
  function toggleAllQ() {
    if (!stats) return
    setSelectedQIds(selectedQIds.size === stats.mediaQuestions.length
      ? new Set() : new Set(stats.mediaQuestions.map(q => q.id)))
  }
  function toggleOrphan(filename: string) {
    setSelectedOrphans(prev => { const n = new Set(prev); n.has(filename) ? n.delete(filename) : n.add(filename); return n })
  }
  function toggleAllOrphans() {
    if (!stats) return
    setSelectedOrphans(selectedOrphans.size === stats.orphanedFiles.length
      ? new Set() : new Set(stats.orphanedFiles.map(f => f.filename)))
  }

  async function deleteSelected() {
    if (selectedQIds.size === 0 && selectedOrphans.size === 0) return
    const parts = [
      selectedQIds.size > 0 && selectedQIds.size + ' ot\u00e1zek',
      selectedOrphans.size > 0 && selectedOrphans.size + ' osi\u0159el\u00fdch soubor\u016f',
    ].filter(Boolean).join(' a ')
    if (!window.confirm('Smazat ' + parts + '?')) return
    setDeleting(true)
    try {
      await fetch('/api/settings/disk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionIds: Array.from(selectedQIds), orphanedFiles: Array.from(selectedOrphans) }),
      })
      setSelectedQIds(new Set()); setSelectedOrphans(new Set())
      await loadStats()
    } finally { setDeleting(false) }
  }

  const usedMB = stats ? stats.totalBytes / (1024 * 1024) : 0
  const pct = Math.min(100, (usedMB / MAX_DISK_MB) * 100)
  const pctColor = pct > 80 ? 'bg-red-500' : pct > 50 ? 'bg-amber-500' : 'bg-emerald-500'
  const hasSelection = selectedQIds.size > 0 || selectedOrphans.size > 0

  return (
    <div className="min-h-screen bg-[#08090f] text-white">
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Nastaven\u00ed</h1>
            <p className="text-gray-500 mt-1 text-sm">Spr\u00e1va serveru a \u00faložišt\u011b</p>
          </div>
          <button onClick={loadStats} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/[0.1] bg-white/[0.04] text-sm text-gray-300 hover:bg-white/[0.07] transition-all disabled:opacity-50">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Obnovit
          </button>
        </div>

        {/* Disk tile */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center">
              <HardDrive size={20} className="text-violet-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Úložiště médií</p>
              <p className="text-xs text-gray-500">data/uploads/</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-2xl font-black text-white">{stats?.totalStr ?? '…'}</p>
              <p className="text-xs text-gray-500">{stats?.fileCount ?? '…'} souborů</p>
            </div>
          </div>
          <div className="w-full bg-white/[0.06] rounded-full h-2.5 overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-700 ${pctColor}`}
              style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs text-gray-600">{pct.toFixed(1)} % z {MAX_DISK_MB} MB (orientační limit)</p>
        </div>

        {/* Questions with media */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Otázky s mediálními soubory</h2>
            {hasSelection && (
              <button onClick={deleteSelected} disabled={deleting}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white text-xs font-semibold transition-all disabled:opacity-50">
                <Trash2 size={13} />
                {deleting ? 'Mažu…' : `Smazat (${selectedQIds.size + selectedOrphans.size})`}
              </button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-10 text-gray-600">Načítám…</div>
          ) : !stats?.mediaQuestions.length ? (
            <div className="text-center py-10 text-gray-600 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
              Žádné nahrané soubory
            </div>
          ) : (
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] overflow-hidden">
              <div className="grid grid-cols-[24px_1fr_90px_70px_60px] gap-3 px-4 py-2.5 border-b border-white/[0.06] text-xs font-bold text-gray-500 uppercase tracking-wider">
                <input type="checkbox"
                  checked={selectedQIds.size === stats.mediaQuestions.length && stats.mediaQuestions.length > 0}
                  onChange={toggleAllQ}
                  className="w-4 h-4 rounded border-white/20 bg-white/[0.05] accent-violet-500" />
                <span>Otázka</span><span>Typ</span><span className="text-right">Velikost</span><span></span>
              </div>
              {stats.mediaQuestions.map(q => (
                <div key={q.id}
                  className={`grid grid-cols-[24px_1fr_90px_70px_60px] gap-3 px-4 py-3 border-b border-white/[0.04] items-center text-sm hover:bg-white/[0.02] ${selectedQIds.has(q.id) ? 'bg-red-500/5' : ''}`}>
                  <input type="checkbox" checked={selectedQIds.has(q.id)} onChange={() => toggleQ(q.id)}
                    className="w-4 h-4 rounded border-white/20 bg-white/[0.05] accent-violet-500" />
                  <span className="text-gray-200 truncate">{q.text}</span>
                  <span className="flex items-center gap-1.5 text-xs text-gray-400">{typeIcon(q.type)} {q.type}</span>
                  <span className={`text-right text-xs font-mono ${q.fileExists ? (q.fileSize > 50*1024*1024 ? 'text-red-400' : q.fileSize > 10*1024*1024 ? 'text-amber-400' : 'text-gray-400') : 'text-gray-600'}`}>
                    {q.fileExists ? q.fileSizeStr : '—'}
                  </span>
                  <div className="flex justify-end">
                    {!q.fileExists && <span className="text-[10px] text-orange-500 font-semibold bg-orange-500/10 px-1.5 py-0.5 rounded">chybí</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Orphaned files */}
        {stats && stats.orphanedFiles.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-400" />
              <h2 className="text-lg font-bold">Osiřelé soubory</h2>
              <span className="text-xs text-gray-500 ml-1">({stats.orphanedFiles.length} souborů bez přiřazené otázky)</span>
            </div>
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 overflow-hidden">
              <div className="grid grid-cols-[24px_1fr_80px] gap-3 px-4 py-2.5 border-b border-white/[0.06] text-xs font-bold text-gray-500 uppercase tracking-wider">
                <input type="checkbox"
                  checked={selectedOrphans.size === stats.orphanedFiles.length}
                  onChange={toggleAllOrphans}
                  className="w-4 h-4 rounded border-white/20 bg-white/[0.05] accent-violet-500" />
                <span>Soubor</span><span className="text-right">Velikost</span>
              </div>
              {stats.orphanedFiles.map(f => (
                <div key={f.filename}
                  className={`grid grid-cols-[24px_1fr_80px] gap-3 px-4 py-3 border-b border-white/[0.04] items-center text-sm hover:bg-white/[0.02] ${selectedOrphans.has(f.filename) ? 'bg-red-500/5' : ''}`}>
                  <input type="checkbox" checked={selectedOrphans.has(f.filename)} onChange={() => toggleOrphan(f.filename)}
                    className="w-4 h-4 rounded border-white/20 bg-white/[0.05] accent-violet-500" />
                  <span className="text-gray-400 font-mono text-xs truncate">{f.filename}</span>
                  <span className="text-right text-xs font-mono text-gray-400">{f.sizeStr}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
