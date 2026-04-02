import fs from 'fs';
import path from 'path';

// Since this is Vercel Serverless, we can dynamically load the JSON files that were bundled during the build!
// But to ensure Vercel includes them statically without dynamic tracing failure, we explicitly require/read them here.

const cache = {};

export function getDictionary(lang = 'en') {
  if (cache[lang]) return cache[lang];
  try {
    // Vercel output usually clusters src next to api depending on build settings.
    // Using process.cwd() ensures safety in both local and Vercel environments.
    const file = path.join(process.cwd(), 'src', 'i18n', 'locales', `${lang}.json`);
    if (fs.existsSync(file)) {
      const db = JSON.parse(fs.readFileSync(file, 'utf8'));
      cache[lang] = db;
      return db;
    }
  } catch (err) {
    console.error(`Failed loading dictionary for ${lang}:`, err);
  }
  
  // Fallback to English
  if (lang !== 'en') return getDictionary('en');
  return {};
}

// Deep get using string path (e.g., 'astro.grahas.sun')
export function tBackend(pathStr, lang = 'en', defaultVal = '') {
  const S = getDictionary(lang);
  let v = S;
  const parts = pathStr.split('.');
  for (const p of parts) {
    v = v?.[p];
  }
  
  if (typeof v === 'string') return v;
  if (v === undefined && lang !== 'en') {
     // cascaded fallback
     return tBackend(pathStr, 'en', defaultVal);
  }
  return v !== undefined && v !== null ? v : defaultVal;
}
