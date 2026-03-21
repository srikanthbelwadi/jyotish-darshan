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
  const careerTraj = p10House === 10 ? 1 : p10House === 2 || p10House === 11 ? 2 : p10House === 6 || p10House === 8 || p10House === 12 ? 3 : 4;

  const career = {
    intro: 'ld.career.intro', introVars: { planet: lord10, house: p10House },
    mid: 'ld.career.mid', midVars: { house: p10House, trajectory: `ld.career.traj.${careerTraj}` },
    end: 'ld.career.end', endVars: {}
  };

  // 2. Health & Vitality (1st house)
  const lord1 = getLordName(1);
  const p1 = getPlanet(lord1);
  const p1House = p1.house || 1;
  const healthStr = [6,8,12].includes(p1House) ? 1 : 2;

  const health = {
    intro: 'ld.health.intro', introVars: { planet: lord1 },
    mid: 'ld.health.mid', midVars: { planet: lord1, house: p1House, healthStr: `ld.health.str.${healthStr}` },
    end: 'ld.health.end', endVars: { planet: lord1 }
  };

  // 3. Wealth & Finance (2nd & 11th houses)
  const lord2 = getLordName(2);
  const p2 = getPlanet(lord2);
  const p2House = p2.house || 2;
  const wealthStr = p2House === 1 || p2House === 5 || p2House === 9 ? 1 : p2House === 7 || p2House === 10 ? 2 : 3;

  const wealth = {
    intro: 'ld.wealth.intro', introVars: { planet: lord2 },
    mid: 'ld.wealth.mid', midVars: { planet: lord2, house: p2House, wealthStr: `ld.wealth.str.${wealthStr}` },
    end: 'ld.wealth.end', endVars: {}
  };

  // 4. Spiritual Pursuit (9th house)
  const lord9 = getLordName(9);
  const p9 = getPlanet(lord9);
  const p9House = p9.house || 9;
  const spiritualStr = ['Jupiter', 'Ketu', 'Saturn'].includes(lord9) || [4,8,12].includes(p9House) ? 1 : 2;

  const spiritual = {
    intro: 'ld.spiritual.intro', introVars: { planet: lord9, house: p9House },
    mid: 'ld.spiritual.mid', midVars: { spiritualStr: `ld.spiritual.str.${spiritualStr}` },
    end: null, endVars: {}
  };

  // 5. Relationships & Love (7th house)
  const lord7 = getLordName(7);
  const p7 = getPlanet(lord7);
  const p7House = p7.house || 7;
  const relStr = [1, 5, 9].includes(p7House) ? 1 : [6, 8, 12].includes(p7House) ? 2 : 3;

  const relationships = {
    intro: 'ld.rel.intro', introVars: { planet: lord7 },
    mid: 'ld.rel.mid', midVars: { house: p7House, relStr: `ld.rel.str.${relStr}` },
    end: 'ld.rel.end', endVars: {}
  };

  // 6. Intellect & Learning (5th house)
  const lord5 = getLordName(5);
  const p5 = getPlanet(lord5);
  const p5House = p5.house || 5;
  const intStr = [3, 6, 10, 11].includes(p5House) ? 1 : 2;

  const intellect = {
    intro: 'ld.int.intro', introVars: {},
    mid: 'ld.int.mid', midVars: { planet: lord5, house: p5House },
    end: 'ld.int.end', endVars: { intStr: `ld.int.str.${intStr}` }
  };

  return { career, health, wealth, spiritual, relationships, intellect };
}
