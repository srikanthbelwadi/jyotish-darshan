import re

# 1. Update CompatibilityInputForm to match the main InputForm's dropdown style, remove Name, and don't call window.getKundali
form_content = """import React from 'react';

export default function CompatibilityInputForm({ onGeneratePartner, onCancel, lang }) {
  const [date, setDate] = React.useState('');
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
    if (!date || !time || !selectedCity) {
      alert("Please fill date, time and select a valid city from the dropdown.");
      return;
    }
    
    setLoading(true);
    const [y, m, d] = date.split('-');
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
      <h3 style={{ margin: '0 0 16px', color: 'var(--accent-gold)' }}>Add Partner Details</h3>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px', gridTemplateColumns: '1fr 1fr' }}>
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="lux-input" required />
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
          <button type="button" onClick={onCancel} className="lux-btn" style={{ background: 'transparent', border: '1px solid var(--border-light)', color: 'var(--text-main)' }}>Cancel</button>
          <button type="submit" disabled={loading} className="lux-btn" style={{ background: 'var(--accent-gold)', color: '#000', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Matching...' : 'Match Charts'}
          </button>
        </div>
      </form>
    </div>
  );
}
"""
with open('src/components/CompatibilityInputForm.jsx', 'w') as f:
    f.write(form_content)

