import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { PILLAR_DATA } from '../../data/pillarData';
import { EclipticChart } from './EclipticVisualizer';
import { UniversalLoader } from './UniversalLoader';

export default function InteractionGateway({ targetPillar, onSelect, K, partnerKundali, t, lang, user, onRequireLogin }) {
  const data = PILLAR_DATA[targetPillar];
  const hue = [...targetPillar].reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360;

  const profileId = K?.input?.id || K?.input?.name?.toLowerCase().replace(/\\s+/g, '_') || 'default';

  const [isRevealed, setIsRevealed] = React.useState(false);

  const { data: pathwayData, isLoading, error, refetch } = useQuery({
    queryKey: ['pathway', profileId, targetPillar, lang],
    queryFn: async () => {
      const res = await fetch('/api/pathway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentDate: new Date().toString(),
          pillarId: targetPillar,
          pillarTitle: data.title,
          pillarDesc: data.desc,
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
      let resData = {};
      try {
        resData = JSON.parse(text);
      } catch (e) {
        if (!res.ok) throw new Error(res.status === 404 ? 'AI generation requires Vercel Backend (run `vercel dev` instead of `npm run dev`).' : 'Backend returned non-JSON response.');
        throw e;
      }
      if(!res.ok) throw new Error(resData.error || 'Failed to sync with pathway matrix.');
      return resData;
    },
    enabled: !!(K && user && isRevealed),
  });

  return (
    <div style={{ background: 'var(--bg-app)', padding: '0 0 80px 0', border: '1px solid #4a151b', borderRadius: '8px', overflow: 'hidden' }}>
       {/* 1. Summary Image & Description Panel */}
       <div style={{ position: 'relative', minHeight: '400px', borderBottom: '2px solid var(--border-light)' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'var(--bg-app)' }}></div>
          
          <div className="mobile-hero-padding" style={{ position: 'relative', zIndex: 10, padding: '40px', display: 'flex', gap: '40px', flexWrap: 'wrap', alignItems: 'center', minHeight: '400px', boxSizing: 'border-box' }}>
             <div style={{ flex: '1 1 500px', minWidth: 0 }}>
               <h3 style={{ fontSize: '48px', color: 'var(--accent-gold)', margin: '0 0 16px 0', fontFamily: '"Cinzel", serif', textShadow: '0 4px 20px var(--bg-surface)' }}>{t(data.title)}</h3>
               {isLoading ? (
                   <div className="mobile-loader-margin">
                      <UniversalLoader />
                   </div>
               ) : error ? (
                   <div style={{ marginBottom: '32px' }}>
                     <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                       <button onClick={() => refetch()} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '16px', cursor: 'pointer', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', width: '32px', height: '32px' }}>⟳</button>
                     </div>
                     <p style={{ color: 'var(--text-badge-red)', fontSize: '18px', fontFamily: '"Cinzel", serif', textAlign: 'center' }}>⚠️ {error.message}</p>
                   </div>
               ) : pathwayData?.summary ? (
                   <div style={{ marginBottom: '32px' }}>
                     <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                       <button onClick={() => refetch()} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '16px', cursor: 'pointer', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', width: '32px', height: '32px' }}>⟳</button>
                     </div>
                     <p style={{ padding: '24px', background: 'var(--bg-surface)', borderTop: '4px solid #ffd700', color: 'var(--text-main)', fontSize: '18px', fontFamily: 'serif', lineHeight: 1.8, textShadow: '0 2px 10px var(--bg-surface)', maxWidth: '800px', margin: '0 auto', fontStyle: 'italic', textAlign: 'center' }}>
                       "{pathwayData.summary}"
                     </p>
                   </div>
               ) : !isRevealed ? (
                   <div style={{ marginBottom: '32px', textAlign: 'center' }}>
                     <p style={{ color: 'var(--text-main)', fontSize: '18px', fontFamily: 'serif', lineHeight: 1.8, textShadow: '0 2px 10px var(--bg-surface)', maxWidth: '800px', margin: '0 auto 24px auto' }}>
                       This sacred pathway delves deep into the <strong>{data.desc}</strong> of your existence. By decoding the precise planetary transits governing this dimension within your D1 matrix, we unveil the karmic trajectory designed exclusively for you.
                     </p>
                     <button onClick={() => setIsRevealed(true)} style={{ background: 'var(--accent-gold)', color: '#000', padding: '12px 28px', border: 'none', borderRadius: '4px', fontSize: '18px', fontWeight: 'bold', fontFamily: '"Cinzel", serif', cursor: 'pointer', boxShadow: '0 4px 15px rgba(255,215,0,0.3)', transition: 'all 0.2s', textTransform: 'uppercase', letterSpacing: '1px' }} onMouseOver={e=>e.currentTarget.style.transform='translateY(-2px)'} onMouseOut={e=>e.currentTarget.style.transform='translateY(0)'}>
                        {t('Show Prediction', lang)} ➔
                     </button>
                   </div>
               ) : (
                   <div style={{ marginBottom: '32px' }}>
                     <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                       <button onClick={() => refetch()} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '16px', cursor: 'pointer', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', width: '32px', height: '32px' }}>⟳</button>
                     </div>
                     <p style={{ color: 'var(--text-main)', fontSize: '18px', fontFamily: 'serif', lineHeight: 1.8, textShadow: '0 2px 10px var(--bg-surface)', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                       This sacred pathway delves deep into the <strong>{data.desc}</strong> of your existence. {data.prompt} By decoding the precise planetary transits and stellar coordinates governing this dimension within your D1 matrix, we unveil the karmic trajectory designed exclusively for you. The ancient Parashari logic binds these 6 potential realities directly to your soul's resonance.
                     </p>
                   </div>
               )}
             </div>
             
             {/* 2. Ecliptic Visualization */}
             <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
               <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: '"Cinzel", serif', letterSpacing: '2px', marginBottom: '16px', textTransform: 'uppercase' }}>{t('Stellar Ecliptic Alignment')}</div>
               <EclipticChart hue={hue} pillarId={targetPillar} t={t} K={K} />
             </div>
          </div>
       </div>

       {/* 3. 6 Shastric Outcome Cards with Images */}
       <div className="mobile-hero-padding" style={{ padding: '60px 40px 0 40px' }}>
         {pathwayData?.options?.length > 0 && (
           <h4 style={{ color: 'var(--text-main)', fontSize: '28px', fontFamily: '"Cinzel", serif', textAlign: 'center', marginBottom: '40px', textTransform: 'uppercase', letterSpacing: '4px' }}>{t('Select an Outcome to Reveal Prophecy')}</h4>
         )}
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '32px' }}>
           {(pathwayData?.options || []).map((opt, i) => {
             return (
               <button 
                 key={opt.id} 
                 onClick={() => {
                    if (!user) {
                       onRequireLogin();
                       return;
                    }
                    onSelect(opt);
                 }}
                 style={{ 
                   position: 'relative', height: '240px', overflow: 'hidden', border: '2px solid var(--border-light)', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)', 
                   display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textDecoration: 'none', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(5px)'
                 }}
                 onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-10px)'; e.currentTarget.style.borderColor = 'var(--accent-gold)'; e.currentTarget.style.boxShadow = '0 20px 40px var(--bg-surface), 0 0 20px rgba(255,215,0,0.2)'; e.currentTarget.querySelector('.card-bg').style.transform = 'scale(1.1)'; e.currentTarget.querySelector('.card-bg').style.opacity = '0.8'; }}
                 onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)'; e.currentTarget.querySelector('.card-bg').style.transform = 'scale(1)'; e.currentTarget.querySelector('.card-bg').style.opacity = '1'; }}
               >
                 <div className="card-bg" style={{ position: 'absolute', inset: 0, background: 'var(--bg-card)', zIndex: 0, transition: 'all 0.6s ease' }}></div>

                 {!user && (
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-surface)', opacity: 0.85, backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)' }}>
                      <span style={{ fontSize: '42px', filter: 'drop-shadow(0 0 15px rgba(255,215,0,0.6))' }}>🔐</span>
                    </div>
                 )}

                 <span className="mobile-scale-icon" style={{ position: 'relative', zIndex: 2, filter: 'drop-shadow(0 0 20px rgba(255,215,0,0.6))', transition: 'transform 0.3s', opacity: user ? 1 : 0.3 }}>{opt.icon}</span>
                 <span style={{ position: 'relative', zIndex: 2, color: 'var(--text-main)', fontSize: 'clamp(14px, 4.5vw, 20px)', fontWeight: 'bold', fontFamily: '"Cinzel", serif', textTransform: 'uppercase', textShadow: '0 4px 10px var(--bg-surface)', letterSpacing: '1px', textAlign: 'center', opacity: user ? 1 : 0.3, wordBreak: 'break-word', padding: '0 8px' }}>
                   {t(opt.label)}
                 </span>
               </button>
             );
           })}
         </div>
       </div>
    </div>
  );
}
