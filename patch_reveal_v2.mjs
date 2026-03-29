import fs from 'fs';
import translate from '@iamtraction/google-translate';

const file = 'src/App.jsx';
let content = fs.readFileSync(file, 'utf-8');

const langs = ['en', 'hi', 'kn', 'te', 'ta', 'sa', 'mr', 'gu', 'bn', 'ml'];

const sourceText = {
  'revealLifePathTitle': "Reveal Life Paths",
  'revealLifePathDesc': "Reveal Life dimensions of Dharma, Wealth, Health, and Relationships through precise Shastric Pathways."
};

async function run() {
  for (const lang of langs) {
    // 1. Get the chunk of string that represents this lang's main dictionary
    // We look for \nlang:{ or ^lang:{
    const regex = new RegExp(`(^|\\n)\\s*${lang}:\\{`);
    const match = content.match(regex);
    if (!match) continue;
    
    // Check if we already injected these keys into this lang block
    // A quick hack: see if the next 1000 characters contain revealLifePathTitle
    const index = match.index + match[0].length;
    const peak = content.substring(index, index + 3000);
    
    if (peak.includes('revealLifePathTitle')) {
        console.log(`Skipping ${lang}, already translated`);
        continue;
    }
    
    // We need to translate
    try {
        let titleStr = sourceText.revealLifePathTitle.replace(/'/g, "\\'");
        let descStr = sourceText.revealLifePathDesc.replace(/'/g, "\\'");
        
        if (lang !== 'en') {
            const trTitle = await translate(sourceText.revealLifePathTitle, { from: 'en', to: lang });
            const trDesc = await translate(sourceText.revealLifePathDesc, { from: 'en', to: lang });
            titleStr = trTitle.text.replace(/'/g, "\\'");
            descStr = trDesc.text.replace(/'/g, "\\'");
        }
        
        const injection = `\n    'revealLifePathTitle':'${titleStr}',\n    'revealLifePathDesc':'${descStr}',`;
        
        content = content.slice(0, index) + injection + content.slice(index);
        console.log(`Successfully injected ${lang}`);
    } catch(e) {
        console.error(`Failed ${lang}`, e);
    }
  }

  fs.writeFileSync(file, content, 'utf-8');
  console.log("Updated App.jsx with robust injection!");
}

run();
