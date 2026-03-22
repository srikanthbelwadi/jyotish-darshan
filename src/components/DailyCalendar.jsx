import React, { useMemo } from 'react';
import { toJulianDay, computePlanetPositions } from '../engine/astronomy';

export default function DailyCalendar({ kundali, lang, t=(k)=>k, rashiNames }) {
  const weekData = useMemo(() => {
    try {
      if (!kundali || !kundali.planets) return null;
      const natalMoon = kundali.planets.find(p => p.key === 'moon');
      if (!natalMoon || natalMoon.rashi === undefined) return null;
      
      const results = [];
      const today = new Date();
      // Calculate for Noon local time to capture the primary Tithi of the day
      today.setHours(12, 0, 0, 0);

      for (let i = 0; i < 7; i++) {
        const date = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
        const offset = -date.getTimezoneOffset() / 60;
        const jd = toJulianDay(
          date.getFullYear(), date.getMonth() + 1, date.getDate(),
          date.getHours(), date.getMinutes(), offset
        );
        
        const { sidereal } = computePlanetPositions(jd);
        const moonLon = sidereal.moon.longitude;
        const sunLon = sidereal.sun.longitude;
        
        // --- 1. Transit Moon from Natal Moon ---
        const transitRashiIndex = Math.floor(moonLon / 30);
        const natalRashiIndex = natalMoon.rashi;
        const houseFromMoon = (transitRashiIndex - natalRashiIndex + 12) % 12 + 1;
        
        let state = 'mix';
        if ([1, 3, 6, 7, 10, 11].includes(houseFromMoon)) state = 'fav';
        else if ([4, 8, 12].includes(houseFromMoon)) state = 'unf';
        
        // --- 2. Calculate Exact Lunar Tithi Index ---
        const diff = (moonLon - sunLon + 360) % 360;
        const tithiIndex = Math.floor(diff / 12);
        
        // Detect Special Festivals / Vratas
        let tithiName = '';
        let practice = '';
        if (tithiIndex === 10 || tithiIndex === 25) { 
          tithiName = 'Ekadashi'; 
          practice = 'A highly auspicious day for fasting, spiritual reflection, and detoxification.';
        } else if (tithiIndex === 14) { 
          tithiName = 'Purnima (Full Moon)'; 
          practice = 'A day of maximum emotional and spiritual energy. Excellent for gratitude and meditation.';
        } else if (tithiIndex === 29) { 
          tithiName = 'Amavasya (New Moon)'; 
          practice = 'A powerful day for inward reflection, resting, and honoring ancestors.';
        } else if (tithiIndex === 12 || tithiIndex === 27) {
          tithiName = 'Pradosh';
          practice = 'The twilight hours today are exceptional for clearing karma and meditating on Shiva.';
        }

        results.push({
          date,
          dayOffset: i,
          rashiIndex: transitRashiIndex,
          rashiName: rashiNames ? rashiNames[transitRashiIndex] : 'Current Sign',
          house: houseFromMoon,
          state,
          tithiIndex,
          tithiName,
          practice
        });
      }
      return results;
    } catch(e) {
      console.error(e);
      return null;
    }
  }, [kundali, rashiNames]);

  if (!weekData || weekData.length === 0) return null;
  const todayData = weekData[0];
  const upcoming = weekData.slice(1);

  const getDayName = (d, l) => d.toLocaleDateString(l, { weekday: 'short' });
  const getFullDate = (d, l) => d.toLocaleDateString(l, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const locale = lang === 'en' ? 'en-IN' : (lang === 'sa' ? 'hi-IN' : `${lang}-IN`);

  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border-light)',
      borderRadius: '12px', padding: '24px', color: 'var(--text-main)',
      marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
    }}>
      {/* --- TODAY'S HORIZON --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--accent-gold)' }}>🌤️</span> {t('todayHorizon', lang) || "Today's Cosmic Horizon"}
          </h3>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>{getFullDate(todayData.date, locale)}</p>
        </div>
      </div>
      
      {todayData.tithiName && (
        <div style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(217,119,6,0.1))', padding: '14px 18px', borderRadius: 8, marginBottom: 16, border: '1px solid rgba(124,58,237,0.2)' }}>
           <div style={{ fontWeight: 700, color: '#7C3AED', fontSize: 13, marginBottom: 4, letterSpacing: 0.5, textTransform: 'uppercase' }}>✨ {todayData.tithiName}</div>
           <p style={{ margin: 0, fontSize: 14, color: 'var(--text-main)', lineHeight: 1.5 }}>
             {todayData.practice}
           </p>
        </div>
      )}

      <div style={{ background: 'var(--bg-app)', padding: '14px 18px', borderRadius: 8, marginBottom: 20, borderLeft: '3px solid var(--accent-gold)' }}>
         <p style={{ margin: 0, fontSize: 13, color: 'var(--text-main)', lineHeight: 1.5 }}>
           {t('ov.transitRationale', lang)
              ?.replace('{rashi}', todayData.rashiName)
              ?.replace('{house}', todayData.house) || `Transit Moon in ${todayData.house}th house from Janma Rashi.`}
         </p>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: 24 }}>
        <div style={{ background: 'var(--bg-dark)', padding: '14px', borderRadius: '8px', borderTop: '3px solid #10B981' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px', textTransform:'uppercase' }}>{t('ov.favorable', lang)||'Favorable'}</div>
          <div style={{ fontSize: '13px', color: 'var(--text-main)' }}>{t(`ov.favorableDesc_${todayData.state}`, lang) || t('ov.favorableDesc', lang)}</div>
        </div>
        <div style={{ background: 'var(--bg-dark)', padding: '14px', borderRadius: '8px', borderTop: '3px solid #EF4444' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px', textTransform:'uppercase' }}>{t('ov.avoid', lang)||'Avoid'}</div>
          <div style={{ fontSize: '13px', color: 'var(--text-main)' }}>{t(`ov.avoidDesc_${todayData.state}`, lang) || t('ov.avoidDesc', lang)}</div>
        </div>
        <div style={{ background: 'var(--bg-dark)', padding: '14px', borderRadius: '8px', borderTop: '3px solid var(--accent-gold)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px', textTransform:'uppercase' }}>{t('ov.mantra', lang)||'Mantra'}</div>
          <div style={{ fontSize: '13px', color: 'var(--text-main)', fontStyle: 'italic' }}>{t(`ov.mantraDesc_${todayData.state}`, lang) || t('ov.mantraDesc', lang)}</div>
        </div>
      </div>

      {/* --- WEEKLY HORIZON (NEXT 6 DAYS) --- */}
      <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{t('weekAhead', lang) || "The Week Ahead"}</h4>
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
        {upcoming.map((day, idx) => (
          <div key={idx} style={{ 
            minWidth: '85px', flex: 1, 
            background: 'var(--bg-dark)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '10px 8px', textAlign: 'center',
            position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: day.state === 'fav' ? '#10B981' : day.state === 'unf' ? '#EF4444' : '#D97706' }} />
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', marginBottom: 2 }}>{getDayName(day.date, locale)}</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: 6 }}>{day.date.getDate()} {day.date.toLocaleDateString(locale,{month:'short'})}</div>
            
            <div style={{ fontSize: '11px', color: 'var(--text-main)', background: 'var(--bg-app)', borderRadius: 12, padding: '2px 0', margin: '0 auto', width: '80%' }}>
              H{day.house}
            </div>
            
            {day.tithiName && (
              <div style={{ fontSize: '9px', fontWeight: 700, color: '#7C3AED', marginTop: 6, lineHeight: 1.2 }}>
                {day.tithiName.split(' ')[0]}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
