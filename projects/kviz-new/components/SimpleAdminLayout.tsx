// components/SimpleAdminLayout.tsx - Simple layout for testing
"use client"

import React, { ReactNode } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface SimpleAdminLayoutProps {
  children: ReactNode
  title?: string
}

export default function SimpleAdminLayout({ children, title = "Dashboard" }: SimpleAdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-xl font-bold text-gray-900">
              Kvíz Admin
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/admin/quizzes" className="text-gray-600 hover:text-gray-900">
                Kvízy
              </Link>
              <Link href="/admin/questions" className="text-gray-600 hover:text-gray-900">
                Otázky
              </Link>
              <Link href="/admin/templates" className="text-gray-600 hover:text-gray-900">
                Šablony
              </Link>
            </nav>
          </div>
          <div className="text-sm text-gray-500">
            {title}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>

      {/* Simple footer */}
      <footer className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-500">
          Kvíz Admin System © {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  )
}