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
Return a strict JSON object with "summary" and "options".

1. "summary": A dense 2-3 sentence paragraph evaluating the user's specific chart regarding this Path. State exactly which houses/planets govern this topic based on Brihat Parashara Hora Shastra, and analyze their strength in the user's D1 matrix.
2. "options": Exactly 6 deeply analyzed karmic outcomes operating under this specific Pillar right now for the user. For each outcome, provide a definitive future timeframe (in months or years) and break down the analysis into 2-3 distinct descriptive paragraphs, each with an appropriate subheading.

CRITICAL: EVERY SINGLE STRING VALUE IN THE JSON (except icons) MUST BE IN THE EXACT LANGUAGE SPECIFIED BY THE TARGET UI LANGUAGE CODE (${lang}). NEVER return English unless the code is 'en'.

EXPECTED JSON SCHEMA WITH CANONICAL EXAMPLES (You must translate the concepts into ${lang}):
{
  "summary": "Your Dharma (9th house) lord Guru (Jupiter), exalted in your Lagna, firmly anchors your identity in higher purpose and ethical leadership...",
  "options": [
    {
      "id": "outcome_1",
      "icon": "🌊",
      "label": "Crossing the Ocean",
      "timeframe": "Over the next 14 to 18 months",
      "paragraphs": [
         { 
           "subheading": "Karmic Synthesis", 
           "content": "Rahu's transit through your 12th house dictates a long journey across the sea. The celestial bodies establish a critical temporal vibration affecting this relevant Bhava within your D1 matrix." 
         },
         { 
           "subheading": "Financial Implications", 
           "content": "Settlement in a foreign, non-Vedic land is highly indicated for acquiring immense wealth. However, this transit cannot be bypassed purely through willpower." 
         }
      ],
      "mitigation": "Perform a strict water-offering puja to Varuna before embarking by water."
    },
    {
      "id": "outcome_2",
      "icon": "⚖️",
      "label": "Legal Victory",
      "timeframe": "Culminating by mid-2027",
      "paragraphs": [
         {
           "subheading": "Astrological Mechanics",
           "content": "Examining the Shashta Bhava (6th house) matrix, Mars casts a dominating 8th aspect onto the 12th house of confinement, mathematically neutralizing any adversarial litigation against your primary assets."
         },
         {
           "subheading": "Prophetic Unfoldment",
           "content": "The impending inherited property dispute will swiftly collapse in your favor before reaching trial. Do not entertain any out-of-court settlements."
         }
      ],
      "mitigation": "Recite the Aditya Hrudayam exactly at sunrise on Sundays facing east."
    }
  ]
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
