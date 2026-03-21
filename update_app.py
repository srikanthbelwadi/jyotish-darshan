import sys, re

with open('src/App.jsx', 'r') as f:
    text = f.read()

# 1. Add new imports
imports_to_add = """import DailyCalendar from './components/DailyCalendar.jsx';
import CompatibilityMatch from './components/CompatibilityMatch.jsx';
import CompatibilityInputForm from './components/CompatibilityInputForm.jsx';
"""
if "import DailyCalendar" not in text:
    text = text.replace("import LifeDimensionsCard from './components/LifeDimensionsCard.jsx';", 
                        "import LifeDimensionsCard from './components/LifeDimensionsCard.jsx';\n" + imports_to_add)

# 2. Modify TABS_DEF to only technical tabs
if "const TABS_DEF" in text:
    text = re.sub(
        r"const TABS_DEF=\[.*?\];", 
        """const TABS_DEF=[
  {id:'charts',label:'Charts',icon:'⊞'},
  {id:'planets',label:'Graha Sthiti',icon:'♃'},
  {id:'dasha',label:'Dasha',icon:'⏳'},
  {id:'yoga',label:'Yoga & Dosha',icon:'⚡'},
  {id:'shadbala',label:'Shadbala',icon:'⚖'},
  {id:'avarga',label:'Ashtakavarga',icon:'🔢'},
  {id:'reading',label:'Expert Reading',icon:'📜'},
];""", 
        text, 
        flags=re.DOTALL
    )

# 3. Modify ResultsPage
# It's large, so we search for the start and the end of ResultsPage
start_idx = text.find('function ResultsPage({K,onBack,lang,setLang}){')
end_idx = text.find('// ════════════════════════════════════════════════════════════════\n// ROOT APP')

