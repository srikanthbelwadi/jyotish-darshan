import SouthIndianChart from '../charts/SouthIndianChart.jsx';
import NorthIndianChart from '../charts/NorthIndianChart.jsx';
import { RASHIS, PLANET_COLORS } from '../../engine/constants.js';

import { NAKSHATRA_LORE } from '../../data/nakshatra_lore.js';

const Card = ({ children, style }) => (
  <div style={{ background: 'white', border: '1px solid #E5D5C0', borderRadius: 10, padding: 16, ...style }}>
    {children}
  </div>
);

export default function OverviewTab({ kundali, chartFormat, lang }) {
  const { lagna, planets, dasha, panchang, sunrise, sunset, lst, ayanamsa, ayanamsaDMS } = kundali;
  const moonPlanet = planets.find(p => p.key === 'moon');
  const sunPlanet = planets.find(p => p.key === 'sun');
  const lagnaRashi = RASHIS[lagna.rashi];

  const currentMaha = dasha.mahadashas.find(m => m.isCurrent) || dasha.mahadashas[0];
  const currentAntar = currentMaha?.antardashas?.find(a => a.isCurrent) || currentMaha?.antardashas?.[0];

  // Build D9 planets for Navamsa display
  const navamsaPlanets = planets.map(p => ({
    ...p,
    rashi: kundali.divisionalCharts.D9?.[p.key]?.rashi ?? p.rashi,
  }));

  const ChartComponent = chartFormat === 'south' ? SouthIndianChart : NorthIndianChart;
  
  // Get Nakshatra Lore for the Moon
  const moonNakLore = NAKSHATRA_LORE[moonPlanet.nIdx] || null;

  return (
    <div style={{ animation: 'slideIn 0.25s ease' }}>
      {/* Birth Summary */}
      <Card style={{ marginBottom: 16, borderLeft: '4px solid #7C3AED' }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 14, color: '#7C3AED', fontWeight: 700 }}>Janma Vivaranam (Birth Summary)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px 16px', fontSize: 13 }}>
          {[
            ['Sunrise', sunrise], ['Sunset', sunset],
            ['Local Sidereal Time', lst],
            ['Ayanamsa (Lahiri)', ayanamsaDMS],
            ['Tithi', panchang.tithi], ['Vara', panchang.vara],
            ['Janma Nakshatra', panchang.nakshatra], ['Yoga', panchang.yoga],
            ['Karana', panchang.karana],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{k}</span>
              <span style={{ color: '#1E3A5F', fontWeight: 500, marginTop: 2 }}>{v}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div>
          <ChartComponent planets={planets} lagnaRashi={lagna.rashi} title="Rashi Chart (D1 · Lagna Kundali)" lang={lang} />
        </div>
        <div>
          <ChartComponent planets={navamsaPlanets} lagnaRashi={lagna.rashi} title="Navamsa Chart (D9)" lang={lang} />
        </div>
      </div>

      {/* Key Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        <Card style={{ textAlign: 'center', borderTop: '3px solid #7C3AED' }}>
          <p style={{ margin: '0 0 4px', fontSize: 10, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1 }}>Lagna (Ascendant)</p>
          <p style={{ margin: '0 0 2px', fontSize: 17, fontWeight: 700, color: '#7C3AED' }}>
            {lagnaRashi.name}
          </p>
          <p style={{ margin: 0, fontSize: 12, color: '#6B7280' }}>{lagnaRashi.en} · {lagna.degreeFormatted}</p>
        </Card>
        <Card style={{ textAlign: 'center', borderTop: '3px solid #8B5CF6' }}>
          <p style={{ margin: '0 0 4px', fontSize: 10, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1 }}>Chandra Rashi (Moon Sign)</p>
          <p style={{ margin: '0 0 2px', fontSize: 17, fontWeight: 700, color: '#8B5CF6' }}>
            {RASHIS[moonPlanet.rashi].name}
          </p>
          <p style={{ margin: 0, fontSize: 12, color: '#6B7280' }}>{moonPlanet.nakshatraName} · Pada {moonPlanet.pada}</p>
        </Card>
        <Card style={{ textAlign: 'center', borderTop: '3px solid #F59E0B' }}>
          <p style={{ margin: '0 0 4px', fontSize: 10, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1 }}>Surya Rashi (Sun Sign)</p>
          <p style={{ margin: '0 0 2px', fontSize: 17, fontWeight: 700, color: '#D97706' }}>
            {RASHIS[sunPlanet.rashi].name}
          </p>
          <p style={{ margin: 0, fontSize: 12, color: '#6B7280' }}>{sunPlanet.nakshatraName} · Pada {sunPlanet.pada}</p>
        </Card>
      </div>

      {/* Nakshatra Deep Dive */}
      {moonNakLore && (
        <Card style={{ marginBottom: 20, background: 'linear-gradient(135deg, #1E3A5F 0%, #0F172A 100%)', color: 'white', border: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 16, color: '#E5D5C0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>✨</span>
              Janma Nakshatra: {moonNakLore.name}
            </h3>
            <span style={{ fontSize: 12, background: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: 20, color: '#FCD34D' }}>
              Moon's Constellation
            </span>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 16 }}>
            <div>
              <p style={{ fontSize: 13, lineHeight: 1.5, color: '#CBD5E1', margin: '0 0 12px' }}>
                {moonNakLore.myth}
              </p>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Ruling Deity</div>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#FDE68A' }}>{moonNakLore.deity}</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
               <div style={{ background: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Symbol</div>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#FDE68A' }}>{moonNakLore.symbol}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 8, flex: 1 }}>
                <div style={{ fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Famous Personalities</div>
                <div style={{ fontSize: 13, color: '#E2E8F0', lineHeight: 1.4 }}>{moonNakLore.famous}</div>
              </div>
            </div>
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
          Janma Nakshatra: <strong style={{ color: '#7C3AED' }}>{dasha.birthNakshatra}</strong> · Dasha Lord: <strong style={{ color: '#7C3AED', textTransform: 'capitalize' }}>{dasha.birthNakshatraLord}</strong>
        </div>
      </Card>
    </div>
  );
}
