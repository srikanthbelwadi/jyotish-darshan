import fs from 'fs';

const filePath = 'src/i18n/expertTranslations.js';
let content = fs.readFileSync(filePath, 'utf-8');

const missingLangsData = {
  gu: {
    "er.title": "નિષ્ણાત જ્યોતિષ ફળાદેશ",
    "er.subtitle": "પારાશર હોરા શાસ્ત્ર · લાહિરી અયનાંશ",
    "er.soulBlueprint": "આત્માની રૂપરેખા",
    "er.lifeThemes": "જીવન વિષયોની ઝાંખી",
    "er.career": "કારકિર્દી અને હેતુ:",
    "er.relationships": "સંબંધો:",
    "er.spiritualPath": "આધ્યાત્મિક માર્ગ:",
    "er.lifeJourney": "તમારી જીવન યાત્રા",
    "er.now": "વર્તમાન",
    "er.keyChallenge": "મુખ્ય પડકાર:",
    "er.guidance": "માર્ગદર્શન:",
    "er.coreGuidance": "મુખ્ય માર્ગદર્શન",
    "er.currentPhase": "વર્તમાન તબક્કો: ગહન વિશ્લેષણ",
    "er.note": "નોંધ:",
    "er.noteText": "આ ફળાદેશ શાસ્ત્રીય પારાશરી જ્યોતિષ સિદ્ધાંતો પર આધારિત છે. વ્યાપક વ્યક્તિગત વિશ્લેષણ માટે યોગ્ય જ્યોતિષીની સલાહ લો.",

    "er.profoundDepth": "ગહન સમજ અને આધ્યાત્મિક જાગૃતિ",
    "er.careerJupiter": "ગુરુની શક્તિ શિક્ષણ, કાયદો, નાણાં અથવા આધ્યાત્મિક માર્ગદર્શનમાં સફળતા સૂચવે છે.",
    "er.careerMercury": "બુધની પ્રમુખતા ટેકનોલોજી, લેખન, વાણિજ્ય અથવા સંચારમાં ઉત્કૃષ્ટતા સૂચવે છે.",
    "er.careerSaturn": "શનિની શક્તિ એન્જિનિયરિંગ, વહીવટ અથવા સેવા વ્યવસાયોમાં શિસ્ત દ્વારા સતત સફળતા દર્શાવે છે.",
    "er.careerDefault": "કારકિર્દીનો માર્ગ સતત પ્રયત્નો અને કુદરતી પ્રતિભાના ઉપયોગ દ્વારા સફળતા દર્શાવે છે.",
    "er.yogaGraced": "આ કુંડળી {yogas} દ્વારા સુશોભિત છે, જે સિદ્ધિની સંભાવનાને વધારે છે.",
    "er.yogaDefault": "જોકે મુખ્ય યોગ સ્પષ્ટ ન પણ હોય, કુંડળીમાં તેની પોતાની આગવી શક્તિઓ છે જે સતત પ્રયત્ન દ્વારા પ્રગટ થશે.",
    "er.mangalDosha": "મંગળ દોષની હાજરી સાવચેત જીવનસાથીની પસંદગી માંગે છે. લગ્ન પહેલાં માંગલિક શાંતિની ભલામણ કરવામાં આવે છે.",
    "er.venusExalted": "ઉચ્ચનો શુક્ર સમર્પિત અને પ્રેમાળ જીવનસાથીનું વચન આપે છે.",
    "er.marriageDefault": "7 માં ભાવની સ્થિતિ પરસ્પર આદર અને સમાન મૂલ્યો આધારિત સંબંધ સૂચવે છે.",
    "er.spiritJupiter": "ધાર્મિક અથવા મોક્ષ સ્થાનમાં ગુરુ આધ્યાત્મિક વિકાસ તરફ ઊંડુ વલણ ધરાવતો આત્મા સૂચવે છે.",
    "er.spiritKetu": "મોક્ષ સ્થાનમાં કેતુ પૂર્વ જન્મના આધ્યાત્મિક પુણ્યનું સૂચન કરે છે.",
    "er.spiritDefault": "કુંડળી જીવનના અનુભવો દ્વારા આધ્યાત્મિક જાગૃતિનો ક્રમિક વિકાસ દર્શાવે છે.",
    "er.strongPlanets": " અસાધારણ ગ્રહ શક્તિ {planets} દ્વારા વહે છે, જે બાબતોમાં નિપુણતા પ્રદાન કરે છે.",
    "er.blueprintFormat": "{lagnaReading} આ કુંડળી {lagnaRashi} લગ્નમાં મૂળભૂત છે — જે મુખ્ય વ્યક્તિત્વને આકાર આપે છે. {nakshatra} નક્ષત્રમાં ચંદ્ર ({moonRashi}) ભાવનાત્મક વિશ્વને {nakshatraQuality} થી રંગે છે.{strength}",
    
    "er.antarFormat": "આ સક્રિય અંતર્દશા તેનો પોતાનો પ્રભાવ ઉમેરે છે: {desc}. પડકાર હળવો કરવા {planet} ની ઊર્જાનો ઉપયોગ કરવા પર ધ્યાન કેન્દ્રિત કરો: {challenge}",

    "er.chal.sun": "અહંકાર અને વર્ચસ્વ આધારિત નિર્ણયો ટાળો.",
    "er.guid.sun": "આત્મવિશ્વાસ સાથે નેતૃત્વ કરો. સૂર્ય નમસ્કાર શક્તિ આપે છે.",
    "er.chal.moon": "ભાવનાત્મક અસ્થિરતાથી બચો.",
    "er.guid.moon": "સર્જનાત્મક અભિવ્યક્તિ દ્વારા તમારી લાગણીઓને યોગ્ય માર્ગ આપો.",
    "er.chal.mars": "ગુસ્સામાં ખોટા નિર્ણયો લેવાનું ટાળો.",
    "er.guid.mars": "ઊર્જાને શારીરિક તંદુરસ્તી અથવા સંપત્તિના કાર્યોમાં જોડો.",
    "er.chal.rahu": "લોભ અથવા જલ્દી સફળતા પામવાની વૃત્તિને રોકો.",
    "er.guid.rahu": "પરિવર્તનકારી તકોને સ્વીકારો પણ નૈતિકતા જાળવો.",
    "er.chal.jupiter": "અતિ-આત્મવિશ્વાસથી બચો.",
    "er.guid.jupiter": "ઉચ્ચ શિક્ષણ અને આધ્યાત્મિક જ્ઞાન તરફ લક્ષ્ય રાખો.",
    "er.chal.saturn": "ધીરજ જરૂરી છે, નિરાશાથી બચો.",
    "er.guid.saturn": "સ્થિર શિસ્ત સાથે લાંબા ગાળાના પાયાનું નિર્માણ કરો.",
    "er.chal.mercury": "માનસિક વિચલનથી દૂર રહો.",
    "er.guid.mercury": "લેખન, શિક્ષણ અથવા કૌશલ્ય નિર્માણમાં રોકાણ કરો.",
    "er.chal.ketu": "વધારે પડતા એકાંતની આદત ટાળો.",
    "er.guid.ketu": "ધ્યાન અને આધ્યાત્મિક અભ્યાસને ઊંડુ કરો.",
    "er.chal.venus": "વધુ પડતા ભોગવિલાસથી બચો.",
    "er.guid.venus": "સંબંધો, કલા અને સર્જનાત્મક અભિવ્યક્તિમાં ધ્યાન આપો.",
    "er.ages": "વય",
    "er.yrs": "વર્ષ",
    "er.mahadasha": "મહાદશા",
    "er.antardasha": "અંતર્દશા",
    "er.to": "થી"
  },
  mr: {
    "er.title": "तज्ञ ज्योतिष वाचन",
    "er.subtitle": "पराशर होरा शास्त्र · लाहिरी अयनांश",
    "er.soulBlueprint": "आत्म्याची रूपरेषा",
    "er.lifeThemes": "जीवनाचे मुख्य विषय",
    "er.career": "करिअर आणि उद्देश:",
    "er.relationships": "नातेसंबंध:",
    "er.spiritualPath": "आध्यात्मिक मार्ग:",
    "er.lifeJourney": "तुमचा जीवन प्रवास",
    "er.now": "वर्तमान",
    "er.keyChallenge": "मुख्य आव्हान:",
    "er.guidance": "मार्गदर्शन:",
    "er.coreGuidance": "मुख्य मार्गदर्शन",
    "er.currentPhase": "सध्याचा टप्पा: सखोल विश्लेषण",
    "er.note": "टीप:",
    "er.noteText": "हे विश्लेषण शास्त्रीय पराशरी ज्योतिष सिद्धांतांवर आधारित आहे. सविस्तर वैयक्तिक विश्लेषणासाठी पात्र ज्योतिषाचा सल्ला घ्या.",

    "er.profoundDepth": "सखोल समज आणि आध्यात्मिक जागरूकता",
    "er.careerJupiter": "गुरूची शक्ती शिक्षण, कायदा, वित्त किंवा आध्यात्मिक मार्गदर्शनात यश दर्शवते.",
    "er.careerMercury": "बुधाचे प्राबल्य तंत्रज्ञान, लेखन, वाणिज्य किंवा संप्रेषणात उत्कृष्टतेची सूचना देते.",
    "er.careerSaturn": "शनीची शक्ती अभियांत्रिकी, प्रशासन किंवा सेवा व्यवसायांमध्ये शिस्तीतून सतत यश दर्शवते.",
    "er.careerDefault": "सातत्यपूर्ण प्रयत्नातून करिअरमध्ये चांगले यश मिळण्याची शक्यता आहे.",
    "er.yogaGraced": "ही कुंडली {yogas} द्वारे सुशोभित आहे, जी यशस्वी होण्याची क्षमता वाढवते.",
    "er.yogaDefault": "मुख्य योग प्रामुख्याने नसले तरी, कुंडलीत स्वतःची स्वतंत्र शक्ती आहे जी प्रयत्नातून प्रकट होईल.",
    "er.mangalDosha": "कुजा दोषाची उपस्थिती काळजीपूर्वक जोडीदार निवडण्याची मागणी करते. लग्नापूर्वी मंगळ शांती करण्याची शिफारस केली जाते.",
    "er.venusExalted": "उच्च शुक्र समर्पित आणि प्रेमळ जोडीदाराचे वचन देतो.",
    "er.marriageDefault": "७ व्या भावाची स्थिती परस्पर आदर आणि समान मूल्यांवर आधारित नातेसंबंध सूचित करते.",
    "er.spiritJupiter": "धार्मिक किंवा मोक्ष स्थानात गुरू आध्यात्मिक विकासाकडे खोलवर ओढा असलेला आत्मा दर्शवतो.",
    "er.spiritKetu": "मोक्ष स्थानी केतू मागील जन्माची आध्यात्मिक योग्यता सुचवतो.",
    "er.spiritDefault": "कुंडली जीवनातील अनुभवातून हळूहळू आध्यात्मिक जागरूकता वाढण्याचे संकेत देते.",
    "er.strongPlanets": " {planets} ची असामान्य ताकद दिसून येते, जी त्या क्षेत्रात कौशल्य देते.",
    "er.blueprintFormat": "{lagnaReading} ही कुंडली {lagnaRashi} लग्नावर आधारलेली आहे — जी मूळ व्यक्तिमत्त्वाला आकार देते. {nakshatra} नक्षत्रातील चंद्र ({moonRashi}) भावनात्मक दृष्टिकोन {nakshatraQuality} ने भरतो.{strength}",
    
    "er.antarFormat": "ही सक्रिय उपदशा स्वतःचा प्रभाव जोडते: {desc}. आव्हान कमी करण्यासाठी {planet} ची ऊर्जा योग्य दिशेने वापरण्यावर लक्ष केंद्रित करा: {challenge}",

    "er.chal.sun": "अहंकार असलेल्या निर्णयांचे टाळा.",
    "er.guid.sun": "आत्मविश्वासाने नेतृत्त्व करा. सूर्य नमस्कार केल्याने ऊर्जा मिळते.",
    "er.chal.moon": "भावनिक प्रतिक्रिया देणे टाळा.",
    "er.guid.moon": "सर्जनशीलतेतून स्वतःच्या भावना योग्य मार्गाने मांडा.",
    "er.chal.mars": "रागावर नियंत्रण ठेवा.",
    "er.guid.mars": "तुमची ऊर्जा शारीरिक तंदुरुस्ती किंवा मालमत्तेच्या कामात गुंतवा.",
    "er.chal.rahu": "अनेतिक कामे आणि अति महत्वकांक्षेपासून दूर राहा.",
    "er.guid.rahu": "नवीन कल्पना आणि योग्य बदल धैर्याने स्वीकारा.",
    "er.chal.jupiter": "अति आत्मविश्वासापासून सावध राहा.",
    "er.guid.jupiter": "उच्च शिक्षण आणि तात्विक জ্ঞानाकडे वाटचाल करा.",
    "er.chal.saturn": "अति घाई करू नका, संयम ठेवा.",
    "er.guid.saturn": "शिस्तबद्ध प्रयत्नांनी भविष्याचा पाया मजबूत करा.",
    "er.chal.mercury": "चंचलपणा टाळा.",
    "er.guid.mercury": "लेखन, शिक्षण आणि नवीन कौशल्ये शिकण्यात वेळ द्यॉ.",
    "er.chal.ketu": "अति एकटेपणाची सवय टाळा.",
    "er.guid.ketu": "ध्यानधारणा आणि अध्यात्मात वेळ घालवा.",
    "er.chal.venus": "अति भोगापासून दूर राहा.",
    "er.guid.venus": "कला, नाती आणि सर्जनशीलतेवर लक्ष केंद्रित करा.",
    "er.ages": "वय",
    "er.yrs": "वर्षे",
    "er.mahadasha": "महादशा",
    "er.antardasha": "अंतर्दशा",
    "er.to": "ते"
  }
};

