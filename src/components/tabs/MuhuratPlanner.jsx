import React, { useState, useEffect, useCallback } from 'react';
import { useSync } from '../../contexts/SyncContext.jsx';
import { L_NAKS, L_RASHI } from '../../App.jsx';

// ════════════════════════════════════════════════════════════════
// CLOUD MUTATION PROXIES
// ════════════════════════════════════════════════════════════════
async function generateMuhuratCalendar(selectedEvent, nData, pDataLocal, lat, lng) {
  const payload = {
    action: 'generateMuhuratCalendar',
     params: {
        baseKundali: nData, 
        partnerKundali: pDataLocal, 
        eventCategory: selectedEvent, 
        lat: lat, 
        lng: lng, 
        startDate: Date.now(),
        tzOffset: 0
     }
  };
  const res = await fetch('/api/muhurat_math', { method: 'POST', body: JSON.stringify(payload), headers: {'Content-Type': 'application/json'} });
  return await res.json();
}

async function getAuspiciousWindow(bestJd, eventCategory, baseKundali, partnerKundali, lat, lng, tzOffset) {
  const res = await fetch('/api/muhurat_math', { 
    method: 'POST', 
    headers: {'Content-Type': 'application/json'}, 
    body: JSON.stringify({action: 'getAuspiciousWindow', params: {bestJd, eventCategory, baseKundali, partnerKundali, lat, lng, tzOffset}}) 
  });
  return await res.json();
}

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
  const [monthOffset, setMonthOffset] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
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
    if (!user || !selectedEvent) return;
    
    setHasGenerated(true);
    setCalculating(true);
    setIsMinimized(false);
    setSelectedDateStr(null);
    setAiAnalysis(null);
    
    if (requiresPartner && !pData) {
       setCalculating(false);
       setGreenDaysMap({});
       return;
    }
    
    setMonthOffset(0);
    
    setTimeout(async () => {
       try {
         const nData = { ...natalData };
         const pDataLocal = pData ? { ...pData } : null;
         const dMap = await generateMuhuratCalendar(selectedEvent, nData, pDataLocal, kundali.input.lat, kundali.input.lng);
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
    
    const windowData = await getAuspiciousWindow(dateStr, selectedEvent, natalData, pData, kundali.input.lat, kundali.input.lng, 0);
    const timeBlockStr = windowData.timeBlock || "Unknown Time Block";
    const medLagna = windowData.lagnaSign || 0;
    const medLagnaIndex = windowData.lagnaSignIndex;
    
    setAiAnalysis({ loading: true, timeBlock: timeBlockStr, lagnaSign: medLagna, lagnaSignIndex: medLagnaIndex });
    
    setTimeout(() => {
       document.getElementById('muhurat-analysis-scroll-target')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
    
    try {
      const gDay = greenDaysMap[dateStr];
      const payload = {
         event: selectedEvent,
         kundali: kundali.input,
         partner: partnerData?.input,
         lang: lang,
         transit: {
             date: dateStr,
             goodHours: timeBlockStr,
             nakshatra: gDay.nakshatra,
             tithi: gDay.tithi,
             lagnaSign: medLagna
         }
      };

      let token = '';
      if (user) {
         try { token = await user.getIdToken(); } catch(e) {}
      }

      const res = await fetch('/api/muhurat', {
        method: 'POST',
        headers: { 
           'Content-Type': 'application/json',
           ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
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
         error: "Unable to generate astrological guidance.", 
         loading: false 
      }));
    }
  };

  if (!visible) return null;

  return (
    <div className="mobile-hero-padding" style={{ background: 'var(--bg-input)', backgroundImage: 'radial-gradient(var(--bg-input) 20%, transparent 20%), radial-gradient(var(--bg-input) 20%, transparent 20%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px', padding: '50px', borderRadius: '4px', border: '2px solid var(--border-light)', marginBottom: '32px', position: 'relative', overflow: 'hidden', boxShadow: 'inset 0 0 50px var(--bg-surface), 0 10px 30px rgba(0,0,0,0.5)' }}>
      <div style={{ position: 'absolute', top: '50%', right: '-5%', transform: 'translateY(-50%)', width: '300px', height: '300px', border: '5px dashed var(--border-light)', borderRadius: '50%', animation: 'spin 120s linear infinite', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
         <div style={{ width: '200px', height: '200px', border: '10px double var(--border-light)', borderRadius: '50%', animation: 'spin 60s reverse infinite' }}></div>
      </div>
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontSize: '38px', color: 'var(--accent-gold)', margin: '0 0 16px 0', fontFamily: 'var(--font-serif)', textShadow: '0 2px 4px var(--bg-surface)', textTransform: 'uppercase' }}>
          {t("Auspicious Muhurat")}
        </h2>
        <p style={{ margin: '0 0 24px', fontSize:   17, color: 'var(--text-muted)', fontStyle: 'italic', fontFamily: 'var(--font-serif)' }}>
           {t("Suggestions for favorable timings based on classical planetary transits.")}
        </p>

        <div className="mobile-oracle-box" style={{ background: 'var(--bg-surface)', position: 'relative', padding: '24px', borderTop: '4px solid #ffd700', minHeight: '180px' }}>
          
          {!user && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', background: 'rgba(10,10,10,0.7)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
              <div style={{ fontSize: '42px', marginBottom: '12px', filter: 'drop-shadow(0 0 10px rgba(255,215,0,0.6))' }}>🔒</div>
              <h3 style={{ fontFamily: 'var(--font-serif)', margin: '0 0 16px', color: 'var(--accent-gold)' }}>{t('Unlock Shastric Oracle')}</h3>
              <button style={{ padding: '12px 24px', fontSize: '14px', background: 'var(--accent-gold)', color: '#000', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-serif)', fontWeight: 'bold', letterSpacing: '1px' }} onClick={onRequireLogin}>
                {t('Authenticate to Reveal ➔')}
              </button>
            </div>
          )}
          
          <div style={{ marginBottom: '24px' }}>
        <p style={{ margin: '0 0 8px', color: 'var(--text-muted)', fontSize:  16 }}>{t("Select an Event to cast electional chart:")}</p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
           <select 
             value={selectedEvent} 
             onChange={e => {
                setSelectedEvent(e.target.value);
                setHasGenerated(false);
             }}
             style={{
               flex: '1 1 200px', minWidth: 0, padding: '12px 16px', background: 'var(--bg-input)', border: '1px solid var(--border-light)',
               color: 'var(--text-main)', borderRadius: '8px', fontSize: '16px', outline: 'none', cursor: 'pointer',
               textOverflow: 'ellipsis'
             }}
           >
             <option value="" disabled>{t("Select Life Event..")}</option>
             {EVENTS.map(ev => <option key={ev} value={ev}>{t(ev)}</option>)}
           </select>
           <button 
              onClick={handleGenerate}
              disabled={!selectedEvent}
              style={{
                 flex: '1 1 auto',
                 padding: '12px 24px', background: 'var(--accent-gold)', color: '#000',
                 border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold',
                 cursor: selectedEvent ? 'pointer' : 'not-allowed', boxShadow: '0 4px 14px rgba(212, 175, 55, 0.4)', transition: 'all 0.2s'
              }}
           >
              {t("Go")}
           </button>
           {hasGenerated && (
             <button
                onClick={() => setIsMinimized(!isMinimized)}
                style={{
                   padding: '0 16px', background: 'transparent', color: 'var(--text-muted)',
                   border: '2px dashed var(--border-light)', borderRadius: '8px', fontSize: '18px',
                   cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center'
                }}
                title={isMinimized ? t("Expand Results") : t("Minimize Results")}
                onMouseOver={e => { e.currentTarget.style.color = 'var(--text-main)'; e.currentTarget.style.background = 'rgba(212, 175, 55, 0.1)'; e.currentTarget.style.borderColor = 'var(--accent-gold)'; }}
                onMouseOut={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border-light)'; }}
             >
                {isMinimized ? '+' : '−'}
             </button>
           )}
        </div>
      </div>

      {hasGenerated && isMinimized && (
         <div style={{ padding: '24px', background: 'var(--bg-input)', border: '1px dashed var(--border-light)', borderRadius: '8px', textAlign: 'center', animation: 'fadeIn 0.3s ease' }}>
            <p style={{ margin: 0, color: 'var(--accent-gold)', fontFamily: 'var(--font-serif)', fontSize: '16px' }}>{t('Muhurat Scan Minimized')}</p>
         </div>
      )}

      {hasGenerated && !isMinimized && (
        <>
          {requiresPartner && !pData ? (
             <button 
                onClick={() => {
                   const btn = document.getElementById('add-partner-header-btn');
                   if (btn) {
                     btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                     // Also slightly pulsate or trigger a click on it if needed, but smooth scrolling is best
                     // to draw attention to it.
                     btn.style.boxShadow = '0 0 15px var(--accent-gold)';
                     setTimeout(() => btn.style.boxShadow = 'none', 2000);
                   } else {
                     window.scrollTo({ top: 0, behavior: 'smooth' });
                   }
                }}
                style={{ width: '100%', padding: '32px', textAlign: 'center', background: 'var(--bg-input)', border: '1px dashed var(--accent-gold)', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                onMouseOver={e => e.currentTarget.style.background='var(--bg-surface)'}
                onMouseOut={e => e.currentTarget.style.background='var(--bg-input)'}
             >
                <span style={{ fontSize: '32px', display: 'block', marginBottom: '12px' }}>💞</span>
                <p style={{ color: 'var(--text-main)', fontSize: '18px', fontWeight: 'bold', margin: '0 0 8px', fontFamily: 'var(--font-serif)' }}>
                  {t("A partner Kundali is required. Please add a partner")}
                </p>
             </button>
          ) : calculating ? (
        <div style={{ padding: '40px 0', display: 'flex', justifyContent: 'center', width: '100%' }}>
           {UniversalLoader ? <UniversalLoader /> : (
              <div style={{ textAlign: 'center', color: 'var(--accent-gold)', fontStyle: 'italic' }}>
                {t("Consulting Ephemeris Transits for")} {t(selectedEvent)}...
              </div>
           )}
        </div>
      ) : Object.keys(greenDaysMap).length === 0 ? (
         <div style={{ padding: '32px', textAlign: 'center', background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px' }}>
            <span style={{ fontSize: '32px', display: 'block', marginBottom: '12px' }}>🪐</span>
            <p style={{ color: 'var(--text-main)', fontSize: '16px', margin: 0 }}>{t("No auspicious alignments found for this event in the next 365 days.")}</p>
            <p style={{ color: 'var(--text-muted)', fontSize:  16, marginTop: '8px' }}>{t("Try a different event or adjust the planetary context.")}</p>
         </div>
      ) : (
         <div style={{ marginTop: '16px', animation: 'fadeIn 0.4s ease' }}>
            {(() => {
                const today = new Date();
                const d = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
                
                const mName = MONTH_NAMES[d.getMonth()];
                const yr = d.getFullYear();
                const monthPrefix = `${yr}-${String(d.getMonth()+1).padStart(2,'0')}`;
                
                const daysInMonth = new Date(yr, d.getMonth() + 1, 0).getDate();
                const firstDayIndex = d.getDay();
                
                const blanks = Array.from({ length: firstDayIndex }).map((_, i) => <div key={`blank-${i}`} style={{ padding: '12px' }} />);
                
                const days = Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const dateStr = `${monthPrefix}-${String(dayNum).padStart(2,'0')}`;
                  const dayData = greenDaysMap[dateStr];
                  const isActive = selectedDateStr === dateStr;
                  
                  let bgColor = 'var(--bg-card)';
                  let border = '1px solid var(--border-light)';
                  let color = 'var(--text-muted)';
                  
                  if (dayData) {
                      if (dayData.tier === 'green') {
                         bgColor = 'var(--accent-green, #10B981)'; 
                         color = '#fff';
                         border = 'none';
                      } else if (dayData.tier === 'yellow') {
                         bgColor = 'var(--accent-gold)'; 
                         color = 'var(--bg-surface)';
                         border = 'none';
                      }
                  }
                  
                  if (isActive) {
                      border = '2px solid #fff';
                      bgColor = dayData ? bgColor : 'var(--bg-input)';
                      color = dayData ? color : 'var(--text-main)';
                  }
            
                  return (
                     <button 
                       key={dateStr}
                       onClick={() => dayData ? handleDateClick(dateStr) : null}
                       disabled={!dayData}
                       style={{
                          width: '100%', aspectRatio: '1', borderRadius: '8px', border, background: bgColor, color,
                          cursor: dayData ? 'pointer' : 'default', padding: '0',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: dayData ? 'bold' : 'normal', fontSize: '15px',
                          transition: 'all 0.2s',
                          boxShadow: isActive ? '0 0 12px rgba(255,255,255,0.4)' : (dayData ? '0 2px 4px rgba(0,0,0,0.2)' : 'none'),
                          opacity: dayData ? 1 : 0.3
                       }}
                       title={dayData ? `Score: ${dayData.score}` : undefined}
                     >
                       {dayNum}
                     </button>
                  )
                });
            
                const gridCells = [...blanks, ...days];
            
                return (
                   <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                         <button onClick={() => setMonthOffset(m => Math.max(0, m - 1))} disabled={monthOffset === 0} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', color: monthOffset === 0 ? 'var(--text-muted)' : 'var(--accent-gold)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: monthOffset === 0 ? 'default' : 'pointer', transition: 'all 0.2s' }}>{"<"}</button>
                         <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '20px', fontFamily: 'var(--font-serif)' }}>{t(mName)} {yr}</h3>
                         <button onClick={() => setMonthOffset(m => Math.min(11, m + 1))} disabled={monthOffset === 11} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', color: monthOffset === 11 ? 'var(--text-muted)' : 'var(--accent-gold)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: monthOffset === 11 ? 'default' : 'pointer', transition: 'all 0.2s' }}>{">"}</button>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', marginBottom: '12px' }}>
                         {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(w => (
                             <strong key={w} style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{t(w)}</strong>
                         ))}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                         {gridCells}
                      </div>
                      
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', marginTop: '24px', fontSize: '12px', color: 'var(--text-muted)' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                             <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--accent-green, #10B981)' }}></div> 
                             {t("Highly Auspicious")}
                          </span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                             <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--accent-gold)' }}></div> 
                             {t("Favorable")}
                          </span>
                      </div>
                   </div>
                );
            })()}
         </div>
      )}

      {selectedDateStr && aiAnalysis && (
         <div id="muhurat-analysis-scroll-target" style={{
            marginTop: '24px', background: 'var(--bg-input)', padding: '24px', 
            borderRadius: '12px', border: '1px solid var(--accent-gold)',
            animation: 'fadeIn 0.3s ease'
         }}>
             <h4 style={{ margin: '0 0 8px', color: 'var(--accent-gold)', fontSize: '18px', fontFamily: 'var(--font-serif)' }}>
                {t("Auspicious Hours for")} {new Date(selectedDateStr).toLocaleDateString(lang, {weekday:'long', month:'long', day:'numeric'})}
             </h4>
             <p style={{ margin: '0 0 16px', color: 'var(--text-main)', fontSize: '16px', fontWeight: 'bold' }}>
                {t("Recommended Window:")} {aiAnalysis.timeBlock}
             </p>

             <div style={{ 
                background: 'var(--bg-surface)', padding: '20px', borderRadius: '8px', 
                borderLeft: '4px solid var(--accent-gold)', fontSize: '14px', lineHeight: 1.6
             }}>
                <div style={{ display: 'flex', gap: '24px', marginBottom: '16px', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                   <div><strong>{t("Transit Nakshatra:")}</strong> {greenDaysMap[selectedDateStr].nakshatraIndex !== undefined ? (L_NAKS[lang] || L_NAKS.en)[greenDaysMap[selectedDateStr].nakshatraIndex] : greenDaysMap[selectedDateStr].nakshatra}</div>
                   <div><strong>{t("Transit Tithi:")}</strong> {t(greenDaysMap[selectedDateStr].tithi)}</div>
                   <div><strong>{t("Hourly Ascendant:")}</strong> {aiAnalysis.lagnaSignIndex !== undefined ? (L_RASHI[lang] || L_RASHI.en)[aiAnalysis.lagnaSignIndex] : aiAnalysis.lagnaSign}</div>
                </div>
                
                <div style={{ color: 'var(--text-main)' }}>
                   {aiAnalysis.loading ? (
                      <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center' }}>
                         {UniversalLoader ? <UniversalLoader /> : <span style={{ color: 'var(--accent-gold)' }}>{t("Astrologer analyzing alignment...")}</span>}
                      </div>
                   ) : aiAnalysis.error ? (
                      <span style={{ color: '#ef4444' }}>{t("Unable to generate astrological guidance.")}</span>
                   ) : (
                      <div style={{ fontFamily: 'var(--font-serif)', fontSize: '14px' }} dangerouslySetInnerHTML={{ __html: aiAnalysis.text?.replace(/\n/g, '<br/>') || '' }} />
                   )}
                 </div>
              </div>
           </div>
        )}
        </>
      )}
        </div>
      </div>
    </div>
  );
}
