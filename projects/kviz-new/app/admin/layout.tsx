// app/admin/layout.tsx - Admin layout podle screenshotu
"use client"

import { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, FileQuestion, Palette, Users, 
  BarChart3, Settings, HelpCircle, Home,
  ChevronRight, Bell, Search, Menu, X, Tag
} from "lucide-react"

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()
  
  const navItems = [
    { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/quizzes", icon: FileQuestion, label: "Kvízy" },
    { href: "/admin/questions", icon: FileQuestion, label: "Otázky" },
    { href: "/admin/categories", icon: Tag, label: "Kategorie" },
    { href: "/admin/templates", icon: Palette, label: "Šablony" },
    { href: "/admin/users", icon: Users, label: "Uživatelé" },
    { href: "/admin/analytics", icon: BarChart3, label: "Analytika" },
    { href: "/admin/settings", icon: Settings, label: "Nastavení" },
    { href: "/admin/help", icon: HelpCircle, label: "Nápověda" },
  ]

  // Fallback pokud JavaScript neběží
  const isClient = typeof window !== 'undefined'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - tmavý podle screenshotu */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-gray-900 border-r border-gray-800">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b border-gray-800 px-6">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <span className="text-xl font-bold text-white">KvizAdmin</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </a>
              )
            })}
          </nav>

          {/* User menu */}
          <div className="border-t border-gray-800 p-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center">
                <span className="text-gray-300 text-sm">A</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Admin</p>
                <p className="text-xs text-gray-400">administrator</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white px-6">
          <div className="flex flex-1 items-center gap-4">
            <div className="flex-1">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  placeholder="Hledat..."
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
            <button className="relative rounded-full p-2 text-gray-600 hover:bg-gray-100">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"></span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}