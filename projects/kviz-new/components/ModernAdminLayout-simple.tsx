// components/ModernAdminLayout-simple.tsx - Zjednodušená verze bez DOM manipulace
"use client"

import React, { ReactNode, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, Zap, FileText, Palette,
  Users, BarChart3, Settings, HelpCircle
} from "lucide-react"

interface ModernAdminLayoutProps {
  children: ReactNode
  title?: string
}

export function ModernAdminLayoutSimple({ children, title = "Dashboard" }: ModernAdminLayoutProps) {
  const pathname = usePathname()
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  
  // Navigace podle screenshotu - tmavý sidebar
  const navItems = [
    {
      title: "Dashboard",
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
      icon: <FileText size={20} />,
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
      title: "Analytika",
      href: "/admin/analytics",
      icon: <BarChart3 size={20} />,
      active: pathname.startsWith("/admin/analytics")
    },
    {
      title: "Nastavení",
      href: "/admin/settings",
      icon: <Settings size={20} />,
      active: pathname.startsWith("/admin/settings")
    },
    {
      title: "Nápověda",
      href: "/admin/help",
      icon: <HelpCircle size={20} />,
      active: pathname.startsWith("/admin/help")
    }
  ]
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar - tmavý, podle screenshotu */}
        <aside className="
          bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800
          w-64
          sticky top-0
          h-screen
          flex flex-col
          overflow-y-auto
        ">
          {/* Logo v sidebaru */}
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Zap size={20} className="text-white" />
              </div>
              <div>
                <div className="text-white font-bold text-lg">KvizAdmin</div>
                <div className="text-gray-400 text-xs">Moderní administrace</div>
              </div>
            </div>
          </div>
          
          {/* Navigace */}
          <nav className="p-4 flex-grow">
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-colors
                    ${item.active 
                      ? 'bg-gray-800 text-white' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }
                  `}
                >
                  <div className={item.active ? 'text-blue-400' : 'text-gray-400'}>
                    {item.icon}
                  </div>
                  <span className="font-normal text-sm">{item.title}</span>
                  {item.active && (
                    <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </Link>
              ))}
            </div>
          </nav>
          
          {/* Uživatelský profil - dole */}
          <div className="mt-auto border-t border-gray-800">
            <div className="p-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="relative focus:outline-none"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">MK</span>
                  </div>
                </button>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-semibold text-sm truncate">Martin Kalian</div>
                  <div className="text-gray-400 text-xs truncate">Administrátor</div>
                </div>
              </div>
              
              {/* Dropdown menu */}
              {profileDropdownOpen && (
                <div className="mt-2 ml-12 bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                  <button
                    onClick={() => {
                      // TODO: odhlášení
                      console.log('Odhlášení')
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    Odhlásit se
                  </button>
                </div>
              )}
            </div>
          </div>
        </aside>
        
        {/* Hlavní obsah */}
        <main className="flex-1 p-6">
          {children}
          
          {/* Footer */}
          <footer className="mt-8 pt-6 border-t border-gray-200 text-center">
            <div className="text-sm text-gray-500">
              <p>© 2026 KvizAdmin • Moderní administrace kvízového systému</p>
              <p className="mt-1 text-xs">Všechna práva vyhrazena</p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  )
}