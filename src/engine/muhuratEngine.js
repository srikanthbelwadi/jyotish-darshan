// src/engine/muhuratEngine.js

const NAKSHATRAS = ["Ashwini","Bharani","Krittika","Rohini","Mrigashira","Ardra","Punarvasu","Pushya","Ashlesha","Magha","Purva Phalguni","Uttara Phalguni","Hasta","Chitra","Swati","Vishakha","Anuradha","Jyeshtha","Mula","Purva Ashadha","Uttara Ashadha","Shravana","Dhanishta","Shatabhisha","Purva Bhadrapada","Uttara Bhadrapada","Revati"];
const TITHIS = ["Pratipada","Dwitiya","Tritiya","Chaturthi","Panchami","Shashthi","Saptami","Ashtami","Navami","Dashami","Ekadashi","Dwadashi","Trayodashi","Chaturdashi","Purnima","Pratipada","Dwitiya","Tritiya","Chaturthi","Panchami","Shashthi","Saptami","Ashtami","Navami","Dashami","Ekadashi","Dwadashi","Trayodashi","Chaturdashi","Amavasya"];
const RASHIS = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];

// Constants for massive event bans
const BANNED_SOLAR_MONTHS = [8, 11]; // Sagittarius (Dhanur) and Pisces (Meena) are Khara Masa

// Rikta Tithis (Empty) - generally banned for auspicious events
const RIKTA_TITHIS = [4, 9, 14, 19, 24, 29];
const AMAVASYA = [30];
const BANNED_YOGAS = [1, 6, 9, 10, 13, 17, 27]; // Vishkumbha, Atiganda, Shula, Ganda, Vyaghata, Vyatipata, Vaidhriti

// Event specific constraints
// naks: 0=Ashwini, 1=Bharani... 26=Revati
// days: 0=Sunday, 1=Monday... 6=Saturday
const EVENT_RULES = {
  "Simantonnayana (Baby Shower / Godh Bharai)": {
    naks: [3, 4, 7, 21, 6], days: [1, 3, 4, 5], combCheck: false
  },
  "Namakarana (Naming Ceremony)": {
    naks: [0, 3, 4, 7, 12, 14, 16, 21, 23, 26], days: [1, 3, 4, 5], combCheck: false
  },
  "Annaprashana (First Solid Food)": {
    naks: [0, 3, 4, 7, 8, 11, 12, 13, 14, 16, 20, 21, 22, 23, 25, 26], days: [1, 3, 4, 5], combCheck: false
  },
  "Mundan / Chudakarana (First Haircut)": {
    naks: [0, 4, 7, 12, 6, 13, 14, 21, 22, 23], days: [1, 3, 4, 5], combCheck: false 
  },
  "Karnavedha (Ear Piercing)": {
    naks: [4, 5, 6, 7, 12, 13, 21, 22, 0], days: [1, 3, 4, 5], combCheck: false
  },
  "Vidyarambha / Aksharabhyasam (Start of Education)": {
    naks: [0, 6, 7, 12, 13, 14, 21, 26], days: [3, 4, 5], combCheck: false
  },
  "Upanayana (Sacred Thread Ceremony)": {
    naks: [0, 3, 4, 6, 7, 12, 13, 14, 16, 21, 22, 26], days: [3, 4, 5], combCheck: true, reqSolarMonths: [0, 1, 2, 9, 10, 11]
  },
  "Vivaha (Marriage)": {
    naks: [3, 4, 11, 12, 14, 16, 18, 20, 25, 26], days: [1, 3, 4, 5, 6], combCheck: true, banSolarMonths: BANNED_SOLAR_MONTHS
  },
  "Sagai / Mangni (Engagement)": {
    naks: [3, 4, 11, 12, 14, 16, 18, 20, 25, 26], days: [1, 3, 4, 5, 6], combCheck: true
  },
  "Bhoomi Puja (Foundation Stone Laying)": {
    naks: [3, 11, 20, 25], days: [1, 3, 4, 5], combCheck: true, banSolarMonths: BANNED_SOLAR_MONTHS
  },
  "Griha Pravesh (Housewarming)": {
    naks: [3, 4, 11, 20, 25], days: [1, 3, 4, 5, 6], combCheck: true, banSolarMonths: BANNED_SOLAR_MONTHS
  },
  "Deva Pratishtha (Idol Installation)": {
    naks: [3, 7, 11, 20, 25], days: [1, 3, 4, 5], combCheck: true
  },
  "Shanti Puja (Pacification Rituals)": {
    naks: [], days: [], combCheck: false // Allows anything mostly depending on dosha, fallback to basic panchang shuddhi
  },
  "Vyapar Arambh (Starting a Business)": {
    naks: [0, 7, 13, 14, 16, 26], days: [3, 4, 5], combCheck: false
  },
  "Sampatti Kharidi (Property Purchase)": {
    naks: [4, 6, 8, 9, 10, 15, 18, 19, 24, 26], days: [4, 5], combCheck: false
  },
  "Vahana Puja (Buying a Vehicle)": {
    naks: [6, 14, 21, 22, 23], days: [3, 4, 5], combCheck: false
  },
  "Swarna / Abhushan Kharidi (Buying Gold)": {
    naks: [7, 11, 26], days: [3, 4, 5], combCheck: false
  },
  "Yatra (Significant Journeys)": {
    naks: [0, 7, 12, 14, 16, 21, 22, 26], days: [1, 3, 4, 5, 6], combCheck: false // Directional bans are complex, but we filter basic chara naks here
  }
};

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

