const https = require('https');

const apiKey = 'msk_822251dd65802f82b1e57cb2e2dcd8ba9ec453e22ec5d129bfc812280fd391aa';
const websiteId = '0bb29aa8-00e5-4d54-ae29-83f9c9343032';
const sessionId = 'g_q97C-YQTZKDBmIGSslZA';

// Nejprve zkusit edit_section na existující sekci
// Potřebuji sectionId - zkusím "why-bonds" sekci
const editData = JSON.stringify({
  jsonrpc: '2.0',
  id: 2,
  method: 'tools/call',
  params: {
    name: 'edit_section',
    arguments: {
      websiteId: websiteId,
      sectionId: '946ea13d-5e9b-4132-8e5d-ded98432ef20', // Why Bonds section ID z dřívějška
      name: 'why-bonds',
      htmlContent: '<section id="why-bonds" class="py-20 bg-bonds-dark text-white"><div class="container"><p>TEST - sekce upravena</p></div></section>',
      sortOrder: 2,
      title: 'Why Bonds TEST',
      showInMenu: false,
      showOnPage: true,
      slug: 'why-bonds'
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
    'Mcp-Session-Id': sessionId,
    'Content-Length': editData.length
  }
};

console.log('Testing edit_section...');

const req = https.request(options, (res) => {
  console.log('Status:', res.statusCode);
  
  let response = '';
  res.on('data', (chunk) => {
    response += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', response);
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.write(editData);
req.end();
