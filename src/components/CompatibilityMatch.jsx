import React from 'react';
import { calculateMatch } from '../engine/matchmaking.js';

export default function CompatibilityMatch({ primaryKundali, partnerKundali, lang }) {
  const match = calculateMatch(primaryKundali, partnerKundali);

  return (
    <div style={{
      background: 'var(--bg-card)', 
      border: '1px solid var(--accent-gold)', 
      borderRadius: '12px', 
      padding: '24px', 
      marginTop: '20px',
      color: 'var(--text-main)',
      boxShadow: '0 8px 32px rgba(212, 175, 55, 0.1)'
    }}>
      <h3 style={{ margin: '0 0 16px 0', color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
        💞 Ashtakoota Milan (Compatibility)
      </h3>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%',
          border: '4px solid var(--accent-gold)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '24px', fontWeight: 'bold', color: 'var(--accent-gold)',
          background: 'var(--bg-dark)'
        }}>
          {match.totalScore}/{match.maxScore}
        </div>
        <div>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>Compatibility Score</h4>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>{match.summary}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
        {Object.entries(match.breakdown).map(([koota, score]) => (
          <div key={koota} style={{ background: 'var(--bg-dark)', padding: '10px', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>{koota}</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--accent-gold)' }}>{score}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