// A small async sleep to allow UI to breathe
const yieldToMain = () => new Promise(resolve => setTimeout(resolve, 0));

export async function generateMuhuratCalendar(sweInstance, eventName, natalData, partnerData, daysToScan = 365) {
    const validDays = [];
    const now = new Date();
    now.setHours(12, 0, 0, 0); 
    const baseTime = now.getTime();
    
    const rules = EVENT_RULES[eventName] || { naks: [], days: [], combCheck: false };
    
    // Calculate once for the whole loop
    let sFlags = 256; // SEFLG_SPEED

    for (let i = 0; i < daysToScan; i++) {
        // Yield to browser every 30 days to render loading animation
        if (i % 30 === 0) await yieldToMain();
        
        const timestamp = baseTime + (i * 86400000);
        const dayOfWeek = new Date(timestamp).getDay(); 
        const jd = (timestamp / 86400000) + 2440587.5;
        
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
        let tithi = Math.floor(tithiDiff / 12) + 1; 
        
        let yogaSum = (sunSidereal + moonSidereal) % 360;
        let yoga = Math.floor(yogaSum / (360 / 27)) + 1; 
        
        // --- 1. Universal Panchang Bans ---
        if (RIKTA_TITHIS.includes(tithi) || AMAVASYA.includes(tithi)) continue;
        if (BANNED_YOGAS.includes(yoga)) continue;
        
        // --- 2. Event Specific Vara (Weekday) Ban ---
        if (rules.days && rules.days.length > 0 && !rules.days.includes(dayOfWeek)) continue;
        
        // --- 3. Event Specific Nakshatra Ban ---
        if (rules.naks && rules.naks.length > 0 && !rules.naks.includes(nakshatra)) continue;
        
        // --- 4. Event Specific Solar Month Ban / Requirement ---
        if (rules.banSolarMonths && rules.banSolarMonths.includes(sunSign)) continue;
        if (rules.reqSolarMonths && !rules.reqSolarMonths.includes(sunSign)) continue;
        
        // --- 5. Asta (Combustion) Check for Jupiter & Venus ---
        if (rules.combCheck) {
            let jup = sweInstance.calc_ut(jd, 5, sFlags); // Jupiter is 5
            let ven = sweInstance.calc_ut(jd, 3, sFlags); // Venus is 3
            
            let jupDist = Math.abs((jup[0] - sun[0] + 180) % 360 - 180);
            let venDist = Math.abs((ven[0] - sun[0] + 180) % 360 - 180);
            
            // Jupiter (<11 deg) or Venus (<10 deg) combust
            if (jupDist <= 11) continue; 
            if (venDist <= 10) continue; 
        }

        // --- 6. Personal Sync Bans (Tara/Chandra Bala) ---
        if (natalData && natalData.nakshatra !== undefined) {
            if (!isTaraBalaGood(natalData.nakshatra, nakshatra)) continue;
            if (!isChandraBalaGood(natalData.moonRashi, moonSign)) continue;
        }
        
        // --- 7. Synastry Sync Bans ---
        if (partnerData && partnerData.nakshatra !== undefined) {
            if (!isTaraBalaGood(partnerData.nakshatra, nakshatra)) continue;
            if (!isChandraBalaGood(partnerData.moonRashi, moonSign)) continue;
        }
        
        // Scoring Mechanism
        let score = 0;
        if (tithi < 15) score += 2; // Shukla Paksha
        if (tithi === 11) score += 4; // Ekadashi
        if ([3, 4].includes(dayOfWeek)) score += 2; // Wed/Thu inherently auspicious generally
        
        // Score specific to the chosen nakshatras: Give extra points if it's the 1st or 2nd choice in lists generally
        if (rules.naks && rules.naks.length > 0 && nakshatra === rules.naks[0]) {
            score += 3;
        }
        
        const dStr = new Date(timestamp).toISOString().split('T')[0];
        validDays.push({
            date: dStr,
            tithi: TITHIS[tithi - 1] + (tithi <= 15 ? ' (Shukla)' : ' (Krishna)'),
            yoga,
            nakshatra: NAKSHATRAS[nakshatra],
            sunSign: RASHIS[sunSign],
            moonSign: RASHIS[moonSign],
            score
        });
    }
    
    validDays.sort((a,b) => b.score - a.score);
    const topDays = validDays.slice(0, 45).sort((a,b) => new Date(a.date) - new Date(b.date));
    
    // Add artificial delay to guarantee UI perception of work even if fast
    await new Promise(r => setTimeout(r, 600)); 
    
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
    
    let medianIdx = Math.floor(longestBlock.length / 2);
    let symbolicLagna = longestBlock[medianIdx].lagnaSign;
    
    return { timeBlock: timeBlockStr, lagnaSign: RASHIS[symbolicLagna] };
}
