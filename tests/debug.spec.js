import { test, expect } from '@playwright/test';
test('debug page load', async ({ page }) => {
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) });
  page.on('pageerror', err => errors.push(err.message));
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(2000);
  console.log("ERRORS CAUGHT: ", errors);
});
