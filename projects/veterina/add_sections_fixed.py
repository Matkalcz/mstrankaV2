#!/usr/bin/env python3
import json
import subprocess

print("🏗️  Přidávám sekce na homepage...")

# ID webu a stránky
website_id = "8231d7a5-a150-406b-89b1-b16097fdaa69"
page_id = "0cd39592-5352-4ab1-8550-985e1cee4529"

# 1. Hero sekce (zkrácená verze pro test)
hero_content = '''<section class="hero section-light" id="home">
    <div class="container">
        <h1>Veterina Turnov</h1>
        <p>Péče o vaše mazlíčky s láskou a odborností</p>
    </div>
</section>'''

# 2. Naše služby (zkrácená)
services_content = '''<section class="section" id="services">
    <div class="container">
        <h2>Naše služby</h2>
        <p>Komplexní veterinární služby</p>
    </div>
</section>'''

# 3. Ordinační doba (zkrácená)
hours_content = '''<section class="section" id="hours">
    <div class="container">
        <h2>Ordinační doba</h2>
        <p>Po-Pá: 8:00-18:00</p>
    </div>
</section>'''

# 4. Kontakt (zkrácená)
contact_content = '''<section class="section" id="contact">
    <div class="container">
        <h2>Kontakt</h2>
        <p>Tel: 777 325 109</p>
    </div>
</section>'''

# Sekce k přidání
sections = [
    {"title": "Hero", "content": hero_content, "sortOrder": 0},
    {"title": "Naše služby", "content": services_content, "sortOrder": 1},
    {"title": "Ordinační doba", "content": hours_content, "sortOrder": 2},
    {"title": "Kontakt", "content": contact_content, "sortOrder": 3}
]

print(f"📋 Přidávám {len(sections)} sekcí")

# Přidat každou sekci - JEDNODUCHÝ PŘÍKAZ
for i, section in enumerate(sections):
    print(f"\n{i+1}. Přidávám: {section['title']}")
    
    # Escape content pro JSON
    content_json = json.dumps(section['content'])
    
    # Sestavit příkaz
    cmd = f'mcporter call mstranka.add_section websiteId="{website_id}" pageId="{page_id}" title="{section["title"]}" content={content_json} sortOrder={section["sortOrder"]}'
    
    print(f"   Příkaz: {cmd[:80]}...")
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    
    if result.stdout:
        print(f"   ✅ {result.stdout[:100]}")
    if result.stderr and "error" not in result.stderr.lower():
        print(f"   ⚠️  {result.stderr[:200]}")

print("\n🔧 Publikuji změny...")
cmd = f'mcporter call mstranka.publish websiteId="{website_id}"'
result = subprocess.run(cmd, shell=True, capture_output=True, text=True)

if result.stdout:
    print(f"✅ {result.stdout}")
if result.stderr:
    print(f"❌ {result.stderr}")

print(f"\n🌐 WEB: https://veterina.v2.mstranka.cz/")
print("   Zkontroluj prosím!")