if start_idx != -1 and end_idx != -1:
    old_results_page = text[start_idx:end_idx]
    
    new_results_page = """function ResultsPage({K,onBack,lang,setLang}){
    React.useEffect(() => { window.scrollTo({top: 0, behavior: 'smooth'}); }, []);
  const[tab,setTab]=React.useState('charts');
  const[fmt,setFmt]=React.useState('south');
  const[copied,setCopied]=React.useState(false);
  const[partnerKundali, setPartnerKundali]=React.useState(null);
  const[showPartnerForm, setShowPartnerForm]=React.useState(false);

  const{input,lagna,panchang:pan,ayanamsaDMS,planets}=K;
  const lpan=localizePanchang(pan,lang);
  const formattedDate=new Date(input.year,input.month-1,input.day).toLocaleDateString(lang==='en'?'en-IN':lang==='hi'?'hi-IN':lang==='kn'?'kn-IN':lang==='te'?'te-IN':lang==='ta'?'ta-IN':lang==='mr'?'mr-IN':lang==='gu'?'gu-IN':lang==='bn'?'bn-IN':lang==='ml'?'ml-IN':'en-IN',{day:'numeric',month:'long',year:'numeric'});
  
  async function handleShare() {
    if (navigator.share) {
      try {
        const moonRashi = planets.find(p=>p.name==='Moon')?.rashi ?? 0;
        await navigator.share({
          title: `Vedic Birth Chart - ${input.city}`,
          text: `Kundali for ${formattedDate} at ${input.tob}.\\nLagna: ${(L_RASHI[lang]||L_RASHI.en)[lagna.rashi]} | Moon Sign: ${(L_RASHI[lang]||L_RASHI.en)[moonRashi]}`,
          url: window.location.href,
        });
      } catch (err) { console.error('Error sharing', err); }
    } else {
      share();
    }
  }

  function share(){
    try{
      const d={y:input.year,mo:input.month,d:input.day,h:input.hour,mi:input.minute,ut:input.utcOffset,la:input.lat,ln:input.lng,ci:input.city,co:input.country,tz:input.timezone,ge:input.gender};
      const url=`${location.origin}${location.pathname}?k=${btoa(encodeURIComponent(JSON.stringify(d)))}`;
      navigator.clipboard.writeText(url).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2200)});
    }catch(e){}
  }

  return(
    <div style={{minHeight:'100vh',background:'var(--bg-dark)'}}>
      {/* Action Bar */}
      <div className="no-print" style={{maxWidth:1100,margin:'0 auto',padding:'24px 40px 0',display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,flexWrap:'wrap'}}>
        <button onClick={onBack} className="lux-btn" style={{padding:'8px 16px',background:'transparent',border:'1px solid var(--border-light)',color:'var(--text-main)',boxShadow:'none'}}>
          ← {t('back',lang)}
        </button>
        <div style={{display:'flex', gap:10}}>
          <button onClick={handleShare} className="lux-btn" style={{padding:'8px 16px'}}>
            ⇧ {t('share',lang)}
          </button>
          <button onClick={()=>downloadPDF(K,lang)} className="lux-btn" style={{padding:'8px 16px',background:'var(--accent-gold)',color:'#000'}}>
            ↓ {t('download',lang)}
          </button>
        </div>
      </div>
      {/* Banner */}
      <div style={{background:'var(--bg-header-gradient)',borderBottom:'1px solid var(--border-light)',padding:'30px 40px'}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <h2 className="serif" style={{margin:'0 0 12px',fontSize:24,fontWeight:400,color:'var(--accent-gold)',letterSpacing:1.5}}>{t('inputTitle',lang)} — {input.city}, {input.country}</h2>
          <div style={{display:'flex',flexWrap:'wrap',gap:'14px 28px',fontSize:13,color:'var(--text-secondary)',marginBottom:16}}>
            <span>📅 {formattedDate}, {input.tob}</span>
            <span>�� {input.lat?.toFixed(3)}°N, {input.lng?.toFixed(3)}°E</span>
            <span>🔷 {t('ov.ayanamsa',lang)}: {ayanamsaDMS}</span>
            <span>♑ {t('ov.lagna',lang)}: {(L_RASHI[lang]||L_RASHI.en)[lagna.rashi]} {lagna.degFmt}</span>
          </div>
          <div style={{display:'flex',flexWrap:'wrap',gap:'8px 12px'}}>
            {[[t('ov.tithi',lang),lpan.tithi],[t('ov.vara',lang),lpan.vara],[t('ov.nakshatra',lang),lpan.nakshatra],[t('ov.yoga',lang),lpan.yoga],[t('ov.karana',lang),lpan.karana]].map(([k,v])=>(
              <span key={k} style={{background:'var(--bg-card)',border:'1px solid var(--border-light)',color:'var(--text-main)',padding:'6px 14px',borderRadius:6,fontSize:12,boxShadow:'0 4px 10px rgba(0,0,0,0.5)'}}><strong style={{color:'var(--accent-gold)'}}>{k}:</strong> {v}</span>
            ))}
          </div>
        </div>
      </div>

      <div style={{maxWidth:1100,margin:'0 auto',padding:'40px 24px 80px'}}>
        
        {/* Layer 1: My Insights */}
        <div style={{ marginBottom: 60 }}>
          <h2 className="serif" style={{color:'var(--accent-gold)', borderBottom:'1px solid var(--border-light)', paddingBottom:'12px', marginBottom: '24px'}}>✧ My Insights</h2>
          <DailyCalendar kundali={K} lang={lang} />
          <OverviewTab K={K} fmt={fmt} lang={lang}/>
          <LifeDimensionsCard kundali={K} />
          <PredictionsTab K={K} lang={lang}/>
        </div>

        {/* Layer 2: Relational (Add Partner) */}
        <div style={{ marginBottom: 60, padding: '24px', background: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="serif" style={{color:'var(--text-main)', margin: 0}}>💞 Relationship Compatibility</h2>
            {!partnerKundali && !showPartnerForm && (
              <button onClick={() => setShowPartnerForm(true)} className="lux-btn" style={{ background: 'var(--accent-gold)', color: '#000', padding: '8px 24px', fontSize: '14px' }}>
                ＋ Add Partner
              </button>
            )}
          </div>
          
          {showPartnerForm && (
            <CompatibilityInputForm onGeneratePartner={(pk) => { setPartnerKundali(pk); setShowPartnerForm(false); }} onCancel={() => setShowPartnerForm(false)} lang={lang} />
          )}
          {partnerKundali && (
            <CompatibilityMatch primaryKundali={K} partnerKundali={partnerKundali} lang={lang} />
          )}
        </div>

        {/* Layer 3: Jyotish Desk (Technical Charts) */}
        <div>
          <h2 className="serif" style={{color:'var(--text-main)', borderBottom:'1px solid var(--border-light)', paddingBottom:'12px', marginBottom: '24px'}}>⌬ Jyotish Desk (Technical Area)</h2>
          
          <div className="no-print" style={{background:'var(--bg-surface)',border:'1px solid var(--border-light)', borderRadius: '8px', marginBottom: '24px', overflow:'hidden'}}>
            <div style={{display:'flex',overflowX:'auto',whiteSpace:'nowrap',scrollbarWidth:'none', padding: '0 8px'}}>
              {TABS_DEF.map(tb=><button key={tb.id} onClick={()=>setTab(tb.id)} className={`lux-tab ${tab===tb.id?'active':''}`}><span style={{fontSize:14,marginRight:6}}>{tb.icon}</span>{t(`tabs.${tb.id}`,lang)}</button>)}
            </div>
          </div>
          
          <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
            {tab==='charts'&&<ChartsTab K={K} fmt={fmt} setFmt={setFmt} lang={lang}/>}
            {tab==='planets'&&<PlanetsTab K={K} lang={lang}/>}
            {tab==='dasha'&&<DashaTab K={K} lang={lang}/>}
            {tab==='yoga'&&<YogaTab K={K} lang={lang}/>}
            {tab==='shadbala'&&<ShadbalaTab K={K} lang={lang}/>}
            {tab==='avarga'&&<AshtakavargaTab K={K} lang={lang}/>}
            {tab==='reading'&&<ExpertReadingTab K={K} lang={lang}/>}
          </div>
        </div>

      </div>
      <footer className="no-print" style={{textAlign:'center',padding:'24px',borderTop:'1px solid var(--border-light)',background:'var(--bg-dark)'}}>
        <p style={{margin:0,fontSize:12,color:'var(--text-muted)'}}>{t('footer',lang)}</p>
      </footer>
    </div>
  );
}

"""
    text = text.replace(old_results_page, new_results_page)

with open('src/App.jsx', 'w') as f:
    f.write(text)

print("App.jsx updated perfectly.")
