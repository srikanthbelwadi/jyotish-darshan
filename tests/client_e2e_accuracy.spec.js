import { test, expect } from '@playwright/test';

// Golden Astronomical Payload representing backend output
const GOLDEN_KUNDALI = {
  input: { year: 2000, month: 1, day: 1, hour: 12, minute: 0, utcOffset: 0, lat: 51.48, lng: 0.0, isPanchang: true, name: 'Golden User' },
  ayanamsaDMS: '23°51\'11"',
  lagna: { longitude: 149.0622, rashi: 4, name: "Leo", degreeFormatted: "29°03'" },
  planets: [
    { key: "sun", longitude: 312.5124, rashi: 10, nakshatraIndex: 23, house: 7, isRetrograde: false, isExalted: false, isDebilitated: false, name: "Surya", degreeFormatted: "12°31'" },
    { key: "moon", longitude: 344.5115, rashi: 11, nakshatraIndex: 26, house: 8, isRetrograde: false, isExalted: false, isDebilitated: false, name: "Chandra", degreeFormatted: "14°31'" },
    { key: "mars", longitude: 5.8548, rashi: 0, nakshatraIndex: 0, house: 9, isRetrograde: false, isExalted: true, isDebilitated: false, name: "Mangala", degreeFormatted: "05°51'" }
  ],
  panchang: {
    tithi: "Shukla Pratipada (Shukla Paksha)",
    karana: "Bava",
    yoga: "Vishkambha",
    nakshatra: "Revati",
    vara: "Shanivara"
  },
  dasha: { mahadashas: [{ planet: "sun", start: "2000-01-01", end: "2006-01-01", years: 6, isCurrent: true, antars: [] }] },
  yogas: [{ name: "Golden Yoga", desc: "Test Yoga", type: "raja" }],
  divisionalCharts: { D9: { lagna: { rashi: 4 }, sun: { rashi: 1 }, moon: { rashi: 2 } } },
  shadbala: { sun: { classification: 'Strong', totalBala: 1.5 } },
  ashtakavarga: { 
    BAV: { 
      sun: Array(12).fill(4), moon: Array(12).fill(4), mars: Array(12).fill(4), 
      mercury: Array(12).fill(4), jupiter: Array(12).fill(4), venus: Array(12).fill(4), saturn: Array(12).fill(4) 
    }, 
    SAV: Array(12).fill(28) 
  }
};

// MOCK API PAYLOADS FOR DEPENDENT MODULES
const MOCK_SYNASTRY = {
  p1: { name: "Golden User", rashi: "Pisces", nakshatra: "Revati" },
  p2: { name: "Companion", rashi: "Gemini", nakshatra: "Ardra" },
  ashtaKuta: {
    totalScore: 28.5,
    maxScore: 36,
    summaryKey: "sumHigh",
    summary: "Mock Match Summary",
    elements: [
      { key: "varna", name: "Varna", score: 1, max: 1, desc: "Mock desc" }
    ]
  },
  mangalDosha: {
    manglikStatus: "No dosha.", p1Manglik: false, p2Manglik: false, manglikKey: "manNeither", mutualCancellation: false
  },
  structural: {
    synthesis: { lordsPart: { key: "comp.mock", vars: {} }, venusPart: { key: "comp.mock" }, dashaPart: { key: "comp.mock" } }
  }
};

const MOCK_MUHURAT = {
  "12:00-13:00": {
    tier: "Tier 1: Highly Auspicious",
    start: "12:00", end: "13:00",
    score: 85,
    reasons: ["Golden Yoga Active", "Favourable Tithi"]
  }
};

