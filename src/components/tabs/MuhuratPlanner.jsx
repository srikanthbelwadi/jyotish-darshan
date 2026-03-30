import React, { useState, useEffect, useCallback } from 'react';
import { generateMuhuratCalendar, getAuspiciousWindow } from '../../engine/muhuratEngine';
import { getSwe } from '../../engine/swissephLoader';

const EVENTS = [
  "Simantonnayana (Baby Shower / Godh Bharai)",
  "Namakarana (Naming Ceremony)",
  "Annaprashana (First Solid Food)",
  "Mundan / Chudakarana (First Haircut)",
  "Karnavedha (Ear Piercing)",
  "Vidyarambha / Aksharabhyasam (Start of Education)",
  "Upanayana (Sacred Thread Ceremony)",
  "Vivaha (Marriage)",
  "Sagai / Mangni (Engagement)",
  "Bhoomi Puja (Foundation Stone Laying)",
  "Griha Pravesh (Housewarming)",
  "Deva Pratishtha (Idol Installation)",
  "Shanti Puja (Pacification Rituals)",
  "Vyapar Arambh (Starting a Business)",
  "Sampatti Kharidi (Property Purchase)",
  "Vahana Puja (Buying a Vehicle)",
  "Swarna / Abhushan Kharidi (Buying Gold)",
  "Yatra (Significant Journeys)"
];

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function MuhuratPlanner({ kundali, partnerData, t, lang, user, onRequireLogin, UniversalLoader }) {
  const [visible, setVisible] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [calculating, setCalculating] = useState(false);
  const [greenDaysMap, setGreenDaysMap] = useState({});
  const [selectedDateStr, setSelectedDateStr] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [hasGenerated, setHasGenerated] = useState(false);
  
  const sweInstance = getSwe();

  const natalData = {
    moonRashi: kundali.planets.find(p => p.key === 'moon')?.rashi,
    nakshatra: kundali.panchang.nakIdx, // generic index representation 0-26
    lagnaRashi: kundali.lagna?.rashi
  };
  
  // Quick safety parse for the partner if it is synastry mode:
  const pData = partnerData ? {
    moonRashi: partnerData.planets?.find(p => p.key === 'moon')?.rashi,
    nakshatra: partnerData.panchang?.nakIdx,
    lagnaRashi: partnerData.lagna?.rashi
  } : null;

  const COUPLE_EVENTS = ["Vivaha (Marriage)", "Sagai / Mangni (Engagement)"];
  const requiresPartner = COUPLE_EVENTS.includes(selectedEvent);

  const handleGenerate = async () => {
    if (!sweInstance || !user || !selectedEvent) return;
    
    setHasGenerated(true);
    setCalculating(true);
    setSelectedDateStr(null);
    setAiAnalysis(null);
    
    if (requiresPartner && !pData) {
       setCalculating(false);
       setGreenDaysMap({});
       return;
    }
    
    setTimeout(async () => {
       try {
         const nData = { ...natalData };
         const pDataLocal = pData ? { ...pData } : null;
         const dMap = await generateMuhuratCalendar(sweInstance, selectedEvent, nData, pDataLocal, 365);
         setGreenDaysMap(dMap);
       } catch (e) {
         console.error("Muhurat calculation failed:", e);
       } finally {
         setCalculating(false);
       }
    }, 50);
  };


  const handleDateClick = async (dateStr) => {
    setSelectedDateStr(dateStr);
    
    const windowData = await getAuspiciousWindow(sweInstance, dateStr, natalData.lagnaRashi, pData?.lagnaRashi);
    const timeBlockStr = windowData.timeBlock || "Unknown Time Block";
    const medLagna = windowData.lagnaSign || 0;
    
    setAiAnalysis({ loading: true, timeBlock: timeBlockStr, lagnaSign: medLagna });
    
    try {
      const gDay = greenDaysMap[dateStr];
      const payload = {
         event: selectedEvent,
         kundali: kundali.input,
         partner: partnerData?.input,
         transit: {
             date: dateStr,
             goodHours: timeBlockStr,
             nakshatra: gDay.nakshatra,
             tithi: gDay.tithi,
             lagnaSign: medLagna
         }
      };

      const res = await fetch('/api/muhurat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      setAiAnalysis(prev => ({
         ...prev, 
         text: data.explanation || "No explanation returned.", 
         loading: false 
      }));
    } catch(e) {
      setAiAnalysis(prev => ({
         ...prev, 
         error: "Failed to fetch LLM analysis.", 
         loading: false 
      }));
    }
  };

  if (!visible) return null;

  return (
    <div className="mobile-hero-padding" style={{ background: 'var(--bg-input)', backgroundImage: 'radial-gradient(var(--bg-input) 20%, transparent 20%), radial-gradient(var(--bg-input) 20%, transparent 20%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px', padding: '50px', borderRadius: '4px', border: '2px solid var(--border-light)', marginBottom: '32px', position: 'relative', overflow: 'hidden', boxShadow: 'inset 0 0 50px var(--bg-surface), 0 10px 30px rgba(0,0,0,0.5)' }}>
      <button onClick={() => setVisible(false)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'transparent', border: 'none', color: 'var(--accent-gold)', fontSize: '28px', cursor: 'pointer', zIndex: 20 }} title={t("Dismiss", lang)}>×</button>

      <div style={{ position: 'absolute', top: '50%', right: '-5%', transform: 'translateY(-50%)', width: '300px', height: '300px', border: '5px dashed var(--border-light)', borderRadius: '50%', animation: 'spin 120s linear infinite', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
         <div style={{ width: '200px', height: '200px', border: '10px double var(--border-light)', borderRadius: '50%', animation: 'spin 60s reverse infinite' }}></div>
      </div>
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontSize: '38px', color: 'var(--accent-gold)', margin: '0 0 16px 0', fontFamily: '"Cinzel", serif', textShadow: '0 2px 4px var(--bg-surface)', textTransform: 'uppercase' }}>
          {t("Auspicious Muhurat", lang)}
        </h2>
        <p style={{ margin: '0 0 24px', fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic', fontFamily: 'serif' }}>
           Suggestions for favorable timings based on classical planetary transits.
        </p>

        <div className="mobile-oracle-box" style={{ background: 'var(--bg-surface)', position: 'relative', padding: '24px', borderTop: '4px solid #ffd700', minHeight: '180px' }}>
          
          {!user && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', background: 'rgba(10,10,10,0.7)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
              <div style={{ fontSize: '42px', marginBottom: '12px', filter: 'drop-shadow(0 0 10px rgba(255,215,0,0.6))' }}>🔒</div>
              <h3 style={{ fontFamily: '"Cinzel", serif', margin: '0 0 16px', color: 'var(--accent-gold)' }}>{t('Unlock Shastric Oracle', lang)}</h3>
              <button style={{ padding: '12px 24px', fontSize: '14px', background: 'var(--accent-gold)', color: '#000', border: 'none', cursor: 'pointer', fontFamily: '"Cinzel", serif', fontWeight: 'bold', letterSpacing: '1px' }} onClick={onRequireLogin}>
                {t('Authenticate to Reveal ➔', lang)}
              </button>
            </div>
          )}
          
          <div style={{ marginBottom: '24px' }}>
        <p style={{ margin: '0 0 8px', color: 'var(--text-muted)', fontSize: '14px' }}>{t("Select an Event to cast electional chart:", lang)}</p>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
           <select 
             value={selectedEvent} 
             onChange={e => {
                setSelectedEvent(e.target.value);
                setHasGenerated(false);
             }}
             style={{
               flex: 1, padding: '12px 16px', background: 'var(--bg-input)', border: '1px solid var(--border-light)',
               color: 'var(--text-main)', borderRadius: '8px', fontSize: '16px', outline: 'none', cursor: 'pointer'
             }}
           >
             <option value="" disabled>{t("Select Live Event..", lang)}</option>
             {EVENTS.map(ev => <option key={ev} value={ev}>{t(ev, lang)}</option>)}
           </select>
           <button 
              onClick={handleGenerate}
              disabled={!sweInstance || !selectedEvent}
              style={{
                 padding: '0 24px', background: 'var(--accent-gold)', color: '#000',
                 border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold',
                 cursor: (sweInstance && selectedEvent) ? 'pointer' : 'not-allowed', boxShadow: '0 4px 14px rgba(212, 175, 55, 0.4)', transition: 'all 0.2s'
              }}
           >
              {t("Go", lang)}
           </button>
        </div>
      </div>

      {hasGenerated && (
        <>
          {requiresPartner && !pData ? (
             <div style={{ padding: '32px', textAlign: 'center', background: 'var(--bg-input)', border: '1px solid var(--border-light)', borderRadius: '12px' }}>
                <span style={{ fontSize: '32px', display: 'block', marginBottom: '12px' }}>💞</span>
                <p style={{ color: 'var(--text-main)', fontSize: '16px', margin: 0 }}>{t("This event requires a partner to establish Synastry.", lang)}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '8px' }}>{t("Please add a partner in the dashboard above.", lang)}</p>
             </div>
          ) : calculating ? (
        <div style={{ padding: '40px 0', display: 'flex', justifyContent: 'center', width: '100%' }}>
           {UniversalLoader ? <UniversalLoader /> : (
              <div style={{ textAlign: 'center', color: 'var(--accent-gold)', fontStyle: 'italic' }}>
                {t("Consulting Ephemeris Transits for", lang)} {t(selectedEvent, lang)}...
              </div>
           )}
        </div>
      ) : Object.keys(greenDaysMap).length === 0 ? (
         <div style={{ padding: '32px', textAlign: 'center', background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px' }}>
            <span style={{ fontSize: '32px', display: 'block', marginBottom: '12px' }}>🪐</span>
            <p style={{ color: 'var(--text-main)', fontSize: '16px', margin: 0 }}>{t("No auspicious alignments found for this event in the next 365 days.", lang)}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '8px' }}>{t("Try a different event or adjust the planetary context.", lang)}</p>
         </div>
      ) : (
        <div className="muhurat-month-grid" style={{
           display: 'flex', overflowX: 'auto', gap: '16px', paddingBottom: '16px',
           msOverflowStyle: 'none', scrollbarWidth: 'none'
        }}>
           {Array.from({length: 12}).map((_, i) => {
              const d = new Date();
              d.setMonth(d.getMonth() + i);
              const mName = MONTH_NAMES[d.getMonth()];
              const yr = d.getFullYear();
              
              const monthPrefix = `${yr}-${String(d.getMonth()+1).padStart(2,'0')}`;
              const matchingDays = Object.keys(greenDaysMap).filter(k => k.startsWith(monthPrefix)).sort();
              
              // Skip rendering empty months to simplify UI on mobile if needed, but keeping for scaffolding
              if(matchingDays.length === 0) return null;
              
              return (
                 <div key={i} style={{ 
                    minWidth: '180px', flexShrink: 0, background: 'var(--bg-card)', 
                    border: '1px solid var(--border-light)', borderRadius: '12px', padding: '16px',
                    boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05)'
                 }}>
                    <strong style={{ display: 'block', fontSize: '15px', color: 'var(--text-main)', marginBottom: '12px', borderBottom: '1px solid var(--border-light)', paddingBottom: '6px' }}>
                       {t(mName, lang)} {yr}
                    </strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                       {matchingDays.map(dateStr => {
                          const isActive = selectedDateStr === dateStr;
                          const score = greenDaysMap[dateStr].score;
                          const dNum = parseInt(dateStr.split('-')[2]);
                          return (
                            <button 
                              key={dateStr}
                              onClick={() => handleDateClick(dateStr)}
                              style={{
                                 width: '32px', height: '32px', borderRadius: '50%', border: 'none', cursor: 'pointer',
                                 background: isActive ? 'var(--accent-gold)' : 'var(--bg-input)', 
                                 border: isActive ? 'none' : '1px solid var(--border-light)',
                                 color: isActive ? 'var(--bg-surface)' : 'var(--text-main)',
                                 fontWeight: 'bold', fontSize: '13px',
                                 transition: 'all 0.2s', boxShadow: isActive ? '0 0 10px var(--accent-gold)' : 'none'
                              }}
                              title={`Score: ${score}`}
                            >
                               {dNum}
                            </button>
                          )
                       })}
                    </div>
                 </div>
              )
           })}
        </div>
      )}

      {selectedDateStr && aiAnalysis && (
         <div style={{
            marginTop: '24px', background: 'var(--bg-input)', padding: '24px', 
            borderRadius: '12px', border: '1px solid var(--accent-gold)',
            animation: 'fadeIn 0.3s ease'
         }}>
             <h4 style={{ margin: '0 0 8px', color: 'var(--accent-gold)', fontSize: '18px', fontFamily: '"Cinzel", serif' }}>
                {t("Auspicious Hours for", lang)} {new Date(selectedDateStr).toLocaleDateString(lang, {weekday:'long', month:'long', day:'numeric'})}
             </h4>
             <p style={{ margin: '0 0 16px', color: 'var(--text-main)', fontSize: '16px', fontWeight: 'bold' }}>
                Recommended Window: {aiAnalysis.timeBlock}
             </p>

             <div style={{ 
                background: 'var(--bg-surface)', padding: '20px', borderRadius: '8px', 
                borderLeft: '4px solid var(--accent-gold)', fontSize: '14px', lineHeight: 1.6
             }}>
                <div style={{ display: 'flex', gap: '24px', marginBottom: '16px', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                   <div><strong>{t("Transit Nakshatra:", lang)}</strong> {greenDaysMap[selectedDateStr].nakshatra}</div>
                   <div><strong>{t("Transit Tithi:", lang)}</strong> {greenDaysMap[selectedDateStr].tithi}</div>
                   <div><strong>{t("Hourly Ascendant:", lang)}</strong> {aiAnalysis.lagnaSign}</div>
                </div>
                
                <div style={{ color: 'var(--text-main)' }}>
                   {aiAnalysis.loading ? (
                      <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center' }}>
                         {UniversalLoader ? <UniversalLoader /> : <span style={{ color: 'var(--accent-gold)' }}>{t("Astrologer analyzing alignment...", lang)}</span>}
                      </div>
                   ) : aiAnalysis.error ? (
                      <span style={{ color: '#ef4444' }}>{aiAnalysis.error}</span>
                   ) : (
                      <div style={{ fontFamily: 'serif', fontSize: '14px' }} dangerouslySetInnerHTML={{ __html: aiAnalysis.text?.replace(/\n/g, '<br/>') || '' }} />
                   )}
                 </div>
              </div>
          </div>
       )}
        </div>
      </div>
    </div>
  );
}
