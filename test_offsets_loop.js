import { computeKundali } from './src/engine/vedic.js';

for (const off of [0, 5.5, 12.5, -7]) {
  const input = {
    year: 2005, month: 1, day: 31,
    hour: 12, minute: 45,
    utcOffset: off,
    lat: 12.9716, lng: 77.5946,
    city: 'Bangalore', country: 'India'
  };
  const result = computeKundali(input);
  const moon = result.planets.find(p => p.key === 'moon');
  console.log(`Offset ${off} -> Moon Lon: ${moon.longitude.toFixed(2)}, Nakshatra: ${moon.nakshatraName}`);
}
