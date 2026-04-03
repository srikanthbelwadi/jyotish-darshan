import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, fetchCloudUserData, syncSettingsToCloud } from '../firebase';
import i18next from '../i18n';

const PreferencesContext = createContext();

export const usePreferences = () => useContext(PreferencesContext);

export const PreferencesProvider = ({ children }) => {
  const safeGetItem = (key, fallback) => {
    try {
      return localStorage.getItem(key) || fallback;
    } catch (e) {
      return fallback;
    }
  };

  const [lang, setLangState] = useState(() => safeGetItem('jd_lang', 'en'));
  const [theme, setThemeState] = useState(() => safeGetItem('jd_theme', 'light'));
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [user, setUser] = useState(null);

  // Sync with auth state and fetch settings on login
  useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const cloudData = await fetchCloudUserData(u.uid);
          if (cloudData && cloudData.settings) {
            const { lang: cLang, theme: cTheme } = cloudData.settings;
            if (cLang && cLang !== lang) {
              setLangState(cLang);
              localStorage.setItem('jd_lang', cLang);
            }
            if (cTheme && cTheme !== theme) {
              setThemeState(cTheme);
              localStorage.setItem('jd_theme', cTheme);
            }
          }
        } catch (e) {
          console.error("Failed to fetch cloud settings", e);
        }
      }
    });
    return () => unsub();
  }, []); // Intentionally empty dependency array so it runs once

  useEffect(() => {
    if (i18next.language !== lang) {
      i18next.changeLanguage(lang);
    }
  }, [lang]);

  // Function to deliberately change language and trigger cache clearing
  const setLanguage = async (newLang) => {
    if (newLang === lang) return;
    
    // Explicit regeneration barrier tracking
    setIsRegenerating(true);
    
    // Clear all predictive AI caches to force native regeneration
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('jyotish_oracle') || key.startsWith('jyotish_pathway') || key.startsWith('jd_')) {
        // preserve base settings
        if (key !== 'jd_lang' && key !== 'jd_theme' && key !== 'jd_profiles') {
          localStorage.removeItem(key);
        }
      }
    });

    setLangState(newLang);
    localStorage.setItem('jd_lang', newLang);
    i18next.changeLanguage(newLang);

    if (user) {
      await syncSettingsToCloud(user.uid, { lang: newLang, theme });
    }

    // Allow components a moment to flush before unsetting the regenerating flag
    setTimeout(() => {
      setIsRegenerating(false);
    }, 500); 
  };

  const setTheme = async (newTheme) => {
    if (newTheme === theme) return;
    setThemeState(newTheme);
    localStorage.setItem('jd_theme', newTheme);
    document.body.setAttribute('data-theme', newTheme);

    if (user) {
      await syncSettingsToCloud(user.uid, { lang, theme: newTheme });
    }
  };

  // Sync body theme attribute on mount
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  // Expose context
  const value = {
    lang,
    setLanguage,
    theme,
    setTheme,
    isRegenerating
  };

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
};
