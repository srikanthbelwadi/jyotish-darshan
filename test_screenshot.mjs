import { computeKundali } from './src/engine/vedic.js';

const input = {
  year: 2005, month: 1, day: 31,
  hour: 12, minute: 45,
  utcOffset: 5.5,
  lat: 12.9716, lng: 77.5946,
  city: 'Bangalore', country: 'India', timezone: 'Asia/Kolkata'
};

const result = computeKundali(input);
console.log('Ayanamsa string:', result.ayanamsaDMS);
console.log('Sunrise:', result.panchang.sunrise);
console.log('Sunset:', result.panchang.sunset);
console.log('Lagna Degree Fmt:', result.lagna.degreeFormatted);
