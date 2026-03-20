# Jyotish Darshan — Evaluation Framework

## 1. Overview

This document defines a structured evaluation framework for the Jyotish Darshan Vedic birth chart application. It covers three evaluation pillars — **Accuracy**, **Usability**, and **Comprehensiveness** — with concrete test cases and automated methodology for each.

The application is a single-file React 18 app supporting 10 languages (English, Hindi, Kannada, Telugu, Tamil, Sanskrit, Marathi, Gujarati, Bengali, Malayalam) that computes Vedic birth charts from user input (date, time, location).

---

## 2. Evaluation Pillars

### 2.1 Accuracy

Tests that the astronomical computations, Vedic logic, and data transformations produce **correct results** when compared against known reference data.

### 2.2 Usability

Tests that the application is **functional, accessible, and intuitive** across devices, languages, and user flows — including error handling, responsiveness, and i18n completeness.

### 2.3 Comprehensiveness

Tests that the application **covers the full breadth** of Vedic astrology features it claims to support, and that no feature is partially implemented, missing data, or producing empty/placeholder output.

---

## 3. Test Cases

### 3.1 Accuracy Test Cases

#### ACC-01: Planetary Longitude Calculation
- **Description**: Verify sidereal longitudes of all 9 grahas for known birth data against a reference ephemeris (Swiss Ephemeris or Jagannatha Hora).
- **Method**: Compute chart for a set of reference births → compare each planet's longitude to known values.
- **Tolerance**: ±1° for Sun/Moon, ±2° for Mars–Saturn (simplified model), ±0.5° for Rahu/Ketu.
- **Test data**: Minimum 5 reference charts with published planetary positions.
- **Severity**: Critical

#### ACC-02: Lagna (Ascendant) Calculation
- **Description**: Verify the computed Ascendant sign and degree for known lat/lng/time combinations.
- **Method**: Compare `computeAsc()` output against reference lagna from established software.
- **Tolerance**: ±2° (equates to roughly 8 minutes of birth time sensitivity).
- **Test data**: Include tropical, subtropical, and high-latitude locations.
- **Severity**: Critical

#### ACC-03: Lahiri Ayanamsa
- **Description**: Verify the Lahiri Ayanamsa value for several Julian Dates against published tables.
- **Method**: Call `lahiri(jd)` for known dates → compare to IENA (Indian Ephemeris and Nautical Almanac) values.
- **Tolerance**: ±0.01°
- **Test data**: 1950-01-01, 1985-07-15, 2000-01-01, 2024-03-20
- **Severity**: Critical

