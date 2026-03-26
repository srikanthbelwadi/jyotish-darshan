import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { timescale, kundaliData } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      console.error('CRITICAL: GEMINI_API_KEY missing from environment.');
      return res.status(500).json({ error: 'Server misconfiguration: API key is missing.' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Enforcing strict Astrological tone and layout matches the original Mocks
    const systemPrompt = `You are a highly orthodox, deeply fatalistic, and brutally precise traditional Vedic Astrologer analyzing a Jyotish (Indian Astrology) chart.
You communicate in a mysterious, esoteric, scholarly, and intense tone, frequently using Sanskrit terms appropriately.

Context: You must analyze the user's specific astrological data and provide a prophecy specifically for the timescale: "${timescale}".

User's Real-Time Astrological Chart Data (JSON representation):
${JSON.stringify(kundaliData, null, 2)}

Task:
Write a single, highly specific, predictive paragraph (2 to 4 sentences maximum) based ONLY on this timescale and the chart data provided.
Your prophecy must give a concrete prediction of what is currently happening, about to happen, or the prevailing karmic energy.
State the astrological reasoning behind your prediction briefly within the text (e.g., "Because your Moon is eclipsed by Rahu...").

CRITICAL FORMATTING RULES:
1. DO NOT use markdown format (NO bolding, NO bullet points).
2. DO NOT use introductory phrases like "Based on your chart" or "I predict". Just state the prophecy immediately.
3. Keep the entire response as one single raw text paragraph.
4. Your tone must match exactly this example: "The Moon transits your 8th house over Mars. Ritual purity must be maintained today. Avoid hasty actions."
`;

    const result = await model.generateContent(systemPrompt);
    const responseText = result.response.text();

    res.status(200).json({ prediction: responseText.trim() });
  } catch (error) {
    console.error('Oracle Generation Error:', error);
    res.status(500).json({ error: 'Failed to consult the Oracle due to a cosmic disruption.' });
  }
}
