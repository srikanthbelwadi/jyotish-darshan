import React, { useState } from 'react';
import { PILLAR_DATA } from '../../data/pillarData';
import { MandalaHero } from './MandalaHero';
import { HousePillar } from './HousePillar';
import MuhuratPlanner from '../tabs/MuhuratPlanner';
import PanchangTab from '../tabs/PanchangTab';
import { UniversalLoader } from './UniversalLoader';

const FullScreenWrapper = ({ title, onBack, children, t, lang }) => (
  <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
    <button onClick={onBack} style={{ background: 'var(--bg-card)', color: 'var(--accent-gold)', border: '1px solid #ffd700', padding: '12px 28px', cursor: 'pointer', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '16px', fontFamily: '"Cinzel", serif', transition:'all 0.2s', textTransform:'uppercase' }} onMouseOver={e=>{e.currentTarget.style.background='var(--bg-input)'}} onMouseOut={e=>{e.currentTarget.style.background='var(--bg-card)'}}>
      {t('← Return to Main Mandala')}
    </button>
    <div style={{ background: 'var(--bg-card)', border: '2px solid var(--border-light)', padding: '2px' }}>
      <div className="mobile-hero-padding" style={{ border: '1px dashed rgba(184, 134, 11, 0.5)', padding: '60px' }}>{children}</div>
    </div>
  </div>
);

