import { GoogleGenerativeAI } from "@google/generative-ai";
import { synthesizeDemographics } from './engine/astrologicalRouter.js';
import { verifyToken, trackLLMTokens } from './engine/firebaseAdmin.js';

export const maxDuration = 60; // Prevent Vercel Timeout

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    let uid = null;
    try {
      uid = await verifyToken(req);
    } catch(err) {
      return res.status(401).json({ error: err.message });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'LLM configuration missing.' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const { event, kundali, partner, transit, lang = 'en' } = req.body;
    
    // We strictly formulate the model to act as a classical Astrologer
    const model = genAI.getGenerativeModel({
       model: "gemini-2.5-flash",
       systemInstruction: `You are an elite, orthodox Vedic Astrologer specializing in Electional Astrology (Muhurat Shastra).
Your task is to provide a brief 2-3 sentence personalized explanation of WHY a specific timeframe is highly auspicious for a specific event based solely on the mathematical data provided.
Rules:
1. Explicitly weave the "Recommended Time Window" into your response naturally (e.g., "The cosmic shield is strongest between 08:00 AM and 11:30 AM, providing an ideal...").
2. Speak directly to the seeker ("This period..."). DO NOT address the user by name (e.g. avoid 'Srikanth, this is...').
3. Keep the response entirely focused on the technical astrological/mathematical basis of the transit alignment.
4. Mention the transit factors (Nakshatra, Tithi, or Ascendant).
5. If a partner is involved (e.g., Vivaha, Engagement), mention how the alignment supports the union.
6. DO NOT hallucinate planetary data. Only use the data provided in the prompt.
7. Keep the tone profoundly cinematic, respectful, and traditional. Do not mention "Swiss Ephemeris" or "software".
8. Format the output with bolding for emphasis (e.g., **Rohini Nakshatra**).
9. CRITICAL MANDATE: Output your completely finalized response exclusively in ISO-language code: ${lang}. Do not write in English unless the language code is 'en'.
10. **SOCIETAL LOGIC RULE**: Adhere to the provided SOCIOLOGICAL CONTEXT. If the seeker is elderly or a child, structurally adjust your explanation. For instance, explaining child-related naming ceremonies (Namakarana) to elderly users must be framed as "hosting or initiating the event for descendants" rather than them participating personally.
`
    });

    const prompt = `
Generate a Muhurat explanation for:
Event: ${event}



${synthesizeDemographics({ input: kundali }, req.headers)}

Calculated Transit Alignment:
Transit Date: ${transit.date}
Recommended Time Window: ${transit.goodHours}
Ruling Nakshatra: Nakshatra Index ${transit.nakshatra}
Running Tithi: Tithi Index ${transit.tithi}
Rising Ascendant (Lagna) Sign: Sign Index ${transit.lagnaSign}

The engine has already mathematically vettes this time as perfectly auspicious according to Tara Bala and Chandra Bala syncs. 
Write a 3-sentence explanation of why this cosmic shield protects the event.
    `;

    const result = await model.generateContent(prompt);
    let output = result.response.text();
    
    // Failsafe strip markdown formatting
    if (output.startsWith('```')) {
       output = output.replace(/```[a-z]*\n?/gi, '').replace(/```/g, '').trim();
    }

    // Sync tokens back to Firebase CPO Console
    const tokenCount = result.response?.usageMetadata?.totalTokenCount || 0;
    if (tokenCount > 0 && uid) {
      await trackLLMTokens(uid, tokenCount);
    }

    res.status(200).json({ explanation: output });
    
  } catch (error) {
    console.error("Muhurat LLM failed:", error);
    res.status(500).json({ error: 'Failed to consult celestial oracle.' });
  }
}
