import { useState, useEffect } from 'react';
import { getLifeDimensions } from '../engine/lifeDimensions.js';

export default function LifeDimensionsCard({ kundali, t=(x)=>x, lang='en' }) {
  const [dims, setDims] = useState(null);

  useEffect(() => {
    if (kundali) {
      setDims(getLifeDimensions(kundali));
    }
  }, [kundali]);

  if (!dims) return null;

  return (
    <div className="lux-card" style={{ marginBottom: '24px' }}>
      <h3 style={{ margin: '0 0 20px', fontSize: 18, color: '#D4AF37', borderBottom: '1px solid rgba(212, 175, 55, 0.2)', paddingBottom: 12 }}>
        {t('ld.title',lang)}
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {/* Career */}
        <div style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
          <div className="badge-base badge-purple">💼 {t('ld.career',lang)}</div>
          <p style={{ margin: '8px 0 0', fontSize: '14px', lineHeight: '1.6', color: 'var(--text-main)' }}>{dims.career}</p>
        </div>

        {/* Health */}
        <div style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
          <div className="badge-base badge-green">🌿 {t('ld.health',lang)}</div>
          <p style={{ margin: '8px 0 0', fontSize: '14px', lineHeight: '1.6', color: 'var(--text-main)' }}>{dims.health}</p>
        </div>

        {/* Wealth */}
        <div style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
          <div className="badge-base badge-orange">💎 {t('ld.wealth',lang)}</div>
          <p style={{ margin: '8px 0 0', fontSize: '14px', lineHeight: '1.6', color: 'var(--text-main)' }}>{dims.wealth}</p>
        </div>

        {/* Spiritual */}
        <div style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
          <div className="badge-base badge-neutral">✨ {t('ld.spirit',lang)}</div>
          <p style={{ margin: '8px 0 0', fontSize: '14px', lineHeight: '1.6', color: 'var(--text-main)' }}>{dims.spiritual}</p>
        </div>
        {/* Relationships */}
        <div style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
          <div className="badge-base badge-purple" style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#F472B6', border: '1px solid rgba(236, 72, 153, 0.3)' }}>💞 {t('ld.rel',lang)}</div>
          <p style={{ margin: '8px 0 0', fontSize: '14px', lineHeight: '1.6', color: 'var(--text-main)' }}>{dims.relationships}</p>
        </div>

        {/* Intellect */}
        <div style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
          <div className="badge-base badge-purple" style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38BDF8', border: '1px solid rgba(56, 189, 248, 0.3)' }}>🧠 {t('ld.intellect',lang)}</div>
          <p style={{ margin: '8px 0 0', fontSize: '14px', lineHeight: '1.6', color: 'var(--text-main)' }}>{dims.intellect}</p>
        </div>
      </div>
    </div>
  );
}
