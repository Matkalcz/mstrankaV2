const https = require('https');

const apiKey = 'msk_822251dd65802f82b1e57cb2e2dcd8ba9ec453e22ec5d129bfc812280fd391aa';
const websiteId = '0bb29aa8-00e5-4d54-ae29-83f9c9343032';
const pageId = '92b390da-dc3b-45f4-91f9-73e17e7d005e';

// Initialize
const initData = JSON.stringify({
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'test-minimal', version: '1.0.0' }
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

console.log('Initializing...');

const initReq = https.request(initOptions, (initRes) => {
  const sessionId = initRes.headers['mcp-session-id'];
  console.log('Session ID:', sessionId);
  
  initRes.on('data', () => {});
  initRes.on('end', () => {
    if (!sessionId) return;
    
    // Try minimal HTML
    const minimalHtml = '<div class="container py-8"><h2 class="text-3xl font-bold mb-4">ROUNDHEAT Test</h2><p>Testovací sekce</p></div>';
    
    const addData = JSON.stringify({
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'add_section',
        arguments: {
          websiteId: websiteId,
          pageId: pageId,
          name: 'test-section',
          htmlContent: minimalHtml,
          sortOrder: 2,
          title: 'Test Section',
          showInMenu: false,
          showOnPage: true,
          slug: 'test'
        }
      }
    });
    
    const options = {
      hostname: 'mcp.v2.mstranka.cz',
      port: 443,
      path: '/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
        'X-Api-Key': apiKey,
        'Mcp-Session-Id': sessionId,
        'Content-Length': addData.length
      }
    };
    
    console.log('\nAdding minimal test section...');
    
    const req = https.request(options, (res) => {
      console.log('Status:', res.statusCode);
      
      let response = '';
      res.on('data', (chunk) => {
        response += chunk;
      });
      
      res.on('end', () => {
        console.log('Full response:', response);
      });
    });
    
    req.on('error', (error) => {
      console.error('Error:', error);
    });
    
    req.write(addData);
    req.end();
  });
});

initReq.on('error', (error) => {
  console.error('Init Error:', error);
});

initReq.write(initData);
initReq.end();
