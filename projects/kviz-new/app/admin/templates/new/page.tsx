// app/admin/templates/new/page.tsx - Vytvoření nové šablony
"use client"

import { useState } from "react"
import { ArrowLeft, Save, Eye, Palette, Type, Image } from "lucide-react"
import Link from "next/link"

export default function NewTemplatePage() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    backgroundType: "solid" as "solid" | "gradient" | "image",
    backgroundColor: "#3b82f6",
    backgroundColor2: "#1d4ed8",
    backgroundImage: "",
    primaryColor: "#3b82f6",
    textColor: "#1f2937",
    accentColor: "#10b981",
    fontFamily: "Inter",
    fontSize: "16px",
    borderRadius: "8px",
  })

  const [preview, setPreview] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert(`Šablona "${formData.name}" byla uložena (demo - zatím bez databáze)`)
    // TODO: Uložit do databáze
  }

  const fontFamilies = [
    "Inter", "Roboto", "Open Sans", "Montserrat", "Poppins", 
    "Lato", "Source Sans Pro", "Nunito", "Raleway", "Merriweather"
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/templates" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2">
            <ArrowLeft className="h-4 w-4" />
            Zpět na šablony
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Vytvořit novou šablonu</h1>
          <p className="text-gray-600">Nastavte vzhled prezentací kvízů</p>
        </div>
        
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setPreview(!preview)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Eye className="h-4 w-4" />
            {preview ? "Skrýt náhled" : "Zobrazit náhled"}
          </button>
          
          <button
            type="submit"
            form="template-form"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Save className="h-4 w-4" />
            Uložit šablonu
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulář */}
        <div className="space-y-6">
          <form id="template-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Základní informace */}
            <div className="rounded border bg-white p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Základní informace
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Název šablony *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Např. Modrý gradient"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Popis
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Popis šablony a její použití..."
                  />
                </div>
              </div>
            </div>

            {/* Pozadí */}
            <div className="rounded border bg-white p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Image className="h-5 w-5" />
                Pozadí
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Typ pozadí
                  </label>
                  <div className="flex gap-3">
                    {[
                      { value: "solid", label: "Jednolité", icon: <div className="h-4 w-4 rounded bg-blue-500" /> },
                      { value: "gradient", label: "Přechod", icon: <div className="h-4 w-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded" /> },
                      { value: "image", label: "Obrázek", icon: <Image className="h-4 w-4" /> },
                    ].map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, backgroundType: type.value as any }))}
                        className={`flex-1 flex flex-col items-center justify-center p-4 border rounded-lg ${
                          formData.backgroundType === type.value
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="mb-2">{type.icon}</div>
                        <span className="text-sm font-medium">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {formData.backgroundType === "solid" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Barva pozadí
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="color"
                        name="backgroundColor"
                        value={formData.backgroundColor}
                        onChange={handleChange}
                        className="h-10 w-20 cursor-pointer"
                      />
                      <input
                        type="text"
                        name="backgroundColor"
                        value={formData.backgroundColor}
                        onChange={handleChange}
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm"
                      />
                    </div>
                  </div>
                )}

                {formData.backgroundType === "gradient" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        První barva
                      </label>
                      <div className="flex gap-3">
                        <input
                          type="color"
                          name="backgroundColor"
                          value={formData.backgroundColor}
                          onChange={handleChange}
                          className="h-10 w-20 cursor-pointer"
                        />
                        <input
                          type="text"
                          name="backgroundColor"
                          value={formData.backgroundColor}
                          onChange={handleChange}
                          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Druhá barva
                      </label>
                      <div className="flex gap-3">
                        <input
                          type="color"
                          name="backgroundColor2"
                          value={formData.backgroundColor2}
                          onChange={handleChange}
                          className="h-10 w-20 cursor-pointer"
                        />
                        <input
                          type="text"
                          name="backgroundColor2"
                          value={formData.backgroundColor2}
                          onChange={handleChange}
                          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {formData.backgroundType === "image" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      URL obrázku
                    </label>
                    <input
                      type="url"
                      name="backgroundImage"
                      value={formData.backgroundImage}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      placeholder="https://example.com/background.jpg"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Barvy a typografie */}
            <div className="rounded border bg-white p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Type className="h-5 w-5" />
                Barvy a typografie
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hlavní barva
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      name="primaryColor"
                      value={formData.primaryColor}
                      onChange={handleChange}
                      className="h-10 w-20 cursor-pointer"
                    />
                    <input
                      type="text"
                      name="primaryColor"
                      value={formData.primaryColor}
                      onChange={handleChange}
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Barva textu
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      name="textColor"
                      value={formData.textColor}
                      onChange={handleChange}
                      className="h-10 w-20 cursor-pointer"
                    />
                    <input
                      type="text"
                      name="textColor"
                      value={formData.textColor}
                      onChange={handleChange}
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Akcentová barva
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      name="accentColor"
                      value={formData.accentColor}
                      onChange={handleChange}
                      className="h-10 w-20 cursor-pointer"
                    />
                    <input
                      type="text"
                      name="accentColor"
                      value={formData.accentColor}
                      onChange={handleChange}
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Font
                  </label>
                  <select
                    name="fontFamily"
                    value={formData.fontFamily}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  >
                    {fontFamilies.map(font => (
                      <option key={font} value={font}>{font}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Náhled */}
        {preview && (
          <div className="space-y-6">
            <div className="rounded border bg-white p-6">
              <h2 className="text-lg font-semibold mb-4">Náhled šablony</h2>
              
              <div 
                className="rounded-lg p-8 min-h-[400px] flex flex-col justify-between"
                style={{
                  background: formData.backgroundType === "solid" 
                    ? formData.backgroundColor
                    : formData.backgroundType === "gradient"
                    ? `linear-gradient(135deg, ${formData.backgroundColor}, ${formData.backgroundColor2})`
                    : `url(${formData.backgroundImage}) center/cover`,
                  color: formData.textColor,
                  fontFamily: formData.fontFamily,
                }}
              >
                <div>
                  <h3 
                    className="text-2xl font-bold mb-4"
                    style={{ color: formData.primaryColor }}
                  >
                    Ukázková otázka
                  </h3>
                  
                  <p className="text-lg mb-6">
                    Které pivo vaří pivovar Pilsner Urquell?
                  </p>

                  <div className="space-y-3">
                    {["Pilsner Urquell", "Budweiser Budvar", "Staropramen", "Kozel"].map((option, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-lg border"
                        style={{
                          borderColor: formData.accentColor,
                          backgroundColor: i === 0 ? `${formData.accentColor}20` : 'transparent',
                        }}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center mt-8 pt-6 border-t" style={{ borderColor: formData.accentColor }}>
                  <div className="text-sm">Kolo 1 • Otázka 5/20</div>
                  <div 
                    className="px-4 py-2 rounded-lg font-medium"
                    style={{
                      backgroundColor: formData.primaryColor,
                      color: '#ffffff',
                    }}
                  >
                    Další otázka
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-sm text-gray-600">Typ pozadí</div>
                  <div className="font-medium">{formData.backgroundType === "solid" ? "Jednolité" : formData.backgroundType === "gradient" ? "Přechod" : "Obrázek"}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600">Hlavní barva</div>
                  <div className="font-medium font-mono">{formData.primaryColor}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600">Barva textu</div>
                  <div className="font-medium font-mono">{formData.textColor}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600">Font</div>
                  <div className="font-medium">{formData.fontFamily}</div>
                </div>
              </div>
            </div>

            <div className="rounded border bg-white p-6">
              <h3 className="text-lg font-semibold mb-4">CSS proměnné</h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`:root {
  --template-background: ${formData.backgroundType === "solid" ? formData.backgroundColor : formData.backgroundType === "gradient" ? `linear-gradient(135deg, ${formData.backgroundColor}, ${formData.backgroundColor2})` : `url(${formData.backgroundImage})`};
  --template-primary: ${formData.primaryColor};
  --template-text: ${formData.textColor};
  --template-accent: ${formData.accentColor};
  --template-font: "${formData.fontFamily}", sans-serif;
  --template-border-radius: ${formData.borderRadius};
}`}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}