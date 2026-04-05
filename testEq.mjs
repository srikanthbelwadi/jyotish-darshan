import { initializeAstroEngine } from './api/engine/swissephLoader.js';

async function test() {
  const swe = await initializeAstroEngine();
  const jd = swe.julday(2024, 1, 1, 12.0, swe.SE_GREG_CAL);
  const eqFlags = swe.SEFLG_SWIEPH | 2048 | 32; // EQUATORIAL | J2000
  const eqRes = swe.calc_ut(jd, swe.SE_SUN, eqFlags);
  console.log("Sun J2000 Equatorial:", eqRes);
}
test().catch(console.error);
