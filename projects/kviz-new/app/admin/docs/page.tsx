'use client'

import { useState } from 'react'
import { AdminPageHeader } from '@/components/AdminLayoutDark'
import { Volume2, Video, ImageIcon, Layers, BookOpen } from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────────

type Tab = 'media' | 'architecture' | 'api' | 'templates'

// ── Helpers ────────────────────────────────────────────────────────────────────

function Code({ children }: { children: string }) {
  return (
    <span className="font-mono text-violet-300 text-xs bg-violet-500/10 px-1.5 py-0.5 rounded">
      {children}
    </span>
  )
}

function Strong({ children }: { children: string }) {
  return <span className="text-white font-semibold">{children}</span>
}

// ── Doc card ───────────────────────────────────────────────────────────────────

function DocCard({
  icon: Icon,
  iconColor,
  name,
  subtitle,
  children,
}: {
  icon: React.ElementType
  iconColor: string
  name: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-[#191b2e] border border-white/[0.08] rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-xl bg-white/[0.05]`}>
          <Icon size={20} className={iconColor} />
        </div>
        <div>
          <p className="text-white font-bold text-base leading-tight">{name}</p>
          <p className="text-gray-400 text-sm leading-tight">{subtitle}</p>
        </div>
      </div>
      <div className="text-sm text-gray-300 leading-relaxed space-y-2">
        {children}
      </div>
    </div>
  )
}

// ── Empty placeholder ─────────────────────────────────────────────────────────

function EmptyTab() {
  return (
    <div className="flex items-center justify-center py-24">
      <p className="text-gray-500 text-sm">Připravujeme…</p>
    </div>
  )
}

// ── Tab: Mediální komponenty ───────────────────────────────────────────────────

function MediaTab() {
  return (
    <div className="grid gap-5">

      {/* Audio otázka */}
      <DocCard
        icon={Volume2}
        iconColor="text-cyan-400"
        name="Audio otázka"
        subtitle="Přehrávání zvukového souboru s moderátorskou kontrolou"
      >
        <p>
          Přehrávač je vždy viditelný (<Strong>fáze 0</Strong>). Moderátor spouští přehrávání ručně
          přímo v přehrávači.
        </p>
        <p>
          <Strong>Před oddělovačem</Strong> (<Code>noAnswerPhase=true</Code>): <Code>maxPhase=0</Code> —
          zobrazí se text otázky + přehrávač, kliknutí Vpřed přejde na další slide,
          odpověď se nezobrazuje.
        </p>
        <p>
          <Strong>Po oddělovači</Strong> (<Code>noAnswerPhase=false</Code>): <Code>maxPhase=1</Code> —
          kliknutím Vpřed se zobrazí správná odpověď.
        </p>
        <p>
          <Strong>Divácká stránka</Strong> (<Code>/start</Code>, <Code>/watch</Code>): stejné chování
          bez možnosti interakce.
        </p>
      </DocCard>

      {/* Video otázka */}
      <DocCard
        icon={Video}
        iconColor="text-pink-400"
        name="Video otázka"
        subtitle="Fullscreen video modal s automatickým zavřením"
      >
        <p>
          Náhled videa (thumbnail) je vždy viditelný jako{' '}
          <Code>{'<video preload="auto" muted>'}</Code> — video se načítá do cache okamžitě
          po spuštění kvízu.
        </p>
        <p>
          <Strong>Před oddělovačem:</Strong>{' '}
          <Strong>1. stisk</Strong> tlačítka Vpřed = otevře video fullscreen modal (<Code>autoPlay</Code>).
          Video se po skončení zavře automaticky (<Code>onEnded</Code>). Alternativně křížek
          v pravém horním rohu.{' '}
          <Strong>2. stisk</Strong> Vpřed (po uzavření videa) = přechod na další slide.
          Moderátor tak může video přeskočit.
        </p>
        <p>
          <Strong>Po oddělovači:</Strong> <Code>maxPhase=1</Code> — kliknutím Vpřed se zobrazí
          správná odpověď, video se nespouští.
        </p>
        <p>
          <Strong>Divácká stránka:</Strong> thumbnail viditelný, odpověď se zobrazí po synchronizaci
          se stavem moderátora.
        </p>
      </DocCard>

      {/* Obrázková otázka */}
      <DocCard
        icon={ImageIcon}
        iconColor="text-rose-400"
        name="Obrázková otázka"
        subtitle="Fullscreen modal pro zobrazení obrázku"
      >
        <p>Náhled obrázku vždy viditelný.</p>
        <p>
          Tlačítko <Strong>Maximalizovat</Strong> (ikona <Code>Maximize2</Code>) v rohu obrázku otevře
          fullscreen modal — obrázek se responzivně roztáhne na celou obrazovku.
          Fullscreen se zavírá křížkem nebo kliknutím na pozadí.
        </p>
        <p>
          <Strong>Před oddělovačem:</Strong> <Code>maxPhase=0</Code>, odpověď se nezobrazuje.
        </p>
        <p>
          <Strong>Po oddělovači:</Strong> <Code>maxPhase=1</Code> — kliknutím Vpřed se zobrazí
          správná odpověď.
        </p>
      </DocCard>

      {/* Oddělovač */}
      <DocCard
        icon={Layers}
        iconColor="text-violet-400"
        name="Oddělovač (Separator)"
        subtitle="Klíčový prvek sekvence kvízu oddělující prezentaci od odhalování odpovědí"
      >
        <p>Klíčový prvek sekvence kvízu.</p>
        <p>
          Otázky <Strong>před oddělovačem</Strong>: <Code>noAnswerPhase=true</Code>,{' '}
          <Code>maxPhase=0</Code> — prezentují se pouze otázky bez odpovědí.
        </p>
        <p>
          Po průchodu oddělovačem: <Code>buildSlides()</Code> vloží{' '}
          <Strong>duplikáty otázek aktuální sekce</Strong> s <Code>noAnswerPhase=false</Code> —
          moderátor je prochází a odhaluje odpovědi.
        </p>
        <p>
          <Strong>Důležité:</Strong> opakují se POUZE otázky od posledního oddělovače
          (nebo začátku), ne z celé historie kvízu.
        </p>
        <p>
          Slide oddělovače sám zobrazuje pouze pozadí šablony a volitelný nadpis
          (žádné dekorativní linky).
        </p>
      </DocCard>

    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string }[] = [
  { id: 'media',        label: 'Mediální komponenty' },
  { id: 'architecture', label: 'Architektura' },
  { id: 'api',          label: 'API' },
  { id: 'templates',    label: 'Šablony' },
]

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('media')

  return (
    <div className="min-h-screen bg-[#0d0f1e]">
      <AdminPageHeader
        title="Dokumentace"
        subtitle="Technický popis systému"
        breadcrumb="Dokumentace"
      />

      <div className="px-8 py-6">
        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium transition-all duration-150
                  ${isActive
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/40'
                    : 'bg-transparent border border-white/[0.12] text-gray-400 hover:text-white hover:border-white/25'
                  }
                `}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab content */}
        {activeTab === 'media'        && <MediaTab />}
        {activeTab === 'architecture' && <EmptyTab />}
        {activeTab === 'api'          && <EmptyTab />}
        {activeTab === 'templates'    && <EmptyTab />}
      </div>
    </div>
  )
}
