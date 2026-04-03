import { RASHIS, PLANET_COLORS } from '../../engine/constants.js';

const PLANET_KEYS = ['sun','moon','mars','mercury','jupiter','venus','saturn'];
const PLANET_DISPLAY = { sun:'Surya', moon:'Chandra', mars:'Mangal', mercury:'Budha', jupiter:'Guru', venus:'Shukra', saturn:'Shani' };

export default function AshtakavargaTab({ kundali }) {
  const { ashtakavarga } = kundali;
  const { BAV, SAV } = ashtakavarga;

  const getCellColor = (value) => {
    if (value >= 5) return { bg: '#DCFCE7', color: '#16A34A' };
    if (value >= 4) return { bg: '#FEF9C3', color: '#854D0E' };
    if (value >= 3) return { bg: '#F5F0FF', color: '#7C3AED' };
    if (value >= 2) return { bg: '#FEF3C7', color: '#D97706' };
    return { bg: '#FEE2E2', color: '#DC2626' };
  };

  const getSAVColor = (value) => {
    if (value >= 30) return { bg: '#DCFCE7', color: '#16A34A' };
    if (value >= 25) return { bg: '#FEF9C3', color: '#854D0E' };
    if (value >= 20) return { bg: '#F5F0FF', color: '#7C3AED' };
    return { bg: '#FEE2E2', color: '#DC2626' };
  };

  return (
    <div style={{ animation: 'slideIn 0.25s ease' }}>
      <h3 style={{ margin: '0 0 8px', fontSize: 16, color: '#1E3A5F', fontWeight: 700 }}>
        Ashtakavarga — Benefic Point Analysis
      </h3>
      <p style={{ margin: '0 0 20px', fontSize:   17, color: '#6B7280' }}>
        Each cell shows the number of benefic points (Bindus) in that Rashi for each planet. Higher points indicate favourable transits through that sign.
      </p>

      {/* BAV tables */}
      {PLANET_KEYS.map(planet => {
        const bavRow = BAV[planet] || new Array(12).fill(0);
        const total = bavRow.reduce((a, b) => a + b, 0);
        return (
          <div key={planet} style={{ background: 'white', border: '1px solid #E5D5C0', borderRadius: 10, overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderBottom: '1px solid #E5D5C0', background: '#FAFAF8' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: PLANET_COLORS[planet], display: 'inline-block' }} />
              <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#1E3A5F' }}>
                {PLANET_DISPLAY[planet]} Ashtakavarga (BAV)
              </h4>
              <span style={{ marginLeft: 'auto', fontSize: 12, color: '#9CA3AF' }}>Total Bindus: <strong style={{ color: '#7C3AED' }}>{total}</strong></span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {RASHIS.map(r => (
                      <th key={r.id} style={{ padding: '6px 4px', fontSize: 10, fontWeight: 600, color: '#9CA3AF', textAlign: 'center', borderBottom: '1px solid #F3F4F6', minWidth: 60 }}>
                        {r.name.substring(0, 4)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {bavRow.map((val, i) => {
                      const { bg, color } = getCellColor(val);
                      return (
                        <td key={i} style={{ padding: '8px 4px', textAlign: 'center', background: bg }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color }}>{val}</span>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {/* SAV */}
      <div style={{ background: 'white', border: '2px solid #7C3AED', borderRadius: 10, overflow: 'hidden', marginBottom: 20 }}>
        <div style={{ padding: '12px 16px', borderBottom: '1.5px solid #E5D5C0', background: '#F5F0FF' }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#7C3AED' }}>
            Sarvashtakavarga (SAV) — Total Benefic Points per Sign
          </h3>
          <p style={{ margin: '4px 0 0', fontSize:   16, color: '#9CA3AF' }}>Total: {SAV.reduce((a, b) => a + b, 0)} points (Standard = 337)</p>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {RASHIS.map(r => (
                  <th key={r.id} style={{ padding: '8px 4px', fontSize: 11, fontWeight: 700, color: '#7C3AED', textAlign: 'center', borderBottom: '1.5px solid #E5D5C0', minWidth: 64 }}>
                    {r.name.substring(0, 5)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {SAV.map((val, i) => {
                  const { bg, color } = getSAVColor(val);
                  return (
                    <td key={i} style={{ padding: '10px 4px', textAlign: 'center', background: bg, borderBottom: '1px solid #F3F4F6' }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color }}>{val}</div>
                      <div style={{ fontSize: 9, color: '#9CA3AF', marginTop: 2 }}>{RASHIS[i].en.substring(0, 3)}</div>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Color legend */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 12, color: '#6B7280' }}>
        {[['#16A34A','5–8 (Excellent)'],['#854D0E','4 (Good)'],['#7C3AED','3 (Average)'],['#D97706','2 (Below Avg)'],['#DC2626','0–1 (Weak)']].map(([c, l]) => (
          <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 10, height: 10, background: c, borderRadius: 2, display: 'inline-block', opacity: 0.7 }} />
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}
