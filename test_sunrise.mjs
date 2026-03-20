import { toJulianDay } from './src/engine/astronomy.js';
import { getLahiriAyanamsa } from './src/engine/astronomy.js';
import { computeKundali } from './src/engine/vedic.js';

const res125 = computeKundali({
  year: 2005, month: 1, day: 31,
  hour: 12, minute: 45,
  utcOffset: 12.5,
  lat: 12.9716, lng: 77.5946,
  city: 'Bangalore', country: 'India', timezone: 'Asia/Kolkata'
});

console.log('Lagna for offset 12.5:', res125.lagna.degreeFormatted);
console.log('Nakshatra for offset 12.5:', res125.planets.find(p => p.key === 'moon').nakshatraName);
console.log('Sunrise/Sunset for offset 12.5:', res125.panchang.sunrise, res125.panchang.sunset);
