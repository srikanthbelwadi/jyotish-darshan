import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';

// 1. Initialize Gemini
const envContent = fs.readFileSync('.env.local', 'utf-8');
const keyLine = envContent.split('\n').find(l => l.startsWith('GEMINI_API_KEY='));
const apiKey = keyLine ? keyLine.split('=')[1].trim().replace(/['"]/g, '') : process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("No API key found.");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig: { responseMimeType: "application/json" } });

// 2. Data Arrays
const SAMVATSARAS = [ "Prabhava", "Vibhava", "Shukla", "Pramoda", "Prajapathi", "Angirasa", "Shrimukha", "Bhava", "Yuva", "Dhatri", "Ishvara", "Bahudhanya", "Pramathi", "Vikrama", "Vrushapraja", "Chitrabhanu", "Subhanu", "Tarana", "Parthiva", "Vyaya", "Sarvajit", "Sarvadhari", "Virodhi", "Vikruti", "Khara", "Nandana", "Vijaya", "Jaya", "Manmatha", "Durmukha", "Hevilambi", "Vilambi", "Vikari", "Sharvari", "Plava", "Shubhakrut", "Shobhakrut", "Krodhi", "Vishvavasu", "Parabhava", "Plavanga", "Kilaka", "Saumya", "Sadharana", "Virodhikrut", "Paridhavi", "Pramadi", "Ananda", "Rakshasa", "Nala", "Pingala", "Kalayukti", "Siddharthi", "Raudra", "Durmati", "Dundubhi", "Rudhirodgari", "Raktaksha", "Krodhana", "Akshaya" ];
const NAKSHATRAS = ["Ashvini", "Bharani", "Krittika", "Rohini", "Mrigashirsha", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"];
const YOGAS = ["Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma", "Dhriti", "Shula", "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyan", "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"];
const KARANAS = ["Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti", "Kintughna", "Shakuni", "Chatushpada", "Naga"];
const RASHIS = ["Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya", "Tula", "Vrishchika", "Dhanu", "Makara", "Kumbha", "Meena"];
const RITUS = ["Vasant", "Grishma", "Varsha", "Sharad", "Hemant", "Shishir"];
const AYANAS = ["Uttarayana", "Dakshinayana"];
const VARS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const payload = {
    samvatsaras: SAMVATSARAS,
    nakshatras: NAKSHATRAS,
    yogas: YOGAS,
    karanas: KARANAS,
    rashis: RASHIS,
    ritus: RITUS,
    ayanas: AYANAS,
    vars: VARS
};

const LANGUAGES = [
    { code: "hi", name: "Hindi" },
    { code: "kn", name: "Kannada" },
    { code: "te", name: "Telugu" },
    { code: "ta", name: "Tamil" },
    { code: "mr", name: "Marathi" },
    { code: "gu", name: "Gujarati" },
    { code: "bn", name: "Bengali" },
    { code: "ml", name: "Malayalam" }
];

const promptTemplate = `
You are an expert Vedic astrologer and linguist. 
I have a JSON object containing arrays of Sanskrit proper nouns used in Jyotisha (Vedic Astrology).
I need you to TRANSLITERATE these exact Sanskrit proper nouns into the native script of $\{TARGET_LANGUAGE\}.

CRITICAL INSTRUCTION:
Do NOT translate the semantic meaning of the words! 
For example, "Mrigashirsha" MUST be given in the target language's phonetic script for Mrigashirsha (e.g. in Kannada: ಮೃಗಶೀರ್ಷ). Do NOT translate it to "Deer Head".
"Bava" MUST be given phonetically as Bava (e.g. in Kannada: ಬವ). Do NOT translate it to "Mouth".
"Parabhava" MUST be given phonetically as Parabhava. Do NOT translate it to "Defeat".
"Balava" MUST be given phonetically. Do NOT translate to "Riot".

The ONLY EXCEPTION is 'vars' (Days of the Week "Sunday", "Monday", etc), which CAN be translated to their native day names (e.g. Bhanuvara, Somavara, etc. or equivalent).
Rashis should be provided as their native Indian names (e.g. Mesha, Vrishabha).

Return a pure JSON dictionary matching the structure of my payload exactly, where the values inside the arrays are replaced by their strings in $\{TARGET_LANGUAGE\}.

Input payload structure:
${JSON.stringify(payload, null, 2)}
`;

async function processTranslations() {
    const dbPath = 'src/i18n/dashboardTranslations.json';
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

    for (const lang of LANGUAGES) {
        console.log(`Translating to ${lang.name}...`);
        const prompt = promptTemplate.replace(/\$\{TARGET_LANGUAGE\}/g, lang.name);
        
        try {
            const response = await model.generateContent(prompt);
            const text = response.response.text();
            const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const result = JSON.parse(cleanedText);

            if (!db[lang.code]) db[lang.code] = {};
            
            const mapKeys = (keyPrefix, arrInput, arrOutput) => {
                arrInput.forEach((item, idx) => {
                    db[lang.code][`${keyPrefix}.${item}`] = arrOutput[idx];
                });
            };

            mapKeys('pc.samv', SAMVATSARAS, result.samvatsaras);
            mapKeys('pc.nak', NAKSHATRAS, result.nakshatras);
            mapKeys('pc.yog', YOGAS, result.yogas);
            mapKeys('pc.kar', KARANAS, result.karanas);
            
            RASHIS.forEach((r, i) => {
                const enNames = ["Aries (Mesha)", "Taurus (Vrishabha)", "Gemini (Mithuna)", "Cancer (Karka)", "Leo (Simha)", "Virgo (Kanya)", "Libra (Tula)", "Scorpio (Vrishchika)", "Sagittarius (Dhanu)", "Capricorn (Makara)", "Aquarius (Kumbha)", "Pisces (Meena)"];
                db[lang.code][`pc.rsh.${enNames[i]}`] = result.rashis[i];
            });

            mapKeys('pc.ritu', RITUS, result.ritus);
            mapKeys('pc.ayana', AYANAS, result.ayanas);
            
            const shortVars = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            VARS.forEach((v, i) => {
                db[lang.code][`pc.${shortVars[i]}`] = result.vars[i];
            });

            console.log(`✅ Applied for ${lang.name}`);

        } catch (e) {
            console.error(`Failed for ${lang.name}`, e);
        }
    }

    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
    console.log("Translation injection complete!");
}

processTranslations();
