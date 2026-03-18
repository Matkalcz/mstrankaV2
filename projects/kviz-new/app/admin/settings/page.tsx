// app/admin/settings/page.tsx
"use client"

import { useState, useEffect } from "react"
import { AdminPageHeader } from "@/components/AdminLayoutDark"
import { Server, Database, Info, RefreshCw, CheckCircle2 } from "lucide-react"

interface DbStats {
  questions: number
  quizzes: number
  tags: number
  templates: number
}

export default function SettingsPage() {
  const [stats, setStats] = useState<DbStats | null>(null)
  const [uptime, setUptime] = useState<string>("")

  useEffect(() => {
    Promise.all([
      fetch("/api/questions").then(r => r.json()).then(d => Array.isArray(d) ? d.length : 0),
      fetch("/api/quizzes").then(r => r.json()).then(d => Array.isArray(d) ? d.length : 0),
      fetch("/api/tags").then(r => r.json()).then(d => Array.isArray(d) ? d.length : 0),
      fetch("/api/templates").then(r => r.json()).then(d => Array.isArray(d) ? d.length : 0),
    ]).then(([questions, quizzes, tags, templates]) => {
      setStats({ questions, quizzes, tags, templates })
    }).catch(() => {})

    // Výpočet doby provozu stránky (client-side uptime)
    const start = Date.now()
    const t = setInterval(() => {
      const s = Math.floor((Date.now() - start) / 1000)
      const m = Math.floor(s / 60)
      const h = Math.floor(m / 60)
      setUptime(h > 0 ? `${h}h ${m % 60}m` : m > 0 ? `${m}m ${s % 60}s` : `${s}s`)
    }, 1000)
    return () => clearInterval(t)
  }, [])

  const sectionCls = "bg-white/[0.03] border border-white/[0.07] rounded-xl overflow-hidden"
  const rowCls = "flex items-center justify-between px-5 py-3.5 border-b border-white/[0.05] last:border-0"

  return (
    <div>
      <AdminPageHeader title="Nastavení" subtitle="Přehled systému a konfigurace" />

      <div className="px-8 py-6 max-w-2xl space-y-4">

        {/* Systém */}
        <div className={sectionCls}>
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.07]">
            <Server size={15} className="text-violet-400" />
            <span className="text-sm font-bold text-gray-300">Systém</span>
          </div>
          <div className={rowCls}>
            <span className="text-sm text-gray-400">Verze</span>
            <span className="text-sm font-mono text-gray-200">Next.js 15 · SQLite</span>
          </div>
          <div className={rowCls}>
            <span className="text-sm text-gray-400">URL</span>
            <span className="text-sm font-mono text-violet-300">kviz.michaljanda.com</span>
          </div>
          <div className={rowCls}>
            <span className="text-sm text-gray-400">Session uptime</span>
            <span className="text-sm font-mono text-gray-200">{uptime || "—"}</span>
          </div>
          <div className={rowCls}>
            <span className="text-sm text-gray-400">Databáze</span>
            <div className="flex items-center gap-1.5 text-emerald-400 text-sm">
              <CheckCircle2 size={14} /> Online
            </div>
          </div>
        </div>

        {/* Databáze */}
        <div className={sectionCls}>
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.07]">
            <Database size={15} className="text-violet-400" />
            <span className="text-sm font-bold text-gray-300">Obsah databáze</span>
            <button onClick={() => window.location.reload()}
              className="ml-auto p-1 rounded text-gray-600 hover:text-gray-400 transition-colors">
              <RefreshCw size={13} />
            </button>
          </div>
          {stats ? (
            <>
              {[
                { label: "Otázky",   value: stats.questions },
                { label: "Kvízy",    value: stats.quizzes },
                { label: "Tagy",     value: stats.tags },
                { label: "Šablony",  value: stats.templates },
              ].map(({ label, value }) => (
                <div key={label} className={rowCls}>
                  <span className="text-sm text-gray-400">{label}</span>
                  <span className="text-sm font-bold text-white">{value}</span>
                </div>
              ))}
            </>
          ) : (
            <div className="px-5 py-4 text-sm text-gray-600">Načítám…</div>
          )}
        </div>

        {/* Info */}
        <div className="flex items-start gap-3 px-5 py-4 bg-violet-500/5 border border-violet-500/15 rounded-xl">
          <Info size={15} className="text-violet-400 mt-0.5 shrink-0" />
          <p className="text-xs text-gray-500 leading-relaxed">
            Správa uživatelů a přihlašování bude přidána v další fázi vývoje.
            Avatar a profilová nastavení budou dostupná po implementaci autentizace.
          </p>
        </div>

      </div>
    </div>
  )
}
