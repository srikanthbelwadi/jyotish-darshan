import translate from '@iamtraction/google-translate';
import fs from 'fs';

const sourceDict = {
  'Predictive Trajectory': 'Predictive Trajectory',
  'Astrological Basis': 'Astrological Basis',
  'Prophetic Assertions': 'Prophetic Assertions',
  'Lifestyle & Preparedness': 'Lifestyle & Preparedness',
  'Shastric Mitigation': 'Shastric Mitigation',
  'Consulting Akashic Records...': 'Consulting Akashic Records...',
  'Awaiting celestial alignment...': 'Awaiting celestial alignment...',
  'Consult again (Override cache)': 'Consult again (Override cache)'
};

const LANGS = ['hi', 'te', 'ta', 'kn', 'mr', 'gu', 'bn', 'ml'];

async function run() {
  const file = './src/i18n/dashboardTranslations.json';
  let db = {};
  if (fs.existsSync(file)) {
    db = JSON.parse(fs.readFileSync(file, 'utf8'));
  }

  for (const lang of LANGS) {
    if (!db[lang]) db[lang] = {};
    console.log(`Translating to ${lang}...`);
    
    // Process each key
    for (const [key, text] of Object.entries(sourceDict)) {
      if (!db[lang][key]) { // skip if already translated
        try {
          const res = await translate(text, { to: lang });
          db[lang][key] = res.text;
          console.log(`  [${lang}] ${key} -> ${res.text}`);
        } catch(e) {
          console.error(`  Failed on ${key}`);
        }
      }
    }
  }

  fs.writeFileSync(file, JSON.stringify(db, null, 2));
  console.log('Complete!');
}

run();
