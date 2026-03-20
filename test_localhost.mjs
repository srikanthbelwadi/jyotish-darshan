import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5173/');
  
  // Fill the form exactly as we think the user did
  await page.fill('input[type="date"]', '2005-01-31');
  await page.fill('input[type="time"]', '12:45');
  
  await page.fill('input[placeholder="Type city name (e.g. Bangalore, Mumbai, New York)..."]', 'Bangalore');
  await page.waitForTimeout(1000);
  
  // click the suggestion
  await page.click('text=Bangalore, Karnataka, India');
  
  await page.click('text=Male');
  
  await page.click('button:has-text("Generate Kundali")');
  
  await page.waitForSelector('text=Nakshatra', { timeout: 5000 });
  
  const content = await page.content();
  if (content.includes('Chitra')) {
    console.log('UI outputted Chitra!');
  } else if (content.includes('Hasta')) {
    console.log('UI outputted Hasta!');
  } else {
    console.log('UI outputted something else entirely');
  }
  
  // Let's get the exact share link to see the offset!
  const url = await page.url();
  console.log('Share URL:', url);
  
  await browser.close();
})();
