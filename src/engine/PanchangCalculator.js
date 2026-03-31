import { computePlanetPositions, toJulianDay } from './astronomy.js';

const DEG = Math.PI / 180;
function norm360(d) { return ((d % 360) + 360) % 360; }
function norm(d) { return ((d % 360) + 360) % 360; }

/** Formats decimal hours into HH:MM string */
export function formatTime(h) {
  if (isNaN(h)) return '--:--';
  const hh = Math.floor(h);
  const mm = Math.floor((h - hh) * 60);
  const ap = hh % 24 >= 12 ? 'PM' : 'AM';
  return `${(hh % 12) || 12}:${String(mm).padStart(2, '0')} ${ap}`;
}

/** Compute Sunrise and Sunset using solar declination and hour angle */
export function getSunriseSunset(jd, lat, lng, utcOffset) {
  const T = (jd - 2451545) / 36525;
  const L0 = norm(280.46646 + 36000.76983 * T);
  const M = norm(357.52911 + 35999.05029 * T);
  const C = (1.914602 - 0.004817 * T) * Math.sin(M * DEG) + 0.019993 * Math.sin(2 * M * DEG);
  const sunLon = norm(L0 + C);
  const eps = (23.439 - 0.00013 * T) * DEG;
  const dec = Math.asin(Math.sin(eps) * Math.sin(sunLon * DEG));
  
  const cosHA = (Math.sin(-0.8333 * DEG) - Math.sin(lat * DEG) * Math.sin(dec)) / (Math.cos(lat * DEG) * Math.cos(dec));
  if (cosHA < -1 || cosHA > 1) return { rise: 6, set: 18 }; // fallback for polar regions
  
  const HA = Math.acos(cosHA) / DEG;
  const lngCorr = lng / 15;
  const B = 2 * Math.PI * ((jd - 2451545) % 365.25) / 365.25;
  const EoT = 229.18 * (0.000075 + 0.001868 * Math.cos(B) - 0.032077 * Math.sin(B) - 0.014615 * Math.cos(2*B) - 0.04089 * Math.sin(2*B)) / 60;
  
  const solarNoon = 12 - lngCorr - EoT + utcOffset;
  const rise = solarNoon - HA / 15;
  const set = solarNoon + HA / 15;
  return { rise, set, noon: solarNoon };
}

export function getTithi(sunLon, moonLon) {
  const diff = norm360(moonLon - sunLon);
  return Math.floor(diff / 12) + 1;
}

