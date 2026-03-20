function getUTCOffset(tzId, year, month, day, hour, minute) {
    try {
      if (!year) {
        const d = new Date();
        year = d.getFullYear(); month = d.getMonth() + 1; day = d.getDate();
        hour = 12; minute = 0;
      }
      const d = new Date(Date.UTC(year, month - 1, day, hour, minute));
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: tzId,
        timeZoneName: 'shortOffset'
      }).formatToParts(d);
      const tzName = parts.find(p => p.type === 'timeZoneName')?.value;
      if (!tzName || tzName === 'GMT') return 0;
      const match = tzName.match(/GMT([+-]\d+)(?::(\d+))?/);
      if (match) {
        const hrs = parseInt(match[1], 10);
        const mins = match[2] ? parseInt(match[2], 10) : 0;
        return hrs + (hrs < 0 ? -mins/60 : mins/60);
      }
      return 5.5;
    } catch { return 5.5; }
}

const offset = getUTCOffset('Asia/Kolkata', 2005, 1, 31, 12, 45);
console.log('Offset calculated:', offset);

// Let's run computeKundali with whatever offset we got
import { computeKundali } from './src/engine/vedic.js';
const input = {
  year: 2005, month: 1, day: 31,
  hour: 12, minute: 45,
  utcOffset: offset, // if it's 5.5 it's Chitra
  lat: 12.9716, lng: 77.5946,
  city: 'Bangalore', country: 'India'
};

const result = computeKundali(input);
const moon = result.planets.find(p => p.key === 'moon');
console.log('Tested with offset:', offset);
console.log('Nakshatra Name:', moon.nakshatraName);