const enNewKeys = {
    "er.chal.sun": "Avoid arrogance and ego-driven decisions.",
    "er.guid.sun": "Step into leadership with confidence. Surya Namaskar supports vitality.",
    "er.chal.moon": "Avoid emotional reactivity.",
    "er.guid.moon": "Nurture emotional well-being through creative expression.",
    "er.chal.mars": "Channel drive constructively.",
    "er.guid.mars": "Direct energy into physical fitness or property matters.",
    "er.chal.rahu": "Ground ambitions in ethical action.",
    "er.guid.rahu": "Embrace innovation and transformative opportunities boldly.",
    "er.chal.jupiter": "Beware of overconfidence.",
    "er.guid.jupiter": "Pursue higher education and philosophical inquiry.",
    "er.chal.saturn": "Patience is paramount.",
    "er.guid.saturn": "Build long-term foundations with steady discipline.",
    "er.chal.mercury": "Avoid mental scatteredness.",
    "er.guid.mercury": "Invest in writing, teaching, or skill-building.",
    "er.chal.ketu": "Avoid excessive withdrawal.",
    "er.guid.ketu": "Deepen meditation and spiritual study.",
    "er.chal.venus": "Avoid indulgence.",
    "er.guid.venus": "Invest in relationships, art, and creative expression.",
    "er.ages": "Ages",
    "er.yrs": "yrs",
    "er.mahadasha": "Mahadasha",
    "er.antardasha": "Antardasha",
    "er.to": "to"
};

