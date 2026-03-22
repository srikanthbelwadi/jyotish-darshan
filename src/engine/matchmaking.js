
export function calculateMatch(k1, k2) {
  const getMoonData = (k) => {
    const moon = k.planets ? k.planets.find(p => p.key === 'moon') : { rashi: 1, nIdx: 1 };
    return {
      name: k.name || (k.input && k.input.name) || 'User',
      gender: k.input?.gender || 'male',
      rashi: moon.rashi,
      nakshatra: moon.nIdx,
      pada: moon.pada
    };
  };

  const p1 = getMoonData(k1);
  const p2 = getMoonData(k2);

  // Assign boy / girl for traditional calculations if available
  let boy = p1.gender === 'male' ? p1 : p2;
  let girl = p1.gender === 'female' ? p1 : p2;
  // If both same or unknown, default to p1=boy, p2=girl for math sake
  if (boy === girl) {
      boy = p1; girl = p2;
  }

  // ==== PHASE 1: ASHTA KUTA ====
  // 1. Varna (1 pt)
  // Brahmin (11,3,7), Kshatriya (0,4,8), Vaishya (1,5,9), Shudra (2,6,10)
  const getVarna = (r) => {
    if ([3,7,11].includes(r)) return 4; // Brahmin
    if ([0,4,8].includes(r)) return 3; // Kshatriya
    if ([1,5,9].includes(r)) return 2; // Vaishya
    return 1; // Shudra
  };
  const vB = getVarna(boy.rashi);
  const vG = getVarna(girl.rashi);
  const varnaScore = vB >= vG ? 1 : 0; 
  const varnaDesc = varnaScore === 1 ? 'Compatible work ethics and spiritual ego.' : 'Differing societal perspectives and ego drives.';

  // 2. Vashya (2 pts)
  const vashyaScore = (boy.rashi === girl.rashi) ? 2 : (Math.abs(boy.rashi - girl.rashi) % 3 === 0 ? 1 : 0);
  const vashyaDesc = vashyaScore > 0 ? 'Good magnetic attraction and mutual influence.' : 'Lacking natural, instinctive magnetism.';

  // 3. Tara (3 pts)
  const bTara = (girl.nakshatra - boy.nakshatra + 27) % 27;
  const gTara = (boy.nakshatra - girl.nakshatra + 27) % 27;
  const badTaras = [2, 4, 6, 8]; // measured in 1-9 blocks: 3rd, 5th, 7th are usually malefic
  // Using simplified 0-8 scale: 2 (Vipat), 4 (Pratyari), 6 (Vadha) are bad.
  const bTaraGrp = bTara % 9;
  const gTaraGrp = gTara % 9;
  const bTbad = badTaras.includes(bTaraGrp);
  const gTbad = badTaras.includes(gTaraGrp);
  const taraScore = (!bTbad && !gTbad) ? 3 : (bTbad && gTbad ? 0 : 1.5);
  const taraDesc = taraScore === 3 ? 'Excellent alignment in destiny strings and life events.' : 'Potential clashes in timing of good/bad life phases.';

  // 4. Yoni (4 pts)
  // Very simplified biological compatibility
  const yoniScore = (boy.nakshatra % 5 === girl.nakshatra % 5) ? 4 : (Math.abs(boy.nakshatra - girl.nakshatra) % 2 === 0 ? 2 : 1);
  const yoniDesc = yoniScore > 2 ? 'Strong intimate and physical compatibility.' : 'Average physical bonding; requires deliberate communication.';

  // 5. Graha Maitri (5 pts)
  const rLords = [
    'mars', 'venus', 'mercury', 'moon', 'sun', 'mercury', 
    'venus', 'mars', 'jupiter', 'saturn', 'saturn', 'jupiter'
  ];
  const bLord = rLords[boy.rashi];
  const gLord = rLords[girl.rashi];
  const grahaScore = (bLord === gLord) ? 5 : (bLord === 'sun' || bLord === 'moon' || bLord === 'jupiter' ? 3 : 2); // Extremely simplified fallback
  const grahaDesc = grahaScore >= 4 ? 'Harmonious psychological and friendly alignment.' : 'Differing mentalities; compromises needed.';

  // 6. Gana (6 pts)
  // 0-8 Deva, 9-17 Manushya, 18-26 Rakshasa (Very rough grouping, standard is specific per Nakshatra)
  const getGana = (n) => [0,4,6,7,12,14,21,26].includes(n) ? 'Deva' : [1,2,3,5,10,11,19,20,24].includes(n) ? 'Manushya' : 'Rakshasa';
  const bGana = getGana(boy.nakshatra);
  const gGana = getGana(girl.nakshatra);
  let ganaScore = 0;
  if (bGana === gGana) ganaScore = 6;
  else if (bGana === 'Deva' && gGana === 'Manushya') ganaScore = 5;
  else if (bGana === 'Manushya' && gGana === 'Deva') ganaScore = 5;
  else if (bGana === 'Rakshasa' || gGana === 'Rakshasa') ganaScore = 0; // Rakshasa clash
  else ganaScore = 2;
  const ganaDesc = ganaScore > 4 ? 'Matching core temperaments and reactions to stress.' : 'Clashing baseline temperaments (e.g., aggressive vs passive).';

  // 7. Bhakoot (7 pts)
  const bhakDiff = (girl.rashi - boy.rashi + 12) % 12; // 1-indexed distance 
  // 1/7 (0,6), 3/11 (2,10), 4/10 (3,9) are excellent. 2/12, 5/9, 6/8 are problematic.
  const badBhakoot = [1, 11, 4, 8, 5, 7]; // 2/12, 5/9, 6/8 distances
  const bhakootScore = badBhakoot.includes(bhakDiff) ? 0 : 7;
  const bhakootDesc = bhakootScore === 7 ? 'Excellent synergy for family growth, wealth, and welfare.' : 'Challenging growth dynamics. Financial or emotional friction may occasionally arise (Bhakoot Dosha).';

  // 8. Nadi (8 pts)
  const getNadi = (n) => n % 3; // 0 Adi, 1 Madhya, 2 Antya (Rough approximation)
  const bNadi = getNadi(boy.nakshatra);
  const gNadi = getNadi(girl.nakshatra);
  const nadiScore = (bNadi !== gNadi) ? 8 : 0;
  const nadiDesc = nadiScore === 8 ? 'Optimal genetic and physiological vitality.' : 'Nadi Dosha present. Astrologically indicates potential genetic clashes or shared health vulnerabilities.';

  const totalScore = varnaScore + vashyaScore + taraScore + yoniScore + grahaScore + ganaScore + bhakootScore + nadiScore;

  let summary = "";
  let summaryKey = "";
  if (totalScore >= 26) {
    summary = "A Highly Excellent Match. Exceptional alignment across mental, physical, and spiritual dimensions.";
    summaryKey = "sumHigh";
  } else if (totalScore >= 18) {
    summary = "A Good, Stable Match. Solid foundation, with typical relationship adjustments required.";
    summaryKey = "sumMed";
  } else {
    summary = "A Challenging Match. Requires immense patience, understanding, and conscious effort to sustain harmony.";
    summaryKey = "sumLow";
  }

  // ==== PHASE 2: MANGAL DOSHA ====
  const checkManglik = (k) => {
    // Check Mars from Lagna, Moon, Venus
    const mars = k.planets.find(p => p.key === 'mars');
    const lagna = k.planets.find(p => p.key === 'lagna') || {rashi:0};
    const moon = k.planets.find(p => p.key === 'moon') || {rashi:0};
    const venus = k.planets.find(p => p.key === 'venus') || {rashi:0};
    if (!mars) return { isManglik: false };
    
    // Position from Lagna (House is already calculated in k.planets)
    const fromLagna = mars.house || 1; 
    
    // Position from Moon
    const fromMoon = (mars.rashi - moon.rashi + 12) % 12 + 1;
    
    // Position from Venus
    const fromVenus = (mars.rashi - venus.rashi + 12) % 12 + 1;

    const doshaHouses = [1, 2, 4, 7, 8, 12]; // South Indian system includes 2, North usually 1,4,7,8,12
    const isLagnaManglik = [1,4,7,8,12].includes(fromLagna);
    const isMoonManglik = [1,4,7,8,12].includes(fromMoon);
    const isVenusManglik = [1,4,7,8,12].includes(fromVenus);

    const isManglik = isLagnaManglik || isMoonManglik || isVenusManglik;

    // Cancellations
    let isCancelled = false;
    let cancelReason = "";
    if (isManglik) {
        if (mars.rashi === 0 && fromLagna === 1) { isCancelled = true; cancelReason = "Mars in Aries Lagna neutralises Dosha."; }
        if (mars.rashi === 7 && fromLagna === 4) { isCancelled = true; cancelReason = "Mars in Scorpio in 4th neutralises Dosha."; }
        if (mars.rashi === 9 && fromLagna === 7) { isCancelled = true; cancelReason = "Mars in Capricorn in 7th neutralises Dosha."; }
        if (mars.rashi === 3 && fromLagna === 8) { isCancelled = true; cancelReason = "Mars in Gemini in 8th neutralises Dosha."; }
    }

    return { isManglik, isCancelled, cancelReason, fromLagna, fromMoon, fromVenus };
  };

  const m1 = checkManglik(k1);
  const m2 = checkManglik(k2);
  
  let manglikStatus = "";
  let manglikKey = "";
  let mutualCancellation = false;

  if (m1.isManglik && m2.isManglik) {
    manglikStatus = "Both are Manglik. By rules of mutual cancellation, the Dosha is neutralized, allowing for equal energetic matching.";
    manglikKey = "manBoth";
    mutualCancellation = true;
  } else if (!m1.isManglik && !m2.isManglik) {
    manglikStatus = "Neither partner has Manglik Dosha. Excellent foundational peace.";
    manglikKey = "manNeither";
  } else {
      // One is, one isn't
      const theManglik = m1.isManglik ? p1.name : p2.name;
      const theObj = m1.isManglik ? m1 : m2;
      if (theObj.isCancelled) {
          manglikStatus = `${theManglik} has Manglik Dosha, but it is cancelled due to planetary dignity (${theObj.cancelReason}). No clash.`;
          manglikKey = "manCancelled";
      } else {
          manglikStatus = "Significant Mangal Dosha Match Mismatch! One partner is Manglik while the other is not. This can cause severe friction or marital instability without astrological remedies.";
          manglikKey = "manPresent";
      }
  }

  // ==== PHASE 3 & 4: STRUCTURAL & DASHA ====
  const analyzeStructure = (k, isP1) => {
    // 7th House
    const lagnaRashi = k.planets.find(p => p.key === 'lagna')?.rashi || 0;
    const house7Rashi = (lagnaRashi + 6) % 12;
    const house7LordKey = rLords[house7Rashi];
    const house7Lord = k.planets.find(p => p.key === house7LordKey);
    const venus = k.planets.find(p => p.key === 'venus');
    const jup = k.planets.find(p => p.key === 'jupiter');

    const lordDignity = house7Lord ? (house7Lord.isExalted ? 'Exalted' : house7Lord.isDebilitated ? 'Debilitated' : 'Normal') : 'Normal';
    
    // Check Dasha
    const currentMaha = k.dasha?.mahadashas?.find(m => m.isCurrent);
    
    return {
       h7Lord: house7LordKey,
       h7Dignity: lordDignity,
       venusStrong: venus && !venus.isDebilitated,
       jupStrong: jup && !jup.isDebilitated,
       dashaPlanet: currentMaha?.planet || 'none'
    };
  };

  const str1 = analyzeStructure(k1, true);
  const str2 = analyzeStructure(k2, false);

  const structuralSynthesis = {
     lordsPart: { key: 'comp.struct.lords', vars: { lord1: str1.h7Lord, p1: p1.name, lord2: str2.h7Lord, p2: p2.name } },
     venusPart: { key: str1.venusStrong && str2.venusStrong ? 'comp.struct.venusStrong' : 'comp.struct.venusWeak' },
     dashaPart: { key: ['rahu','ketu','saturn'].includes(str1.dashaPlanet) && ['rahu','ketu','saturn'].includes(str2.dashaPlanet) ? 'comp.struct.dashaCaution' : 'comp.struct.dashaOk' }
  };

  const NAK_NAMES = ['Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishta','Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati'];
  const RASHI_NAMES = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

  return {
    p1: { name: p1.name, rashi: RASHI_NAMES[p1.rashi], nakshatra: NAK_NAMES[p1.nakshatra], isManglik: m1.isManglik },
    p2: { name: p2.name, rashi: RASHI_NAMES[p2.rashi], nakshatra: NAK_NAMES[p2.nakshatra], isManglik: m2.isManglik },
    ashtaKuta: {
        totalScore,
        maxScore: 36,
        summary,
        summaryKey,
        elements: [
          { key: 'varna', name: 'Varna (Work Ethic)', score: varnaScore, max: 1, descKey: varnaScore === 1.0 ? 'varnaHigh' : 'varnaLow', desc: varnaDesc },
          { key: 'vashya', name: 'Vashya (Attraction)', score: vashyaScore, max: 2, descKey: vashyaScore === 2.0 ? 'vashyaHigh' : 'vashyaLow', desc: vashyaDesc },
          { key: 'tara', name: 'Tara (Destiny)', score: taraScore, max: 3, descKey: taraScore === 3.0 ? 'taraHigh' : 'taraLow', desc: taraDesc },
          { key: 'yoni', name: 'Yoni (Intimacy)', score: yoniScore, max: 4, descKey: yoniScore >= 2.0 ? 'yoniHigh' : 'yoniLow', desc: yoniDesc },
          { key: 'graha', name: 'Graha Maitri (Friendship)', score: grahaScore, max: 5, descKey: grahaScore >= 4.0 ? 'grahaHigh' : 'grahaLow', desc: grahaDesc },
          { key: 'gana', name: 'Gana (Temperament)', score: ganaScore, max: 6, descKey: ganaScore >= 4.0 ? 'ganaHigh' : 'ganaLow', desc: ganaDesc },
          { key: 'bhakoot', name: 'Bhakoot (Growth)', score: bhakootScore, max: 7, descKey: bhakootScore === 7.0 ? 'bhakootHigh' : 'bhakootLow', desc: bhakootDesc },
          { key: 'nadi', name: 'Nadi (Genetics)', score: nadiScore, max: 8, descKey: nadiScore === 8.0 ? 'nadiHigh' : 'nadiLow', desc: nadiDesc },
        ]
    },
    mangalDosha: {
        manglikStatus,
        manglikKey,
        p1Manglik: m1.isManglik && !m1.isCancelled,
        p2Manglik: m2.isManglik && !m2.isCancelled,
        fromLagna1: m1.fromLagna,
        mutualCancellation
    },
    structural: {
        synthesis: structuralSynthesis
    }
  };
}
