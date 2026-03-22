import { useState, useEffect, useRef } from 'react';
import { LANGUAGES } from '../i18n/astroTerms.js';

const INPUT_STYLE = {
  width: '100%', padding: '11px 14px', borderRadius: 8,
  border: '1.5px solid #D4B896', fontSize: 14,
  fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none',
  transition: 'border-color 0.15s', background: 'white', color: '#1E3A5F',
};

const LABEL_STYLE = {
  display: 'block', fontSize: 11, fontWeight: 700, color: '#1E3A5F',
  marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1,
};

export default function InputForm({ onSubmit, lang, onLangChange }) {
  const [form, setForm] = useState({
    day: '', month: '', year: '', tob: '', city: '', country: 'India', gender: '',
    lat: null, lng: null, timezone: null, utcOffset: null,
  });
  const [loading, setLoading] = useState(false);
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [cityQuery, setCityQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [errors, setErrors] = useState({});
  const [err, setErr] = useState('');
  const [name, setName] = useState('');
  const debounceRef = useRef(null);

  // Geocode city via GeoNames
  const searchCity = async (query) => {
    if (query.length < 3) { setCitySuggestions([]); return; }
    try {
      const res = await fetch(
        `https://secure.geonames.org/searchJSON?q=${encodeURIComponent(query)}&maxRows=6&username=demo&featureClass=P&orderby=population`
      );
      const data = await res.json();
      if (data.geonames) {
        setCitySuggestions(data.geonames.map(g => ({
          name: g.name,
          country: g.countryName,
          lat: parseFloat(g.lat),
          lng: parseFloat(g.lng),
          timezone: g.timezone?.timeZoneId || 'UTC',
          adminName: g.adminName1,
          displayName: `${g.name}${g.adminName1 ? ', ' + g.adminName1 : ''}, ${g.countryName}`,
        })));
      }
    } catch {
      // Fallback: hardcoded major Indian cities
      const FALLBACK_CITIES = [
        { name: 'Bangalore', country: 'India', lat: 12.9716, lng: 77.5946, timezone: 'Asia/Kolkata', displayName: 'Bangalore, Karnataka, India' },
        { name: 'Mumbai', country: 'India', lat: 19.0760, lng: 72.8777, timezone: 'Asia/Kolkata', displayName: 'Mumbai, Maharashtra, India' },
        { name: 'Delhi', country: 'India', lat: 28.6139, lng: 77.2090, timezone: 'Asia/Kolkata', displayName: 'Delhi, India' },
        { name: 'Chennai', country: 'India', lat: 13.0827, lng: 80.2707, timezone: 'Asia/Kolkata', displayName: 'Chennai, Tamil Nadu, India' },
        { name: 'Hyderabad', country: 'India', lat: 17.3850, lng: 78.4867, timezone: 'Asia/Kolkata', displayName: 'Hyderabad, Telangana, India' },
        { name: 'Kolkata', country: 'India', lat: 22.5726, lng: 88.3639, timezone: 'Asia/Kolkata', displayName: 'Kolkata, West Bengal, India' },
        { name: 'Pune', country: 'India', lat: 18.5204, lng: 73.8567, timezone: 'Asia/Kolkata', displayName: 'Pune, Maharashtra, India' },
        { name: 'Ahmedabad', country: 'India', lat: 23.0225, lng: 72.5714, timezone: 'Asia/Kolkata', displayName: 'Ahmedabad, Gujarat, India' },
      ].filter(c => c.name.toLowerCase().includes(query.toLowerCase()));
      setCitySuggestions(FALLBACK_CITIES);
    }
  };

  const handleCityInput = (e) => {
    const q = e.target.value;
    setCityQuery(q);
    setForm(f => ({ ...f, city: q, lat: null, lng: null }));
    setShowSuggestions(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchCity(q), 350);
  };

  const selectCity = (city) => {
    setCityQuery(city.displayName);
    // Get UTC offset from timezone
    const offset = getUTCOffset(city.timezone);
    setForm(f => ({
      ...f,
      city: city.name,
      country: city.country,
      lat: city.lat,
      lng: city.lng,
      timezone: city.timezone,
      utcOffset: offset,
    }));
    setShowSuggestions(false);
    setCitySuggestions([]);
    setErrors(e => ({ ...e, city: null }));
  };

  function getUTCOffset(tzId, year, month, day, hour, minute) {
    try {
      if (!year) {
        const d = new Date();
        year = d.getFullYear(); month = d.getMonth() + 1; day = d.getDate();
        hour = 12; minute = 0;
      }
      const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute));
      const str = new Intl.DateTimeFormat('en-US', {
        timeZone: tzId,
        year: 'numeric', month: 'numeric', day: 'numeric',
        hour: 'numeric', minute: 'numeric', second: 'numeric',
        hour12: false
      }).format(utcDate);
      
      const [datePart, timePart] = str.split(', ');
      const [m, d, y] = datePart.split('/');
      let [h, min, s] = timePart.split(':');
      // handle 24h 24:00 edge case from Intl API
      if (h === '24') h = '00';
      
      const targetTimeAsUTC = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d), Number(h), Number(min), Number(s)));
      const offsetMs = targetTimeAsUTC.getTime() - utcDate.getTime();
      return offsetMs / 3600000;
    } catch (err) {
      return 5.5; 
    } 
  }

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!form.day || !form.month || !form.year) e.dob = 'Complete date of birth is required';
    if (!form.tob) e.tob = 'Time of birth is required';
    if (!form.lat) e.city = 'Please select a city from the dropdown';
    if (!form.gender) e.gender = 'Please select a gender';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const year = Number(form.year);
    const month = Number(form.month);
    const day = Number(form.day);
    const dob = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const [hour, minute] = form.tob.split(':').map(Number);
    const preciseOffset = getUTCOffset(form.timezone, year, month, day, hour, minute);
    setTimeout(() => {
      onSubmit({ name: name.trim() || 'Anonymous', year, month, day, hour, minute, utcOffset: preciseOffset, lat: form.lat, lng: form.lng, city: form.city, country: form.country, timezone: form.timezone, gender: form.gender, dob, tob: form.tob });
    }, 800);
  };

  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (loading) {
      const timer = setInterval(() => setProgress(p => Math.min(p + 15, 90)), 100);
      return () => clearInterval(timer);
    } else setProgress(0);
  }, [loading]);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #FFF7ED 0%, #F5F0FF 50%, #FFF1F2 100%)', display: 'flex', flexDirection: 'column', fontFamily: "'Noto Serif', Georgia, serif" }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 24px', borderBottom: '1px solid #E5D5C0', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, background: 'linear-gradient(135deg, #7C3AED, #F59E0B)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: 'white', fontSize: 20 }}>☀</span>
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, color: '#1E3A5F', letterSpacing: 1 }}>Jyotish Darshan</h1>
            <p style={{ margin: 0, fontSize: 10, color: '#9CA3AF', letterSpacing: 2 }}>VEDIC BIRTH CHART · ज्योतिष दर्शन</p>
          </div>
        </div>
        <select value={lang} onChange={e => onLangChange(e.target.value)}
          style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #D4B896', background: 'white', fontFamily: 'inherit', fontSize: 13, color: '#1E3A5F', cursor: 'pointer' }}>
          {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.nativeName}</option>)}
        </select>
      </header>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '32px 24px 16px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.06) 0%, transparent 70%)' }} />
        <div style={{ fontSize: 48, marginBottom: 8 }}>☽ ✦ ☀</div>
        <h2 style={{ margin: '0 0 8px', fontSize: 26, color: '#1E3A5F', letterSpacing: 0.5 }}>Janma Kundali</h2>
        <p style={{ margin: 0, color: '#6B7280', fontSize: 14, maxWidth: 460, marginInline: 'auto' }}>
          Enter your birth details to generate a complete, consultation-grade Vedic birth chart rooted in the Lahiri Ayanamsa tradition.
        </p>
      </div>

      {/* Main Form Card */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '12px 24px 40px' }}>
        <div style={{ width: '100%', maxWidth: 520, background: 'white', borderRadius: 18, boxShadow: '0 8px 40px rgba(124,58,237,0.1)', border: '1px solid #E5D5C0', overflow: 'hidden' }}>
          {/* Card header */}
          <div style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)', padding: '22px 28px', color: 'white' }}>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600 }}>Birth Details (जन्म विवरण)</h3>
            <p style={{ margin: '5px 0 0', fontSize: 12, opacity: 0.8 }}>All 5 fields are required for accurate chart generation</p>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: '24px 28px' }}>
            {/* ROW 0: Name (New Phase 3) */}
            <div style={{ marginBottom: 18 }}>
              <label style={LABEL_STYLE}>Full Name</label>
              <input type="text" value={name} onChange={e=>{setName(e.target.value); setErrors(er=>({...er, name: null}))}} placeholder="Enter name (e.g. Rahul)..." style={{...INPUT_STYLE, borderColor: errors.name ? '#EF4444' : '#D4B896'}} required />
              {errors.name && <p style={{ color: '#EF4444', fontSize: 11, marginTop: 3 }}>{errors.name}</p>}
            </div>

            {/* ROW 1: DATE & TIME */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 14, marginBottom: 18 }}>
              <div>
                <label style={LABEL_STYLE}>Date of Birth</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr', gap: 6 }}>
                  <select required value={form.day} onChange={e=>{setForm(f=>({...f, day: e.target.value}));setErrors(er=>({...er, dob: null}))}} style={{...INPUT_STYLE, padding:'11px 8px', borderColor: errors.dob ? '#EF4444' : '#D4B896'}}>
                    <option value="" disabled>Day</option>
                    {Array.from({length:31},(_,i)=>i+1).map(d=><option key={d} value={d}>{d}</option>)}
                  </select>
                  <select required value={form.month} onChange={e=>{setForm(f=>({...f, month: e.target.value}));setErrors(er=>({...er, dob: null}))}} style={{...INPUT_STYLE, padding:'11px 8px', borderColor: errors.dob ? '#EF4444' : '#D4B896'}}>
                    <option value="" disabled>Month</option>
                    {['January','February','March','April','May','June','July','August','September','October','November','December'].map((m,i)=><option key={m} value={i+1}>{m}</option>)}
                  </select>
                  <select required value={form.year} onChange={e=>{setForm(f=>({...f, year: e.target.value}));setErrors(er=>({...er, dob: null}))}} style={{...INPUT_STYLE, padding:'11px 8px', borderColor: errors.dob ? '#EF4444' : '#D4B896'}}>
                    <option value="" disabled>Year</option>
                    {Array.from({length:125},(_,i)=>new Date().getFullYear()-i).map(y=><option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                {errors.dob && <p style={{ color: '#EF4444', fontSize: 11, marginTop: 3 }}>{errors.dob}</p>}
              </div>
              <div>
                <label style={LABEL_STYLE}>Time of Birth</label>
                <input type="time" required value={form.tob}
                  onChange={e => { setForm(f => ({...f, tob: e.target.value})); setErrors(er => ({...er, tob: null})); }}
                  style={{ ...INPUT_STYLE, borderColor: errors.tob ? '#EF4444' : '#D4B896' }} />
                {errors.tob && <p style={{ color: '#EF4444', fontSize: 11, marginTop: 3, gridColumn:'1 / -1' }}>{errors.tob}</p>}
              </div>
            </div>
            <p style={{ margin: '-10px 0 16px', fontSize: 11, color: '#9CA3AF' }}>⚠ Birth time accuracy is critical — even 15 minutes can shift the Ascendant</p>

            {/* City Autocomplete */}
            <div style={{ marginBottom: 18, position: 'relative' }}>
              <label style={LABEL_STYLE}>City of Birth</label>
              <input type="text" placeholder="Type city name (e.g. Bangalore, Mumbai, New York)..."
                value={cityQuery}
                onChange={handleCityInput}
                onFocus={() => citySuggestions.length > 0 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 180)}
                style={{ ...INPUT_STYLE, borderColor: errors.city ? '#EF4444' : '#D4B896' }} />
              {errors.city && <p style={{ color: '#EF4444', fontSize: 11, marginTop: 3 }}>{errors.city}</p>}
              {showSuggestions && citySuggestions.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #D4B896', borderRadius: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.12)', zIndex: 100, maxHeight: 220, overflowY: 'auto', marginTop: 4 }}>
                  {citySuggestions.map((c, i) => (
                    <div key={i} onMouseDown={() => selectCity(c)}
                      style={{ padding: '10px 14px', cursor: 'pointer', fontSize: 13, color: '#1E3A5F', borderBottom: '1px solid #F3F4F6', transition: 'background 0.1s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#F5F0FF'}
                      onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                      <strong>{c.name}</strong>
                      <span style={{ color: '#9CA3AF', fontSize: 12 }}>{c.displayName.replace(c.name, '')}</span>
                    </div>
                  ))}
                </div>
              )}
              {form.lat && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5 }}>
                  <span style={{ fontSize: 10, color: '#10B981' }}>✓</span>
                  <span style={{ fontSize: 11, color: '#10B981' }}>
                    {form.lat.toFixed(4)}°N, {form.lng.toFixed(4)}°E · {form.timezone}
                  </span>
                </div>
              )}
            </div>

            {/* Country (auto-filled) */}
            {form.country && (
              <div style={{ marginBottom: 18 }}>
                <label style={LABEL_STYLE}>Country</label>
                <div style={{ padding: '10px 14px', borderRadius: 8, border: '1.5px solid #E5D5C0', background: '#FAFAF8', fontSize: 14, color: '#6B7280' }}>
                  {form.country}
                </div>
              </div>
            )}

            {/* Gender */}
            <div style={{ marginBottom: 26 }}>
              <label style={{ ...LABEL_STYLE, marginBottom: 10 }}>Gender (लिंग)</label>
              <div style={{ display: 'flex', gap: 10 }}>
                {['Male', 'Female', 'Other'].map(g => (
                  <button key={g} type="button" onClick={() => { setForm(f => ({...f, gender: g})); setErrors(er => ({...er, gender: null})); }}
                    style={{ flex: 1, padding: '10px', borderRadius: 8,
                      border: form.gender === g ? '2px solid #7C3AED' : '1.5px solid #D4B896',
                      background: form.gender === g ? '#F5F0FF' : 'white',
                      color: form.gender === g ? '#7C3AED' : '#1E3A5F',
                      fontWeight: form.gender === g ? 700 : 400,
                      cursor: 'pointer', fontSize: 14, fontFamily: 'inherit',
                      transition: 'all 0.15s' }}>
                    {g}
                  </button>
                ))}
              </div>
              {errors.gender && <p style={{ color: '#EF4444', fontSize: 11, marginTop: 4 }}>{errors.gender}</p>}
            </div>

            {/* Ayanamsa selector */}
            <div style={{ marginBottom: 20, padding: '12px 14px', background: '#F8F5FF', borderRadius: 8, border: '1px solid #E0D7F5' }}>
              <label style={{ ...LABEL_STYLE, marginBottom: 8, color: '#7C3AED' }}>Ayanamsa System</label>
              <div style={{ fontSize: 12, color: '#6B7280' }}>🔷 Lahiri (NC Lahiri) — Indian Government Standard <span style={{ color: '#7C3AED', fontWeight: 600 }}>Default</span></div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '15px', borderRadius: 10, border: 'none',
                background: loading ? '#C4B5FD' : 'linear-gradient(135deg, #7C3AED, #6D28D9)',
                color: 'white', fontSize: 16, fontWeight: 700,
                cursor: loading ? 'default' : 'pointer', fontFamily: 'inherit',
                letterSpacing: 0.5, transition: 'all 0.2s', boxShadow: loading ? 'none' : '0 4px 15px rgba(124,58,237,0.3)' }}>
              {loading ? '⟳  Calculating planetary positions...' : '✦  Generate Kundali'}
            </button>

            {loading && (
              <div style={{ marginTop: 14 }}>
                <div style={{ width: '100%', height: 4, background: '#E5D5C0', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #7C3AED, #F59E0B)', borderRadius: 2, transition: 'width 0.1s' }} />
                </div>
                <p style={{ fontSize: 11, color: '#7C3AED', marginTop: 8, textAlign: 'center' }}>
                  Computing planetary positions using Lahiri Ayanamsa...
                </p>
              </div>
            )}
          </form>

          {/* Footer */}
          <div style={{ padding: '12px 28px 20px', borderTop: '1px solid #F3F4F6', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 11, color: '#9CA3AF' }}>
              🔒 Your birth data is computed locally. No data is stored on servers.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
