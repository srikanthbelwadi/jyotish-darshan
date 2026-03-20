export function encodeShareLink(input) {
  const data = {
    y: input.year, mo: input.month, d: input.day,
    h: input.hour, mi: input.minute,
    ut: input.utcOffset,
    la: input.lat, ln: input.lng,
    ci: input.city, co: input.country,
    tz: input.timezone, ge: input.gender,
  };
  const json = JSON.stringify(data);
  const encoded = btoa(encodeURIComponent(json));
  return `${window.location.origin}${window.location.pathname}?k=${encoded}`;
}

export function decodeShareLink() {
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get('k');
  if (!encoded) return null;
  try {
    const json = decodeURIComponent(atob(encoded));
    const d = JSON.parse(json);
    return {
      year: d.y, month: d.mo, day: d.d,
      hour: d.h, minute: d.mi,
      utcOffset: d.ut,
      lat: d.la, lng: d.ln,
      city: d.ci, country: d.co,
      timezone: d.tz, gender: d.ge,
      dob: `${d.y}-${String(d.mo).padStart(2,'0')}-${String(d.d).padStart(2,'0')}`,
      tob: `${String(d.h).padStart(2,'0')}:${String(d.mi).padStart(2,'0')}`,
    };
  } catch { return null; }
}
