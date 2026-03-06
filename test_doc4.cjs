const https = require('https');

const options = {
  hostname: 'gpt-best.apifox.cn',
  port: 443,
  path: '/doc-6535931',
  method: 'GET'
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (d) => body += d);
  res.on('end', () => {
    const matches = body.match(/https:\/\/[a-zA-Z0-9.-]+/g);
    const uniqueUrls = [...new Set(matches)].filter(url => !url.includes('apifox'));
    console.log("URLs:", uniqueUrls);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.end();
