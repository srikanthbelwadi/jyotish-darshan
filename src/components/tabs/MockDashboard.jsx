import React, { useState } from 'react';

// ==========================================
// 1. TRADITIONAL TRUTH: 24 PILLARS & 96+ OPTIONS
// ==========================================
const PILLAR_DATA = {
  'dharma': {
    title: 'Dharma & Duty', icon: '🪷', desc: 'D9 & 9th House Rectitude',
    prompt: 'The foundation of life rests upon Righteousness (Dharma). Which aspect of duty seeks clarity?',
    },
  'vivaha': {
    title: 'Marriage & Unions', icon: '🕉️', desc: 'D9 Navamsa Harmony',
    prompt: 'The sacred union of Vivaha binds two souls karmically. What is your inquiry regarding marital bonds?',
    },
  'dhana': {
    title: 'Wealth & Treasury', icon: '🏺', desc: 'D2 Hora Liquidity',
    prompt: 'The 2nd house and D2 chart govern accumulated treasures, gold, and grains. What is your material focus?',
    },
  'arogya': {
    title: 'Health & Ayurveda', icon: '🌿', desc: 'D6 Bodily Humors',
    prompt: 'The D6 map exposes imbalances in the Vata, Pitta, and Kapha doshas. What anomaly requires attention?',
    },
  'muhurta': {
    title: 'Auspicious Timing', icon: '⏳', desc: 'Panchanga Engine',
    prompt: 'Muhurta aligns human action with divine time. What auspicious event are you planning?',
    },
  'shanti': {
    title: 'Cosmic Remedies', icon: '🕯️', desc: 'Dosha Mitigation',
    prompt: 'Afflictions demand propitiation. Which traditional remedial measure do you seek to enact?',
    },
  'santhana': {
    title: 'Progeny & Lineage', icon: '👶', desc: 'D7 Saptamsa Matrix',
    prompt: 'The expansion of the bloodline is governed by the 5th house. What concerns the legacy of your lineage?',
    },
  'yatra': {
    title: 'Pilgrimage & Travel', icon: '🐂', desc: '12th/9th House Vectors',
    prompt: 'Travel for spiritual merit or foreign expansion requires alignment. What is the nature of the journey?',
    },
  'vyavahara': {
    title: 'Disputes & Courts', icon: '⚔️', desc: 'D30 Trimsamsa',
    prompt: 'The 6th house governs open enemies, disputes, and royal punishments. What conflict plagues you?',
    },
  'vidya': {
    title: 'Education & Wisdom', icon: '📜', desc: 'D24 Chaturvimsamsa',
    prompt: 'The pursuit of Vidya removes darkness. What intellectual or spiritual knowledge do you seek?',
    },
  'bhumi': {
    title: 'Land & Properties', icon: '🧱', desc: 'D4 Chaturthamsa',
    prompt: 'The 4th house governs fixed assets, land, and the comfort of the home. What earthly matter arises?',
    },
  'moksha': {
    title: 'Spiritual Liberation', icon: '🌌', desc: 'D60 Shashtiamsa',
    prompt: 'The ultimate aim is liberation from the cycle of birth and death. What blocks your spiritual ascent?',
    },
  'pitru': {
    title: 'Ancestral Karma', icon: '🌳', desc: 'D40 Khavedamsa',
    prompt: 'We carry the unsolved debts of our forefathers. What ancestral affliction requires propitiation?',
    },
  'gupta_dhana': {
    title: 'Sudden Gains', icon: '⛏️', desc: '8th House Mysteries',
    prompt: 'The 8th house rules unearned wealth, buried treasures, and sudden reversals. What hidden matter stirs?',
    },
  'bhratru': {
    title: 'Siblings & Courage', icon: '🏹', desc: 'D3 Drekkana',
    prompt: 'The 3rd house rules valor (Parakrama), siblings, and the right arm. Where is your courage directed?',
    },
  'mata_pita': {
    title: 'Parents & Elders', icon: '☀️', desc: 'D12 Dwadasamsa',
    prompt: 'The D12 chart reveals the absolute karmic ties to the mother and father. What is the inquiry?',
    },
  'sukha': {
    title: 'Mental Peace & Home', icon: '🌊', desc: '4th House Tranquility',
    prompt: 'True wealth is internal peace (Sukha) and a harmonious home. What disturbs the waters of the mind?',
    },
  'diksha': {
    title: 'Guru & Initiation', icon: '🪷', desc: 'D20 Vimsamsa',
    prompt: 'The D20 charts your spiritual receptivity and readiness for Mantra Diksha. Are you prepared to receive?',
    },
  'swapna': {
    title: 'Dreams & Omens', icon: '👁️', desc: 'Swapna Shastra',
    prompt: 'The subconscious mind receives signals from the astral plane. What omens are manifesting?',
    },
  'kirti': {
    title: 'Fame & Royal Favor', icon: '🌟', desc: 'Arudha Lagna Profile',
    prompt: 'The Arudha Lagna dictates the Maya—how the world perceives your status and renown. What is your public aim?',
    },
  'mrityu': {
    title: 'Dangers & Longevity', icon: '⚠️', desc: 'Maraka & Badhaka',
    prompt: 'The Maraka (Death-inflicting) houses command periods of immense physical danger. Scan for immediate threats.',
    },
  'dinacharya': {
    title: 'Daily Rites', icon: '⚙️', desc: '6th House Discipline',
    prompt: 'The 6th house requires the rhythmic discipline of daily life to suppress diseases and enemies. What needs correction?',
    },
  'sangha': {
    title: 'Community & Guilds', icon: '🕸️', desc: '11th House Gains',
    prompt: 'The 11th house dictates your ability to extract wealth and favors from large societies or guilds. What is the objective?',
    },
  'tantra': {
    title: 'Occult & Mysticism', icon: '🔮', desc: 'D8 Ashtamsa Matrix',
    prompt: 'The 8th house and D8 chart govern Tantra, hidden dimension, and the manipulation of occult energies. Do you dare look?',
    },
  'vritti': {
    title: 'Profession & Job', icon: '⚖️', desc: '10th House Karma',
    prompt: 'The 10th house governs your livelihood, daily trade, and standing before employers. What is the state of your work?',
    },
  'mitratva': {
    title: 'Friendship & Allies', icon: '🤝', desc: '11th House Bonds',
    prompt: 'The 11th house signifies the networks and companions we choose. Are your friends true allies or hidden drains?',
    },
  'poshana': {
    title: 'Food & Nourishment', icon: '🥘', desc: '2nd House Sustenance',
    prompt: 'The 2nd house rules what enters the mouth. Diet directly shapes consciousness and physical destiny. What are you consuming?',
    },
  'pratibha': {
    title: 'Talent & Craftsmanship', icon: '🎨', desc: '3rd/5th House Skills',
    prompt: 'The 3rd house governs the hands; the 5th governs creative intelligence. Are you honing your innate God-given skills?',
    },
  'sanskriti': {
    title: 'Culture & Heritage', icon: '🪔', desc: '9th House Roots',
    prompt: 'The 9th house connects you to the deep, unshakable roots of your ancestors, language, and cultural rituals. Are you tethered or drifting?',
    },
  'vahana': {
    title: 'Vehicles & Conveyance', icon: '🐎', desc: '4th House Mobility',
    prompt: 'The 4th house and Venus dictate your comfort in travel, ownership of vehicles, beasts of burden, and daily transport. Is your carriage secure?',
    },
  'vysana': {
    title: 'Vices & Weakness', icon: '🍷', desc: '6th House Afflictions',
    prompt: 'The 6th house rules Shadripu (the six enemies of the mind). Kama, Krodha, Lobha, Moha, Mada, Matsarya. Which vice has taken the reins?',
    },
  'shrama': {
    title: 'Labor & Subordinates', icon: '⛏️', desc: '6th/Saturn Karma',
    prompt: 'The 6th house dictates your relation to hard physical labor, servants, employees, and those lower in the social hierarchy. How do you manage the toil?',
    },
  'pashu': {
    title: 'Animals & Pets', icon: '🐕', desc: '6th House Companions',
    prompt: 'The management of beasts, pets, and agricultural livestock falls under the 6th house. How is your relationship with the silent beings?',
    },
  'vishrama': {
    title: 'Rest & Leisure', icon: '🏕️', desc: '12th/5th House Release',
    prompt: 'Between the grinding gears of Dharma and Artha, the soul requires Vishrama (rest) and playful release to maintain sanity. How do you retreat?',
    },
  'danam': {
    title: 'Charity & Giving', icon: '🤲', desc: '9th House Philanthropy',
    prompt: 'Wealth that is hoarded rots the soul. Danam (Charity) is the great purifier of the D2 treasury. Where must your resources flow?',
    },
  'runa': {
    title: 'Debts & Borrowing', icon: '📜', desc: '6th House Ledgers',
    prompt: 'The 6th house tracks the heavy karmic chains of Runa (Debt). Are you bound to creditors, or are others bound to you?',
    }
};

