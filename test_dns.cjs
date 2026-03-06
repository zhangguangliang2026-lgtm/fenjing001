const dns = require('dns');
dns.resolve('api.platonai.cn', (err, addresses) => {
  if (err) console.error(err);
  else console.log('api.platonai.cn:', addresses);
});
dns.resolve('gpt-best.apifox.cn', (err, addresses) => {
  if (err) console.error(err);
  else console.log('gpt-best.apifox.cn:', addresses);
});
