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

console.log("EXISTS: ", i18n.exists('astro.nakshatras.3'));
console.log("VALUE: ", i18n.t('astro.nakshatras.3'));

// Also let's check Nadi values
console.log("DONE");
