import { GoogleGenerativeAI } from '@google/generative-ai';

export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ message: 'Method Not Allowed' }), { status: 405 });
  }

  try {
    const { timescale, kundaliData, currentDate } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error('CRITICAL: GEMINI_API_KEY missing from environment.');
      return new Response(JSON.stringify({ error: 'Server misconfiguration: API key is missing.' }), { status: 500 });
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

    const result = await model.generateContentStream(systemPrompt);

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
               controller.enqueue(new TextEncoder().encode(chunkText));
            }
          }
        } catch (error) {
          console.error('Stream processing error:', error);
          controller.error(error);
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Transfer-Encoding': 'chunked'
      }
    });

  } catch (error) {
    console.error('Oracle Edge Streaming Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to consult the Oracle due to a cosmic disruption.' }), { status: 500 });
  }
}
