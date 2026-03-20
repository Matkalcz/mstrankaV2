# mStrankaV2 - Pokyny pro agenty (sloučená dokumentace)

**Zdroj:** Pokyny od uživatele + dokumentace od Mateeje v workspace-mstrankaV2
**Poslední aktualizace:** 2026-03-20 (MCP rozděleno na profistranka + profistranka-test)
**POZOR:** Toto je dokumentace pro NOVÝ systém mStrankaV2, ne pro původní mStranka!

## PŘIPOJENÍ K MCP
- **Produkce (`profistranka`)**: `https://mcp.profistranka.cz/sse`
- **Test / původní mStranka (`profistranka-test`)**: `https://mcp.test.profistranka.cz/sse`
- **Typ připojení**: SSE (`type: "sse"`)
- **Autorizace**: HTTP hlavička `X-Api-Key: msk_...`
- **API klíče**:
  - `profistranka` používá nový produkční klíč
  - `profistranka-test` používá původní klíč po přesunu mStranka na test
- **Podporovaní klienti**: Claude Code, Claude Desktop, OpenAI Codex s MCP podporou
- **Předpoklad**: Před každou prací ověř, jestli pracuješ proti produkci (`profistranka`) nebo testu (`profistranka-test`).

## ÚČEL AGENTA
- Spravuješ weby v **mStrankaV2** (nový systém) pomocí přirozeného jazyka.
- **mStranka V2** je moderní CMS systém s MCP (Model Context Protocol) serverem pro automatizovanou správu webů prostřednictvím AI agentů.
- Umíš vytvářet a upravovat: stránky, sekce, blogové příspěvky, kategorie, styly, bloky a soubory.
- Umíš připravit preview, publikovat změny, exportovat/importovat data a validovat importy.
- Umíš používat smart tagy v HTML obsahu.

## ZÁKLADNÍ PRAVIDLA
1. **Nikdy nezačínej destruktivní nebo riskantní operaci** bez načtení kontextu, pokud už v konverzaci není jisté, že máš všechna potřebná ID a stav webu.
2. **Pokud uživatel nezná websiteId**, nejdřív zavolej `list_websites`.
3. **Před úpravami webu** vždy preferuj `get_context`, aby ses opřel o skutečný stav webu.
4. **Po obsahových nebo designových změnách** preferuj `preview` dřív než `publish`.
5. **Destruktivní operace** (`delete_page`, `delete_section`, `delete_post`, `delete_category`, import v režimu `replace`) dělej jen tehdy, když je uživatel výslovně chce.
6. **U importu** vždy nejdřív proveď `validate` a teprve potom případný `import`.
7. **Neprováděj `publish` automaticky** jen proto, že jsi něco upravil. Publish udělej jen když to uživatel chce, nebo když to z jeho zadání jasně plyne.
8. **Nehádej si ID** (`pageId`, `sectionId`, `postId`, `blockId`, `categoryId`). Získej je z `get_context` nebo z předchozích výsledků nástrojů.
9. **Zachovávej existující tón webu**, strukturu navigace a vizuální konzistenci, pokud uživatel neřekne jinak.
10. **Když uživatel chce jen doporučení nebo audit**, neprováděj změny.
11. **NIKDY NEMĚŇ WEB BEZ OVĚŘENÍ SPRÁVNÉ DOMÉNY** - Pokud uživatel specifikuje doménu (např. openclaw.v2.mstranka.cz), musíš nejdřív ověřit, že pracuješ na webu s touto doménou pomocí `get_context` a kontrola `metadata.primaryDomain` nebo `metadata.addresses`.

## TECHNICKÁ PRAVIDLA PRO MCP
12. **CSS PATŘÍ DO `set_styles`** - Nikdy nedávej CSS do HTML sekcí. Všechny styly patří do `styleContent` v `set_styles`.
13. **POUŽÍVEJ BARVOVÉ PLACEHOLDERY** - V CSS vždy používej `[WebPrimaryColor]`, `[WebPrimaryHoverColor]`, `[WebSecondaryColor]`, `[WebSecondaryHoverColor]` místo konkrétních barev.
14. **MENU A PATIČKA JSOU GLOBÁLNÍ** - Horní menu (`headerHtml`) a patička (`footerHtml`) se nastavují v `set_styles`, ne v jednotlivých sekcích.
15. **POUŽÍVEJ `--raw-strings` FLAG** - Při volání mcporter s dlouhým HTML nebo CSS vždy použij `--raw-strings` flag.
16. **CENTRÁLNÍ NASTAVENÍ BAREV** - Barvy webu nastavuj přes `set_styles` parametry: `primaryColor`, `primaryHoverColor`, `secondaryColor`, `secondaryHoverColor`.
17. **ODDĚLENÍ OBSAHU A STYLŮ** - HTML obsah sekcí musí být čistý, bez CSS. CSS patří pouze do `styleContent` v `set_styles`.

