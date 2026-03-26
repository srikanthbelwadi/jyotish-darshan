import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { pathwayName, kundaliData, currentDate } = req.body;
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

    const systemPrompt = `You are an insightful, modern, and practical Vedic Astrologer analyzing a Jyotish (Indian Astrology) chart.
You communicate in a clear, empowering, and easy-to-understand tone. While you maintain the authenticity of traditional Shastras by using correct Sanskrit terminology, you always weave these concepts into modern, actionable, and everyday guidance.

Context:
- Current Earth Date (Local User Time): ${currentDate}
- The Specific ṣaṭtriṃśat Mārga (Pathway) to Analyze: "${pathwayName}"

User's Real-Time Astrological Chart Data (JSON representation):
${JSON.stringify(kundaliData, null, 2)}

Task:
Write a highly specific, immediately actionable predictive paragraph (4 to 6 short, punchy sentences) predicting the user's prevailing karmic energy specifically regarding the target Pathway provided.
Avoid all generic, ambiguous, or unhelpful statements. You must systematically isolate the specific planets, house lords, and active configurations within the JSON chart that mathematically govern this exact Pathway (e.g., analyzing the 10th house for "Dharma & Duty").
Focus heavily on the practical implications of these energies on the user's daily life, followed immediately by suggested, specific actions the user must take regarding this Pathway.

CRITICAL FORMATTING RULES:
1. DO NOT use markdown format (NO bolding, NO bullet points).
2. DO NOT use introductory phrases like "Based on your chart" or "I predict". Just state the reading immediately.
3. Keep the entire response as one dense paragraph, but strictly use short, direct sentences.
4. Avoid overly fatalistic language. State the astrological reasoning behind your prediction seamlessly within the text without being overly academic.
5. ABSOLUTELY DO NOT output JSON or wrap your response in JSON brackets. Return raw plain text exclusively.
6. You MUST closely mirror the density, technical astrological math, and hyper-specific actionable advice modeled in the examples below. 

*** EXACT TONE EXAMPLES BY PATHWAY ***

If Pathway is "Dharma & Duty": "With the transit of Shani through your 10th house of Karma currently scoring a powerful 32 bindus in Ashtakavarga, your professional structure is demanding ultimate accountability. Because you are currently inside your Mercury Antardasha—the Karaka of commerce located in your 11th house—your primary Dharma right now is scaling your structural framework. Do not permit ambiguity in your corporate reporting structures today. Review your direct-report protocols tomorrow morning and explicitly document all compliance workflows in writing. Embrace Saturn's strict demand for unwavering discipline to anchor your career trajectory for the next 2.5 years."

If Pathway is "Wealth & Assets": "Your second house of accumulated wealth is heavily activated today by the transit of Jupiter over your natal Venus, creating an extremely auspicious Dhana Yoga window. The prevailing Panchanga features Shukla Navami, pushing expansive energies into your financial sector. This is a critical mathematical window for wealth consolidation, not high-risk liquid trading. Consolidate your fragmented digital assets tonight and restructure your long-term tax sheltered accounts immediately. Leverage this expansive Jupiter energy to formalize the exact infrastructural budgets required for your next massive real estate acquisition."
`;

    const result = await model.generateContent(systemPrompt);
    let responseText = result.response.text().trim();

    // Failsafe interceptor for spontaneous JSON LLM hallucinations
    if (responseText.startsWith('```')) {
      responseText = responseText.replace(/```[a-z]*\n?/gi, '').replace(/```/g, '').trim();
    }
    if (responseText.startsWith('{')) {
      try {
        const parsed = JSON.parse(responseText);
        if (parsed.prediction) responseText = parsed.prediction;
        else if (Object.values(parsed).length > 0) responseText = Object.values(parsed)[0];
      } catch (e) {
        responseText = responseText.replace(/^{"prediction":\s*"/, '').replace(/"\s*}$/, '');
      }
    }

    return res.status(200).json({ prediction: responseText.trim() });

  } catch (error) {
    console.error('Pathway Node Generation Error:', error);
    return res.status(500).json({ error: 'Failed to consult the Oracle due to a cosmic disruption.' });
  }
}
