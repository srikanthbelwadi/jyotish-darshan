import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UniversalLoader } from './UniversalLoader';

export const MandalaHero = ({ activeTime, setActiveTime, K, t, lang, partnerKundali, user, onRequireLogin }) => {
  const timescales = ['Today', 'This Lunar Phase', 'This Masa (Month)', 'This Samvatsara (Year)', 'Mahadasha'];
  const [isMinimized, setIsMinimized] = useState(false);

  const profileId = K?.input?.id || K?.input?.name?.toLowerCase().replace(/\\s+/g, '_') || 'default';

  const { data: predictionData, isLoading, error, refetch } = useQuery({
    queryKey: ['oracle', activeTime, profileId, lang],
    queryFn: async () => {
      const res = await fetch('/api/oracle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentDate: new Date().toString(),
          timescale: activeTime,
          lang: lang,
          kundaliData: {
             lagna: { rashi: K.lagna?.rashi, deg: K.lagna?.degFmt },
             planets: K.planets.map(p => ({
               id: p.key, sign: p.rashi, house: p.house, nak: p.nakshatraName
             })),
             dasha: K.dasha ? { 
               maha: K.dasha.current?.planet || 'Unknown', 
               antar: (K.dasha.current?.antars && K.dasha.current.antars.find(a => a.isCurrent)?.planet) || 'Unknown'
             } : null,
             panchanga: K.panchanga ? {
               tithi: K.panchanga.tithi?.name,
               karana: K.panchanga.karana?.name,
               yoga: K.panchanga.yoga?.name,
               nakshatra: K.panchanga.nakshatra?.name
             } : null,
             ashtakavarga: K.ashtakavarga ? { SAV: K.ashtakavarga.SAV } : null
          },
          partnerData: partnerKundali ? {
             lagna: { rashi: partnerKundali.lagna?.rashi },
             moon: partnerKundali.planets.find(p => p.key === 'moon')?.rashi,
             nakshatra: partnerKundali.panchanga?.nakshatra?.name || partnerKundali.planets.find(p => p.key === 'moon')?.nakshatraName
          } : null
        })
      });

      const text = await res.text();
      let data = {};
      try {
        data = JSON.parse(text);
      } catch(e) {
        if (!res.ok) throw new Error(res.status === 404 ? 'AI generation requires Vercel Backend (run `vercel dev` instead of `npm run dev`).' : 'Backend returned non-JSON response.');
        throw e;
      }

      if (!res.ok) throw new Error(data.error || 'Failed to consult the Oracle.');
      return data.prediction;
    },
    enabled: false, // We only fetch on deliberate action, except...
  });

  // We only fetch on deliberate action, so no auto-fetch useEffect here.

  return (
    <div className="mobile-hero-padding" style={{ background: 'var(--bg-input)', backgroundImage: 'radial-gradient(var(--bg-input) 20%, transparent 20%), radial-gradient(var(--bg-input) 20%, transparent 20%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px', padding: '50px', borderRadius: '4px', border: '2px solid var(--border-light)', marginBottom: '32px', position: 'relative', overflow: 'hidden', boxShadow: 'inset 0 0 50px var(--bg-surface), 0 10px 30px rgba(0,0,0,0.5)' }}>
      <div style={{ position: 'absolute', top: '50%', right: '-5%', transform: 'translateY(-50%)', width: '300px', height: '300px', border: '5px dashed var(--border-light)', borderRadius: '50%', animation: 'spin 120s linear infinite', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
         <div style={{ width: '200px', height: '200px', border: '10px double var(--border-light)', borderRadius: '50%', animation: 'spin 60s reverse infinite' }}></div>
      </div>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontSize: '38px', color: 'var(--accent-gold)', margin: '0 0 16px 0', fontFamily: 'var(--font-serif)', textShadow: '0 2px 4px var(--bg-surface)' }}>{t('Predictions')}</h2>
        
        {/* Desktop Buttons */}
        <div className="desktop-timescale-btns" style={{ gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {timescales.map(ts => (
            <button key={ts} onClick={() => { setActiveTime(ts); setIsMinimized(false); }} style={{ background: activeTime === ts ? 'var(--accent-gold)' : 'var(--bg-input)', color: activeTime === ts ? 'var(--bg-input)' : 'var(--accent-gold)', border: '1px solid #ffd700', padding: '8px 16px', borderRadius: '0', fontSize: '14px', fontWeight: 'bold', fontFamily: 'var(--font-serif)', cursor: 'pointer', transition: 'all 0.2s ease', textTransform: 'uppercase' }}>{t(ts)}</button>
          ))}
        </div>

        {/* Mobile Dropdown */}
        <select 
          className="mobile-timescale-select" 
          value={activeTime} 
          onChange={(e) => { setActiveTime(e.target.value); setIsMinimized(false); }}
        >
          {timescales.map(ts => (
            <option key={ts} value={ts}>{t(ts)}</option>
          ))}
        </select>
        
        <div className="mobile-oracle-box" style={{ background: 'var(--bg-surface)', position: 'relative', padding: '24px', borderTop: '4px solid #ffd700', minHeight: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {!user && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', background: 'rgba(10,10,10,0.7)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
              <div style={{ fontSize: '42px', marginBottom: '12px', filter: 'drop-shadow(0 0 10px rgba(255,215,0,0.6))' }}>🔒</div>
              <h3 style={{ fontFamily: 'var(--font-serif)', margin: '0 0 16px', color: 'var(--accent-gold)' }}>{t('Unlock Shastric Oracle')}</h3>
              <button style={{ padding: '12px 24px', fontSize: '14px', background: 'var(--accent-gold)', color: '#000', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-serif)', fontWeight: 'bold', letterSpacing: '1px' }} onClick={onRequireLogin}>
                {t('Authenticate to Reveal ➔')}
              </button>
            </div>
          )}
          {isLoading ? (
             <UniversalLoader />
          ) : error ? (
             <p style={{ margin: 0, fontSize: '16px', color: 'var(--text-badge-red)', fontFamily: 'var(--font-serif)' }}>⚠️ {error.message}</p>
          ) : (
             <div style={{ position: 'relative', width: '100%', minHeight: '50px' }}>
               {predictionData && (
                 <>
                   <button 
                     onClick={() => setIsMinimized(!isMinimized)}
                     title={isMinimized ? t('Expand Results') : t('Minimize Results')}
                     style={{ position: 'absolute', top: '-16px', right: '16px', background: 'var(--bg-surface)', border: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '18px', cursor: 'pointer', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease', width: '36px', height: '36px', zIndex: 10, boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}
                   >
                     {isMinimized ? '+' : '−'}
                   </button>
                   {!isMinimized && (
                     <button 
                       onClick={() => refetch()}
                       title={t('Consult again (Override cache)')}
                       style={{ position: 'absolute', top: '-16px', right: '64px', background: 'var(--bg-surface)', border: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '18px', cursor: 'pointer', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease', width: '36px', height: '36px', zIndex: 10, boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}
                     >
                       ⟳
                     </button>
                   )}
                 </>
               )}
               {isMinimized && predictionData ? (
                 <div style={{ padding: '24px', background: 'var(--bg-input)', border: '1px dashed var(--border-light)', borderRadius: '8px', textAlign: 'center', animation: 'fadeIn 0.3s ease' }}>
                    <p style={{ margin: 0, color: 'var(--accent-gold)', fontFamily: 'var(--font-serif)', fontSize: '16px' }}>{t('Oracle Insights Minimized')}</p>
                 </div>
               ) : typeof predictionData === 'string' ? (
                 <p style={{ margin: 0, fontSize: '18px', lineHeight: 1.6, color: 'var(--text-main)', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
                   "{predictionData || t('Awaiting celestial alignment...')}"
                 </p>
               ) : predictionData ? (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                   <div style={{ padding: '24px', background: 'var(--bg-input)', borderTop: '4px solid #ffd700', boxShadow: '0 4px 15px rgba(0,0,0,0.5)', textAlign: 'center' }}>
                     <div style={{ color: 'var(--accent-gold)', fontSize: '14px', fontWeight: 'bold', fontFamily: 'var(--font-serif)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>{t('Predictive Trajectory')}</div>
                     <p style={{ color: 'var(--text-main)', fontSize: '18px', margin: 0, fontFamily: 'var(--font-serif)' }}>{predictionData.period}</p>
                   </div>
                   
                   <div style={{ padding: '24px', background: 'var(--bg-input)', borderTop: '4px solid #ffd700', boxShadow: '0 4px 15px rgba(0,0,0,0.5)', textAlign: 'center' }}>
                     <div style={{ color: 'var(--accent-gold)', fontSize: '14px', fontWeight: 'bold', fontFamily: 'var(--font-serif)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>{t('Astrological Basis')}</div>
                     <p style={{ color: 'var(--text-main)', fontSize: '18px', margin: 0, fontFamily: 'var(--font-serif)' }}>{predictionData.basis}</p>
                   </div>
                   
                   <div style={{ padding: '24px', background: 'var(--bg-input)', borderTop: '4px solid #ffd700', boxShadow: '0 4px 15px rgba(0,0,0,0.5)', textAlign: 'center' }}>
                     <div style={{ color: 'var(--accent-gold)', fontSize: '14px', fontWeight: 'bold', fontFamily: 'var(--font-serif)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>{t('Prophetic Assertions')}</div>
                     <p style={{ color: 'var(--text-main)', fontSize: '18px', margin: 0, fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>"{predictionData.assertions}"</p>
                   </div>
                   
                   <div style={{ padding: '24px', background: 'var(--bg-card)', borderTop: '4px solid var(--accent-gold)', boxShadow: '0 4px 15px rgba(0,0,0,0.5)', textAlign: 'center' }}>
                     <div style={{ color: 'var(--accent-gold)', fontSize: '14px', fontWeight: 'bold', fontFamily: 'var(--font-serif)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>{t('Lifestyle & Preparedness')}</div>
                     <p style={{ color: 'var(--text-main)', fontSize: '18px', margin: 0, fontFamily: 'var(--font-serif)' }}>{predictionData.lifestyle}</p>
                   </div>
                   
                   <div style={{ padding: '24px', background: 'var(--bg-card)', borderTop: '2px dashed var(--border-light)', boxShadow: '0 4px 15px rgba(0,0,0,0.5)', textAlign: 'center' }}>
                     <div style={{ color: 'var(--text-main)', fontSize: '14px', fontWeight: 'bold', fontFamily: 'var(--font-serif)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                       <span style={{ fontSize: '18px' }}>🕉️</span> {t('Shastric Mitigation')}
                     </div>
                     <p style={{ color: 'var(--text-main)', fontSize: '18px', margin: 0, fontFamily: 'var(--font-serif)' }}>{predictionData.mitigation}</p>
                   </div>
                 </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '32px 0' }}>
                     <button 
                       onClick={() => refetch()}
                       style={{ 
                         padding: '16px 32px', fontSize: '16px', background: 'var(--accent-gold)', 
                         color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', 
                         fontFamily: 'var(--font-serif)', fontWeight: 'bold', textTransform: 'uppercase',
                         boxShadow: '0 4px 15px rgba(212,175,55,0.3)', transition: 'all 0.3s ease'
                       }}
                       onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(212,175,55,0.5)'; }}
                       onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(212,175,55,0.3)'; }}
                     >
                       {t('Reveal Prediction')}
                     </button>
                  </div>
                )}
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