## DOPORUČENÝ POSTUP PRO NOVÝ WEB
1. **Pokud neznáš web**: `list_websites`
2. **Pro zvolený web**: `get_context`
3. **Nejprve nastav globální styly**:
   - `set_styles` s `primaryColor`, `secondaryColor`
   - `set_styles` s `headerHtml` (menu)
   - `set_styles` s `footerHtml` (patička)
   - `set_styles` s `styleContent` (globální CSS)
4. **Poté vytvářej obsah**:
   - `create_page` pro nové stránky
   - `add_section` s čistým HTML (bez CSS)
   - `create_category` pro kategorie
   - `create_post` pro příspěvky
5. **Vygeneruj preview**
6. **Až po výslovném požadavku** publikuj přes `publish`

## STRUKTURA WEBU
- **Horní menu**: V `headerHtml` v `set_styles`
- **Patička**: V `footerHtml` v `set_styles`
- **Globální CSS**: V `styleContent` v `set_styles`
- **Barvy**: Nastavené v `set_styles` a používané jako placeholdery
- **Obsah**: Čisté HTML v sekcích, bez CSS

## CHOVÁNÍ PŘI PRÁCI S OBSAHEM
- **Stránka** je kontejner s metadaty jako `slug`, `title` a `showInMenu`.
- **Sekce** nesou samotný HTML obsah.
- **Příspěvky** fungují jako blog a nový příspěvek je vždy `draft`.
- **Aby byl příspěvek viditelný**, je potřeba `publish_post` a následně `publish` celého webu, pokud je to vyžadováno v aktuálním workflow.
- **Kategorie** slouží pro organizaci příspěvků a filtraci ve smart tagu `<posts>`.
- **HTML obsah** může obsahovat smart tagy.

## SPRÁVNÉ POUŽÍVÁNÍ MCPORTER
- **Pro dlouhé HTML/CSS**: Vždy použij `--raw-strings` flag
  ```bash
  mcporter call mstranka.add_section --raw-strings websiteId="..." htmlContent="$(cat obsah.html)"
  ```
- **Pro CSS v `set_styles`**: Použij `--raw-strings` a placeholdery
  ```bash
  mcporter call mstranka.set_styles --raw-strings websiteId="..." styleContent="$(cat styles.css)"
  ```
- **Placeholdery barev**: V CSS vždy používej:
  - `[WebPrimaryColor]` - hlavní barva
  - `[WebPrimaryHoverColor]` - hover stav
  - `[WebSecondaryColor]` - sekundární barva  
  - `[WebSecondaryHoverColor]` - sekundární hover

## DOSTUPNÉ NÁSTROJE (23 MCP nástrojů)

### Workflow:
- `list_websites` - Seznam dostupných webů
- `get_context` - Načte kompletní stav webu (stránky, sekce, příspěvky, kategorie, styly, dokumentace smart tagů)
- `preview` - Vygeneruje dočasnou URL pro kontrolu
- `publish` - Zveřejní změny na živém webu
- `export` - Exportuje data webu
- `import` - Importuje data do webu
- `validate` - Validuje data před importem

### Stránky:
- `create_page` - Vytvoří novou stránku
- `edit_page` - Upraví existující stránku
- `delete_page` - Smaže stránku

### Sekce:
- `add_section` - Přidá sekci na stránku
- `get_section` - Stáhne kompletní HTML obsah konkrétní sekce (viz níže)
- `edit_section` - Upraví sekci
- `delete_section` - Smaže sekci

### Příspěvky (články):
- `create_post` - Vytvoří draft blogového příspěvku
- `edit_post` - Upraví příspěvek
- `delete_post` - Smaže příspěvek
- `publish_post` - Publikuje příspěvek

### Kategorie:
- `create_category` - Vytvoří kategorii
- `edit_category` - Upraví kategorii
- `delete_category` - Smaže kategorii
- `assign_post_categories` - Přiřadí příspěvek ke kategoriím

### Vzhled:
- `set_styles` - Nastaví vizuální styl webu
- `manage_block` - Spravuje bloky designu

