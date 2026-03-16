const https = require('https');
const fs = require('fs');

const apiKey = 'msk_822251dd65802f82b1e57cb2e2dcd8ba9ec453e22ec5d129bfc812280fd391aa';
const websiteId = '0bb29aa8-00e5-4d54-ae29-83f9c9343032';

// Funkce pro escape JSON stringu
function escapeHtmlForJson(html) {
  return html
    .replace(/\\/g, '\\\\')  // Escape backslashes first
    .replace(/"/g, '\\"')    // Escape double quotes
    .replace(/\n/g, ' ')     // Replace newlines with spaces
    .replace(/\r/g, ' ')     // Replace carriage returns
    .replace(/\t/g, ' ');    // Replace tabs
}

// Načíst a escapeovat HTML
const roundheatHtml = fs.readFileSync('./projects/bondsky/roundheat_simple.html', 'utf8');
const escapedRoundheat = escapeHtmlForJson(roundheatHtml);

console.log('🚀 FINÁLNÍ OPRAVA: Naplňuji sekce správným obsahem\n');

// 1. Initialize
const initData = JSON.stringify({
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'final-fix', version: '1.0.0' }
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

const initReq = https.request(initOptions, (initRes) => {
  const sessionId = initRes.headers['mcp-session-id'];
  console.log('✅ Připojeno, Session ID:', sessionId);
  
  initRes.on('data', () => {});
  initRes.on('end', () => {
    if (!sessionId) {
      console.error('❌ Chyba: Žádné session ID');
      return;
    }
    
    // 2. Edit ROUNDHEAT section
    const editData = JSON.stringify({
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'edit_section',
        arguments: {
          websiteId: websiteId,
          sectionId: 'e0aad26f-b1d7-4f49-8ac5-6a2f34c8d9e4',
          name: 'ROUNDHEAT Technology',
          htmlContent: escapedRoundheat,
          sortOrder: 6,
          title: 'ROUNDHEAT Technology',
          showInMenu: false,
          showOnPage: true,
          slug: 'roundheat-technology'
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
    
    console.log('\n📝 Naplňuji ROUNDHEAT sekci...');
    
    const editReq = https.request(editOptions, (editRes) => {
      console.log('Status:', editRes.statusCode);
      
      let response = '';
      editRes.on('data', (chunk) => {
        response += chunk;
      });
      
      editRes.on('end', () => {
        if (editRes.statusCode === 200) {
          console.log('✅ ROUNDHEAT sekce naplněna!');
          
          // 3. Získat preview
          const previewData = JSON.stringify({
            jsonrpc: '2.0',
            id: 3,
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
          
          console.log('\n🔗 Získávám preview URL...');
          
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
                console.log('• ROUNDHEAT Technology sekce (měla by být vidět)');
                console.log('• Hero sekce (stále tam)');
                console.log('• Why Bonds sekce (stále tam)');
                console.log('\nPokud je ROUNDHEAT sekce vidět, můžeme publikovat:');
                console.log(`mcporter call mstranka.publish --websiteId "${websiteId}"`);
              }
            });
          });
          
          previewReq.write(previewData);
          previewReq.end();
          
        } else {
          console.log('❌ Chyba:', response);
        }
      });
    });
    
    editReq.on('error', (error) => {
      console.error('❌ Edit Error:', error);
    });
    
    editReq.write(editData);
    editReq.end();
  });
});

initReq.on('error', (error) => {
  console.error('❌ Init Error:', error);
});

initReq.write(initData);
initReq.end();