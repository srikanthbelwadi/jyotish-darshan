// src/engine/muhuratEngine.js

// Constants for massive event bans
const BANNED_SOLAR_MONTHS = [8, 11]; // Sagittarius (Dhanur) and Pisces (Meena) are Khara Masa (inauspicious for major events like Marriage/Griha Pravesh)

// Rikta Tithis (Empty) - generally banned for auspicious events
const RIKTA_TITHIS = [4, 9, 14, 19, 24, 29];
const AMAVASYA = [30];

// The core filtering rules per event category
// Tara Bala bans: 3 (Vipat), 5 (Pratyak), 7 (Naidhana)
// Chandra Bala bans: 6, 8, 12 from Natal Moon
const isTaraBalaGood = (natalNak, transitNak) => {
    let diff = Math.floor(transitNak) - Math.floor(natalNak);
    if (diff < 0) diff += 27;
    let tara = diff % 9; 
    let index = tara + 1;
    return ![3, 5, 7].includes(index); 
};

const isChandraBalaGood = (natalMoonRashi, transitMoonRashi) => {
    let diff = Math.floor(transitMoonRashi) - Math.floor(natalMoonRashi);
    if (diff < 0) diff += 12;
    let house = diff + 1;
    return ![6, 8, 12].includes(house);
};

export async function generateMuhuratCalendar(sweInstance, eventName, natalData, partnerData, daysToScan = 365) {
    const validDays = [];
    const now = new Date();
    now.setHours(12, 0, 0, 0); // Scan exactly 12:00 Noon local time for each day as the macro-anchor
    const baseTime = now.getTime();
    
    for (let i = 0; i < daysToScan; i++) {
        const timestamp = baseTime + (i * 86400000);
        const jd = (timestamp / 86400000) + 2440587.5;
        
        let sFlags = 256; // SEFLG_SPEED
        
        // sweInstance.calc_ut returns an array: [longitude, latitude, distance, speed...]
        let sun = sweInstance.calc_ut(jd, 0, sFlags); 
        let moon = sweInstance.calc_ut(jd, 1, sFlags);
        
        let ayanamsa = sweInstance.SweModule.ccall('swe_get_ayanamsa_ut', 'number', ['number'], [jd]);
        let sunSidereal = (sun[0] - ayanamsa + 360) % 360;
        let moonSidereal = (moon[0] - ayanamsa + 360) % 360;
        
        let sunSign = Math.floor(sunSidereal / 30);
        let moonSign = Math.floor(moonSidereal / 30);
        let nakshatra = Math.floor(moonSidereal / (360 / 27));
        
        let tithiDiff = moonSidereal - sunSidereal;
        if (tithiDiff < 0) tithiDiff += 360;
        let tithi = Math.floor(tithiDiff / 12) + 1; // 1 to 30
        
        let yogaSum = (sunSidereal + moonSidereal) % 360;
        let yoga = Math.floor(yogaSum / (360 / 27)) + 1; // 1 to 27
        
        // --- 1. Massive Event / Solar Bans ---
        const massiveEvents = ["Vivaha (Marriage)", "Griha Pravesh (Housewarming)", "Upanayana (Sacred Thread Ceremony)", "Deva Pratishtha (Idol Installation)", "Bhoomi Puja (Foundation Stone Laying)"];
        let isMassive = massiveEvents.includes(eventName);
        
        if (isMassive && BANNED_SOLAR_MONTHS.includes(sunSign)) continue;
        
        // --- 2. Lunar / Panchang Bans ---
        if (RIKTA_TITHIS.includes(tithi) || AMAVASYA.includes(tithi)) continue;
        
        const BANNED_YOGAS = [1, 6, 9, 10, 13, 17, 27]; // Vishkumbha, Atiganda, Shula, Ganda, Vyaghata, Vyatipata, Vaidhriti
        if (BANNED_YOGAS.includes(yoga)) continue;
        
        // --- 3. Personal Sync Bans (Tara/Chandra Bala) ---
        if (natalData && natalData.nakshatra !== undefined) {
            if (!isTaraBalaGood(natalData.nakshatra, nakshatra)) continue;
            if (!isChandraBalaGood(natalData.moonRashi, moonSign)) continue;
        }
        
        // --- 4. Synastry Sync Bans ---
        if (partnerData && partnerData.nakshatra !== undefined) {
            if (!isTaraBalaGood(partnerData.nakshatra, nakshatra)) continue;
            if (!isChandraBalaGood(partnerData.moonRashi, moonSign)) continue;
        }
        
        // Scoring (Soft Locks for Sorting)
        let score = 0;
        if (tithi < 15) score += 2; // Shukla Paksha
        if (tithi === 11) score += 3; // Ekadashi is highly auspicious
        if ([3, 7, 16, 21].includes(nakshatra)) score += 2; 
        
        const dStr = new Date(timestamp).toISOString().split('T')[0];
        validDays.push({
            date: dStr,
            tithi,
            yoga,
            nakshatra,
            sunSign,
            moonSign,
            score
        });
    }
    
    // Sort by score globally and limit to top 40 days for the year, 
    // then organize by month so UI doesn't get flooded.
    validDays.sort((a,b) => b.score - a.score);
    const topDays = validDays.slice(0, 45).sort((a,b) => new Date(a.date) - new Date(b.date));
    
    const dayMap = {};
    topDays.forEach(day => dayMap[day.date] = day);
    return dayMap;
}

