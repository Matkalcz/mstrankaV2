const https = require('https');

const apiKey = 'msk_822251dd65802f82b1e57cb2e2dcd8ba9ec453e22ec5d129bfc812280fd391aa';
const websiteId = '0bb29aa8-00e5-4d54-ae29-83f9c9343032';

// Nejprve initialize
const initializeData = JSON.stringify({
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: {
      name: 'bondsky-fixer-test',
      version: '1.0.0'
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
    'Authorization': `Bearer ${apiKey}`,
    'Content-Length': initializeData.length
  }
};

console.log('Sending initialize request...');

const req = https.request(options, (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', JSON.stringify(res.headers, null, 2));
  
  let response = '';
  res.on('data', (chunk) => {
    response += chunk;
  });
  
  res.on('end', () => {
    console.log('Initialize response:', response);
    
    // Získat session ID z headers
    const sessionId = res.headers['mcp-session-id'];
    if (sessionId) {
      console.log('Session ID:', sessionId);
      
      // Teď zkusit get_context
      const contextData = JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: 'get_context',
          arguments: {
            websiteId: websiteId
          }
        }
      });
      
      const contextOptions = {
        hostname: 'mcp.v2.mstranka.cz',
        port: 443,
        path: '/',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/event-stream',
          'Authorization': `Bearer ${apiKey}`,
          'Mcp-Session-Id': sessionId,
          'Content-Length': contextData.length
        }
      };
      
      console.log('\nSending get_context request...');
      
      const contextReq = https.request(contextOptions, (contextRes) => {
        console.log('Context Status:', contextRes.statusCode);
        
        let contextResponse = '';
        contextRes.on('data', (chunk) => {
          contextResponse += chunk;
        });
        
        contextRes.on('end', () => {
          console.log('Context response (first 500 chars):', contextResponse.substring(0, 500));
        });
      });
      
      contextReq.on('error', (error) => {
        console.error('Context Error:', error);
      });
      
      contextReq.write(contextData);
      contextReq.end();
    }
  });
});

req.on('error', (error) => {
  console.error('Initialize Error:', error);
});

req.write(initializeData);
req.end();
