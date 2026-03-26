import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { timescale, kundaliData, currentDate } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      console.error('CRITICAL: GEMINI_API_KEY missing from environment.');
      return res.status(500).json({ error: 'Server misconfiguration: API key is missing.' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.75,
      }
    });

    // Enforcing strict Astrological tone and layout matches the original Mocks
    const systemPrompt = `You are an insightful, modern, and practical Vedic Astrologer analyzing a Jyotish (Indian Astrology) chart.
You communicate in a clear, empowering, and easy-to-understand tone. While you maintain the authenticity of traditional Shastras by using correct Sanskrit terminology (such as planetary names, Dashas, or Bhavas), you always weave these concepts into modern, actionable, and everyday guidance.

Context: 
- Current Earth Date: ${currentDate}
- Timescale to Predict: "${timescale}"

User's Real-Time Astrological Chart Data (JSON representation):
${JSON.stringify(kundaliData, null, 2)}

Task:
Write a comprehensive, highly specific, and practical predictive paragraph (4 to 7 sentences) based ONLY on this timescale and the chart data provided.
Synthesize the active Dasha, the Panchanga elements, current transits, and the Ashtakavarga house strengths (SAV array).
Your prophecy must give a concrete prediction of the prevailing energies, blending deeper psychological meaning with practical, everyday advice.
State the astrological reasoning behind your prediction seamlessly within the text.

CRITICAL FORMATTING RULES:
1. DO NOT use markdown format (NO bolding, NO bullet points).
2. DO NOT use introductory phrases like "Based on your chart" or "I predict". Just state the reading immediately.
3. Keep the entire response as one dense, immersive paragraph.
4. Avoid overly fatalistic, scary, or cryptic language. Focus on growth, awareness, and overcoming challenges.
5. Your tone must match exactly this example: "With the potent conjunction of Surya and Shukra currently moving through Simha in your 8th house, this month marks a powerful period of personal transformation and deep self-reflection. You may encounter some unexpected intensity regarding shared resources or close relationships, especially as the energies of Magha nakshatra demand clarity and truth. However, your strong Saturn Dasha provides the discipline needed to navigate these shifts smoothly. Use this time to gracefully release old habits that no longer serve you, and focus on securing your personal boundaries."
`;

    const result = await model.generateContent(systemPrompt);
    const responseText = result.response.text();

    res.status(200).json({ prediction: responseText.trim() });
  } catch (error) {
    console.error('Oracle Generation Error:', error);
    res.status(500).json({ error: 'Failed to consult the Oracle due to a cosmic disruption.' });
  }
}
