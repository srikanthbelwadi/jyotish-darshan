import fs from 'fs';
import { translate } from 'bing-translate-api';
import googleTranslate from '@iamtraction/google-translate';
import { NAKSHATRA_LORE } from './src/data/nakshatra_lore.js';

const delay = ms => new Promise(res => setTimeout(res, ms));

async function transText(text, to) {
    if (!text) return text;
    try {
        if (to === 'sa') {
            const res = await googleTranslate(text, { to: 'hi' });
            return res.text;
        }
        const res = await translate(text, null, to);
        return res.translation;
    } catch(e) {
        try {
            const res2 = await googleTranslate(text, { to });
            return res2.text;
        } catch(e2) {
            return text;
        }
    }
}

async function run() {
    const langs = ['hi', 'kn', 'te', 'ta', 'sa', 'mr', 'gu', 'bn', 'ml'];
    let newLore = { ...NAKSHATRA_LORE };
    if (!newLore['en']) {
        newLore = { en: NAKSHATRA_LORE };
    }
    
    // Save function
    const saveState = () => {
        const loreOutput = `export const NAKSHATRA_LORE = ${JSON.stringify(newLore, null, 2)};\n`;
        fs.writeFileSync('src/data/nakshatra_lore.js', loreOutput);
    };

    for (const lang of langs) {
        if (!newLore[lang]) newLore[lang] = {};
        console.log(`Translating Nakshatra Lore for ${lang}...`);
        for (let i = 0; i < 27; i++) {
            if (newLore[lang][i] && newLore[lang][i].name) continue;
            const enObj = newLore['en'][i];
            console.log(`  -> ${i}: ${enObj.name}`);
            try {
                newLore[lang][i] = {
                    name: await transText(enObj.name, lang),
                    famous: await transText(enObj.famous, lang),
                    deity: await transText(enObj.deity, lang),
                    symbol: await transText(enObj.symbol, lang),
                    myth: await transText(enObj.myth, lang)
                };
            } catch(e) {
                console.error("FATAL ERROR, saving state and exiting...");
                saveState();
                return;
            }
            // Small delay to prevent tripping anti-bot
            await delay(150);
            saveState(); 
        }
    }
    console.log("Translation 100% complete!");
}
run();
