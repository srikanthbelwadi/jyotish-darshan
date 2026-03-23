import fs from 'fs';
import { computeKundali } from '../src/engine/vedic.js';
import SwissEph from 'swisseph-wasm';

const benchmarks = [
  {
    "id": 1,
    "subject": "Narendra Modi",
    "category": "Standard IST",
    "date": "1950-09-17",
    "time": "11:00:00",
    "latitude": 23.7833,
    "longitude": 72.6333,
    "offset": 5.5000,
    "expected_output": {
      "ascendant": 211.15, "sun": 150.59, "moon": 218.80, "mars": 210.94, "mercury": 150.77, "jupiter": 306.61, "venus": 135.69, "saturn": 149.65, "rahu": 335.21, "ketu": 155.21
    }
  },
  {
    "id": 2, "subject": "Mahatma Gandhi", "category": "Pre-IST LMT",
    "date": "1869-10-02", "time": "07:11:00", "latitude": 21.6333, "longitude": 69.6000, "offset": 4.6400,
    "expected_output": { "ascendant": 191.95, "sun": 166.91, "moon": 110.20, "mars": 206.38, "mercury": 191.75, "jupiter": 20.61, "venus": 204.38, "saturn": 228.45, "rahu": 102.18, "ketu": 282.18 }
  },
  {
    "id": 3, "subject": "Indira Gandhi", "category": "Late Night Logic",
    "date": "1917-11-19", "time": "23:11:00", "latitude": 25.4500, "longitude": 81.8333, "offset": 5.5000,
    "expected_output": { "ascendant": 117.56, "sun": 214.12, "moon": 275.62, "mars": 136.37, "mercury": 223.24, "jupiter": 45.01, "venus": 261.00, "saturn": 111.78, "rahu": 250.55, "ketu": 70.55 }
  },
  {
    "id": 4, "subject": "Amitabh Bachchan", "category": "War-time IST",
    "date": "1942-10-11", "time": "16:00:00", "latitude": 25.4500, "longitude": 81.8333, "offset": 6.5000,
    "expected_output": { "ascendant": 314.25, "sun": 174.15, "moon": 190.65, "mars": 172.48, "mercury": 179.35, "jupiter": 89.25, "venus": 165.40, "saturn": 49.12, "rahu": 130.45, "ketu": 310.45 }
  },
  {
    "id": 5, "subject": "J.N. Tata", "category": "19th Century India",
    "date": "1839-03-03", "time": "10:15:00", "latitude": 20.9500, "longitude": 72.9167, "offset": 4.8611,
    "expected_output": { "ascendant": 42.50, "sun": 319.85, "moon": 195.12, "mars": 115.30, "mercury": 322.45, "jupiter": 160.25, "venus": 348.10, "saturn": 218.60, "rahu": 32.15, "ketu": 212.15 }
  },
  {
    "id": 6, "subject": "Albert Einstein", "category": "Historical LMT",
    "date": "1879-03-14", "time": "11:30:00", "latitude": 48.4000, "longitude": 10.0000, "offset": 0.6667,
    "expected_output": { "ascendant": 79.40, "sun": 331.50, "moon": 232.50, "mars": 274.90, "mercury": 341.20, "jupiter": 305.50, "venus": 354.90, "saturn": 342.20, "rahu": 278.40, "ketu": 98.40 }
  },
  {
    "id": 7, "subject": "Steve Jobs", "category": "US West Coast DST",
    "date": "1955-02-24", "time": "19:15:00", "latitude": 37.7667, "longitude": -122.4167, "offset": -8.0000,
    "expected_output": { "ascendant": 149.30, "sun": 312.80, "moon": 345.50, "mars": 7.20, "mercury": 292.10, "jupiter": 88.60, "venus": 268.40, "saturn": 208.50, "rahu": 246.30, "ketu": 66.30 }
  },
  {
    "id": 8, "subject": "Bill Gates", "category": "Modern US West Coast",
    "date": "1955-10-28", "time": "22:00:00", "latitude": 47.6000, "longitude": -122.3167, "offset": -8.0000,
    "expected_output": { "ascendant": 74.40, "sun": 191.60, "moon": 346.50, "mars": 168.20, "mercury": 174.50, "jupiter": 125.70, "venus": 198.10, "saturn": 209.50, "rahu": 237.10, "ketu": 57.10 }
  },
  {
    "id": 9, "subject": "Queen Elizabeth II", "category": "European DST (BST)",
    "date": "1926-04-21", "time": "02:40:00", "latitude": 51.5000, "longitude": -0.1167, "offset": 1.0000,
    "expected_output": { "ascendant": 279.10, "sun": 7.40, "moon": 109.80, "mars": 298.50, "mercury": 342.30, "jupiter": 299.70, "venus": 321.40, "saturn": 211.50, "rahu": 86.20, "ketu": 266.20 }
  },
  {
    "id": 10, "subject": "Marilyn Monroe", "category": "US Standard AST",
    "date": "1926-06-01", "time": "09:30:00", "latitude": 34.0500, "longitude": -118.2500, "offset": -8.0000,
    "expected_output": { "ascendant": 101.40, "sun": 47.10, "moon": 286.90, "mars": 328.70, "mercury": 66.80, "jupiter": 304.50, "venus": 16.50, "saturn": 208.90, "rahu": 84.10, "ketu": 264.10 }
  }
];

