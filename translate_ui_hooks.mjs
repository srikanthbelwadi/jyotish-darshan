import fs from 'fs';
import translate from '@iamtraction/google-translate';

const file = 'src/i18n/dynamicTranslations.js';
let content = fs.readFileSync(file, 'utf-8');

const langs = ['hi', 'kn', 'te', 'ta', 'mr', 'gu', 'bn', 'ml'];

const keysToAdd = {
  'ov.moonsConst': "Moon's Constellation",
  'ov.janmaNak': "Janma Nakshatra",
};

async function run() {
  for (const lang of langs) {
    const langRegex = new RegExp(`${lang}:\\s*\\{[\\s\\S]*?\\n  \\},?`);
    const match = content.match(langRegex);
    if (!match) continue;
    
    let langBlock = match[0];
    
    // 1. Re-translate todayHorizon
    try {
      if (lang === 'kn') {
          // Hardcode for exact Kannada meaning of "Today's Horizon"
          langBlock = langBlock.replace(/todayHorizon:\s*'[^']+'/, "todayHorizon: 'ಇಂದಿನ ಕ್ಷಿತಿಜ'");
      } else {
          // Just in case it's transliterated elsewhere, let's strictly translate it.
          // Wait, other languages might be transliterated too! Let's re-translate.
          const res = await translate("Today's Cosmic Horizon", { from: 'en', to: lang });
          langBlock = langBlock.replace(/todayHorizon:\s*'[^']+'/, `todayHorizon: '${res.text}'`);
      }
    } catch (e) { console.error(e); }

    // 2. Add moonsConst and janmaNak at the end of the block
    let injected = [];
    for (const [k, v] of Object.entries(keysToAdd)) {
        // If it doesn't already have it
        if (!langBlock.includes(`'${k}':`)) {
            try {
                const tr = await translate(v, { from: 'en', to: lang });
                injected.push(`'${k}': '${tr.text.replace(/'/g, "\\'")}'`);
            } catch(e) { console.error(e); }
        }
    }

    if (injected.length > 0) {
        // insert before the closing brace of the language block
        langBlock = langBlock.replace(/(\n  \}(,?))$/, `,\n    ${injected.join(',\n    ')}$1`);
    }

    content = content.replace(match[0], langBlock);
  }

  // Also add to English
  const enMatch = content.match(/en:\s*\{[\s\S]*?\n  \},?/);
  if (enMatch) {
      let enBlock = enMatch[0];
      let injected = [];
      for (const [k, v] of Object.entries(keysToAdd)) {
          if (!enBlock.includes(`'${k}':`)) {
              injected.push(`'${k}': '${v.replace(/'/g, "\\'")}'`);
          }
      }
      if (injected.length > 0) {
          enBlock = enBlock.replace(/(\n  \}(,?))$/, `,\n    ${injected.join(',\n    ')}$1`);
      }
      content = content.replace(enMatch[0], enBlock);
  }

  fs.writeFileSync(file, content, 'utf-8');
  console.log("Updated translations!");
}

run();
