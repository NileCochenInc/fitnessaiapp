const http = require('http');
const https = require('https');

const PORT = 3001;
const ADMIN_DASH_URL = 'https://fitness-ai-app-admin.ashycliff-d78872a9.canadacentral.azurecontainerapps.io';
const BEARER_TOKEN = 'Bearer HJKY&&*&HIUHIkt6yui9876';

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = `${ADMIN_DASH_URL}${req.url}`;
  console.log(`[${new Date().toISOString()}] Proxying: ${url}`);

  const options = {
    method: req.method || 'GET',
    headers: {
      'Authorization': BEARER_TOKEN,
      'Content-Type': 'application/json'
    },
    rejectUnauthorized: false // For self-signed certificates
  };

  const proxyReq = https.request(url, options, (proxyRes) => {
    console.log(`[${new Date().toISOString()}] Response: ${proxyRes.statusCode}`);
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error(`[${new Date().toISOString()}] Error: ${err.message}`);
    res.writeHead(500);
    res.end(JSON.stringify({ error: 'Proxy error: ' + err.message }));
  });

  if (req.method === 'POST') {
    req.pipe(proxyReq);
  } else {
    proxyReq.end();
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Admin-Dash Proxy Server running on http://localhost:${PORT}`);
  console.log(`📡 Proxying requests to: ${ADMIN_DASH_URL}`);
  console.log(`🔐 Authentication: Bearer token configured`);
});
