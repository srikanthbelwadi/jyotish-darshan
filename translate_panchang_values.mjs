import translate from '@iamtraction/google-translate';
import fs from 'fs';

const SAMVATSARAS = [
  "Prabhava", "Vibhava", "Shukla", "Pramoda", "Prajapathi", "Angirasa", "Shrimukha", "Bhava", "Yuva", "Dhatri",
  "Ishvara", "Bahudhanya", "Pramathi", "Vikrama", "Vrushapraja", "Chitrabhanu", "Subhanu", "Tarana", "Parthiva", "Vyaya",
  "Sarvajit", "Sarvadhari", "Virodhi", "Vikruti", "Khara", "Nandana", "Vijaya", "Jaya", "Manmatha", "Durmukha",
  "Hevilambi", "Vilambi", "Vikari", "Sharvari", "Plava", "Shubhakrut", "Shobhakrut", "Krodhi", "Vishvavasu", "Parabhava",
  "Plavanga", "Kilaka", "Saumya", "Sadharana", "Virodhikrut", "Paridhavi", "Pramadi", "Ananda", "Rakshasa", "Nala",
  "Pingala", "Kalayukti", "Siddharthi", "Raudra", "Durmati", "Dundubhi", "Rudhirodgari", "Raktaksha", "Krodhana", "Akshaya"
];

const NAKSHATRAS = ["Ashvini", "Bharani", "Krittika", "Rohini", "Mrigashirsha", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"];
const YOGAS = ["Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma", "Dhriti", "Shula", "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyan", "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"];
const RASHIS = ["Aries (Mesha)", "Taurus (Vrishabha)", "Gemini (Mithuna)", "Cancer (Karka)", "Leo (Simha)", "Virgo (Kanya)", "Libra (Tula)", "Scorpio (Vrishchika)", "Sagittarius (Dhanu)", "Capricorn (Makara)", "Aquarius (Kumbha)", "Pisces (Meena)"];
const MASAS = ["Chaitra", "Vaishakha", "Jyeshtha", "Ashadha", "Shravana", "Bhadrapada", "Ashvina", "Kartika", "Margashirsha", "Pausha", "Magha", "Phalguna"];

const KARANA_LIST = ["Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti", "Kintughna", "Shakuni", "Chatushpada", "Naga"];

const sourceDict = {
  'pc.openCal': 'Open Lunar Calendar ➔',
};

SAMVATSARAS.forEach(s => sourceDict[`pc.samv.${s}`] = s);
NAKSHATRAS.forEach(s => sourceDict[`pc.nak.${s}`] = s);
YOGAS.forEach(s => sourceDict[`pc.yog.${s}`] = s);
RASHIS.forEach(s => sourceDict[`pc.rsh.${s}`] = s);
MASAS.forEach(s => sourceDict[`pc.mas.${s}`] = s);
KARANA_LIST.forEach(s => sourceDict[`pc.kar.${s}`] = s);

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
    console.log(`Translating values to ${lang}...`);
    
    // Convert sourceDict to array for async iteration
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
  console.log('Successfully wrote array values to dashboardTranslations.json!');
}

run();
