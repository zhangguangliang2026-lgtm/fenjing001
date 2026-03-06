const https = require('https');
const data = JSON.stringify({
  model: "claude-sonnet-4-6",
  messages: [{"role": "user", "content": "Hello!"}],
  temperature: 0.7,
  max_tokens: 8192
});

const options = {
  hostname: 'mock.apifox.cn',
  port: 443,
  path: '/m1/3868318-0-default/v1/chat/completions',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer test',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = https.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  let body = '';
  res.on('data', (d) => body += d);
  res.on('end', () => console.log(body.substring(0, 200)));
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
