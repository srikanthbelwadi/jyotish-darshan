with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

replacements = [
    ("en:{", "tagline:'VEDIC BIRTH CHART · ज्योतिष दर्शन',", "headers:{insights:'My Insights',compatibility:'Relationship Compatibility',addPartner:'Add Partner Details',desk:'Jyotish Desk (Technical Area)'},"),
    ("hi:{", "tagline:'वैदिक जन्म कुंडली · ज्योतिष दर्शन',", "headers:{insights:'मेरी अंतर्दृष्टि',compatibility:'संबंध अनुकूलता',addPartner:'साथी का विवरण जोड़ें',desk:'ज्योतिष डेस्क (तकनीकी क्षेत्र)'},"),
    ("kn:{", "tagline:'ವೈದಿಕ ಜನ್ಮ ಕುಂಡಲಿ · ಜ್ಯೋತಿಷ ದರ್ಶನ',", "headers:{insights:'ನನ್ನ ಒಳನೋಟಗಳು',compatibility:'ಸಂಬಂಧ ಹೊಂದಾಣಿಕೆ',addPartner:'ಪಾಲುದಾರರ ವಿವರ ಸೇರಿಸಿ',desk:'ಜ್ಯೋತಿಷ ಡೆಸ್ಕ್ (ತಾಂತ್ರಿಕ ಪ್ರದೇಶ)'},"),
    ("te:{", "tagline:'వైదిక జన్మ కుండలి · జ్యోతిష్ దర్శన్',", "headers:{insights:'నా అంతర్దృష్టులు',compatibility:'సంబంధ అనుకూలత',addPartner:'భాగస్వామిని జోడించండి',desk:'జ్యోతిష్ డెస్క్ (సాంకేతిక ప్రాంతం)'},"),
    ("ta:{", "tagline:'வேத ஜாதகம் · ஜோதிட தரிசனம்',", "headers:{insights:'என் பார்வைகள்',compatibility:'உறவு பொருத்தம்',addPartner:'பங்குதாரரின் விவரங்களைச் சேர்',desk:'ஜோதிட டெஸ்க் (தொழில்நுட்ப பகுதி)'},"),
    ("sa:{", "tagline:'जन्मकुण्डली · ज्योतिर्दर्शनम्',", "headers:{insights:'मम अन्तर्दृष्टयः',compatibility:'सम्बन्धसङ्गतिः',addPartner:'सहचरीविवरणं योजयतु',desk:'ज्योतिषपीठम् (तान्त्रिकक्षेत्रम्)'},"),
    ("mr:{", "tagline:'वैदिक जन्म कुंडली · ज्योतिष दर्शन',", "headers:{insights:'माय इनसाइट्स',compatibility:'संबंध अनुकूलता',addPartner:'भागीदाराचा तपशील जोडा',desk:'ज्योतिष डेस्क (तांत्रिक क्षेत्र)'},"),
    ("gu:{", "tagline:'વૈદિક જન્મ કુંડળી · જ્યોતિષ દર્શન',", "headers:{insights:'મારી આંતરદૃષ્ટિ',compatibility:'સંબંધ સુસંગતતા',addPartner:'ભાગીદારની વિગતો ઉમેરો',desk:'જ્યોતિષ ડેસ્ક (તકનીકી વિભાગ)'},"),
    ("bn:{", "tagline:'বৈদিক জন্ম কুণ্ডলী · জ্যোতিষ দর্শন',", "headers:{insights:'আমার অন্তর্দৃষ্টি',compatibility:'সম্পর্ক সামঞ্জস্য',addPartner:'সঙ্গীর বিবরণ যোগ করুন',desk:'জ্যোতিষ ডেস্ক (প্রযুক্তিগত এলাকা)'},"),
    ("ml:{", "tagline:'വൈദിക ജനം കുണ്ഡലി · ജ്യോതിഷ ദർശൻ',", "headers:{insights:'എന്റെ ഉൾക്കാഴ്ചകൾ',compatibility:'ബന്ധ പൊരുത്തം',addPartner:'പങ്കാളിയുടെ വിവരങ്ങൾ ചേർക്കുക',desk:'ജ്യോതിഷ ഡെസ്ക് (സാങ്കേതിക മേഖല)'},")
]

for lang_prefix, tagline, header_str in replacements:
    # Find the line starting with lang_prefix
    lines = content.split('\n')
    for i, line in enumerate(lines):
        if line.startswith(lang_prefix):
            # Replace tagline with tagline + header
            new_line = line.replace(tagline, f"{tagline}{header_str}")
            if new_line != line:
                lines[i] = new_line
                print(f"Patched {lang_prefix}")
            else:
                print(f"Failed to patch {lang_prefix}")
            break
    content = '\n'.join(lines)

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Exact patch complete.")
