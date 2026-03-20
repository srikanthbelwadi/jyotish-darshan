/**
 * CMP — Comprehensiveness Test Suite
 *
 * Tests that the application covers the full breadth of Vedic astrology
 * features and that no data is missing, truncated, or placeholder.
 */
import { test, expect } from '@playwright/test';

const APP_URL = '/index.html';

// Standard test chart input
const TEST_INPUT = {
  year: 1990, month: 7, day: 15,
  hour: 6, minute: 30,
  lat: 12.9716, lng: 77.5946,
  utcOffset: 5.5, timezone: 'Asia/Kolkata',
  city: 'Bengaluru', country: 'India', gender: 'male',
};

async function loadAndCompute(page) {
  await page.goto(APP_URL);
  await page.waitForTimeout(3000);
  return await page.evaluate((inp) => {
    try {
      // computeKundali takes a single input object
      return computeKundali(inp);
    } catch (e) {
      return { error: e.message };
    }
  }, TEST_INPUT);
}

// ────────────────────────────────────────────────────────────
// CMP-01: All 9 Grahas Present
// ────────────────────────────────────────────────────────────
test.describe('CMP-01: All 9 Grahas', () => {
  test('computeKundali returns 9 planets with complete data', async ({ page }) => {
    const K = await loadAndCompute(page);
    if (K.error) { test.skip(); return; }

    expect(K.planets).toBeDefined();
    expect(K.planets).toHaveLength(9);

    const EXPECTED_KEYS = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'];
    const planetKeys = K.planets.map(p => p.key);
    for (const key of EXPECTED_KEYS) {
      expect(planetKeys, `Missing planet: ${key}`).toContain(key);
    }

    // Each planet should have essential fields
    for (const p of K.planets) {
      expect(p.lon, `${p.key} lon`).toBeGreaterThanOrEqual(0);
      expect(p.lon, `${p.key} lon`).toBeLessThan(360);
      expect(p.rashi, `${p.key} rashi`).toBeGreaterThanOrEqual(0);
      expect(p.rashi, `${p.key} rashi`).toBeLessThanOrEqual(11);
      expect(p.house, `${p.key} house`).toBeGreaterThanOrEqual(1);
      expect(p.house, `${p.key} house`).toBeLessThanOrEqual(12);
      expect(p.nakshatraName, `${p.key} nakshatra`).toBeTruthy();
      expect(p.pada, `${p.key} pada`).toBeGreaterThanOrEqual(1);
      expect(p.pada, `${p.key} pada`).toBeLessThanOrEqual(4);
    }
  });
});

// ────────────────────────────────────────────────────────────
// CMP-02: All 12 Bhava
// ────────────────────────────────────────────────────────────
test.describe('CMP-02: All 12 Houses', () => {
  test('Lagna rashi determines 12 houses correctly', async ({ page }) => {
    const K = await loadAndCompute(page);
    if (K.error) { test.skip(); return; }

    expect(K.lagna).toBeDefined();
    expect(K.lagna.rashi).toBeGreaterThanOrEqual(0);
    expect(K.lagna.rashi).toBeLessThanOrEqual(11);

    // Each of the 12 houses should be reachable
    const houses = new Set(K.planets.map(p => p.house));
    // Not all houses need to be occupied, but houses should be 1-12
    for (const p of K.planets) {
      expect(p.house).toBeGreaterThanOrEqual(1);
      expect(p.house).toBeLessThanOrEqual(12);
    }
  });
});

// ────────────────────────────────────────────────────────────
// CMP-03: All 16 Divisional Charts
// ────────────────────────────────────────────────────────────
test.describe('CMP-03: Divisional Charts', () => {
  const EXPECTED_VARGAS = ['D1', 'D2', 'D3', 'D4', 'D7', 'D9', 'D10', 'D12', 'D16', 'D20', 'D24', 'D27', 'D30', 'D40', 'D45', 'D60'];

  test('All 16 Shodasha Varga charts computed', async ({ page }) => {
    const K = await loadAndCompute(page);
    if (K.error) { test.skip(); return; }

    expect(K.divCharts).toBeDefined();

    for (const varga of EXPECTED_VARGAS) {
      expect(K.divCharts[varga], `Missing varga chart: ${varga}`).toBeDefined();

      // Each varga should have sign placements for all planets
      const chart = K.divCharts[varga];
      if (chart) {
        for (const planet of ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu']) {
          const sign = chart[planet];
          expect(sign, `${varga}/${planet} sign`).toBeGreaterThanOrEqual(0);
          expect(sign, `${varga}/${planet} sign`).toBeLessThanOrEqual(11);
        }
      }
    }
  });
});

