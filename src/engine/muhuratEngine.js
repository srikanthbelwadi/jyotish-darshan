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
        
        let score = 100;
        let isAbsoluteBan = false;
        
        // --- 1. Absolute Universal Bans ---
        if (AMAVASYA.includes(tithi)) isAbsoluteBan = true;
        
        // --- 2. Asta (Combustion) Absolute Ban for Major Events ---
        if (rules.combCheck) {
            let jup = sweInstance.calc_ut(jd, 5, sFlags); // Jupiter is 5
            let ven = sweInstance.calc_ut(jd, 3, sFlags); // Venus is 3
            
            let jupDist = Math.abs((jup[0] - sun[0] + 180) % 360 - 180);
            let venDist = Math.abs((ven[0] - sun[0] + 180) % 360 - 180);
            
            // Jupiter (<11 deg) or Venus (<10 deg) combust
            if (jupDist <= 11) isAbsoluteBan = true; 
            if (venDist <= 10) isAbsoluteBan = true; 
        }

        if (isAbsoluteBan) continue;

        // --- 3. Weighted Scoring Framework ---
        
        // Panchang Penalties
        if (RIKTA_TITHIS.includes(tithi)) score -= 20;
        if (BANNED_YOGAS.includes(yoga)) score -= 15;
        
        // Event-Specific Vara (Weekday) Scoring
        if (rules.days && rules.days.length > 0) {
            if (rules.days.includes(dayOfWeek)) score += 10;
            else score -= 15;
        }
        
        // Event-Specific Nakshatra Scoring
        if (rules.naks && rules.naks.length > 0) {
            if (rules.naks.includes(nakshatra)) {
                score += 15;
                if (nakshatra === rules.naks[0]) score += 5; // Prime choice
            } else {
                score -= 25; // Wrong nakshatra is a heavy penalty
            }
        }
        
        // Solar Month Bans
        if (rules.banSolarMonths && rules.banSolarMonths.includes(sunSign)) score -= 25;
        if (rules.reqSolarMonths && !rules.reqSolarMonths.includes(sunSign)) score -= 25;
        
        // Personal Sync Bans (Tara/Chandra Bala)
        if (natalData && natalData.nakshatra !== undefined) {
            if (!isTaraBalaGood(natalData.nakshatra, nakshatra)) score -= 15;
            if (!isChandraBalaGood(natalData.moonRashi, moonSign)) score -= 10;
        }
        
        // Synastry Sync Bans
        if (partnerData && partnerData.nakshatra !== undefined) {
            if (!isTaraBalaGood(partnerData.nakshatra, nakshatra)) score -= 15;
            if (!isChandraBalaGood(partnerData.moonRashi, moonSign)) score -= 10;
        }
        
        // General Auspicious Boosts
        if (tithi < 15) score += 5; // Shukla Paksha
        if (tithi === 11) score += 10; // Ekadashi
        if ([3, 4].includes(dayOfWeek)) score += 2; // Wed/Thu inherently auspicious

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
    // Grab top 45 scored days regardless of pure rule breaches
    const topDays = validDays.slice(0, 45).sort((a,b) => new Date(a.date) - new Date(b.date));
    
    // Add artificial delay to guarantee UI perception of work
    await new Promise(r => setTimeout(r, 600)); 
    
    const dayMap = {};
    if (topDays.length > 0) {
        // Calculate relative tiering to ensure we always have some visual greens
        const validScores = topDays.map(d => d.score);
        const maxScore = Math.max(...validScores);
        
        topDays.forEach(day => {
            let tier = 'yellow';
            // If it's within 15 points of the maximum possible score found, it's a solid Green day relatively
            if (day.score >= (maxScore - 15)) {
                tier = 'green';
            }
            dayMap[day.date] = { ...day, tier };
        });
    }
    return dayMap;
}

