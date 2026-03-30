import os

filepath = "src/components/tabs/MockDashboard.jsx"
with open(filepath, "r", encoding="utf-8") as f:
    lines = f.readlines()

new_lines = []
skip = False

for i, line in enumerate(lines):
    if "const [cache, setCache] = React.useState({});" in line and "isMinimized" not in lines[i+3]:
        new_lines.append(line)
        new_lines.append("  const [isMinimized, setIsMinimized] = React.useState(false);\n")
        continue
        
    if "setLoading(true);" in line and "setError(null);" in lines[i+1]:
        new_lines.append(line)
        new_lines.append(lines[i+1])
        new_lines.append("    setIsMinimized(false);\n")
        continue
        
    if "setError(null);" in line and "setIsMinimized" in new_lines[-1]:
        continue # skip the original since we just appended it

    if "        {cache[activeCacheKey] && (" in line and "minHeight: '50px'" in lines[i-1]:
        # start skip
        skip = True
        
        replacement = """               {cache[activeCacheKey] && (
                 <>
                   <button 
                     onClick={() => setIsMinimized(!isMinimized)}
                     title={isMinimized ? t('Expand Results', lang) : t('Minimize Results', lang)}
                     style={{ position: 'absolute', top: '16px', right: '16px', background: 'var(--bg-surface)', border: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '18px', cursor: 'pointer', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease', width: '36px', height: '36px', zIndex: 10, boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}
                     onMouseOver={e => { e.currentTarget.style.background = 'rgba(212,175,55,0.1)'; e.currentTarget.style.color = 'var(--accent-gold)'; e.currentTarget.style.borderColor = 'var(--accent-gold)'; }}
                     onMouseOut={e => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border-light)'; }}
                   >
                     {isMinimized ? '+' : '−'}
                   </button>
                   {!isMinimized && (
                     <button 
                       onClick={() => fetchOracle(true)}
                       title={t('Consult again (Override cache)', lang)}
                       style={{ position: 'absolute', top: '16px', right: '64px', background: 'var(--bg-surface)', border: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '18px', cursor: 'pointer', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease', width: '36px', height: '36px', zIndex: 10, boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}
                       onMouseOver={e => { e.currentTarget.style.background = 'rgba(212,175,55,0.1)'; e.currentTarget.style.transform = 'rotate(180deg)'; e.currentTarget.style.color = 'var(--accent-gold)'; e.currentTarget.style.borderColor = 'var(--accent-gold)'; }}
                       onMouseOut={e => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.transform = 'rotate(0deg)'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border-light)'; }}
                     >
                       ⟳
                     </button>
                   )}
                 </>
               )}
               
               {isMinimized && cache[activeCacheKey] ? (
                 <div style={{ padding: '24px', background: 'var(--bg-input)', border: '1px dashed var(--border-light)', borderRadius: '8px', textAlign: 'center', animation: 'fadeIn 0.3s ease' }}>
                    <p style={{ margin: 0, color: 'var(--accent-gold)', fontFamily: '"Cinzel", serif', fontSize: '16px' }}>{t('Oracle Insights Minimized', lang)}</p>
                 </div>
               ) : (
                 typeof cache[activeCacheKey] === 'string' ? (
                   <p style={{ margin: 0, fontSize: '18px', lineHeight: 1.6, color: 'var(--text-main)', fontFamily: 'serif', fontStyle: 'italic' }}>
                     "{cache[activeCacheKey] || t('Awaiting celestial alignment...')}"
                   </p>
                 ) : cache[activeCacheKey] ? (
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.4s ease' }}>
                     <div style={{ padding: '24px', background: 'var(--bg-input)', borderTop: '4px solid #ffd700', boxShadow: '0 4px 15px rgba(0,0,0,0.5)', textAlign: 'center' }}>
                       <div style={{ color: 'var(--accent-gold)', fontSize: '14px', fontWeight: 'bold', fontFamily: '"Cinzel", serif', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>{t('Predictive Trajectory')}</div>
                       <p style={{ color: 'var(--text-main)', fontSize: '18px', margin: 0, fontFamily: 'serif' }}>{cache[activeCacheKey].period}</p>
                     </div>
                     
                     <div style={{ padding: '24px', background: 'var(--bg-input)', borderTop: '4px solid #ffd700', boxShadow: '0 4px 15px rgba(0,0,0,0.5)', textAlign: 'center' }}>
                       <div style={{ color: 'var(--accent-gold)', fontSize: '14px', fontWeight: 'bold', fontFamily: '"Cinzel", serif', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>{t('Astrological Basis')}</div>
                       <p style={{ color: 'var(--text-main)', fontSize: '18px', margin: 0, fontFamily: 'serif' }}>{cache[activeCacheKey].basis}</p>
                     </div>
                     
                     <div style={{ padding: '24px', background: 'var(--bg-input)', borderTop: '4px solid #ffd700', boxShadow: '0 4px 15px rgba(0,0,0,0.5)', textAlign: 'center' }}>
                       <div style={{ color: 'var(--accent-gold)', fontSize: '14px', fontWeight: 'bold', fontFamily: '"Cinzel", serif', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>{t('Prophetic Assertions')}</div>
                       <p style={{ color: 'var(--text-main)', fontSize: '18px', margin: 0, fontFamily: 'serif', fontStyle: 'italic' }}>"{cache[activeCacheKey].assertions}"</p>
                     </div>
                     
                     <div style={{ padding: '24px', background: 'var(--bg-card)', borderTop: '4px solid var(--accent-gold)', boxShadow: '0 4px 15px rgba(0,0,0,0.5)', textAlign: 'center' }}>
                       <div style={{ color: 'var(--accent-gold)', fontSize: '14px', fontWeight: 'bold', fontFamily: '"Cinzel", serif', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>{t('Lifestyle & Preparedness')}</div>
                       <p style={{ color: 'var(--text-main)', fontSize: '18px', margin: 0, fontFamily: 'serif' }}>{cache[activeCacheKey].lifestyle}</p>
                     </div>
                     
                     <div style={{ padding: '24px', background: 'var(--bg-card)', borderTop: '2px dashed var(--border-light)', boxShadow: '0 4px 15px rgba(0,0,0,0.5)', textAlign: 'center' }}>
                       <div style={{ color: 'var(--text-main)', fontSize: '14px', fontWeight: 'bold', fontFamily: '"Cinzel", serif', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                         <span style={{ fontSize: '18px' }}>🕉️</span> {t('Shastric Mitigation')}
                       </div>
                       <p style={{ color: 'var(--text-main)', fontSize: '18px', margin: 0, fontFamily: 'serif' }}>{cache[activeCacheKey].mitigation}</p>
                     </div>
                   </div>
                 ) : (
                   <p style={{ margin: 0, fontSize: '18px', lineHeight: 1.6, color: 'var(--text-main)', fontFamily: 'serif' }}>
                     {t('Awaiting celestial alignment...')}
                   </p>
                 )
               )}
"""
        new_lines.append(replacement)
        
    if skip and "              </div>" in line and "           )}" in lines[i+1]:
        skip = False
        new_lines.append(line)
        continue
        
    if not skip:
        new_lines.append(line)

with open(filepath, "w", encoding="utf-8") as f:
    f.writelines(new_lines)

print("Patch applied to MockDashboard.jsx successfully.")
