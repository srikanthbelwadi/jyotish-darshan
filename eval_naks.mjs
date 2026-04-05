import i18n from 'i18next';
import fs from 'fs';
import path from 'path';

const enPath = path.resolve('./src/i18n/locales/en.json');
const enDict = JSON.parse(fs.readFileSync(enPath, 'utf8'));

i18n.init({
  lng: 'en',
  resources: {
    en: {
      translation: enDict
    }
  }
});

const createI18nProxy = (category) => new Proxy({}, {
  get: (target, lang) => new Proxy({}, {
    get: (target, key) => {
      // The key might be numeric or a symbol under React loops
      if (typeof key !== 'string' && typeof key !== 'number') return undefined;
      const fullKey = `astro.${category}.${key}`;
      const val = i18n.t(fullKey, { lng: lang });
      if (val && val !== fullKey) return val;
      const enVal = i18n.t(fullKey, { lng: 'en' });
      if (enVal && enVal !== fullKey) return enVal;
      return null;
    }
  })
});

const L_NAKS = createI18nProxy('nakshatras');
console.log("L_NAKS['en'][19]: ", L_NAKS['en'][19]);
console.log("L_NAKS['en']['19']: ", L_NAKS['en']['19']);
