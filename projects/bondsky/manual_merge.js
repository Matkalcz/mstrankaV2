const fs = require('fs');

// Načíst aktuální stránku
const currentPage = fs.readFileSync('./projects/bondsky/current_page.html', 'utf8');
const lines = currentPage.split('\n');

// Najít kde vložit sekce
let insertAfterHero = -1;
let insertBeforeFooter = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('</section></div><div id="why-bonds"')) {
    insertAfterHero = i; // Řádek s </section></div><div id="why-bonds"
  }
  if (lines[i].includes('<footer')) {
    insertBeforeFooter = i;
    break;
  }
}

console.log('Insert after hero:', insertAfterHero);
console.log('Insert before footer:', insertBeforeFooter);

// Načíst ROUNDHEAT HTML (už máme)
const roundheatHtml = fs.readFileSync('./projects/bondsky/roundheat_complete.html', 'utf8');

// Vytvořit zjednodušené sekce podle screenshots
const blendsHtml = `<!-- Blends Section -->
<section id="blends" class="bg-secondary py-20">
  <div class="container">
    <div class="text-center mb-16">
      <div class="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[14px] font-nunito font-700 uppercase tracking-widest mb-4">
        Náplně
      </div>
      <h2 class="text-[48px] sm:text-[64px] lg:text-[72px] font-bebas tracking-tight mb-6">
        Vyber si svůj <span class="text-primary">Blend</span>
      </h2>
      <p class="text-[20px] text-foreground/85 max-w-2xl mx-auto">
        Čtyři jedinečné chutě pro každou příležitost
      </p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      <!-- Blend 1 -->
      <div class="bg-bonds-red rounded-2xl p-8 text-white">
        <div class="flex justify-between items-center mb-4">
          <span class="font-nunito text-[14px] font-700 uppercase tracking-widest opacity-55">No. 1</span>
          <span class="font-nunito text-[14px] font-700 bg-white/20 px-3 py-1 rounded-full">Nejoblíbenější</span>
        </div>
        <h3 class="font-bebas text-[35px] tracking-wide mb-4">Classic Red</h3>
        <p class="font-nunito text-[16px] opacity-75 leading-relaxed mb-6">
          Plný tabákový zážitek s bohatou chutí
        </p>
        <div class="flex gap-1.5">
          ${Array(5).fill('<div class="h-1.5 flex-1 rounded-full bg-white opacity-80"></div>').join('')}
        </div>
      </div>
      
      <!-- Blend 2 -->
      <div class="bg-bonds-gold rounded-2xl p-8 text-bonds-dark">
        <div class="flex justify-between items-center mb-4">
          <span class="font-nunito text-[14px] font-700 uppercase tracking-widest opacity-55">No. 2</span>
          <span class="font-nunito text-[14px] font-700 bg-white/20 px-3 py-1 rounded-full">Pro začátečníky</span>
        </div>
        <h3 class="font-bebas text-[35px] tracking-wide mb-4">Smooth Gold</h3>
        <p class="font-nunito text-[16px] opacity-75 leading-relaxed mb-6">
          Jemná, vyrovnaná chuť s lehkým dřevitým podtónem
        </p>
        <div class="flex gap-1.5">
          ${Array(3).fill('<div class="h-1.5 flex-1 rounded-full bg-bonds-dark opacity-80"></div>').join('')}
          ${Array(2).fill('<div class="h-1.5 flex-1 rounded-full bg-bonds-dark opacity-20"></div>').join('')}
        </div>
      </div>
      
      <!-- Blend 3 -->
      <div class="bg-[#1A4A5A] rounded-2xl p-8 text-white">
        <div class="flex justify-between items-center mb-4">
          <span class="font-nunito text-[14px] font-700 uppercase tracking-widest opacity-55">No. 3</span>
          <span class="font-nunito text-[14px] font-700 bg-white/20 px-3 py-1 rounded-full">Osvěžující</span>
        </div>
        <h3 class="font-bebas text-[35px] tracking-wide mb-4">Menthol Cool</h3>
        <p class="font-nunito text-[16px] opacity-75 leading-relaxed mb-6">
          Osvěžující mentolová svěžest pro aktivní momenty
        </p>
        <div class="flex gap-1.5">
          ${Array(3).fill('<div class="h-1.5 flex-1 rounded-full bg-white opacity-80"></div>').join('')}
          ${Array(2).fill('<div class="h-1.5 flex-1 rounded-full bg-white opacity-20"></div>').join('')}
        </div>
      </div>
      
      <!-- Blend 4 -->
      <div class="bg-[#3D2B1F] rounded-2xl p-8 text-white">
        <div class="flex justify-between items-center mb-4">
          <span class="font-nunito text-[14px] font-700 uppercase tracking-widest opacity-55">No. 4</span>
          <span class="font-nunito text-[14px] font-700 bg-white/20 px-3 py-1 rounded-full">Pro znalce</span>
        </div>
        <h3 class="font-bebas text-[35px] tracking-wide mb-4">Bronze Rich</h3>
        <p class="font-nunito text-[16px] opacity-75 leading-relaxed mb-6">
          Intenzivní s tóny karamelu a kouřové hloubky
        </p>
        <div class="flex gap-1.5">
          ${Array(4).fill('<div class="h-1.5 flex-1 rounded-full bg-white opacity-80"></div>').join('')}
          <div class="h-1.5 flex-1 rounded-full bg-white opacity-20"></div>
        </div>
      </div>
    </div>
  </div>
</section>`;

