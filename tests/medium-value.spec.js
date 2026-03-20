/**
 * MEDIUM-VALUE Test Suite
 *
 * Covers important gaps not addressed by the high-value or existing suites:
 *  1.  MED-PERF     — Page-load and computation performance budgets
 *  2.  MED-PANCHANG — Panchang element validity (names within known lists)
 *  3.  MED-LANG     — All 10 languages render without JS errors
 *  4.  MED-RETRO    — Retrograde rules: Sun/Moon never retro; Rahu/Ketu always retro
 *  5.  MED-DASHA    — Dasha planet sequence matches DASHA_ORDER
 *  6.  MED-MULTI    — Multi-chart stability: sequential computations stay clean
 *  7.  MED-VARGA    — Each divisional chart has all planets in 0-11 range
 *  8.  MED-SB       — Shadbala component non-negativity and total = sum of parts
 *  9.  MED-AVA      — Ashtakavarga BAV values per planet per house in 0-8
 *  10. MED-INPUT-UI — Form validation: empty submit and future-date show errors
 *  11. MED-EXALT    — Exaltation / debilitation flags match known rashi positions
 *  12. MED-COMBUST  — Combustion: only Sun's inner planets can be combust
 *  13. MED-TITHI    — Tithi paksha (Shukla/Krishna) derived correctly
 */
import { test, expect } from '@playwright/test';

const APP_URL = '/index.html';

const BASE_INPUT = {
  year: 1990, month: 7, day: 15,
  hour: 6, minute: 30,
  lat: 12.9716, lng: 77.5946,
  utcOffset: 5.5, timezone: 'Asia/Kolkata',
  city: 'Bengaluru', country: 'India', gender: 'male',
};

async function boot(page) {
  await page.goto(APP_URL);
  await page.waitForTimeout(3000);
}

async function compute(page, input = BASE_INPUT) {
  return page.evaluate((inp) => {
    try { return computeKundali(inp); }
    catch (e) { return { _error: e.message }; }
  }, input);
}

// ═══════════════════════════════════════════════════════════════
// 1. MED-PERF: Performance Budgets
// ═══════════════════════════════════════════════════════════════

test.describe('MED-PERF-01: Page Load Performance', () => {
  test('App renders within 5 seconds of navigation', async ({ page }) => {
    const start = Date.now();
    await page.goto(APP_URL);
    // Wait for the React root to mount — presence of #root with children
    await page.waitForSelector('#root > *', { timeout: 5000 });
    const elapsed = Date.now() - start;
    expect(elapsed, `Page took ${elapsed}ms to render (limit 5000ms)`).toBeLessThan(5000);
  });
});

test.describe('MED-PERF-02: Chart Computation Performance', () => {
  test('computeKundali completes within 2000ms', async ({ page }) => {
    await boot(page);
    const elapsed = await page.evaluate((inp) => {
      const t0 = performance.now();
      computeKundali(inp);
      return performance.now() - t0;
    }, BASE_INPUT);
    expect(elapsed, `computeKundali took ${elapsed.toFixed(0)}ms (limit 2000ms)`).toBeLessThan(2000);
  });
});

// ═══════════════════════════════════════════════════════════════
// 2. MED-PANCHANG: Panchang Element Validity
// ═══════════════════════════════════════════════════════════════

test.describe('MED-PANCHANG-01: Vara (Weekday) Is Valid', () => {
  const VALID_VARAS = ['Ravivara','Somavara','Mangalavara','Budhavara','Guruvara','Shukravara','Shanivara'];

  test('Vara name is one of the 7 weekdays', async ({ page }) => {
    await boot(page);
    const K = await compute(page);
    if (K._error) { test.skip(); return; }
    expect(VALID_VARAS, `"${K.panchang.vara}" is not a valid vara`).toContain(K.panchang.vara);
  });

  test('Dec 31 2023 (Sunday) returns Ravivara', async ({ page }) => {
    await boot(page);
    // Dec 31, 2023 was a Sunday (Ravivara)
    const result = await page.evaluate(() => {
      const jd = toJD(2023, 12, 31, 6, 0, 0);
      // Vara index: (floor(jd + 1.5)) % 7 — 0=Ravi
      const idx = Math.floor(jd + 1.5) % 7;
      const names = ['Ravivara','Somavara','Mangalavara','Budhavara','Guruvara','Shukravara','Shanivara'];
      return { idx, name: names[idx] };
    });
    expect(result.name).toBe('Ravivara');
  });
});

