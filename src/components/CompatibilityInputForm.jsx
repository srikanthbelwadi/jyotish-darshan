import React, { useState, useRef } from 'react';

export default function CompatibilityInputForm({ onGeneratePartner, onCancel, t=(x)=>x, lang }) {
  const [form, setForm] = useState({
    name: '', dob: '', tob: '', city: '', country: '', lat: null, lng: null, timezone: '', gender: ''
  });
  const [cityQ, setCityQ] = useState('');
  const [suggs, setSuggs] = useState([]);
  const [showS, setShowS] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errs, setErrs] = useState({});
  const dbRef = useRef(null);

  const txt = (key, fallback) => {
    const r = t(key, lang);
    return r === key ? fallback : r;
  };

  const LS = { display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--accent-gold)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 };

  const searchCity = async (q) => {
    if (q.length < 3) { setSuggs([]); return; }
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&language=en&format=json`);
      const data = await res.json();
      if (data.results) {
         setSuggs(data.results.map(g => ({
           name: g.name, country: g.country, lat: g.latitude, lng: g.longitude,
           timezone: g.timezone || 'UTC', disp: `${g.name}${g.admin1 ? ', ' + g.admin1 : ''}, ${g.country}`
         })));
      } else {
         setSuggs([]);
      }
    } catch (e) {
      setSuggs([]);
    }
  };

  const selectCity = (c) => {
    setCityQ(c.disp);
    setForm(f => ({ ...f, city: c.name, country: c.country, lat: c.lat, lng: c.lng, timezone: c.timezone }));
    setShowS(false);
    setSuggs([]);
    setErrs(e => ({...e, city: null}));
  };

  const getUTCOffset = (tzId, year, month, day, hour, minute) => {
    try {
      const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute));
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: tzId, year: 'numeric', month: 'numeric', day: 'numeric',
        hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false
      });
      const parts = formatter.formatToParts(utcDate);
      const getVal = (type) => parts.find(p => p.type === type)?.value || '0';
      const yStr = getVal('year');
      const mStr = getVal('month');
      const dStr = getVal('day');
      let hStr = getVal('hour');
      const minStr = getVal('minute');
      const sStr = getVal('second');
      if (hStr === '24') hStr = '00';
      const targetTimeAsUTC = new Date(Date.UTC(Number(yStr), Number(mStr) - 1, Number(dStr), Number(hStr), Number(minStr), Number(sStr)));
      const offsetMs = targetTimeAsUTC.getTime() - utcDate.getTime();
      const diff = offsetMs / 3600000;
      return isNaN(diff) ? 5.5 : diff;
    } catch (err) {
      return 5.5; 
    } 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrs = {};
    if (!form.name) newErrs.name = 'Required';
    if (!form.dob) newErrs.dob = 'Required';
    if (!form.tob) newErrs.tob = 'Required';
    if (!form.lat) newErrs.city = 'Required';
    if (!form.gender) newErrs.gender = 'Required';
    if (Object.keys(newErrs).length > 0) { setErrs(newErrs); return; }
    
    setLoading(true);
    let y = 1970, m = 1, d = 1;
    let dClean = form.dob.trim();
    if (dClean.includes('/')) {
      const parts = dClean.split('/');
      if (parts[2].length === 4) {
        y = Number(parts[2]);
        let p0 = Number(parts[0]), p1 = Number(parts[1]);
        if (p0 > 12) { d = p0; m = p1; } else { m = p0; d = p1; }
      } else if (parts[0].length === 4) {
        y = Number(parts[0]); m = Number(parts[1]); d = Number(parts[2]);
      }
    } else if (dClean.includes('-')) {
      const parts = dClean.split('-');
      if (parts[2].length === 4) {
        y = Number(parts[2]);
        let p0 = Number(parts[0]), p1 = Number(parts[1]);
        if (p0 > 12) { d = p0; m = p1; } else { m = p0; d = p1; }
      } else {
        y = Number(parts[0]); m = Number(parts[1]); d = Number(parts[2]);
      }
    } else {
      const dt = new Date(dClean);
      if (!isNaN(dt)) { y = dt.getFullYear(); m = dt.getMonth() + 1; d = dt.getDate(); }
    }
    
    // Safety fallback to prevent crashes
    if (isNaN(y) || isNaN(m) || isNaN(d)) { y = 2000; m = 1; d = 1; }
    
    let h = 12, min_ = 0;
    if (form.tob) {
      let rawT = form.tob.trim().toUpperCase();
      let isPM = rawT.includes('PM');
      let isAM = rawT.includes('AM');
      let cleanT = rawT.replace(/[^0-9:]/g, '');
      const parts = cleanT.split(':');
      h = Number(parts[0]); if (isNaN(h)) h = 12;
      min_ = Number(parts[1]); if (isNaN(min_)) min_ = 0;
      if (isPM && h < 12) h += 12;
      if (isAM && h === 12) h = 0;
    }
    
    const offset = getUTCOffset(form.timezone, y, m, d, h, min_);

    const inputData = {
      name: form.name || txt('comp.partner', "Partner"),
      year: y, month: m, day: d,
      hour: h, minute: min_,
      city: form.city, country: form.country,
      lat: form.lat, lng: form.lng, dob: form.dob, tob: form.tob,
      timezone: form.timezone, utcOffset: offset, gender: form.gender
    };

    setTimeout(() => {
        onGeneratePartner(inputData);
    }, 50);
  };

  return (
    <div className="lux-card" style={{ width: '100%', maxWidth: 580, padding: 0, overflow: 'visible', margin: '0 auto', background: 'var(--bg-card)' }}>
      <div style={{ padding: '24px 34px', borderBottom: '1px solid var(--border-light)' }}>
        <h3 className="serif" style={{ margin: 0, fontSize: 20, fontWeight: 400, color: 'var(--accent-gold)', letterSpacing: 1.5 }}>
          {txt('comp.addPartner', 'Add Companion Chart')}
        </h3>
        <p style={{ margin: '6px 0 0', fontSize:   17, color: 'var(--text-muted)' }}>{txt('formNote', 'Enter the precise birth specifics of the partner to calculate synastry resonances.')}</p>
      </div>

      <form onSubmit={handleSubmit} style={{ padding: '34px' }}>
        <div style={{ marginBottom: 20 }}>
          <label style={LS}>{txt('comp.partnerName', 'Partner Name')}</label>
          <input type="text" required placeholder="Enter companion's name" value={form.name}
            onChange={e => { setForm(f => ({...f, name: e.target.value})); setErrs(er => ({...er, name: null})) }}
            className="lux-input" style={{ borderColor: errs.name ? '#EF4444' : undefined }} />
          {errs.name && <p style={{ color: '#EF4444', fontSize: 11, marginTop: 4 }}>{errs.name}</p>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
          <div>
            <label style={LS}>{txt('dob', 'Date of Birth')}</label>
            <input type="date" required value={form.dob} max={new Date().toISOString().slice(0,10)} min="1900-01-01"
              onChange={e => { setForm(f => ({...f, dob: e.target.value})); setErrs(er => ({...er, dob: null})) }}
              className="lux-input" style={{ borderColor: errs.dob ? '#EF4444' : undefined }} />
            {errs.dob && <p style={{ color: '#EF4444', fontSize: 11, marginTop: 4 }}>{errs.dob}</p>}
          </div>
          <div>
            <label style={LS}>{txt('tob', 'Time of Birth')}</label>
            <input type="time" required value={form.tob}
              onChange={e => { setForm(f => ({...f, tob: e.target.value})); setErrs(er => ({...er, tob: null})) }}
              className="lux-input" style={{ borderColor: errs.tob ? '#EF4444' : undefined }} />
            {errs.tob && <p style={{ color: '#EF4444', fontSize: 11, marginTop: 4 }}>{errs.tob}</p>}
          </div>
        </div>
        
        <p style={{ margin: '-10px 0 16px', fontSize:   16, color: 'var(--text-muted)' }}>{txt('inputAccuracy', 'A known time of birth is required for precise astrological accuracy.')}</p>
        
        <div style={{ marginBottom: 20, position: 'relative' }}>
          <label style={LS}>{txt('city', 'City')}</label>
          <input type="text" placeholder={txt('cityPlaceholder', 'Search birth city...')} value={cityQ}
            onChange={e => { setCityQ(e.target.value); setForm(f => ({...f, lat: null})); setShowS(true); clearTimeout(dbRef.current); dbRef.current = setTimeout(() => searchCity(e.target.value), 300) }}
            onFocus={() => suggs.length > 0 && setShowS(true)}
            onBlur={() => setTimeout(() => setShowS(false), 180)}
            className="lux-input" style={{ borderColor: errs.city ? '#EF4444' : undefined }} />
          {errs.city && <p style={{ color: '#EF4444', fontSize: 11, marginTop: 4 }}>{errs.city}</p>}
          
          {showS && suggs.length > 0 && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-input)', border: '1px solid var(--accent-gold)', borderRadius: 8, boxShadow: '0 10px 30px rgba(0,0,0,0.8)', zIndex: 100, maxHeight: 220, overflowY: 'auto', marginTop: 4 }}>
              {suggs.map((c, i) => (
                <div key={i} onMouseDown={() => selectCity(c)}
                  style={{ padding: '12px 16px', cursor: 'pointer', fontSize: 14, color: 'var(--text-main)', borderBottom: '1px solid var(--border-light)', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <strong style={{ color: 'var(--accent-gold)', fontWeight: 500 }}>{c.name}</strong> <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{c.disp.replace(c.name, '')}</span>
                </div>
              ))}
            </div>
          )}
          {form.lat && <p style={{ fontSize:   16, color: '#10B981', marginTop: 6 }}>✓ {form.lat.toFixed(3)}°, {form.lng.toFixed(3)}° · {form.timezone}</p>}
        </div>
        
        {form.country && <div style={{ marginBottom: 24 }}>
          <label style={LS}>{txt('country', 'Country')}</label>
          <div style={{ padding: '14px 16px', borderRadius: 6, border: '1px solid var(--border-light)', background: 'rgba(255,255,255,0.02)', fontSize: 14, color: 'var(--text-secondary)' }}>{form.country}</div>
        </div>}
        
        <div style={{ marginBottom: 30 }}>
          <label style={{ ...LS, marginBottom: 12 }}>{txt('gender', 'Gender')}</label>
          <div style={{ display: 'flex', gap: 10 }}>
            {[['Male', txt('male', 'Male')], ['Female', txt('female', 'Female')], ['Other', txt('other', 'Other')]].map(([val, lbl]) => (
              <button key={val} type="button" onClick={() => { setForm(f => ({...f, gender: val})); setErrs(er => ({...er, gender: null})) }}
                style={{ flex: 1, padding: '12px', borderRadius: 6, border: form.gender === val ? '1px solid var(--accent-gold)' : '1px solid var(--border-light)', background: form.gender === val ? 'var(--bg-dark)' : 'transparent', color: form.gender === val ? 'var(--accent-gold)' : 'var(--text-secondary)', fontWeight: form.gender === val ? 500 : 400, cursor: 'pointer', fontSize: 14, fontFamily: 'inherit', transition: 'all 0.3s ease', boxShadow: form.gender === val ? '0 0 10px var(--accent-glow)' : 'none' }}>
                {lbl}
              </button>
            ))}
          </div>
          {errs.gender && <p style={{ color: '#EF4444', fontSize: 11, marginTop: 4 }}>{errs.gender}</p>}
        </div>
        
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button type="button" onClick={onCancel} className="lux-btn" style={{ flex: 1, background: 'transparent', border: '1px solid var(--border-light)', color: 'var(--text-main)', padding: '16px', fontSize: 15 }}>
             <strong style={{ letterSpacing: 1 }}>{txt('comp.cancel', 'CANCEL')}</strong>
          </button>
          <button type="submit" disabled={loading} className="lux-btn" style={{ flex: 2, padding: '16px', background: 'var(--accent-gold)', color: '#000', border: 'none', fontSize: 15 }}>
            <strong style={{ letterSpacing: 1 }}>{loading ? txt('comp.match', 'CALCULATE SYNASTRY') + '...' : txt('comp.match', 'CALCULATE SYNASTRY')}</strong>
          </button>
        </div>
      </form>
    </div>
  );
}