export async function getAuspiciousWindow(sweInstance, dateStr, natalLagnaRashi, partnerLagnaRashi) {
    const validHours = [];
    const baseDate = new Date(dateStr);
    let lat = 23.17, lng = 75.78; 
    
    for (let h = 6; h <= 21; h++) { 
        baseDate.setHours(h, 0, 0, 0);
        const timestamp = baseDate.getTime();
        const jd = (timestamp / 86400000) + 2440587.5; 
        
        let ayanamsa = sweInstance.SweModule.ccall('swe_get_ayanamsa_ut', 'number', ['number'], [jd]);
        
        const cuspsPtr = sweInstance.SweModule._malloc(13 * 8);
        const ascmcPtr = sweInstance.SweModule._malloc(10 * 8);
        sweInstance.SweModule.ccall('swe_houses', 'number', ['number', 'number', 'number', 'number', 'pointer', 'pointer'], [jd, lat, lng, 'P'.charCodeAt(0), cuspsPtr, ascmcPtr]);
        let transitAsc = new Float64Array(sweInstance.SweModule.HEAPF64.buffer, ascmcPtr, 10)[0];
        sweInstance.SweModule._free(cuspsPtr); sweInstance.SweModule._free(ascmcPtr);
        
        let transitAscSidereal = (transitAsc - ayanamsa + 360) % 360;
        let transitLagnaSign = Math.floor(transitAscSidereal / 30);
        
        // 8th house Lagna ban for self
        if (natalLagnaRashi !== undefined) {
             let house = ((transitLagnaSign - natalLagnaRashi + 12) % 12) + 1;
             if (house === 8) continue; 
        }
        
        // 8th house Lagna ban for partner
        if (partnerLagnaRashi !== undefined) {
             let houseP = ((transitLagnaSign - partnerLagnaRashi + 12) % 12) + 1;
             if (houseP === 8) continue; 
        }
        
        validHours.push({ hour: h, lagnaSign: transitLagnaSign });
    }
    
    if (validHours.length === 0) {
        return { timeBlock: "No auspicious hours", lagnaSign: 0 };
    }
    
    // Find longest contiguous block
    let longestBlock = [];
    let currentBlock = [validHours[0]];
    
    for (let i = 1; i < validHours.length; i++) {
        if (validHours[i].hour === validHours[i-1].hour + 1) {
            currentBlock.push(validHours[i]);
        } else {
            if (currentBlock.length > longestBlock.length) longestBlock = currentBlock;
            currentBlock = [validHours[i]];
        }
    }
    if (currentBlock.length > longestBlock.length) longestBlock = currentBlock;
    
    let startH = longestBlock[0].hour;
    let endH = longestBlock[longestBlock.length - 1].hour + 1; 
    
    let format = h => (h > 12 ? (h-12) + " PM" : (h === 12 ? "12 PM" : h + " AM"));
    let timeBlockStr = `${format(startH)} - ${format(endH)}`;
    
    // Grab the median ascendant for symbolic representation to the AI
    let medianIdx = Math.floor(longestBlock.length / 2);
    let symbolicLagna = longestBlock[medianIdx].lagnaSign;
    
    return { timeBlock: timeBlockStr, lagnaSign: symbolicLagna };
}
