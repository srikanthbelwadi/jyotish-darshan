import React from 'react';
import { RASHIS } from '../../engine/constants.js';
import { DYNAMIC_STRINGS } from '../../i18n/dynamicTranslations.js';
import { buildReading } from '../tabs/ExpertReadingTab.jsx';
function DrawChart({ data, title }) {
  const cellStyle = {
    border: '1px solid #1e3a5f',
    padding: '4px',
    height: '60px',
    fontSize: '9px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative'
  };

  const getHousePlacements = (rashiIndex) => {
    return (data || []).filter(p => p && p.rashi === rashiIndex);
  };

  const renderCell = (rashiIndex, name) => {
    const planetsInHouse = getHousePlacements(rashiIndex);
    const isLagna = (data || []).some(p => p && p.key === 'lagna' && p.rashi === rashiIndex);
    return (
      <div style={cellStyle}>
        <div style={{color:'#6b7280',fontSize:'8px',position:'absolute',top:2,left:4}}>{name}</div>
        <div style={{marginTop:'12px', fontWeight:'bold', color:'#1e3a5f', display:'flex', flexWrap:'wrap', gap:'2px'}}>
           {isLagna && <span style={{color:'#7c3aed'}}>Asc</span>}
           {planetsInHouse.filter(p => p.key !== 'lagna').map(p => (
              <span key={p.key || Math.random()}>{p.name ? String(p.name).substring(0,2) : ''}</span>
           ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ breakInside: 'avoid', marginBottom: '20px' }}>
      <h3 style={{ margin: '0 0 10px', fontSize: '14px', color: '#1e3a5f', borderBottom: '1px solid #e5d5c0', paddingBottom:'4px' }}>{title || ''}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridTemplateRows: 'repeat(4, 1fr)', width: '100%', maxWidth: '300px', margin: '0 auto', border: '1px solid #1e3a5f', background: 'white' }}>
         {renderCell(11, 'Pisces')}
         {renderCell(0, 'Aries')}
         {renderCell(1, 'Taurus')}
         {renderCell(2, 'Gemini')}
         
         {renderCell(10, 'Aquarius')}
         <div style={{ gridColumn: '2 / span 2', gridRow: '2 / span 2', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFFAF0' }}>
            <span style={{color: '#d4b896', fontSize: '24px', opacity: 0.2}}>OM</span>
         </div>
         {renderCell(3, 'Cancer')}
         
         {renderCell(9, 'Capricorn')}
         {renderCell(4, 'Leo')}
         
         {renderCell(8, 'Sagittarius')}
         {renderCell(7, 'Scorpio')}
         {renderCell(6, 'Libra')}
         {renderCell(5, 'Virgo')}
      </div>
    </div>
  );
}

function PrintLayoutInner({ K, partnerKundali, lang = 'en', dicts }) {
  if (!K) return null;
  const t = (k) => (DYNAMIC_STRINGS[lang] || DYNAMIC_STRINGS.en)[k] || DYNAMIC_STRINGS.en[k] || '';

  try {
    const { input, lagna, panchang, ayanamsaDMS, planets, dasha, formattedData, divCharts, yogas, shadbala, ashtakavarga } = K;
    const today = new Date().toLocaleDateString(lang === 'en' ? 'en-IN' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' });
    
    const D = dicts || {};
    const L_RASHI = D.rashi || {};
    const L_GRAHA = D.graha || {};
    const L_NAKS = D.naks || {};
    const L_YOGA = D.yoga || {};
    const L_STATUS = D.status || {};
    const L_LAGNA = D.lagnaR || {};
    const L_READING = D.reading || {};
    const L_DASHA = D.dashaM || {};

    const getRashiName = (r) => (L_RASHI[lang] || L_RASHI.en || window.RASHIS || {})[r] || (window.RASHIS && window.RASHIS[r] ? window.RASHIS[r].name : '') || r;
    const getGrahaName = (g) => (L_GRAHA[lang] || L_GRAHA.en || {})[g] || g;
    const getNaksName = (n) => (L_NAKS[lang] || L_NAKS.en || {})[n] || n;

    const getMoonName = (pls) => {
      const p = (pls || []).find(x => x.key === 'moon');
      if (!p) return '';
      return getRashiName(p.rashi) || '';
    };

    const getMoonNaks = (pls) => {
      const p = (pls || []).find(x => x.key === 'moon');
      return p ? getNaksName(p.nIdx) || p.nakshatraName : '';
    };

    const getSunName = (pls) => {
      const p = (pls || []).find(x => x.key === 'sun');
      if (!p) return '';
      return getRashiName(p.rashi) || '';
    };

    const cur = dasha?.mahadashas?.find(m => m.isCurrent) || dasha?.mahadashas?.[0];
    const curA = cur?.antars?.find(a => a.isCurrent) || cur?.antars?.[0];
    const strong = Object.entries(shadbala || {}).filter(([,v])=>v?.cls==='Strong').map(([k])=>k);
    const weak = Object.entries(shadbala || {}).filter(([,v])=>v?.cls==='Weak').map(([k])=>k);

    return (
      <div id="print-root" style={{ display: 'block', background: '#FFFAF0', color: '#1A1A1A', fontFamily: "'Noto Serif', Georgia, serif", padding: 0, margin: 0 }}>
        
        {/* PAGE 1: COVER */}
        <div className="print-page" style={{ height: '297mm', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', boxSizing: 'border-box', border: '8px solid #1e3a5f', margin: '10mm' }}>
           <div style={{ position: 'absolute', top: 40, right: 40, fontSize: '12px', color: '#6b7280' }}>Generated on: {today}</div>
           
           <div style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, #7C3AED, #F59E0B)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <span style={{ color: 'white', fontSize: '40px' }}>☀</span>
           </div>
           <h1 style={{ fontSize: '48px', color: '#1E3A5F', margin: '0 0 10px 0', letterSpacing: '4px', textTransform: 'uppercase' }}>Jyotish Darshan</h1>
           <h2 style={{ fontSize: '18px', color: '#7C3AED', margin: '0 0 60px 0', letterSpacing: '2px', fontWeight: 400 }}>Vedic Astrological Profile</h2>

           <div style={{ width: '100%', maxWidth: '500px', borderTop: '1px solid #D4B896', borderBottom: '1px solid #D4B896', padding: '30px', textAlign: 'center' }}>
              <h3 style={{ fontSize: '28px', color: '#1E3A5F', margin: '0 0 10px 0' }}>{input?.name || 'Native'}</h3>
              <p style={{ margin: '5px 0', fontSize: '16px' }}><strong>DOB:</strong> {input?.dob} at {input?.tob}</p>
              <p style={{ margin: '5px 0', fontSize: '16px' }}><strong>Place:</strong> {input?.city}, {input?.country}</p>
              <p style={{ margin: '5px 0', fontSize: '14px', color: '#6b7280' }}>Coordinates: {input?.lat?.toFixed(4) || ''}°N, {input?.lng?.toFixed(4) || ''}°E</p>
           </div>

           <div style={{ position: 'absolute', bottom: 40, textAlign: 'center', fontSize: '11px', color: '#9CA3AF' }}>
              Based on Jean Meeus astronomical algorithms with Lahiri Ayanamsa.<br/>
              Intended for spiritual and philosophical self-reflection.
           </div>
        </div>

        {/* PAGE 2: BIRTH DETAILS & PANCHANG */}
        <div className="print-page" style={{ padding: '20mm', boxSizing: 'border-box', pageBreakBefore: 'always' }}>
          <h2 style={{ color: '#7C3AED', borderBottom: '2px solid #D4B896', paddingBottom: '10px', marginTop: 0 }}>Table of Contents</h2>
          <ul style={{ listStyle: 'none', padding: 0, fontSize: '16px', lineHeight: '2' }}>
             <li>1. Birth Alignments &amp; Panchang</li>
             <li>2. Planetary Positions (Graha Sthiti)</li>
             <li>3. Core Vedic Charts (D1 &amp; D9)</li>
             <li>4. Vimshottari Dasha Overviews</li>
             <li>5. Yoga, Dosha &amp; Shadbala</li>
             {ashtakavarga && <li>6. Ashtakavarga Points</li>}
             <li>{(ashtakavarga ? '7' : '6')}. Expert Reading</li>
             {partnerKundali && <li>{(ashtakavarga ? 8 : 7)}. Relationship Compatibility</li>}
          </ul>

          <h2 style={{ color: '#7C3AED', borderBottom: '2px solid #D4B896', paddingBottom: '10px', marginTop: '60px' }}>1. Birth Alignments &amp; Panchang</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '14px' }}>
             <div>
                <p><strong>Ayanamsa:</strong> Lahiri {ayanamsaDMS || ''}</p>
                <p><strong>Lagna (Ascendant):</strong> {lagna ? getRashiName(lagna.rashi) : ''} {lagna?.degreeFormatted || ''}</p>
                <p><strong>Sun Sign:</strong> {getSunName(planets)}</p>
                <p><strong>Moon Sign (Rashi):</strong> {getMoonName(planets)}</p>
                <p><strong>{t('ov.janmaNak')}:</strong> {getMoonNaks(planets)}</p>
             </div>
             <div>
                <p><strong>Tithi:</strong> {panchang?.tithi || ''}</p>
                <p><strong>Vara (Day):</strong> {panchang?.vara ? String(panchang.vara).split(' ')[0] : ''}</p>
                <p><strong>Yoga:</strong> {panchang?.yoga || ''}</p>
                <p><strong>Karana:</strong> {panchang?.karana || ''}</p>
             </div>
          </div>

          <h2 style={{ color: '#7C3AED', borderBottom: '2px solid #D4B896', paddingBottom: '10px', marginTop: '40px' }}>2. Planetary Positions (Graha Sthiti)</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
             <thead>
                <tr style={{ background: '#f3e8ff', color: '#1e3a5f' }}>
                   <th style={{ padding: '8px', borderBottom: '1px solid #1e3a5f' }}>Planet</th>
                   <th style={{ padding: '8px', borderBottom: '1px solid #1e3a5f' }}>Sign</th>
                   <th style={{ padding: '8px', borderBottom: '1px solid #1e3a5f' }}>Degree</th>
                   <th style={{ padding: '8px', borderBottom: '1px solid #1e3a5f' }}>House</th>
                   <th style={{ padding: '8px', borderBottom: '1px solid #1e3a5f' }}>Nakshatra</th>
                </tr>
             </thead>
             <tbody>
                {(planets || []).filter(p=>p && p.key !== 'lagna').map(p => (
                   <tr key={p.key || Math.random()} style={{ borderBottom: '1px solid #e5d5c0' }}>
                      <td style={{ padding: '8px', fontWeight: 'bold' }}>{getGrahaName(p.key) || p.name || ''}</td>
                      <td style={{ padding: '8px' }}>{getRashiName(p.rashi)}</td>
                      <td style={{ padding: '8px' }}>{p.degreeFormatted || ''}</td>
                      <td style={{ padding: '8px' }}>{p.house || ''}</td>
                      <td style={{ padding: '8px' }}>{getNaksName(p.nIdx) || p.nakshatraName || ''} {p.pada ? `Q${p.pada}` : ''}</td>
                   </tr>
                ))}
             </tbody>
          </table>
        </div>

        {/* PAGE 3: CHARTS & DASHA */}
        <div className="print-page" style={{ padding: '20mm', boxSizing: 'border-box', pageBreakBefore: 'always' }}>
           <h2 style={{ color: '#7C3AED', borderBottom: '2px solid #D4B896', paddingBottom: '10px', marginTop: 0 }}>3. Core Vedic Charts</h2>
           <div style={{ display: 'flex', gap: '40px', justifyContent: 'center' }}>
              <DrawChart data={(planets || []).map(p => ({ ...p, rashi: p.rashi }))} title="Rashi Chart (D1)" />
              <DrawChart data={(planets || []).map(p => ({ ...p, rashi: ((divCharts?.D9 || divisionalCharts?.D9) || divisionalCharts?.D9)?.[p.key] ?? p.rashi }))} title="Navamsa Chart (D9)" />
           </div>

           <h2 style={{ color: '#7C3AED', borderBottom: '2px solid #D4B896', paddingBottom: '10px', marginTop: '40px' }}>4. Vimshottari Dasha Overviews</h2>
           <p style={{ fontSize: '12px', color: '#6b7280', fontStyle: 'italic', marginBottom: '10px' }}>Major planetary periods dictating the focus of life phases.</p>
           <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
             <thead>
                <tr style={{ background: '#f3e8ff', color: '#1e3a5f' }}>
                   <th style={{ padding: '6px 8px', borderBottom: '1px solid #1e3a5f' }}>Mahadasha</th>
                   <th style={{ padding: '6px 8px', borderBottom: '1px solid #1e3a5f' }}>Period</th>
                   <th style={{ padding: '6px 8px', borderBottom: '1px solid #1e3a5f' }}>Duration</th>
                </tr>
             </thead>
             <tbody>
                {(dasha?.mahadashas || []).map(m => (
                   <tr key={m.planet || Math.random()} style={{ borderBottom: '1px solid #e5d5c0', background: m.isCurrent ? '#fef3c7' : 'transparent' }}>
                      <td style={{ padding: '6px 8px', fontWeight: 'bold' }}>{getGrahaName(m.planet) ? String(getGrahaName(m.planet)).toUpperCase() : ''}</td>
                      <td style={{ padding: '6px 8px' }}>{m.start || ''} to {m.end || ''}</td>
                      <td style={{ padding: '6px 8px' }}>{m.years || ''} Years</td>
                   </tr>
                ))}
             </tbody>
          </table>
        </div>

        {/* PAGE 4: YOGAS & SHADBALA */}
        <div className="print-page" style={{ padding: '20mm', boxSizing: 'border-box', pageBreakBefore: 'always' }}>
           <h2 style={{ color: '#7C3AED', borderBottom: '2px solid #D4B896', paddingBottom: '10px', marginTop: 0 }}>5. Yoga, Dosha &amp; Shadbala</h2>
           
           <h3 style={{ color: '#1e3a5f', marginTop: '20px', marginBottom: '10px' }}>Yoga &amp; Dosha Analysis</h3>
           {yogas && yogas.length > 0 ? (
             <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left', marginBottom: '30px' }}>
                <thead>
                   <tr style={{ background: '#f3e8ff', color: '#1e3a5f' }}>
                      <th style={{ padding: '8px', borderBottom: '1px solid #1e3a5f' }}>Yoga / Dosha</th>
                      <th style={{ padding: '8px', borderBottom: '1px solid #1e3a5f' }}>Type</th>
                      <th style={{ padding: '8px', borderBottom: '1px solid #1e3a5f' }}>Effect</th>
                   </tr>
                </thead>
                <tbody>
                   {yogas.map(y => {
                     const ly = (L_YOGA[lang] || L_YOGA.en || {})[y.name] || { name: y.name, effect: y.effect };
                     return (
                      <tr key={y.name} style={{ borderBottom: '1px solid #e5d5c0' }}>
                         <td style={{ padding: '8px', fontWeight: 'bold', width: '25%' }}>{ly.name}</td>
                         <td style={{ padding: '8px', color: y.type === 'dosha' ? '#EF4444' : y.type === 'raja' ? '#7C3AED' : '#10B981', textTransform: 'uppercase' }}>{y.type}</td>
                         <td style={{ padding: '8px' }}>{ly.effect}</td>
                      </tr>
                     );
                   })}
                </tbody>
             </table>
           ) : <p style={{ fontSize: '12px', color: '#6b7280' }}>No major Yogas or Doshas identified in this chart.</p>}

           <h3 style={{ color: '#1e3a5f', marginTop: '20px', marginBottom: '10px' }}>Shadbala (Planetary Strengths)</h3>
           <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
             <thead>
                <tr style={{ background: '#f3e8ff', color: '#1e3a5f' }}>
                   <th style={{ padding: '8px', borderBottom: '1px solid #1e3a5f' }}>Planet</th>
                   <th style={{ padding: '8px', borderBottom: '1px solid #1e3a5f', textAlign: 'center' }}>Total Strength (Rupas)</th>
                   <th style={{ padding: '8px', borderBottom: '1px solid #1e3a5f', textAlign: 'center' }}>Classification</th>
                </tr>
             </thead>
             <tbody>
                {Object.entries(shadbala || {}).map(([k, v]) => (
                   <tr key={k} style={{ borderBottom: '1px solid #e5d5c0' }}>
                      <td style={{ padding: '8px', fontWeight: 'bold' }}>{getGrahaName(k)}</td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>{v?.total?.toFixed(1) || '—'}</td>
                      <td style={{ padding: '8px', textAlign: 'center', color: v?.cls === 'Strong' ? '#16A34A' : v?.cls === 'Weak' ? '#DC2626' : '#D97706', fontWeight: 600 }}>{v?.cls || '—'}</td>
                   </tr>
                ))}
             </tbody>
           </table>
        </div>

        {/* PAGE 5: ASHTAKAVARGA & EXPERT READING */}
        <div className="print-page" style={{ padding: '20mm', boxSizing: 'border-box', pageBreakBefore: 'always' }}>
           {ashtakavarga && (
           <>
           <h2 style={{ color: '#7C3AED', borderBottom: '2px solid #D4B896', paddingBottom: '10px', marginTop: 0 }}>6. Ashtakavarga Points</h2>
           <p style={{ fontSize: '12px', color: '#6b7280', fontStyle: 'italic', marginBottom: '10px' }}>Planetary transits yield favorable results when moving through signs with 28+ bindus.</p>
           <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'center', marginBottom: '40px' }}>
             <thead>
                <tr style={{ background: '#f3e8ff', color: '#1e3a5f' }}>
                   <th style={{ padding: '6px', borderBottom: '1px solid #1e3a5f', textAlign: 'left' }}>Planet</th>
                   {['Ar', 'Ta', 'Ge', 'Ca', 'Le', 'Vi', 'Li', 'Sc', 'Sa', 'Ca', 'Aq', 'Pi'].map(r => <th key={r} style={{ padding: '6px', borderBottom: '1px solid #1e3a5f' }}>{r}</th>)}
                </tr>
             </thead>
             <tbody>
                {['sun','moon','mars','mercury','jupiter','venus','saturn'].map((p) => {
                   const v = ashtakavarga?.BAV?.[p] || new Array(12).fill(0);
                   return (
                     <tr key={p} style={{ borderBottom: '1px solid #e5d5c0' }}>
                        <td style={{ padding: '6px', fontWeight: 'bold', textAlign: 'left' }}>{getGrahaName(p)}</td>
                        {v.map((pts, i) => <td key={i} style={{ padding: '6px' }}>{pts}</td>)}
                     </tr>
                   );
                })}
                {ashtakavarga?.SAV && ashtakavarga.SAV.length === 12 && (
                   <tr style={{ background: '#fef3c7', fontWeight: 'bold' }}>
                      <td style={{ padding: '8px', textAlign: 'left', color: '#b45309' }}>SARVA</td>
                      {ashtakavarga.SAV.map((pts, i) => <td key={i} style={{ padding: '8px', color: pts >= 28 ? '#15803d' : '#b91c1c' }}>{pts}</td>)}
                   </tr>
                )}
             </tbody>
           </table>
           </>
           )}

           <h2 style={{ color: '#7C3AED', borderBottom: '2px solid #D4B896', paddingBottom: '10px', marginTop: ashtakavarga ? '40px' : '0' }}>{(ashtakavarga ? '7' : '6')}. Your Life Journey (Mahadashas)</h2>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {(() => {
                 const readingData = buildReading(K, lang);
                 return readingData.lifeJourney.map(maha => (
                    <div key={maha.planet} style={{ background: maha.isCurrent ? '#F3E8FF' : '#FAFAF8', border: maha.isCurrent ? '1px solid #7C3AED' : '1px solid #E5D5C0', borderRadius: '8px', padding: '16px', position: 'relative' }}>
                       {maha.isCurrent && <div style={{ position: 'absolute', top: '10px', right: '10px', background: '#7C3AED', color: 'white', fontSize: '10px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px' }}>CURRENT</div>}
                       <h3 style={{ margin: '0 0 8px', color: '#1e3a5f', fontSize: '14px', textTransform: 'capitalize' }}>
                          {maha.planet} Mahadasha ({maha.ageStr})
                       </h3>
                       <p style={{ margin: '0 0 10px', fontSize: '13px', lineHeight: '1.5', color: '#374151' }}>
                          {maha.description}
                       </p>
                       <div style={{ background: '#fff', padding: '10px', borderRadius: '4px', border: '1px solid #e5d5c0', fontSize: '12px' }}>
                          <div style={{ marginBottom: '6px' }}><strong style={{ color: '#DC2626' }}>Key Challenge:</strong> {maha.keyChallenge}</div>
                          <div><strong style={{ color: '#16A34A' }}>Guidance:</strong> {maha.guidance}</div>
                       </div>
                    </div>
                 ));
              })()}
           </div>
        </div>


        {/* PAGE 7: PARTNER MATCHING */}
        {partnerKundali && (
           <div className="print-page" style={{ padding: '20mm', boxSizing: 'border-box', pageBreakBefore: 'always' }}>
              <h2 style={{ color: '#7C3AED', borderBottom: '2px solid #D4B896', paddingBottom: '10px', marginTop: 0 }}>{(ashtakavarga ? 8 : 7)}. Relationship Compatibility</h2>
              <p style={{ fontSize: '14px', marginBottom: '20px' }}>Match evaluation between <strong>{input?.name || 'Native'}</strong> and <strong>{partnerKundali?.input?.name || 'Partner'}</strong>.</p>
              <div style={{ background: '#fff', border: '1px solid #1e3a5f', padding: '20px', borderRadius: '8px' }}>
                 <h3 style={{ margin: '0 0 10px', color: '#1e3a5f' }}>Ashtakoota Milan (36-Point System)</h3>
                 <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#374151' }}>
                    The traditional Ashtakoota methodology evaluates mental, physical, and emotional compatibility. A score above 18 is considered viable, and above 26 is excellent.
                 </p>
                 <p style={{ fontSize: '13px', lineHeight: '1.6', marginTop: '10px' }}>
                    <strong>{input?.name || 'Native'}:</strong> Moon in {getMoonNaks(planets)} ({getMoonName(planets)})<br/>
                    <strong>{partnerKundali?.input?.name || 'Partner'}:</strong> Moon in {getMoonNaks(partnerKundali?.planets)} ({getMoonName(partnerKundali?.planets)})
                 </p>
              </div>
              
              <div style={{ marginTop: '20px', background: '#fef2f2', border: '1px solid #ef4444', padding: '15px', borderRadius: '8px' }}>
                 <h4 style={{ margin: '0 0 8px', color: '#b91c1c' }}>Manglik (Kuja) Dosha Advisory</h4>
                 <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.6', color: '#7f1d1d' }}>
                   If Manglik Dosha is present in either chart, astrological remedies and careful consideration are advised before proceeding with marital commitments.
                 </p>
              </div>
           </div>
        )}
      </div>
    );
  } catch (err) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 999999, background: '#fff0f0', color: '#990000', padding: '40px', fontFamily: 'monospace', overflowY: 'auto' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '20px', fontWeight: 'bold' }}>React Runtime Crash Captured! 💥</h2>
        <p style={{ fontSize: '16px', fontWeight: 'bold' }}>Error: {String(err)}</p>
        <pre style={{ marginTop: '20px', padding: '20px', background: 'white', border: '1px solid #ffcccc', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{err.stack}</pre>
        <p style={{ marginTop: '30px', fontWeight: 'bold', fontSize: '18px' }}>👉 Please copy/paste the entire stack trace above and send it to me!</p>
      </div>
    );
  }
}

