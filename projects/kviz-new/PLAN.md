# Plán vývoje — Hospodský kvíz
**Autoritativní dokument. Přepis PLAN_VYVOJE.md. Datum: 17.3.2026**
**Pokud najdeš rozpor s jiným souborem, tento plán má přednost.**

---

## Aktuální stav infrastruktury (hotovo)
- ✅ Next.js 15 + TypeScript + Tailwind nasazeno na `kviz.michaljanda.com`
- ✅ SQLite databáze (`data/kviz.db`) s tabulkami: questions, categories, quizzes, templates, quiz_questions
- ✅ API routes: `GET/POST /api/questions`, `GET/PUT/DELETE /api/questions/[id]`, `GET/POST /api/quizzes`, `GET/PUT/DELETE /api/quizzes/[id]`, `GET/POST /api/categories`, `GET/PUT/DELETE /api/categories/[id]`
- ✅ Admin layout se sidebar navigací
- ✅ Dashboard s reálnými statistikami z DB
- ✅ Seznam otázek s mazáním, evropský formát data, ikonky akcí, tlačítko "Nová otázka"
- ✅ Nginx proxy → Next.js standalone na portu 3000
- ✅ **Formulář pro otázky** (`/admin/questions/new`) — všechny typy, create + edit mode

---

## Klíčová architektonická rozhodnutí

### Přehrávač — správná logika (ŽÁDNÝ auto-timing)
Moderátor **vždy kliká ručně**. Žádné automatické přechody stavů.

**Klik vpřed** způsobuje:
- Na otázce bez odpovědi → zobrazí odpověď
- Na otázce s odpovědí → přejde na další slide
- Na statické stránce → přejde na další slide

**Bonus odpovědi** — každý klik vpřed odhalí jednu další odpověď, teprve po odhalení všech přejde na další slide.

**Audio otázka — stavový stroj:**
```
SKRYTO → [klik vpřed] → TEXT OTÁZKY → [klik vpřed] → PŘEHRÁVÁ MP3
[klik zpět] → přehraje MP3 znovu od začátku
[klik vpřed po konci MP3] → přejde na další slide
```

**Video otázka — stavový stroj:**
```
SKRYTO → [klik vpřed] → TEXT + THUMBNAIL → [klik vpřed] → FULLSCREEN VIDEO
[video skončí] → zpět TEXT + THUMBNAIL (s tlačítkem "přehrát znovu")
[klik zpět] → přehraje video znovu fullscreen
[klik vpřed] → přejde na další slide
```

### Oddělovač — správná funkce
Oddělovač je **marker v sekvenci**, ne interaktivní prvek. Přehrávač při průchodu oddělovačem automaticky vloží za něj kopie všech otázek z aktuálního kola — tentokrát s odhalenými odpověďmi (`showAnswer: true`). Moderátor pak prochází odhaleními klikem.

### Typy slidů v sekvenci
```typescript
type SlideType =
  | 'page'         // Statická stránka (libovolný počet, libovolné pořadí)
  | 'round_start'  // Start kola: číslo kola + název + podnadpis
  | 'question'     // Otázka (jakéhokoli typu)
  | 'separator'    // Oddělovač — spouští replay kola s odpověďmi
```

### Komponenty — co zachovat, co smazat
- ✅ **UniversalQuizRenderer** — zachovat, opravit audio/video flow
- ✅ **SimpleQuizPlayer** — zachovat jako základ, refaktorovat
- ❌ **QuizController** — SMAZAT (horší duplicita SimpleQuizPlayer)
- ✅ **QuizRendererAdapter** — zachovat, rozšířit
- ❌ **SimpleQuizRenderer** — SMAZAT (nahrazen UniversalQuizRenderer)

---

## Fáze 1 — Formulář pro otázky ✅ HOTOVO (17.3.2026)
**Soubor:** `app/admin/questions/new/page.tsx` (nový) + úprava `app/admin/questions/page.tsx`

### Co vytvořit
Jeden formulář pro **všechny typy otázek** s dynamickými sekcemi podle zvoleného typu.

