import translate from '@iamtraction/google-translate';
import fs from 'fs';

const sourceDict = {
  // UI stragglers
  'er.ages': 'Ages',
  'er.yrs': 'yrs',
  'er.to': 'To',
  'er.mahadasha': 'Mahadasha',
  'er.antardasha': 'Antardasha',

  // SUN
  'er.chal.sun': 'Avoid arrogance and ego-driven decisions.',
  'er.guid.sun': 'Step into leadership with confidence. Surya Namaskar supports vitality.',
  // MOON
  'er.chal.moon': 'Avoid emotional reactivity.',
  'er.guid.moon': 'Nurture emotional well-being through creative expression.',
  // MARS
  'er.chal.mars': 'Channel drive constructively.',
  'er.guid.mars': 'Direct energy into physical fitness or property matters.',
  // RAHU
  'er.chal.rahu': 'Ground ambitions in ethical action.',
  'er.guid.rahu': 'Embrace innovation and transformative opportunities boldly.',
  // JUPITER
  'er.chal.jupiter': 'Beware of overconfidence.',
  'er.guid.jupiter': 'Pursue higher education and philosophical inquiry.',
  // SATURN
  'er.chal.saturn': 'Patience is paramount.',
  'er.guid.saturn': 'Build long-term foundations with steady discipline.',
  // MERCURY
  'er.chal.mercury': 'Avoid mental scatteredness.',
  'er.guid.mercury': 'Invest in writing, teaching, or skill-building.',
  // KETU
  'er.chal.ketu': 'Avoid excessive withdrawal.',
  'er.guid.ketu': 'Deepen meditation and spiritual study.',
  // VENUS
  'er.chal.venus': 'Avoid indulgence.',
  'er.guid.venus': 'Invest in relationships, art, and creative expression.'
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
