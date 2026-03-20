import { useState } from 'react';
import { PLANET_COLORS, DASHA_PERIODS } from '../../engine/constants.js';

const DASHA_ORDER_LIST = ['ketu','venus','sun','moon','mars','rahu','jupiter','saturn','mercury'];

export default function DashaTab({ kundali }) {
  const [expanded, setExpanded] = useState(null);
  const { dasha } = kundali;
  const { mahadashas, current } = dasha;
  const today = new Date();

  const totalYears = 120;
  const birthYear = new Date(mahadashas[0]?.start).getFullYear();

  return (
    <div style={{ animation: 'slideIn 0.25s ease' }}>
      <h3 style={{ margin: '0 0 16px', fontSize: 16, color: '#1E3A5F', fontWeight: 700 }}>
        Vimshottari Mahadasha Timeline (120 Years)
      </h3>

      {/* Timeline bar */}
      <div style={{ background: 'white', border: '1px solid #E5D5C0', borderRadius: 10, padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', height: 52, borderRadius: 8, overflow: 'hidden', border: '1px solid #E5D5C0' }}>
          {mahadashas.map((d, i) => {
            const isCurrent = d.isCurrent;
            const color = PLANET_COLORS[d.planet] || '#9CA3AF';
            return (
              <div key={i}
                style={{ flex: DASHA_PERIODS[d.planet] || d.years, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', transition: 'opacity 0.2s', outline: isCurrent ? '3px solid #F59E0B' : 'none', outlineOffset: -3, opacity: isCurrent ? 1 : 0.75 }}
                onClick={() => setExpanded(expanded === i ? null : i)}
                title={`${d.planet} ${d.start}–${d.end}`}>
                <span style={{ color: 'white', fontSize: (DASHA_PERIODS[d.planet] || 10) > 8 ? 12 : 9, fontWeight: 700, textShadow: '0 1px 2px rgba(0,0,0,0.4)', textTransform: 'capitalize' }}>
                  {(DASHA_PERIODS[d.planet] || 10) > 8 ? d.planet : d.planet.substring(0, 2)}
                </span>
                {isCurrent && (
                  <div style={{ position: 'absolute', top: -2, left: 0, right: 0, height: 3, background: '#F59E0B', borderRadius: 2 }} />
                )}
              </div>
            );
          })}
        </div>
        {/* Year markers */}
        <div style={{ display: 'flex', marginTop: 6, fontSize: 10, color: '#9CA3AF', justifyContent: 'space-between' }}>
          {mahadashas.map(d => (
            <span key={d.start} style={{ flex: DASHA_PERIODS[d.planet] || d.years, textAlign: 'center', overflow: 'hidden' }}>
              {new Date(d.start).getFullYear()}
            </span>
          ))}
        </div>
        <p style={{ marginTop: 10, fontSize: 12, color: '#7C3AED', textAlign: 'center' }}>
          Current: <strong>{current?.planet}</strong> Mahadasha ({current?.start} – {current?.end}) — gold border
        </p>
      </div>

      {/* Mahadasha list */}
      <div style={{ display: 'grid', gap: 8 }}>
        {mahadashas.map((maha, i) => {
          const isCurrent = maha.isCurrent;
          const isExpanded = expanded === i;
          const color = PLANET_COLORS[maha.planet] || '#9CA3AF';

          return (
            <div key={i} style={{ background: 'white', border: `1px solid ${isCurrent ? '#F59E0B' : '#E5D5C0'}`, borderRadius: 10, overflow: 'hidden', boxShadow: isCurrent ? '0 2px 12px rgba(245,158,11,0.15)' : 'none' }}>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', cursor: 'pointer', background: isExpanded ? '#FAFAF8' : 'white' }}
                onClick={() => setExpanded(expanded === i ? null : i)}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: color, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#1E3A5F', textTransform: 'capitalize' }}>{maha.planet}</span>
                    <span style={{ fontSize: 12, color: '#9CA3AF' }}>Mahadasha · {DASHA_PERIODS[maha.planet]} years</span>
                    {isCurrent && <span style={{ fontSize: 10, background: '#F59E0B', color: 'white', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>ACTIVE NOW</span>}
                  </div>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6B7280' }}>{maha.start} → {maha.end}</p>
                </div>
                <span style={{ color: '#9CA3AF', fontSize: 18 }}>{isExpanded ? '▲' : '▼'}</span>
              </div>

              {/* Antardashas */}
              {isExpanded && (
                <div style={{ borderTop: '1px solid #F3F4F6', background: '#FAFAF8' }}>
                  <div style={{ padding: '10px 18px', fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Antardasha Periods
                  </div>
                  {(maha.antardashas || []).map((antar, ai) => {
                    const isCurrentAntar = antar.isCurrent;
                    return (
                      <div key={ai} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 18px 9px 32px', borderBottom: '1px solid #F3F4F6', background: isCurrentAntar ? '#F5F0FF' : 'transparent' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: PLANET_COLORS[antar.planet] || '#9CA3AF', flexShrink: 0 }} />
                          <span style={{ fontSize: 13, fontWeight: isCurrentAntar ? 700 : 500, color: isCurrentAntar ? '#7C3AED' : '#4B5563', textTransform: 'capitalize' }}>
                            {maha.planet}/{antar.planet}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 12, color: '#9CA3AF' }}>{antar.start} – {antar.end}</span>
                          {isCurrentAntar && <span style={{ fontSize: 10, background: '#7C3AED', color: 'white', padding: '1px 7px', borderRadius: 8, fontWeight: 700 }}>NOW</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Note */}
      <div style={{ marginTop: 16, padding: '10px 14px', background: '#FFF7ED', borderRadius: 8, border: '1px solid #FDE68A', fontSize: 12, color: '#92400E' }}>
        <strong>Note:</strong> Vimshottari Dasha begins from the Moon's Nakshatra at birth. Total cycle = 120 years.
        Birth Nakshatra: <strong>{dasha.birthNakshatra}</strong> · Starting Dasha: <strong style={{ textTransform: 'capitalize' }}>{dasha.birthNakshatraLord}</strong>
      </div>
    </div>
  );
}