**Společná pole (všechny typy):**
- Text otázky (textarea)
- Typ otázky (select: simple / ab / abcdef / bonus / audio / video)
- Kategorie (select z `/api/categories`)
- Obtížnost (easy / medium / hard)
- Počet bodů

**Podmíněná pole dle typu:**
- `simple` → pole: Správná odpověď (text)
- `ab` / `abcdef` → dynamický seznam možností A–F, checkbox "správná" u každé
- `bonus` → seznam odpovědí (2–6), všechny jsou správné; kategorie se automaticky nastaví na "Bonusové otázky"
- `audio` → URL nebo upload MP3 + pole správná odpověď
- `video` → URL videa + pole správná odpověď

**Tlačítko Uložit** → POST `/api/questions`, přesměruje na seznam

**Tlačítko Upravit** v seznamu → formulář předvyplněný, PUT `/api/questions/[id]`

### API úpravy potřebné
- `POST /api/questions` — přijmout a uložit pole `options` jako JSON
- `PUT /api/questions/[id]` — update existující otázky

**Odhadovaná náročnost: 4–6 hodin**

---

## Fáze 2 — Správa kategorií a šablon ⚡ PRIORITA 1 (NEXT)

### Kategorie (`app/admin/categories/page.tsx`)
- Napojit na `/api/categories` (GET již funguje)
- Přidat POST pro vytvoření nové kategorie
- Přidat PUT `/api/categories/[id]` a DELETE
- Inline editace (name, color, description)
- Zajistit existenci kategorie "Bonusové otázky" (seed při startu)

### Šablony (`app/admin/templates/page.tsx`)
- Přidat POST `/api/templates`, PUT `/api/templates/[id]`
- Formulář šablony:
  - Název
  - Barva / obrázek pozadí (URL)
  - Barvy: text, akcent, správná odpověď, pozadí odpovědi
  - Font (rodina, velikost pro otázku / odpověď / číslo otázky)
  - Stránky šablony: libovolný počet pojmenovaných stránek s pozadím a textem
  - Jeden oddělovač (text + styl)
  - Start kola (formát textu)
- Live náhled šablony (miniatura vpravo)

**Odhadovaná náročnost: 3–5 hodin**

---

## Fáze 3 — Přehrávač ⚡ PRIORITA 3
**Soubory:** refaktor `components/SimpleQuizPlayer.tsx` + `components/UniversalQuizRenderer.tsx`

### 3.1 Opravit UniversalQuizRenderer
- Odstranit všechny `setTimeout` / `setInterval` pro posun stavu
- Audio: implementovat stavový stroj dle specifikace výše
- Video: implementovat stavový stroj + Fullscreen API (`videoEl.requestFullscreen()`)
- Bonus: klik = odhalit jednu další odpověď (ne timer)
- Přidat tlačítko **"Zobraz odpověď"** (viditelné jen na otázkách, mizí po odhalení)
- Správná odpověď v červené barvě ze šablony

### 3.2 Opravit SimpleQuizPlayer
- Odstranit Play/Pause logiku (není potřeba)
- Odstranit auto-timing (`setInterval` pro posun slidů)
- Přidat logiku **oddělovače** — při průchodu oddělovačem automaticky vložit replay slidů kola
- Přidat typ slidu `round_start` — zobrazit číslo kola, název, podnadpis
- Přidat typ slidu `page` — statická stránka s pozadím a textem ze šablony
- Klávesové zkratky zachovat: `→` / `Enter` = vpřed, `←` = zpět, `ESC` = konec
- Informační lišta pro moderátora (skrytá na TV): číslo slidu, typ, kolo

### 3.3 Smazat zbytečné soubory
```
components/QuizController.tsx       → SMAZAT
components/SimpleQuizRenderer.tsx   → SMAZAT
```

**Odhadovaná náročnost: 5–8 hodin**

---

## Fáze 4 — Sestavovač kvízu ⚡ PRIORITA 4
**Soubor:** `app/admin/quizzes/[id]/page.tsx` (editace) + nový builder

