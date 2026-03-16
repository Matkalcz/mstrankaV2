#!/usr/bin/env python3
import json
import os

print("🔧 Opravuji strukturu import JSON...")

# Načíst původní import
with open('veterina_import.json', 'r', encoding='utf-8') as f:
    import_data = json.load(f)

# 1. Opravit stránky - podle exportu
pages = import_data.get('pages', [])
if pages:
    # Odstranit id a content, přidat sections
    fixed_pages = []
    for page in pages:
        fixed_page = {
            "name": page.get("name", "Homepage"),
            "slug": page.get("slug", ""),
            "sortOrder": page.get("sortOrder", 0),
            "title": page.get("title", "Veterina Turnov"),
            "showInMenu": page.get("showInMenu", True),
            "sections": []  # Prázdné sekce - obsah bude v sections
        }
        fixed_pages.append(fixed_page)
    
    import_data['pages'] = fixed_pages
    print(f"✅ Stránky opraveny: {len(fixed_pages)} stránek")

# 2. Opravit bloky - htmlContent místo content
blocks = import_data.get('blocks', [])
if blocks:
    fixed_blocks = []
    for block in blocks:
        fixed_block = {
            "name": block.get("name"),
            "htmlContent": block.get("content", "")  # Změna content → htmlContent
        }
        fixed_blocks.append(fixed_block)
    
    import_data['blocks'] = fixed_blocks
    print(f"✅ Bloky opraveny: {len(fixed_blocks)} bloků")

# 3. Odstranit websiteId z hlavního objektu (má být jen v metadata?)
# Podle exportu je websiteId v metadata, ne v hlavním objektu
if 'websiteId' in import_data:
    # Nechám ho tam, import to možná potřebuje
    print(f"✅ WebsiteId zachován: {import_data['websiteId']}")

# 4. Uložit opravený import
output_file = 'veterina_import_fixed.json'
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(import_data, f, ensure_ascii=False, indent=2)

print(f"💾 Opravený import uložen: {output_file}")
print(f"📊 Velikost: {os.path.getsize(output_file)} bajtů")

print("\n🎯 OPRAVENÁ STRUKTURA:")
print("  - Stránky: name, slug, sortOrder, title, showInMenu, sections: []")
print("  - Bloky: name, htmlContent (místo content)")
print("  - Obsah bude v sections (zatím prázdné)")

print("\n⚠️  POZNÁMKA: Obsah stránky (HTML) musí být v SECTIONS, ne přímo v page!")
print("   Sections budeme muset přidat separátně pomocí add_section")