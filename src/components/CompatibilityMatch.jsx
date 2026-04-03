import React, { useState, useEffect } from 'react';
import { L_NAKS, L_RASHI, localizePanchang } from '../App.jsx';
import { useSync } from '../contexts/SyncContext.jsx';

export default function CompatibilityMatch({ primaryKundali, partnerKundali, t=(x)=>x, lang }) {
  const { user } = useSync();
  const [match, setMatch] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
       try {
          const token = user ? await user.getIdToken() : '';
          const res = await fetch('/api/synastry', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json', ...(token && {'Authorization': `Bearer ${token}`}) },
             body: JSON.stringify({ primaryKundali, partnerKundali })
          });
          if(!res.ok) throw new Error("Failed to consult planetary compatibility from cloud.");
          setMatch(await res.json());
       } catch(e) { setError(e.message); }
    }
    if (primaryKundali && partnerKundali) load();
  }, [primaryKundali, partnerKundali, user]);

  const txt = (key, fallback) => {
    const r = t(key, lang);
    return r === key ? (fallback || key) : r;
  };

  if (error) return <div style={{padding: '2rem', textAlign:'center', color:'var(--dosha-red)'}}>Celestial Server Error: {error}</div>;
  if (!match) return <div style={{padding: '2rem', textAlign:'center', color:'var(--text-muted)'}}>Consulting the cloud for cosmic synergy...</div>;

  const translatedNakshatras = L_NAKS[lang] || L_NAKS.en;
  const p1NakTranslated = match.p1.nakshatraIndex !== undefined ? translatedNakshatras[match.p1.nakshatraIndex] : match.p1.nakshatra;
  const p2NakTranslated = match.p2.nakshatraIndex !== undefined ? translatedNakshatras[match.p2.nakshatraIndex] : match.p2.nakshatra;

  const translatedRashis = L_RASHI[lang] || L_RASHI.en;
  const p1RashiTranslated = match.p1.rashiIndex !== undefined ? translatedRashis[match.p1.rashiIndex] : match.p1.rashi;
  const p2RashiTranslated = match.p2.rashiIndex !== undefined ? translatedRashis[match.p2.rashiIndex] : match.p2.rashi;

  return (
    <div style={{
      position: 'relative',
      background: 'var(--bg-card)', border: '1px solid var(--accent-gold)', 
      borderRadius: '12px', padding: '30px', marginTop: '20px', color: 'var(--text-main)',
      boxShadow: '0 8px 32px rgba(212, 175, 55, 0.1)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px', marginBottom: '24px' }}>
        <h3 className="serif" style={{ margin: 0, color: 'var(--accent-gold)', fontSize: '24px', fontFamily: 'var(--font-serif)', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          💞 {txt('comp.milan', 'Compatibility')}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            padding: '8px 16px', borderRadius: '20px', border: '1px solid var(--accent-gold)',
            fontSize: '18px', fontWeight: 'bold', color: 'var(--accent-gold)', background: 'var(--bg-dark)', fontFamily: 'var(--font-serif)'
          }}>
            {match.ashtaKuta.totalScore} / 36
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '20px', marginBottom: '20px' }}>
        
        {/* P1 METADATA */}
        <div style={{ background: 'var(--bg-surface)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-light)', textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
          <h4 style={{ margin: '0 0 12px', color: 'var(--text-main)', fontSize: '20px', fontFamily: 'var(--font-serif)' }}>{match.p1.name === 'User' ? txt('comp.user', 'User') : match.p1.name}</h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '18px', color: 'var(--text-secondary)', fontSize: '13px', fontFamily: 'var(--font-serif)', alignItems: 'center' }}>
            <div>📅 {new Date(primaryKundali.input.year, primaryKundali.input.month - 1, primaryKundali.input.day).toLocaleDateString(lang === 'en' ? 'en-IN' : lang, { day: 'numeric', month: 'long', year: 'numeric' })}, {primaryKundali.input.tob || String(primaryKundali.input.hour).padStart(2,'0')+':'+String(primaryKundali.input.minute).padStart(2,'0')}</div>
            <div style={{display:'flex', gap: 6}}><span> {primaryKundali.input.lat?.toFixed(3)}°N, {primaryKundali.input.lng?.toFixed(3)}°E</span></div>
            <div>🔹 {txt('ayanamsa', 'Ayanamsa')}: {primaryKundali.ayanamsaDMS}</div>
            <div>♑ {txt('lagna', 'Lagna')}: {(L_RASHI[lang] || L_RASHI.en)[primaryKundali.lagna?.rashi]} {primaryKundali.lagna?.degFmt}</div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '18px', flex: 1 }}>
            {[
              { k: 'comp.moonR', label: 'Moon Sign', v: p1RashiTranslated },
              { k: 'comp.nak', label: 'Nakshatra', v: p1NakTranslated },
              { k: 'tithi', label: 'Tithi', v: localizePanchang(primaryKundali.panchang, lang)?.tithi?.split(' (')[0] },
              { k: 'vara', label: 'Vara', v: localizePanchang(primaryKundali.panchang, lang)?.vara },
              { k: 'yoga', label: 'Yoga', v: localizePanchang(primaryKundali.panchang, lang)?.yoga },
              { k: 'karana', label: 'Karana', v: localizePanchang(primaryKundali.panchang, lang)?.karana }
            ].map((item, idx) => (
              <div key={idx} style={{ border: '1px solid var(--border-light)', borderRadius: '4px', padding: '4px 10px', fontSize: '13px', background: 'var(--bg-card)' }}>
                <span style={{ color: 'var(--accent-gold)' }}>{txt(item.k, item.label)}:</span> <span style={{color:'var(--text-main)'}}>{item.v}</span>
              </div>
            ))}
          </div>

          <div style={{ color: 'var(--text-main)', fontSize: '15px', fontFamily: 'var(--font-serif)', paddingTop: '14px', borderTop: '1px dashed var(--border-light)' }}>
            {txt('comp.manglik', 'Manglik')}: <strong style={{color: match.mangalDosha.p1Manglik ? '#EF4444' : '#10B981'}}>{match.mangalDosha.p1Manglik ? txt('comp.yes', 'Yes') : txt('comp.no', 'No')}</strong>
          </div>
        </div>

        {/* P2 METADATA */}
        <div style={{ background: 'var(--bg-surface)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-light)', textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
          <h4 style={{ margin: '0 0 12px', color: 'var(--text-main)', fontSize: '20px', fontFamily: 'var(--font-serif)' }}>{match.p2.name === 'Partner' ? txt('comp.partner', 'Partner') : match.p2.name}</h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '18px', color: 'var(--text-secondary)', fontSize: '13px', fontFamily: 'var(--font-serif)', alignItems: 'center' }}>
            <div>📅 {new Date(partnerKundali.input.year, partnerKundali.input.month - 1, partnerKundali.input.day).toLocaleDateString(lang === 'en' ? 'en-IN' : lang, { day: 'numeric', month: 'long', year: 'numeric' })}, {partnerKundali.input.tob || String(partnerKundali.input.hour).padStart(2,'0')+':'+String(partnerKundali.input.minute).padStart(2,'0')}</div>
            <div style={{display:'flex', gap: 6}}><span> {partnerKundali.input.lat?.toFixed(3)}°N, {partnerKundali.input.lng?.toFixed(3)}°E</span></div>
            <div>🔹 {txt('ayanamsa', 'Ayanamsa')}: {partnerKundali.ayanamsaDMS}</div>
            <div>♑ {txt('lagna', 'Lagna')}: {(L_RASHI[lang] || L_RASHI.en)[partnerKundali.lagna?.rashi]} {partnerKundali.lagna?.degFmt}</div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '18px', flex: 1 }}>
            {[
              { k: 'comp.moonR', label: 'Moon Sign', v: p2RashiTranslated },
              { k: 'comp.nak', label: 'Nakshatra', v: p2NakTranslated },
              { k: 'tithi', label: 'Tithi', v: localizePanchang(partnerKundali.panchang, lang)?.tithi?.split(' (')[0] },
              { k: 'vara', label: 'Vara', v: localizePanchang(partnerKundali.panchang, lang)?.vara },
              { k: 'yoga', label: 'Yoga', v: localizePanchang(partnerKundali.panchang, lang)?.yoga },
              { k: 'karana', label: 'Karana', v: localizePanchang(partnerKundali.panchang, lang)?.karana }
            ].map((item, idx) => (
              <div key={idx} style={{ border: '1px solid var(--border-light)', borderRadius: '4px', padding: '4px 10px', fontSize: '13px', background: 'var(--bg-card)' }}>
                <span style={{ color: 'var(--accent-gold)' }}>{txt(item.k, item.label)}:</span> <span style={{color:'var(--text-main)'}}>{item.v}</span>
              </div>
            ))}
          </div>

          <div style={{ color: 'var(--text-main)', fontSize: '15px', fontFamily: 'var(--font-serif)', paddingTop: '14px', borderTop: '1px dashed var(--border-light)' }}>
            {txt('comp.manglik', 'Manglik')}: <strong style={{color: match.mangalDosha.p2Manglik ? '#EF4444' : '#10B981'}}>{match.mangalDosha.p2Manglik ? txt('comp.yes', 'Yes') : txt('comp.no', 'No')}</strong>
          </div>
        </div>

      </div>

      <div style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: '8px', borderLeft: '4px solid var(--accent-gold)', marginBottom: '16px' }}>
        <h4 style={{ margin: '0 0 8px', color: 'var(--accent-gold)', fontFamily: 'var(--font-serif)' }}>{txt('comp.phase1', 'Phase 1: Ashta Kuta Verdict')}</h4>
        <p style={{ margin: 0, fontSize:  17, lineHeight: '1.6', fontFamily: 'var(--font-serif)' }}>{txt(`comp.${match.ashtaKuta.summaryKey}`, match.ashtaKuta.summary)}</p>
      </div>

      <div style={{ background: 'var(--bg-dark)', padding: '16px', borderRadius: '8px', borderLeft: match.mangalDosha.manglikStatus.toLowerCase().includes('mismatch') || match.mangalDosha.manglikStatus.toLowerCase().includes('significant') ? '4px solid #EF4444' : '4px solid #10B981', marginBottom: '16px' }}>
        <h4 style={{ margin: '0 0 8px', color: match.mangalDosha.manglikStatus.toLowerCase().includes('mismatch') || match.mangalDosha.manglikStatus.toLowerCase().includes('significant') ? '#EF4444' : '#10B981', fontFamily: 'var(--font-serif)' }}>{txt('comp.phase2Label', 'Phase 2: Mangal Dosha Analysis')}</h4>
        <p style={{ margin: 0, fontSize:  17, lineHeight: '1.6', color: 'var(--text-main)', fontFamily: 'var(--font-serif)' }}>{txt(`comp.${match.mangalDosha.manglikKey}`, match.mangalDosha.manglikStatus)}</p>
      </div>

      <div style={{ background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.05), rgba(245, 158, 11, 0.05))', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)', marginBottom: '32px' }}>
        <h4 style={{ margin: '0 0 8px', color: '#7C3AED', fontFamily: 'var(--font-serif)' }}>{txt('comp.phase34', 'Phase 3 & 4: Structural Chart & Dasha Synthesis')}</h4>
        <p style={{ margin: 0, fontSize:  16, lineHeight: '1.6', color: 'var(--text-main)', fontFamily: 'var(--font-serif)' }}>
          {txt(match.structural.synthesis.lordsPart.key, "The core anchor of {1}'s 7th House connects structurally with {3}'s chart, binding their fundamental relationship ideals.").replace('{0}', txt(`pl.${match.structural.synthesis.lordsPart.vars.lord1}`, match.structural.synthesis.lordsPart.vars.lord1)).replace('{1}', match.structural.synthesis.lordsPart.vars.p1).replace('{2}', txt(`pl.${match.structural.synthesis.lordsPart.vars.lord2}`, match.structural.synthesis.lordsPart.vars.lord2)).replace('{3}', match.structural.synthesis.lordsPart.vars.p2)}
          {' '}{txt(match.structural.synthesis.venusPart.key, "Venus, the ultimate significator of romance, sits in a supportive dignity across both charts, seeding natural devotion, aesthetic harmony, and deep mutual affection.")}
          {' '}{txt(match.structural.synthesis.dashaPart.key, "Furthermore, both individuals are currently traversing supportive planetary periods (Dashas), meaning the cosmic timing actively endorses the formation of this bond.")}
        </p>
      </div>

      <h4 style={{ margin: '0 0 16px', fontSize: '18px', color: 'var(--text-main)', fontFamily: 'var(--font-serif)' }}>{txt('comp.breakdown', '8-Koota Breakdown')}</h4>
      <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        {match.ashtaKuta.elements.map((el, i) => {
          const dictNaks = L_NAKS[lang] || L_NAKS.en;
          const dictRashi = L_RASHI[lang] || L_RASHI.en;
          const boyName = match.p1.name || "Boy";
          const girlName = match.p2.name || "Girl";
          
          let basisRows = [];
          if (el.basis) {
              if (el.key === 'varna') {
                 basisRows.push({ label: `${boyName} ${txt('comp.moonR')}`, value: dictRashi[el.basis.bRashi] });
                 basisRows.push({ label: `${girlName} ${txt('comp.moonR')}`, value: dictRashi[el.basis.gRashi] });
                 basisRows.push({ label: `${txt('comp.basis.varnaLvl')} (${boyName})`, value: el.basis.bVarna });
                 basisRows.push({ label: `${txt('comp.basis.varnaLvl')} (${girlName})`, value: el.basis.gVarna });
              } else if (el.key === 'vashya') {
                 basisRows.push({ label: `${boyName} ${txt('comp.moonR')}`, value: dictRashi[el.basis.bRashi] });
                 basisRows.push({ label: `${girlName} ${txt('comp.moonR')}`, value: dictRashi[el.basis.gRashi] });
              } else if (el.key === 'tara') {
                 basisRows.push({ label: `${boyName} ${txt('comp.nak')}`, value: dictNaks[el.basis.bNak] || 'Unknown' });
                 basisRows.push({ label: `${girlName} ${txt('comp.nak')}`, value: dictNaks[el.basis.gNak] || 'Unknown' });
                 basisRows.push({ label: `${txt('comp.basis.taraGrp')} (${boyName})`, value: el.basis.bTaraGrp });
                 basisRows.push({ label: `${txt('comp.basis.taraGrp')} (${girlName})`, value: el.basis.gTaraGrp });
              } else if (el.key === 'yoni') {
                 const YONI_NAMES = ["Ashva (Horse)", "Gaja (Elephant)", "Chaga (Sheep)", "Sarpa (Serpent)", "Shvan (Dog)", "Marjala (Cat)", "Mushaka (Rat)", "Gau (Cow)", "Mahisha (Buffalo)", "Vyaghra (Tiger)", "Mriga (Deer)", "Vanara (Monkey)", "Nakula (Mongoose)", "Simha (Lion)"];
                 basisRows.push({ label: `${boyName} ${txt('comp.nak')}`, value: dictNaks[el.basis.bNak] || 'Unknown' });
                 basisRows.push({ label: `${girlName} ${txt('comp.nak')}`, value: dictNaks[el.basis.gNak] || 'Unknown' });
                 basisRows.push({ label: `${txt('comp.basis.yoniNum')} (${boyName})`, value: `${el.basis.bYoniRem} - ${YONI_NAMES[el.basis.bYoniRem] || 'Unknown'}` });
                 basisRows.push({ label: `${txt('comp.basis.yoniNum')} (${girlName})`, value: `${el.basis.gYoniRem} - ${YONI_NAMES[el.basis.gYoniRem] || 'Unknown'}` });
              } else if (el.key === 'graha') {
                 basisRows.push({ label: `${boyName} ${txt('comp.moonR')}`, value: dictRashi[el.basis.bRashi] });
                 basisRows.push({ label: `${girlName} ${txt('comp.moonR')}`, value: dictRashi[el.basis.gRashi] });
                 basisRows.push({ label: `${boyName} ${txt('comp.basis.lord')}`, value: `${txt(`pl.${el.basis.bLord}`)} (${el.basis.bIsSat ? txt('comp.basis.sat') : txt('comp.basis.nonSat')})` });
                 basisRows.push({ label: `${girlName} ${txt('comp.basis.lord')}`, value: `${txt(`pl.${el.basis.gLord}`)} (${el.basis.gIsSat ? txt('comp.basis.sat') : txt('comp.basis.nonSat')})` });
              } else if (el.key === 'gana') {
                 basisRows.push({ label: `${boyName} ${txt('comp.nak')}`, value: dictNaks[el.basis.bNak] || 'Unknown' });
                 basisRows.push({ label: `${girlName} ${txt('comp.nak')}`, value: dictNaks[el.basis.gNak] || 'Unknown' });
                 basisRows.push({ label: `${boyName} ${txt('comp.basis.gana')}`, value: el.basis.bGana });
                 basisRows.push({ label: `${girlName} ${txt('comp.basis.gana')}`, value: el.basis.gGana });
              } else if (el.key === 'bhakoot') {
                 basisRows.push({ label: `${boyName} ${txt('comp.moonR')}`, value: dictRashi[el.basis.bRashi] });
                 basisRows.push({ label: `${girlName} ${txt('comp.moonR')}`, value: dictRashi[el.basis.gRashi] });
                 basisRows.push({ label: txt('comp.basis.distance'), value: el.basis.bhakDiff });
              } else if (el.key === 'nadi') {
                 const NADI_NAMES = { 0: 'Aadi (Vata)', 1: 'Madhya (Pitta)', 2: 'Antya (Kapha)' };
                 basisRows.push({ label: `${boyName} ${txt('comp.nak')}`, value: dictNaks[el.basis.bNak] || 'Unknown' });
                 basisRows.push({ label: `${girlName} ${txt('comp.nak')}`, value: dictNaks[el.basis.gNak] || 'Unknown' });
                 basisRows.push({ label: `${boyName} ${txt('comp.basis.nadi')}`, value: `${el.basis.bNadi} - ${NADI_NAMES[el.basis.bNadi] || ''}` });
                 basisRows.push({ label: `${girlName} ${txt('comp.basis.nadi')}`, value: `${el.basis.gNadi} - ${NADI_NAMES[el.basis.gNadi] || ''}` });
              }
          }

          return (
          <div key={i} style={{ background: 'var(--bg-dark)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--accent-gold)', fontFamily: 'var(--font-serif)' }}>{txt(`comp.${el.key}`, el.name)}</span>
              <span style={{ fontSize: '14px', background: 'var(--bg-surface)', padding: '4px 10px', borderRadius: '4px', border: '1px solid var(--border-light)', fontFamily: 'var(--font-serif)' }}>
                {el.score} / {el.max}
              </span>
            </div>
            <p style={{ margin: 0, fontSize:   17, color: 'var(--text-secondary)', lineHeight: '1.5', fontFamily: 'var(--font-serif)' }}>
                {txt(`comp.${el.descKey}`, el.desc)}
            </p>
            {basisRows.length > 0 && (
                <div style={{ marginTop: '8px', padding: '12px', background: 'var(--bg-surface)', borderRadius: '6px', borderLeft: '3px solid var(--border-light)', fontSize: '13px' }}>
                   <strong style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>{txt('comp.basis.title', 'Astrological Basis')}</strong>
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {basisRows.map((r, ri) => (
                         <div key={ri} style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{r.label}</span> 
                            <strong style={{ color: 'var(--text-main)', fontSize: '13px' }}>{r.value}</strong>
                         </div>
                      ))}
                   </div>
                </div>
            )}
          </div>
        )})}
      </div>
    </div>
  );
}
