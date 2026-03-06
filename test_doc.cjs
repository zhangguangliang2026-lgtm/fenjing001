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
    const match = body.match(/https:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
    const uniqueUrls = [...new Set(match)].filter(url => !url.includes('cdn.apifox.com') && !url.includes('apifox.cn'));
    console.log("URLs found in doc-6535931:", uniqueUrls);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.end();
