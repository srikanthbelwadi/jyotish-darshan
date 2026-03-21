import React from 'react';

export default function DailyCalendar({ kundali, lang, t=(k)=>k }) {
  const today = new Date();
  const locale = lang === 'en' ? 'en-IN' : (lang === 'sa' ? 'hi-IN' : `${lang}-IN`);
  const dateString = today.toLocaleDateString(locale, {
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  });

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-light)',
      borderRadius: '12px',
      padding: '24px',
      color: 'var(--text-main)',
      marginBottom: '20px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
    }}>
      <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: 'var(--accent-gold)' }}>🌤️</span> {t('ov.dailyWeather', lang) || 'Daily Cosmic Weather'}
      </h3>
      <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'var(--text-muted)' }}>{dateString}</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
        <div style={{ background: 'var(--bg-dark)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #10B981' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>{t('ov.favorable', lang)}</div>
          <div style={{ fontSize: '14px', color: 'var(--text-main)' }}>{t('ov.favorableDesc', lang)}</div>
        </div>
        <div style={{ background: 'var(--bg-dark)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #EF4444' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>{t('ov.avoid', lang)}</div>
          <div style={{ fontSize: '14px', color: 'var(--text-main)' }}>{t('ov.avoidDesc', lang)}</div>
        </div>
        <div style={{ background: 'var(--bg-dark)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid var(--accent-gold)' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>{t('ov.mantra', lang)}</div>
          <div style={{ fontSize: '14px', color: 'var(--text-main)', fontStyle: 'italic' }}>{t('ov.mantraDesc', lang)}</div>
        </div>
      </div>
    </div>
  );
}
