import React, { useState, useEffect } from 'react';
import { PILLAR_DATA } from '../../data/pillarData';
import InteractionGateway from './InteractionGateway';

export const AstrologicalRemedyBox = ({ alert, remedy, t }) => (
  <div style={{ marginTop: '24px', background: 'var(--bg-card)', padding: '24px', border: '2px solid var(--border-light)', boxShadow: '0 10px 30px var(--bg-surface)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
      <span style={{ fontSize: '24px' }}>🕉️</span><h4 style={{ margin: 0, color: 'var(--accent-gold)', fontSize: '20px', fontFamily: '"Cinzel", serif' }}>{t('Shastric Mitigation Protocol')}</h4>
    </div>
    {alert && <p style={{ color: 'var(--text-badge-red)', fontSize: '15px', marginBottom: '16px', background: 'rgba(255,0,0,0.1)', padding: '12px', border: '1px solid #ff6b6b' }}><strong>{t('Dosha Identified:')}</strong> {alert}</p>}
    <p style={{ color: 'var(--text-main)', fontSize: '16px', lineHeight: 1.6, margin: 0, fontFamily: 'serif' }}><strong>{t('Prescribed Parihara (Action):')}</strong> {remedy}</p>
  </div>
);

const MandalVisualizer = ({ selectedOpt }) => {
  return (
    <div style={{ width: '100%', height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
       <div style={{ position: 'absolute', width: '220px', height: '220px', borderRadius: '50%', border: '4px dashed #b8860b', animation: 'spin 40s linear infinite' }}></div>
       <div style={{ position: 'absolute', width: '170px', height: '170px', borderRadius: '50%', border: '2px solid #ffd700', animation: 'spin 20s reverse infinite' }}></div>
       <div style={{ position: 'absolute', width: '120px', height: '120px', background: '#8b0000', borderRadius: '50%', boxShadow: '0 0 40px rgba(184, 134, 11, 0.8)' }}></div>
       <div style={{ fontSize: '70px', zIndex: 10, filter: 'drop-shadow(0 0 15px rgba(255,215,0,0.8))' }}>{selectedOpt.icon}</div>
    </div>
  );
};

export const HousePillar = ({ pillarId, K, partnerKundali, t, lang, user, onRequireLogin }) => {
  const [opt, setOpt] = useState(null);

  useEffect(() => {
    const el = document.getElementById('mock-dashboard-top');
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    else { window.scrollTo({ top: 0, behavior: 'smooth' }); }
  }, [opt, pillarId]);
  
  const data = PILLAR_DATA[pillarId];

  if (!opt) return <InteractionGateway targetPillar={pillarId} onSelect={setOpt} K={K} partnerKundali={partnerKundali} t={t} lang={lang} user={user} onRequireLogin={onRequireLogin} />;

  return (
    <div className="responsive-grid-2" style={{ alignItems: 'start' }}>
       <div className="desktop-sticky-panel" style={{ background: 'var(--bg-input)', padding: '40px', border: '2px solid var(--border-light)', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)' }}>
         <MandalVisualizer selectedOpt={opt} />
         {opt.timeframe && (
           <div style={{ marginTop: '32px', textAlign: 'center', background: 'var(--bg-card)', padding: '16px', border: '1px solid var(--accent-gold)' }}>
             <div style={{ color: 'var(--accent-gold)', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>{t('Predictive Trajectory')}</div>
             <div style={{ color: 'var(--text-main)', fontSize: '18px', fontFamily: '"Cinzel", serif' }}>{opt.timeframe}</div>
           </div>
         )}
       </div>
       <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
         <button onClick={() => setOpt(null)} style={{ background: 'var(--bg-card)', color: 'var(--accent-gold)', border: '1px solid #ffd700', padding: '8px 16px', cursor: 'pointer', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '14px', fontFamily: '"Cinzel", serif', transition:'all 0.2s', textTransform:'uppercase' }} onMouseOver={e=>{e.currentTarget.style.background='var(--bg-input)'}} onMouseOut={e=>{e.currentTarget.style.background='var(--bg-card)'}}>
           {t('ig.backToPathways', '← BACK TO PATHWAYS')}
         </button>
         <div style={{ display: 'inline-block', background: 'var(--bg-card)', color: 'var(--accent-gold)', padding: '8px 16px', border: '1px solid #ffd700', fontSize: '14px', fontWeight: 'bold', fontFamily: '"Cinzel", serif', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px' }}>{t('Subject:')} {t(opt.label)}</div>
         <h3 style={{ color: 'var(--text-main)', fontSize: '30px', marginTop: 0, marginBottom: '32px', lineHeight: 1.3, fontFamily: '"Cinzel", serif', textShadow: '0 2px 4px var(--bg-surface)' }}>{t(data.title)}</h3>
         
         <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
           {opt.paragraphs && opt.paragraphs.map((para, idx) => (
             <div key={idx} style={{ background: 'var(--bg-input)', padding: '24px', borderTop: '4px solid #ffd700', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', textAlign: 'center' }}>
               {para.subheading && (
                 <div style={{ color: 'var(--text-main)', fontSize: '16px', fontWeight: 'bold', fontFamily: '"Cinzel", serif', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                   <span style={{ fontSize: '20px', color: 'var(--accent-gold)' }}>✧</span> {para.subheading}
                 </div>
               )}
               <p style={{ color: 'var(--text-main)', fontSize: '18px', lineHeight: 1.7, margin: '0 auto', fontFamily: 'serif', maxWidth: '800px' }}>{para.content}</p>
             </div>
           ))}
           
           {/* Fallback for old cached format */}
           {opt.prediction && !opt.paragraphs && (
             <div style={{ background: 'var(--bg-input)', padding: '24px', borderTop: '4px solid #ffd700', boxShadow: '0 4px 15px rgba(0,0,0,0.5)', textAlign: 'center' }}>
               <div style={{ color: 'var(--text-main)', fontSize: '14px', fontWeight: 'bold', fontFamily: '"Cinzel", serif', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                 <span style={{ fontSize: '18px' }}>👁️</span> {t('Prophetic Unfoldment')}
               </div>
               <p style={{ color: 'var(--text-main)', fontSize: '18px', lineHeight: 1.7, margin: '0 auto', fontFamily: 'serif', maxWidth: '800px' }}>{opt.prediction}</p>
             </div>
           )}
         </div>

         <AstrologicalRemedyBox remedy={opt.mitigation || opt.remedy} alert={null} t={t} lang={lang} />
       </div>
    </div>
  );
};