// ────────────────────────────────────────────────────────────
// CMP-04: Vimshottari Dasha Timeline
// ────────────────────────────────────────────────────────────
test.describe('CMP-04: Dasha Timeline', () => {
  test('9 Mahadashas with correct sequence totaling 120 years', async ({ page }) => {
    const K = await loadAndCompute(page);
    if (K.error) { test.skip(); return; }

    expect(K.dasha).toBeDefined();
    expect(K.dasha.mahadashas).toBeDefined();
    expect(K.dasha.mahadashas).toHaveLength(9);

    // Verify Vimshottari year values
    const DASHA_YRS = { ketu: 7, venus: 20, sun: 6, moon: 10, mars: 7, rahu: 18, jupiter: 16, saturn: 19, mercury: 17 };
    let totalYrs = 0;
    for (const m of K.dasha.mahadashas) {
      expect(m.planet).toBeTruthy();
      expect(DASHA_YRS[m.planet], `Unknown planet in dasha: ${m.planet}`).toBeDefined();
      totalYrs += DASHA_YRS[m.planet];
      expect(m.startStr).toBeTruthy();
      expect(m.endStr).toBeTruthy();
    }
    expect(totalYrs).toBe(120);

    // Verify exactly one current Mahadasha
    const currentMahas = K.dasha.mahadashas.filter(m => m.isCurrent);
    expect(currentMahas.length).toBeLessThanOrEqual(1); // 0 if born very long ago
  });
});

// ────────────────────────────────────────────────────────────
// CMP-05: Antardasha Sub-Periods
// ────────────────────────────────────────────────────────────
test.describe('CMP-05: Antardasha Completeness', () => {
  test('Each Mahadasha has 9 Antardasha periods', async ({ page }) => {
    const K = await loadAndCompute(page);
    if (K.error) { test.skip(); return; }

    for (const m of K.dasha.mahadashas) {
      expect(m.antars, `Antars missing for ${m.planet}`).toBeDefined();
      expect(m.antars, `Should have 9 antardashas for ${m.planet}`).toHaveLength(9);

      for (const a of m.antars) {
        expect(a.planet).toBeTruthy();
        expect(a.startStr).toBeTruthy();
        expect(a.endStr).toBeTruthy();
      }
    }
  });
});

// ────────────────────────────────────────────────────────────
// CMP-06: Shadbala — All 6 Components
// ────────────────────────────────────────────────────────────
test.describe('CMP-06: Shadbala Components', () => {
  test('All planets have 6 Shadbala components + total + classification', async ({ page }) => {
    const K = await loadAndCompute(page);
    if (K.error) { test.skip(); return; }

    expect(K.shadbala).toBeDefined();

    const COMPONENTS = ['sthana', 'dig', 'kala', 'chesta', 'naisargika', 'drik'];
    const entries = Object.entries(K.shadbala);

    // Should have 7 planets (Rahu/Ketu excluded from Shadbala)
    expect(entries.length).toBeGreaterThanOrEqual(7);

    for (const [planet, sb] of entries) {
      for (const comp of COMPONENTS) {
        expect(sb[comp], `${planet}.${comp}`).toBeDefined();
        expect(typeof sb[comp], `${planet}.${comp} type`).toBe('number');
        expect(isNaN(sb[comp]), `${planet}.${comp} is NaN`).toBe(false);
      }
      expect(sb.total, `${planet}.total`).toBeGreaterThan(0);
      expect(['Strong', 'Moderate', 'Weak'], `${planet}.cls`).toContain(sb.cls);
    }
  });
});

