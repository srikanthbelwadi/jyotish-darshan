import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const result = await page.evaluate(() => {
    const tzId = 'Asia/Kolkata';
    const year=2005, month=1, day=31, hour=12, minute=45;
    const d = new Date(Date.UTC(year, month - 1, day, hour, minute));
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: tzId,
      timeZoneName: 'shortOffset'
    }).formatToParts(d);
    return parts.find(p => p.type === 'timeZoneName')?.value;
  });
  console.log("Chrome returned:", result);
  await browser.close();
})();
