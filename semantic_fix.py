import re

# Semantic Astrological Mappings
fixes = {
    'hi': {
        'Aries': 'मेष', 'Taurus': 'वृषभ', 'Gemini': 'मिथुन', 'Cancer': 'कर्क',
        'Leo': 'सिंह', 'Virgo': 'कन्या', 'Libra': 'तुला', 'Scorpio': 'वृश्चिक',
        'Sagittarius': 'धनु', 'Capricorn': 'मकर', 'Aquarius': 'कुंभ', 'Pisces': 'मीन',
        'yo.rashi.0': 'मेष', 'yo.rashi.1': 'वृषभ', 'yo.rashi.2': 'मिथुन', 'yo.rashi.3': 'कर्क',
        'yo.rashi.4': 'सिंह', 'yo.rashi.5': 'कन्या', 'yo.rashi.6': 'तुला', 'yo.rashi.7': 'वृश्चिक',
        'yo.rashi.8': 'धनु', 'yo.rashi.9': 'मकर', 'yo.rashi.10': 'कुंभ', 'yo.rashi.11': 'मीन',
        'Sun': 'रवि', 'Mon': 'सोम', 'Tue': 'मंगल', 'Wed': 'बुध', 'Thu': 'गुरु', 'Fri': 'शुक्र', 'Sat': 'शनि'
    },
    'mr': {
        'Aries': 'मेष', 'Taurus': 'वृषभ', 'Gemini': 'मिथुन', 'Cancer': 'कर्क',
        'Leo': 'सिंह', 'Virgo': 'कन्या', 'Libra': 'तुला', 'Scorpio': 'वृश्चिक',
        'Sagittarius': 'धनु', 'Capricorn': 'मकर', 'Aquarius': 'कुंभ', 'Pisces': 'मीन',
        'yo.rashi.0': 'मेष', 'yo.rashi.1': 'वृषभ', 'yo.rashi.2': 'मिथुन', 'yo.rashi.3': 'कर्क',
        'yo.rashi.4': 'सिंह', 'yo.rashi.5': 'कन्या', 'yo.rashi.6': 'तुला', 'yo.rashi.7': 'वृश्चिक',
        'yo.rashi.8': 'धनु', 'yo.rashi.9': 'मकर', 'yo.rashi.10': 'कुंभ', 'yo.rashi.11': 'मीन',
        'Sun': 'रवि', 'Mon': 'सोम', 'Tue': 'मंगळ', 'Wed': 'बुध', 'Thu': 'गुरु', 'Fri': 'शुक्र', 'Sat': 'शनि'
    },
    'gu': {
        'Aries': 'મેષ', 'Taurus': 'વૃષભ', 'Gemini': 'મિથુન', 'Cancer': 'કર્ક',
        'Leo': 'સિંહ', 'Virgo': 'કન્યા', 'Libra': 'તુલા', 'Scorpio': 'વૃશ્ચિક',
        'Sagittarius': 'ધન', 'Capricorn': 'મકર', 'Aquarius': 'કુંભ', 'Pisces': 'મીન',
        'yo.rashi.0': 'મેષ', 'yo.rashi.1': 'વૃષભ', 'yo.rashi.2': 'મિથુન', 'yo.rashi.3': 'કર્ક',
        'yo.rashi.4': 'સિંહ', 'yo.rashi.5': 'કન્યા', 'yo.rashi.6': 'તુલા', 'yo.rashi.7': 'વૃશ્ચિક',
        'yo.rashi.8': 'ધન', 'yo.rashi.9': 'મકર', 'yo.rashi.10': 'કુંભ', 'yo.rashi.11': 'મીન',
        'Sun': 'રવિ', 'Mon': 'સોમ', 'Tue': 'મંગળ', 'Wed': 'બુધ', 'Thu': 'ગુરુ', 'Fri': 'શુક્ર', 'Sat': 'શનિ'
    },
    'bn': {
        'Aries': 'মেষ', 'Taurus': 'বৃষ', 'Gemini': 'মিথুন', 'Cancer': 'কর্কট',
        'Leo': 'সিংহ', 'Virgo': 'কন্যা', 'Libra': 'তুলা', 'Scorpio': 'বৃশ্চিক',
        'Sagittarius': 'ধনু', 'Capricorn': 'মকর', 'Aquarius': 'কুম্ভ', 'Pisces': 'মীন',
        'yo.rashi.0': 'মেষ', 'yo.rashi.1': 'বৃষ', 'yo.rashi.2': 'মিথুন', 'yo.rashi.3': 'কর্কট',
        'yo.rashi.4': 'সিংহ', 'yo.rashi.5': 'কন্যা', 'yo.rashi.6': 'তুলা', 'yo.rashi.7': 'বৃশ্চিক',
        'yo.rashi.8': 'ধনু', 'yo.rashi.9': 'মকর', 'yo.rashi.10': 'কুম্ভ', 'yo.rashi.11': 'মীন',
        'Sun': 'রবি', 'Mon': 'সোম', 'Tue': 'মঙ্গল', 'Wed': 'বুধ', 'Thu': 'বৃহস্পতি', 'Fri': 'শুক্র', 'Sat': 'শনি'
    },
    'ta': {
        'Aries': 'மேஷம்', 'Taurus': 'ரிஷபம்', 'Gemini': 'மிதுனம்', 'Cancer': 'கடகம்',
        'Leo': 'சிம்மம்', 'Virgo': 'கன்னி', 'Libra': 'துலாம்', 'Scorpio': 'விருச்சிகம்',
        'Sagittarius': 'தனுசு', 'Capricorn': 'மகரம்', 'Aquarius': 'கும்பம்', 'Pisces': 'மீனம்',
        'yo.rashi.0': 'மேஷம்', 'yo.rashi.1': 'ரிஷபம்', 'yo.rashi.2': 'மிதுனம்', 'yo.rashi.3': 'கடகம்',
        'yo.rashi.4': 'சிம்மம்', 'yo.rashi.5': 'கன்னி', 'yo.rashi.6': 'துலாம்', 'yo.rashi.7': 'விருச்சிகம்',
        'yo.rashi.8': 'தனுசு', 'yo.rashi.9': 'மகரம்', 'yo.rashi.10': 'கும்பம்', 'yo.rashi.11': 'மீனம்',
        'Sun': 'ஞாயிறு', 'Mon': 'திங்கள்', 'Tue': 'செவ்வாய்', 'Wed': 'புதன்', 'Thu': 'வியாழன்', 'Fri': 'வெள்ளி', 'Sat': 'சனி'
    },
    'te': {
        'Aries': 'మేషం', 'Taurus': 'వృషభం', 'Gemini': 'మిథునం', 'Cancer': 'కర్కాటకం',
        'Leo': 'సింహం', 'Virgo': 'కన్య', 'Libra': 'తుల', 'Scorpio': 'వృశ్చికం',
        'Sagittarius': 'ధనుస్సు', 'Capricorn': 'మకరం', 'Aquarius': 'కుంభం', 'Pisces': 'మీనం',
        'yo.rashi.0': 'మేషం', 'yo.rashi.1': 'వృషభం', 'yo.rashi.2': 'మిథునం', 'yo.rashi.3': 'కర్కాటకం',
        'yo.rashi.4': 'సింహం', 'yo.rashi.5': 'కన్య', 'yo.rashi.6': 'తుల', 'yo.rashi.7': 'వృశ్చికం',
        'yo.rashi.8': 'ధనుస్సు', 'yo.rashi.9': 'మకరం', 'yo.rashi.10': 'కుంభం', 'yo.rashi.11': 'మీనం',
        'Sun': 'ఆది', 'Mon': 'సోమ', 'Tue': 'మంగళ', 'Wed': 'బుధ', 'Thu': 'గురు', 'Fri': 'శుక్ర', 'Sat': 'శని'
    },
    'kn': {
        'Aries': 'ಮೇಷ', 'Taurus': 'ವೃಷಭ', 'Gemini': 'ಮಿಥುನ', 'Cancer': 'ಕರ್ಕಾಟಕ',
        'Leo': 'ಸಿಂಹ', 'Virgo': 'ಕನ್ಯಾ', 'Libra': 'ತುಲಾ', 'Scorpio': 'ವೃಶ್ಚಿಕ',
        'Sagittarius': 'ಧನುಸ್ಸು', 'Capricorn': 'ಮಕರ', 'Aquarius': 'ಕುಂಭ', 'Pisces': 'ಮೀನ',
        'yo.rashi.0': 'ಮೇಷ', 'yo.rashi.1': 'ವೃಷಭ', 'yo.rashi.2': 'ಮಿಥುನ', 'yo.rashi.3': 'ಕರ್ಕಾಟಕ',
        'yo.rashi.4': 'ಸಿಂಹ', 'yo.rashi.5': 'ಕನ್ಯಾ', 'yo.rashi.6': 'ತುಲಾ', 'yo.rashi.7': 'ವೃಶ್ಚಿಕ',
        'yo.rashi.8': 'ಧನುಸ್ಸು', 'yo.rashi.9': 'ಮಕರ', 'yo.rashi.10': 'ಕುಂಭ', 'yo.rashi.11': 'ಮೀನ',
        'Sun': 'ರವಿ', 'Mon': 'ಸೋಮ', 'Tue': 'ಮಂಗಳ', 'Wed': 'ಬುಧ', 'Thu': 'ಗುರು', 'Fri': 'ಶುಕ್ರ', 'Sat': 'ಶನಿ'
    },
    'ml': {
        'Aries': 'മേടം', 'Taurus': 'ഇടവം', 'Gemini': 'മിഥുനം', 'Cancer': 'കർക്കടകം',
        'Leo': 'ചിങ്ങം', 'Virgo': 'കന്നി', 'Libra': 'തുലാം', 'Scorpio': 'വൃശ്ചികം',
        'Sagittarius': 'ധനു', 'Capricorn': 'മകരം', 'Aquarius': 'കുംഭം', 'Pisces': 'മീനം',
        'yo.rashi.0': 'മേടം', 'yo.rashi.1': 'ഇടവം', 'yo.rashi.2': 'മിഥുനം', 'yo.rashi.3': 'കർക്കടകം',
        'yo.rashi.4': 'ചിങ്ങം', 'yo.rashi.5': 'കന്നി', 'yo.rashi.6': 'തുലാം', 'yo.rashi.7': 'വൃശ്ചികം',
        'yo.rashi.8': 'ധനു', 'yo.rashi.9': 'മകരം', 'yo.rashi.10': 'കുംഭം', 'yo.rashi.11': 'മീനം',
        'Sun': 'ഞായർ', 'Mon': 'തിങ്കൾ', 'Tue': 'ചൊവ്വ', 'Wed': 'ബുധൻ', 'Thu': 'വ്യാഴം', 'Fri': 'വെള്ളി', 'Sat': 'ശനി'
    },
    'sa': {
        'Aries': 'मेष', 'Taurus': 'वृषभ', 'Gemini': 'मिथुन', 'Cancer': 'कर्क',
        'Leo': 'सिंह', 'Virgo': 'कन्या', 'Libra': 'तुला', 'Scorpio': 'वृश्चिक',
        'Sagittarius': 'धनु', 'Capricorn': 'मकर', 'Aquarius': 'कुम्भ', 'Pisces': 'मीन',
        'yo.rashi.0': 'मेष', 'yo.rashi.1': 'वृषभ', 'yo.rashi.2': 'मिथुन', 'yo.rashi.3': 'कर्क',
        'yo.rashi.4': 'सिंह', 'yo.rashi.5': 'कन्या', 'yo.rashi.6': 'तुला', 'yo.rashi.7': 'वृश्चिक',
        'yo.rashi.8': 'धनु', 'yo.rashi.9': 'मकर', 'yo.rashi.10': 'कुम्भ', 'yo.rashi.11': 'मीन',
        'Sun': 'रवि', 'Mon': 'सोम', 'Tue': 'भौम', 'Wed': 'बुध', 'Thu': 'गुरु', 'Fri': 'शुक्र', 'Sat': 'शनि'
    }
}

