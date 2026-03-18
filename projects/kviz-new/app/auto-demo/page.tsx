// app/auto-demo/page.tsx
"use client"

import { useState, useEffect } from "react"
import { SimpleQuizPlayer } from "@/components/SimpleQuizPlayer"
import { SequenceGenerator } from "@/lib/sequence-generator"
import { DEFAULT_TEMPLATE } from "@/types/template"
import { Play, Pause, SkipBack, SkipForward, RefreshCw, Settings, Clock, Hash } from "lucide-react"

export default function AutoDemoPage() {
  const [sequence, setSequence] = useState(() => SequenceGenerator.createDemoSequence())
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentConfig, setCurrentConfig] = useState({
    showIntro: true,
    showSeparators: true,
    showOutro: true,
    autoAdvance: true,
    questionDuration: 10, // sekundy
    answerDuration: 8,    // sekundy
  })
  
  // Vytvořit novou sekvenci při změně konfigurace
  useEffect(() => {
    const newSequence = SequenceGenerator.createDemoSequence()
    setSequence(newSequence)
  }, [currentConfig])
  
  const handleConfigChange = (key: keyof typeof currentConfig, value: any) => {
    setCurrentConfig(prev => ({ ...prev, [key]: value }))
  }
  
  const handleRestart = () => {
    const newSequence = SequenceGenerator.createDemoSequence()
    setSequence(newSequence)
    setIsPlaying(false)
  }
  
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }
  
  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Hlavní obsah - kvíz */}
      <div className="h-screen">
        <SimpleQuizPlayer
          slides={sequence.slides}
          template={DEFAULT_TEMPLATE}
          autoPlay={isPlaying}
          showControls={false}
          className="w-full h-full"
          onQuizEnd={() => setIsPlaying(false)}
        />
      </div>
      
      {/* Ovládací panel */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-lg rounded-2xl p-4 border border-slate-700 shadow-2xl z-50">
        <div className="flex items-center gap-4">
          {/* Play/Pause */}
          <button
            onClick={handlePlayPause}
            className="p-3 rounded-xl bg-blue-600 hover:bg-blue-700 transition-colors"
            title={isPlaying ? "Pozastavit" : "Přehrát"}
          >
            {isPlaying ? <Pause size={20} className="text-white" /> : <Play size={20} className="text-white" />}
          </button>
          
          {/* Restart */}
          <button
            onClick={handleRestart}
            className="p-3 rounded-xl bg-amber-600 hover:bg-amber-700 transition-colors"
            title="Restart"
          >
            <RefreshCw size={20} className="text-white" />
          </button>
          
          {/* Info */}
          <div className="min-w-[180px] text-center text-white">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Hash size={16} className="text-slate-300" />
              <span className="font-semibold">
                {sequence.questionCount} otázek
              </span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Clock size={16} className="text-slate-300" />
              <span className="text-sm opacity-80">
                {formatTime(sequence.totalDuration)}
              </span>
            </div>
          </div>
          
          {/* Stav přehrávání */}
          <div className="flex items-center gap-2">
            <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: isPlaying ? '100%' : '0%' }}
              />
            </div>
            <span className="text-sm text-slate-300 min-w-[60px]">
              {isPlaying ? "Přehrává se..." : "Pozastaveno"}
            </span>
          </div>
        </div>
      </div>
      
      {/* Konfigurační panel */}
      <div className="fixed top-8 left-8 bg-black/60 backdrop-blur-lg rounded-2xl p-6 border border-slate-700 max-w-md z-50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Settings size={24} />
            Konfigurace
          </h2>
          <div className="text-sm text-slate-300 bg-slate-800 px-3 py-1 rounded-lg">
            Auto-demo
          </div>
        </div>
        
        <div className="space-y-4">
          {/* Časování */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Časování</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-slate-300 mb-1">
                  Otázka (s)
                </label>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="1"
                  value={currentConfig.questionDuration}
                  onChange={(e) => handleConfigChange('questionDuration', parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="text-center text-sm text-slate-400">
                  {currentConfig.questionDuration}s
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-slate-300 mb-1">
                  Odpověď (s)
                </label>
                <input
                  type="range"
                  min="3"
                  max="20"
                  step="1"
                  value={currentConfig.answerDuration}
                  onChange={(e) => handleConfigChange('answerDuration', parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="text-center text-sm text-slate-400">
                  {currentConfig.answerDuration}s
                </div>
              </div>
            </div>
          </div>
          
          {/* Průběh */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Průběh</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentConfig.showIntro}
                  onChange={(e) => handleConfigChange('showIntro', e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-slate-300">Zobrazit úvod</span>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentConfig.showSeparators}
                  onChange={(e) => handleConfigChange('showSeparators', e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-slate-300">Zobrazit oddělovače</span>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentConfig.showOutro}
                  onChange={(e) => handleConfigChange('showOutro', e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-slate-300">Zobrazit závěr</span>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentConfig.autoAdvance}
                  onChange={(e) => handleConfigChange('autoAdvance', e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-slate-300">Automatické přehrávání</span>
              </label>
            </div>
          </div>
          
          {/* Statistiky */}
          <div className="pt-4 border-t border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-2">Statistiky</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/50 rounded-lg p-3">
                <div className="text-sm text-slate-400">Otázek</div>
                <div className="text-2xl font-bold text-white">{sequence.questionCount}</div>
              </div>
              
              <div className="bg-slate-800/50 rounded-lg p-3">
                <div className="text-sm text-slate-400">Délka</div>
                <div className="text-2xl font-bold text-white">{formatTime(sequence.totalDuration)}</div>
              </div>
              
              <div className="bg-slate-800/50 rounded-lg p-3">
                <div className="text-sm text-slate-400">Slidů</div>
                <div className="text-2xl font-bold text-white">{sequence.slides.length}</div>
              </div>
              
              <div className="bg-slate-800/50 rounded-lg p-3">
                <div className="text-sm text-slate-400">Kol</div>
                <div className="text-2xl font-bold text-white">{sequence.roundCount}</div>
              </div>
            </div>
          </div>
          
          {/* Info */}
          <div className="text-sm text-slate-400 pt-4 border-t border-slate-700">
            <p className="mb-2">
              <strong>Auto-demo</strong> ukazuje plně automatický průběh kvízu s generátorem sekvencí.
            </p>
            <ul className="space-y-1">
              <li>• Všechny typy otázek (jednoduché, ABCD, bonus, audio, video)</li>
              <li>• Automatické časování a přechody</li>
              <li>• Konfigurovatelné délky zobrazení</li>
              <li>• Intro/separátory/outro slid(y)</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Seznam slidů */}
      <div className="fixed top-8 right-8 bg-black/60 backdrop-blur-lg rounded-2xl p-4 border border-slate-700 max-w-xs z-50">
        <h3 className="text-lg font-semibold text-white mb-3">Sekvence slidů</h3>
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {sequence.slides.map((slide, index) => (
            <div
              key={slide.id}
              className="px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-white">
                  {index + 1}. {slide.type === 'intro' && 'Úvod'}
                  {slide.type === 'question' && `Otázka ${slide.question?.questionNumber || ''}`}
                  {slide.type === 'separator' && 'Oddělovač'}
                  {slide.type === 'outro' && 'Závěr'}
                </span>
                <span className="text-xs text-slate-400">
                  {Math.round(slide.duration / 1000)}s
                </span>
              </div>
              {slide.type === 'question' && slide.question && (
                <div className="text-xs text-slate-300 truncate">
                  {slide.question.text.substring(0, 40)}...
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}