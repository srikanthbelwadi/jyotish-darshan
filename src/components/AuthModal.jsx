import React from 'react';

export default function AuthModal({ onLogin, onClose, lang, t }) {
  // We use dark mode aesthetics matching Jyotish Darshan
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        background: 'var(--bg-surface, #1e1e1e)',
        border: '1px solid var(--border-light, #333)',
        borderRadius: '16px',
        width: '100%', maxWidth: '440px',
        padding: '32px',
        position: 'relative',
        boxShadow: '0 10px 40px rgba(0,0,0,0.6)'
      }}>
        <button 
          onClick={onClose}
          style={{
            position: 'absolute', top: 20, right: 20,
            background: 'transparent', border: 'none',
            color: 'var(--text-muted, #888)', fontSize: 20, cursor: 'pointer'
          }}
        >
          ✕
        </button>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h2 className="serif" style={{ color: 'var(--accent-gold, #d4af37)', fontSize: 26, margin: '0 0 8px 0', fontWeight: 500 }}>
            Unlock Deep Life Analysis
          </h2>
          <p style={{ color: 'var(--text-secondary, #aaa)', margin: 0, fontSize: 14 }}>
            Create an account or log in to reveal your 36 personalized Shastric pathways.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <button 
            onClick={() => onLogin({ name: 'Seeker', method: 'google' })}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              background: '#ffffff', color: '#000',
              border: 'none', padding: '14px', borderRadius: '8px',
              fontSize: 15, fontWeight: 600, cursor: 'pointer',
              transition: 'transform 0.2s', boxShadow: '0 4px 12px rgba(255,255,255,0.1)'
            }}
          >
            <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" style={{width: 18, height: 18}} />
            Continue with Google
          </button>

          <button 
            onClick={() => onLogin({ name: 'Seeker', method: 'email' })}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              background: 'transparent', color: 'var(--text-main, #fff)',
              border: '1px solid var(--border-light, #444)', padding: '14px', borderRadius: '8px',
              fontSize: 15, fontWeight: 500, cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <span style={{fontSize: 18}}>✉</span>
            Continue with Email
          </button>

          <button 
            onClick={() => onLogin({ name: 'Seeker', method: 'mobile' })}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              background: 'transparent', color: 'var(--text-main, #fff)',
              border: '1px solid var(--border-light, #444)', padding: '14px', borderRadius: '8px',
              fontSize: 15, fontWeight: 500, cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <span style={{fontSize: 18}}>📱</span>
            Continue with Mobile
          </button>
        </div>

        <p style={{ textAlign: 'center', color: 'var(--text-muted, #777)', fontSize: 12, marginTop: 32 }}>
          By continuing, you agree to our Terms of Service and Privacy Policy. All readings are generated locally and securely.
        </p>
      </div>
    </div>
  );
}
