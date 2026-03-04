const fs = require('fs');
const html = fs.readFileSync('output.html', 'utf-8');
const match = html.match(/window\.__PRELOADED_STATE__\s*=\s*(.*?);<\/script>/);
if (match) {
  const state = JSON.parse(match[1]);
  console.log(JSON.stringify(state, null, 2));
} else {
  console.log("No preloaded state found");
}
