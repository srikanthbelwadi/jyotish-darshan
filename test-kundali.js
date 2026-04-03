import { computeKundali } from './api/engine/vedic.js';
import { initializeAstroEngine } from './api/engine/swissephLoader.js';

async function run() {
  await initializeAstroEngine();
  const res = computeKundali({
    year: 1990, month: 1, day: 1, hour: 12, minute: 0,
    utcOffset: 5.5, lat: 28.6, lng: 77.2
  });
  console.log(JSON.stringify(res.divisionalCharts.D9, null, 2));
}

run().catch(console.error);
