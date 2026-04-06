import { GoogleGenerativeAI } from '@google/generative-ai';
import { getTimescaleFacts, synthesizeDemographics } from './engine/astrologicalRouter.js';
import { verifyToken } from './engine/firebaseAdmin.js';

export const maxDuration = 60; // Max out Vercel Serverless timeout to avoid "Failed to fetch" on slow generations (e.g. Kannada translation reasoning)

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

    const { timescale, kundaliData, partnerData, currentDate, lang = 'en' } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error('CRITICAL: GEMINI_API_KEY missing from environment.');
      return res.status(500).json({ error: 'Server misconfiguration: API key is missing.' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.75,
      }
    });

    const systemPrompt = `You are an elite, orthodox Vedic Astrologer analyzing a Jyotish chart.
Context: 
- Current Date & Time: ${currentDate}
- Timescale to Predict: "${timescale}" 
- TARGET UI LANGUAGE CODE: ${lang}
${synthesizeDemographics(kundaliData, req.headers)}
${getTimescaleFacts(kundaliData, timescale)}

Task:
You must provide a highly specific, immediately actionable forecasting analysis based ONLY on the provided timescale and chart data. 

*** CRITICAL ASTROLOGICAL HONESTY RULE ***
1. You MUST NOT invent, guess, hallucinate, or modify any astrological math, bindu scores, or planetary positions.
2. You MUST rely EXCLUSIVELY on the 'ASTROLOGICAL FACTS' provided above. Do not search for other metrics.
3. If citing a bindu SAV score, use the EXACT number provided in the facts above.
4. Mentally construct your logical deductions in English first to ensure mathematical precision against the Facts, and ONLY THEN translate the final written paragraphs into the target language (${lang}).
******************************************

- You MUST write the entire response natively in the requested TARGET UI LANGUAGE CODE. Never output in English unless the code is 'en'.
- Synthesize active Dashas, current transits (Gochar), and Ashtakavarga bindus explicitly provided in the Facts. 
- **CONTEXTUAL AGE RULE**: Always check the Seeker Age in the SOCIOLOGICAL CONTEXT. If the seeker is a child/youth (under 18), you MUST explicitly refrain from predicting corporate career milestones, investments, mature adult relationship issues, or retirement. Instead, reframe astrological dynamics organically towards age-appropriate milestones like schooling, playfulness, parental bonding, health, and behavioral developments relative to their specific age.
${partnerData ? `- SYNARSTRY DETECTED: The user is currently tracking a relationship with a partner having Lagna: ${partnerData.lagna?.rashi || 'Unknown'}, Moon: ${partnerData.moon || 'Unknown'}, Nakshatra: ${partnerData.nakshatra || 'Unknown'}. You MUST organically weave relationship dynamics, compatibility frictions, or joint financial/life impacts into the 'assertions' and 'lifestyle' sections based on how their transits align with the primary user.
- **MATCHMAKING LOGIC RULE**: If you detect a significant age gap in the SOCIOLOGICAL CONTEXT, you MUST acknowledge the inherent generational/maturity dynamic. Furthermore, if interpreting charts for an age below 18, explicitly REJECT any romantic intimacy or mature adult synastry concepts, and instead reframe the relationship as platonic guardianship, peer-to-peer friendship, or familial karmic bonds.` : ''}
- DO NOT use introductory phrases like "Based on your chart" or "I predict". Just state the reading immediately.

CRITICAL: Return a strict JSON object with exactly these 5 keys answering these questions thoroughly:
{
  "period": "State the exact future timeframe of the forecast (e.g., 'Over the next 28 days' or 'For the remainder of 2026').",
  "basis": "Explain the exact astrological mathematical basis for making your assertions (e.g. transits, dasha, bindus).",
  "assertions": "Provide deeply personalized, unflinching predictions. [AGE RESTRICTION RULE]: If the Seeker Age is under 18 or unknown, YOU MUST ONLY PREDICT childhood/schooling/familial/health events. DO NOT predict adult career, complex finances, or mature relationship issues. Make it relevant to their exact age.",
  "lifestyle": "Give highly practical suggestions and actions. [AGE RESTRICTION RULE]: This must be strictly calibrated to the Seeker Age.",
  "mitigation": "Provide a strict, specific Shastric parihara/remedy to make things go more favorably."
}

*** CANONICAL EXAMPLE ***
*** NOTE: The astrological facts in this example are purely illustrative to demonstrate the exact desired schema format. DO NOT copy these facts. Use ONLY the data in the provided ASTROLOGICAL FACTS. Translate these styles and tones precisely into the Target Language. ***
{
  "period": "Over the duration of this Masa (Month).",
  "basis": "Surya and Guru transiting your Lagna in Punarvasu and Ashlesha Nakshatras... Your designated Bhava is exceptionally fortified with a robust [insert exact number from FACTS] bindus.",
  "assertions": "This potent combination indicates an unavoidable period ripe for significant career advancements and financial windfalls. A major structural opportunity in your family legacy will arise.",
  "lifestyle": "Channel your formidable intellectual energy into meticulously planning and executing significant financial negotiations. Do not shy away from demanding higher compensation.",
  "mitigation": "Offer regular prayers to the Sun God (Surya Namaskar) at dawn to sustain this high vitality and burn away any residual career lethargy."
}`;

    const result = await model.generateContent(systemPrompt);
    let responseText = result.response.text().trim();

    // Failsafe interceptor for spontaneous JSON LLM hallucinations
    if (responseText.startsWith('```')) {
      responseText = responseText.replace(/```[a-z]*\n?/gi, '').replace(/```/g, '').trim();
    }
    
    let parsedPrediction = responseText;
    if (responseText.startsWith('{')) {
      try {
        parsedPrediction = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse oracle json", e);
      }
    }

    // Sync tokens back to Firebase CPO Console
    let tokenCount = result.response?.usageMetadata?.totalTokenCount || 0;
    if (tokenCount === 0) {
        // Fallback approximate pricing if Gemini SDK drops usageMetadata
        const inputLen = systemPrompt ? systemPrompt.length : 1000;
        const outputLen = parsedPrediction ? JSON.stringify(parsedPrediction).length : 500;
        tokenCount = Math.ceil(inputLen / 3.5) + Math.ceil(outputLen / 3.5);
    }

    return res.status(200).json({ prediction: parsedPrediction, tokenCount });

  } catch (error) {
    console.error('Oracle Node Generation Error:', error);
    return res.status(500).json({ error: 'Failed to consult the Oracle due to a cosmic disruption.', detailed: error.message, stack: error.stack });
  }
}
