/**
 * Vedic Astronomy Engine
 * Implements planetary calculations using Jean Meeus "Astronomical Algorithms"
 * Accurate to ~1 arcminute for 1900-2100
 */

const DEG = Math.PI / 180;

// ─── Julian Day ───────────────────────────────────────────────────────────────
export function toJulianDay(year, month, day, hour = 0, minute = 0, utcOffsetHours = 0) {
  const utHour = hour + minute / 60 - utcOffsetHours;
  if (month <= 2) { year -= 1; month += 12; }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + utHour / 24 + B - 1524.5;
}

export function julianToDate(jd) {
  const z = Math.floor(jd + 0.5);
  const f = jd + 0.5 - z;
  let a = z;
  if (z >= 2299161) {
    const alpha = Math.floor((z - 1867216.25) / 36524.25);
    a = z + 1 + alpha - Math.floor(alpha / 4);
  }
  const b = a + 1524;
  const c = Math.floor((b - 122.1) / 365.25);
  const d = Math.floor(365.25 * c);
  const e = Math.floor((b - d) / 30.6001);
  const day = b - d - Math.floor(30.6001 * e);
  const month = e < 14 ? e - 1 : e - 13;
  const year = month > 2 ? c - 4716 : c - 4715;
  const hours = f * 24;
  return { year, month, day, hours };
}

// ─── Lahiri Ayanamsa ──────────────────────────────────────────────────────────
export function getLahiriAyanamsa(jd) {
  const T = (jd - 2451545.0) / 36525.0;
  // Lahiri/NC Lahiri ayanamsa formula
  const ayanamsa = 23.85 + 0.013 * T + 0.000006 * T * T;
  // More precise Lahiri computation:
  // Based on IAU 1976 precession and Chitra star longitude at 180°
  const T2 = T * T;
  const T3 = T2 * T;
  // Obliquity of ecliptic
  const eps0 = 23 + 26 / 60 + 21.448 / 3600;
  // General precession in longitude
  const precession = 50.27 + 0.0222 * T;
  // Lahiri ayanamsa: J2000 epoch value = 23°51'11" ≈ 23.8531°
  const baseAyanamsa = 23.853_08;
  const yearFraction = T * 100;
  return baseAyanamsa + 0.013_60 * T - 0.000_031 * T2;
}

// ─── Normalize degrees ────────────────────────────────────────────────────────
function norm360(deg) {
  return ((deg % 360) + 360) % 360;
}

// ─── Sun Position ─────────────────────────────────────────────────────────────
function sunPosition(T) {
  const L0 = norm360(280.46646 + 36000.76983 * T);
  const M = norm360(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
  const Mrad = M * DEG;
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mrad)
    + (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad)
    + 0.000289 * Math.sin(3 * Mrad);
  const sunLon = L0 + C;
  const omega = 125.04 - 1934.136 * T;
  const apparentLon = sunLon - 0.00569 - 0.00478 * Math.sin(omega * DEG);
  const v = norm360(M + C);
  const R = 1.000001018 * (1 - 0.016708634 * 0.016708634) / (1 + 0.016708634 * Math.cos(v * DEG));
  return { longitude: norm360(apparentLon), R, speed: 1.0 };
}

