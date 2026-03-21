import React, { useMemo } from 'react';
import { toJulianDay, computePlanetPositions } from '../engine/astronomy';

export default function DailyCalendar({ kundali, lang, t=(k)=>k, rashiNames }) {
  const today = new Date();
  
  // 1. Calculate Today's Moon Position (Transit/Gochar)
  const transitData = useMemo(() => {
    try {
      if (!kundali || !kundali.moon || kundali.moon.rashiIndex === undefined) return null;
      
      const offset = -today.getTimezoneOffset() / 60;
      const jd = toJulianDay(
        today.getFullYear(), today.getMonth() + 1, today.getDate(),
        today.getHours(), today.getMinutes(), offset
      );
      
      const { sidereal } = computePlanetPositions(jd);
      const transitMoonLon = sidereal.moon.longitude;
      const transitRashiIndex = Math.floor(transitMoonLon / 30);
      
      const natalRashiIndex = kundali.moon.rashiIndex;
      
      // Calculate house distance (1 to 12)
      const houseFromMoon = (transitRashiIndex - natalRashiIndex + 12) % 12 + 1;
      
      let state = 'mix'; // default
      // 1,3,6,7,10,11 = Favorable
      if ([1, 3, 6, 7, 10, 11].includes(houseFromMoon)) state = 'fav';
      // 4,8,12 = Unfavorable
      else if ([4, 8, 12].includes(houseFromMoon)) state = 'unf';
      
      return {
        rashiIndex: transitRashiIndex,
        rashiName: rashiNames ? rashiNames[transitRashiIndex] : 'Current Sign',
        house: houseFromMoon,
        state
      };
    } catch(e) {
      console.error(e);
      return null;
    }
  }, [kundali, rashiNames]);

  const locale = lang === 'en' ? 'en-IN' : (lang === 'sa' ? 'hi-IN' : `${lang}-IN`);
  const dateString = today.toLocaleDateString(locale, {
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  });

  // Safe fallback if calculation fails
  if (!transitData) return null;

  // L_RASHI is not imported here, but we can rely on kundali.rashiList since the parent App can provide it.
  // Wait, let's just pass `rashiList` to DailyCalendar, or we can use a small fallback list array since L_RASHI is local to App.jsx
  // We can pass `rashiNames={L_RASHI[lang]}` from App.jsx, but for now we can rely on standard english list if not provided, or better, we can read it off `kundali`?
  // Actually, App.jsx uses `<DailyCalendar kundali={kundali} lang={lang} t={t} rashiList={L_RASHI[lang]||L_RASHI.en} />`
  // Let's assume we can add `rashiList` as a prop!
  
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-light)',
      borderRadius: '12px',
      padding: '24px',
      color: 'var(--text-main)',
      marginBottom: '20px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--accent-gold)' }}>🌤️</span> {t('ov.dailyWeather', lang) || 'Daily Cosmic Weather'}
          </h3>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>{dateString}</p>
        </div>
      </div>
      
      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px 18px', borderRadius: 8, marginBottom: 20, borderLeft: '3px solid var(--accent-gold)' }}>
         <p style={{ margin: 0, fontSize: 14, color: 'var(--text-main)', lineHeight: 1.5 }}>
           {t('ov.transitRationale', lang)
              ?.replace('{rashi}', transitData.rashiName || 'the current sign')
              ?.replace('{house}', transitData.house) || `Transit Moon in ${transitData.house}th house from Janma Rashi`}
         </p>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
        <div style={{ background: 'var(--bg-dark)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #10B981' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>{t('ov.favorable', lang)}</div>
          <div style={{ fontSize: '14px', color: 'var(--text-main)' }}>{t(`ov.favorableDesc_${transitData.state}`, lang) || t('ov.favorableDesc', lang)}</div>
        </div>
        <div style={{ background: 'var(--bg-dark)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #EF4444' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>{t('ov.avoid', lang)}</div>
          <div style={{ fontSize: '14px', color: 'var(--text-main)' }}>{t(`ov.avoidDesc_${transitData.state}`, lang) || t('ov.avoidDesc', lang)}</div>
        </div>
        <div style={{ background: 'var(--bg-dark)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid var(--accent-gold)' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>{t('ov.mantra', lang)}</div>
          <div style={{ fontSize: '14px', color: 'var(--text-main)', fontStyle: 'italic' }}>{t(`ov.mantraDesc_${transitData.state}`, lang) || t('ov.mantraDesc', lang)}</div>
        </div>
      </div>
    </div>
  );
}
