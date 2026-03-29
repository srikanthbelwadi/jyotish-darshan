import { test, expect } from '@playwright/test';

const APP_URL = '/index.html';

test.describe('Cloud Sync & Persistence', () => {

  test('Kundalis are generated and stored locally', async ({ page }) => {
    await page.goto(APP_URL);
    await page.waitForTimeout(3000); // let WASM init

    // Fill in typical form
    await page.fill('input[placeholder="Full Name"]', 'SrikanthTest');
    await page.fill('input[placeholder="DD"]', '03');
    await page.fill('input[placeholder="MM"]', '09');
    await page.fill('input[placeholder="YYYY"]', '1974');
    await page.fill('input[placeholder="HH"]', '18');
    await page.fill('input[placeholder="MM"]', '30');
    await page.selectOption('select.lux-input', 'PM');
    
    // Auto-complete location
    await page.fill('input[placeholder="City, State, Country"]', 'Bangalore');
    await page.waitForSelector('.lux-dropdown-item', { state: 'visible' });
    await page.click('.lux-dropdown-item:first-child');
    await page.click('button:has-text("Generate Chart")');

    // Wait for render
    await page.waitForSelector('text=SrikanthTest');

    // Verify localStorage holds the new profile
    const profiles = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('jd_profiles') || '[]');
    });

    expect(profiles.length).toBeGreaterThan(0);
    expect(profiles[0].name).toBe('SrikanthTest');

    // Emulate clicking the profile dropdown and deleting it to check if array is cleared correctly
    await page.click('h2:has-text("SrikanthTest")'); 
    await page.waitForSelector('div[title="Delete Profile"]');
    
    // Set a flag to mock the syncProfileToCloud intercept if necessary
    const syncFired = await page.evaluate(() => {
       window.__TEST_SYNC_FIRED = false;
       return true;
    });

    // We can't easily intercept the exact Firebase function without mocking the module, 
    // but we can ensure localStorage is correctly erased which feeds into the sync target.
    page.on('dialog', dialog => dialog.accept());
    await page.click('div[title="Delete Profile"]');
    await page.waitForTimeout(500);

    const postDeleteProfiles = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('jd_profiles') || '[]');
    });

    // Profile array should be empty after delete 
    expect(postDeleteProfiles.length).toBe(0);
  });
});
