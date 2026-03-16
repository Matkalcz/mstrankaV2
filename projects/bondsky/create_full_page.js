const fs = require('fs');

// Načíst aktuální stránku
const currentPage = fs.readFileSync('./projects/bondsky/current_page.html', 'utf8');
const lines = currentPage.split('\n');

// Najít pozice
let heroEndIndex = -1;
let whyBondsEndIndex = -1;
let footerStartIndex = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('</section></div><div id="why-bonds"')) {
    heroEndIndex = i;
  }
  if (lines[i].includes('</section></div>') && i > heroEndIndex && heroEndIndex !== -1 && whyBondsEndIndex === -1) {
    whyBondsEndIndex = i;
  }
  if (lines[i].includes('<footer')) {
    footerStartIndex = i;
    break;
  }
}

console.log('Pozice:');
console.log('Hero konec:', heroEndIndex);
console.log('Why Bonds konec:', whyBondsEndIndex);
console.log('Footer začátek:', footerStartIndex);

// Načíst chybějící sekce
const roundheatHtml = fs.readFileSync('./projects/bondsky/roundheat_complete.html', 'utf8');
const missingSections = fs.readFileSync('./projects/bondsky/missing_sections.html', 'utf8');

// Rozdělit missing sections na jednotlivé sekce
const sections = missingSections.split('<!-- ');
const blendsSection = sections.find(s => s.includes('Blends Section'));
const newsSection = sections.find(s => s.includes('News Section'));
// Tips section bude další...

// Vytvořit novou stránku
let newPage = [];

// Přidat Hero sekci
for (let i = 0; i <= heroEndIndex; i++) {
  newPage.push(lines[i]);
}

// Přidat ROUNDHEAT
newPage.push(roundheatHtml);

// Přidat Why Bonds
for (let i = heroEndIndex + 1; i <= whyBondsEndIndex; i++) {
  newPage.push(lines[i]);
}

// Přidat Blends sekci (pokud existuje)
if (blendsSection) {
  newPage.push('<!-- ' + blendsSection);
}

// Přidat News sekci (pokud existuje)
if (newsSection) {
  newPage.push('<!-- ' + newsSection);
}

// Přidat Footer a zbytek
for (let i = whyBondsEndIndex + 1; i < lines.length; i++) {
  newPage.push(lines[i]);
}

// Uložit
fs.writeFileSync('./projects/bondsky/full_page_with_all_sections.html', newPage.join('\n'));
console.log('Vytvořeno: full_page_with_all_sections.html (' + newPage.length + ' řádků)');