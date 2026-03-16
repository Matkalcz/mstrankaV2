#!/usr/bin/env python3
import json
import os

print("📦 Vytvářím import JSON pro mStrankaV2...")

# 1. Načíst naše soubory
project_dir = '/home/openclaw/.openclaw/workspace-mstrankaV2/projects/veterina'

with open(os.path.join(project_dir, 'veterina_header.html'), 'r', encoding='utf-8') as f:
    header_html = f.read()

with open(os.path.join(project_dir, 'veterina_footer.html'), 'r', encoding='utf-8') as f:
    footer_html = f.read()

with open(os.path.join(project_dir, 'veterina_styles.css'), 'r', encoding='utf-8') as f:
    custom_css = f.read()

print(f"✅ Soubory načteny:")
print(f"  - Header: {len(header_html)} znaků")
print(f"  - Footer: {len(footer_html)} znaků")
print(f"  - CSS: {len(custom_css)} znaků")

# 2. Vytvořit import JSON podle schématu z get_context
import_data = {
    "version": "1.0",
    "websiteId": "8231d7a5-a150-406b-89b1-b16097fdaa69",
    
    # Stránky
    "pages": [
        {
            "id": "7c833d58-378f-4485-9283-e70f9767adad",  # Existující homepage ID
            "name": "Homepage",
            "slug": "",
            "title": "Veterina Turnov",
            "sortOrder": 0,
            "showInMenu": True,
            "content": '''<div class="container">
    <!-- Hero sekce -->
    <section class="hero section-light" id="home">
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
    </section>
    
    <!-- Naše služby -->
    <section class="section section-gray" id="services">
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
    </section>
    
    <!-- Ordinační doba -->
    <section class="section section-light" id="ordinacni-doba">
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
    </section>
    
    <!-- Kontakt -->
    <section class="section section-gray" id="contact">
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
    </section>
</div>'''
        }
    ],
    
    # Bloky (header a footer)
    "blocks": [
        {
            "name": "header",
            "content": header_html
        },
        {
            "name": "footer", 
            "content": footer_html
        }
    ],
    
    # Vzhled (CSS)
    "appearance": {
        "primaryColor": "#2c5282",  # Modrá z VET
        "primaryHoverColor": "#1a365d",
        "secondaryColor": "#10b981",  # Zelená z Objednat
        "secondaryHoverColor": "#0da271",
        "customCss": custom_css,
        "headerHtml": "<block name=\"header\" />",
        "footerHtml": "<block name=\"footer\" />"
    },
    
    # Nastavení
    "settings": {
        "title": "Veterina Turnov",
        "subtitle": "Veterinární ordinace",
        "description": "Komplexní veterinární služby pro malá zvířata v Turnově a okolí. Preventivní péče, diagnostika, chirurgie a domácí návštěvy.",
        "contactEmail": "vetsebek@email.cz"
    }
}

# 3. Uložit import JSON
output_file = os.path.join(project_dir, 'veterina_import.json')
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(import_data, f, ensure_ascii=False, indent=2)

print(f"💾 Import JSON vytvořen: {output_file}")
print(f"📊 Velikost: {os.path.getsize(output_file)} bajtů")

print("\n🎯 CO BUDE IMPORTOVÁNO:")
print("  1. Homepage s 4 sekcemi:")
print("     - Hero (úvodní sekce)")
print("     - Naše služby (4 karty)")
print("     - Ordinační doba")
print("     - Kontakt")
print("  2. Header blok (menu)")
print("  3. Footer blok")
print("  4. CSS styly")
print("  5. Barvy: modrá #2c5282, zelená #10b981")
print("  6. Nastavení webu")

print("\n⚠️  POZOR: Toto PŘEPÍŠE aktuální web!")
print("   - Stránka 'Homepage' bude aktualizována")
print("   - Header a Footer budou nahrazeny")
print("   - CSS bude přepsáno")