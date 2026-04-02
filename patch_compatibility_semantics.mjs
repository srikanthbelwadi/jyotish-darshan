import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const EN_DEFAULTS = {
    "comp.title": "Companion Compatibility",
    "comp.subtitle": "Assess celestial resonance, verify Gunas, and uncover deep astrological alignments with your partner.",
    "comp.view": "View Compatibility ➔",
    "comp.add": "Check Partner Compatibility ➔",
    "comp.addP": "+ ADD PARTNER",
    "comp.addPartner": "Add Companion Chart",
    "comp.partnerName": "Partner Name",
    "comp.cancel": "CANCEL",
    "comp.match": "CALCULATE SYNASTRY",
    "comp.formNote": "Enter the precise birth specifics of the partner to calculate synastry resonances.",
    "comp.milan": "Compatibility (Milan)",
    "comp.user": "Primary Chart",
    "comp.partner": "Partner Chart",
    "comp.manglik": "Mangal Dosha Status:",
    "comp.yes": "Yes",
    "comp.no": "No",
    "comp.phase1": "Phase 1: Ashta Kuta Verdict",
    "comp.phase2Label": "Phase 2: Mangal Dosha Analysis",
    "comp.phase34": "Phase 3 & 4: Structural Chart & Dasha Synthesis",
    "comp.breakdown": "Detailed 8-Koota Breakdown",

    "comp.sumHigh": "A Highly Excellent Match. Exceptional cosmic alignment across mental, physical, and spiritual dimensions. The Ashtakuta indices suggest profound mutual understanding, natural telepathy, and an enduring sense of spiritual duty towards one another. The couple will easily navigate life's inevitable storms through their deeply harmonious synastry.",
    "comp.sumMed": "A Good, Stable Match. Solid Shastric foundation indicating healthy long-term potential. While typical relationship adjustments and negotiations are required, the underlying astrological bedrock is secure. Focusing on transparent communication and mutual spiritual practices will elevate this union significantly.",
    "comp.sumLow": "A Karmically Challenging Match. This union requires immense patience, understanding, and conscious ego-suppression to sustain harmony. The planetary cross-currents indicate profound lessons in compromise, where karmic debts may need to be balanced. Specific remedial measures (Upayas) and deep spiritual maturity are highly advised.",

    "comp.manBoth": "Both partners possess Mangal Dosha. By the classic Shastric principles of mutual cancellation (Dosha Samya), the fiery marital friction is effectively neutralized. Their equal energetic, protective, and assertive drives will harmonize rather than burn each other out.",
    "comp.manNeither": "Neither partner carries a disrupting Mangal Dosha. This promises an excellent foundational peace and domestic tranquility, untouched by the sudden marital combative energies typically associated with an afflicted Mars.",
    "comp.manCancelled": "Manglik Dosha is present, but it is cancelled due to inherent planetary dignity (Neechabhanga/Sva-Rashi). The fiery marital influence is thereby neutralized, preventing Shastric conflict.",
    "comp.manPresent": "Significant Mangal Dosha Mismatch! One partner is explicitly Manglik while the other is not. This severe astrological imbalance creates disproportionate protective/combative drives and can cause highly severe friction, emotional distance, or marital instability without proper astrological remedies (Upayas).",

    "comp.struct.lords": "The core anchor of {1}'s 7th House connects structurally with {3}'s chart, binding their fundamental relationship ideals.",
    "comp.struct.venusStrong": "Venus, the ultimate significator of romance, sits in a supportive dignity across both charts, seeding natural devotion, aesthetic harmony, and deep mutual affection.",
    "comp.struct.venusWeak": "Venus faces dignity challenges across these charts, suggesting that romance, intimacy, or mutual appreciation may require conscious, deliberate effort to sustain.",
    "comp.struct.dashaCaution": "The current Dasha alignments feature Karmic nodes or Saturn, denoting that this relationship phase will test patience, requiring significant spiritual maturity and duty.",
    "comp.struct.dashaOk": "Furthermore, both individuals are currently traversing supportive planetary periods (Dashas), meaning the cosmic timing actively endorses the formation of this bond.",

    "comp.varna": "Varna Koota (Work Ethic & Ego)",
    "comp.vashya": "Vashya Koota (Magnetic Attraction)",
    "comp.tara": "Tara Koota (Destiny Strings)",
    "comp.yoni": "Yoni Koota (Intimacy & Biology)",
    "comp.graha": "Graha Maitri (Mental Friendship)",
    "comp.gana": "Gana Koota (Core Temperament)",
    "comp.bhakoot": "Bhakoot (Family Growth & Dynamics)",
    "comp.nadi": "Nadi Koota (Genetic Vitality & Health)",

    "comp.varnaHigh": "Compatible work ethics and aligned spiritual ego.",
    "comp.varnaLow": "Differing societal perspectives and conflicting ego drives.",
    "comp.vashyaHigh": "Good natural magnetic attraction and mutual influence.",
    "comp.vashyaLow": "Lacking deep, instinctive magnetism or natural dominance balance.",
    "comp.taraHigh": "Excellent alignment in destiny strings and life events.",
    "comp.taraLow": "Potential clashes in the synchronous timing of good/bad life phases.",
    "comp.yoniHigh": "Strong intimate physical compatibility and biological harmony.",
    "comp.yoniLow": "Average physical bonding; requires deliberate affectionate communication.",
    "comp.grahaHigh": "Harmonious psychological alignment and deep natural friendship.",
    "comp.grahaLow": "Differing mentalities and lunar temperaments; immense compromises needed.",
    "comp.ganaHigh": "Matching core temperaments and similar reactions to psychological stress.",
    "comp.ganaLow": "Clashing baseline temperaments (e.g., highly aggressive vs purely passive).",
    "comp.bhakootHigh": "Excellent synergy for family growth, accumulating wealth, and mutual welfare.",
    "comp.bhakootLow": "Challenging growth dynamics. Deep financial or emotional friction may occasionally arise (Bhakoot Dosha).",
    "comp.nadiHigh": "Optimal genetic and physiological vitality. High promise for progeny.",
    "comp.nadiLow": "Nadi Dosha present. Astrologically indicates potential genetic clashes or shared health vulnerabilities."
};

