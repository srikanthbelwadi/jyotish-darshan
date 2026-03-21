import { useState, useRef } from 'react';
import { LANGUAGES } from '../i18n/astroTerms.js';
import { encodeShareLink } from '../export/shareLink.js';
import OverviewTab from './tabs/OverviewTab.jsx';
import ChartsTab from './tabs/ChartsTab.jsx';
import PlanetsTab from './tabs/PlanetsTab.jsx';
import DashaTab from './tabs/DashaTab.jsx';
import YogaTab from './tabs/YogaTab.jsx';
import ShadbalaTab from './tabs/ShadbalaTab.jsx';
import AshtakavargaTab from './tabs/AshtakavargaTab.jsx';
import ExpertReadingTab from './tabs/ExpertReadingTab.jsx';
import LifeDimensionsCard from './LifeDimensionsCard.jsx';

const TABS = [
  { id: 'overview',  label: 'Overview',       icon: '☀' },
  { id: 'dimensions',label: 'Life Dimensions', icon: '🌟' },
  { id: 'charts',    label: 'Charts',          icon: '⊞' },
  { id: 'planets',   label: 'Graha Sthiti',    icon: '♃' },
  { id: 'dasha',     label: 'Dasha',           icon: '⏳' },
  { id: 'yoga',      label: 'Yoga & Dosha',    icon: '🔮' },
  { id: 'shadbala',  label: 'Shadbala',        icon: '⚖' },
  { id: 'avarga',    label: 'Ashtakavarga',    icon: '🔢' },
  { id: 'reading',   label: 'Expert Reading',  icon: '📜' },
];

export default function ResultsPage({ kundali, onBack, lang, onLangChange }) {
  const [tab, setTab] = useState('overview');
  const [chartFormat, setChartFormat] = useState('south');
  const [copied, setCopied] = useState(false);
  const [printing, setPrinting] = useState(false);
  const resultsRef = useRef(null);

  const { input, lagna, panchang, ayanamsaDMS, planets } = kundali;
  const moon = planets.find(p => p.key === 'moon');

  const handleShare = () => {
    const url = encodeShareLink(input);
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    setPrinting(true);
    try {
      // Use browser's print-to-PDF
      window.print();
    } finally {
      setPrinting(false);
    }
  };

  const formattedDate = input.dob
    ? new Date(input.year, input.month - 1, input.day).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: "'Noto Serif', Georgia, serif" }}>

      {/* ── Header ── */}
      <header className="no-print" style={{ background: 'white', borderBottom: '1px solid #E5D5C0', padding: '11px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onBack} style={{ background: 'none', border: '1px solid #E5D5C0', cursor: 'pointer', fontSize: 16, color: '#7C3AED', padding: '6px 10px', borderRadius: 8, fontFamily: 'inherit', transition: 'all 0.15s' }}
            title="Back to input form">← Back</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 30, height: 30, background: 'linear-gradient(135deg, #7C3AED, #F59E0B)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'white', fontSize: 15 }}>☀</span>
            </div>
            <span style={{ fontSize: 16, color: '#1E3A5F', fontWeight: 700 }}>Jyotish Darshan</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select value={lang} onChange={e => onLangChange(e.target.value)}
            style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #D4B896', background: 'white', fontFamily: 'inherit', fontSize: 12, color: '#1E3A5F', cursor: 'pointer' }}>
            {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.nativeName}</option>)}
          </select>
          <button onClick={handleShare}
            style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #D4B896', background: copied ? '#DCFCE7' : 'white', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', color: copied ? '#16A34A' : '#1E3A5F', transition: 'all 0.2s' }}>
            {copied ? '✓ Copied!' : '⇧ Share'}
          </button>
          <button onClick={handleDownloadPDF} disabled={printing}
            style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #7C3AED', background: '#7C3AED', color: 'white', fontSize: 12, cursor: printing ? 'default' : 'pointer', fontFamily: 'inherit', opacity: printing ? 0.7 : 1 }}>
            {printing ? '...' : '↓ PDF'}
          </button>
        </div>
      </header>

      {/* ── Birth Summary Banner ── */}
      <div style={{ background: 'linear-gradient(135deg, #1E3A5F 0%, #4C1D95 60%, #7C3AED 100%)', color: 'white', padding: '20px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 600, letterSpacing: 0.3 }}>
            Janma Kundali — {input.city}, {input.country}
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 28px', fontSize: 13, opacity: 0.9, marginBottom: 12 }}>
            <span>📅 {formattedDate}, {input.tob}</span>
            <span>📍 {input.lat?.toFixed(4)}°N, {input.lng?.toFixed(4)}°E</span>
            <span>🔷 Ayanamsa: Lahiri {ayanamsaDMS}</span>
            <span>♑ Lagna: {lagna ? `${['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya','Tula','Vrischika','Dhanu','Makara','Kumbha','Meena'][lagna.rashi]} ${lagna.degreeFormatted}` : ''}</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 10px' }}>
            {[
              ['Tithi', panchang.tithi],
              ['Vara', panchang.vara.split(' ')[0]],
              ['Nakshatra', panchang.nakshatra],
              ['Yoga', panchang.yoga],
              ['Karana', panchang.karana],
            ].map(([k, v]) => (
              <span key={k} style={{ background: 'rgba(255,255,255,0.15)', padding: '4px 11px', borderRadius: 20, fontSize: 12 }}>
                <strong>{k}:</strong> {v}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div className="no-print" style={{ background: 'white', borderBottom: '1px solid #E5D5C0', overflowX: 'auto', position: 'sticky', top: 53, zIndex: 15, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', padding: '0 20px', whiteSpace: 'nowrap' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ padding: '13px 16px', background: 'none', border: 'none',
                borderBottom: tab === t.id ? '3px solid #7C3AED' : '3px solid transparent',
                color: tab === t.id ? '#7C3AED' : '#6B7280',
                fontWeight: tab === t.id ? 700 : 400,
                cursor: 'pointer', fontSize: 13, fontFamily: 'inherit',
                transition: 'all 0.15s', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontSize: 14 }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div ref={resultsRef} style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 20px 48px' }}>
        {tab === 'overview' && <OverviewTab kundali={kundali} chartFormat={chartFormat} lang={lang} />}
        {tab === 'dimensions' && <LifeDimensionsCard kundali={kundali} />}
        {tab === 'charts'  && <ChartsTab   kundali={kundali} chartFormat={chartFormat} onFormatChange={setChartFormat} lang={lang} />}
        {tab === 'planets' && <PlanetsTab  kundali={kundali} />}
        {tab === 'dasha'   && <DashaTab    kundali={kundali} />}
        {tab === 'yoga'    && <YogaTab     kundali={kundali} />}
        {tab === 'shadbala' && <ShadbalaTab kundali={kundali} />}
        {tab === 'avarga'  && <AshtakavargaTab kundali={kundali} />}
        {tab === 'reading' && <ExpertReadingTab kundali={kundali} />}
      </div>

      {/* ── Footer ── */}
      <footer className="no-print" style={{ textAlign: 'center', padding: '18px 24px', borderTop: '1px solid #E5D5C0', background: 'white' }}>
        <p style={{ margin: 0, fontSize: 11, color: '#9CA3AF' }}>
          Calculations based on Jean Meeus astronomical algorithms with Lahiri Ayanamsa · Swiss Ephemeris accuracy target · Jyotish Darshan v1.0
        </p>
      </footer>
    </div>
  );
}
