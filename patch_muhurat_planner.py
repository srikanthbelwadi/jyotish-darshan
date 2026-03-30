import os

filepath = "src/components/tabs/MuhuratPlanner.jsx"
with open(filepath, "r", encoding="utf-8") as f:
    text = f.read()

# 1. Add isMinimized state
old_state = """  const [hasGenerated, setHasGenerated] = useState(false);
  const [monthOffset, setMonthOffset] = useState(0);"""
new_state = """  const [hasGenerated, setHasGenerated] = useState(false);
  const [monthOffset, setMonthOffset] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);"""
text = text.replace(old_state, new_state)

# 2. Reset in handleGenerate
old_gen = """    setHasGenerated(true);
    setCalculating(true);
    setSelectedDateStr(null);
    setAiAnalysis(null);"""
new_gen = """    setHasGenerated(true);
    setCalculating(true);
    setIsMinimized(false);
    setSelectedDateStr(null);
    setAiAnalysis(null);"""
text = text.replace(old_gen, new_gen)

# 3. Replace the actual minimize button logic
old_btn = """           {hasGenerated && (
             <button
                onClick={() => {
                   setHasGenerated(false);
                   setSelectedDateStr(null);
                   setAiAnalysis(null);
                }}
                style={{
                   padding: '0 16px', background: 'transparent', color: 'var(--text-muted)',
                   border: '2px dashed rgba(239, 68, 68, 0.4)', borderRadius: '8px', fontSize: '18px',
                   cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center'
                }}
                title={t("Minimize Results", lang)}
                onMouseOver={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
                onMouseOut={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)'; e.currentTarget.style.background = 'transparent'; }}
             >
                ✕
             </button>
           )}
        </div>
      </div>

      {hasGenerated && ("""

new_btn = """           {hasGenerated && (
             <button
                onClick={() => setIsMinimized(!isMinimized)}
                style={{
                   padding: '0 16px', background: 'transparent', color: 'var(--text-muted)',
                   border: '2px dashed var(--border-light)', borderRadius: '8px', fontSize: '18px',
                   cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center'
                }}
                title={isMinimized ? t("Expand Results", lang) : t("Minimize Results", lang)}
                onMouseOver={e => { e.currentTarget.style.color = 'var(--text-main)'; e.currentTarget.style.background = 'rgba(212, 175, 55, 0.1)'; e.currentTarget.style.borderColor = 'var(--accent-gold)'; }}
                onMouseOut={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border-light)'; }}
             >
                {isMinimized ? '+' : '−'}
             </button>
           )}
        </div>
      </div>

      {hasGenerated && isMinimized && (
         <div style={{ padding: '24px', background: 'var(--bg-input)', border: '1px dashed var(--border-light)', borderRadius: '8px', textAlign: 'center', animation: 'fadeIn 0.3s ease' }}>
            <p style={{ margin: 0, color: 'var(--accent-gold)', fontFamily: '"Cinzel", serif', fontSize: '16px' }}>{t('Muhurat Scan Minimized', lang)}</p>
         </div>
      )}

      {hasGenerated && !isMinimized && ("""
text = text.replace(old_btn, new_btn)

# 4. Fix spelling
text = text.replace('t("Select Live Event.."', 't("Select Life Event.."')

with open(filepath, "w", encoding="utf-8") as f:
    f.write(text)

print("MuhuratPlanner patched")