const LANGUAGES = ['hi', 'ta', 'te', 'kn', 'mr', 'gu', 'bn', 'ml'];

async function runTranslation() {
    const rawData = fs.readFileSync('./src/i18n/dashboardTranslations.json', 'utf8');
    const db = JSON.parse(rawData);
    
    // Inject English Defaults Immediately
    Object.entries(EN_DEFAULTS).forEach(([key, val]) => {
        db.en[key] = val;
    });

    console.log(`Starting Generative Translation Pipeline... Total Keys: ${Object.keys(EN_DEFAULTS).length}`);

    for (const lang of LANGUAGES) {
        if (!db[lang]) db[lang] = {};

        const prompt = `You are an expert, culturally profound Indian Vedic Astrologer (Jyotishi) highly fluent in ${lang}.
I have a JSON of Partner Compatibility (Synastry / Milan / Kundali Matching) strings in English. 
You must translate these into grammatically flawless, semantically profound ${lang}.

CRITICAL RULES:
1. DO NOT do a literal, word-for-word translation. 
2. Use precise astrological (Shastric) terminology where appropriate (e.g., refer to "Mangal Dosha", "Ashta Kuta", "Gana", "Nadi Dosha", "Upaya/Parihara").
3. Your tone must be dignified, respectful, analytical, and profound. 
4. Return ONLY a pure JSON object string and NOTHING ELSE. Do NOT wrap the JSON in Markdown delimiters (\`\`\`). The JSON object must contain all the keys from the English source exactly identical.

ENGLISH SOURCE JSON:
${JSON.stringify(EN_DEFAULTS, null, 2)}
        `;

        try {
            console.log(`Translating directly into ${lang}...`);
            const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });
            const response = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.1,
                }
            });

            let outText = response.response.text().replace(/^[^{]*{/, '{').replace(/}[^}]*$/, '}');
            const translation = JSON.parse(outText);

            Object.entries(translation).forEach(([k, v]) => {
                db[lang][k] = v;
            });

            console.log(`[Success] ${lang} translation merged.`);
            // Pause minimally to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 800));

        } catch (e) {
            console.error(`[Error] Failed on ${lang}:`, e.message);
        }
    }

    fs.writeFileSync('./src/i18n/dashboardTranslations.json', JSON.stringify(db, null, 2), 'utf8');
    console.log('Successfully completed full semantic translation rewrite of dashboardTranslations.json!');
}

runTranslation();
