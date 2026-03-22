import fs from 'fs';

// Read the file and isolate the exported NAKSHATRA_LORE object
const content = fs.readFileSync('src/data/nakshatra_lore.js', 'utf-8');
const match = content.match(/export const NAKSHATRA_LORE = (\{[\s\S]*?\});?\n?$/);
if (!match) {
  console.log("Could not find NAKSHATRA_LORE");
  process.exit(1);
}

const lore = eval("(" + match[1] + ")");
const languages = ['en', 'hi', 'kn', 'te', 'ta', 'mr', 'gu', 'bn', 'ml', 'sa'];
const attrs = ['planet', 'deity', 'symbol', 'gana', 'nature', 'animal', 'goal', 'guna'];

for (const lang of languages) {
  if (!lore[lang]) {
    console.log(`Lang ${lang} entirely missing`);
    continue;
  }
  
  for (let i = 0; i < 27; i++) {
    const nak = lore[lang][i];
    if (!nak) {
      console.log(`Lang ${lang} missing nakshatra ${i}`);
      continue;
    }
    for (const attr of attrs) {
      if (!nak[attr]) {
        console.log(`Lang ${lang} nakshatra ${i} missing attr ${attr}`);
      }
    }
  }
}
console.log("Scan complete");
