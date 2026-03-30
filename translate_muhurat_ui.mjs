import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';
const envContent = fs.readFileSync('.env.local', 'utf-8');
const keyLine = envContent.split('\n').find(l => l.startsWith('GEMINI_API_KEY='));
const API_KEY = keyLine ? keyLine.split('=')[1].trim() : '';
const genAI = new GoogleGenerativeAI(API_KEY);

const targetLangs = ['sa', 'hi', 'kn', 'te', 'ta', 'mr', 'gu', 'bn', 'ml'];

const stringsToTranslate = [
  "Auspicious Timings (Muhurat)",
  "Select an Event to cast electional chart:",
  "Consulting Ephemeris Transits for",
  "No auspicious alignments",
  "Auspicious Hours for",
  "Astrologer analyzing alignment...",
  "Transit Nakshatra:",
  "Transit Tithi:",
  "Hourly Ascendant:",
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  "Simantonnayana (Baby Shower / Godh Bharai)",
  "Namakarana (Naming Ceremony)",
  "Annaprashana (First Solid Food)",
  "Mundan / Chudakarana (First Haircut)",
  "Karnavedha (Ear Piercing)",
  "Vidyarambha / Aksharabhyasam (Start of Education)",
  "Upanayana (Sacred Thread Ceremony)",
  "Vivaha (Marriage)",
  "Sagai / Mangni (Engagement)",
  "Bhoomi Puja (Foundation Stone Laying)",
  "Griha Pravesh (Housewarming)",
  "Deva Pratishtha (Idol Installation)",
  "Shanti Puja (Pacification Rituals)",
  "Vyapar Arambh (Starting a Business)",
  "Sampatti Kharidi (Property Purchase)",
  "Vahana Puja (Buying a Vehicle)",
  "Swarna / Abhushan Kharidi (Buying Gold)",
  "Yatra (Significant Journeys)"
];

async function run() {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig: { responseMimeType: "application/json" }});
  
  const prompt = `Translate the following exact English strings into these 9 Indic language codes: ${targetLangs.join(', ')}.
Output ONLY a strict JSON object mapping the English key to an object of language-code translated pairs. Do not change the English key.
Keep the astrological context pure and Shastric. Use the most elegant and traditional terms where applicable.
For Month names (Jan, Feb) just provide the localized standard abbreviation or name. For example 'Jan' -> 'जन' (in Hindi).

Strings to translate:
${JSON.stringify(stringsToTranslate, null, 2)}

Example output format:
{
  "Auspicious Timings (Muhurat)": {
    "sa": "शुभमुहूर्तः",
    "hi": "शुभ मुहूर्त",
    // etc... 
  }
}
`;

  try {
     console.log("Generating translations...");
     const res = await model.generateContent(prompt);
     const jsonStr = res.response.text().trim();
     const translations = JSON.parse(jsonStr);
     
     // Now we read the existing uiStrings.js and append these
     let filePath = 'src/i18n/uiStrings.js';
     let fileData = fs.readFileSync(filePath, 'utf8');
     
     // Find the end of module.exports = { or export const DYNAMIC_STRINGS = {
     let insertion = "";
     for (const [key, map] of Object.entries(translations)) {
        insertion += `  ${JSON.stringify(key)}: ${JSON.stringify(map)},\n`;
     }
     
     // Simple regex to insert before the final closing brace of DYNAMIC_STRINGS
     // File format is usually: export const DYNAMIC_STRINGS = { ... };
     if (fileData.includes("export const DYNAMIC_STRINGS = {")) {
        fileData = fileData.replace(/};?\s*$/, insertion + "\n};\n");
     } else {
        console.error("Could not find the end of the DYNAMIC_STRINGS export chunk.");
        // Fallback: just append to file if it uses another export method.
     }
     
     fs.writeFileSync(filePath, fileData);
     console.log("Successfully appended 36 translated strings to uiStrings.js!");
     
  } catch (e) {
     console.error("Translation routine failed:", e);
  }
}

run();
