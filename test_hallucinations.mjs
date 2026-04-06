import { GoogleGenerativeAI } from '@google/generative-ai';
import { getTimescaleFacts, getPathwayFacts } from './api/engine/astrologicalRouter.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', generationConfig: { temperature: 0.8, responseMimeType: 'application/json' } });

const mockKundalis = [
  {
    name: "Customer A - Ariest Ascendant",
    kundaliData: {
      lagna: { rashi: 'Aries' },
      dasha: { maha: 'Jupiter', antar: 'Venus' },
      panchanga: { tithi: 'Shukla Ekadashi', yoga: 'Siddhi', karana: 'Bava', nakshatra: 'Pushya' },
      planets: [
        { id: 'moon', sign: 'Cancer', house: 4, nak: 'Pushya' },
        { id: 'jupiter', sign: 'Leo', house: 5, nak: 'Magha' },
        { id: 'venus', sign: 'Taurus', house: 2, nak: 'Rohini' },
        { id: 'saturn', sign: 'Capricorn', house: 10, nak: 'Shravana' },
        { id: 'sun', sign: 'Aries', house: 1, nak: 'Ashwini' }
      ],
      ashtakavarga: { SAV: [28, 30, 25, 33, 40, 22, 28, 19, 31, 35, 38, 20] }
    }
  },
  {
    name: "Customer B - Libra Ascendant",
    kundaliData: {
      lagna: { rashi: 'Libra' },
      dasha: { maha: 'Saturn', antar: 'Mars' },
      panchanga: { tithi: 'Krishna Chaturthi', yoga: 'Vajra', karana: 'Vishti', nakshatra: 'Mula' },
      planets: [
        { id: 'moon', sign: 'Sagittarius', house: 3, nak: 'Mula' },
        { id: 'jupiter', sign: 'Sagittarius', house: 3, nak: 'Purva Ashadha' },
        { id: 'venus', sign: 'Virgo', house: 12, nak: 'Hasta' },
        { id: 'saturn', sign: 'Aquarius', house: 5, nak: 'Shatabhisha' },
        { id: 'sun', sign: 'Scorpio', house: 2, nak: 'Anuradha' },
        { id: 'mars', sign: 'Capricorn', house: 4, nak: 'Dhanishta' }
      ],
      ashtakavarga: { SAV: [32, 18, 42, 29, 31, 15, 33, 20, 27, 45, 22, 24] }
    }
  },
  {
    name: "Customer C - Capricorn Ascendant",
    kundaliData: {
      lagna: { rashi: 'Capricorn' },
      dasha: { maha: 'Venus', antar: 'Rahu' },
      panchanga: { tithi: 'Amavasya', yoga: 'Siva', karana: 'Naga', nakshatra: 'Krittika' },
      planets: [
        { id: 'moon', sign: 'Taurus', house: 5, nak: 'Krittika' },
        { id: 'jupiter', sign: 'Capricorn', house: 1, nak: 'Uttara Ashadha' },
        { id: 'venus', sign: 'Pisces', house: 3, nak: 'Revati' },
        { id: 'saturn', sign: 'Aries', house: 4, nak: 'Bharani' },
        { id: 'sun', sign: 'Taurus', house: 5, nak: 'Rohini' },
        { id: 'rahu', sign: 'Leo', house: 8, nak: 'Magha' }
      ],
      ashtakavarga: { SAV: [24, 38, 25, 22, 44, 28, 27, 41, 19, 21, 35, 20] }
    }
  }
];

// Replicate prompt exact constraints
async function fetchOracle(timescale, kundaliData) {
  const prompt = `You are an elite, orthodox Vedic Astrologer analyzing a Jyotish chart.
Context: 
- Current Date & Time: ${new Date().toISOString()}
- Timescale to Predict: "${timescale}" 
- TARGET UI LANGUAGE CODE: en
${getTimescaleFacts(kundaliData, timescale)}

Task:
You must provide a highly specific, immediately actionable forecasting analysis based ONLY on the provided timescale and chart data. 

*** CRITICAL ASTROLOGICAL HONESTY RULE ***
1. You MUST NOT invent, guess, hallucinate, or modify any astrological math, bindu scores, or planetary positions.
2. You MUST rely EXCLUSIVELY on the 'ASTROLOGICAL FACTS' provided above. Do not search for other metrics.
3. If citing a bindu SAV score, use the EXACT number provided in the facts above.
4. Mentally construct your logical deductions in English first to ensure mathematical precision against the Facts, and ONLY THEN translate the final written paragraphs into the target language (en).
******************************************

CRITICAL: Return a strict JSON object with exactly these 5 keys answering these questions thoroughly:
{
  "period": "State the exact future timeframe of the forecast.",
  "basis": "Explain the exact astrological mathematical basis for making your assertions (e.g. transits, dasha, bindus).",
  "assertions": "Provide deeply personalized, unflinching predictions and assert what specific events/shifts will occur.",
  "lifestyle": "Give highly practical, worldly suggestions and actions the user should take to prepare.",
  "mitigation": "Provide a strict, specific Shastric parihara/remedy to make things go more favorably."
}`;
  const res = await model.generateContent(prompt);
  return JSON.parse(res.response.text());
}