// ==========================================
// 2. CLASSICAL MODULAR COMPONENTS
// ==========================================

const MandalaHero = ({ activeTime, setActiveTime, K, t, lang }) => {
  const timescales = ['Today', 'This Lunar Phase', 'This Masa (Month)', 'This Samvatsara (Year)', 'Mahadasha'];

  const [cache, setCache] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const fetchOracle = React.useCallback(async (forceRegenerate = false) => {
    if (!K) return;

    const cacheKey = `jyotish_oracle_${activeTime}_${lang}`;
    if (!forceRegenerate) {
       // Check localStorage for 24h TTK Cache
       const stored = localStorage.getItem(cacheKey);
       if (stored) {
         try {
           const parsed = JSON.parse(stored);
           const isStale = Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000;
           if (!isStale && parsed.text) {
             setCache(prev => ({ ...prev, [activeTime]: parsed.text }));
             return;
           }
         } catch(e) {}
       }
       // Fallback to active session mapping
       if (cache[activeTime] && !forceRegenerate) return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/oracle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentDate: new Date().toString(),
          timescale: activeTime,
          lang: lang,
          kundaliData: {
             lagna: { rashi: K.lagna?.rashi, deg: K.lagna?.degFmt },
             planets: K.planets.map(p => ({
               id: p.key, sign: p.rashi, house: p.house, nak: p.nakshatraName
             })),
             dasha: K.dasha ? { maha: K.dasha.maha, antar: K.dasha.antar } : null,
             panchanga: K.panchanga ? {
               tithi: K.panchanga.tithi?.name,
               karana: K.panchanga.karana?.name,
               yoga: K.panchanga.yoga?.name,
               nakshatra: K.panchanga.nakshatra?.name
             } : null,
             ashtakavarga: K.ashtakavarga ? { SAV: K.ashtakavarga.SAV } : null
          }
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to consult the Oracle.');

      setCache(prev => ({ ...prev, [activeTime]: data.prediction }));
      localStorage.setItem(cacheKey, JSON.stringify({ text: data.prediction, timestamp: Date.now() }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeTime, K, cache]);

  React.useEffect(() => {
    fetchOracle();
  }, [activeTime, K]);

  return (
    <div className="mobile-hero-padding" style={{ background: 'var(--bg-input)', backgroundImage: 'radial-gradient(var(--bg-input) 20%, transparent 20%), radial-gradient(var(--bg-input) 20%, transparent 20%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px', padding: '50px', borderRadius: '4px', border: '2px solid var(--border-light)', marginBottom: '32px', position: 'relative', overflow: 'hidden', boxShadow: 'inset 0 0 50px var(--bg-surface), 0 10px 30px rgba(0,0,0,0.5)' }}>
      <div style={{ position: 'absolute', top: '50%', right: '-5%', transform: 'translateY(-50%)', width: '300px', height: '300px', border: '5px dashed var(--border-light)', borderRadius: '50%', animation: 'spin 120s linear infinite', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
         <div style={{ width: '200px', height: '200px', border: '10px double var(--border-light)', borderRadius: '50%', animation: 'spin 60s reverse infinite' }}></div>
      </div>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontSize: '38px', color: 'var(--accent-gold)', margin: '0 0 16px 0', fontFamily: '"Cinzel", serif', textShadow: '0 2px 4px var(--bg-surface)' }}>{t('Predictions')}</h2>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {timescales.map(ts => (
            <button key={ts} onClick={() => setActiveTime(ts)} style={{ background: activeTime === ts ? 'var(--accent-gold)' : 'var(--bg-input)', color: activeTime === ts ? 'var(--bg-input)' : 'var(--accent-gold)', border: '1px solid #ffd700', padding: '8px 16px', borderRadius: '0', fontSize: '14px', fontWeight: 'bold', fontFamily: '"Cinzel", serif', cursor: 'pointer', transition: 'all 0.2s ease', textTransform: 'uppercase' }}>{t(ts)}</button>
          ))}
        </div>
        <div style={{ background: 'var(--bg-surface)', padding: '24px', borderLeft: '4px solid #ffd700', borderRight: '4px solid #ffd700', minHeight: '100px', display: 'flex', alignItems: 'center' }}>
          {loading ? (
             <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-muted)' }}>
               <span style={{ fontSize: '24px', animation: 'spin 2s linear infinite', display: 'inline-block' }}>🪔</span>
               <span style={{ fontFamily: '"Cinzel", serif', fontSize: '16px', letterSpacing: '2px', textTransform: 'uppercase' }}>Consulting Akashic Records...</span>
             </div>
          ) : error ? (
             <p style={{ margin: 0, fontSize: '16px', color: 'var(--text-badge-red)', fontFamily: '"Cinzel", serif' }}>⚠️ {error}</p>
          ) : (
             <div style={{ position: 'relative', width: '100%', minHeight: '50px' }}>
               {typeof cache[activeTime] === 'string' ? (
                 <p style={{ margin: 0, fontSize: '18px', lineHeight: 1.6, color: 'var(--text-main)', fontFamily: 'serif', fontStyle: 'italic', paddingRight: '40px' }}>
                   "{cache[activeTime] || 'Awaiting celestial alignment...'}"
                 </p>
               ) : cache[activeTime] ? (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingRight: '40px' }}>
                   <div style={{ padding: '24px', background: 'var(--bg-input)', borderLeft: '4px solid #ffd700', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>
                     <div style={{ color: 'var(--accent-gold)', fontSize: '14px', fontWeight: 'bold', fontFamily: '"Cinzel", serif', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>{t('Predictive Trajectory')}</div>
                     <p style={{ color: 'var(--text-main)', fontSize: '18px', margin: 0, fontFamily: 'serif' }}>{cache[activeTime].period}</p>
                   </div>
                   
                   <div style={{ padding: '24px', background: 'var(--bg-input)', borderLeft: '4px solid #ffd700', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>
                     <div style={{ color: 'var(--accent-gold)', fontSize: '14px', fontWeight: 'bold', fontFamily: '"Cinzel", serif', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>{t('Astrological Basis')}</div>
                     <p style={{ color: 'var(--text-main)', fontSize: '18px', margin: 0, fontFamily: 'serif' }}>{cache[activeTime].basis}</p>
                   </div>
                   
                   <div style={{ padding: '24px', background: 'var(--bg-input)', borderLeft: '4px solid #ffd700', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>
                     <div style={{ color: 'var(--accent-gold)', fontSize: '14px', fontWeight: 'bold', fontFamily: '"Cinzel", serif', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>{t('Prophetic Assertions')}</div>
                     <p style={{ color: 'var(--text-main)', fontSize: '18px', margin: 0, fontFamily: 'serif', fontStyle: 'italic' }}>"{cache[activeTime].assertions}"</p>
                   </div>
                   
                   <div style={{ padding: '24px', background: 'var(--bg-card)', border: '1px solid var(--accent-gold)', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>
                     <div style={{ color: 'var(--accent-gold)', fontSize: '14px', fontWeight: 'bold', fontFamily: '"Cinzel", serif', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>{t('Lifestyle & Preparedness')}</div>
                     <p style={{ color: 'var(--text-main)', fontSize: '18px', margin: 0, fontFamily: 'serif' }}>{cache[activeTime].lifestyle}</p>
                   </div>
                   
                   <div style={{ padding: '24px', background: 'var(--bg-card)', border: '2px dashed var(--border-light)', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>
                     <div style={{ color: 'var(--text-main)', fontSize: '14px', fontWeight: 'bold', fontFamily: '"Cinzel", serif', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                       <span style={{ fontSize: '18px' }}>🕉️</span> {t('Shastric Mitigation')}
                     </div>
                     <p style={{ color: 'var(--text-main)', fontSize: '18px', margin: 0, fontFamily: 'serif' }}>{cache[activeTime].mitigation}</p>
                   </div>
                 </div>
               ) : (
                 <p style={{ margin: 0, fontSize: '18px', lineHeight: 1.6, color: 'var(--text-main)', fontFamily: 'serif', paddingRight: '40px' }}>
                   Awaiting celestial alignment...
                 </p>
               )}
               {cache[activeTime] && (
                 <button 
                   onClick={() => fetchOracle(true)}
                   title="Consult again (Override cache)"
                   style={{ position: 'absolute', top: '-10px', right: 0, background: 'var(--bg-surface)', border: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '16px', cursor: 'pointer', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', width: '32px', height: '32px' }}
                   onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--accent-gold)'; e.currentTarget.style.color = 'var(--accent-gold)'; e.currentTarget.style.transform = 'rotate(180deg)'; }}
                   onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.transform = 'rotate(0deg)'; }}
                 >
                   ⟳
                 </button>
               )}
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

const EclipticChart = ({ hue, pillarId, t, K }) => {
   const RASHIS = ['Mesha ♈','Vrish ♉','Mith ♊','Kark ♋','Simha ♌','Kanya ♍','Tula ♎','Vrish ♏','Dhanu ♐','Makar ♑','Kumbh ♒','Meen ♓'];
   const NAKSHATRAS = ['Aswini', 'Bharani', 'Krittika', 'Rohini', 'Mrigasira', 'Ardra', 'Punarvasu', 'Pushya', 'Aslesha', 'Magha', 'P.Phal', 'U.Phal', 'Hasta', 'Chitra', 'Swati', 'Visakha', 'Anuradha', 'Jyeshtha', 'Mula', 'P.Ashadha', 'U.Ashadha', 'Sravana', 'Dhanishta', 'Satabhisha', 'P.Bhadra', 'U.Bhadra', 'Revati'];

   // Select symbolic focus planets for this pathway pillar based on the hash
   const PLANET_KEYS = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'];
   const PLANET_ABBR = { sun: 'Su', moon: 'Mo', mars: 'Ma', mercury: 'Me', jupiter: 'Ju', venus: 'Ve', saturn: 'Sa', rahu: 'Ra', ketu: 'Ke' };
   
   const sum = [...(pillarId||'x')].reduce((a,c)=>a+c.charCodeAt(0),0);
   const p1Key = PLANET_KEYS[sum % PLANET_KEYS.length];
   const p2Key = PLANET_KEYS[(sum + 3) % PLANET_KEYS.length];

   // Highlighted rashis based on actual longitudes from computation engine
   let rashi1 = -1, rashi2 = -1;
   if (K?.planets) {
       const p1 = K.planets.find(p => p.key === p1Key);
       const p2 = K.planets.find(p => p.key === p2Key);
       if (p1) rashi1 = p1.rashi;
       if (p2) rashi2 = p2.rashi;
   }

  return (
    <svg className="responsive-svg" width="100%" viewBox="0 0 500 500" style={{ filter: `hue-rotate(${hue}deg) drop-shadow(0 0 20px rgba(255,215,0,0.3))`, maxWidth: '400px', overflow: 'visible' }}>
       {/* Structural rings */}
       <circle cx="250" cy="250" r="230" fill="none" stroke="var(--text-muted)" strokeWidth="1" strokeDasharray="2 2" opacity="0.4" />
       <circle cx="250" cy="250" r="190" fill="none" stroke="var(--text-muted)" strokeWidth="2" opacity="0.6" />
       <circle cx="250" cy="250" r="150" fill="none" stroke="var(--accent-gold)" strokeWidth="1" />
       
       {/* 12 Rashi Sectors & Text */}
       {RASHIS.map((rashi, i) => {
         const aAngle = i * 30 * (Math.PI/180);
         const x1 = 250 + 150 * Math.cos(aAngle), y1 = 250 + 150 * Math.sin(aAngle);
         const x2 = 250 + 190 * Math.cos(aAngle), y2 = 250 + 190 * Math.sin(aAngle);
         
         const aMid = (i * 30 + 15) * (Math.PI/180);
         const xText = 250 + 170 * Math.cos(aMid), yText = 250 + 170 * Math.sin(aMid);
         const isRashiHighlighted = (i === rashi1 || i === rashi2);

         return (
           <g key={`r-${i}`}>
             <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--text-muted)" strokeWidth="1" opacity="0.5" />
             {isRashiHighlighted && <circle cx={xText} cy={yText} r="16" fill="var(--accent-gold)" opacity="0.3" filter="drop-shadow(0 0 5px #ffd700)" />}
             <text x={xText} y={yText} fill={isRashiHighlighted ? "#fff" : "var(--text-main)"} fontSize="11" fontWeight="bold" textAnchor="middle" dominantBaseline="middle" opacity={isRashiHighlighted ? 1 : 0.7} letterSpacing="0.5">{rashi}</text>
           </g>
         )
       })}

       {/* 27 Nakshatras & Sectors */}
       {NAKSHATRAS.map((nak, i) => {
         // Sector line
         const a1 = i * (360/27) * (Math.PI/180);
         const x1 = 250 + 190 * Math.cos(a1), y1 = 250 + 190 * Math.sin(a1);
         const x2 = 250 + 230 * Math.cos(a1), y2 = 250 + 230 * Math.sin(a1);
         
         // Text placement
         const aMidDeg = i * (360/27) + (360/54);
         const aMid = aMidDeg * (Math.PI/180);
         const xText = 250 + 210 * Math.cos(aMid);
         const yText = 250 + 210 * Math.sin(aMid);
         
         // Readability rotation: flip text if it's upside down
         let rot = aMidDeg;
         if (rot > 90 && rot < 270) rot += 180;
         
         return (
           <g key={`n-${i}`}>
             <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--text-main)" strokeWidth="1" strokeDasharray="2 2" opacity="0.4"/>
             <text x={xText} y={yText} transform={`rotate(${rot}, ${xText}, ${yText})`} fill="var(--text-muted)" fontSize="9" fontWeight="bold" textAnchor="middle" dominantBaseline="middle" letterSpacing="0.5">{nak}</text>
           </g>
         )
       })}

       {/* Planets rendered exactly at their astronomical sidereal longitude */}
       {(K?.planets || []).map((pl) => {
          const ang = pl.lon * (Math.PI/180);
          const r = 125;
          const isHighlighted = (pl.key === p1Key || pl.key === p2Key);
          const abbr = PLANET_ABBR[pl.key] || pl.key;
          return <g key={pl.key} transform={`translate(${250+r*Math.cos(ang)}, ${250+r*Math.sin(ang)})`}>
            {isHighlighted ? (
                <>
                <line x1="0" y1="0" x2={35*Math.cos(ang)} y2={35*Math.sin(ang)} stroke="var(--accent-gold)" strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
                <circle r="18" fill="var(--accent-gold)" stroke="#fff" strokeWidth="2" filter="drop-shadow(0 0 10px #ffd700)" />
                <text fill="#000" fontSize="14" fontWeight="bold" textAnchor="middle" dominantBaseline="middle" dy="1">{abbr}</text>
                </>
            ) : (
                <>
                <circle r="12" fill="#2c0b0e" stroke="var(--accent-gold)" strokeWidth="1" opacity="0.4" />
                <text fill="var(--accent-gold)" fontSize="10" fontWeight="bold" textAnchor="middle" dominantBaseline="middle" dy="1" opacity="0.6">{abbr}</text>
                </>
            )}
          </g>
       })}
       
       <circle cx="250" cy="250" r="50" fill="var(--accent-gold)" opacity="0.1" />
       <circle cx="250" cy="250" r="10" fill="var(--accent-gold)" />
       <text x="250" y="285" fill="var(--text-muted)" fontSize="10" textAnchor="middle" letterSpacing="1">{t('VEDIC')}</text>
       <text x="250" y="300" fill="var(--text-muted)" fontSize="10" textAnchor="middle" letterSpacing="1">{t('MANDALA')}</text>
    </svg>
  );
};

const InteractionGateway = ({ targetPillar, onSelect, K, t, lang }) => {
  const data = PILLAR_DATA[targetPillar];
  const hue = [...targetPillar].reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360;
  
  const [pathwayData, setPathwayData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    fetchPathway(false);
  }, [targetPillar, data, lang]);

  const fetchPathway = async (force = false) => {
    const cacheKey = `jyotish_pathway_${targetPillar}_${lang}`;
    if (!force) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
         try {
           const parsed = JSON.parse(cached);
           if (parsed.summary && parsed.options) {
             setPathwayData(parsed);
             return;
           }
         } catch(e) {}
      }
    }
    
    if (!K) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/pathway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentDate: new Date().toString(),
          pillarId: targetPillar,
          pillarTitle: data.title,
          pillarDesc: data.desc,
          lang: lang,
          kundaliData: {
            lagna: { rashi: K.lagna?.rashi, deg: K.lagna?.degFmt },
            planets: K.planets.map(p => ({
              id: p.key, sign: p.rashi, house: p.house, nak: p.nakshatraName
            })),
            dasha: K.dasha ? { maha: K.dasha.maha, antar: K.dasha.antar } : null,
            panchanga: K.panchanga ? {
              tithi: K.panchanga.tithi?.name,
              karana: K.panchanga.karana?.name,
              yoga: K.panchanga.yoga?.name,
              nakshatra: K.panchanga.nakshatra?.name
            } : null,
            ashtakavarga: K.ashtakavarga ? { SAV: K.ashtakavarga.SAV } : null
          }
        })
      });
      const resData = await res.json();
      if(!res.ok) throw new Error(resData.error || 'Failed to sync with pathway matrix.');
      
      setPathwayData({ summary: resData.summary, options: resData.options });
      localStorage.setItem(cacheKey, JSON.stringify({ summary: resData.summary, options: resData.options, timestamp: Date.now() }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: 'var(--bg-app)', padding: '0 0 80px 0', border: '1px solid #4a151b', borderRadius: '8px', overflow: 'hidden' }}>
       {/* 1. Summary Image & Description Panel */}
       <div style={{ position: 'relative', minHeight: '400px', borderBottom: '2px solid var(--border-light)' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'var(--bg-app)' }}></div>
          
          <div className="mobile-hero-padding" style={{ position: 'relative', zIndex: 10, padding: '40px', display: 'flex', gap: '40px', flexWrap: 'wrap', alignItems: 'center', minHeight: '400px', boxSizing: 'border-box' }}>
             <div style={{ flex: '1 1 500px', minWidth: 0 }}>
               <h3 style={{ fontSize: '48px', color: 'var(--accent-gold)', margin: '0 0 16px 0', fontFamily: '"Cinzel", serif', textShadow: '0 4px 20px var(--bg-surface)' }}>{t(data.title)}</h3>
               {loading ? (
                   <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-muted)', marginBottom: '32px' }}>
                     <span style={{ fontSize: '24px', animation: 'spin 2s linear infinite', display: 'inline-block' }}>🪔</span>
                     <span style={{ fontFamily: '"Cinzel", serif', fontSize: '18px', letterSpacing: '2px', textTransform: 'uppercase' }}>{t('Synthesizing Pathway Matrix...')}</span>
                   </div>
               ) : error ? (
                   <div style={{ position: 'relative', marginBottom: '32px' }}>
                     <p style={{ color: 'var(--text-badge-red)', fontSize: '18px', fontFamily: '"Cinzel", serif' }}>⚠️ {error}</p>
                     <button onClick={() => fetchPathway(true)} style={{ position: 'absolute', top: 0, right: 0, background: 'var(--bg-surface)', border: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '16px', cursor: 'pointer', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', width: '32px', height: '32px' }}>⟳</button>
                   </div>
               ) : pathwayData ? (
                   <div style={{ position: 'relative', marginBottom: '32px' }}>
                     <p style={{ padding: '24px', background: 'var(--bg-surface)', borderLeft: '4px solid #ffd700', color: 'var(--text-main)', fontSize: '18px', fontFamily: 'serif', lineHeight: 1.8, textShadow: '0 2px 10px var(--bg-surface)', maxWidth: '800px', margin: 0, fontStyle: 'italic' }}>
                       "{pathwayData.summary}"
                     </p>
                     <button onClick={() => fetchPathway(true)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--bg-surface)', border: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '16px', cursor: 'pointer', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', width: '32px', height: '32px' }}>⟳</button>
                   </div>
               ) : (
                   <div style={{ position: 'relative', marginBottom: '32px' }}>
                     <p style={{ color: 'var(--text-main)', fontSize: '18px', fontFamily: 'serif', lineHeight: 1.8, textShadow: '0 2px 10px var(--bg-surface)', maxWidth: '800px', margin: 0 }}>
                       This sacred pathway delves deep into the <strong>{data.desc}</strong> of your existence. {data.prompt} By decoding the precise planetary transits and stellar coordinates governing this dimension within your D1 matrix, we unveil the karmic trajectory designed exclusively for you. The ancient Parashari logic binds these 6 potential realities directly to your soul's resonance.
                     </p>
                     <button onClick={() => fetchPathway(true)} style={{ position: 'absolute', top: 0, right: 0, background: 'var(--bg-surface)', border: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '16px', cursor: 'pointer', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', width: '32px', height: '32px' }}>⟳</button>
                   </div>
               )}
             </div>
             
             {/* 2. Ecliptic Visualization */}
             <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
               <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: '"Cinzel", serif', letterSpacing: '2px', marginBottom: '16px', textTransform: 'uppercase' }}>{t('Stellar Ecliptic Alignment')}</div>
               <EclipticChart hue={hue} pillarId={targetPillar} t={t} K={K} />
             </div>
          </div>
       </div>

       {/* 3. 6 Shastric Outcome Cards with Images */}
       <div className="mobile-hero-padding" style={{ padding: '60px 40px 0 40px' }}>
         {pathwayData?.options?.length > 0 && (
           <h4 style={{ color: 'var(--text-main)', fontSize: '28px', fontFamily: '"Cinzel", serif', textAlign: 'center', marginBottom: '40px', textTransform: 'uppercase', letterSpacing: '4px' }}>{t('Select an Outcome to Reveal Prophecy')}</h4>
         )}
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '32px' }}>
           {(pathwayData?.options || []).map((opt, i) => {
             const cardHue = (hue + (i * 45)) % 360;
             const cardBg = `https://images.unsplash.com/photo-1541698444083-023c97db0e21?w=800&auto=format&fit=crop`;
             return (
               <button 
                 key={opt.id} 
                 onClick={() => onSelect(opt)}
                 style={{ 
                   position: 'relative', height: '240px', overflow: 'hidden', border: '2px solid var(--border-light)', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)', 
                   display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textDecoration: 'none'
                 }}
                 onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-10px)'; e.currentTarget.style.borderColor = 'var(--accent-gold)'; e.currentTarget.style.boxShadow = '0 20px 40px var(--bg-surface), 0 0 20px rgba(255,215,0,0.2)'; e.currentTarget.querySelector('.card-bg').style.transform = 'scale(1.1)'; e.currentTarget.querySelector('.card-bg').style.opacity = '0.8'; }}
                 onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)'; e.currentTarget.querySelector('.card-bg').style.transform = 'scale(1)'; e.currentTarget.querySelector('.card-bg').style.opacity = '1'; }}
               >
                 <div className="card-bg" style={{ position: 'absolute', inset: 0, background: 'var(--bg-card)', zIndex: 0, transition: 'all 0.6s ease' }}></div>

                 <span style={{ position: 'relative', zIndex: 2, fontSize: '64px', marginBottom: '16px', filter: 'drop-shadow(0 0 20px rgba(255,215,0,0.6))', transition: 'transform 0.3s' }}>{opt.icon}</span>
                 <span style={{ position: 'relative', zIndex: 2, color: 'var(--text-main)', fontSize: '22px', fontWeight: 'bold', fontFamily: '"Cinzel", serif', textTransform: 'uppercase', textShadow: '0 4px 10px var(--bg-surface)', letterSpacing: '1px', textAlign: 'center' }}>
                   {t(opt.label)}
                 </span>
               </button>
             );
           })}
         </div>
       </div>
    </div>
  );
};
const AstrologicalRemedyBox = ({ alert, remedy, t, lang }) => (
  <div style={{ marginTop: '24px', background: 'var(--bg-card)', padding: '24px', border: '2px solid var(--border-light)', boxShadow: '0 10px 30px var(--bg-surface)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
      <span style={{ fontSize: '24px' }}>🕉️</span><h4 style={{ margin: 0, color: 'var(--accent-gold)', fontSize: '20px', fontFamily: '"Cinzel", serif' }}>{t('Shastric Mitigation Protocol')}</h4>
    </div>
    {alert && <p style={{ color: 'var(--text-badge-red)', fontSize: '15px', marginBottom: '16px', background: 'rgba(255,0,0,0.1)', padding: '12px', border: '1px solid #ff6b6b' }}><strong>{t('Dosha Identified:')}</strong> {alert}</p>}
    <p style={{ color: 'var(--text-main)', fontSize: '16px', lineHeight: 1.6, margin: 0, fontFamily: 'serif' }}><strong>{t('Prescribed Parihara (Action):')}</strong> {remedy}</p>
  </div>
);



const MandalVisualizer = ({ selectedOpt }) => {
  return (
    <div style={{ width: '100%', height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
       <div style={{ position: 'absolute', width: '220px', height: '220px', borderRadius: '50%', border: '4px dashed #b8860b', animation: 'spin 40s linear infinite' }}></div>
       <div style={{ position: 'absolute', width: '170px', height: '170px', borderRadius: '50%', border: '2px solid #ffd700', animation: 'spin 20s reverse infinite' }}></div>
       <div style={{ position: 'absolute', width: '120px', height: '120px', background: '#8b0000', borderRadius: '50%', boxShadow: '0 0 40px rgba(184, 134, 11, 0.8)' }}></div>
       <div style={{ fontSize: '70px', zIndex: 10, filter: 'drop-shadow(0 0 15px rgba(255,215,0,0.8))' }}>{selectedOpt.icon}</div>
    </div>
  );
};



const StandardPillarView = ({ pillarId, K, partnerKundali, t, lang }) => {
  const [opt, setOpt] = useState(null);

  React.useEffect(() => {
    const el = document.getElementById('mock-dashboard-top');
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    else { window.scrollTo({ top: 0, behavior: 'smooth' }); }
  }, [opt, pillarId]);
  const data = PILLAR_DATA[pillarId];

  if(!opt) return <InteractionGateway targetPillar={pillarId} onSelect={setOpt} K={K} t={t} lang={lang} />;

  return (
    <div className="responsive-grid-2" style={{ alignItems: 'start' }}>
       <div style={{ background: 'var(--bg-input)', padding: '40px', border: '2px solid var(--border-light)', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)', position: 'sticky', top: '24px' }}>
         <MandalVisualizer selectedOpt={opt} />
         {opt.timeframe && (
           <div style={{ marginTop: '32px', textAlign: 'center', background: 'var(--bg-card)', padding: '16px', border: '1px solid var(--accent-gold)' }}>
             <div style={{ color: 'var(--accent-gold)', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>{t('Predictive Trajectory')}</div>
             <div style={{ color: 'var(--text-main)', fontSize: '18px', fontFamily: '"Cinzel", serif' }}>{opt.timeframe}</div>
           </div>
         )}
       </div>
       <div>
         <div style={{ display: 'inline-block', background: 'var(--bg-card)', color: 'var(--accent-gold)', padding: '8px 16px', border: '1px solid #ffd700', fontSize: '14px', fontWeight: 'bold', fontFamily: '"Cinzel", serif', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px' }}>{t('Subject: ')} {t(opt.label)}</div>
         <h3 style={{ color: 'var(--text-main)', fontSize: '30px', marginTop: 0, marginBottom: '32px', lineHeight: 1.3, fontFamily: '"Cinzel", serif', textShadow: '0 2px 4px var(--bg-surface)' }}>{t(data.title)}</h3>
         
         <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
           {opt.paragraphs && opt.paragraphs.map((para, idx) => (
             <div key={idx} style={{ background: 'var(--bg-input)', padding: '24px', borderLeft: '4px solid #ffd700', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
               {para.subheading && (
                 <div style={{ color: 'var(--text-main)', fontSize: '16px', fontWeight: 'bold', fontFamily: '"Cinzel", serif', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <span style={{ fontSize: '20px', color: 'var(--accent-gold)' }}>✧</span> {para.subheading}
                 </div>
               )}
               <p style={{ color: 'var(--text-main)', fontSize: '18px', lineHeight: 1.7, margin: 0, fontFamily: 'serif' }}>{para.content}</p>
             </div>
           ))}
           
           {/* Fallback for old cached format */}
           {opt.prediction && !opt.paragraphs && (
             <div style={{ background: 'var(--bg-input)', padding: '24px', borderLeft: '4px solid #ffd700', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>
               <div style={{ color: 'var(--text-main)', fontSize: '14px', fontWeight: 'bold', fontFamily: '"Cinzel", serif', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <span style={{ fontSize: '18px' }}>👁️</span> {t('Prophetic Unfoldment')}
               </div>
               <p style={{ color: 'var(--text-main)', fontSize: '18px', lineHeight: 1.7, margin: 0, fontFamily: 'serif' }}>{opt.prediction}</p>
             </div>
           )}
         </div>

         <AstrologicalRemedyBox remedy={opt.mitigation || opt.remedy} alert={null} t={t} lang={lang} />
       </div>
    </div>
  );
};

const FullScreenWrapper = ({ title, onBack, children, t, lang }) => (
  <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
    <button onClick={onBack} style={{ background: 'var(--bg-card)', color: 'var(--accent-gold)', border: '1px solid #ffd700', padding: '12px 28px', cursor: 'pointer', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '16px', fontFamily: '"Cinzel", serif', transition:'all 0.2s', textTransform:'uppercase' }} onMouseOver={e=>{e.currentTarget.style.background='var(--bg-input)'}} onMouseOut={e=>{e.currentTarget.style.background='var(--bg-card)'}}>
      {t('← Return to Main Mandala')}
    </button>
    <div style={{ background: 'var(--bg-card)', border: '2px solid var(--border-light)', padding: '2px' }}>
      <div className="mobile-hero-padding" style={{ border: '1px dashed rgba(184, 134, 11, 0.5)', padding: '60px' }}>{children}</div>
    </div>
  </div>
);

// ==========================================
// 3. MAIN DASHBOARD AGGREGATOR
// ==========================================
export const MockDashboard = ({ onOpenJyotishDesk, user, onRequireLogin, K, partnerKundali, t, lang }) => {
  const [activeTime, setActiveTime] = useState('This Masa (Month)');
  const [activeView, setActiveView] = useState('grid'); 

  if (activeView !== 'grid') {
    const data = PILLAR_DATA[activeView];
    return (
      <div id="mock-dashboard-top" style={{ maxWidth: '1300px', margin: '0 auto', padding: '40px 24px' }}>
        <FullScreenWrapper title={`${data.icon} ${t(data.title)}`} onBack={() => setActiveView('grid')} t={t} lang={lang}>
          <StandardPillarView pillarId={activeView} K={K} partnerKundali={partnerKundali} t={t} lang={lang} />
        </FullScreenWrapper>
      </div>
    );
  }

  return (
    <div id="mock-dashboard-top" style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 24px', fontFamily: 'serif', paddingBottom: '140px', background: 'var(--bg-app)', minHeight: '100vh' }}>
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&display=swap" rel="stylesheet" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '2px solid var(--border-light)', paddingBottom: '20px', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h2 style={{ fontSize: '42px', margin: 0, fontFamily: '"Cinzel", serif', color: 'var(--accent-gold)', textShadow: '0 2px 4px var(--bg-surface)' }}>{t('Life Paths')}</h2>
          {partnerKundali && (
            <div style={{ background: 'var(--bg-input)', border: '1px solid var(--accent-gold)', padding: '6px 12px', borderRadius: '4px', color: 'var(--accent-gold)', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>💞</span> {t('Synastry Active')}
            </div>
          )}
        </div>
        <button onClick={onOpenJyotishDesk} style={{background:'var(--accent-gold)', border:'none', color:'var(--bg-app)', padding:'12px 28px', cursor:'pointer', borderRadius:'4px', fontFamily:'"Cinzel", serif', fontSize:'16px', fontWeight:'bold', display:'flex', alignItems:'center', gap:'8px', transition:'all 0.2s', textTransform:'uppercase', letterSpacing:'1px', whiteSpace:'nowrap', boxShadow: '0 4px 15px rgba(255,215,0,0.4)'}} onMouseOver={e=>{e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 6px 20px rgba(255,215,0,0.6)'}} onMouseOut={e=>{e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='0 4px 15px rgba(255,215,0,0.4)'}}>
          {t('Reveal Kundali ➔')}
        </button>
      </div>
      <MandalaHero activeTime={activeTime} setActiveTime={setActiveTime} K={K} t={t} lang={lang} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
        {Object.entries(PILLAR_DATA).map(([key, data]) => (
          <div 
            key={key} onClick={() => { 
              if(!user) { onRequireLogin(); return; }
              setActiveView(key); 
              setTimeout(() => {
                const el = document.getElementById('mock-dashboard-top');
                if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
                else { window.scrollTo({ top: 0, behavior: 'smooth' }); }
              }, 50); 
            }}
            style={{ background: 'var(--bg-input)', padding: '36px 24px', border: '1px solid #b8860b', cursor: 'pointer', transition: 'all 0.3s', position:'relative', overflow:'hidden', display: 'flex', flexDirection: 'column', boxShadow: 'inset 0 0 10px var(--bg-surface)' }}
            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.background = 'var(--bg-input)'; e.currentTarget.style.boxShadow = '0 10px 30px var(--bg-surface), inset 0 0 10px var(--bg-surface)'; }}
            onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = 'var(--bg-input)'; e.currentTarget.style.boxShadow = 'inset 0 0 10px var(--bg-surface)'; }}
          >
            <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '140px', opacity: 0.03, pointerEvents: 'none' }}>{data.icon}</div>
            <div style={{ fontSize: '50px', marginBottom: '20px', filter: 'drop-shadow(0 0 15px rgba(255,215,0,0.3))' }}>{data.icon}</div>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '22px', color: 'var(--accent-gold)', fontFamily: '"Cinzel", serif' }}>{t(data.title)}</h3>

          </div>
        ))}
      </div>


    </div>
  );
};
