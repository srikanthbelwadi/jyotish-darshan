import SwissEph from 'swisseph-wasm';
import { setSweTestInstance } from '../src/engine/swissephLoader.js';
import { computeDailyPanchang } from '../src/engine/PanchangCalculator.js';

const swisseph = new SwissEph();
await swisseph.initSwissEph();
const root = process.cwd();
swisseph.set_ephe_path(root + '/public/sweph');
swisseph.SweModule.ccall('swe_set_sid_mode', 'void', ['number', 'number', 'number'], [1, 0, 0]);
setSweTestInstance(swisseph);

for (let i = 0; i <= 24; i++) {
  const dt = new Date(Date.UTC(2024, 7, 18, 18 + i, 30)); // 0:00 to 24:00 IST on Aug 19
  const p = computeDailyPanchang(dt, 28.6139, 77.2090);
  console.log(`Hour ${i}: Tithi ${p.tithi} Festival: ${p.festivalId}`);
}