export function detectFestival(m, t) {
  // Map mathematical combinations of Solar Month (1-12) and Tithi (1-30) to Festivals.
  // Assuming Chaitra = 1, Vaishakha = 2, Jyeshtha = 3, Ashadha = 4, Shravana = 5, Bhadrapada = 6
  // Ashvina = 7, Kartika = 8, Margashirsha = 9, Pausha = 10, Magha = 11, Phalguna = 12.
  // Note: Due to synodic differences exact mappings can shift, but this provides the structured mathematical frame!

  const festMap = {
    "12-23": {id: "sheetala_ashtami", icon: "❄️"},
    "12-26": {id: "papmochani_ekadashi", icon: "🌺"},
    "1-1": {id: "gudi_padwa_ugadi", icon: "🌾"},
    "1-2": {id: "cheti_chand", icon: "🌙"},
    "1-3": {id: "gangaur_matsya_jayanti", icon: "👸 🐟"},
    "1-6": {id: "yamuna_chhath", icon: "🌊"},
    "1-9": {id: "rama_navami", icon: "🏹"},
    "1-11": {id: "kamada_ekadashi", icon: "🌺"},
    "1-15": {id: "hanuman_jayanti", icon: "🐒"},
    "1-26": {id: "varuthini_ekadashi", icon: "🌺"},
    "2-3": {id: "parashurama_jayanti_akshaya_tritiya", icon: "🪓 💰"},
    "2-5": {id: "shankaracharya_jayanti", icon: "📜"},
    "2-7": {id: "ganga_saptami", icon: "💧"},
    "2-9": {id: "sita_navami", icon: "👑"},
    "2-11": {id: "mohini_ekadashi", icon: "🌺"},
    "2-14": {id: "narasimha_jayanti", icon: "🦁"},
    "2-15": {id: "buddha_purnima", icon: "☸️"},
    "2-16": {id: "narada_jayanti", icon: "🪕"},
    "2-26": {id: "apara_ekadashi", icon: "🌺"},
    "2-30": {id: "shani_jayanti_vat_savitri_vrat", icon: "🪐 🌳"},
    "3-10": {id: "ganga_dussehra", icon: "🌊"},
    "3-11": {id: "nirjala_ekadashi", icon: "🚫💧"},
    "3-15": {id: "vat_purnima_vrat", icon: "🌳"},
    "3-26": {id: "yogini_ekadashi", icon: "🌺"},
    "4-2": {id: "jagannath_rath_yatra", icon: "🛕"},
    "4-11": {id: "devshayani_ekadashi", icon: "🛏️"},
    "4-15": {id: "guru_purnima", icon: "🕉️"},
    "4-26": {id: "kamika_ekadashi", icon: "🌺"},
    "5-3": {id: "hariyali_teej", icon: "🌿"},
    "5-5": {id: "nag_panchami", icon: "🐍"},
    "5-6": {id: "kalki_jayanti", icon: "🐎"},
    "5-7": {id: "tulsidas_jayanti", icon: "📜"},
    "5-11": {id: "shravana_putrada_ekadashi", icon: "👶"},
    "5-15": {id: "raksha_bandhan_gayathri_jayanti", icon: "🧵 🪔"},
    "5-18": {id: "kajari_teej", icon: "🌧️"},
    "5-19": {id: "bahula_chaturthi", icon: "🐄"},
    "5-21": {id: "balarama_jayanti", icon: "🪓"},
    "5-23": {id: "krishna_janmashtami", icon: "🦚"},
    "5-26": {id: "aja_ekadashi", icon: "🌺"},
    "6-3": {id: "hartalika_teej", icon: "🍃"},
    "6-4": {id: "ganesh_chaturthi", icon: "🐘"},
    "6-5": {id: "rishi_panchami", icon: "🧘"},
    "6-8": {id: "radha_ashtami", icon: "🌸"},
    "6-11": {id: "parsva_ekadashi", icon: "🌺"},
    "6-12": {id: "vamana_jayanti", icon: "☔"},
    "6-14": {id: "anant_chaturdashi", icon: "♾️"},
    "6-15": {id: "pitru_paksha_begins", icon: "🕊️"},
    "6-26": {id: "indira_ekadashi", icon: "🌺"},
    "6-30": {id: "mahalaya_amavasya", icon: "🌑"},
    "7-1": {id: "sharad_navratri_begins", icon: "🔱"},
    "7-5": {id: "lalita_panchami", icon: "✨"},
    "7-7": {id: "saraswati_avahan", icon: "🪕"},
    "7-8": {id: "durga_ashtami", icon: "🗡️"},
    "7-9": {id: "maha_navami", icon: "🌺"},
    "7-10": {id: "dussehra_vijayadashami", icon: "🏹"},
    "7-11": {id: "papankusha_ekadashi", icon: "🌺"},
    "7-15": {id: "sharad_purnima_valmiki_jayanti", icon: "🌕 📜"},
    "7-19": {id: "karwa_chauth", icon: "🌕"},
    "7-23": {id: "ahoi_ashtami", icon: "👩‍👧‍👦"},
    "7-26": {id: "rama_ekadashi", icon: "🌺"},
    "7-28": {id: "dhanteras", icon: "🪙"},
    "7-29": {id: "narak_chaturdashi", icon: "🪔"},
    "7-30": {id: "diwali_deepavali", icon: "🎇"},
    "8-1": {id: "govardhan_puja", icon: "⛰️"},
    "8-2": {id: "bhai_dooj", icon: "👫"},
    "8-6": {id: "chhath_puja", icon: "🌞"},
    "8-8": {id: "gopashtami", icon: "🐄"},
    "8-9": {id: "akshaya_navami", icon: "🌳"},
    "8-11": {id: "devutthana_ekadashi", icon: "🌅"},
    "8-12": {id: "tulsi_vivah", icon: "🌿"},
    "8-15": {id: "dev_deepawali", icon: "🪔"},
    "8-26": {id: "utpanna_ekadashi", icon: "🌺"},
    "9-5": {id: "vivah_panchami", icon: "💍"},
    "9-11": {id: "gita_jayanti_mokshada_ekadashi", icon: "📖 🌺"},
    "9-15": {id: "dattatreya_jayanti", icon: "🕉️"},
    "9-26": {id: "saphala_ekadashi", icon: "🌺"},
    "10-11": {id: "pausha_putrada_ekadashi", icon: "👶"},
    "10-26": {id: "shattila_ekadashi", icon: "🌾"},
    "10-30": {id: "mauni_amavasya", icon: "🤫"},
    "11-5": {id: "vasant_panchami", icon: "🌼"},
    "11-7": {id: "ratha_saptami", icon: "🌞"},
    "11-8": {id: "bhishma_ashtami", icon: "🏹"},
    "11-29": {id: "maha_shivaratri", icon: "🔱"},
    "12-15": {id: "holika_dahan_holi", icon: "🎨"},
  };

  const key = `${m}-${t}`;
  return festMap[key] || null;
}

