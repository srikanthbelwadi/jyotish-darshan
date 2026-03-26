import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { timescale, kundaliData, currentDate } = req.body;
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
You communicate in a clear, empowering, and easy-to-understand tone. While you maintain the authenticity of traditional Shastras by using correct Sanskrit terminology (such as planetary names, Dashas, or Bhavas), you always weave these concepts into modern, actionable, and everyday guidance.

Context: 
- Current Earth Date: ${currentDate}
- Timescale to Predict: "${timescale}"

User's Real-Time Astrological Chart Data (JSON representation):
${JSON.stringify(kundaliData, null, 2)}

Task:
Write a highly specific, immediately actionable predictive paragraph (4 to 6 short, punchy sentences) based ONLY on this timescale and the chart data provided.
Avoid all generic, ambiguous, or unhelpful statements. You must synthesize the active Dasha, the Panchanga elements, current transits, and the Ashtakavarga house strengths (SAV array) to dictate concrete implications.
Focus heavily on the practical implications of these energies on the user's daily life, followed immediately by suggested, specific actions the user must take.
State the astrological reasoning behind your prediction seamlessly within the text without being overly academic.

CRITICAL FORMATTING RULES:
1. DO NOT use markdown format (NO bolding, NO bullet points).
2. DO NOT use introductory phrases like "Based on your chart" or "I predict". Just state the reading immediately.
3. Keep the entire response as one dense paragraph, but strictly use short, direct sentences.
4. Avoid overly fatalistic, scary, or cryptic language. State facts cleanly.
5. ABSOLUTELY DO NOT output JSON or wrap your response in JSON brackets. Return raw plain text exclusively.
6. Your tone and sentence structure must match exactly this example: "Surya and Shukra are currently aligned in Simha within your 8th house. This creates immediate friction regarding shared financial resources. Do not ignore minor accounting discrepancies today. Review your joint accounts tonight and firmly postpone signing new contracts until the active Magha nakshatra energy settles. Your current Saturn Dasha demands structural discipline, so ensure every agreement is fully documented in writing."
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
        // Fallback blind strip if JSON is malformed
        responseText = responseText.replace(/^{"prediction":\s*"/, '').replace(/"\s*}$/, '');
      }
    }

    return res.status(200).json({ prediction: responseText.trim() });

  } catch (error) {
    console.error('Oracle Node Generation Error:', error);
    return res.status(500).json({ error: 'Failed to consult the Oracle due to a cosmic disruption.' });
  }
}
