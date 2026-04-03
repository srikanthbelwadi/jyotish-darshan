import React, { useState, useEffect } from 'react';
import { usePreferences } from '../../contexts/PreferencesContext';
import { DYNAMIC_STRINGS } from '../../i18n/dynamicTranslations';
import { useSync } from '../../contexts/SyncContext';
import { fetchCloudDepartedSouls, syncDepartedSoulsToCloud } from '../../firebase';

export default function MemorialSettings({ isOpen, onClose }) {
  const { lang } = usePreferences();
  const t = (key, defaultText) => {
    return (DYNAMIC_STRINGS[lang] || DYNAMIC_STRINGS.en)[key] || DYNAMIC_STRINGS.en[key] || defaultText;
  };
  const { user } = useSync();
  const [souls, setSouls] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // New entry form state
  const [newName, setNewName] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newPlace, setNewPlace] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (isOpen && user?.uid) {
      loadSouls();
    }
  }, [isOpen, user]);

  const loadSouls = async () => {
    setLoading(true);
    try {
      const data = await fetchCloudDepartedSouls(user.uid);
      setSouls(data || []);
    } catch (e) {
      console.error("Failed to load departed souls", e);
    }
    setLoading(false);
  };

  const handleSaveAll = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      await syncDepartedSoulsToCloud(user.uid, souls);
      onClose();
    } catch (e) {
      console.error("Failed to sync souls", e);
    }
    setLoading(false);
  };

  const handleAdd = () => {
    if (souls.length >= 5) return;
    if (!newName || !newDate) return;
    
    const newEntry = {
      id: (typeof window !== 'undefined' && window.crypto && typeof window.crypto.randomUUID === 'function') ? window.crypto.randomUUID() : (Math.random().toString(36).substr(2, 9) + Date.now().toString(36)),
      name: newName,
      date: newDate,
      time: newTime || '12:00',
      place: newPlace || 'Unknown'
    };
    
    setSouls([...souls, newEntry]);
    
    setNewName('');
    setNewDate('');
    setNewTime('');
    setNewPlace('');
    setIsAdding(false);
  };

  const handleDelete = (id) => {
    setSouls(souls.filter(s => s.id !== id));
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="lux-card" style={{ width: '100%', maxWidth: 500, animation: 'slideIn 0.3s ease', maxHeight: '90vh', overflowY: 'auto' }}>
        <h2 style={{ margin: '0 0 10px', color: 'var(--accent-gold)', fontSize: 24 }}>{t("pc.mem.title", "Ancestors & Memorials")}</h2>
        <p style={{ color: 'var(--text-muted)', fontSize:   17, marginBottom: 20, lineHeight: 1.5 }}>
          {t("pc.mem.desc", "Track the annual ceremonial dates (Varshika Tithi) for departed souls. The Panchang calendar will automatically identify these sacred dates based on the precise Lunar Month and Tithi of their passing.")}
        </p>
        
        {loading ? (
          <p style={{ color: 'var(--accent-gold)' }}>{t("pc.mem.loading", "Loading...")}</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 15, marginBottom: 20 }}>
            {souls.length === 0 && !isAdding && (
              <p style={{ color: 'var(--text-muted)', fontSize:  16, fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>
                {t("pc.mem.noDates", "No memorial dates added.")}
              </p>
            )}

            {souls.map(soul => (
              <div key={soul.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, background: 'var(--bg-layer-2)', borderRadius: 8, border: '1px solid var(--border-light)' }}>
                <div>
                  <strong style={{ color: 'var(--text-main)', display: 'block', fontSize: 15 }}>{soul.name}</strong>
                  <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{soul.date} {soul.time && `· ${soul.time}`} {soul.place && `· ${soul.place}`}</span>
                </div>
                <button 
                  onClick={() => handleDelete(soul.id)}
                  style={{ background: 'transparent', border: '1px solid var(--border-light)', color: '#EF4444', padding: '6px 12px', minWidth: 'max-content', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}
                >
                  {t('pc.mem.remove', 'Remove')}
                </button>
              </div>
            ))}

            {souls.length < 5 && !isAdding && (
              <button 
                onClick={() => setIsAdding(true)}
                style={{ width: '100%', padding: 12, borderRadius: 8, background: 'var(--bg-layer-2)', border: '1px dashed var(--accent-gold)', color: 'var(--accent-gold)', cursor: 'pointer', transition: 'all 0.2s', fontSize: 14 }}
              >
                {t("pc.mem.addBtn", "+ Add Departed Soul")} ({souls.length}/5)
              </button>
            )}

            {souls.length >= 5 && !isAdding && (
              <p style={{ color: 'var(--text-muted)', fontSize:   16, textAlign: 'center' }}>{t("pc.mem.maxLimit", "Maximum limit of 5 entries reached.")}</p>
            )}

            {isAdding && (
              <div style={{ background: 'var(--bg-layer-1)', padding: 16, borderRadius: 8, border: '1px solid var(--border-light)' }}>
                <h3 style={{ margin: '0 0 15px', fontSize: 14, color: 'var(--accent-gold)' }}>{t("pc.mem.newEntry", "New Memorial Entry")}</h3>
                
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: 12, marginBottom: 5 }}>{t("pc.mem.nameLbl", "Name")}</label>
                  <input type="text" value={newName} onChange={e => setNewName(e.target.value)} className="lux-input" placeholder={t("pc.mem.namePh", "Name of the departed...")} style={{ width: '100%' }} />
                </div>
                
                <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: 12, marginBottom: 5 }}>{t("pc.mem.dateLbl", "Date of Passing")}</label>
                    <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="lux-input" style={{ width: '100%' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: 12, marginBottom: 5 }}>{t("pc.mem.timeLbl", "Time (Optional)")}</label>
                    <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} className="lux-input" style={{ width: '100%' }} />
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: 12, marginBottom: 5 }}>{t("pc.mem.placeLbl", "Place (Optional)")}</label>
                  <input type="text" value={newPlace} onChange={e => setNewPlace(e.target.value)} className="lux-input" placeholder={t("pc.mem.placePh", "Location of passing...")} style={{ width: '100%' }} />
                </div>

                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button onClick={() => setIsAdding(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13 }}>{t("pc.mem.cancel", "Cancel")}</button>
                  <button onClick={handleAdd} disabled={!newName || !newDate} className="lux-btn" style={{ padding: '8px 16px', fontSize: 13, opacity: (!newName || !newDate) ? 0.5 : 1 }}>{t("pc.mem.saveEntry", "Save Entry")}</button>
                </div>
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', borderTop: '1px solid var(--border-light)', paddingTop: 20 }}>
          <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer', padding: '8px 16px' }}>{t("pc.mem.discard", "Discard Changes")}</button>
          <button type="button" onClick={handleSaveAll} disabled={loading} className="lux-btn" style={{ padding: '10px 24px' }}>{loading ? t('pc.mem.saving', 'Saving...') : t('pc.mem.saveMem', 'Save Memorials')}</button>
        </div>
      </div>
    </div>
  );
}