# 2. Update matchmaking logic to compute Mangalik Dosha and Nadi
matchmaking_content = """export function calculateMatch(k1, k2) {
  const getMoonData = (k) => {
    const moon = k.planets.find(p => p.key === 'moon') || { rashi: 0, nakshatra: 0 };
    return {
      name: k.name || (k.input && k.input.name) || 'User',
      rashi: moon.rashi,
      nakshatra: moon.nakshatra
    };
  };

  const getMarsHouse = (k) => {
    const mars = k.planets.find(p => p.key === 'mars');
    return mars ? mars.house : 0;
  };

  const p1 = getMoonData(k1);
  const p2 = getMoonData(k2);
  
  const m1 = getMarsHouse(k1);
  const m2 = getMarsHouse(k2);
  const isM1 = [1, 4, 7, 8, 12].includes(m1);
  const isM2 = [1, 4, 7, 8, 12].includes(m2);

  let manglikStatus = "";
  if (isM1 && isM2) manglikStatus = "Both are Manglik. Manglik Dosha is cancelled, allowing for excellent marital harmony.";
  else if (!isM1 && !isM2) manglikStatus = "Neither is Manglik. No Manglik Dosha present.";
  else manglikStatus = "Manglik Dosha Present! One partner is Manglik while the other is not. This can cause significant friction in marriage unless specific astrological remedies are performed.";

  const NAK_NAMES = ['Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishta','Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati'];
  const RASHI_NAMES = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

  const diffNak = Math.abs(p1.nakshatra - p2.nakshatra);
  const diffRashi = Math.abs(p1.rashi - p2.rashi);

  const varnaScore = (diffRashi % 2 === 0) ? 1.0 : 0.5;
  const varnaDesc = varnaScore === 1.0 ? "Excellent compatibility in foundational egos and work ethic." : "Average compatibility in ego and societal perspectives.";

  const vashyaScore = (diffRashi === 2 || diffRashi === 10) ? 0.5 : (diffRashi % 3 === 0) ? 2.0 : 1.0;
  const vashyaDesc = vashyaScore === 2.0 ? "High magnetic attraction and mutual understanding of power dynamics." : "Moderate mutual attraction; requires conscious effort to avoid control struggles.";

  const taraScore = ((p1.nakshatra + p2.nakshatra) % 9 === 3 || (p1.nakshatra + p2.nakshatra) % 9 === 5) ? 1.5 : 3.0;
  const taraDesc = taraScore === 3.0 ? "Strong alignment in destiny and mutual well-being. Your life phases synchronize well." : "Destinies may sometimes clash, demanding patience during challenging life periods.";

  const yoniScore = (diffNak % 5 === 0) ? 4.0 : (diffNak % 3 === 0) ? 2.0 : 1.0;
  const yoniDesc = yoniScore === 4.0 ? "Perfect biological and intimate harmony. You intuitively understand each other's physical needs." : "Average physical harmony. Open communication about intimacy is vital for long-term satisfaction.";

  const grahaScore = (diffRashi === 0 || diffRashi === 4 || diffRashi === 8) ? 5.0 : (diffRashi === 6) ? 0.5 : 3.0;
  const grahaDesc = grahaScore === 5.0 ? "Outstanding mental friendship and psychological alignment. You genuinely enjoy each other's minds." : "Moderate mental compatibility. Differing viewpoints must be respected as unique strengths.";

  const gana1 = p1.nakshatra % 3; 
  const gana2 = p2.nakshatra % 3;
  const ganaScore = (gana1 === gana2) ? 6.0 : (Math.abs(gana1 - gana2) === 1) ? 3.0 : 0.0;
  const ganaDesc = ganaScore === 6.0 ? "Perfectly matched core temperaments. You approach life's challenges with the same instinctive attitude." : "Clashing core temperaments. One partner may feel the other is too aggressive or too passive.";

  const bhakootScore = (diffRashi === 1 || diffRashi === 11) ? 0.0 : (diffRashi === 4 || diffRashi === 8) ? 7.0 : 3.5;
  const bhakootDesc = bhakootScore === 7.0 ? "Excellent synergy for mutual growth and enduring love. You naturally support each other's expansion." : "Challenging growth dynamics. Financial or emotional friction may occasionally arise.";

  const nadi1 = p1.nakshatra % 3; 
  const nadi2 = p2.nakshatra % 3;
  const nadiScore = (nadi1 !== nadi2) ? 8.0 : 0.0;
  const nadiDesc = nadiScore === 8.0 ? "Optimal genetic and physiological compatibility. Indicates excellent vitality and family health prospects." : "Nadi Dosha present. Astrologically indicates potential genetic clashes or shared health vulnerabilities.";

  const totalScore = varnaScore + vashyaScore + taraScore + yoniScore + grahaScore + ganaScore + bhakootScore + nadiScore;

  let summary = "";
  if (totalScore >= 26) summary = "A Highly Excellent Match. Exceptional alignment across mental, physical, and spiritual dimensions.";
  else if (totalScore >= 18) summary = "A Good, Stable Match. Solid foundation, with typical relationship adjustments required.";
  else summary = "A Challenging Match. Requires immense patience, understanding, and conscious effort to sustain harmony.";

  return {
    p1: { name: p1.name, rashi: RASHI_NAMES[p1.rashi], nakshatra: NAK_NAMES[p1.nakshatra], isManglik: isM1 },
    p2: { name: p2.name, rashi: RASHI_NAMES[p2.rashi], nakshatra: NAK_NAMES[p2.nakshatra], isManglik: isM2 },
    totalScore,
    maxScore: 36,
    summary,
    manglikStatus,
    elements: [
      { name: 'Varna (Work Ethic)', score: varnaScore, max: 1, desc: varnaDesc },
      { name: 'Vashya (Attraction)', score: vashyaScore, max: 2, desc: vashyaDesc },
      { name: 'Tara (Destiny)', score: taraScore, max: 3, desc: taraDesc },
      { name: 'Yoni (Intimacy)', score: yoniScore, max: 4, desc: yoniDesc },
      { name: 'Graha Maitri (Friendship)', score: grahaScore, max: 5, desc: grahaDesc },
      { name: 'Gana (Temperament)', score: ganaScore, max: 6, desc: ganaDesc },
      { name: 'Bhakoot (Growth)', score: bhakootScore, max: 7, desc: bhakootDesc },
      { name: 'Nadi (Genetics)', score: nadiScore, max: 8, desc: nadiDesc },
    ]
  };
}
"""
with open('src/engine/matchmaking.js', 'w') as f:
    f.write(matchmaking_content)

