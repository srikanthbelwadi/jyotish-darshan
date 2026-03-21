import React from 'react';

export default function CompatibilityInputForm({ onGeneratePartner, onCancel, t=(x)=>x, lang }) {
  const [day, setDay] = React.useState('');
  const [month, setMonth] = React.useState('');
  const [year, setYear] = React.useState('');
  const [time, setTime] = React.useState('');
  const [cityQ, setCityQ] = React.useState('');
  const [suggs, setSuggs] = React.useState([]);
  const [showS, setShowS] = React.useState(false);
  const [selectedCity, setSelectedCity] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  // Search city logic
  React.useEffect(() => {
    if (cityQ.length > 2) {
      fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityQ)}&count=5&language=en&format=json`)
        .then(r => r.json()).then(d => {
          if (d.results) {
            setSuggs(d.results.map(g => ({
              name: g.name, country: g.country, lat: g.latitude, lng: g.longitude,
              tz: g.timezone || 'UTC', disp: `${g.name}${g.admin1 ? ', ' + g.admin1 : ''}, ${g.country}`
            })));
            setShowS(true);
          }
        }).catch(() => {});
    } else {
      setShowS(false);
    }
  }, [cityQ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!day || !month || !year || !time || !selectedCity) {
      alert("Please fill date, time and select a valid city from the dropdown.");
      return;
    }
    
    setLoading(true);
    const y = Number(year);
    const m = Number(month);
    const d = Number(day);
    const [h, min_] = time.split(':');
    
    let offset = 5.5;
    try {
      const dt = new Date();
      const str = new Intl.DateTimeFormat('en-US', {timeZone: selectedCity.tz, year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false}).format(dt);
      const [dp, tp] = str.split(', ');
      const [mth, day, yr] = dp.split('/');
      let [hr, mn, s] = tp.split(':');
      if (hr === '24') hr = '00';
      const localTime = new Date(Date.UTC(Number(yr), Number(mth) - 1, Number(day), Number(hr), Number(mn), Number(s)));
      const utcTime = new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate(), dt.getUTCHours(), dt.getUTCMinutes(), dt.getUTCSeconds()));
      offset = (localTime.getTime() - utcTime.getTime()) / 3600000;
    } catch (e) { console.warn(e); }

    const inputData = {
      name: "Partner",
      year: Number(y), month: Number(m), day: Number(d),
      hour: Number(h), minute: Number(min_),
      city: selectedCity.name, country: selectedCity.country,
      lat: selectedCity.lat, lng: selectedCity.lng,
      timezone: selectedCity.tz, utcOffset: offset, gender: 'female'
    };

    setTimeout(() => {
        onGeneratePartner(inputData);
    }, 50);
  };

  return (
    <div style={{ background: 'var(--bg-dark)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '24px', marginTop: '20px' }}>
      <h3 style={{ margin: '0 0 16px', color: 'var(--accent-gold)' }}>{t('comp.addP',lang)}</h3>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px', gridTemplateColumns: '1.5fr 1fr' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr', gap: '6px' }}>
          <select required value={day} onChange={e=>setDay(e.target.value)} className="lux-input" style={{padding:'11px 8px'}}>
            <option value="" disabled>Day</option>
            {Array.from({length:31},(_,i)=>i+1).map(val=><option key={val} value={val}>{val}</option>)}
          </select>
          <select required value={month} onChange={e=>setMonth(e.target.value)} className="lux-input" style={{padding:'11px 8px'}}>
            <option value="" disabled>Month</option>
            {['January','February','March','April','May','June','July','August','September','October','November','December'].map((mName,i)=><option key={mName} value={i+1}>{mName}</option>)}
          </select>
          <select required value={year} onChange={e=>setYear(e.target.value)} className="lux-input" style={{padding:'11px 8px'}}>
            <option value="" disabled>Year</option>
            {Array.from({length:125},(_,i)=>new Date().getFullYear()-i).map(val=><option key={val} value={val}>{val}</option>)}
         </select>
        </div>

        <input type="time" value={time} onChange={e=>setTime(e.target.value)} className="lux-input" required />
        
        <div style={{ gridColumn: '1 / -1', position: 'relative' }}>
          <input placeholder="City of Birth (Type to search)" value={selectedCity ? selectedCity.disp : cityQ} onChange={e=>{setCityQ(e.target.value); setSelectedCity(null);}} onFocus={()=>{if(suggs.length)setShowS(true)}} onBlur={() => setTimeout(() => setShowS(false), 200)} className="lux-input" required autoComplete="off" />
          {showS && suggs.length > 0 && (
            <ul style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#1A1A1A', border: '1px solid var(--accent-gold)', listStyle: 'none', padding: 0, margin: '4px 0 0', borderRadius: 8, zIndex: 50, maxHeight: 200, overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.8)' }}>
              {suggs.map((s,i) => (
                <li key={i} onMouseDown={()=>{setSelectedCity(s); setShowS(false); setCityQ('');}} style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid rgba(212, 175, 55, 0.2)', color: 'var(--accent-gold)', fontSize: '14px', transition: 'background 0.2s', ':hover': {background: 'var(--bg-card)'} }}>
                  {s.disp}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
          <button type="button" onClick={onCancel} className="lux-btn" style={{ background: 'transparent', border: '1px solid var(--border-light)', color: 'var(--text-main)' }}>{t('comp.cancel',lang)}</button>
          <button type="submit" disabled={loading} className="lux-btn" style={{ background: 'var(--accent-gold)', color: '#000', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Matching...' : t('comp.match',lang)}
          </button>
        </div>
      </form>
    </div>
  );
}
