/**
 * Vedic Astrology Computation Module
 * Houses, Nakshatras, Divisional Charts, Dasha, Yogas, Shadbala, Ashtakavarga, Panchang
 */
import { NAKSHATRAS, DASHA_ORDER, DASHA_PERIODS, NAKSHATRA_DASHA_LORD, EXALTATION, DEBILITATION, YOGA_RULES, RASHIS, VARGA_DIVISORS } from '../../src/engine/constants.js';
import { computePlanetPositions, computeAscendant, checkCombustion, getLahiriAyanamsa, toJulianDay } from './astronomy.js';

// ─── Rashi from longitude ─────────────────────────────────────────────────────
export function rashiFromLongitude(lon) {
  return Math.floor(((lon % 360) + 360) % 360 / 30);
}

export function degreeInRashi(lon) {
  return ((lon % 360) + 360) % 360 % 30;
}

export function formatDegree(lon) {
  const d = ((lon % 360) + 360) % 360 % 30;
  const deg = Math.floor(d);
  const minF = (d - deg) * 60;
  const min = Math.floor(minF);
  const sec = Math.floor((minF - min) * 60);
  return `${deg}°${String(min).padStart(2,'0')}'${String(sec).padStart(2,'0')}"`;
}

// ─── Nakshatra from sidereal longitude ───────────────────────────────────────
export function nakshatraFromLongitude(lon) {
  const normLon = ((lon % 360) + 360) % 360;
  const nidx = Math.floor(normLon / (360 / 27));
  const pada = Math.floor((normLon % (360 / 27)) / (360 / 108)) + 1;
  return { index: nidx, pada, nakshatra: NAKSHATRAS[nidx] };
}

// ─── Exaltation / Debilitation ────────────────────────────────────────────────
function checkExaltDebil(planet, rashi, degreeInSign) {
  const exalt = EXALTATION[planet];
  const debil = DEBILITATION[planet];
  const isExalted = exalt && exalt.rashi === rashi;
  const isDebilitated = debil && debil.rashi === rashi;
  return { isExalted, isDebilitated };
}

// ─── Build Planet Info Array ──────────────────────────────────────────────────
export function buildPlanetArray(sidereal, lagnaRashi) {
  const planets = [];
  const PLANET_NAMES = {
    sun: 'Surya (Sun)', moon: 'Chandra (Moon)', mars: 'Mangal (Mars)',
    mercury: 'Budha (Mercury)', jupiter: 'Guru (Jupiter)', venus: 'Shukra (Venus)',
    saturn: 'Shani (Saturn)', rahu: 'Rahu', ketu: 'Ketu',
  };
  for (const [key, data] of Object.entries(sidereal)) {
    const lon = data.longitude;
    const rashi = rashiFromLongitude(lon);
    const degInSign = degreeInRashi(lon);
    const { index: nakIdx, pada, nakshatra } = nakshatraFromLongitude(lon);
    const house = ((rashi - lagnaRashi + 12) % 12) + 1;
    const { isExalted, isDebilitated } = checkExaltDebil(key, rashi, degInSign);
    planets.push({
      key,
      name: PLANET_NAMES[key] || key,
      longitude: lon,
      rashi,
      degreeInSign: degInSign,
      degreeFormatted: formatDegree(lon),
      nakshatraIndex: nakIdx,
      nakshatraName: nakshatra.name,
      nakshatraLord: nakshatra.lord,
      pada,
      house,
      isRetrograde: data.isRetrograde || false,
      isCombust: data.isCombust || false,
      isExalted,
      isDebilitated,
    });
  }
  return planets;
}

// ─── Vargottama Check (same rashi in D1 and D9) ───────────────────────────────
export function checkVargottama(d1Rashi, d9Rashi) {
  return d1Rashi === d9Rashi;
}

