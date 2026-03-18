// app/export/page.tsx
"use client"

import { useState, useEffect } from "react"
import { PPTXExporter, ExportResult } from "@/lib/export/pptx-exporter"
import { PDFExporter, PDFExportResult } from "@/lib/export/pdf-exporter"
import { QuestionData } from "@/components/universal-quiz-renderer"
import { Download, FileText, Presentation, Settings, Check, X, Loader2, FileDown, BarChart } from "lucide-react"

const DEMO_QUESTIONS: QuestionData[] = [
  {
    id: 'export-1',
    text: 'Jaké je hlavní město České republiky?',
    type: 'simple',
    correctAnswer: 'Praha',
    questionNumber: 1,
    roundNumber: 1,
    category: 'Zeměpis',
    difficulty: 'easy',

  },
  {
    id: 'export-2',
    text: 'Který z těchto jazyků je programovací jazyk?',
    type: 'abcdef',
    options: [
      { label: 'A', text: 'Python', isCorrect: true },
      { label: 'B', text: 'Francouzština' },
      { label: 'C', text: 'HTML' },
      { label: 'D', text: 'CSS' },
      { label: 'E', text: 'JavaScript', isCorrect: true },
      { label: 'F', text: 'Ruský' }
    ],
    questionNumber: 2,
    roundNumber: 1,
    category: 'Informatika',
    difficulty: 'medium'
  },
  {
    id: 'export-3',
    text: 'Bonusová otázka: Uveďte 3 barvy české vlajky',
    type: 'bonus',
    bonusAnswers: ['Bílá', 'Červená', 'Modrá'],
    questionNumber: 3,
    roundNumber: 1,
    category: 'Vlastenectví',
    difficulty: 'easy'
  },
  {
    id: 'export-4',
    text: 'Poslechněte si tuto píseň a uhodněte interpreta',
    type: 'audio',
    correctAnswer: 'Karel Gott',
    questionNumber: 4,
    roundNumber: 2,
    category: 'Hudba',
    difficulty: 'hard',
    mediaUrl: 'https://example.com/audio.mp3',
    mediaType: 'audio'
  },
  {
    id: 'export-5',
    text: 'Podívejte se na video a uhodněte, o jaký film se jedná',
    type: 'video',
    correctAnswer: 'Pelíšky',
    questionNumber: 5,
    roundNumber: 2,
    category: 'Film',
    difficulty: 'medium',
    mediaUrl: 'https://example.com/video.mp4',
    mediaType: 'video',
    thumbnailUrl: 'https://example.com/thumbnail.jpg'
  }
]

type ExportType = 'pptx' | 'pdf'
type ExportStatus = 'idle' | 'exporting' | 'success' | 'error'

