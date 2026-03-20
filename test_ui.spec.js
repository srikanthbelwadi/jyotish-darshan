import { test, expect } from '@playwright/test';

test('Test Jan 31 2005 12:45 in Bangalore', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  
  // Fill the form
  await page.fill('input[type="date"]', '2005-01-31');
  await page.fill('input[type="time"]', '12:45');
  
  // Fill city (Bangalore)
  await page.fill('input[placeholder="Type city name (e.g. Bangalore, Mumbai, New York)..."]', 'Bangalore');
  await page.waitForTimeout(500); // Wait for debounce and autocomplete
  await page.mouse.click(200, 300); // Hack to click the first suggestion if it appears or just type
  // Actually let's just click the suggestion
  await page.click('text=Bangalore, Karnataka');
  
  // Select gender
  await page.click('button:has-text("Male")');
  
  // Submit
  await page.click('button:has-text("Generate Kundali")');
  
  // Wait for results
  await page.waitForSelector('text=Nakshatra', { timeout: 5000 });
  
  // Get Nakshatra
  const text = await page.content();
  if (text.includes('Chitra')) {
    console.log('UI calculated: Chitra');
  } else if (text.includes('Hasta')) {
    console.log('UI calculated: Hasta');
  } else {
    console.log('UI calculated: something else');
  }
});
