import fs from 'fs';

const labels = {
  hi: { "pc.vaar": "वार:", "pc.tithi": "तिथि:", "pc.nakshatra": "नक्षत्र:", "pc.yoga": "योग:", "pc.karanas": "करण:", "pc.samvat": "संवत्:", "pc.masa": "मास:", "pc.paksha": "पक्ष:", "pc.ritu": "ऋतु:", "pc.ayana": "अयन:" },
  kn: { "pc.vaar": "ವಾರ:", "pc.tithi": "ತಿಥಿ:", "pc.nakshatra": "ನಕ್ಷತ್ರ:", "pc.yoga": "ಯೋಗ:", "pc.karanas": "ಕರಣ:", "pc.samvat": "ಸಂವತ್:", "pc.masa": "ಮಾಸ:", "pc.paksha": "ಪಕ್ಷ:", "pc.ritu": "ಋತು:", "pc.ayana": "ಅಯನ:" },
  te: { "pc.vaar": "వారం:", "pc.tithi": "తిథి:", "pc.nakshatra": "నక్షత్రం:", "pc.yoga": "యోగం:", "pc.karanas": "కరణం:", "pc.samvat": "సంవత్:", "pc.masa": "మాసం:", "pc.paksha": "పక్షం:", "pc.ritu": "ఋతువు:", "pc.ayana": "అయనం:" },
  ta: { "pc.vaar": "வாரம்:", "pc.tithi": "திதி:", "pc.nakshatra": "நட்சத்திரம்:", "pc.yoga": "யோகம்:", "pc.karanas": "கரணம்:", "pc.samvat": "சம்வத்:", "pc.masa": "மாதம்:", "pc.paksha": "பட்சம்:", "pc.ritu": "ருது:", "pc.ayana": "அயனம்:" },
  mr: { "pc.vaar": "वार:", "pc.tithi": "तिथी:", "pc.nakshatra": "नक्षत्र:", "pc.yoga": "योग:", "pc.karanas": "करण:", "pc.samvat": "संवत्:", "pc.masa": "मास:", "pc.paksha": "पक्ष:", "pc.ritu": "ऋतू:", "pc.ayana": "अयन:" },
  gu: { "pc.vaar": "વાર:", "pc.tithi": "તિથિ:", "pc.nakshatra": "નક્ષત્ર:", "pc.yoga": "યોગ:", "pc.karanas": "કરણ:", "pc.samvat": "સંવત:", "pc.masa": "માસ:", "pc.paksha": "પક્ષ:", "pc.ritu": "ઋતુ:", "pc.ayana": "અયન:" },
  bn: { "pc.vaar": "বার:", "pc.tithi": "তিথি:", "pc.nakshatra": "নক্ষত্র:", "pc.yoga": "যোগ:", "pc.karanas": "করণ:", "pc.samvat": "সংবৎ:", "pc.masa": "মাস:", "pc.paksha": "পক্ষ:", "pc.ritu": "ঋতু:", "pc.ayana": "অয়ন:" },
  ml: { "pc.vaar": "വാരം:", "pc.tithi": "തിഥി:", "pc.nakshatra": "നക്ഷത്രം:", "pc.yoga": "യോഗം:", "pc.karanas": "കരണം:", "pc.samvat": "സംവത്:", "pc.masa": "മാസം:", "pc.paksha": "പക്ഷം:", "pc.ritu": "ഋതു:", "pc.ayana": "അയനം:" }
};

const path = 'src/i18n/dashboardTranslations.json';
const db = JSON.parse(fs.readFileSync(path, 'utf8'));

for (const lang of Object.keys(labels)) {
  if (!db[lang]) db[lang] = {};
  for (const [k, v] of Object.entries(labels[lang])) {
    db[lang][k] = v;
  }
}

fs.writeFileSync(path, JSON.stringify(db, null, 2), 'utf8');
console.log("Patched all Panchang UI labels successfully!");
