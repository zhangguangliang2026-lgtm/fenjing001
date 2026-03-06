const https = require('https');

const data = JSON.stringify({
  model: "claude-sonnet-4-6",
  messages: [
    { role: "user", content: "写一篇1000字的文章介绍人工智能。" }
  ],
  stream: true,
  max_tokens: 50
});

const options = {
  hostname: 'api.bltcy.top',
  port: 443,
  path: '/v1/chat/completions',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer sk-xxxx' // We don't have the key here, but wait, the user provided it in their UI. I can't test it without the key.
  }
};
