import { test, expect } from '@playwright/test';

test('Test Intl Format', async ({ page }) => {
  await page.goto('about:blank');
  const result = await page.evaluate(() => {
    const tzId = 'Asia/Kolkata';
    const year=2005, month=1, day=31, hour=12, minute=45;
    const d = new Date(Date.UTC(year, month - 1, day, hour, minute));
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: tzId,
      timeZoneName: 'shortOffset'
    }).formatToParts(d);
    const tzName = parts.find(p => p.type === 'timeZoneName')?.value;
    
    if (!tzName || tzName === 'GMT') return '0';
    const match = tzName.match(/GMT([+-]\d+)(?::(\d+))?/);
    if (match) {
      const hrs = parseInt(match[1], 10);
      const mins = match[2] ? parseInt(match[2], 10) : 0;
      return hrs + (hrs < 0 ? -mins/60 : mins/60);
    }
    return tzName;
  });
  console.log("Browser evaluate result:", result);
});