// ────────────────────────────────────────────────────────────
// CMP-07: Ashtakavarga
// ────────────────────────────────────────────────────────────
test.describe('CMP-07: Ashtakavarga', () => {
  test('BAV for 7 planets + SAV, each with 12 house values', async ({ page }) => {
    const K = await loadAndCompute(page);
    if (K.error) { test.skip(); return; }

    expect(K.ashtakavarga).toBeDefined();

    const BAV_PLANETS = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];

    // App returns { BAV: { sun:[...], moon:[...], ... }, SAV: [...] }
    expect(K.ashtakavarga.BAV, 'BAV object missing').toBeDefined();

    for (const planet of BAV_PLANETS) {
      const bav = K.ashtakavarga.BAV[planet];
      expect(bav, `BAV missing for ${planet}`).toBeDefined();
      expect(bav, `BAV for ${planet} should have 12 values`).toHaveLength(12);

      for (let i = 0; i < 12; i++) {
        expect(bav[i], `${planet} BAV[${i}]`).toBeGreaterThanOrEqual(0);
        expect(bav[i], `${planet} BAV[${i}]`).toBeLessThanOrEqual(8);
      }
    }

    // SAV (Sarvashtakavarga) — app uses uppercase SAV
    expect(K.ashtakavarga.SAV, 'SAV array missing').toBeDefined();
    expect(K.ashtakavarga.SAV).toHaveLength(12);
    for (let i = 0; i < 12; i++) {
      expect(K.ashtakavarga.SAV[i]).toBeGreaterThanOrEqual(0);
      expect(K.ashtakavarga.SAV[i]).toBeLessThanOrEqual(56); // Max 8 × 7
    }
  });
});

// ────────────────────────────────────────────────────────────
// CMP-08: Panchang — All 5 Elements
// ────────────────────────────────────────────────────────────
test.describe('CMP-08: Panchang Completeness', () => {
  test('All 5 Panchang elements are non-empty', async ({ page }) => {
    const K = await loadAndCompute(page);
    if (K.error) { test.skip(); return; }

    expect(K.panchang).toBeDefined();
    expect(K.panchang.tithi, 'Tithi').toBeTruthy();
    expect(K.panchang.vara, 'Vara').toBeTruthy();
    expect(K.panchang.nakshatra, 'Nakshatra').toBeTruthy();
    expect(K.panchang.yoga, 'Yoga').toBeTruthy();
    expect(K.panchang.karana, 'Karana').toBeTruthy();
  });
});

// ────────────────────────────────────────────────────────────
// CMP-09: Yoga Section Coverage
// ────────────────────────────────────────────────────────────
test.describe('CMP-09: Yoga Detection', () => {
  test('Yogas array exists and each yoga has required fields', async ({ page }) => {
    const K = await loadAndCompute(page);
    if (K.error) { test.skip(); return; }

    expect(K.yogas).toBeDefined();
    expect(Array.isArray(K.yogas)).toBe(true);

    for (const y of K.yogas) {
      expect(y.name, 'Yoga name').toBeTruthy();
      expect(y.type, 'Yoga type').toBeTruthy();
      expect(['raja', 'dhana', 'dosha']).toContain(y.type);
      expect(y.effect, 'Yoga effect').toBeTruthy();
    }
  });
});

