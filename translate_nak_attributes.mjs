import translate from '@iamtraction/google-translate';
import fs from 'fs';

const languages = ['hi', 'kn', 'te', 'ta', 'mr', 'gu', 'bn', 'ml', 'sa'];

// 1. Translate UI Labels
const uiLabels = {
  "nak_ruling_planet": "Ruling Planet",
  "nak_deity": "Ruling Deity",
  "nak_symbol": "Symbol",
  "nak_gana": "Gana (Type)",
  "nak_nature": "Nature (Quality)",
  "nak_animal": "Animal (Yoni)",
  "nak_goal": "Goal (Purushartha)",
  "nak_guna": "Guna"
};

async function run() {
  const uiResults = { en: uiLabels };

  for (const lang of languages) {
    console.log(`Translating UI labels for ${lang}...`);
    uiResults[lang] = {};
    for (const [key, text] of Object.entries(uiLabels)) {
      if(lang === 'sa') {
        uiResults[lang][key] = text;
        continue;
      }
      try {
        const res = await translate(text, { from: 'en', to: lang });
        uiResults[lang][key] = res.text;
      } catch (err) {
        console.error(`Error translating UI label ${key} to ${lang}:`, err);
        uiResults[lang][key] = text; 
      }
    }
  }

  fs.writeFileSync('nak_ui_translations.json', JSON.stringify(uiResults, null, 2));
  console.log('UI Translations saved to nak_ui_translations.json');

  // 2. Translate nakshatra lore attributes 
  let content = fs.readFileSync('src/data/nakshatra_lore.js', 'utf-8');
  
  // Parse existing data directly as we need to extract EN strings and translate them to all languages in place.
  // Actually, rewriting the whole AST of a 2200-line file is tough. Instead, let's extract EN JSON, translate it, and patch it back.
  
  // We can write a quick block to parse the EN dictionary from the file 
  const regex = /"en": (\{[\s\S]*?\n  \}),/;
  const match = content.match(regex);
  if (!match) throw new Error("Could not find EN string in nakshatra_lore.js");

  const enDataObj = eval("(" + match[1] + ")");
  
  // Also we need the existing other language objects so we don't wipe them out.
  // Let's just create a new nakshatra_lore.js using our generated translation!
  let fullLore = { en: enDataObj };
  
  for (const lang of languages) {
    if (lang === 'sa') {
       fullLore[lang] = JSON.parse(JSON.stringify(enDataObj));
       continue;
    }
    
    // Attempt to extract existing language block to retain name, myth, deity if already translated
    const langRegex = new RegExp(`"${lang}": (\\{[\\s\\S]*?\\n  \\})(,|\\n\\})`);
    const langMatch = content.match(langRegex);
    let langObj = {};
    if (langMatch) {
      try {
        langObj = eval("(" + langMatch[1] + ")");
      } catch(e) {}
    } else {
      console.log(`Lang ${lang} block not found, will translate fully`);
    }
    
    console.log(`Translating nak attributes for ${lang}...`);
    for (let i = 0; i < 27; i++) {
       if (!langObj[i]) langObj[i] = {};
       
       const enNak = enDataObj[i];
       
       // Attributes to translate
       const attrs = ["planet", "gana", "nature", "animal", "goal", "guna"];
       
       for (const attr of attrs) {
         if (!enNak[attr]) continue;
         if (langObj[i][attr]) continue; // already exists
         
         const toTranslate = enNak[attr];
         try {
           const res = await translate(toTranslate, { from: 'en', to: lang });
           langObj[i][attr] = res.text;
         } catch (err) {
            langObj[i][attr] = toTranslate;
         }
       }
    }
    
    fullLore[lang] = langObj;
  }
  
  const newContent = "export const NAKSHATRA_LORE = " + JSON.stringify(fullLore, null, 2) + ";\n";
  fs.writeFileSync('src/data/nakshatra_lore.js', newContent);
  console.log('Finished updating nakshatra_lore.js with translations!');
}

run();
