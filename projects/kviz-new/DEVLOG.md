# DEVLOG — Kviz Admin

Chronologický zápisník provedených prací. Čti PLAN.md pro přehled architektury a priorit.

---

## 2026-03-17

### Fáze 0 — Oprava deploymentu (dokončeno)

**Problém:** Nginx servíroval starou statickou export složku, ne Next.js app.

**Opraveno:**
- Nginx config `/etc/nginx/sites-enabled/kviz.michaljanda.com` — přepsán na `proxy_pass http://127.0.0.1:3000`
- Odstraněn stale `location /_next/static` blok (způsoboval 403 kvůli oprávněním)
- JS chunks chyběly v standalone — přidáno `cp -r .next/static/chunks .next/standalone/.next/static/`
- Všechny API routes používaly `@/lib/database-mock` (in-memory, prázdné po restartu) — přepnuty na reálnou SQLite DB

### Fáze 0 — Admin dashboard (dokončeno)

**Opraveno:**
- `app/admin/page.tsx` — přepsán z hardcoded dat na fetch z `/api/quizzes`, `/api/questions`, `/api/categories`
- Real-time statistiky (počet kvízů, otázek, kategorií)

### Fáze 1 — Správa otázek (dokončeno)

#### API routes

| Route | Stav | Poznámka |
|-------|------|----------|
| `GET /api/categories` | ✅ | Vrací reálná data z SQLite |
| `POST /api/categories` | ✅ | Vytvoří novou kategorii |
| `GET /api/categories/[id]` | ✅ | Nový soubor |
| `PUT /api/categories/[id]` | ✅ | Nový soubor |
| `DELETE /api/categories/[id]` | ✅ | S ochranou — nelze smazat kategorii používanou otázkami |
| `GET /api/questions/[id]` | ✅ | Opraveno — bylo mockDatabase, nyní reálná DB |
| `PUT /api/questions/[id]` | ✅ | Opraveno — bylo mockDatabase |
| `DELETE /api/questions/[id]` | ✅ | Opraveno — bylo mockDatabase |

#### Admin stránky

**`app/admin/questions/page.tsx`** (seznam otázek):
- Přidáno tlačítko **Nová otázka** (vpravo nahoře)
- Tlačítko Upravit → `router.push("/admin/questions/new?id=...")` (bylo `alert()`)
- Přidány ikonky Pencil a Trash2 na každém řádku
- Datum v evropském formátu (DD. MM. YYYY) přes `toLocaleDateString("cs-CZ")`
- Delete handler s potvrzením a spinnerem

**`app/admin/questions/new/page.tsx`** (formulář — NOVÝ soubor):
- Jeden formulář pro všechny typy: `simple | ab | abcdef | bonus | audio | video`
- Dynamické sekce podle zvoleného typu
- `simple` → pole správná odpověď
- `ab` → 2 možnosti A/B s checkboxem „správná"
- `abcdef` → 2–6 možností A–F (add/remove) + checkboxy
- `bonus` → 2–6 odpovědí (všechny správné), auto-kategorie „Bonusové otázky"
- `audio` → URL MP3 + inline přehrávač + správná odpověď
- `video` → URL videa + správná odpověď
- Edit mode: URL `?id=QUESTION_ID` → pre-fill z GET /api/questions/[id], submit → PUT
- Kategorie se načítají PŘED otázkou (závislost v useEffect) — eliminuje race condition
- Viditelná chybová hláška při selhání načtení kategorií + tlačítko "Zkusit znovu"
- Validace povinných polí před odesláním, redirect na seznam po úspěchu

#### Deployment

Server: `openclaw@89.167.94.41`
Projekt: `~/.openclaw/workspace-domminik/kviz-new`
Standalone: `~/.openclaw/workspace-domminik/kviz-new/.next/standalone`
Port: 3000 (nginx proxy)

Postup pro ruční deploy:
```bash
ssh openclaw@89.167.94.41 "
  cd ~/.openclaw/workspace-domminik/kviz-new && npm run build
  cp -r .next/static .next/standalone/.next/
  cp data/kviz.db .next/standalone/data/ 2>/dev/null || true
  fuser -k 3000/tcp 2>/dev/null || true
  sleep 2
  cd .next/standalone && PORT=3000 nohup node server.js > /tmp/kviz-nextjs.log 2>&1 &
"
```

⚠️ `better-sqlite3` je nativní modul — build **musí probíhat na Linux serveru**, ne cross-compile z Windows.

---

## 2026-03-18

### Fáze 1b — Typy otázek (dokončeno)

**Změny:**
- Zrušen typ `ab` — redundantní, plně nahrazen `abcdef` (min. 2 možnosti)
- Přidán typ `image` (Obrázková otázka):
  - Klik 1 = zobrazí text otázky
  - Klik 2 = zobrazí obrázek přes celou obrazovku
  - Klik 3 = přechod na další otázku
  - Správná odpověď je volitelná