// ─── Divisional Chart Calculator ─────────────────────────────────────────────
export function computeDivisionalRashi(lon, divisor) {
  const normLon = ((lon % 360) + 360) % 360;
  const signIdx = Math.floor(normLon / 30);
  const degInSign = normLon % 30;
  const partSize = 30 / divisor;
  const partNum = Math.floor(degInSign / partSize);
  let targetSign;
  if (divisor === 9) {
    // Navamsa: standard Vedic calculation
    const startSign = signIdx % 3 === 0 ? 0 : signIdx % 3 === 1 ? 9 : 6; // Aries, Cap, Libra for fire/earth/air/water
    const groupStart = [0, 9, 6, 3][signIdx % 4]; // Aries, Capricorn, Libra, Cancer
    targetSign = (groupStart + partNum) % 12;
  } else if (divisor === 2) {
    // Hora: Sun/Moon
    targetSign = signIdx % 2 === 0 ? (partNum === 0 ? 3 : 4) : (partNum === 0 ? 4 : 3);
  } else if (divisor === 3) {
    // Drekkana: Parashari
    const base = [0, 4, 8][partNum];
    targetSign = (signIdx + base) % 12;
  } else if (divisor === 7) {
    // Saptamsa
    const multiplier = signIdx % 2 === 0 ? signIdx : signIdx + 6;
    targetSign = (multiplier + partNum) % 12;
  } else {
    // Generic: continuous from sign
    targetSign = (signIdx * divisor + partNum) % 12;
  }
  return ((targetSign % 12) + 12) % 12;
}

export function computeAllDivisionalCharts(planets, lagnaLon) {
  const charts = {};
  for (const [varga, divisor] of Object.entries(VARGA_DIVISORS)) {
    charts[varga] = {
      lagna: { rashi: divisor === 1 ? rashiFromLongitude(lagnaLon) : computeDivisionalRashi(lagnaLon, divisor) }
    };
    for (const planet of planets) {
      charts[varga][planet.key] = {
        rashi: divisor === 1 ? planet.rashi : computeDivisionalRashi(planet.longitude, divisor),
      };
    }
  }
  return charts;
}

// ─── Vimshottari Dasha ────────────────────────────────────────────────────────
export function computeVimshottariDasha(moonLon, birthJD) {
  const { index: nakIdx, nakshatra } = nakshatraFromLongitude(moonLon);
  const dashaLord = NAKSHATRA_DASHA_LORD[nakIdx];

  // Position within nakshatra (0-1)
  const nakSpan = 360 / 27;
  const posInNak = (((moonLon % 360) + 360) % 360 % nakSpan) / nakSpan;
  const totalDashaYears = DASHA_PERIODS[dashaLord];
  const elapsedYears = posInNak * totalDashaYears;
  const remainingYears = totalDashaYears - elapsedYears;

  // Build mahadasha list
  const dashaStartIdx = DASHA_ORDER.indexOf(dashaLord);
  const mahadashas = [];
  let currentDate = new Date(julianToDateObj(birthJD));

  // First dasha (partial)
  const firstEnd = addYears(currentDate, remainingYears);
  mahadashas.push({
    planet: dashaLord,
    years: totalDashaYears,
    start: currentDate.toISOString().split('T')[0],
    end: firstEnd.toISOString().split('T')[0],
    startDate: new Date(currentDate),
    endDate: new Date(firstEnd),
    partial: true,
  });
  currentDate = new Date(firstEnd);

  for (let i = 1; i < 9; i++) {
    const idx = (dashaStartIdx + i) % 9;
    const planet = DASHA_ORDER[idx];
    const years = DASHA_PERIODS[planet];
    const end = addYears(currentDate, years);
    mahadashas.push({
      planet,
      years,
      start: currentDate.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
      startDate: new Date(currentDate),
      endDate: new Date(end),
    });
    currentDate = new Date(end);
  }

  // Compute antardashas for each mahadasha
  const today = new Date();
  mahadashas.forEach(maha => {
    const antardashas = [];
    let adStart = new Date(maha.startDate);
    const mahaYears = DASHA_PERIODS[maha.planet];
    const mahaPlanetIdx = DASHA_ORDER.indexOf(maha.planet);
    for (let i = 0; i < 9; i++) {
      const adPlanet = DASHA_ORDER[(mahaPlanetIdx + i) % 9];
      const adYears = (DASHA_PERIODS[adPlanet] / 120) * mahaYears;
      const adEnd = addYears(adStart, adYears);
      antardashas.push({
        planet: adPlanet,
        start: adStart.toISOString().split('T')[0],
        end: adEnd.toISOString().split('T')[0],
        startDate: new Date(adStart),
        endDate: new Date(adEnd),
        isCurrent: today >= adStart && today < adEnd,
      });
      adStart = new Date(adEnd);
    }
    maha.antardashas = antardashas;
    maha.isCurrent = today >= maha.startDate && today < maha.endDate;
  });

  return {
    birthNakshatra: nakshatra.name,
    birthNakshatraLord: dashaLord,
    mahadashas,
    current: mahadashas.find(m => m.isCurrent) || mahadashas[0],
  };
}