export function getLunarMonth(sunLon, tithi) {
  const nmSun = (sunLon - (tithi * 0.97) + 360) % 360;
  return ((Math.floor(nmSun / 30) + 1) % 12) + 1;
}

export function computeDailyPanchang(dateObj, lat = 28.6139, lng = 77.2090) {
  const utcOffset = -dateObj.getTimezoneOffset() / 60;
  const hr = dateObj.getHours();
  const min = dateObj.getMinutes();
  const jd = toJulianDay(dateObj.getFullYear(), dateObj.getMonth() + 1, dateObj.getDate(), hr, min, utcOffset); 
  const { sidereal, ayanamsa } = computePlanetPositions(jd);
  const sunLon = sidereal.sun.longitude;
  const moonLon = sidereal.moon.longitude;

  // 1. Tithi
  const tithi = getTithi(sunLon, moonLon);
  const paksha = tithi <= 15 ? 'Shukla' : 'Krishna';
  
  // 2. Nakshatra (0-26)
  const nakshatraIndex = Math.floor(moonLon / (360/27));
  
  // 3. Yoga (0-26)
  const yogaIndex = Math.floor(norm360(sunLon + moonLon) / (360/27));
  
  // 4. Karana (0-59)
  const karana1 = Math.floor(norm360(moonLon - sunLon) / 6);
  const karana2 = karana1 + 1; // 2 karanas per tithi

  // Calculate precise Amanta Lunar Month
  const lunarMonth = getLunarMonth(sunLon, tithi);

  // Sun and Moon signs (0-11)
  const sunSign = Math.floor(sunLon / 30);
  const moonSign = Math.floor(moonLon / 30);

  // Month and Seasons
  const rituArray = ["Vasant", "Vasant", "Grishma", "Grishma", "Varsha", "Varsha", "Sharad", "Sharad", "Hemanta", "Hemanta", "Shishira", "Shishira"];
  const ritu = rituArray[sunSign];
  const ayana = norm360(sunLon + ayanamsa) >= 90 && norm360(sunLon + ayanamsa) < 270 ? 'Dakshinayana' : 'Uttarayana';

  // Math-based Festivals
  const festivalObj = detectFestival(lunarMonth, tithi);
  let festivalId = null, festivalIcon = null;
  if (festivalObj) {
    festivalId = festivalObj.id;
    festivalIcon = festivalObj.icon;
  }
  
  // Dynamic Solar Transits (Baisakhi, Makar Sankranti)
  if (sunSign === 0 && tithi > 10 && tithi < 20 && !festivalId) {
    festivalId = "baisakhi";
    festivalIcon = "🌾";
  }
  if (sunSign === 9 && !festivalId) {
     if (dateObj.getMonth() === 0 && (dateObj.getDate() === 14 || dateObj.getDate() === 15)) {
        festivalId = "makar_sankranti";
        festivalIcon = "🪁";
     }
  }

  const isEkadashi = tithi === 11 || tithi === 26;
  const isSankashti = tithi === 19;
  const isPurnima = tithi === 15;
  const isAmavasya = tithi === 30;

  // Sunrise / Sunset & Muhurats
  const { rise, set, noon } = getSunriseSunset(jd, lat, lng, utcOffset);
  const dayOfWeek = dateObj.getDay(); // 0 = Sun, 6 = Sat
  const dayDur = set - rise;

  const abhijitStart = noon - 0.4; // approx 24 mins before noon
  const abhijitEnd = noon + 0.4;

  const brahmaStart = rise - 1.6; // approx 96 mins before sunrise
  const brahmaEnd = rise - 0.8;

  const rahuSlot = [8, 2, 7, 5, 6, 4, 3][dayOfWeek];
  const yamaSlot = [5, 4, 3, 2, 1, 7, 6][dayOfWeek];
  const guliSlot = [7, 6, 5, 4, 3, 2, 1][dayOfWeek];
  
  const eighth = dayDur / 8;
  const rahuStart = rise + (rahuSlot - 1) * eighth;
  const rahuEnd = rahuStart + eighth;
  const yamaStart = rise + (yamaSlot - 1) * eighth;
  const yamaEnd = yamaStart + eighth;
  const guliStart = rise + (guliSlot - 1) * eighth;
  const guliEnd = guliStart + eighth;

  return {
    tithi, paksha, nakshatraIndex, yogaIndex, karana1, karana2,
    sunSign, moonSign, solarMonth: lunarMonth, ritu, ayana,
    festivalId, festivalIcon, isEkadashi, isSankashti, isPurnima, isAmavasya,
    timings: {
      rise, set, noon,
      abhijitStart, abhijitEnd, brahmaStart, brahmaEnd,
      rahuStart, rahuEnd, yamaStart, yamaEnd, guliStart, guliEnd
    }
  };
}

