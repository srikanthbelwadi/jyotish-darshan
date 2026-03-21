import React from 'react';

export default function CompatibilityInputForm({ onGeneratePartner, onCancel, lang }) {
  const [name, setName] = React.useState('');
  const [date, setDate] = React.useState('');
  const [time, setTime] = React.useState('');
  const [city, setCity] = React.useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !date || !time || !city) return;
    
    // In a real app, we'd geocode the city and construct the partner kundali object.
    // For now, we mock a partner Kundali payload just to trigger the engine.
    const partnerKundali = {
       name,
       input: { date, time, city },
       planets: [{ name: 'Moon', rashi: 2, nakshatra: 5 }] // Mock data for compatibility
    };
    onGeneratePartner(partnerKundali);
  };

  return (
    <div style={{
      background: 'var(--bg-dark)', 
      border: '1px solid var(--border-light)', 
      borderRadius: '12px', 
      padding: '24px', 
      marginTop: '20px'
    }}>
      <h3 style={{ margin: '0 0 16px', color: 'var(--accent-gold)' }}>Add Partner Details</h3>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px', gridTemplateColumns: '1fr 1fr' }}>
        <input 
           placeholder="Partner's Name" 
           value={name} onChange={e=>setName(e.target.value)}
           className="lux-input" required 
           style={{ gridColumn: '1 / -1' }}
        />
        <input 
           type="date" 
           value={date} onChange={e=>setDate(e.target.value)}
           className="lux-input" required 
        />
        <input 
           type="time" 
           value={time} onChange={e=>setTime(e.target.value)}
           className="lux-input" required 
        />
        <input 
           placeholder="City of Birth" 
           value={city} onChange={e=>setCity(e.target.value)}
           className="lux-input" required 
           style={{ gridColumn: '1 / -1' }}
        />
        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
          <button type="button" onClick={onCancel} className="lux-btn" style={{ background: 'transparent', border: '1px solid var(--border-light)', color: 'var(--text-main)' }}>Cancel</button>
          <button type="submit" className="lux-btn" style={{ background: 'var(--accent-gold)', color: '#000' }}>Match Charts</button>
        </div>
      </form>
    </div>
  );
}
