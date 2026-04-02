import fetch from 'node-fetch';

async function testKundali() {
  const url = 'http://localhost:3000/api/kundali?panchang=1';
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        year: 2026, month: 4, day: 2, hour: 12, minute: 0, lat: 28.6, lng: 77.2, isPanchang: true
      })
    });
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Body:", text);
  } catch(e) {
    console.error("Fetch err:", e);
  }
}

testKundali();