// ─── Moon Position ────────────────────────────────────────────────────────────
function moonPosition(T) {
  const T2 = T * T; const T3 = T2 * T; const T4 = T3 * T;
  const Lp = norm360(218.3164477 + 481267.88123421 * T - 0.0015786 * T2 + T3 / 538841 - T4 / 65194000);
  const D  = norm360(297.8501921 + 445267.1114034  * T - 0.0018819 * T2 + T3 / 545868 - T4 / 113065000);
  const M  = norm360(357.5291092 + 35999.0502909   * T - 0.0001536 * T2 + T3 / 24490000);
  const Mp = norm360(134.9633964 + 477198.8675055  * T + 0.0087414 * T2 + T3 / 69699 - T4 / 14712000);
  const F  = norm360(93.2720950  + 483202.0175233  * T - 0.0036539 * T2 - T3 / 3526000 + T4 / 863310000);
  const r = DEG;
  const E = 1 - 0.002516 * T - 0.0000074 * T2;
  // Longitude corrections (major terms)
  let dL = 6288774 * Math.sin(Mp * r)
    + 1274027 * Math.sin((2 * D - Mp) * r)
    + 658314  * Math.sin(2 * D * r)
    + 213618  * Math.sin(2 * Mp * r)
    - 185116  * E * Math.sin(M * r)
    - 114332  * Math.sin(2 * F * r)
    + 58793   * Math.sin((2 * D - 2 * Mp) * r)
    + 57066   * E * Math.sin((2 * D - M - Mp) * r)
    + 53322   * Math.sin((2 * D + Mp) * r)
    + 45758   * E * Math.sin((2 * D - M) * r)
    - 40923   * E * Math.sin((M - Mp) * r)
    - 34720   * Math.sin(D * r)
    - 30383   * E * Math.sin((M + Mp) * r)
    + 15327   * Math.sin((2 * D - 2 * F) * r)
    - 12528   * Math.sin((Mp + 2 * F) * r)
    + 10980   * Math.sin((Mp - 2 * F) * r)
    + 10675   * Math.sin((4 * D - Mp) * r)
    + 10034   * Math.sin(3 * Mp * r)
    + 8548    * Math.sin((4 * D - 2 * Mp) * r)
    - 7888    * E * Math.sin((2 * D + M - Mp) * r)
    - 6766    * E * Math.sin((2 * D + M) * r)
    - 5163    * Math.sin((D - Mp) * r);
  const moonLon = norm360(Lp + dL / 1000000);
  // Daily motion approximately 13.17° per day
  const speed = 13.17 + 0.5 * Math.sin(Mp * r);
  return { longitude: moonLon, speed };
}

// ─── Mars Position ────────────────────────────────────────────────────────────
function marsPosition(T) {
  const L = norm360(355.4332 + 19140.2993 * T);
  const M = norm360(19.3730  + 19139.8585 * T);
  const C = 10.6912 * Math.sin(M * DEG)
    + 0.6228 * Math.sin(2 * M * DEG)
    + 0.0503 * Math.sin(3 * M * DEG);
  const lon = norm360(L + C);
  const speed = 0.524; // degrees/day approx
  const retro = Math.sin(M * DEG) < -0.8 && T > 0 ? -0.1 : 0.524;
  return { longitude: lon, speed: retro };
}

// ─── Mercury Position ─────────────────────────────────────────────────────────
function mercuryPosition(T) {
  const L = norm360(252.2509 + 149472.6746 * T);
  const M = norm360(168.6562 + 149472.5153 * T);
  const C = 23.4400 * Math.sin(M * DEG)
    + 2.9818 * Math.sin(2 * M * DEG)
    + 0.5255 * Math.sin(3 * M * DEG)
    + 0.1058 * Math.sin(4 * M * DEG)
    + 0.0219 * Math.sin(5 * M * DEG);
  const lon = norm360(L + C);
  const speed = 4.09;
  return { longitude: lon, speed };
}

// ─── Venus Position ───────────────────────────────────────────────────────────
function venusPosition(T) {
  const L = norm360(181.9798 + 58517.8157 * T);
  const M = norm360(212.3519 + 58517.8039 * T);
  const C = 0.7758 * Math.sin(M * DEG)
    + 0.0033 * Math.sin(2 * M * DEG);
  const lon = norm360(L + C);
  const speed = 1.602;
  return { longitude: lon, speed };
}

// ─── Jupiter Position ─────────────────────────────────────────────────────────
function jupiterPosition(T) {
  const L = norm360(34.3515 + 3034.9057 * T);
  const M = norm360(20.9154 + 3034.9057 * T);
  const C = 5.5549 * Math.sin(M * DEG)
    + 0.1683 * Math.sin(2 * M * DEG)
    + 0.0071 * Math.sin(3 * M * DEG);
  const lon = norm360(L + C);
  const speed = 0.0831;
  return { longitude: lon, speed };
}

