import React from 'react';
import { calculateMatch } from '../engine/matchmaking.js';

export default function CompatibilityMatch({ primaryKundali, partnerKundali, lang }) {
  const match = calculateMatch(primaryKundali, partnerKundali);

  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--accent-gold)', 
      borderRadius: '12px', padding: '30px', marginTop: '20px', color: 'var(--text-main)',
      boxShadow: '0 8px 32px rgba(212, 175, 55, 0.1)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px', marginBottom: '24px' }}>
        <h3 style={{ margin: 0, color: 'var(--accent-gold)', fontSize: '22px' }}>💞 Ashtakoota Milan</h3>
        <div style={{
          padding: '8px 16px', borderRadius: '20px', border: '2px solid var(--accent-gold)',
          fontSize: '20px', fontWeight: 'bold', color: 'var(--accent-gold)', background: 'var(--bg-dark)'
        }}>
          {match.totalScore} / 36
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)', textAlign: 'center' }}>
          <h4 style={{ margin: '0 0 8px', color: 'var(--text-main)', fontSize: '18px' }}>{match.p1.name}</h4>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Moon Rashi: <span style={{color:'var(--accent-gold)'}}>{match.p1.rashi}</span></div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Nakshatra: <span style={{color:'var(--accent-gold)'}}>{match.p1.nakshatra}</span></div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '6px' }}>Manglik: <span style={{color: match.p1.isManglik ? '#EF4444' : '#10B981'}}>{match.p1.isManglik ? 'Yes' : 'No'}</span></div>
        </div>
        <div style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)', textAlign: 'center' }}>
          <h4 style={{ margin: '0 0 8px', color: 'var(--text-main)', fontSize: '18px' }}>{match.p2.name}</h4>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Moon Rashi: <span style={{color:'var(--accent-gold)'}}>{match.p2.rashi}</span></div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Nakshatra: <span style={{color:'var(--accent-gold)'}}>{match.p2.nakshatra}</span></div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '6px' }}>Manglik: <span style={{color: match.p2.isManglik ? '#EF4444' : '#10B981'}}>{match.p2.isManglik ? 'Yes' : 'No'}</span></div>
        </div>
      </div>

      <div style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: '8px', borderLeft: '4px solid var(--accent-gold)', marginBottom: '16px' }}>
        <h4 style={{ margin: '0 0 8px', color: 'var(--accent-gold)' }}>Compatibility Verdict</h4>
        <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.6' }}>{match.summary}</p>
      </div>

      <div style={{ background: 'var(--bg-dark)', padding: '16px', borderRadius: '8px', borderLeft: match.manglikStatus.includes('Present!') ? '4px solid #EF4444' : '4px solid #10B981', marginBottom: '32px' }}>
        <h4 style={{ margin: '0 0 8px', color: match.manglikStatus.includes('Present!') ? '#EF4444' : '#10B981' }}>Kuja (Manglik) Dosha Evaluation</h4>
        <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.6', color: 'var(--text-main)' }}>{match.manglikStatus}</p>
      </div>

      <h4 style={{ margin: '0 0 16px', fontSize: '18px', color: 'var(--text-main)' }}>8-Koota Breakdown & Explanation</h4>
      <div style={{ display: 'grid', gap: '16px' }}>
        {match.elements.map((el, i) => (
          <div key={i} style={{ background: 'var(--bg-dark)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--accent-gold)' }}>{el.name}</span>
              <span style={{ fontSize: '14px', background: 'var(--bg-surface)', padding: '4px 10px', borderRadius: '4px', border: '1px solid var(--border-light)' }}>
                {el.score} / {el.max}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{el.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
