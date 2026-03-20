export const LANGUAGES = [
  { code: 'en', label: 'English',      nativeName: 'English' },
  { code: 'hi', label: 'Hindi',        nativeName: 'हिन्दी' },
  { code: 'kn', label: 'Kannada',      nativeName: 'ಕನ್ನಡ' },
  { code: 'te', label: 'Telugu',       nativeName: 'తెలుగు' },
  { code: 'ta', label: 'Tamil',        nativeName: 'தமிழ்' },
  { code: 'sa', label: 'Sanskrit',     nativeName: 'संस्कृतम्' },
  { code: 'mr', label: 'Marathi',      nativeName: 'मराठी' },
  { code: 'gu', label: 'Gujarati',     nativeName: 'ગુજરાતી' },
  { code: 'bn', label: 'Bengali',      nativeName: 'বাংলা' },
  { code: 'ml', label: 'Malayalam',    nativeName: 'മലയാളം' },
];

export const RASHI_NAMES = {
  en: ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'],
  sa: ['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya','Tula','Vrischika','Dhanu','Makara','Kumbha','Meena'],
  hi: ['मेष','वृषभ','मिथुन','कर्क','सिंह','कन्या','तुला','वृश्चिक','धनु','मकर','कुंभ','मीन'],
  kn: ['ಮೇಷ','ವೃಷಭ','ಮಿಥುನ','ಕರ್ಕ','ಸಿಂಹ','ಕನ್ಯ','ತುಲ','ವೃಶ್ಚಿಕ','ಧನು','ಮಕರ','ಕುಂಭ','ಮೀನ'],
  te: ['మేషం','వృషభం','మిథున','కర్కాటకం','సింహం','కన్య','తుల','వృశ్చికం','ధనుస్సు','మకరం','కుంభం','మీనం'],
  ta: ['மேஷம்','ரிஷபம்','மிதுனம்','கடகம்','சிம்மம்','கன்னி','துலாம்','விருச்சிகம்','தனுசு','மகரம்','கும்பம்','மீனம்'],
};

export const GRAHA_NAMES_I18N = {
  sun:     { en:'Sun',     sa:'Surya',    hi:'सूर्य',    kn:'ಸೂರ್ಯ',   te:'సూర్యుడు', ta:'சூரியன்' },
  moon:    { en:'Moon',    sa:'Chandra',  hi:'चन्द्र',   kn:'ಚಂದ್ರ',    te:'చంద్రుడు', ta:'சந்திரன்' },
  mars:    { en:'Mars',    sa:'Mangal',   hi:'मंगल',     kn:'ಮಂಗಳ',    te:'అంగారకుడు', ta:'செவ்வாய்' },
  mercury: { en:'Mercury', sa:'Budha',    hi:'बुध',       kn:'ಬುಧ',      te:'బుధుడు', ta:'புதன்' },
  jupiter: { en:'Jupiter', sa:'Guru',     hi:'गुरु',      kn:'ಗುರು',     te:'గురువు', ta:'குரு' },
  venus:   { en:'Venus',   sa:'Shukra',   hi:'शुक्र',    kn:'ಶುಕ್ರ',    te:'శుక్రుడు', ta:'சுக்கிரன்' },
  saturn:  { en:'Saturn',  sa:'Shani',    hi:'शनि',       kn:'ಶನಿ',      te:'శని', ta:'சனி' },
  rahu:    { en:'Rahu',    sa:'Rahu',     hi:'राहु',      kn:'ರಾಹು',     te:'రాహువు', ta:'ராகு' },
  ketu:    { en:'Ketu',    sa:'Ketu',     hi:'केतु',      kn:'ಕೇತು',     te:'కేతువు', ta:'கேது' },
};

export function getRashiName(idx, lang = 'sa') {
  return (RASHI_NAMES[lang] || RASHI_NAMES.sa)[idx] || RASHI_NAMES.sa[idx];
}

export function getGrahaName(key, lang = 'sa') {
  const names = GRAHA_NAMES_I18N[key];
  if (!names) return key;
  return names[lang] || names.sa || key;
}
