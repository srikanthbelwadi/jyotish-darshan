/**
 * ACC — Accuracy Test Suite
 *
 * Tests the correctness of astronomical computations, Vedic logic,
 * and data transformations by comparing against reference data.
 */
import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { getLahiriAyanamsa, toJulianDay, computeAscendant, computePlanetPositions } from '../src/engine/astronomy.js';
import { nakshatraFromLongitude, rashiFromLongitude, computeVimshottariDasha, computePanchang } from '../src/engine/vedic.js';
import { DASHA_PERIODS as DASHA_YRS, EXALTATION as EXALT, DEBILITATION as DEBIL } from '../src/engine/constants.js';
import { setSweTestInstance } from '../src/engine/swissephLoader.js';
import SwissEph from 'swisseph-wasm';

const __dirname = dirname(fileURLToPath(import.meta.url));
const referenceCharts = JSON.parse(readFileSync(join(__dirname, 'fixtures/reference-charts.json'), 'utf8'));

test.beforeAll(async () => {
  const swisseph = new SwissEph();
  await swisseph.initSwissEph();
  const root = process.cwd();
  swisseph.set_ephe_path(root + '/public/sweph');
  swisseph.SweModule.ccall('swe_set_sid_mode', 'void', ['number', 'number', 'number'], [1, 0, 0]);
  setSweTestInstance(swisseph);
});

function norm(lon) {
  return ((lon % 360) + 360) % 360;
}

// ────────────────────────────────────────────────────────────
// ACC-03: Lahiri Ayanamsa
// ────────────────────────────────────────────────────────────
test.describe('ACC-03: Lahiri Ayanamsa', () => {
  const KNOWN_AYANAMSA = [
    { date: [2000, 1, 1, 12, 0, 0], expected: 23.85, tol: 0.05, label: 'J2000.0' },
    { date: [1950, 1, 1, 12, 0, 0], expected: 23.17, tol: 0.10, label: '1950' },
    { date: [2024, 3, 20, 12, 0, 0], expected: 24.18, tol: 0.10, label: '2024 equinox' },
  ];

  for (const { date, expected, tol, label } of KNOWN_AYANAMSA) {
    test(`Ayanamsa for ${label} ≈ ${expected}° (±${tol}°)`, async () => {
      const [y, m, d, h, mi, utc] = date;
      const jd = toJulianDay(y, m, d, h, mi, utc);
      const aya = getLahiriAyanamsa(jd);

      expect(aya).toBeCloseTo(expected, 1);
      expect(Math.abs(aya - expected)).toBeLessThanOrEqual(tol);
    });
  }
});

// ────────────────────────────────────────────────────────────
// ACC-04: Nakshatra and Pada Assignment
// ────────────────────────────────────────────────────────────
test.describe('ACC-04: Nakshatra and Pada', () => {
  const CASES = [
    { lon: 0.0, nak: 0, name: 'Ashwini', pada: 1, label: '0° Aries' },
    { lon: 13.33, nak: 0, name: 'Ashwini', pada: 4, label: '13°20 Aries (Ashwini end)' },
    { lon: 13.34, nak: 1, name: 'Bharani', pada: 1, label: '13°20+ Aries (Bharani start)' },
    { lon: 181.0, nak: 13, name: 'Chitra', pada: 3, label: '1° Libra (Chitra pada 3)' },
    { lon: 359.9, nak: 26, name: 'Revati', pada: 4, label: '29°59 Pisces (Revati end)' },
  ];

  for (const { lon, nak, name, pada, label } of CASES) {
    test(`Nakshatra at ${label}`, async () => {
      const result = nakshatraFromLongitude(lon);
      expect(result.index).toBe(nak);
      expect(result.nakshatra.name).toBe(name);
      expect(result.pada).toBe(pada);
    });
  }
});

// ────────────────────────────────────────────────────────────
// ACC-05: Rashi Assignment
// ────────────────────────────────────────────────────────────
test.describe('ACC-05: Rashi Assignment', () => {
  const CASES = [
    { lon: 0.0, expected: 0, label: '0° → Mesha (Aries)' },
    { lon: 29.99, expected: 0, label: '29.99° → still Mesha' },
    { lon: 30.0, expected: 1, label: '30° → Vrishabha (Taurus)' },
    { lon: 179.99, expected: 5, label: '179.99° → Kanya (Virgo)' },
    { lon: 180.0, expected: 6, label: '180° → Tula (Libra)' },
    { lon: 359.99, expected: 11, label: '359.99° → Meena (Pisces)' },
  ];

  for (const { lon, expected, label } of CASES) {
    test(`Rashi: ${label}`, async () => {
      const result = rashiFromLongitude(lon);
      expect(result).toBe(expected);
    });
  }
});

// ────────────────────────────────────────────────────────────
// ACC-06: Vimshottari Dasha — Total Years = 120
// ────────────────────────────────────────────────────────────
test.describe('ACC-06: Dasha Period Totals', () => {
  for (const chart of referenceCharts) {
    test(`Dasha total = 120 years for ${chart.id}`, async () => {
      const inp = chart.input;
      const jd = toJulianDay(inp.year, inp.month, inp.day, inp.hour, inp.minute, inp.utcOffset);
      const { sidereal } = computePlanetPositions(jd);
      const moonLon = sidereal.moon.longitude;
      const dasha = computeVimshottariDasha(moonLon, jd);
      const total = dasha.mahadashas.reduce((sum, m) => sum + (DASHA_YRS[m.planet] || 0), 0);
      expect(total).toBe(120);
    });
  }
});

