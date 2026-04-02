import fs from 'fs';

const terms = {
  hi: { 
    "pc.paksha.Shukla": "शुक्ल पक्ष", "pc.paksha.Krishna": "कृष्ण पक्ष",
    "pc.rahu": "राहु काल:", "pc.yama": "यमगंड:", "pc.guli": "गुलिका काल:",
    "pc.brahma": "ब्रह्म मुहूर्त:", "pc.abhijit": "अभिजीत मुहूर्त:", "pc.amrit": "अमृत काल:", "pc.vijay": "विजय मुहूर्त:"
  },
  kn: { 
    "pc.paksha.Shukla": "ಶುಕ್ಲ ಪಕ್ಷ", "pc.paksha.Krishna": "ಕೃಷ್ಣ ಪಕ್ಷ",
    "pc.rahu": "ರಾಹು ಕಾಲ:", "pc.yama": "ಯಮಗಂಡ:", "pc.guli": "ಗುಳಿಕ ಕಾಲ:",
    "pc.brahma": "ಬ್ರಹ್ಮ ಮುಹೂರ್ತ:", "pc.abhijit": "ಅಭಿಜಿತ್ ಮುಹೂರ್ತ:", "pc.amrit": "ಅಮೃತ ಕಾಲ:", "pc.vijay": "ವಿಜಯ ಮುಹೂರ್ತ:"
  },
  te: { 
    "pc.paksha.Shukla": "శుక్ల పక్షం", "pc.paksha.Krishna": "కృష్ణ పక్షం",
    "pc.rahu": "రాహు కాలం:", "pc.yama": "యమగండం:", "pc.guli": "గుళిక కాలం:",
    "pc.brahma": "బ్రహ్మ ముహూర్తం:", "pc.abhijit": "అభిజిత్ ముహూర్తం:", "pc.amrit": "అమృత కాలం:", "pc.vijay": "విజయ ముహూర్తం:"
  },
  ta: { 
    "pc.paksha.Shukla": "சுக்கில பட்சம்", "pc.paksha.Krishna": "கிருஷ்ண பட்சம்",
    "pc.rahu": "ராகு காலம்:", "pc.yama": "எமகண்டம்:", "pc.guli": "குளிகை காலம்:",
    "pc.brahma": "பிரம்ம முகூர்த்தம்:", "pc.abhijit": "அபிஜித் முகூர்த்தம்:", "pc.amrit": "அமிர்த காலம்:", "pc.vijay": "விஜய முகூர்த்தம்:"
  },
  mr: { 
    "pc.paksha.Shukla": "शुक्ल पक्ष", "pc.paksha.Krishna": "कृष्ण पक्ष",
    "pc.rahu": "राहु काळ:", "pc.yama": "यमगंड:", "pc.guli": "गुलिका काळ:",
    "pc.brahma": "ब्रह्म मुहूर्त:", "pc.abhijit": "अभिजित मुहूर्त:", "pc.amrit": "अमृत काळ:", "pc.vijay": "विजय मुहूर्त:"
  },
  gu: { 
    "pc.paksha.Shukla": "શુક્લ પક્ષ", "pc.paksha.Krishna": "કૃષ્ણ પક્ષ",
    "pc.rahu": "રાહુ કાળ:", "pc.yama": "યમગંડ:", "pc.guli": "ગુલિકા કાળ:",
    "pc.brahma": "બ્રહ્મ મુહૂર્ત:", "pc.abhijit": "અભિજિત મુહૂર્ત:", "pc.amrit": "અમૃત કાળ:", "pc.vijay": "વિજય મુહૂર્ત:"
  },
  bn: { 
    "pc.paksha.Shukla": "শুক্ল পক্ষ", "pc.paksha.Krishna": "কৃষ্ণ পক্ষ",
    "pc.rahu": "রাহু কাল:", "pc.yama": "যমগণ্ড:", "pc.guli": "গুলিকা কাল:",
    "pc.brahma": "ব্রহ্ম মুহূর্ত:", "pc.abhijit": "অভিজিৎ মুহূর্ত:", "pc.amrit": "অমৃত কাল:", "pc.vijay": "বিজয় মুহূর্ত:"
  },
  ml: { 
    "pc.paksha.Shukla": "ശുക്ല പക്ഷം", "pc.paksha.Krishna": "കൃഷ്ണ പക്ഷം",
    "pc.rahu": "രാഹു കാലം:", "pc.yama": "യമകണ്ടം:", "pc.guli": "ഗുളിക കാലം:",
    "pc.brahma": "ബ്രഹ്മ മുഹൂർത്തം:", "pc.abhijit": "അഭിജിത്ത് മുഹൂർത്തം:", "pc.amrit": "അമൃത കാലം:", "pc.vijay": "വിജയ മുഹൂർത്തം:"
  }
};

const path = 'src/i18n/dashboardTranslations.json';
const db = JSON.parse(fs.readFileSync(path, 'utf8'));

for (const lang of Object.keys(terms)) {
  if (!db[lang]) db[lang] = {};
  for (const [k, v] of Object.entries(terms[lang])) {
    db[lang][k] = v;
  }
}

fs.writeFileSync(path, JSON.stringify(db, null, 2), 'utf8');
console.log("Patched Muhurat terms successfully!");