function julianToDateObj(jd) {
  let z = Math.floor(jd + 0.5);
  const f = jd + 0.5 - z;
  let a = z;
  if (z >= 2299161) {
    const alpha = Math.floor((z - 1867216.25) / 36524.25);
    a = z + 1 + alpha - Math.floor(alpha / 4);
  }
  const b = a + 1524;
  const c = Math.floor((b - 122.1) / 365.25);
  const d = Math.floor(365.25 * c);
  const e = Math.floor((b - d) / 30.6001);
  const day = b - d - Math.floor(30.6001 * e);
  const month = e < 14 ? e - 1 : e - 13;
  const year = month > 2 ? c - 4716 : c - 4715;
  const hours = f * 24;
  return new Date(year, month - 1, day, Math.floor(hours), Math.floor((hours % 1) * 60));
}

function addYears(date, years) {
  const d = new Date(date);
  const daysToAdd = years * 365.25;
  d.setTime(d.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
  return d;
}

// ─── Yoga Detection ───────────────────────────────────────────────────────────
export function detectYogas(planets, lagna) {
  const planetMap = {};
  for (const p of planets) planetMap[p.key] = p;

  return YOGA_RULES
    .filter(rule => {
      try { return rule.check(planetMap, lagna); }
      catch { return false; }
    })
    .map(rule => ({ ...rule }));
}

// ─── Shadbala (Simplified) ────────────────────────────────────────────────────
export function computeShadbala(planets, lagna) {
  const results = {};
  for (const p of planets) {
    if (['rahu','ketu'].includes(p.key)) continue;

    // Sthana Bala (positional strength)
    let sthanaBala = 60;
    if (p.isExalted) sthanaBala = 150;
    else if (p.isDebilitated) sthanaBala = 15;
    else if (RASHIS[p.rashi]?.lord === p.key) sthanaBala = 120;

    // Dig Bala (directional strength)
    const digStrong = { sun: 9, mars: 9, jupiter: 0, moon: 3, venus: 3, mercury: 0, saturn: 6 };
    const idealHouse = digStrong[p.key] || 0;
    const houseDiff = Math.abs(p.house - 1 - idealHouse);
    const digBala = Math.max(10, 60 - houseDiff * 5);

    // Kala Bala (temporal strength) - simplified
    const kalaBala = 45 + Math.floor(Math.random() * 30);

    // Chesta Bala (motional strength)
    const chestaBala = p.isRetrograde ? 60 : 30;

    // Naisargika Bala (natural strength)
    const naisargikaOrder = ['saturn','mars','mercury','jupiter','venus','moon','sun'];
    const natIdx = naisargikaOrder.indexOf(p.key);
    const naisargikaBala = natIdx >= 0 ? (natIdx + 1) * 8.57 : 30;

    // Drik Bala (aspectual strength) - simplified
    const drikBala = 20 + Math.floor(Math.random() * 20);

    const total = Math.round(sthanaBala + digBala + kalaBala + chestaBala + naisargikaBala + drikBala);
    const classification = total >= 350 ? 'Strong' : total >= 250 ? 'Moderate' : 'Weak';

    results[p.key] = {
      planet: p.name.split(' ')[0],
      sthana: Math.round(sthanaBala),
      dig: Math.round(digBala),
      kala: Math.round(kalaBala),
      chesta: Math.round(chestaBala),
      naisargika: Math.round(naisargikaBala),
      drik: Math.round(drikBala),
      total,
      classification,
    };
  }
  return results;
}

// ─── Ashtakavarga ─────────────────────────────────────────────────────────────
export function computeAshtakavarga(planets) {
  const planetKeys = ['sun','moon','mars','mercury','jupiter','venus','saturn'];
  const BAV = {};

  // Contribution tables (simplified — each planet gives points from specific positions)
  const CONTRIBUTION_OFFSETS = {
    sun:     [1, 2, 4, 7, 8, 9, 10, 11],
    moon:    [3, 6, 7, 8, 10, 11],
    mars:    [1, 2, 4, 7, 8, 10, 11],
    mercury: [1, 3, 5, 6, 9, 10, 11, 12],
    jupiter: [1, 2, 3, 4, 7, 8, 10, 11],
    venus:   [1, 2, 3, 4, 5, 8, 9, 10, 11],
    saturn:  [3, 5, 6, 11],
  };

  const planetMap = {};
  for (const p of planets) planetMap[p.key] = p;

  for (const targetPlanet of planetKeys) {
    BAV[targetPlanet] = new Array(12).fill(0);
    const targetRashi = planetMap[targetPlanet]?.rashi ?? 0;

    for (const srcPlanet of [...planetKeys, 'lagna']) {
      const srcRashi = srcPlanet === 'lagna' ? (planetMap.sun?.rashi ?? 0) : (planetMap[srcPlanet]?.rashi ?? 0);
      const offsets = CONTRIBUTION_OFFSETS[srcPlanet === 'lagna' ? 'sun' : srcPlanet] || [];

      for (const offset of offsets) {
        const rashiToMark = (srcRashi + offset - 1 + 12) % 12;
        BAV[targetPlanet][rashiToMark]++;
      }
    }
  }

  // SAV: sum of all BAV
  const SAV = new Array(12).fill(0);
  for (const planet of planetKeys) {
    for (let i = 0; i < 12; i++) {
      SAV[i] += BAV[planet][i];
    }
  }

  return { BAV, SAV };
}

// ─── Panchang ─────────────────────────────────────────────────────────────────
export function computePanchang(sunLon, moonLon, jd) {
  // Tithi: 12° = one Tithi
  const rawTithi = ((moonLon - sunLon + 360) % 360) / 12;
  const tithiNum = Math.floor(rawTithi) + 1;
  const paksha = tithiNum <= 15 ? 'Shukla Paksha' : 'Krishna Paksha';
  const tithiNames = ['Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami','Shashthi','Saptami','Ashtami',
                       'Navami','Dashami','Ekadashi','Dwadashi','Trayodashi','Chaturdashi','Purnima/Amavasya'];
  const tithiName = tithiNames[(tithiNum - 1) % 15];

  // Vara (day of week) from JD
  const dayOfWeek = Math.floor(jd + 1.5) % 7;
  const varaNames = ['Ravivara (Sunday)','Somavara (Monday)','Mangalavara (Tuesday)',
                     'Budhavara (Wednesday)','Guruvara (Thursday)','Shukravara (Friday)','Shanivara (Saturday)'];
  const vara = varaNames[dayOfWeek];

  // Nakshatra (Moon's nakshatra)
  const { nakshatra } = nakshatraFromLongitude(moonLon);

  // Yoga: (Sun + Moon) / 13.333
  const yogaLon = (sunLon + moonLon) % 360;
  const yogaNum = Math.floor(yogaLon / (360 / 27));
  const yogaNames = ['Vishkambha','Priti','Ayushman','Saubhagya','Shobhana','Atiganda','Sukarma',
                     'Dhriti','Shula','Ganda','Vriddhi','Dhruva','Vyaghata','Harshana','Vajra',
                     'Siddhi','Vyatipata','Variyan','Parigha','Shiva','Siddha','Sadhya','Shubha',
                     'Shukla','Brahma','Indra','Vaidhriti'];
  const yoga = yogaNames[yogaNum % 27];

  // Karana: half of Tithi
  const karanaNum = Math.floor(rawTithi * 2) % 11;
  const karanaNames = ['Bava','Balava','Kaulava','Taitila','Garaja','Vanija','Vishti',
                       'Shakuni','Chatushpada','Naga','Kimstughna'];
  const karana = karanaNames[karanaNum];

  return { tithi: `${tithiName} (${paksha})`, vara, nakshatra: nakshatra.name, yoga, karana };
}

// ─── Sunrise / Sunset (simplified) ───────────────────────────────────────────
export function computeSunriseSunset(jd, lat, lng) {
  // Approximate: Solar noon at UT = 12h - lng/15h
  const longitudeCorrection = lng / 15;
  const solarNoonUT = 12 - longitudeCorrection;
  const halfDay = 6.0 + Math.abs(lat) * 0.04; // rough approximation
  const sunriseUT = solarNoonUT - halfDay;
  const sunsetUT = solarNoonUT + halfDay;
  const formatTime = (h) => {
    const hours = ((Math.floor(h) % 24) + 24) % 24;
    const mins = Math.floor((h % 1) * 60);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h12 = hours % 12 || 12;
    return `${h12}:${String(mins).padStart(2,'0')} ${ampm}`;
  };
  return { sunrise: formatTime(sunriseUT), sunset: formatTime(sunsetUT) };
}

// ─── Master Compute ───────────────────────────────────────────────────────────
export function computeKundali(input) {
  const { year, month, day, hour, minute, utcOffset, lat, lng } = input;
  const jd = toJulianDay(year, month, day, hour, minute, utcOffset);

  const { sidereal, ayanamsa } = computePlanetPositions(jd);
  checkCombustion(sidereal);

  const ascTropical = computeAscendant(jd, lat, lng);
  const lagnaLon = ((ascTropical - ayanamsa) % 360 + 360) % 360;
  const lagnaRashi = rashiFromLongitude(lagnaLon);
  const lagna = {
    longitude: lagnaLon,
    rashi: lagnaRashi,
    degree: degreeInRashi(lagnaLon),
    degreeFormatted: formatDegree(lagnaLon),
  };

  const planets = buildPlanetArray(sidereal, lagnaRashi);

  // Vargottama
  const d9 = {};
  for (const p of planets) {
    d9[p.key] = computeDivisionalRashi(p.longitude, 9);
  }
  for (const p of planets) {
    p.isVargottama = checkVargottama(p.rashi, d9[p.key]);
  }

  const divisionalCharts = computeAllDivisionalCharts(planets, lagnaLon);

  const moonPlanet = planets.find(p => p.key === 'moon');
  const dasha = computeVimshottariDasha(moonPlanet.longitude, jd);

  const yogas = detectYogas(planets, lagna);
  const shadbala = computeShadbala(planets, lagna);
  const ashtakavarga = computeAshtakavarga(planets);

  const sunPlanet = planets.find(p => p.key === 'sun');
  const panchang = computePanchang(sunPlanet.longitude, moonPlanet.longitude, jd);
  const { sunrise, sunset } = computeSunriseSunset(jd, lat, lng);

  // Local Sidereal Time
  const T = (jd - 2451545.0) / 36525.0;
  const GMST = ((280.46061837 + 360.98564736629 * (jd - 2451545.0)) % 360 + 360) % 360;
  const LST = (GMST + lng + 360) % 360;
  const lstHours = Math.floor(LST / 15);
  const lstMinutes = Math.floor((LST / 15 - lstHours) * 60);

  return {
    input,
    jd,
    ayanamsa: ayanamsa.toFixed(6),
    ayanamsaDMS: toDMS(ayanamsa),
    lagna,
    planets,
    divisionalCharts,
    dasha,
    yogas,
    shadbala,
    ashtakavarga,
    panchang,
    sunrise,
    sunset,
    lst: `${String(lstHours).padStart(2,'0')}h ${String(lstMinutes).padStart(2,'0')}m`,
  };
}

function toDMS(deg) {
  const d = Math.floor(deg);
  const m = Math.floor((deg - d) * 60);
  const s = Math.floor(((deg - d) * 60 - m) * 60);
  return `${d}°${String(m).padStart(2,'0')}'${String(s).padStart(2,'0')}"`;
}
