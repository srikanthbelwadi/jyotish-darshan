import fs from 'fs';
import translate from '@iamtraction/google-translate';
import { NAKSHATRA_LORE } from './src/data/nakshatra_lore.js';

const langs = ['hi', 'kn', 'te', 'ta', 'sa', 'mr', 'gu', 'bn', 'ml'];
const delay = ms => new Promise(res => setTimeout(res, ms));

async function translateText(text, to) {
    if (!text) return text;
    try {
        const res = await translate(text, { to });
        return res.text;
    } catch (e) {
        console.warn(`Failed to translate to ${to}: ${e.message}`);
        if (to === 'sa') { // Sanskrit fallback to Hindi if sa fails (google translate api sometimes rejects sa)
            try { return (await translate(text, { to: 'hi' })).text; } catch(e2) { return text; }
        }
        return text;
    }
}

async function run() {
    console.log("Starting Phase 3 Translations...");

    // 1. App.jsx UI Strings
    const uiKeys = {
        newChart: "New Chart",
        currentProfile: "Current",
        profile: "Profile",
        todayHorizon: "Today's Horizon",
        weekAhead: "The Week Ahead",
        mixed: "Mixed",
        challenging: "Challenging",
        festival: "Festival",
        fastingPrac: "Fasting & Spiritual Practices",
        auspiciousDay: "Auspicious Day"
    };

    let appStr = fs.readFileSync('src/App.jsx', 'utf-8');

    for (const lang of langs) {
        console.log(`Translating UI for ${lang}...`);
        let translatedUI = [];
        for (const [k, v] of Object.entries(uiKeys)) {
            const t = await translateText(v, lang);
            translatedUI.push(`${k}:'${t.replace(/'/g, "\\'")}'`);
            await delay(100);
        }
        
        const target = `${lang}:{generate:`;
        if (appStr.includes(target)) {
            appStr = appStr.replace(target, `${lang}:{${translatedUI.join(',')},generate:`);
        } else {
            console.log(`Could not find UI target for ${lang}`);
        }
    }

    // Fix the NAKSHATRA_LORE access in App.jsx
    if (appStr.includes("const moonNakLore = NAKSHATRA_LORE[moon.nIdx];")) {
        appStr = appStr.replace("const moonNakLore = NAKSHATRA_LORE[moon.nIdx];", "const moonNakLore = (NAKSHATRA_LORE[lang] || NAKSHATRA_LORE['en'])[moon.nIdx];");
        console.log("Patched NAKSHATRA_LORE access block in App.jsx");
    }

    fs.writeFileSync('src/App.jsx', appStr);
    console.log("App.jsx patched with UI strings and Nakshatra access code.");

    // 2. Nakshatra Lore
    let newLore = { en: NAKSHATRA_LORE };

    // If it's already converted (has 'en' key), don't double nest it
    if (NAKSHATRA_LORE['en']) {
        newLore = NAKSHATRA_LORE;
    }

    for (const lang of langs) {
        console.log(`Translating Nakshatra Lore for ${lang}...`);
        newLore[lang] = {};
        for (let i = 0; i < 27; i++) {
            const enObj = newLore['en'][i];
            newLore[lang][i] = {
                name: await translateText(enObj.name, lang),
                famous: await translateText(enObj.famous, lang),
                deity: await translateText(enObj.deity, lang),
                symbol: await translateText(enObj.symbol, lang),
                myth: await translateText(enObj.myth, lang)
            };
            await delay(200); // respect rate limits
        }
    }

    const loreOutput = `export const NAKSHATRA_LORE = ${JSON.stringify(newLore, null, 2)};\n`;
    fs.writeFileSync('src/data/nakshatra_lore.js', loreOutput);
    console.log("nakshatra_lore.js completely translated and patched!");
    
    console.log("Done.");
}

run();