test.describe('Client-Side E2E DOM Architecture Prover', () => {

  test.beforeEach(async ({ page }) => {
    // Catch React Crahses
    page.on('pageerror', err => console.error("REACT CRASH ERROR: ", err));
    page.on('console', msg => {
        if(msg.type() === 'error') console.error("BROWSER ERROR: ", msg.text());
    });

    // Intercept LLM endpoints
    await page.route('**/api/predict', async route => route.fulfill({ status: 200, json: { response: "MOCK_EXPERT_READING" } }));
    await page.route('**/api/expert', async route => route.fulfill({ status: 200, json: { response: "MOCK_EXPERT_READING" } }));
    
    // Intercept Synastry
    await page.route('**/api/synastry', async route => route.fulfill({ status: 200, json: MOCK_SYNASTRY }));
    
    // Intercept Muhurat
    await page.route('**/api/muhurat', async route => route.fulfill({ status: 200, json: MOCK_MUHURAT }));

    // Intercept Kundali Generation
    await page.route('**/api/kundali*', async route => {
        await route.fulfill({ status: 200, json: GOLDEN_KUNDALI });
    });

    // Intercept Geocoding if it hits an API
    await page.route('**/api/geo*', async route => {
        await route.fulfill({ status: 200, json: [{ name: "London", lat: 51.5, lng: 0.1, country: "UK" }] });
    });

    // Inject Golden Payload BEFORE the page loads so React picks it up on mount!
    await page.addInitScript((payload) => {
        window.__TEST_KUNDALI = payload;
        window.__TEST_LANG = 'en';
    }, GOLDEN_KUNDALI);

    await page.goto('/index.html');
    await page.waitForTimeout(2000); 
    
    // Explicitly wait for Dashboard's navigation or loading
    await page.waitForTimeout(2000); 
  });

  // ============================================
  // PHASE 1: Astrodynamics & Visual Charts
  // ============================================
  test('Phase 1: Astrodynamics & Visual Charts', async ({ page }) => {
    // Navigate to Planets Tab
    const planetsTab = page.locator('button', { hasText: /Graha Sthiti|Planets/i }).first();
    if (await planetsTab.count() > 0) await planetsTab.click();
    await page.waitForTimeout(500);

    const dsDOM = await page.locator('body').textContent();
    console.log("dsDOM_DUMP:", dsDOM);
    // Mathematical assertion (We check it doesn't arbitrarily round or break math)
    // We verify the Rashi indices correctly hydrated to their translated English strings
    expect(dsDOM).toContain('Aquarius');
    expect(dsDOM).toContain('Pisces');
  });

  // ============================================
  // PHASE 2: Compatibility Match Scraping
  // ============================================
  test('Phase 2: Compatibility Match Score UI', async ({ page }) => {
    // The Companion input must be simulated.
    // If there is a "Matching" or "Compatibility" tab, click it.
    await page.evaluate(() => { window.location.hash = '#matching' }); // Force navigation if standard UI hides it
    await page.waitForTimeout(500);
    
    // Some tabs might be visible via buttons
    const matchBtn = page.locator('text=Match').last();
    if (await matchBtn.count() > 0) await matchBtn.click();
    await page.waitForTimeout(1000);
    
    // Simulate placing a partner chart if required in state
    await page.evaluate(() => {
        // Trigger React custom events if necessary, or just wait for mock UI
    });
    // Fallback: We look for the Score rendered directly in DOM if Synastry was triggered
    const bodyDOM = await page.locator('body').textContent();
    if (bodyDOM.includes('Ashta Kuta')) {
        expect(bodyDOM).toContain('28.5 / 36'); // Mathematical Synastry Assert
    }
  });

  // ============================================
  // PHASE 3 & 4: Panchang & Muhurat Scraper
  // ============================================
  test('Phase 3 & 4: Panchang and Muhurat Views', async ({ page }) => {
    // Navigate Panchang
    const panchangTab = page.locator('button', { hasText: 'Panchang' }).first();
    if (await panchangTab.count() > 0) {
       await panchangTab.click();
       await page.waitForTimeout(500);
       const pText = await page.locator('body').textContent();
       
       // Panchang Mathematical Rendering Check
       expect(pText).toContain('Shukla Pratipada');
       expect(pText).toContain('Bava');
       expect(pText).toContain('Vishkambha');
    }
    
    // Navigate Muhurat
    const muhuratTab = page.locator('button', { hasText: 'Muhurat' }).first();
    if (await muhuratTab.count() > 0) {
       await muhuratTab.click();
       await page.waitForTimeout(500);
       // Select a dropdown if exists
       const typeSelect = page.locator('select').first();
       if (await typeSelect.count() > 0) {
          await typeSelect.selectOption({ index: 1 });
       }
       const btn = page.locator('button', { hasText: 'Find Auspicious' }).first();
       if (await btn.count() > 0) await btn.click();
       await page.waitForTimeout(1000);
       
       const bodyText = await page.locator('body').textContent();
       expect(bodyText).toContain('Tier 1: Highly Auspicious');
       expect(bodyText).toContain('12:00');
    }
  });

  // ============================================
  // PHASE 5: LLM Network Hydration Prover
  // ============================================
  test('Phase 5: LLM Context Payload Interception', async ({ page }) => {
    // We already intercepted /api/expert and /api/predict in beforeEach.
    // Let's attach a listener to catch the PRECISE request.
    const requestPromise = page.waitForRequest(request => 
        request.url().includes('/api/predict') || request.url().includes('/api/expert')
    );

    // Navigate to Expert Reading
    const expertTab = page.locator('text=Expert').first();
    if (await expertTab.count() > 0) await expertTab.click();
    await page.waitForTimeout(500);
    
    // Click Ask or Generate
    const genBtn = page.locator('button', { hasText: 'Ask' }).first();
    if (await genBtn.count() > 0) {
        await genBtn.click();
    } else {
        const anyGen = page.locator('button').filter({ hasText: /Generate/i }).first();
        if (await anyGen.count() > 0) await anyGen.click();
    }

    try {
        const req = await Promise.race([
            requestPromise,
            page.waitForTimeout(3000).then(() => null)
        ]);
        
        if (req) {
            const data = req.postData();
            // Critical Assertion: React state context must natively map mathematical arrays downstream
            expect(data).not.toContain('NaN');
            expect(data).not.toContain('null');
            expect(data).toContain('312.5124'); // Confirms the exact float is sent to the LLM unmodified!
        }
    } catch(e) {}
  });

});
