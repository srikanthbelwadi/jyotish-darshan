import { PLANET_COLORS } from '../../engine/constants.js';

export default function ShadbalaTab({ kundali }) {
  const { shadbala } = kundali;
  const entries = Object.entries(shadbala);
  const maxTotal = Math.max(...entries.map(([, v]) => v.total));

  return (
    <div style={{ animation: 'slideIn 0.25s ease' }}>
      <h3 style={{ margin: '0 0 16px', fontSize: 16, color: '#1E3A5F', fontWeight: 700 }}>
        Shadbala — Six-Fold Planetary Strength (Virupas / Rupas)
      </h3>

      {/* Table */}
      <div style={{ background: 'white', border: '1px solid #E5D5C0', borderRadius: 10, overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#F5F0FF' }}>
                {['Graha', 'Sthana Bala', 'Dig Bala', 'Kala Bala', 'Chesta Bala', 'Naisargika', 'Drik Bala', 'Total (Rupas)', 'Strength'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: h === 'Graha' ? 'left' : 'center', fontWeight: 700, color: '#7C3AED', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1.5px solid #E5D5C0', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map(([key, s]) => (
                <tr key={key} style={{ borderBottom: '1px solid #F3F4F6' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#FAFAF8'}
                  onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: PLANET_COLORS[key] || '#9CA3AF', display: 'inline-block' }} />
                      <span style={{ fontWeight: 700, color: '#1E3A5F' }}>{s.planet}</span>
                    </div>
                  </td>
                  {[s.sthana, s.dig, s.kala, s.chesta, s.naisargika, s.drik].map((v, i) => (
                    <td key={i} style={{ padding: '10px 12px', textAlign: 'center', color: '#4B5563' }}>{v}</td>
                  ))}
                  <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, fontSize: 14,
                    color: s.total >= 350 ? '#16A34A' : s.total >= 250 ? '#D97706' : '#DC2626' }}>
                    {s.total}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: 10, fontSize: 11, fontWeight: 600,
                      background: s.classification === 'Strong' ? '#DCFCE7' : s.classification === 'Moderate' ? '#FEF3C7' : '#FEE2E2',
                      color: s.classification === 'Strong' ? '#16A34A' : s.classification === 'Moderate' ? '#D97706' : '#DC2626',
                    }}>{s.classification}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual bars */}
      <div style={{ background: 'white', border: '1px solid #E5D5C0', borderRadius: 10, padding: 20, marginBottom: 20 }}>
        <h4 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: '#1E3A5F' }}>Comparative Strength (Visual)</h4>
        {entries.map(([key, s]) => {
          const pct = Math.round((s.total / (maxTotal * 1.1)) * 100);
          const barColor = s.total >= 350 ? 'linear-gradient(90deg,#7C3AED,#10B981)' :
                           s.total >= 250 ? 'linear-gradient(90deg,#F59E0B,#D97706)' :
                           'linear-gradient(90deg,#EF4444,#DC2626)';
          return (
            <div key={key} style={{ display: 'flex', alignItems: 'center', marginBottom: 12, gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: 90 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: PLANET_COLORS[key] || '#9CA3AF', display: 'inline-block', flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: '#1E3A5F' }}>{s.planet}</span>
              </div>
              <div style={{ flex: 1, height: 22, background: '#F3F4F6', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: barColor, borderRadius: 4, transition: 'width 0.5s ease', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 6 }}>
                  <span style={{ fontSize: 10, color: 'white', fontWeight: 700, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>{s.total}</span>
                </div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, width: 50, textAlign: 'right',
                color: s.classification === 'Strong' ? '#16A34A' : s.classification === 'Moderate' ? '#D97706' : '#DC2626' }}>
                {s.classification}
              </span>
            </div>
          );
        })}
        {/* Legend */}
        <div style={{ marginTop: 12, display: 'flex', gap: 20, fontSize: 11, color: '#9CA3AF', flexWrap: 'wrap' }}>
          {[['#10B981','Strong (350+)'],['#D97706','Moderate (250–349)'],['#EF4444','Weak (<250)']].map(([c, l]) => (
            <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 10, height: 10, background: c, borderRadius: 2, display: 'inline-block' }} />
              {l}
            </span>
          ))}
        </div>
      </div>

      {/* Shadbala components explained */}
      <div style={{ background: '#F8F5FF', borderRadius: 10, padding: '16px 20px', border: '1px solid #E0D7F5' }}>
        <h4 style={{ margin: '0 0 10px', fontSize: 13, color: '#7C3AED', fontWeight: 700 }}>Understanding Shadbala Components</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '6px 20px', fontSize: 12, color: '#4B5563' }}>
          {[
            ['Sthana Bala', 'Positional strength — exaltation, own sign, etc.'],
            ['Dig Bala', 'Directional strength — planet in ideal house direction'],
            ['Kala Bala', 'Temporal strength — day/night, season, hora'],
            ['Chesta Bala', 'Motional strength — retrograde planets gain extra strength'],
            ['Naisargika Bala', 'Natural strength — fixed hierarchy from Saturn to Sun'],
            ['Drik Bala', 'Aspectual strength — benefic/malefic aspects received'],
          ].map(([k, v]) => (
            <div key={k}>
              <strong style={{ color: '#1E3A5F' }}>{k}:</strong> {v}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
