const https = require('https');
const options = {
  hostname: 'api.bltcy.top',
  port: 443,
  path: '/v1/chat/completions',
  method: 'OPTIONS',
  headers: {
    'Origin': 'https://example.com',
    'Access-Control-Request-Method': 'POST'
  }
};

const req = https.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.end();
