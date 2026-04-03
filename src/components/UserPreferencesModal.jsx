import React from 'react';
import { usePreferences } from '../contexts/PreferencesContext';

const LANGS = [
  {code:'en',label:'English'},
  {code:'hi',label:'हिन्दी'},
  {code:'kn',label:'ಕನ್ನಡ'},
  {code:'te',label:'తెలుగు'},
  {code:'ta',label:'தமிழ்'},
  {code:'sa',label:'संस्कृतम्'},
  {code:'mr',label:'मराठी'},
  {code:'gu',label:'ગુજરાતી'},
  {code:'bn',label:'বাংলা'},
  {code:'ml',label:'മലയാളം'}
];

export default function UserPreferencesModal({ isOpen, onClose }) {
  const { lang, setLanguage, theme, setTheme } = usePreferences();
  const [selectedLang, setSelectedLang] = React.useState(lang);
  const [warning, setWarning] = React.useState(false);

  React.useEffect(() => {
    setSelectedLang(lang);
    setWarning(false);
  }, [lang, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (selectedLang !== lang) {
      setLanguage(selectedLang);
    }
    onClose();
  };

  const handleLangSelect = (e) => {
    const val = e.target.value;
    setSelectedLang(val);
    if (val !== lang) {
      setWarning(true);
    } else {
      setWarning(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', pdding: 20 }}>
      <div className="lux-card" style={{ width: '100%', maxWidth: 400, animation: 'slideIn 0.3s ease' }}>
        <h2 style={{ margin: '0 0 20px', color: 'var(--accent-gold)', fontSize: 24 }}>User Preferences</h2>
        
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Global Language</label>
          <select value={selectedLang} onChange={handleLangSelect} className="lux-input" style={{ width: '100%', cursor: 'pointer' }}>
            {LANGS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
        </div>

        {warning && (
          <div style={{ background: 'var(--bg-badge-orange)', padding: '12px 16px', borderRadius: 8, marginBottom: 20, border: '1px solid rgba(212, 140, 50, 0.4)' }}>
            <strong style={{ color: 'var(--text-badge-orange)', display: 'block', marginBottom: 6, fontSize: 14 }}>⚠️ Language Regeneration</strong>
            <p style={{ color: 'var(--text-main)', fontSize:   17, margin: 0, lineHeight: 1.5 }}>
              Changing the global language will require the system to re-align the profound astrological cosmos. The entire chart, life path, and predictive intelligence will be flushed and re-translated.
            </p>
          </div>
        )}

        <div style={{ marginBottom: 30 }}>
          <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Interface Theme</label>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={() => setTheme('dark')} style={{ flex: 1, padding: 12, borderRadius: 6, background: theme === 'dark' ? 'var(--bg-badge-purple)' : 'transparent', border: theme === 'dark' ? '1px solid #7C3AED' : '1px solid var(--border-light)', color: 'var(--text-main)', cursor: 'pointer', transition: 'all 0.2s' }}>
              Dark ☾
            </button>
            <button type="button" onClick={() => setTheme('light')} style={{ flex: 1, padding: 12, borderRadius: 6, background: theme === 'light' ? 'var(--bg-badge-orange)' : 'transparent', border: theme === 'light' ? '1px solid var(--accent-gold)' : '1px solid var(--border-light)', color: 'var(--text-main)', cursor: 'pointer', transition: 'all 0.2s' }}>
              Light ☀
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer', padding: '8px 16px' }}>Cancel</button>
          <button type="button" onClick={handleSave} className="lux-btn" style={{ padding: '10px 24px' }}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}
