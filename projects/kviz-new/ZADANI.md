# Zadání - Nový hospodský kvízový systém

## Cíl
Vytvořit systém pro hospodské kvízy, který:
1. Zobrazuje kvíz na veřejné URL (hráči řeší na papíře)
2. Automaticky řídí průběh (žádné klikání moderátora)
3. Generuje PPTX/PDF prezentaci ke stažení
4. Je jednoduchý pro admina (technicky nezdatného uživatele)

## Použití
- **Hráči**: Načtou QR kód → vidí kvíz na svém zařízení → řeší na papíře
- **Moderátor**: Spustí kvíz → systém automaticky zobrazuje otázky a odpovědi
- **Admin**: Vytváří kvízy v admin rozhraní → generuje prezentaci

## Detaily použití (upřesnění)
1. **Hospodský kvíz** - hráči vidí kvíz na veřejné URL, řeší na papíře
2. **Pasivní zobrazení** - žádné hlasování v první verzi (ve verzi 2 možnost klikání na odpovědi)
3. **Automatické řízení** - systém sám zobrazuje otázky a odpovědi ve správný čas (žádné klikání moderátora na "zobraz odpověď")
4. **Provoz kvízu**:
   - Moderátor zobrazuje provozní informace
   - Postupně odhaluje otázky jednu po druhé
   - Zobrazí několik stránek jiných provozních informací
   - Začne vyhodnocovat uplynulé otázky (zobrazuje je se správnými odpověďmi)
   - Následuje další kolo

## Typy otázek

### 1. Jednoduchá otázka s jednoduchou odpovědí
- **Zobrazení**: Text otázky
- **Odhalení**: Červeně správná odpověď
- **Číslování**: Nahoře číslo otázky v kole (1-10), dole číslo kola
- **Detail**: Zobrazuje se text, při odhalení červeně odpověď, nahoře číslo otázky v daném kole (1-10) na dolním okraji číslo příslušného kola.
- **Průběh odhalování**:
  1. Slide 1: Otázka (bez odpovědi)
  2. Slide 2: Otázka + červená odpověď dole

### 2. AB/ABCDEF otázka
- **Zobrazení**: Text otázky + všechny vyplněné odpovědi (A, B, C, D, E, F)
- **Odhalení**: Text otázky + všechny odpovědi + správná odpověď červeně
- **Číslování**: Nahoře číslo otázky (1-10), dole číslo kola
- **Detail**: Zobrazuje se otázka a všechny vyplněné odpovědi ABCDEF, při odhalení se zobrazuje otázka, všechny vyplněné odpovědi a správná odpověď je červená. Nahoře číslo otázky v daném kole (1-10) na dolním okraji číslo příslušného kola.
- **Průběh odhalování**:
  1. Slide 1: Otázka + všechny varianty odpovědí
  2. Slide 2: Otázka + všechny varianty + správná zvýrazněná červeně

### 3. Bonusová otázka
- **Zobrazení**: Pouze text otázky (bez odpovědí)
- **Odhalení**: Postupně se zobrazují všechny vyplněné odpovědi (všechny jsou správné)
- **Označení**: Nahoře místo čísla "BO" (Bonusová otázka)
- **Speciální**: Všechny odpovědi v adminu jsou považovány za správné
- **Detail**: Má vlastní kategorii. Zobrazuje se pouze otázka bez navržených odpovědí, při odhalení se zobrazuje postupně jedna po druhé (možná s animací?) všechny vyplněné odpovědi. Tzn že všechny vyplněné odpovědi v adminu jsou správně, je to vyjímečná otázka, která se tedy chová odlišně od běžných kvízových. Nahoře má označení místo čísla "BO".
- **Průběh odhalování**:
  1. Slide 1: Pouze otázka
  2. Slide 2: Otázka + 1. odpověď
  3. Slide 3: Otázka + 1. + 2. odpověď
  4. Slide 4: Otázka + 1. + 2. + 3. odpověď (atd.)

### 4. Audio otázka
- **Zobrazení**: Text otázky
- **Interakce**: Na kliknutí přehraje audio
- **Odhalení**: Text otázky + správná odpověď červeně (audio se nepřehrává znovu)
- **Číslování**: Nahoře číslo otázky, dole číslo kola
- **Detail**: Zobrazí text otázky, následně na kliknutí přehraje audio. Při odhalení zobrazí text otázky a správnou odpověď červeně. Při odhalení už nemusí znovu přehrávat audio. Nahoře číslo otázky v daném kole, u dolního okraje číslo příslušného kola.
- **Průběh odhalování**:
  1. Slide 1: Otázka + tlačítko pro přehrání audio
  2. Slide 2: Otázka + červená odpověď (po přehrání)