export const MockDashboard = ({ K, lang, t, user, onRequireLogin, onOpenJyotishDesk, partnerKundali, onAddPartnerClick }) => {
  const [activeTime, setActiveTime] = useState('Today');
  const [activeView, setActiveView] = useState('grid'); 

  if (activeView !== 'grid') {
    if (activeView === 'panchang') {
      return (
        <div id="mock-dashboard-top" style={{ maxWidth: '1300px', margin: '0 auto', padding: '40px 24px' }}>
          <FullScreenWrapper title="🕉️ Vedic Panchang & Memorials" onBack={() => setActiveView('grid')} t={t} lang={lang}>
            <PanchangTab />
          </FullScreenWrapper>
        </div>
      );
    }

    const data = PILLAR_DATA[activeView];
    return (
      <div id="mock-dashboard-top" style={{ maxWidth: '1300px', margin: '0 auto', padding: '40px 24px' }}>
        <FullScreenWrapper title={`${data.icon} ${t(data.title)}`} onBack={() => setActiveView('grid')} t={t} lang={lang}>
          <HousePillar pillarId={activeView} K={K} partnerKundali={partnerKundali} t={t} lang={lang} user={user} onRequireLogin={onRequireLogin} />
        </FullScreenWrapper>
      </div>
    );
  }

  return (
    <div id="mock-dashboard-top" style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 24px', fontFamily: 'serif', paddingBottom: '140px', background: 'var(--bg-app)', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '2px solid var(--border-light)', paddingBottom: '20px', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h2 style={{ fontSize: '42px', margin: 0, fontFamily: '"Cinzel", serif', color: 'var(--accent-gold)', textShadow: '0 2px 4px var(--bg-surface)' }}>{t('Life Paths')}</h2>
          {partnerKundali && (
            <div style={{ background: 'var(--bg-input)', border: '1px solid var(--accent-gold)', padding: '6px 12px', borderRadius: '4px', color: 'var(--accent-gold)', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>💞</span> {t('Synastry Active')}
            </div>
          )}
        </div>
        <button onClick={onOpenJyotishDesk} style={{background:'var(--accent-gold)', border:'none', color:'var(--bg-app)', padding:'12px 28px', cursor:'pointer', borderRadius:'4px', fontFamily:'"Cinzel", serif', fontSize:'16px', fontWeight:'bold', display:'flex', alignItems:'center', gap:'8px', transition:'all 0.2s', textTransform:'uppercase', letterSpacing:'1px', whiteSpace:'nowrap', boxShadow: '0 4px 15px rgba(255,215,0,0.4)'}}>
          {t('Reveal Kundali ➔')}
        </button>
      </div>
      
      <MandalaHero activeTime={activeTime} setActiveTime={setActiveTime} K={K} t={t} lang={lang} partnerKundali={partnerKundali} user={user} onRequireLogin={onRequireLogin} />

      <MuhuratPlanner kundali={K} partnerData={partnerKundali} t={t} lang={lang} user={user} onRequireLogin={onRequireLogin} UniversalLoader={UniversalLoader} />

      <div style={{ marginBottom: '40px', marginTop: '40px', border: '1px solid var(--accent-gold)', borderRadius: '12px', padding: '30px', background: 'var(--bg-layer-2)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', boxShadow: '0 4px 15px rgba(255,215,0,0.1)' }}>
          <h3 style={{ margin: '0 0 10px', color: 'var(--accent-gold)', fontSize: '28px', fontFamily: '"Cinzel", serif' }}>🕉️ {t("pc.title", "Personalized Drik Panchang")}</h3>
          <p style={{ margin: '0 0 20px', color: 'var(--text-main)', fontSize: '16px' }}>{t("pc.subtitle", "Track daily Tithi, major festivals, birthdays, and your departed loved ones' Varshika Tithi automatically.")}</p>
          <button 
             onClick={() => { if(!user) { onRequireLogin(); return; } setActiveView('panchang'); }} 
             className="lux-btn" 
             style={{ padding: '12px 24px', fontSize: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}
          >
              {t("pc.openCal", "Open Lunar Calendar ➔")}
          </button>
      </div>

      <div style={{ marginBottom: '40px', border: '1px solid var(--accent-gold)', borderRadius: '12px', padding: '30px', background: 'var(--bg-layer-2)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', boxShadow: '0 4px 15px rgba(255,215,0,0.1)' }}>
          <h3 style={{ margin: '0 0 10px', color: 'var(--accent-gold)', fontSize: '28px', fontFamily: '"Cinzel", serif' }}>💞 {t("comp.title", "Companion Compatibility")}</h3>
          <p style={{ margin: '0 0 20px', color: 'var(--text-main)', fontSize: '16px' }}>{t("comp.subtitle", "Assess celestial resonance, verify Gunas, and uncover deep astrological alignments with your partner.")}</p>
          <button 
             onClick={() => { 
                 if(!user) { onRequireLogin(); return; } 
                 if(partnerKundali && typeof onOpenJyotishDesk === 'function') {
                    onOpenJyotishDesk();
                 } else if (typeof onAddPartnerClick === 'function') {
                    onAddPartnerClick();
                 }
             }} 
             className="lux-btn" 
             style={{ padding: '12px 24px', fontSize: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}
          >
              {partnerKundali ? t("comp.view", "View Compatibility ➔") : t("comp.add", "Check Partner Compatibility ➔")}
          </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
        {Object.entries(PILLAR_DATA).map(([key, data]) => (
          <div 
            key={key} onClick={() => { 
              if(!user) { onRequireLogin(); return; }
              setActiveView(key); 
              setTimeout(() => {
                const el = document.getElementById('mock-dashboard-top');
                if (el) {
                  const y = el.getBoundingClientRect().top + window.scrollY - 80;
                  window.scrollTo({ top: y, behavior: 'smooth' });
                }
                else { window.scrollTo({ top: 0, behavior: 'smooth' }); }
              }, 50); 
            }}
            style={{ background: 'var(--bg-input)', padding: '36px 24px', border: '1px solid #b8860b', cursor: 'pointer', transition: 'all 0.3s', position:'relative', overflow:'hidden', display: 'flex', flexDirection: 'column', boxShadow: 'inset 0 0 10px var(--bg-surface)' }}
          >
            <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '140px', opacity: 0.03, pointerEvents: 'none' }}>{data.icon}</div>
            <div style={{ fontSize: '50px', marginBottom: '20px', filter: 'drop-shadow(0 0 15px rgba(255,215,0,0.3))' }}>{data.icon}</div>
            <h3 style={{ margin: '0 0 12px 0', fontSize: 'clamp(16px, 5vw, 22px)', color: 'var(--accent-gold)', fontFamily: '"Cinzel", serif', wordBreak: 'break-word' }}>{t(data.title)}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};
