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

  // Yoga
  const yogaLon = (sunLon + moonLon) % 360;
  const yogaNum = Math.floor(yogaLon / (360 / 27));
  const yogaNames = ['Vishkambha','Priti','Ayushman','Saubhagya','Shobhana','Atiganda','Sukarma',
                     'Dhriti','Shula','Ganda','Vriddhi','Dhruva','Vyaghata','Harshana','Vajra',
                     'Siddhi','Vyatipata','Variyan','Parigha','Shiva','Siddha','Sadhya','Shubha',
                     'Shukla','Brahma','Indra','Vaidhriti'];
  const yoga = yogaNames[yogaNum];

  // Karana
  const rawTithi = ((moonLon - sunLon + 360) % 360) / 12;
  const karanaNum = Math.floor(rawTithi * 2) % 11;
  const karanaNames = ['Bava','Balava','Kaulava','Taitila','Garaja','Vanija','Vishti',
                       'Shakuni','Chatushpada','Naga','Kimstughna'];
  const karana = karanaNames[karanaNum];

  return {
    jd,
    planets: [
      { key: 'sun', longitude: sunLon, rashi: sunRashi },
      { key: 'moon', longitude: moonLon, rashi: moonRashi, nakshatraName: NAK_NAMES[nakshatraIndex] }
    ],
    panchang: {
      tithi: tithiString,
      nakshatra: NAK_NAMES[nakshatraIndex],
      nakIdx: nakshatraIndex,
      yoga: yoga,
      karana: karana
    }
  };
}