async function fetchPathway(khData) {
  const prompt = `You are an elite Vedic Astrologer running a high-fidelity Parashari synthesis engine.
Context:
- Activated Path: "Wealth & Treasury" (Governing: D2 Hora Liquidity)
- TARGET UI LANGUAGE CODE: en
${getPathwayFacts(khData.kundaliData, 'dhana')}

Task:
Return a strict JSON object with "summary" and "options".

*** CRITICAL ASTROLOGICAL HONESTY RULE ***
1. You MUST NOT invent, guess, hallucinate, or modify any astrological math, bindu scores, or planetary positions.
2. You MUST rely EXCLUSIVELY on the 'ASTROLOGICAL FACTS' provided above. Do not search for other metrics.
3. If citing a bindu SAV score, use the EXACT number provided in the facts above.
******************************************

1. "summary": A dense 2-3 sentence paragraph evaluating the user's specific chart regarding this Path. State exactly which houses/planets govern this topic based on Brihat Parashara Hora Shastra, and analyze their strength using ONLY the FACTS block.
2. "options": Exactly 1 deeply analyzed karmic outcomes operating under this specific Pillar right now for the user. (WE USE 1 FOR TEST). Break down the analysis into EXACTLY 3 distinct paragraphs, each with an appropriate subheading mapping to these exact concepts:
   - Paragraph 1: The Astrological Basis
   - Paragraph 2: The Prophetic Assertions
   - Paragraph 3: Lifestyle & Practical Preparedness

EXPECTED JSON SCHEMA WITH CANONICAL EXAMPLES (Translate the text to en):
{
  "summary": "...",
  "options": [
    {
      "id": "outcome_1", "icon": "🌊", "label": "Pathway label", "timeframe": "Over the next 14 to 18 months",
      "paragraphs": [
         { "subheading": "Astrological Mechanics", "content": "..." },
         { "subheading": "Karmic Synthesis", "content": "..." },
         { "subheading": "Practical Counsel", "content": "..." }
      ],
      "mitigation": "..."
    }
  ]
}`;
  const res = await model.generateContent(prompt);
  return JSON.parse(res.response.text());
}

async function run() {
  console.log("STARTING HALLUCINATION EVALUATION");
  for (const k of mockKundalis) {
    console.log("\\n===========================================");
    console.log("Evaluating: " + k.name);
    
    console.log("\\n--- ORACLE: Today ---");
    const today1 = await fetchOracle('Today', k.kundaliData);
    const today2 = await fetchOracle('Today', k.kundaliData);
    console.log("Call 1 Basis:", today1.basis);
    console.log("Call 2 Basis:", today2.basis);
    console.log("Call 1 Assert:", today1.assertions);
    console.log("Call 2 Assert:", today2.assertions);
    console.log("Call 1 LS:", today1.lifestyle);
    console.log("Call 2 LS:", today2.lifestyle);

    console.log("\\n--- ORACLE: This Samvatsara ---");
    const samv1 = await fetchOracle('This Samvatsara', k.kundaliData);
    const samv2 = await fetchOracle('This Samvatsara', k.kundaliData);
    console.log("Call 1 Basis:", samv1.basis);
    console.log("Call 2 Basis:", samv2.basis);

    console.log("\\n--- PATHWAY: Wealth & Treasury ---");
    const p1 = await fetchPathway(k);
    const p2 = await fetchPathway(k);
    console.log("Call 1 Summary:", p1.summary);
    console.log("Call 2 Summary:", p2.summary);
    if(p1.options && p1.options[0]) {
      console.log("Call 1 Basis:", p1.options[0].paragraphs[0].content);
      console.log("Call 1 Assert:", p1.options[0].paragraphs[1].content);
      console.log("Call 1 LS:", p1.options[0].paragraphs[2].content);
    }
    if(p2.options && p2.options[0]) {
      console.log("Call 2 Basis:", p2.options[0].paragraphs[0].content);
      console.log("Call 2 Assert:", p2.options[0].paragraphs[1].content);
      console.log("Call 2 LS:", p2.options[0].paragraphs[2].content);
    }
  }
}
run();
