import fs from 'fs';

const en = ["Padyami", "Bidiya", "Tadiya", "Chowthi", "Panchami", "Shashti", "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi"];
const hi = ["प्रतिपदा", "द्वितीया", "तृतीया", "चतुर्थी", "पंचमी", "षष्ठी", "सप्तमी", "अष्टमी", "नवमी", "दशमी", "एकादशी", "द्वादशी", "त्रयोदशी", "चतुर्दशी"];
const kn = ["ಪಾಡ್ಯಮಿ", "ಬಿದಿಗೆ", "ತದಿಗೆ", "ಚೌತಿ", "ಪಂಚಮಿ", "ಷಷ್ಠಿ", "ಸಪ್ತಮಿ", "ಅಷ್ಟಮಿ", "ನವಮಿ", "ದಶಮಿ", "ಏಕಾದಶಿ", "ದ್ವಾದಶಿ", "ತ್ರಯೋದಶಿ", "ಚತುರ್ದಶಿ"];
const te = ["పాడ్యమి", "విదియ", "తదియ", "చవితి", "పంచమి", "షష్ఠి", "సప్తమి", "అష్టమి", "నవమి", "దశమి", "ఏకాదశి", "ద్వాదశి", "త్రయోదశి", "చతుర్దశి"];
const ta = ["பிரதமை", "துவிதியை", "திருதியை", "சதுர்த்தி", "பஞ்சமி", "சஷ்டி", "சப்தமி", "அஷ்டமி", "நவமி", "தசமி", "ஏகாதசி", "துவாதசி", "திரயோதசி", "சதுர்த்தசி"];
const mr = ["प्रतिपदा", "द्वितीया", "तृतीया", "चतुर्थी", "पंचमी", "षष्ठी", "सप्तमी", "अष्टमी", "नवमी", "दशमी", "एकादशी", "द्वादशी", "त्रयोदशी", "चतुर्दशी"];
const gu = ["પડવો", "બીજ", "ત્રીજ", "ચોથ", "પાંચમ", "છઠ", "સાતમ", "આઠમ", "નોમ", "દશમ", "અગિયારસ", "બારસ", "તેરસ", "ચૌદશ"];
const bn = ["প্রতিপদ", "দ্বিতীয়া", "তৃতীয়া", "চতুর্থী", "পঞ্চমী", "ষষ্ঠী", "সপ্তমী", "অষ্টমী", "নবমী", "দশমী", "একাদশী", "দ্বাদশী", "ত্রয়োদশী", "চতুর্দশী"];
const ml = ["പ്രഥമ", "ദ്വിതീയ", "തൃതീയ", "ചതുർത്ഥി", "പഞ്ചമി", "ഷഷ്ഠി", "സപ്തമി", "അഷ്ടമി", "നവമി", "ദശമി", "ഏകാദശി", "ദ്വാദശി", "ത്രയോദശി", "ചതുർദശി"];

const fifteenth = {
    en: ["Purnima", "Amavasya"],
    hi: ["पूर्णिमा", "अमावस्या"],
    kn: ["ಹುಣ್ಣಿಮೆ", "ಅಮಾವಾಸ್ಯೆ"],
    te: ["పౌర్ణమి", "అమావాస్య"],
    ta: ["பௌர்ணமி", "அமாவாசை"],
    mr: ["पौर्णिमा", "अमावस्या"],
    gu: ["પૂનમ", "અમાસ"],
    bn: ["পূর্ণিমা", "অমাবস্যা"],
    ml: ["പൗർണ്ണമി", "അമാവാസി"]
};

const map = { en, hi, kn, te, ta, mr, gu, bn, ml };

const translateTithi = (lang, index) => { // index 1 to 30
    if (index === 15) return fifteenth[lang][0]; // Purnima
    if (index === 30) return fifteenth[lang][1]; // Amavasya
    
    // 1-14 -> 0-13, 16-29 -> 0-13
    const arrayIndex = (index - 1) % 15;
    return map[lang][arrayIndex];
};

const path = 'src/i18n/dashboardTranslations.json';
const db = JSON.parse(fs.readFileSync(path, 'utf8'));

// Apply Tithi strings
for (const lang of Object.keys(map)) {
    if (!db[lang]) db[lang] = {};
    for (let i = 1; i <= 30; i++) {
        db[lang][`pc.tithi.name.${i}`] = translateTithi(lang, i);
    }
    
    // Also remove Waxing / Waning
    if (lang === 'en') {
        db[lang]['pc.paksha.Shukla'] = 'Shukla Paksha';
        db[lang]['pc.paksha.Krishna'] = 'Krishna Paksha';
    }
}

fs.writeFileSync(path, JSON.stringify(db, null, 2), 'utf8');
console.log("Injected exact 30-day Tithi names across 9 languages!");
