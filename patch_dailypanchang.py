import re

with open('src/App.jsx', 'r') as f:
    text = f.read()

new_daily = """function DailyPanchang({ lang }){
    const[location,setLocation]=React.useState(null);
    const[dailyPan, setDailyPan] = React.useState(null);
    const GRAHA=L_GRAHA[lang]||L_GRAHA.en;
    const RASHI_N=L_RASHI[lang]||L_RASHI.en;
    const LP=L_PANCHANG[lang]||L_PANCHANG.en;

    React.useEffect(()=>{
      if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(pos=>{
          setLocation({lat:pos.coords.latitude,lng:pos.coords.longitude});
        },()=>{});
      }
    },[]);

    React.useEffect(()=>{
      let isMounted = true;
      const now=new Date();
      const utcH=now.getUTCHours(),utcM=now.getUTCMinutes();
      const lat=location?location.lat:28.6139; // Loc fallback
      const lng=location?location.lng:77.2090;
      
      fetchKundali({year:now.getUTCFullYear(),month:now.getUTCMonth()+1,day:now.getUTCDate(),hour:utcH,minute:utcM,utcOffset:0,lat,lng, isPanchang: true}, null, true)
        .then(K => {
           if (!isMounted) return;
           const tMoon = K.planets.find(p=>p.key==='moon');
           const tSun = K.planets.find(p=>p.key==='sun');
           const L_NN = L_PANCHANG[lang]?.nakNames || {};
           const moonNakRawName = tMoon.nakshatraName || 'Ashvini';
           const moonNak = { name: L_NN[moonNakRawName] || moonNakRawName };
           
           const pMatch=K.panchang.tithi.match(/\((.*?)\)/);
           const pakshaRaw = pMatch?pMatch[1]:'';
           const tithiRaw = K.panchang.tithi.split(' (')[0];
           const L_TN = L_PANCHANG[lang]?.tithiNames || {};
           const tithiOnly = L_TN[tithiRaw] || tithiRaw;
           const paksha = pakshaRaw.includes('Shukla') ? 'Shukla' : pakshaRaw.includes('Krishna') ? 'Krishna' : pakshaRaw;
           
           setDailyPan({K,now,sunSet:{rise:K.sunrise,set:K.sunset},inaus:{rahuKala:{str:'—'},yamaghanda:{str:'—'}},abhijit:null,moonNak,tMoon,tSun,paksha,tithiOnly,dayOfWeek:now.getDay(),jd:K.jd,hasLoc:!!location,year: now.getFullYear()});
        })
        .catch(e => console.error("Panchang load silently failed:", e));
        
        return () => { isMounted = false; };
    }, [location, lang]);

    if(!dailyPan)return null;"""

text = re.sub(r'function DailyPanchang.*?if\(!dailyPan\)return null;', new_daily, text, count=1, flags=re.DOTALL)

with open('src/App.jsx', 'w') as f:
    f.write(text)

print("Patched DailyPanchang!")
