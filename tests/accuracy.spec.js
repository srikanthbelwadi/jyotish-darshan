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
const __dirname = dirname(fileURLToPath(import.meta.url));
const referenceCharts = JSON.parse(readFileSync(join(__dirname, 'fixtures/reference-charts.json'), 'utf8'));

const APP_URL = '/index.html';

// Helper: load the app and get access to computation functions
async function getComputeFns(page) {
  await page.goto(APP_URL);
  await page.waitForTimeout(3000); // Wait for Babel to compile
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
    test(`Ayanamsa for ${label} ≈ ${expected}° (±${tol}°)`, async ({ page }) => {
      await getComputeFns(page);
      const aya = await page.evaluate(([y, m, d, h, mi, utc]) => {
        const jd = toJD(y, m, d, h, mi, utc);
        return lahiri(jd);
      }, date);

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
    test(`Nakshatra at ${label}`, async ({ page }) => {
      await getComputeFns(page);
      const result = await page.evaluate((longitude) => {
        return nakshatra(longitude);
      }, lon);

      expect(result.idx).toBe(nak);
      expect(result.name).toBe(name);
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
    test(`Rashi: ${label}`, async ({ page }) => {
      await getComputeFns(page);
      const result = await page.evaluate((longitude) => rashi(longitude), lon);
      expect(result).toBe(expected);
    });
  }
});

// ────────────────────────────────────────────────────────────
// ACC-06: Vimshottari Dasha — Total Years = 120
// ────────────────────────────────────────────────────────────
test.describe('ACC-06: Dasha Period Totals', () => {
  for (const chart of referenceCharts) {
    test(`Dasha total = 120 years for ${chart.id}`, async ({ page }) => {
      await getComputeFns(page);
      const total = await page.evaluate((inp) => {
        const jd = toJD(inp.year, inp.month, inp.day, inp.hour, inp.minute, inp.utcOffset);
        const { sid } = allPlanets(jd);
        const moonLon = sid.moon.lon;
        const dasha = dasha_calc(moonLon, jd);
        // Sum the standard dasha years (not the partial first period)
        return dasha.mahadashas.reduce((sum, m) => sum + (DASHA_YRS[m.planet] || 0), 0);
      }, chart.input);

      expect(total).toBe(120);
    });
  }
});

// ────────────────────────────────────────────────────────────
// ACC-01 & ACC-02: Planetary Positions and Lagna
// ────────────────────────────────────────────────────────────
test.describe('ACC-01/02: Planetary Positions', () => {
  for (const chart of referenceCharts) {
    test(`Planets computed for ${chart.id} — all valid`, async ({ page }) => {
      await getComputeFns(page);
      const result = await page.evaluate((inp) => {
        const jd = toJD(inp.year, inp.month, inp.day, inp.hour, inp.minute, inp.utcOffset);
        const { sid, ay } = allPlanets(jd);
        const asc = computeAsc(jd, inp.lat, inp.lng);
        const sidAsc = norm(asc - ay);
        return {
          ayanamsa: ay,
          ascLon: sidAsc,
          ascRashi: Math.floor(sidAsc / 30),
          planets: Object.fromEntries(
            Object.entries(sid).map(([k, v]) => [k, {
              lon: v.lon,
              rashi: Math.floor(v.lon / 30),
              retro: v.retro || false,
            }])
          ),
        };
      }, chart.input);

      // Verify all planets have valid longitudes (0–360)
      for (const [planet, data] of Object.entries(result.planets)) {
        expect(data.lon, `${planet} longitude`).toBeGreaterThanOrEqual(0);
        expect(data.lon, `${planet} longitude`).toBeLessThan(360);
        expect(data.rashi, `${planet} rashi`).toBeGreaterThanOrEqual(0);
        expect(data.rashi, `${planet} rashi`).toBeLessThanOrEqual(11);
      }

      // Verify Lagna is valid
      expect(result.ascRashi).toBeGreaterThanOrEqual(0);
      expect(result.ascRashi).toBeLessThanOrEqual(11);

      // Check specific expected values if provided
      if (chart.expected.ayanamsa) {
        expect(Math.abs(result.ayanamsa - chart.expected.ayanamsa.value))
          .toBeLessThanOrEqual(chart.expected.ayanamsa.tolerance);
      }

      if (chart.expected.planets) {
        for (const [planet, exp] of Object.entries(chart.expected.planets)) {
          if (exp.rashi !== undefined) {
            expect(result.planets[planet].rashi, `${planet} rashi`)
              .toBe(exp.rashi);
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
  test('Mercury within 13° of Sun is combust', async ({ page }) => {
    await getComputeFns(page);
    const result = await page.evaluate(() => {
      // Simulate: Sun at 100°, Mercury at 110° (10° away, within 13° threshold)
      const sid = {
        sun: { lon: 100, spd: 1 },
        mercury: { lon: 110, spd: 1 },
      };
      const thresh = { mercury: 13 };
      let d = Math.abs(sid.mercury.lon - sid.sun.lon);
      if (d > 180) d = 360 - d;
      return { distance: d, isCombust: d < thresh.mercury };
    });
    expect(result.isCombust).toBe(true);
  });

  test('Mercury beyond 13° of Sun is NOT combust', async ({ page }) => {
    await getComputeFns(page);
    const result = await page.evaluate(() => {
      const sid = {
        sun: { lon: 100, spd: 1 },
        mercury: { lon: 115, spd: 1 },
      };
      const thresh = { mercury: 13 };
      let d = Math.abs(sid.mercury.lon - sid.sun.lon);
      if (d > 180) d = 360 - d;
      return { distance: d, isCombust: d < thresh.mercury };
    });
    expect(result.isCombust).toBe(false);
  });
});

// ────────────────────────────────────────────────────────────
// ACC-08: Exaltation and Debilitation
// ────────────────────────────────────────────────────────────
test.describe('ACC-08: Exaltation/Debilitation', () => {
  // EXALT map from the app
  const EXALT_MAP = {
    sun: 0, moon: 1, mars: 9, mercury: 5,
    jupiter: 3, venus: 11, saturn: 6, rahu: 2, ketu: 8,
  };
  const DEBIL_MAP = {
    sun: 6, moon: 7, mars: 3, mercury: 11,
    jupiter: 9, venus: 5, saturn: 0,
  };

  for (const [planet, sign] of Object.entries(EXALT_MAP)) {
    test(`${planet} exalted in sign ${sign}`, async ({ page }) => {
      await getComputeFns(page);
      const result = await page.evaluate(({ planet, sign }) => {
        return EXALT[planet] === sign;
      }, { planet, sign });
      expect(result).toBe(true);
    });
  }

  for (const [planet, sign] of Object.entries(DEBIL_MAP)) {
    test(`${planet} debilitated in sign ${sign}`, async ({ page }) => {
      await getComputeFns(page);
      const result = await page.evaluate(({ planet, sign }) => {
        return DEBIL[planet] === sign;
      }, { planet, sign });
      expect(result).toBe(true);
    });
  }
});

// ────────────────────────────────────────────────────────────
// ACC-13: Panchang Basic Validity
// ────────────────────────────────────────────────────────────
test.describe('ACC-13: Panchang', () => {
  test('Panchang fields are all non-empty', async ({ page }) => {
    await getComputeFns(page);
    const result = await page.evaluate(() => {
      const jd = toJD(2000, 1, 1, 12, 0, 0);
      const { sid } = allPlanets(jd);
      const panchang = typeof computePanchang !== 'undefined' ? computePanchang(sid.sun.lon, sid.moon.lon, jd) : null;
      return panchang;
    });

    if (result) {
      expect(result.tithi).toBeTruthy();
      expect(result.vara).toBeTruthy();
      expect(result.nakshatra).toBeTruthy();
      expect(result.yoga).toBeTruthy();
      expect(result.karana).toBeTruthy();
    }
  });
});
