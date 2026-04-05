import re

file_path = "/Users/belwadisrikanthpersonal/Astrology Game/jyotish-darshan/src/App.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

replacements = {
    # English
    r"desk:'Jyotish Desk \(Technical Area\)'": r"desk:'Kundali (Jyotish Desk)'",
    
    # Hindi
    r"desk:'ज्योतिष डेस्क \(तकनीकी क्षेत्र\)'": r"desk:'कुण्डली (ज्योतिष डेस्क)'",
    
    # Kannada
    r"desk:'ಜ್ಯೋತಿಷ ಡೆಸ್ಕ್ \(ತಾಂತ್ರಿಕ ಪ್ರದೇಶ\)'": r"desk:'ಕುಂಡಲಿ (ಜ್ಯೋತಿಷ ಡೆಸ್ಕ್)'",
    
    # Telugu
    r"desk:'జ్యోతిష్ డెస్క్ \(సాంకేతిక ప్రాంతం\)'": r"desk:'కుండలి (జ్యోతిష్ డెస్క్)'",
    
    # Tamil
    r"desk:'ஜோதிட டெஸ்க் \(தொழில்நுட்ப பகுதி\)'": r"desk:'குண்டலி (ஜோதிட டெஸ்க்)'",
    
    # Sanskrit
    r"desk:'ज्योतिषपीठम् \(तान्त्रिकक्षेत्रम्\)'": r"desk:'कुण्डली (ज्योतिषपीठम्)'",
    
    # Marathi
    r"desk:'ज्योतिष डेस्क \(तांत्रिक क्षेत्र\)'": r"desk:'कुंडली (ज्योतिष डेस्क)'",
    
    # Gujarati
    r"desk:'જ્યોતિષ ડેસ્ક \(તકનીકી વિભાગ\)'": r"desk:'કુંડળી (જ્યોતિષ ડેસ્ક)'",
    
    # Bengali
    r"desk:'জ্যোতিষ ডেস্ক \(প্রযুক্তিগত এলাকা\)'": r"desk:'কুণ্ডলী (জ্যোতিষ ডেস্ক)'",
    
    # Malayalam
    r"desk:'ജ്യോതിഷ ഡെസ്ക് \(സാങ്കേതിക മേഖല\)'": r"desk:'കുണ്ഡലി (ജ്യോതിഷ ഡെസ്ക്)'",
}

for old, new in replacements.items():
    content = re.sub(old, new, content)

# For Cosmic Blueprint, we just need to replace `{t('Kundali',lang)}` with `{t('inputTitle',lang).replace('Your ', '')}`
# Actually, the user's `inputTitle` for english is "Your Cosmic Blueprint" but they want "Cosmic Blueprint".
content = content.replace("{t('Kundali',lang)}", "{t('inputTitle',lang).replace('Your ', '')}")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