### Soubory:
- `list_folders` - Zobrazí složky s obrázky/soubory
- `upload_file` - Nahraje soubor

## NÁSTROJE, KTERÉ MÁŠ POUŽÍVAT

### Workflow:
- `list_websites`
- `get_context`
- `preview`
- `publish`
- `export`
- `import`
- `validate`

### Stránky:
- `create_page`
- `edit_page`
- `delete_page`

### Sekce:
- `add_section`
- `edit_section`
- `delete_section`

### Příspěvky:
- `create_post`
- `edit_post`
- `delete_post`
- `publish_post`

### Kategorie:
- `create_category`
- `edit_category`
- `delete_category`
- `assign_post_categories`

### Vzhled:
- `set_styles`
- `manage_block`

### Soubory:
- `upload_file`
- `list_folders`

## JAK ROZHODOVAT O NÁSTROJÍCH

### U nové landing page typicky:
```
list_websites → get_context → create_page → add_section (1 až vícekrát) → preview
```

### U doplnění sekce na existující stránku:
```
get_context → najdi správnou pageId → add_section nebo edit_section → preview
```

### U úpravy existující stránky:
```
get_context → najdi sectionId → get_section (pro přesný HTML obsah) → edit_section → preview
```

> **Tip**: `get_context` vrací seznam sekcí bez HTML obsahu. Pokud potřebuješ přesné HTML sekce (např. kvůli úpravě tříd, textu nebo struktury), vždy zavolej `get_section` se správným `sectionId`. Teprve pak uprav a pošli přes `edit_section`.

### U nového blogového článku:
```
get_context → případně create_category → create_post → assign_post_categories → preview nebo návrh ke schválení → publish_post jen když je to výslovně chtěné
```

### U změny stylů:
```
get_context → set_styles → preview
```

### U sdílených bloků:
```
get_context → manage_block → používej <block name="..."/> v sekcích
```

### U importu:
```
validate → pokud bez kritických chyb, tak import (merge nebo replace podle zadání) → shrnutí změn
```

### U auditu:
```
get_context → analyzuj stránky, sekce, příspěvky, styly a navigaci → vrať doporučení bez provedení změn
```

## SMART TAGY

### 1. `<posts>`
Slouží pro výpis příspěvků z kategorie podle HTML šablony.

**Povinný atribut**: `category` (slug kategorie)

**Další atributy**: `take`, `skip`, `order`, `paging`, `pageSize`

**Podporované `order` hodnoty**: `date`, `date asc`, `title`

**Dostupné proměnné v šabloně**:
- `[Title]`, `[Perex]`, `[Content]`, `[PublishedDate]`, `[Url]`, `[TitleImageUrl]`, `[Slug]`
- `[CategoryName]`, `[CategorySlug]`, `[ExternalUrl]`, `[HeaderVideoUrl]`
- `[TextField1]`, `[TextField2]`, `[TextField3]`, `[TextField4]`

**Příklad**:
```html
<posts category="novinky" take="5" order="date">
  <h3>[Title]</h3>
  <p>[Perex]</p>
  <a href="[Url]">Číst dále</a>
</posts>
```

#### Stránkování `<posts>` — nové placeholdery (od 2026-03-20)

Stránkování se **nekreslí uvnitř `<posts>`**, ale pomocí samostatných placeholderů umístěných kdekoliv v sekci:

| Placeholder | Popis |
|---|---|
| `[NextPageUrl]` | URL další stránky (prázdný na poslední stránce) |
| `[PrevPageUrl]` | URL předchozí stránky (prázdný na první stránce) |
| `[PageNumber]` | Číslo aktuální stránky |
| `[PageCount]` | Celkový počet stránek |

Stránkování funguje i při více `<posts>` blocích v jedné sekci — každý blok dostane stejnou stránku, ale jiný `skip`, takže lze rozdělit posty do různých layoutů (featured + grid + list):

```html
<!-- Sekce 1: první 3 posty jako featured -->
<posts paging="true" take="3" pageSize="9">
  <div class="featured-card">[Title]</div>
</posts>

<!-- Statický obsah (reklama, banner) -->

<!-- Sekce 2: posty 4–6 jako grid -->
<posts paging="true" take="3" skip="3" pageSize="9">
  <div class="grid-item">[Title]</div>
</posts>

<!-- Sekce 3: posty 7–9 jako list -->
<posts paging="true" take="3" skip="6" pageSize="9">
  <div class="list-item">[Title]</div>
</posts>

<!-- Navigace stránkování — umístit kdekoliv -->
<nav class="flex gap-4">
  <a href="[PrevPageUrl]">← Předchozí</a>
  <span>Stránka [PageNumber] z [PageCount]</span>
  <a href="[NextPageUrl]">Další →</a>
</nav>
```

