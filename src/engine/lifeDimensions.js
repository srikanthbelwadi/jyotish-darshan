export function getLifeDimensions(kundali) {
  const { lagna, planets } = kundali;
  if (!lagna || !planets) return null;

  const RASHI_LORDS = ['Mars','Venus','Mercury','Moon','Sun','Mercury','Venus','Mars','Jupiter','Saturn','Saturn','Jupiter'];
  
  const getLordName = (houseNum) => RASHI_LORDS[(lagna.rashi + houseNum - 1) % 12];
  
  const getPlanet = (name) => planets.find(p => p.name === name) || {};

  // 1. Career & Purpose (10th house)
  const lord10 = getLordName(10);
  const p10 = getPlanet(lord10);
  const p10House = p10.house || 10;
  const careerStr = p10House === 10 ? 'taking highly visible leadership and executive roles' : p10House === 2 || p10House === 11 ? 'lucrative financial, networking, or wealth-management fields' : p10House === 6 || p10House === 8 || p10House === 12 ? 'research, healing, or navigating challenging, transformative environments' : 'creative, educational, or communicative endeavors';
  const career = `Astrologically, your 10th house of Career is ruled by ${lord10}, which is currently positioned in the ${p10House}th house of your chart. Because the exact ruler of your professional life sits in house ${p10House}, your optimal career trajectory involves ${careerStr}. Focus your professional energy toward these domains for maximum societal impact and inner satisfaction.`;

  // 2. Health & Vitality (1st house)
  const lord1 = getLordName(1);
  const p1 = getPlanet(lord1);
  const p1House = p1.house || 1;
  const healthStr = [6,8,12].includes(p1House) ? 'requires mindful routines, stress management, and preventative care as you may be prone to sudden exhaustion or episodic immunity drops' : 'benefits from a strong, resilient constitution capable of rebounding quickly from illness, provided you maintain active physical engagement';
  const health = `Your physical vitality and overall constitution are governed by your Ascendant (Lagna) lord, ${lord1}. In your birth chart, ${lord1} resides in the ${p1House}th house. Astrologically, this primary placement means your health ${healthStr}. Protecting your physical body through routines suited to ${lord1}'s nature is your primary baseline duty.`;

  // 3. Wealth & Finance (2nd & 11th houses)
  const lord2 = getLordName(2);
  const p2 = getPlanet(lord2);
  const p2House = p2.house || 2;
  const wealthStr = p2House === 1 || p2House === 5 || p2House === 9 ? 'your personal intelligence, creative projects, and righteous (dharma) actions' : p2House === 7 || p2House === 10 ? 'collaborative business partnerships, public status, and persistent professional ambition' : 'steady, disciplined savings and managing existing family assets rather than highly speculative risks';
  const wealth = `Financial accumulation is seen centrally through your 2nd house of liquid assets and family wealth, ruled by ${lord2}. With ${lord2} placed in the ${p2House}th house, your financial inflow is directly tied to ${wealthStr}. Leveraging these specific areas will unlock your highest prosperity blocks.`;

  // 4. Spiritual Pursuit (9th house)
  const lord9 = getLordName(9);
  const p9 = getPlanet(lord9);
  const p9House = p9.house || 9;
  const spiritualStr = ['Jupiter', 'Ketu', 'Saturn'].includes(lord9) || [4,8,12].includes(p9House) ? 'deep philosophical study, esoteric astrological knowledge, and inner reflection or asceticism' : 'active worldly duties, helping others practically, and upholding firm ethical foundations in society';
  const spiritual = `Your 9th house of Dharma and high spiritual inclinations is governed by ${lord9}, which is situated in the ${p9House}th house. This specific alignment heavily suggests that your highest cosmic purpose and spiritual evolution will be best realized through ${spiritualStr}.`;

  // 5. Relationships & Love (7th house)
  const lord7 = getLordName(7);
  const p7 = getPlanet(lord7);
  const p7House = p7.house || 7;
  const relStr = [1, 5, 9].includes(p7House) ? 'deeply romantic, passionate, and tied closely to your core identity and self-expression' : [6, 8, 12].includes(p7House) ? 'karmically complex, often requiring immense patience, clear boundaries, and psychological transformation to overcome early hurdles' : 'practical, focused intensely on mutual growth, clear communication, and shared worldly responsibilities';
  const relationships = `Your 7th house of partnerships and marriage is ruled by ${lord7}. Because your relationship lord is placed dynamically in the ${p7House}th house, your approach to deep partnerships is ${relStr}. Understanding this placement helps you avoid projecting unrealistic emotional expectations onto partners.`;

  // 6. Intellect & Learning (5th house)
  const lord5 = getLordName(5);
  const p5 = getPlanet(lord5);
  const p5House = p5.house || 5;
  const intStr = [3, 6, 10, 11].includes(p5House) ? 'highly analytical, competitive, and naturally driven toward practical, real-world problem-solving' : 'highly intuitive, creative, and drawn magnetically toward abstract thinking, spiritual learning, or artistic expression';
  const intellect = `The 5th house rules your intellect, formal education, and innate creative intelligence. It is ruled by ${lord5}, which occupies your ${p5House}th house. This strong astrological signature indicates a mind that is ${intStr}.`;

  return { career, health, wealth, spiritual, relationships, intellect };
}
