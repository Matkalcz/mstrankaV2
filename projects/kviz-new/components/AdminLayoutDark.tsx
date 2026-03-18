// components/AdminLayoutDark.tsx
// Tmavý admin layout — composable: AdminShell (sidebar) + AdminPageHeader (per-page)

"use client"

import { ReactNode, useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard, HelpCircle, Tag, PlayCircle,
  Palette, Settings, Play, Plus, ChevronRight
} from "lucide-react"

// ── Nav config ────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { label: "Dashboard",  href: "/admin",            icon: LayoutDashboard, exact: true },
  { label: "Otázky",     href: "/admin/questions",  icon: HelpCircle },
  { label: "Tagy",       href: "/admin/categories", icon: Tag },
  { label: "Kvízy",      href: "/admin/quizzes",    icon: PlayCircle },
  { label: "Šablony",    href: "/admin/templates",  icon: Palette },
  { label: "Nastavení",  href: "/admin/settings",   icon: Settings },
]

// SVG placeholder — vždy dostupný, žádné síťové požadavky
const AVATAR_URL = "/admin-avatar.jpg"
const AVATAR_FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='44' viewBox='0 0 44 44'%3E%3Crect width='44' height='44' rx='22' fill='%237c3aed' opacity='.25'/%3E%3Ccircle cx='22' cy='17' r='7' fill='%238b5cf6'/%3E%3Cellipse cx='22' cy='36' rx='12' ry='8' fill='%238b5cf6'/%3E%3C/svg%3E"

// ── Sidebar nav item ──────────────────────────────────────────────────────────

function NavItem({ href, label, icon: Icon, active }: {
  href: string; label: string; icon: any; active: boolean
}) {
  return (
    <Link
      href={href}
      className={`
        relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-medium
        transition-all duration-150 group
        ${active
          ? "bg-violet-600/20 text-white before:absolute before:left-0 before:top-2.5 before:bottom-2.5 before:w-[3px] before:rounded-r-full before:bg-violet-400"
          : "text-gray-400 hover:text-white hover:bg-white/[0.05]"
        }
      `}
    >
      <Icon
        size={18}
        className={active ? "text-violet-400" : "text-gray-500 group-hover:text-gray-300 transition-colors"}
      />
      {label}
    </Link>
  )
}

// ── Quick actions ─────────────────────────────────────────────────────────────

function QuickActions() {
  const router = useRouter()
  const [lastQuizId, setLastQuizId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/quizzes')
      .then(r => r.json())
      .then(data => {
        const quizzes = Array.isArray(data) ? data : []
        if (quizzes.length > 0) setLastQuizId(quizzes[0].id)
      })
      .catch(() => {})
  }, [])

  return (
    <div className="px-3 pb-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 px-1 mb-2">Rychlé akce</p>
      <div className="space-y-1">
        {lastQuizId && (
          <button
            onClick={() => router.push(`/play/${lastQuizId}`)}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-violet-600/15 hover:bg-violet-600/28 border border-violet-500/25 text-[13px] font-bold text-violet-300 hover:text-white transition-all">
            <Play size={14} className="text-violet-400" /> Spustit kvíz
          </button>
        )}
        <Link href="/admin/questions/new"
          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-[13px] font-semibold text-gray-300 hover:text-white transition-all">
          <Plus size={14} className="text-gray-500" /> Nová otázka
        </Link>
        <Link href="/admin/quizzes/new"
          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-[13px] font-semibold text-gray-300 hover:text-white transition-all">
          <Plus size={14} className="text-gray-500" /> Nový kvíz
        </Link>
      </div>
    </div>
  )
}

// ── Sidebar inner ─────────────────────────────────────────────────────────────

function AdminSidebarInner() {
  const pathname = usePathname()
  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)
  const [avatarSrc, setAvatarSrc] = useState(AVATAR_URL)

  return (
    <aside className="w-[240px] shrink-0 flex flex-col bg-[#090b16] border-r border-white/[0.06]"
      style={{ background: 'linear-gradient(180deg, #0a0c18 0%, #0c0e1c 100%)' }}>

      {/* Identity */}
      <div className="px-4 pt-5 pb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-violet-500/30 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarSrc}
              alt="Avatar"
              width={40}
              height={40}
              className="object-cover w-10 h-10"
              onError={() => setAvatarSrc(AVATAR_FALLBACK)}
            />
          </div>
          <div className="min-w-0">
            <div className="text-[14px] font-bold text-white leading-tight truncate">Kvíz Admin</div>
            <div className="text-[11px] text-gray-500 leading-tight mt-0.5 truncate">kviz.michaljanda.com</div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="pt-4 border-b border-white/[0.06] pb-4">
        <QuickActions />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 pt-4 space-y-0.5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 px-1 mb-2">Navigace</p>
        {NAV_ITEMS.map(item => (
          <NavItem
            key={item.href + item.label}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={isActive(item.href, item.exact)}
          />
        ))}
      </nav>
    </aside>
  )
}

