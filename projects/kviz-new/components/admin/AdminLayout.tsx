// components/admin/AdminLayout.tsx - Profesionální admin layout s levým panelem
"use client"

import { ReactNode, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, FileQuestion, Palette, Users, 
  BarChart3, Settings, LogOut, Menu, X, 
  ChevronRight, Home, Zap, Download, Upload,
  Bell, HelpCircle, Search
} from "lucide-react"

interface AdminLayoutProps {
  children: ReactNode
  title?: string
  subtitle?: string
}

export function AdminLayout({ children, title = "Administrace", subtitle }: AdminLayoutProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  
  // Navigace
  const navItems = [
    {
      title: "Přehled",
      href: "/admin",
      icon: <LayoutDashboard size={20} />,
      active: pathname === "/admin"
    },
    {
      title: "Kvízy",
      href: "/admin/quizzes",
      icon: <Zap size={20} />,
      active: pathname.startsWith("/admin/quizzes")
    },
    {
      title: "Otázky",
      href: "/admin/questions",
      icon: <FileQuestion size={20} />,
      active: pathname.startsWith("/admin/questions")
    },
    {
      title: "Šablony",
      href: "/admin/templates",
      icon: <Palette size={20} />,
      active: pathname.startsWith("/admin/templates")
    },
    {
      title: "Uživatelé",
      href: "/admin/users",
      icon: <Users size={20} />,
      active: pathname.startsWith("/admin/users")
    },
    {
      title: "Reporty",
      href: "/admin/reports",
      icon: <BarChart3 size={20} />,
      active: pathname.startsWith("/admin/reports")
    },
    {
      title: "Import/Export",
      href: "/admin/import-export",
      icon: <Download size={20} />,
      active: pathname.startsWith("/admin/import-export")
    },
    {
      title: "Nastavení",
      href: "/admin/settings",
      icon: <Settings size={20} />,
      active: pathname.startsWith("/admin/settings")
    }
  ]
  
  // Rychlé akce
  const quickActions = [
    { label: "Nový kvíz", href: "/admin/quizzes/new", icon: <Zap size={16} /> },
    { label: "Nová otázka", href: "/admin/questions/new", icon: <FileQuestion size={16} /> },
    { label: "Importovat", href: "/admin/import-export", icon: <Upload size={16} /> },
    { label: "Reporty", href: "/admin/reports", icon: <BarChart3 size={16} /> }
  ]
  
  // Statistiky
  const stats = {
    totalQuizzes: 24,
    activeQuizzes: 3,
    totalQuestions: 156,
    usersOnline: 42
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hlavička */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Levý panel - logo a toggle */}
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              
              <Link href="/admin" className="ml-2 lg:ml-0 flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Zap size={20} className="text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 hidden sm:inline">
                  KvizAdmin
                </span>
              </Link>
              
              {/* Breadcrumb */}
              <div className="hidden lg:flex items-center ml-8 text-sm text-gray-500">
                <Link href="/" className="hover:text-gray-700">
                  <Home size={14} className="inline mr-1" />
                  Web
                </Link>
                <ChevronRight size={14} className="mx-2" />
                <span className="text-gray-900 font-medium">Administrace</span>
              </div>
            </div>
            
            {/* Pravý panel - vyhledávání a uživatel */}
            <div className="flex items-center gap-4">
              {/* Vyhledávání */}
              <div className="hidden md:block relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Hledat kvízy, otázky..."
                  className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {/* Notifikace */}
              <button className="p-2 rounded-lg hover:bg-gray-100 relative">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              {/* Nápověda */}
              <button className="p-2 rounded-lg hover:bg-gray-100">
                <HelpCircle size={20} />
              </button>
              
              {/* Uživatelský profil */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="font-semibold text-blue-700">MK</span>
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium text-gray-900">Martin Kalian</div>
                    <div className="text-xs text-gray-500">Administrátor</div>
                  </div>
                </button>
                
                {/* Dropdown menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="font-medium text-gray-900">Martin Kalian</div>
                      <div className="text-sm text-gray-500">martin@kviz.cz</div>
                    </div>
                    
                    <Link
                      href="/admin/profile"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-700"
                    >
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-sm">👤</span>
                      </div>
                      <span>Můj profil</span>
                    </Link>
                    
                    <Link
                      href="/admin/settings"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-700"
                    >
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <Settings size={16} />
                      </div>
                      <span>Nastavení účtu</span>
                    </Link>
                    
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 text-red-600">
                        <LogOut size={16} />
                        <span>Odhlásit se</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <div className="flex">
        {/* Levý panel - sidebar */}
        <aside className={`
          bg-white border-r border-gray-200
          ${sidebarOpen ? 'w-64' : 'w-0'} 
          transition-all duration-300
          fixed lg:static inset-y-0 left-0 z-40
          h-[calc(100vh-4rem)] overflow-y-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          {/* Navigace */}
          <nav className="p-4">
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Hlavní navigace
              </h3>
              <ul className="space-y-1">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-lg
                        transition-colors
                        ${item.active 
                          ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }
                      `}
                    >
                      <span className={item.active ? 'text-blue-600' : 'text-gray-500'}>
                        {item.icon}
                      </span>
                      <span className="font-medium">{item.title}</span>
                      {item.active && (
                        <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Rychlé akce */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Rychlé akce
              </h3>
              <div className="space-y-2">
                {quickActions.map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    {action.icon}
                    {action.label}
                  </Link>
                ))}
              </div>
            </div>
            
            {/* Statistiky */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Přehled systému
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Kvízy</span>
                  <span className="font-medium">{stats.totalQuizzes}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Aktivní</span>
                  <span className="font-medium text-green-600">{stats.activeQuizzes}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Otázky</span>
                  <span className="font-medium">{stats.totalQuestions}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Online</span>
                  <span className="font-medium text-blue-600">{stats.usersOnline}</span>
                </div>
              </div>
            </div>
            
            {/* Footer sidebaru */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                <div className="mb-2">Verze 2.1.0</div>
                <div>© 2026 KvizAdmin</div>
              </div>
            </div>
          </nav>
        </aside>
        
        {/* Hlavní obsah */}
        <main className="flex-1 p-4 lg:p-6">
          {/* Breadcrumb pro mobil */}
          <div className="lg:hidden mb-4 text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-700">
              <Home size={14} className="inline mr-1" />
              Web
            </Link>
            <ChevronRight size={14} className="inline mx-2" />
            <span className="text-gray-900 font-medium">Administrace</span>
          </div>
          
          {/* Hlavička stránky */}
          <div className="mb-6">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{title}</h1>
            {subtitle && (
              <p className="text-gray-600 mt-2">{subtitle}</p>
            )}
          </div>
          
          {/* Obsah stránky */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            {children}
          </div>
          
          {/* Footer */}
          <footer className="mt-6 text-center text-sm text-gray-500">
            <p>KvizAdmin • {new Date().getFullYear()} • Všechna práva vyhrazena</p>
          </footer>
        </main>
      </div>
      
      {/* Overlay pro mobilní sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}