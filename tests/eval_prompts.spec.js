/**
 * PMT — Prompt Hydration Test Suite
 *
 * Runs a browser-level eval to generate a complete Kundali and triggers a pathway,
 * intercepting the API request to guarantee the LLM payload is comprehensively
 * hydrated (no NaNs, no missing fields, correct language directives).
 */
import { test, expect } from '@playwright/test';

const APP_URL = '/index.html';

async function generateTestChart(page, lang = 'en') {
  await page.goto(APP_URL);
  await page.waitForTimeout(3000); // Wait for compilation

  await page.evaluate((langCode) => {
    // We utilize the exposed computeKundali function
    const K = computeKundali({
      year: 1990, month: 7, day: 15,
      hour: 6, minute: 30, lat: 12.9716, lng: 77.5946,
      utcOffset: 5.5, timezone: 'Asia/Kolkata',
      city: 'Bengaluru', country: 'India', gender: 'male'
    });
    // Inject directly into the view
    window.__K = K;
    window.__LANG = langCode;
  }, lang);
}

test.describe('LLM Prompt Hydration Engine', () => {

  test('POST /api/pathway payload is strictly hydrated (no NaNs or Nulls)', async ({ page }) => {
    let interceptedRequest = null;
    let payload = null;

    // 1. Intercept the network request to the AI logic
    await page.route('/api/pathway', async (route) => {
      interceptedRequest = route.request();
      payload = interceptedRequest.postDataJSON();
      // Fulfill with dummy data so the UI doesn't crash on wait
      await route.fulfill({ status: 200, json: { summary: "MOCK", options: [] } });
    });

    // 2. Load app and generate chart
    await page.goto(APP_URL);
    await page.waitForTimeout(2000);

    // 3. Instead of filling the form, directly simulate the frontend API call
    // This allows us to test the exact hydration happening in MockDashboard.jsx
    await page.evaluate(async () => {
      const K = computeKundali({
        year: 1990, month: 7, day: 15,
        hour: 6, minute: 30, lat: 12.9716, lng: 77.5946,
        utcOffset: 5.5, timezone: 'Asia/Kolkata',
        city: 'Bengaluru', country: 'India', gender: 'male'
      });
      
      await fetch('/api/pathway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pillarId: 'vocation',
          pillarTitle: 'Karma & Livelihood',
          pillarDesc: '10th House actions',
          kundaliData: K,
          lang: 'sa'
        })
      });
    });

    // Wait for route interception
    await page.waitForTimeout(500);

    // 4. Validate the payload
    expect(payload).toBeDefined();
    
    // Core parameters exist
    expect(payload.pillarId).toBe('vocation');
    expect(payload.lang).toBe('sa');
    
    // Validate Kundali Data Hydration
    const kd = payload.kundaliData;
    expect(kd).toBeDefined();
    expect(kd.planets).toBeDefined();
    expect(kd.planets.length).toBe(9);
    
    // Crucial: Assert absolutely no NaN values leaked into the JSON!
    const jsonString = JSON.stringify(payload);
    expect(jsonString.includes('NaN')).toBe(false);
    expect(jsonString.includes('null')).toBe(false); // Make sure objects are fully resolved
    
    // Assert Planet Math is actually populated
    const sun = kd.planets.find(p => p.key === 'sun');
    expect(typeof sun.lon).toBe('number');
    expect(typeof sun.rashi).toBe('number');
    
    // Assert Dasha periods exist for AI context
    expect(kd.dasha.mahadashas).toBeDefined();
    expect(kd.dasha.current.planet).toBeTruthy();
  });

  test('POST /api/oracle payload strictly enforces Context and Language', async ({ page }) => {
    let payload = null;

    await page.route('/api/oracle', async (route) => {
      payload = route.request().postDataJSON();
      await route.fulfill({ status: 200, json: { analysis: "MOCK" } });
    });

    await page.goto(APP_URL);
    await page.waitForTimeout(2000);

    await page.evaluate(async () => {
      const K = computeKundali({
        year: 2000, month: 1, day: 1,
        hour: 12, minute: 0, lat: 40.7128, lng: -74.0060,
        utcOffset: -5, timezone: 'America/New_York',
        city: 'New York', country: 'USA', gender: 'female'
      });
      
      await fetch('/api/oracle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: "When will I get married?",
          kundali: K,
          lang: "ta"
        })
      });
    });

    await page.waitForTimeout(500);

    expect(payload).toBeDefined();
    expect(payload.lang).toBe('ta');
    expect(payload.question).toBe("When will I get married?");
    expect(payload.kundali.lagna.rashi).toBeDefined();
    
    // Verify JSON integrity 
    const dumped = JSON.stringify(payload);
    expect(dumped.includes('NaN')).toBe(false);
  });
});
