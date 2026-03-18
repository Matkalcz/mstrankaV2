// app/admin/settings/page.tsx
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { HardDrive, Trash2, RefreshCw, AlertTriangle, Music, Video, FileImage, File, Server, ScanSearch } from 'lucide-react'
import { AdminPageHeader } from '@/components/AdminLayoutDark'

interface MediaQuestion {
  id: string; text: string; type: string; media_url: string
  fileSize: number; fileSizeStr: string; fileExists: boolean
}
interface OrphanedFile { filename: string; size: number; sizeStr: string }
interface DiskStats {
  totalBytes: number; totalStr: string; fileCount: number
  mediaQuestions: MediaQuestion[]; orphanedFiles: OrphanedFile[]
}
interface ServerDisk {
  totalStr: string; usedStr: string; freeStr: string; pct: number; checkedAt: string
}

const POLL_MS = 30 * 60 * 1000

function typeIcon(type: string) {
  if (type === 'audio') return <Music size={14} className="text-cyan-400" />
  if (type === 'video') return <Video size={14} className="text-pink-400" />
  if (type === 'image') return <FileImage size={14} className="text-rose-400" />
  return <File size={14} className="text-gray-400" />
}

export default function SettingsPage() {
  // ── Media scan (on-demand only) ──────────────────────────────────────────
  const [mediaStats, setMediaStats] = useState<DiskStats | null>(null)
  const [mediaScanning, setMediaScanning] = useState(false)
  const [mediaScanned, setMediaScanned] = useState(false)
  const [selectedQIds, setSelectedQIds] = useState<Set<string>>(new Set())
  const [selectedOrphans, setSelectedOrphans] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)

  // ── Server disk (auto-poll every 30 min) ─────────────────────────────────
  const [serverDisk, setServerDisk] = useState<ServerDisk | null>(null)
  const [diskLoading, setDiskLoading] = useState(true)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchDisk = useCallback(async () => {
    try {
      const res = await fetch('/api/settings/server-disk')
      if (res.ok) setServerDisk(await res.json())
    } finally {
      setDiskLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDisk()
    timerRef.current = setInterval(fetchDisk, POLL_MS)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [fetchDisk])

  async function scanMedia() {
    setMediaScanning(true)
    try {
      const res = await fetch('/api/settings/disk')
      const data = await res.json()
      setMediaStats(data)
      setMediaScanned(true)
    } finally {
      setMediaScanning(false)
    }
  }

  function toggleQ(id: string) {
    setSelectedQIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }
  function toggleAllQ() {
    if (!mediaStats) return
    setSelectedQIds(selectedQIds.size === mediaStats.mediaQuestions.length
      ? new Set() : new Set(mediaStats.mediaQuestions.map(q => q.id)))
  }
  function toggleOrphan(filename: string) {
    setSelectedOrphans(prev => { const n = new Set(prev); n.has(filename) ? n.delete(filename) : n.add(filename); return n })
  }
  function toggleAllOrphans() {
    if (!mediaStats) return
    setSelectedOrphans(selectedOrphans.size === mediaStats.orphanedFiles.length
      ? new Set() : new Set(mediaStats.orphanedFiles.map(f => f.filename)))
  }

  async function deleteSelected() {
    if (selectedQIds.size === 0 && selectedOrphans.size === 0) return
    const parts = [
      selectedQIds.size > 0 && selectedQIds.size + ' otázek',
      selectedOrphans.size > 0 && selectedOrphans.size + ' osiřelých souborů',
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
      await scanMedia()
    } finally { setDeleting(false) }
  }

  const hasSelection = selectedQIds.size > 0 || selectedOrphans.size > 0

  const diskPct = serverDisk?.pct ?? 0
  const diskBarColor = diskPct > 85 ? 'bg-red-500' : diskPct > 60 ? 'bg-amber-500' : 'bg-emerald-500'

  const mediaPct = mediaStats ? Math.min(100, (mediaStats.totalBytes / (1024 * 1024 * 1024)) * 100) : 0
  const mediaPctStr = mediaStats ? (mediaStats.totalBytes / (1024 * 1024)).toFixed(0) + ' MB' : null

  return (
    <>
      <AdminPageHeader
        title="Nastavení"
        subtitle="Správa serveru a úložiště"
        breadcrumb="Nastavení"
      />

      <div className="px-8 py-6 space-y-6 max-w-5xl">

        {/* ── Tiles grid ── */}
        <div className="grid grid-cols-3 gap-4">

          {/* Úložiště médií — col-span-1 */}
          <div className="col-span-1 rounded-2xl border border-white/[0.08] bg-[#191b2e] p-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center shrink-0">
                <HardDrive size={20} className="text-violet-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">Úložiště médií</p>
                <p className="text-xs text-gray-500">data/uploads/</p>
              </div>
            </div>

            {mediaScanned && mediaStats ? (
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-white">{mediaStats.totalStr}</span>
                  <span className="text-xs text-gray-500">{mediaStats.fileCount} souborů</span>
                </div>
                <div className="w-full bg-white/[0.06] rounded-full h-2 overflow-hidden">
                  <div className="h-full rounded-full bg-violet-500 transition-all duration-700"
                    style={{ width: `${Math.min(100, mediaPct)}%` }} />
                </div>
                <p className="text-[11px] text-gray-600">{mediaPctStr} v data/uploads/</p>
              </div>
            ) : (
              <div className="text-xs text-gray-500 text-center py-2">
                {mediaScanning ? 'Skenuji…' : 'Stiskněte tlačítko pro sken'}
              </div>
            )}

            <button
              onClick={scanMedia}
              disabled={mediaScanning}
              className="mt-auto flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-violet-500/30 bg-violet-500/10 text-xs font-semibold text-violet-300 hover:bg-violet-500/20 transition-all disabled:opacity-50"
            >
              <ScanSearch size={13} className={mediaScanning ? 'animate-pulse' : ''} />
              {mediaScanning ? 'Skenuji…' : 'Skenovat úložiště'}
            </button>
          </div>

          {/* Disk serveru — col-span-2 */}
          <div className="col-span-2 rounded-2xl border border-white/[0.08] bg-[#191b2e] p-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
                <Server size={20} className="text-emerald-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">Disk serveru</p>
                <p className="text-xs text-gray-500">Celkové využití (aktualizace každých 30 min)</p>
              </div>
              <button
                onClick={fetchDisk}
                disabled={diskLoading}
                title="Obnovit"
                className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/[0.06] transition-colors disabled:opacity-40"
              >
                <RefreshCw size={14} className={diskLoading ? 'animate-spin' : ''} />
              </button>
            </div>

            {diskLoading ? (
              <div className="text-center py-4 text-gray-600 text-sm">Načítám…</div>
            ) : serverDisk ? (
              <div className="space-y-3">
                {/* 3 mini cards */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Celkem', value: serverDisk.totalStr, color: 'text-white' },
                    { label: 'Použito', value: serverDisk.usedStr, color: diskPct > 85 ? 'text-red-400' : diskPct > 60 ? 'text-amber-400' : 'text-emerald-400' },
                    { label: 'Volno', value: serverDisk.freeStr, color: 'text-gray-300' },
                  ].map(c => (
                    <div key={c.label} className="rounded-xl bg-white/[0.04] border border-white/[0.06] px-3 py-2.5 text-center">
                      <div className={`text-lg font-black ${c.color}`}>{c.value}</div>
                      <div className="text-[11px] text-gray-500 mt-0.5">{c.label}</div>
                    </div>
                  ))}
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{diskPct}% obsazeno</span>
                    <span className="text-gray-600 text-[11px]">
                      {serverDisk.checkedAt ? new Date(serverDisk.checkedAt).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <div className="w-full bg-white/[0.06] rounded-full h-3 overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-700 ${diskBarColor}`}
                      style={{ width: `${diskPct}%` }} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-600 text-sm">Nepodařilo se načíst data disku</div>
            )}
          </div>
        </div>

        {/* ── Media scan results ── */}
        {mediaScanned && mediaStats && (
          <div className="space-y-6">

            {/* Otázky s médii */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-white">Otázky s mediálními soubory</h2>
                {hasSelection && (
                  <button onClick={deleteSelected} disabled={deleting}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white text-xs font-semibold transition-all disabled:opacity-50">
                    <Trash2 size={13} />
                    {deleting ? 'Mažu…' : `Smazat (${selectedQIds.size + selectedOrphans.size})`}
                  </button>
                )}
              </div>

              {!mediaStats.mediaQuestions.length ? (
                <div className="text-center py-8 text-gray-600 rounded-2xl border border-white/[0.06] bg-white/[0.02] text-sm">
                  Žádné nahrané soubory
                </div>
              ) : (
                <div className="rounded-2xl border border-white/[0.08] bg-[#191b2e] overflow-hidden">
                  <div className="grid grid-cols-[24px_1fr_90px_80px_60px] gap-3 px-4 py-2.5 border-b border-white/[0.06] text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <input type="checkbox"
                      checked={selectedQIds.size === mediaStats.mediaQuestions.length && mediaStats.mediaQuestions.length > 0}
                      onChange={toggleAllQ}
                      className="w-4 h-4 rounded border-white/20 bg-white/[0.05] accent-violet-500" />
                    <span>Otázka</span><span>Typ</span><span className="text-right">Velikost</span><span></span>
                  </div>
                  {mediaStats.mediaQuestions.map(q => (
                    <div key={q.id}
                      className={`grid grid-cols-[24px_1fr_90px_80px_60px] gap-3 px-4 py-3 border-b border-white/[0.04] items-center text-sm hover:bg-white/[0.02] ${selectedQIds.has(q.id) ? 'bg-red-500/5' : ''}`}>
                      <input type="checkbox" checked={selectedQIds.has(q.id)} onChange={() => toggleQ(q.id)}
                        className="w-4 h-4 rounded border-white/20 bg-white/[0.05] accent-violet-500" />
                      <span className="text-gray-200 truncate text-xs">{q.text}</span>
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

            {/* Osiřelé soubory */}
            {mediaStats.orphanedFiles.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={15} className="text-amber-400" />
                  <h2 className="text-base font-bold text-white">Osiřelé soubory</h2>
                  <span className="text-xs text-gray-500">({mediaStats.orphanedFiles.length} souborů bez přiřazené otázky)</span>
                </div>
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 overflow-hidden">
                  <div className="grid grid-cols-[24px_1fr_80px] gap-3 px-4 py-2.5 border-b border-white/[0.06] text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <input type="checkbox"
                      checked={selectedOrphans.size === mediaStats.orphanedFiles.length}
                      onChange={toggleAllOrphans}
                      className="w-4 h-4 rounded border-white/20 bg-white/[0.05] accent-violet-500" />
                    <span>Soubor</span><span className="text-right">Velikost</span>
                  </div>
                  {mediaStats.orphanedFiles.map(f => (
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
        )}

      </div>
    </>
  )
}
