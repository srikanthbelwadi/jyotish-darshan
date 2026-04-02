import fs from 'fs';

// 1. Update MuhuratPlanner.jsx
const muhuratPath = 'src/components/tabs/MuhuratPlanner.jsx';
let muhuratContent = fs.readFileSync(muhuratPath, 'utf8');
muhuratContent = muhuratContent.replace(/"Failed to fetch LLM analysis\."/g, '"Unable to generate astrological guidance."');
fs.writeFileSync(muhuratPath, muhuratContent, 'utf8');

// 2. Add translation to dynamicTranslations.js
const transPath = 'src/i18n/dynamicTranslations.js';
let transContent = fs.readFileSync(transPath, 'utf8');

// We simply replace 'Failed to fetch LLM analysis.' everywhere with 'Unable to generate astrological guidance.'
transContent = transContent.replace(/'Failed to fetch LLM analysis\.'/g, "'Unable to generate astrological guidance.'");

// Then we manually override the values for those keys using a more robust regex that ignores what the right side value was
const localizedErrors = {
  hi: "ज्योतिषीय मार्गदर्शन उत्पन्न करने में असमर्थ।",
  kn: "ಜ್ಯೋತಿಷ್ಯ ಮಾರ್ಗದರ್ಶನ ಪಡೆಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",
  te: "జ్యోతిష్య మార్గదర్శకత్వం పొందడం సాధ్యం కాలేదు.",
  ta: "ஜோதிட வழிகாட்டுதலைப் பெற முடியவில்லை.",
  mr: "ज्योतिषीय मार्गदर्शन मिळवण्यात अक्षम.",
  gu: "જ્યોતિષીય માર્ગદર્શન મેળવવામાં અસમર્થ.",
  bn: "জ্যোতিষ শাস্ত্রীয় নির্দেশাবলী পেতে অক্ষম।",
  ml: "ജ്യോതിഷ മാർഗ്ഗനിർദ്ദേശം നേടാനായില്ല."
};

// First let's find the lines with 'Unable to generate astrological guidance.': 'some text'
// and replace 'some text' with the proper value. But how to do it specifically by language block?
// Easily, dynamicTranslations.js has top-level objects for en:, hi:, kn: etc.
// Instead of risking regex breakage, we can safely execute dynamicTranslations.js to get the object, 
// mutate it, and dump it back. Wait, dynamicTranslations.js is exported as `export const DYNAMIC_STRINGS...`
// I can just replace `"'Unable to generate astrological guidance.': '[^']+',"` with `...`

// Let's use string operations:
for (const [lang, trans] of Object.entries(localizedErrors)) {
  // Find the block for the language
  const regex = new RegExp(\`('\${lang}'\\s*:\\s*\\{[\\\\s\\\\S]*?)'Unable to generate astrological guidance\\.':\\s*'[^']+',?\`);
  transContent = transContent.replace(regex, \`$1'Unable to generate astrological guidance.': '\${trans}',\`);
}

fs.writeFileSync(transPath, transContent, 'utf8');
console.log("Successfully purged technical jargon (LLM) from UI error messages!");
