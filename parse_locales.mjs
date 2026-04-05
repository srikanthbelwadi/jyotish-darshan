import fs from 'fs';
import path from 'path';

const localesDir = path.resolve('./src/i18n/locales');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

const L_NAKS = {};
const L_YOGA_PANCH = {};
const L_KARANA = {};

for (const f of files) {
  const lang = f.replace('.json', '');
  const data = JSON.parse(fs.readFileSync(path.join(localesDir, f), 'utf8'));
  const naks = data.astro?.nakshatras || {};
  const yogas = data.astro?.yogas || {};
  const karanas = data.astro?.karanas || {};
  
  if (Object.keys(naks).length > 0) {
    L_NAKS[lang] = Array.from({length: 27}).map((_, i) => naks[String(i)] || '');
  }
  if (Object.keys(yogas).length > 0) {
    L_YOGA_PANCH[lang] = Array.from({length: 27}).map((_, i) => yogas[String(i)] || '');
  }
  if (Object.keys(karanas).length > 0) {
    L_KARANA[lang] = Array.from({length: 11}).map((_, i) => karanas[String(i)] || '');
  }
}

console.log("export const L_NAKS = " + JSON.stringify(L_NAKS, null, 2) + ";");
console.log("export const L_YOGA_PANCH = " + JSON.stringify(L_YOGA_PANCH, null, 2) + ";");
console.log("export const L_KARANA = " + JSON.stringify(L_KARANA, null, 2) + ";");
