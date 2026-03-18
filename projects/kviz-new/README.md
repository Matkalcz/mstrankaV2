# Kviz New - Nový hospodský kvízový systém

## Cíl
Vytvořit moderní, jednoduchý a robustní systém pro hospodské kvízy s automatickým řízením průběhu.

## Architektura

### 1. Univerzální renderovací engine
- Jedna React komponenta pro všechny typy otázek
- CSS-based rendering (žádné PDF canvas problémy)
- Konfigurovatelná šablona (pozadí, barvy, fonty)

### 2. Automatické řízení průběhu
- Žádné klikání moderátora na "zobraz odpověď"
- Oddělovač spouští sekvenci odhalování odpovědí
- Přechody: otázka → odpověď (s možností animací)

### 3. Typy otázek
- **Jednoduchá otázka**: otázka → červená odpověď
- **ABCD otázka**: otázka + možnosti → zvýrazněná správná
- **Bonusová otázka**: otázka → postupně odhalované odpovědi
- **Audio otázka**: otázka → přehrát audio → odpověď
- **Video otázka**: otázka + náhled → fullscreen video → odpověď

### 4. Export
- **PPTX** (preferováno) pomocí pptxgenjs
- **PDF** (fallback)
- Jeden soubor obsahující celý kvíz

## Technický stack
- **Frontend**: Next.js 15 + React + TypeScript + Tailwind CSS
- **Backend**: Convex (cloud database + functions)
- **Export**: pptxgenjs pro PPTX, možná Puppeteer pro PDF
- **Styling**: CSS-in-JS (emotion/styled-components) nebo vanilla CSS

## Struktura projektu
```
kviz-new/
├── app/                    # Next.js app router
│   ├── demo/              # Demo stránka
│   ├── quiz/[id]/         # Veřejné zobrazení kvízu
│   └── admin/             # Admin rozhraní
├── components/            # React komponenty
│   ├── universal-quiz-renderer.tsx
│   ├── quiz-controller.tsx
│   └── template-editor.tsx
├── lib/                   # Utility funkce
│   ├── sequence-generator.ts
│   ├── pptx-generator.ts
│   └── template-utils.ts
├── types/                 # TypeScript typy
│   └── template.ts
└── convex/               # Convex backend funkce
```

## Vývojový plán

### Fáze 1: Základní renderovací engine
- [ ] Vytvořit TemplateConfig typy
- [ ] Implementovat UniversalQuizRenderer
- [ ] Vytvořit demo se všemi typy otázek

### Fáze 2: Automatické řízení
- [ ] Implementovat QuizController
- [ ] Vytvořit SequenceGenerator
- [ ] Přidat oddělovač a automatické přechody

### Fáze 3: Export
- [ ] Implementovat PPTX generátor
- [ ] Přidat PDF export (fallback)
- [ ] Testovat s reálnými daty

### Fáze 4: Admin rozhraní
- [ ] Přidat jednoduchý editor šablon
- [ ] Přidat správu kvízů
- [ ] Přidat generování prezentací

### Fáze 5: Integrace a migrace
- [ ] Napojit na existující Convex backend
- [ ] Migrovat existující kvízy
- [ ] Testovat v produkci

## Spuštění vývoje

```bash
# Vytvořit Next.js projekt
npx create-next-app@latest . --typescript --tailwind --app --no-eslint

# Nainstalovat závislosti
npm install convex convex@canary @convex-dev/auth convex-generate
npm install pptxgenjs
npm install @emotion/react @emotion/styled

# Spustit vývojový server
npm run dev
```

## Odkazy
- [GitHub repo](https://github.com/matkalcz/kviz-new)
- [Zadání](ZADANI.md)
- [Demo](/demo)