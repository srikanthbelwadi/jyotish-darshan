export function getLifeDimensions(kundali) {
  const { lagna, planets } = kundali;
  
  if (!lagna || !planets) return null;

  const RASHI_LORDS = ['mars','venus','mercury','moon','sun','mercury','venus','mars','jupiter','saturn','saturn','jupiter'];
  
  const getLordKey = (houseNum) => {
    // 1-indexed house
    const rashiIdx = (lagna.rashi + houseNum - 1) % 12;
    return RASHI_LORDS[rashiIdx];
  };

  const getPlanet = (key) => planets.find(p => p.key === key) || {};

  // 1. Career & Purpose (10th house)
  const lord10 = getLordKey(10);
  const p10 = getPlanet(lord10);
  const careerStr = p10.exalted ? 'an exceptionally prominent' : p10.debil ? 'a transformative and challenging' : 'a steady and progressing';
  const roleStr = (p10.key === 'sun' || p10.key === 'mars') ? 'leadership, administration, or technical fields' :
                  (p10.key === 'mercury' || p10.key === 'jupiter') ? 'consulting, intellect, education, or business' :
                  'creative, service-oriented, or aesthetic disciplines';
  const career = `Your 10th lord of Karma is ${p10.name}, placed in the ${p10.house || '?'}th house. This indicates ${careerStr} career trajectory naturally aligned with ${roleStr}. Focus your energy here for maximum societal impact.`;

  // 2. Health & Vitality (1st house)
  const lord1 = getLordKey(1);
  const p1 = getPlanet(lord1);
  const healthStr = [6, 8, 12].includes(p1.house) ? 'requires mindful routines and careful stress management' : 'is inherently robust and resilient';
  const health = `Your Lagna (Ascendant) lord is ${p1.name}, currently positioned in house ${p1.house || '?'}. Your baseline physical vitality ${healthStr}. Protecting your physical body is your first karmic duty.`;

  // 3. Wealth & Finance (2nd & 11th houses)
  const lord2 = getLordKey(2);
  const lord11 = getLordKey(11);
  const p2 = getPlanet(lord2);
  const p11 = getPlanet(lord11);
  const wealthStr = p2.exalted || p11.exalted ? 'significant accumulation potential' : 'a need for disciplined financial planning';
  const wealth = `Wealth generation is governed by your 2nd lord (${p2.name}) and 11th lord (${p11.name}). Connected to the ${p2.house || '?'}th and ${p11.house || '?'}th houses, this signifies ${wealthStr} tied to these areas of life.`;

  // 4. Spiritual Pursuit (9th house)
  const lord9 = getLordKey(9);
  const p9 = getPlanet(lord9);
  const spiritStr = ['jupiter', 'ketu', 'saturn'].includes(p9.key) ? 'deep philosophical, esoteric, or ascetic study' : 'practical ethical duties and worldly dharma';
  const spiritual = `The 9th lord of Dharma, ${p9.name}, resides in your ${p9.house || '?'}th house. Your higher cosmic purpose and spiritual evolution will be best realized through ${spiritStr}.`;

  return { career, health, wealth, spiritual };
}
