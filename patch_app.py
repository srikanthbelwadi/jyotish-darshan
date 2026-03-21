import re

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

headers = {
    'en': "headers:{insights:'My Insights',compatibility:'Relationship Compatibility',addPartner:'Add Partner Details',desk:'Jyotish Desk (Technical Area)'}",
    'hi': "headers:{insights:'मेरी अंतर्दृष्टि',compatibility:'संबंध अनुकूलता',addPartner:'साथी का विवरण जोड़ें',desk:'ज्योतिष डेस्क (तकनीकी क्षेत्र)'}",
    'kn': "headers:{insights:'ನನ್ನ ಒಳನೋಟಗಳು',compatibility:'ಸಂಬಂಧ ಹೊಂದಾಣಿಕೆ',addPartner:'ಪಾಲುದಾರರ ವಿವರ ಸೇರಿಸಿ',desk:'ಜ್ಯೋತಿಷ ಡೆಸ್ಕ್ (ತಾಂತ್ರಿಕ ಪ್ರದೇಶ)'}",
    'te': "headers:{insights:'నా అంతర్దృష్టులు',compatibility:'సంబంధ అనుకూలత',addPartner:'భాగస్వామిని జోడించండి',desk:'జ్యోతిష్ డెస్క్ (సాంకేతిక ప్రాంతం)'}",
    'ta': "headers:{insights:'என் பார்வைகள்',compatibility:'உறவு பொருத்தம்',addPartner:'பங்குதாரரின் விவரங்களைச் சேர்',desk:'ஜோதிட டெஸ்க் (தொழில்நுட்ப பகுதி)'}",
    'sa': "headers:{insights:'मम अन्तर्दृष्टयः',compatibility:'सम्बन्धसङ्गतिः',addPartner:'सहचरीविवरणं योजयतु',desk:'ज्योतिषपीठम् (तान्त्रिकक्षेत्रम्)'}",
    'mr': "headers:{insights:'माय इनसाइट्स',compatibility:'संबंध अनुकूलता',addPartner:'भागीदाराचा तपशील जोडा',desk:'ज्योतिष डेस्क (तांत्रिक क्षेत्र)'}",
    'gu': "headers:{insights:'મારી આંતરદૃષ્ટિ',compatibility:'સંબંધ સુસંગતતા',addPartner:'ભાગીદારની વિગતો ઉમેરો',desk:'જ્યોતિષ ડેસ્ક (તકનીકી વિભાગ)'}",
    'bn': "headers:{insights:'আমার অন্তর্দৃষ্টি',compatibility:'সম্পর্ক সামঞ্জস্য',addPartner:'সঙ্গীর বিবরণ যোগ করুন',desk:'জ্যোতিষ ডেস্ক (প্রযুক্তিগত এলাকা)'}",
    'ml': "headers:{insights:'എന്റെ ഉൾക്കാഴ്ചകൾ',compatibility:'ബന്ധ പൊരുത്തം',addPartner:'പങ്കാളിയുടെ വിവരങ്ങൾ ചേർക്കുക',desk:'ജ്യോതിഷ ഡെസ്ക് (സാങ്കേതിക മേഖല)'}"
}

for lang, header_str in headers.items():
    # Find the tagline for this language and insert headers after it.
    # E.g. search for tagline:'...',  and append header_str,
    pattern = rf"({lang}:{{.*?tagline:'.*?',)"
    content = re.sub(pattern, rf"\1{header_str},", content, count=1)

# Now update `t` function
t_old_func = r"function t\(path,lang\)\{const S=STRINGS\[lang\]\|\|STRINGS\.en;if\(S\[path\]!==undefined\)return S\[path\];const k=path\.split\('\.'\);let v=S;for\(const p of k\)\{v=v\?\.\[p\];\}if\(v!==undefined&&typeof v!=='object'\)return v;const E=STRINGS\.en;if\(E\[path\]!==undefined\)return E\[path\];let e=E;for\(const p of k\)\{e=e\?\.\[p\];\}return\(e!==undefined&&typeof e!=='object'\)\?e:path;\}"

t_new_func = """import { DYNAMIC_STRINGS } from './i18n/dynamicTranslations.js';
function t(path,lang){
  if (DYNAMIC_STRINGS[lang] && DYNAMIC_STRINGS[lang][path]) return DYNAMIC_STRINGS[lang][path];
  const S=STRINGS[lang]||STRINGS.en;
  if(S[path]!==undefined)return S[path];
  const k=path.split('.');
  let v=S;
  for(const p of k){v=v?.[p];}
  if(v!==undefined&&typeof v!=='object')return v;
  const E=STRINGS.en;
  if(E[path]!==undefined)return E[path];
  let e=E;
  for(const p of k){e=e?.[p];}
  return(e!==undefined&&typeof e!=='object')?e:path;
}"""

content = re.sub(t_old_func, t_new_func, content)

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patching complete.")
