export function getTimescaleFacts(kundaliData, timescale) {
  let facts = `
=== ASTROLOGICAL FACTS ===
Lagna (Ascendant): ${kundaliData.lagna?.rashi || 'Unknown'}
Active Mahadasha: ${kundaliData.dasha?.maha || 'Unknown'}
Active Antardasha: ${kundaliData.dasha?.antar || 'Unknown'}`;

  if (kundaliData.panchanga) {
    facts += `\nCurrent Panchanga: Tithi ${kundaliData.panchanga.tithi}, Yoga ${kundaliData.panchanga.yoga}, Karana ${kundaliData.panchanga.karana}, Nakshatra ${kundaliData.panchanga.nakshatra}`;
  }

  // Find transit moon
  const moon = kundaliData.planets?.find(p => p.id === 'moon');
  if (moon) {
    facts += `\nMoon Position: Sign ${moon.sign}, House ${moon.house}, Nakshatra ${moon.nak}`;
  }

  const sav = kundaliData.ashtakavarga?.SAV || [];
  // For daily/weekly/monthly, the primary driver is Moon/Sun and basic SAV.
  // We'll give it the Lagna and basic houses that matter general transit.
  // We will provide the SAV of current moon transiting house (which is moon.house - 1 index)
  if (moon && moon.house && sav.length >= 12) {
      facts += `\nMoon Transiting House (Bhava) SAV Score: ${sav[moon.house - 1]} bindus`;
  }
  
  if (sav.length >= 12) {
    facts += `\nLagna (1st House) SAV Score: ${sav[0]} bindus`;
    facts += `\n10th House (Career) SAV Score: ${sav[9]} bindus`;
    facts += `\n2nd House (Wealth) SAV Score: ${sav[1]} bindus`;
  }

  facts += `\n==========================\n`;
  return facts;
}

export function getPathwayFacts(kundaliData, pathwayId) {
  let facts = `
=== ASTROLOGICAL FACTS FOR THIS PATHWAY ===
Lagna (Ascendant): ${kundaliData.lagna?.rashi || 'Unknown'}
Active Mahadasha: ${kundaliData.dasha?.maha || 'Unknown'}
Active Antardasha: ${kundaliData.dasha?.antar || 'Unknown'}`;

  const sav = kundaliData.ashtakavarga?.SAV || [];

  const getPlanet = (id) => {
    const p = kundaliData.planets?.find(x => x.id === id);
    if (!p) return null;
    return `Sign ${p.sign}, House ${p.house}, Nakshatra ${p.nak}`;
  };

  const d = {
    // 1st House group
    'arogya': { h: [1, 6], p: ['sun', 'mars'] },
    'kirti': { h: [1, 10], p: ['sun', 'jupiter'] },
    
    // 2nd House group
    'dhana': { h: [2, 11], p: ['jupiter', 'venus'] },
    'poshana': { h: [2], p: ['moon', 'jupiter'] },
    'mitratva': { h: [2, 11], p: ['mercury', 'venus'] },

    // 3rd House group
    'bhratru': { h: [3], p: ['mars'] },
    'pratibha': { h: [3, 5], p: ['mercury', 'venus'] },

    // 4th House group
    'sukha': { h: [4], p: ['moon', 'venus'] },
    'bhumi': { h: [4], p: ['mars', 'saturn'] },
    'mata_pita': { h: [4, 9], p: ['moon', 'sun'] },
    'vahana': { h: [4], p: ['venus'] },

    // 5th House group
    'santhana': { h: [5], p: ['jupiter'] },
    'vidya': { h: [5, 9], p: ['jupiter', 'mercury'] },
    
    // 6th House group
    'vyavahara': { h: [6], p: ['mars', 'saturn'] },
    'dinacharya': { h: [6], p: ['mercury', 'sun'] },
    'shrama': { h: [6], p: ['saturn'] },
    'pashu': { h: [6], p: ['saturn', 'ketu'] },
    'vysana': { h: [6, 12], p: ['rahu', 'venus'] },
    'runa': { h: [6], p: ['mars', 'saturn'] },

    // 7th House group
    'vivaha': { h: [7], p: ['venus', 'jupiter'] },

    // 8th House group
    'gupta_dhana': { h: [8, 11], p: ['rahu', 'jupiter'] },
    'tantra': { h: [8], p: ['ketu', 'saturn'] },
    'mrityu': { h: [8, 2, 7], p: ['saturn', 'mars'] },

    // 9th House group
    'dharma': { h: [9], p: ['jupiter', 'sun'] },
    'diksha': { h: [9, 5], p: ['jupiter', 'ketu'] },
    'sanskriti': { h: [9, 2], p: ['jupiter', 'moon'] },
    'danam': { h: [9, 12], p: ['jupiter', 'venus'] },

    // 10th House group
    'vritti': { h: [10], p: ['saturn', 'sun', 'mercury'] },

    // 11th House group
    'sangha': { h: [11], p: ['saturn', 'jupiter'] },

    // 12th House group
    'moksha': { h: [12], p: ['ketu', 'jupiter'] },
    'yatra': { h: [12, 9], p: ['moon', 'rahu'] },
    'swapna': { h: [12], p: ['moon', 'ketu'] },
    'vishrama': { h: [12, 5], p: ['moon', 'venus'] },

    // General mitigations
    'shanti': { h: [9, 1], p: ['jupiter', 'moon'] },
    'pitru': { h: [9, 12], p: ['sun', 'ketu'] },
    'muhurta': { h: [1, 9], p: ['jupiter', 'moon'] },
  };

  const rules = d[pathwayId] || { h: [1, 9, 10], p: ['sun', 'moon', 'jupiter'] };

  if (sav.length >= 12) {
    rules.h.forEach(houseNum => {
      facts += `\nSthana (House ${houseNum}) SAV Score: ${sav[houseNum - 1]} bindus`;
    });
  }

  rules.p.forEach(planetId => {
    const pData = getPlanet(planetId);
    if (pData) {
      facts += `\n${planetId.toUpperCase()} Position: ${pData}`;
    }
  });

  facts += `\n===========================================`;
  return facts;
}
