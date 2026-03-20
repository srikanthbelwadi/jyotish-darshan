/**
 * Shared helpers for Jyotish Darshan Playwright tests.
 *
 * Provides a Page Object Model for interacting with the single-page app:
 *  - generateChart(): fills the form and submits with known birth data
 *  - switchLanguage(): changes the UI language
 *  - navigateTab(): clicks a result tab
 *  - getComputedKundali(): extracts the full Kundali object from React state
 */

/**
 * Generate a Vedic chart by injecting birth data directly via the app's
 * internal computeKundali() function (bypasses city search API dependency).
 *
 * Returns the full Kundali result object.
 */
export async function generateChartDirect(page, input) {
  return await page.evaluate((inp) => {
    // Access the app's global computation functions
    // These are defined in the <script type="text/babel"> block and available on window scope
    const jd = toJD(inp.year, inp.month, inp.day, inp.hour, inp.minute, inp.utcOffset);
    const K = computeKundali(
      inp.year, inp.month, inp.day,
      inp.hour, inp.minute,
      inp.lat, inp.lng,
      inp.utcOffset, inp.timezone,
      inp.city, inp.country, inp.gender
    );
    return K;
  }, input);
}

/**
 * Fill the input form with birth data and submit.
 * NOTE: This requires the city autocomplete API to be available.
 * For offline/CI testing, prefer generateChartDirect().
 */
export async function fillFormAndSubmit(page, input) {
  // Fill name
  const nameInput = page.locator('input[type="text"]').first();
  await nameInput.fill(input.name || 'Test User');

  // Fill date
  await page.locator('input[type="date"]').fill(
    `${input.year}-${String(input.month).padStart(2, '0')}-${String(input.day).padStart(2, '0')}`
  );

  // Fill time
  await page.locator('input[type="time"]').fill(
    `${String(input.hour).padStart(2, '0')}:${String(input.minute).padStart(2, '0')}`
  );

  // Gender selection
  const genderBtn = page.locator(`button`).filter({ hasText: new RegExp(input.gender, 'i') });
  if (await genderBtn.count() > 0) {
    await genderBtn.first().click();
  }

  // City search (type and select first result)
  const cityInput = page.locator('input[placeholder]').last();
  await cityInput.fill(input.city);
  // Wait for autocomplete dropdown
  await page.waitForTimeout(1500);
  const suggestion = page.locator('[style*="cursor:pointer"]').first();
  if (await suggestion.count() > 0) {
    await suggestion.click();
  }

  // Submit
  await page.locator('button[type="submit"]').click();

  // Wait for results to appear
  await page.waitForSelector('header', { timeout: 30_000 });
}

/**
 * Switch the app's language using the dropdown.
 */
export async function switchLanguage(page, langCode) {
  const select = page.locator('select');
  if (await select.count() > 0) {
    await select.selectOption(langCode);
    await page.waitForTimeout(300);
  }
}

/**
 * Navigate to a specific tab by its id.
 * Tab ids: overview, charts, planets, dasha, yoga, shadbala, avarga, reading
 */
export async function navigateTab(page, tabId) {
  // Tabs are buttons; find by the tab's key in TABS_DEF
  const tabButtons = page.locator('button').filter({ hasText: /.+/ });
  // Use a more specific selector — tabs have icons + text
  const tabButton = page.locator(`button`).filter({
    has: page.locator(`text=/${tabId}/i`)
  });

  // Fallback: click tab by position based on TABS_DEF order
  const TAB_ORDER = ['overview', 'charts', 'planets', 'dasha', 'yoga', 'shadbala', 'avarga', 'reading'];
  const idx = TAB_ORDER.indexOf(tabId);
  if (idx >= 0) {
    const tabs = page.locator('[style*="sticky"][style*="top:51px"] button');
    if (await tabs.count() >= idx + 1) {
      await tabs.nth(idx).click();
      await page.waitForTimeout(300);
    }
  }
}

/**
 * Collect all visible text nodes from the page.
 * Returns an array of {text, tagName, xpath} objects.
 */
export async function collectVisibleText(page) {
  return await page.evaluate(() => {
    const results = [];
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          const el = node.parentElement;
          if (!el) return NodeFilter.FILTER_REJECT;
          const style = window.getComputedStyle(el);
          if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
            return NodeFilter.FILTER_REJECT;
          }
          if (node.textContent.trim().length === 0) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );
    let node;
    while ((node = walker.nextNode())) {
      const text = node.textContent.trim();
      if (text) {
        results.push({
          text,
          tagName: node.parentElement?.tagName || 'UNKNOWN',
        });
      }
    }
    return results;
  });
}

/**
 * Check if a string looks like English text (not numbers, symbols, or proper nouns).
 */
export function looksLikeEnglish(text) {
  // Allowlist: app name, chart codes, symbols
  const ALLOWLIST = [
    'Jyotish Darshan', 'PDF', '℞',
    /^D\d+$/, // D1, D9, etc.
    /^[0-9°′″.:,–—\-\/\s\(\)×+%]+$/, // Numbers, symbols, dates
    /^[☀⊞◇⏳🔮⚖🔢📜💼💫🌟🌙🪷⚠️👑💰✦✓]+$/, // Emojis/symbols
    /^[A-Z]{1,2}$/, // Short abbreviations like "N", "E"
    /^\d+[°'"]/, // Degree notations
    /^(UTC|IST|GMT)/, // Timezone abbreviations
  ];

  const trimmed = text.trim();
  if (trimmed.length <= 1) return false;

  for (const pattern of ALLOWLIST) {
    if (typeof pattern === 'string' && trimmed.includes(pattern)) return false;
    if (pattern instanceof RegExp && pattern.test(trimmed)) return false;
  }

  // Check if the text is purely ASCII alphabetic (English indicator)
  const asciiLetters = trimmed.replace(/[^a-zA-Z]/g, '');
  const nonAscii = trimmed.replace(/[\x00-\x7F]/g, '');

  // If more than 60% ASCII letters and no non-ASCII characters → likely English
  if (asciiLetters.length > 2 && nonAscii.length === 0 && asciiLetters.length / trimmed.length > 0.6) {
    return true;
  }

  return false;
}

/**
 * Language codes and their script patterns for validation.
 */
export const LANG_SCRIPTS = {
  hi: /[\u0900-\u097F]/, // Devanagari
  kn: /[\u0C80-\u0CFF]/, // Kannada
  te: /[\u0C00-\u0C7F]/, // Telugu
  ta: /[\u0B80-\u0BFF]/, // Tamil
  sa: /[\u0900-\u097F]/, // Sanskrit (Devanagari)
  mr: /[\u0900-\u097F]/, // Marathi (Devanagari)
  gu: /[\u0A80-\u0AFF]/, // Gujarati
  bn: /[\u0980-\u09FF]/, // Bengali
  ml: /[\u0D00-\u0D7F]/, // Malayalam
};
