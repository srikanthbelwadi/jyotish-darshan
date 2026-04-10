import React, { useState } from 'react';
import SouthIndianChart from '../charts/SouthIndianChart.jsx';
import NorthIndianChart from '../charts/NorthIndianChart.jsx';
import { RASHIS, PLANET_COLORS } from '../../engine/constants.js';
import Cosmos3DTab from './Cosmos3DTab.jsx';
import { CelestialDomeViewer } from '../dashboard/CelestialDomeViewer.jsx';

import { NAKSHATRA_LORE } from '../../data/nakshatra_lore.js';
import { DYNAMIC_STRINGS } from '../../i18n/dynamicTranslations.js';

const Card = ({ children, style }) => (
  <div style={{ background: 'white', border: '1px solid #E5D5C0', borderRadius: 10, padding: 16, ...style }}>
    {children}
  </div>
);

export default function OverviewTab({ kundali, chartFormat, lang }) {
  const [showDome, setShowDome] = useState(false);
  const t = (key) => (DYNAMIC_STRINGS[lang] || DYNAMIC_STRINGS.en)[key] || DYNAMIC_STRINGS.en[key] || key;
  const { lagna, planets, dasha, panchang, sunrise, sunset, lst, ayanamsa, ayanamsaDMS } = kundali;
  const moonPlanet = planets.find(p => p.key === 'moon');
  const sunPlanet = planets.find(p => p.key === 'sun');
  const lagnaRashi = RASHIS[lagna.rashi];

  const currentMaha = dasha.mahadashas.find(m => m.isCurrent) || dasha.mahadashas[0];
  const currentAntar = currentMaha?.antardashas?.find(a => a.isCurrent) || currentMaha?.antardashas?.[0];

  // Build D9 planets for Navamsa display
  const navamsaPlanets = planets.map(p => ({
    ...p,
    rashi: kundali.divisionalCharts?.D9?.[p.key]?.rashi ?? kundali.divisionalCharts?.D9?.[p.key] ?? p.rashi,
          house: (((kundali.divisionalCharts?.D9?.[p.key]?.rashi ?? kundali.divisionalCharts?.D9?.[p.key] ?? p.rashi) - (kundali.divisionalCharts?.D9?.lagna?.rashi ?? kundali.lagna.rashi) + 12) % 12) + 1,
  }));

  const ChartComponent = chartFormat === 'south' ? SouthIndianChart : NorthIndianChart;
  
  // Get Nakshatra Lore for the Moon
  const moonNakLore = NAKSHATRA_LORE[moonPlanet.nIdx] || null;

  return (
    <div style={{ animation: 'slideIn 0.25s ease' }}>
      {/* 3D Cosmos Chart (Replaced Rashi/Navamsa per user request) */}
      <div style={{ marginBottom: 20 }}>
          <Cosmos3DTab kundali={kundali} lang={lang} />
      </div>

      {/* Key Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        <Card style={{ textAlign: 'center', borderTop: '3px solid #7C3AED' }}>
          <p style={{ margin: '0 0 4px', fontSize: 10, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1 }}>Lagna (Ascendant)</p>
          <p style={{ margin: '0 0 2px', fontSize: 17, fontWeight: 700, color: '#7C3AED' }}>
            {lagnaRashi.name}
          </p>
          <p style={{ margin: 0, fontSize:   16, color: '#6B7280' }}>{lagnaRashi.en} · {lagna.degreeFormatted}</p>
        </Card>
        <Card style={{ textAlign: 'center', borderTop: '3px solid #8B5CF6' }}>
          <p style={{ margin: '0 0 4px', fontSize: 10, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1 }}>Chandra Rashi (Moon Sign)</p>
          <p style={{ margin: '0 0 2px', fontSize: 17, fontWeight: 700, color: '#8B5CF6' }}>
            {RASHIS[moonPlanet.rashi].name}
          </p>
          <p style={{ margin: 0, fontSize:   16, color: '#6B7280' }}>{moonPlanet.nakshatraName} · Pada {moonPlanet.pada}</p>
        </Card>
        <Card style={{ textAlign: 'center', borderTop: '3px solid #F59E0B' }}>
          <p style={{ margin: '0 0 4px', fontSize: 10, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1 }}>Surya Rashi (Sun Sign)</p>
          <p style={{ margin: '0 0 2px', fontSize: 17, fontWeight: 700, color: '#D97706' }}>
            {RASHIS[sunPlanet.rashi].name}
          </p>
          <p style={{ margin: 0, fontSize:   16, color: '#6B7280' }}>{sunPlanet.nakshatraName} · Pada {sunPlanet.pada}</p>
        </Card>
      </div>

      {/* Expanded Planetarium Portal */}
      <div style={{ marginBottom: 24, padding: '0 4px' }}>
        <div 
          onClick={() => setShowDome(true)}
          style={{
            background: 'linear-gradient(135deg, rgba(15,23,42,0.9) 0%, rgba(30,58,138,0.85) 100%)',
            border: '1px solid rgba(212,175,55,0.4)',
            borderRadius: '8px', padding: '16px 24px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)', transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
            overflow: 'hidden', position: 'relative'
          }}
          onMouseOver={e => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(212,175,55,0.25)';
            e.currentTarget.style.borderColor = 'rgba(212,175,55,0.8)';
          }}
          onMouseOut={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.2)';
            e.currentTarget.style.borderColor = 'rgba(212,175,55,0.4)';
          }}
        >
          {/* Subtle animated background overlay */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at 80% 20%, rgba(212,175,55,0.1), transparent 60%)', pointerEvents: 'none' }}></div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative', zIndex: 1 }}>
            <div style={{ 
              width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(212,175,55,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(212,175,55,0.3)',
              boxShadow: '0 0 15px rgba(212,175,55,0.2)'
            }}>
              <span style={{ fontSize: '20px' }}>🌌</span>
            </div>
            <div>
              <h3 style={{ margin: '0 0 4px 0', color: 'var(--accent-gold)', fontSize: '15px', fontFamily: 'var(--font-serif)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                {t('launch vedic planetarium') || 'Launch Vedic Planetarium'}
              </h3>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
                {t('topocentric projection') || 'Interactive 3D Celestial Engine'}
              </p>
            </div>
          </div>
          
          <div style={{ color: 'var(--accent-gold)', fontSize: '20px', position: 'relative', zIndex: 1, opacity: 0.8 }}>
            ➜
          </div>
        </div>
      </div>

      {/* Nakshatra Deep Dive */}
      {moonNakLore && (
        <Card style={{ marginBottom: 20, background: 'linear-gradient(135deg, #1E3A5F 0%, #0F172A 100%)', color: 'white', border: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 16, color: '#E5D5C0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>✨</span>
              {t('ov.janmaNak')}: {moonNakLore.name}
            </h3>
            <span style={{ fontSize: 12, background: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: 20, color: '#FCD34D' }}>
              {t('ov.moonsConst')}
            </span>
          </div>
          
          <p style={{ fontSize:   17, lineHeight: 1.5, color: '#CBD5E1', margin: '0 0 16px' }}>
            {moonNakLore.myth}
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 10 }}>
            {[
              [t('nak_ruling_planet', lang) || 'Ruling Planet', moonNakLore.planet],
              [t('nak_deity', lang) || 'Ruling Deity', moonNakLore.deity],
              [t('nak_symbol', lang) || 'Symbol', moonNakLore.symbol],
              [t('nak_gana', lang) || 'Gana (Type)', moonNakLore.gana],
              [t('nak_nature', lang) || 'Nature (Quality)', moonNakLore.nature],
              [t('nak_animal', lang) || 'Animal (Yoni)', moonNakLore.animal],
              [t('nak_goal', lang) || 'Goal (Purushartha)', moonNakLore.goal],
              [t('nak_guna', lang) || 'Guna', moonNakLore.guna]
            ].map(([lbl, val]) => val && (
              <div key={lbl} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: 6, borderLeft: '2px solid #7C3AED' }}>
                <div style={{ fontSize: 10, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5, marginRight: 8 }}>{lbl}</div>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#FDE68A', textAlign: 'right' }}>{val}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Current Dasha */}
      <Card>
        <h3 style={{ margin: '0 0 14px', fontSize: 15, color: '#1E3A5F', fontWeight: 700 }}>Current Vimshottari Dasha</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {[
            { label: 'Mahadasha', planet: currentMaha?.planet, period: `${currentMaha?.start} – ${currentMaha?.end}`, bg: '#F5F0FF', color: '#7C3AED' },
            { label: 'Antardasha', planet: currentAntar?.planet, period: `${currentAntar?.start} – ${currentAntar?.end}`, bg: '#FFF7ED', color: '#D97706' },
            { label: 'Pratyantar', planet: dasha.birthNakshatraLord, period: 'See Dasha tab', bg: '#FFF1F2', color: '#E11D48' },
          ].map(({ label, planet, period, bg, color }) => (
            <div key={label} style={{ background: bg, borderRadius: 10, padding: 14, textAlign: 'center' }}>
              <p style={{ margin: '0 0 4px', fontSize: 10, color, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>{label}</p>
              <p style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 700, color: '#1E3A5F', textTransform: 'capitalize' }}>{planet || '—'}</p>
              <p style={{ margin: 0, fontSize: 11, color: '#6B7280' }}>{period}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14, padding: '10px 12px', background: '#F8F5FF', borderRadius: 8, fontSize: 12, color: '#6B7280' }}>
          {t('ov.janmaNak')}: <strong style={{ color: '#7C3AED' }}>{dasha.birthNakshatra}</strong> · {t('pl.lord')}: <strong style={{ color: '#7C3AED', textTransform: 'capitalize' }}>{dasha.birthNakshatraLord}</strong>
        </div>
      </Card>

      {showDome && <CelestialDomeViewer K={kundali} onClose={() => setShowDome(false)} lang={lang} t={t} />}
    </div>
  );
}
