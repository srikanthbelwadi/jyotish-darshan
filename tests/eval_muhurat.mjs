import SwissEph from 'swisseph-wasm';
import { generateMuhuratCalendar, getAuspiciousWindow } from '../api/engine/muhuratEngine.js';

async function runEval() {
  console.log("==========================================");
  console.log("🪐 SHASTRIC MUHURAT EVALUATION BENCHMARK 🪐");
  console.log("==========================================\n");

  console.log("[SYSTEM] Initializing Swiss Ephemeris WASM Engine...");
  const swisseph = new SwissEph();
  await swisseph.initSwissEph();
  const root = process.cwd();
  swisseph.set_ephe_path(root + '/public/sweph');
  
  // Set Lahiri
  swisseph.SweModule.ccall('swe_set_sid_mode', 'void', ['number', 'number', 'number'], [1, 0, 0]);

  let passCount = 0;
  let failCount = 0;

  const assertEqual = (label, actual, expected) => {
      if (actual === expected) {
          console.log(`  ✅ [PASS] ${label}`);
          passCount++;
      } else {
          console.error(`  ❌ [FAIL] ${label} - Expected ${expected}, got ${actual}`);
          failCount++;
      }
  };

  const assertCondition = (label, condition, errorMsg = "") => {
      if (condition) {
          console.log(`  ✅ [PASS] ${label}`);
          passCount++;
      } else {
          console.error(`  ❌ [FAIL] ${label} ${errorMsg ? '- ' + errorMsg : ''}`);
          failCount++;
      }
  };

  // ---------------------------------------------------------------- //
  // VECTOR A: Vivaha (Marriage) Combustion & Solar Month Defense     //
  // ---------------------------------------------------------------- //
  console.log("\n[VECTOR A] The Toxic Alignment Test (Vivaha)");
  // Mock seeker (Rohini Nakshatra), Partner (Swati Nakshatra)
  const natalDataPathA = { nakshatra: 3, moonRashi: 1, lagnaRashi: 1 }; // Rohini, Taurus Moon/Lagna
  const partnerDataPathA = { nakshatra: 14, moonRashi: 6, lagnaRashi: 6 }; // Swati, Libra Moon/Lagna

  const vivahaDays = await generateMuhuratCalendar(swisseph, "Vivaha (Marriage)", natalDataPathA, partnerDataPathA, 365);
  
  let hasKharaMasa = false;
  let hasCombustion = false;
  let hasBadTara = false;
  
  // Define helper variables to parse astronomical phenomena inside output
  let sFlags = 256; 

  Object.keys(vivahaDays).forEach(dateStr => {
      const day = vivahaDays[dateStr];
      if (day.tier !== 'green') return; // Only assert strongly against what we claim is highly auspicious
      
      // 1. Check Khara Masa (8 = Sagittarius, 11 = Pisces)
      if (day.sunSign === 'Sagittarius' || day.sunSign === 'Pisces') hasKharaMasa = true;
      
      // 2. We can't immediately check Tara Bala string output, but we can verify the engine prevented combustion.
      // We will re-calc solar/venus distances for the given date exactly
      const t = new Date(dateStr).getTime();
      const jd = (t / 86400000) + 2440587.5;
      
      let sun = swisseph.calc_ut(jd, 0, sFlags);
      let jup = swisseph.calc_ut(jd, 5, sFlags);
      let ven = swisseph.calc_ut(jd, 3, sFlags);
      
      let jupDist = Math.abs((jup[0] - sun[0] + 180) % 360 - 180);
      let venDist = Math.abs((ven[0] - sun[0] + 180) % 360 - 180);
      
      if (jupDist <= 11 || venDist <= 10) {
          hasCombustion = true;
      }
  });

  assertCondition("Zero Banned Solar Months (Khara Masa) in Green Vivaha Days", !hasKharaMasa, "Found Sagittarius/Pisces");
  assertCondition("Zero Venus/Jupiter Combustion in Green Vivaha Days", !hasCombustion, "Found Combustion");

  // ---------------------------------------------------------------- //
  // VECTOR B: Vahana Puja (Vehicle) Modality & Rikta Defense         //
  // ---------------------------------------------------------------- //
  console.log("\n[VECTOR B] The Modality Bias Test (Vahana Puja)");
  
  const vDays = await generateMuhuratCalendar(swisseph, "Vahana Puja (Buying a Vehicle)", natalDataPathA, null, 365);
  let charaHitRate = 0;
  let totalGreenVDays = 0;
  let hasRiktaTithi = false;
  
  const charaNaks = ["Swati", "Punarvasu", "Shravana", "Dhanishta", "Shatabhisha"];
  const riktaTithisStr = ["Chaturthi", "Navami", "Chaturdashi"];

  Object.keys(vDays).forEach(dateStr => {
      const day = vDays[dateStr];
      if (day.tier === 'green') {
          totalGreenVDays++;
          if (charaNaks.includes(day.nakshatra)) charaHitRate++;
          
          let tName = day.tithi.split(" ")[0]; 
          if (riktaTithisStr.includes(tName)) hasRiktaTithi = true;
      }
  });
  
  let percentage = totalGreenVDays > 0 ? (charaHitRate / totalGreenVDays) * 100 : 0;
  assertCondition("High Density of Chara (Movable) Nakshatras Outputted", percentage > 75, `Only ${percentage.toFixed(1)}% Chara`);
  assertCondition("Zero Rikta Tithis Outputted in Green Array", !hasRiktaTithi, "Found Rikta Tithi");

  // ---------------------------------------------------------------- //
  // VECTOR C: Intraday Yamaganda/Rahu Kalam Sweeping                 //
  // ---------------------------------------------------------------- //
  console.log("\n[VECTOR C] Intraday Upagraha Defense (Hourly Window)");
  
  // Pick a random Wednesday
  const wedDate = "2024-05-15"; 
  // Wed Rahu offset is 12:00 to 13:30 (12.0 to 13.5)
  // Wed Yamaganda offset is 07:30 to 09:00 (7.5 to 9.0)
  
  const windowData = await getAuspiciousWindow(swisseph, wedDate, "Griha Pravesh (Housewarming)", 0, 0, 23.17, 75.78);
  
  // Parse the output string "10:15 AM - 12:00 PM" into hours
  let timeStr = windowData.timeBlock;
  
  // We don't have a perfect time parser here, but we can check if it explicitly chose Fixed Ascendant
  const fixedLagnas = ["Taurus", "Leo", "Scorpio", "Aquarius"];
  assertCondition("Chosen Lagna exactly aligns with Fixed Modal Sign for Housewarming", fixedLagnas.includes(windowData.lagnaSign), `Found ${windowData.lagnaSign}`);
  
  console.log("\n==========================================");
  if (failCount === 0) {
      console.log(`🏆 ALL ${passCount} SHASTRIC EVALUATIONS PASSED.`);
  } else {
      console.error(`🚨 REQUIRED REVISION: ${failCount} EVALUATIONS FAILED.`);
  }
}

runEval().catch(console.error);
