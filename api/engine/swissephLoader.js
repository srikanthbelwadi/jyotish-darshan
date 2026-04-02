import SwissEph from 'swisseph-wasm';

let sweInstance = null;

import path from 'path';

export async function initializeAstroEngine(onProgress = () => {}) {
  if (sweInstance) return sweInstance;
  
  onProgress(5, 'Initializing WebAssembly computing core...');
  const s = new SwissEph();
  
  // In Node.js / Vercel Serverless, initSwissEph requires no locateFile hack.
  await s.initSwissEph();
  
  // Directly point SwissEph to the local project public directory for ephemeris files.
  // Vercel Serverless allows reading from process.cwd()/public
  const ephePath = path.join(process.cwd(), 'public', 'sweph');
  s.set_ephe_path(ephePath);
  s.SweModule.ccall('swe_set_sid_mode', 'void', ['number', 'number', 'number'], [1, 0, 0]); // Lahiri
  
  sweInstance = s;
  onProgress(100, 'Astrodynamics engine ready.');
  return s;
}

export function getSwe() {
  if (!sweInstance) throw new Error("Swiss Ephemeris not loaded yet.");
  return sweInstance;
}

export function setSweTestInstance(instance) {
  sweInstance = instance;
}
