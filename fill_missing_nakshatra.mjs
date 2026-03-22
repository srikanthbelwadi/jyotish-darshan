import fs from 'fs';
import translate from '@iamtraction/google-translate';

const content = fs.readFileSync('src/data/nakshatra_lore.js', 'utf-8');
const match = content.match(/export const NAKSHATRA_LORE = (\{[\s\S]*?\});?\n?$/);
if (!match) {
  console.log("Could not find NAKSHATRA_LORE");
  process.exit(1);
}

const lore = eval("(" + match[1] + ")");
const languages = ['hi', 'kn', 'te', 'ta', 'mr', 'gu', 'bn', 'ml', 'sa'];
const attrs = ['name', 'myth', 'planet', 'deity', 'symbol', 'gana', 'nature', 'animal', 'goal', 'guna'];
const enDataObj = lore['en'];

async function run() {
  let updated = false;
  for (const lang of languages) {
    if (!lore[lang]) lore[lang] = {};
    
    // In previous script, 'sa' was just a deep copy of 'en'. We want to actually translate it!
    // But if we did deep copy, it has English text. So we should re-translate if text matches English!
    
    for (let i = 0; i < 27; i++) {
      if (!lore[lang][i]) lore[lang][i] = {};
      const nak = lore[lang][i];
      const enNak = enDataObj[i];
      
      for (const attr of attrs) {
        // If it's missing, OR if language is sa and the value equals the English value, we need to translate.
        if (!nak[attr] || (lang === 'sa' && nak[attr] === enNak[attr])) {
          console.log(`Translating ${attr} for lang ${lang} nakshatra ${i}`);
          try {
            const res = await translate(enNak[attr], { from: 'en', to: lang });
            lore[lang][i][attr] = res.text;
            updated = true;
          } catch(err) {
            console.log(`Error translating ${attr} to ${lang}:`, err.message);
            // fallback to en if missing
            if (!nak[attr]) lore[lang][i][attr] = enNak[attr]; 
          }
        }
      }
    }
  }

  if (updated) {
    const newContent = "export const NAKSHATRA_LORE = " + JSON.stringify(lore, null, 2) + ";\n";
    fs.writeFileSync('src/data/nakshatra_lore.js', newContent);
    console.log("Updated nakshatra_lore.js with newly translated strings!");
  } else {
    console.log("No missing attributes found.");
  }
}

run();