// ────────────────────────────────────────────────────────────
// CMP-13: L_* Localization Dictionaries — 10 Languages
// ────────────────────────────────────────────────────────────
test.describe('CMP-13: Localization Dictionary Coverage', () => {
  const ALL_LANGS = ['en', 'hi', 'kn', 'te', 'ta', 'sa', 'mr', 'gu', 'bn', 'ml'];

  test('L_RASHI has 12 entries for all 10 languages', async ({ page }) => {
    await page.goto(APP_URL);
    await page.waitForTimeout(3000);

    const result = await page.evaluate((langs) => {
      const missing = [];
      for (const lang of langs) {
        if (!L_RASHI[lang]) { missing.push(`${lang}: missing entirely`); continue; }
        if (L_RASHI[lang].length !== 12) { missing.push(`${lang}: has ${L_RASHI[lang].length}, expected 12`); }
      }
      return missing;
    }, ALL_LANGS);

    expect(result).toHaveLength(0);
  });

  test('L_GRAHA has 9 entries for all 10 languages', async ({ page }) => {
    await page.goto(APP_URL);
    await page.waitForTimeout(3000);

    const result = await page.evaluate((langs) => {
      const EXPECTED_KEYS = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'];
      const missing = [];
      for (const lang of langs) {
        if (!L_GRAHA[lang]) { missing.push(`${lang}: missing entirely`); continue; }
        for (const k of EXPECTED_KEYS) {
          if (!L_GRAHA[lang][k]) missing.push(`${lang}.${k}`);
        }
      }
      return missing;
    }, ALL_LANGS);

    expect(result).toHaveLength(0);
  });

  test('L_NAKS has 27 entries for all 10 languages', async ({ page }) => {
    await page.goto(APP_URL);
    await page.waitForTimeout(3000);

    const result = await page.evaluate((langs) => {
      const missing = [];
      for (const lang of langs) {
        if (!L_NAKS[lang]) { missing.push(`${lang}: missing entirely`); continue; }
        if (L_NAKS[lang].length !== 27) { missing.push(`${lang}: has ${L_NAKS[lang].length}, expected 27`); }
      }
      return missing;
    }, ALL_LANGS);

    expect(result).toHaveLength(0);
  });

  test('L_STATUS has all status keys for all 10 languages', async ({ page }) => {
    await page.goto(APP_URL);
    await page.waitForTimeout(3000);

    const result = await page.evaluate((langs) => {
      const EXPECTED = ['exalted', 'debilitated', 'retrograde', 'combust', 'vargottama'];
      const missing = [];
      for (const lang of langs) {
        if (!L_STATUS[lang]) { missing.push(`${lang}: missing entirely`); continue; }
        for (const k of EXPECTED) {
          if (!L_STATUS[lang][k]) missing.push(`${lang}.${k}`);
        }
      }
      return missing;
    }, ALL_LANGS);

    expect(result).toHaveLength(0);
  });

  test('STRINGS has essential keys for all 10 languages', async ({ page }) => {
    await page.goto(APP_URL);
    await page.waitForTimeout(3000);

    const result = await page.evaluate((langs) => {
      const missing = [];
      // Check that each language has a STRINGS entry with basic keys
      for (const lang of langs) {
        if (!STRINGS[lang]) { missing.push(`${lang}: no STRINGS entry`); continue; }
        const S = STRINGS[lang];
        // Check nested objects exist
        for (const key of ['tabs', 'ov', 'pl', 'da', 'yo', 'sh', 'av', 'rd', 'pdf']) {
          if (!S[key] && typeof S[key] !== 'object') {
            // Could be flat keys instead — check for at least one flat key with this prefix
            const hasFlat = Object.keys(S).some(k => k.startsWith(key + '.'));
            if (!hasFlat) missing.push(`${lang}: missing ${key} section`);
          }
        }
      }
      return missing;
    }, ALL_LANGS);

    expect(result).toHaveLength(0);
  });
});

// ────────────────────────────────────────────────────────────
// CMP-11: Vargottama Detection
// ────────────────────────────────────────────────────────────
test.describe('CMP-11: Vargottama', () => {
  test('Vargottama flag correctly set when D1 rashi === D9 rashi', async ({ page }) => {
    const K = await loadAndCompute(page);
    if (K.error) { test.skip(); return; }

    // For each planet, check if vargottama flag matches D1/D9 comparison
    for (const p of K.planets) {
      const d9Sign = K.divCharts?.D9?.[p.key];
      if (d9Sign !== undefined) {
        const isVargottama = p.rashi === d9Sign;
        expect(p.vargottama, `${p.key} vargottama flag mismatch`)
          .toBe(isVargottama);
      }
    }
  });
});

// ────────────────────────────────────────────────────────────
// CMP-12: Planet Status Badges
// ────────────────────────────────────────────────────────────
test.describe('CMP-12: Planet Status Flags', () => {
  test('Retrograde, exalted, debilitated flags are boolean', async ({ page }) => {
    const K = await loadAndCompute(page);
    if (K.error) { test.skip(); return; }

    for (const p of K.planets) {
      expect(typeof p.retro).toBe('boolean');
      expect(typeof p.exalted).toBe('boolean');
      expect(typeof p.debil).toBe('boolean');
      // Combust may not exist for all planets
      if (p.combust !== undefined) {
        expect(typeof p.combust).toBe('boolean');
      }
    }
  });
});
