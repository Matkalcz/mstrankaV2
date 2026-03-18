// app/admin/templates/page.tsx - Správa šablon vzhledu
"use client"

import { useState } from "react"
import { Search, Filter, Plus, Edit, Trash2, Eye, Download, MoreVertical, Palette, Star, Copy, CheckCircle } from "lucide-react"
import Link from "next/link"

interface Template {
  id: string
  name: string
  description: string
  backgroundType: "solid" | "gradient" | "image"
  primaryColor: string
  textColor: string
  fontFamily: string
  isDefault: boolean
  createdAt: string
  usedIn: number
}

export default function TemplatesPage() {
  const [search, setSearch] = useState("")

  const templates: Template[] = [
    { id: "1", name: "Modrý gradient", description: "Moderní modrý gradient pro firemní prezentace", backgroundType: "gradient", primaryColor: "#3b82f6", textColor: "#1f2937", fontFamily: "Inter", isDefault: true, createdAt: "2026-03-09", usedIn: 8 },
    { id: "2", name: "Tmavý profesionální", description: "Tmavé pozadí s kontrastním textem", backgroundType: "solid", primaryColor: "#1f2937", textColor: "#f9fafb", fontFamily: "Roboto", isDefault: false, createdAt: "2026-03-08", usedIn: 5 },
    { id: "3", name: "Zelená příroda", description: "Přírodní motivy s zelenými tóny", backgroundType: "image", primaryColor: "#10b981", textColor: "#064e3b", fontFamily: "Open Sans", isDefault: false, createdAt: "2026-03-07", usedIn: 3 },
    { id: "4", name: "Červený akcent", description: "Červené akcenty na světlém pozadí", backgroundType: "solid", primaryColor: "#dc2626", textColor: "#1f2937", fontFamily: "Montserrat", isDefault: false, createdAt: "2026-03-06", usedIn: 2 },
    { id: "5", name: "Fialový přechod", description: "Fialový gradient s moderním vzhledem", backgroundType: "gradient", primaryColor: "#8b5cf6", textColor: "#ffffff", fontFamily: "Poppins", isDefault: false, createdAt: "2026-03-05", usedIn: 1 },
  ]

  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.description.toLowerCase().includes(search.toLowerCase())
  )

  const getBackgroundTypeLabel = (type: Template["backgroundType"]) => {
    switch (type) {
      case "solid": return "Jednolité"
      case "gradient": return "Přechod"
      case "image": return "Obrázek"
    }
  }

  const getBackgroundTypeColor = (type: Template["backgroundType"]) => {
    switch (type) {
      case "solid": return "bg-blue-100 text-blue-800"
      case "gradient": return "bg-purple-100 text-purple-800"
      case "image": return "bg-green-100 text-green-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Šablony vzhledu</h1>
          <p className="text-gray-600">Spravujte vzhled prezentací - pozadí, barvy, fonty, pozice elementů</p>
        </div>
        <Link href="/admin/templates/new" className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          Vytvořit šablonu
        </Link>
      </div>

      {/* Filters */}
      <div className="rounded-xl border bg-white p-6">
        <div className="grid gap-4 md:grid-cols-3">
          {/* Search */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Hledat</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Hledat šablonu..."
                className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <p className="text-sm text-gray-600">Aktivních šablon</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600">Výchozí</p>
              <p className="text-2xl font-bold text-gray-900">1</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-end gap-3">
            <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <Filter className="h-4 w-4" />
              Filtry
            </button>
            <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Templates grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((template) => (
          <div key={template.id} className="overflow-hidden rounded-xl border bg-white shadow-sm">
            {/* Template preview */}
            <div 
              className="h-48 relative"
              style={{
                background: template.backgroundType === "gradient" 
                  ? `linear-gradient(135deg, ${template.primaryColor}80 0%, #8b5cf6 100%)`
                  : template.backgroundType === "image"
                  ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/api/placeholder/400/200')`
                  : template.primaryColor + "20"
              }}
            >
              {/* Template badge */}
              {template.isDefault && (
                <div className="absolute left-4 top-4">
                  <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
                    <Star className="h-3 w-3" />
                    Výchozí
                  </span>
                </div>
              )}

              {/* Template type badge */}
              <div className="absolute right-4 top-4">
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getBackgroundTypeColor(template.backgroundType)}`}>
                  {getBackgroundTypeLabel(template.backgroundType)}
                </span>
              </div>

              {/* Preview content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                    <Palette className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{template.name}</h3>
                  <p className="text-white/80">{template.fontFamily}</p>
                </div>
              </div>
            </div>

            {/* Template info */}
            <div className="p-6">
              <p className="text-gray-600">{template.description}</p>
              
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Hlavní barva</p>
                  <div className="mt-1 flex items-center gap-2">
                    <div 
                      className="h-6 w-6 rounded-full border"
                      style={{ backgroundColor: template.primaryColor }}
                    />
                    <span className="font-mono text-sm">{template.primaryColor}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Barva textu</p>
                  <div className="mt-1 flex items-center gap-2">
                    <div 
                      className="h-6 w-6 rounded-full border"
                      style={{ backgroundColor: template.textColor }}
                    />
                    <span className="font-mono text-sm">{template.textColor}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Vytvořeno</p>
                  <p className="font-medium text-gray-900">{template.createdAt}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Použito v</p>
                  <p className="text-lg font-bold text-gray-900">{template.usedIn} kvízích</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50">
                    <Eye className="h-4 w-4" />
                    Náhled
                  </button>
                  <Link href={`/admin/templates/${template.id}`} className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100">
                    <Edit className="h-4 w-4" />
                    Upravit
                  </Link>
                </div>
                <div className="flex items-center gap-1">
                  <button className="rounded-lg p-2 text-gray-600 hover:bg-gray-200" title="Duplikovat">
                    <Copy className="h-4 w-4" />
                  </button>
                  {!template.isDefault && (
                    <button className="rounded-lg p-2 text-gray-600 hover:bg-gray-200" title="Nastavit jako výchozí">
                      <Star className="h-4 w-4" />
                    </button>
                  )}
                  {template.isDefault && (
                    <span className="rounded-lg p-2 text-green-600" title="Výchozí šablona">
                      <CheckCircle className="h-4 w-4" />
                    </span>
                  )}
                  {!template.isDefault && (
                    <button className="rounded-lg p-2 text-red-600 hover:bg-red-100" title="Smazat">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create new template card */}
      <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
        <div className="mx-auto max-w-md">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Plus className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">Vytvořte novou šablonu</h3>
          <p className="mb-6 text-gray-600">
            Navrhněte vlastní vzhled prezentací s vlastními barvami, fonty a pozadím
          </p>
          <Link href="/admin/templates/new" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            Vytvořit novou šablonu
          </Link>
        </div>
      </div>

      {/* Template guidelines */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
        <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-blue-900">
          <Palette className="h-5 w-5" />
          Pokyny pro šablony
        </h3>
        <ul className="space-y-2 text-blue-800">
          <li className="flex items-start gap-2">
            <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
            <span><strong>Jednolíté pozadí:</strong> Nejjednodušší varianta, vhodná pro čitelnost</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
            <span><strong>Přechodové pozadí:</strong> Moderní vzhled, vhodný pro firemní prezentace</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
            <span><strong>Obrázkové pozadí:</strong> Nejatraktivnější, ale vyžaduje kvalitní obrázky</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
            <span><strong>Kontrast textu:</strong> Zajistěte dostatečný kontrast mezi textem a pozadím</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
            <span><strong>Fonty:</strong> Používejte web-safe fonty nebo importujte z Google Fonts</span>
          </li>
        </ul>
      </div>
    </div>
  )
}