const newsHtml = `<!-- News Section -->
<section id="news" class="bg-white py-20">
  <div class="container">
    <div class="text-center mb-16">
      <div class="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[14px] font-nunito font-700 uppercase tracking-widest mb-4">
        Magazín
      </div>
      <h2 class="text-[48px] sm:text-[64px] lg:text-[72px] font-bebas tracking-tight mb-6">
        Co je nového
      </h2>
      <p class="text-[20px] text-foreground/85 max-w-2xl mx-auto">
        Nejnovější zprávy a aktuality ze světa BONDS
      </p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- News 1 -->
      <div class="rounded-2xl overflow-hidden shadow-lg">
        <div class="relative h-48 bg-gradient-to-br from-primary/20 to-bonds-gold/20"></div>
        <div class="p-6">
          <span class="inline-block bg-primary text-white text-[14px] font-nunito font-700 uppercase tracking-widest px-3 py-1 rounded-full mb-3">Novinka</span>
          <h3 class="font-bebas text-[28px] tracking-wide mb-3">BONDS přichází do Česka</h3>
          <p class="font-nunito text-[16px] text-foreground/70 leading-relaxed mb-4">
            Philip Morris International uvádí na český trh zařízení BONDS – kompaktní zahřívač tabáku s technologií ROUNDHEAT.
          </p>
          <div class="flex items-center gap-2">
            <span class="font-nunito text-[14px] text-foreground/50">5. března 2026</span>
          </div>
        </div>
      </div>
      
      <!-- News 2 -->
      <div class="rounded-2xl overflow-hidden shadow-lg">
        <div class="relative h-48 bg-gradient-to-br from-secondary/20 to-primary/20"></div>
        <div class="p-6">
          <span class="inline-block bg-primary text-white text-[14px] font-nunito font-700 uppercase tracking-widest px-3 py-1 rounded-full mb-3">Technologie</span>
          <h3 class="font-bebas text-[28px] tracking-wide mb-3">Technologie ROUNDHEAT</h3>
          <p class="font-nunito text-[16px] text-foreground/70 leading-relaxed mb-4">
            Vnější odporové zahřívání obklopí tabák rovnoměrným teplem — bez plamene, bez spalování.
          </p>
          <div class="flex items-center gap-2">
            <span class="font-nunito text-[14px] text-foreground/50">28. února 2026</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`;

