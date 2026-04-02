import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// We will dynamically import strings when language changes
const loadResources = async (lang) => {
  try {
    // Dynamic import to support code splitting
    const translations = await import(`./locales/${lang}.json`);
    i18n.addResourceBundle(lang, 'translation', translations.default, true, true);
  } catch (error) {
    console.error(`Failed to load translations for ${lang}`, error);
    // Optional fallback logic if a language bundle is missing
    if (lang !== 'en') await loadResources('en');
  }
};

i18n
  .use(initReactI18next)
  .init({
    lng: 'en', // Default initial language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already safes from xss
    },
    resources: {
      en: {
        translation: {} // Empty initially, populated lazily or imported statically later
      }
    }
  });

i18n.on('languageChanged', (lng) => {
  if (!i18n.hasResourceBundle(lng, 'translation')) {
    loadResources(lng);
  }
});

export default i18n;
