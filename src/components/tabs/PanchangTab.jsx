import React, { useState, useEffect, useMemo, useRef } from 'react';
import { usePreferences } from '../../contexts/PreferencesContext';
import { useSync } from '../../contexts/SyncContext';
import { fetchCloudDepartedSouls } from '../../firebase';
import MemorialSettings from '../profile/MemorialSettings';
function formatTime(decHours) {
  if (!decHours || isNaN(decHours)) return "--:--";
  let h = Math.floor(decHours);
  let m = Math.round((decHours - h) * 60);
  if (m === 60) { h += 1; m = 0; }
  let ap = "AM";
  if (h >= 12) { ap = "PM"; if (h > 12) h -= 12; }
  if (h === 0) h = 12;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ap}`;
}
import { DYNAMIC_STRINGS } from '../../i18n/dynamicTranslations';

const SAMVATSARAS = [
  "Prabhava", "Vibhava", "Shukla", "Pramoda", "Prajapathi", "Angirasa", "Shrimukha", "Bhava", "Yuva", "Dhatri",
  "Ishvara", "Bahudhanya", "Pramathi", "Vikrama", "Vrushapraja", "Chitrabhanu", "Subhanu", "Tarana", "Parthiva", "Vyaya",
  "Sarvajit", "Sarvadhari", "Virodhi", "Vikruti", "Khara", "Nandana", "Vijaya", "Jaya", "Manmatha", "Durmukha",
  "Hevilambi", "Vilambi", "Vikari", "Sharvari", "Plava", "Shubhakrut", "Shobhakrut", "Krodhi", "Vishvavasu", "Parabhava",
  "Plavanga", "Kilaka", "Saumya", "Sadharana", "Virodhikrut", "Paridhavi", "Pramadi", "Ananda", "Rakshasa", "Nala",
  "Pingala", "Kalayukti", "Siddharthi", "Raudra", "Durmati", "Dundubhi", "Rudhirodgari", "Raktaksha", "Krodhana", "Akshaya"
];

const NAKSHATRAS = ["Ashvini", "Bharani", "Krittika", "Rohini", "Mrigashirsha", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"];
const YOGAS = ["Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma", "Dhriti", "Shula", "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyan", "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"];
const RASHIS = ["Aries (Mesha)", "Taurus (Vrishabha)", "Gemini (Mithuna)", "Cancer (Karka)", "Leo (Simha)", "Virgo (Kanya)", "Libra (Tula)", "Scorpio (Vrishchika)", "Sagittarius (Dhanu)", "Capricorn (Makara)", "Aquarius (Kumbha)", "Pisces (Meena)"];
const MASAS = ["Chaitra", "Vaishakha", "Jyeshtha", "Ashadha", "Shravana", "Bhadrapada", "Ashvina", "Kartika", "Margashirsha", "Pausha", "Magha", "Phalguna"];

const KARANA_LIST = ["Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti"];
function getKaranaName(kIndex) {
  if (kIndex === 0) return "Kintughna";
  if (kIndex >= 57) {
    if (kIndex === 57) return "Shakuni";
    if (kIndex === 58) return "Chatushpada";
    if (kIndex === 59) return "Naga";
  }
  return KARANA_LIST[(kIndex - 1) % 7];
}

function getSamvatsara(year) {
  const offset = (year - 1987 + 6000) % 60;
  return SAMVATSARAS[offset];
}

export default function PanchangTab() {
  const { lang } = usePreferences();
  const t = (key, defaultText) => {
    return (DYNAMIC_STRINGS[lang] || DYNAMIC_STRINGS.en)[key] || DYNAMIC_STRINGS.en[key] || defaultText;
  };
  const { user } = useSync();
  const [currentDate, setCurrentDate] = useState(new Date());
  const detailsRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [isMemorialModalOpen, setIsMemorialModalOpen] = useState(false);
  const [departedSouls, setDepartedSouls] = useState([]);
  const [livingProfiles, setLivingProfiles] = useState([]);
  const [location, setLocation] = useState(null);
  
  const [selectedDay, setSelectedDay] = useState(null);

  // Ask for location purely for Muhurat accuracy
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        err => console.warn("Location access denied. Using fallback coordinates.")
      );
    }
  }, []);

  useEffect(() => {
    if (user?.uid) {
      fetchCloudDepartedSouls(user.uid).then(d => setDepartedSouls(d || []));
      try {
        const saved = localStorage.getItem('jd_profiles');
        if (saved) setLivingProfiles(JSON.parse(saved).filter(p => !p.isDeleted));
      } catch(e){}
    }
  }, [user, isMemorialModalOpen]); 

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    if (scrollContainerRef.current) scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
  };
  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    if (scrollContainerRef.current) scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
  };

  const [calendarDays, setCalendarDays] = useState([]);

  useEffect(() => {
    async function load() {
       const lat = location ? location.lat : 28.6139; // New Delhi fallback
       const lng = location ? location.lng : 77.2090;
       
       const days = [];
       for (let i = 0; i < firstDayIndex; i++) days.push(null);

       try {
           const res = await fetch('/api/panchang', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({
                   action: 'computeMonthlyCalendar',
                   params: { lat, lng, daysInMonth, year, month, livingProfiles, departedSouls }
               })
           });
           if (!res.ok) throw new Error('Panchang fetch failed');
           const computedStrDays = await res.json();
           
           computedStrDays.forEach(d => {
               d.dateObj = new Date(d.dateObjStr);
               days.push(d);
           });
           setCalendarDays(days);
       } catch(e) {
           console.error('Panchang load error', e);
       }
    }
    load();
  }, [year, month, livingProfiles, departedSouls, location, firstDayIndex, daysInMonth]);

  // Auto-select today
  useEffect(() => {
    if (!selectedDay && calendarDays.length > 0) {
      const todayNum = new Date().getDate();
      const thisMonth = new Date().getMonth() === month && new Date().getFullYear() === year;
      if (thisMonth) {
        const todayData = calendarDays.find(d => d && d.date === todayNum);
        if (todayData) setSelectedDay(todayData);
      } else {
        const firstValid = calendarDays.find(d => d !== null);
        if (firstValid) setSelectedDay(firstValid);
      }
    }
  }, [calendarDays, month, year]);

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-layer-1)', borderRadius: 12 }}>
        <h2 style={{ color: 'var(--accent-gold)' }}>🔒 Login Required</h2>
        <p style={{ color: 'var(--text-muted)' }}>The personalized Drik Panchang securely syncs your family's astrological records. Please sign in to access this feature.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '10px', boxSizing: 'border-box', overflowX: 'hidden' }}>
      {/* Header Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 15 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
            <button onClick={handlePrevMonth} className="lux-btn" style={{ padding: '8px 15px', background: 'var(--bg-layer-2)', color: 'var(--text-main)' }}>←</button>
            <h2 style={{ margin: 0, color: 'var(--text-main)', fontSize: 20 }}>
                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h2>
            <button onClick={handleNextMonth} className="lux-btn" style={{ padding: '8px 15px', background: 'var(--bg-layer-2)', color: 'var(--text-main)' }}>→</button>
        </div>
        
        <button 
          onClick={() => setIsMemorialModalOpen(true)}
          className="lux-btn" 
          style={{ background: 'transparent', border: '1px solid var(--accent-gold)', color: 'var(--accent-gold)', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}
        >
          🕊️ {t("pc.ancestors", "Ancestors & Memorials")}
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontStyle: 'italic' }}>
        <span>{t("pc.swipeHint", "Swipe calendar ↔")}</span>
      </div>

      <div ref={scrollContainerRef} style={{ background: 'var(--bg-layer-1)', borderRadius: 12, border: '1px solid var(--border-light)', overflowX: 'auto', overflowY: 'hidden', WebkitOverflowScrolling: 'touch' }}>
        <div style={{ minWidth: 600 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: 'var(--bg-layer-2)', borderBottom: '1px solid var(--border-light)' }}>
            {[t('pc.Sun', 'Sun'), t('pc.Mon', 'Mon'), t('pc.Tue', 'Tue'), t('pc.Wed', 'Wed'), t('pc.Thu', 'Thu'), t('pc.Fri', 'Fri'), t('pc.Sat', 'Sat')].map(day => (
                <div key={day} style={{ padding: 12, textAlign: 'center', fontWeight: 'bold', color: 'var(--text-muted)', fontSize: 13 }}>{day}</div>
            ))}
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {calendarDays.map((dayData, idx) => {
                if (!dayData) return <div key={`empty-${idx}`} style={{ minHeight: 90, borderRight: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }} />;

                const { date, panchang, birthdays, memorials } = dayData;
                const isToday = new Date().toDateString() === dayData.dateObj.toDateString();
                const isSelected = selectedDay && selectedDay.dateObj.toDateString() === dayData.dateObj.toDateString();
                const hasBirthdays = birthdays.length > 0;
                const hasMemorials = memorials.length > 0;

                let personalBg = 'transparent';
                let personalShadow = 'none';
                let gradientBar = null;
                let dayColor = 'var(--text-main)';

                if (hasBirthdays && hasMemorials) {
                    personalBg = 'rgba(236, 72, 153, 0.1)';
                    personalShadow = 'inset 0 0 0 2px #ec4899';
                    gradientBar = 'linear-gradient(90deg, #ec4899, #94a3b8)';
                    dayColor = '#f472b6';
                } else if (hasBirthdays) {
                    personalBg = 'rgba(236, 72, 153, 0.15)'; // Rose pink
                    personalShadow = 'inset 0 0 0 3px #db2777';
                    gradientBar = 'linear-gradient(90deg, #db2777, #f472b6)';
                    dayColor = '#f472b6';
                } else if (hasMemorials) {
                    personalBg = 'rgba(100, 116, 139, 0.2)'; // Slate gray
                    personalShadow = 'inset 0 0 0 3px #64748b';
                    gradientBar = 'linear-gradient(90deg, #475569, #94a3b8)';
                    dayColor = '#cbd5e1';
                }
                
                if (isToday) {
                    personalBg = 'rgba(212, 140, 50, 0.1)';
                    dayColor = 'var(--accent-gold)';
                }
                if (isSelected) {
                    personalBg = 'var(--bg-layer-2)';
                    personalShadow = 'inset 0 0 0 2px var(--accent-gold)';
                }

                return (
                    <div 
                        key={`day-${date}`}
                        onClick={() => {
                            setSelectedDay(dayData);
                            setTimeout(() => {
                                detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }, 50);
                        }}
                        style={{ 
                            minHeight: 110, 
                            borderRight: '1px solid var(--border-light)', 
                            borderBottom: '1px solid var(--border-light)',
                            padding: 8,
                            position: 'relative',
                            background: personalBg,
                            boxShadow: personalShadow,
                            cursor: 'pointer'
                        }}
                        className="panchang-cell-hover"
                    >
                        {gradientBar && !isSelected && <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 4, background: gradientBar }} />}
                        <div style={{ fontWeight: 'bold', color: dayColor, marginBottom: 5 }}>
                            {date}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 5 }}>
                            {panchang.tithi} {t("pc.tithi.name." + panchang.tithi, "")} {t("pc.paksha." + panchang.paksha, panchang.paksha)}<br />
                            {t("pc.mas." + MASAS[(panchang.solarMonth - 1) % 12], MASAS[(panchang.solarMonth - 1) % 12])} • {NAKSHATRAS[panchang.nakshatraIndex % 27] ? t("pc.nak." + NAKSHATRAS[panchang.nakshatraIndex % 27], NAKSHATRAS[panchang.nakshatraIndex % 27]) : ''}
                        </div>
                        
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {panchang.isPurnima && <span title="Purnima" style={{ fontSize: 18 }}>🌕</span>}
                            {panchang.isAmavasya && <span title="Amavasya" style={{ fontSize: 18 }}>🌑</span>}
                            {panchang.isEkadashi && <span title="Ekadashi" style={{ fontSize: 18 }}>🌿</span>}
                            {panchang.isSankashti && <span title="Sankashti" style={{ fontSize: 18 }}>🐘</span>}
                            {panchang.festivalId && <span title={t("pc.fest." + panchang.festivalId + ".n", panchang.festivalId)} style={{ fontSize: 18 }}>{panchang.festivalIcon || '🪔'}</span>}
                            {birthdays.length > 0 && <span title={`Birthday: ${birthdays.map(b=>b.name).join(', ')}`} style={{ fontSize: 18 }}>🎂</span>}
                            {memorials.length > 0 && <span title={`Varshika Tithi: ${memorials.map(m=>m.name).join(', ')}`} style={{ fontSize: 18 }}>🕊️</span>}
                        </div>
                    </div>
                );
            })}
        </div>
        </div>
      </div>

      <MemorialSettings isOpen={isMemorialModalOpen} onClose={() => setIsMemorialModalOpen(false)} />

      {/* Massive 6-Section Detail Panel */}
      {selectedDay && (
        <div ref={detailsRef} style={{ marginTop: 25, background: 'var(--bg-layer-1)', borderRadius: 12, padding: '15px', border: '1px solid var(--border-light)', boxSizing: 'border-box' }}>
          <h3 style={{ margin: '0 0 5px 0', color: 'var(--accent-gold)', fontSize: '22px', borderBottom: '1px solid var(--border-light)', paddingBottom: 15, display: 'flex', flexDirection: 'column', gap: 5 }}>
            <span>{selectedDay.dateObj.toLocaleDateString('default', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            {!location && <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 'normal' }}>{t("pc.defaultLocation", "Using Default Location (Delhi). Enable GPS for local timings.")}</span>}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 15, paddingTop: 20 }}>
            
            {/* 1. Core Elements */}
            <div className="lux-card" style={{ padding: 15 }}>
              <h4 style={{ margin: '0 0 10px', color: 'var(--text-main)', display: 'flex', gap: 8 }}><span>1.</span> {t("pc.sec1", "The Five Core Elements")}</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 13, color: 'var(--text-muted)', display: 'grid', gap: 8 }}>
                <li><strong style={{ color: 'var(--accent-gold)' }}>{t("pc.vaar", "Vaar:")}</strong> {selectedDay.dateObj.toLocaleDateString(lang === 'en' ? 'en-US' : `${lang}-IN`, { weekday: 'long' })}</li>
                <li><strong style={{ color: 'var(--accent-gold)' }}>{t("pc.tithi", "Tithi:")}</strong> {selectedDay.panchang.tithi} {t("pc.tithi.name." + selectedDay.panchang.tithi, "")} {t("pc.paksha." + selectedDay.panchang.paksha, selectedDay.panchang.paksha)}</li>
                <li><strong style={{ color: 'var(--accent-gold)' }}>{t("pc.nakshatra", "Nakshatra:")}</strong> {NAKSHATRAS[selectedDay.panchang.nakshatraIndex % 27] ? t("pc.nak." + NAKSHATRAS[selectedDay.panchang.nakshatraIndex % 27], NAKSHATRAS[selectedDay.panchang.nakshatraIndex % 27]) : 'Unknown'}</li>
                <li><strong style={{ color: 'var(--accent-gold)' }}>{t("pc.yoga", "Yoga:")}</strong> {YOGAS[selectedDay.panchang.yogaIndex % 27] ? t("pc.yog." + YOGAS[selectedDay.panchang.yogaIndex % 27], YOGAS[selectedDay.panchang.yogaIndex % 27]) : 'Unknown'}</li>
                <li><strong style={{ color: 'var(--accent-gold)' }}>{t("pc.karanas", "Karanas:")}</strong> {t("pc.kar." + getKaranaName(selectedDay.panchang.karana1), getKaranaName(selectedDay.panchang.karana1))} & {t("pc.kar." + getKaranaName(selectedDay.panchang.karana2), getKaranaName(selectedDay.panchang.karana2))}</li>
              </ul>
            </div>

            {/* 2. Planetary Positions */}
            <div className="lux-card" style={{ padding: 15 }}>
              <h4 style={{ margin: '0 0 10px', color: 'var(--text-main)', display: 'flex', gap: 8 }}><span>2.</span> {t("pc.sec2", "Time & Planetary Positions")}</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 13, color: 'var(--text-muted)', display: 'grid', gap: 8 }}>
                <li><strong style={{ color: 'var(--accent-gold)' }}>{t("pc.sunrise", "Sunrise:")}</strong> {formatTime(selectedDay.panchang.timings.rise)}</li>
                <li><strong style={{ color: 'var(--accent-gold)' }}>{t("pc.sunset", "Sunset:")}</strong> {formatTime(selectedDay.panchang.timings.set)}</li>
                <li><strong style={{ color: 'var(--accent-gold)' }}>{t("pc.sunSign", "Sun Sign:")}</strong> {t("pc.rsh." + RASHIS[selectedDay.panchang.sunSign % 12], RASHIS[selectedDay.panchang.sunSign % 12])}</li>
                <li><strong style={{ color: 'var(--accent-gold)' }}>{t("pc.moonSign", "Moon Sign:")}</strong> {t("pc.rsh." + RASHIS[selectedDay.panchang.moonSign % 12], RASHIS[selectedDay.panchang.moonSign % 12])}</li>
              </ul>
            </div>

            {/* 3. Cycle Identifiers */}
            <div className="lux-card" style={{ padding: 15 }}>
              <h4 style={{ margin: '0 0 10px', color: 'var(--text-main)', display: 'flex', gap: 8 }}><span>3.</span> {t("pc.sec3", "Calendar Identifiers")}</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 13, color: 'var(--text-muted)', display: 'grid', gap: 8 }}>
                <li><strong style={{ color: 'var(--accent-gold)' }}>{t("pc.samvat", "Samvat:")}</strong> {t("pc.samv." + getSamvatsara(year), getSamvatsara(year))}</li>
                <li><strong style={{ color: 'var(--accent-gold)' }}>{t("pc.masa", "Masa:")}</strong> {t("pc.mas." + MASAS[(selectedDay.panchang.solarMonth - 1) % 12], MASAS[(selectedDay.panchang.solarMonth - 1) % 12])}</li>
                <li><strong style={{ color: 'var(--accent-gold)' }}>{t("pc.paksha", "Paksha:")}</strong> {t("pc.paksha." + selectedDay.panchang.paksha, selectedDay.panchang.paksha)}</li>
                <li><strong style={{ color: 'var(--accent-gold)' }}>{t("pc.ritu", "Ritu:")}</strong> {t("pc.ritu." + selectedDay.panchang.ritu, selectedDay.panchang.ritu)}</li>
                <li><strong style={{ color: 'var(--accent-gold)' }}>{t("pc.ayana", "Ayana:")}</strong> {t("pc.ayana." + selectedDay.panchang.ayana, selectedDay.panchang.ayana)}</li>
              </ul>
            </div>

            {/* 4. Auspicious */}
            <div className="lux-card" style={{ padding: 15 }}>
              <h4 style={{ margin: '0 0 10px', color: 'var(--text-main)', display: 'flex', gap: 8 }}><span>4.</span> {t("pc.sec4", "Auspicious Timings")}</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 13, color: 'var(--text-muted)', display: 'grid', gap: 8 }}>
                <li><strong style={{ color: '#4ade80' }}>{t("pc.brahma", "Brahma Muhurat:")}</strong> {formatTime(selectedDay.panchang.timings.brahmaStart)} - {formatTime(selectedDay.panchang.timings.brahmaEnd)}</li>
                <li><strong style={{ color: '#4ade80' }}>{t("pc.abhijit", "Abhijit Muhurat:")}</strong> {formatTime(selectedDay.panchang.timings.abhijitStart)} - {formatTime(selectedDay.panchang.timings.abhijitEnd)}</li>
                <li><strong style={{ color: '#4ade80' }}>{t("pc.amrit", "Amrit Kaal:")}</strong> {t("pc.amritDesc", "Approx 1/8th of day active")}</li>
                <li><strong style={{ color: '#4ade80' }}>{t("pc.vijay", "Vijay Muhurat:")}</strong> {formatTime(selectedDay.panchang.timings.noon + 1)} - {formatTime(selectedDay.panchang.timings.noon + 1.8)}</li>
              </ul>
            </div>

            {/* 5. Inauspicious */}
            <div className="lux-card" style={{ padding: 15 }}>
              <h4 style={{ margin: '0 0 10px', color: 'var(--text-main)', display: 'flex', gap: 8 }}><span>5.</span> {t("pc.sec5", "Inauspicious Timings")}</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 13, color: 'var(--text-muted)', display: 'grid', gap: 8 }}>
                <li><strong style={{ color: '#f87171' }}>{t("pc.rahu", "Rahu Kaal:")}</strong> {formatTime(selectedDay.panchang.timings.rahuStart)} - {formatTime(selectedDay.panchang.timings.rahuEnd)}</li>
                <li><strong style={{ color: '#f87171' }}>{t("pc.yama", "Yamaganda:")}</strong> {formatTime(selectedDay.panchang.timings.yamaStart)} - {formatTime(selectedDay.panchang.timings.yamaEnd)}</li>
                <li><strong style={{ color: '#f87171' }}>{t("pc.guli", "Gulikai Kaal:")}</strong> {formatTime(selectedDay.panchang.timings.guliStart)} - {formatTime(selectedDay.panchang.timings.guliEnd)}</li>
              </ul>
            </div>

            {/* 6. Travel & Events */}
            <div className="lux-card" style={{ padding: 15 }}>
              <h4 style={{ margin: '0 0 10px', color: 'var(--text-main)', display: 'flex', gap: 8 }}><span>6.</span> {t("pc.sec6", "Daily Guidelines & Festivals")}</h4>
              
              {selectedDay.panchang.festivalId && (
                <div style={{ background: 'rgba(212, 140, 50, 0.15)', borderLeft: '3px solid var(--accent-gold)', padding: 10, borderRadius: 4, marginBottom: 10 }}>
                  <strong style={{ color: 'var(--accent-gold)', display: 'block', wordBreak: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}>{selectedDay.panchang.festivalIcon || '🪔'} {t("pc.fest." + selectedDay.panchang.festivalId + ".n", selectedDay.panchang.festivalId)}</strong>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', wordBreak: 'break-word', overflowWrap: 'break-word', marginTop: 4 }}>{t("pc.fest." + selectedDay.panchang.festivalId + ".d", "")}</span>
                </div>
              )}

              {selectedDay.panchang.isPurnima && (
                <div style={{ background: 'rgba(212, 140, 50, 0.1)', borderLeft: '3px solid var(--accent-gold)', padding: 10, borderRadius: 4, marginBottom: 10 }}>
                  <strong style={{ color: 'var(--accent-gold)', display: 'block' }}>🌕 {t("pc.purnima", "Purnima")}</strong>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t("pc.purnimaDesc", "The auspicious day of the full moon.")}</span>
                </div>
              )}
              {selectedDay.panchang.isAmavasya && (
                <div style={{ background: 'rgba(50, 50, 50, 0.2)', borderLeft: '3px solid #6b7280', padding: 10, borderRadius: 4, marginBottom: 10 }}>
                  <strong style={{ color: '#9ca3af', display: 'block' }}>🌑 {t("pc.amavasya", "Amavasya")}</strong>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t("pc.amavasyaDesc", "The new moon day, suitable for honoring ancestors.")}</span>
                </div>
              )}
              {selectedDay.panchang.isEkadashi && (
                <div style={{ background: 'rgba(74, 222, 128, 0.1)', borderLeft: '3px solid #4ade80', padding: 10, borderRadius: 4, marginBottom: 10 }}>
                  <strong style={{ color: '#86efac', display: 'block' }}>🌿 {t("pc.ekadashi", "Ekadashi")}</strong>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t("pc.ekadashiDesc", "Auspicious day for fasting and spiritual progress.")}</span>
                </div>
              )}
              {selectedDay.panchang.isSankashti && (
                <div style={{ background: 'rgba(248, 113, 113, 0.1)', borderLeft: '3px solid #f87171', padding: 10, borderRadius: 4, marginBottom: 10 }}>
                  <strong style={{ color: '#fca5a5', display: 'block' }}>🐘 {t("pc.sankashti", "Sankashti Chaturthi")}</strong>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t("pc.sankashtiDesc", "Auspicious day dedicated to Lord Ganesha for obstacle removal.")}</span>
                </div>
              )}

              {selectedDay.birthdays.length > 0 && (
                <div style={{ background: 'rgba(109, 40, 217, 0.15)', borderLeft: '3px solid #a78bfa', padding: 10, borderRadius: 4, marginBottom: 10 }}>
                  <strong style={{ color: '#c4b5fd', display: 'block' }}>🎂 {t("pc.livingBirthday", "Birthday (Tithi)")}</strong>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{selectedDay.birthdays.map(b => b.name).join(', ')}</span>
                </div>
              )}

              {selectedDay.memorials.length > 0 && (
                <div style={{ background: 'rgba(109, 40, 217, 0.15)', borderLeft: '3px solid #a78bfa', padding: 10, borderRadius: 4, marginBottom: 10 }}>
                  <strong style={{ color: '#c4b5fd', display: 'block' }}>🕊️ {t("pc.varshikaTithi", "Varshika Tithi (Memorial)")}</strong>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{selectedDay.memorials.map(m => m.name).join(', ')}</span>
                </div>
              )}

              {!selectedDay.panchang.festival && !selectedDay.panchang.isPurnima && !selectedDay.panchang.isAmavasya && !selectedDay.panchang.isEkadashi && !selectedDay.panchang.isSankashti && selectedDay.birthdays.length === 0 && selectedDay.memorials.length === 0 && (
                <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 5px 0' }}>{t("pc.noEvents", "No major festivals or personalized events today.")}</p>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
