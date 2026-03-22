import React from 'react';
import { calculateMatch } from '../engine/matchmaking.js';
import { L_NAKS, L_RASHI } from '../App.jsx';

export default function CompatibilityMatch({ primaryKundali, partnerKundali, t=(x)=>x, lang }) {
  const match = calculateMatch(primaryKundali, partnerKundali);
  
  const englishNakshatras = L_NAKS.en;
  const translatedNakshatras = L_NAKS[lang] || L_NAKS.en;
  const p1NakIndex = englishNakshatras.indexOf(match.p1.nakshatra);
  const p2NakIndex = englishNakshatras.indexOf(match.p2.nakshatra);
  const p1NakTranslated = p1NakIndex !== -1 ? translatedNakshatras[p1NakIndex] : match.p1.nakshatra;
  const p2NakTranslated = p2NakIndex !== -1 ? translatedNakshatras[p2NakIndex] : match.p2.nakshatra;

  const englishRashis = L_RASHI.en;
  const translatedRashis = L_RASHI[lang] || L_RASHI.en;
  const p1RashiIndex = englishRashis.indexOf(match.p1.rashi);
  const p2RashiIndex = englishRashis.indexOf(match.p2.rashi);
  const p1RashiTranslated = p1RashiIndex !== -1 ? translatedRashis[p1RashiIndex] : match.p1.rashi;
  const p2RashiTranslated = p2RashiIndex !== -1 ? translatedRashis[p2RashiIndex] : match.p2.rashi;

  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--accent-gold)', 
      borderRadius: '12px', padding: '30px', marginTop: '20px', color: 'var(--text-main)',
      boxShadow: '0 8px 32px rgba(212, 175, 55, 0.1)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px', marginBottom: '24px' }}>
        <h3 style={{ margin: 0, color: 'var(--accent-gold)', fontSize: '22px' }}>💞 {t('comp.milan',lang) || 'Compatibility'}</h3>
        <div style={{
          padding: '8px 16px', borderRadius: '20px', border: '2px solid var(--accent-gold)',
          fontSize: '20px', fontWeight: 'bold', color: 'var(--accent-gold)', background: 'var(--bg-dark)'
        }}>
          {match.ashtaKuta.totalScore} / 36
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)', textAlign: 'center' }}>
          <h4 style={{ margin: '0 0 8px', color: 'var(--text-main)', fontSize: '18px' }}>{match.p1.name === 'User' ? t('comp.user',lang) : match.p1.name}</h4>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{t('comp.moonR',lang)}: <span style={{color:'var(--accent-gold)'}}>{p1RashiTranslated}</span></div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{t('comp.nak',lang)}: <span style={{color:'var(--accent-gold)'}}>{p1NakTranslated}</span></div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '6px' }}>{t('comp.manglik',lang)}: <span style={{color: match.mangalDosha.p1Manglik ? '#EF4444' : '#10B981'}}>{match.mangalDosha.p1Manglik ? t('comp.yes',lang) : t('comp.no',lang)}</span></div>
        </div>
        <div style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)', textAlign: 'center' }}>
          <h4 style={{ margin: '0 0 8px', color: 'var(--text-main)', fontSize: '18px' }}>{match.p2.name === 'Partner' ? t('comp.partner',lang) : match.p2.name}</h4>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{t('comp.moonR',lang)}: <span style={{color:'var(--accent-gold)'}}>{p2RashiTranslated}</span></div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{t('comp.nak',lang)}: <span style={{color:'var(--accent-gold)'}}>{p2NakTranslated}</span></div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '6px' }}>{t('comp.manglik',lang)}: <span style={{color: match.mangalDosha.p2Manglik ? '#EF4444' : '#10B981'}}>{match.mangalDosha.p2Manglik ? t('comp.yes',lang) : t('comp.no',lang)}</span></div>
        </div>
      </div>

      <div style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: '8px', borderLeft: '4px solid var(--accent-gold)', marginBottom: '16px' }}>
        <h4 style={{ margin: '0 0 8px', color: 'var(--accent-gold)' }}>Phase 1: Ashta Kuta Verdict</h4>
        <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.6' }}>{t(`comp.${match.ashtaKuta.summaryKey}`, lang) || match.ashtaKuta.summary}</p>
      </div>

      <div style={{ background: 'var(--bg-dark)', padding: '16px', borderRadius: '8px', borderLeft: match.mangalDosha.manglikStatus.toLowerCase().includes('mismatch') || match.mangalDosha.manglikStatus.toLowerCase().includes('significant') ? '4px solid #EF4444' : '4px solid #10B981', marginBottom: '16px' }}>
        <h4 style={{ margin: '0 0 8px', color: match.mangalDosha.manglikStatus.toLowerCase().includes('mismatch') || match.mangalDosha.manglikStatus.toLowerCase().includes('significant') ? '#EF4444' : '#10B981' }}>Phase 2: {t('comp.kuja',lang) || 'Mangal Dosha Analysis'}</h4>
        <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.6', color: 'var(--text-main)' }}>{t(`comp.${match.mangalDosha.manglikKey}`, lang) || match.mangalDosha.manglikStatus}</p>
      </div>

      <div style={{ background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.05), rgba(245, 158, 11, 0.05))', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)', marginBottom: '32px' }}>
        <h4 style={{ margin: '0 0 8px', color: '#7C3AED' }}>{t('comp.phase34', lang) || 'Phase 3 & 4: Structural Chart & Dasha Synthesis'}</h4>
        <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6', color: 'var(--text-main)' }}>
          {(t(match.structural.synthesis.lordsPart.key, lang) || '').replace('{0}', t(`pl.${match.structural.synthesis.lordsPart.vars.lord1}`, lang) || match.structural.synthesis.lordsPart.vars.lord1).replace('{1}', match.structural.synthesis.lordsPart.vars.p1).replace('{2}', t(`pl.${match.structural.synthesis.lordsPart.vars.lord2}`, lang) || match.structural.synthesis.lordsPart.vars.lord2).replace('{3}', match.structural.synthesis.lordsPart.vars.p2)}
          {' '}{(t(match.structural.synthesis.venusPart.key, lang) || '')}
          {' '}{(t(match.structural.synthesis.dashaPart.key, lang) || '')}
        </p>
      </div>

      <h4 style={{ margin: '0 0 16px', fontSize: '18px', color: 'var(--text-main)' }}>{t('comp.breakdown',lang) || '8-Koota Breakdown'}</h4>
      <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        {match.ashtaKuta.elements.map((el, i) => (
          <div key={i} style={{ background: 'var(--bg-dark)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--accent-gold)' }}>{t(`comp.${el.key}`, lang) || el.name}</span>
              <span style={{ fontSize: '14px', background: 'var(--bg-surface)', padding: '4px 10px', borderRadius: '4px', border: '1px solid var(--border-light)' }}>
                {el.score} / {el.max}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{t(`comp.${el.descKey}`, lang) || el.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
