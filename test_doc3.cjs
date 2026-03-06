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
    // Extract the text content from the HTML
    const match = body.match(/Base URL.*?API Key/i);
    const text = body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    const startIndex = text.indexOf('获取 Base URL 和 API Key');
    console.log("Text:", text.substring(startIndex, startIndex + 1000));
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.end();