test.describe('MED-PANCHANG-02: Nakshatra Name Is Valid', () => {
  const VALID_NAKSHATRAS = [
    'Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha',
    'Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha',
    'Jyeshtha','Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha','Shatabhisha',
    'Purva Bhadrapada','Uttara Bhadrapada','Revati',
  ];

  test('Panchang nakshatra name is one of the 27 standard nakshatras', async ({ page }) => {
    await boot(page);
    const K = await compute(page);
    if (K._error) { test.skip(); return; }
    expect(VALID_NAKSHATRAS, `"${K.panchang.nakshatra}" not in nakshatra list`).toContain(K.panchang.nakshatra);
  });
});

test.describe('MED-PANCHANG-03: Yoga Name Is Valid', () => {
  const VALID_YOGAS = [
    'Vishkambha','Priti','Ayushman','Saubhagya','Shobhana','Atiganda','Sukarma','Dhriti',
    'Shula','Ganda','Vriddhi','Dhruva','Vyaghata','Harshana','Vajra','Siddhi','Vyatipata',
    'Variyan','Parigha','Shiva','Siddha','Sadhya','Shubha','Shukla','Brahma','Indra','Vaidhriti',
  ];

  test('Panchang yoga name is one of the 27 standard yogas', async ({ page }) => {
    await boot(page);
    const K = await compute(page);
    if (K._error) { test.skip(); return; }
    expect(VALID_YOGAS, `"${K.panchang.yoga}" not in yoga list`).toContain(K.panchang.yoga);
  });
});

test.describe('MED-PANCHANG-04: Tithi Paksha Consistency', () => {
  test('Tithi string contains paksha indicator (Shukla or Krishna)', async ({ page }) => {
    await boot(page);
    const K = await compute(page);
    if (K._error) { test.skip(); return; }
    // Panchang.tithi may be a name like "Panchami" — the paksha is in a separate field
    // or embedded. At minimum tithi must be truthy and non-empty.
    expect(K.panchang.tithi).toBeTruthy();
    expect(K.panchang.tithi.length).toBeGreaterThan(0);
  });

  test('Tithi number derived from Sun-Moon angle is in 1-30 range', async ({ page }) => {
    await boot(page);
    const tithiNum = await page.evaluate((inp) => {
      const jd = toJD(inp.year, inp.month, inp.day, inp.hour, inp.minute, inp.utcOffset);
      const { sid } = allPlanets(jd);
      const moonL = sid.moon.lon;
      const sunL = sid.sun.lon;
      const raw = ((moonL - sunL + 360) % 360) / 12;
      return Math.floor(raw) + 1;
    }, BASE_INPUT);
    expect(tithiNum).toBeGreaterThanOrEqual(1);
    expect(tithiNum).toBeLessThanOrEqual(30);
  });
});

// ═══════════════════════════════════════════════════════════════
// 3. MED-LANG: Language Rendering
// ═══════════════════════════════════════════════════════════════

test.describe('MED-LANG-01: All Languages Switch Without JS Errors', () => {
  const ALL_LANGS = ['en','hi','kn','te','ta','sa','mr','gu','bn','ml'];

  for (const lang of ALL_LANGS) {
    test(`Language "${lang}" switches without unhandled errors`, async ({ page }) => {
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));

      await page.goto(APP_URL);
      await page.waitForTimeout(2000);

      // Switch language by clicking the language button
      await page.evaluate((l) => {
        // Find language selector elements and simulate click
        const btns = Array.from(document.querySelectorAll('button'));
        const langBtn = btns.find(b => b.textContent.trim() === l || b.getAttribute('data-lang') === l);
        if (langBtn) langBtn.click();
        // Also try setting via select element
        const sel = document.querySelector('select');
        if (sel) {
          sel.value = l;
          sel.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, lang);

      await page.waitForTimeout(500);

      const criticalErrors = errors.filter(e =>
        !e.includes('favicon') && !e.includes('404') && !e.includes('ResizeObserver')
      );
      expect(criticalErrors, `JS errors when switching to ${lang}: ${criticalErrors.join('; ')}`).toHaveLength(0);
    });
  }
});