export async function getAuspiciousWindow(sweInstance, dateStr, eventName, natalLagnaRashi, partnerLagnaRashi, userLat, userLng) {
    const validBlocks = [];
    const baseDate = new Date(dateStr);
    
    // Default to Ujjain purely as fallback if coords are somehow missing from profile
    let lat = userLat !== undefined ? userLat : 23.17; 
    let lng = userLng !== undefined ? userLng : 75.78; 
    
    const dayOfWeek = baseDate.getDay();
    
    // Standard Vedic Offsets from 6:00 AM (in continuous hours)
    // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
    const RAHU_STARTS = [16.5, 7.5, 15.0, 12.0, 13.5, 10.5, 9.0];
    const YAM_STARTS = [12.0, 10.5, 9.0, 7.5, 6.0, 15.0, 13.5];
    
    let rahuStart = RAHU_STARTS[dayOfWeek];
    let rahuEnd = rahuStart + 1.5;
    
    let yamStart = YAM_STARTS[dayOfWeek];
    let yamEnd = yamStart + 1.5;

    const isFixedEvent = ["Vivaha (Marriage)", "Sagai / Mangni (Engagement)", "Bhoomi Puja (Foundation Stone Laying)", "Griha Pravesh (Housewarming)", "Deva Pratishtha (Idol Installation)"].includes(eventName);
    const isMovableEvent = ["Vahana Puja (Buying a Vehicle)", "Yatra (Significant Journeys)"].includes(eventName);
    
    const FIXED_SIGNS = [1, 4, 7, 10]; // Taurus, Leo, Scorpio, Aquarius
    const MOVABLE_SIGNS = [0, 3, 6, 9]; // Aries, Cancer, Libra, Capricorn
    const DUAL_SIGNS = [2, 5, 8, 11]; // Gemini, Virgo, Sagittarius, Pisces

    // Scan the day in 15-minute intervals from 06:00 AM to 10:00 PM
    for (let currentHour = 6.0; currentHour <= 22.0; currentHour += 0.25) { 
        let inRahu = (currentHour >= rahuStart && currentHour < rahuEnd);
        let inYam = (currentHour >= yamStart && currentHour < yamEnd);
        if (inRahu || inYam) continue;
        
        let h = Math.floor(currentHour);
        let m = Math.round((currentHour - h) * 60);
        baseDate.setHours(h, m, 0, 0);
        
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
        
        let score = 0;
        if (isFixedEvent && FIXED_SIGNS.includes(transitLagnaSign)) score += 5;
        if (isMovableEvent && MOVABLE_SIGNS.includes(transitLagnaSign)) score += 5;
        if (!isFixedEvent && !isMovableEvent && DUAL_SIGNS.includes(transitLagnaSign)) score += 3;
        
        // Benefic lagna fallback
        if (!isFixedEvent && !isMovableEvent && [1, 2, 3, 5, 6, 8, 11].includes(transitLagnaSign)) score += 1;

        validBlocks.push({ time: currentHour, lagnaSign: transitLagnaSign, score });
    }
    
    if (validBlocks.length === 0) {
        return { timeBlock: "No auspicious hours", lagnaSign: "N/A" };
    }
    
    // Group into continuous clusters of the exact same rising Lagna
    let clusters = [];
    let currentCluster = [validBlocks[0]];
    
    for (let i = 1; i < validBlocks.length; i++) {
        // If consecutive block (difference is 15 mins) and the Lagna Rashi is still the same
        if (Math.abs(validBlocks[i].time - validBlocks[i-1].time) <= 0.26 && validBlocks[i].lagnaSign === currentCluster[0].lagnaSign) {
            currentCluster.push(validBlocks[i]);
        } else {
            clusters.push(currentCluster);
            currentCluster = [validBlocks[i]];
        }
    }
    clusters.push(currentCluster);
    
    // Sort clusters by accumulated score, then length, mapping to optimally requested Lagnas
    clusters.sort((a,b) => {
        let scoreA = a.reduce((sum, block) => sum + block.score, 0);
        let scoreB = b.reduce((sum, block) => sum + block.score, 0);
        if (scoreA !== scoreB) return scoreB - scoreA;
        return b.length - a.length;
    });
    
    let bestCluster = clusters[0];
    
    let startT = bestCluster[0].time;
    let endT = bestCluster[bestCluster.length - 1].time + 0.25; 
    
    let format = t => {
        let h = Math.floor(t);
        let m = Math.round((t - h) * 60);
        let ampm = h >= 12 ? 'PM' : 'AM';
        let h12 = h > 12 ? h - 12 : (h === 0 ? 12 : h);
        let mStr = m.toString().padStart(2, '0');
        return `${h12}:${mStr} ${ampm}`;
    };
    
    let timeBlockStr = `${format(startT)} - ${format(endT)}`;
    return { timeBlock: timeBlockStr, lagnaSign: RASHIS[bestCluster[0].lagnaSign] };
}
