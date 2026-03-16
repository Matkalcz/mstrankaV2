const https = require('https');

const apiKey = 'msk_822251dd65802f82b1e57cb2e2dcd8ba9ec453e22ec5d129bfc812280fd391aa';
const websiteId = '0bb29aa8-00e5-4d54-ae29-83f9c9343032';

// HTML s CSS třídami které JSOU definované v customCss
const htmlWithValidClasses = `<section id="roundheat">
  <div class="container py-8">
    <div class="text-center mb-6">
      <h2 class="text-[48px] font-bebas">ROUNDHEAT Technology</h2>
      <p class="text-[20px] font-nunito">Tabák se nikdy nepálí — BONDS ho rovnoměrně zahřeje</p>
    </div>
    <div class="grid grid-cols-3 gap-4">
      <div class="bg-secondary rounded-2xl p-4 text-center">
        <div class="text-[35px] font-bebas text-primary">350 °C</div>
        <div class="text-[14px] font-nunito">Přesná teplota</div>
      </div>
      <div class="bg-secondary rounded-2xl p-4 text-center">
        <div class="text-[35px] font-bebas text-primary">~95 %</div>
        <div class="text-[14px] font-nunito">Méně škodlivin*</div>
      </div>
      <div class="bg-secondary rounded-2xl p-4 text-center">
        <div class="text-[35px] font-bebas text-primary">4 min</div>
        <div class="text-[14px] font-nunito">Sezení</div>
      </div>
    </div>
  </div>
</section>`;

// Initialize
const initData = JSON.stringify({
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'correct-test', version: '1.0.0' }
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

console.log('Testing with VALID CSS classes that are defined in customCss...\n');

const initReq = https.request(initOptions, (initRes) => {
  const sessionId = initRes.headers['mcp-session-id'];
  console.log('Session ID:', sessionId);
  
  initRes.on('data', () => {});
  initRes.on('end', () => {
    if (!sessionId) return;
    
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
          htmlContent: htmlWithValidClasses,
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
    
    console.log('Sending edit request...');
    
    const editReq = https.request(editOptions, (editRes) => {
      console.log('Status:', editRes.statusCode);
      
      let response = '';
      editRes.on('data', (chunk) => {
        response += chunk;
      });
      
      editRes.on('end', () => {
        console.log('Response (first 300 chars):', response.substring(0, 300));
        
        if (editRes.statusCode === 200) {
          console.log('\n✅ Úspěch! Sekce naplněna.');
          
          // Preview
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
          
          console.log('\nGetting preview...');
          const previewReq = https.request(previewOptions, (previewRes) => {
            let previewResponse = '';
            previewRes.on('data', (chunk) => {
              previewResponse += chunk;
            });
            previewRes.on('end', () => {
              const match = previewResponse.match(/"previewUrl":"([^"]+)"/);
              if (match) {
                console.log('\n🎉 Preview URL:', decodeURIComponent(match[1]));
              }
            });
          });
          previewReq.write(previewData);
          previewReq.end();
        }
      });
    });
    
    editReq.on('error', (error) => {
      console.error('Error:', error);
    });
    
    editReq.write(editData);
    editReq.end();
  });
});

initReq.on('error', (error) => {
  console.error('Init Error:', error);
});

initReq.write(initData);
initReq.end();