with open('src/i18n/dynamicTranslations.js', 'r', encoding='utf-8') as f:
    text = f.read()

import json

for lang, mapping in fixes.items():
    # find block for lang
    # lang block is typically    lang: { ... },
    # we can use a simpler approach: parse the JS? No, simple regex replace within the block
    block_start = text.find(f'{lang}: {{')
    if block_start == -1: 
        if lang == 'sa' and "sa: {" not in text:
            # sa block might be completely missing in dynamicTranslations.js !
            continue
        continue
    
    # We find the end of the block
    # It ends with `  },`
    block_end = text.find('  },', block_start)
    if block_end == -1:
        block_end = text.find('  }', block_start)
    
    block = text[block_start:block_end]
    
    # Do targeted exact replacements for the English keys inside that lang block
    for k, v in mapping.items():
        # Match EXACTLY `'k': 'anything'` or `"k": "anything"`
        # e.g. 'Aries': 'एआरआईएस',
        # pattern: r"(['\"])" + k + r"\1\s*:\s*(['\"])(.*?)\2"
        p = r"(['\"]" + re.escape(k) + r"['\"]\s*:\s*)['\"](.*?)['\"]"
        block = re.sub(p, r"\g<1>'" + v + "'", block)
        
    text = text[:block_start] + block + text[block_end:]

with open('src/i18n/dynamicTranslations.js', 'w', encoding='utf-8') as f:
    f.write(text)

print("Semantic patches applied!")
