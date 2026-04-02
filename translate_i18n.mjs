import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

// Provide your GEMINI_API_KEY as an environment variable
const ai = new GoogleGenAI({});

const LANGS = {
  hi: 'Hindi',
  kn: 'Kannada',
  te: 'Telugu',
  ta: 'Tamil',
  sa: 'Sanskrit',
  mr: 'Marathi',
  gu: 'Gujarati',
  bn: 'Bengali',
  ml: 'Malayalam'
};

// Shastric enforcement rules to maintain authenticity over literal phonetic translation.
const SHASTRIC_RULES = `
- Keep the tone deeply spiritual, respectful, and authoritative.
- PREFER classical Sanskrit astronomical terms (e.g. 'Lagna' instead of 'Ascendant', 'Vakri' instead of 'Retrograde', 'Graha' for 'Planet').
- Do not blindly transliterate English concepts. Map them to authentic Jyotish vocabulary native to the target language.
- Provide the translation strictly as valid JSON without any markdown formatting wrappers.
`;

const LOCALES_DIR = path.join(process.cwd(), 'src', 'i18n', 'locales');

async function translateDictionary(sourceData, targetLangName) {
  const prompt = `
You are an expert Vedic Astrologer native in ${targetLangName}. 
Translate the following English nested JSON object into ${targetLangName}.

RULES:
${SHASTRIC_RULES}

INPUT JSON:
${JSON.stringify(sourceData, null, 2)}
`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.1, // extremely low for exact dictionary mapping
      }
    });

    let text = response.text;
    // Remove markdown code blocks if gemini included them
    if (text.startsWith('```json')) text = text.replace('```json', '').replace('```', '');
    else if (text.startsWith('```')) text = text.replace(/```/g, '');

    return JSON.parse(text.trim());
  } catch (error) {
    console.error(`Failed translation for ${targetLangName}:`, error);
    return null;
  }
}

async function runSweep() {
  const baseEnPath = path.join(LOCALES_DIR, 'en.json');
  if (!fs.existsSync(baseEnPath)) {
      console.error("Base en.json not found!");
      return;
  }
  
  const enData = JSON.parse(fs.readFileSync(baseEnPath, 'utf8'));

  for (const [code, name] of Object.entries(LANGS)) {
    const targetPath = path.join(LOCALES_DIR, `${code}.json`);
    console.log(`Processing translation sweep for ${name} (${code})...`);
    
    // Only translate the base English object completely
    // In a progressive system, you might merge deep differences here.
    const translatedObj = await translateDictionary(enData, name);
    
    if (translatedObj) {
       fs.writeFileSync(targetPath, JSON.stringify(translatedObj, null, 2));
       console.log(`Successfully generated Shastric translation for ${name}!`);
    } else {
       console.log(`Skipped ${name} due to translation failure.`);
    }
  }
}

runSweep();
