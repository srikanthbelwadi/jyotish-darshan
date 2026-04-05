import fs from 'fs';
import path from 'path';

const dictPath = path.resolve('./src/i18n/dynamicTranslations.js');
let src = fs.readFileSync(dictPath, 'utf8');

const terms = {
   en: {
      "comp.basis.title": "Astrological Basis",
      "comp.basis.pointScore": "Score Awarded",
      "comp.basis.varnaLvl": "Varna Level",
      "comp.basis.distance": "Distance / Offset",
      "comp.basis.taraGrp": "Tara Group (0-8)",
      "comp.basis.yoniNum": "Yoni Identifier",
      "comp.basis.lord": "Ruling Lord",
      "comp.basis.sat": "Sattvic",
      "comp.basis.nonSat": "Non-Sattvic",
      "comp.basis.gana": "Gana Type",
      "comp.basis.nadi": "Nadi Domain"
   },
   hi: {
      "comp.basis.title": "ज्योतिषीय आधार",
      "comp.basis.pointScore": "प्राप्त अंक",
      "comp.basis.varnaLvl": "वर्ण स्तर",
      "comp.basis.distance": "दूरी / अंतर",
      "comp.basis.taraGrp": "तारा समूह (0-8)",
      "comp.basis.yoniNum": "योनि पहचानकर्ता",
      "comp.basis.lord": "शासक भगवान",
      "comp.basis.sat": "सात्विक",
      "comp.basis.nonSat": "असात्विक",
      "comp.basis.gana": "गण प्रकार",
      "comp.basis.nadi": "नाड़ी क्षेत्र"
   },
   kn: {
      "comp.basis.title": "ಜ್ಯೋತಿಷ್ಯ ಆಧಾರ",
      "comp.basis.pointScore": "ಪಡೆದ ಅಂಕಗಳು",
      "comp.basis.varnaLvl": "ವರ್ಣ ಮಟ್ಟ",
      "comp.basis.distance": "ದೂರ / ಅಂತರ",
      "comp.basis.taraGrp": "ತಾರಾ ಗುಂಪು (0-8)",
      "comp.basis.yoniNum": "ಯೋನಿ ಗುರುತು",
      "comp.basis.lord": "ಆಳುವ ಒಡೆಯ",
      "comp.basis.sat": "ಸಾತ್ತ್ವಿಕ",
      "comp.basis.nonSat": "ಅಸಾತ್ತ್ವಿಕ",
      "comp.basis.gana": "ಗಣದ ಪ್ರಕಾರ",
      "comp.basis.nadi": "ನಾಡಿ ಕ್ಷೇತ್ರ"
   },
   te: {
      "comp.basis.title": "జ్యోతిష్య ఆధారం",
      "comp.basis.pointScore": "పొందిన పాయింట్లు",
      "comp.basis.varnaLvl": "వర్ణ స్థాయి",
      "comp.basis.distance": "దూరం / అంతరం",
      "comp.basis.taraGrp": "తారా సమూహం (0-8)",
      "comp.basis.yoniNum": "యోని గుర్తింపు",
      "comp.basis.lord": "పరిపాలించే దేవుడు",
      "comp.basis.sat": "సాత్విక",
      "comp.basis.nonSat": "అసాత్విక",
      "comp.basis.gana": "గణ రకం",
      "comp.basis.nadi": "నాడి డొమైన్"
   },
   ml: {
      "comp.basis.title": "ജ്യോതിഷ അടിസ്ഥാനം",
      "comp.basis.pointScore": "ലഭിച്ച സ്കോർ",
      "comp.basis.varnaLvl": "വർണ്ണ തലം",
      "comp.basis.distance": "അകലം / വ്യത്യാസം",
      "comp.basis.taraGrp": "താരാ ഗ്രൂപ്പ് (0-8)",
      "comp.basis.yoniNum": "യോനി ഐഡൻ്റിഫയർ",
      "comp.basis.lord": "ഭരിക്കുന്ന നാഥൻ",
      "comp.basis.sat": "സാത്വികം",
      "comp.basis.nonSat": "അസാത്വികം",
      "comp.basis.gana": "ഗണം",
      "comp.basis.nadi": "നാഡി ഡൊമെയ്ൻ"
   }
};

// Remove everything containing "comp.basis" (which will obliterate my bad paste)
const lines = src.split('\\n');
const cleaned = lines.filter(line => !line.includes('comp.basis.'));
src = cleaned.join('\\n');

// Now cleanly inject at the end of each language block
function injectIntoKey(text, langKey, payloadObj) {
   const langStartPattern = '\\n  ' + langKey + ': {';
   const langStart = text.indexOf(langStartPattern);
   if (langStart === -1) return text;
   
   let endIdx = text.indexOf('\\n  },', langStart);
   if (endIdx === -1) {
       endIdx = text.indexOf('\\n  }', langStart); 
   }
   
   if (endIdx !== -1) {
      let insertStr = "";
      for (const k in payloadObj) {
         insertStr += '\\n    "' + k + '": "' + payloadObj[k] + '",';
      }
      return text.slice(0, endIdx) + "," + insertStr + text.slice(endIdx);
   }
   return text;
}

src = injectIntoKey(src, "en", terms.en);
src = injectIntoKey(src, "hi", terms.hi);
src = injectIntoKey(src, "kn", terms.kn);
src = injectIntoKey(src, "te", terms.te);
src = injectIntoKey(src, "ml", terms.ml);
fs.writeFileSync(dictPath, src, 'utf8');
console.log("Fixed translations correctly.");