**Soubory změněny:**
- `lib/database.ts` — CHECK constraint aktualizován; přidána `migrateQuestionsSchema()` která automaticky přepíše tabulku při startu (ab→abcdef, přidá image) bez ztráty dat
- `app/api/questions/route.ts` — validTypes: odebráno 'ab', přidáno 'image'
- `app/api/questions/[id]/route.ts` — totéž
- `app/admin/questions/new/QuestionForm.tsx` — odebrán typ ab, přidána sekce pro image (URL + náhled + volitelná odpověď)
- `app/admin/questions/page.tsx` — aktualizovány TYPE_LABELS a barvy (image = pink)

### Fáze 2b — Tags system (dokončeno)

**Implementováno:**
- `lib/database.ts` — nová tabulka `tags` (nahrazuje `categories`), junction tabulka `question_tags(question_id, tag_id)`, migrace categories→tags při startu, migrace questions.category→question_tags
- `app/api/tags/route.ts` + `app/api/tags/[id]/route.ts` — CRUD pro tagy
- `app/api/categories/route.ts` + `[id]` — backward-compat alias na tags
- `app/admin/questions/new/QuestionForm.tsx` — multi-tag checkbox picker (vyhledávání, color chips)
- `app/admin/questions/new/page.tsx` — server-side fetch tagů místo kategorií
- `app/api/questions/route.ts` + `[id]` — POST/PUT přijímá `tag_ids: string[]`
- `app/admin/questions/page.tsx` — zobrazuje tagy (může být více) místo jedné kategorie
- `app/admin/categories/page.tsx` — přepsáno jako plně funkční tags admin (CRUD s color pickerem)

**DB migrace (automatická při startu serveru):**
1. `migrateQuestionsSchema()` — ab→abcdef, přidán image typ
2. `migrateToTagsSystem()` — categories→tags, question_tags junction, category col odstraněn

**Schéma tagů:**
```sql
tags(id, name, description, color, icon, created_at, updated_at)
question_tags(question_id, tag_id)  -- junction M:N
```

---

## Co zbývá (viz PLAN.md)

### Fáze 2 — Kategorie admin (✅ dokončeno jako součást 2b)

### Fáze 3 — Přehrávač (✅ dokončeno — restyling)

**Změny (2026-03-18):**
- `components/ManualQuizController.tsx` — kompletní přepis layoutu:
  - Levý sidebar (272px) se seznamem slidů (číslované thumbnail karty, aktivní zvýrazněn modře, zodpovězené zeleně)
  - Hlavní oblast (`flex-1`) zobrazuje aktuální slide fullscreen
  - Spodní lišta s kulatými tlačítky: modrý ↺ restart, oranžový ← prev, modrá pilulka "Zobrazit odpověď" / "Skrýt odpověď", zelený → next, červený ✕ close
  - Přidán `onClose` callback (routuje zpět na `/admin/quizzes`)
  - Klávesové zkratky zachovány (→, ←, A, Escape, Ctrl+R)
  - Sidebar auto-scrolluje na aktivní slide
  - Zodpovězené slidy označeny zeleným okrajem v sidebaru
- `app/quiz/[id]/page.tsx` — zjednodušen: odstraněna header/footer obálka, ManualQuizController je přímý fullscreen render

### Fáze 4 — Builder kvízu (🔴 kritická)
- Drag-and-drop sekvence snímků
- Modal pro výběr otázek z databáze

### Fáze 5 — Public play page
- `app/play/[id]` — fullscreen přehrávač

### Fáze 6 — PPTX export
- `pptxgenjs` integrace

### Fáze 7 — Stabilita
- PM2 auto-restart při selhání
- Autentizace adminu

---

## Důležité technické poznatky

### Databáze
- SQLite soubor: `data/kviz.db` (relativně k CWD procesu)
- V standalone módu server.js běží z `.next/standalone/` → DB musí být na `~/.openclaw/workspace-domminik/kviz-new/.next/standalone/data/kviz.db`
- Po každém buildu zkopírovat: `cp $PROJ/data/kviz.db $STANDALONE/data/`

### Next.js standalone
- Build: `npm run build` na serveru
- Po buildu zkopírovat statické soubory: `cp -r .next/static .next/standalone/.next/`
- Start: `cd .next/standalone && PORT=3000 node server.js`

### Typy otázek (DB constraint)
```sql
type TEXT NOT NULL CHECK(type IN ('simple', 'abcdef', 'bonus', 'audio', 'video', 'image'))
-- 'ab' zrušen (nahrazen abcdef s min. 2 možnostmi)
-- 'image': klik1=text, klik2=obrázek fullscreen, klik3=next
```

### Logika kvízu (manuální moderátor)
- Žádný auto-timing — moderátor kliká ručně
- `simple` → 1 klik = zobraz odpověď
- `ab/abcdef` → 1 klik = zobraz odpověď (všechny najednou)
- `bonus` → každý klik = další odpověď z listu
- `audio` → klik 1 = přehraj audio, klik 2 = zobraz odpověď
- `video` → klik 1 = spusť video, klik 2 = zastav, klik 3 = zobraz odpověď
- `separator` → marker kola (nespustí se automaticky; zopakuje otázky kola s odpověďmi)
- `round_start` → úvodní snímek kola
