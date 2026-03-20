import { computeKundali } from './src/engine/vedic.js';

const input = {
  year: 2005, month: 1, day: 31,
  hour: 12, minute: 45,
  utcOffset: 5.5,
  lat: 12.9716, lng: 77.5946,
  city: 'Bangalore', country: 'India'
};

const result = computeKundali(input);
const moon = result.planets.find(p => p.key === 'moon');
console.log('JD:', result.jd);
console.log('Ayanamsa:', result.ayanamsa);
console.log('Moon Longitude:', moon.longitude);
console.log('Nakshatra Index:', moon.nakshatraIndex);
console.log('Nakshatra Name:', moon.nakshatraName);
console.log('Panchang Nakshatra:', result.panchang.nakshatra);

