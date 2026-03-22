import fs from 'fs';
import translate from '@iamtraction/google-translate';

const keysToTranslate = {
  'comp.phase1': "Phase 1: Ashta Kuta Verdict",
  'comp.phase2': "Phase 2: Mangal Dosha Analysis",
  'comp.phase34': "Phase 3 & 4: Structural Chart & Dasha Synthesis",
  'comp.varna': "Varna (Work Ethic)",
  'comp.vashya': "Vashya (Attraction)",
  'comp.tara': "Tara (Destiny)",
  'comp.yoni': "Yoni (Intimacy)",
  'comp.graha': "Graha Maitri (Friendship)",
  'comp.gana': "Gana (Temperament)",
  'comp.bhakoot': "Bhakoot (Growth)",
  'comp.nadi': "Nadi (Genetics)",
  
  'comp.sumHigh': "A Highly Excellent Match. Exceptional alignment across mental, physical, and spiritual dimensions.",
  'comp.sumMed': "A Good, Stable Match. Solid foundation, with typical relationship adjustments required.",
  'comp.sumLow': "A Challenging Match. Requires immense patience, understanding, and conscious effort to sustain harmony.",
  
  'comp.struct.lords': "The 7th House Lords are X_LORD1_X (X_P1_X) and X_LORD2_X (X_P2_X).",
  'comp.struct.venusStrong': "Venus is strongly placed offering marital comforts.",
  'comp.struct.venusWeak': "Venus requires strengthening for full marital bliss.",
  'comp.struct.dashaCaution': "CAUTION: Both partners are running intense karmic Mahadashas (Rahu/Ketu/Saturn). Conscious patience is essential.",
  'comp.struct.dashaOk': "Dasha periods are reasonably balanced.",
  
  'comp.varnaHigh': "Compatible work ethics and spiritual ego.",
  'comp.varnaLow': "Differing societal perspectives and ego drives.",
  'comp.vashyaHigh': "Good magnetic attraction and mutual influence.",
  'comp.vashyaLow': "Lacking natural, instinctive magnetism.",
  'comp.taraHigh': "Excellent alignment in destiny strings and life events.",
  'comp.taraLow': "Potential clashes in timing of good/bad life phases.",
  'comp.yoniHigh': "Strong intimate and physical compatibility.",
  'comp.yoniLow': "Average physical bonding; requires deliberate communication.",
  'comp.grahaHigh': "Harmonious psychological and friendly alignment.",
  'comp.grahaLow': "Differing mentalities; compromises needed.",
  'comp.ganaHigh': "Matching core temperaments and reactions to stress.",
  'comp.ganaLow': "Clashing baseline temperaments (e.g., aggressive vs passive).",
  'comp.bhakootHigh': "Excellent synergy for family growth, wealth, and welfare.",
  'comp.bhakootLow': "Challenging growth dynamics. Financial or emotional friction may occasionally arise (Bhakoot Dosha).",
  'comp.nadiHigh': "Optimal genetic and physiological vitality.",
  'comp.nadiLow': "Nadi Dosha present. Astrologically indicates potential genetic clashes or shared health vulnerabilities.",
  
  'comp.manBoth': "Both are Manglik. By rules of mutual cancellation, the Dosha is neutralized, allowing for equal energetic matching.",
  'comp.manNeither': "Neither partner has Manglik Dosha. Excellent foundational peace.",
  'comp.manCancelled': "Manglik Dosha is cancelled due to planetary dignity. No clash.",
  'comp.manPresent': "Significant Mangal Dosha Match Mismatch! One partner is Manglik while the other is not. This can cause severe friction or marital instability without astrological remedies."
};

const langs = ['en', 'hi', 'kn', 'te', 'ta', 'mr', 'gu', 'ml', 'sa', 'bn'];
const file = 'src/i18n/dynamicTranslations.js';
let content = fs.readFileSync(file, 'utf-8');

async function run() {
  for (const lang of langs) {
    const langRegex = new RegExp("(^|\\s)" + lang + ":\\s*\\{[\\s\\S]*?\\n  \\},?");
    const match = content.match(langRegex);
    if (!match) continue;
    
    let langBlock = match[0];
    let injected = [];
    
    for (const [k, v] of Object.entries(keysToTranslate)) {
      if (!langBlock.includes("'" + k + "':")) {
        if (lang === 'en') {
           injected.push("'" + k + "': '" + v.replace(/'/g, "\\'") + "'");
        } else {
           let targetLang = lang === 'sa' ? 'hi' : lang;
           try {
             let tr = await translate(v, { from: 'en', to: targetLang });
             let trStr = tr.text;
             trStr = trStr.replace(/X_LORD1_X/ig, '{0}')
                          .replace(/X_P1_X/ig, '{1}')
                          .replace(/X_LORD2_X/ig, '{2}')
                          .replace(/X_P2_X/ig, '{3}');
             injected.push("'" + k + "': '" + trStr.replace(/'/g, "\\'") + "'");
           } catch(e) { console.error(e); }
        }
      }
    }
    
    if (injected.length > 0) {
      langBlock = langBlock.replace(/(\n  \}(,?))$/, ",\\n    " + injected.join(",\n    ") + "$1");
      content = content.replace(match[0], langBlock);
    }
  }

  content = content.replace(/X_LORD1_X/g, '{0}').replace(/X_P1_X/g, '{1}').replace(/X_LORD2_X/g, '{2}').replace(/X_P2_X/g, '{3}');
  fs.writeFileSync(file, content, 'utf-8');
  console.log("Updated translations!");
}

run();
