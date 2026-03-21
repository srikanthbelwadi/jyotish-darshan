export function calculateMatch(k1, k2) {
  const getMoonData = (k) => {
    const moon = k.planets? k.planets.find(p => p.key === 'moon') : { rashi: 1, nIdx: 1 };
    return {
      name: k.name || (k.input && k.input.name) || 'User',
      rashi: moon.rashi - 1,
      nakshatra: moon.nIdx - 1
    };
  };

  const getMarsHouse = (k) => {
    const mars = k.planets.find(p => p.key === 'mars');
    return mars ? mars.house : 0;
  };

  const p1 = getMoonData(k1);
  const p2 = getMoonData(k2);
  
  const m1 = getMarsHouse(k1);
  const m2 = getMarsHouse(k2);
  const isM1 = [1, 4, 7, 8, 12].includes(m1);
  const isM2 = [1, 4, 7, 8, 12].includes(m2);

  let manglikStatus = "";
  if (isM1 && isM2) manglikStatus = "Both are Manglik. Manglik Dosha is cancelled, allowing for excellent marital harmony.";
  else if (!isM1 && !isM2) manglikStatus = "Neither is Manglik. No Manglik Dosha present.";
  else manglikStatus = "Manglik Dosha Present! One partner is Manglik while the other is not. This can cause significant friction in marriage unless specific astrological remedies are performed.";

  const NAK_NAMES = ['Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishta','Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati'];
  const RASHI_NAMES = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

  const diffNak = Math.abs(p1.nakshatra - p2.nakshatra);
  const diffRashi = Math.abs(p1.rashi - p2.rashi);

  const varnaScore = (diffRashi % 2 === 0) ? 1.0 : 0.5;
  const varnaDesc = varnaScore === 1.0 ? "Excellent compatibility in foundational egos and work ethic." : "Average compatibility in ego and societal perspectives.";

  const vashyaScore = (diffRashi === 2 || diffRashi === 10) ? 0.5 : (diffRashi % 3 === 0) ? 2.0 : 1.0;
  const vashyaDesc = vashyaScore === 2.0 ? "High magnetic attraction and mutual understanding of power dynamics." : "Moderate mutual attraction; requires conscious effort to avoid control struggles.";

  const taraScore = ((p1.nakshatra + p2.nakshatra) % 9 === 3 || (p1.nakshatra + p2.nakshatra) % 9 === 5) ? 1.5 : 3.0;
  const taraDesc = taraScore === 3.0 ? "Strong alignment in destiny and mutual well-being. Your life phases synchronize well." : "Destinies may sometimes clash, demanding patience during challenging life periods.";

  const yoniScore = (diffNak % 5 === 0) ? 4.0 : (diffNak % 3 === 0) ? 2.0 : 1.0;
  const yoniDesc = yoniScore === 4.0 ? "Perfect biological and intimate harmony. You intuitively understand each other's physical needs." : "Average physical harmony. Open communication about intimacy is vital for long-term satisfaction.";

  const grahaScore = (diffRashi === 0 || diffRashi === 4 || diffRashi === 8) ? 5.0 : (diffRashi === 6) ? 0.5 : 3.0;
  const grahaDesc = grahaScore === 5.0 ? "Outstanding mental friendship and psychological alignment. You genuinely enjoy each other's minds." : "Moderate mental compatibility. Differing viewpoints must be respected as unique strengths.";

  const gana1 = p1.nakshatra % 3; 
  const gana2 = p2.nakshatra % 3;
  const ganaScore = (gana1 === gana2) ? 6.0 : (Math.abs(gana1 - gana2) === 1) ? 3.0 : 0.0;
  const ganaDesc = ganaScore === 6.0 ? "Perfectly matched core temperaments. You approach life's challenges with the same instinctive attitude." : "Clashing core temperaments. One partner may feel the other is too aggressive or too passive.";

  const bhakootScore = (diffRashi === 1 || diffRashi === 11) ? 0.0 : (diffRashi === 4 || diffRashi === 8) ? 7.0 : 3.5;
  const bhakootDesc = bhakootScore === 7.0 ? "Excellent synergy for mutual growth and enduring love. You naturally support each other's expansion." : "Challenging growth dynamics. Financial or emotional friction may occasionally arise.";

  const nadi1 = p1.nakshatra % 3; 
  const nadi2 = p2.nakshatra % 3;
  const nadiScore = (nadi1 !== nadi2) ? 8.0 : 0.0;
  const nadiDesc = nadiScore === 8.0 ? "Optimal genetic and physiological compatibility. Indicates excellent vitality and family health prospects." : "Nadi Dosha present. Astrologically indicates potential genetic clashes or shared health vulnerabilities.";

  const totalScore = varnaScore + vashyaScore + taraScore + yoniScore + grahaScore + ganaScore + bhakootScore + nadiScore;

  let summary = "";
  if (totalScore >= 26) summary = "A Highly Excellent Match. Exceptional alignment across mental, physical, and spiritual dimensions.";
  else if (totalScore >= 18) summary = "A Good, Stable Match. Solid foundation, with typical relationship adjustments required.";
  else summary = "A Challenging Match. Requires immense patience, understanding, and conscious effort to sustain harmony.";

  return {
    p1: { name: p1.name, rashi: RASHI_NAMES[p1.rashi], nakshatra: NAK_NAMES[p1.nakshatra], isManglik: isM1 },
    p2: { name: p2.name, rashi: RASHI_NAMES[p2.rashi], nakshatra: NAK_NAMES[p2.nakshatra], isManglik: isM2 },
    totalScore,
    maxScore: 36,
    summary,
    manglikStatus,
    elements: [
      { name: 'Varna (Work Ethic)', score: varnaScore, max: 1, desc: varnaDesc },
      { name: 'Vashya (Attraction)', score: vashyaScore, max: 2, desc: vashyaDesc },
      { name: 'Tara (Destiny)', score: taraScore, max: 3, desc: taraDesc },
      { name: 'Yoni (Intimacy)', score: yoniScore, max: 4, desc: yoniDesc },
      { name: 'Graha Maitri (Friendship)', score: grahaScore, max: 5, desc: grahaDesc },
      { name: 'Gana (Temperament)', score: ganaScore, max: 6, desc: ganaDesc },
      { name: 'Bhakoot (Growth)', score: bhakootScore, max: 7, desc: bhakootDesc },
      { name: 'Nadi (Genetics)', score: nadiScore, max: 8, desc: nadiDesc },
    ]
  };
}
