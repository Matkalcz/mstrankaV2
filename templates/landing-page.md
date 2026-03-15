# Šablona: Landing Page

## Metadata
- **Typ stránky**: Landing page
- **Účel**: Prezentace produktu/služby, lead generation
- **Cílová skupina**: [Doplň cílovou skupinu]
- **CTA primární**: [Doplň primární call-to-action]
- **CTA sekundární**: [Doplň sekundární call-to-action]

## Struktura stránky

### 1. Hero sekce
```
Nadpis: [Hlavní nadpis - max 8 slov]
Podnadpis: [Vysvětlující text - max 15 slov]
Primární CTA tlačítko: [Text tlačítka]
Sekundární CTA odkaz: [Text odkazu]
Pozadí: [Light/Dark/Gradient/Image]
```

### 2. Value proposition (3 body)
```
Nadpis: Proč zvolit nás?
Body:
1. [Výhoda 1] - [Krátký popis]
2. [Výhoda 2] - [Krátký popis]  
3. [Výhoda 3] - [Krátký popis]
Ikony: [Ano/Ne]
```

### 3. Features / Funkce
```
Nadpis: Naše funkce
Počet bloků: 3-6
Formát každého bloku:
- Ikona/obrázek
- Nadpis (max 3 slova)
- Popis (max 15 slov)
```

### 4. Testimonials / Reference
```
Nadpis: Co říkají naši klienti
Počet referencí: 3
Formát reference:
- Foto klienta (volitelné)
- Jméno a pozice
- Citát (max 20 slov)
- Hodnocení (1-5 hvězdiček)
```

### 5. Pricing / Ceník
```
Nadpis: Vyberte si plán
Počet plánů: 2-3
Elementy každého plánu:
- Název plánu
- Cena (měsíčně/ročně)
- Seznam funkcí (5-10 bodů)
- CTA tlačítko
Doporučený plán: [Označit]
```

### 6. FAQ
```
Nadpis: Často kladené otázky
Počet otázek: 5-8
Formát:
- Otázka
- Odpověď (max 50 slov)
Accordion design: [Ano/Ne]
```

### 7. Final CTA
```
Nadpis: [Závěrečný výzva]
Text: [Přesvědčivý text - max 25 slov]
Primární CTA: [Text tlačítka]
Sekundární CTA: [Text odkazu - např. "Nebo si přečtěte případovou studii"]
```

## Design specifikace

### Barvy
- Primární: #[HEX]
- Sekundární: #[HEX]  
- Akcent: #[HEX]
- Text: #[HEX]
- Pozadí: #[HEX]

### Typografie
- Nadpisy: [Font, velikosti]
- Text: [Font, velikost, řádkování]
- Tlačítka: [Font, velikost, padding]

### Responsive breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## SEO metadata
- Meta title: [Max 60 znaků]
- Meta description: [Max 160 znaků]
- Slug: [url-adresa-stránky]
- Keywords: [klíčová slova oddělená čárkou]

## Instrukce pro agenta

1. **Před vytvořením**: Zavolej `get_context` pro načtení aktuálního stavu webu
2. **Vytvoření stránky**: Použij `create_page` s parametry z této šablony
3. **Přidání sekcí**: Použij `add_section` pro každou sekci v pořadí
4. **Náhled**: Vždy zavolej `preview` před publikováním
5. **Publikování**: Po schválení použij `publish`

## Poznámky
- [Doplňte specifické požadavky pro tento projekt]
- [Odkazy na design inspiraci]
- [Poznámky k obsahu]