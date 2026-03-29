import fs from 'fs';
import translate from '@iamtraction/google-translate';

const file = 'src/i18n/dynamicTranslations.js';
let content = fs.readFileSync(file, 'utf-8');

const langs = ['en', 'hi', 'kn', 'te', 'ta', 'mr', 'gu', 'bn', 'ml'];

const keysToAdd = {
  'Unlock Shastric Oracle': "Unlock Shastric Oracle",
  'Authenticate to Reveal ➔': "Authenticate to Reveal ➔",
};

async function run() {
  for (const lang of langs) {
    const langRegex = new RegExp(`${lang}:\\s*\\{[\\s\\S]*?\\n  \\},?`);
    const match = content.match(langRegex);
    if (!match) continue;
    
    let langBlock = match[0];
    
    let injected = [];
    for (const [k, v] of Object.entries(keysToAdd)) {
        if (!langBlock.includes(`'${k}':`) && !langBlock.includes(`"${k}":`)) {
            try {
                if (lang === 'en') {
                   // English mapping is identical
                   injected.push(`'${k}': '${v.replace(/'/g, "\\'")}'`);
                } else {
                   const tr = await translate(v, { from: 'en', to: lang });
                   // Ensure the arrow isn't mangled by translation API
                   let translatedText = tr.text.replace(/'/g, "\\'");
                   // Fix potential symbol stripping
                   if (v.includes('➔') && !translatedText.includes('➔')) {
                       translatedText += ' ➔';
                   }
                   injected.push(`'${k}': '${translatedText}'`);
                   console.log(`[${lang}] ${k} -> ${translatedText}`);
                }
            } catch(e) { console.error(`Failed ${lang}: ${k}`, e); }
        }
    }

    if (injected.length > 0) {
        langBlock = langBlock.replace(/(\n  \}(,?))$/, `,\n    ${injected.join(',\n    ')}$1`);
        content = content.replace(match[0], langBlock);
    }
  }

  fs.writeFileSync(file, content, 'utf-8');
  console.log("Updated lock translations!");
}

run();
