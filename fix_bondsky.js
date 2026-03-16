const { execSync } = require('child_process');
const fs = require('fs');

const websiteId = '0bb29aa8-00e5-4d54-ae29-83f9c9343032';

// Načíst HTML obsah
const roundheatHtml = fs.readFileSync('./projects/bondsky/roundheat_simple.html', 'utf8');
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
          <div class="h-1.5 flex-1 rounded-full bg-white opacity-80"></div>
          <div class="h-1.5 flex-1 rounded-full bg-white opacity-80"></div>
          <div class="h-1.5 flex-1 rounded-full bg-white opacity-80"></div>
          <div class="h-1.5 flex-1 rounded-full bg-white opacity-80"></div>
          <div class="h-1.5 flex-1 rounded-full bg-white opacity-80"></div>
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
          <div class="h-1.5 flex-1 rounded-full bg-bonds-dark opacity-80"></div>
          <div class="h-1.5 flex-1 rounded-full bg-bonds-dark opacity-80"></div>
          <div class="h-1.5 flex-1 rounded-full bg-bonds-dark opacity-80"></div>
          <div class="h-1.5 flex-1 rounded-full bg-bonds-dark opacity-20"></div>
          <div class="h-1.5 flex-1 rounded-full bg-bonds-dark opacity-20"></div>
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
          <div class="h-1.5 flex-1 rounded-full bg-white opacity-80"></div>
          <div class="h-1.5 flex-1 rounded-full bg-white opacity-80"></div>
          <div class="h-1.5 flex-1 rounded-full bg-white opacity-80"></div>
          <div class="h-1.5 flex-1 rounded-full bg-white opacity-20"></div>
          <div class="h-1.5 flex-1 rounded-full bg-white opacity-20"></div>
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
          <div class="h-1.5 flex-1 rounded-full bg-white opacity-80"></div>
          <div class="h-1.5 flex-1 rounded-full bg-white opacity-80"></div>
          <div class="h-1.5 flex-1 rounded-full bg-white opacity-80"></div>
          <div class="h-1.5 flex-1 rounded-full bg-white opacity-80"></div>
          <div class="h-1.5 flex-1 rounded-full bg-white opacity-20"></div>
        </div>
      </div>
    </div>
  </div>
</section>`;

console.log('🚀 Opravuji Bondsky web...\n');

// Funkce pro volání mcporter
function mcporterCall(method, args) {
  const argsStr = Object.entries(args)
    .map(([key, value]) => `--${key} "${value}"`)
    .join(' ');
  
  const cmd = `mcporter call mstranka.${method} ${argsStr} 2>&1`;
  console.log(`📞 Volám: ${method}`);
  
  try {
    const result = execSync(cmd, { cwd: __dirname, encoding: 'utf8' });
    console.log(`✅ ${method}: Úspěch\n`);
    return result;
  } catch (error) {
    console.log(`❌ ${method}: Chyba - ${error.message}\n`);
    return null;
  }
}

// 1. Nejprve preview, abychom viděli aktuální stav
console.log('1. Získávám preview URL...');
const previewResult = mcporterCall('preview', { websiteId });
if (previewResult) {
  const previewMatch = previewResult.match(/"previewUrl":"([^"]+)"/);
  if (previewMatch) {
    console.log(`🔗 Preview URL: ${previewMatch[1]}`);
    console.log('Otevři tuto URL v prohlížeči pro zobrazení aktuálního stavu.\n');
  }
}

// 2. Upravit ROUNDHEAT sekci
console.log('2. Přidávám obsah do ROUNDHEAT sekce...');
const roundheatArgs = {
  websiteId,
  sectionId: 'e0aad26f-b1d7-4f49-8ac5-6a2f34c8d9e4',
  name: 'ROUNDHEAT Technology',
  htmlContent: roundheatHtml.replace(/"/g, '\\"').replace(/\n/g, ' '),
  sortOrder: '6',
  title: 'ROUNDHEAT Technology',
  showInMenu: 'false',
  showOnPage: 'true',
  slug: 'roundheat-technology'
};
mcporterCall('edit_section', roundheatArgs);

// 3. Upravit Blends sekci
console.log('3. Přidávám obsah do Blends sekce...');
const blendsArgs = {
  websiteId,
  sectionId: '3f5d729e-7420-4a8e-8d8e-87ff434e2c6e',
  name: 'Blends',
  htmlContent: blendsHtml.replace(/"/g, '\\"').replace(/\n/g, ' '),
  sortOrder: '8',
  title: 'Blends',
  showInMenu: 'false',
  showOnPage: 'true',
  slug: 'blends'
};
mcporterCall('edit_section', blendsArgs);

// 4. Znovu preview po změnách
console.log('4. Získávám nové preview po změnách...');
const newPreviewResult = mcporterCall('preview', { websiteId });
if (newPreviewResult) {
  const newPreviewMatch = newPreviewResult.match(/"previewUrl":"([^"]+)"/);
  if (newPreviewMatch) {
    console.log(`🔗 NOVÁ Preview URL: ${newPreviewMatch[1]}`);
    console.log('\n🎉 Hotovo! Otevři novou preview URL a zkontroluj:');
    console.log('  1. ROUNDHEAT Technology sekce');
    console.log('  2. Blends sekce');
    console.log('\nPokud je vše OK, můžeme publikovat změny.');
  }
}

console.log('\n📝 Pro publikování změn spusť:');
console.log(`mcporter call mstranka.publish --websiteId "${websiteId}"`);