// ── AdminShell ─────────────────────────────────────────────────────────────────

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen text-white overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0a0c1a 0%, #0f1122 60%, #110e20 100%)' }}>
      <AdminSidebarInner />
      {/* Main content with subtle radial gradient */}
      <div className="flex-1 overflow-y-auto relative"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 80% 100%, rgba(109,40,217,0.08) 0%, transparent 70%)' }}>
        {children}
      </div>
    </div>
  )
}

// ── AdminPageHeader ────────────────────────────────────────────────────────────

export function AdminPageHeader({
  title, subtitle, action, breadcrumb, section
}: {
  title: string
  subtitle?: string
  action?: ReactNode
  breadcrumb?: string
  section?: string
}) {
  return (
    <div className="px-8 pt-7 pb-6 border-b border-white/[0.07] sticky top-0 z-10"
      style={{ background: 'rgba(10,12,26,0.85)', backdropFilter: 'blur(12px)' }}>
      <div className="flex items-start justify-between gap-4">
        <div>
          {section && (
            <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400 mb-1">{section}</p>
          )}
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2 font-medium">
            <span>Admin</span>
            <ChevronRight size={11} className="text-gray-600" />
            <span className="text-gray-400">{breadcrumb || title}</span>
          </div>
          <h1 className="text-[22px] font-bold text-white tracking-tight leading-tight">{title}</h1>
          {subtitle && <p className="text-sm text-gray-400 mt-1 leading-snug">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0 mt-1">{action}</div>}
      </div>
    </div>
  )
}

// ── Backward-compat wrapper ────────────────────────────────────────────────────

export function AdminLayoutDark({ children, pageTitle, action }: {
  children: ReactNode; pageTitle: string; action?: ReactNode
}) {
  return (
    <AdminShell>
      <AdminPageHeader title={pageTitle} action={action} />
      <div className="px-8 py-6">{children}</div>
    </AdminShell>
  )
}

// ── Reusable UI primitives ─────────────────────────────────────────────────────

export function ActionButton({ href, children, onClick }: {
  href?: string; children: ReactNode; onClick?: () => void
}) {
  const cls = "inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/25 transition-all active:scale-95"
  if (href) return <Link href={href} className={cls}>{children}</Link>
  return <button onClick={onClick} className={cls}>{children}</button>
}

export function StatCard({ label, value, icon: Icon, color = "violet" }: {
  label: string; value: string | number; icon: any; color?: "violet" | "emerald" | "amber" | "cyan" | "pink"
}) {
  const colors = {
    violet:  { bg: "bg-violet-500/15",  text: "text-violet-300",  border: "border-violet-500/20" },
    emerald: { bg: "bg-emerald-500/15", text: "text-emerald-300", border: "border-emerald-500/20" },
    amber:   { bg: "bg-amber-500/15",   text: "text-amber-300",   border: "border-amber-500/20" },
    cyan:    { bg: "bg-cyan-500/15",    text: "text-cyan-300",    border: "border-cyan-500/20" },
    pink:    { bg: "bg-pink-500/15",    text: "text-pink-300",    border: "border-pink-500/20" },
  }
  const c = colors[color]
  return (
    <div className={`bg-white/[0.03] border ${c.border} rounded-xl p-5 hover:bg-white/[0.05] transition-colors`}>
      <div className="flex items-center gap-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${c.bg}`}>
          <Icon size={22} className={c.text} />
        </div>
        <div>
          <div className="text-2xl font-bold text-white leading-none">{value}</div>
          <div className="text-xs text-gray-400 mt-1.5 font-medium">{label}</div>
        </div>
      </div>
    </div>
  )
}

export function DarkCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white/[0.03] border border-white/[0.07] rounded-xl overflow-hidden ${className}`}>
      {children}
    </div>
  )
}
