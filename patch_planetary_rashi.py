import re
import os

files_to_patch = [
    "src/App.jsx",
    "src/components/pdf/PrintLayout.jsx",
    "src/components/tabs/OverviewTab.jsx",
    "src/components/tabs/ChartsTab.jsx"
]

def patch_rashi_map(content):
    # This logic detects expressions like `(K.divCharts?.D9 || K.divisionalCharts?.D9)?.[p.key]??p.rashi`
    # and replaces them safely to evaluate the `.rashi` property first before coalescing.
    # It also handles `v` and `exp` map forms in App.jsx
    
    # 1. App.jsx specific: navP
    content = content.replace(
        "const navP=planets.map(p=>({...p,rashi:(K.divCharts?.D9 || K.divisionalCharts?.D9)?.[p.key]??p.rashi}));",
        "const navP=planets.map(p=>{const vD=(K.divCharts?.D9 || K.divisionalCharts?.D9)?.[p.key]; const nR=vD?.rashi??vD??p.rashi; const nH=((nR - ((K.divCharts?.D9 || K.divisionalCharts?.D9)?.lagna?.rashi ?? K.lagna.rashi) + 12)%12)+1; return {...p,rashi:nR,house:nH};});"
    )
    
    # 2. App.jsx specific: inline C Navamsa Component
    content = content.replace(
        "<C planets={K.planets.map(p=>({...p,rashi:(K.divCharts?.D9 || K.divisionalCharts?.D9)?.[p.key]??p.rashi}))} lagnaR={K.lagna.rashi} title={t('ov.navamsa',lang)||'D9 · Navamsa'} size={280} lang={lang}/>",
        "<C planets={K.planets.map(p=>{const vD=(K.divCharts?.D9 || K.divisionalCharts?.D9)?.[p.key]; const nR=vD?.rashi??vD??p.rashi; const nH=((nR - ((K.divCharts?.D9 || K.divisionalCharts?.D9)?.lagna?.rashi ?? K.lagna.rashi) + 12)%12)+1; return {...p,rashi:nR,house:nH};})} lagnaR={(K.divCharts?.D9 || K.divisionalCharts?.D9)?.lagna?.rashi ?? K.lagna.rashi} title={t('ov.navamsa',lang)||'D9 · Navamsa'} size={280} lang={lang}/>"
    )
    
    # 3. App.jsx specific: inline C Expanded Chart grid Component
    content = content.replace(
        "const ps=K.planets.map(p=>({...p,rashi:(K.divCharts || K.divisionalCharts)[v]?.[p.key]??p.rashi}));",
        "const ps=K.planets.map(p=>{const vD=(K.divCharts || K.divisionalCharts)[v]?.[p.key]; const nR=vD?.rashi??vD??p.rashi; const nH=((nR - ((K.divCharts || K.divisionalCharts)[v]?.lagna?.rashi ?? K.lagna.rashi) + 12)%12)+1; return {...p,rashi:nR,house:nH};});"
    )
    content = content.replace(
        "<C planets={ps} lagnaR={K.lagna.rashi} size={150} small lang={lang}/>",
        "<C planets={ps} lagnaR={(K.divCharts || K.divisionalCharts)[v]?.lagna?.rashi ?? K.lagna.rashi} size={150} small lang={lang}/>"
    )
    
    # 4. App.jsx specific: inline C Expanded Chart Full Component
    content = content.replace(
        "<C planets={K.planets.map(p=>({...p,rashi:(K.divCharts || K.divisionalCharts)[exp]?.[p.key]??p.rashi}))} lagnaR={K.lagna.rashi} size={300} lang={lang}/>",
        "<C planets={K.planets.map(p=>{const vD=(K.divCharts || K.divisionalCharts)[exp]?.[p.key]; const nR=vD?.rashi??vD??p.rashi; const nH=((nR - ((K.divCharts || K.divisionalCharts)[exp]?.lagna?.rashi ?? K.lagna.rashi) + 12)%12)+1; return {...p,rashi:nR,house:nH};})} lagnaR={(K.divCharts || K.divisionalCharts)[exp]?.lagna?.rashi ?? K.lagna.rashi} size={300} lang={lang}/>"
    )
    
    # 5. App.jsx specific: generic d9pl
    content = content.replace(
        "const d9pl=planets.map(p=>({...p,rashi:(K.divCharts?.D9 || K.divisionalCharts?.D9)?.[p.key]??p.rashi}));",
        "const d9pl=planets.map(p=>{const vD=(K.divCharts?.D9 || K.divisionalCharts?.D9)?.[p.key]; const nR=vD?.rashi??vD??p.rashi; const nH=((nR - ((K.divCharts?.D9 || K.divisionalCharts?.D9)?.lagna?.rashi ?? K.lagna.rashi) + 12)%12)+1; return {...p,rashi:nR,house:nH};});"
    )

    # 6. PrintLayout.jsx
    content = content.replace(
        "<DrawChart data={(planets || []).map(p => ({ ...p, rashi: ((divCharts?.D9 || divisionalCharts?.D9) || divisionalCharts?.D9)?.[p.key] ?? p.rashi }))} title=\"Navamsa Chart (D9)\" />",
        "<DrawChart data={(planets || []).map(p => {const vD=((divCharts?.D9 || divisionalCharts?.D9) || divisionalCharts?.D9)?.[p.key]; const nR=vD?.rashi??vD??p.rashi; const nH=((nR - ((divCharts?.D9 || divisionalCharts?.D9)?.lagna?.rashi ?? lagnaRashi) + 12)%12)+1; return { ...p, rashi: nR, house: nH };})} title=\"Navamsa Chart (D9)\" />"
    )

    # 7. PrintLayout.jsx: Need to ensure lagnaRashi is injected if it uses NorthIndian chart. But it uses DrawChart that maps to South/North internally?
    
    # 8. OverviewTab.jsx: rashi logic already correct? 
    # `rashi: kundali.divisionalCharts.D9?.[p.key]?.rashi ?? p.rashi`
    # Let's verify `OverviewTab.jsx` doesn't use `App.jsx` style object missing.
    content = content.replace(
        "rashi: kundali.divisionalCharts.D9?.[p.key]?.rashi ?? p.rashi,",
        "rashi: kundali.divisionalCharts?.D9?.[p.key]?.rashi ?? kundali.divisionalCharts?.D9?.[p.key] ?? p.rashi,\n          house: (((kundali.divisionalCharts?.D9?.[p.key]?.rashi ?? kundali.divisionalCharts?.D9?.[p.key] ?? p.rashi) - (kundali.divisionalCharts?.D9?.lagna?.rashi ?? kundali.lagna.rashi) + 12) % 12) + 1,"
    )

    return content

for path in files_to_patch:
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            original = f.read()
        patched = patch_rashi_map(original)
        if original != patched:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(patched)
            print(f"Patched {path}")
        else:
            print(f"No changes required for {path}")
