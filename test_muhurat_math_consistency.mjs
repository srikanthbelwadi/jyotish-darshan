import { initializeAstroEngine } from './api/engine/swissephLoader.js';
import { generateMuhuratCalendar } from './api/engine/muhuratEngine.js';
import fs from 'fs';

async function runMathTest() {
    console.log("Initializing Swiss Ephemeris Astro Engine...");
    const swe = await initializeAstroEngine(() => {});
    
    // Fixed strict baseline Kundalis that will ban specific planetary alignments and tarabala
    const natalData = { moonRashi: 3, nakshatra: 15, lagnaRashi: 1 };
    const partnerData = { moonRashi: 4, nakshatra: 10, lagnaRashi: 5 };
    
    console.log("Running 365-day mathematical sweep...");
    
    const d1 = await generateMuhuratCalendar(swe, "Vivaha (Marriage)", natalData, partnerData, 365);
    const d2 = await generateMuhuratCalendar(swe, "Griha Pravesh (Housewarming)", natalData, null, 365);
    const d3 = await generateMuhuratCalendar(swe, "Vidyarambha / Aksharabhyasam (Start of Education)", natalData, null, 365);
    
    // Convert maps to sorted arrays to pick top 5 dates to guarantee strict identity
    const p1 = Object.values(d1).sort((a,b) => b.score - a.score).slice(0, 5);
    const p2 = Object.values(d2).sort((a,b) => b.score - a.score).slice(0, 5);
    const p3 = Object.values(d3).sort((a,b) => b.score - a.score).slice(0, 5);

    const outputPayload = {
      "Vivaha_Marriage": p1.map(v => v.date + " Score: " + v.score),
      "Griha_Pravesh": p2.map(v => v.date + " Score: " + v.score),
      "Vidyarambha": p3.map(v => v.date + " Score: " + v.score)
    };
    
    const branch = process.argv[2] || "unknown_branch";
    fs.writeFileSync(`/tmp/${branch}_muhurats.json`, JSON.stringify(outputPayload, null, 2));
    
    console.log(`Saved mathematical output for ${branch} to /tmp/${branch}_muhurats.json`);
    process.exit(0);
}

runMathTest().catch(console.error);