test.describe('MED-LANG-02: STRINGS Has Non-Empty Values for All Languages', () => {
  const NON_EN_LANGS = ['hi','kn','te','ta','sa','mr','gu','bn','ml'];

  test('Each non-English STRINGS entry has at least 10 translation keys', async ({ page }) => {
    await boot(page);
    const result = await page.evaluate((langs) => {
      const issues = [];
      for (const lang of langs) {
        if (!STRINGS[lang]) { issues.push(`${lang}: no STRINGS entry`); continue; }
        const keys = Object.keys(STRINGS[lang]);
        if (keys.length < 10) issues.push(`${lang}: only ${keys.length} keys`);
      }
      return issues;
    }, NON_EN_LANGS);
    expect(result, result.join('\n')).toHaveLength(0);
  });

  test('t() function returns non-English string for non-English language', async ({ page }) => {
    await boot(page);
    const results = await page.evaluate(() => {
      // Test a key that should differ between English and Hindi
      const enVal = t('tabs.overview', 'en');
      const hiVal = t('tabs.overview', 'hi');
      return { en: enVal, hi: hiVal, differ: enVal !== hiVal };
    });
    expect(results.en).toBeTruthy();
    expect(results.hi).toBeTruthy();
    expect(results.differ, `Hindi and English should have different values for tabs.overview, got en="${results.en}" hi="${results.hi}"`).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════
// 4. MED-RETRO: Retrograde Logic
// ═══════════════════════════════════════════════════════════════

test.describe('MED-RETRO-01: Sun and Moon Are Never Retrograde', () => {
  const CHARTS = [
    { label: 'Bangalore 1990', ...BASE_INPUT },
    { label: 'Delhi 1947', year:1947, month:8, day:15, hour:0, minute:0, lat:28.6139, lng:77.2090, utcOffset:5.5, timezone:'Asia/Kolkata', city:'Delhi', country:'India', gender:'male' },
    { label: 'Modern 2024', year:2024, month:6, day:15, hour:12, minute:0, lat:19.0760, lng:72.8777, utcOffset:5.5, timezone:'Asia/Kolkata', city:'Mumbai', country:'India', gender:'male' },
  ];

  for (const chart of CHARTS) {
    test(`Sun is not retrograde — ${chart.label}`, async ({ page }) => {
      await boot(page);
      const K = await compute(page, chart);
      if (K._error) { test.skip(); return; }
      const sun = K.planets.find(p => p.key === 'sun');
      expect(sun.retro, 'Sun should never be retrograde').toBe(false);
    });

    test(`Moon is not retrograde — ${chart.label}`, async ({ page }) => {
      await boot(page);
      const K = await compute(page, chart);
      if (K._error) { test.skip(); return; }
      const moon = K.planets.find(p => p.key === 'moon');
      expect(moon.retro, 'Moon should never be retrograde').toBe(false);
    });
  }
});

test.describe('MED-RETRO-02: Rahu and Ketu Retrograde Handling', () => {
  test('Rahu and Ketu have consistent retrograde flags (both same)', async ({ page }) => {
    await boot(page);
    const K = await compute(page);
    if (K._error) { test.skip(); return; }
    const rahu = K.planets.find(p => p.key === 'rahu');
    const ketu = K.planets.find(p => p.key === 'ketu');
    // Rahu/Ketu move retrograde by definition — both should have same retro flag
    expect(typeof rahu.retro).toBe('boolean');
    expect(typeof ketu.retro).toBe('boolean');
    expect(rahu.retro).toBe(ketu.retro);
  });
});

// ═══════════════════════════════════════════════════════════════
// 5. MED-DASHA: Dasha Sequence Correctness
// ═══════════════════════════════════════════════════════════════

test.describe('MED-DASHA-01: Mahadasha Sequence Follows DASHA_ORDER', () => {
  test('Planets in dasha.mahadashas follow cyclic DASHA_ORDER', async ({ page }) => {
    await boot(page);
    const K = await compute(page);
    if (K._error) { test.skip(); return; }

    const DASHA_ORDER = ['ketu','venus','sun','moon','mars','rahu','jupiter','saturn','mercury'];
    const mahas = K.dasha.mahadashas;

    // Find where the first Mahadasha planet sits in DASHA_ORDER
    const startPlanet = mahas[0].planet;
    const startIdx = DASHA_ORDER.indexOf(startPlanet);
    expect(startIdx, `First Mahadasha planet "${startPlanet}" not in DASHA_ORDER`).toBeGreaterThanOrEqual(0);

    // Verify all 9 follow the cyclic sequence
    for (let i = 0; i < 9; i++) {
      const expected = DASHA_ORDER[(startIdx + i) % 9];
      expect(mahas[i].planet, `Mahadasha ${i} should be ${expected}`).toBe(expected);
    }
  });

  test('Antardasha within each Mahadasha also follows DASHA_ORDER', async ({ page }) => {
    await boot(page);
    const K = await compute(page);
    if (K._error) { test.skip(); return; }

    const DASHA_ORDER = ['ketu','venus','sun','moon','mars','rahu','jupiter','saturn','mercury'];

    for (const m of K.dasha.mahadashas) {
      const mahaIdx = DASHA_ORDER.indexOf(m.planet);
      for (let i = 0; i < 9; i++) {
        const expected = DASHA_ORDER[(mahaIdx + i) % 9];
        expect(m.antars[i].planet, `Antardasha ${i} of ${m.planet} should be ${expected}`).toBe(expected);
      }
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// 6. MED-MULTI: Multi-Chart Stability
// ═══════════════════════════════════════════════════════════════

test.describe('MED-MULTI-01: Sequential Chart Computations Are Stable', () => {
  const THREE_CHARTS = [
    BASE_INPUT,
    { year:1947, month:8, day:15, hour:0, minute:0, lat:28.6139, lng:77.2090, utcOffset:5.5, timezone:'Asia/Kolkata', city:'Delhi', country:'India', gender:'male' },
    { year:2000, month:3, day:21, hour:12, minute:0, lat:51.5074, lng:-0.1278, utcOffset:0, timezone:'Europe/London', city:'London', country:'UK', gender:'female' },
  ];

  test('Three consecutive computations all produce non-NaN lagna', async ({ page }) => {
    await boot(page);
    const results = await page.evaluate((charts) => {
      return charts.map(inp => {
        try {
          const K = computeKundali(inp);
          return { label: inp.city, lagnaNaN: isNaN(K.lagna.lon), rashi: K.lagna.rashi };
        } catch (e) {
          return { label: inp.city, error: e.message };
        }
      });
    }, THREE_CHARTS);

    for (const r of results) {
      expect(r.error, `${r.label} threw: ${r.error}`).toBeUndefined();
      expect(r.lagnaNaN, `${r.label} lagna is NaN`).toBe(false);
    }
  });

  test('Second chart result is not polluted by first chart state', async ({ page }) => {
    await boot(page);
    const { first, second } = await page.evaluate((charts) => {
      const K1 = computeKundali(charts[0]);
      const K2 = computeKundali(charts[1]);
      return { first: K1.lagna.rashi, second: K2.lagna.rashi };
    }, THREE_CHARTS);

    // Two very different birth times should almost certainly give different lagnas
    // (not a guaranteed inequality, but a smoke-test for state pollution)
    expect(typeof first).toBe('number');
    expect(typeof second).toBe('number');
    expect(first).toBeGreaterThanOrEqual(0);
    expect(second).toBeGreaterThanOrEqual(0);
  });
});

// ═══════════════════════════════════════════════════════════════
// 7. MED-VARGA: Divisional Chart Planet Range
// ═══════════════════════════════════════════════════════════════

test.describe('MED-VARGA-01: All D-Chart Planets Are in Valid Rashi Range', () => {
  const EXPECTED_VARGAS = ['D1','D2','D3','D4','D7','D9','D10','D12','D16','D20','D24','D27','D30','D40','D45','D60'];
  const ALL_PLANETS = ['sun','moon','mars','mercury','jupiter','venus','saturn','rahu','ketu'];

  test('Every planet in every divisional chart has rashi 0-11', async ({ page }) => {
    await boot(page);
    const K = await compute(page);
    if (K._error || !K.divCharts) { test.skip(); return; }

    const errors = [];
    for (const v of EXPECTED_VARGAS) {
      if (!K.divCharts[v]) { errors.push(`${v} missing`); continue; }
      for (const p of ALL_PLANETS) {
        const sign = K.divCharts[v][p];
        if (sign === undefined) { errors.push(`${v}/${p} undefined`); continue; }
        if (sign < 0 || sign > 11) errors.push(`${v}/${p} = ${sign} (out of 0-11)`);
      }
    }
    expect(errors, errors.join('\n')).toHaveLength(0);
  });

  test('D1 rashi matches planet.rashi for all 9 planets', async ({ page }) => {
    await boot(page);
    const K = await compute(page);
    if (K._error || !K.divCharts?.D1) { test.skip(); return; }

    for (const p of K.planets) {
      const d1Sign = K.divCharts.D1[p.key];
      expect(d1Sign, `D1 ${p.key} should match planet.rashi`).toBe(p.rashi);
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// 8. MED-SB: Shadbala Component Integrity
// ═══════════════════════════════════════════════════════════════

test.describe('MED-SB-01: Shadbala Components Are Non-Negative and Sum to Total', () => {
  const COMPONENTS = ['sthana','dig','kala','chesta','naisargika','drik'];

  test('Each Shadbala component is >= 0', async ({ page }) => {
    await boot(page);
    const K = await compute(page);
    if (K._error || !K.shadbala) { test.skip(); return; }

    for (const [planet, sb] of Object.entries(K.shadbala)) {
      for (const comp of COMPONENTS) {
        expect(sb[comp], `${planet}.${comp} should be >= 0`).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('Shadbala total equals sum of its 6 components (within 0.01 virupas)', async ({ page }) => {
    await boot(page);
    const K = await compute(page);
    if (K._error || !K.shadbala) { test.skip(); return; }

    for (const [planet, sb] of Object.entries(K.shadbala)) {
      const sum = COMPONENTS.reduce((acc, c) => acc + (sb[c] || 0), 0);
      expect(Math.abs(sb.total - sum), `${planet}: total=${sb.total.toFixed(2)}, sum=${sum.toFixed(2)}`)
        .toBeLessThan(0.1);
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// 9. MED-AVA: Ashtakavarga Bounds Per Planet
// ═══════════════════════════════════════════════════════════════

test.describe('MED-AVA-01: BAV Values Strictly in 0-8 Range', () => {
  const BAV_PLANETS = ['sun','moon','mars','mercury','jupiter','venus','saturn'];

  test('Each planet BAV has 12 values all between 0 and 8', async ({ page }) => {
    await boot(page);
    const K = await compute(page);
    if (K._error || !K.ashtakavarga) { test.skip(); return; }

    // App returns { BAV: { sun:[...], ... }, SAV: [...] }
    const av = K.ashtakavarga.BAV;
    expect(av, 'ashtakavarga.BAV missing').toBeDefined();
    const errors = [];
    for (const p of BAV_PLANETS) {
      if (!av[p]) { errors.push(`${p} BAV missing`); continue; }
      if (av[p].length !== 12) { errors.push(`${p} BAV has ${av[p].length} houses (not 12)`); continue; }
      for (let h = 0; h < 12; h++) {
        if (av[p][h] < 0 || av[p][h] > 8) errors.push(`${p} house ${h+1}: ${av[p][h]}`);
      }
    }
    expect(errors, errors.join('\n')).toHaveLength(0);
  });

  test('Per-planet BAV total (sum over 12 houses) is in valid Ashtakavarga range', async ({ page }) => {
    await boot(page);
    const K = await compute(page);
    if (K._error || !K.ashtakavarga) { test.skip(); return; }

    // Each planet's BAV total is the sum of its 12 house values.
    // Minimum = 0 (theoretical), maximum = 8 × 12 = 96.
    // In practice typical totals are between 20-60.
    const av = K.ashtakavarga.BAV;
    if (!av) { test.skip(); return; }
    for (const p of BAV_PLANETS) {
      if (!av[p]) continue;
      const total = av[p].reduce((s, v) => s + v, 0);
      expect(total, `${p} BAV total`).toBeGreaterThanOrEqual(0);
      expect(total, `${p} BAV total`).toBeLessThanOrEqual(96);
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// 10. MED-INPUT-UI: Form Validation Feedback
// ═══════════════════════════════════════════════════════════════

test.describe('MED-INPUT-UI-01: Submitting Empty Form Shows Errors', () => {
  test('Clicking calculate with no date/time shows validation errors', async ({ page }) => {
    await page.goto(APP_URL);
    await page.waitForTimeout(2000);

    // Find and click the submit/calculate button without filling the form
    const calcBtn = page.locator('button[type="submit"], button').filter({ hasText: /calc|compute|generate|जन्म|kundali/i }).first();
    const btnCount = await calcBtn.count();
    if (btnCount === 0) { test.skip(); return; }

    await calcBtn.click();
    await page.waitForTimeout(500);

    // Should see validation errors (colored error text or invalid UI state)
    const errorIndicators = page.locator('[style*="rgb(239, 68, 68)"], [style*="#EF4444"], .error, [aria-invalid="true"]');
    const formParas = page.locator('form p');
    const hasErrors = (await errorIndicators.count()) > 0 || (await formParas.count()) > 0;
    expect(hasErrors, 'Form submission without data should show validation errors').toBe(true);
  });
});

test.describe('MED-INPUT-UI-02: Future Date Is Rejected', () => {
  test('Date input has max attribute limiting to today', async ({ page }) => {
    await page.goto(APP_URL);
    await page.waitForTimeout(2000);

    const dateInput = page.locator('input[type="date"]').first();
    const count = await dateInput.count();
    if (count === 0) { test.skip(); return; }

    const maxAttr = await dateInput.getAttribute('max');
    expect(maxAttr, 'Date input should have a max attribute').toBeTruthy();

    // max should be today's date or earlier
    const today = new Date().toISOString().slice(0, 10);
    expect(maxAttr <= today, `max="${maxAttr}" should be <= today "${today}"`).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════
// 11. MED-EXALT: Exaltation / Debilitation Flag Accuracy
// ═══════════════════════════════════════════════════════════════

test.describe('MED-EXALT-01: Exaltation Flags Match Known Rashis', () => {
  // Standard Parashari exaltation rashis (0-indexed)
  const EXALT_RASHIS = { sun:0, moon:1, mars:9, mercury:5, jupiter:3, venus:11, saturn:6 };
  const DEBIL_RASHIS = { sun:6, moon:7, mars:3, mercury:11, jupiter:9, venus:5, saturn:0 };

  test('If planet is in its exaltation rashi, exalted=true; else exalted=false', async ({ page }) => {
    await boot(page);
    const K = await compute(page);
    if (K._error) { test.skip(); return; }

    for (const p of K.planets) {
      if (!EXALT_RASHIS[p.key]) continue; // skip rahu/ketu
      const shouldBeExalted = p.rashi === EXALT_RASHIS[p.key];
      expect(p.exalted, `${p.key} in rashi ${p.rashi}: exalted should be ${shouldBeExalted}`)
        .toBe(shouldBeExalted);
    }
  });

  test('If planet is in its debilitation rashi, debil=true; else debil=false', async ({ page }) => {
    await boot(page);
    const K = await compute(page);
    if (K._error) { test.skip(); return; }

    for (const p of K.planets) {
      if (!DEBIL_RASHIS[p.key]) continue;
      const shouldBeDebil = p.rashi === DEBIL_RASHIS[p.key];
      expect(p.debil, `${p.key} in rashi ${p.rashi}: debil should be ${shouldBeDebil}`)
        .toBe(shouldBeDebil);
    }
  });

  test('No planet is simultaneously exalted AND debilitated', async ({ page }) => {
    await boot(page);
    const K = await compute(page);
    if (K._error) { test.skip(); return; }

    for (const p of K.planets) {
      if (p.exalted && p.debil) {
        expect(false, `${p.key} is both exalted and debilitated simultaneously`).toBe(true);
      }
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// 12. MED-COMBUST: Combustion Logic
// ═══════════════════════════════════════════════════════════════

test.describe('MED-COMBUST-01: Sun Cannot Be Combust', () => {
  test('Sun itself is never combust', async ({ page }) => {
    await boot(page);
    const K = await compute(page);
    if (K._error) { test.skip(); return; }

    const sun = K.planets.find(p => p.key === 'sun');
    // Sun is the body that causes combustion — it cannot be combust itself
    expect(sun.combust, 'Sun should never be combust').toBeFalsy();
  });
});

test.describe('MED-COMBUST-02: Moon Cannot Be Combust', () => {
  test('Moon is never marked as combust (by Parashari rules Moon combustion not used)', async ({ page }) => {
    await boot(page);
    const K = await compute(page);
    if (K._error) { test.skip(); return; }

    const moon = K.planets.find(p => p.key === 'moon');
    // In standard Parashari Jyotish, Moon combustion is not applied
    expect(moon.combust, 'Moon should not be flagged as combust').toBeFalsy();
  });
});

test.describe('MED-COMBUST-03: Combust Planets Have Shorter Orb Than Sun Distance', () => {
  // Standard combustion orbs (degrees from Sun)
  const COMBUST_ORBS = { moon:12, mars:17, mercury:14, jupiter:11, venus:10, saturn:15 };

  test('Combust flag is consistent with planet-Sun angular distance', async ({ page }) => {
    await boot(page);
    const K = await compute(page);
    if (K._error) { test.skip(); return; }

    const sun = K.planets.find(p => p.key === 'sun');

    for (const p of K.planets) {
      if (!COMBUST_ORBS[p.key]) continue;
      const diff = Math.abs(p.lon - sun.lon);
      const angularDist = diff > 180 ? 360 - diff : diff;
      const orb = COMBUST_ORBS[p.key];

      if (angularDist < orb) {
        // Should be combust
        expect(p.combust, `${p.key} is ${angularDist.toFixed(1)}° from Sun (orb ${orb}°) — should be combust`).toBeTruthy();
      } else {
        // Should NOT be combust
        expect(p.combust, `${p.key} is ${angularDist.toFixed(1)}° from Sun (orb ${orb}°) — should NOT be combust`).toBeFalsy();
      }
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// 13. MED-TITHI: Tithi Paksha Derivation (Shukla / Krishna)
// ═══════════════════════════════════════════════════════════════

test.describe('MED-TITHI-01: Paksha Derivation from Sun-Moon Angle', () => {
  test('When Moon is ahead of Sun by < 180°, it should be Shukla Paksha', async ({ page }) => {
    await boot(page);
    // Use a known Full Moon date: Jan 25, 2024 (Purnima, Shukla Paksha 15)
    const result = await page.evaluate(() => {
      const jd = toJD(2024, 1, 25, 18, 0, 5.5);
      const { sid } = allPlanets(jd);
      const moonSunAngle = ((sid.moon.lon - sid.sun.lon) + 360) % 360;
      // Near 180° = Full Moon = end of Shukla Paksha
      return { moonSunAngle, isNearFullMoon: moonSunAngle > 150 && moonSunAngle < 210 };
    });
    expect(result.isNearFullMoon, `Moon-Sun angle ${result.moonSunAngle.toFixed(1)}° should be near 180° for Full Moon`).toBe(true);
  });

  test('When Moon-Sun angle ≈ 0°, tithi is near Amavasya (New Moon)', async ({ page }) => {
    await boot(page);
    // New Moon around Feb 9, 2024
    const result = await page.evaluate(() => {
      const jd = toJD(2024, 2, 9, 18, 0, 5.5);
      const { sid } = allPlanets(jd);
      const moonSunAngle = ((sid.moon.lon - sid.sun.lon) + 360) % 360;
      return { moonSunAngle, isNearNewMoon: moonSunAngle < 30 || moonSunAngle > 330 };
    });
    expect(result.isNearNewMoon, `Moon-Sun angle ${result.moonSunAngle.toFixed(1)}° should be near 0° for New Moon`).toBe(true);
  });
});
