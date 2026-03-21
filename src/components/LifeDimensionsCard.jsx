import { useState, useEffect } from 'react';
import { getLifeDimensions } from '../engine/lifeDimensions.js';

export default function LifeDimensionsCard({ kundali }) {
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
        Life Dimensions
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {/* Career */}
        <div style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
          <div className="badge-base badge-purple">💼 Career & Purpose</div>
          <p style={{ margin: '8px 0 0', fontSize: '14px', lineHeight: '1.6', color: 'var(--text-main)' }}>{dims.career}</p>
        </div>

        {/* Health */}
        <div style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
          <div className="badge-base badge-green">🌿 Health & Vitality</div>
          <p style={{ margin: '8px 0 0', fontSize: '14px', lineHeight: '1.6', color: 'var(--text-main)' }}>{dims.health}</p>
        </div>

        {/* Wealth */}
        <div style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
          <div className="badge-base badge-orange">💎 Wealth & Finance</div>
          <p style={{ margin: '8px 0 0', fontSize: '14px', lineHeight: '1.6', color: 'var(--text-main)' }}>{dims.wealth}</p>
        </div>

        {/* Spiritual */}
        <div style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
          <div className="badge-base badge-neutral">✨ Spiritual Pursuit</div>
          <p style={{ margin: '8px 0 0', fontSize: '14px', lineHeight: '1.6', color: 'var(--text-main)' }}>{dims.spiritual}</p>
        </div>
        {/* Relationships */}
        <div style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
          <div className="badge-base badge-purple" style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#F472B6', border: '1px solid rgba(236, 72, 153, 0.3)' }}>💞 Relationships & Love</div>
          <p style={{ margin: '8px 0 0', fontSize: '14px', lineHeight: '1.6', color: 'var(--text-main)' }}>{dims.relationships}</p>
        </div>

        {/* Intellect */}
        <div style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
          <div className="badge-base badge-purple" style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38BDF8', border: '1px solid rgba(56, 189, 248, 0.3)' }}>🧠 Intellect & Learning</div>
          <p style={{ margin: '8px 0 0', fontSize: '14px', lineHeight: '1.6', color: 'var(--text-main)' }}>{dims.intellect}</p>
        </div>
      </div>
    </div>
  );
}
