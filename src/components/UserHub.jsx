import React, { useState, useRef, useEffect } from 'react';

export default function UserHub({ user, syncStatus, syncToast, onLoginClick, onLogoutClick, onForceSync, onSelectProfile, onTriggerAdmin }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getStatusColor = () => {
    if (syncStatus === 'synced') return '#10B981'; // Green
    if (syncStatus === 'syncing') return '#F59E0B'; // Orange
    if (syncStatus === 'error') return '#EF4444'; // Red
    return '#6B7280'; // Gray offline
  };

  const getStatusText = () => {
    if (syncStatus === 'synced') return 'Synced';
    if (syncStatus === 'syncing') return 'Syncing...';
    if (syncStatus === 'error') return 'Sync Failed';
    return 'Offline';
  };

  const savedProfiles = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('jd_profiles') || '[]');
      return saved.filter(p => !p.isDeleted);
    } catch(e) {
      return [];
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Toast Notification positioned absolutely to visually pop near the hub */}
      {syncToast && (
        <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', width: '280px', background: 'var(--accent-gold)', color: 'var(--bg-app)', padding: '12px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(255,215,0,0.4)', zIndex: 60, animation: 'fadeIn 0.3s', fontFamily: 'var(--font-serif)', border: '1px solid #fff' }}>
          {syncToast}
        </div>
      )}

      {/* Avatar Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'var(--bg-card)', border: '1px solid var(--accent-gold)', borderRadius: '50%', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', boxShadow: '0 2px 8px rgba(0,0,0,0.2)', transition: 'all 0.2s', padding: 0
        }}
        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {user ? (
          <span style={{ color: 'var(--accent-gold)', fontSize: '18px', fontWeight: 'bold', fontFamily: 'var(--font-serif)' }}>
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </span>
        ) : (
          <span style={{ color: 'var(--text-muted)', fontSize: '20px' }}>👤</span>
        )}

        {/* Status Dot */}
        {user && (
           <span style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '12px', height: '12px', background: getStatusColor(), borderRadius: '50%', border: '2px solid var(--bg-card)', zIndex: 2 }} />
        )}
      </button>

      {/* Dropdown Box */}
      {isOpen && (
        <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '12px', width: '320px', background: 'var(--bg-app)', border: '1px solid var(--border-light)', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)', zIndex: 100, overflow: 'hidden' }}>
          
          {/* Header */}
          <div style={{ padding: '24px', borderBottom: '1px solid var(--border-light)', background: 'var(--bg-surface)' }}>
             {user ? (
               <>
                 <h3 style={{ margin: '0 0 4px 0', color: 'var(--accent-gold)', fontSize: '18px', fontFamily: 'var(--font-serif)', textTransform: 'uppercase' }}>{user.name}</h3>
                 <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>{user.email}</p>
               </>
             ) : (
               <>
                 <h3 style={{ margin: '0 0 4px 0', color: 'var(--text-main)', fontSize: '18px', fontFamily: 'var(--font-serif)', textTransform: 'uppercase' }}>Guest Mode</h3>
                 <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>Not logged in</p>
               </>
             )}
          </div>

          {/* Body */}
          <div style={{ padding: '24px' }}>
             {/* Info Panel */}
             <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold', marginBottom: '8px' }}>Saved Profiles ({savedProfiles().length})</div>
                {savedProfiles().length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '160px', overflowY: 'auto', paddingRight: '4px' }}>
                    {savedProfiles().map((p, idx) => (
                      <button 
                        key={p.id || idx}
                        onClick={() => { setIsOpen(false); if(onSelectProfile) onSelectProfile(p); }}
                        style={{ background: 'var(--bg-input)', border: '1px solid var(--border-light)', padding: '10px 12px', borderRadius: '6px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--accent-gold)'; e.currentTarget.style.background = 'var(--bg-card)'; }}
                        onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.background = 'var(--bg-input)'; }}
                      >
                         <span style={{ color: 'var(--text-main)', fontSize: '14px', fontFamily: 'var(--font-serif)', fontWeight: 'bold' }}>{p.name}</span>
                         <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>➔</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '12px', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '13px', fontStyle: 'italic', textAlign: 'center' }}>
                    No saved profiles yet.
                  </div>
                )}
             </div>

             {/* Action Phase */}
             {user ? (
               <>
                 {/* Cloud Engine State */}
                 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold', marginBottom: '4px' }}>Sync Status</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: getStatusColor() }}></span>
                        <span style={{ fontSize: '13px', color: 'var(--text-main)' }}>{getStatusText()}</span>
                      </div>
                    </div>
                    <button 
                      onClick={onForceSync}
                      disabled={syncStatus === 'syncing'}
                      style={{ background: 'transparent', border: '1px solid var(--accent-gold)', color: 'var(--accent-gold)', padding: '6px 12px', borderRadius: '4px', cursor: syncStatus === 'syncing' ? 'default' : 'pointer', fontSize: '12px', opacity: syncStatus === 'syncing' ? 0.5 : 1, transition: 'all 0.2s' }}
                      onMouseOver={e => { if(syncStatus !== 'syncing'){ e.currentTarget.style.background = 'var(--accent-gold)'; e.currentTarget.style.color = '#000'; }}}
                      onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--accent-gold)'; }}
                    >
                       {syncStatus === 'syncing' ? '↻ Syncing...' : 'Sync Now'}
                    </button>
                 </div>
                 
                 {user?.email?.toLowerCase() === 'srikanthbelwadi@gmail.com' && (
                    <button onClick={() => { setIsOpen(false); if(onTriggerAdmin) onTriggerAdmin(); }} style={{ width: '100%', padding: '12px', border: 'none', background: '#10B981', color: '#fff', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'var(--font-serif)', letterSpacing: '1px', marginBottom: '12px', boxShadow: '0 4px 15px rgba(16,185,129,0.3)' }} onMouseOver={e => e.currentTarget.style.opacity = '0.8'} onMouseOut={e => e.currentTarget.style.opacity = '1'}>
                       ★ CPO Admin Console
                    </button>
                 )}

                 <button onClick={() => { setIsOpen(false); onLogoutClick(); }} style={{ width: '100%', padding: '12px', border: '1px solid var(--border-light)', background: 'transparent', color: 'var(--text-muted)', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'var(--font-serif)', letterSpacing: '1px' }} onMouseOver={e => { e.currentTarget.style.borderColor = '#EF4444'; e.currentTarget.style.color = '#EF4444'; }} onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
                    Logout
                 </button>
               </>
             ) : (
               <>
                 <p style={{ color: 'var(--text-main)', fontSize: '13px', lineHeight: 1.6, marginBottom: '24px' }}>
                   Log in to safely backup and access your profiles across all your devices.
                 </p>
                 <button onClick={() => { setIsOpen(false); onLoginClick(); }} style={{ width: '100%', padding: '12px', border: 'none', background: 'var(--accent-gold)', color: '#000', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'var(--font-serif)', letterSpacing: '1px', boxShadow: '0 4px 15px rgba(255,215,0,0.3)' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    Login / Register
                 </button>
               </>
             )}
          </div>
        </div>
      )}
    </div>
  );
}
