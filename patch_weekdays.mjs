import fs from 'fs';

const days = {
  hi: { "pc.Sun": "रवि", "pc.Mon": "सोम", "pc.Tue": "मंगल", "pc.Wed": "बुध", "pc.Thu": "गुरु", "pc.Fri": "शुक्र", "pc.Sat": "शनि" },
  kn: { "pc.Sun": "ಭಾನು", "pc.Mon": "ಸೋಮ", "pc.Tue": "ಮಂಗಳ", "pc.Wed": "ಬುಧ", "pc.Thu": "ಗುರು", "pc.Fri": "ಶುಕ್ರ", "pc.Sat": "ಶನಿ" },
  te: { "pc.Sun": "ఆది", "pc.Mon": "సోమ", "pc.Tue": "మంగళ", "pc.Wed": "బుధ", "pc.Thu": "గురు", "pc.Fri": "శుక్ర", "pc.Sat": "శని" },
  ta: { "pc.Sun": "ஞாயிறு", "pc.Mon": "திங்கள்", "pc.Tue": "செவ்வாய்", "pc.Wed": "புதன்", "pc.Thu": "வியாழன்", "pc.Fri": "வெள்ளி", "pc.Sat": "சனி" },
  mr: { "pc.Sun": "रवि", "pc.Mon": "सोम", "pc.Tue": "मंगळ", "pc.Wed": "बुध", "pc.Thu": "गुरु", "pc.Fri": "शुक्र", "pc.Sat": "शनि" },
  gu: { "pc.Sun": "રવિ", "pc.Mon": "સોમ", "pc.Tue": "મંગળ", "pc.Wed": "બુધ", "pc.Thu": "ગુરુ", "pc.Fri": "શુક્ર", "pc.Sat": "શનિ" },
  bn: { "pc.Sun": "রবি", "pc.Mon": "সোম", "pc.Tue": "মঙ্গল", "pc.Wed": "বুধ", "pc.Thu": "বৃহস্পতি", "pc.Fri": "শুক্র", "pc.Sat": "শনি" },
  ml: { "pc.Sun": "ഞായർ", "pc.Mon": "തിങ്കൾ", "pc.Tue": "ചൊവ്വ", "pc.Wed": "ബുധൻ", "pc.Thu": "വ്യാഴം", "pc.Fri": "വെള്ളി", "pc.Sat": "ശനി" }
};

const path = 'src/i18n/dashboardTranslations.json';
const db = JSON.parse(fs.readFileSync(path, 'utf8'));

for (const lang of Object.keys(days)) {
  if (!db[lang]) db[lang] = {};
  for (const [k, v] of Object.entries(days[lang])) {
    db[lang][k] = v;
  }
}

fs.writeFileSync(path, JSON.stringify(db, null, 2), 'utf8');
console.log("Patched fixed weekdays!");
