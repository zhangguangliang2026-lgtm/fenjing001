const https = require('https');
https.get('https://cdn.apifox.com/app/project-data/3868318/api-266125085.json', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log(data));
}).on('error', (err) => console.log(err.message));
