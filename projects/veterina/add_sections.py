#!/usr/bin/env python3
import json
import subprocess

print("🏗️  Přidávám sekce na homepage...")

# ID webu a stránky
website_id = "8231d7a5-a150-406b-89b1-b16097fdaa69"
page_id = "0cd39592-5352-4ab1-8550-985e1cee4529"

# 1. Hero sekce
hero_content = '''<section class="hero section-light" id="home">
    <div class="hero-bg"></div>
    <div class="container">
        <div class="hero-content">
            <h1 class="hero-title">Péče o vaše <span>mazlíčky</span> s láskou a odborností</h1>
            <p class="lead">Veterinární ordinace v Turnově poskytuje komplexní péči pro vaše čtyřnohé přátele. Od prevence po specializovanou léčbu - jsme tu pro vás.</p>
            
            <div class="hero-buttons">
                <a href="#services" class="btn btn-primary">
                    <i class="fas fa-stethoscope"></i>
                    Naše služby
                </a>
                <a href="#contact" class="btn btn-secondary">
                    <i class="fas fa-calendar-check"></i>
                    Objednat se
                </a>
            </div>
            
            <div class="emergency-badge">
                <i class="fas fa-phone-alt"></i>
                <div>
                    <strong>Pohotovost 24/7</strong><br>
                    <span style="font-size: 1.2rem;">721 306 181</span>
                </div>
            </div>
        </div>
        
        <div class="hero-image">
            <img src="https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Veterinář s pejskem">
        </div>
    </div>
</section>'''

# 2. Naše služby
services_content = '''<section class="section section-gray" id="services">
    <div class="container">
        <div class="text-center mb-3">
            <h2>Co <span class="text-primary">nabízíme</span></h2>
            <p class="lead">Komplexní veterinární služby od preventivní péče po specializovanou léčbu</p>
        </div>
        
        <div class="services-grid">
            <div class="service-card">
                <div class="service-icon">
                    <i class="fas fa-shield-alt"></i>
                </div>
                <h3 class="service-title">Preventivní péče</h3>
                <p class="service-desc">Vakcinace, odčervení, čipování, preventivní prohlídky a dentální hygiena pro dlouhý a zdravý život vašich mazlíčků.</p>
                <a href="#nase-sluzby" class="service-link">
                    Více informací
                    <i class="fas fa-arrow-right"></i>
                </a>
            </div>
            
            <div class="service-card">
                <div class="service-icon">
                    <i class="fas fa-search"></i>
                </div>
                <h3 class="service-title">Diagnostika</h3>
                <p class="service-desc">Moderní diagnostické metody včetně ultrazvuku, rentgenu a laboratorních vyšetření pro přesnou diagnózu.</p>
                <a href="#nase-sluzby" class="service-link">
                    Více informací
                    <i class="fas fa-arrow-right"></i>
                </a>
            </div>
            
            <div class="service-card">
                <div class="service-icon">
                    <i class="fas fa-syringe"></i>
                </div>
                <h3 class="service-title">Chirurgie</h3>
                <p class="service-desc">Šetrné operativní zákroky, kastrace, ošetření ran a dentální zákroky v bezpečném prostředí.</p>
                <a href="#nase-sluzby" class="service-link">
                    Více informací
                    <i class="fas fa-arrow-right"></i>
                </a>
            </div>
            
            <div class="service-card">
                <div class="service-icon">
                    <i class="fas fa-home"></i>
                </div>
                <h3 class="service-title">Domácí návštěvy</h3>
                <p class="service-desc">Ošetření ve známém prostředí pro snížení stresu u citlivých zvířat. Vakcinace, prohlídky, paliativní péče.</p>
                <a href="#nase-sluzby" class="service-link">
                    Více informací
                    <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        </div>
    </div>
</section>'''

