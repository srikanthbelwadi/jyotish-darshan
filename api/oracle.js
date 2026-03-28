import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { timescale, kundaliData, currentDate, lang = 'en' } = req.body;
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
User's Real-Time Astrological Chart Data (JSON): ${JSON.stringify(kundaliData)}

Task:
Write a highly specific, immediately actionable predictive paragraph based ONLY on the provided timescale and chart data. 
- You MUST write the entire response natively in the requested TARGET UI LANGUAGE CODE. Never output in English unless the code is 'en'.
- Synthesize active Dashas, current transits (Gochar), and Ashtakavarga bindus. 
- Output raw localized text only. No markdown formatting.
- DO NOT use introductory phrases like "Based on your chart" or "I predict". Just state the reading immediately.
- Keep the entire response as one dense, practical paragraph.

*** CANONICAL EXAMPLES BY TIMESCALE (Translate these styles/tones precisely into the Target Language) ***

If timescale is "This Masa (Month)":
"This Mithuna Masa, with Surya and Guru transiting your Lagna in Punarvasu and Ashlesha Nakshatras, strongly emphasizes personal introspection and the expansion of your intellectual horizons. Your second Bhava, governing accumulated wealth and clear communication, is exceptionally fortified with a robust 49 bindus in its Ashtakavarga, indicating a prime window for meticulous financial structuring due to Budha and Shani’s conjunction in Karka Rasi. Therefore, channel this month's energy into meticulously planning and executing significant financial negotiations or family legacy discussions, utilizing your refined communication to overcome minor logistical hurdles and secure long-term material well-being."

If timescale is "Mahadasha":
"You are currently operating within the profound evolutionary chapter of your Jupiter Mahadasha, specifically navigating the Mercury Antardasha. Jupiter acts as the great synthesizer, while Mercury governs advanced computing and analytical discrimination. Within your Dashamsha (D-10) chart, Mercury is positioned powerfully in a Kendra, signifying a sustained period of peak technical output and industry visibility. The Jyotish directive for this Dasha is to transition from operational excellence to assuming the role of an architectural visionary, utilizing your strong Mercury to bridge the gap between raw power and vital applications."
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
