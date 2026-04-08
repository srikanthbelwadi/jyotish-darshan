const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

/**
 * Converts Ecliptic Longitude & Latitude to Topocentric Altitude and Azimuth.
 * 
 * @param {number} eclLon - Ecliptic Longitude in degrees
 * @param {number} eclLat - Ecliptic Latitude in degrees
 * @param {number} lst - Local Sidereal Time in hours (0-24)
 * @param {number} obsLat - Observer's Geographical Latitude in degrees
 * @returns { {alt: number, az: number} } - Altitude (-90 to 90), Azimuth (0 to 360, North=0, East=90)
 */
export function eclipticToHorizontal(eclLon, eclLat, lst, obsLat) {
  // 1. Convert Ecliptic to Equatorial (RA, Dec)
  // Obliquity of the Ecliptic (approximate for modern epoch, accurate enough for visual rendering)
  const epsilon = 23.4392911 * DEG2RAD;
  
  const lonRad = eclLon * DEG2RAD;
  const latRad = eclLat * DEG2RAD;

  const sinDec = Math.sin(latRad) * Math.cos(epsilon) + Math.cos(latRad) * Math.sin(epsilon) * Math.sin(lonRad);
  const decRad = Math.asin(sinDec); // Declination

  const cosDecSinRa = Math.cos(latRad) * Math.cos(epsilon) * Math.sin(lonRad) - Math.sin(latRad) * Math.sin(epsilon);
  const cosDecCosRa = Math.cos(latRad) * Math.cos(lonRad);
  let raRad = Math.atan2(cosDecSinRa, cosDecCosRa); // Right Ascension
  if (raRad < 0) raRad += 2 * Math.PI;

  // 2. Compute Local Hour Angle (LHA)
  const lstRad = (lst * 15.0) * DEG2RAD;
  let lhaRad = lstRad - raRad;
  
  // 3. Convert Equatorial to Horizontal (Alt, Az)
  const obsLatRad = obsLat * DEG2RAD;

  const sinAlt = Math.sin(decRad) * Math.sin(obsLatRad) + Math.cos(decRad) * Math.cos(obsLatRad) * Math.cos(lhaRad);
  const altRad = Math.asin(sinAlt);
  const alt = altRad * RAD2DEG;

  // Compute Azimuth with North = 0 (Astronomical convention often uses South = 0, but North is standard for Stellarium-like tools)
  const azY = Math.sin(lhaRad);
  const azX = Math.cos(lhaRad) * Math.sin(obsLatRad) - Math.tan(decRad) * Math.cos(obsLatRad);
  let azRad = Math.atan2(azY, azX) + Math.PI; // Adding PI normalizes it so North=0, East=90
  
  let az = azRad * RAD2DEG;
  if (az < 0) az += 360;
  if (az >= 360) az -= 360;

  return { alt, az };
}

/**
 * Maps Alt/Az directly into 3D Cartesian coordinates for Three.js 
 * Assume Y is Up (Altitude 90). Center of dome is (0,0,0).
 * Radius R.
 */
export function getCartesianFromAltAz(alt, az, radius) {
  const altRad = alt * DEG2RAD;
  const azRad = az * DEG2RAD;
  
  // In a standard Three.js scene:
  // Y = Up
  // Azimuth is measured from North (0) towards East (90).
  // If North is -Z, East is +X:
  const y = radius * Math.sin(altRad);
  const x = radius * Math.cos(altRad) * Math.sin(azRad);
  const z = -radius * Math.cos(altRad) * Math.cos(azRad);

  return { x, y, z };
}
