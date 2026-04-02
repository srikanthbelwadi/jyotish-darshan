import re
import json

with open('src/i18n/expertTranslations.js', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Translate the missing enNewKeys for hi, kn, te, ta.
# We will do this by simply replacing the English strings that were injected with translated strings.

replacements = {
    'hi': {
        '"er.ages": "Ages"': '"er.ages": "आयु"',
        '"er.yrs": "yrs"': '"er.yrs": "वर्ष"',
        '"er.mahadasha": "Mahadasha"': '"er.mahadasha": "महादशा"',
        '"er.antardasha": "Antardasha"': '"er.antardasha": "अंतर्दशा"',
        '"er.to": "to"': '"er.to": "से"',
    },
    'kn': {
        '"er.ages": "Ages"': '"er.ages": "ವಯಸ್ಸು"',
        '"er.yrs": "yrs"': '"er.yrs": "ವರ್ಷ"',
        '"er.mahadasha": "Mahadasha"': '"er.mahadasha": "ಮಹಾದಶ"',
        '"er.antardasha": "Antardasha"': '"er.antardasha": "ಅಂತರ್ದಶ"',
        '"er.to": "to"': '"er.to": "ರಿಂದ"',
        
        '"er.chal.sun": "Avoid arrogance and ego-driven decisions."': '"er.chal.sun": "ಅಹಂಕಾರ ಮತ್ತು ಮೊಂಡುತನದ ನಿರ್ಧಾರಗಳನ್ನು ತಪ್ಪಿಸಿ."',
        '"er.guid.sun": "Step into leadership with confidence. Surya Namaskar supports vitality."': '"er.guid.sun": "ಆತ್ಮವಿಶ್ವಾಸದಿಂದ ನಾಯಕತ್ವ ವಹಿಸಿ. ಸೂರ್ಯ ನಮಸ್ಕಾರದಿಂದ ಶಕ್ತಿ ಹೆಚ್ಚುತ್ತದೆ."',
        '"er.chal.moon": "Avoid emotional reactivity."': '"er.chal.moon": "ಭಾವನಾತ್ಮಕ ಅಸ್ಥಿರತೆಯಿಂದ ದೂರವಿರಿ."',
        '"er.guid.moon": "Nurture emotional well-being through creative expression."': '"er.guid.moon": "ಸೃಜನಶೀಲ ಚಟುವಟಿಕೆಗಳ ಮೂಲಕ ಮಾನಸಿಕ ಶಾಂತಿಯನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳಿ."',
        '"er.chal.mars": "Channel drive constructively."': '"er.chal.mars": "ಅತಿಯಾದ ಕೋಪ ಮತ್ತು ಆತುರವನ್ನು ತಪ್ಪಿಸಿ."',
        '"er.guid.mars": "Direct energy into physical fitness or property matters."': '"er.guid.mars": "ನಿಮ್ಮ ಶಕ್ತಿಯನ್ನು ದೈಹಿಕ ಆರೋಗ್ಯ ಅಥವಾ ಉತ್ತಮ ಕಾರ್ಯಗಳಲ್ಲಿ ತೊಡಗಿಸಿ."',
        '"er.chal.rahu": "Ground ambitions in ethical action."': '"er.chal.rahu": "ಅನೈತಿಕ ಮತ್ತು ಅತಿಯಾಸೆಯ ಆಸೆಗಳನ್ನು ತಡೆಯಿರಿ."',
        '"er.guid.rahu": "Embrace innovation and transformative opportunities boldly."': '"er.guid.rahu": "ನೀತಿಬದ್ಧವಾಗಿ ಹೊಸ ಅವಕಾಶಗಳನ್ನು ಧೈರ್ಯದಿಂದ ಸ್ವೀಕರಿಸಿ."',
        '"er.chal.jupiter": "Beware of overconfidence."': '"er.chal.jupiter": "ಅತಿಯಾದ ಆತ್ಮವಿಶ್ವಾಸವನ್ನು ತಪ್ಪಿಸಿ."',
        '"er.guid.jupiter": "Pursue higher education and philosophical inquiry."': '"er.guid.jupiter": "ಉನ್ನತ ಶಿಕ್ಷಣ ಮತ್ತು ಆಧ್ಯಾತ್ಮಿಕ ಜ್ಞಾನದತ್ತ ಗಮನ ಹರಿಸಿ."',
        '"er.chal.saturn": "Patience is paramount."': '"er.chal.saturn": "ಆತುರಪಡಬೇಡಿ, ತಾಳ್ಮೆ ಇರಲಿ."',
        '"er.guid.saturn": "Build long-term foundations with steady discipline."': '"er.guid.saturn": "ಶಿಸ್ತಿನಿಂದ ದೀರ್ಘಾವಧಿಯ ಗುರಿಗಳನ್ನು ರೂಪಿಸಿ."',
        '"er.chal.mercury": "Avoid mental scatteredness."': '"er.chal.mercury": "ಮಾನಸಿಕ ಗೊಂದಲವನ್ನು ತಪ್ಪಿಸಿ."',
        '"er.guid.mercury": "Invest in writing, teaching, or skill-building."': '"er.guid.mercury": "ಬರವಣಿಗೆ, ಶಿಕ್ಷಣ ಮತ್ತು ಹೊಸ ಕೌಶಲ್ಯಗಳನ್ನು ಕಲಿಯುವಲ್ಲಿ ತೊಡಗಿಸಿಕೊಳ್ಳಿ."',
        '"er.chal.ketu": "Avoid excessive withdrawal."': '"er.chal.ketu": "ಅತಿಯಾದ ಒಂಟಿತನವನ್ನು ತಪ್ಪಿಸಿ."',
        '"er.guid.ketu": "Deepen meditation and spiritual study."': '"er.guid.ketu": "ಧ್ಯಾನ ಮತ್ತು ಆಧ್ಯಾತ್ಮಿಕ ಅಧ್ಯಯನದಲ್ಲಿ ಆಳವಾಗಿ ತೊಡಗಿಕೊಳ್ಳಿ."',
        '"er.chal.venus": "Avoid indulgence."': '"er.chal.venus": "ಅತಿಯಾದ ಭೋಗ-ವಿಲಾಸದಿಂದ ದೂರವಿರಿ."',
        '"er.guid.venus": "Invest in relationships, art, and creative expression."': '"er.guid.venus": "ಸಂಬంధిಗಳು, ಕಲೆ ಮತ್ತು ಸೃಜನಶೀಲ ಕೆಲಸಗಳಲ್ಲಿ ಗಮನ ಹರಿಸಿ."',
    },
    'te': {
        '"er.ages": "Ages"': '"er.ages": "వయస్సు"',
        '"er.yrs": "yrs"': '"er.yrs": "సంవత్సరాలు"',
        '"er.mahadasha": "Mahadasha"': '"er.mahadasha": "మహాదశ"',
        '"er.antardasha": "Antardasha"': '"er.antardasha": "అంతర్దశ"',
        '"er.to": "to"': '"er.to": "కు"',
    },
    'ta': {
        '"er.ages": "Ages"': '"er.ages": "வயது"',
        '"er.yrs": "yrs"': '"er.yrs": "ஆண்டுகள்"',
        '"er.mahadasha": "Mahadasha"': '"er.mahadasha": "மகாதிசை"',
        '"er.antardasha": "Antardasha"': '"er.antardasha": "புக்தி"',
        '"er.to": "to"': '"er.to": "முதல்"',
        
        # Fixing explicit english strings found in ta
        '"er.chal.sun": "Avoid arrogance and ego-driven decisions."': '"er.chal.sun": "அகங்காரம் மற்றும் ஆணவம் கலந்த முடிவுகளைத் தவிர்க்கவும்."',
        '"er.guid.sun": "Step into leadership with confidence. Surya Namaskar supports vitality."': '"er.guid.sun": "தன்னம்பிக்கையுடன் தலைமை தாங்குங்கள். சூரிய நமஸ்காரம் ஆற்றலைத் தரும்."',
        '"er.chal.moon": "Avoid emotional reactivity."': '"er.chal.moon": "அதிகப்படியான உணர்ச்சிவசப்படுவதைத் தவிர்க்கவும்."',
        '"er.guid.moon": "Nurture emotional well-being through creative expression."': '"er.guid.moon": "படைப்பாற்றல் மூலம் மன அமைதியைப் பேணவும்."',
        '"er.chal.mars": "Channel drive constructively."': '"er.chal.mars": "அதிகப்படியான கோபத்தையும் அவசரத்தையும் தவிர்க்கவும்."',
        '"er.guid.mars": "Direct energy into physical fitness or property matters."': '"er.guid.mars": "உடற்பயிற்சி அல்லது ஆக்கபூர்வமான செயல்களில் ஆற்றலை ஈடுபடுத்துங்கள்."',
        '"er.chal.rahu": "Ground ambitions in ethical action."': '"er.chal.rahu": "நியாயமற்ற ஆசைகளைத் தவிர்க்கவும்."',
        '"er.guid.rahu": "Embrace innovation and transformative opportunities boldly."': '"er.guid.rahu": "நேர்மையுடன் புதிய வாய்ப்புகளை தைரியமாக ஏற்றுக்கொள்ளுங்கள்."',
        '"er.chal.jupiter": "Beware of overconfidence."': '"er.chal.jupiter": "அதிகப்படியான தன்னம்பிக்கையைத் தவிர்க்கவும்."',
        '"er.guid.jupiter": "Pursue higher education and philosophical inquiry."': '"er.guid.jupiter": "உயர்கல்வி மற்றும் ஆன்மீக அறிவில் கவனம் செலுத்துங்கள்."',
        '"er.chal.saturn": "Patience is paramount."': '"er.chal.saturn": "அவசரப்பட வேண்டாம், பொறுமையாக இருங்கள்."',
        '"er.guid.saturn": "Build long-term foundations with steady discipline."': '"er.guid.saturn": "விடாமுயற்சி மற்றும் ஒழுக்கத்துடன் நீண்டகால இலக்குகளை அடையுங்கள்."',
        '"er.chal.mercury": "Avoid mental scatteredness."': '"er.chal.mercury": "மன சஞ்சலத்தைத் தவிர்க்கவும்."',
        '"er.guid.mercury": "Invest in writing, teaching, or skill-building."': '"er.guid.mercury": "எழுதுதல், கல்வி மற்றும் புதிய திறன்களை கற்பதில் ஈடுபடுங்கள்."',
        '"er.chal.ketu": "Avoid excessive withdrawal."': '"er.chal.ketu": "அதிகப்படியான தனிமையைத் தவிர்க்கவும்."',
        '"er.guid.ketu": "Deepen meditation and spiritual study."': '"er.guid.ketu": "தியானம் மற்றும் ஆன்மீக வாசிப்பில் கவனம் செலுத்துங்கள்."',
        '"er.chal.venus": "Avoid indulgence."': '"er.chal.venus": "அதிகப்படியான இன்ப நுகர்வைத் தவிர்க்கவும்."',
        '"er.guid.venus": "Invest in relationships, art, and creative expression."': '"er.guid.venus": "உறவுகள், கலை மற்றும் ஆக்கபூர்வமான வேலைகளில் கவனத்தை செலுத்துங்கள்."',
    }
}

for lang, reps in replacements.items():
    block_start = text.find(f'{lang}: {{')
    if block_start == -1: continue
    
    # Extract the block
    block_end = text.find('},', block_start)
    if block_end == -1: 
        block_end = text.find('}', block_start)
        
    block = text[block_start:block_end]
    
    for en_str, loc_str in reps.items():
        block = block.replace(en_str, loc_str)
        
    text = text[:block_start] + block + text[block_end:]


# 2. Add complete `sa` (Sanskrit) dictionary to the end:
sa_dict = """  sa: {
    "er.title": "विशेषज्ञ ज्योतिष दर्शनम्",
    "er.subtitle": "पाराशर होरा शास्त्रम् · लाहिरी अयनांशः",
    "er.soulBlueprint": "आत्मनः रूपरेखा",
    "er.lifeThemes": "जीवनस्य मुख्या विषयाः",
    "er.career": "जीविका उद्देश्यं च:",
    "er.relationships": "सम्बन्धाः:",
    "er.spiritualPath": "आध्यात्मिक मार्गः:",
    "er.lifeJourney": "भवतः जीवनयात्रा",
    "er.now": "वर्तमानम्",
    "er.keyChallenge": "मुख्यमाह्वानम्:",
    "er.guidance": "मार्गदर्शनम्:",
    "er.coreGuidance": "मुख्यं मार्गदर्शनम्",
    "er.currentPhase": "वर्तमानकालः: गहनविश्लेषणम्",
    "er.note": "टिप्पणी:",
    "er.noteText": "इदं दर्शनं शास्त्रीयपाराशरीसिद्धान्तेषु आधारितमस्ति। विस्तृतविश्लेषणाय योग्यज्योतिषिविदुषः परामर्शं गृह्णातु।",
    "er.profoundDepth": "गहनबोधः आध्यात्मिकजागृतिश्च",
    "er.careerJupiter": "गुरोः बलं विद्या, धर्मः, धनम् अथवा आध्यात्मिकमार्गदर्शने सफलतां सूचयति।",
    "er.careerMercury": "बुधस्य बलं तन्त्रज्ञाने, लेखने, वाणिज्ये अथवा सञ्चारे प्रावीण्यं सूचयति।",
    "er.careerSaturn": "शनेः बलं तन्त्रे, प्रशासने अथवा सेवाकार्येषु अनुशासनद्वारा निरन्तरसाफल्यं दर्शयति।",
    "er.careerDefault": "निरन्तरप्रयत्नेन स्वाभाविकप्रतिभायाः उपयोगेन च जीविकायां सफलता प्राप्स्यते।",
    "er.yogaGraced": "इयं कुण्डली {yogas} इत्येतैः योगैः सुशोभिता अस्ति, ये सफलतायाः सम्भावनां वर्धयन्ति।",
    "er.yogaDefault": "यद्यपि मुख्याः योगाः प्रकटाः न सन्ति, तथापि कुण्डल्यां स्वकीया विशिष्टा शक्तिः अस्ति या प्रयत्नेन प्रकटिष्यते।",
    "er.mangalDosha": "कुजदोषस्य उपस्थित्या जीवनसाथीचयनं सावधानतया करणीयम्। विवाहपूर्व मङ्गलशान्तिः उच्यते।",
    "er.venusExalted": "उच्चस्थः शुक्रः समर्पितं स्रेहपूर्णं च जीवनसाथिनं सूचयति।",
    "er.marriageDefault": "सप्तमभावस्य स्थितिः परस्परसम्मानस्य समानमूल्यानां च आधारेण सम्बन्धं सूचयति।",
    "er.spiritJupiter": "धर्मे मोक्षे वा गुरोः स्थितिः आध्यात्मिकविकासाय प्रवृत्तम् आत्मानं सूचयति।",
    "er.spiritKetu": "मोक्षभावे केतुः पूर्वजन्मानाम् आध्यात्मिकपुण्यं सूचयति।",
    "er.spiritDefault": "कुण्डली जीवनानुभवैः आध्यात्मिकजागृतेः क्रमिकविकासं दर्शयति।",
    "er.strongPlanets": " असाधारणग्रहशक्तिः {planets} द्वारा प्रवहति, तेषु क्षेत्रेषु प्रावीण्यं यच्छति च।",
    "er.blueprintFormat": "{lagnaReading} इयं कुण्डली {lagnaRashi} लग्ने आधारिता अस्ति — या मूलव्यक्तित्वम् आकारयति। {nakshatra} नक्षत्रे चन्द्रः ({moonRashi}) भावनात्मकजगत् {nakshatraQuality} इत्यनेन रञ्जयति।{strength}",
    "er.antarFormat": "इयं सक्रियोपदशा स्वकीयम् प्रभावं योजयति: {desc}. आव्हानं न्यूनीकर्तुं {planet} ऊर्जायाः उपयोगे ध्यानं ददातु: {challenge}",
    "er.chal.sun": "अहङ्कारपूर्णान् निर्णयान् त्यजतु।",
    "er.guid.sun": "आत्मविश्वासेन नेतृत्वं करोतु। सूर्यनमस्कारः शक्तिं ददाति।",
    "er.chal.moon": "भावनात्मकप्रतिक्रियां त्यजतु।",
    "er.guid.moon": "रचनात्मककार्यैः मानसिकशान्तिं रक्षतु।",
    "er.chal.mars": "क्रोधम् अतिशीघ्रतां च त्यजतु।",
    "er.guid.mars": "भवतः ऊर्जायै शारीरिकस्वास्थ्ये धनसम्पत्तौ वा ध्यानं ददातु।",
    "er.chal.rahu": "अनैतिककार्याणि लोभं च त्यजतु।",
    "er.guid.rahu": "नवीनताम् अवसरान् च धैर्येण स्वीकरोतु।",
    "er.chal.jupiter": "अत्यात्मविश्वासं त्यजतु।",
    "er.guid.jupiter": "उच्चशिक्षायै आध्यात्मिकज्ञानाय च यतताम्।",
    "er.chal.saturn": "अतिशीघ्रतां त्यजतु, धैर्यं रक्षतु।",
    "er.guid.saturn": "अनुशासनेन दीर्घकालिकलक्ष्यान् प्राप्नोतु।",
    "er.chal.mercury": "मानसिकचाञ्चल्यं त्यजतु।",
    "er.guid.mercury": "लेखने, विद्यायां नवकौशलेषु च ध्यानं ददातु।",
    "er.chal.ketu": "अत्येकान्तं त्यजतु।",
    "er.guid.ketu": "ध्याने आध्यात्मिकपठने च समयं ददातु।",
    "er.chal.venus": "अतिभोगात् विरमतु।",
    "er.guid.venus": "सम्बन्धेषु, कलासु, रचनात्मककार्येषु च ध्यानं ददातु।",
    "er.ages": "वयः",
    "er.yrs": "वर्षाणि",
    "er.mahadasha": "महादशा",
    "er.antardasha": "अन्तर्दशा",
    "er.to": "आ"
  }"""

text = re.sub(r'(\s*ml: \{[\s\S]*?\},?)', r'\1\n' + sa_dict + ',', text)

with open('src/i18n/expertTranslations.js', 'w', encoding='utf-8') as f:
    f.write(text)

print("Patched!")
