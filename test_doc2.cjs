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
    const text = body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    console.log("Text:", text.substring(0, 2000));
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.end();
