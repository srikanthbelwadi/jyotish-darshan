import fs from 'fs';
import translate from '@iamtraction/google-translate';

const filePath = 'src/i18n/dynamicTranslations.js';
let content = fs.readFileSync(filePath, 'utf-8');

const baseEnKeys = {
  'yo.remedyLabel': 'Remedies',
  'yo.name.gajKesari': 'Gaja Kesari Yoga',
  'yo.name.budhaditya': 'Budhaditya Yoga',
  'yo.name.chandraMangal': 'Chandra-Mangal Yoga',
  'yo.name.sasa': 'Sasa Yoga (Pancha Mahapurusha)',
  'yo.name.hamsa': 'Hamsa Yoga (Pancha Mahapurusha)',
  'yo.name.ruchaka': 'Ruchaka Yoga (Pancha Mahapurusha)',
  'yo.name.mangal': 'Mangala Dosha (Kuja Dosha)',
  'yo.name.kaalSarp': 'Kaal Sarp Dosha',

  'yo.eff.gajKesari': 'Bestows wisdom, fame, and lasting prosperity. The native commands respect and possesses magnetic charisma.',
  'yo.eff.budhaditya': 'Grants sharp intellect, eloquent speech, and success in analytical and communicative pursuits.',
  'yo.eff.chandraMangal': 'Confers financial acumen, bold initiative, and commercial success.',
  'yo.eff.sasa': 'Confers rigorous authority, discipline, longevity, and material success through persistent effort.',
  'yo.eff.hamsa': 'Grants wisdom, spiritual authority, noble character, and philanthropic nature.',
  'yo.eff.ruchaka': 'Exceptional courage, physical strength, and commanding executive authority.',
  'yo.eff.mangal': 'Indicates inherent challenges in marital harmony and relationship longevity without conscious patience.',
  'yo.eff.kaalSarp': 'Destiny is highly intensified. May cause karmic delays, sudden reversals, and internal restless seeking.',

  'yo.calc.gajKesari': '{p1} and {p2} are in a {rel} relationship.',
  'yo.calc.budhaditya': '{p1} and {p2} are conjunct in {rashi}.',
  'yo.calc.chandraMangal': '{p1} and {p2} are conjunct in {rashi}.',
  'yo.calc.sasa': '{p1} is in the {house}th house in its {state} sign ({rashi}).',
  'yo.calc.hamsa': '{p1} is in the {house}th house in its {state} sign ({rashi}).',
  'yo.calc.ruchaka': '{p1} is in the {house}th house in its {state} sign ({rashi}).',
  'yo.calc.mangal': '{p1} is placed in the {house}th house from the {source}.',
  'yo.calc.kaalSarp': 'All seven traditional planets are hemmed between the Rahu-Ketu nodal axis.',

  'yo.rem.mangal': 'Mangal Shanti Puja, conscious communication, and ideally matching with another Manglik native are recommended traditional remedies. Fostering extreme patience is required.',
  'yo.rem.kaalSarp': 'Regular worship of Lord Shiva or Naga Devatas is advised. Kaal Sarp Shanti Puja at a Jyotirlinga (like Trimbakeshwar) can highly alleviate karmic friction.',

  'yo.val.conjunct': 'conjunct',
  'yo.val.kendra': 'mutual Kendra (square)',
  'yo.val.own': 'own',
  'yo.val.exalted': 'exalted',
  'yo.val.Lagna': 'Lagna (Ascendant)',
  'yo.val.Moon': 'Natal Moon',
  'yo.val.Venus': 'Natal Venus',
  
  // Missing rashis since translation dictionaries may not have them natively prefixed yet
  'yo.rashi.0': 'Aries', 'yo.rashi.1': 'Taurus', 'yo.rashi.2': 'Gemini', 'yo.rashi.3': 'Cancer', 
  'yo.rashi.4': 'Leo', 'yo.rashi.5': 'Virgo', 'yo.rashi.6': 'Libra', 'yo.rashi.7': 'Scorpio', 
  'yo.rashi.8': 'Sagittarius', 'yo.rashi.9': 'Capricorn', 'yo.rashi.10': 'Aquarius', 'yo.rashi.11': 'Pisces'
};

const langs = {
  en: 'en',
  hi: 'hi',
  kn: 'kn',
  te: 'te',
  ta: 'ta',
  mr: 'mr',
  gu: 'gu',
  ml: 'ml',
  sa: 'hi', // Fallback to Hindi
  bn: 'bn'
};

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function run() {
  const blocks = content.split(/(?=\n  [a-z]{2}: \{)/);
  if (blocks[0].trim() === 'export const DYNAMIC_STRINGS = {') {
    // skip the prefix
  }

  const newBlocks = [];
  const entriesList = Object.entries(baseEnKeys);

  for (let block of blocks) {
    const match = block.match(/\n  ([a-z]{2}): \{/);
    if (!match) {
      newBlocks.push(block);
      continue;
    }

    const langCode = match[1];
    const targetLang = langs[langCode];
    if (!targetLang) {
      newBlocks.push(block);
      continue;
    }

    console.log(`Processing language: ${langCode} (target: ${targetLang})`);
    
    // We already have some english text in standard, let's inject at the end of the block.
    // The block ends with `  },` or `  }\n};`
    let injected = [];
    for (let [key, val] of entriesList) {
      if (langCode === 'en') {
        injected.push(`'${key}': ${JSON.stringify(val)}`);
      } else {
        // Do translation
        try {
          // Temporarily replace placeholders {p1}, {rashi} to avoid translation destroying them
          let safeVal = val.replace(/\{p1\}/g, 'ZZP1ZZ').replace(/\{p2\}/g, 'ZZP2ZZ').replace(/\{rashi\}/g, 'ZZRZZ').replace(/\{house\}/g, 'ZZHZZ').replace(/\{state\}/g, 'ZZSZZ').replace(/\{rel\}/g, 'ZZRELZZ').replace(/\{source\}/g, 'ZZSRCZZ');
          const res = await translate(safeVal, { from: 'en', to: targetLang });
          let finalStr = res.text.replace(/ZZP1ZZ/gi, '{p1}').replace(/ZZP2ZZ/gi, '{p2}').replace(/ZZRZZ/gi, '{rashi}').replace(/ZZHZZ/gi, '{house}').replace(/ZZSZZ/gi, '{state}').replace(/ZZRELZZ/gi, '{rel}').replace(/ZZSRCZZ/gi, '{source}');
          injected.push(`'${key}': ${JSON.stringify(finalStr)}`);
          await sleep(100);
        } catch (e) {
          console.error(`Failed ${key} for ${langCode}`, e);
          injected.push(`'${key}': ${JSON.stringify(val)}`); // Fall back to english
        }
      }
    }

    const joinStr = ",\n    " + injected.join(",\n    ");
    const updatedBlock = block.replace(/(\n  \}(,?))$/, joinStr + "$1");
    newBlocks.push(updatedBlock);
  }

  const finalContent = newBlocks.join('');
  fs.writeFileSync(filePath, finalContent, 'utf-8');
  console.log('Translations generated and injected successfully!');
}

run();
