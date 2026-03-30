import { initializeAstroEngine } from './src/engine/swissephLoader.js';
import { generateMuhuratCalendar } from './src/engine/muhuratEngine.js';

async function simulate() {
    const swe = await initializeAstroEngine(() => {});
    
    // Simulate combinations to find how many pairs get 0 days
    let zeroes = 0;
    let total = 0;
    
    // Simplification: test 100 random combinations
    for (let i = 0; i < 100; i++) {
        let nR = Math.floor(Math.random() * 12);
        let nN = Math.floor(Math.random() * 27);
        let pR = Math.floor(Math.random() * 12);
        let pN = Math.floor(Math.random() * 27);
        
        let natal = { moonRashi: nR, nakshatra: nN, lagnaRashi: 0 };
        let partner = { moonRashi: pR, nakshatra: pN, lagnaRashi: 0 };
        
        let days = await generateMuhuratCalendar(swe, "Vivaha (Marriage)", natal, partner, 365);
        if (Object.keys(days).length === 0) {
            zeroes++;
        }
        total++;
    }
    console.log(`Out of ${total} couples, ${zeroes} got EXACTLY 0 days for Marriage.`);
}
simulate();
