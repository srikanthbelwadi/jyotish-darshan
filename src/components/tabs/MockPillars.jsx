import React from 'react';

// Common visual wrapper for Premium Mock Tabs
const PremiumPanel = ({ title, subtitle, icon, children }) => (
  <div style={{
    background: 'linear-gradient(145deg, #1f1f1f 0%, #121212 100%)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '24px',
    color: 'var(--text-main)',
    marginBottom: '20px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
      <span style={{ fontSize: '24px', filter: 'drop-shadow(0 0 8px var(--accent-gold))' }}>{icon}</span>
      <h2 style={{ margin: 0, fontSize: '20px', fontFamily: 'var(--font-serif)', color: 'var(--accent-gold)' }}>{title}</h2>
    </div>
    <p style={{ margin: '0 0 24px 0', fontSize:   17, color: 'var(--text-muted)' }}>{subtitle}</p>
    {children}
  </div>
);

// 1. Life Transitions (Muhurta & Dashas)
export const MockTransitionTab = () => (
  <PremiumPanel title="Life Transitions & Muhurta" subtitle="Auspicious timing and Mahadasha impact analysis." icon="🗓️">
    <div style={{ background: '#000', padding: '16px', borderRadius: '8px', border: '1px solid #333' }}>
      <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#fff' }}>Upcoming Auspicious Windows (Muhurta)</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        <div style={{ borderLeft: '3px solid var(--accent-gold)', paddingLeft: '12px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Property Purchase (Griha Pravesh)</div>
          <div style={{ fontWeight: '600', color: '#10b981', marginTop: '4px' }}>Nov 12 - Nov 18</div>
          <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>Tara Bala: High • Chandra Bala: Strong</div>
        </div>
        <div style={{ borderLeft: '3px solid #6b7280', paddingLeft: '12px', opacity: 0.6 }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Business Launch</div>
          <div style={{ fontWeight: '600', color: '#ef4444', marginTop: '4px' }}>Avoid until Dec 4</div>
          <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>Mercury Retrograde Active</div>
        </div>
      </div>
      <div style={{ marginTop: '24px', height: '4px', background: '#333', borderRadius: '2px', position: 'relative' }}>
          <div style={{ position: 'absolute', left: '20%', width: '30%', height: '100%', background: 'var(--accent-gold)', borderRadius: '2px' }} />
          <div style={{ position: 'absolute', top: '-24px', left: '25%', fontSize: '12px', color: 'var(--accent-gold)' }}>Current: Rahu-Jupiter</div>
      </div>
    </div>
  </PremiumPanel>
);

// 2. Marriage & Relationships
export const MockMarriageTab = () => (
  <PremiumPanel title="Marriage & Relationships" subtitle="Kundali Milan and Dosha analysis." icon="💞">
    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
      <div style={{ flex: 1, minWidth: '250px', background: '#000', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '15px' }}>Ashta-Kuta Compatibility Radar</h3>
        {/* Placeholder for Radar Chart */}
        <div style={{ width: '100%', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #333', borderRadius: '50%', color: 'var(--text-muted)', fontSize: '12px' }}>
          [Interactive 8-Axis Radar Chart]
        </div>
      </div>
      <div style={{ flex: 1, minWidth: '250px' }}>
         <div style={{ background: '#271c19', padding: '16px', borderRadius: '8px', border: '1px solid #7f1d1d', marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{background: '#ef4444', width: 8, height: 8, borderRadius: '50%'}}></span>
              Kuja Dosha (Manglik) Detected
            </h4>
            <p style={{ margin: 0, fontSize:   17, color: '#fecaca', lineHeight: 1.5 }}>
              Mars is positioned in the 8th house from the Ascendant. 
              <br/><br/>
              <span style={{ color: '#10b981', fontWeight: 600 }}>Cancellation Active:</span> Jupiter's aspect on Mars neutralizes the severity of this placement according to Parashari principles.
            </p>
         </div>
         <button className="auth-btn" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
           <span>+</span> Add Partner Profile
         </button>
      </div>
    </div>
  </PremiumPanel>
);

// 3. Career & Finance
export const MockCareerTab = () => (
  <PremiumPanel title="Career & Financial Success" subtitle="Identifying innate talents via Dasamsa (D10)." icon="💼">
    <div style={{ background: '#000', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #222', paddingBottom: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '15px' }}>Innate Calling (Amatyakaraka Focus)</h3>
        <span style={{ background: 'var(--accent-gold)', color: '#000', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>Mercury Dominant</span>
      </div>
      <p style={{ fontSize:  16, lineHeight: 1.6, color: 'var(--text-main)', marginBottom: '24px' }}>
        With Mercury exalted in your D10 (Dasamsa) chart and acting as your Amatyakaraka, your optimal career path lies in high-level communications, technology architecture, or commerce. The alignment suggests sudden elevation in status when working as a consultant or independent advisor rather than in rigid corporate hierarchies.
      </p>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={{ background: '#111', padding: '12px', borderRadius: '6px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Wealth Accumulation (2nd House)</div>
          <div style={{ width: '100%', background: '#333', height: '6px', borderRadius: '3px' }}>
            <div style={{ width: '85%', background: '#10b981', height: '100%', borderRadius: '3px' }}></div>
          </div>
        </div>
        <div style={{ background: '#111', padding: '12px', borderRadius: '6px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Risk & Speculation (5th House)</div>
          <div style={{ width: '100%', background: '#333', height: '6px', borderRadius: '3px' }}>
            <div style={{ width: '40%', background: '#ef4444', height: '100%', borderRadius: '3px' }}></div>
          </div>
        </div>
      </div>
    </div>
  </PremiumPanel>
);

// 4. Health & Wellness
export const MockHealthTab = () => (
  <PremiumPanel title="Health & Wellness" subtitle="Ayurvedic constitution and medical astrology insights." icon="🌿">
    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
      <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#000', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', width: '100%', textAlign: 'left' }}>Prakriti (Ayurvedic Constitution)</h3>
        {/* Placeholder for Triangle */}
        <div style={{ width: 120, height: 120, borderBottom: '100px solid var(--accent-gold)', borderLeft: '60px solid transparent', borderRight: '60px solid transparent', position: 'relative', opacity: 0.8 }}>
          <span style={{ position: 'absolute', top: 110, left: -60, fontSize: '11px' }}>Vata</span>
          <span style={{ position: 'absolute', top: 110, left: 30, fontSize: '11px', color: 'var(--accent-gold)' }}>Pitta (Dominant)</span>
          <span style={{ position: 'absolute', top: 0, left: -20, fontSize: '11px' }}>Kapha</span>
        </div>
      </div>
      <div style={{ flex: 1.5, minWidth: '250px' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '15px' }}>Cosmic Vulnerabilities (6th House)</h3>
        <p style={{ fontSize:  16, lineHeight: 1.6, color: 'var(--text-muted)', marginBottom: '16px' }}>
          Saturn's placement in the 6th house suggests a robust immune system that develops over time, but indicates a vulnerability to joint stiffness, bone density issues, or prolonged systemic fatigue if you overwork.
        </p>
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '12px', borderRadius: '6px' }}>
          <strong style={{ display: 'block', fontSize: '12px', color: '#10b981', marginBottom: '4px' }}>Recommended Preventive Care:</strong>
          <span style={{ fontSize: '13px', color: 'var(--text-main)' }}>Incorporate regular oil massages (Abhyanga) and joint-lubricating diets. Avoid extreme cold climates.</span>
        </div>
      </div>
    </div>
  </PremiumPanel>
);

// 5. Remedies & Problem Solving
export const MockRemediesTab = () => (
  <PremiumPanel title="Karmic Remedies (Upaya)" subtitle="Vedic prescriptions to mitigate afflictions." icon="💎">
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
      
      <div style={{ background: '#000', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: 'var(--accent-gold)' }}>Primary Gemstone (Ratna)</h4>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'radial-gradient(circle at 30% 30%, #60a5fa, #1e3a8a)', boxShadow: '0 0 12px rgba(96, 165, 250, 0.4)' }}></div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>Blue Sapphire (Neelam)</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>For Saturn (Functional Benefic)</div>
          </div>
        </div>
        <div style={{ marginTop: '16px', fontSize: '13px', color: '#9ca3af' }}>
          <strong>Wear:</strong> Middle finger, Right hand.<br/>
          <strong>Metal:</strong> Silver or White Gold.<br/>
          <strong>Timing:</strong> Saturday evening during Shukla Paksha.
        </div>
      </div>

      <div style={{ background: '#000', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: 'var(--accent-gold)' }}>Prescribed Mantra</h4>
        <div style={{ background: '#111', padding: '16px', borderRadius: '6px', border: '1px solid #222', textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontFamily: 'var(--font-serif)', color: '#fff', marginBottom: '8px' }}>ॐ बृं बृहस्पतये नमः</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>Om Brihm Brihaspataye Namah</div>
          <button style={{ background: 'var(--accent-gold)', color: '#000', border: 'none', padding: '6px 16px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto' }}>
            <span>▶</span> Listen to Pronunciation
          </button>
        </div>
      </div>

    </div>
  </PremiumPanel>
);

// 6. Self-Discovery & Purpose
export const MockPurposeTab = () => (
  <PremiumPanel title="Self-Discovery & Dharma" subtitle="Soul purpose analyzed via the Atmakaraka." icon="👁️">
    <div style={{ background: 'url("https://www.transparenttextures.com/patterns/stardust.png") #0a0a0a', padding: '32px 24px', borderRadius: '8px', border: '1px solid #222', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      
      {/* Decorative center piece */}
      <div style={{ width: '80px', height: '80px', border: '2px solid var(--accent-gold)', borderRadius: '50%', margin: '0 auto 20px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>
        ☽
      </div>
      
      <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', color: 'var(--accent-gold)', fontFamily: 'var(--font-serif)' }}>The Moon as Atmakaraka</h3>
      <div style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '24px' }}>Your Soul's Primary Directive</div>
      
      <p style={{ fontSize:  17, lineHeight: 1.7, color: '#d1d5db', maxWidth: '600px', margin: '0 auto 32px auto' }}>
        With the Moon as your Atmakaraka (the planet with the highest degree in your chart), your soul's evolutionary purpose in this lifetime revolves around mastering emotional intelligence, nurturing others, and transcending fluctuating desires. Your ultimate tests will come through establishing deep emotional boundaries and finding peace inward, rather than seeking validation from the external world.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', maxWidth: '500px', margin: '0 auto' }}>
        <div style={{ background: 'rgba(0,0,0,0.5)', padding: '16px', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          <div style={{ fontSize: '11px', color: '#fca5a5', textTransform: 'uppercase', marginBottom: '8px' }}>Unconscious Shadow</div>
          <div style={{ fontSize: '13px', color: '#d1d5db' }}>Co-dependency, emotional volatility, inability to let go of the past.</div>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.5)', padding: '16px', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
          <div style={{ fontSize: '11px', color: '#6ee7b7', textTransform: 'uppercase', marginBottom: '8px' }}>Awakened State</div>
          <div style={{ fontSize: '13px', color: '#d1d5db' }}>Unconditional empathy, profound intuition, emotional sanctuary for others.</div>
        </div>
      </div>

    </div>
  </PremiumPanel>
);
