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

// Gravatar fallback: zobrazí identicon podle emailu pokud není lokální avatar
const ADMIN_EMAIL = "admin@kviz.michaljanda.com"
const gravatarUrl = (email: string, size = 88) => {
  // md5 není dostupný bez knihovny — použijeme UI Avatars jako fallback
  return `https://ui-avatars.com/api/?name=Admin&size=${size}&background=7c3aed&color=fff&bold=true&rounded=true`
}
const AVATAR_URL = "/admin-avatar.jpg"

// ── Sidebar nav item ──────────────────────────────────────────────────────────

function NavItem({ href, label, icon: Icon, active }: {
  href: string; label: string; icon: any; active: boolean
}) {
  return (
    <Link
      href={href}
      className={`
        relative flex items-center gap-3.5 px-4 py-3 rounded-xl text-[15px] font-medium
        transition-all duration-150 group
        ${active
          ? "bg-violet-600/25 text-white before:absolute before:left-0 before:top-3 before:bottom-3 before:w-[3px] before:rounded-r-full before:bg-violet-400"
          : "text-gray-400 hover:text-white hover:bg-white/[0.06]"
        }
      `}
    >
      <Icon
        size={20}
        className={active ? "text-violet-400" : "text-gray-500 group-hover:text-gray-300 transition-colors"}
      />
      {label}
    </Link>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

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
    <div className="px-3 pt-4 pb-3 border-b border-white/[0.07] space-y-1.5">
      {lastQuizId && (
        <button
          onClick={() => router.push(`/play/${lastQuizId}`)}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/35 border border-violet-500/30 text-[14px] font-bold text-violet-300 hover:text-white transition-colors">
          <Play size={15} className="text-violet-400" /> Spustit kvíz
        </button>
      )}
      <Link href="/admin/questions/new"
        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.10] text-[14px] font-semibold text-white transition-colors">
        <Plus size={16} className="text-gray-400" /> Nová otázka
      </Link>
      <Link href="/admin/quizzes/new"
        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.10] text-[14px] font-semibold text-white transition-colors">
        <Plus size={16} className="text-gray-400" /> Nový kvíz
      </Link>
    </div>
  )
}

function AdminSidebarInner() {
  const pathname = usePathname()
  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)
  const [avatarSrc, setAvatarSrc] = useState(AVATAR_URL)

  return (
    <aside className="w-[220px] shrink-0 flex flex-col bg-[#0d0f1e] border-r border-white/[0.07]">

      {/* Avatar + identity */}
      <div className="px-5 pt-6 pb-5 border-b border-white/[0.07]">
        <div className="flex items-center gap-3.5">
          <div className="relative shrink-0">
            <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-violet-500/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarSrc}
                alt="Avatar"
                width={44}
                height={44}
                className="object-cover w-11 h-11"
                onError={() => setAvatarSrc(gravatarUrl(ADMIN_EMAIL))}
              />
            </div>
          </div>
          <div>
            <div className="text-[15px] font-bold text-white leading-tight">Kvíz Admin</div>
            <div className="text-xs text-gray-500 leading-tight mt-0.5">kviz.michaljanda.com</div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <QuickActions />

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
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

// ── AdminShell — used in app/admin/layout.tsx ─────────────────────────────────

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-[#0f1120] text-white overflow-hidden">
      <AdminSidebarInner />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}

// ── AdminPageHeader — used at top of each page ────────────────────────────────

export function AdminPageHeader({
  title, subtitle, action, breadcrumb
}: {
  title: string
  subtitle?: string
  action?: ReactNode
  breadcrumb?: string
}) {
  return (
    <div className="px-8 pt-8 pb-6 border-b border-white/[0.08] bg-[#0f1120] sticky top-0 z-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2 font-medium">
            <span>Admin</span>
            <ChevronRight size={12} className="text-gray-600" />
            <span className="text-gray-400">{breadcrumb || title}</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0 mt-1">{action}</div>}
      </div>
    </div>
  )
}

// ── Backward-compat wrapper (used directly by questions page) ────────────────

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

// ── Reusable UI primitives ────────────────────────────────────────────────────

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
    violet: { bg: "bg-violet-500/20",  text: "text-violet-300",  border: "border-violet-500/20" },
    emerald: { bg: "bg-emerald-500/20", text: "text-emerald-300", border: "border-emerald-500/20" },
    amber:   { bg: "bg-amber-500/20",   text: "text-amber-300",   border: "border-amber-500/20" },
    cyan:    { bg: "bg-cyan-500/20",    text: "text-cyan-300",    border: "border-cyan-500/20" },
    pink:    { bg: "bg-pink-500/20",    text: "text-pink-300",    border: "border-pink-500/20" },
  }
  const c = colors[color]
  return (
    <div className={`bg-[#191b2e] border ${c.border} rounded-xl p-5`}>
      <div className="flex items-center gap-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${c.bg}`}>
          <Icon size={22} className={c.text} />
        </div>
        <div>
          <div className="text-2xl font-bold text-white leading-none">{value}</div>
          <div className="text-xs text-gray-400 mt-1 font-medium">{label}</div>
        </div>
      </div>
    </div>
  )
}

export function DarkCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-[#191b2e] border border-white/[0.08] rounded-xl overflow-hidden ${className}`}>
      {children}
    </div>
  )
}
