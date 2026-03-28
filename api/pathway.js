import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { pillarId, pillarTitle, pillarDesc, kundaliData, lang = 'en' } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error('CRITICAL: GEMINI_API_KEY missing from environment.');
      return res.status(500).json({ error: 'Server misconfiguration: API key is missing.' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.8,
        responseMimeType: "application/json",
      }
    });

    const systemPrompt = `You are an elite Vedic Astrologer running a high-fidelity Parashari synthesis engine.
Context:
- Activated Path: "${pillarTitle}" (Governing: ${pillarDesc})
- TARGET UI LANGUAGE CODE: ${lang}
User's Chart: ${JSON.stringify(kundaliData)}

Task:
Based on the user's chart, you must return a strict JSON object with two top-level keys: "summary" and "options".

1. "summary": A dense 3-4 sentence paragraph evaluating the user's specific chart regarding this Path. State exactly which houses/planets govern this topic based on Brihat Parashara Hora Shastra, and analyze their strength in the user's D1 matrix.
2. "options": An array of exactly 6 absolute most probable karmic paths/outcomes operating under this specific Pillar right now for the user.

CRITICAL: EVERY SINGLE STRING VALUE IN THE JSON (except icons) MUST BE IN THE EXACT LANGUAGE SPECIFIED BY THE TARGET UI LANGUAGE CODE (${lang}). NEVER return English unless the code is 'en'.

EXPECTED JSON SCHEMA WITH CANONICAL EXAMPLES (You must translate the concepts into ${lang}):
{
  "summary": "Your Dharma (9th house) lord Guru (Jupiter), exalted in your Lagna, firmly anchors your identity in higher purpose and ethical leadership. The Karma (10th house) lord Mangal (Mars) in the Tritiya Bhava (3rd house) powerfully aspects your professional sphere, demanding courage. Yet, with Chandra (Moon) in the Shashta Bhava (6th house), there is potential emotional friction amidst your daily duties. You must proactively align your immediate work routines to embody your spiritual purpose, heavily prioritizing meticulous, service-oriented action.",
  "options": [
    {
      "id": "outcome_1",
      "icon": "🌊",
      "label": "Crossing the Ocean",
      "synthesis": "Upon rigorous examination of the 12th/9th House Vectors framework regarding crossing the ocean, the karmic unfoldment is unambiguous. The celestial bodies establish a critical temporal vibration affecting the relevant Bhava within your D1 matrix.",
      "prediction": "Rahu dictates a long journey across the sea. Settlement in a foreign, non-Vedic land is highly indicated for acquiring immense wealth.",
      "remedy": "Perform a small puja to Varuna before embarking by water."
    },
    {
      "id": "outcome_2",
      "icon": "⚖️",
      "label": "Legal Victory",
      "synthesis": "Examining the Shashta Bhava (6th house) matrix, Mars casts a dominating 8th aspect onto the 12th house of confinement, mathematically neutralizing any adversarial litigation against your primary assets.",
      "prediction": "The impending inherited property dispute will swiftly collapse in your favor before reaching trial. Do not entertain any out-of-court settlements.",
      "remedy": "Recite the Aditya Hrudayam exactly at sunrise on Sundays facing east."
    }
  ] // ALWAYS BE SURE TO GENERATE EXACTLY 6 UNIQUE OPTIONS.
}`;

    const result = await model.generateContent(systemPrompt);
    let responseText = result.response.text().trim();
    
    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse JSON directly. Raw output:', responseText);
      return res.status(500).json({ error: 'Failed to synthesize pathway. The Oracle returned a malformed vision.' });
    }

    return res.status(200).json(parsed);

  } catch (error) {
    console.error('Pathway Node Generation Error:', error);
    return res.status(500).json({ error: 'Failed to consult the Oracle due to a cosmic disruption.' });
  }
}
