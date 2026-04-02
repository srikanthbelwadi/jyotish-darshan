import translate from '@iamtraction/google-translate';
import fs from 'fs';

const sourceDict = {
  'pc.mem.title': 'Ancestors & Memorials',
  'pc.mem.desc': 'Track the annual ceremonial dates (Varshika Tithi) for departed souls. The Panchang calendar will automatically identify these sacred dates based on the precise Lunar Month and Tithi of their passing.',
  'pc.mem.loading': 'Loading...',
  'pc.mem.noDates': 'No memorial dates added.',
  'pc.mem.remove': 'Remove',
  'pc.mem.addBtn': '+ Add Departed Soul',
  'pc.mem.maxLimit': 'Maximum limit of 5 entries reached.',
  'pc.mem.newEntry': 'New Memorial Entry',
  'pc.mem.nameLbl': 'Name',
  'pc.mem.namePh': 'Name of the departed...',
  'pc.mem.dateLbl': 'Date of Passing',
  'pc.mem.timeLbl': 'Time (Optional)',
  'pc.mem.placeLbl': 'Place (Optional)',
  'pc.mem.placePh': 'Location of passing...',
  'pc.mem.cancel': 'Cancel',
  'pc.mem.saveEntry': 'Save Entry',
  'pc.mem.discard': 'Discard Changes',
  'pc.mem.saveMem': 'Save Memorials',
  'pc.mem.saving': 'Saving...',
};

const LANGS = ['hi', 'kn', 'te', 'ta', 'mr', 'gu', 'bn', 'ml'];

async function run() {
  const file = './src/i18n/dashboardTranslations.json';
  let db = {};
  if (fs.existsSync(file)) {
    db = JSON.parse(fs.readFileSync(file, 'utf8'));
  }

  if (!db['en']) db['en'] = {};
  for (const [key, text] of Object.entries(sourceDict)) {
    db['en'][key] = text;
  }

  for (const lang of LANGS) {
    if (!db[lang]) db[lang] = {};
    console.log(`Translating Memorials to ${lang}...`);
    
    const entries = Object.entries(sourceDict);
    for (let i = 0; i < entries.length; i++) {
        const [key, text] = entries[i];
      if (!db[lang][key]) { 
        try {
          const res = await translate(text, { to: lang });
          db[lang][key] = res.text;
          console.log(`  [${lang}] ${key} -> ${res.text}`);
          await new Promise(r => setTimeout(r, 80));
        } catch(e) {
          console.error(`  Failed on ${key}: ${e.message}`);
        }
      }
    }
  }

  fs.writeFileSync(file, JSON.stringify(db, null, 2));
  console.log('Successfully wrote Memorial strings to dashboardTranslations.json!');
}

run();
