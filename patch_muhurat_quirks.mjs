import fs from 'fs';

const quirks = {
  hi: {
    "Auspicious Muhurat": "शुभ मुहूर्त",
    "Select an Event to cast electional chart:": "मुहूर्त (लग्न) चार्ट देखने के लिए एक कार्य चुनें:",
    "Select Life Event..": "शुभ कार्य चुनें..",
    "pc.livingBirthday": "जन्मदिन (तिथि)",
    "pc.subtitle": "दैनिक तिथि, प्रमुख त्योहार, जन्मदिन और अपने दिवंगत प्रियजनों की वार्षिक तिथि को स्वचालित रूप से ट्रैक करें।",
    "pc.openCal": "चंद्र कैलेंडर खोलें ➔"
  },
  kn: {
    "Auspicious Muhurat": "ಶುಭ ಮುಹೂರ್ತ",
    "Select an Event to cast electional chart:": "ಮುಹೂರ್ತ ಚಾರ್ಟ್ ರಚಿಸಲು ಶುಭಕಾರ್ಯವನ್ನು ಆಯ್ಕೆಮಾಡಿ:",
    "Select Life Event..": "ಶುಭಕಾರ್ಯ ಆಯ್ಕೆಮಾಡಿ..",
    "pc.livingBirthday": "ಜನ್ಮದಿನ (ತಿಥಿ ಆಧಾರಿತ)",
    "pc.subtitle": "ದೈನಂದಿನ ತಿಥಿ, ಪ್ರಮುಖ ಹಬ್ಬಗಳು, ಜನ್ಮದಿನಗಳು ಮತ್ತು ನಿಮ್ಮ ಅಗಲಿದ ಪ್ರೀತಿಪಾತ್ರರ ವಾರ್ಷಿಕ ತಿಥಿಯನ್ನು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ.",
    "pc.openCal": "ಚಾಂದ್ರಮಾನ ಕ್ಯಾಲೆಂಡರ್ ತೆರೆಯಿರಿ ➔"
  },
  te: {
    "Auspicious Muhurat": "శుభ ముహూర్తం",
    "Select an Event to cast electional chart:": "ముహూర్త చార్ట్ రూపొందించడానికి ఒక శుభకార్యాన్ని ఎంచుకోండి:",
    "Select Life Event..": "శుభకార్యం ఎంచుకోండి..",
    "pc.livingBirthday": "పుట్టినరోజు (తిథి ప్రకారం)",
    "pc.subtitle": "రోజువారీ తిథి, పండుగలు, పుట్టినరోజులు మరియు మీ दिवंगत ఆత్మీయుల వార్షిక తిథులను స్వయంచాలకంగా ట్రాక్ చేయండి.",
    "pc.openCal": "చాంద్రమాన క్యాలెండర్ తెరవండి ➔"
  },
  ta: {
    "Auspicious Muhurat": "சுப முகூர்த்தம்",
    "Select an Event to cast electional chart:": "முகூர்த்தம் கணிக்க ஒரு நிகழ்வைத் தேர்ந்தெடுக்கவும்:",
    "Select Life Event..": "சுப நிகழ்வைத் தேர்ந்தெடுக்கவும்..",
    "pc.livingBirthday": "பிறந்தநாள் (திதி)",
    "pc.subtitle": "தினசரி திதி, முக்கிய பண்டிகைகள், பிறந்தநாள்கள் மற்றும் உங்களின் மறைந்த அன்புக்குரியவர்களின் வருடாந்திர திதியை தானாகவே கண்காணிக்கவும்.",
    "pc.openCal": "சந்திர நாட்காட்டியைத் திறக்கவும் ➔"
  },
  mr: {
    "Auspicious Muhurat": "शुभ मुहूर्त",
    "Select an Event to cast electional chart:": "मुहूर्त चार्ट तयार करण्यासाठी एक शुभ कार्य निवडा:",
    "Select Life Event..": "शुभ कार्य निवडा..",
    "pc.livingBirthday": "वाढदिवस (तिथी)",
    "pc.subtitle": "दैनिक तिथी, प्रमुख सण, वाढदिवस आणि आपल्या दिवंगत प्रियजनांची वार्षिक तिथी स्वयंचलितपणे ट्रॅक करा.",
    "pc.openCal": "चांद्र दिनदर्शिका उघडा ➔"
  },
  gu: {
    "Auspicious Muhurat": "શુભ મુહૂર્ત",
    "Select an Event to cast electional chart:": "મુહૂર્ત ચાર્ટ અને શુભ સમય જોવા માટે કાર્ય પસંદ કરો:",
    "Select Life Event..": "શુભ કાર્ય પસંદ કરો..",
    "pc.livingBirthday": "જન્મદિવસ (તિથિ)",
    "pc.subtitle": "દૈનિક તિથિ, મુખ્ય તહેવારો, જન્મદિવસ અને તમારા દિવંગત પ્રિયજનોની વાર્ષિક તિથિને આપમેળે ટ્રૅક કરો.",
    "pc.openCal": "ચાંદ્ર કેલેન્ડર ખોલો ➔"
  },
  bn: {
    "Auspicious Muhurat": "শুভ মুহূর্ত",
    "Select an Event to cast electional chart:": "শুভ মুহূর্ত দেখতে একটি বিশেষ কাজ নির্বাচন করুন:",
    "Select Life Event..": "শুভ কাজ নির্বাচন করুন..",
    "pc.livingBirthday": "জন্মদিন (তিথি)",
    "pc.subtitle": "দৈনিক তিথি, প্রধান উত্সব, জন্মদিন এবং আপনার প্রয়াত প্রিয়জনদের বার্ষিক তিথি স্বয়ংক্রিয়ভাবে হিসাব করুন।",
    "pc.openCal": "চন্দ্র ক্যালেন্ডার খুলুন ➔"
  },
  ml: {
    "Auspicious Muhurat": "ശുഭ മുഹൂർത്തം",
    "Select an Event to cast electional chart:": "മുഹൂർത്ത ചാർട്ട് പരിശോധിക്കാൻ ഒരു ശുഭകർമ്മം തിരഞ്ഞെടുക്കുക:",
    "Select Life Event..": "ശുഭകർമ്മം തിരഞ്ഞെടുക്കുക..",
    "pc.livingBirthday": "ജന്മദിനം (തിഥി അധിഷ്ഠിതം)",
    "pc.subtitle": "പ്രതിദിന തിഥി, പ്രധാന ഉത്സവങ്ങൾ, ജന്മദിനങ്ങൾ, വാർഷിക തിഥി എന്നിവ സ്വയമേവ ട്രാക്ക് ചെയ്യുക.",
    "pc.openCal": "ചാന്ദ്ര കലണ്ടർ തുറക്കുക ➔"
  }
};

const path = 'src/i18n/dashboardTranslations.json';
const db = JSON.parse(fs.readFileSync(path, 'utf8'));

for (const lang of Object.keys(quirks)) {
  if (!db[lang]) db[lang] = {};
  for (const [k, v] of Object.entries(quirks[lang])) {
    db[lang][k] = v;
  }
}

fs.writeFileSync(path, JSON.stringify(db, null, 2), 'utf8');
console.log("Patched all Muhurat and Panchang translation quirks successfully!");
