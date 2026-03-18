// app/admin/page.tsx — Dashboard
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { HelpCircle, Tag, PlayCircle, Palette, Plus, ArrowRight, Zap } from "lucide-react"
import { AdminPageHeader, StatCard, DarkCard } from "@/components/AdminLayoutDark"

export default function AdminDashboard() {
  const [stats, setStats] = useState({ questions: 0, tags: 0, quizzes: 0, templates: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/questions").then(r => r.json()).catch(() => []),
      fetch("/api/tags").then(r => r.json()).catch(() => []),
      fetch("/api/quizzes").then(r => r.json()).catch(() => []),
      fetch("/api/templates").then(r => r.json()).catch(() => []),
    ]).then(([questions, tags, quizzes, templates]) => {
      setStats({
        questions: Array.isArray(questions) ? questions.length : 0,
        tags:      Array.isArray(tags)      ? tags.length      : 0,
        quizzes:   Array.isArray(quizzes)   ? quizzes.length   : 0,
        templates: Array.isArray(templates) ? templates.length : 0,
      })
    }).finally(() => setLoading(false))
  }, [])

  const quickActions = [
    { label: "Nová otázka",  href: "/admin/questions/new", icon: HelpCircle, color: "violet" as const },
    { label: "Nová šablona", href: "/admin/templates/new", icon: Palette,    color: "cyan"   as const },
    { label: "Nový kvíz",    href: "/admin/quizzes/new",   icon: PlayCircle,  color: "amber"  as const },
    { label: "Nový tag",     href: "/admin/categories",    icon: Tag,         color: "emerald" as const },
  ]

  const navCards = [
    { label: "Otázky",   href: "/admin/questions",  icon: HelpCircle, desc: "Správa otázek všech typů" },
    { label: "Tagy",     href: "/admin/categories", icon: Tag,        desc: "Kategorizace otázek" },
    { label: "Kvízy",    href: "/admin/quizzes",    icon: PlayCircle, desc: "Sestavování a přehrávání" },
    { label: "Šablony",  href: "/admin/templates",  icon: Palette,    desc: "Vzhled prezentací" },
  ]

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        subtitle="Přehled hospodského kvízu"
      />

      <div className="px-8 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Otázek celkem"  value={loading ? "…" : stats.questions} icon={HelpCircle} color="violet" />
          <StatCard label="Tagů"            value={loading ? "…" : stats.tags}      icon={Tag}        color="cyan"   />
          <StatCard label="Kvízů"           value={loading ? "…" : stats.quizzes}   icon={PlayCircle}  color="amber"  />
          <StatCard label="Šablon"          value={loading ? "…" : stats.templates} icon={Palette}    color="emerald" />
        </div>

        {/* Quick actions */}
        <DarkCard>
          <div className="px-6 py-4 border-b border-white/[0.06]">
            <h2 className="text-sm font-bold text-gray-300 flex items-center gap-2">
              <Zap size={15} className="text-violet-400" /> Rychlé akce
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.04]">
            {quickActions.map(a => (
              <Link key={a.href} href={a.href}
                className="flex flex-col items-center gap-2 px-4 py-6 bg-[#191b2e] hover:bg-violet-500/10 transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center group-hover:bg-violet-500/20 transition-colors">
                  <a.icon size={20} className="text-violet-400" />
                </div>
                <span className="text-sm font-semibold text-gray-300 group-hover:text-white transition-colors">{a.label}</span>
              </Link>
            ))}
          </div>
        </DarkCard>

        {/* Navigation cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {navCards.map(c => (
            <Link key={c.href} href={c.href}
              className="flex items-center gap-4 px-6 py-5 bg-[#191b2e] border border-white/[0.08] rounded-xl hover:border-violet-500/30 hover:bg-violet-500/5 transition-all group">
              <div className="w-11 h-11 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0 group-hover:bg-violet-500/20 transition-colors">
                <c.icon size={22} className="text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white text-sm">{c.label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{c.desc}</div>
              </div>
              <ArrowRight size={16} className="text-gray-600 group-hover:text-violet-400 transition-colors shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
