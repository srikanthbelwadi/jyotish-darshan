import { useState } from 'react';
import SouthIndianChart from '../charts/SouthIndianChart.jsx';
import NorthIndianChart from '../charts/NorthIndianChart.jsx';
import { VARGA_DIVISORS } from '../../engine/constants.js';

const VARGA_DESCRIPTIONS = {
  D1: 'Rashi · Physical Self', D2: 'Hora · Wealth', D3: 'Drekkana · Siblings',
  D4: 'Chaturthamsha · Fortune', D7: 'Saptamsa · Children', D9: 'Navamsa · Spouse & Dharma',
  D10: 'Dasamsa · Career', D12: 'Dwadashamsa · Parents', D16: 'Shodashamsa · Vehicles',
  D20: 'Vimshamsa · Spiritual', D24: 'Chaturvimshamsa · Education', D27: 'Saptavimshamsa · Strength',
  D30: 'Trishamsa · Evils', D40: 'Khavedamsa · Maternal', D45: 'Akshavedamsa · Paternal',
  D60: 'Shashtiamsa · Past Life',
};

export default function ChartsTab({ kundali, chartFormat, onFormatChange, lang }) {
  const [expandedChart, setExpandedChart] = useState(null);
  const { planets, lagna, divisionalCharts } = kundali;

  const ChartComponent = chartFormat === 'south' ? SouthIndianChart : NorthIndianChart;

  return (
    <div style={{ animation: 'slideIn 0.25s ease' }}>
      {/* Format toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ margin: 0, fontSize: 16, color: '#1E3A5F', fontWeight: 700 }}>
          Shodasha Varga (16 Divisional Charts)
        </h3>
        <div style={{ display: 'flex', gap: 4, background: '#F3F4F6', borderRadius: 8, padding: 3 }}>
          {['south', 'north'].map(f => (
            <button key={f} onClick={() => onFormatChange(f)}
              style={{ padding: '6px 14px', borderRadius: 6, border: 'none',
                background: chartFormat === f ? 'white' : 'transparent',
                boxShadow: chartFormat === f ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
                cursor: 'pointer', fontSize: 12, fontFamily: 'inherit',
                fontWeight: chartFormat === f ? 700 : 400, color: '#1E3A5F', transition: 'all 0.15s' }}>
              {f === 'south' ? '⊞ South Indian' : '◇ North Indian'}
            </button>
          ))}
        </div>
      </div>

      {/* Main D1 + D9 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        <ChartComponent
          planets={planets}
          lagnaRashi={lagna.rashi}
          title="D1 · Rashi Chart (Lagna Kundali)"
          size={300} lang={lang} />
        <ChartComponent
          planets={planets.map(p => {
             const newRashi = divisionalCharts.D9?.[p.key]?.rashi ?? p.rashi;
             const d9Lagna = divisionalCharts.D9?.lagna?.rashi ?? lagna.rashi;
             const newHouse = ((newRashi - d9Lagna + 12) % 12) + 1;
             return { ...p, rashi: newRashi, house: newHouse };
          })}
          lagnaRashi={divisionalCharts.D9?.lagna?.rashi ?? lagna.rashi}
          title="D9 · Navamsa Chart"
          size={300} lang={lang} />
      </div>

      {/* Vargottama note */}
      <div style={{ background: '#F5F0FF', borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: 12, color: '#7C3AED' }}>
        <strong>Vargottama planets</strong> (same sign in D1 & D9): {planets.filter(p => p.isVargottama).map(p => p.name.split(' ')[0]).join(', ') || 'None'}
      </div>

      {/* All 16 charts grid */}
      <h4 style={{ fontSize: 13, color: '#6B7280', marginBottom: 12, fontWeight: 600 }}>All Divisional Charts</h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {Object.keys(VARGA_DIVISORS).map(varga => {
          const vargaLagnaRashi = divisionalCharts[varga]?.lagna?.rashi ?? lagna.rashi;
          const chartPlanets = planets.map(p => {
            const newRashi = divisionalCharts[varga]?.[p.key]?.rashi ?? p.rashi;
            const newHouse = ((newRashi - vargaLagnaRashi + 12) % 12) + 1;
            return {
              ...p,
              rashi: newRashi,
              house: newHouse
            };
          });
          return (
            <div key={varga}
              onClick={() => setExpandedChart(expandedChart === varga ? null : varga)}
              style={{ cursor: 'pointer', transition: 'transform 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
              <div style={{ background: 'white', borderRadius: 8, border: `1.5px solid ${expandedChart === varga ? '#7C3AED' : '#E5D5C0'}`, padding: 8, boxShadow: expandedChart === varga ? '0 4px 16px rgba(124,58,237,0.15)' : 'none' }}>
                <ChartComponent
                  planets={chartPlanets}
                  lagnaRashi={vargaLagnaRashi}
                  size={150} small lang={lang} />
                <p style={{ margin: '6px 0 0', fontSize: 10, textAlign: 'center', color: '#7C3AED', fontWeight: 700 }}>{varga}</p>
                <p style={{ margin: '2px 0 0', fontSize: 9, textAlign: 'center', color: '#9CA3AF' }}>{VARGA_DESCRIPTIONS[varga]}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Expanded view */}
      {expandedChart && (
        <div style={{ marginTop: 20, background: 'white', border: '2px solid #7C3AED', borderRadius: 12, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16, color: '#7C3AED', fontWeight: 700 }}>
              {expandedChart} · {VARGA_DESCRIPTIONS[expandedChart]}
            </h3>
            <button onClick={() => setExpandedChart(null)}
              style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#9CA3AF' }}>×</button>
          </div>
          <ChartComponent
            planets={planets.map(p => {
               const newRashi = divisionalCharts[expandedChart]?.[p.key]?.rashi ?? p.rashi;
               const expandLagnaRashi = divisionalCharts[expandedChart]?.lagna?.rashi ?? lagna.rashi;
               const newHouse = ((newRashi - expandLagnaRashi + 12) % 12) + 1;
               return { ...p, rashi: newRashi, house: newHouse };
            })}
            lagnaRashi={divisionalCharts[expandedChart]?.lagna?.rashi ?? lagna.rashi}
            size={320} lang={lang} />
        </div>
      )}
    </div>
  );
}
