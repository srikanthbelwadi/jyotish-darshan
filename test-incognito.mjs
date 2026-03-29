import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext(); // Creates a fresh, isolated incognito-like incognito context
  const page = await context.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('pageerror', error => console.error('PAGE ERROR:', error));

  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    console.log("Page loaded. Checking for errors...");
    // Let it sit for 2 seconds to catch any delayed errors
    await page.waitForTimeout(2000);
  } catch (err) {
    console.error('NAVIGATION ERROR:', err);
  } finally {
    await browser.close();
  }
})();
