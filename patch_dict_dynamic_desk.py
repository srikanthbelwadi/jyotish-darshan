import re

file_path = "/Users/belwadisrikanthpersonal/Astrology Game/jyotish-darshan/src/i18n/dynamicTranslations.js"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

replacements = {
    r'"desk\.title":\s*"Jyotish Desk \(Technical Area\)"': r'"desk.title": "Kundali (Jyotish Desk)"',
    r'"desk\.title":\s*"ज्योतिष डेस्क \(तकनीकी क्षेत्र\)"': r'"desk.title": "कुण्डली (ज्योतिष डेस्क)"',
    r'"desk\.title":\s*"ಜ್ಯೋತಿಷ ಡೆಸ್ಕ್ \(ತಾಂತ್ರಿಕ ಪ್ರದೇಶ\)"': r'"desk.title": "ಕುಂಡಲಿ (ಜ್ಯೋತಿಷ ಡೆಸ್ಕ್)"',
    r'"desk\.title":\s*"జ్యోతిష డెస్క్"': r'"desk.title": "కుండలి (జ్యోతిష్ డెస్క్)"', # telugu
    r'"desk\.title":\s*"ஜோதிட மேசை"': r'"desk.title": "குண்டலி (ஜோதிட டெஸ்க்)"', # tamil
    r'"desk\.title":\s*"ज्योतिष डेस्क"': r'"desk.title": "कुंडली (ज्योतिष डेस्क)"', # marathi
    r'"desk\.title":\s*"જ્યોતિષ ડેસ્ક"': r'"desk.title": "કુંડળી (જ્યોતિષ ડેસ્ક)"', # gujarati
    r'"desk\.title":\s*"ജ്യോതിഷ ഡെസ്ക്"': r'"desk.title": "കുണ്ഡലി (ജ്യോതിഷ ഡെസ്ക്)"', # malayalam
    r'"desk\.title":\s*"ज्योतिष पटलम्"': r'"desk.title": "कुण्डली (ज्योतिषपीठम्)"', # sanskrit
    r'"desk\.title":\s*"জ্যোতিষ ডেস্ক"': r'"desk.title": "কুণ্ডলী (জ্যোতিষ ডেস্ক)"', # bengali
}

for old, new in replacements.items():
    content = re.sub(old, new, content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