const tipsHtml = `<!-- Tips Section -->
<section id="tips" class="bg-secondary py-20">
  <div class="container">
    <div class="text-center mb-16">
      <div class="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[14px] font-nunito font-700 uppercase tracking-widest mb-4">
        Průvodce
      </div>
      <h2 class="text-[48px] sm:text-[64px] lg:text-[72px] font-bebas tracking-tight mb-6">
        Tipy a návody
      </h2>
      <p class="text-[20px] text-foreground/85 max-w-2xl mx-auto">
        Jak si užít BONDS na maximum
      </p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- Tip 1 -->
      <div class="bg-white rounded-2xl p-8">
        <div class="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-6">
          <span class="text-white text-[24px]">🔋</span>
        </div>
        <h3 class="font-bebas text-[28px] tracking-wide mb-4">Správné nabíjení</h3>
        <p class="font-nunito text-[16px] text-foreground/70 leading-relaxed">
          BONDS nabijte vždy na 100% před prvním použitím. Pravidelné nabíjení prodlužuje životnost baterie.
        </p>
      </div>
      
      <!-- Tip 2 -->
      <div class="bg-white rounded-2xl p-8">
        <div class="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-6">
          <span class="text-white text-[24px]">🌡️</span>
        </div>
        <h3 class="font-bebas text-[28px] tracking-wide mb-4">Optimální teplota</h3>
        <p class="font-nunito text-[16px] text-foreground/70 leading-relaxed">
          Pro nejlepší chuť nechte zařízení zahřát na plnou teplotu 350°C před vložením náplně.
        </p>
      </div>
      
      <!-- Tip 3 -->
      <div class="bg-white rounded-2xl p-8">
        <div class="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-6">
          <span class="text-white text-[24px]">🧼</span>
        </div>
        <h3 class="font-bebas text-[28px] tracking-wide mb-4">Údržba a čištění</h3>
        <p class="font-nunito text-[16px] text-foreground/70 leading-relaxed">
          Pravidelně čistěte zahřívací komoru suchým hadříkem. Nikdy nepoužívejte vodu ani čisticí prostředky.
        </p>
      </div>
    </div>
  </div>
</section>`;

const ctaHtml = `<!-- CTA Section -->
<section id="cta" class="bg-primary py-20 text-white">
  <div class="container text-center">
    <h2 class="text-[48px] sm:text-[64px] lg:text-[72px] font-bebas tracking-tight mb-6">
      Začni svůj příběh s BONDS
    </h2>
    <p class="text-[20px] text-white/85 max-w-2xl mx-auto mb-10">
      Objev nový způsob vychutnání tabáku bez kompromisů.
    </p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <a href="/koupit" class="bg-white text-primary font-nunito text-[18px] font-700 px-8 py-4 rounded-full hover:bg-gray-100 transition-colors">
        Koupit BONDS
      </a>
      <a href="/poradit" class="bg-transparent border-2 border-white text-white font-nunito text-[18px] font-700 px-8 py-4 rounded-full hover:bg-white/10 transition-colors">
        Potřebuji poradit
      </a>
    </div>
  </div>
</section>`;

// Vytvořit novou stránku
let newPage = [];

// Přidat vše před Why Bonds
for (let i = 0; i <= insertAfterHero; i++) {
  newPage.push(lines[i]);
}

// Přidat ROUNDHEAT
newPage.push(roundheatHtml);

// Přidat zbytek až po Why Bonds
let whyBondsEnd = -1;
for (let i = insertAfterHero + 1; i < lines.length; i++) {
  if (lines[i].includes('</section></div>') && i > insertAfterHero) {
    whyBondsEnd = i;
    break;
  }
}

if (whyBondsEnd !== -1) {
  for (let i = insertAfterHero + 1; i <= whyBondsEnd; i++) {
    newPage.push(lines[i]);
  }
}

// Přidat další sekce před footer
newPage.push(blendsHtml);
newPage.push(newsHtml);
newPage.push(tipsHtml);
newPage.push(ctaHtml);

// Přidat footer a zbytek
for (let i = whyBondsEnd + 1; i < lines.length; i++) {
  newPage.push(lines[i]);
}

// Uložit
fs.writeFileSync('./projects/bondsky/completed_page.html', newPage.join('\n'));
console.log('Vytvořeno: completed_page.html (' + newPage.length + ' řádků)');

// Také vytvořit pouze s ROUNDHEAT pro test
let simplePage = [];
for (let i = 0; i <= insertAfterHero; i++) {
  simplePage.push(lines[i]);
}
simplePage.push(roundheatHtml);
for (let i = insertAfterHero + 1; i < lines.length; i++) {
  simplePage.push(lines[i]);
}
fs.writeFileSync('./projects/bondsky/page_with_roundheat_only.html', simplePage.join('\n'));
console.log('Vytvořeno: page_with_roundheat_only.html (' + simplePage.length + ' řádků)');