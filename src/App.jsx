import { useState, useEffect } from 'react';
import InputForm from './components/InputForm.jsx';
import ResultsPage from './components/ResultsPage.jsx';
import { computeKundali } from './engine/vedic.js';
import { decodeShareLink } from './export/shareLink.js';

export default function App() {
  const [screen, setScreen] = useState('input');
  const [kundali, setKundali] = useState(null);
  const [lang, setLang] = useState(() => localStorage.getItem('jd_lang') || 'en');
  const [error, setError] = useState(null);

  // Handle share link on load
  useEffect(() => {
    const shared = decodeShareLink();
    if (shared) {
      handleSubmit(shared);
    }
  }, []);

  const handleLangChange = (code) => {
    setLang(code);
    localStorage.setItem('jd_lang', code);
  };

  const handleSubmit = (input) => {
    try {
      setError(null);
      const result = computeKundali(input);
      setKundali(result);
      setScreen('results');
    } catch (e) {
      console.error('Kundali computation error:', e);
      setError('An error occurred while computing the Kundali. Please check your birth details and try again.');
      setScreen('input');
    }
  };

  const handleBack = () => {
    setScreen('input');
    // Clear share param from URL
    const url = new URL(window.location.href);
    url.searchParams.delete('k');
    window.history.replaceState({}, '', url);
  };

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF7ED', fontFamily: 'serif' }}>
        <div style={{ background: 'white', borderRadius: 12, padding: 28, maxWidth: 400, border: '1px solid #FDE68A', textAlign: 'center' }}>
          <p style={{ fontSize: 32, margin: '0 0 12px' }}>⚠️</p>
          <p style={{ color: '#92400E', fontSize: 14, marginBottom: 16 }}>{error}</p>
          <button onClick={() => setError(null)}
            style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: '#7C3AED', color: 'white', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (screen === 'results' && kundali) {
    return <ResultsPage kundali={kundali} onBack={handleBack} lang={lang} onLangChange={handleLangChange} />;
  }

  return <InputForm onSubmit={handleSubmit} lang={lang} onLangChange={handleLangChange} />;
}
