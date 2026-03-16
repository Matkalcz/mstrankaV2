const https = require('https');
const fs = require('fs');

const apiKey = 'msk_822251dd65802f82b1e57cb2e2dcd8ba9ec453e22ec5d129bfc812280fd391aa';
const websiteId = '0bb29aa8-00e5-4d54-ae29-83f9c9343032';

// Načíst HTML obsah
const roundheatHtml = fs.readFileSync('./projects/bondsky/roundheat_simple.html', 'utf8');

// 1. Initialize
const initData = JSON.stringify({
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'fill-sections', version: '1.0.0' }
  }
});

const initOptions = {
  hostname: 'mcp.v2.mstranka.cz',
  port: 443,
  path: '/',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/event-stream',
    'X-Api-Key': apiKey,
    'Content-Length': initData.length
  }
};

console.log('🚀 Naplňuji sekce Bondsky webu...\n');

const initReq = https.request(initOptions, (initRes) => {
  const sessionId = initRes.headers['mcp-session-id'];
  console.log('Session ID:', sessionId);
  
  initRes.on('data', () => {});
  initRes.on('end', () => {
    if (!sessionId) {
      console.error('❌ Chyba: Žádné session ID');
      return;
    }
    
    // Funkce pro editaci sekce
    function editSection(sectionId, name, html, sortOrder, slug) {
      return new Promise((resolve) => {
        const editData = JSON.stringify({
          jsonrpc: '2.0',
          id: Date.now(),
          method: 'tools/call',
          params: {
            name: 'edit_section',
            arguments: {
              websiteId: websiteId,
              sectionId: sectionId,
              name: name,
              htmlContent: html,
              sortOrder: sortOrder,
              title: name,
              showInMenu: false,
              showOnPage: true,
              slug: slug
            }
          }
        });
        
        const editOptions = {
          hostname: 'mcp.v2.mstranka.cz',
          port: 443,
          path: '/',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/event-stream',
            'X-Api-Key': apiKey,
            'Mcp-Session-Id': sessionId,
            'Content-Length': editData.length
          }
        };
        
        console.log(`📝 Naplňuji sekci: ${name}...`);
        
        const editReq = https.request(editOptions, (editRes) => {
          let response = '';
          editRes.on('data', (chunk) => {
            response += chunk;
          });
          editRes.on('end', () => {
            if (editRes.statusCode === 200) {
              console.log(`✅ ${name}: Úspěch`);
            } else {
              console.log(`❌ ${name}: Chyba (${editRes.statusCode})`);
            }
            resolve();
          });
        });
        
        editReq.on('error', (error) => {
          console.error(`❌ ${name}: ${error.message}`);
          resolve();
        });
        
        editReq.write(editData);
        editReq.end();
      });
    }
    
    // Naplnit sekce postupně
    async function fillSections() {
      // 1. ROUNDHEAT
      await editSection(
        'e0aad26f-b1d7-4f49-8ac5-6a2f34c8d9e4',
        'ROUNDHEAT Technology',
        roundheatHtml,
        6,
        'roundheat-technology'
      );
      
      // 2. Blends (zjednodušené)
      const blendsHtml = `<section id="blends" class="bg-secondary py-20">
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
          <div class="text-center">
            <p class="text-lg">Blends sekce - obsah bude doplněn</p>
          </div>
        </div>
      </section>`;
      
      await editSection(
        '3f5d729e-7420-4a8e-8d8e-87ff434e2c6e',
        'Blends',
        blendsHtml,
        8,
        'blends'
      );
      
      // 3. Získat preview
      console.log('\n🔗 Získávám preview URL...');
      const previewData = JSON.stringify({
        jsonrpc: '2.0',
        id: 999,
        method: 'tools/call',
        params: {
          name: 'preview',
          arguments: { websiteId: websiteId }
        }
      });
      
      const previewOptions = {
        hostname: 'mcp.v2.mstranka.cz',
        port: 443,
        path: '/',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/event-stream',
          'X-Api-Key': apiKey,
          'Mcp-Session-Id': sessionId,
          'Content-Length': previewData.length
        }
      };
      
      const previewReq = https.request(previewOptions, (previewRes) => {
        let previewResponse = '';
        previewRes.on('data', (chunk) => {
          previewResponse += chunk;
        });
        previewRes.on('end', () => {
          const match = previewResponse.match(/"previewUrl":"([^"]+)"/);
          if (match) {
            const previewUrl = decodeURIComponent(match[1]);
            console.log('\n🎉 HOTOVO!');
            console.log(`🔗 Preview URL: ${previewUrl}`);
            console.log('\nOtevři tuto URL v prohlížeči a zkontroluj:');
            console.log('1. ROUNDHEAT Technology sekce');
            console.log('2. Blends sekce');
            console.log('\nPokud je vše OK, publikuj změny:');
            console.log(`mcporter call mstranka.publish --websiteId "${websiteId}"`);
          }
        });
      });
      
      previewReq.write(previewData);
      previewReq.end();
    }
    
    fillSections();
  });
});

initReq.on('error', (error) => {
  console.error('❌ Init Error:', error);
});

initReq.write(initData);
initReq.end();