### 5. Video otázka
- **Zobrazení**: Text otázky + malý náhled videa
- **Interakce**: Na kliknutí spustí fullscreen video
- **Po videu**: Znovu zobrazí text otázky
- **Odhalení**: Text otázky + malý náhled videa + správná odpověď červeně
- **Číslování**: Nahoře číslo otázky, dole číslo kola
- **Detail**: Zobrazí text otázky s menším náhledem videa. Na další kliknutí spustí přehrávání videa fullscreen. Po skončení videa se zobrazí znovu text otázky. Při odhalení se zobrazí text otázky, malý náhled videa a správná odpověď červeně. Nahoře číslo otázky, dole číslo kola.
- **Průběh odhalování**:
  1. Slide 1: Otázka + náhled videa + tlačítko pro fullscreen
  2. Slide 2: Otázka + červená odpověď (po přehrání videa)

### Struktura otázky v adminu
Admin otázky je jednotný a obsahuje:
- Otázka (text)
- Jednoduchá odpověď (pro simple otázky)
- ABCDEF odpovědi (pro AB/ABCDEF otázky)
- Obrázek
- Audio soubor
- Video
- Úroveň náročnosti otázky (těžká, lehká, střední)

## Šablona (design)
- **Základ**: Jedna univerzální šablona
- **Konfigurovatelné**:
  - Pozadí (obrázek nebo barva)
  - Barvy (primární, sekundární, červená pro správné odpovědi)
  - Velikost a typ písma
- **Možné variace**:
  - Odlišné pozadí pro různá kola
  - Speciální šablony pro speciální kvízy

### Detail šablony
Šablony úplně předem přesně definovat nemůžeme. Minimálně pozadí kvízu, barvu, velikost fontu musíme nastavovat v šabloně. 
- Existuje jedna univerzální šablona, která se používá často
- Někdy se sestavuje speciální kvíz, který potřebuje vypadat mírně jinak
- Může se i stát, že jednotlivá kola mohou mít odlišná pozadí
- Technicky bude vše vždy stejné, měnilo by se jen pozadí a základní styling

## Technické požadavky
1. **Žádné klikání moderátora** - systém automaticky zobrazuje ve správný čas
2. **Oddělovač** - automaticky přepíná mezi "otázka" a "odpověď" módy
3. **Konzistence** - webové zobrazení a PPTX/PDF vypadají stejně
4. **Jednoduchost pro admina** - minimální technické znalosti potřebné

## Pozice v šabloně
- **Číslo otázky**: Nahoře (pravý/levý horní roh)
- **Číslo kola**: Dole (pravý/levý dolní roh)
- **Text otázky**: Střed/horní část
- **Obrázek**: Pod otázkou
- **Odpovědi**:
  - Pro AB/ABCDEF: Mřížka nebo seznam pod obrázkem
  - Pro jednoduché: Velký text uprostřed
- **Media**:
  - Audio: Tlačítko/player pod otázkou
  - Video: Náhled + tlačítko pro fullscreen

### Typické pozice otázek
Zatím existují tyto druhy otázek, rozdělené do kategorií. Admin otázky je jednotný, a obsahuje: Otázka, jednoduchá odpověď, ABCDEF odpovědi, obrázek, audio soubor, video, úroveň náročnosti otázky (těžká, lehká střední).

## Animace (volitelné)
- **Zobrazení odpovědi**: Plynulé rozsvícení/posunutí
- **Bonusová otázka**: Postupné odhalování odpovědí jedna po druhé
- **Přechod mezi otázkami**: Plynulý fade

### Detail animací
Určitá animace by byla ku prospěchu, například zobrazení odpovědi na otázku by mohlo být animované. Pokud to ale zvýší náročnost kódu/chybovaost, obejdeme se bez toho.

## Export
- **PPTX** (preferovaný) nebo **PDF** (fallback)
- **Jeden soubor** obsahující celý kvíz
- **Offline použití** - stažený soubor lze přehrát bez internetu

### Detail exportu
Ano, vzniknout by měl jedna úplná prezentace obsahující celý kvíz. Export nemůže být jen screenshoty, protože by přestaly fungovat animace. Místo toho použijeme přímé generování PPTX slidů s možností simulace animací pomocí více slidů.

## Priorita
1. Fungující webové zobrazení všech typů otázek
2. Automatické řízení průběhu (oddělovač)
3. Generování PPTX/PDF
4. Konfigurovatelná šablona
5. Animace (pokud to nepřidá složitost)

## Cílová skupina admina
Admin bude technicky naprosto nezdatný. Editace šablony pomocí WYSIWYG je zajímavý nápad, ale není potřeba v první verzi. Pokud si my - programátor a zadavatel, předem ujasníme, jak má kvíz být napozicovaný, nebudou možná potřeba žádné placeholdery, admin se nastaveným podmínkám pozicování zřejmě dokáže přizpůsobit. To se ale může do budoucna změnit.

---

*Zadání vytvořeno 6.3.2026 na základě diskuze s Martinem Kalianem (Mates)*
*Cílem je vytvořit jednoduchý, robustní systém bez PDF canvas problémů*