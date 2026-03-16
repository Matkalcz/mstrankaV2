const https = require('https');

const apiKey = 'msk_822251dd65802f82b1e57cb2e2dcd8ba9ec453e22ec5d129bfc812280fd391aa';

// 1. Initialize
const initData = JSON.stringify({
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'test-auth', version: '1.0.0' }
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

console.log('1. Initializing...');

const initReq = https.request(initOptions, (initRes) => {
  console.log('Init Status:', initRes.statusCode);
  const sessionId = initRes.headers['mcp-session-id'];
  console.log('Session ID:', sessionId);
  
  let response = '';
  initRes.on('data', (chunk) => {
    response += chunk;
  });
  
  initRes.on('end', () => {
    console.log('Init Response:', response.substring(0, 200));
    
    if (sessionId) {
      // 2. Try preview (simple call)
      const previewData = JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: 'preview',
          arguments: { websiteId: '0bb29aa8-00e5-4d54-ae29-83f9c9343032' }
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
      
      console.log('\n2. Trying preview...');
      
      const previewReq = https.request(previewOptions, (previewRes) => {
        console.log('Preview Status:', previewRes.statusCode);
        
        let previewResponse = '';
        previewRes.on('data', (chunk) => {
          previewResponse += chunk;
        });
        
        previewRes.on('end', () => {
          console.log('Preview Response:', previewResponse);
        });
      });
      
      previewReq.on('error', (error) => {
        console.error('Preview Error:', error);
      });
      
      previewReq.write(previewData);
      previewReq.end();
    }
  });
});

initReq.on('error', (error) => {
  console.error('Init Error:', error);
});

initReq.write(initData);
initReq.end();
