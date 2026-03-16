const https = require('https');

const apiKey = 'msk_822251dd65802f82b1e57cb2e2dcd8ba9ec453e22ec5d129bfc812280fd391aa';
const websiteId = '0bb29aa8-00e5-4d54-ae29-83f9c9343032';

// 1. Initialize
const initData = JSON.stringify({
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'minimal-test', version: '1.0.0' }
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

console.log('Testing with minimal HTML...');

const initReq = https.request(initOptions, (initRes) => {
  const sessionId = initRes.headers['mcp-session-id'];
  console.log('Session ID:', sessionId);
  
  initRes.on('data', () => {});
  initRes.on('end', () => {
    if (!sessionId) return;
    
    // MINIMAL HTML - bez speciálních znaků
    const minimalHtml = '<div class="container"><h2>ROUNDHEAT</h2><p>Minimal content</p></div>';
    
    const editData = JSON.stringify({
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'edit_section',
        arguments: {
          websiteId: websiteId,
          sectionId: 'e0aad26f-b1d7-4f49-8ac5-6a2f34c8d9e4',
          name: 'ROUNDHEAT',
          htmlContent: minimalHtml,
          sortOrder: 6,
          title: 'ROUNDHEAT',
          showInMenu: false,
          showOnPage: true,
          slug: 'roundheat'
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
    
    console.log('\nSending edit request...');
    
    const editReq = https.request(editOptions, (editRes) => {
      console.log('Status:', editRes.statusCode);
      console.log('Headers:', JSON.stringify(editRes.headers, null, 2));
      
      let response = '';
      editRes.on('data', (chunk) => {
        response += chunk;
      });
      
      editRes.on('end', () => {
        console.log('Response:', response);
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