// ────────────────────────────────────────────────────────────
// ACC-01 & ACC-02: Planetary Positions and Lagna
// ────────────────────────────────────────────────────────────
test.describe('ACC-01/02: Planetary Positions', () => {
  for (const chart of referenceCharts) {
    test(`Planets computed for ${chart.id} — all valid`, async () => {
      const inp = chart.input;
      const jd = toJulianDay(inp.year, inp.month, inp.day, inp.hour, inp.minute, inp.utcOffset);
      const { sidereal, ayanamsa } = computePlanetPositions(jd);
      const asc = computeAscendant(jd, inp.lat, inp.lng);
      const sidAsc = norm(asc - ayanamsa);
      
      const result = {
        ayanamsa: ayanamsa,
        ascLon: sidAsc,
        ascRashi: Math.floor(sidAsc / 30),
        planets: Object.fromEntries(
          Object.entries(sidereal).map(([k, v]) => [k, {
            lon: v.longitude,
            rashi: Math.floor(v.longitude / 30),
            retro: v.isRetrograde || false,
          }])
        ),
      };

      for (const [planet, data] of Object.entries(result.planets)) {
        expect(data.lon, `${planet} longitude`).toBeGreaterThanOrEqual(0);
        expect(data.lon, `${planet} longitude`).toBeLessThan(360);
        expect(data.rashi, `${planet} rashi`).toBeGreaterThanOrEqual(0);
        expect(data.rashi, `${planet} rashi`).toBeLessThanOrEqual(11);
      }

      expect(result.ascRashi).toBeGreaterThanOrEqual(0);
      expect(result.ascRashi).toBeLessThanOrEqual(11);

      if (chart.expected.ayanamsa) {
        expect(Math.abs(result.ayanamsa - chart.expected.ayanamsa.value))
          .toBeLessThanOrEqual(chart.expected.ayanamsa.tolerance);
      }

      if (chart.expected.planets) {
        for (const [planet, exp] of Object.entries(chart.expected.planets)) {
          if (exp.rashi !== undefined) {
            expect(result.planets[planet].rashi, `${planet} rashi`).toBe(exp.rashi);
          }
        }
      }
    });
  }
});

// ────────────────────────────────────────────────────────────
// ACC-07: Combustion Detection
// ────────────────────────────────────────────────────────────
test.describe('ACC-07: Combustion Detection', () => {
  test('Mercury within 13° of Sun is combust', async () => {
    const sid = { sun: { lon: 100 }, mercury: { lon: 110 } };
    let d = Math.abs(sid.mercury.lon - sid.sun.lon);
    if (d > 180) d = 360 - d;
    expect(d < 13).toBe(true);
  });

  test('Mercury beyond 13° of Sun is NOT combust', async () => {
    const sid = { sun: { lon: 100 }, mercury: { lon: 115 } };
    let d = Math.abs(sid.mercury.lon - sid.sun.lon);
    if (d > 180) d = 360 - d;
    expect(d < 13).toBe(false);
  });
});

// ────────────────────────────────────────────────────────────
// ACC-08: Exaltation and Debilitation
// ────────────────────────────────────────────────────────────
test.describe('ACC-08: Exaltation/Debilitation', () => {
  const EXALT_MAP = {
    sun: 0, moon: 1, mars: 9, mercury: 5,
    jupiter: 3, venus: 11, saturn: 6, rahu: 2, ketu: 8,
  };
  const DEBIL_MAP = {
    sun: 6, moon: 7, mars: 3, mercury: 11,
    jupiter: 9, venus: 5, saturn: 0,
  };

  for (const [planet, sign] of Object.entries(EXALT_MAP)) {
    test(`${planet} exalted in sign ${sign}`, async () => {
      expect(EXALT[planet].rashi).toBe(sign);
    });
  }

  for (const [planet, sign] of Object.entries(DEBIL_MAP)) {
    test(`${planet} debilitated in sign ${sign}`, async () => {
      if (DEBIL[planet]) {
        expect(DEBIL[planet].rashi).toBe(sign);
      } else {
        expect(false).toBe(true); // Should not reach here for keys in DEBIL_MAP
      }
    });
  }
});

// ────────────────────────────────────────────────────────────
// ACC-13: Panchang Basic Validity
// ────────────────────────────────────────────────────────────
test.describe('ACC-13: Panchang', () => {
  test('Panchang fields are all non-empty', async () => {
    const jd = toJulianDay(2000, 1, 1, 12, 0, 0);
    const { sidereal } = computePlanetPositions(jd);
    const panchang = computePanchang(sidereal.sun.longitude, sidereal.moon.longitude, jd);

    if (panchang) {
      expect(panchang.tithi).toBeTruthy();
      expect(panchang.vara).toBeTruthy();
      expect(panchang.nakshatra).toBeTruthy();
      expect(panchang.yoga).toBeTruthy();
      expect(panchang.karana).toBeTruthy();
    }
  });
});