export function getProfileLunarSignature(dateStr, timeStr) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  let hr = 12, min = 0;
  if (timeStr) {
    const [h, mi] = timeStr.split(':').map(Number);
    hr = h; min = mi;
  }
  const jd = toJulianDay(y, m, d, hr, min, 0); 
  const { sidereal } = computePlanetPositions(jd);
  const tithi = getTithi(sidereal.sun.longitude, sidereal.moon.longitude);
  const nmSun = (sidereal.sun.longitude - (tithi * 0.97) + 360) % 360;
  const lunarMonth = ((Math.floor(nmSun / 30) + 1) % 12) + 1;
  return { tithi, solarMonth: lunarMonth };
}

export function findJanmaTithi(currentPanchang, userList) {
  if (!userList || !Array.isArray(userList)) return [];
  const birthdays = [];
  for (const user of userList) {
    // Living profiles use 'dob' and 'tob' from InputForm
    const sig = getProfileLunarSignature(user.dob || user.date, user.tob || user.time);
    if (sig && sig.tithi === currentPanchang.tithi && sig.solarMonth === currentPanchang.solarMonth) {
      birthdays.push(user);
    }
  }
  return birthdays;
}

export function findVarshikaTithi(currentPanchang, departedSouls) {
  if (!departedSouls || !Array.isArray(departedSouls)) return [];
  const ceremonies = [];
  for (const soul of departedSouls) {
    // Memorial settings use 'date' and 'time'
    const sig = getProfileLunarSignature(soul.date || soul.dob, soul.time || soul.tob);
    if (sig && sig.tithi === currentPanchang.tithi && sig.solarMonth === currentPanchang.solarMonth) {
      ceremonies.push(soul);
    }
  }
  return ceremonies;
}
