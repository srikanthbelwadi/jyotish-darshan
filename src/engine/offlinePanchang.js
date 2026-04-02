import { computePlanetPositionsOffline, toJulianDayOffline, getSunriseSunsetOffline, abhijitMuhurtaOffline, inauspiciousPeriodsOffline } from './offlineAstronomy.js';
import { initClientAstroEngine } from './swissephClient.js';

export async function computeOfflineDailyPanchang(year, month, day, hr, min, lat, lng, utcOffset) {
  await initClientAstroEngine();

  const jd = toJulianDayOffline(year, month, day, hr, min, utcOffset); 
  const { sidereal, ayanamsa } = computePlanetPositionsOffline(jd);
  const sunLon = sidereal.sun.longitude;
  const moonLon = sidereal.moon.longitude;

  // Tithi calculation
  let diff = moonLon - sunLon;
  if (diff < 0) diff += 360;
  const tithiIndex = Math.floor(diff / 12) + 1;
  const paksha = tithiIndex <= 15 ? 'Shukla' : 'Krishna';
  const tithiNum = tithiIndex > 15 ? tithiIndex - 15 : tithiIndex;
  
  const TITHI_NAMES = ["Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima", "Amavasya"];
  const tTitle = tithiIndex === 30 ? "Amavasya" : tithiIndex === 15 ? "Purnima" : TITHI_NAMES[tithiNum - 1];
  const tithiString = `${tTitle} (${paksha})`;

  // Rashi (Signs)
  const sunRashi = Math.floor(sunLon / 30);
  const moonRashi = Math.floor(moonLon / 30);

  // Nakshatra Info
  const nakshatraIndex = Math.floor(moonLon / (360/27));
  const NAK_NAMES = ["Ashvini","Bharani","Krittika","Rohini","Mrigashira","Ardra","Punarvasu","Pushya","Ashlesha","Magha","Purva Phalguni","Uttara Phalguni","Hasta","Chitra","Swati","Vishakha","Anuradha","Jyeshtha","Mula","Purvashadha","Uttarashadha","Shravana","Dhanishta","Shatabhisha","Purva Bhadrapada","Uttara Bhadrapada","Revati"];

  return {
    jd,
    planets: [
      { key: 'sun', longitude: sunLon, rashi: sunRashi },
      { key: 'moon', longitude: moonLon, rashi: moonRashi, nakshatraName: NAK_NAMES[nakshatraIndex] }
    ],
    panchang: {
      tithi: tithiString
    }
  };
}