#### ACC-04: Nakshatra and Pada Assignment
- **Description**: Verify that Moon's nakshatra index, name, lord, and pada are correct for known positions.
- **Method**: For a set of known Moon longitudes, call `nakshatra(lon)` and verify all fields.
- **Tolerance**: Exact match.
- **Test data**: Test boundary cases (e.g., Moon at 0°00', 13°20', 26°40' of Aries).
- **Severity**: Critical

#### ACC-05: Rashi Assignment
- **Description**: Verify that `rashi(lon)` correctly maps longitudes to the 12 signs.
- **Method**: Test boundary values: 0.0°, 29.99°, 30.0°, 359.99°.
- **Tolerance**: Exact match.
- **Severity**: High

#### ACC-06: Vimshottari Dasha Periods
- **Description**: Verify Mahadasha sequence, start/end dates, and Antardasha sub-periods.
- **Method**: Compute dasha for a known chart → compare sequence and date ranges to reference.
- **Tolerance**: ±1 day for period boundaries (floating-point date arithmetic).
- **Test data**: At least 3 reference charts with published dasha tables.
- **Severity**: Critical

#### ACC-07: Combustion Detection
- **Description**: Verify that planets within combustion orbs of the Sun are correctly flagged.
- **Method**: Create scenarios with planets at exact threshold distances from the Sun.
- **Tolerance**: Exact boolean match.
- **Test data**: Mercury at 13° from Sun (combust), Mercury at 14° (not combust), etc.
- **Severity**: Medium

#### ACC-08: Exaltation and Debilitation
- **Description**: Verify that planets in their exaltation/debilitation signs are correctly flagged.
- **Method**: For each planet, place it in its exaltation sign → verify `exalted===true`. Repeat for debilitation.
- **Tolerance**: Exact match.
- **Severity**: High

#### ACC-09: Yoga Detection
- **Description**: Verify that Raja Yogas, Dhana Yogas, and Doshas are correctly identified.
- **Method**: Use chart configurations known to produce specific yogas (e.g., Gajakesari, Mangal Dosha) → verify detection.
- **Test data**: At least 3 charts with known yoga configurations.
- **Severity**: High

#### ACC-10: Shadbala Computation
- **Description**: Verify the six strength components (Sthana, Dig, Kala, Cheshta, Naisargika, Drik) and totals.
- **Method**: Compare computed values against reference Shadbala tables.
- **Tolerance**: ±10 virupas for individual components, ±20 for totals.
- **Severity**: Medium

#### ACC-11: Ashtakavarga Scores
- **Description**: Verify BAV (Bhinnashtakavarga) and SAV (Sarvashtakavarga) values.
- **Method**: Compare against reference software output for known charts.
- **Tolerance**: Exact match for BAV (integer values 0–8), ±1 for SAV totals.
- **Severity**: Medium

#### ACC-12: Divisional Chart (Varga) Calculation
- **Description**: Verify that D1–D60 charts are correctly computed (planet-to-sign mapping).
- **Method**: For D9 (Navamsa), verify sign placement against manual calculation for a known chart.
- **Test data**: Verify at least D1, D9, D10, D12 for 2 reference charts.
- **Severity**: Medium

#### ACC-13: Panchang Accuracy
- **Description**: Verify Tithi, Vara, Nakshatra, Yoga, and Karana for known dates.
- **Method**: Compare against published Panchang data for specific dates and locations.
- **Tolerance**: Exact match for Vara; Tithi/Yoga/Karana should match at the given time.
- **Severity**: Medium

#### ACC-14: Retrograde Detection
- **Description**: Verify that retrograde status is correctly computed for planets with negative speeds.
- **Method**: Test with known retrograde periods (e.g., Mercury retrograde dates).
- **Severity**: Medium

---

### 3.2 Usability Test Cases

#### USB-01: Language Completeness — No English Leaks
- **Description**: For every non-English language, verify that no English text appears in any visible UI element.
- **Method**: For each language, render every tab → scan all visible text nodes → flag any ASCII-only strings longer than 2 characters that aren't numerals, symbols, or proper nouns (e.g., "Jyotish Darshan").
- **Severity**: Critical

#### USB-02: Language Switching Persistence
- **Description**: Verify that the selected language persists across page reloads via localStorage.
- **Method**: Select a non-English language → reload page → verify language is preserved.
- **Severity**: High

#### USB-03: All Tabs Render Without Errors
- **Description**: For a valid chart, every tab (Overview, Charts, Planets, Dasha, Yoga, Shadbala, Ashtakavarga, Expert Reading) must render without JavaScript errors.
- **Method**: Navigate to each tab → check browser console for errors → verify tab content is non-empty.
- **Severity**: Critical

#### USB-04: Input Validation
- **Description**: Verify that the form rejects invalid input and displays localized error messages.
- **Method**: Submit form with missing name, empty date, invalid time, no city selected → verify error messages appear in the selected language.
- **Severity**: High

#### USB-05: City Search and Selection
- **Description**: Verify that the city autocomplete works, returns results, and populates lat/lng/timezone.
- **Method**: Type "Bengaluru" → verify dropdown appears → select city → verify lat/lng are populated.
- **Severity**: Critical

#### USB-06: Chart Generation End-to-End
- **Description**: Verify the full flow: fill form → submit → see results with all tabs populated.
- **Method**: Fill valid birth data → submit → wait for results → verify Overview tab shows chart data.
- **Severity**: Critical

#### USB-07: PDF Download
- **Description**: Verify that the PDF download button produces a valid PDF file.
- **Method**: Generate a chart → click download → verify file is produced and contains chart data.
- **Severity**: High

#### USB-08: Share Link (Copy URL)
- **Description**: Verify that the share button copies a URL that, when loaded, reproduces the same chart.
- **Method**: Generate chart → click share → navigate to copied URL → verify same birth data loads.
- **Severity**: Medium

#### USB-09: South/North Chart Toggle
- **Description**: Verify that toggling between South Indian and North Indian chart styles works on the Charts tab.
- **Method**: Navigate to Charts tab → toggle between formats → verify SVG chart re-renders correctly.
- **Severity**: Medium

#### USB-10: Responsive Layout
- **Description**: Verify the app renders correctly at mobile (375px), tablet (768px), and desktop (1200px) widths.
- **Method**: Set viewport to each width → verify no horizontal overflow, no overlapping elements, all tabs accessible.
- **Severity**: Medium

#### USB-11: Tab Labels Localized
- **Description**: Verify that all 8 tab labels display in the selected language (not English fallback).
- **Method**: For each language, read the text content of all tab buttons → verify they match STRINGS[lang].tabs.* values.
- **Severity**: High

#### USB-12: Error Recovery
- **Description**: Verify that application errors show a friendly error message with a reload button.
- **Method**: Inject a script error → verify the error handler displays the styled error div.
- **Severity**: Low

#### USB-13: Loading States
- **Description**: Verify that the progress bar and loading text display during chart computation.
- **Method**: Start chart generation → verify loading spinner, progress bar, and localized loading text appear.
- **Severity**: Low

#### USB-14: Dasha Period Highlighting
- **Description**: Verify that the current Mahadasha and Antardasha are visually highlighted.
- **Method**: Generate a chart → go to Dasha tab → verify the current period has a distinct background/border.
- **Severity**: Low

---

### 3.3 Comprehensiveness Test Cases

#### CMP-01: All 9 Grahas Present
- **Description**: Verify that the Planets tab shows all 9 Navagrahas (Sun through Ketu) with complete data.
- **Method**: Generate a chart → check Planets table → verify exactly 9 rows with non-empty values in every column.
- **Severity**: Critical

#### CMP-02: All 12 Bhava (Houses) Shown
- **Description**: Verify that all 12 houses are displayed in the Bhava grid with rashi and lord information.
- **Method**: Count house cards in PlanetsTab → verify 12 houses, each with a rashi name and lord.
- **Severity**: High

#### CMP-03: All 16 Divisional Charts
- **Description**: Verify that the Charts tab shows all 16 Shodasha Varga charts (D1–D60).
- **Method**: Count chart thumbnails → verify 16 are present with correct labels (D1, D2, D3, D4, D7, D9, D10, D12, D16, D20, D24, D27, D30, D40, D45, D60).
- **Severity**: High

#### CMP-04: Complete Vimshottari Dasha Timeline
- **Description**: Verify that all 9 Mahadashas are shown with correct planet sequence and year counts totaling 120.
- **Method**: Sum all Mahadasha year values → verify total = 120. Verify planet sequence matches Vimshottari order.
- **Severity**: Critical

#### CMP-05: All Antardasha Sub-Periods
- **Description**: For each Mahadasha, verify that 9 Antardasha sub-periods are listed.
- **Method**: Expand each Mahadasha → count Antardasha entries → verify 9 per Mahadasha.
- **Severity**: High

#### CMP-06: Shadbala — All 6 Components
- **Description**: Verify that all 6 Shadbala components are computed and displayed for each planet.
- **Method**: Check Shadbala table for column completeness → verify no NaN, undefined, or 0 values for all 7 planets.
- **Severity**: High

#### CMP-07: Ashtakavarga — All Planet Rows
- **Description**: Verify that the Ashtakavarga table has rows for all 7 planets (Sun through Saturn) plus SAV totals.
- **Method**: Count rows in Ashtakavarga table → verify 7 BAV rows plus SAV row, each with 12 house values.
- **Severity**: High

#### CMP-08: Panchang — All 5 Elements
- **Description**: Verify that Tithi, Vara, Nakshatra, Yoga, and Karana are all shown and non-empty.
- **Method**: Check the Overview tab's Panchang section → verify all 5 fields are populated.
- **Severity**: Medium

#### CMP-09: Yoga Section Coverage
- **Description**: Verify that Raja Yoga, Dhana Yoga, and Dosha sections are all rendered (even if empty).
- **Method**: Navigate to Yoga tab → verify all 3 section headers exist → if no yogas, verify "no yoga" message displays.
- **Severity**: Medium

#### CMP-10: Expert Reading — All Sections
- **Description**: Verify that the Expert Reading tab shows all 6 sections: Lagna, Chandra, Artha, Kama, Dasha Phala, Moksha.
- **Method**: Count Section components in Expert Reading → verify 6 sections with non-empty titles and text.
- **Severity**: Medium

#### CMP-11: Vargottama Detection
- **Description**: Verify that Vargottama planets (same rashi in D1 and D9) are flagged and displayed.
- **Method**: Use a chart known to have Vargottama planets → verify badge appears in Planets table and callout in Charts tab.
- **Severity**: Medium

#### CMP-12: Planet Status Badges Complete
- **Description**: Verify that all status badges (Retrograde, Combust, Exalted, Debilitated, Vargottama) render correctly.
- **Method**: Use a chart with planets in each status → verify corresponding badges appear with correct localized text.
- **Severity**: Medium

#### CMP-13: 10-Language Coverage in All L_* Dicts
- **Description**: Verify that every localization dictionary (L_RASHI, L_GRAHA, L_ABBR, L_NAKS, L_STATUS, etc.) has entries for all 10 languages.
- **Method**: Parse the source and verify each L_* dictionary has exactly 10 language keys with non-empty arrays/objects.
- **Severity**: High

#### CMP-14: PDF Content Completeness
- **Description**: Verify that the generated PDF contains all major sections: header, birth data, chart SVG, planet table, dasha timeline, yoga list, and shadbala table.
- **Method**: Generate PDF → parse content → verify presence of key sections.
- **Severity**: Medium

---

## 4. Automated Evaluation Methodology

### 4.1 Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Test Runner (Playwright)             │
│                                                       │
│  ┌──────────┐  ┌───────────┐  ┌────────────────────┐│
│  │ Accuracy  │  │ Usability │  │ Comprehensiveness  ││
│  │  Suite    │  │  Suite    │  │  Suite             ││
│  └─────┬────┘  └─────┬─────┘  └──────────┬─────────┘│
│        │              │                    │          │
│  ┌─────▼──────────────▼────────────────────▼───────┐ │
│  │           Page Object Model (POM)               │ │
│  │  InputForm | ResultsPage | Tab Components       │ │
│  └─────────────────────┬───────────────────────────┘ │
│                        │                              │
│  ┌─────────────────────▼───────────────────────────┐ │
│  │          Reference Data (JSON fixtures)          │ │
│  │  Known charts, expected positions, dasha tables  │ │
│  └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### 4.2 Test Automation Stack

| Layer | Tool | Purpose |
|-------|------|---------|
| Test runner | Playwright Test | Browser automation, assertions, parallel execution |
| Server | `npx serve .` or `python3 -m http.server` | Serve the single HTML file locally |
| Reference data | JSON fixtures | Known chart data for accuracy comparison |
| CI | GitHub Actions | Automated runs on push/PR |
| Reporting | Playwright HTML Reporter | Visual test reports with screenshots |

### 4.3 Reference Data Format

Each reference chart fixture contains:

```json
{
  "id": "ref_001",
  "description": "Nehru birth chart — well-documented reference",
  "input": {
    "name": "Test",
    "year": 1889, "month": 11, "day": 14,
    "hour": 23, "minute": 11,
    "lat": 25.4358, "lng": 81.8463,
    "utcOffset": 5.5, "timezone": "Asia/Kolkata",
    "city": "Prayagraj", "country": "India", "gender": "male"
  },
  "expected": {
    "lagna": { "rashi": 3, "degApprox": 20.0, "tolerance": 2.0 },
    "planets": {
      "sun": { "rashi": 7, "degApprox": 29.0, "tolerance": 1.0 },
      "moon": { "rashi": 3, "degApprox": 26.0, "tolerance": 1.0 }
    },
    "ayanamsa": { "value": 22.46, "tolerance": 0.05 },
    "dasha": {
      "birthLord": "mercury",
      "firstMaha": "mercury"
    }
  }
}
```

### 4.4 Methodology by Pillar

#### Accuracy Tests — Automated

1. **Unit-level**: Extract the pure computation functions (`allPlanets`, `lahiri`, `nakshatra`, `dasha_calc`, `rashi`) from the app via `page.evaluate()` and call them directly with known inputs.
2. **Comparison**: Load reference fixtures → compute via the app → compare against expected values using tolerance-based assertions.
3. **Boundary testing**: Systematically test edge cases (0°, 30°, 180°, 360° for longitudes; midnight, noon for times; equator, poles for latitudes).
4. **Cross-validation**: For a subset of test charts, compare against a secondary reference (e.g., Swiss Ephemeris via a Node.js binding or pre-computed tables).

#### Usability Tests — Automated

1. **i18n scanning**: For each of the 10 languages, render the full results page → use `page.evaluate()` to walk the DOM tree and collect all visible text nodes → flag any node containing only ASCII alphabetic characters (excluding known allowlist: "Jyotish Darshan", "D1"–"D60", "PDF", "℞").
2. **Tab navigation**: Programmatically click each tab → verify the content area is non-empty and no console errors appear.
3. **Form validation**: Submit with missing fields → verify error elements appear → verify text matches the selected language.
4. **Responsive testing**: Use `page.setViewportSize()` at 3 breakpoints → screenshot → verify no horizontal scrollbar via `document.documentElement.scrollWidth <= window.innerWidth`.
5. **Accessibility**: Use `@axe-core/playwright` to run automated accessibility checks on each page state.

#### Comprehensiveness Tests — Automated

1. **DOM counting**: After generating a chart, count DOM elements to verify expected quantities (9 planet rows, 12 house cards, 16 chart thumbnails, 9 Mahadasha entries).
2. **Data completeness**: Use `page.evaluate()` to access the React component's computed `K` (Kundali) object and verify all expected properties are non-null and non-empty.
3. **Source analysis**: Parse the HTML source to verify all L_* dictionaries have entries for all 10 language codes, each with the expected number of entries.
4. **Visual regression**: Take screenshots of each tab for each chart style (south/north) → compare against baseline images.

### 4.5 CI/CD Integration

```yaml
# .github/workflows/kundali-tests.yml
name: Kundali Evaluation Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-results
          path: test-results/
```

### 4.6 Scoring Methodology

Each test case is scored on a pass/fail basis with weighted severity:

| Severity | Weight | Impact on Overall Score |
|----------|--------|------------------------|
| Critical | 3 | Blocks release |
| High | 2 | Should fix before release |
| Medium | 1 | Fix in next iteration |
| Low | 0.5 | Nice to have |

**Overall score** = (Σ passed × weight) / (Σ total × weight) × 100

**Release thresholds**:
- All Critical tests must pass (100% Critical pass rate)
- Overall score ≥ 85% for release
- No regression from previous run (score must not decrease)

---

## 5. Test Data — Reference Charts

### Chart 1: Midday Equatorial (Baseline)
- **Date**: 2000-01-01 12:00 UTC
- **Location**: 0°N, 0°E (Gulf of Guinea)
- **Purpose**: Simple baseline for comparing against published ephemeris data

### Chart 2: Bangalore Modern (Typical User)
- **Date**: 1990-07-15 06:30 IST
- **Location**: 12.9716°N, 77.5946°E (Bengaluru)
- **Purpose**: Typical South Indian user case

### Chart 3: Midnight Birth (Edge Case)
- **Date**: 2024-12-31 00:00 IST
- **Location**: 28.6139°N, 77.2090°E (Delhi)
- **Purpose**: Midnight boundary, date rollover, year boundary

### Chart 4: Southern Hemisphere
- **Date**: 1985-03-20 14:30 NZST
- **Location**: -36.8485°S, 174.7633°E (Auckland)
- **Purpose**: Negative latitude, different timezone, lagna calculation edge case

### Chart 5: Historical Chart
- **Date**: 1947-08-15 00:00 IST
- **Location**: 28.6139°N, 77.2090°E (Delhi)
- **Purpose**: Indian Independence — midnight birth, historical validation

---

## 6. Maintenance

- **Reference data** should be reviewed annually against updated ephemeris sources.
- **New features** must include corresponding test cases before merge.
- **Visual baselines** should be regenerated when intentional UI changes are made.
- **Language additions** require updating CMP-13 and USB-01 test counts.

---

*Generated for Jyotish Darshan v1.0 — March 2026*
