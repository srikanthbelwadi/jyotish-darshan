import { RASHIS, HOUSE_NAMES, PLANET_COLORS } from '../../engine/constants.js';

const Badge = ({ text, bg, color }) => (
  <span style={{ background: bg, color, padding: '2px 7px', borderRadius: 4, fontSize: 10, fontWeight: 600, marginRight: 3, display: 'inline-block' }}>
    {text}
  </span>
);

export default function PlanetsTab({ kundali }) {
  const { planets, lagna } = kundali;

  return (
    <div style={{ animation: 'slideIn 0.25s ease' }}>
      {/* Lagna info */}
      <div style={{ background: 'linear-gradient(135deg, #F5F0FF, #FFF7ED)', border: '1px solid #E5D5C0', borderRadius: 10, padding: '14px 20px', marginBottom: 16, display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <div>
          <p style={{ margin: 0, fontSize: 10, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1 }}>Lagna (Ascendant)</p>
          <p style={{ margin: '4px 0 0', fontSize: 18, fontWeight: 700, color: '#7C3AED' }}>
            {RASHIS[lagna.rashi].name} ({RASHIS[lagna.rashi].en})
          </p>
        </div>
        <div>
          <p style={{ margin: 0, fontSize: 10, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1 }}>Degree</p>
          <p style={{ margin: '4px 0 0', fontSize: 15, fontWeight: 600, color: '#1E3A5F', fontFamily: 'monospace' }}>{lagna.degreeFormatted}</p>
        </div>
        <div>
          <p style={{ margin: 0, fontSize: 10, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1 }}>Lagna Lord</p>
          <p style={{ margin: '4px 0 0', fontSize: 15, fontWeight: 600, color: '#1E3A5F', textTransform: 'capitalize' }}>{RASHIS[lagna.rashi].lord}</p>
        </div>
      </div>

      {/* Planets table */}
      <div style={{ background: 'white', borderRadius: 10, border: '1px solid #E5D5C0', overflow: 'hidden' }}>
        <div style={{ padding: '12px 18px', borderBottom: '1px solid #E5D5C0', display: 'flex', alignItems: 'center', gap: 8 }}>
          <h3 style={{ margin: 0, fontSize: 15, color: '#1E3A5F', fontWeight: 700 }}>Graha Sthiti (Planetary Positions)</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#F5F0FF' }}>
                {['Graha', 'Rashi', 'Degree', 'Nakshatra', 'Pada', 'Nak. Lord', 'Sign Lord', 'Bhava', 'Status'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: '#7C3AED', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1.5px solid #E5D5C0', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {planets.map((p, i) => {
                const rashi = RASHIS[p.rashi];
                return (
                  <tr key={i} style={{ borderBottom: '1px solid #F3F4F6', transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FAFAF8'}
                    onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                    <td style={{ padding: '11px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: PLANET_COLORS[p.key] || '#9CA3AF', display: 'inline-block', flexShrink: 0 }} />
                        <span style={{ fontWeight: 700, color: '#1E3A5F' }}>{p.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '11px 12px', color: '#4B5563' }}>
                      {rashi.name} <span style={{ color: '#9CA3AF', fontSize: 11 }}>({rashi.en})</span>
                    </td>
                    <td style={{ padding: '11px 12px', fontFamily: 'monospace', color: '#4B5563', fontSize: 12 }}>{p.degreeFormatted}</td>
                    <td style={{ padding: '11px 12px', color: '#4B5563' }}>{p.nakshatraName}</td>
                    <td style={{ padding: '11px 12px', textAlign: 'center', color: '#4B5563' }}>{p.pada}</td>
                    <td style={{ padding: '11px 12px', color: '#4B5563', textTransform: 'capitalize' }}>{p.nakshatraLord}</td>
                    <td style={{ padding: '11px 12px', color: '#4B5563', textTransform: 'capitalize' }}>{rashi.lord}</td>
                    <td style={{ padding: '11px 12px', textAlign: 'center', color: '#4B5563', fontWeight: 600 }}>{p.house}</td>
                    <td style={{ padding: '11px 12px' }}>
                      {p.isRetrograde && <Badge text="Retrograde ℞" bg="#FEE2E2" color="#DC2626" />}
                      {p.isCombust && <Badge text="Combust" bg="#FEF3C7" color="#D97706" />}
                      {p.isExalted && <Badge text="Exalted ↑" bg="#DCFCE7" color="#16A34A" />}
                      {p.isDebilitated && <Badge text="Debilitated ↓" bg="#FEE2E2" color="#DC2626" />}
                      {p.isVargottama && <Badge text="Vargottama" bg="#F5F0FF" color="#7C3AED" />}
                      {!p.isRetrograde && !p.isCombust && !p.isExalted && !p.isDebilitated && !p.isVargottama && <span style={{ color: '#9CA3AF', fontSize: 11 }}>—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* House Analysis */}
      <div style={{ marginTop: 20 }}>
        <h3 style={{ fontSize: 15, color: '#1E3A5F', fontWeight: 700, marginBottom: 12 }}>Bhava Analysis (House Overview)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
          {Array.from({ length: 12 }, (_, i) => i + 1).map(house => {
            const houseRashi = (lagna.rashi + house - 1) % 12;
            const planetsInHouse = planets.filter(p => p.house === house);
            return (
              <div key={house} style={{ background: 'white', border: '1px solid #E5D5C0', borderRadius: 8, padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div>
                    <span style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600 }}>HOUSE {house}</span>
                    <p style={{ margin: '2px 0 0', fontSize: 13, fontWeight: 600, color: '#1E3A5F' }}>{HOUSE_NAMES[house - 1]}</p>
                  </div>
                  <span style={{ fontSize: 11, color: '#7C3AED', fontWeight: 600 }}>{RASHIS[houseRashi].name}</span>
                </div>
                {planetsInHouse.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                    {planetsInHouse.map(p => (
                      <span key={p.key} style={{ padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600,
                        background: PLANET_COLORS[p.key] + '22', color: PLANET_COLORS[p.key] || '#1E3A5F', border: `1px solid ${PLANET_COLORS[p.key]}44` }}>
                        {p.name.split(' ')[0]}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p style={{ margin: '4px 0 0', fontSize: 11, color: '#9CA3AF' }}>Empty house</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
