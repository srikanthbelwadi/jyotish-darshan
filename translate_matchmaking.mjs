import translate from '@iamtraction/google-translate';
import fs from 'fs';

const dict = {
  // Headings
  'comp.phase1': 'Phase 1: Ashta Kuta Verdict',
  'comp.phase2Label': 'Phase 2: Mangal Dosha Analysis',

  // Koota Names
  'comp.varna': 'Varna (Work Ethic)',
  'comp.vashya': 'Vashya (Attraction)',
  'comp.tara': 'Tara (Destiny)',
  'comp.yoni': 'Yoni (Intimacy)',
  'comp.graha': 'Graha Maitri (Friendship)',
  'comp.gana': 'Gana (Temperament)',
  'comp.bhakoot': 'Bhakoot (Growth)',
  'comp.nadi': 'Nadi (Genetics)',

  // Koota Descriptions
  'comp.varnaHigh': 'Compatible work ethics and spiritual ego.',
  'comp.varnaLow': 'Differing societal perspectives and ego drives.',
  'comp.vashyaHigh': 'Good magnetic attraction and mutual influence.',
  'comp.vashyaLow': 'Lacking natural, instinctive magnetism.',
  'comp.taraHigh': 'Excellent alignment in destiny strings and life events.',
  'comp.taraLow': 'Potential clashes in timing of good/bad life phases.',
  'comp.yoniHigh': 'Strong intimate and physical compatibility.',
  'comp.yoniLow': 'Average physical bonding; requires deliberate communication.',
  'comp.grahaHigh': 'Harmonious psychological and friendly alignment.',
  'comp.grahaLow': 'Differing mentalities; compromises needed.',
  'comp.ganaHigh': 'Matching core temperaments and reactions to stress.',
  'comp.ganaLow': 'Clashing baseline temperaments (e.g., aggressive vs passive).',
  'comp.bhakootHigh': 'Excellent synergy for family growth, wealth, and welfare.',
  'comp.bhakootLow': 'Challenging growth dynamics. Financial or emotional friction may occasionally arise (Bhakoot Dosha).',
  'comp.nadiHigh': 'Optimal genetic and physiological vitality.',
  'comp.nadiLow': 'Nadi Dosha present. Astrologically indicates potential genetic clashes or shared health vulnerabilities.',

  // Summaries
  'comp.sumHigh': "A Highly Excellent Match. Exceptional cosmic alignment across mental, physical, and spiritual dimensions. The Ashtakuta indices suggest profound mutual understanding, natural telepathy, and an enduring sense of spiritual duty towards one another. The couple will easily navigate life's inevitable storms through their deeply harmonious synastry.",
  'comp.sumMed': "A Good, Stable Match. Solid Shastric foundation indicating healthy long-term potential. While typical relationship adjustments and negotiations are required, the underlying astrological bedrock is secure. Focusing on transparent communication and mutual spiritual practices will elevate this union significantly.",
  'comp.sumLow': "A Karmically Challenging Match. This union requires immense patience, understanding, and conscious ego-suppression to sustain harmony. The planetary cross-currents indicate profound lessons in compromise, where karmic debts may need to be balanced. Specific remedial measures (Upayas) and deep spiritual maturity are highly advised.",

  // Mangal Dosha
  'comp.manBoth': "Both partners possess Mangal Dosha. By the classic Shastric principles of mutual cancellation (Dosha Samya), the fiery marital friction is effectively neutralized. Their equal energetic, protective, and assertive drives will harmonize rather than burn each other out.",
  'comp.manNeither': "Neither partner carries a disrupting Mangal Dosha. This promises an excellent foundational peace and domestic tranquility, untouched by the sudden marital combative energies typically associated with an afflicted Mars.",
  'comp.manCancelled': "One partner has Manglik Dosha, but it is naturally cancelled due to inherent planetary dignity. The fiery marital influence is thereby neutralized, preventing Shastric conflict.",
  'comp.manPresent': "Significant Mangal Dosha Mismatch! One partner is explicitly Manglik while the other is not. This severe astrological imbalance creates disproportionate protective/combative drives and can cause highly severe friction, emotional distance, or marital instability without proper astrological remedies (Upayas).",

  // Phase 3 & 4
  'comp.struct.lords': "The core anchor of {1}'s 7th House connects structurally with {3}'s chart, binding their fundamental relationship ideals.",
  'comp.struct.venusStrong': "Venus, the ultimate significator of romance, sits in a supportive dignity across both charts, seeding natural devotion, aesthetic harmony, and deep mutual affection.",
  'comp.struct.venusWeak': "Venus is afflicted in one or both charts, indicating that maintaining romance and aesthetic harmony will require highly conscious, deliberate effort from both partners.",
  'comp.struct.dashaCaution': "One or both partners are traversing intense Karmic planetary periods (Rahu, Ketu, Saturn). Expect sudden, transformative shifts in the relationship structure that will demand deep psychological resilience.",
  'comp.struct.dashaOk': "Both individuals are currently traversing supportive planetary periods (Dashas), meaning the cosmic timing actively endorses the formation of this bond."
};

const LANGS = ['hi', 'te', 'ta', 'kn', 'mr', 'gu', 'bn', 'ml'];

async function run() {
  const file = './src/i18n/dashboardTranslations.json';
  let db = {};
  if (fs.existsSync(file)) {
    db = JSON.parse(fs.readFileSync(file, 'utf8'));
  }

  for (const lang of LANGS) {
    if (!db[lang]) db[lang] = {};
    console.log(`Translating to ${lang}...`);
    
    for (const [key, text] of Object.entries(dict)) {
      if (!db[lang][key]) { 
        try {
          const res = await translate(text, { to: lang });
          // Preserve {N} format tokens so CompatibilityMatch replace works
          let fixedText = res.text.replace(/\{(\d+)\}/g, '{$1}'); 
          db[lang][key] = fixedText;
          console.log(`  [${lang}] ${key} -> ${fixedText.substring(0,30)}...`);
        } catch(e) {
          console.error(`  Failed on ${key}`);
        }
      }
    }
  }

  fs.writeFileSync(file, JSON.stringify(db, null, 2));
  console.log('Complete!');
}

run();
