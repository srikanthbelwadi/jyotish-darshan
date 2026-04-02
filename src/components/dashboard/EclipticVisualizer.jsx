import React from 'react';

export const EclipticChart = ({ hue, pillarId, t, K }) => {
   const RASHIS = ['Mesha ♈','Vrish ♉','Mith ♊','Kark ♋','Simha ♌','Kanya ♍','Tula ♎','Vrish ♏','Dhanu ♐','Makar ♑','Kumbh ♒','Meen ♓'];
   const NAKSHATRAS = ['Aswini', 'Bharani', 'Krittika', 'Rohini', 'Mrigasira', 'Ardra', 'Punarvasu', 'Pushya', 'Aslesha', 'Magha', 'P.Phal', 'U.Phal', 'Hasta', 'Chitra', 'Swati', 'Visakha', 'Anuradha', 'Jyeshtha', 'Mula', 'P.Ashadha', 'U.Ashadha', 'Sravana', 'Dhanishta', 'Satabhisha', 'P.Bhadra', 'U.Bhadra', 'Revati'];

   const PLANET_KEYS = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'];
   const PLANET_ABBR = { sun: 'Su', moon: 'Mo', mars: 'Ma', mercury: 'Me', jupiter: 'Ju', venus: 'Ve', saturn: 'Sa', rahu: 'Ra', ketu: 'Ke' };
   
   const sum = [...(pillarId||'x')].reduce((a,c)=>a+c.charCodeAt(0),0);
   const p1Key = PLANET_KEYS[sum % PLANET_KEYS.length];
   const p2Key = PLANET_KEYS[(sum + 3) % PLANET_KEYS.length];

   let rashi1 = -1, rashi2 = -1;
   if (K?.planets) {
       const p1 = K.planets.find(p => p.key === p1Key);
       const p2 = K.planets.find(p => p.key === p2Key);
       if (p1) rashi1 = p1.rashi;
       if (p2) rashi2 = p2.rashi;
   }

  return (
    <svg className="responsive-svg" width="100%" viewBox="0 0 500 500" style={{ filter: `hue-rotate(${hue}deg) drop-shadow(0 0 20px rgba(255,215,0,0.3))`, maxWidth: '400px', overflow: 'visible' }}>
       <circle cx="250" cy="250" r="230" fill="none" stroke="var(--text-muted)" strokeWidth="1" strokeDasharray="2 2" opacity="0.4" />
       <circle cx="250" cy="250" r="190" fill="none" stroke="var(--text-muted)" strokeWidth="2" opacity="0.6" />
       <circle cx="250" cy="250" r="150" fill="none" stroke="var(--accent-gold)" strokeWidth="1" />
       
       {RASHIS.map((rashiDefault, i) => {
         const aAngle = i * 30 * (Math.PI/180);
         const x1 = 250 + 150 * Math.cos(aAngle), y1 = 250 + 150 * Math.sin(aAngle);
         const x2 = 250 + 190 * Math.cos(aAngle), y2 = 250 + 190 * Math.sin(aAngle);
         
         const aMid = (i * 30 + 15) * (Math.PI/180);
         const xText = 250 + 170 * Math.cos(aMid), yText = 250 + 170 * Math.sin(aMid);
         const isRashiHighlighted = (i === rashi1 || i === rashi2);
         const SYMBOLS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
         const rashiStr = t(`astro.rashis.${i}`, { defaultValue: rashiDefault.split(' ')[0] }) + ' ' + SYMBOLS[i];

         return (
           <g key={`r-${i}`}>
             <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--text-muted)" strokeWidth="1" opacity="0.5" />
             {isRashiHighlighted && <circle cx={xText} cy={yText} r="16" fill="var(--accent-gold)" opacity="0.3" filter="drop-shadow(0 0 5px #ffd700)" />}
             <text x={xText} y={yText} fill={isRashiHighlighted ? "#fff" : "var(--text-main)"} fontSize="11" fontWeight="bold" textAnchor="middle" dominantBaseline="middle" opacity={isRashiHighlighted ? 1 : 0.7} letterSpacing="0.5">{rashiStr}</text>
           </g>
         )
       })}

       {NAKSHATRAS.map((nakDefault, i) => {
         const a1 = i * (360/27) * (Math.PI/180);
         const x1 = 250 + 190 * Math.cos(a1), y1 = 250 + 190 * Math.sin(a1);
         const x2 = 250 + 230 * Math.cos(a1), y2 = 250 + 230 * Math.sin(a1);
         
         const aMidDeg = i * (360/27) + (360/54);
         const aMid = aMidDeg * (Math.PI/180);
         const xText = 250 + 210 * Math.cos(aMid);
         const yText = 250 + 210 * Math.sin(aMid);
         
         let rot = aMidDeg;
         if (rot > 90 && rot < 270) rot += 180;
         
         const nakStr = t(`astro.nakshatras.${i}`, { defaultValue: nakDefault });

         return (
           <g key={`n-${i}`}>
             <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--text-main)" strokeWidth="1" strokeDasharray="2 2" opacity="0.4"/>
             <text x={xText} y={yText} transform={`rotate(${rot}, ${xText}, ${yText})`} fill="var(--text-muted)" fontSize="9" fontWeight="bold" textAnchor="middle" dominantBaseline="middle" letterSpacing="0.5">{nakStr.slice(0, 8)}</text>
           </g>
         )
       })}

       {(K?.planets || []).map((pl) => {
          const ang = pl.lon * (Math.PI/180);
          const r = 125;
          const isHighlighted = (pl.key === p1Key || pl.key === p2Key);
          const abbr = PLANET_ABBR[pl.key] || pl.key;
          
          const labelDist = isHighlighted ? 22 : 18; 
          const textX = labelDist * Math.cos(ang);
          const textY = labelDist * Math.sin(ang);
          
          const lineEndX = textX * 0.65;
          const lineEndY = textY * 0.65;
          
          return <g key={pl.key} transform={`translate(${250+r*Math.cos(ang)}, ${250+r*Math.sin(ang)})`}>
            <line x1="0" y1="0" x2={lineEndX} y2={lineEndY} stroke={isHighlighted ? "var(--accent-gold)" : "var(--text-muted)"} strokeWidth={isHighlighted ? 1.5 : 1} strokeDasharray={isHighlighted ? "" : "2 2"} opacity="0.8" />
            
            {isHighlighted ? (
                <>
                <circle r="5" fill="var(--bg-app)" stroke="var(--accent-gold)" strokeWidth="2" filter="drop-shadow(0 0 10px #ffd700)" />
                <text x={textX} y={textY} fill="#fff" fontSize="18" fontWeight="bold" textAnchor="middle" dominantBaseline="middle" style={{ textShadow: '0 2px 6px rgba(0,0,0,0.8), 0 0 8px #ffd700' }} dy="1">{abbr}</text>
                </>
            ) : (
                <>
                <circle r="3" fill="var(--bg-input)" stroke="var(--accent-gold)" strokeWidth="1" opacity="0.7" />
                <text x={textX} y={textY} fill="var(--text-main)" fontSize="13" fontWeight="bold" textAnchor="middle" dominantBaseline="middle" opacity="0.85" style={{ textShadow: '0 2px 4px var(--bg-surface)' }} dy="1">{abbr}</text>
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