# 3. Ordinační doba
hours_content = '''<section class="section section-light" id="ordinacni-doba">
    <div class="container">
        <div class="text-center mb-3">
            <h2>Ordinační <span class="text-primary">doba</span></h2>
            <p class="lead">Jsme tu pro vás a vaše mazlíčky</p>
        </div>
        
        <div class="hours-container">
            <div class="hours-table">
                <div class="hour-row">
                    <span class="day">Pondělí</span>
                    <span class="time">11:00 – 18:00</span>
                </div>
                <div class="hour-row">
                    <span class="day">Úterý</span>
                    <span class="time">11:00 – 18:00</span>
                </div>
                <div class="hour-row">
                    <span class="day">Středa</span>
                    <span class="time">08:00 – 13:00</span>
                </div>
                <div class="hour-row">
                    <span class="day">Čtvrtek</span>
                    <span class="time">11:00 – 18:00</span>
                </div>
                <div class="hour-row">
                    <span class="day">Pátek</span>
                    <span class="time">08:00 – 13:00</span>
                </div>
                <div class="hour-row emergency">
                    <span class="day">Sobota</span>
                    <span class="time">POHOTOVOST</span>
                </div>
                <div class="hour-row emergency">
                    <span class="day">Neděle</span>
                    <span class="time">POHOTOVOST</span>
                </div>
            </div>
            
            <div class="hours-image">
                <img src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Veterinární ordinace">
            </div>
        </div>
    </div>
</section>'''

# 4. Kontakt
contact_content = '''<section class="section section-gray" id="contact">
    <div class="container">
        <div class="text-center mb-3">
            <h2>Kontakt</h2>
            <p class="lead">Kde nás najdete a jak se objednat</p>
        </div>
        
        <div class="row">
            <div class="col-md-6">
                <h4>Adresa</h4>
                <p><i class="fas fa-map-marker-alt"></i> Nádražní 1125, 511 01 Turnov</p>
                
                <h4 class="mt-4">Telefony</h4>
                <p><i class="fas fa-phone"></i> 777 325 109 (ordinace)</p>
                <p><i class="fas fa-phone-alt"></i> 721 306 181 (pohotovost 24/7)</p>
                
                <h4 class="mt-4">Email</h4>
                <p><i class="fas fa-envelope"></i> vetsebek(a)email.cz</p>
            </div>
            
            <div class="col-md-6">
                <h4>Objednávací formulář</h4>
                <p>Pro objednání volejte na ordinaci nebo využijte online formulář.</p>
                <a href="#kontakt" class="btn btn-primary btn-lg">
                    <i class="fas fa-calendar-check"></i>
                    Objednat online
                </a>
            </div>
        </div>
    </div>
</section>'''

# Sekce k přidání
sections = [
    {"title": "Hero", "content": hero_content, "sortOrder": 0},
    {"title": "Naše služby", "content": services_content, "sortOrder": 1},
    {"title": "Ordinační doba", "content": hours_content, "sortOrder": 2},
    {"title": "Kontakt", "content": contact_content, "sortOrder": 3}
]

print(f"📋 Přidávám {len(sections)} sekcí na stránku {page_id}")

# Přidat každou sekci
for i, section in enumerate(sections):
    print(f"\n{i+1}. Přidávám sekci: {section['title']}...")
    
    cmd = ['mcporter', 'call', 
           f'mstranka.add_section(websiteId: \"{website_id}\", pageId: \"{page_id}\", title: \"{section[\"title\"]}\", content: {json.dumps(section[\"content\"])}, sortOrder: {section[\"sortOrder\"]})']
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    if result.stdout:
        print(f"   ✅ Úspěch: {result.stdout[:100]}...")
    if result.stderr:
        print(f"   ❌ Chyba: {result.stderr[:200]}")

print("\n🎯 VŠECHNY SEKCE PŘIDÁNY!")
print("  1. Hero sekce")
print("  2. Naše služby (4 karty)")
print("  3. Ordinační doba")
print("  4. Kontakt")

print("\n🔧 Teď publikuji změny...")

# Publikovat
cmd = ['mcporter', 'call', f'mstranka.publish(websiteId: \"{website_id}\")']
result = subprocess.run(cmd, capture_output=True, text=True)

if result.stdout:
    print(f"✅ Publikováno: {result.stdout}")
if result.stderr:
    print(f"❌ Chyba při publikování: {result.stderr}")

print(f"\n🌐 WEB JE HOTOVÝ: https://veterina.v2.mstranka.cz/")
print("   - Header s menu VET TURNOV")
print("   - 4 obsahové sekce")
print("   - Footer")
print("   - CSS styly")
print("   - Publikováno")