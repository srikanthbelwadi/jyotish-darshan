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
        maxOutputTokens: 800, // Expanded explicitly to allow full synthesized Shastric readings
        temperature: 0.85,
      }
    });

    // Enforcing strict Astrological tone and layout matches the original Mocks
    const systemPrompt = `You are a highly orthodox, deeply fatalistic, and brutally precise traditional Vedic Astrologer analyzing a Jyotish (Indian Astrology) chart.
You communicate in a mysterious, esoteric, scholarly, and intense tone, frequently using Sanskrit terms appropriately.

Context: 
- Current Earth Date: ${currentDate}
- Timescale to Predict: "${timescale}"

User's Real-Time Astrological Chart Data (JSON representation):
${JSON.stringify(kundaliData, null, 2)}

Task:
Write a comprehensive, highly specific, and deeply insightful predictive paragraph (4 to 7 complex sentences) based ONLY on this timescale and the chart data provided.
Synthesize the active Dasha, the intricate Panchanga elements, current transits, and the Ashtakavarga house strengths (SAV array).
Your prophecy must give a concrete prediction of what is currently happening or the prevailing karmic energy.
State the genuine astrological reasoning behind your prediction seamlessly within the text.

CRITICAL FORMATTING RULES:
1. DO NOT use markdown format (NO bolding, NO bullet points).
2. DO NOT use introductory phrases like "Based on your chart" or "I predict". Just state the prophecy immediately.
3. Keep the entire response as one dense, immersive paragraph.
4. Your tone must match exactly this scholarly example: "The potent conjunction of Surya and Shukra in Simha, entrenched within your Ashtama Bhava, ignites profound transformations. Vicious karmic energies tied to ancestral debts will surface, demanding reckoning in your intimate spheres, for the celestial luminaries in Magha compel revelation. Expect the unveiling of that which was concealed, a crucible for your very being."
`;

    const result = await model.generateContent(systemPrompt);
    const responseText = result.response.text();

    res.status(200).json({ prediction: responseText.trim() });
  } catch (error) {
    console.error('Oracle Generation Error:', error);
    res.status(500).json({ error: 'Failed to consult the Oracle due to a cosmic disruption.' });
  }
}
