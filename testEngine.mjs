import { initializeAstroEngine } from './src/engine/swissephLoader.js';
import { generateMuhuratCalendar } from './src/engine/muhuratEngine.js';

async function testMuhurat() {
    console.log("Loading swisseph...");
    const swe = await initializeAstroEngine(() => {});
    const natalData = { moonRashi: 3, nakshatra: 15, lagnaRashi: 1 };
    
    // Test Vivaha with partner Data
    const partnerData = { moonRashi: 4, nakshatra: 10, lagnaRashi: 5 };
    
    try {
        const d1 = await generateMuhuratCalendar(swe, "Vivaha (Marriage)", natalData, partnerData, 365);
        console.log(`Vivaha Days: ${Object.keys(d1).length}`);
        
        const d2 = await generateMuhuratCalendar(swe, "Griha Pravesh (Housewarming)", natalData, null, 365);
        console.log(`Griha Pravesh Days: ${Object.keys(d2).length}`);
    } catch(e) {
        console.error("Crash:", e);
    }
}
testMuhurat();