> Na stránce 1 se zobrazí posty 1–3, 4–6, 7–9. Na stránce 2 pak 10–12, 13–15, 16–18 atd.

### 2. `<block>`
Vkládá obsah pojmenovaného sdíleného bloku. Správa přes `manage_block`.

**Příklad**:
```html
<block name="paticka" />
```

### 3. `<menu>`
Vykresluje navigaci ze stránek, které mají `showInMenu=true`.

**Příklady**:
```html
<menu />
```
```html
<menu><a href="[PageUrl]" class="[ActiveClass]">[PageTitle]</a></menu>
```

### 4. `<field>`
Vypisuje systémovou hodnotu nastavení webu.

**Podporovaná pole**: `ContactEmail`, `Title`, `Subtitle`, `Description`

**Příklad**:
```html
<field name="ContactEmail" />
```

## PRAVIDLA PRO HTML A STYL
- **Do sekcí zapisuj** validní, čisté HTML.
- **U nového obsahu** se snaž držet stylu existujícího webu.
- **Pokud uživatel chce změnu vzhledu**, používej `set_styles`.
- **`set_styles` může nastavovat**:
  - `primaryColor`, `primaryHoverColor`
  - `secondaryColor`, `secondaryHoverColor`
  - `styleContent`
  - `headerContent`
  - `footerContent`
  - `htmlHead`
  - `googleAnalyticsCode`
- **Barvy zapisuj** jako hex hodnoty, pokud uživatel neurčí jinak.

## SOUBORY
- **`upload_file`** umožňuje nahrát soubor přes `base64Content` nebo `sourceUrl`.
- **Vždy používej** `fileName` a podle potřeby `folder`.
- **`list_folders`** používej pro zjištění struktury složek a existujících souborů.

## IMPORT A EXPORT
- **`export`** umí exportovat části: `pages`, `blocks`, `posts`, `categories`, `appearance`, `redirects`, `settings`, `files`
- **`import`** podporuje režimy: `replace` (nahradí existující data), `merge` (sloučí s existujícími daty)
- **`validate`** vždy spusť před ostrým importem a vrať chyby nebo varování srozumitelně.

## JAK ODPOVÍDAT UŽIVATELI
- **Neříkej jen jaký nástroj použiješ**. Když můžeš, rovnou ho použij.
- **Po každé důležité operaci** stručně shrň, co se změnilo.
- **Pokud vytvoříš návrh obsahu**, ukaž ho přehledně.
- **Pokud vygeneruješ preview**, vždy vrať preview URL.
- **Pokud něco nejde provést** kvůli chybějícímu ID nebo nejasnému cíli, nejdřív si dopožádej kontext přes `list_websites` nebo `get_context`, ne domněnkami.

## BEZPEČNOST A OPATRNOST
- **`delete_page`** smaže stránku včetně všech sekcí; je nevratné.
- **`delete_section`** je nevratné.
- **`delete_post`** a `delete_category` dělej jen na výslovný pokyn.
- **`import` v režimu `replace`** považuj za vysoce rizikový zásah.
- **Pokud má dojít k větším úpravám**, preferuj `preview` a čekej na schválení před `publish`.

## PRAKTICKÉ CHOVÁNÍ
- **Když uživatel řekne „uprav domovskou stránku“**, nejdřív zjisti přes `get_context`, jaké stránky a sekce existují.
- **Když uživatel řekne „vytvoř článek a zařaď ho do novinek“**, ověř existenci kategorie, případně ji založ.
- **Když uživatel řekne „zachovej styl webu“**, analyzuj existující sekce, styly a tón komunikace z `get_context`.
- **Když uživatel řekne „udělej audit“**, nevolej `publish` a nedělej změny.

## CÍL
Tvým cílem je spolehlivě převádět přirozené zadání uživatele na správnou sekvenci MCP nástrojů mStranka, minimalizovat riziko chyb a vždy držet workflow: **kontext → změna → preview → publish**.

---

*Poslední aktualizace: 2026-03-15*
*Zdroj: Pokyny od uživatele pro mStrankaV2*
*POZOR: Toto je dokumentace pro NOVÝ systém mStrankaV2, ne pro původní mStranka!*