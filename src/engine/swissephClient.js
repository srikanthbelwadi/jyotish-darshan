import SwissEph from 'swisseph-wasm';

let sweInstance = null;
let isInitializing = false;

export async function initClientAstroEngine(onProgress = () => {}) {
  if (sweInstance) return sweInstance;
  if (isInitializing) {
    // Wait until it's initialized if someone else started it
    while(!sweInstance) {
      await new Promise(r => setTimeout(r, 100));
    }
    return sweInstance;
  }
  isInitializing = true;
  
  onProgress(5, 'Initializing Desktop WebAssembly core...');
  const s = new SwissEph();
  // Bypass Vite's restrictive node_module exporter map by requesting the raw binary from public
  await s.initSwissEph({ locateFile: () => '/swisseph.wasm' });
  
  const files = [
    { name: 'sepl_18.se1', weight: 472 },
    { name: 'semo_18.se1', weight: 1200 },
    { name: 'seas_18.se1', weight: 218 }
  ];
  
  try {
    s.SweModule.FS.mkdir('/sweph');
  } catch(e) { /* ignore if already exists */ }

  let progressOffset = 10;
  const totalWeight = 1890; // approx KB

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    onProgress(progressOffset, `Downloading high-precision ephemeris (${file.name})...`);
    
    try {
      const resp = await fetch(`/sweph/${file.name}`);
      if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
      const buf = await resp.arrayBuffer();
      // Write to in-memory Emscripten FS
      s.SweModule.FS.writeFile(`/sweph/${file.name}`, new Uint8Array(buf));
      
      progressOffset += Math.floor((file.weight / totalWeight) * 80);
      onProgress(progressOffset, `Mounted ${file.name}`);
    } catch(err) {
      console.warn(`Failed to preload ${file.name}, accuracy may degrade to Moshier.`, err);
    }
  }

  s.set_ephe_path('/sweph');
  s.SweModule.ccall('swe_set_sid_mode', 'void', ['number', 'number', 'number'], [1, 0, 0]); // Lahiri
  
  sweInstance = s;
  isInitializing = false;
  onProgress(100, 'Astrodynamics engine ready.');
  return s;
}

export function getClientSwe() {
  if (!sweInstance) throw new Error("Swiss Ephemeris not loaded yet.");
  return sweInstance;
}
