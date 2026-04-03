const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const admin = require("firebase-admin");

admin.initializeApp();

// Validate initialization of genAI (assumes GEMINI_API_KEY is available in Firebase environment params or standard process.env depending on deployment setup)
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('CRITICAL: GEMINI_API_KEY missing from environment.');
    throw new HttpsError('internal', 'Server misconfiguration: API key is missing.');
  }
  return new GoogleGenerativeAI(apiKey);
}

exports.generateOracle = onCall(async (request) => {
  try {
    const { timescale, kundaliData, currentDate } = request.data;
    
    // Auth Check
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'The endpoint requires authentication.');
    }

    const uid = request.auth.uid;
    const userDocRef = admin.firestore().collection('users').doc(uid);
    const userSnap = await userDocRef.get();
    
    if (userSnap.exists && userSnap.data().isBanned === true) {
      throw new HttpsError('permission-denied', 'Administrator has suspended this account.');
    }

    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: { temperature: 0.75 }
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
3. Keep the entire response as one dense paragraph.
4. Avoid overly fatalistic, scary, or cryptic language. State facts cleanly.
5. ABSOLUTELY DO NOT output JSON or wrap your response in JSON brackets. Return raw plain text exclusively.
6. You MUST closely mirror the density, technical astrological math, and hyper-specific actionable advice modeled in the examples below. Tailor the actual real-world scenarios to the meaning of the active houses and planets in the user's JSON chart:

*** EXACT TONE EXAMPLES BY TIMESCALE ***
If timescale is "Today": "The active Panchanga for today—Budhawara aligning with Shukla Navami and the Moon transiting the third Pada of Punarvasu Nakshatra—creates a potent, intellectually fertile environment. Because Punarvasu is ruled by Guru, and today's Karana is Balava, the energetic signature strongly supports structured problem-solving. Furthermore, with the transiting Moon traversing your Gemini house, which currently holds a robust Ashtakavarga score of 30 bindus, your analytical faculties are sharp. Apply this specific transit energy to optimize complex algorithms and data structures. It is an optimal day to leverage this 'return of the light' energy to debug and resolve persistent technical issues."

If timescale is "This Lunar Phase": "As we advance through the Shukla Paksha, the Moon steadily gains Paksha Bala, naturally amplifying the auspiciousness of your eleventh house of gains. Concurrently, the Gochar of Venus moving toward exaltation casts a highly beneficial, harmonizing drishti on your third house, which governs logistics. This specific two-week lunar window provides a remarkably frictionless energetic current for coordinating complex, multi-layered family plans. Utilize this expanding lunar strength to finalize intricate logistics and secure bookings for your family's next extensive travel expedition."

If timescale is "This Masa (Month)": "The current Saur Masa brings the Surya Gochar into Meena Rasi, directly activating your Chaturtha Bhava, the realm of domestic stability. Examining your D-4 divisional chart, the planetary lord is currently receiving a highly stabilizing aspect from Jupiter. The Sun’s illuminating presence here, combined with a favorable SAV score of 33 bindus, signals a powerful and auspicious time for absolute structural closure. This is the precise astrological window to finalize the last administrative details and final inspections of your recent extensive residential restorations. Grounding your focus here will fully restore the energetic equilibrium of your household."

If timescale is "This Samvatsara (Year)": "This current Samvatsara is heavily defined by the structural transit dynamics of Shani moving through your second house of accumulated wealth. Saturn’s transit here, scoring a solid 28 bindus in its Bhinnashtakavarga, demands rigorous, pragmatic financial structuring and the assumption of heavier familial responsibilities. Simultaneously, this celestial weather strongly emphasizes establishing sustainable daily routines that seamlessly integrate the care of elders within the household dynamic. Practically, this year requires you to formally map out the long-term financial architecture necessary for upcoming educational transitions. Embrace Saturn's demand for discipline to build an unshakeable infrastructural foundation."

If timescale is "Mahadasha": "You are currently operating within the profound evolutionary chapter of your Jupiter Mahadasha, specifically navigating the Mercury Antardasha. Jupiter acts as the great synthesizer, while Mercury governs advanced computing and analytical discrimination. Within your Dashamsha (D-10) chart, Mercury is positioned powerfully in a Kendra, signifying a sustained period of peak technical output and industry visibility. This multi-year arc fundamentally aligns your life's purpose with pioneering complex technological integrations. The Jyotish directive for this Dasha is to transition from operational excellence to assuming the role of an architectural visionary, utilizing your strong Mercury to bridge the gap between raw power and vital applications."
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

    const tokenCount = result.response?.usageMetadata?.totalTokenCount || 0;
    if (tokenCount > 0) {
      await userDocRef.set({
        llmTokensRun: admin.firestore.FieldValue.increment(tokenCount),
        lastActivity: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true }).catch(err => console.error("Token sync failed:", err));
    }

    return { prediction: responseText.trim(), tokenCount };

  } catch (error) {
    console.error('Oracle Node Generation Error:', error);
    throw new HttpsError('internal', 'Failed to consult the Oracle due to a cosmic disruption.');
  }
});

exports.generatePathway = onCall(async (request) => {
  try {
    const { pathwayName, kundaliData, currentDate } = request.data;
    
    // Auth Check
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'The endpoint requires authentication.');
    }

    const uid = request.auth.uid;
    const userDocRef = admin.firestore().collection('users').doc(uid);
    const userSnap = await userDocRef.get();
    
    if (userSnap.exists && userSnap.data().isBanned === true) {
      throw new HttpsError('permission-denied', 'Administrator has suspended this account.');
    }

    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: { temperature: 0.75 }
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

    const tokenCount = result.response?.usageMetadata?.totalTokenCount || 0;
    if (tokenCount > 0) {
      await userDocRef.set({
        llmTokensRun: admin.firestore.FieldValue.increment(tokenCount),
        lastActivity: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true }).catch(err => console.error("Token sync failed:", err));
    }

    return { prediction: responseText.trim(), tokenCount };

  } catch (error) {
    console.error('Pathway Node Generation Error:', error);
    throw new HttpsError('internal', 'Failed to consult the Oracle due to a cosmic disruption.');
  }
});
