import { computeKundali } from './src/engine/vedic.js';

const input = {
  year: 2005, month: 1, day: 31,
  hour: 12, minute: 45,
  utcOffset: 5.5,
  lat: 12.9716, lng: 77.5946,
  city: 'Bangalore', country: 'India'
};

const result = computeKundali(input);
console.log('Lagna Longitude:', result.lagna.longitude);
console.log('Lagna Degree:', result.lagna.degreeFormatted);

import { nakshatraFromLongitude } from './src/engine/vedic.js';
console.log('Lagna Nakshatra:', nakshatraFromLongitude(result.lagna.longitude).nakshatra.name);