### Vizuální sekvence builder
Stránka editace kvízu má dva panely:

**Levý panel — paleta prvků:**
- Ze šablony: tlačítka pro přidání Stránka, Oddělovač, Start kola
- Otázky: tlačítko "Přidat otázku" → otevře modal

**Modal výběru otázky:**
- Filtr: kategorie (multiselect), obtížnost, typ, datum (od nejnovějších)
- Vyhledávání fulltextem
- Seznam otázek s preview textu
- Klik = přidá otázku do sekvence

**Pravý panel — sekvence:**
- Vertikální seznam slidů (drag-and-drop pořadí)
- Každý slide: ikona typu, název/text, tlačítko smazat
- Vizuální odlišení: stránky = šedá, otázky = modrá, oddělovač = oranžová, start kola = fialová
- Tlačítko "Spustit kvíz" → otevře `/play/[id]` v novém okně

### API potřebné
- `PUT /api/quizzes/[id]` — uložit sekvenci jako JSON
- `GET /api/quizzes/[id]` — načíst kvíz s celou sekvencí

**Odhadovaná náročnost: 6–10 hodin**

---

## Fáze 5 — Přehrávací stránka (public) + Divácký pohled + QR kód
**Soubory:** `app/play/[id]/page.tsx`, `app/watch/[id]/page.tsx`

### 5.1 Moderátorský přehrávač (`/play/[id]`)
- Načte kvíz z DB, sestaví sekvenci slidů (expanduje oddělovač → replay)
- Renderuje `SimpleQuizPlayer` na celou obrazovku
- Informační lišta pro moderátora (toggle skrytí klávesou `H`)
- Funguje i bez internetu (SQLite je lokální)
- Tlačítko **"Otevřít divácký pohled"** → otevře `/watch/[id]` v novém okně (`target="_blank"`)

### 5.2 Divácký pohled (`/watch/[id]`) — NOVÝ POŽADAVEK
- **Veřejná, fullscreen URL** bez jakýchkoliv ovladačů, sliderů ani admin prvků
- Zobrazuje totožný obsah jako moderátorský pohled (synchronizace přes polling nebo SSE)
- URL formát: `https://kviz.michaljanda.com/watch/[quiz-id]`
- Přístupná bez přihlášení — určena pro TV/projektor v místnosti
- Čistá prezentační vrstva: jen slide, žádné UI

### 5.3 QR kód na startovní stránce kvízu
- Na úvodním slidu kvízu (před první otázkou) se zobrazí QR kód s URL diváckého pohledu
- QR kód generován na klientu (knihovna `qrcode` nebo `qrcode.react`)
- Účel: diváci si naskenují a otevřou `/watch/[id]` na svém telefonu
- QR kód musí být dostatečně velký pro naskenování z dálky (min. 250×250 px)

### 5.4 Tlačítko ve výpisu kvízů (`/admin/quizzes`)
- Každý řádek kvízu ve výpisu má tlačítko **"▶ Spustit"** → otevře `/play/[id]` v novém okně
- Každý řádek má také tlačítko **"👁 Divák"** → otevře `/watch/[id]` v novém okně
- (Tlačítko ▶ Spustit již existuje — doplnit pouze divácký odkaz)

**Odhadovaná náročnost: 3–5 hodin**

---

## Fáze 6 — Export PPTX
**Soubor:** `lib/export/pptx-exporter.ts` + `app/api/export/route.ts`

- Generuje PPTX pomocí `pptxgenjs` (balíček již nainstalován)
- Jeden slide = jedna "fáze" otázky:
  - Simple: 2 slidy (otázka / otázka + červená odpověď)
  - ABCD: 2 slidy (otázka + možnosti / zvýrazněná správná)
  - Bonus: N+1 slidů (otázka / +1 odpověď / +2 odpovědí / ...)
  - Audio: 2 slidy (otázka / otázka + odpověď), MP3 jako příloha nebo odkaz
  - Video: 2 slidy (otázka + thumbnail / otázka + odpověď)
