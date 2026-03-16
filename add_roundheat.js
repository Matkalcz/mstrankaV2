const https = require('https');
const fs = require('fs');

const apiKey = 'msk_822251dd65802f82b1e57cb2e2dcd8ba9ec453e22ec5d129bfc812280fd391aa';
const websiteId = '0bb29aa8-00e5-4d54-ae29-83f9c9343032';
const pageId = '92b390da-dc3b-45f4-91f9-73e17e7d005e';

// 1. Initialize
const initData = JSON.stringify({
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'add-roundheat', version: '1.0.0' }
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
  
  initRes.on('data', () => {}); // Ignore init response
  
  initRes.on('end', () => {
    if (!sessionId) {
      console.error('No session ID received');
      return;
    }
    
    // 2. Add ROUNDHEAT section
    const roundheatHtml = fs.readFileSync('./projects/bondsky/roundheat_complete.html', 'utf8');
    
    const addSectionData = JSON.stringify({
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'add_section',
        arguments: {
          websiteId: websiteId,
          pageId: pageId,
          name: 'roundheat-technology',
          htmlContent: roundheatHtml,
          sortOrder: 2, // After Hero (1), before Why Bonds (3)
          title: 'ROUNDHEAT Technology',
          showInMenu: false,
          showOnPage: true,
          slug: 'roundheat'
        }
      }
    });
    
    const addSectionOptions = {
      hostname: 'mcp.v2.mstranka.cz',
      port: 443,
      path: '/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
        'X-Api-Key': apiKey,
        'Mcp-Session-Id': sessionId,
        'Content-Length': addSectionData.length
      }
    };
    
    console.log('\nAdding ROUNDHEAT section...');
    
    const addSectionReq = https.request(addSectionOptions, (addSectionRes) => {
      console.log('Status:', addSectionRes.statusCode);
      
      let response = '';
      addSectionRes.on('data', (chunk) => {
        response += chunk;
      });
      
      addSectionRes.on('end', () => {
        console.log('Response:', response);
        
        // 3. Preview
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
        
        console.log('\nGetting preview URL...');
        
        const previewReq = https.request(previewOptions, (previewRes) => {
          let previewResponse = '';
          previewRes.on('data', (chunk) => {
            previewResponse += chunk;
          });
          
          previewRes.on('end', () => {
            console.log('Preview Response:', previewResponse);
          });
        });
        
        previewReq.write(previewData);
        previewReq.end();
      });
    });
    
    addSectionReq.on('error', (error) => {
      console.error('Add Section Error:', error);
    });
    
    addSectionReq.write(addSectionData);
    addSectionReq.end();
  });
});

initReq.on('error', (error) => {
  console.error('Init Error:', error);
});

initReq.write(initData);
initReq.end();