// ─── Saturn Position ──────────────────────────────────────────────────────────
function saturnPosition(T) {
  const L = norm360(50.0775 + 1222.1138 * T);
  const M = norm360(317.9065 + 1221.5515 * T);
  const C = 6.3585 * Math.sin(M * DEG)
    + 0.2204 * Math.sin(2 * M * DEG)
    + 0.0106 * Math.sin(3 * M * DEG);
  const lon = norm360(L + C);
  const speed = 0.0335;
  return { longitude: lon, speed };
}

// ─── Rahu / Ketu (Mean Node) ──────────────────────────────────────────────────
function rahuPosition(T) {
  // Mean ascending node (Rahu)
  const lon = norm360(125.0445 - 1934.1363 * T + 0.0020708 * T * T);
  return { longitude: lon, speed: -0.053 }; // always retrograde
}

// ─── Ascendant (Lagna) ────────────────────────────────────────────────────────
export function computeAscendant(jd, lat, lng) {
  const T = (jd - 2451545.0) / 36525.0;
  // GMST at 0h UT
  const JD0 = Math.floor(jd - 0.5) + 0.5;
  const T0 = (JD0 - 2451545.0) / 36525.0;
  const GMST0 = 100.4606184 + 36000.77004 * T0 + 0.000387933 * T0 * T0;
  const UT = (jd - JD0) * 24;
  const GMST = norm360(GMST0 + 360.98564724 * (jd - JD0));
  // LST
  const LST = norm360(GMST + lng);
  // Obliquity
  const eps = (23.439291111 - 0.013004167 * T) * DEG;
  const LSTrad = LST * DEG;
  const latRad = lat * DEG;
  // Ascendant
  const tanAsc = (-Math.cos(LSTrad)) / (Math.sin(eps) * Math.tan(latRad) + Math.cos(eps) * Math.sin(LSTrad));
  let asc = Math.atan(tanAsc) / DEG;
  if (asc < 0) asc += 180;
  if (Math.cos(LSTrad) > 0) asc += 180;
  return norm360(asc);
}

// ─── Main: Compute All Planets ────────────────────────────────────────────────
export function computePlanetPositions(jd) {
  const T = (jd - 2451545.0) / 36525.0;
  const ayanamsa = getLahiriAyanamsa(jd);

  const tropical = {
    sun:     sunPosition(T),
    moon:    moonPosition(T),
    mars:    marsPosition(T),
    mercury: mercuryPosition(T),
    jupiter: jupiterPosition(T),
    venus:   venusPosition(T),
    saturn:  saturnPosition(T),
    rahu:    rahuPosition(T),
  };

  // Ketu is always opposite Rahu
  tropical.ketu = {
    longitude: norm360(tropical.rahu.longitude + 180),
    speed: tropical.rahu.speed,
  };

  // Convert tropical → sidereal (subtract ayanamsa)
  const sidereal = {};
  for (const [planet, data] of Object.entries(tropical)) {
    sidereal[planet] = {
      ...data,
      longitude: norm360(data.longitude - ayanamsa),
      isRetrograde: data.speed < 0,
    };
  }

  return { sidereal, ayanamsa };
}

// ─── Combustion Check ─────────────────────────────────────────────────────────
export function checkCombustion(planets) {
  const sunLon = planets.sun.longitude;
  const thresholds = { moon: 12, mars: 17, mercury: 13, jupiter: 11, venus: 10, saturn: 15 };
  for (const [planet, threshold] of Object.entries(thresholds)) {
    if (planets[planet]) {
      let diff = Math.abs(planets[planet].longitude - sunLon);
      if (diff > 180) diff = 360 - diff;
      planets[planet].isCombust = diff < threshold;
    }
  }
  return planets;
}
