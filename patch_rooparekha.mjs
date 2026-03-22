import fs from 'fs';

let content = fs.readFileSync('src/App.jsx', 'utf8');

const translations = {
  en: '"Your Cosmic Blueprint"', // English remains the same
  hi: '"ब्रह्माण्डीय रूपरेखा"', // Hindi
  kn: '"ಬ್ರಹ್ಮಾಂಡೀಯ ರೂಪರೇಖೆ"', // Kannada
  te: '"బ్రహ్మాండీయ రూపరేఖ"', // Telugu
  ta: '"பிரம்மாண்ட ரூபரேகா"', // Tamil
  sa: '"ब्रह्माण्डीय रूपरेखा"', // Sanskrit
  mr: '"ब्रह्माण्डीय रूपरेखा"', // Marathi
  gu: '"બ્રહ્માંડીય રૂપરેખા"', // Gujarati
  bn: '"ব্রহ્মাণ্ডীয় রূপরেখা"', // Bengali - wait, let me fix this spelling manually to be safe 'ব্রহ্মাণ্ডীয় রূপরেখা'
  ml: '"ബ്രഹ്മാണ്ഡ രൂപരേഖ"', // Malayalam
};

// Fix Bengali spelling
translations.bn = '"ব্রহ্মাণ্ডীয় রূপরেখা"';


for (const [lang, trans] of Object.entries(translations)) {
  const regex = new RegExp(`(${lang}:\\s*\\{[^}]*?)inputTitle:\\s*["'][^"']*["']`, 's');
  content = content.replace(regex, `$1inputTitle:${trans}`);
}

fs.writeFileSync('src/App.jsx', content);
console.log('App.jsx updated with exact native scripts for Brahmandiya Rooparekha.');
