import SwissEph from 'swisseph-wasm';

const benchmarks = [
  {
    "id": 6,
    "subject": "Narendra Modi",
    "category": "Standard IST",
    "date": "1950-09-17",
    "time": "11:00:00",
    "latitude": 23.7833,
    "longitude": 72.6333,
    "offset": 5.5000,
    "expected_output": {
      "ascendant": 211.15,
      "sun": 150.59,
      "moon": 218.80,
      "mars": 210.94,
      "mercury": 150.77,
      "jupiter": 306.61,
      "venus": 135.69,
      "saturn": 149.65,
      "rahu": 335.21,
      "ketu": 155.21
    }
  },
  {
    "id": 8,
    "subject": "Mahatma Gandhi",
    "category": "Pre-IST LMT",
    "date": "1869-10-02",
    "time": "07:11:00",
    "latitude": 21.6333,
    "longitude": 69.6000,
    "offset": 4.6400,
    "expected_output": {
      "ascendant": 191.95,
      "sun": 166.91,
      "moon": 110.20,
      "mars": 206.38,
      "mercury": 191.75,
      "jupiter": 20.61,
      "venus": 204.38,
      "saturn": 228.45,
      "rahu": 102.18,
      "ketu": 282.18
    }
  },
  {
    "id": 9,
    "subject": "Indira Gandhi",
    "category": "Late Night Logic",
    "date": "1917-11-19",
    "time": "23:11:00",
    "latitude": 25.4500,
    "longitude": 81.8333,
    "offset": 5.5000,
    "expected_output": {
      "ascendant": 117.56,
      "sun": 214.12,
      "moon": 275.62,
      "mars": 136.37,
      "mercury": 223.24,
      "jupiter": 45.01,
      "venus": 261.00,
      "saturn": 111.78,
      "rahu": 250.55,
      "ketu": 70.55
    }
  },
  {
    "id": 7,
    "subject": "Amitabh Bachchan",
    "category": "War-time IST",
    "date": "1942-10-11",
    "time": "16:00:00",
    "latitude": 25.4500,
    "longitude": 81.8333,
    "offset": 6.5000,
    "expected_output": {
      "ascendant": 314.25,
      "sun": 174.15,
      "moon": 190.65,
      "mars": 172.48,
      "mercury": 179.35,
      "jupiter": 89.25,
      "venus": 165.40,
      "saturn": 49.12,
      "rahu": 130.45,
      "ketu": 310.45
    }
  },
  {
    "id": 10,
    "subject": "J.N. Tata",
    "category": "19th Century India",
    "date": "1839-03-03",
    "time": "10:15:00",
    "latitude": 20.9500,
    "longitude": 72.9167,
    "offset": 4.8611,
    "expected_output": {
      "ascendant": 42.50,
      "sun": 319.85,
      "moon": 195.12,
      "mars": 115.30,
      "mercury": 322.45,
      "jupiter": 160.25,
      "venus": 348.10,
      "saturn": 218.60,
      "rahu": 32.15,
      "ketu": 212.15
    }
  }
];

async function runEval() {
  console.log("Initializing Swiss Ephemeris WASM Engine...");
  
  const swisseph = new SwissEph();
  await swisseph.initSwissEph();
  
  // Point to the downloaded 18MB sepl_18.se1 files in our local directory
  const root = process.cwd();
  swisseph.set_ephe_path(root + '/public/sweph');
  
  // Ayanamsa configuration: Lahiri (1)
  swisseph.SweModule.ccall('swe_set_sid_mode', 'void', ['number', 'number', 'number'], [1, 0, 0]);

  const flags = swisseph.SEFLG_SWIEPH | swisseph.SEFLG_SPEED | swisseph.SEFLG_SIDEREAL;
  
  let totalErrors = 0;

  for (const p of benchmarks) {
    console.log(`\nEvaluating: ${p.subject} (${p.category})`);
    const [year, month, day] = p.date.split('-').map(Number);
    const [hh, mm, ss] = p.time.split(':').map(Number);
    
    // Correctly normalize UTC Date
    const totalMinutes = hh * 60 + mm + (ss || 0) / 60 - Math.round(p.offset * 60);
    let uDate = new Date(Date.UTC(year, month - 1, day, 0, totalMinutes, 0));
    let uYear = uDate.getUTCFullYear();
    let uMonth = uDate.getUTCMonth() + 1;
    let uDay = uDate.getUTCDate();
    let utHour = uDate.getUTCHours() + uDate.getUTCMinutes() / 60 + uDate.getUTCSeconds() / 3600;

    // Julian Day UT
    const jd_ut = swisseph.julday(uYear, uMonth, uDay, utHour, swisseph.SE_GREG_CAL);
    
    // Calculate Ascendant
    const hsys = 'P'; // Placidus
    const cuspsPtr = swisseph.SweModule._malloc(13 * 8);
    const ascmcPtr = swisseph.SweModule._malloc(10 * 8);
    swisseph.SweModule.ccall('swe_houses', 'number', 
        ['number', 'number', 'number', 'number', 'pointer', 'pointer'], 
        [jd_ut, p.latitude, p.longitude, hsys.charCodeAt(0), cuspsPtr, ascmcPtr]
    );
    // Ascendant is ascmc[0] in tropical. We must convert tropical asc to sidereal
    const ascmc_trop = new Float64Array(swisseph.SweModule.HEAPF64.buffer, ascmcPtr, 10);
    const asc_trop = ascmc_trop[0];
    const ayanamsa = swisseph.SweModule.ccall('swe_get_ayanamsa_ut', 'number', ['number'], [jd_ut]);
    let act_asc = asc_trop - ayanamsa;
    if (act_asc < 0) act_asc += 360;
    
    swisseph.SweModule._free(cuspsPtr);
    swisseph.SweModule._free(ascmcPtr);

    const calcPlanet = (bodyId) => {
      const res = swisseph.calc_ut(jd_ut, bodyId, flags);
      return res[0]; // longitude
    };

    const actual = {
      ascendant: act_asc,
      sun: calcPlanet(swisseph.SE_SUN),
      moon: calcPlanet(swisseph.SE_MOON),
      mars: calcPlanet(swisseph.SE_MARS),
      mercury: calcPlanet(swisseph.SE_MERCURY),
      jupiter: calcPlanet(swisseph.SE_JUPITER),
      venus: calcPlanet(swisseph.SE_VENUS),
      saturn: calcPlanet(swisseph.SE_SATURN),
      rahu: calcPlanet(swisseph.SE_TRUE_NODE), 
    };
    actual.ketu = (actual.rahu + 180) % 360;

    const keys = Object.keys(p.expected_output);
    for (let k of keys) {
      const exp = p.expected_output[k];
      const act = actual[k];
      const diff = Math.min(Math.abs(exp - act), 360 - Math.abs(exp - act));
      if (diff > 0.05) { // Error greater than 3 arcminutes
        console.error(`  [FAIL] ${k}: Expected ${exp.toFixed(2)}, got ${act.toFixed(2)} (diff: ${diff.toFixed(2)})`);
        totalErrors++;
      } else {
        console.log(`  [PASS] ${k}: ${act.toFixed(2)}`);
      }
    }
  }
  
  if (totalErrors === 0) {
    console.log("\n✅ WebAssembly Swiss Ephemeris Evaluation Passed! High-precision achieved.");
  } else {
    console.error(`\n❌ Failed with ${totalErrors} discrepancies over 0.05 degrees.`);
  }
}

runEval().catch(console.error);
