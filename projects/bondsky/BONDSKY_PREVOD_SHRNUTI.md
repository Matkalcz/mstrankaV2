# BONDSKY - Přehled převodu webu

## Stav k 16.3.2026

### ✅ Hotové podle historie session (agent:mateej:main)

**1. CSS a fonty:**
- Fonty: Bebas Neue (nadpisy), Nunito (text)
- Brand barvy: #dc2626 (primary), #b91c1c (bonds-red), #f59e0b (bonds-gold), #1e293b (bonds-dark)
- Google Fonts import v CSS i htmlHead
- Publikováno revision 7

**2. Menu:**
- Logo s ikonou plamene (Lucide flame icon)
- Text "BONDS" ve fontu Bebas Neue
- 4 odkazy: Novinky, Tipy & Návody, Blends, Potřebuji poradit
- Responzivní hamburger menu pro mobile

**3. Footer:**
- 4 sloupce podle vzoru
- Sociální sítě odkazy
- Všechny potřebné odkazy podle vzorového webu

**4. Hero sekce:**
- Fullscreen obrázek na pozadí (Pexels: 5935228)
- Gradient overlay (black/80 → black/30 → transparent)
- Animované texty s delay
- 2 tlačítka: "Prozkoumat Blends", "Jak to funguje?"
- Badge "Tabák jinak"

### 🔄 Rozpracované

**5. Další sekce (podle plánu):**
- ROUNDHEAT technologie
- "Proč si zamiluješ BONDS" (4 důvody s ikonami)
- Blends sekce
- Articles sekce  
- Tips sekce
- CTA sekce "Máš otázky?"

### 📍 Kde jsou data uložena

**NELOKÁLNĚ - v mStrankaV2:**
- Web ID: `0bb29aa8-00e5-4d54-ae29-83f9c9343032`
- Page ID (Homepage): `92b390da-dc3b-45f4-91f9-73e17e7d005e`
- Section IDs:
  - Hero Section: `7120ed15-e6ba-4b4b-b562-077384c53eff`
  - Articles Section: `2ce4d32a-be94-4159-b5bb-d04c809880a1`
  - Blends Section: `c95b71a3-dc55-4842-95b9-414def682f73`
  - Tips Section: `d01b726e-b11c-40f3-ad7b-1830d358c310`

**CSS:** V `set_styles` pro web
**HTML:** V sekcích stránky Homepage
**Metadata:** V konfiguraci webu

### ⚠️ Výzvy

1. **Obrázky:** Vzorový web používá externí obrázky z Pexels a IQOS
2. **Komplexní HTML:** Hodně vnořených divů a specifických CSS tříd
3. **Tailwind CSS:** Vzor používá Tailwind utility classes → převod na normální CSS
4. **Sekce jsou prázdné:** HTML obsah v sekcích má 0 znaků (potřeba doplnit)

### 🎯 Další kroky

1. **Dokončit Hero sekci** (optimalizace obrázků, animací)
2. **Přidat ROUNDHEAT technologii** sekci
3. **Přidat "Proč si zamiluješ BONDS"** (4 důvody s ikonami)
4. **Upravit existující sekce** (Blends, Articles, Tips) podle vzoru
5. **Přidat CTA sekci** "Máš otázky?"

### ⏱️ Odhad času

- Hero sekce: ~10 minut
- Každá další sekce: ~15-20 minut
- Celkem: ~1.5-2 hodiny

### 🔗 Odkazy

- **Live web:** https://bondsky.v2.mstranka.cz/
- **Vzorový web:** https://v2ouyb0w9aaw3v3o3ktl3mg8.macaly.dev/ (Preview asleep)
- **mStrankaV2 admin:** https://admin.v2.mstranka.cz/admin
- **MCP server:** https://mcp.v2.mstranka.cz/

### 📋 Příkazy pro pokračování

```bash
# Získat kontext webu
mcporter call mstranka.get_context websiteId="0bb29aa8-00e5-4d54-ae29-83f9c9343032"

# Upravit Hero sekci
mcporter call mstranka.edit_section websiteId="0bb29aa8-00e5-4d54-ae29-83f9c9343032" sectionId="7120ed15-e6ba-4b4b-b562-077384c53eff" htmlContent="<div>...</div>"

# Publikovat změny
mcporter call mstranka.publish websiteId="0bb29aa8-00e5-4d54-ae29-83f9c9343032"
```

---

*Dokument vytvořen: 16.3.2026 11:15*
*Zdroj: Historie session agent:mateej:main (webchat)*
*Data uložena v mStrankaV2, ne lokálně*