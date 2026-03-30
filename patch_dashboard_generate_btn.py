import os

filepath = "src/components/tabs/MockDashboard.jsx"

with open(filepath, "r", encoding="utf-8") as f:
    text = f.read()

# 1. Update fetchOracle signature
old_sig = "const fetchOracle = React.useCallback(async (forceRegenerate = false) => {"
new_sig = "const fetchOracle = React.useCallback(async (forceRegenerate = false, autoFetch = true) => {"
text = text.replace(old_sig, new_sig)

# 2. Add autoFetch guard before hitting the API
old_fetch = """       // Fallback to active session mapping
       if (cache[cacheKey] && !forceRegenerate) return;
    }

    setLoading(true);"""
new_fetch = """       // Fallback to active session mapping
       if (cache[cacheKey] && !forceRegenerate) return;
    }

    if (!autoFetch && !forceRegenerate) return;

    setLoading(true);"""
text = text.replace(old_fetch, new_fetch)

# 3. Update useEffect so it checks cache without fetching
old_effect = """  React.useEffect(() => {
    fetchOracle();
  }, [fetchOracle]);"""
new_effect = """  React.useEffect(() => {
    fetchOracle(false, false);
  }, [fetchOracle]);"""
text = text.replace(old_effect, new_effect)

# 4. Replace placeholder text with Reveal Prediction Button
old_awaiting_text = """                ) : (
                  <p style={{ margin: 0, fontSize: '18px', lineHeight: 1.6, color: 'var(--text-main)', fontFamily: 'serif' }}>
                    {t('Awaiting celestial alignment...', lang)}
                  </p>
                )}"""
new_awaiting_text = """                ) : (
                  <div style={{ textAlign: 'center', padding: '32px 0' }}>
                     <button 
                       onClick={() => fetchOracle(false, true)}
                       style={{ 
                         padding: '16px 32px', fontSize: '16px', background: 'var(--accent-gold)', 
                         color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', 
                         fontFamily: '"Cinzel", serif', fontWeight: 'bold', textTransform: 'uppercase',
                         boxShadow: '0 4px 15px rgba(212,175,55,0.3)', transition: 'all 0.3s ease'
                       }}
                       onMouseOver={e => Object.assign(e.currentTarget.style, { transform: 'scale(1.05)', boxShadow: '0 6px 20px rgba(212,175,55,0.5)' })}
                       onMouseOut={e => Object.assign(e.currentTarget.style, { transform: 'scale(1)', boxShadow: '0 4px 15px rgba(212,175,55,0.3)' })}
                     >
                       {t('Reveal Prediction', lang)}
                     </button>
                  </div>
                )}"""
text = text.replace(old_awaiting_text, new_awaiting_text)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(text)

print("Patched MockDashboard.jsx successfully!")
