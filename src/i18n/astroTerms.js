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
  sa: ['मेषः','वृषभः','मिथुनम्','कर्कटः','सिंहः','कन्या','तुला','वृश्चिकः','धनुः','मकरः','कुम्भः','मीनः'],
  hi: ['मेष','वृषभ','मिथुन','कर्क','सिंह','कन्या','तुला','वृश्चिक','धनु','मकर','कुंभ','मीन'],
  kn: ['ಮೇಷ','ವೃಷಭ','ಮಿಥುನ','ಕರ್ಕ','ಸಿಂಹ','ಕನ್ಯ','ತುಲ','ವೃಶ್ಚಿಕ','ಧನು','ಮಕರ','ಕುಂಭ','ಮೀನ'],
  te: ['మేషం','వృషభం','మిథున','కర్కాటకం','సింహం','కన్య','తుల','వృశ్చికం','ధనుస్సు','మకరం','కుంభం','మీనం'],
  ta: ['மேஷம்','ரிஷபம்','மிதுனம்','கடகம்','சிம்மம்','கன்னி','துலாம்','விருச்சிகம்','தனுசு','மகரம்','கும்பம்','மீனம்'],
  mr: ['मेष','वृषभ','मिथुन','कर्क','सिंह','कन्या','तूळ','वृश्चिक','धनु','मकर','कुंभ','मीन'],
  gu: ['મેષ','વૃષભ','મિથુન','કર્ક','સિંહ','કન્યા','તુલા','વૃશ્ચિક','ધનુ','મકર','કુંભ','મીન'],
  bn: ['মেষ','বৃষ','মিথুন','কর্কট','সিংহ','কন্যা','তুলা','বৃশ্চিক','ধনু','মকর','কুম্ভ','মীন'],
  ml: ['മേടം','ഇടവം','മിഥുനം','കർക്കടകം','ചിങ്ങം','കന്നി','തുലാം','വൃശ്ചികം','ധനു','മകരം','കുംഭം','മീനം']
};

export const GRAHA_NAMES_I18N = {
  sun:     { en:'Sun',     sa:'सूर्यः',    hi:'सूर्य',   kn:'ಸೂರ್ಯ',   te:'సూర్యుడు', ta:'சூரியன்', mr:'सूर्य',   gu:'સૂર્ય',    bn:'সূর্য',     ml:'സൂര്യൻ' },
  moon:    { en:'Moon',    sa:'चन्द्रः',  hi:'चन्द्र',  kn:'ಚಂದ್ರ',    te:'చంద్రుడు', ta:'சந்திரன்', mr:'चंद्र',   gu:'ચંદ્ર',    bn:'চন্দ্র',     ml:'ചന്ദ്രൻ' },
  mars:    { en:'Mars',    sa:'मङ्गलः',   hi:'मंगल',    kn:'ಮಂಗಳ',    te:'అంగారకుడు', ta:'செவ்வாய்', mr:'मंगळ',  gu:'મંગળ',    bn:'মঙ্গল',     ml:'ചൊവ്വ' },
  mercury: { en:'Mercury', sa:'बुधः',      hi:'बुध',      kn:'ಬುಧ',      te:'బుధుడు', ta:'புதன்',    mr:'बुध',     gu:'બુધ',     bn:'বুধ',      ml:'ബുധൻ' },
  jupiter: { en:'Jupiter', sa:'गुरुः',     hi:'गुरु',     kn:'ಗುರು',     te:'గురువు', ta:'குரு',     mr:'गुरु',    gu:'ગુરુ',     bn:'বৃহস্পতি', ml:'വ്യാഴം' },
  venus:   { en:'Venus',   sa:'शुक्रः',   hi:'शुक्र',   kn:'ಶುಕ್ರ',    te:'శుక్రుడు', ta:'சுக்கிரன்',mr:'शुक्र',   gu:'શુક્ર',    bn:'শুক্র',     ml:'ശുക്രൻ' },
  saturn:  { en:'Saturn',  sa:'शनिः',      hi:'शनि',      kn:'ಶನಿ',      te:'శని', ta:'சனி',     mr:'शनि',     gu:'શનિ',     bn:'শনি',      ml:'ശനി' },
  rahu:    { en:'Rahu',    sa:'राहुः',     hi:'राहु',     kn:'ರಾಹು',     te:'రాహువు', ta:'ராகு',    mr:'राहू',    gu:'રાહુ',     bn:'রাহু',     ml:'രാഹു' },
  ketu:    { en:'Ketu',    sa:'केतुः',     hi:'केतु',     kn:'ಕೇತು',     te:'కేతువు', ta:'கேது',    mr:'केतू',    gu:'કેતુ',     bn:'কেতু',     ml:'കേതു' },
};

export function getRashiName(idx, lang = 'sa') {
  return (RASHI_NAMES[lang] || RASHI_NAMES.sa)[idx] || RASHI_NAMES.sa[idx];
}

export function getGrahaName(key, lang = 'sa') {
  const names = GRAHA_NAMES_I18N[key];
  if (!names) return key;
  return names[lang] || names.sa || key;
}