export default class PrintLayout extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("PrintLayout Error Boundary Caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999999, background: '#fee2e2', color: '#991b1b', padding: '40px', fontFamily: 'monospace', overflowY: 'auto' }}>
          <h1 style={{ fontSize: '40px', marginBottom: '20px' }}>💥 FATAL REACT CRASH CAUGHT IN BOUNDARY!</h1>
          <p style={{ fontSize: '18px', fontWeight: 'bold' }}>The dreaded black screen was ACTUALLY a silent React Exception bubbling up!</p>
          <p style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '20px' }}>👉 PLEASE COPY AND PASTE THIS ENTIRE RED SCREEN BACK TO THE AI:</p>
          
          <h2 style={{ marginTop: '30px' }}>Error Details:</h2>
          <pre style={{ background: '#450a0a', color: '#fecaca', padding: '16px', borderRadius: '8px', whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontSize: '14px' }}>
            {this.state.error && this.state.error.toString()}
          </pre>

          <h2 style={{ marginTop: '20px' }}>Component Stack Trace:</h2>
          <pre style={{ background: '#450a0a', color: '#fca5a5', padding: '16px', borderRadius: '8px', whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontSize: '14px' }}>
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
        </div>
      );
    }
    return <PrintLayoutInner {...this.props} />;
  }
}
