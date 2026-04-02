import fs from 'fs';
const transPath = 'src/i18n/dashboardTranslations.json';
const db = JSON.parse(fs.readFileSync(transPath, 'utf8'));

const hints = {
  hi: "कैलेंडर स्वाइप करें ↔",
  kn: "ಕ್ಯಾಲೆಂಡರ್ ಸ್ವೈಪ್ ಮಾಡಿ ↔",
  te: "క్యాలెండర్‌ని జరపండి ↔",
  ta: "நாள்காட்டியை நகர்த்தவும் ↔",
  mr: "कॅलेंडर स्वाइप करा ↔",
  gu: "કેલેન્ડર સ્વાઇપ કરો ↔",
  bn: "ক্যালেন্ডার সোয়াইপ করুন ↔",
  ml: "കലണ്ടർ സ്വൈപ്പ് ചെയ്യുക ↔"
};

['en', 'hi', 'kn', 'te', 'ta', 'mr', 'gu', 'bn', 'ml'].forEach(lang => {
    if (!db[lang]) db[lang] = {};
    db[lang]["pc.swipeHint"] = hints[lang] || "Swipe calendar ↔";
});

fs.writeFileSync(transPath, JSON.stringify(db, null, 2), 'utf8');
console.log("Injected responsive swipe hints seamlessly!");
