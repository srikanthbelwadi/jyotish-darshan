/**
 * Lightweight Offline Vedic Astronomy Engine
 * Used exclusively for the Daily Panchang Header explicitly requested by the user
 */
import { getClientSwe } from './swissephClient.js';

const DEG = Math.PI / 180;
function norm360(d) { return ((d % 360) + 360) % 360; }
export function norm(d) { return ((d % 360) + 360) % 360; }

export function toJulianDayOffline(year, month, day, hour = 0, minute = 0, utcOffsetHours = 0) {
  const swe = getClientSwe();
  const totalMinutes = hour * 60 + minute - Math.round(utcOffsetHours * 60);
  let uDate = new Date(Date.UTC(year, month - 1, day, 0, totalMinutes, 0));
  let utHour = uDate.getUTCHours() + uDate.getUTCMinutes() / 60;
  return swe.julday(uDate.getUTCFullYear(), uDate.getUTCMonth() + 1, uDate.getUTCDate(), utHour, swe.SE_GREG_CAL);
}

export function getLahiriAyanamsaOffline(jd) {
  const swe = getClientSwe();
  return swe.SweModule.ccall('swe_get_ayanamsa_ut', 'number', ['number'], [jd]);
}

export function computePlanetPositionsOffline(jd) {
  const swe = getClientSwe();
  const flags = swe.SEFLG_SWIEPH | swe.SEFLG_SPEED | swe.SEFLG_SIDEREAL;
  
  const calc = (bodyId) => {
    const res = swe.calc_ut(jd, bodyId, flags);
    return { longitude: norm360(res[0]), speed: res[3] || 0 };
  };
  
  const ayanamsa = getLahiriAyanamsaOffline(jd);
  
  const raw = {
    sun: calc(swe.SE_SUN),
    moon: calc(swe.SE_MOON)
  };
  
  const sidereal = {};
  for(const [k, v] of Object.entries(raw)){
    sidereal[k] = { ...v, isRetrograde: v.speed < 0 };
  }
  
  return { sidereal, ayanamsa };
}

export function getSunriseSunsetOffline(jd, lat, lng, utcOffset) {
  const T = (jd - 2451545) / 36525;
  const L0 = norm(280.46646 + 36000.76983 * T);
  const M = norm(357.52911 + 35999.05029 * T);
  const C = (1.914602 - 0.004817 * T) * Math.sin(M * DEG) + 0.019993 * Math.sin(2 * M * DEG);
  const sunLon = norm(L0 + C);
  const eps = (23.439 - 0.00013 * T) * DEG;
  const dec = Math.asin(Math.sin(eps) * Math.sin(sunLon * DEG));
  
  const cosHA = (Math.sin(-0.8333 * DEG) - Math.sin(lat * DEG) * Math.sin(dec)) / (Math.cos(lat * DEG) * Math.cos(dec));
  if (cosHA < -1 || cosHA > 1) return { rise: 6, set: 18, noon: 12 }; // fallback for polar regions
  
  const HA = Math.acos(cosHA) / DEG;
  const lngCorr = lng / 15;
  const B = 2 * Math.PI * ((jd - 2451545) % 365.25) / 365.25;
  const EoT = 229.18 * (0.000075 + 0.001868 * Math.cos(B) - 0.032077 * Math.sin(B) - 0.014615 * Math.cos(2*B) - 0.04089 * Math.sin(2*B)) / 60;
  
  const solarNoon = 12 - lngCorr - EoT + utcOffset;
  const rise = solarNoon - HA / 15;
  const set = solarNoon + HA / 15;
  return { rise, set, noon: solarNoon };
}

export function inauspiciousPeriodsOffline(sunrise, sunset, dayOfWeek) {
  const dayDuration = sunset - sunrise;
  const eighth = dayDuration / 8;
  const rahuSlot = [8, 2, 7, 5, 6, 4, 3][dayOfWeek];
  const yamaSlot = [5, 4, 3, 2, 1, 7, 6][dayOfWeek];
  const gulikaSlot = [7, 6, 5, 4, 3, 2, 1][dayOfWeek];

  const fmt = (t) => {
     let h = Math.floor(t);
     let m = Math.floor((t - h) * 60);
     const ampm = (h % 24) >= 12 ? 'PM' : 'AM';
     h = h % 12 || 12;
     return `${h}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  const period = (slot) => {
    const s = sunrise + (slot - 1) * eighth;
    const e = s + eighth;
    return { start: s, end: e, str: `${fmt(s)} – ${fmt(e)}` };
  };

  return {
    rahuKala: period(rahuSlot),
    yamaghanda: period(yamaSlot),
    gulikaKala: period(gulikaSlot)
  };
}

export function abhijitMuhurtaOffline(sunrise, sunset) {
  const noon = (sunrise + sunset) / 2;
  const fmt = (t) => {
     let h = Math.floor(t);
     let m = Math.floor((t - h) * 60);
     const ampm = (h % 24) >= 12 ? 'PM' : 'AM';
     h = h % 12 || 12;
     return `${h}:${String(m).padStart(2, '0')} ${ampm}`;
  };
  return { start: noon - 0.4, end: noon + 0.4, str: `${fmt(noon - 0.4)} – ${fmt(noon + 0.4)}` };
}
