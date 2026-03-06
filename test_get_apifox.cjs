const https = require('https');

const options = {
  hostname: 'gpt-best.apifox.cn',
  port: 443,
  path: '/',
  method: 'GET'
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (d) => body += d);
  res.on('end', () => {
    const match = body.match(/https:\/\/mock\.apifox\.cn[^"']+/g);
    console.log("Mock URLs found:", match);
    const apiMatch = body.match(/https:\/\/[^"']+/g);
    const uniqueUrls = [...new Set(apiMatch)].filter(url => !url.includes('cdn.apifox.com'));
    console.log("Other URLs found:", uniqueUrls.slice(0, 20));
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.end();
