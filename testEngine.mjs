import { initializeAstroEngine } from './src/engine/swissephLoader.js';
import { generateMuhuratCalendar } from './src/engine/muhuratEngine.js';

async function testMuhurat() {
    console.log("Initializing SwissEph...");
    const swe = await initializeAstroEngine((p, m) => {});
    
    const natalData = {
        moonRashi: 3, // Cancer moon
        nakshatra: 15, // Some nakshatra
        lagnaRashi: 1 // Taurus lagna
    };
    
    console.log("Generating Muhurat for Griha Pravesh...");
    try {
        const days = await generateMuhuratCalendar(swe, "Griha Pravesh (Housewarming)", natalData, null, 365);
        const keys = Object.keys(days);
        console.log(`Successfully generated ${keys.length} valid days!`);
        if (keys.length > 0) {
            console.log("First day:", days[keys[0]]);
        }
    } catch(e) {
        console.error("Crash during generation:", e);
    }
}

testMuhurat();