// 1. Inject English keys into the EN block
let enInject = "";
for (let [k,v] of Object.entries(enNewKeys)) {
    enInject += `    "${k}": ${JSON.stringify(v)},\n`;
}
content = content.replace(/(en: \{[\s\S]*?)(\n    \/\/ Antardasha format)/, `$1,\n${enInject}$2`);

// 2. We can automatically fall back hi, ta, te, kn missing keys to English so they don't break
for (let lang of ['hi', 'ta', 'te', 'kn']) {
    let langInject = `\n    // Added dynamically to solve missing strings\n`;
    for (let [k,v] of Object.entries(enNewKeys)) {
        langInject += `    "${k}": ${JSON.stringify(v)},\n`;
    }
    content = content.replace(new RegExp(`(${lang}: \\{[\\s\\S]*?)(\\n    "er\\.antarFormat")`), `$1${langInject}    "er.antarFormat"`);
}

// 3. Construct gu, mr stringblocks and append to end of file
let regionalBlocks = "";
for (let lang of ['gu', 'mr']) {
   regionalBlocks += `  ${lang}: {\n`;
   for (let [k,v] of Object.entries(missingLangsData[lang])) {
      regionalBlocks += `    "${k}": ${JSON.stringify(v)},\n`;
   }
   regionalBlocks += `  },\n`;
}

// Just copy Hindi to Sanskrit/Bengali/Malayalam to avoid missing keys entirely if needed, 
// but App.js defaults to English fallback anyway. 
// We will explicitly inject the Guj/Mr correctly.

content = content.replace(/(  ta: \{[\s\S]*?\n  \}(,?))/, `$1\n${regionalBlocks}`);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Gujarati and Marathi translation overrides injected successfully!");
