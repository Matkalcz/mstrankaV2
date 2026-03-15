# Šablona: Blogový příspěvek (článek)

## Metadata
- **Typ obsahu**: Blog post / článek
- **Formát**: Evergreen / News / Tutorial / Case study
- **Délka**: [Krátký (300-500 slov) / Střední (500-1000 slov) / Dlouhý (1000+ slov)]
- **Cílová skupina**: [Začátečníci / Pokročilí / Expertí]
- **Tón**: [Formální / Neformální / Odborný / Přátelský]

## Struktura článku

### 1. Záhlaví
```
Název: [Hlavní nadpis - max 10 slov, obsahuje klíčové slovo]
Perex: [Úvodní odstavec - max 150 slov, zachycuje pozornost]
Autor: [Jméno autora]
Datum publikace: [YYYY-MM-DD]
Čas čtení: [X min čtení]
Featured image: [URL hlavního obrázku]
```

### 2. Úvod
```
Účel: Představit téma, vysvětlit proč je důležité, nastínit co čtenář získá
Délka: 2-3 odstavce
Elementy:
- Hook (zachycení pozornosti)
- Problém/potřeba čtenáře
- Co článek řeší
- Co čtenář získá
```

### 3. Hlavní obsah

#### Varianta A: Tutorial / How-to
```
Struktura:
1. Přehled potřebných nástrojů/materiálů
2. Krok 1: [Název kroku]
   - Popis
   - Obrázek/screenshot
   - Tipy
3. Krok 2: [Název kroku]
   - Popis
   - Obrázek/screenshot  
   - Tipy
4. [Další kroky...]
5. Shrnutí
```

#### Varianta B: Seznam / Listicle
```
Struktura:
- Úvod: Proč je tento seznam užitečný
- Položka 1: [Název] + [Vysvětlení 50-100 slov]
- Položka 2: [Název] + [Vysvětlení 50-100 slov]
- [Další položky...]
- Závěr: Klíčové takeaways
```

#### Varianta C: Case study
```
Struktura:
- Výzva: Jaký problém klient řešil
- Řešení: Co jsme navrhli/implementovali
- Implementace: Jak probíhala realizace
- Výsledky: Měřitelné výsledky (čísla, procenta)
- Závěry: Co jsme se naučili
```

### 4. Závěr
```
Účel: Shrnutí hlavních bodů, call-to-action
Elementy:
- Shrnutí klíčových myšlenek
- Doporučení pro čtenáře
- Call-to-action (komentáře, sdílení, newsletter)
- Odkazy na související články
```

### 5. SEO optimalizace
```
Meta title: [Max 60 znaků, obsahuje klíčové slovo]
Meta description: [Max 160 znaků, lákavý popis]
Slug: [url-cesta-clanku]
Focus keyword: [Hlavní klíčové slovo]
LSI keywords: [Související klíčová slova]
```

### 6. Formátování
```
Nadpisy: H1 pro název, H2 pro sekce, H3 pro podsekce
Odrážky: Používat pro seznamy
Tučné písmo: Důležité pojmy
Kurzíva: Citáty, důraz
Blokové citace: Pro důležité myšlenky
```

## Kategorie a tagy
```
Hlavní kategorie: [Vyber z existujících nebo vytvoř novou]
Sekundární kategorie: [Volitelné]
Tagy: 3-5 relevantních tagů
```

## Media
```
Hlavní obrázek: [URL, alt text, title]
Obrázky v článku: 1 obrázek na 300 slov
Alt texty: Popisné, obsahují klíčová slova
Videa: [Embed kódy]
Infografiky: [URL]
```

## Instrukce pro agenta (Damian pro cron job)

### Pro automatické vytváření článků:
1. **Výběr tématu**: Na základě [zdroje témat]
2. **Vytvoření draftu**: Použij `create_post` s parametry šablony
3. **Naplnění obsahu**: Generuj obsah podle struktury
4. **Přiřazení kategorií**: Použij `assign_post_categories`
5. **Nastavení jako draft**: Nepoužívej `publish_post` (jen draft)
6. **Uložení pro schválení**: Pošli preview URL Martinovi

### Parametry pro cron job:
```
Frekvence: [Denně/Týdně/Měsíčně]
Počet článků: [X článků za periodu]
Témata: [Seznam témat nebo zdroj]
Kategorie: [Přednastavené kategorie]
Auto-publish: [Ne - vždy jen draft]
```

## Quality checklist
- [ ] Nadpis obsahuje klíčové slovo
- [ ] Perex je lákavý a informativní
- [ ] Článek má jasnou strukturu
- [ ] Odkazy na relevantní zdroje
- [ ] Obrázky mají alt texty
- [ ] Meta description je vyplněný
- [ ] Článek odpovídá na otázku čtenáře
- [ ] Call-to-action je jasný
- [ ] Bez pravopisných chyb
- [ ] Optimalizováno pro SEO

## Poznámky
- [Doplňte specifické požadavky pro blog]
- [Tón hlasu brandu]
- [Odkazy na style guide]
- [Pravidla pro citace a zdroje]