export default function ExportPage() {
  const [exportType, setExportType] = useState<ExportType>('pptx')
  const [exportStatus, setExportStatus] = useState<ExportStatus>('idle')
  const [lastExport, setLastExport] = useState<ExportResult | PDFExportResult | null>(null)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  
  // Export options
  const [options, setOptions] = useState({
    title: 'Můj Kvíz',
    author: 'Hospodský Kvíz System',
    includeAnswers: true,
    includeNotes: true,
    theme: 'colorful' as 'light' | 'dark' | 'colorful',
    slideSize: '16:9' as '4:3' | '16:9' | 'widescreen',
    pageSize: 'A4' as 'A4' | 'A3' | 'letter',
    orientation: 'portrait' as 'portrait' | 'landscape'
  })
  
  // Cleanup download URL on unmount
  useEffect(() => {
    return () => {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl)
      }
    }
  }, [downloadUrl])
  
  const handleExport = async () => {
    setExportStatus('exporting')
    
    try {
      let result: ExportResult | PDFExportResult
      
      if (exportType === 'pptx') {
        const exporter = new PPTXExporter({
          title: options.title,
          author: options.author,
          theme: options.theme,
          includeAnswers: options.includeAnswers,
          includeNotes: options.includeNotes,
          slideSize: options.slideSize
        })
        
        result = await exporter.exportQuiz(DEMO_QUESTIONS, {
          title: options.title,
          subtitle: 'Exportovaný kvíz',
          defaultQuestionDuration: 10000,
          defaultAnswerDuration: 8000,
          introDuration: 5000,
          separatorDuration: 3000,
          outroDuration: 5000,
          showIntro: true,
          showSeparators: true,
          showOutro: true,
          autoAdvance: true,
          rounds: [{
            number: 1,
            name: 'Exportované kolo',
            questions: DEMO_QUESTIONS
          }]
        })
      } else {
        const exporter = new PDFExporter({
          title: options.title,
          author: options.author,
          includeAnswers: options.includeAnswers,
          includeQuestions: true,
          pageSize: options.pageSize,
          orientation: options.orientation,
          margin: 20,
          quality: 0.95
        })
        
        result = await exporter.exportFromData(DEMO_QUESTIONS)
      }
      
      setLastExport(result)
      
      if (result.success && result.downloadUrl) {
        setDownloadUrl(result.downloadUrl)
        setExportStatus('success')
        
        // Automatický download
        const link = document.createElement('a')
        link.href = result.downloadUrl
        link.download = result.fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        setExportStatus('error')
      }
    } catch (error) {
      console.error('Export failed:', error)
      setExportStatus('error')
    }
  }
  
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Export Kvízu</h1>
          <p className="text-slate-300">
            Generujte prezentace a dokumenty z vašich kvízů
          </p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Hlavní ovládací panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Výběr typu exportu */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Download size={24} className="text-blue-400" />
                Typ exportu
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setExportType('pptx')}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    exportType === 'pptx'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
                  }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <Presentation size={40} className={
                      exportType === 'pptx' ? 'text-blue-400' : 'text-slate-400'
                    } />
                    <div className="text-center">
                      <div className="text-lg font-semibold">PPTX Prezentace</div>
                      <div className="text-sm text-slate-400 mt-1">
                        PowerPoint prezentace s slid(y)
                      </div>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => setExportType('pdf')}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    exportType === 'pdf'
                      ? 'border-red-500 bg-red-500/10'
                      : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
                  }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <FileText size={40} className={
                      exportType === 'pdf' ? 'text-red-400' : 'text-slate-400'
                    } />
                    <div className="text-center">
                      <div className="text-lg font-semibold">PDF Dokument</div>
                      <div className="text-sm text-slate-400 mt-1">
                        Tisknutelný dokument s otázkami
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
            
            {/* Nastavení */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Settings size={24} className="text-amber-400" />
                Nastavení exportu
              </h2>
              
              <div className="space-y-6">
                {/* Základní nastavení */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Základní</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-300 mb-2">
                        Název prezentace
                      </label>
                      <input
                        type="text"
                        value={options.title}
                        onChange={(e) => setOptions({ ...options, title: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
                        placeholder="Můj Kvíz"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-slate-300 mb-2">
                        Autor
                      </label>
                      <input
                        type="text"
                        value={options.author}
                        onChange={(e) => setOptions({ ...options, author: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
                        placeholder="Hospodský Kvíz System"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Volby */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Volby</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={options.includeAnswers}
                        onChange={(e) => setOptions({ ...options, includeAnswers: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-slate-300">Zahrnout správné odpovědi</span>
                    </label>
                    
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={options.includeNotes}
                        onChange={(e) => setOptions({ ...options, includeNotes: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-slate-300">Zahrnout poznámky</span>
                    </label>
                  </div>
                </div>
                
                {/* Formát */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Formát</h3>
                  {exportType === 'pptx' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-slate-300 mb-2">
                          Téma
                        </label>
                        <select
                          value={options.theme}
                          onChange={(e) => setOptions({ ...options, theme: e.target.value as any })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
                        >
                          <option value="colorful">Barevné</option>
                          <option value="light">Světlé</option>
                          <option value="dark">Tmavé</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm text-slate-300 mb-2">
                          Velikost slidů
                        </label>
                        <select
                          value={options.slideSize}
                          onChange={(e) => setOptions({ ...options, slideSize: e.target.value as any })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
                        >
                          <option value="16:9">16:9 (širokoúhlé)</option>
                          <option value="4:3">4:3 (standardní)</option>
                          <option value="widescreen">Widescreen</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-slate-300 mb-2">
                          Velikost stránky
                        </label>
                        <select
                          value={options.pageSize}
                          onChange={(e) => setOptions({ ...options, pageSize: e.target.value as any })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
                        >
                          <option value="A4">A4</option>
                          <option value="A3">A3</option>
                          <option value="letter">Letter</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm text-slate-300 mb-2">
                          Orientace
                        </label>
                        <select
                          value={options.orientation}
                          onChange={(e) => setOptions({ ...options, orientation: e.target.value as any })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
                        >
                          <option value="portrait">Na výšku</option>
                          <option value="landscape">Na šířku</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Tlačítko exportu */}
            <button
              onClick={handleExport}
              disabled={exportStatus === 'exporting'}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-2xl text-lg flex items-center justify-center gap-3 transition-all"
            >
              {exportStatus === 'exporting' ? (
                <>
                  <Loader2 size={24} className="animate-spin" />
                  Generuji {exportType === 'pptx' ? 'PPTX' : 'PDF'}...
                </>
              ) : (
                <>
                  <FileDown size={24} />
                  Exportovat {exportType === 'pptx' ? 'PPTX prezentaci' : 'PDF dokument'}
                </>
              )}
            </button>
          </div>
          
          {/* Sidebar - Náhled a výsledky */}
          <div className="space-y-6">
            {/* Náhled otázek */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <BarChart size={24} className="text-green-400" />
                Náhled otázek
              </h2>
              
              <div className="space-y-3">
                {DEMO_QUESTIONS.map((question, index) => (
                  <div
                    key={question.id}
                    className="p-3 rounded-lg bg-slate-900/50 border border-slate-700"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className="font-medium text-white">
                        {index + 1}. {question.type}
                      </span>
                      <span className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-300">
                        {question.category}
                      </span>
                    </div>
                    <div className="text-sm text-slate-300 truncate">
                      {question.text}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-700">
                <div className="text-sm text-slate-400">
                  <div className="flex justify-between">
                    <span>Celkem otázek:</span>
                    <span className="font-semibold">{DEMO_QUESTIONS.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Typy otázek:</span>
                    <span className="font-semibold">
                      {Array.from(new Set(DEMO_QUESTIONS.map(q => q.type))).join(', ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Výsledek exportu */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
              <h2 className="text-2xl font-bold mb-4">Výsledek</h2>
              
              {exportStatus === 'idle' && (
                <div className="text-center py-8">
                  <div className="text-slate-400 mb-2">
                    Zatím nebyl proveden žádný export
                  </div>
                  <div className="text-sm text-slate-500">
                    Nastavte parametry a klikněte na "Exportovat"
                  </div>
                </div>
              )}
              
              {exportStatus === 'exporting' && (
                <div className="text-center py-8">
                  <Loader2 size={48} className="animate-spin mx-auto text-blue-400 mb-4" />
                  <div className="text-slate-300 font-medium">
                    Probíhá generování {exportType === 'pptx' ? 'PPTX' : 'PDF'}...
                  </div>
                  <div className="text-sm text-slate-500 mt-2">
                    Prosím čekejte
                  </div>
                </div>
              )}
              
              {exportStatus === 'success' && lastExport && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2 text-green-400 mb-4">
                    <Check size={24} />
                    <span className="font-semibold">Export úspěšný!</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Soubor:</span>
                      <span className="font-mono text-sm">{lastExport.fileName}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-slate-400">Velikost:</span>
                      <span className="font-semibold">{formatFileSize(lastExport.fileSize)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-slate-400">
                        {exportType === 'pptx' ? 'Slidů:' : 'Stránek:'}
                      </span>
                      <span className="font-semibold">
                        {'slideCount' in lastExport ? lastExport.slideCount : lastExport.pageCount}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-slate-400">Stav:</span>
                      <span className="text-green-400 font-semibold">✓ Úspěšně staženo</span>
                    </div>
                  </div>
                  
                  {downloadUrl && (
                    <a
                      href={downloadUrl}
                      download={lastExport.fileName}
                      className="block mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg text-center transition-colors"
                    >
                      <Download size={16} className="inline mr-2" />
                      Stáhnout znovu
                    </a>
                  )}
                </div>
              )}
              
              {exportStatus === 'error' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2 text-red-400 mb-4">
                    <X size={24} />
                    <span className="font-semibold">Export selhal</span>
                  </div>
                  
                  <div className="text-slate-300">
                    Při exportu došlo k chybě. Zkuste to prosím znovu.
                  </div>
                  
                  {lastExport?.error && (
                    <div className="bg-red-900/30 border border-red-800 rounded-lg p-3">
                      <div className="text-sm text-red-300 font-mono">
                        {lastExport.error}
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={handleExport}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Zkusit znovu
                  </button>
                </div>
              )}
            </div>
            
            {/* Info */}
            <div className="bg-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold mb-3">Informace</h3>
              <div className="space-y-3 text-sm text-slate-400">
                <p>
                  <strong className="text-white">PPTX export</strong> vytváří PowerPoint prezentaci s profesionálním designem.
                </p>
                <p>
                  <strong className="text-white">PDF export</strong> generuje tisknutelný dokument s otázkami a odpověďmi.
                </p>
                <p>
                  Export používá demo data. V produkční verzi budou exportována skutečná data kvízu.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-8 text-center text-slate-400 text-sm">
          <p>
            Exportní modul • Hospodský Kvíz System • Verze 1.0.0
          </p>
          <p className="mt-2">
            Podporované formáty: PPTX (PowerPoint), PDF (Adobe Acrobat)
          </p>
        </div>
      </div>
    </div>
  )
}