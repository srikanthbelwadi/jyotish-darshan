import fs from 'fs';
import translate from '@iamtraction/google-translate';

const file = 'src/App.jsx';
let content = fs.readFileSync(file, 'utf-8');

const langs = ['en', 'hi', 'kn', 'te', 'ta', 'sa', 'mr', 'gu', 'bn', 'ml'];

const keysToAdd = {
  'revealLifePathTitle': "Reveal Life Paths",
  'revealLifePathDesc': "Reveal Life dimensions of Dharma, Wealth, Health, and Relationships through precise Shastric Pathways."
};

async function run() {
  for (const lang of langs) {
    const langRegex = new RegExp(`(^|\\n)\\s*${lang}:\\s*\\{[\\s\\S]*?\\n\\s*\\},?`);
    let match = content.match(langRegex);
    
    // We only want the main dictionary, which has title:"JYOTISH DARSHAN" or title:"ज्योतिष दर्शन" etc.
    // The regex above might match other dictionaries like L_EXPERT, so we need to be careful.
    // Let's make sure it contains 'birthDetails' or 'tagline'
    if (lang === 'en') {
      match = content.match(/en:\{\s*'transit\.H1[\s\S]*?tagline:[\s\S]*?\n\s*\}/);
    } else {
      match = content.match(new RegExp(`${lang}:\\{\\s*'transit\\.H1[\\s\\S]*?tagline:[\\s\\S]*?\\n\\s*\\}`));
    }

    if (!match) continue;
    
    let langBlock = match[0];
    let injected = [];

    for (const [k, v] of Object.entries(keysToAdd)) {
        if (!langBlock.includes(`'${k}':`)) {
            try {
                if (lang === 'en') {
                    injected.push(`'${k}':'${v.replace(/'/g, "\\'")}'`);
                } else {
                    const tr = await translate(v, { from: 'en', to: lang });
                    injected.push(`'${k}':'${tr.text.replace(/'/g, "\\'")}'`);
                }
            } catch(e) { console.error(e); }
        }
    }

    if (injected.length > 0) {
        langBlock = langBlock.replace(/(\n\s*\}(,?))$/, `,\n    ${injected.join(',\n    ')}$1`);
        content = content.replace(match[0], langBlock);
    }
  }

  fs.writeFileSync(file, content, 'utf-8');
  console.log("Updated App.jsx main translation block!");
}

run();