- Stylování ze šablony (barvy, font, pozadí)
- Download přes endpoint `/api/export?quizId=xxx&format=pptx`

**Odhadovaná náročnost: 4–6 hodin**

---

## Fáze 7 — Drobnosti a stabilizace
- Přihlašování do adminu (základní HTTP Basic auth nebo jednoduchý PIN)
- Záložní kopie DB (`scripts/backup-db.sh` již existuje)
- PM2 / systemd auto-restart po rebootu serveru
- 404 stránka pro neexistující kvízy

**Odhadovaná náročnost: 2–3 hodiny**

---

## Celkový odhad

| Fáze | Název | Odhad hodin | Priorita |
|------|-------|-------------|----------|
| 1 | Formulář otázek | 4–6 h | ✅ Hotovo |
| 2 | Kategorie + šablony | 3–5 h | 🔴 Kritická (NEXT) |
| 3 | Přehrávač (refaktor) | 5–8 h | 🔴 Kritická |
| 4 | Sestavovač kvízu | 6–10 h | 🟠 Vysoká |
| 5 | Public přehrávač + Divák + QR | 3–5 h | 🟠 Vysoká |
| 6 | Export PPTX | 4–6 h | 🟡 Střední |
| 7 | Stabilizace | 2–3 h | 🟡 Střední |
| **Celkem** | | **26–41 h** | |

**Realistický odhad: 31–38 hodin práce agenta**

---

## Co Haiku zvládne vs. co potřebuje Sonnet

### Haiku — vhodné úlohy (jednoduché, dobře definované)
- API routes (CRUD pro kategorie, šablony)
- Drobné úpravy stávajících komponent
- Napojení stránek na existující API
- Formuláře se statickými poli
- Deploy scripty, nginx config

### Sonnet — nutné pro (složitá logika, architektura)
- Stavový stroj audio/video přehrávače
- Logika oddělovače a replay sekvence
- Sestavovač kvízu (drag-and-drop, modal výběru)
- Refaktor přehrávače (kritické, mnoho vzájemně závislých stavů)
- Ladění bugů s nejasnými příčinami

### Doporučení
Přepnutí na Haiku **ušetří ~60 % nákladů na token**, ale pro složité fáze (3, 4) pravděpodobně:
- Vynechá edge case stavů (audio nedokončí správně flow)
- Potřebuje 2–3× více iterací → reálná úspora menší
- Vyšší riziko chyb, které se těžko ladí

**Optimální strategie:** Haiku pro fáze 1, 2, 7 (formuláře, CRUD, jednoduché stránky). Sonnet pro fáze 3, 4, 5, 6 (přehrávač, builder, export).

---

## Soubory ke smazání (technický dluh)
```
components/QuizController.tsx       ← smazat (duplikát)
components/SimpleQuizRenderer.tsx   ← smazat (nahrazen)
PLAN_VYVOJE.md                      ← smazat (nahrazen tímto)
PROJECT_STATUS.md                   ← smazat (zastaralý)
ANALYZA_PROJEKTU.md                 ← smazat (zastaralý)
scripts/deploy.sh                   ← opravit (spouštěl špatnou věc)
```

---

*Vytvořeno: 17.3.2026 na základě analýzy kódu a specifikace od vlastníka projektu.*
*Tento soubor (PLAN.md) je jediný autoritativní plán — ostatní plány jsou zastaralé.*

---

## Changelog — provedené práce

### 17.3.2026 — Infrastruktura + Admin základ (session 1)

**Problém:** Build nebyl vidět na `kviz.michaljanda.com` — nginx servoval statické HTML z `/var/www/kviz-export/` místo Next.js aplikace.

**Opraveno:**
- Nginx config přepsán na full proxy → `http://127.0.0.1:3000`
- JS chunks chyběly v standalone buildu → zkopírovány z `.next/static/`
- Server běžel ze staré ARCHIVED složky → zabit, spuštěn z aktuální
- Všechny API routes používaly `database-mock` (in-memory, prázdné po restartu) → přepsáno na `lib/database` (SQLite)