async function runComparison() {
  const swisseph = new SwissEph();
  await swisseph.initSwissEph();
  swisseph.set_ephe_path(process.cwd() + '/public/sweph');
  
  // Ayanamsa configuration: Lahiri (1)
  swisseph.SweModule.ccall('swe_set_sid_mode', 'void', ['number', 'number', 'number'], [1, 0, 0]);
  const flags = swisseph.SEFLG_SWIEPH | swisseph.SEFLG_SPEED | swisseph.SEFLG_SIDEREAL;

  let report = "# Vedic Astrology Engine Evaluation Results\n\n";

  let oldEnginePass = 0, newEnginePass = 0;
  let oldEngineFails = 0, newEngineFails = 0;
  let totalDataPoints = 0;

  for (const p of benchmarks) {
    report += `## ${p.subject} (${p.category})\n`;
    report += `| Point     | Expected | Old Engine | Diff (Old) | New Engine | Diff (New) |\n`;
    report += `|-----------|----------|------------|------------|------------|------------|\n`;
    
    // 1. Calculate with OLD ENGINE
    const [year, month, day] = p.date.split('-').map(Number);
    const [hh, mm, ss] = p.time.split(':').map(Number);
    
    const k = computeKundali({ year, month, day, hour: hh, minute: mm + (ss||0)/60, utcOffset: p.offset, lat: p.latitude, lng: p.longitude });
    const oldEngineOut = {
      ascendant: k.lagna.longitude,
      sun: k.planets.find(x=>x.key==='sun').longitude,
      moon: k.planets.find(x=>x.key==='moon').longitude,
      mars: k.planets.find(x=>x.key==='mars').longitude,
      mercury: k.planets.find(x=>x.key==='mercury').longitude,
      jupiter: k.planets.find(x=>x.key==='jupiter').longitude,
      venus: k.planets.find(x=>x.key==='venus').longitude,
      saturn: k.planets.find(x=>x.key==='saturn').longitude,
      rahu: k.planets.find(x=>x.key==='rahu').longitude,
      ketu: k.planets.find(x=>x.key==='ketu').longitude
    };

    // 2. Calculate with NEW ENGINE (SWISSEPH)
    const totalMinutes = hh * 60 + mm + (ss || 0) / 60 - Math.round(p.offset * 60);
    // Be careful, some offsets are not pure hours/minutes (e.g. 0.6667 for Einstein).
    // Safer to multiply by 60 for minutes:
    const utcMinutesPrecise = hh * 60 + mm + (ss||0)/60 - (p.offset * 60);
    const uDate = new Date(Date.UTC(year, month - 1, day, 0, Math.round(utcMinutesPrecise), 0));
    const utHour = uDate.getUTCHours() + uDate.getUTCMinutes() / 60;
    const jd_ut = swisseph.julday(uDate.getUTCFullYear(), uDate.getUTCMonth() + 1, uDate.getUTCDate(), utHour, swisseph.SE_GREG_CAL);
    
    const cuspsPtr = swisseph.SweModule._malloc(13 * 8);
    const ascmcPtr = swisseph.SweModule._malloc(10 * 8);
    swisseph.SweModule.ccall('swe_houses', 'number', ['number', 'number', 'number', 'number', 'pointer', 'pointer'], [jd_ut, p.latitude, p.longitude, 'P'.charCodeAt(0), cuspsPtr, ascmcPtr]);
    const asc_trop = new Float64Array(swisseph.SweModule.HEAPF64.buffer, ascmcPtr, 10)[0];
    const ayanamsa = swisseph.SweModule.ccall('swe_get_ayanamsa_ut', 'number', ['number'], [jd_ut]);
    swisseph.SweModule._free(cuspsPtr); swisseph.SweModule._free(ascmcPtr);
    
    const calcPlanet = (bodyId) => swisseph.calc_ut(jd_ut, bodyId, flags)[0];

    const newEngineOut = {
      ascendant: (asc_trop - ayanamsa + 360) % 360,
      sun: calcPlanet(swisseph.SE_SUN),
      moon: calcPlanet(swisseph.SE_MOON),
      mars: calcPlanet(swisseph.SE_MARS),
      mercury: calcPlanet(swisseph.SE_MERCURY),
      jupiter: calcPlanet(swisseph.SE_JUPITER),
      venus: calcPlanet(swisseph.SE_VENUS),
      saturn: calcPlanet(swisseph.SE_SATURN),
      rahu: calcPlanet(swisseph.SE_TRUE_NODE),
    };
    newEngineOut.ketu = (newEngineOut.rahu + 180) % 360;

    const diffCirc = (e, a) => {
        const d = Math.abs(e - a);
        return Math.min(d, 360 - d);
    };

    const keys = Object.keys(p.expected_output);
    for (let k of keys) {
      const exp = p.expected_output[k];
      const oldVal = oldEngineOut[k];
      const newVal = newEngineOut[k];
      
      const oldDiff = diffCirc(exp, oldVal);
      const newDiff = diffCirc(exp, newVal);
      
      totalDataPoints++;
      if (oldDiff <= 0.5) oldEnginePass++; else oldEngineFails++;
      if (newDiff <= 0.5) newEnginePass++; else newEngineFails++; // using 0.5 for tolerance visualization here
      
      report += `| ${k.padEnd(9)} | ${exp.toFixed(2).padStart(8)} | ${oldVal.toFixed(2).padStart(10)} | ${oldDiff.toFixed(2).padStart(10)} | ${newVal.toFixed(2).padStart(10)} | ${newDiff.toFixed(2).padStart(10)} |\n`;
    }
    report += "\n";
  }

  report += `## Summary Statistics (Tolerance < 0.5 degree)\n`;
  report += `- **Old Engine Passes:** ${oldEnginePass}/${totalDataPoints} (${((oldEnginePass/totalDataPoints)*100).toFixed(1)}%)\n`;
  report += `- **New Engine Passes:** ${newEnginePass}/${totalDataPoints} (${((newEnginePass/totalDataPoints)*100).toFixed(1)}%)\n`;

  fs.writeFileSync('tests/benchmark_results.md', report);
  console.log("Evaluation complete. Results written to tests/benchmark_results.md");
}

runComparison().catch(console.error);
