const fs = require('fs');
const acorn = require('acorn');
const html = fs.readFileSync('prototype_3d_client.html', 'utf8');
const scriptMatch = html.match(/<script type="module">([\s\S]*?)<\/script>/);
if (!scriptMatch) { console.log("No script module found."); process.exit(1); }
const script = scriptMatch[1];
try {
  acorn.parse(script, { ecmaVersion: 2022, sourceType: 'module' });
  console.log("Syntax is valid!");
} catch (e) {
  console.error("Syntax edge case:", e);
}