**Soubory:**
- `/etc/nginx/sites-enabled/kviz.michaljanda.com` — přepsán
- `app/api/quizzes/route.ts` — mockDatabase → real DB
- `app/api/quizzes/[id]/route.ts` — mockDatabase → real DB
- `app/api/questions/route.ts` — mockDatabase → real DB, přidán `category_name` do interface
- `lib/database.ts` — přidán LEFT JOIN na categories ve všech dotazech questions
- `app/admin/page.tsx` — kompletně přepsán (real API data místo hardcoded)
- `app/admin/questions/page.tsx` — přidány ikonky Pencil/Trash2, evropský formát data (`cs-CZ`), handler smazání

---

### 17.3.2026 — Fáze 1: Formulář otázek (session 2)

**Co bylo vytvořeno:**

| Soubor | Popis |
|--------|-------|
| `app/api/categories/route.ts` | GET (seznam) + POST (vytvoření) kategorií |
| `app/api/categories/[id]/route.ts` | GET / PUT / DELETE pro jednotlivé kategorie |
| `app/admin/questions/new/page.tsx` | **Formulář pro otázky** — create + edit mode |
| `app/api/questions/[id]/route.ts` | Opraven: `database-mock` → real `lib/database` |
| `app/admin/questions/page.tsx` | Tlačítko Upravit → `/admin/questions/new?id=xxx`, přidán "Nová otázka" Link |

**Formulář `/admin/questions/new`:**
- Detekuje edit mode přes URL param `?id=QUESTION_ID`
- Společná pole: text, typ, kategorie, obtížnost, body
- Dynamická sekce dle typu:
  - `simple` → pole správná odpověď
  - `ab` → 2 možnosti A/B + checkbox správná
  - `abcdef` → 2–6 možností A–F + checkboxy + tlačítko přidat/odebrat
  - `bonus` → 2–6 textových odpovědí (vše správné), auto-kategorie "Bonusové otázky"
  - `audio` → URL MP3 + inline `<audio controls>` preview + správná odpověď
  - `video` → URL videa + správná odpověď
- Validace před odesláním
- POST → vytvoří, PUT → aktualizuje, redirect na seznam po úspěchu
- Obsah `<Suspense>` wrapperu kvůli `useSearchParams()` (Next.js 15 požadavek)

**Deploy:** Rebuild na serveru, standalone restart, ověřeno HTTP 200 pro `/admin/questions/new` a `/api/categories`.

---

## Jak nasadit změny na server

```bash
# Nahrát soubory (příklad pro soubor s hranatými závorkami v cestě):
cat localfile.ts | ssh openclaw@89.167.94.41 "cat > ~/.openclaw/workspace-domminik/kviz-new/path/to/file.ts"

# Rebuild:
ssh openclaw@89.167.94.41 "cd ~/.openclaw/workspace-domminik/kviz-new && npm run build > /tmp/kviz-build.log 2>&1 &"

# Sledovat build:
ssh openclaw@89.167.94.41 "tail -30 /tmp/kviz-build.log"

# Po buildu — zkopírovat statické soubory a restartovat:
ssh openclaw@89.167.94.41 "
  PROJ=~/.openclaw/workspace-domminik/kviz-new
  STANDALONE=\$PROJ/.next/standalone
  cp -r \$PROJ/.next/static \$STANDALONE/.next/
  cp \$PROJ/data/kviz.db \$STANDALONE/data/ 2>/dev/null || true
  fuser -k 3000/tcp 2>/dev/null || true
  sleep 2
  cd \$STANDALONE && PORT=3000 nohup node server.js > /tmp/kviz-nextjs.log 2>&1 &
  sleep 3
  tail -3 /tmp/kviz-nextjs.log
"
```

**Důležité:** `better-sqlite3` je nativní modul — nelze cross-compilovat z Windows. Vždy buildit přímo na Linux serveru přes SSH.