# 3. Update CompatibilityMatch.jsx to show Manglik Dosha
ui_content = """import React from 'react';
import { calculateMatch } from '../engine/matchmaking.js';

export default function CompatibilityMatch({ primaryKundali, partnerKundali, lang }) {
  const match = calculateMatch(primaryKundali, partnerKundali);

  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--accent-gold)', 
      borderRadius: '12px', padding: '30px', marginTop: '20px', color: 'var(--text-main)',
      boxShadow: '0 8px 32px rgba(212, 175, 55, 0.1)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px', marginBottom: '24px' }}>
        <h3 style={{ margin: 0, color: 'var(--accent-gold)', fontSize: '22px' }}>💞 Ashtakoota Milan</h3>
        <div style={{
          padding: '8px 16px', borderRadius: '20px', border: '2px solid var(--accent-gold)',
          fontSize: '20px', fontWeight: 'bold', color: 'var(--accent-gold)', background: 'var(--bg-dark)'
        }}>
          {match.totalScore} / 36
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)', textAlign: 'center' }}>
          <h4 style={{ margin: '0 0 8px', color: 'var(--text-main)', fontSize: '18px' }}>{match.p1.name}</h4>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Moon Rashi: <span style={{color:'var(--accent-gold)'}}>{match.p1.rashi}</span></div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Nakshatra: <span style={{color:'var(--accent-gold)'}}>{match.p1.nakshatra}</span></div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '6px' }}>Manglik: <span style={{color: match.p1.isManglik ? '#EF4444' : '#10B981'}}>{match.p1.isManglik ? 'Yes' : 'No'}</span></div>
        </div>
        <div style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)', textAlign: 'center' }}>
          <h4 style={{ margin: '0 0 8px', color: 'var(--text-main)', fontSize: '18px' }}>{match.p2.name}</h4>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Moon Rashi: <span style={{color:'var(--accent-gold)'}}>{match.p2.rashi}</span></div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Nakshatra: <span style={{color:'var(--accent-gold)'}}>{match.p2.nakshatra}</span></div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '6px' }}>Manglik: <span style={{color: match.p2.isManglik ? '#EF4444' : '#10B981'}}>{match.p2.isManglik ? 'Yes' : 'No'}</span></div>
        </div>
      </div>

      <div style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: '8px', borderLeft: '4px solid var(--accent-gold)', marginBottom: '16px' }}>
        <h4 style={{ margin: '0 0 8px', color: 'var(--accent-gold)' }}>Compatibility Verdict</h4>
        <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.6' }}>{match.summary}</p>
      </div>

      <div style={{ background: 'var(--bg-dark)', padding: '16px', borderRadius: '8px', borderLeft: match.manglikStatus.includes('Present!') ? '4px solid #EF4444' : '4px solid #10B981', marginBottom: '32px' }}>
        <h4 style={{ margin: '0 0 8px', color: match.manglikStatus.includes('Present!') ? '#EF4444' : '#10B981' }}>Kuja (Manglik) Dosha Evaluation</h4>
        <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.6', color: 'var(--text-main)' }}>{match.manglikStatus}</p>
      </div>

      <h4 style={{ margin: '0 0 16px', fontSize: '18px', color: 'var(--text-main)' }}>8-Koota Breakdown & Explanation</h4>
      <div style={{ display: 'grid', gap: '16px' }}>
        {match.elements.map((el, i) => (
          <div key={i} style={{ background: 'var(--bg-dark)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--accent-gold)' }}>{el.name}</span>
              <span style={{ fontSize: '14px', background: 'var(--bg-surface)', padding: '4px 10px', borderRadius: '4px', border: '1px solid var(--border-light)' }}>
                {el.score} / {el.max}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{el.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
"""
with open('src/components/CompatibilityMatch.jsx', 'w') as f:
    f.write(ui_content)

# 4. Patch App.jsx (ResultsPage component's CompatibilityInputForm handler)
with open('src/App.jsx', 'r') as f:
    text = f.read()

# Replace the previous invalid invocation:
# <CompatibilityInputForm onGeneratePartner={(pk) => { setPartnerKundali(pk); setShowPartnerForm(false); }} onCancel={() => setShowPartnerForm(false)} lang={lang} />
# With a try-catch calling computeKundali
old_handler = "<CompatibilityInputForm onGeneratePartner={(pk) => { setPartnerKundali(pk); setShowPartnerForm(false); }} "
new_handler = """<CompatibilityInputForm onGeneratePartner={(inputParams) => { 
            try { 
              const pk = computeKundali(inputParams); 
              pk.name = inputParams.name;
              setPartnerKundali(pk); 
              setShowPartnerForm(false); 
            } catch(e) { 
              alert("Error computing astrological chart. Please verify the birth details."); 
              setShowPartnerForm(false);
            } 
          }} """

if old_handler in text:
    text = text.replace(old_handler, new_handler)

with open('src/App.jsx', 'w') as f:
    f.write(text)

