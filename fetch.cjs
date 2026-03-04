const https = require('https');
https.get('https://gpt-best.apifox.cn/api-266125085', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log(data));
}).on('error', (err) => console.log(err.message));
