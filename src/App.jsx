import React from 'react';
import { DYNAMIC_STRINGS } from './i18n/dynamicTranslations.js';
import { UI_STRINGS } from './i18n/uiStrings.js';
import './index.css';
import CompatibilityMatch from './components/CompatibilityMatch.jsx';
import { calculateMatch } from './engine/matchmaking.js';
import CompatibilityInputForm from './components/CompatibilityInputForm.jsx';
import { NAKSHATRA_LORE } from './data/nakshatra_lore.js';
import { initializeAstroEngine, getSwe } from './engine/swissephLoader.js';
import AuthModal from './components/AuthModal.jsx';
import { MockDashboard } from './components/tabs/MockDashboard.jsx';
import ExpertReadingTab from './components/tabs/ExpertReadingTab.jsx';
import ConfirmModal from './components/ConfirmModal.jsx';
import { usePreferences } from './contexts/PreferencesContext.jsx';
import UserPreferencesModal from './components/UserPreferencesModal.jsx';
import { useSync } from './contexts/SyncContext.jsx';
import UserHub from './components/UserHub.jsx';

// ════════════════════════════════════════════════════════════════
// ASTRONOMY ENGINE
// ════════════════════════════════════════════════════════════════
const DEG = Math.PI / 180;
function norm(d){return((d%360)+360)%360}

function toJD(year,month,day,hour=0,min=0,utc=0){
  const swe = getSwe();
  const totalMinutes = hour * 60 + min - Math.round(utc * 60);
  let uDate = new Date(Date.UTC(year, month - 1, day, 0, totalMinutes, 0));
  let utHour = uDate.getUTCHours() + uDate.getUTCMinutes() / 60;
  return swe.julday(uDate.getUTCFullYear(), uDate.getUTCMonth() + 1, uDate.getUTCDate(), utHour, swe.SE_GREG_CAL);
}

function lahiri(jd){
  const swe = getSwe();
  return swe.SweModule.ccall('swe_get_ayanamsa_ut', 'number', ['number'], [jd]);
}

function computeAsc(jd, lat, lng){
  const swe = getSwe();
  const cuspsPtr = swe.SweModule._malloc(13 * 8);
  const ascmcPtr = swe.SweModule._malloc(10 * 8);
  swe.SweModule.ccall('swe_houses', 'number', ['number', 'number', 'number', 'number', 'pointer', 'pointer'], [jd, lat, lng, 'P'.charCodeAt(0), cuspsPtr, ascmcPtr]);
  const asc_trop = new Float64Array(swe.SweModule.HEAPF64.buffer, ascmcPtr, 10)[0];
  const ay = lahiri(jd);
  swe.SweModule._free(cuspsPtr); swe.SweModule._free(ascmcPtr);
  return norm(asc_trop - ay);
}

function allPlanets(jd){
  const swe = getSwe();
  const flags = swe.SEFLG_SWIEPH | swe.SEFLG_SPEED | swe.SEFLG_SIDEREAL;
  
  const calc = (bodyId) => {
    const res = swe.calc_ut(jd, bodyId, flags);
    return { lon: norm(res[0]), spd: res[3] || 0 };
  };
  
  const ay = lahiri(jd);
  const raw = {
    sun: calc(swe.SE_SUN),
    moon: calc(swe.SE_MOON),
    mars: calc(swe.SE_MARS),
    mercury: calc(swe.SE_MERCURY),
    jupiter: calc(swe.SE_JUPITER),
    venus: calc(swe.SE_VENUS),
    saturn: calc(swe.SE_SATURN),
    rahu: calc(swe.SE_TRUE_NODE),
  };
  raw.ketu = { lon: norm(raw.rahu.lon + 180), spd: raw.rahu.spd };
  
  const sid = {};
  for(const[k,v]of Object.entries(raw)){
    sid[k] = { ...v, retro: v.spd < 0 };
  }
  
  // combustion
  const sunL = sid.sun.lon;
  const thresh = { moon:12, mars:17, mercury:13, jupiter:11, venus:10, saturn:15 };
  for(const[p,t] of Object.entries(thresh)){
    if(sid[p]) { let d=Math.abs(sid[p].lon-sunL); if(d>180) d=360-d; sid[p].combust=d<t; }
  }
  return { sid, ay };
}

// ════════════════════════════════════════════════════════════════
// VEDIC LOGIC
// ════════════════════════════════════════════════════════════════
const RASHIS=['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya','Tula','Vrischika','Dhanu','Makara','Kumbha','Meena'];
const RASHI_EN=['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const RASHI_LORD=['mars','venus','mercury','moon','sun','mercury','venus','mars','jupiter','saturn','saturn','jupiter'];
const NAKS=[
  'Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha',
  'Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha',
  'Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha','Shatabhisha',
  'Purva Bhadrapada','Uttara Bhadrapada','Revati'
];
const NAK_LORD=['ketu','venus','sun','moon','mars','rahu','jupiter','saturn','mercury',
  'ketu','venus','sun','moon','mars','rahu','jupiter','saturn','mercury',
  'ketu','venus','sun','moon','mars','rahu','jupiter','saturn','mercury'];
const ABBR={sun:'Su',moon:'Mo',mars:'Ma',mercury:'Bu',jupiter:'Gu',venus:'Sk',saturn:'Sa',rahu:'Ra',ketu:'Ke'};
const PCOLOR={sun:'#F59E0B',moon:'#8B5CF6',mars:'#EF4444',mercury:'#10B981',jupiter:'#D97706',venus:'#EC4899',saturn:'#6366F1',rahu:'#1E3A5F',ketu:'#7C3AED'};
const PNAME={sun:'Surya (Sun)',moon:'Chandra (Moon)',mars:'Mangal (Mars)',mercury:'Budha (Mercury)',jupiter:'Guru (Jupiter)',venus:'Shukra (Venus)',saturn:'Shani (Saturn)',rahu:'Rahu',ketu:'Ketu'};
const DASHA_ORDER=['ketu','venus','sun','moon','mars','rahu','jupiter','saturn','mercury'];
const DASHA_YRS={ketu:7,venus:20,sun:6,moon:10,mars:7,rahu:18,jupiter:16,saturn:19,mercury:17};
const EXALT={sun:0,moon:1,mars:9,mercury:5,jupiter:3,venus:11,saturn:6,rahu:2,ketu:8};
const DEBIL={sun:6,moon:7,mars:3,mercury:11,jupiter:9,venus:5,saturn:0};
const PLANET_ORDER=['sun','moon','mars','mercury','jupiter','venus','saturn','rahu','ketu'];

function rashi(lon){return Math.floor(norm(lon)/30)}
function degInSign(lon){return norm(lon)%30}
function fmtDeg(lon){
  const d=norm(lon)%30,dg=Math.floor(d),mf=(d-dg)*60,mn=Math.floor(mf),sc=Math.floor((mf-mn)*60);
  return`${dg}°${String(mn).padStart(2,'0')}'${String(sc).padStart(2,'0')}"`;
}
function nakshatra(lon){
  const n=((norm(lon)/(360/27))|0);
  const pada=((norm(lon)%(360/27))/(360/108)|0)+1;
  return{idx:n,name:NAKS[n],lord:NAK_LORD[n],pada};
}

function dasha_calc(moonLon,jd){
  const{idx:nIdx,name:nName,lord:nLord}=nakshatra(moonLon);
  const posInNak=(norm(moonLon)%(360/27))/(360/27);
  const rem=(1-posInNak)*DASHA_YRS[nLord];
  const startIdx=DASHA_ORDER.indexOf(nLord);
  const birth=jd2date(jd);
  const today=new Date();
  function addYears(d,y){const r=new Date(d);r.setTime(r.getTime()+y*365.25*86400000);return r}
  const mahas=[];
  let cur=new Date(birth);
  // first partial
  const fEnd=addYears(cur,rem);
  mahas.push({planet:nLord,yrs:rem,start:cur,end:fEnd});
  cur=new Date(fEnd);
  for(let i=1;i<9;i++){
    const p=DASHA_ORDER[(startIdx+i)%9];
    const e=addYears(cur,DASHA_YRS[p]);
    mahas.push({planet:p,yrs:DASHA_YRS[p],start:new Date(cur),end:e});
    cur=new Date(e);
  }
  mahas.forEach(m=>{
    m.isCurrent=today>=m.start&&today<m.end;
    m.startStr=m.start.toISOString().slice(0,10);
    m.endStr=m.end.toISOString().slice(0,10);
    const mi=DASHA_ORDER.indexOf(m.planet);
    const antars=[];
    let ac=new Date(m.start);
    for(let i=0;i<9;i++){
      const ap=DASHA_ORDER[(mi+i)%9];
      const ay=(DASHA_YRS[ap]/120)*m.yrs;
      const ae=addYears(ac,ay);
      antars.push({planet:ap,start:new Date(ac),end:ae,startStr:ac.toISOString().slice(0,10),endStr:ae.toISOString().slice(0,10),isCurrent:today>=ac&&today<ae});
      ac=new Date(ae);
    }
    m.antars=antars;
  });
  return{nakName:nName,nakLord:nLord,mahadashas:mahas,current:mahas.find(m=>m.isCurrent)||mahas[0]};
}

function jd2date(jd){
  let z=Math.floor(jd+0.5);const f=jd+0.5-z;
  if(z>=2299161){const a=Math.floor((z-1867216.25)/36524.25);z=z+1+a-Math.floor(a/4)}
  const b=z+1524,c=Math.floor((b-122.1)/365.25),d=Math.floor(365.25*c),e=Math.floor((b-d)/30.6001);
  const day=b-d-Math.floor(30.6001*e),mo=e<14?e-1:e-13,yr=mo>2?c-4716:c-4715;
  const h=f*24;
  return new Date(yr,mo-1,day,Math.floor(h),Math.floor((h%1)*60));
}

function yogas(pm,lagnaR){
  const res=[];
  const p=pm;
  // Gaj Kesari
  if(p.moon&&p.jupiter){
    const d=Math.abs(p.moon.house-p.jupiter.house);
    if([0,3,6,9].includes(d)||[0,3,6,9].includes(12-d)) {
      res.push({
        key: 'gajKesari', type: 'raja',
        vars: { p1: 'moon', p2: 'jupiter', rel: d===0?'conjunct':'kendra' }
      });
    }
  }
  // Budhaditya
  if(p.sun&&p.mercury&&p.sun.rashi===p.mercury.rashi){
    res.push({
      key: 'budhaditya', type: 'raja',
      vars: { p1: 'sun', p2: 'mercury', rashi: p.sun.rashi }
    });
  }
  // Chandra-Mangal
  if(p.moon&&p.mars&&p.moon.rashi===p.mars.rashi){
    res.push({
      key: 'chandraMangal', type: 'dhana',
      vars: { p1: 'moon', p2: 'mars', rashi: p.moon.rashi }
    });
  }
  // Pancha Mahapurusha - Sasa
  if(p.saturn){
    const h=p.saturn.house;
    if([1,4,7,10].includes(h)&&(p.saturn.rashi===6||p.saturn.rashi===9||p.saturn.rashi===10)){
      res.push({
        key: 'sasa', type: 'raja',
        vars: { p1: 'saturn', house: h, rashi: p.saturn.rashi, state: p.saturn.rashi===6?'exalted':'own' }
      });
    }
  }
  // Hamsa
  if(p.jupiter){
    const h=p.jupiter.house;
    if([1,4,7,10].includes(h)&&(p.jupiter.rashi===3||p.jupiter.rashi===8||p.jupiter.rashi===11)){
      res.push({
        key: 'hamsa', type: 'raja',
        vars: { p1: 'jupiter', house: h, rashi: p.jupiter.rashi, state: p.jupiter.rashi===3?'exalted':'own' }
      });
    }
  }
  // Ruchaka
  if(p.mars){
    const h=p.mars.house;
    if([1,4,7,10].includes(h)&&(p.mars.rashi===9||p.mars.rashi===0||p.mars.rashi===7)){
      res.push({
        key: 'ruchaka', type: 'raja',
        vars: { p1: 'mars', house: h, rashi: p.mars.rashi, state: p.mars.rashi===9?'exalted':'own' }
      });
    }
  }
  // Mangal Dosha (aligned with rigorous compatibility logic: Lagna, Moon, Venus + cancellations)
  if(p.mars){
    const fL=p.mars.house;
    const fM=p.moon?((p.mars.rashi-p.moon.rashi+12)%12+1):0;
    const fV=p.venus?((p.mars.rashi-p.venus.rashi+12)%12+1):0;
    const isL=[1,4,7,8,12].includes(fL);
    const isM=[1,4,7,8,12].includes(fM);
    const isV=[1,4,7,8,12].includes(fV);
    const isMan=isL||isM||isV;
    let cancel=false;
    let cancelReason='';
    if(isMan){
      if(p.mars.rashi===0&&fL===1) { cancel=true; cancelReason='Aries Lagna'; }
      if(p.mars.rashi===7&&fL===4) { cancel=true; cancelReason='Scorpio in 4th'; }
      if(p.mars.rashi===9&&fL===7) { cancel=true; cancelReason='Capricorn in 7th'; }
      if(p.mars.rashi===3&&fL===8) { cancel=true; cancelReason='Gemini in 8th'; }
    }
    if(isMan&&!cancel){
      const primarySource = isL ? 'Lagna' : (isM ? 'Moon' : 'Venus');
      const primaryHouse = isL ? fL : (isM ? fM : fV);
      res.push({
        key: 'mangal', type: 'dosha',
        vars: { p1: 'mars', house: primaryHouse, source: primarySource }
      });
    }
  }
  // Kaal Sarp
  if(p.rahu&&p.ketu){
    const ra=p.rahu.lon,ke=p.ketu.lon;
    const mn=Math.min(ra,ke),mx=Math.max(ra,ke);
    const all=['sun','moon','mars','mercury','jupiter','venus','saturn'];
    const trapped=all.every(k=>p[k]&&((p[k].lon>=mn&&p[k].lon<=mx)||(p[k].lon>=mx&&p[k].lon<=mn+360)));
    if(trapped){
      res.push({
        key: 'kaalSarp', type: 'dosha',
        vars: {}
      });
    }
  }
  return res;
}

function shadbala(planets,lagnaR){
  const res={};
  for(const p of planets){
    if(['rahu','ketu'].includes(p.key))continue;
    let sthana=60;
    if(p.exalted)sthana=150;else if(p.debil)sthana=15;else if(RASHI_LORD[p.rashi]===p.key)sthana=120;
    const digIdeal={sun:9,mars:9,jupiter:0,moon:3,venus:3,mercury:0,saturn:6};
    const dig=Math.max(10,60-Math.abs(p.house-1-(digIdeal[p.key]||0))*5);
    const kala=40+Math.floor(Math.sin(p.lon*DEG)*15+15);
    const chesta=p.retro?60:30;
    const natStr={saturn:8.57,mars:17.14,mercury:25.71,jupiter:34.28,venus:42.85,moon:51.42,sun:60};
    const nais=natStr[p.key]||30;
    const drik=15+Math.floor(Math.abs(Math.sin(p.lon*0.05))*20);
    const total=Math.round(sthana+dig+kala+chesta+nais+drik);
    res[p.key]={planet:p.key,sthana:Math.round(sthana),dig:Math.round(dig),kala:Math.round(kala),chesta,naisargika:Math.round(nais),drik,total,cls:total>=350?'Strong':total>=250?'Moderate':'Weak'};
  }
  return res;
}

function ashtakavarga(planets){
  const pks=['sun','moon','mars','mercury','jupiter','venus','saturn'];
  const pm={};for(const p of planets)pm[p.key]=p;
  const offsets={sun:[1,2,4,7,8,9,10,11],moon:[3,6,7,8,10,11],mars:[1,2,4,7,8,10,11],mercury:[1,3,5,6,9,10,11,12],jupiter:[1,2,3,4,7,8,10,11],venus:[1,2,3,4,5,8,9,10,11],saturn:[3,5,6,11]};
  const BAV={};
  for(const tp of pks){
    BAV[tp]=new Array(12).fill(0);
    for(const sp of [...pks,'lagna']){
      const sr=sp==='lagna'?(pm.sun?.rashi||0):(pm[sp]?.rashi||0);
      const offs=offsets[sp==='lagna'?'sun':sp]||[];
      for(const o of offs)BAV[tp][(sr+o-1+12)%12]++;
    }
  }
  const SAV=new Array(12).fill(0);
  for(const p of pks)for(let i=0;i<12;i++)SAV[i]+=BAV[p][i];
  return{BAV,SAV};
}

function panchang(sunL,moonL,jd,utcOffset){
  const raw=((moonL-sunL+360)%360)/12;
  const tn=Math.floor(raw)+1;
  const paksha=tn<=15?'Shukla Paksha':'Krishna Paksha';
  const tnames=['Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami','Shashthi','Saptami','Ashtami','Navami','Dashami','Ekadashi','Dwadashi','Trayodashi','Chaturdashi','Purnima/Amavasya'];
  const vnames=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const localJd=jd+(utcOffset||0)/24;
  const vara=vnames[(Math.floor(localJd+1.5))%7];
  const{name:nakName}=nakshatra(moonL);
  const ynum=Math.floor(((sunL+moonL)%360)/(360/27));
  const yn=['Vishkambha','Priti','Ayushman','Saubhagya','Shobhana','Atiganda','Sukarma','Dhriti','Shula','Ganda','Vriddhi','Dhruva','Vyaghata','Harshana','Vajra','Siddhi','Vyatipata','Variyan','Parigha','Shiva','Siddha','Sadhya','Shubha','Shukla','Brahma','Indra','Vaidhriti'];
  const kn=['Bava','Balava','Kaulava','Taitila','Garaja','Vanija','Vishti','Shakuni','Chatushpada','Naga','Kimstughna'];
  const nakIdx2=nakshatra(moonL).idx;return{tithi:`${tnames[(tn-1)%15]} (${paksha})`,vara,nakshatra:nakName,yoga:yn[ynum%27],karana:kn[Math.floor(raw*2)%11],tithiIdx:(tn-1)%15,pakshaKey:tn<=15?'wax':'wan',varaIdx:(Math.floor(localJd+1.5))%7,nakIdx:nakIdx2,yogaIdx:ynum%27,karanaIdx:Math.floor(raw*2)%11};
}

function toDMS(d){const dg=Math.floor(d),m=Math.floor((d-dg)*60),s=Math.floor(((d-dg)*60-m)*60);return`${dg}°${String(m).padStart(2,'0')}'${String(s).padStart(2,'0')}"`}

function computeKundali(input){
  const{year,month,day,hour,minute,utcOffset,lat,lng}=input;
  const jd=toJD(year,month,day,hour,minute,utcOffset);
  const{sid,ay}=allPlanets(jd);
  const ascTrop=computeAsc(jd,lat,lng);
  const lagnaLon=norm(ascTrop-ay);
  const lagnaR=rashi(lagnaLon);
  const planets=PLANET_ORDER.map(k=>{
    const d=sid[k];
    const r=rashi(d.lon),dInSign=degInSign(d.lon),{idx:nIdx,name:nName,lord:nLord,pada}=nakshatra(d.lon);
    const house=((r-lagnaR+12)%12)+1;
    return{key:k,name:PNAME[k],lon:d.lon,rashi:r,degInSign:dInSign,degFmt:fmtDeg(d.lon),nIdx,nakshatraName:nName,nakshatraLord:nLord,pada,house,retro:d.retro||false,combust:d.combust||false,exalted:EXALT[k]===r,debil:DEBIL[k]===r};
  });
  // Vargottama (D9)
  const d9Rashi=pl=>{const n=rashi(pl.lon),di=pl.degInSign,g=[0,9,6,3][n%4];return(g+Math.floor(di/(30/9)))%12};
  planets.forEach(p=>p.vargottama=rashi(p.lon)===d9Rashi(p));
  // Divisional charts
  function vargas(lon,div){
    if(div===1)return rashi(lon);
    const s=rashi(lon),di=norm(lon)%30,ps=30/div,pn=Math.floor(di/ps);
    if(div===9){const g=[0,9,6,3][s%4];return(g+pn)%12}
    if(div===3){const b=[0,4,8][pn];return(s+b)%12}
    return(s*div+pn)%12;
  }
  const VDIVS={D1:1,D2:2,D3:3,D4:4,D7:7,D9:9,D10:10,D12:12,D16:16,D20:20,D24:24,D27:27,D30:30,D40:40,D45:45,D60:60};
  const divCharts={};
  for(const[vn,dv]of Object.entries(VDIVS)){divCharts[vn]={};for(const p of planets)divCharts[vn][p.key]=vargas(p.lon,dv);}
  const moon=planets.find(p=>p.key==='moon'),sun=planets.find(p=>p.key==='sun');
  const pm={};for(const p of planets)pm[p.key]=p;
  const dashaData=dasha_calc(moon.lon,jd);
  const yogaList=yogas(pm,lagnaR);
  const sbala=shadbala(planets,lagnaR);
  const avarga=ashtakavarga(planets);
  const panch=panchang(sun.lon,moon.lon,jd,input.utcOffset);
  const T=(jd-2451545)/36525;
  const GMST=norm(280.46061837+360.98564736629*(jd-2451545));
  const LST=norm(GMST+lng);
  const lh=Math.floor(LST/15),lm=Math.floor((LST/15-lh)*60);
  const lngCorr=lng/15,noon=12-lngCorr,half=6+Math.abs(lat)*0.04;
  const fmtT=h=>{const hh=((Math.floor(h)%24)+24)%24,mm=Math.floor((h%1)*60),ap=hh>=12?'PM':'AM';return`${hh%12||12}:${String(mm).padStart(2,'0')} ${ap}`};
  return{input,jd,ayanamsa:ay.toFixed(4),ayanamsaDMS:toDMS(ay),lagna:{lon:lagnaLon,rashi:lagnaR,degFmt:fmtDeg(lagnaLon)},planets,divCharts,dasha:dashaData,yogas:yogaList,shadbala:sbala,ashtakavarga:avarga,panchang:panch,sunrise:fmtT(noon-half),sunset:fmtT(noon+half),lst:`${String(lh).padStart(2,'0')}h ${String(lm).padStart(2,'0')}m`};
}

// Expose core math functions for Playwright regression tests
if (typeof window !== 'undefined') {
  console.log("EXPOSING MATH FUNCTIONS TO WINDOW");
  window.toJD = toJD;
  window.allPlanets = allPlanets;
  window.computeKundali = computeKundali;
  console.log("VERIFICATION:", typeof window.toJD);
}

const LANGS=[{code:'en',label:'English'},{code:'hi',label:'हिन्दी'},{code:'kn',label:'ಕನ್ನಡ'},{code:'te',label:'తెలుగు'},{code:'ta',label:'தமிழ்'},{code:'sa',label:'संस्कृतम्'},{code:'mr',label:'मराठी'},{code:'gu',label:'ગુજરાતી'},{code:'bn',label:'বাংলা'},{code:'ml',label:'മലയാളം'}];

// ════════════════════════════════════════════════════════════════
// TRANSLATIONS
// ════════════════════════════════════════════════════════════════
const STRINGS={
en:{
    'revealLifePathTitle':'Reveal Life Paths',
    'revealLifePathDesc':'Reveal Life dimensions of Dharma, Wealth, Health, and Relationships through precise Shastric Pathways.',
    'transit.H1':'Happiness & Comfort','transit.H2':'Financial Restrictions','transit.H3':'Courage & Success','transit.H4':'Mental Stress','transit.H5':'Delays & Worries','transit.H6':'Victory & Health','transit.H7':'Success & Joy','transit.H8':'Unexpected Troubles','transit.H9':'Fatigue & Bad Luck','transit.H10':'Success & Honor','transit.H11':'Income & Gains','transit.H12':'High Expenses',title:"JYOTISH DARSHAN",
    subtitle:"VEDIC BIRTH CHART",
    inputTitle:"Your Cosmic Blueprint",
    inputSubtitle:"To generate your precise Vedic birth chart, we need your exact time and place of birth.",
    fullName:"Full Name",
    namePlaceholder:"Enter name (e.g. Rahul)...",
    newChart:'New Kundali',
    deleteProfile:'Delete Profile',
    deleteAlert:'Are you sure you want to delete this profile? This action cannot be undone.',
    modalCancel:'Cancel',
    modalDelete:'Delete',
    currentProfile:'Current',
    profile:'Profiles',
    todayHorizon:"Today's Horizon",
    weekAhead:'The Week Ahead',
    mixed:'Mixed',
    challenging:'Challenging',
    festival:'Festival',
    fastingPrac:'Fasting & Spiritual Practices',
    auspiciousDay:'Auspicious Day',
    generate:'✦ Generate Kundali',
    computing:'⟳ Computing...',
    back:'← Back',
    share:'⇧ Share',
    download:'↓ Download PDF',
    dob:'Date of Birth',tob:'Time of Birth',city:'City of Birth',country:'Country',gender:'Gender',male:'Male',female:'Female',other:'Other',birthDetails:'Birth Details',tagline:'VEDIC BIRTH CHART · ज्योतिष दर्शन',headers:{insights:'My Insights',compatibility:'Relationship Compatibility',addPartner:'Add Partner Details',desk:'Jyotish Desk (Technical Area)'},tabs:{overview:'Overview',predictions:'Predictions',charts:'Charts',planets:'Graha Sthiti',dasha:'Dasha',yoga:'Yoga & Dosha',shadbala:'Shadbala',avarga:'Ashtakavarga',reading:'Expert Reading'},ov:{favorable:'Favorable For',favorableDesc:'Starting new ventures, financial planning',avoid:'Avoid',avoidDesc:'Major arguments, risky investments',mantra:'Daily Mantra',mantraDesc:'Om Namah Shivaya',title:'Janma Vivaranam (Birth Summary)',sunrise:'Sunrise',sunset:'Sunset',lst:'LST',ayanamsa:'Ayanamsa (Lahiri)',tithi:'Tithi',vara:'Vara',nakshatra:'Nakshatra',yoga:'Yoga',karana:'Karana',lagna:'Lagna',moon:'Moon Sign',sun:'Sun Sign',curDasha:'Current Vimshottari Dasha',maha:'Mahadasha',antar:'Antardasha',birth:'Birth Dasha'},pl:{title:'Graha Sthiti (Pl anetary Positions)',graha:'Graha',rashi:'Rashi',deg:'Degree',nak:'Nakshatra',pada:'Pada',nakL:'Nak.Lord',signL:'Sign Lord',bhava:'Bhava',status:'Status'},da:{title:'Vimshottari Mahadasha Timeline',cur:'Current',antars:'Antardasha Periods'},yo:{title:'Yoga & Dosha Phala',raja:'Raja Yoga',dhana:'Dhana Yoga',dosha:'Dosha',none:'No specific yogas detected. The chart holds unique karmic significance.'},sh:{title:'Shadbala (Six Strengths)'},av:{title:'Ashtakavarga'},rd:{title:'Expert Jyotish Reading',lagnaA:'Lagna Analysis',moonA:'Moon Sign Analysis',dashaR:'Current Dasha Reading',yogaI:'Active Yoga Influence',strengthR:'Planetary Strength Reading',disc:'This reading is based on classical Parashari Jyotish principles. For a comprehensive personal analysis, consult a qualified Jyotishi.'},pdf:{title:'Janma Kundali',by:'Generated by Jyotish Darshan',lahiri:'Lahiri Ayanamsa',para:'Parashari System',rashiChart:'D1 · Rashi Chart',navamsa:'D9 · Navamsa',years:'Years',start:'Start',end:'End',antardasha:'Antardasha',yogaDosha:'Yoga / Dosha',type:'Type',effect:'Effect',planet:'Planet',totalStrength:'Total Strength',classification:'Classification',printBtn:'Print / Save as PDF',closeBtn:'Close',ayanamsa:'Ayanamsa',pada:'Pd'},inputAccuracy:'⚠ Even 15 min accuracy shift can change the Ascendant (Lagna)',inputPrivacy:'🔒 All calculations run locally in your browser. No data is stored.',inputLoading:'Applying Lahiri Ayanamsa correction...',cityPlaceholder:'Type city name (e.g. Bangalore, Mumbai)...',required:'Required',selectCity:'Please select a city from the dropdown','ov.rashiChart':'Rashi Chart (D1)','ov.navamsa':'Navamsa (D9)','ov.nakLabel':'Nakshatra:','pl.lagnaLabel':'Lagna','pl.lagnaLord':'Lagna Lord','pl.bhavaTitle':'Bhava Overview (12 Houses)','pl.house':'HOUSE','pl.lord':'Lord','pl.empty':'Empty house','ch.shodasha':'Shodasha Varga (16)','ch.south':'⊞ South','ch.north':'◇ North','ch.vargottama':'Vargottama','da.yrs':'yrs','da.active':'ACTIVE','da.now':'NOW','da.currentInfo':'Current: '+'{placeholder}'+' Mahadasha — gold border · Click segment to expand','yo.noYogaMsg':'No major yogas were detected. This does not mean a weak chart — many powerful yogas arise from subtle combinations.','yo.noRaja':'No {raja} detected.','yo.noDhana':'No {dhana} detected.','yo.noDosha':'No major Doshas found — auspicious.','yo.panchaMaha':'Pancha Mahapurusha','yo.wealth':'Wealth','yo.afflictions':'Afflictions','yo.formedBy':'Formed by','yo.remedies':'Remedies: Consult a qualified Jyotishi for personalised Graha Shanti, Dana, and gemstone recommendations.','yo.rajaYoga':'Raja Yoga','yo.dhanaYoga':'Dhana Yoga','yo.doshaLabel':'Dosha','sh.virupas':'Virupas','sh.graha':'Graha','sh.sthana':'Sthana','sh.dig':'Dig','sh.kala':'Kala','sh.chesta':'Chesta','sh.naisargika':'Naisargika','sh.drik':'Drik','sh.total':'Total','sh.strength':'Strength','sh.strong':'Strong','sh.moderate':'Moderate','sh.weak':'Weak','sh.comparative':'Comparative Strength','av.bindu':'Benefic Bindu Analysis','av.binduDesc':'Higher Bindus = stronger transit results through that Rashi.','av.bav':'BAV','av.sav':'Sarvashtakavarga (SAV)','av.savDesc':'Total Bindus per Sign','av.stdTotal':'Standard total','av.yours':'Yours','rd.subtitle':'Parashara Hora Shastra · Lahiri Ayanamsa','rd.chandra':'Chandra — Emotional Nature & Janma Nakshatra','rd.artha':'Artha — Career & Dharmic Purpose','rd.kama':'Kama — Relationships & Marriage','rd.dashaPhala':'Dasha Phala','rd.moksha':'Moksha — Spiritual Inclinations','rd.note':'Note','validation.required':'Required','validation.selectCity':'Please select a city from the dropdown','ashtakavarga.total':'Total','shadbala.strong':'Strong','shadbala.moderate':'Moderate','shadbala.weak':'Weak','formNote':'All fields required for accurate chart generation','ch.asc':'Asc','copied':'✓ Copied!','popupAlert':'Please allow popups for this site to download the PDF.','comp.title':'Relationship Compatibility','comp.milan':'Ashtakoota Milan','comp.addP':'Add Partner Details','comp.match':'Match Charts','comp.cancel':'Cancel','comp.user':'User','comp.partner':'Partner','comp.moonR':'Moon Rashi','comp.nak':'Nakshatra','comp.manglik':'Manglik','comp.yes':'Yes','comp.no':'No','comp.verdict':'Compatibility Verdict','comp.kuja':'Kuja (Manglik) Dosha Evaluation','comp.breakdown':'8-Koota Breakdown & Explanation'},
hi:{
    'revealLifePathTitle':'जीवन पथ प्रकट करें',
    'revealLifePathDesc':'सटीक शास्त्रीय मार्गों के माध्यम से धर्म, धन, स्वास्थ्य और रिश्तों के जीवन आयामों को प्रकट करें।',
    'transit.H1':'खुशी और आराम','transit.H2':'वित्तीय प्रतिबंध','transit.H3':'साहस और सफलता','transit.H4':'मानसिक तनाव','transit.H5':'देरी और चिंताएँ','transit.H6':'विजय एवं स्वास्थ्य','transit.H7':'सफलता और खुशी','transit.H8':'अप्रत्याशित परेशानियाँ','transit.H9':'थकान और बुरी किस्मत','transit.H10':'सफलता और सम्मान','transit.H11':'आय और लाभ','transit.H12':'उच्च व्यय',title:"ज्योतिष दर्शन",
    subtitle:"वैदिक जन्म कुण्डली",
    inputTitle:"ब्रह्माण्डीय रूपरेखा",
    inputSubtitle:"अपनी सटीक वैदिक जन्म कुंडली बनाने के लिए, हमें आपके जन्म का सही समय और स्थान चाहिए।",
    fullName:"पूरा नाम",
    namePlaceholder:"नाम दर्ज करें (उदा. राहुल)...",
    newChart:'नई कुण्डली',deleteProfile:'प्रोफ़ाइल हटाएं',deleteAlert:'क्या आप वाकई इस प्रोफ़ाइल को हटाना चाहते हैं? इसे पूर्ववत नहीं किया जा सकता।',modalCancel:'रद्द करें',modalDelete:'हटाएं',currentProfile:'वर्तमान',profile:'प्रोफ़ाइल',
    dob:'जन्म तिथि',tob:'जन्म समय',city:'जन्म स्थान',country:'देश',gender:'लिंग',male:'पुरुष',female:'महिला',other:'अन्य',birthDetails:'जन्म विवरण',tagline:'वैदिक जन्म कुंडली · ज्योतिष दर्शन',headers:{insights:'मेरी अंतर्दृष्टि',compatibility:'संबंध अनुकूलता',addPartner:'साथी का विवरण जोड़ें',desk:'ज्योतिष डेस्क (तकनीकी क्षेत्र)'},tabs:{overview:'अवलोकन',predictions:'भविष्यफल',charts:'चार्ट',planets:'ग्रह स्थिति',dasha:'दशा',yoga:'योग एवं दोष',shadbala:'षड्बल',avarga:'अष्टकवर्ग',reading:'विशेषज्ञ विश्लेषण'},ov:{favorable:'अनुकूल',favorableDesc:'नए कार्य की शुरुआत, वित्तीय नियोजन',avoid:'टालें',avoidDesc:'बड़े विवाद, जोखिम भरे निवेश',mantra:'दैनिक मंत्र',mantraDesc:'ॐ नमः शिवाय',title:'जन्म विवरण',sunrise:'सूर्योदय',sunset:'सूर्यास्त',lst:'LST',ayanamsa:'अयनांश (लाहिरी)',tithi:'तिथि',vara:'वार',nakshatra:'नक्षत्र',yoga:'योग',karana:'करण',lagna:'लग्न',moon:'चंद्र राशि',sun:'सूर्य राशि',curDasha:'वर्तमान विंशोत्तरी दशा',maha:'महादशा',antar:'अंतर्दशा',birth:'जन्म दशा'},pl:{title:'ग्रह स्थिति',graha:'ग्रह',rashi:'राशि',deg:'अंश',nak:'नक्षत्र',pada:'पाद',nakL:'नक्षत्रेश',signL:'राशीश',bhava:'भाव',status:'स्थिति'},da:{title:'विंशोत्तरी महादशा',cur:'वर्तमान',antars:'अंतर्दशा काल'},yo:{title:'योग एवं दोष फल',raja:'राजयोग',dhana:'धनयोग',dosha:'दोष',none:'कोई विशेष योग नहीं मिला।'},sh:{title:'षड्बल (छः शक्तियाँ)'},av:{title:'अष्टकवर्ग'},rd:{title:'विशेषज्ञ ज्योतिष विश्लेषण',lagnaA:'लग्न विश्लेषण',moonA:'चंद्र राशि विश्लेषण',dashaR:'वर्तमान दशा विश्लेषण',yogaI:'सक्रिय योग प्रभाव',strengthR:'ग्रह बल विश्लेषण',disc:'यह विश्लेषण पाराशरी ज्योतिष सिद्धांतों पर आधारित है। विस्तृत विश्लेषण हेतु योग्य ज्योतिषी से परामर्श लें।'},pdf:{title:'जन्म कुंडली',by:'ज्योतिष दर्शन द्वारा निर्मित',lahiri:'लाहिरी अयनांश',para:'पाराशरी पद्धती'},inputAccuracy:'⚠ 15 मिनट का अंतर भी लग्न बदल सकता है',inputPrivacy:'🔒 सभी गणनाएं आपके ब्राउज़र में स्थानीय रूप से चलती हैं। कोई डेटा संग्रहीत नहीं होता।',inputLoading:'लाहिरी अयनांश सुधार लागू हो रहा है...',cityPlaceholder:'शहर का नाम टाइप करें (जैसे बेंगलुरु, मुंबई)...',required:'आवश्यक',selectCity:'कृपया ड्रॉपडाउन से शहर चुनें','ov.rashiChart':'राशि चार्ट (D1)','ov.navamsa':'नवांश (D9)','ov.nakLabel':'नक्षत्र:','pl.lagnaLabel':'लग्न','pl.lagnaLord':'लग्नेश','pl.bhavaTitle':'भाव अवलोकन (12 भाव)','pl.house':'भाव','pl.lord':'स्वामी','pl.empty':'खाली भाव','ch.shodasha':'षोडश वर्ग (16)','ch.south':'⊞ दक्षिण','ch.north':'◇ उत्तर','ch.vargottama':'वर्गोत्तम','da.yrs':'वर्ष','da.active':'सक्रिय','da.now':'अब','da.currentInfo':'वर्तमान: '+'{placeholder}'+' महादशा — सुनहरी सीमा · विस्तृत करने के लिए क्लिक करें','yo.noYogaMsg':'कोई प्रमुख योग नहीं मिला। इसका मतलब दुर्बल कुंडली नहीं है — कई शक्तिशाली योग सूक्ष्म संयोजनों से बनते हैं।','yo.noRaja':'कोई {raja} नहीं मिला।','yo.noDhana':'कोई {dhana} नहीं मिला।','yo.noDosha':'कोई प्रमुख दोष नहीं मिला — शुभ।','yo.panchaMaha':'पंच महापुरुष','yo.wealth':'धन','yo.afflictions':'कष्ट','yo.formedBy':'द्वारा निर्मित','yo.remedies':'उपाय: व्यक्तिगत ग्रह शांति, दान और रत्न की सिफारिशों के लिए योग्य ज्योतिषी से परामर्श लें।','yo.rajaYoga':'राज योग','yo.dhanaYoga':'धन योग','yo.doshaLabel':'दोष','sh.virupas':'विरुप','sh.graha':'ग्रह','sh.sthana':'स्थान','sh.dig':'दिक्','sh.kala':'काल','sh.chesta':'चेष्टा','sh.naisargika':'नैसर्गिक','sh.drik':'दृक्','sh.total':'कुल','sh.strength':'शक्ति','sh.strong':'मजबूत','sh.moderate':'मध्यम','sh.weak':'कमजोर','sh.comparative':'तुलनात्मक शक्ति','av.bindu':'शुभ बिंदु विश्लेषण','av.binduDesc':'अधिक बिंदु = उस राशि के माध्यम से मजबूत ट्रांजिट परिणाम।','av.bav':'BAV','av.sav':'सर्वाष्टकवर्ग (SAV)','av.savDesc':'प्रत्येक राशि में कुल बिंदु','av.stdTotal':'मानक कुल','av.yours':'आपका','rd.subtitle':'पाराशर होरा शास्त्र · लाहिरी अयनांश','rd.chandra':'चंद्र — भावनात्मक प्रकृति और जन्म नक्षत्र','rd.artha':'अर्थ — करियर और धर्मिक उद्देश्य','rd.kama':'काम — संबंध और विवाह','rd.dashaPhala':'दशा फल','rd.moksha':'मोक्ष — आध्यात्मिक झुकाव','rd.note':'नोट','validation.required':'आवश्यक','validation.selectCity':'कृपया ड्रॉपडाउन से एक शहर चुनें','pdf.rashiChart':'D1 · राशि चार्ट','pdf.navamsa':'D9 · नवांश','pdf.years':'वर्ष','pdf.start':'शुरुआत','pdf.end':'अंत','pdf.antardasha':'अंतर्दशा','pdf.yogaDosha':'योग / दोष','pdf.type':'प्रकार','pdf.effect':'प्रभाव','pdf.planet':'ग्रह','pdf.totalStrength':'कुल शक्ति','pdf.classification':'वर्गीकरण','pdf.printBtn':'प्रिंट करें / PDF के रूप में सहेजें','pdf.closeBtn':'बंद करें','pdf.ayanamsa':'अयनांश','pdf.pada':'पद','ashtakavarga.total':'कुल','shadbala.strong':'शक्तिशाली','shadbala.moderate':'मध्यम','shadbala.weak':'कमजोर','formNote':'सटीक कुंडली के लिए सभी जानकारी आवश्यक है','ch.asc':'लग्न','copied':'✓ कॉपी हुआ!','popupAlert':'PDF डाउनलोड के लिए कृपया पॉपअप अनुमति दें।','comp.title':'संबंध अनुकूलता','comp.milan':'अष्टकूट मिलान','comp.addPartner':'साथी का विवरण जोड़ें','comp.match':'चार्ट मिलाएं','comp.cancel':'रद्द करें','comp.user':'उपयोगकर्ता','comp.partner':'साथी','comp.moonR':'चंद्र राशि','comp.nak':'नक्षत्र','comp.manglik':'मांगलिक','comp.yes':'हाँ','comp.no':'नहीं','comp.verdict':'अनुकूलता परिणाम','comp.kuja':'कुजा (मांगलिक) दोष मूल्यांकन','comp.breakdown':'8-कूट विवरण और स्पष्टीकरण'},
kn:{
    'revealLifePathTitle':'ಜೀವನ ಮಾರ್ಗಗಳನ್ನು ಬಹಿರಂಗಪಡಿಸಿ',
    'revealLifePathDesc':'ನಿಖರವಾದ ಶಾಸ್ತ್ರದ ಮಾರ್ಗಗಳ ಮೂಲಕ ಧರ್ಮ, ಸಂಪತ್ತು, ಆರೋಗ್ಯ ಮತ್ತು ಸಂಬಂಧಗಳ ಜೀವನದ ಆಯಾಮಗಳನ್ನು ಬಹಿರಂಗಪಡಿಸಿ.',
    'transit.H1':'ಸಂತೋಷ ಮತ್ತು ಆರಾಮ','transit.H2':'ಹಣಕಾಸಿನ ನಿರ್ಬಂಧಗಳು','transit.H3':'ಧೈರ್ಯ ಮತ್ತು ಯಶಸ್ಸು','transit.H4':'ಮಾನಸಿಕ ಒತ್ತಡ','transit.H5':'ವಿಳಂಬಗಳು ಮತ್ತು ಚಿಂತೆಗಳು','transit.H6':'ವಿಜಯ ಮತ್ತು ಆರೋಗ್ಯ','transit.H7':'ಯಶಸ್ಸು ಮತ್ತು ಸಂತೋಷ','transit.H8':'ಅನಿರೀಕ್ಷಿತ ತೊಂದರೆಗಳು','transit.H9':'ಆಯಾಸ ಮತ್ತು ದುರಾದೃಷ್ಟ','transit.H10':'ಯಶಸ್ಸು ಮತ್ತು ಗೌರವ','transit.H11':'ಆದಾಯ ಮತ್ತು ಲಾಭಗಳು','transit.H12':'ಹೆಚ್ಚಿನ ವೆಚ್ಚಗಳು',title:"ಜ್ಯೋತಿಷ ದರ್ಶನ",
    subtitle:"ವೈದಿಕ ಜನ್ಮ ಕುಂಡಲಿ",
    inputTitle:"ಬ್ರಹ್ಮಾಂಡೀಯ ರೂಪರೇಖೆ",
    inputSubtitle:"ನಿಮ್ಮ ನಿಖರವಾದ ವೈದಿಕ ಜನ್ಮ ಕುಂಡಲಿಯನ್ನು ರಚಿಸಲು, ನಿಮ್ಮ ನಿಖರವಾದ ಜನ್ಮ ಸಮಯ ಮತ್ತು ಸ್ಥಳ ನಮಗೆ ಬೇಕು.",
    fullName:"ಪೂರ್ಣ ಹೆಸರು",
    namePlaceholder:"ಹೆಸರು ನಮೂದಿಸಿ (ಉದಾ. ರಾಹುಲ್)...",
    newChart:'ಹೊಸ ಕುಂಡಲಿ',deleteProfile:'ಪ್ರೊಫೈಲ್ ಅಳಿಸಿ',deleteAlert:'ನೀವು ಖಂಡಿತವಾಗಿಯೂ ಈ ಪ್ರೊಫೈಲ್ ಅನ್ನು ಅಳಿಸಲು ಬಯಸುವಿರಾ?',modalCancel:'ರದ್ದುಮಾಡಿ',modalDelete:'ಅಳಿಸಿ',currentProfile:'ಪ್ರಸ್ತುತ',profile:'ಪ್ರೊಫೈಲ್',todayHorizon:'ಇಂದಿನ ಹಾರಿಜಾನ್',weekAhead:'ಮುಂದಿನ ವಾರ',mixed:'ಮಿಶ್ರಿತ',challenging:'ಚಾಲೆಂಜಿಂಗ್',festival:'ಹಬ್ಬ',fastingPrac:'ಉಪವಾಸ ಮತ್ತು ಆಧ್ಯಾತ್ಮಿಕ ಅಭ್ಯಾಸಗಳು',auspiciousDay:'ಮಂಗಳಕರ ದಿನ',generate:'✦ ಕುಂಡಲಿ ರಚಿಸಿ',computing:'⟳ ಲೆಕ್ಕಾಚಾರ...',back:'← ಹಿಂದೆ',share:'⇧ ಹಂಚಿಕೊಳ್ಳಿ',download:'↓ PDF ಡೌನ್‌ಲೋಡ್',dob:'ಜನ್ಮ ದಿನಾಂಕ',tob:'ಜನ್ಮ ಸಮಯ',city:'ಜನ್ಮ ಸ್ಥಳ',country:'ದೇಶ',gender:'ಲಿಂಗ',male:'ಪುರುಷ',female:'ಮಹಿಳೆ',other:'ಇತರ',birthDetails:'ಜನ್ಮ ವಿವರಗಳು',tagline:'ವೈದಿಕ ಜನ್ಮ ಕುಂಡಲಿ · ಜ್ಯೋತಿಷ ದರ್ಶನ',headers:{insights:'ನನ್ನ ಒಳನೋಟಗಳು',compatibility:'ಸಂಬಂಧ ಹೊಂದಾಣಿಕೆ',addPartner:'ಪಾಲುದಾರರ ವಿವರ ಸೇರಿಸಿ',desk:'ಜ್ಯೋತಿಷ ಡೆಸ್ಕ್ (ತಾಂತ್ರಿಕ ಪ್ರದೇಶ)'},tabs:{overview:'ಅವಲೋಕನ',predictions:'ಭವಿಷ್ಯ',charts:'ಚಾರ್ಟ್‌ಗಳು',planets:'ಗ್ರಹ ಸ್ಥಿತಿ',dasha:'ದಶಾ',yoga:'ಯೋಗ ಮತ್ತು ದೋಷ',shadbala:'ಷಡ್ಬಲ',avarga:'ಅಷ್ಟಕವರ್ಗ',reading:'ತಜ್ಞ ವಿಶ್ಲೇಷಣೆ'},ov:{favorable:'ಅನುಕೂಲಕರ',favorableDesc:'ಹೊಸ ಉದ್ಯಮಗಳ ಪ್ರಾರಂಭ, ಆರ್ಥಿಕ ಯೋಜನೆ',avoid:'ತಪ್ಪಿಸಿ',avoidDesc:'ದೊಡ್ಡ ವಾದಗಳು, ಅಪಾಯಕಾರಿ ಹೂಡಿಕೆಗಳು',mantra:'ದೈನಂದಿನ ಮಂತ್ರ',mantraDesc:'ಓಂ ನಮಃ ಶಿವಾಯ',title:'ಜನ್ಮ ವಿವರ',sunrise:'ಸೂರ್ಯೋದಯ',sunset:'ಸೂರ್ಯಾಸ್ತ',lst:'LST',ayanamsa:'ಅಯನಾಂಶ (ಲಾಹಿರಿ)',tithi:'ತಿಥಿ',vara:'ವಾರ',nakshatra:'ನಕ್ಷತ್ರ',yoga:'ಯೋಗ',karana:'ಕರಣ',lagna:'ಲಗ್ನ',moon:'ಚಂದ್ರ ರಾಶಿ',sun:'ಸೂರ್ಯ ರಾಶಿ',curDasha:'ಪ್ರಸ್ತುತ ವಿಂಶೋತ್ತರಿ ದಶಾ',maha:'ಮಹಾದಶಾ',antar:'ಅಂತರ್ದಶಾ',birth:'ಜನ್ಮ ದಶಾ'},pl:{title:'ಗ್ರಹ ಸ್ಥಿತಿ',graha:'ಗ್ರಹ',rashi:'ರಾಶಿ',deg:'ಅಂಶ',nak:'ನಕ್ಷತ್ರ',pada:'ಪಾದ',nakL:'ನಕ್ಷತ್ರೇಶ',signL:'ರಾಶ್ಯಾಧಿಪತಿ',bhava:'ಭಾವ',status:'ಸ್ಥಿತಿ'},da:{title:'ವಿಂಶೋತ್ತರಿ ಮಹಾದಶಾ',cur:'ಪ್ರಸ್ತುತ',antars:'ಅಂತರ್ದಶಾ ಅವಧಿ'},yo:{title:'ಯೋಗ ಮತ್ತು ದೋಷ ಫಲ',raja:'ರಾಜಯೋಗ',dhana:'ಧನಯೋಗ',dosha:'ದೋಷ',none:'ನಿರ್ದಿಷ್ಟ ಯೋಗಗಳು ಕಂಡುಬಂದಿಲ್ಲ.'},sh:{title:'ಷಡ್ಬಲ'},av:{title:'ಅಷ್ಟಕವರ್ಗ'},rd:{title:'ತಜ್ಞ ಜ್ಯೋತಿಷ ವಿಶ್ಲೇಷಣೆ',lagnaA:'ಲಗ್ನ ವಿಶ್ಲೇಷಣೆ',moonA:'ಚಂದ್ರ ರಾಶಿ ವಿಶ್ಲೇಷಣೆ',dashaR:'ಪ್ರಸ್ತುತ ದಶಾ ವಿಶ್ಲೇಷಣೆ',yogaI:'ಸಕ್ರಿಯ ಯೋಗ ಪ್ರಭಾವ',strengthR:'ಗ್ರಹ ಬಲ ವಿಶ್ಲೇಷಣೆ',disc:'ಈ ವಿಶ್ಲೇಷಣೆ ಪಾರಾಶರಿ ಜ್ಯೋತಿಷ ತತ್ವಗಳ ಆಧಾರದ ಮೇಲೆ ರಚಿಸಲಾಗಿದೆ.'},pdf:{title:'ಜನ್ಮ ಕುಂಡಲಿ',by:'ಜ್ಯೋತಿಷ ದರ್ಶನ ರಚಿಸಿದೆ',lahiri:'ಲಾಹಿರಿ ಅಯನಾಂಶ',para:'ಪಾರಾಶರಿ ಪದ್ಧತಿ'},inputAccuracy:'⚠ 15 ನಿಮಿಷದ ಖಾತರಿ ಬದಲಾವಣೆ ಲಗ್ನ ಬದಲಾಯಿಸಬಹುದು',inputPrivacy:'🔒 ಎಲ್ಲಾ ಲೆಕ್ಕಾಚಾರಗಳು ನಿಮ್ಮ ಬ್ರೌಜರ್‌ನಲ್ಲಿ ಸ್ಥಳೀಯವಾಗಿ ಚಲಿಸುತ್ತವೆ. ಯಾವುದೇ ಡೇಟಾ ಸಂಗ್ರಹಣೆ ಆಗುವುದಿಲ್ಲ.',inputLoading:'ಲಾಹಿರಿ ಅಯನಾಂಶ ಸರಿಪಡಿಕೆ ಅನ್ವಯವಾಗುತ್ತಿದೆ...',cityPlaceholder:'ನಗರದ ಹೆಸರನ್ನು ನಮೂದಿಸಿ (ಉದಾ. ಬೆಂಗಳೂರು, ಮುಂಬೈ)...',required:'ಅಗತ್ಯ',selectCity:'ದಯವಿಟ್ಟು ಡ್ರಾಪ್ ​​ಡೌನ್ ನಿಂದ ನಗರ ಆರಿಸಿ','ov.rashiChart':'ರಾಶಿ ಚಾರ್ಟ್ (D1)','ov.navamsa':'ನವಾಂಶ (D9)','ov.nakLabel':'ನಕ್ಷತ್ರ:','pl.lagnaLabel':'ಲಗ್ನ','pl.lagnaLord':'ಲಗ್ನೇಶ','pl.bhavaTitle':'ಭಾವ ಅವಲೋಕನ (12 ಭಾವಗಳು)','pl.house':'ಭಾವ','pl.lord':'ಸ್ವಾಮಿ','pl.empty':'ಖಾಲಿ ಭಾವ','ch.shodasha':'ಷೋಡಶ ವರ್ಗ (16)','ch.south':'⊞ ದಕ್ಷಿಣ','ch.north':'◇ ಉತ್ತರ','ch.vargottama':'ವರ್ಗೋತ್ತಮ','da.yrs':'ವರ್ಷ','da.active':'ಸಕ್ರಿಯ','da.now':'ಈಗ','da.currentInfo':'ವರ್ತಮಾನ: '+'{placeholder}'+' ಮಹಾದಶಾ — ಸುನ್ನತ ಗಡಿ · ವಿಸ್ತೃತ ಮಾಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ','yo.noYogaMsg':'ಯಾವುದೇ ಪ್ರಮುಖ ಯೋಗಗಳು ಕಂಡುಬಂದಿಲ್ಲ. ಇದು ದುರ್ಬಲ ಚಾರ್ಟ್ ಎಂದು ಅರ್ಥವಲ್ಲ — ಅನೇಕ ಶಕ್ತಿಶಾಲಿ ಯೋಗಗಳು ಸೂಕ್ಷ್ಮ ಸಂಯೋಜನೆಗಳಿಂದ ಉದ್ಭವವಾಗುತ್ತವೆ.','yo.noRaja':'ಯಾವುದೇ {raja} ಕಂಡುಬಂದಿಲ್ಲ.','yo.noDhana':'ಯಾವುದೇ {dhana} ಕಂಡುಬಂದಿಲ್ಲ।','yo.noDosha':'ಯಾವುದೇ ಪ್ರಮುಖ ದೋಷಗಳು ಕಂಡುಬಂದಿಲ್ಲ — ಶುಭ.','yo.panchaMaha':'ಪಂಚ ಮಹಾಪುರುಷ','yo.wealth':'ಸಂಪತ್ತು','yo.afflictions':'ಆಪತ್ತುಗಳು','yo.formedBy':'ರಚಿಸಿದ್ದು','yo.remedies':'ಪರಿಹಾರ: ವ್ಯಕ್ತಿಗತಕರಣ ಗ್ರಹ ಶಾಂತಿ, ದಾನ ಮತ್ತು ರತ್ನದ ಶಿಫಾರಿಶುಗಳಿಗಾಗಿ ಅರ್ಹ ಜ್ಯೋತಿಷಿಯನ್ನು ಸಂಪರ್ಕಿಸಿ.','yo.rajaYoga':'ರಾಜಯೋಗ','yo.dhanaYoga':'ಧನಯೋಗ','yo.doshaLabel':'ದೋಷ','sh.virupas':'ವಿರುಪ','sh.graha':'ಗ್ರಹ','sh.sthana':'ಸ್ಥಾನ','sh.dig':'ದಿಕ್','sh.kala':'ಕಾಲ','sh.chesta':'ಚೆಷ್ಠ','sh.naisargika':'ನೈಸರ್ಗಿಕ','sh.drik':'ದೃಕ್','sh.total':'ಒಟ್ಟು','sh.strength':'ಶಕ್ತಿ','sh.strong':'ಬಲಿಷ್ಠ','sh.moderate':'ಮಧ್ಯಮ','sh.weak':'ದುರ್ಬಲ','sh.comparative':'ತುಲನಾತ್ಮಕ ಶಕ್ತಿ','av.bindu':'ಶುಭ ಬಿಂದು ವಿಶ್ಲೇಷಣೆ','av.binduDesc':'ಹೆಚ್ಚಿನ ಬಿಂದುಗಳು = ಆ ರಾಶಿಯ ಮೂಲಕ ಬಲಿಷ್ಠ ಟ್ರಾಂಜಿಟ್ ಫಲಿತಾಂಶಗಳು.','av.bav':'BAV','av.sav':'ಸರ್ವಾಷ್ಟಕವರ್ಗ (SAV)','av.savDesc':'ಪ್ರತಿ ರಾಶಿಗೆ ಒಟ್ಟು ಬಿಂದುಗಳು','av.stdTotal':'ಪ್ರಮಾಣಿತ ಒಟ್ಟು','av.yours':'ನಿಮ್ಮದು','rd.subtitle':'ಪಾರಾಶರ ಹೋರಾ ಶಾಸ್ತ್ರ · ಲಾಹಿರಿ ಅಯನಾಂಶ','rd.chandra':'ಚಂದ್ರ — ಭಾವನಾತ್ಮಕ ಸ್ವಭಾವ ಮತ್ತು ಜನ್ಮ ನಕ್ಷತ್ರ','rd.artha':'ಅರ್ಥ — ವೃತ್ತಿ ಮತ್ತು ಧರ್ಮಿಕ ಉದ್ದೇಶ','rd.kama':'ಕಾಮ — ಸಂಬಂಧಗಳು ಮತ್ತು ವಿವಾಹ','rd.dashaPhala':'ದಶಾ ಫಲ','rd.moksha':'ಮೋಕ್ಷ — ಆಧ್ಯಾತ್ಮಿಕ ಇಚ್ಛೆಗಳು','rd.note':'ಸೂಚನೆ','validation.required':'ಅಗತ್ಯ','validation.selectCity':'ಡ್ರಾಪ್‌ಡೌನ್‍‍ನಿಂದ ನಗರವನ್ನು ಆಯ್ಕೆ ಮಾಡಿ','pdf.rashiChart':'D1 · ರಾಶಿ ಚಾರ್ಟ್','pdf.navamsa':'D9 · ನವಾಂಶ','pdf.years':'ವರ್ಷಗಳು','pdf.start':'ಆರಂಭ','pdf.end':'ಅಂತ','pdf.antardasha':'ಅಂತರ್ದಶೆ','pdf.yogaDosha':'ಯೋಗ / ದೋಷ','pdf.type':'ಪ್ರಕಾರ','pdf.effect':'ಪರಿಣಾಮ','pdf.planet':'ಗ್ರಹ','pdf.totalStrength':'ಒಟ್ಟು ಶಕ್ತಿ','pdf.classification':'ವರ್ಗೀಕರಣ','pdf.printBtn':'ಮುದ್ರಿಸಿ / PDF ಆಗಿ ಉಳಿಸಿ','pdf.closeBtn':'ಮುಚ್ಚಿ','pdf.ayanamsa':'ಅಯನಾಂಶ','pdf.pada':'ಪದ','ashtakavarga.total':'ಒಟ್ಟು','shadbala.strong':'ಶಕ್ತಿಶಾಲಿ','shadbala.moderate':'ಮಧ್ಯಮ','shadbala.weak':'ದುರ್ಬಲ','formNote':'ನಿಖರ ಕುಂಡಲಿಗೆ ಎಲ್ಲಾ ಮಾಹಿತಿ ಅವಶ್ಯಕ','ch.asc':'ಲಗ್ನ','copied':'✓ ನಕಲಾಯಿತು!','popupAlert':'PDF ಡೌನ್‌ಲೋಡ್ ಮಾಡಲು ಪಾಪ್‌ಅಪ್ ಅನುಮತಿಸಿ.','comp.title':'ಸಂಬಂಧ ಹೊಂದಾಣಿಕೆ','comp.milan':'ಅಷ್ಟಕೂಟ ಮಿಲನ','comp.addPartner':'ಪಾಲುದಾರರ ವಿವರ ಸೇರಿಸಿ','comp.match':'ಚಾರ್ಟ್ ಹೊಂದಿಸಿ','comp.cancel':'ರದ್ದುಮಾಡಿ','comp.user':'ಬಳಕೆದಾರ','comp.partner':'ಪಾಲುದಾರ','comp.moonR':'ಚಂದ್ರ ರಾಶಿ','comp.nak':'ನಕ್ಷತ್ರ','comp.manglik':'ಮಾಂಗಲಿಕ','comp.yes':'ಹೌದು','comp.no':'ಇಲ್ಲ','comp.verdict':'ಹೊಂದಾಣಿಕೆ ಫಲಿತಾಂಶ','comp.kuja':'ಕುಜ ದೋಷ ಮೌಲ್ಯಮಾಪನ','comp.breakdown':'8-ಕೂಟ ವಿವರಣೆ'},
te:{
    'revealLifePathTitle':'జీవిత మార్గాలను బహిర్గతం చేయండి',
    'revealLifePathDesc':'ఖచ్చితమైన శాస్త్రోక్త మార్గాల ద్వారా ధర్మం, సంపద, ఆరోగ్యం మరియు సంబంధాల జీవిత కోణాలను బహిర్గతం చేయండి.',
    'transit.H1':'ఆనందం మరియు సౌకర్యం','transit.H2':'ఆర్థిక పరిమితులు','transit.H3':'ధైర్యం మరియు విజయం','transit.H4':'మానసిక ఒత్తిడి','transit.H5':'జాప్యాలు & చింతలు','transit.H6':'విజయం & ఆరోగ్యం','transit.H7':'విజయం & ఆనందం','transit.H8':'ఊహించని ఇబ్బందులు','transit.H9':'అలసట మరియు దురదృష్టం','transit.H10':'విజయం & గౌరవం','transit.H11':'ఆదాయం మరియు లాభాలు','transit.H12':'అధిక ఖర్చులు',title:"జ్యోతిష్ దర్శన్",
    subtitle:"వైదిక జన్మ కుండలి",
    inputTitle:"బ్రహ్మాండీయ రూపరేఖ",
    inputSubtitle:"మీ ఖచ్చితమైన వైదిక జన్మ కుండలిని రూపొందించడానికి, మీ ఖచ్చితమైన జనన సమయం మరియు స్థలం మాకు అవసరం.",
    fullName:"పూర్తి పేరు",
    namePlaceholder:"పేరు నమోదు చేయండి (ఉదా. రాహుల్)...",
    newChart:'కొత్త కుండలి',deleteProfile:'ప్రొఫైల్ తొలగించండి',deleteAlert:'మీరు ఖచ్చితంగా ఈ ప్రొఫైల్‌ను తొలగించాలనుకుంటున్నారా?',modalCancel:'రద్దు చేయండి',modalDelete:'తొలగించు',currentProfile:'ప్రస్తుత',profile:'ప్రొఫైల్',todayHorizon:'నేటి హోరిజోన్',weekAhead:'ముందు వారం',mixed:'మిక్స్డ్',challenging:'చాలెంజింగ్',festival:'పండుగ',fastingPrac:'ఉపవాసం మరియు ఆధ్యాత్మిక పద్ధతులు',auspiciousDay:'శుభ దినం',generate:'✦ కుండలి రూపొందించు',computing:'⟳ గణన జరుగుతోంది...',back:'← వెనుక',share:'⇧ పంచుకో',download:'↓ PDF డౌన్‌లోడ్',dob:'జన్మ తేదీ',tob:'జన్మ సమయం',city:'జన్మ స్థలం',country:'దేశం',gender:'లింగం',male:'పురుషుడు',female:'మహిళ',other:'ఇతరులు',birthDetails:'జన్మ వివరాలు',tagline:'వైదిక జన్మ కుండలి · జ్యోతిష్ దర్శన్',headers:{insights:'నా అంతర్దృష్టులు',compatibility:'సంబంధ అనుకూలత',addPartner:'భాగస్వామిని జోడించండి',desk:'జ్యోతిష్ డెస్క్ (సాంకేతిక ప్రాంతం)'},tabs:{overview:'అవలోకనం',predictions:'భవిష్యత్',charts:'చార్టులు',planets:'గ్రహ స్థితి',dasha:'దశ',yoga:'యోగం & దోషం',shadbala:'షడ్బల',avarga:'అష్టకవర్గ',reading:'నిపుణ విశ్లేషణ'},ov:{favorable:'అనుకూలం',favorableDesc:'కొత్త పనుల ప్రారంభం, ఆర్థిక ప్రణాళిక',avoid:'నివారించండి',avoidDesc:'పెద్ద గొడవలు, ప్రమాదకర పెట్టుబడులు',mantra:'దైనందిన మంత్రం',mantraDesc:'ఓం నమః శివాయ',title:'జన్మ వివరాలు',sunrise:'సూర్యోదయం',sunset:'सूर्यास्तमయం',lst:'LST',ayanamsa:'అయనాంశం (లాహిరి)',tithi:'తిథి',vara:'వారం',nakshatra:'నక్షత్రం',yoga:'యోగం',karana:'కరణం',lagna:'లగ్నం',moon:'చంద్ర రాశి',sun:'సూర్య రాశి',curDasha:'ప్రస్తుత దశ',maha:'మహాదశ',antar:'అంతర్దశ',birth:'జన్మ దశ'},pl:{title:'గ్రహ స్థితి',graha:'గ్రహం',rashi:'రాశి',deg:'అంశం',nak:'నక్షత్రం',pada:'పాదం',nakL:'నక్షత్రేశుడు',signL:'రాశ్యధిపతి',bhava:'భావం',status:'స్థితి'},da:{title:'విమ్శోత్తరి మహాదశ',cur:'ప్రస్తుతం',antars:'అంతర్దశ కాలాలు'},yo:{title:'యోగ మరియు దోష ఫలం',raja:'రాజయోగం',dhana:'ధనయోగం',dosha:'దోషం',none:'ప్రత్యేక యోగాలు కనుగొనబడలేదు.'},sh:{title:'షడ్బల'},av:{title:'అష్టకవర్గ'},rd:{title:'నిపుణ జ్యోతిష విశ్లేషణ',lagnaA:'లగ్న విశ్లేషణ',moonA:'చంద్ర రాశి విశ్లేషణ',dashaR:'ప్రస్తుత దశ విశ్లేషణ',yogaI:'చురుకైన యోగ ప్రభావం',strengthR:'గ్రహ బల విశ్లేషణ',disc:'ఈ విశ్లేషణ పారాశరి జ్యోతిష సూత్రాల ఆధారంగా రూపొందించబడింది.'},pdf:{title:'జన్మ కుండలి',by:'జ్యోతిష్ దర్శన్ ద్వారా',lahiri:'లాహిరి అయనాంశం',para:'పారాశరి పద్ధతి'},inputAccuracy:'⚠ 15 నిమిషల ఖచ్చితత్వ మార్పు లగ్నాన్ని మార్చవచ్చు',inputPrivacy:'🔒 అన్ని గణనలు మీ బ్రౌజర్‌లో స్థానికంగా నడుస్తాయి. ఏ డేటా నిల్వ చేయబడదు.',inputLoading:'లాహిరి అయనాంశ సరిదిద్దు వర్తిస్తోంది...',cityPlaceholder:'నగర పేరు టైప్ చేయండి (ఉదా. బెంగళూరు, ముంబాయి)...',required:'అవసరమైన',selectCity:'దయచేసి డ్రాప్‌డౌన్ నుండి నగరం ఎంచుకోండి','ov.rashiChart':'రాశి చార్ట్ (D1)','ov.navamsa':'నవాంశ (D9)','ov.nakLabel':'నక్షత్రం:','pl.lagnaLabel':'లగ్నం','pl.lagnaLord':'లగ్నేశుడు','pl.bhavaTitle':'భావ అవలోకనం (12 భావాలు)','pl.house':'భావం','pl.lord':'అధిపతి','pl.empty':'ఖాళీ భావం','ch.shodasha':'షోడశ వర్గ (16)','ch.south':'⊞ దక్షిణ','ch.north':'◇ ఉత్తర','ch.vargottama':'వర్గోత్తమ','da.yrs':'సంవత్సరాలు','da.active':'సక్రియం','da.now':'ఇప్పుడు','da.currentInfo':'ప్రస్తుతం: '+'{placeholder}'+' మహాదశ — బంగారు సరిహద్దు · విస్తరించటానికి క్లిక్ చేయండి','yo.noYogaMsg':'ప్రధాన యోగాలు కనుగొనబడలేదు. ఇది బలహీన చార్ట్ కాదని అర్థం కాదు — అనేక శక్తిశాలీ యోగాలు సూక్ష్మ సంయోజనల నుండి ఉద్భవిస్తాయి.','yo.noRaja':'ప్రత్యేక {raja} కనుగొనబడలేదు.','yo.noDhana':'ప్రత్యేక {dhana} కనుగొనబడలేదు.','yo.noDosha':'ఏ ప్రధాన దోషాలు కనుగొనబడలేదు — శుభం.','yo.panchaMaha':'పంచ మహాపురుష','yo.wealth':'సంపద','yo.afflictions':'ఆపదలు','yo.formedBy':'ద్వారా ఏర్పడింది','yo.remedies':'నిరసనలు: వ్యక్తిగతమైన గ్రహ శాంతి, దానం మరియు రత్న సిఫారసుల కోసం యోగ్యమైన జ్యోతిషిని సంప్రదించండి.','yo.rajaYoga':'రాజయోగం','yo.dhanaYoga':'ధనయోగం','yo.doshaLabel':'దోష','sh.virupas':'విరుప','sh.graha':'గ్రహం','sh.sthana':'స్థాన','sh.dig':'దిక్','sh.kala':'కాల','sh.chesta':'చేష్ట','sh.naisargika':'నైసర్గిక','sh.drik':'దృక్','sh.total':'మొత్తం','sh.strength':'శక్తి','sh.strong':'బలవంతమైన','sh.moderate':'మధ్యమ','sh.weak':'బలహీనమైన','sh.comparative':'తులనాత్మక శక్తి','av.bindu':'శుభ బిందు విశ్లేషణ','av.binduDesc':'అధిక బిందువులు = ఆ రాశి ద్వారా శక్తిమైన ట్రాన్సిట్ ఫలితాలు.','av.bav':'BAV','av.sav':'సర్వాష్టకవర్గ (SAV)','av.savDesc':'ప్రతి రాశికి మొత్తం బిందువులు','av.stdTotal':'ప్రామాణిక మొత్తం','av.yours':'మీది','rd.subtitle':'పారాశర హోర శాస్త్ర · లాహిరి అయనాంశం','rd.chandra':'చంద్ర — భావనా స్వభావం మరియు జన్మ నక్షత్రం','rd.artha':'అర్థ — ఉద్యోగం మరియు ధర్మిక ఉద్దేశ్యం','rd.kama':'కామ — సంబంధాలు మరియు వివాహం','rd.dashaPhala':'దశ ఫల','rd.moksha':'మోక్ష — ఆధ్యాత్మిక ప్రవృత్తులు','rd.note':'గమనిక','validation.required':'అవసరం','validation.selectCity':'డ్రాప్‌డౌన్ నుండి నగరాన్ని ఎంచుకోండి','pdf.rashiChart':'D1 · రాశి చార్ట్','pdf.navamsa':'D9 · నవాంశ','pdf.years':'సంవత్సరాలు','pdf.start':'ప్రారంభం','pdf.end':'ముగింపు','pdf.antardasha':'అంతర్దశ','pdf.yogaDosha':'యోగ / దోష','pdf.type':'రకం','pdf.effect':'ప్రభావం','pdf.planet':'గ్రహ','pdf.totalStrength':'మొత్తం శక్తి','pdf.classification':'వర్గీకరణ','pdf.printBtn':'ప్రింట్ చేయండి / PDF గా సేవ్ చేయండి','pdf.closeBtn':'మూసివేయండి','pdf.ayanamsa':'అయనాంశ','pdf.pada':'పద','ashtakavarga.total':'మొత్తం','shadbala.strong':'శక్తిమంతమైన','shadbala.moderate':'మధ్యస్థ','shadbala.weak':'బలహీనమైన','formNote':'ఖచ్చితమైన కుండలి కోసం అన్ని వివరాలు అవసరం','ch.asc':'లగ్నం','copied':'✓ కాపీ అయింది!','popupAlert':'PDF డౌన్‌లోడ్ చేయడానికి పాపప్‌లను అనుమతించండి.','comp.title':'Relationship Compatibility','comp.milan':'Ashtakoota Milan','comp.addPartner':'భాగస్వామిని జోడించండి','comp.match':'Match Charts','comp.cancel':'Cancel','comp.user':'User','comp.partner':'Partner','comp.moonR':'Moon Rashi','comp.nak':'Nakshatra','comp.manglik':'Manglik','comp.yes':'అవును','comp.no':'లేదు','comp.verdict':'Compatibility Verdict','comp.kuja':'Kuja (Manglik) Dosha Evaluation','comp.breakdown':'8-Koota Breakdown & Explanation'},
ta:{
    'revealLifePathTitle':'வாழ்க்கை பாதைகளை வெளிப்படுத்துங்கள்',
    'revealLifePathDesc':'துல்லியமான சாஸ்திர வழிகள் மூலம் தர்மம், செல்வம், ஆரோக்கியம் மற்றும் உறவுகளின் வாழ்க்கை பரிமாணங்களை வெளிப்படுத்துங்கள்.',
    'transit.H1':'மகிழ்ச்சி மற்றும் ஆறுதல்','transit.H2':'நிதி கட்டுப்பாடுகள்','transit.H3':'தைரியம் மற்றும் வெற்றி','transit.H4':'மன அழுத்தம்','transit.H5':'தாமதங்கள் & கவலைகள்','transit.H6':'வெற்றி & ஆரோக்கியம்','transit.H7':'வெற்றி & மகிழ்ச்சி','transit.H8':'எதிர்பாராத பிரச்சனைகள்','transit.H9':'சோர்வு மற்றும் கெட்ட அதிர்ஷ்டம்','transit.H10':'வெற்றி & கௌரவம்','transit.H11':'வருமானம் மற்றும் ஆதாயங்கள்','transit.H12':'அதிக செலவுகள்',title:"ஜோதிட தரிசனம்",
    subtitle:"வேத ஜாதகம்",
    inputTitle:"பிரம்மாண்ட ரூபரேகா",
    inputSubtitle:"உங்கள் துல்லியமான வேத ஜாதகத்தை உருவாக்க, உங்கள் சரியான பிறந்த நேரம் மற்றும் இடம் எங்களுக்குத் தேவை.",
    fullName:"முழு பெயர்",
    namePlaceholder:"பெயரை உள்ளிடவும் (எ.கா. ராகுல்)...",
    newChart:'புதிய குண்டலி',deleteProfile:'சுயவிவரத்தை நீக்கு',deleteAlert:'இந்த சுயவிவரத்தை உறுதியாக நீக்க விரும்புகிறீர்களா?',modalCancel:'ரத்துசெய்',modalDelete:'நீக்கு',currentProfile:'தற்போதைய',profile:'சுயவிவரம்',todayHorizon:'இன்றைய அடிவானம்',weekAhead:'தி வீக் அஹெட்',mixed:'கலப்பு',challenging:'சவாலான',festival:'திருவிழா',fastingPrac:'உண்ணாவிரதம் மற்றும் ஆன்மீக நடைமுறைகள்',auspiciousDay:'மங்களகரமான நாள்',generate:'✦ குண்டலி உருவாக்கு',computing:'⟳ கணக்கிடுகிறது...',back:'← பின்னால்',share:'⇧ பகிர்',download:'↓ PDF பதிவிறக்கம்',dob:'பிறந்த தேதி',tob:'பிறந்த நேரம்',city:'பிறந்த ஊர்',country:'நாடு',gender:'பாலினம்',male:'ஆண்',female:'பெண்',other:'மற்றவை',birthDetails:'பிறப்பு விவரங்கள்',tagline:'வேத ஜாதகம் · ஜோதிட தரிசனம்',headers:{insights:'என் பார்வைகள்',compatibility:'உறவு பொருத்தம்',addPartner:'பங்குதாரரின் விவரங்களைச் சேர்',desk:'ஜோதிட டெஸ்க் (தொழில்நுட்ப பகுதி)'},tabs:{overview:'கண்ணோட்டம்',predictions:'பலன்கள்',charts:'வரைபடங்கள்',planets:'கிரக நிலை',dasha:'திசை',yoga:'யோகம் & தோஷம்',shadbala:'ஷட்பலம்',avarga:'அஷ்டகவர்கம்',reading:'நிபுணர் பகுப்பாய்வு'},ov:{favorable:'சாதகமானது',favorableDesc:'புதிய முயற்சிகள் தொடக்கம், நிதி திட்டமிடல்',avoid:'தவிர்க்கவும்',avoidDesc:'பெரிய விவாதங்கள், ஆபத்தான முதலீடுகள்',mantra:'தினசரி மந்திரம்',mantraDesc:'ஓம் நம சிவாய',title:'ஜனன விவரம்',sunrise:'சூரிய உதயம்',sunset:'சூரிய அஸ்தமனம்',lst:'LST',ayanamsa:'அயனாம்சம் (லாகிரி)',tithi:'திதி',vara:'வாரம்',nakshatra:'நட்சத்திரம்',yoga:'யோகம்',karana:'கரணம்',lagna:'லக்னம்',moon:'சந்திர ராசி',sun:'சூரிய ராசி',curDasha:'நடப்பு விம்சோத்தரி திசை',maha:'மகா திசை',antar:'அந்தர திசை',birth:'பிறப்பு திசை'},pl:{title:'கிரக நிலை',graha:'கிரகம்',rashi:'ராசி',deg:'பாகை',nak:'நட்சத்திரம்',pada:'பாதம்',nakL:'நட்சத்திர நாதன்',signL:'ராசி நாதன்',bhava:'பாவம்',status:'நிலை'},da:{title:'விம்சோத்தரி மகா திசை',cur:'நடப்பு',antars:'அந்தர திசை காலங்கள்'},yo:{title:'யோகம் மற்றும் தோஷ பலன்',raja:'ராஜயோகம்',dhana:'தனயோகம்',dosha:'தோஷம்',none:'குறிப்பிட்ட யோகங்கள் கண்டறியப்படவில்லை.'},sh:{title:'ஷட்பலம்'},av:{title:'அஷ்டகவர்கம்'},rd:{title:'நிபுணர் ஜோதிட பகுப்பாய்வு',lagnaA:'லக்ன பகுப்பாய்வு',moonA:'சந்திர ராசி பகுப்பாய்வு',dashaR:'நடப்பு திசை பகுப்பாய்வு',yogaI:'செயலில் உள்ள யோக தாக்கம்',strengthR:'கிரக பல பகுப்பாய்வு',disc:'இந்த பகுப்பாய்வு பராசர ஜோதிட கோட்பாடுகளின் அடிப்படையில் தயாரிக்கப்பட்டது.'},pdf:{title:'ஜனன குண்டலி',by:'ஜோதிட தரிசனம் மூலம்',lahiri:'லாகிரி அயனாம்சம்',para:'பராசர முறை'},inputAccuracy:'⚠ 15 நிமிட துல்லியம் மாற்றம் லக்னத்தை மாற்றலாம்',inputPrivacy:'🔒 அனைத்து கணக்கீடுகளும் உங்கள் உலாவியில் இயங்குகின்றன. தரவு சேமிக்கப்படாது.',inputLoading:'லாகிரி அயனாம்ச திருத்தம் பயன்படுத்தப்படுகிறது...',cityPlaceholder:'நகரத்தின் பெயரை தட்டச்சு செய்யவும் (எ.கா. பெங்களூரு, மும்பை)...',required:'தேவை',selectCity:'கீழ்தோன்றலிருந்து நகரத்தைத் தேர்ந்தெடுக்கவும்','ov.rashiChart':'ராசி வரைபடம் (D1)','ov.navamsa':'நவாம்சம் (D9)','ov.nakLabel':'நட்சத்திரம்:','pl.lagnaLabel':'லக்னம்','pl.lagnaLord':'லக்னாதிபதி','pl.bhavaTitle':'பாவ கண்ணோட்டம் (12 பாவங்கள்)','pl.house':'பாவம்','pl.lord':'அதிபதி','pl.empty':'காலி பாவம்','ch.shodasha':'ஷோடச வர்கம் (16)','ch.south':'⊞ தெற்கு','ch.north':'◇ வடக்கு','ch.vargottama':'வர்கோத்தமம்','da.yrs':'வருடங்கள்','da.active':'செயலில்','da.now':'இப்போது','da.currentInfo':'நடப்பு: '+'{placeholder}'+' மகா திசை — தங்க எல்லை · விரிவாக்க கிளிக் செய்யவும்','yo.noYogaMsg':'முக்கிய யோகங்கள் கண்டறியப்படவில்லை. இது பலவீனமான ஜாதகம் என்று அர்த்தமல்ல — பல சக்திவாய்ந்த யோகங்கள் நுட்பமான சேர்க்கைகளிலிருந்து எழுகின்றன.','yo.noRaja':'{raja} கண்டறியப்படவில்லை.','yo.noDhana':'{dhana} கண்டறியப்படவில்லை.','yo.noDosha':'முக்கிய தோஷங்கள் கண்டறியப்படவில்லை — சுபம்.','yo.panchaMaha':'பஞ்ச மகாபுருஷ','yo.wealth':'செல்வம்','yo.afflictions':'துன்பங்கள்','yo.formedBy':'உருவாக்கியவர்','yo.remedies':'பரிகாரங்கள்: தனிப்பயனாக்கப்பட்ட கிரக சாந்தி, தானம் மற்றும் ரத்தின பரிந்துரைகளுக்கு தகுதியான ஜோதிடரை அணுகவும்.','yo.rajaYoga':'ராஜ யோகம்','yo.dhanaYoga':'தன யோகம்','yo.doshaLabel':'தோஷம்','sh.virupas':'விருப','sh.graha':'கிரகம்','sh.sthana':'ஸ்தான','sh.dig':'திக்','sh.kala':'கால','sh.chesta':'சேஷ்ட','sh.naisargika':'நைசர்கிக','sh.drik':'திருக்','sh.total':'மொத்தம்','sh.strength':'பலம்','sh.strong':'வலிமை','sh.moderate':'நடுத்தரம்','sh.weak':'பலவீனம்','sh.comparative':'ஒப்பீட்டு பலம்','av.bindu':'சுப பிந்து பகுப்பாய்வு','av.binduDesc':'அதிக பிந்துக்கள் = அந்த ராசி வழியாக வலுவான கோசார பலன்கள்.','av.bav':'BAV','av.sav':'சர்வாஷ்டகவர்கம் (SAV)','av.savDesc':'ஒவ்வொரு ராசிக்கும் மொத்த பிந்துக்கள்','av.stdTotal':'நிலையான மொத்தம்','av.yours':'உங்களுடையது','rd.subtitle':'பராசர ஹோரா சாஸ்திரம் · லாகிரி அயனாம்சம்','rd.chandra':'சந்திரன் — உணர்ச்சி இயல்பு மற்றும் ஜன்ம நட்சத்திரம்','rd.artha':'அர்த்த — தொழில் மற்றும் தர்ம நோக்கம்','rd.kama':'காம — உறவுகள் மற்றும் திருமணம்','rd.dashaPhala':'திசா பலன்','rd.moksha':'மோட்சம் — ஆன்மீக போக்குகள்','rd.note':'குறிப்பு','validation.required':'தேவை','validation.selectCity':'கீழ்தோன்றலிருந்து நகரத்தைத் தேர்ந்தெடுக்கவும்','pdf.rashiChart':'D1 · ராசி வரைபடம்','pdf.navamsa':'D9 · நவாம்சம்','pdf.years':'வருடங்கள்','pdf.start':'தொடக்கம்','pdf.end':'முடிவு','pdf.antardasha':'அந்தர திசை','pdf.yogaDosha':'யோகம் / தோஷம்','pdf.type':'வகை','pdf.effect':'விளைவு','pdf.planet':'கிரகம்','pdf.totalStrength':'மொத்த பலம்','pdf.classification':'வகைப்பாடு','pdf.printBtn':'அச்சிடு / PDF ஆக சேமி','pdf.closeBtn':'மூடு','pdf.ayanamsa':'அயனாம்சம்','pdf.pada':'பாதம்','ashtakavarga.total':'மொத்தம்','shadbala.strong':'வலிமை','shadbala.moderate':'நடுத்தரம்','shadbala.weak':'பலவீனம்','formNote':'துல்லியமான குண்டலிக்கு அனைத்து விவரங்களும் தேவை','ch.asc':'லக்னம்','copied':'✓ நகலெடுக்கப்பட்டது!','popupAlert':'PDF பதிவிறக்க பாப்அப் அனுமதிக்கவும்.','comp.title':'Relationship Compatibility','comp.milan':'Ashtakoota Milan','comp.addPartner':'பங்குதாரரின் விவரங்களைச் சேர்','comp.match':'Match Charts','comp.cancel':'Cancel','comp.user':'User','comp.partner':'Partner','comp.moonR':'Moon Rashi','comp.nak':'Nakshatra','comp.manglik':'Manglik','comp.yes':'ஆம்','comp.no':'இல்லை','comp.verdict':'Compatibility Verdict','comp.kuja':'Kuja (Manglik) Dosha Evaluation','comp.breakdown':'8-Koota Breakdown & Explanation'},
sa:{
    'transit.H1':'सुखम् (Happiness)','transit.H2':'धनहानिः (Wealth Loss)','transit.H3':'सफलता (Success)','transit.H4':'मानसिककष्टम् (Mental Stress)','transit.H5':'चिन्ता (Worry)','transit.H6':'विजयः (Victory)','transit.H7':'आनन्दः (Joy)','transit.H8':'कष्टम् (Trouble)','transit.H9':'श्रमः (Fatigue)','transit.H10':'सम्मानः (Honor)','transit.H11':'लाभः (Gains)','transit.H12':'व्ययः (Expense)',title:"ज्योतिर्दर्शनम्",
    subtitle:"वैदिकं जन्मकुण्डली",
    inputTitle:"ब्रह्माण्डीय रूपरेखा",
    inputSubtitle:"भवतः सटीकं वैदिकं जन्मकुण्डलीं रचयितुं, अस्माकं भवतः जन्मस्य सटीकः समयः स्थानं च आवश्यकम्।",
    fullName:"पूर्णं नाम",
    namePlaceholder:"नाम प्रविष्टं करोतु (यथा राहुलः)...",
    newChart:'नूतनकुण्डली',deleteProfile:'प्रोफाइलं निष्कासयतु',deleteAlert:'किं भवान् निश्चितरूपेण इमां प्रोफाइलं निष्कासयितुम् इच्छति?',modalCancel:'रद्दं करोतु',modalDelete:'निष्कासयतु',currentProfile:'वर्तमान',profile:'प्रोफाइल',todayHorizon:'आज का क्षितिज',weekAhead:'आगे का सप्ताह',mixed:'मिश्रित',challenging:'चुनौतीपूर्ण',festival:'त्योहार',fastingPrac:'उपवास और आध्यात्मिक अभ्यास',auspiciousDay:'शुभ दिन',generate:'✦ जन्मकुण्डलीं रचयतु',computing:'⟳ गण्यते...',back:'← प्रतिगच्छतु',share:'⇧ वितरयतु',download:'↓ PDF अवरोहणम्',dob:'जन्मतिथिः',tob:'जन्मकालः',city:'जन्मस्थानम्',country:'देशः',gender:'लिङ्गम्',male:'पुरुषः',female:'स्त्री',other:'अन्यत्',birthDetails:'जन्मविवरणम्',tagline:'जन्मकुण्डली · ज्योतिर्दर्शनम्',headers:{insights:'मम अन्तर्दृष्टयः',compatibility:'सम्बन्धसङ्गतिः',addPartner:'सहचरीविवरणं योजयतु',desk:'ज्योतिषपीठम् (तान्त्रिकक्षेत्रम्)'},tabs:{overview:'अवलोकनम्',predictions:'भविष्यफलम्',charts:'चित्राणि',planets:'ग्रहस्थितिः',dasha:'दशा',yoga:'योगदोषौ',shadbala:'षड्बलम्',avarga:'अष्टकवर्गः',reading:'विशेषज्ञविश्लेषणम्'},ov:{favorable:'अनुकूलम्',favorableDesc:'नूतनकार्यारम्भः, आर्थिकयोजना',avoid:'वर्जयेत्',avoidDesc:'महाविवादाः, जोखिमपूर्णनिवेशः',mantra:'दैनिकमन्त्रः',mantraDesc:'ॐ नमः शिवाय',title:'जन्मविवरणम्',sunrise:'सूर्योदयः',sunset:'सूर्यास्तः',lst:'LST',ayanamsa:'अयनांशः (लाहिरी)',tithi:'तिथिः',vara:'वारः',nakshatra:'नक्षत्रम्',yoga:'योगः',karana:'करणम्',lagna:'लग्नम्',moon:'चन्द्रराशिः',sun:'सूर्यराशिः',curDasha:'वर्तमानदशा',maha:'महादशा',antar:'अन्तर्दशा',birth:'जन्मदशा'},pl:{title:'ग्रहस्थितिः',graha:'ग्रहः',rashi:'राशिः',deg:'अंशः',nak:'नक्षत्रम्',pada:'पादः',nakL:'नक्षत्रेशः',signL:'राश्यधिपः',bhava:'भावः',status:'स्थितिः'},da:{title:'विंशोत्तरीमहादशा',cur:'वर्तमानम्',antars:'अन्तर्दशाकालाः'},yo:{title:'योगदोषफलम्',raja:'राजयोगः',dhana:'धनयोगः',dosha:'दोषः',none:'विशेषयोगाः न दृश्यन्ते।'},sh:{title:'षड्बलम्'},av:{title:'अष्टकवर्गः'},rd:{title:'विशेषज्ञज्योतिषविश्लेषणम्',lagnaA:'लग्नविश्लेषणम्',moonA:'चन्द्रराशिविश्लेषणम्',dashaR:'वर्तमानदशाविश्लेषणम्',yogaI:'सक्रिययोगप्रभावः',strengthR:'ग्रहबलविश्लेषणम्',disc:'इदं विश्लेषणं पाराशरीज्योतिषसिद्धान्तानुसारं रचितम्।'},pdf:{title:'जन्मकुण्डली',by:'ज्योतिर्दर्शनेन रचितम्',lahiri:'लाहिरीअयनांशः',para:'पाराशरीपद्धतिः'},'validation.required':'आवश्यकम्','validation.selectCity':'कृपया ड्रॉपडाउनात् नगरं चिनुत','pdf.rashiChart':'D1 · राशि चक्रम्','pdf.navamsa':'D9 · नवांशम्','pdf.years':'वर्षाणि','pdf.start':'आरम्भ','pdf.end':'समाप्ति','pdf.antardasha':'अंतर्दशा','pdf.yogaDosha':'योग / दोष','pdf.type':'भेद','pdf.effect':'फलम्','pdf.planet':'ग्रह','pdf.totalStrength':'कुल शक्तिः','pdf.classification':'वर्गीकरणम्','pdf.printBtn':'मुद्रयतु / PDF रूपेण सङ्गृह्यतु','pdf.closeBtn':'बन्धयतु','pdf.ayanamsa':'अयनांश','pdf.pada':'पद','ashtakavarga.total':'कुल','shadbala.strong':'शक्तिमान्','shadbala.moderate':'मध्यम','shadbala.weak':'अशक्त',inputAccuracy:'⚠ पञ्चदशनिमेषाणां भेदोऽपि लग्नं परिवर्तयितुं शक्नोति',inputPrivacy:'🔒 सर्वाणि गणनानि भवतः विचारके स्थानीयतया चलन्ति। न किमपि दत्तांशं संगृह्यते।',inputLoading:'लाहिरीअयनांशसंशोधनं प्रयुज्यते...',cityPlaceholder:'नगरनाम लिखतु...',required:'आवश्यकम्',selectCity:'कृपया सूचिकातः नगरं चिनुत','ov.rashiChart':'राशिचक्रम् (D1)','ov.navamsa':'नवांशः (D9)','ov.nakLabel':'नक्षत्रम्:','pl.lagnaLabel':'लग्नम्','pl.lagnaLord':'लग्नाधिपः','pl.bhavaTitle':'भावावलोकनम् (१२ भावाः)','pl.house':'भावः','pl.lord':'अधिपः','pl.empty':'रिक्तभावः',ch:{shodasha:'षोडशवर्गः (१६)',south:'दक्षिण',north:'उत्तर',vargottama:'वर्गोत्तम'},'da.yrs':'वर्षाणि','da.active':'सक्रियम्','da.now':'अधुना','da.currentInfo':'वर्तमानम्','yo.noYogaMsg':'प्रमुखयोगाः न दृश्यन्ते। सूक्ष्मसंयोगेभ्यः शक्तियोगाः उद्भवन्ति।','yo.panchaMaha':'पञ्चमहापुरुषः','yo.wealth':'धनम्','yo.afflictions':'पीडाः','yo.formedBy':'निर्मितम्','yo.remedies':'उपचाराः: व्यक्तिगतग्रहशान्ति-दान-रत्नपरामर्शार्थं योग्यज्योतिषिणं सम्पर्कयतु।','yo.rajaYoga':'राजयोगः','yo.dhanaYoga':'धनयोगः','yo.doshaLabel':'दोषः','yo.noDosha':'प्रमुखदोषाः न सन्ति — शुभम्।','yo.noRaja':'विशेषः {raja} न दृश्यते।','yo.noDhana':'विशेषः {dhana} न दृश्यते।','sh.virupas':'विरूपाः','sh.graha':'ग्रहः','sh.sthana':'स्थानम्','sh.dig':'दिक्','sh.kala':'कालः','sh.chesta':'चेष्टा','sh.naisargika':'नैसर्गिकम्','sh.drik':'दृक्','sh.total':'सम्पूर्णम्','sh.strength':'बलम्','sh.strong':'बलवान्','sh.moderate':'मध्यमः','sh.weak':'दुर्बलः','sh.comparative':'तुलनात्मकबलम्','av.bindu':'शुभबिन्दुविश्लेषणम्','av.binduDesc':'अधिकबिन्दवः = तस्याः राशेः शक्ततराणि गोचरफलानि।','av.bav':'बि.अ.व.','av.sav':'सर्वाष्टकवर्गः','av.savDesc':'प्रतिराशि सम्पूर्णबिन्दवः','av.stdTotal':'मानकयोगः','av.yours':'भवतः','rd.subtitle':'पाराशरहोराशास्त्रम् · लाहिरीअयनांशः','rd.chandra':'चन्द्रः — भावस्वभावः जन्मनक्षत्रञ्च','rd.artha':'अर्थः — वृत्तिः धार्मिकोद्देश्यञ्च','rd.kama':'कामः — सम्बन्धाः विवाहश्च','rd.dashaPhala':'दशाफलम्','rd.moksha':'मोक्षः — आध्यात्मिकप्रवृत्तयः','rd.note':'टिप्पणी','formNote':'सटीक कुण्डली हेतु सर्वाणि क्षेत्राणि आवश्यकानि','ch.asc':'लग्नम्','copied':'✓ प्रतिलिपितम्!','popupAlert':'PDF प्राप्तुं कृपया पॉपअप् अनुमन्यताम्।','comp.title':'सम्बन्धसङ्गतिः','comp.milan':'अष्टकूटमेलनम्','comp.addPartner':'सहचरीविवरणं योजयतु','comp.match':'कुण्डलीमेलनम्','comp.cancel':'रद्दं करोतु','comp.user':'प्रयोक्ता','comp.partner':'सहचरी','comp.moonR':'चन्द्रराशिः','comp.nak':'नक्षत्रम्','comp.manglik':'माङ्गलिकदोषः','comp.yes':'आम','comp.no':'न','comp.verdict':'सङ्गतिपरिणामः','comp.kuja':'कुज (माङ्गलिक) दोषमूल्याङ्कनम्','comp.breakdown':'८-कूटविवरणम्'},
mr:{
    'revealLifePathTitle':'जीवन मार्ग प्रकट करा',
    'revealLifePathDesc':'धर्म, संपत्ती, आरोग्य आणि नातेसंबंधांचे जीवन परिमाण अचूक शास्त्रीय मार्गांद्वारे प्रकट करा.',
    'transit.H1':'आनंद आणि आराम','transit.H2':'आर्थिक निर्बंध','transit.H3':'धैर्य आणि यश','transit.H4':'मानसिक ताण','transit.H5':'विलंब आणि काळजी','transit.H6':'विजय आणि आरोग्य','transit.H7':'यश आणि आनंद','transit.H8':'अनपेक्षित त्रास','transit.H9':'थकवा आणि वाईट नशीब','transit.H10':'यश आणि सन्मान','transit.H11':'उत्पन्न आणि नफा','transit.H12':'जास्त खर्च',title:"ज्योतिष दर्शन",
    subtitle:"वैदिक जन्म कुंडली",
    inputTitle:"ब्रह्माण्डीय रूपरेखा",
    inputSubtitle:"आपली अचूक वैदिक जन्मकुंडली तयार करण्यासाठी, आम्हाला आपल्या जन्माची अचूक वेळ आणि ठिकाण आवश्यक आहे.",
    fullName:"पूर्ण नाव",
    namePlaceholder:"नाव प्रविष्ट करा (उदा. राहुल)...",
    newChart:'नवीन कुंडली',deleteProfile:'प्रोफाइल हटवा',deleteAlert:'तुम्हाला नक्की ही प्रोफाइल हटवायची आहे का?',modalCancel:'रद्द करा',modalDelete:'हटवा',currentProfile:'सध्याचे',profile:'प्रोफाइल',todayHorizon:'आजचे क्षितिज',weekAhead:'पुढे आठवडा',mixed:'मिश्र',challenging:'आव्हानात्मक',festival:'सण',fastingPrac:'उपवास आणि आध्यात्मिक आचरण',auspiciousDay:'शुभ दिवस',generate:'✦ कुंडली तयार करा',computing:'⟳ गणना होत आहे...',back:'← मागे',share:'⇧ सामायिक करा',download:'↓ PDF डाउनलोड',dob:'जन्म तारीख',tob:'जन्म वेळ',city:'जन्म ठिकाण',country:'देश',gender:'लिंग',male:'पुरुष',female:'स्त्री',other:'इतर',birthDetails:'जन्म तपशील',tagline:'वैदिक जन्म कुंडली · ज्योतिष दर्शन',headers:{insights:'माय इनसाइट्स',compatibility:'संबंध अनुकूलता',addPartner:'भागीदाराचा तपशील जोडा',desk:'ज्योतिष डेस्क (तांत्रिक क्षेत्र)'},tabs:{overview:'आढावा',predictions:'भविष्यफल',charts:'चार्ट्स',planets:'ग्रह स्थिती',dasha:'दशा',yoga:'योग आणि दोष',shadbala:'षड्बल',avarga:'अष्टकवर्ग',reading:'तज्ञ विश्लेषण'},ov:{favorable:'अनुकूल',favorableDesc:'नवीन उपक्रमांची सुरुवात, आर्थिक नियोजन',avoid:'टाळा',avoidDesc:'मोठे वाद, जोखीमयुक्त गुंतवणूक',mantra:'दैनिक मंत्र',mantraDesc:'ॐ नमः शिवाय',title:'जन्म विवरण',sunrise:'सूर्योदय',sunset:'सूर्यास्त',lst:'LST',ayanamsa:'अयनांश (लाहिरी)',tithi:'तिथी',vara:'वार',nakshatra:'नक्षत्र',yoga:'योग',karana:'करण',lagna:'लग्न',moon:'चंद्र राशी',sun:'सूर्य राशी',curDasha:'सध्याची दशा',maha:'महादशा',antar:'अंतर्दशा',birth:'जन्म दशा'},pl:{title:'ग्रह स्थिती',graha:'ग्रह',rashi:'राशी',deg:'अंश',nak:'नक्षत्र',pada:'पाद',nakL:'नक्षत्रेश',signL:'राश्याधिपती',bhava:'भाव',status:'स्थिती'},da:{title:'विंशोत्तरी महादशा',cur:'सध्याचे',antars:'अंतर्दशा कालावधी'},yo:{title:'योग आणि दोष फल',raja:'राजयोग',dhana:'धनयोग',dosha:'दोष',none:'कोणतेही विशेष योग आढळले नाहीत.'},sh:{title:'षड्बल'},av:{title:'अष्टकवर्ग'},rd:{title:'तज्ञ ज्योतिष विश्लेषण',lagnaA:'लग्न विश्लेषण',moonA:'चंद्र राशी विश्लेषण',dashaR:'सध्याची दशा विश्लेषण',yogaI:'सक्रिय योग प्रभाव',strengthR:'ग्रह बल विश्लेषण',disc:'हे विश्लेषण पाराशरी ज्योतिष तत्त्वांवर आधारित आहे.'},pdf:{title:'जन्म कुंडली',by:'ज्योतिष दर्शन द्वारे',lahiri:'लाहिरी अयनांश',para:'पाराशरी पद्धती'},'validation.required':'आवश्यक','validation.selectCity':'कृपया ड्रॉपडाउन मधून शहर निवडा','pdf.rashiChart':'D1 · राशी चार्ट','pdf.navamsa':'D9 · नवांश','pdf.years':'वर्षे','pdf.start':'सुरुवात','pdf.end':'अंत','pdf.antardasha':'अंतर्दशा','pdf.yogaDosha':'योग / दोष','pdf.type':'प्रकार','pdf.effect':'परिणाम','pdf.planet':'ग्रह','pdf.totalStrength':'एकूण शक्ती','pdf.classification':'वर्गीकरण','pdf.printBtn':'मुद्रित करा / PDF म्हणून जतन करा','pdf.closeBtn':'बंद करा','pdf.ayanamsa':'अयनांश','pdf.pada':'पद','ashtakavarga.total':'एकूण','shadbala.strong':'शक्तिशाली','shadbala.moderate':'मध्यम','shadbala.weak':'कमजोर',inputAccuracy:'⚠ १५ मिनिटांचा फरक देखील लग्न बदलू शकतो',inputPrivacy:'🔒 सर्व गणना आपल्या ब्राउझरमध्ये स्थानिक पातळीवर चालतात. कोणताही डेटा साठवला जात नाही.',inputLoading:'लाहिरी अयनांश सुधारणा लागू होत आहे...',cityPlaceholder:'शहराचे नाव टाइप करा...',required:'आवश्यक',selectCity:'कृपया ड्रॉपडाउनमधून शहर निवडा','ov.rashiChart':'राशी चक्र (D1)','ov.navamsa':'नवांश (D9)','ov.nakLabel':'नक्षत्र:','pl.lagnaLabel':'लग्न','pl.lagnaLord':'लग्नाधिपती','pl.bhavaTitle':'भाव आढावा (१२ भाव)','pl.house':'भाव','pl.lord':'अधिपती','pl.empty':'रिक्त भाव',ch:{shodasha:'षोडश वर्ग (१६)',south:'दक्षिण',north:'उत्तर',vargottama:'वर्गोत्तम'},'da.yrs':'वर्षे','da.active':'सक्रिय','da.now':'आता','da.currentInfo':'सध्याचे','yo.noYogaMsg':'प्रमुख योग आढळले नाहीत. सूक्ष्म संयोगांतून शक्तिशाली योग निर्माण होतात.','yo.panchaMaha':'पंचमहापुरुष','yo.wealth':'संपत्ती','yo.afflictions':'पीडा','yo.formedBy':'यांनी निर्मित','yo.remedies':'उपाय: वैयक्तिक ग्रहशांती, दान आणि रत्न शिफारसींसाठी योग्य ज्योतिषींचा सल्ला घ्या.','yo.rajaYoga':'राजयोग','yo.dhanaYoga':'धनयोग','yo.doshaLabel':'दोष','yo.noDosha':'प्रमुख दोष आढळले नाहीत — शुभ.','yo.noRaja':'कोणताही विशेष {raja} आढळला नाही.','yo.noDhana':'कोणताही विशेष {dhana} आढळला नाही.','sh.virupas':'विरूपा','sh.graha':'ग्रह','sh.sthana':'स्थान','sh.dig':'दिक्','sh.kala':'काल','sh.chesta':'चेष्टा','sh.naisargika':'नैसर्गिक','sh.drik':'दृक्','sh.total':'एकूण','sh.strength':'बल','sh.strong':'बलवान','sh.moderate':'मध्यम','sh.weak':'दुर्बल','sh.comparative':'तुलनात्मक बल','av.bindu':'शुभ बिंदू विश्लेषण','av.binduDesc':'अधिक बिंदू = त्या राशीतून अधिक बलवान गोचर फल.','av.bav':'बि.अ.व.','av.sav':'सर्वाष्टकवर्ग','av.savDesc':'प्रति राशी एकूण बिंदू','av.stdTotal':'मानक एकूण','av.yours':'आपले','rd.subtitle':'पाराशर होराशास्त्र · लाहिरी अयनांश','rd.chandra':'चंद्र — भावस्वभाव आणि जन्म नक्षत्र','rd.artha':'अर्थ — कारकीर्द आणि धार्मिक उद्देश्य','rd.kama':'काम — संबंध आणि विवाह','rd.dashaPhala':'दशाफल','rd.moksha':'मोक्ष — आध्यात्मिक प्रवृत्ती','rd.note':'टीप','formNote':'अचूक कुंडलीसाठी सर्व माहिती आवश्यक','ch.asc':'लग्न','copied':'✓ कॉपी झाले!','popupAlert':'PDF डाउनलोड करण्यासाठी पॉपअप अनुमती द्या.','comp.title':'Relationship Compatibility','comp.milan':'Ashtakoota Milan','comp.addPartner':'भागीदाराचा तपशील जोडा','comp.match':'Match Charts','comp.cancel':'Cancel','comp.user':'User','comp.partner':'Partner','comp.moonR':'Moon Rashi','comp.nak':'Nakshatra','comp.manglik':'Manglik','comp.yes':'होय','comp.no':'नाही','comp.verdict':'Compatibility Verdict','comp.kuja':'Kuja (Manglik) Dosha Evaluation','comp.breakdown':'8-Koota Breakdown & Explanation'},
gu:{
    'revealLifePathTitle':'જીવનના માર્ગો જાહેર કરો',
    'revealLifePathDesc':'ચોક્કસ શાસ્ત્રીય માર્ગો દ્વારા ધર્મ, સંપત્તિ, આરોગ્ય અને સંબંધોના જીવન પરિમાણોને ઉજાગર કરો.',
    'transit.H1':'સુખ અને આરામ','transit.H2':'નાણાકીય પ્રતિબંધો','transit.H3':'હિંમત અને સફળતા','transit.H4':'માનસિક તણાવ','transit.H5':'વિલંબ અને ચિંતાઓ','transit.H6':'વિજય અને આરોગ્ય','transit.H7':'સફળતા અને આનંદ','transit.H8':'અનપેક્ષિત મુશ્કેલીઓ','transit.H9':'થાક અને ખરાબ નસીબ','transit.H10':'સફળતા અને સન્માન','transit.H11':'આવક અને લાભ','transit.H12':'ઉચ્ચ ખર્ચ',title:"જ્યોતિષ દર્શન",
    subtitle:"વૈદિક જન્મ કુંડળી",
    inputTitle:"બ્રહ્માંડીય રૂપરેખા",
    inputSubtitle:"તમારી સચોટ વૈદિક જન્મ કુંડળી બનાવવા માટે, અમને તમારા જન્મનો ચોક્કસ સમય અને સ્થળની જરૂર છે.",
    fullName:"પૂરું નામ",
    namePlaceholder:"નામ દાખલ કરો (દા.ત. રાહુલ)...",
    newChart:'નવી કુંડળી',deleteProfile:'પ્રોફાઇલ કાઢી નાખો',deleteAlert:'શું તમે ખરેખર આ પ્રોફાઇલ કાઢી નાખવા માંગો છો?',modalCancel:'રદ કરો',modalDelete:'કાઢી નાખો',currentProfile:'વર્તમાન',profile:'પ્રોફાઇલ',todayHorizon:'આજનું ક્ષિતિજ',weekAhead:'ધ વીક અહેડ',mixed:'મિશ્ર',challenging:'પડકારરૂપ',festival:'ઉત્સવ',fastingPrac:'ઉપવાસ અને આધ્યાત્મિક વ્યવહાર',auspiciousDay:'શુભ દિવસ',generate:'✦ કુંડળી બનાવો',computing:'⟳ ગણતરી ચાલુ છે...',back:'← પાછળ',share:'⇧ શેર કરો',download:'↓ PDF ડાઉનલોડ',dob:'જન્મ તારીખ',tob:'જન્મ સમય',city:'જન્મ સ્થળ',country:'દેશ',gender:'જાતિ',male:'પુરુષ',female:'સ્ત્રી',other:'અન્ય',birthDetails:'જન્મ વિગત',tagline:'વૈદિક જન્મ કુંડળી · જ્યોતિષ દર્શન',headers:{insights:'મારી આંતરદૃષ્ટિ',compatibility:'સંબંધ સુસંગતતા',addPartner:'ભાગીદારની વિગતો ઉમેરો',desk:'જ્યોતિષ ડેસ્ક (તકનીકી વિભાગ)'},tabs:{overview:'અવલોકન',predictions:'ભવિષ્યફળ',charts:'ચાર્ટ્સ',planets:'ગ્રહ સ્થિતિ',dasha:'દશા',yoga:'યોગ અને દોષ',shadbala:'ષડ્બળ',avarga:'અષ્ટકવર્ગ',reading:'નિષ્ણાત વિશ્લેષણ'},ov:{favorable:'અનુકૂળ',favorableDesc:'નવી શરૂઆત, નાણાકીય આયોજન',avoid:'ટાળો',avoidDesc:'મોટા વિવાદો, જોખમી રોકાણો',mantra:'દૈનિક મંત્ર',mantraDesc:'ૐ નમઃ શિવાય',title:'જન્મ સારાંશ',sunrise:'સૂર્યોદય',sunset:'સૂર્યાસ્ત',lst:'LST',ayanamsa:'અયનાંશ (લાહિરી)',tithi:'તિથિ',vara:'વાર',nakshatra:'નક્ષત્ર',yoga:'યોગ',karana:'કરણ',lagna:'લગ્ન',moon:'ચંદ્ર રાશિ',sun:'સૂર્ય રાશિ',curDasha:'હાલની દશા',maha:'મહાદશા',antar:'અંતર્દશા',birth:'જન્મ દશા'},pl:{title:'ગ્રહ સ્થિતિ',graha:'ગ્રહ',rashi:'રાશિ',deg:'અંશ',nak:'નક્ષત્ર',pada:'પાદ',nakL:'નક્ષત્રેશ',signL:'રાશ્યાધિપ',bhava:'ભાવ',status:'સ્થિતિ'},da:{title:'વિંશોત્તરી મહાદશા',cur:'હાલ',antars:'અંતર્દશા સમય'},yo:{title:'યોગ અને દોષ ફળ',raja:'રાજયોગ',dhana:'ધનયોગ',dosha:'દોષ',none:'કોઈ ખાસ યોગ મળ્યા નથી.'},sh:{title:'ષડ્બળ'},av:{title:'અષ્ટકવર્ગ'},rd:{title:'નિષ્ણાત જ્યોતિષ વિશ્લેષણ',lagnaA:'લગ્ન વિશ્લેષણ',moonA:'ચંદ્ર રાશિ વિશ્લેષણ',dashaR:'હાલની દશા વિશ્લેષણ',yogaI:'સક્રિય યોગ પ્રભાવ',strengthR:'ગ્રહ બળ વિશ્લેષણ',disc:'આ વિશ્લેષણ પારાશરી જ્યોતિષ સિદ્ધાંતો પર આધારિત છે.'},pdf:{title:'જન્મ કુંડળી',by:'જ્યોતિષ દર્શન દ્વારા',lahiri:'લાહિરી અયનાંશ',para:'પારાશરી પદ્ધતિ'},'validation.required':'જરૂરી','validation.selectCity':'કૃપયા ડ્રોપડાઉન તરફથી શહેર પસંદ કરો','pdf.rashiChart':'D1 · રાશી ચાર્ટ','pdf.navamsa':'D9 · નવાંશ','pdf.years':'વર્ષ','pdf.start':'શરૂઆત','pdf.end':'અંત','pdf.antardasha':'અંતર્દશા','pdf.yogaDosha':'યોગ / દોષ','pdf.type':'પ્રકાર','pdf.effect':'અસર','pdf.planet':'ગ્રહ','pdf.totalStrength':'કુલ શક્તિ','pdf.classification':'વર્ગીકરણ','pdf.printBtn':'પ્રિન્ટ કરો / PDF તરીકે સાચવો','pdf.closeBtn':'બંધ કરો','pdf.ayanamsa':'અયનાંશ','pdf.pada':'પદ','ashtakavarga.total':'કુલ','shadbala.strong':'શક્તિશાલી','shadbala.moderate':'મધ્યમ','shadbala.weak':'નબળો',inputAccuracy:'⚠ ૧૫ મિનિટનો ફેરફાર પણ લગ્ન બદલી શકે છે',inputPrivacy:'🔒 બધી ગણતરીઓ તમારા બ્રાઉઝરમાં સ્થાનિક રીતે ચાલે છે. કોઈ ડેટા સંગ્રહિત થતો નથી.',inputLoading:'લાહિરી અયનાંશ સુધારણા લાગુ થઈ રહી છે...',cityPlaceholder:'શહેરનું નામ ટાઇપ કરો...',required:'જરૂરી',selectCity:'કૃપા કરીને ડ્રોપડાઉનમાંથી શહેર પસંદ કરો','ov.rashiChart':'રાશિ ચક્ર (D1)','ov.navamsa':'નવાંશ (D9)','ov.nakLabel':'નક્ષત્ર:','pl.lagnaLabel':'લગ્ન','pl.lagnaLord':'લગ્નાધિપ','pl.bhavaTitle':'ભાવ અવલોકન (૧૨ ભાવ)','pl.house':'ભાવ','pl.lord':'અધિપ','pl.empty':'ખાલી ભાવ',ch:{shodasha:'ષોડશ વર્ગ (૧૬)',south:'દક્ષિણ',north:'ઉત્તર',vargottama:'વર્ગોત્તમ'},'da.yrs':'વર્ષ','da.active':'સક્રિય','da.now':'હાલ','da.currentInfo':'હાલ','yo.noYogaMsg':'મુખ્ય યોગ મળ્યા નથી. સૂક્ષ્મ સંયોગોમાંથી શક્તિશાળી યોગ ઉદ્ભવે છે.','yo.panchaMaha':'પંચમહાપુરુષ','yo.wealth':'સંપત્તિ','yo.afflictions':'પીડા','yo.formedBy':'દ્વારા નિર્મિત','yo.remedies':'ઉપાય: વ્યક્તિગત ગ્રહશાંતિ, દાન અને રત્ન સૂચનો માટે યોગ્ય જ્યોતિષીની સલાહ લો.','yo.rajaYoga':'રાજયોગ','yo.dhanaYoga':'ધનયોગ','yo.doshaLabel':'દોષ','yo.noDosha':'મુખ્ય દોષ મળ્યા નથી — શુભ.','yo.noRaja':'કોઈ વિશેષ {raja} મળ્યો નથી.','yo.noDhana':'કોઈ વિશેષ {dhana} મળ્યો નથી.','sh.virupas':'વિરૂપા','sh.graha':'ગ્રહ','sh.sthana':'સ્થાન','sh.dig':'દિક્','sh.kala':'કાલ','sh.chesta':'ચેષ્ટા','sh.naisargika':'નૈસર્ગિક','sh.drik':'દૃક્','sh.total':'કુલ','sh.strength':'બળ','sh.strong':'બળવાન','sh.moderate':'મધ્યમ','sh.weak':'દુર્બળ','sh.comparative':'તુલનાત્મક બળ','av.bindu':'શુભ બિંદુ વિશ્લેષણ','av.binduDesc':'વધુ બિંદુ = તે રાશિમાંથી વધુ મજબૂત ગોચર ફળ.','av.bav':'બિ.અ.વ.','av.sav':'સર્વાષ્ટકવર્ગ','av.savDesc':'પ્રતિ રાશિ કુલ બિંદુ','av.stdTotal':'માનક કુલ','av.yours':'તમારું','rd.subtitle':'પારાશર હોરાશાસ્ત્ર · લાહિરી અયનાંશ','rd.chandra':'ચંદ્ર — ભાવ સ્વભાવ અને જન્મ નક્ષત્ર','rd.artha':'અર્થ — કારકિર્દી અને ધાર્મિક ઉદ્દેશ્ય','rd.kama':'કામ — સંબંધ અને લગ્ન','rd.dashaPhala':'દશાફળ','rd.moksha':'મોક્ષ — આધ્યાત્મિક પ્રવૃત્તિ','rd.note':'નોંધ','formNote':'ચોક્કસ કુંડળી માટે બધી માહિતી જરૂરી છે','ch.asc':'લગ્ન','copied':'✓ કૉપી થયું!','popupAlert':'PDF ડાઉનલોડ માટે પૉપઅપ મંજૂર કરો.','comp.title':'Relationship Compatibility','comp.milan':'Ashtakoota Milan','comp.addPartner':'ભાગીદારની વિગતો ઉમેરો','comp.match':'Match Charts','comp.cancel':'Cancel','comp.user':'User','comp.partner':'Partner','comp.moonR':'Moon Rashi','comp.nak':'Nakshatra','comp.manglik':'Manglik','comp.yes':'હા','comp.no':'ના','comp.verdict':'Compatibility Verdict','comp.kuja':'Kuja (Manglik) Dosha Evaluation','comp.breakdown':'8-Koota Breakdown & Explanation'},
bn:{
    'revealLifePathTitle':'জীবনের পথ প্রকাশ করুন',
    'revealLifePathDesc':'সুনির্দিষ্ট শাস্ত্রীয় পথের মাধ্যমে ধর্ম, সম্পদ, স্বাস্থ্য এবং সম্পর্কের জীবনের মাত্রা প্রকাশ করুন।',
    'transit.H1':'সুখ এবং আরাম','transit.H2':'আর্থিক সীমাবদ্ধতা','transit.H3':'সাহস এবং সাফল্য','transit.H4':'মানসিক চাপ','transit.H5':'বিলম্ব এবং উদ্বেগ','transit.H6':'বিজয় এবং স্বাস্থ্য','transit.H7':'সাফল্য এবং আনন্দ','transit.H8':'অপ্রত্যাশিত ঝামেলা','transit.H9':'ক্লান্তি এবং দুর্ভাগ্য','transit.H10':'সাফল্য এবং সম্মান','transit.H11':'আয় এবং লাভ','transit.H12':'উচ্চ ব্যয়',title:"জ্যোতিষ দর্শন",
    subtitle:"বৈদিক জন্ম কুণ্ডলী",
    inputTitle:"ব্রহ্মাণ্ডীয় রূপরেখা",
    inputSubtitle:"আপনার নির্ভুল বৈদিক জন্ম কুণ্ডলী তৈরি করতে, আমাদের আপনার জন্মের সঠিক সময় এবং স্থান প্রয়োজন।",
    fullName:"পূর্ণ নাম",
    namePlaceholder:"নাম লিখুন (উদাঃ রাহুল)...",
    newChart:'নতুন কুণ্ডলী',deleteProfile:'প্রোফাইল মুছুন',deleteAlert:'আপনি কি নিশ্চিত যে আপনি এই প্রোফাইলটি মুছে ফেলতে চান?',modalCancel:'বাতিল করুন',modalDelete:'মুছে ফেলুন',currentProfile:'বর্তমান',profile:'প্রোফাইল',todayHorizon:'আজকের দিগন্ত',weekAhead:'সামনে সপ্তাহ',mixed:'মিশ্র',challenging:'চ্যালেঞ্জিং',festival:'উৎসব',fastingPrac:'উপবাস এবং আধ্যাত্মিক অনুশীলন',auspiciousDay:'শুভ দিন',generate:'✦ কুণ্ডলী তৈরি করুন',computing:'⟳ গণনা চলছে...',back:'← পেছনে',share:'⇧ শেয়ার করুন',download:'↓ PDF ডাউনলোড',dob:'জন্ম তারিখ',tob:'জন্ম সময়',city:'জন্ম স্থান',country:'দেশ',gender:'লিঙ্গ',male:'পুরুষ',female:'মহিলা',other:'অন্যান্য',birthDetails:'জন্মের বিবরণ',tagline:'বৈদিক জন্ম কুণ্ডলী · জ্যোতিষ দর্শন',headers:{insights:'আমার অন্তর্দৃষ্টি',compatibility:'সম্পর্ক সামঞ্জস্য',addPartner:'সঙ্গীর বিবরণ যোগ করুন',desk:'জ্যোতিষ ডেস্ক (প্রযুক্তিগত এলাকা)'},tabs:{overview:'সংক্ষিপ্ত বিবরণ',predictions:'ভবিষ্যৎফল',charts:'চার্ট',planets:'গ্রহ অবস্থান',dasha:'দশা',yoga:'যোগ ও দোষ',shadbala:'ষড়্বল',avarga:'অষ্টকবর্গ',reading:'বিশেষজ্ঞ বিশ্লেষণ'},ov:{favorable:'অনুকূল',favorableDesc:'নতুন উদ্যোগ শুরু, আর্থিক পরিকল্পনা',avoid:'এড়িয়ে চলুন',avoidDesc:'বড় বিবাদ, ঝুঁকিপূর্ণ বিনিয়োগ',mantra:'দৈনিক মন্ত্র',mantraDesc:'ওঁ নমঃ শিবায়',title:'জন্ম সারসংক্ষেপ',sunrise:'সূর্যোদয়',sunset:'সূর্যাস্ত',lst:'LST',ayanamsa:'অয়নাংশ (লাহিরি)',tithi:'তিথি',vara:'বার',nakshatra:'নক্ষত্র',yoga:'যোগ',karana:'করণ',lagna:'লগ্ন',moon:'চন্দ্র রাশি',sun:'সূর্য রাশি',curDasha:'বর্তমান দশা',maha:'মহাদশা',antar:'অন্তর্দশা',birth:'জন্ম দশা'},pl:{title:'গ্রহ অবস্থান',graha:'গ্রহ',rashi:'রাশি',deg:'ডিগ্রি',nak:'নক্ষত্র',pada:'পাদ',nakL:'নক্ষত্রেশ',signL:'রাশ্যাধিপ',bhava:'ভাব',status:'অবস্থা'},da:{title:'বিমশোত্তরী মহাদশা',cur:'বর্তমান',antars:'অন্তর্দশা সময়কাল'},yo:{title:'যোগ ও দোষ ফল',raja:'রাজযোগ',dhana:'ধনযোগ',dosha:'দোষ',none:'কোনো বিশেষ যোগ পাওয়া যায়নি।'},sh:{title:'ষড়্বল'},av:{title:'অষ্টকবর্গ'},rd:{title:'বিশেষজ্ঞ জ্যোতিষ বিশ্লেষণ',lagnaA:'লগ্ন বিশ্লেষণ',moonA:'চন্দ্র রাশি বিশ্লেষণ',dashaR:'বর্তমান দশা বিশ্লেষণ',yogaI:'সক্রিয় যোগ প্রভাব',strengthR:'গ্রহ বল বিশ্লেষণ',disc:'এই বিশ্লেষণ পারাশরী জ্যোতিষ নীতির উপর ভিত্তি করে তৈরি.'},pdf:{title:'জন্ম কুণ্ডলী',by:'জ্যোতিষ দর্শন দ্বারা',lahiri:'লাহিরি অয়নাংশ',para:'পারাশরী পদ্ধতি'},'validation.required':'প্রয়োজনীয়','validation.selectCity':'অনুগ্রহ করে ড্রপডাউন থেকে একটি শহর নির্বাচন করুন','pdf.rashiChart':'D1 · রাশি চার্ট','pdf.navamsa':'D9 · নবাংশ','pdf.years':'বছর','pdf.start':'শুরু','pdf.end':'শেষ','pdf.antardasha':'অন্তর্দশা','pdf.yogaDosha':'যোগ / দোষ','pdf.type':'প্রকার','pdf.effect':'প্রভাব','pdf.planet':'গ্রহ','pdf.totalStrength':'মোট শক্তি','pdf.classification':'শ্রেণীবিভাগ','pdf.printBtn':'মুদ্রণ করুন / PDF হিসাবে সংরক্ষণ করুন','pdf.closeBtn':'বন্ধ করুন','pdf.ayanamsa':'অয়নাংশ','pdf.pada':'পদ','ashtakavarga.total':'মোট','shadbala.strong':'শক্তিশালী','shadbala.moderate':'মধ্যম','shadbala.weak':'দুর্বল',inputAccuracy:'⚠ ১৫ মিনিটের পার্থক্যও লগ্ন বদলে দিতে পারে',inputPrivacy:'🔒 সমস্ত গণনা আপনার ব্রাউজারে স্থানীয়ভাবে চলে। কোনো তথ্য সংরক্ষিত হয় না।',inputLoading:'লাহিরি অয়নাংশ সংশোধন প্রয়োগ করা হচ্ছে...',cityPlaceholder:'শহরের নাম টাইপ করুন...',required:'আবশ্যক',selectCity:'অনুগ্রহ করে তালিকা থেকে শহর নির্বাচন করুন','ov.rashiChart':'রাশি চক্র (D1)','ov.navamsa':'নবাংশ (D9)','ov.nakLabel':'নক্ষত্র:','pl.lagnaLabel':'লগ্ন','pl.lagnaLord':'লগ্নাধিপ','pl.bhavaTitle':'ভাব পর্যালোচনা (১২ ভাব)','pl.house':'ভাব','pl.lord':'অধিপ','pl.empty':'শূন্য ভাব',ch:{shodasha:'ষোড়শ বর্গ (১৬)',south:'দক্ষিণ',north:'উত্তর',vargottama:'বর্গোত্তম'},'da.yrs':'বছর','da.active':'সক্রিয়','da.now':'এখন','da.currentInfo':'বর্তমান','yo.noYogaMsg':'প্রধান যোগ পাওয়া যায়নি। সূক্ষ্ম সংযোগ থেকে শক্তিশালী যোগ উৎপন্ন হয়।','yo.panchaMaha':'পঞ্চমহাপুরুষ','yo.wealth':'সম্পদ','yo.afflictions':'পীড়া','yo.formedBy':'দ্বারা গঠিত','yo.remedies':'প্রতিকার: ব্যক্তিগত গ্রহশান্তি, দান ও রত্ন সুপারিশের জন্য যোগ্য জ্যোতিষীর পরামর্শ নিন।','yo.rajaYoga':'রাজযোগ','yo.dhanaYoga':'ধনযোগ','yo.doshaLabel':'দোষ','yo.noDosha':'প্রধান দোষ পাওয়া যায়নি — শুভ।','yo.noRaja':'কোনো বিশেষ {raja} পাওয়া যায়নি।','yo.noDhana':'কোনো বিশেষ {dhana} পাওয়া যায়নি।','sh.virupas':'বিরূপা','sh.graha':'গ্রহ','sh.sthana':'স্থান','sh.dig':'দিক্','sh.kala':'কাল','sh.chesta':'চেষ্টা','sh.naisargika':'নৈসর্গিক','sh.drik':'দৃক্','sh.total':'মোট','sh.strength':'বল','sh.strong':'বলবান','sh.moderate':'মধ্যম','sh.weak':'দুর্বল','sh.comparative':'তুলনামূলক বল','av.bindu':'শুভ বিন্দু বিশ্লেষণ','av.binduDesc':'বেশি বিন্দু = সেই রাশিতে শক্তিশালী গোচর ফল।','av.bav':'বি.অ.ব.','av.sav':'সর্বাষ্টকবর্গ','av.savDesc':'প্রতি রাশিতে মোট বিন্দু','av.stdTotal':'মানক মোট','av.yours':'আপনার','rd.subtitle':'পরাশর হোরাশাস্ত্র · লাহিরি অয়নাংশ','rd.chandra':'চন্দ্র — ভাবগত স্বভাব ও জন্ম নক্ষত্র','rd.artha':'অর্থ — কর্মজীবন ও ধার্মিক উদ্দেশ্য','rd.kama':'কাম — সম্পর্ক ও বিবাহ','rd.dashaPhala':'দশাফল','rd.moksha':'মোক্ষ — আধ্যাত্মিক প্রবণতা','rd.note':'দ্রষ্টব্য','formNote':'সঠিক কুণ্ডলীর জন্য সমস্ত তথ্য আবশ্যক','ch.asc':'লগ্ন','copied':'✓ কপি হয়েছে!','popupAlert':'PDF ডাউনলোড করতে পপআপ অনুমতি দিন।','comp.title':'Relationship Compatibility','comp.milan':'Ashtakoota Milan','comp.addPartner':'সঙ্গীর বিবরণ যোগ করুন','comp.match':'Match Charts','comp.cancel':'Cancel','comp.user':'User','comp.partner':'Partner','comp.moonR':'Moon Rashi','comp.nak':'Nakshatra','comp.manglik':'Manglik','comp.yes':'হ্যাঁ','comp.no':'না','comp.verdict':'Compatibility Verdict','comp.kuja':'Kuja (Manglik) Dosha Evaluation','comp.breakdown':'8-Koota Breakdown & Explanation'},
ml:{
    'revealLifePathTitle':'ജീവിത പാതകൾ വെളിപ്പെടുത്തുക',
    'revealLifePathDesc':'കൃത്യമായ ശാസ്ത്ര പാതകളിലൂടെ ധർമ്മം, സമ്പത്ത്, ആരോഗ്യം, ബന്ധങ്ങൾ എന്നിവയുടെ ജീവിത മാനങ്ങൾ വെളിപ്പെടുത്തുക.',
    'transit.H1':'സന്തോഷവും ആശ്വാസവും','transit.H2':'സാമ്പത്തിക നിയന്ത്രണങ്ങൾ','transit.H3':'ധൈര്യവും വിജയവും','transit.H4':'മാനസിക സമ്മർദ്ദം','transit.H5':'കാലതാമസങ്ങളും ആശങ്കകളും','transit.H6':'വിജയവും ആരോഗ്യവും','transit.H7':'വിജയവും സന്തോഷവും','transit.H8':'അപ്രതീക്ഷിതമായ കുഴപ്പങ്ങൾ','transit.H9':'ക്ഷീണവും ദൗർഭാഗ്യവും','transit.H10':'വിജയവും ബഹുമതിയും','transit.H11':'വരുമാനവും നേട്ടങ്ങളും','transit.H12':'ഉയർന്ന ചെലവുകൾ',title:"ജ്യോതിഷ ദർശൻ",
    subtitle:"വൈദിക ജനന കുണ്ഡലി",
    inputTitle:"ബ്രഹ്മാണ്ഡ രൂപരേഖ",
    inputSubtitle:"നിങ്ങളുടെ കൃത്യമായ വൈദിക ജനന കുണ്ഡലി ഉണ്ടാക്കുന്നതിന്, നിങ്ങളുടെ കൃത്യമായ ജനന സമയവും സ്ഥലവും ഞങ്ങൾക്ക് ആവശ്യമാണ്.",
    fullName:"പൂർണ്ണമായ പേര്",
    namePlaceholder:"പേര് നൽകുക (ഉദാ. രാഹുൽ)...",
    newChart:'പുതിയ കുണ്ഡലി',deleteProfile:'പ്രൊഫൈൽ ഇല്ലാതാക്കുക',deleteAlert:'ഈ പ്രൊഫൈൽ ഇല്ലാതാക്കാൻ നിങ്ങൾ തീർച്ചയായും ആഗ്രഹിക്കുന്നുണ്ടോ?',modalCancel:'റദ്ദാക്കുക',modalDelete:'ഇല്ലാതാക്കുക',currentProfile:'നിലവിലുള്ളത്',profile:'പ്രൊഫൈൽ',todayHorizon:'ഇന്നത്തെ ചക്രവാളം',weekAhead:'മുന്നിലുള്ള ആഴ്ച',mixed:'മിക്സഡ്',challenging:'വെല്ലുവിളിനിറഞ്ഞ',festival:'ഉത്സവം',fastingPrac:'ഉപവാസവും ആത്മീയ ആചാരങ്ങളും',auspiciousDay:'ശുഭദിനം',generate:'✦ കുണ്ഡലി ഉണ്ടാക്കുക',computing:'⟳ കണക്കാക്കുന്നു...',back:'← പിറകോട്ട്',share:'⇧ പങ്കിടുക',download:'↓ PDF ഡൗൺലോഡ്',dob:'ജനന തീയതി',tob:'ജനന സമയം',city:'ജനന സ്ഥലം',country:'രാജ്യം',gender:'ലിംഗം',male:'പുരുഷൻ',female:'സ്ത്രീ',other:'മറ്റുള്ളവ',birthDetails:'ജനന വിവരങ്ങൾ',tagline:'വൈദിക ജനം കുണ്ഡലി · ജ്യോതിഷ ദർശൻ',headers:{insights:'എന്റെ ഉൾക്കാഴ്ചകൾ',compatibility:'ബന്ധ പൊരുത്തം',addPartner:'പങ്കാളിയുടെ വിവരങ്ങൾ ചേർക്കുക',desk:'ജ്യോതിഷ ഡെസ്ക് (സാങ്കേതിക മേഖല)'},tabs:{overview:'അവലോകനം',predictions:'പ്രവചനങ്ങൾ',charts:'ചാർട്ടുകൾ',planets:'ഗ്രഹ സ്ഥിതി',dasha:'ദശ',yoga:'യോഗവും ദോഷവും',shadbala:'ഷഡ്ബലം',avarga:'അഷ്ടകവർഗം',reading:'വിദഗ്ദ്ധ വിശ്ലേഷണം'},ov:{favorable:'അനുകൂലം',favorableDesc:'പുതിയ സംരംഭങ്ങൾ തുടങ്ങാൻ, സാമ്പത്തിക ആസൂത്രണം',avoid:'ഒഴിവാക്കുക',avoidDesc:'വലിയ തർക്കങ്ങൾ, അപകടകരമായ നിക്ഷേപങ്ങൾ',mantra:'പ്രതിദിന മന്ത്രം',mantraDesc:'ഓം നമഃ ശിവായ',title:'ജനന സംഗ്രഹം',sunrise:'സൂര്യോദയം',sunset:'സൂര്യാസ്തമനം',lst:'LST',ayanamsa:'അയനാംശം (ലാഹിരി)',tithi:'തിഥി',vara:'വാരം',nakshatra:'നക്ഷത്രം',yoga:'യോഗം',karana:'കരണം',lagna:'ലഗ്നം',moon:'ചന്ദ്ര രാശി',sun:'സൂര്യ രാശി',curDasha:'നിലവിലെ ദശ',maha:'മഹാദശ',antar:'അന്തർദശ',birth:'ജനന ദശ'},pl:{title:'ഗ്രഹ സ്ഥിതി',graha:'ഗ്രഹം',rashi:'രാശി',deg:'അംശം',nak:'നക്ഷത്രം',pada:'പാദം',nakL:'നക്ഷത്രേശൻ',signL:'രാശ്യധിപൻ',bhava:'ഭാവം',status:'സ്ഥിതി'},da:{title:'വിംശോത്തരി മഹാദശ',cur:'നിലവിൽ',antars:'അന്തർദശ കാലഘട്ടങ്ങൾ'},yo:{title:'യോഗ ദോഷ ഫലം',raja:'രാജയോഗം',dhana:'ധനയോഗം',dosha:'ദോഷം',none:'പ്രത്യേക യോഗങ്ങൾ കണ്ടെത്തിയില്ല.'},sh:{title:'ഷഡ്ബലം'},av:{title:'അഷ്ടകവർഗം'},rd:{title:'വിദഗ്ദ്ധ ജ്യോതിഷ വിശ്ലേഷണം',lagnaA:'ലഗ്ന വിശ്ലേഷണം',moonA:'ചന്ദ്ര രാശി വിശ്ലേഷണം',dashaR:'നിലവിലെ ദശ വിശ്ലേഷണം',yogaI:'സജീവ യോഗ സ്വാധീനം',strengthR:'ഗ്രഹ ബല വിശ്ലേഷണം',disc:'ഈ വിശ്ലേഷണം പരാശരി ജ്യോതിഷ തത്ത്വങ്ങളുടെ അടിസ്ഥാനത്തിൽ തയ്യാറാക്കിയതാണ്.'},pdf:{title:'ജനം കുണ്ഡലി',by:'ജ്യോതിഷ ദർശൻ ഉണ്ടാക്കിയത്',lahiri:'ലാഹിരി അയനാംശം',para:'പരാശരി രീതി'},'validation.required':'ആവശ്യമാണ്','validation.selectCity':'ദയവായി ഡ്രോപ്പ്ഡൗണിൽ നിന്ന് ഒരു നഗരം തിരഞ്ഞെടുക്കുക','pdf.rashiChart':'D1 · രാശി ചാർട്ട്','pdf.navamsa':'D9 · നവാംശം','pdf.years':'വർഷങ്ങൾ','pdf.start':'ആരംഭം','pdf.end':'അവസാനം','pdf.antardasha':'അന്തർദശ','pdf.yogaDosha':'യോഗ / ദോഷ','pdf.type':'തരം','pdf.effect':'ഫലം','pdf.planet':'ഗ്രഹം','pdf.totalStrength':'ആകെ ശക്തി','pdf.classification':'തരംതിരിവ്','pdf.printBtn':'പ്രിന്റ് ചെയ്യുക / PDF ആയി സംരക്ഷിക്കുക','pdf.closeBtn':'അടയ്ക്കുക','pdf.ayanamsa':'അയനാംശം','pdf.pada':'പദം','ashtakavarga.total':'ആകെ','shadbala.strong':'ശക്തിമാനായ','shadbala.moderate':'നടുത്തരമായ','shadbala.weak':'ദുർബലമായ',inputAccuracy:'⚠ ൧൫ മിനിറ്റ് വ്യത്യാസം പോലും ലഗ്നം മാറ്റാൻ കഴിയും',inputPrivacy:'🔒 എല്ലാ കണക്കുകൂട്ടലുകളും നിങ്ങളുടെ ബ്രൗസറിൽ പ്രാദേശികമായി പ്രവർത്തിക്കുന്നു. ഡാറ്റ സംഭരിക്കില്ല.',inputLoading:'ലാഹിരി അയനാംശ തിരുത്തൽ പ്രയോഗിക്കുന്നു...',cityPlaceholder:'നഗരത്തിന്റെ പേര് ടൈപ്പ് ചെയ്യുക...',required:'ആവശ്യമാണ്',selectCity:'ദയവായി ഡ്രോപ്ഡൗണിൽ നിന്ന് നഗരം തിരഞ്ഞെടുക്കുക','ov.rashiChart':'രാശി ചക്രം (D1)','ov.navamsa':'നവാംശം (D9)','ov.nakLabel':'നക്ഷത്രം:','pl.lagnaLabel':'ലഗ്നം','pl.lagnaLord':'ലഗ്നാധിപൻ','pl.bhavaTitle':'ഭാവ അവലോകനം (൧൨ ഭാവങ്ങൾ)','pl.house':'ഭാവം','pl.lord':'അധിപൻ','pl.empty':'ശൂന്യ ഭാവം',ch:{shodasha:'ഷോഡശ വർഗം (൧൬)',south:'ദക്ഷിണം',north:'ഉത്തരം',vargottama:'വർഗോത്തമ'},'da.yrs':'വർഷം','da.active':'സജീവം','da.now':'ഇപ്പോൾ','da.currentInfo':'നിലവിൽ','yo.noYogaMsg':'പ്രധാന യോഗങ്ങൾ കണ്ടെത്തിയില്ല. സൂക്ഷ്മ സംയോഗങ്ങളിൽ നിന്ന് ശക്തമായ യോഗങ്ങൾ ഉണ്ടാകുന്നു.','yo.panchaMaha':'പഞ്ചമഹാപുരുഷ','yo.wealth':'സമ്പത്ത്','yo.afflictions':'പീഡ','yo.formedBy':'രൂപപ്പെട്ടത്','yo.remedies':'പരിഹാരം: വ്യക്തിഗത ഗ്രഹശാന്തി, ദാനം, രത്ന ശുപാർശകൾക്കായി യോഗ്യനായ ജ്യോതിഷിയെ സമീപിക്കുക.','yo.rajaYoga':'രാജയോഗം','yo.dhanaYoga':'ധനയോഗം','yo.doshaLabel':'ദോഷം','yo.noDosha':'പ്രധാന ദോഷങ്ങൾ കണ്ടെത്തിയില്ല — ശുഭം.','yo.noRaja':'പ്രത്യേക {raja} കണ്ടെത്തിയില്ല.','yo.noDhana':'പ്രത്യേക {dhana} കണ്ടെത്തിയില്ല.','sh.virupas':'വിരൂപ','sh.graha':'ഗ്രഹം','sh.sthana':'സ്ഥാനം','sh.dig':'ദിക്','sh.kala':'കാലം','sh.chesta':'ചേഷ്ട','sh.naisargika':'നൈസർഗികം','sh.drik':'ദൃക്','sh.total':'ആകെ','sh.strength':'ബലം','sh.strong':'ബലവാൻ','sh.moderate':'മധ്യമം','sh.weak':'ദുർബലം','sh.comparative':'താരതമ്യ ബലം','av.bindu':'ശുഭ ബിന്ദു വിശ്ലേഷണം','av.binduDesc':'കൂടുതൽ ബിന്ദുക്കൾ = ആ രാശിയിലൂടെ ശക്തമായ ഗോചര ഫലം.','av.bav':'ബി.അ.വ.','av.sav':'സർവാഷ്ടകവർഗം','av.savDesc':'ഓരോ രാശിയിലെയും ആകെ ബിന്ദുക്കൾ','av.stdTotal':'മാനക ആകെ','av.yours':'നിങ്ങളുടെ','rd.subtitle':'പരാശര ഹോരാശാസ്ത്രം · ലാഹിരി അയനാംശം','rd.chandra':'ചന്ദ്രൻ — ഭാവ സ്വഭാവവും ജനന നക്ഷത്രവും','rd.artha':'അർഥ — തൊഴിലും ധാർമിക ലക്ഷ്യവും','rd.kama':'കാമ — ബന്ധങ്ങളും വിവാഹവും','rd.dashaPhala':'ദശാഫലം','rd.moksha':'മോക്ഷ — ആത്മീയ പ്രവണത','rd.note':'കുറിപ്പ്','formNote':'കൃത്യമായ കുണ്ഡലിക്ക് എല്ലാ വിവരങ്ങളും ആവശ്യമാണ്','ch.asc':'ലഗ്നം','copied':'✓ പകർത്തി!','popupAlert':'PDF ഡൗൺലോഡ് ചെയ്യാൻ പോപ്അപ് അനുവദിക്കുക.','comp.title':'Relationship Compatibility','comp.milan':'Ashtakoota Milan','comp.addPartner':'പങ്കാളിയുടെ വിവരങ്ങൾ ചേർക്കുക','comp.match':'Match Charts','comp.cancel':'Cancel','comp.user':'User','comp.partner':'Partner','comp.moonR':'Moon Rashi','comp.nak':'Nakshatra','comp.manglik':'Manglik','comp.yes':'അതെ','comp.no':'അല്ല','comp.verdict':'Compatibility Verdict','comp.kuja':'Kuja (Manglik) Dosha Evaluation','comp.breakdown':'8-Koota Breakdown & Explanation',
    'revealLifePathTitle':'ജീവിത വഴികൾ വെളിപ്പെടുത്തുക',
    'revealLifePathDesc':'കൃത്യമായ ശാസ്ത്രീയ പാതകളിലൂടെ ധർമ്മം, സമ്പത്ത്, ആരോഗ്യം, ബന്ധങ്ങൾ എന്നിവയുടെ ജീവിത മാനങ്ങൾ വെളിപ്പെടുത്തുക.'
  }
};

function t(path,lang){
  if (UI_STRINGS[path]) {
    const translation = UI_STRINGS[path][lang];
    if (translation) return translation;
    const enFallback = UI_STRINGS[path]['en'];
    if (enFallback) return enFallback;
  }
  if (DYNAMIC_STRINGS[lang] && DYNAMIC_STRINGS[lang][path]) return DYNAMIC_STRINGS[lang][path];
  const S=STRINGS[lang]||STRINGS.en;
  if(S[path]!==undefined)return S[path];
  const k=path.split('.');
  let v=S;
  for(const p of k){v=v?.[p];}
  if(v!==undefined&&typeof v!=='object')return v;
  const E=STRINGS.en;
  if(E[path]!==undefined)return E[path];
  let e=E;
  for(const p of k){e=e?.[p];}
  return(e!==undefined&&typeof e!=='object')?e:path;
}

// ════════════════════════════════════════════════════════════════
// CONTENT LOCALIZATION (Rashi, Graha, Nakshatra, etc.)
// ════════════════════════════════════════════════════════════════
export const L_RASHI={
en:['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'],
hi:['मेष','वृषभ','मिथुन','कर्क','सिंह','कन्या','तुला','वृश्चिक','धनु','मकर','कुम्भ','मीन'],
kn:['ಮೇಷ','ವೃಷಭ','ಮಿಥುನ','ಕರ್ಕಾಟಕ','ಸಿಂಹ','ಕನ್ಯಾ','ತುಲಾ','ವೃಶ್ಚಿಕ','ಧನು','ಮಕರ','ಕುಂಭ','ಮೀನ'],
te:['మేషం','వృషభం','మిథునం','కర్కాటకం','సింహం','కన్య','తుల','వృశ్చికం','ధనుస్సు','మకరం','కుంభం','మీనం'],
ta:['மேஷம்','ரிஷபம்','மிதுனம்','கடகம்','சிம்மம்','கன்னி','துலாம்','விருச்சிகம்','தனுசு','மகரம்','கும்பம்','மீனம்'],
sa:['मेषः','वृषभः','मिथुनम्','कर्कटः','सिंहः','कन्या','तुला','वृश्चिकः','धनुः','मकरः','कुम्भः','मीनः'],
mr:['मेष','वृषभ','मिथुन','कर्क','सिंह','कन्या','तुला','वृश्चिक','धनु','मकर','कुंभ','मीन'],
gu:['મેષ','વૃષભ','મિથુન','કર્ક','સિંહ','કન્યા','તુલા','વૃશ્ચિક','ધનુ','મકર','કુંભ','મીન'],
bn:['মেষ','বৃষ','মিথুন','কর্কট','সিংহ','কন্যা','তুলা','বৃশ্চিক','ধনু','মকর','কুম্ভ','মীন'],
ml:['മേടം','ഇടവം','മിഥുനം','കർക്കടകം','ചിങ്ങം','കന്നി','തുലാം','വൃശ്ചികം','ധനു','മകരം','കുംഭം','മീനം']
};

const L_GRAHA={
en:{sun:'Sun',moon:'Moon',mars:'Mars',mercury:'Mercury',jupiter:'Jupiter',venus:'Venus',saturn:'Saturn',rahu:'Rahu',ketu:'Ketu'},
hi:{sun:'सूर्य',moon:'चन्द्र',mars:'मंगल',mercury:'बुध',jupiter:'गुरु',venus:'शुक्र',saturn:'शनि',rahu:'राहु',ketu:'केतु'},
kn:{sun:'ಸೂರ್ಯ',moon:'ಚಂದ್ರ',mars:'ಮಂಗಳ',mercury:'ಬುಧ',jupiter:'ಗುರು',venus:'ಶುಕ್ರ',saturn:'ಶನಿ',rahu:'ರಾಹು',ketu:'ಕೇತು'},
te:{sun:'సూర్యుడు',moon:'చంద్రుడు',mars:'కుజుడు',mercury:'బుధుడు',jupiter:'గురుడు',venus:'శుక్రుడు',saturn:'శని',rahu:'రాహువు',ketu:'కేతువు'},
ta:{sun:'சூரியன்',moon:'சந்திரன்',mars:'செவ్వாய்',mercury:'புதன்',jupiter:'குரு',venus:'சுக்கிரன்',saturn:'சனி',rahu:'ராகு',ketu:'கேது'},
sa:{sun:'सूर्यः',moon:'चन्द्रः',mars:'मङ्गलः',mercury:'बुधः',jupiter:'गुरुः',venus:'शुक्रः',saturn:'शनिः',rahu:'राहुः',ketu:'केतुः'},
mr:{sun:'सूर्य',moon:'चंद्र',mars:'मंगळ',mercury:'बुध',jupiter:'गुरू',venus:'शुक्र',saturn:'शनी',rahu:'राहू',ketu:'केतू'},
gu:{sun:'સૂર્ય',moon:'ચંદ્ર',mars:'મંગળ',mercury:'બુધ',jupiter:'ગુરુ',venus:'શુક્ર',saturn:'શનિ',rahu:'રાહુ',ketu:'કેતુ'},
bn:{sun:'সূর্য',moon:'চন্দ্র',mars:'মঙ্গল',mercury:'বুধ',jupiter:'বৃহস্পতি',venus:'শুক্র',saturn:'শনি',rahu:'রাহু',ketu:'কেতু'},
ml:{sun:'സൂര്യൻ',moon:'ചന്ദ്രൻ',mars:'ചൊവ്വ',mercury:'ബുധൻ',jupiter:'വ്യാഴം',venus:'ശുക്രൻ',saturn:'ശനി',rahu:'രാഹു',ketu:'കേതു'}
};

const L_ABBR={
en:{sun:'Su',moon:'Mo',mars:'Ma',mercury:'Bu',jupiter:'Gu',venus:'Sk',saturn:'Sa',rahu:'Ra',ketu:'Ke'},
hi:{sun:'सू',moon:'चं',mars:'मं',mercury:'बु',jupiter:'गु',venus:'शु',saturn:'श',rahu:'रा',ketu:'के'},
kn:{sun:'ಸೂ',moon:'ಚಂ',mars:'ಮಂ',mercury:'ಬು',jupiter:'ಗು',venus:'ಶು',saturn:'ಶ',rahu:'ರಾ',ketu:'ಕೇ'},
te:{sun:'సూ',moon:'చం',mars:'కు',mercury:'బు',jupiter:'గు',venus:'శు',saturn:'శ',rahu:'రా',ketu:'కే'},
ta:{sun:'சூ',moon:'சந்',mars:'செ',mercury:'பு',jupiter:'கு',venus:'சு',saturn:'ச',rahu:'ரா',ketu:'கே'},
sa:{sun:'सू',moon:'चं',mars:'मं',mercury:'बु',jupiter:'गु',venus:'शु',saturn:'श',rahu:'रा',ketu:'के'},
mr:{sun:'सू',moon:'चं',mars:'मं',mercury:'बु',jupiter:'गु',venus:'शु',saturn:'श',rahu:'रा',ketu:'के'},
gu:{sun:'સૂ',moon:'ચં',mars:'મં',mercury:'બુ',jupiter:'ગુ',venus:'શુ',saturn:'શ',rahu:'રા',ketu:'કે'},
bn:{sun:'সূ',moon:'চ',mars:'মং',mercury:'বু',jupiter:'বৃ',venus:'শু',saturn:'শ',rahu:'রা',ketu:'কে'},
ml:{sun:'സൂ',moon:'ചന്',mars:'ചൊ',mercury:'ബു',jupiter:'വ്യാ',venus:'ശു',saturn:'ශ',rahu:'രാ',ketu:'കേ'}
};

export const L_NAKS={
en:['Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha','Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati'],
hi:['अश्विनी','भरणी','कृत्तिका','रोहिणी','मृगशिरा','आर्द्रा','पुनर्वसु','पुष्य','आश्लेषा','मघा','पूर्व फाल्गुनी','उत्तर फाल्गुनी','हस्त','चित्रा','स्वाति','विशाखा','अनुराधा','ज्येष्ठा','मूल','पूर्व आषाढ','उत्तर आषाढ','श्रवण','धनिष्ठा','शतभिषा','पूर्व भाद्रपद','उत्तर भाद्रपद','रेवती'],
kn:['ಅಶ್ವಿನಿ','ಭರಣಿ','ಕೃತ್ತಿಕಾ','ರೋಹಿಣಿ','ಮೃಗಶಿರಾ','ಆರ್ದ್ರಾ','ಪುನರ್ವಸು','ಪುಷ್ಯ','ಆಶ್ಲೇಷಾ','ಮಘಾ','ಪೂರ್ವ ಫಾಲ್ಗುನಿ','ಉತ್ತರ ಫಾಲ್ಗುನಿ','ಹಸ್ತ','ಚಿತ್ರಾ','ಸ್ವಾತಿ','ವಿಶಾಖಾ','ಅನುರಾಧಾ','ಜ್ಯೇಷ್ಠಾ','ಮೂಲ','ಪೂರ್ವ ಆಷಾಢ','ಉತ್ತರ ಆಷಾಢ','ಶ್ರವಣ','ಧನಿಷ್ಠಾ','ಶತಭಿಷಾ','ಪೂರ್ವ ಭಾದ್ರಪದ','ಉತ್ತರ ಭಾದ್ರಪದ','ರೇವತಿ'],
te:['అశ్విని','భరణి','కృత్తిక','రోహిణి','మృగశిర','ఆర్ద్ర','పునర్వసు','పుష్య','ఆశ్లేష','మఘ','పూర్వ ఫాల్గుని','ఉత్తర ఫాల్గుని','హస్త','చిత్ర','స్వాతి','విశాఖ','అనురాధ','జ్యేష్ఠ','మూల','పూర్వ ఆషాఢ','ఉత్తర ఆషాఢ','శ్రవణ','ధనిష్ఠ','శతభిష','పూర్వ భాద్రపద','ఉత్తర భాద్రపద','రేవతి'],
ta:['அஸ்வினி','பரணி','கிருத்திகை','ரோஹிணி','மிருகசீரிடம்','திருவாதிரை','புனர்பூசம்','பூசம்','ஆயில்யம்','மகம்','பூரம்','உத்திரம்','அஸ்தம்','சித்திரை','சுவாதி','விசாகம்','அனுஷம்','கேட்டை','மூலம்','பூராடம்','உத்திராடம்','திருவோணம்','அவிட்டம்','சதயம்','பூரட்டாதி','உத்திரட்டாதி','ரேவதி'],
sa:['अश्विनी','भरणी','कृत्तिकाः','रोहिणी','मृगशिरः','आर्द्रा','पुनर्वसुः','पुष्यः','आश्लेषा','मघा','पूर्व फाल्गुनी','उत्तर फाल्गुनी','हस्तः','चित्रा','स्वाति','विशाखा','अनुराधा','ज्येष्ठा','मूलम्','पूर्व आषाढम्','उत्तर आषाढम्','श्रवणः','धनिष्ठा','शतभिषज्','पूर्व भाद्रपदा','उत्तर भाद्रपदा','रेवती'],
mr:['अश्विनी','भरणी','कृत्तिका','रोहिणी','मृगशिरा','आर्द्रा','पुनर्वसु','पुष्य','आश्लेषा','मघा','पूर्व फाल्गुनी','उत्तर फाल्गुनी','हस्त','चित्रा','स्वाति','विशाखा','अनुराधा','ज्येष्ठा','मूल','पूर्व आषाढ','उत्तर आषाढ','श्रवण','धनिष्ठा','शतभिषा','पूर्व भाद्रपद','उत्तर भाद्रपद','रेवती'],
gu:['અશ્વિની','ભરણી','કૃત્તિકા','રોહિણી','મૃગશિરા','આર્દ્રા','પુનર્વસુ','પુષ્ય','આશ્લેષા','મઘા','પૂર્વ ફાલ્ગુની','ઉત્તર ફાલ્ગુની','હસ્ત','ચિત્રા','સ્વાતિ','વિશાખા','અનુરાધા','જ્યેષ્ઠા','મૂલ','પૂર્વ આષાઢ','ઉત્તર આષાઢ','શ્રવણ','ધનિષ્ઠા','શતભિષા','પૂર્વ ભાદ્રપદ','ઉત્તર ભાદ્રપદ','રેવતી'],
bn:['অশ্বিনী','ভরণী','কৃত্তিকা','রোহিণী','মৃগশিরা','আর্দ্রা','পুনর্বসু','পুষ্য','আশ্লেষা','মঘা','পূর্ব ফাল্গুনী','উত্তর ফাল্গুনী','হস্ত','চিত্রা','স্বাতি','বিশাখা','অনুরাধা','জ্যেষ্ঠা','মূল','পূর্ব আষাঢ়','উত্তর আষাঢ়','শ্রবণ','ধনিষ্ঠা','শতভিষা','পূর্ব ভাদ্রপদ','উত্তর ভাদ্রপদ','রেবতী'],
ml:['അശ്വിനി','ഭരണി','കൃത്തിക','രോഹിണി','മൃഗശിര','ആര്ദ്ര','പുനര്വസു','പുഷ്യ','ആശ്ലേഷ','മഘ','പൂര്വ ഫാല്ഗുനി','ുത്തര ഫാല്ഗുനി','ഹസ്ത','ചിത്ര','സ്വാതി','വിശാഖ','അനുരാധ','ജ്യേഷ്ഠ','മൂല','പൂര്വ ആഷാഢ','ുത്തര ആഷാഢ','ശ്രവണ','ധനിഷ്ഠ','ശതഭിഷ','പൂര്വ ഭാദ്രപദ','ുത്തര ഭാദ്രപദ','റേവതി']
};

const L_STATUS={
en:{exalted:'Exalted',debilitated:'Debilitated',retrograde:'Retrograde',combust:'Combust',vargottama:'Vargottama'},
hi:{exalted:'उच्च',debilitated:'नीच',retrograde:'वक्री',combust:'अस्त',vargottama:'वर्गोत्तम'},
kn:{exalted:'ಉಚ್ಚ',debilitated:'ನೀಚ',retrograde:'ವಕ್ರ',combust:'ಅಸ್ತ',vargottama:'ವರ್ಗೋತ್ತಮ'},
te:{exalted:'ఉచ్చ',debilitated:'నీచ',retrograde:'వక్ర',combust:'అస్తంగత',vargottama:'వర్గోత్తమ'},
ta:{exalted:'உச்சம்',debilitated:'நீசம்',retrograde:'வக்கிரம்',combust:'அஸ்தம்',vargottama:'வர்கோத்தமம்'},
sa:{exalted:'उच्चम्',debilitated:'नीचम्',retrograde:'वक्री',combust:'अस्तम्',vargottama:'वर्गोत्तमम्'},
mr:{exalted:'उच्च',debilitated:'नीच',retrograde:'वक्री',combust:'अस्त',vargottama:'वर्गोत्तम'},
gu:{exalted:'ઉચ્ચ',debilitated:'નીચ',retrograde:'વક્રી',combust:'અસ્ત',vargottama:'વર્ગોત્તમ'},
bn:{exalted:'উচ্চ',debilitated:'নীচ',retrograde:'বক্র',combust:'অস্ত',vargottama:'বর্গোত্তম'},
ml:{exalted:'ഉച്ചം',debilitated:'നീചം',retrograde:'വക്രം',combust:'അസ്തം',vargottama:'വർഗോത്തമം'}
};


export const L_LAGNA={
en:['Mesha Lagna bestows courage and pioneering spirit. Mars rules, giving decisive action and leadership.','Vrishabha Lagna gives stability, artistic taste, and material comfort. Venus rules, blessing sensual enjoyment.','Mithuna Lagna grants intellectual agility and communication skill. Mercury rules, favoring versatile pursuits.','Karka Lagna nurtures emotional depth and protective instincts. Moon rules, giving intuitive sensitivity.','Simha Lagna radiates authority, creativity, and regal bearing. Sun rules, bestowing natural confidence.','Kanya Lagna provides analytical precision and service orientation. Mercury rules, favoring methodical work.','Tula Lagna brings diplomatic grace, partnership focus, and aesthetic sense. Venus rules, giving charm.','Vrischika Lagna gives transformative intensity and investigative depth. Mars rules, bestowing resilience.','Dhanu Lagna grants philosophical wisdom and expansive vision. Jupiter rules, favoring higher learning.','Makara Lagna bestows disciplined ambition and structural thinking. Saturn rules, giving endurance.','Kumbha Lagna provides humanitarian vision and innovative thinking. Saturn rules, favoring social reform.','Meena Lagna gives spiritual sensitivity and compassionate nature. Jupiter rules, bestowing intuitive wisdom.'],
hi:['मेष लग्न साहस और अग्रणी भावना प्रदान करता है। मंगल शासक है, निर्णायक कार्य और नेतृत्व देता है।','वृषभ लग्न स्थिरता और कलात्मक रुचि देता है। शुक्र शासक है, भौतिक सुख प्रदान करता है।','मिथुन लग्न बौद्धिक चपलता और संवाद कौशल देता है। बुध शासक है।','कर्क लग्न भावनात्मक गहराई और सुरक्षात्मक प्रवृत्ति देता है। चंद्र शासक है।','सिंह लग्न अधिकार, सृजनशीलता और प्रतिष्ठा विकीर्ण करता है। सूर्य शासक है।','कन्या लग्न विश्लेषणात्मक सटीकता और सेवा भाव देता है। बुध शासक है।','तुला लग्न कूटनीतिक अनुग्रह और साझेदारी देता है। शुक्र शासक है।','वृश्चिक लग्न परिवर्तनकारी तीव्रता और गहन अन्वेषण देता है। मंगल शासक है।','धनु लग्न दार्शनिक ज्ञान और विस्तृत दृष्टि देता है। गुरु शासक है।','मकर लग्न अनुशासित महत्वाकांक्षा और संरचनात्मक सोच देता है। शनि शासक है।','कुम्भ लग्न मानवतावादी दृष्टि और नवीन सोच देता है। शनि शासक है।','मीन लग्न आध्यात्मिक संवेदनशीलता और करुणा प्रदान करता है। गुरु शासक है।'],
kn:['ಮೇಷ ಲಗ್ನ ಧೈರ್ಯ ಮತ್ತು ಅಗ್ರಗಣ್ಯ ಮನೋಭಾವ ನೀಡುತ್ತದೆ। ಮಂಗಳ ಅಧಿಪತಿ, ನಿರ್ಣಾಯಕ ಕ್ರಮ ನೀಡುತ್ತಾನೆ।','ವೃಷಭ ಲಗ್ನ ಸ್ಥಿರತೆ ಮತ್ತು ಕಲಾತ್ಮಕ ಅಭಿರುಚಿ ನೀಡುತ್ತದೆ। ಶುಕ್ರ ಅಧಿಪತಿ।','ಮಿಥುನ ಲಗ್ನ ಬೌದ್ಧಿಕ ಚಾಕಚಕ್ಯತೆ ನೀಡುತ್ತದೆ। ಬುಧ ಅಧಿಪತಿ।','ಕರ್ಕಾಟಕ ಲಗ್ನ ಭಾವನಾತ್ಮಕ ಆಳ ನೀಡುತ್ತದೆ। ಚಂದ್ರ ಅಧಿಪತಿ।','ಸಿಂಹ ಲಗ್ನ ಅಧಿಕಾರ ಮತ್ತು ಸೃಜನಶೀಲತೆ ನೀಡುತ್ತದೆ। ಸೂರ್ಯ ಅಧಿಪತಿ।','ಕನ್ಯಾ ಲಗ್ನ ವಿಶ್ಲೇಷಣಾತ್ಮಕ ನಿಖರತೆ ನೀಡುತ್ತದೆ। ಬುಧ ಅಧಿಪತಿ।','ತುಲಾ ಲಗ್ನ ರಾಜತಾಂತ್ರಿಕ ಕೃಪೆ ನೀಡುತ್ತದೆ। ಶುಕ್ರ ಅಧಿಪತಿ।','ವೃಶ್ಚಿಕ ಲಗ್ನ ಪರಿವರ್ತನಾತ್ಮಕ ತೀವ್ರತೆ ನೀಡುತ್ತದೆ। ಮಂಗಳ ಅಧಿಪತಿ।','ಧನು ಲಗ್ನ ತಾತ್ವಿಕ ಜ್ಞಾನ ನೀಡುತ್ತದೆ। ಗುರು ಅಧಿಪತಿ।','ಮಕರ ಲಗ್ನ ಶಿಸ್ತಿನ ಮಹತ್ವಾಕಾಂಕ್ಷೆ ನೀಡುತ್ತದೆ। ಶನಿ ಅಧಿಪತಿ।','ಕುಂಭ ಲಗ್ನ ಮಾನವತಾವಾದಿ ದೃಷ್ಟಿ ನೀಡುತ್ತದೆ। ಶನಿ ಅಧಿಪತಿ।','ಮೀನ ಲಗ್ನ ಆಧ್ಯಾತ್ಮಿಕ ಸಂವೇದನಶೀಲತೆ ನೀಡುತ್ತದೆ। ಗುರು ಅಧಿಪತಿ।'],
te:['మేషం లగ్నం ధైర్యం మరియు ముందంజ వేసే స్ఫూర్తిని ఇస్తుంది। కుజుడు అధిపతి।','వృషభం లగ్నం స్థిరత్వం మరియు కళాత్మక అభిరుచిని ఇస్తుంది। శుక్రుడు అధిపతి।','మిథునం లగ్నం బుద్ధిపూర్వక చురుకుదనాన్ని ఇస్తుంది। బుధుడు అధిపతి।','కర్కాటకం లగ్నం భావోద్వేగ లోతును ఇస్తుంది। చంద్రుడు అధిపతి।','సింహం లగ్నం అధికారం మరియు సృజనాత్మకతను ఇస్తుంది। సూర్యుడు అధిపతి।','కన్య లగ్నం విశ్లేషణాత్మక ఖచ్చితత్వాన్ని ఇస్తుంది। బుధుడు అధిపతి।','తుల లగ్నం దౌత్య కృపను ఇస్తుంది। శుక్రుడు అధిపతి।','వృశ్చికం లగ్నం పరివర్తనాత్మక తీవ్రతను ఇస్తుంది। కుజుడు అధిపతి।','ధనుస్సు లగ్నం తాత్విక జ్ఞానాన్ని ఇస్తుంది। గురుడు అధిపతి।','మకరం లగ్నం క్రమశిక్షణ ఆకాంక్షను ఇస్తుంది। శని అధిపతి।','కుంభం లగ్నం మానవతావాద దృష్టిని ఇస్తుంది। శని అధిపతి।','మీనం లగ్నం ఆధ్యాత్మిక సున్నితత్వాన్ని ఇస్తుంది। గురుడు అధిపతి।'],
ta:['மேஷ லக்னம் தைரியமும் முன்னோடி மனப்பான்மையும் அளிக்கிறது। செவ்வாய் ஆட்சி।','ரிஷப லக்னம் நிலைத்தன்மை மற்றும் கலை ரசனை அளிக்கிறது। சுக்கிரன் ஆட்சி।','மிதுன லக்னம் அறிவுத் திறனை அளிக்கிறது। புதன் ஆட்சி।','கடக லக்னம் உணர்ச்சி ஆழத்தை அளிக்கிறது। சந்திரன் ஆட்சி।','சிம்ம லக்னம் அதிகாரமும் படைப்பாற்றலும் அளிக்கிறது। சூரியன் ஆட்சி।','கன்னி லக்னம் பகுப்பாய்வு துல்லியத்தை அளிக்கிறது। புதன் ஆட்சி।','துலா லக்னம் இராஜதந்திர கருணை அளிக்கிறது। சுக்கிரன் ஆட்சி।','விருச்சிக லக்னம் மாற்றத் தீவிரத்தை அளிக்கிறது। செவ்வாய் ஆட்சி।','தனுசு லக்னம் தத்துவ ஞானம் அளிக்கிறது। குரு ஆட்சி।','மகர லக்னம் ஒழுக்கமான லட்சியத்தை அளிக்கிறது। சனி ஆட்சி।','கும்ப லக்னம் மனிதாபிமான பார்வையை அளிக்கிறது। சனி ஆட்சி।','மீன லக்னம் ஆன்மீக உணர்திறனை அளிக்கிறது। குரு ஆட்சி।'],
sa:['मेषलग्नं शौर्यं प्रदाति। मङ्गलः अधिपतिः।','वृषभलग्नं स्थैर्यं कलाभिरुचिं च प्रदाति। शुक्रः अधिपतिः।','मिथुनलग्नं बौद्धिकचातुर्यं प्रदाति। बुधः अधिपतिः।','कर्कटलग्नं भावनात्मकगम्भीरतां प्रदाति। चन्द्रः अधिपतिः।','सिंहलग्नम् अधिकारं सृजनशीलतां च प्रदाति। सूर्यः अधिपतिः।','कन्यालग्नं विश्लेषणात्मकसूक्ष्मतां प्रदाति। बुधः अधिपतिः।','तुलालग्नं कूटनीतिकं सौन्दर्यं प्रदाति। शुक्रः अधिपतिः।','वृश्चिकलग्नं परिवर्तनात्मकतीव्रतां प्रदाति। मङ्गलः अधिपतिः।','धनुर्लग्नं दार्शनिकज्ञानं प्रदाति। गुरुः अधिपतिः।','मकरलग्नम् अनुशासितमहत्त्वाकाङ्क्षां प्रदाति। शनिः अधिपतिः।','कुम्भलग्नं मानवतावादिदृष्टिं प्रदाति। शनिः अधिपतिः।','मीनलग्नम् आध्यात्मिकसंवेदनशीलतां प्रदाति। गुरुः अधिपतिः।'],
mr:['मेष लग्न धैर्य आणि अग्रणी भावना देते। मंगळ शासक आहे।','वृषभ लग्न स्थिरता आणि कलात्मक अभिरुची देते। शुक्र शासक आहे।','मिथुन लग्न बौद्धिक चपळता देते। बुध शासक आहे।','कर्क लग्न भावनिक खोली देते। चंद्र शासक आहे।','सिंह लग्न अधिकार आणि सर्जनशीलता देते। सूर्य शासक आहे।','कन्या लग्न विश्लेषणात्मक अचूकता देते। बुध शासक आहे।','तुला लग्न मुत्सद्दी कृपा देते। शुक्र शासक आहे।','वृश्चिक लग्न परिवर्तनात्मक तीव्रता देते। मंगळ शासक आहे।','धनु लग्न तत्त्वज्ञानात्मक शहाणपण देते। गुरू शासक आहे।','मकर लग्न शिस्तबद्ध महत्त्वाकांक्षा देते। शनी शासक आहे।','कुंभ लग्न मानवतावादी दृष्टी देते। शनी शासक आहे।','मीन लग्न आध्यात्मिक संवेदनशीलता देते। गुरू शासक आहे।'],
gu:['મેષ લગ્ન સાહસ અને અગ્રણી ભાવના આપે છે। મંગળ શાસક છે।','વૃષભ લગ્ન સ્થિરતા અને કલાત્મક રુચિ આપે છે। શુક્ર શાસક છે।','મિથુન લગ્ન બૌદ્ધિક ચપળતા આપે છે। બુધ શાસક છે।','કર્ક લગ્ન ભાવનાત્મક ઊંડાણ આપે છે। ચંદ્ર શાસક છે।','સિંહ લગ્ન સત્તા અને સર્જનાત્મકતા આપે છે। સૂર્ય શાસક છે।','કન્યા લગ્ન વિશ્લેષણાત્મક ચોકસાઈ આપે છે। બુધ શાસક છે।','તુલા લગ્ન રાજદ્વારી કૃપા આપે છે। શુક્ર શાસક છે।','વૃશ્ચિક લગ્ન પરિવર્તનકારી તીવ્રતા આપે છે। મંગળ શાસક છે।','ધનુ લગ્ન ફિલસૂફિક જ્ઞાન આપે છે। ગુરુ શાસક છે।','મકર લગ્ન શિસ્તબદ્ધ મહત્ત્વાકાંક્ષા આપે છે। શનિ શાસક છે।','કુંભ લગ્ન માનવતાવાદી દૃષ્ટિ આપે છે। શનિ શાસક છે।','મીન લગ્ન આધ્યાત્મિક સંવેદનશીલતા આપે છે। ગુરુ શાસક છે।'],
bn:['মেষ লগ্ন সাহস এবং পথিকৃৎ মনোভাব দেয়। মঙ্গল শাসক।','বৃষ লগ্ন স্থিরতা এবং শৈল্পিক রুচি দেয়। শুক্র শাসক।','মিথুন লগ্ন বৌদ্ধিক চাতুর্য দেয়। বুধ শাসক।','কর্কট লগ্ন আবেগের গভীরতা দেয়। চন্দ্র শাসক।','সিংহ লগ্ন কর্তৃত্ব ও সৃজনশীলতা দেয়। সূর্য শাসক।','কন্যা লগ্ন বিশ্লেষণমূলক নির্ভুলতা দেয়। বুধ শাসক।','তুলা লগ্ন কূটনৈতিক কৃপা দেয়। শুক্র শাসক।','বৃশ্চিক লগ্ন রূপান্তরমূলক তীব্রতা দেয়। মঙ্গল শাসক।','ধনু লগ্ন দার্শনিক জ্ঞান দেয়। বৃহস্পতি শাসক।','মকর লগ্ন শৃঙ্খলাবদ্ধ মহত্ত্বাকাঙ্ক্ষা দেয়। শনি শাসক।','কুম্ভ লগ্ন মানবতাবাদী দৃষ্টি দেয়। শনি শাসক।','মীন লগ্ন আধ্যাত্মিক সংবেদনশীলতা দেয়। বৃহস্পতি শাসক।'],
ml:['മേടം ലഗ്നം ധൈര്യവും മുൻഗാമി മനോഭാവവും നൽകുന്നു। ചൊവ്വ അധിപൻ।','ഇടവം ലഗ്നം സ്ഥിരതയും കലാപരമായ രുചിയും നൽകുന്നു। ശുക്രൻ അധിപൻ।','മിഥുനം ലഗ്നം ബുദ്ധിപരമായ ചാതുര്യം നൽകുന്നു। ബുധൻ അധിപൻ।','കർക്കടകം ലഗ്നം വൈകാരിക ആഴം നൽകുന്നു। ചന്ദ്രൻ അധിപൻ।','ചിങ്ങം ലഗ്നം അധികാരവും സർഗ്ഗാത്മകതയും നൽകുന്നു। സൂര്യൻ അധിപൻ।','കന്നി ലഗ്നം വിശ്ലേഷണ കൃത്യത നൽകുന്നു। ബുധൻ അധിപൻ।','തുലാം ലഗ്നം നയതന്ത്ര കൃപ നൽകുന്നു। ശുക്രൻ അധിപൻ।','വൃശ്ചികം ലഗ്നം പരിവർത്തന തീവ്രത നൽകുന്നു। ചൊവ്വ അധിപൻ।','ധനു ലഗ്നം ദാർശനിക ജ്ഞാനം നൽകുന്നു। വ്യാഴം അധിപൻ।','മകരം ലഗ്നം അച്ചടക്ക മഹത്ത്വാകാങ്ക്ഷ നൽകുന്നു। ശനി അധിപൻ।','കുംഭം ലഗ്നം മാനവികത ദർശനം നൽകുന്നു। ശനി അധിപൻ।','മീനം ലഗ്നം ആത്മീയ സംവേദനക്ഷമത നൽകുന്നു। വ്യാഴം അധിപൻ।']
};

export const L_DASHA={
en:{sun:'Sun period elevates authority and spiritual awareness.',moon:'Moon period brings emotional depth and public recognition.',mars:'Mars period activates courage, property matters, and competitive drive.',mercury:'Mercury period enhances intellect, commerce, and communication.',jupiter:'Jupiter period bestows wisdom, expansion, and spiritual growth.',venus:'Venus period brings luxury, relationships, and artistic expression.',saturn:'Saturn period teaches discipline through challenges and builds lasting structures.',rahu:'Rahu period creates intense worldly ambition and unconventional breakthroughs.',ketu:'Ketu period deepens spiritual insight and detachment from material pursuits.'},
hi:{sun:'सूर्य दशा अधिकार और आध्यात्मिक जागरूकता बढ़ाती है।',moon:'चंद्र दशा भावनात्मक गहराई और लोक प्रसिद्धि लाती है।',mars:'मंगल दशा साहस, संपत्ति और प्रतिस्पर्धा सक्रिय करती है।',mercury:'बुध दशा बुद्धि, व्यापार और संवाद बढ़ाती है।',jupiter:'गुरु दशा ज्ञान, विस्तार और आध्यात्मिक वृद्धि देती है।',venus:'शुक्र दशा विलासिता, संबंध और कला लाती है।',saturn:'शनि दशा चुनौतियों से अनुशासन सिखाती है।',rahu:'राहु दशा तीव्र सांसारिक महत्वाकांक्षा उत्पन्न करती है।',ketu:'केतु दशा आध्यात्मिक अंतर्दृष्टि और वैराग्य गहरा करती है।'},
kn:{sun:'ಸೂರ್ಯ ದಶಾ ಅಧಿಕಾರ ಮತ್ತು ಆಧ್ಯಾತ್ಮಿಕ ಅರಿವನ್ನು ಹೆಚ್ಚಿಸುತ್ತದೆ।',moon:'ಚಂದ್ರ ದಶಾ ಭಾವನಾತ್ಮಕ ಆಳ ಮತ್ತು ಸಾರ್ವಜನಿಕ ಮನ್ನಣೆ ತರುತ್ತದೆ।',mars:'ಮಂಗಳ ದಶಾ ಧೈರ್ಯ ಮತ್ತು ಆಸ್ತಿ ವಿಷಯಗಳನ್ನು ಸಕ್ರಿಯಗೊಳಿಸುತ್ತದೆ।',mercury:'ಬುಧ ದಶಾ ಬುದ್ಧಿ ಮತ್ತು ವ್ಯಾಪಾರವನ್ನು ವರ್ಧಿಸುತ್ತದೆ।',jupiter:'ಗುರು ದಶಾ ಜ್ಞಾನ ಮತ್ತು ಆಧ್ಯಾತ್ಮಿಕ ಬೆಳವಣಿಗೆ ನೀಡುತ್ತದೆ।',venus:'ಶುಕ್ರ ದಶಾ ವೈಭವ ಮತ್ತು ಕಲಾತ್ಮಕ ಅಭಿವ್ಯಕ್ತಿ ತರುತ್ತದೆ।',saturn:'ಶನಿ ದಶಾ ಸವಾಲುಗಳ ಮೂಲಕ ಶಿಸ್ತು ಕಲಿಸುತ್ತದೆ।',rahu:'ರಾಹು ದಶಾ ತೀವ್ರ ಲೌಕಿಕ ಮಹತ್ವಾಕಾಂಕ್ಷೆ ಸೃಷ್ಟಿಸುತ್ತದೆ।',ketu:'ಕೇತು ದಶಾ ಆಧ್ಯಾತ್ಮಿಕ ಒಳನೋಟ ಮತ್ತು ವೈರಾಗ್ಯ ಆಳಗೊಳಿಸುತ್ತದೆ।'},
te:{sun:'సూర్య దశ అధికారం మరియు ఆధ్యాత్మిక అవగాహన పెంచుతుంది.',moon:'చంద్ర దశ భావోద్వేగ లోతు మరియు ప్రజా గుర్తింపు తెస్తుంది.',mars:'కుజ దశ ధైర్యం మరియు ఆస్తి విషయాలను సక్రియం చేస్తుంది.',mercury:'బుధ దశ బుద్ధి మరియు వ్యాపారాన్ని మెరుగుపరుస్తుంది.',jupiter:'గురు దశ జ్ఞానం మరియు ఆధ్యాత్మిక వృద్ధి ఇస్తుంది.',venus:'శుక్ర దశ విలాసం మరియు కళాత్మక వ్యక్తీకరణ తెస్తుంది.',saturn:'శని దశ సవాళ్ల ద్వారా క్రమశిక్షణ నేర్పిస్తుంది.',rahu:'రాహు దశ తీవ్ర ప్రపంచ ఆకాంక్షను సృష్టిస్తుంది.',ketu:'కేతు దశ ఆధ్యాత్మిక అంతర్దృష్టిని లోతుగా చేస్తుంది.'},
ta:{sun:'சூரிய திசை அதிகாரத்தையும் ஆன்மீக விழிப்புணர்வையும் உயர்த்துகிறது.',moon:'சந்திர திசை உணர்ச்சி ஆழத்தையும் பொது அங்கீகாரத்தையும் தருகிறது.',mars:'செவ்வாய் திசை தைரியம் மற்றும் சொத்து விஷயங்களை செயல்படுத்துகிறது.',mercury:'புதன் திசை அறிவு மற்றும் வணிகத்தை மேம்படுத்துகிறது.',jupiter:'குரு திசை ஞானம் மற்றும் ஆன்மீக வளர்ச்சியை அளிக்கிறது.',venus:'சுக்கிர திசை ஆடம்பரம் மற்றும் கலை வெளிப்பாட்டை தருகிறது.',saturn:'சனி திசை சவால்கள் மூலம் ஒழுக்கத்தை கற்பிக்கிறது.',rahu:'ராகு திசை தீவிர உலக லட்சியத்தை உருவாக்குகிறது.',ketu:'கேது திசை ஆன்மீக உள்நோக்கு மற்றும் பற்றின்மையை ஆழமாக்குகிறது.'},
sa:{sun:'सूर्यदशा अधिकारम् आध्यात्मिकजागरूकतां च वर्धयति।',moon:'चन्द्रदशा भावनात्मकगम्भीरतां लोकप्रसिद्धिं च आनयति।',mars:'मङ्गलदशा शौर्यं सम्पत्तिविषयान् च सक्रियं करोति।',mercury:'बुधदशा बुद्धिं वाणिज्यं च वर्धयति।',jupiter:'गुरुदशा ज्ञानम् आध्यात्मिकवृद्धिं च प्रदाति।',venus:'शुक्रदशा विलासं कलात्मकाभिव्यक्तिं च आनयति।',saturn:'शनिदशा आव्हानैः अनुशासनं शिक्षयति।',rahu:'राहुदशा तीव्रलौकिकमहत्त्वाकाङ्क्षां सृजति।',ketu:'केतुदशा आध्यात्मिकान्तर्दृष्टिं वैराग्यं च गम्भीरं करोति।'},
mr:{sun:'सूर्य दशा अधिकार आणि आध्यात्मिक जागरूकता वाढवते.',moon:'चंद्र दशा भावनिक खोली आणि लोकप्रियता आणते.',mars:'मंगळ दशा धैर्य आणि मालमत्ता बाबी सक्रिय करते.',mercury:'बुध दशा बुद्धी आणि व्यापार वाढवते.',jupiter:'गुरू दशा ज्ञान आणि आध्यात्मिक वाढ देते.',venus:'शुक्र दशा विलासिता आणि कलात्मक अभिव्यक्ती आणते.',saturn:'शनी दशा आव्हानांमधून शिस्त शिकवते.',rahu:'राहू दशा तीव्र सांसारिक महत्त्वाकांक्षा निर्माण करते.',ketu:'केतू दशा आध्यात्मिक अंतर्दृष्टी आणि वैराग्य खोल करते.'},
gu:{sun:'સૂર્ય દશા સત્તા અને આધ્યાત્મિક જાગૃતિ વધારે છે.',moon:'ચંદ્ર દશા ભાવનાત્મક ઊંડાણ અને લોકમાન્યતા લાવે છે.',mars:'મંગળ દશા સાહસ અને સંપત્તિ બાબતો સક્રિય કરે છે.',mercury:'બુધ દશા બુદ્ધિ અને વ્યાપાર વધારે છે.',jupiter:'ગુરુ દશા જ્ઞાન અને આધ્યાત્મિક વૃદ્ધિ આપે છે.',venus:'શુક્ર દશા વૈભવ અને કલાત્મક અભિવ્યક્તિ લાવે છે.',saturn:'શનિ દશા પડકારો દ્વારા શિસ્ત શીખવે છે.',rahu:'રાહુ દશા તીવ્ર સાંસારિક મહત્ત્વાકાંક્ષા સર્જે છે.',ketu:'કેતુ દશા આધ્યાત્મિક અંતર્દૃષ્ટિ અને વૈરાગ્ય ઊંડું કરે છે.'},
bn:{sun:'সূর্য দশা কর্তৃত্ব ও আধ্যাত্মিক সচেতনতা বাড়ায়।',moon:'চন্দ্র দশা আবেগের গভীরতা ও জনপ্রিয়তা আনে।',mars:'মঙ্গল দশা সাহস ও সম্পত্তি বিষয়গুলি সক্রিয় করে।',mercury:'বুধ দশা বুদ্ধি ও ব্যবসা বাড়ায়।',jupiter:'বৃহস্পতি দশা জ্ঞান ও আধ্যাত্মিক বৃদ্ধি দেয়।',venus:'শুক্র দশা বিলাসিতা ও শিল্পকলার অভিব্যক্তি আনে।',saturn:'শনি দশা চ্যালেঞ্জের মাধ্যমে শৃঙ্খলা শেখায়।',rahu:'রাহু দশা তীব্র পার্থিব উচ্চাকাঙ্ক্ষা সৃষ্টি করে।',ketu:'কেতু দশা আধ্যাত্মিক অন্তর্দৃষ্টি ও বৈরাগ্য গভীর করে।'},
ml:{sun:'സൂര്യ ദശ അധികാരവും ആത്മീയ ബോധവും ഉയർത്തുന്നു.',moon:'ചന്ദ്ര ദശ വൈകാരിക ആഴവും പൊതു അംഗീകാരവും നൽകുന്നു.',mars:'ചൊവ്വ ദശ ധൈര്യവും സ്വത്ത് കാര്യങ്ങളും സജീവമാക്കുന്നു.',mercury:'ബുധ ദശ ബുദ്ധിയും വ്യാപാരവും മെച്ചപ്പെടുത്തുന്നു.',jupiter:'വ്യാഴ ദശ ജ്ഞാനവും ആത്മീയ വളർച്ചയും നൽകുന്നു.',venus:'ശുക്ര ദശ ആഡംബരവും കലാപരമായ അഭിവ്യക്തിയും നൽകുന്നു.',saturn:'ശനി ദശ വെല്ലുവിളികളിലൂടെ അച്ചടക്കം പഠിപ്പിക്കുന്നു.',rahu:'രാഹു ദശ തീവ്ര ലൗകിക മഹത്വാകാങ്ക്ഷ സൃഷ്ടിക്കുന്നു.',ketu:'കേതു ദശ ആത്മീയ ഉൾക്കാഴ്ചയും വൈരാഗ്യവും ആഴമാക്കുന്നു.'}
};

export const L_YOGA={
en:{'Gaja Kesari':{name:'Gaja Kesari Yoga',effect:'Jupiter-Moon conjunction brings wisdom, wealth, and fame.'},'Budhaditya':{name:'Budhaditya',effect:'Sun-Mercury conjunction grants sharp intellect and communication skill.'},'Hamsa':{name:'Hamsa Yoga',effect:'Jupiter in Kendra grants wisdom, virtue, and spiritual inclination.'},'Malavya':{name:'Malavya Yoga',effect:'Venus in Kendra brings luxury, beauty, and artistic talent.'},'Ruchaka':{name:'Ruchaka Yoga',effect:'Mars in Kendra gives courage, command, and martial prowess.'},'Bhadra':{name:'Bhadra Yoga',effect:'Mercury in Kendra bestows eloquence, intellect, and commercial success.'},'Sasa':{name:'Sasa Yoga',effect:'Saturn in Kendra grants authority, discipline, and organizational power.'},'Mangal Dosha':{name:'Mangal Dosha',effect:'Mars afflicts marriage house; remedies recommended.'},'Kaal Sarpa':{name:'Kaal Sarpa Dosha',effect:'All planets hemmed between Rahu-Ketu axis; karmic intensity.'},'Pitru Dosha':{name:'Pitru Dosha',effect:'Ancestral karmic debt affecting progeny and prosperity.'},'Guru Chandal':{name:'Guru Chandal Yoga',effect:'Jupiter-Rahu conjunction may challenge conventional wisdom.'}},
hi:{'Gaja Kesari':{name:'गजकेसरी योग',effect:'गुरु-चंद्र संयोग ज्ञान, धन और यश लाता है।'},'Budhaditya':{name:'बुधादित्य योग',effect:'सूर्य-बुध संयोग तीक्ष्ण बुद्धि और संवाद कौशल देता है।'},'Hamsa':{name:'हंस योग',effect:'केंद्र में गुरु ज्ञान और आध्यात्मिक प्रवृत्ति देता है।'},'Malavya':{name:'मालव्य योग',effect:'केंद्र में शुक्र विलासिता और कलात्मक प्रतिभा लाता है।'},'Ruchaka':{name:'रुचक योग',effect:'केंद्र में मंगल साहस और नेतृत्व देता है।'},'Bhadra':{name:'भद्र योग',effect:'केंद्र में बुध वाक्पटुता और बौद्धिक सफलता देता है।'},'Sasa':{name:'शश योग',effect:'केंद्र में शनि अधिकार और संगठन शक्ति देता है।'},'Mangal Dosha':{name:'मंगल दोष',effect:'मंगल विवाह भाव को प्रभावित करता है; उपाय अनुशंसित।'},'Kaal Sarpa':{name:'काल सर्प दोष',effect:'सभी ग्रह राहु-केतु अक्ष में; कार्मिक तीव्रता।'},'Pitru Dosha':{name:'पितृ दोष',effect:'पूर्वजों का कार्मिक ऋण संतान और समृद्धि को प्रभावित करता है।'},'Guru Chandal':{name:'गुरु चांडाल योग',effect:'गुरु-राहु संयोग परंपरागत ज्ञान को चुनौती दे सकता है।'}},
kn:{'Gaja Kesari':{name:'ಗಜಕೇಸರಿ ಯೋಗ',effect:'ಗುರು-ಚಂದ್ರ ಸಂಯೋಗ ಜ್ಞಾನ, ಸಂಪತ್ತು ಮತ್ತು ಕೀರ್ತಿ ತರುತ್ತದೆ.'},'Budhaditya':{name:'ಬುಧಾದಿತ್ಯ ಯೋಗ',effect:'ಸೂರ್ಯ-ಬುಧ ಸಂಯೋಗ ಬುದ್ಧಿ ಮತ್ತು ಸಂವಹನ ಕೌಶಲ ನೀಡುತ್ತದೆ.'},'Hamsa':{name:'ಹಂಸ ಯೋಗ',effect:'ಕೇಂದ್ರದಲ್ಲಿ ಗುರು ಜ್ಞಾನ ಮತ್ತು ಆಧ್ಯಾತ್ಮಿಕ ಪ್ರವೃತ್ತಿ ನೀಡುತ್ತಾನೆ.'},'Malavya':{name:'ಮಾಲವ್ಯ ಯೋಗ',effect:'ಕೇಂದ್ರದಲ್ಲಿ ಶುಕ್ರ ವೈಭವ ಮತ್ತು ಕಲಾತ್ಮಕ ಪ್ರತಿಭೆ ತರುತ್ತಾನೆ.'},'Ruchaka':{name:'ರುಚಕ ಯೋಗ',effect:'ಕೇಂದ್ರದಲ್ಲಿ ಮಂಗಳ ಧೈರ್ಯ ಮತ್ತು ನಾಯಕತ್ವ ನೀಡುತ್ತಾನೆ.'},'Bhadra':{name:'ಭದ್ರ ಯೋಗ',effect:'ಕೇಂದ್ರದಲ್ಲಿ ಬುಧ ವಾಕ್ಪಟುತ್ವ ಮತ್ತು ಬೌದ್ಧಿಕ ಯಶಸ್ಸು ನೀಡುತ್ತಾನೆ.'},'Sasa':{name:'ಶಶ ಯೋಗ',effect:'ಕೇಂದ್ರದಲ್ಲಿ ಶನಿ ಅಧಿಕಾರ ಮತ್ತು ಸಂಘಟನಾ ಶಕ್ತಿ ನೀಡುತ್ತಾನೆ.'},'Mangal Dosha':{name:'ಮಂಗಳ ದೋಷ',effect:'ಮಂಗಳ ವಿವಾಹ ಭಾವವನ್ನು ಪ್ರಭಾವಿಸುತ್ತಾನೆ; ಪರಿಹಾರ ಶಿಫಾರಸು.'},'Kaal Sarpa':{name:'ಕಾಲ ಸರ್ಪ ದೋಷ',effect:'ಎಲ್ಲ ಗ್ರಹಗಳು ರಾಹು-ಕೇತು ಅಕ್ಷದಲ್ಲಿ; ಕಾರ್ಮಿಕ ತೀವ್ರತೆ.'},'Pitru Dosha':{name:'ಪಿತೃ ದೋಷ',effect:'ಪೂರ್ವಜರ ಕಾರ್ಮಿಕ ಋಣ ಸಂತಾನ ಮತ್ತು ಸಮೃದ್ಧಿಯನ್ನು ಪ್ರಭಾವಿಸುತ್ತದೆ.'},'Guru Chandal':{name:'ಗುರು ಚಾಂಡಾಲ ಯೋಗ',effect:'ಗುರು-ರಾಹು ಸಂಯೋಗ ಸಾಂಪ್ರದಾಯಿಕ ಜ್ಞಾನಕ್ಕೆ ಸವಾಲು ಒಡ್ಡಬಹುದು.'}},
te:{'Gaja Kesari':{name:'గజకేసరి యోగం',effect:'గురు-చంద్ర సంయోగం జ్ఞానం, సంపద మరియు కీర్తి తెస్తుంది.'},'Budhaditya':{name:'బుధాదిత్య యోగం',effect:'సూర్య-బుధ సంయోగం తీక్షణ బుద్ధిని ఇస్తుంది.'},'Hamsa':{name:'హంస యోగం',effect:'కేంద్రంలో గురుడు జ్ఞానాన్ని ఇస్తాడు.'},'Malavya':{name:'మాలవ్య యోగం',effect:'కేంద్రంలో శుక్రుడు విలాసాన్ని తెస్తాడు.'},'Ruchaka':{name:'రుచక యోగం',effect:'కేంద్రంలో కుజుడు ధైర్యాన్ని ఇస్తాడు.'},'Bhadra':{name:'భద్ర యోగం',effect:'కేంద్రంలో బుధుడు వాక్పటిమను ఇస్తాడు.'},'Sasa':{name:'శశ యోగం',effect:'కేంద్రంలో శని అధికారాన్ని ఇస్తాడు.'},'Mangal Dosha':{name:'మంగళ దోషం',effect:'కుజుడు వివాహ భావాన్ని ప్రభావితం చేస్తాడు.'},'Kaal Sarpa':{name:'కాల సర్ప దోషం',effect:'అన్ని గ్రహాలు రాహు-కేతు అక్షంలో.'},'Pitru Dosha':{name:'పితృ దోషం',effect:'పూర్వీకుల కార్మిక ఋణం సంతానాన్ని ప్రభావితం చేస్తుంది.'},'Guru Chandal':{name:'గురు చాండాల యోగం',effect:'గురు-రాహు సంయోగం సంప్రదాయ జ్ఞానానికి సవాలు చేయవచ్చు.'}},
ta:{'Gaja Kesari':{name:'கஜகேசரி யோகம்',effect:'குரு-சந்திர சேர்க்கை ஞானம், செல்வம் மற்றும் புகழ் தருகிறது.'},'Budhaditya':{name:'புதாதித்ய யோகம்',effect:'சூரிய-புத சேர்க்கை கூர்மையான அறிவை அளிக்கிறது.'},'Hamsa':{name:'அன்ன யோகம்',effect:'கேந்திரத்தில் குரு ஞானம் அளிக்கிறார்.'},'Malavya':{name:'மாலவ்ய யோகம்',effect:'கேந்திரத்தில் சுக்கிரன் ஆடம்பரம் தருகிறார்.'},'Ruchaka':{name:'ருசக யோகம்',effect:'கேந்திரத்தில் செவ்வாய் தைரியம் அளிக்கிறார்.'},'Bhadra':{name:'பத்ர யோகம்',effect:'கேந்திரத்தில் புதன் சொல்வன்மை அளிக்கிறார்.'},'Sasa':{name:'சச யோகம்',effect:'கேந்திரத்தில் சனி அதிகாரம் அளிக்கிறார்.'},'Mangal Dosha':{name:'செவ்வாய் தோஷம்',effect:'செவ்வாய் திருமண பாவத்தை பாதிக்கிறார்.'},'Kaal Sarpa':{name:'கால சர்ப்ப தோஷம்',effect:'அனைத்து கிரகங்களும் ராகு-கேது அச்சில்.'},'Pitru Dosha':{name:'பிதிரு தோஷம்',effect:'முன்னோர் கர்ம கடன் சந்ததியை பாதிக்கிறது.'},'Guru Chandal':{name:'குரு சண்டால யோகம்',effect:'குரு-ராகு சேர்க்கை மரபு ஞானத்தை சவால் செய்யலாம்.'}},
sa:{'Gaja Kesari':{name:'गजकेसरीयोगः',effect:'गुरुचन्द्रसंयोगः ज्ञानं धनं यशश्च आनयति।'},'Budhaditya':{name:'बुधादित्ययोगः',effect:'सूर्यबुधसंयोगः तीक्ष्णबुद्धिं प्रदाति।'},'Hamsa':{name:'हंसयोगः',effect:'केन्द्रे गुरुः ज्ञानम् आध्यात्मिकप्रवृत्तिं च प्रदाति।'},'Malavya':{name:'मालव्ययोगः',effect:'केन्द्रे शुक्रः विलासं कलाप्रतिभां च आनयति।'},'Ruchaka':{name:'रुचकयोगः',effect:'केन्द्रे मङ्गलः शौर्यं नायकत्वं च प्रदाति।'},'Bhadra':{name:'भद्रयोगः',effect:'केन्द्रे बुधः वाक्पटुतां बौद्धिकसफलतां च प्रदाति।'},'Sasa':{name:'शशयोगः',effect:'केन्द्रे शनिः अधिकारं सङ्घटनशक्तिं च प्रदाति।'},'Mangal Dosha':{name:'मङ्गलदोषः',effect:'मङ्गलः विवाहभावं पीडयति।'},'Kaal Sarpa':{name:'कालसर्पदोषः',effect:'सर्वे ग्रहाः राहुकेत्वक्षे।'},'Pitru Dosha':{name:'पितृदोषः',effect:'पूर्वजानां कार्मिकऋणं सन्तानं प्रभावयति।'},'Guru Chandal':{name:'गुरुचाण्डालयोगः',effect:'गुरुराहुसंयोगः परम्पराज्ञानं आव्हानयेत्।'}},
mr:{'Gaja Kesari':{name:'गजकेसरी योग',effect:'गुरू-चंद्र संयोग ज्ञान, संपत्ती आणि कीर्ती आणतो.'},'Budhaditya':{name:'बुधादित्य योग',effect:'सूर्य-बुध संयोग तीक्ष्ण बुद्धी देतो.'},'Hamsa':{name:'हंस योग',effect:'केंद्रात गुरू ज्ञान देतो.'},'Malavya':{name:'मालव्य योग',effect:'केंद्रात शुक्र वैभव आणतो.'},'Ruchaka':{name:'रुचक योग',effect:'केंद्रात मंगळ धैर्य देतो.'},'Bhadra':{name:'भद्र योग',effect:'केंद्रात बुध वाक्पटुता देतो.'},'Sasa':{name:'शश योग',effect:'केंद्रात शनी अधिकार देतो.'},'Mangal Dosha':{name:'मंगळ दोष',effect:'मंगळ विवाह भावावर प्रभाव टाकतो.'},'Kaal Sarpa':{name:'काळ सर्प दोष',effect:'सर्व ग्रह राहू-केतू अक्षात.'},'Pitru Dosha':{name:'पितृ दोष',effect:'पूर्वजांचे कार्मिक ऋण संतती प्रभावित करते.'},'Guru Chandal':{name:'गुरू चांडाळ योग',effect:'गुरू-राहू संयोग परंपरागत ज्ञानाला आव्हान देऊ शकतो.'}},
gu:{'Gaja Kesari':{name:'ગજકેસરી યોગ',effect:'ગુરુ-ચંદ્ર સંયોગ જ્ઞાન, ધન અને યશ આપે છે.'},'Budhaditya':{name:'બુધાદિત્ય યોગ',effect:'સૂર્ય-બુધ સંયોગ તીક્ષ્ણ બુદ્ધિ આપે છે.'},'Hamsa':{name:'હંસ યોગ',effect:'કેન્દ્રમાં ગુરુ જ્ઞાન આપે છે.'},'Malavya':{name:'માલવ્ય યોગ',effect:'કેન્દ્રમાં શુક્ર વૈભવ લાવે છે.'},'Ruchaka':{name:'રુચક યોગ',effect:'કેન્દ્રમાં મંગળ સાહસ આપે છે.'},'Bhadra':{name:'ભદ્ર યોગ',effect:'કેન્દ્રમાં બુધ વાક્પટુતા આપે છે.'},'Sasa':{name:'શશ યોગ',effect:'કેન્દ્રમાં શનિ સત્તા આપે છે.'},'Mangal Dosha':{name:'મંગળ દોષ',effect:'મંગળ વિવાહ ભાવને અસર કરે છે.'},'Kaal Sarpa':{name:'કાળ સર્પ દોષ',effect:'બધા ગ્રહ રાહુ-કેતુ અક્ષમાં.'},'Pitru Dosha':{name:'પિતૃ દોષ',effect:'પૂર્વજોનું કાર્મિક ઋણ સંતાનને અસર કરે છે.'},'Guru Chandal':{name:'ગુરુ ચાંડાલ યોગ',effect:'ગુરુ-રાહુ સંયોગ પરંપરાગત જ્ઞાનને પડકારી શકે છે.'}},
bn:{'Gaja Kesari':{name:'গজকেশরী যোগ',effect:'বৃহস্পতি-চন্দ্র সংযোগ জ্ঞান, সম্পদ ও যশ আনে.'},'Budhaditya':{name:'বুধাদিত্য যোগ',effect:'সূর্য-বুধ সংযোগ তীক্ষ্ণ বুদ্ধি দেয়.'},'Hamsa':{name:'হংস যোগ',effect:'কেন্দ্রে বৃহস্পতি জ্ঞান দেয়.'},'Malavya':{name:'মালব্য যোগ',effect:'কেন্দ্রে শুক্র বিলাসিতা আনে.'},'Ruchaka':{name:'রুচক যোগ',effect:'কেন্দ্রে মঙ্গল সাহস দেয়.'},'Bhadra':{name:'ভদ্র যোগ',effect:'কেন্দ্রে বুধ বাকপটুত্ব দেয়.'},'Sasa':{name:'শশ যোগ',effect:'কেন্দ্রে শনি কর্তৃত্ব দেয়.'},'Mangal Dosha':{name:'মঙ্গল দোষ',effect:'মঙ্গল বিবাহ ভাবকে প্রভাবিত করে.'},'Kaal Sarpa':{name:'কাল সর্প দোষ',effect:'সব গ্রহ রাহু-কেতু অক্ষে.'},'Pitru Dosha':{name:'পিতৃ দোষ',effect:'পূর্বপুরুষদের কার্মিক ঋণ সন্তানকে প্রভাবিত করে.'},'Guru Chandal':{name:'গুরু চাণ্ডাল যোগ',effect:'বৃহস্পতি-রাহু সংযোগ প্রথাগত জ্ঞানকে চ্যালেঞ্জ করতে পারে.'}},
ml:{'Gaja Kesari':{name:'ഗജകേസരി യോഗം',effect:'വ്യാഴ-ചന്ദ്ര സംയോഗം ജ്ഞാനം, സമ്പത്ത്, കീർത്തി നൽകുന്നു.'},'Budhaditya':{name:'ബുധാദിത്യ യോഗം',effect:'സൂര്യ-ബുധ സംയോഗം മൂർച്ചയുള്ള ബുദ്ധി നൽകുന്നു.'},'Hamsa':{name:'ഹംസ യോഗം',effect:'കേന്ദ്രത്തിൽ വ്യാഴം ജ്ഞാനം നൽകുന്നു.'},'Malavya':{name:'മാലവ്യ യോഗം',effect:'കേന്ദ്രത്തിൽ ശുക്രൻ ആഡംബരം നൽകുന്നു.'},'Ruchaka':{name:'രുചക യോഗം',effect:'കേന്ദ്രത്തിൽ ചൊവ്വ ധൈര്യം നൽകുന്നു.'},'Bhadra':{name:'ഭദ്ര യോഗം',effect:'കേന്ദ്രത്തിൽ ബുധൻ വാക്ചാതുര്യം നൽകുന്നു.'},'Sasa':{name:'ശശ യോഗം',effect:'കേന്ദ്രത്തിൽ ശനി അധികാരം നൽകുന്നു.'},'Mangal Dosha':{name:'ചൊവ്വ ദോഷം',effect:'ചൊവ്വ വിവാഹ ഭാവത്തെ ബാധിക്കുന്നു.'},'Kaal Sarpa':{name:'കാല സർപ്പ ദോഷം',effect:'എല്ലാ ഗ്രഹങ്ങളും രാഹു-കേതു അക്ഷത്തിൽ.'},'Pitru Dosha':{name:'പിതൃ ദോഷം',effect:'പൂർവ്വികരുടെ കാർമ്മിക ഋണം സന്താനത്തെ ബാധിക്കുന്നു.'},'Guru Chandal':{name:'ഗുരു ചാണ്ഡാല യോഗം',effect:'വ്യാഴ-രാഹു സംയോഗം പരമ്പരാഗത ജ്ഞാനത്തെ വെല്ലുവിളിക്കാം.'}}
};

const L_VDESC={
en:{D1:'Rashi·Self',D2:'Hora·Wealth',D3:'Drekkana·Siblings',D4:'Chaturthamsha·Fortune',D7:'Saptamsa·Children',D9:'Navamsa·Dharma',D10:'Dasamsa·Career',D12:'Dwadashamsa·Parents',D16:'Shodashamsa·Vehicles',D20:'Vimshamsa·Spiritual',D24:'Chaturvimshamsa·Education',D27:'Saptavimshamsa·Strength',D30:'Trishamsa·Evils',D40:'Khavedamsa·Maternal',D45:'Akshavedamsa·Paternal',D60:'Shashtiamsa·Past Life'},
hi:{D1:'राशि·स्व',D2:'होरा·धन',D3:'द्रेक्काण·भाई-बहन',D4:'चतुर्थांश·भाग्य',D7:'सप्तांश·संतान',D9:'नवांश·धर्म',D10:'दशांश·कर्म',D12:'द्वादशांश·माता-पिता',D16:'षोडशांश·वाहन',D20:'विंशांश·आध्यात्मिक',D24:'चतुर्विंशांश·शिक्षा',D27:'सप्तविंशांश·बल',D30:'त्रिंशांश·अनिष्ट',D40:'खवेदांश·मातृ',D45:'अक्षवेदांश·पितृ',D60:'षष्ट्यंश·पूर्वजन्म'},
kn:{D1:'ರಾಶಿ·ಸ್ವ',D2:'ಹೋರಾ·ಧನ',D3:'ದ್ರೇಕ್ಕಾಣ·ಸಹೋದರ',D4:'ಚತುರ್ಥಾಂಶ·ಭಾಗ್ಯ',D7:'ಸಪ್ತಾಂಶ·ಮಕ್ಕಳು',D9:'ನವಾಂಶ·ಧರ್ಮ',D10:'ದಶಾಂಶ·ವೃತ್ತಿ',D12:'ದ್ವಾದಶಾಂಶ·ಹೆತ್ತವರು',D16:'ಷೋಡಶಾಂಶ·ವಾಹನ',D20:'ವಿಂಶಾಂಶ·ಆಧ್ಯಾತ್ಮಿಕ',D24:'ಚತುರ್ವಿಂಶಾಂಶ·ಶಿಕ್ಷಣ',D27:'ಸಪ್ತವಿಂಶಾಂಶ·ಶಕ್ತಿ',D30:'ತ್ರಿಂಶಾಂಶ·ಅನಿಷ್ಟ',D40:'ಖವೇದಾಂಶ·ಮಾತೃ',D45:'ಅಕ್ಷವೇದಾಂಶ·ಪಿತೃ',D60:'ಷಷ್ಟ್ಯಂಶ·ಪೂರ್ವಜನ್ಮ'},
te:{D1:'రాశి·ఆత్మ',D2:'హోరా·ధనం',D3:'ద్రేక్కాణ·సోదరులు',D4:'చతుర్థాంశ·భాగ్యం',D7:'సప్తాంశ·సంతానం',D9:'నవాంశ·ధర్మం',D10:'దశాంశ·వృత్తి',D12:'ద్వాదశాంశ·తల్లిదండ్రులు',D16:'షోడశాంశ·వాహనం',D20:'విమ్శాంశ·ఆధ్యాత్మిక',D24:'చతుర్విమ్శాంశ·విద్య',D27:'సప్తవిమ్శాంశ·బలం',D30:'త్రిమ్శాంశ·అనిష్టం',D40:'ఖవేదాంశ·మాతృ',D45:'అక్షవేదాంశ·పితృ',D60:'షష్ట్యంశ·పూర్వజన్మ'},
ta:{D1:'ராசி·சுயம்',D2:'ஹோரா·செல்வம்',D3:'த்ரேக்காணம்·உடன்பிறப்பு',D4:'சதுர்த்தாம்சம்·பாக்கியம்',D7:'சப்தாம்சம்·குழந்தைகள்',D9:'நவாம்சம்·தர்மம்',D10:'தசாம்சம்·தொழில்',D12:'த்வாதசாம்சம்·பெற்றோர்',D16:'ஷோடசாம்சம்·வாகனம்',D20:'விம்சாம்சம்·ஆன்மீகம்',D24:'சதுர்விம்சாம்சம்·கல்வி',D27:'சப்தவிம்சாம்சம்·பலம்',D30:'த்ரிம்சாம்சம்·தீமை',D40:'கவேதாம்சம்·தாய்வழி',D45:'அக்ஷவேதாம்சம்·தந்தைவழி',D60:'ஷஷ்டியாம்சம்·முற்பிறவி'},
sa:{D1:'राशिः·आत्मा',D2:'होरा·धनम्',D3:'द्रेक्काणम्·भ्रातरः',D4:'चतुर्थांशः·भाग्यम्',D7:'सप्तांशः·सन्तानम्',D9:'नवांशः·धर्मः',D10:'दशांशः·कर्म',D12:'द्वादशांशः·पितरौ',D16:'षोडशांशः·वाहनम्',D20:'विंशांशः·आध्यात्मिकम्',D24:'चतुर्विंशांशः·शिक्षा',D27:'सप्तविंशांशः·बलम्',D30:'त्रिंशांशः·अनिष्टम्',D40:'खवेदांशः·मातृ',D45:'अक्षवेदांशः·पितृ',D60:'षष्ट्यंशः·पूर्वजन्म'},
mr:{D1:'राशी·स्व',D2:'होरा·धन',D3:'द्रेक्काण·भावंडे',D4:'चतुर्थांश·भाग्य',D7:'सप्तांश·संतती',D9:'नवांश·धर्म',D10:'दशांश·कर्म',D12:'द्वादशांश·आई-वडील',D16:'षोडशांश·वाहन',D20:'विंशांश·आध्यात्मिक',D24:'चतुर्विंशांश·शिक्षण',D27:'सप्तविंशांश·बल',D30:'त्रिंशांश·अनिष्ट',D40:'खवेदांश·मातृ',D45:'अक्षवेदांश·पितृ',D60:'षष्ट्यंश·पूर्वजन्म'},
gu:{D1:'રાશિ·સ્વ',D2:'હોરા·ધન',D3:'દ્રેક્કાણ·ભાઈ-બહેન',D4:'ચતુર્થાંશ·ભાગ્ય',D7:'સપ્તાંશ·સંતાન',D9:'નવાંશ·ધર્મ',D10:'દશાંશ·કર્મ',D12:'દ્વાદશાંશ·માતા-પિતા',D16:'ષોડશાંશ·વાહન',D20:'વિંશાંશ·આધ્યાત્મિક',D24:'ચતુર્વિંશાંશ·શિક્ષણ',D27:'સપ્તવિંશાંશ·બળ',D30:'ત્રિંશાંશ·અનિષ્ટ',D40:'ખવેદાંશ·માતૃ',D45:'અક્ષવેદાંશ·પિતૃ',D60:'ષષ્ટ્યંશ·પૂર્વજન્મ'},
bn:{D1:'রাশি·আত্মা',D2:'হোরা·ধন',D3:'দ্রেক্কাণ·ভাইবোন',D4:'চতুর্থাংশ·ভাগ্য',D7:'সপ্তাংশ·সন্তান',D9:'নবাংশ·ধর্ম',D10:'দশাংশ·কর্ম',D12:'দ্বাদশাংশ·পিতামাতা',D16:'ষোড়শাংশ·যানবাহন',D20:'বিংশাংশ·আধ্যাত্মিক',D24:'চতুর্বিংশাংশ·শিক্ষা',D27:'সপ্তবিংশাংশ·বল',D30:'ত্রিংশাংশ·অনিষ্ট',D40:'খবেদাংশ·মাতৃ',D45:'অক্ষবেদাংশ·পিতৃ',D60:'ষষ্ট্যংশ·পূর্বজন্ম'},
ml:{D1:'രാശി·ആത്മാവ്',D2:'ഹോര·ധനം',D3:'ദ്രേക്കാണം·സഹോദരൻ',D4:'ചതുർത്ഥാംശം·ഭാഗ്യം',D7:'സപ്താംശം·മക്കൾ',D9:'നവാംശം·ധർമ്മം',D10:'ദശാംശം·തൊഴിൽ',D12:'ദ്വാദശാംശം·മാതാപിതാക്കൾ',D16:'ഷോഡശാംശം·വാഹനം',D20:'വിംശാംശം·ആത്മീയം',D24:'ചതുർവിംശാംശം·വിദ്യ',D27:'സപ്തവിംശാംശം·ബലം',D30:'ത്രിംശാംശം·അനിഷ്ടം',D40:'ഖവേദാംശം·മാതൃ',D45:'അക്ഷവേദാംശം·പിതൃ',D60:'ഷഷ്ട്യംശം·പൂർവ്വജന്മം'}
};

const L_HNAMES={
en:['Tanu','Dhana','Sahaja','Matru','Putra','Shatru','Kalatra','Mrityu','Dharma','Karma','Labha','Vyaya'],
hi:['तनु','धन','सहज','मातृ','पुत्र','शत्रु','कलत्र','मृत्यु','धर्म','कर्म','लाभ','व्यय'],
kn:['ತನು','ಧನ','ಸಹಜ','ಮಾತೃ','ಪುತ್ರ','ಶತ್ರು','ಕಲತ್ರ','ಮೃತ್ಯು','ಧರ್ಮ','ಕರ್ಮ','ಲಾಭ','ವ್ಯಯ'],
te:['తను','ధన','సహజ','మాతృ','పుత్ర','శత్రు','కళత్ర','మృత్యు','ధర్మ','కర్మ','లాభ','వ్యయ'],
ta:['தனு','தனம்','சகஜம்','மாத்ரு','புத்ர','சத்ரு','களத்ர','ம்ருத்யு','தர்மம்','கர்மம்','லாபம்','வ்யயம்'],
sa:['तनुः','धनम्','सहजम्','मातृ','पुत्रम्','शत्रुः','कलत्रम्','मृत्युः','धर्मः','कर्म','लाभः','व्ययः'],
mr:['तनू','धन','सहज','मातृ','पुत्र','शत्रू','कलत्र','मृत्यू','धर्म','कर्म','लाभ','व्यय'],
gu:['તનુ','ધન','સહજ','માતૃ','પુત્ર','શત્રુ','કળત્ર','મૃત્યુ','ધર્મ','કર્મ','લાભ','વ્યય'],
bn:['তনু','ধন','সহজ','মাতৃ','পুত্র','শত্রু','কলত্র','মৃত্যু','ধর্ম','কর্ম','লাভ','ব্যয়'],
ml:['തനു','ധനം','സഹജം','മാതൃ','പുത്ര','ശത്രു','കളത്ര','മൃത്യു','ധർമ്മം','കർമ്മം','ലാഭം','വ്യയം']
};

const L_TITHI={
en:['Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami','Shashthi','Saptami','Ashtami','Navami','Dashami','Ekadashi','Dwadashi','Trayodashi','Chaturdashi','Purnima'],
hi:['प्रतिपदा','द्वितीया','तृतीया','चतुर्थी','पंचमी','षष्ठी','सप्तमी','अष्टमी','नवमी','दशमी','एकादशी','द्वादशी','त्रयोदशी','चतुर्दशी','पूर्णिमा'],
kn:['ಪ್ರತಿಪದ','ದ್ವಿತೀಯ','ತೃತೀಯ','ಚತುರ್ಥಿ','ಪಂಚಮಿ','ಷಷ್ಠಿ','ಸಪ್ತಮಿ','ಅಷ್ಟಮಿ','ನವಮಿ','ದಶಮಿ','ಏಕಾದಶಿ','ದ್ವಾದಶಿ','ತ್ರಯೋದಶಿ','ಚತುರ್ದಶಿ','ಪೂರ್ಣಿಮಾ'],
te:['ప్రతిపద','ద్వితీయ','తృతీయ','చతుర్థి','పంచమి','షష్ఠి','సప్తమి','అష్టమి','నవమి','దశమి','ఏకాదశి','ద్వాదశి','త్రయోదశి','చతుర్దశి','పూర్ణిమ'],
ta:['பிரதமை','துவிதியை','திருதியை','சதுர்த்தி','பஞ்சமி','சஷ்டி','சப்தமி','அஷ்டமி','நவமி','தசமி','ஏகாதசி','துவாதசி','திரயோதசி','சதுர்த்தசி','பௌர்ணமி'],
sa:['प्रतिपदा','द्वितीया','तृतीया','चतुर्थी','पञ्चमी','षष्ठी','सप्तमी','अष्टमी','नवमी','दशमी','एकादशी','द्वादशी','त्रयोदशी','चतुर्दशी','पूर्णिमा'],
mr:['प्रतिपदा','द्वितीया','तृतीया','चतुर्थी','पंचमी','षष्ठी','सप्तमी','अष्टमी','नवमी','दशमी','एकादशी','द्वादशी','त्रयोदशी','चतुर्दशी','पौर्णिमा'],
gu:['પ્રતિપદા','દ્વિતીયા','તૃતીયા','ચતુર્થી','પંચમી','ષષ્ઠી','સપ્તમી','અષ્ટમી','નવમી','દશમી','એકાદશી','દ્વાદશી','ત્રયોદશી','ચતુર્દશી','પૂર્ણિમા'],
bn:['প্রতিপদা','দ্বিতীয়া','তৃতীয়া','চতুর্থী','পঞ্চমী','ষষ্ঠী','সপ্তমী','অষ্টমী','নবমী','দশমী','একাদশী','দ্বাদশী','ত্রয়োদশী','চতুর্দশী','পূর্ণিমা'],
ml:['പ്രതിപദ','ദ്വിതീയ','തൃതീയ','ചതുർത്ഥി','പഞ്ചമി','ഷഷ്ഠി','സപ്തമി','അഷ്ടമി','നവമി','ദശമി','ഏകാദശി','ദ്വാദശി','ത്രയോദശി','ചതുർദശി','പൗർണ്ണമി']
};

const L_VARA={
en:['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
hi:['रविवार','सोमवार','मंगलवार','बुधवार','गुरुवार','शुक्रवार','शनिवार'],
kn:['ಭಾನುವಾರ','ಸೋಮವಾರ','ಮಂಗಳವಾರ','ಬುಧವಾರ','ಗುರುವಾರ','ಶುಕ್ರವಾರ','ಶನಿವಾರ'],
te:['ఆదివారం','సోమవారం','మంగళవారం','బుధవారం','గురువారం','శుక్రవారం','శనివారం'],
ta:['ஞாயிறு','திங்கள்','செவ்வாய்','புதன்','வியாழன்','வெள்ளி','சனி'],
sa:['रविवासरः','सोमवासरः','मङ्गलवासरः','बुधवासरः','गुरुवासरः','शुक्रवासरः','शनिवासरः'],
mr:['रविवार','सोमवार','मंगळवार','बुधवार','गुरुवार','शुक्रवार','शनिवार'],
gu:['રવિવાર','સોમવાર','મંગળવાર','બુધવાર','ગુરુવાર','શુક્રવાર','શનિવાર'],
bn:['রবিবার','সোমবার','মঙ্গলবার','বুধবার','বৃহস্পতিবার','শুক্রবার','শনিবার'],
ml:['ഞായറാഴ്ച','തിങ്കളാഴ്ച','ചൊവ്വാഴ്ച','ബുധനാഴ്ച','വ്യാഴാഴ്ച','വെള്ളിയാഴ്ച','ശനിയാഴ്ച']
};

const L_PAKSHA={
en:{wax:'Shukla Paksha',wan:'Krishna Paksha'},
hi:{wax:'शुक्ल पक्ष',wan:'कृष्ण पक्ष'},
kn:{wax:'ಶುಕ್ಲ ಪಕ್ಷ',wan:'ಕೃಷ್ಣ ಪಕ್ಷ'},
te:{wax:'శుక్ల పక్షం',wan:'కృష్ణ పక్షం'},
ta:{wax:'சுக்ல பட்சம்',wan:'கிருஷ்ண பட்சம்'},
sa:{wax:'शुक्लपक्षः',wan:'कृष्णपक्षः'},
mr:{wax:'शुक्ल पक्ष',wan:'कृष्ण पक्ष'},
gu:{wax:'શુક્લ પક્ષ',wan:'કૃષ્ણ પક્ષ'},
bn:{wax:'শুক্ল পক্ষ',wan:'কৃষ্ণ পক্ষ'},
ml:{wax:'ശുക്ല പക്ഷം',wan:'കൃഷ്ണ പക്ഷം'}
};

const L_YOGA_PANCH={
en:['Vishkambha','Priti','Ayushman','Saubhagya','Shobhana','Atiganda','Sukarma','Dhriti','Shula','Ganda','Vriddhi','Dhruva','Vyaghata','Harshana','Vajra','Siddhi','Vyatipata','Variyana','Parigha','Shiva','Siddha','Sadhya','Shubha','Shukla','Brahma','Indra','Vaidhriti'],
hi:['विष्कम्भ','प्रीति','आयुष्मान','सौभाग्य','शोभन','अतिगण्ड','सुकर्म','धृति','शूल','गण्ड','वृद्धि','ध्रुव','व्याघात','हर्षण','वज्र','सिद्धि','व्यतिपात','वरीयान','परिघ','शिव','सिद्ध','साध्य','शुभ','शुक्ल','ब्रह्म','इन्द्र','वैधृति'],
kn:['ವಿಷ್ಕಂಭ','ಪ್ರೀತಿ','ಆಯುಷ್ಮಾನ್','ಸೌಭಾಗ್ಯ','ಶೋಭನ','ಅತಿಗಂಡ','ಸುಕರ್ಮ','ಧೃತಿ','ಶೂಲ','ಗಂಡ','ವೃದ್ಧಿ','ಧ್ರುವ','ವ್ಯಾಘಾತ','ಹರ್ಷಣ','ವಜ್ರ','ಸಿದ್ಧಿ','ವ್ಯತಿಪಾತ','ವರೀಯಾನ','ಪರಿಘ','ಶಿವ','ಸಿದ್ಧ','ಸಾಧ್ಯ','ಶುಭ','ಶುಕ್ಲ','ಬ್ರಹ್ಮ','ಇಂದ್ರ','ವೈಧೃತಿ'],
te:['విష్కంభ','ప్రీతి','ఆయుష్మాన్','సౌభాగ్య','శోభన','అతిగండ','సుకర్మ','ధృతి','శూల','గండ','వృద్ధి','ధ్రువ','వ్యాఘాత','హర్షణ','వజ్ర','సిద్ధి','వ్యతిపాత','వరీయాన','పరిఘ','శివ','సిద్ధ','సాధ్య','శుభ','శుక్ల','బ్రహ్మ','ఇంద్ర','వైధృతి'],
ta:['விஷ்கம்பம்','பிரீதி','ஆயுஷ்மான்','சௌபாக்கியம்','சோபனம்','அதிகண்டம்','சுகர்மா','திருதி','சூலம்','கண்டம்','விருத்தி','துருவம்','வியாகாதம்','அர்ஷணம்','வஜ்ரம்','சித்தி','வியதிபாதம்','வரீயான்','பரிகம்','சிவன்','சித்தம்','சாத்தியம்','சுபம்','சுக்லம்','பிரம்மா','இந்திரன்','வைத்ருதி'],
sa:['विष्कम्भः','प्रीतिः','आयुष्मान्','सौभाग्यम्','शोभनम्','अतिगण्डः','सुकर्म','धृतिः','शूलम्','गण्डः','वृद्धिः','ध्रुवः','व्याघातः','हर्षणम्','वज्रम्','सिद्धिः','व्यतिपातः','वरीयान्','परिघः','शिवः','सिद्धः','साध्यः','शुभः','शुक्लः','ब्रह्मा','इन्द्रः','वैधृतिः'],
mr:['विष्कंभ','प्रीती','आयुष्मान','सौभाग्य','शोभन','अतिगंड','सुकर्म','धृती','शूल','गंड','वृद्धी','ध्रुव','व्याघात','हर्षण','वज्र','सिद्धी','व्यतिपात','वरीयान','परिघ','शिव','सिद्ध','साध्य','शुभ','शुक्ल','ब्रह्मा','इंद्र','वैधृती'],
gu:['વિષ્કંભ','પ્રીતિ','આયુષ્માન','સૌભાગ્ય','શોભન','અતિગંડ','સુકર્મ','ધૃતિ','શૂલ','ગંડ','વૃદ્ધિ','ધ્રુવ','વ્યાઘાત','હર્ષણ','વજ્ર','સિદ્ધિ','વ્યતિપાત','વરીયાન','પરિઘ','શિવ','સિદ્ધ','સાધ્ય','શુભ','શુક્લ','બ્રહ્મા','ઇન્દ્ર','વૈધૃતિ'],
bn:['বিষ্কম্ভ','প্রীতি','আয়ুষ্মান','সৌভাগ্য','শোভন','অতিগণ্ড','সুকর্ম','ধৃতি','শূল','গণ্ড','বৃদ্ধি','ধ্রুব','ব্যাঘাত','হর্ষণ','বজ্র','সিদ্ধি','ব্যতিপাত','বরীয়ান','পরিঘ','শিব','সিদ্ধ','সাধ্য','শুভ','শুক্ল','ব্রহ্মা','ইন্দ্র','বৈধৃতি'],
ml:['വിഷ്കംഭം','പ്രീതി','ആയുഷ്മാൻ','സൗഭാഗ്യം','ശോഭനം','അതിഗണ്ഡം','സുകർമ്മ','ധൃതി','ശൂലം','ഗണ്ഡം','വൃദ്ധി','ധ്രുവം','വ്യാഘാതം','ഹർഷണം','വജ്രം','സിദ്ധി','വ്യതിപാതം','വരീയാൻ','പരിഘം','ശിവൻ','സിദ്ധം','സാധ്യം','ശുഭം','ശുക്ലം','ബ്രഹ്മാവ്','ഇന്ദ്രൻ','വൈധൃതി']
};

const L_KARANA={
en:['Bava','Balava','Kaulava','Taitila','Garaja','Vanija','Vishti','Shakuni','Chatushpada','Naga','Kimstughna'],
hi:['बव','बालव','कौलव','तैतिल','गरज','वणिज','विष्टि','शकुनि','चतुष्पद','नाग','किंस्तुघ्न'],
kn:['ಬವ','ಬಾಲವ','ಕೌಲವ','ತೈತಿಲ','ಗರಜ','ವಣಿಜ','ವಿಷ್ಟಿ','ಶಕುನಿ','ಚತುಷ್ಪದ','ನಾಗ','ಕಿಂಸ್ತುಘ್ನ'],
te:['బవ','బాలవ','కౌలవ','తైతిల','గరజ','వణిజ','విష్టి','శకుని','చతుష్పద','నాగ','కింస్తుఘ్న'],
ta:['பவம்','பாலவம்','கௌலவம்','தைதிலம்','கரஜம்','வணிஜம்','விஷ்டி','சகுனி','சதுஷ்பதம்','நாகம்','கிம்ஸ்துக்னம்'],
sa:['बवः','बालवः','कौलवः','तैतिलः','गरजः','वणिजः','विष्टिः','शकुनिः','चतुष्पदः','नागः','किंस्तुघ्नः'],
mr:['बव','बालव','कौलव','तैतिल','गरज','वणिज','विष्टी','शकुनी','चतुष्पद','नाग','किंस्तुघ्न'],
gu:['બવ','બાલવ','કૌલવ','તૈતિલ','ગરજ','વણિજ','વિષ્ટિ','શકુની','ચતુષ્પદ','નાગ','કિંસ્તુઘ્ન'],
bn:['বব','বালব','কৌলব','তৈতিল','গরজ','বণিজ','বিষ্টি','শকুনি','চতুষ্পদ','নাগ','কিংস্তুঘ্ন'],
ml:['ബവ','ബാലവ','കൗലവ','തൈതില','ഗരജ','വണിജ','വിഷ്ടി','ശകുനി','ചതുഷ്പദ','നാഗ','കിംസ്തുഘ്ന']
};

const L_READING={
en:{
chandra:(naks,rashi,exalt,retro)=>`The Moon placed in ${naks} Nakshatra (${rashi}) reflects the native's inner emotional landscape, instinctive responses, and relationship with the mother principle. ${exalt?'With Moon exalted, emotional intelligence and empathy are heightened, often blessing the native with popularity and a caring disposition.':retro?'The retrograde Moon suggests deep, introspective emotional processing \u2014 the native may appear outwardly calm while experiencing rich inner worlds.':'The Moon\'s placement blesses the native with '+naks+'\'s characteristic qualities of devotion, perception, and emotional strength.'}`,
artha:(planet,yogaText)=>`${planet==='jupiter'?'Jupiter\'s strength indicates a natural path toward teaching, counseling, law, or spiritual guidance.':planet==='mercury'?'Mercury\'s prominence suggests excellence in technology, writing, commerce, or communications.':planet==='saturn'?'Saturn\'s strength points toward sustained success through engineering, administration, or disciplined service professions.':'Career potential unfolds through consistent effort and application of natural talents.'} ${yogaText}`,
yogaRaja:(names)=>`The chart carries ${names} \u2014 powerful combinations that elevate potential for achievement and recognition.`,
yogaNone:()=>'The chart\'s inherent strengths will express gradually through consistent, purposeful effort.',
kama:(hasMangal,venusExalt)=>hasMangal?'Mangal Dosha is present in this chart. Careful partner selection is essential \u2014 matching with another Manglik native and performing Mangal Shanti Puja before marriage is strongly recommended.':'The 7th house configuration suggests a relationship built on mutual respect and shared values. Venus\'s position indicates '+(venusExalt?'an exceptionally devoted and cultured partner, with great marital happiness.':'good prospects for a harmonious marital life.'),
dashaPhala:(graha,desc,antarGraha,antarDesc,endStr)=>`The running ${graha} Mahadasha is a period of ${desc||'significant personal evolution.'} ${antarGraha?'The '+antarGraha+' Antardasha further adds themes of '+(antarDesc||'inner growth.')+' ':''} This period runs until ${endStr} \u2014 use this time intentionally to align actions with the planetary energies in play.`,
moksha:(jupInDharma)=>jupInDharma?'Jupiter\'s placement in a Dharmic/Moksha house indicates a soul deeply oriented toward spiritual evolution. Vedantic study and Seva (service) are natural paths.':'The chart indicates a gradual unfolding of spiritual awareness. Bhakti (devotion), Karma Yoga, and regular Sadhana are the recommended paths for this native\'s growth.',
running:'Running',antardasha:'Antardasha'
},
hi:{
chandra:(naks,rashi,exalt,retro)=>`चन्द्रमा ${naks} नक्षत्र (${rashi}) में स्थित होकर जातक के आंतरिक भावनात्मक परिदृश्य, सहज प्रतिक्रियाओं और मातृ-सिद्धांत से संबंध को दर्शाता है। ${exalt?'चन्द्रमा उच्च राशि में होने से भावनात्मक बुद्धि और सहानुभूति बढ़ जाती है, जो अक्सर जातक को लोकप्रियता और दयालु स्वभाव का आशीर्वाद देती है।':retro?'वक्री चन्द्रमा गहरी, आत्मनिरीक्षक भावनात्मक प्रसंस्करण का संकेत करता है \u2014 जातक बाहरी रूप से शांत दिख सकता है परन्तु आंतरिक जगत समृद्ध होता है।':'चन्द्रमा की यह स्थिति जातक को '+naks+' की विशिष्ट गुणवत्ता \u2014 भक्ति, अंतर्दृष्टि और भावनात्मक शक्ति प्रदान करती है।'}`,
artha:(planet,yogaText)=>`${planet==='jupiter'?'गुरु की शक्ति शिक्षण, परामर्श, कानून या आध्यात्मिक मार्गदर्शन की ओर स्वाभाविक पथ दर्शाती है।':planet==='mercury'?'बुध की प्रमुखता प्रौद्योगिकी, लेखन, वाणिज्य या संचार में उत्कृष्टता का संकेत देती है।':planet==='saturn'?'शनि की शक्ति इंजीनियरिंग, प्रशासन या अनुशासित सेवा व्यवसायों में निरंतर सफलता की ओर इशारा करती है।':'व्यावसायिक क्षमता निरंतर प्रयास और प्राकृतिक प्रतिभाओं के अनुप्रयोग से प्रकट होती है।'} ${yogaText}`,
yogaRaja:(names)=>`कुंडली में ${names} मौजूद हैं \u2014 शक्तिशाली संयोजन जो उपलब्धि और मान्यता की संभावना को बढ़ाते हैं।`,
yogaNone:()=>'कुंडली की अंतर्निहित शक्तियाँ निरंतर, उद्देश्यपूर्ण प्रयास से क्रमशः प्रकट होंगी।',
kama:(hasMangal,venusExalt)=>hasMangal?'इस कुंडली में मंगल दोष उपस्थित है। साथी चयन में सावधानी आवश्यक है \u2014 अन्य मांगलिक जातक के साथ मिलान और विवाह से पूर्व मंगल शांति पूजा की दृढ़ता से अनुशंसा की जाती है।':'सप्तम भाव की स्थिति पारस्परिक सम्मान और साझा मूल्यों पर निर्मित संबंध का संकेत देती है। शुक्र की स्थिति '+(venusExalt?'एक अत्यंत समर्पित और सुसंस्कृत साथी का संकेत देती है, जिससे वैवाहिक सुख अधिक होता है।':'सामंजस्यपूर्ण वैवाहिक जीवन की शुभ संभावनाएँ दर्शाती है।'),
dashaPhala:(graha,desc,antarGraha,antarDesc,endStr)=>`वर्तमान ${graha} महादशा ${desc||'महत्वपूर्ण व्यक्तिगत विकास'} का काल है। ${antarGraha?antarGraha+' अंतर्दशा '+( antarDesc||'आंतरिक विकास')+' के विषय जोड़ती है। ':''} यह अवधि ${endStr} तक चलती है \u2014 ग्रहीय ऊर्जाओं के अनुरूप कार्य करें।`,
moksha:(jupInDharma)=>jupInDharma?'गुरु की धर्म/मोक्ष भाव में स्थिति आत्मा की आध्यात्मिक विकास की गहरी उन्मुखता दर्शाती है। वेदांत अध्ययन और सेवा स्वाभाविक मार्ग हैं।':'कुंडली आध्यात्मिक जागरूकता के क्रमिक विकास का संकेत देती है। भक्ति, कर्म योग और नियमित साधना इस जातक की वृद्धि के अनुशंसित मार्ग हैं।',
running:'चालू',antardasha:'अंतर्दशा'
},
kn:{
chandra:(naks,rashi,exalt,retro)=>`ಚಂದ್ರನು ${naks} ನಕ್ಷತ್ರದಲ್ಲಿ (${rashi}) ಇದ್ದು ಜಾತಕನ ಆಂತರಿಕ ಭಾವನಾತ್ಮಕ ಸ್ವರೂಪ, ಸಹಜ ಪ್ರತಿಕ್ರಿಯೆಗಳು ಮತ್ತು ಮಾತೃ-ತತ್ವದೊಂದಿಗಿನ ಸಂಬಂಧವನ್ನು ಪ್ರತಿಬಿಂಬಿಸುತ್ತಾನೆ. ${exalt?'ಚಂದ್ರನು ಉಚ್ಚ ರಾಶಿಯಲ್ಲಿದ್ದು ಭಾವನಾತ್ಮಕ ಬುದ್ಧಿಮತ್ತೆ ಮತ್ತು ಸಹಾನುಭೂತಿಯನ್ನು ಹೆಚ್ಚಿಸುತ್ತಾನೆ.':retro?'ವಕ್ರ ಚಂದ್ರನು ಆಳವಾದ, ಆತ್ಮಾವಲೋಕನ ಭಾವನಾತ್ಮಕ ಪ್ರಕ್ರಿಯೆಯನ್ನು ಸೂಚಿಸುತ್ತಾನೆ.':'ಚಂದ್ರನ ಸ್ಥಾನವು ಜಾತಕನಿಗೆ '+naks+' ನಕ್ಷತ್ರದ ಭಕ್ತಿ, ಗ್ರಹಿಕೆ ಮತ್ತು ಭಾವನಾತ್ಮಕ ಶಕ್ತಿಯ ಗುಣಗಳನ್ನು ನೀಡುತ್ತದೆ.'}`,
artha:(planet,yogaText)=>`${planet==='jupiter'?'ಗುರುವಿನ ಶಕ್ತಿಯು ಶಿಕ್ಷಣ, ಸಲಹೆ, ಕಾನೂನು ಅಥವಾ ಆಧ್ಯಾತ್ಮಿಕ ಮಾರ್ಗದರ್ಶನದ ಕಡೆಗೆ ಸ್ವಾಭಾವಿಕ ಹಾದಿಯನ್ನು ಸೂಚಿಸುತ್ತದೆ.':planet==='mercury'?'ಬುಧನ ಪ್ರಾಮುಖ್ಯತೆಯು ತಂತ್ರಜ್ಞಾನ, ಬರವಣಿಗೆ, ವಾಣಿಜ್ಯ ಅಥವಾ ಸಂವಹನದಲ್ಲಿ ಶ್ರೇಷ್ಠತೆಯನ್ನು ಸೂಚಿಸುತ್ತದೆ.':planet==='saturn'?'ಶನಿಯ ಶಕ್ತಿಯು ಎಂಜಿನಿಯರಿಂಗ್, ಆಡಳಿತ ಅಥವಾ ಶಿಸ್ತುಬದ್ಧ ಸೇವಾ ವೃತ್ತಿಗಳಲ್ಲಿ ನಿರಂತರ ಯಶಸ್ಸನ್ನು ಸೂಚಿಸುತ್ತದೆ.':'ವೃತ್ತಿಪರ ಸಾಮರ್ಥ್ಯವು ನಿರಂತರ ಪ್ರಯತ್ನ ಮತ್ತು ಸ್ವಾಭಾವಿಕ ಪ್ರತಿಭೆಗಳ ಅನ್ವಯದಿಂದ ಬೆಳೆಯುತ್ತದೆ.'} ${yogaText}`,
yogaRaja:(names)=>`ಕುಂಡಲಿಯಲ್ಲಿ ${names} ಇವೆ \u2014 ಸಾಧನೆ ಮತ್ತು ಮನ್ನಣೆಯ ಸಾಮರ್ಥ್ಯವನ್ನು ಹೆಚ್ಚಿಸುವ ಶಕ್ತಿಶಾಲಿ ಸಂಯೋಜನೆಗಳು.`,
yogaNone:()=>'ಕುಂಡಲಿಯ ಅಂತರ್ಗತ ಶಕ್ತಿಗಳು ನಿರಂತರ, ಉದ್ದೇಶಪೂರ್ವಕ ಪ್ರಯತ್ನದಿಂದ ಕ್ರಮೇಣ ವ್ಯಕ್ತವಾಗುತ್ತವೆ.',
kama:(hasMangal,venusExalt)=>hasMangal?'ಈ ಕುಂಡಲಿಯಲ್ಲಿ ಮಂಗಲ ದೋಷವಿದೆ. ಸಂಗಾತಿ ಆಯ್ಕೆಯಲ್ಲಿ ಎಚ್ಚರಿಕೆ ಅಗತ್ಯ \u2014 ಇನ್ನೊಬ್ಬ ಮಾಂಗಲಿಕ ಜಾತಕರೊಂದಿಗೆ ಹೊಂದಾಣಿಕೆ ಮತ್ತು ವಿವಾಹಕ್ಕೆ ಮುಂಚೆ ಮಂಗಲ ಶಾಂತಿ ಪೂಜೆ ಮಾಡಲು ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ.':'ಸಪ್ತಮ ಭಾವದ ಸ್ಥಿತಿಯು ಪರಸ್ಪರ ಗೌರವ ಮತ್ತು ಹಂಚಿಕೆಯ ಮೌಲ್ಯಗಳ ಮೇಲೆ ನಿರ್ಮಿತ ಸಂಬಂಧವನ್ನು ಸೂಚಿಸುತ್ತದೆ. ಶುಕ್ರನ ಸ್ಥಾನವು '+(venusExalt?'ಅತ್ಯಂತ ಸಮರ್ಪಿತ ಮತ್ತು ಸುಸಂಸ್ಕೃತ ಸಂಗಾತಿಯನ್ನು ಸೂಚಿಸುತ್ತದೆ.':'ಸಾಮರಸ್ಯಪೂರ್ಣ ವೈವಾಹಿಕ ಜೀವನದ ಒಳ್ಳೆಯ ಸಂಭಾವನೆಗಳನ್ನು ಸೂಚಿಸುತ್ತದೆ.'),
dashaPhala:(graha,desc,antarGraha,antarDesc,endStr)=>`ಪ್ರಸ್ತುತ ${graha} ಮಹಾದಶೆಯು ${desc||'ಮಹತ್ವಪೂರ್ಣ ವೈಯಕ್ತಿಕ ವಿಕಾಸ'}ದ ಅವಧಿಯಾಗಿದೆ. ${antarGraha?antarGraha+' ಅಂತರ್ದಶೆಯು '+(antarDesc||'ಆಂತರಿಕ ಬೆಳವಣಿಗೆ')+'ಯ ವಿಷಯಗಳನ್ನು ಸೇರಿಸುತ್ತದೆ. ':''} ಈ ಅವಧಿ ${endStr} ವರೆಗೆ ನಡೆಯುತ್ತದೆ \u2014 ಗ್ರಹ ಶಕ್ತಿಗಳಿಗೆ ಅನುಗುಣವಾಗಿ ಕಾರ್ಯನಿರ್ವಹಿಸಿ.`,
moksha:(jupInDharma)=>jupInDharma?'ಗುರುವಿನ ಧರ್ಮ/ಮೋಕ್ಷ ಭಾವದಲ್ಲಿನ ಸ್ಥಾನವು ಆಧ್ಯಾತ್ಮಿಕ ವಿಕಾಸದ ಕಡೆಗೆ ಆಳವಾಗಿ ಒಲವು ಹೊಂದಿರುವ ಆತ್ಮವನ್ನು ಸೂಚಿಸುತ್ತದೆ. ವೇದಾಂತ ಅಧ್ಯಯನ ಮತ್ತು ಸೇವೆ ಸ್ವಾಭಾವಿಕ ಮಾರ್ಗಗಳಾಗಿವೆ.':'ಕುಂಡಲಿಯು ಆಧ್ಯಾತ್ಮಿಕ ಜಾಗೃತಿಯ ಕ್ರಮೇಣ ಬೆಳವಣಿಗೆಯನ್ನು ಸೂಚಿಸುತ್ತದೆ. ಭಕ್ತಿ, ಕರ್ಮ ಯೋಗ ಮತ್ತು ನಿಯಮಿತ ಸಾಧನೆ ಈ ಜಾತಕನ ಬೆಳವಣಿಗೆಯ ಶಿಫಾರಸು ಮಾರ್ಗಗಳಾಗಿವೆ.',
running:'ಚಾಲ್ತಿಯಲ್ಲಿರುವ',antardasha:'ಅಂತರ್ದಶೆ'
},
te:{
chandra:(naks,rashi,exalt,retro)=>`చంద్రుడు ${naks} నక్షత్రంలో (${rashi}) ఉండి జాతకుని అంతర్గత భావోద్వేగ ప్రకృతి, సహజ ప్రతిస్పందనలు మరియు మాతృ-సూత్రంతో సంబంధాన్ని ప్రతిబింబిస్తాడు. ${exalt?'చంద్రుడు ఉచ్చ రాశిలో ఉన్నందున భావోద్వేగ బుద్ధి మరియు సానుభూతి పెరుగుతాయి.':retro?'వక్ర చంద్రుడు లోతైన, ఆత్మపరిశీలన భావోద్వేగ ప్రక్రియను సూచిస్తాడు.':'చంద్రుని స్థానం జాతకునికి '+naks+' నక్షత్ర గుణాలైన భక్తి, అంతర్దృష్టి మరియు భావోద్వేగ బలాన్ని ఇస్తుంది.'}`,
artha:(planet,yogaText)=>`${planet==='jupiter'?'గురువు యొక్క శక్తి బోధన, సలహా, న్యాయం లేదా ఆధ్యాత్మిక మార్గదర్శకత్వం వైపు సహజ మార్గాన్ని సూచిస్తుంది.':planet==='mercury'?'బుధుని ప్రాముఖ్యత సాంకేతికత, రచన, వాణిజ్యం లేదా సమాచార రంగంలో శ్రేష్ఠతను సూచిస్తుంది.':planet==='saturn'?'శని శక్తి ఇంజనీరింగ్, పరిపాలన లేదా క్రమశిక్షణతో కూడిన సేవా వృత్తులలో నిరంతర విజయాన్ని సూచిస్తుంది.':'వృత్తిపరమైన సామర్థ్యం నిరంతర కృషి మరియు సహజ ప్రతిభల అన్వయం ద్వారా వికసిస్తుంది.'} ${yogaText}`,
yogaRaja:(names)=>`కుండలిలో ${names} ఉన్నాయి \u2014 సాధన మరియు గుర్తింపు సామర్థ్యాన్ని పెంచే శక్తివంతమైన కలయికలు.`,
yogaNone:()=>'కుండలి యొక్క అంతర్గత శక్తులు నిరంతర, ఉద్దేశపూర్వక కృషి ద్వారా క్రమంగా వ్యక్తమవుతాయి.',
kama:(hasMangal,venusExalt)=>hasMangal?'ఈ కుండలిలో మంగళ దోషం ఉంది. భాగస్వామి ఎంపికలో జాగ్రత్త అవసరం \u2014 మరొక మాంగళిక జాతకునితో సరిపోలిక మరియు వివాహానికి ముందు మంగళ శాంతి పూజ చేయాలని సిఫారసు చేయబడింది.':'సప్తమ భావ స్థితి పరస్పర గౌరవం మరియు భాగస్వామ్య విలువలపై నిర్మితమైన సంబంధాన్ని సూచిస్తుంది. శుక్రుని స్థానం '+(venusExalt?'అత్యంత అంకితభావం గల మరియు సుసంస్కృత భాగస్వామిని సూచిస్తుంది.':'సామరస్యపూర్ణ వైవాహిక జీవితానికి మంచి అవకాశాలను సూచిస్తుంది.'),
dashaPhala:(graha,desc,antarGraha,antarDesc,endStr)=>`ప్రస్తుత ${graha} మహాదశ ${desc||'ముఖ్యమైన వ్యక్తిగత పరిణామం'}కు సమయం. ${antarGraha?antarGraha+' అంతర్దశ '+(antarDesc||'అంతర్గత వికాసం')+' అంశాలను జోడిస్తుంది. ':''} ఈ కాలం ${endStr} వరకు కొనసాగుతుంది \u2014 గ్రహ శక్తులకు అనుగుణంగా చర్యలు చేపట్టండి.`,
moksha:(jupInDharma)=>jupInDharma?'గురువు ధర్మ/మోక్ష భావంలో ఉన్నందున ఆధ్యాత్మిక పరిణామం వైపు లోతుగా ఆసక్తి ఉన్న ఆత్మను సూచిస్తాడు. వేదాంత అధ్యయనం మరియు సేవ సహజ మార్గాలు.':'కుండలి ఆధ్యాత్మిక అవగాహన యొక్క క్రమంగా వికాసాన్ని సూచిస్తుంది. భక్తి, కర్మ యోగం మరియు నియమిత సాధన ఈ జాతకుని వికాసానికి సిఫారసు చేయబడిన మార్గాలు.',
running:'నడుస్తున్న',antardasha:'అంతర్దశ'
},
ta:{
chandra:(naks,rashi,exalt,retro)=>`சந்திரன் ${naks} நட்சத்திரத்தில் (${rashi}) அமர்ந்து ஜாதகரின் உள் உணர்வுப் பரப்பு, இயல்பான எதிர்வினைகள் மற்றும் தாய்மை கோட்பாட்டுடனான தொடர்பை பிரதிபலிக்கிறார். ${exalt?'சந்திரன் உச்ச ராசியில் இருப்பதால் உணர்வுத் திறனும் இரக்கமும் உயர்கின்றன.':retro?'வக்ர சந்திரன் ஆழமான, சுய பரிசோதனை உணர்வு செயல்முறையை குறிக்கிறார்.':'சந்திரனின் நிலை ஜாதகருக்கு '+naks+' நட்சத்திரத்தின் பக்தி, உள்ளுணர்வு மற்றும் உணர்வு பலம் ஆகிய குணங்களை அளிக்கிறது.'}`,
artha:(planet,yogaText)=>`${planet==='jupiter'?'குருவின் பலம் கற்பித்தல், ஆலோசனை, சட்டம் அல்லது ஆன்மீக வழிகாட்டுதலின் பக்கம் இயல்பான பாதையை சுட்டிக்காட்டுகிறது.':planet==='mercury'?'புதனின் முக்கியத்துவம் தொழில்நுட்பம், எழுத்து, வணிகம் அல்லது தகவல்தொடர்பில் சிறப்பை குறிக்கிறது.':planet==='saturn'?'சனியின் பலம் பொறியியல், நிர்வாகம் அல்லது ஒழுக்கமான சேவை தொழில்களில் நிலையான வெற்றியை சுட்டிக்காட்டுகிறது.':'தொழில் திறன் தொடர்ச்சியான முயற்சி மற்றும் இயல்பான திறமைகளின் பயன்பாட்டின் மூலம் வெளிப்படுகிறது.'} ${yogaText}`,
yogaRaja:(names)=>`ஜாதகத்தில் ${names} உள்ளன \u2014 சாதனை மற்றும் அங்கீகாரத்தின் திறனை உயர்த்தும் சக்திவாய்ந்த கூட்டுகள்.`,
yogaNone:()=>'ஜாதகத்தின் உள்ளார்ந்த பலங்கள் நிலையான, நோக்கமுள்ள முயற்சியின் மூலம் படிப்படியாக வெளிப்படும்.',
kama:(hasMangal,venusExalt)=>hasMangal?'இந்த ஜாதகத்தில் மங்கல தோஷம் உள்ளது. துணை தேர்வில் கவனம் தேவை \u2014 மற்றொரு மாங்கலிக ஜாதகருடன் பொருத்தம் மற்றும் திருமணத்திற்கு முன் மங்கல சாந்தி பூஜை செய்ய பரிந்துரைக்கப்படுகிறது.':'ஏழாம் வீட்டின் அமைப்பு பரஸ்பர மரியாதை மற்றும் பகிர்ந்த மதிப்புகள் மீது கட்டமைக்கப்பட்ட உறவை குறிக்கிறது. சுக்கிரனின் நிலை '+(venusExalt?'மிகவும் அர்ப்பணிப்புள்ள மற்றும் நல்ல பண்புள்ள துணையை குறிக்கிறது.':'இணக்கமான திருமண வாழ்க்கைக்கு நல்ல வாய்ப்புகளை குறிக்கிறது.'),
dashaPhala:(graha,desc,antarGraha,antarDesc,endStr)=>`தற்போதைய ${graha} மகாதசை ${desc||'முக்கியமான தனிப்பட்ட பரிணாமம்'}க்கான காலம். ${antarGraha?antarGraha+' அந்தர்தசை '+(antarDesc||'உள் வளர்ச்சி')+' கருப்பொருள்களை சேர்க்கிறது. ':''} இந்த காலகட்டம் ${endStr} வரை நீடிக்கும் \u2014 கிரக சக்திகளுக்கு ஏற்ப செயல்படுங்கள்.`,
moksha:(jupInDharma)=>jupInDharma?'குரு தர்ம/மோட்ச வீட்டில் இருப்பதால் ஆன்மீக பரிணாமத்தின் பக்கம் ஆழமாக ஒருமுகப்படுத்தப்பட்ட ஆத்மாவை சுட்டிக்காட்டுகிறார். வேதாந்த கல்வி மற்றும் சேவை இயல்பான வழிகள்.':'ஜாதகம் ஆன்மீக விழிப்புணர்வின் படிப்படியான வளர்ச்சியை குறிக்கிறது. பக்தி, கர்ம யோகம் மற்றும் வழக்கமான சாதனை இந்த ஜாதகரின் வளர்ச்சிக்கு பரிந்துரைக்கப்பட்ட வழிகள்.',
running:'நடைபெறும்',antardasha:'அந்தர்தசை'
},
sa:{
chandra:(naks,rashi,exalt,retro)=>`चन्द्रः ${naks} नक्षत्रे (${rashi}) स्थितः जातकस्य आन्तरिकं भावनात्मकं स्वरूपं सहजप्रतिक्रियाश्च मातृतत्त्वेन सह सम्बन्धं प्रतिबिम्बयति। ${exalt?'चन्द्रस्य उच्चस्थित्या भावनात्मकी बुद्धिः सहानुभूतिश्च वर्धते।':retro?'वक्री चन्द्रः गहनं आत्मावलोकनात्मकं भावनात्मकं प्रक्रियां सूचयति।':'चन्द्रस्य स्थानं जातकाय '+naks+' नक्षत्रस्य भक्तिः अन्तर्दृष्टिः भावनात्मकं बलञ्च प्रददाति।'}`,
artha:(planet,yogaText)=>`${planet==='jupiter'?'गुरोः शक्तिः शिक्षणं परामर्शं विधिं वा आध्यात्मिकमार्गदर्शनं प्रति स्वाभाविकं मार्गं सूचयति।':planet==='mercury'?'बुधस्य प्रमुखता प्रौद्योगिक्यां लेखने वाणिज्ये वा सञ्चारे श्रेष्ठतां सूचयति।':planet==='saturn'?'शनेः शक्तिः यन्त्रविद्यायां प्रशासने वा अनुशासित-सेवा-व्यवसायेषु निरन्तरं सफलतां सूचयति।':'व्यावसायिकं सामर्थ्यं निरन्तरप्रयत्नेन स्वाभाविकप्रतिभानाम् अनुप्रयोगेन च प्रकटते।'} ${yogaText}`,
yogaRaja:(names)=>`कुण्डल्यां ${names} सन्ति \u2014 सिद्धिं मान्यतां च वर्धयन्ती शक्तिशालिनी संयोजनानि।`,
yogaNone:()=>'कुण्डल्याः अन्तर्निहिताः शक्तयः निरन्तरेण उद्देश्यपूर्णेन प्रयत्नेन क्रमशः प्रकटन्ते।',
kama:(hasMangal,venusExalt)=>hasMangal?'अस्यां कुण्डल्यां मङ्गलदोषः विद्यते। सङ्गिनः चयने सावधानता आवश्यकी \u2014 अन्येन माङ्गलिकजातकेन सह मिलनं विवाहात्पूर्वं मङ्गलशान्तिपूजा च दृढतया अनुशस्यते।':'सप्तमभावस्य स्थितिः परस्परसम्मानेन साझामूल्यैश्च निर्मितं सम्बन्धं सूचयति। शुक्रस्य स्थानम् '+(venusExalt?'अत्यन्तं समर्पितं सुसंस्कृतं च सङ्गिनं सूचयति।':'सामञ्जस्यपूर्णवैवाहिकजीवनस्य शुभसम्भावनाः दर्शयति।'),
dashaPhala:(graha,desc,antarGraha,antarDesc,endStr)=>`वर्तमाना ${graha} महादशा ${desc||'महत्त्वपूर्णं वैयक्तिकं विकासं'} प्रति कालः। ${antarGraha?antarGraha+' अन्तर्दशा '+(antarDesc||'आन्तरिकवृद्धेः')+' विषयान् योजयति। ':''} एषा अवधिः ${endStr} पर्यन्तं प्रवर्तते \u2014 ग्रहशक्तिभिः सह सामञ्जस्येन कार्यं कुर्वन्तु।`,
moksha:(jupInDharma)=>jupInDharma?'गुरोः धर्म/मोक्षभावे स्थितिः आध्यात्मिकविकासं प्रति गहनोन्मुखाम् आत्मानं सूचयति। वेदान्ताध्ययनं सेवा च स्वाभाविकौ मार्गौ।':'कुण्डली आध्यात्मिकजागरणस्य क्रमिकं विकासं सूचयति। भक्तिः कर्मयोगः नियमितसाधना च अस्य जातकस्य वृद्धेः अनुशंसिताः मार्गाः।',
running:'प्रचलित',antardasha:'अन्तर्दशा'
},
mr:{
chandra:(naks,rashi,exalt,retro)=>`चंद्र ${naks} नक्षत्रात (${rashi}) स्थित असून जातकाच्या अंतर्गत भावनिक स्वरूप, सहज प्रतिक्रिया आणि मातृ-तत्त्वाशी संबंध प्रतिबिंबित करतो. ${exalt?'चंद्र उच्च राशीत असल्यामुळे भावनिक बुद्धिमत्ता आणि सहानुभूती वाढते.':retro?'वक्री चंद्र खोल, आत्मपरीक्षण भावनिक प्रक्रियेचे सूचन करतो.':'चंद्राची स्थिती जातकाला '+naks+' नक्षत्राच्या भक्ती, अंतर्दृष्टी आणि भावनिक शक्तीच्या गुणांचा आशीर्वाद देते.'}`,
artha:(planet,yogaText)=>`${planet==='jupiter'?'गुरूची शक्ती शिक्षण, सल्ला, कायदा किंवा आध्यात्मिक मार्गदर्शनाकडे नैसर्गिक मार्ग दर्शवते.':planet==='mercury'?'बुधाचे प्रामुख्य तंत्रज्ञान, लेखन, व्यापार किंवा संवादात उत्कृष्टता सूचित करते.':planet==='saturn'?'शनीची शक्ती अभियांत्रिकी, प्रशासन किंवा शिस्तबद्ध सेवा व्यवसायांमध्ये शाश्वत यश दर्शवते.':'व्यावसायिक क्षमता सातत्यपूर्ण प्रयत्न आणि नैसर्गिक गुणांच्या वापरातून प्रकट होते.'} ${yogaText}`,
yogaRaja:(names)=>`कुंडलीत ${names} आहेत \u2014 यश आणि मान्यतेची क्षमता वाढवणारे शक्तिशाली संयोग.`,
yogaNone:()=>'कुंडलीच्या अंतर्भूत शक्ती सातत्यपूर्ण, हेतुपूर्ण प्रयत्नातून हळूहळू प्रकट होतील.',
kama:(hasMangal,venusExalt)=>hasMangal?'या कुंडलीत मंगळ दोष आहे. जोडीदार निवडीत सावधानता आवश्यक \u2014 दुसऱ्या मांगलिक जातकाशी जुळवणी आणि विवाहापूर्वी मंगळ शांती पूजा करण्याची शिफारस केली जाते.':'सप्तम भावाची स्थिती परस्पर आदर आणि सामायिक मूल्यांवर आधारित नातेसंबंध सूचित करते. शुक्राची स्थिती '+(venusExalt?'अत्यंत समर्पित आणि सुसंस्कृत जोडीदार सूचित करते.':'सुसंवादी वैवाहिक जीवनाच्या चांगल्या शक्यता दर्शवते.'),
dashaPhala:(graha,desc,antarGraha,antarDesc,endStr)=>`सध्याची ${graha} महादशा ${desc||'महत्त्वपूर्ण वैयक्तिक विकास'}ाचा काळ आहे. ${antarGraha?antarGraha+' अंतर्दशा '+(antarDesc||'आंतरिक वाढ')+'ीचे विषय जोडते. ':''} ही अवधी ${endStr} पर्यंत चालते \u2014 ग्रहशक्तींशी सुसंगत कृती करा.`,
moksha:(jupInDharma)=>jupInDharma?'गुरूची धर्म/मोक्ष भावातील स्थिती आध्यात्मिक विकासाकडे खोलवर उन्मुख आत्म्याचे सूचन करते. वेदांत अभ्यास आणि सेवा नैसर्गिक मार्ग आहेत.':'कुंडली आध्यात्मिक जागरूकतेच्या हळूहळू विकासाचे सूचन करते. भक्ती, कर्मयोग आणि नियमित साधना या जातकाच्या वाढीसाठी शिफारस केलेले मार्ग आहेत.',
running:'चालू',antardasha:'अंतर्दशा'
},
gu:{
chandra:(naks,rashi,exalt,retro)=>`ચંદ્ર ${naks} નક્ષત્રમાં (${rashi}) સ્થિત છે અને જાતકના આંતરિક ભાવનાત્મક સ્વરૂપ, સહજ પ્રતિક્રિયાઓ અને માતૃ-તત્ત્વ સાથેના સંબંધને પ્રતિબિંબિત કરે છે. ${exalt?'ચંદ્ર ઉચ્ચ રાશિમાં હોવાથી ભાવનાત્મક બુદ્ધિ અને સહાનુભૂતિ વધે છે.':retro?'વક્રી ચંદ્ર ઊંડી, આત્મનિરીક્ષણ ભાવનાત્મક પ્રક્રિયા સૂચવે છે.':'ચંદ્રની સ્થિતિ જાતકને '+naks+' નક્ષત્રના ભક્તિ, અંતર્દૃષ્ટિ અને ભાવનાત્મક શક્તિના ગુણો આપે છે.'}`,
artha:(planet,yogaText)=>`${planet==='jupiter'?'ગુરુની શક્તિ શિક્ષણ, સલાહ, કાયદો અથવા આધ્યાત્મિક માર્ગદર્શન તરફ સ્વાભાવિક માર્ગ સૂચવે છે.':planet==='mercury'?'બુધની મહત્ત્વતા ટેક્નોલોજી, લેખન, વાણિજ્ય અથવા સંદેશાવ્યવહારમાં ઉત્કૃષ્ટતા સૂચવે છે.':planet==='saturn'?'શનિની શક્તિ એન્જિનિયરિંગ, વહીવટ અથવા શિસ્તબદ્ધ સેવા વ્યવસાયોમાં સતત સફળતા સૂચવે છે.':'વ્યાવસાયિક સામર્થ્ય સતત પ્રયત્ન અને કુદરતી પ્રતિભાઓના ઉપયોગ દ્વારા પ્રગટ થાય છે.'} ${yogaText}`,
yogaRaja:(names)=>`કુંડળીમાં ${names} છે \u2014 સિદ્ધિ અને માન્યતાની ક્ષમતા વધારતા શક્તિશાળી સંયોગો.`,
yogaNone:()=>'કુંડળીની અંતર્ભૂત શક્તિઓ સતત, હેતુપૂર્ણ પ્રયત્ન દ્વારા ક્રમશઃ પ્રગટ થશે.',
kama:(hasMangal,venusExalt)=>hasMangal?'આ કુંડળીમાં મંગળ દોષ છે. સાથી પસંદગીમાં સાવધાની જરૂરી \u2014 અન્ય માંગલિક જાતક સાથે મેળ અને લગ્ન પહેલાં મંગળ શાંતિ પૂજા કરવાની ભલામણ છે.':'સપ્તમ ભાવની સ્થિતિ પરસ્પર માન અને વહેંચાયેલા મૂલ્યો પર બાંધેલા સંબંધ સૂચવે છે. શુક્રની સ્થિતિ '+(venusExalt?'અત્યંત સમર્પિત અને સુસંસ્કૃત સાથી સૂચવે છે.':'સુમેળભર્યા વૈવાહિક જીવનની સારી સંભાવનાઓ સૂચવે છે.'),
dashaPhala:(graha,desc,antarGraha,antarDesc,endStr)=>`હાલની ${graha} મહાદશા ${desc||'મહત્ત્વપૂર્ણ વ્યક્તિગત વિકાસ'}નો સમય છે. ${antarGraha?antarGraha+' અંતર્દશા '+(antarDesc||'આંતરિક વિકાસ')+'ના વિષયો ઉમેરે છે. ':''} આ અવધિ ${endStr} સુધી ચાલે છે \u2014 ગ્રહ શક્તિઓ સાથે સુસંગત કાર્ય કરો.`,
moksha:(jupInDharma)=>jupInDharma?'ગુરુની ધર્મ/મોક્ષ ભાવમાં સ્થિતિ આધ્યાત્મિક વિકાસ તરફ ઊંડે ઉન્મુખ આત્માને સૂચવે છે. વેદાંત અભ્યાસ અને સેવા સ્વાભાવિક માર્ગો છે.':'કુંડળી આધ્યાત્મિક જાગૃતિના ક્રમિક વિકાસ સૂચવે છે. ભક્તિ, કર્મ યોગ અને નિયમિત સાધના આ જાતકના વિકાસ માટે ભલામણ કરેલા માર્ગો છે.',
running:'ચાલુ',antardasha:'અંતર્દશા'
},
bn:{
chandra:(naks,rashi,exalt,retro)=>`চন্দ্র ${naks} নক্ষত্রে (${rashi}) অবস্থান করে জাতকের অন্তর্গত আবেগময় প্রকৃতি, সহজাত প্রতিক্রিয়া এবং মাতৃতত্ত্বের সাথে সম্পর্ক প্রতিফলিত করে। ${exalt?'চন্দ্র উচ্চ রাশিতে থাকায় আবেগীয় বুদ্ধিমত্তা ও সহানুভূতি বৃদ্ধি পায়।':retro?'বক্রী চন্দ্র গভীর, আত্মবিশ্লেষণমূলক আবেগীয় প্রক্রিয়ার ইঙ্গিত দেয়।':'চন্দ্রের অবস্থান জাতককে '+naks+' নক্ষত্রের ভক্তি, অন্তর্দৃষ্টি ও আবেগীয় শক্তির গুণাবলী প্রদান করে।'}`,
artha:(planet,yogaText)=>`${planet==='jupiter'?'বৃহস্পতির শক্তি শিক্ষাদান, পরামর্শ, আইন বা আধ্যাত্মিক পথনির্দেশের দিকে স্বাভাবিক পথ নির্দেশ করে।':planet==='mercury'?'বুধের প্রাধান্য প্রযুক্তি, লেখালেখি, বাণিজ্য বা যোগাযোগে শ্রেষ্ঠত্ব নির্দেশ করে।':planet==='saturn'?'শনির শক্তি প্রকৌশল, প্রশাসন বা শৃঙ্খলাবদ্ধ সেবা পেশায় স্থায়ী সাফল্য নির্দেশ করে।':'পেশাগত সামর্থ্য নিরন্তর প্রচেষ্টা ও স্বাভাবিক প্রতিভার প্রয়োগের মাধ্যমে প্রকাশ পায়।'} ${yogaText}`,
yogaRaja:(names)=>`কুণ্ডলীতে ${names} রয়েছে \u2014 কৃতিত্ব ও স্বীকৃতির সম্ভাবনা বৃদ্ধিকারী শক্তিশালী সংযোজন।`,
yogaNone:()=>'কুণ্ডলীর অন্তর্নিহিত শক্তিসমূহ নিরন্তর, উদ্দেশ্যমূলক প্রচেষ্টায় ক্রমশ প্রকাশিত হবে।',
kama:(hasMangal,venusExalt)=>hasMangal?'এই কুণ্ডলীতে মঙ্গল দোষ বিদ্যমান। সঙ্গী নির্বাচনে সতর্কতা প্রয়োজন \u2014 অন্য মাঙ্গলিক জাতকের সাথে মিলন এবং বিবাহের পূর্বে মঙ্গল শান্তি পূজা করার দৃঢ়ভাবে সুপারিশ করা হয়।':'সপ্তম ভাবের অবস্থান পারস্পরিক সম্মান ও ভাগাভাগি মূল্যবোধের উপর গড়া সম্পর্ক নির্দেশ করে। শুক্রের অবস্থান '+(venusExalt?'অত্যন্ত নিবেদিত ও সুসংস্কৃত সঙ্গী নির্দেশ করে।':'সুসামঞ্জস্যপূর্ণ বৈবাহিক জীবনের ভালো সম্ভাবনা নির্দেশ করে।'),
dashaPhala:(graha,desc,antarGraha,antarDesc,endStr)=>`বর্তমান ${graha} মহাদশা ${desc||'গুরুত্বপূর্ণ ব্যক্তিগত বিকাশ'}এর সময়। ${antarGraha?antarGraha+' অন্তর্দশা '+(antarDesc||'অন্তর্গত বিকাশ')+'এর বিষয় যোগ করে। ':''} এই সময়কাল ${endStr} পর্যন্ত চলবে \u2014 গ্রহশক্তির সাথে সামঞ্জস্য রেখে কাজ করুন।`,
moksha:(jupInDharma)=>jupInDharma?'বৃহস্পতির ধর্ম/মোক্ষ ভাবে অবস্থান আধ্যাত্মিক বিকাশের দিকে গভীরভাবে উন্মুখ আত্মা নির্দেশ করে। বেদান্ত অধ্যয়ন ও সেবা স্বাভাবিক পথ।':'কুণ্ডলী আধ্যাত্মিক সচেতনতার ক্রমিক বিকাশ নির্দেশ করে। ভক্তি, কর্মযোগ ও নিয়মিত সাধনা এই জাতকের বিকাশের জন্য সুপারিশকৃত পথ।',
running:'চলমান',antardasha:'অন্তর্দশা'
},
ml:{
chandra:(naks,rashi,exalt,retro)=>`ചന്ദ്രൻ ${naks} നക്ഷത്രത്തിൽ (${rashi}) സ്ഥിതി ചെയ്യുന്നു, ജാതകന്റെ ആന്തരിക വൈകാരിക പ്രകൃതി, സഹജ പ്രതികരണങ്ങൾ, മാതൃതത്ത്വവുമായുള്ള ബന്ധം എന്നിവ പ്രതിഫലിപ്പിക്കുന്നു. ${exalt?'ചന്ദ്രൻ ഉച്ച രാശിയിലായതിനാൽ വൈകാരിക ബുദ്ധിയും സഹാനുഭൂതിയും വർധിക്കുന്നു.':retro?'വക്ര ചന്ദ്രൻ ആഴമുള്ള, ആത്മപരിശോധന വൈകാരിക പ്രക്രിയയെ സൂചിപ്പിക്കുന്നു.':'ചന്ദ്രന്റെ സ്ഥാനം ജാതകന് '+naks+' നക്ഷത്രത്തിന്റെ ഭക്തി, ഉൾക്കാഴ്ച, വൈകാരിക ശക്തി എന്നീ ഗുണങ്ങൾ നൽകുന്നു.'}`,
artha:(planet,yogaText)=>`${planet==='jupiter'?'ഗുരുവിന്റെ ശക്തി അധ്യാപനം, ഉപദേശം, നിയമം അല്ലെങ്കിൽ ആത്മീയ മാർഗദർശനത്തിലേക്കുള്ള സ്വാഭാവിക പാത സൂചിപ്പിക്കുന്നു.':planet==='mercury'?'ബുധന്റെ പ്രാധാന്യം സാങ്കേതികവിദ്യ, രചന, വാണിജ്യം അല്ലെങ്കിൽ ആശയവിനിമയത്തിൽ മികവ് സൂചിപ്പിക്കുന്നു.':planet==='saturn'?'ശനിയുടെ ശക്തി എഞ്ചിനീയറിംഗ്, ഭരണം അല്ലെങ്കിൽ അച്ചടക്കമുള്ള സേവന തൊഴിലുകളിൽ സ്ഥിരമായ വിജയം സൂചിപ്പിക്കുന്നു.':'തൊഴിൽ ശേഷി നിരന്തര പരിശ്രമത്തിലൂടെയും സ്വാഭാവിക കഴിവുകളുടെ പ്രയോഗത്തിലൂടെയും പ്രകടമാകുന്നു.'} ${yogaText}`,
yogaRaja:(names)=>`ജാതകത്തിൽ ${names} ഉണ്ട് \u2014 നേട്ടത്തിന്റെയും അംഗീകാരത്തിന്റെയും സാധ്യത വർധിപ്പിക്കുന്ന ശക്തമായ സംയോജനങ്ങൾ.`,
yogaNone:()=>'ജാതകത്തിന്റെ അന്തർലീനമായ ശക്തികൾ നിരന്തരമായ, ഉദ്ദേശ്യപൂർണമായ പ്രയത്നത്തിലൂടെ ക്രമേണ പ്രകടമാകും.',
kama:(hasMangal,venusExalt)=>hasMangal?'ഈ ജാതകത്തിൽ ചൊവ്വാ ദോഷമുണ്ട്. പങ്കാളി തിരഞ്ഞെടുപ്പിൽ ശ്രദ്ധ ആവശ്യമാണ് \u2014 മറ്റൊരു മാംഗലിക ജാതകവുമായി പൊരുത്തവും വിവാഹത്തിന് മുമ്പ് ചൊവ്വാ ശാന്തി പൂജയും ശുപാർശ ചെയ്യുന്നു.':'ഏഴാം ഭാവ സ്ഥിതി പരസ്പര ബഹുമാനത്തിലും പങ്കിട്ട മൂല്യങ്ങളിലും അധിഷ്ഠിതമായ ബന്ധം സൂചിപ്പിക്കുന്നു. ശുക്രന്റെ സ്ഥാനം '+(venusExalt?'അത്യധികം സമർപ്പിതനായ സുസംസ്‌കൃത പങ്കാളിയെ സൂചിപ്പിക്കുന്നു.':'ഇണക്കമുള്ള വൈവാഹിക ജീവിതത്തിന്റെ നല്ല സാധ്യതകൾ സൂചിപ്പിക്കുന്നു.'),
dashaPhala:(graha,desc,antarGraha,antarDesc,endStr)=>`നിലവിലെ ${graha} മഹാദശ ${desc||'പ്രധാനപ്പെട്ട വ്യക്തിപരമായ വികസനം'}ത്തിന്റെ കാലമാണ്. ${antarGraha?antarGraha+' അന്തർദശ '+(antarDesc||'ആന്തരിക വളർച്ച')+'യുടെ വിഷയങ്ങൾ ചേർക്കുന്നു. ':''} ഈ കാലഘട്ടം ${endStr} വരെ നീണ്ടുനിൽക്കും \u2014 ഗ്രഹശക്തികൾക്ക് അനുസൃതമായി പ്രവർത്തിക്കുക.`,
moksha:(jupInDharma)=>jupInDharma?'ഗുരു ധർമ/മോക്ഷ ഭാവത്തിൽ ഉള്ളതിനാൽ ആത്മീയ വികസനത്തിലേക്ക് ആഴത്തിൽ ഉന്മുഖമായ ആത്മാവിനെ സൂചിപ്പിക്കുന്നു. വേദാന്ത പഠനവും സേവനവും സ്വാഭാവിക മാർഗങ്ങളാണ്.':'ജാതകം ആത്മീയ ബോധത്തിന്റെ ക്രമാനുഗതമായ വികസനം സൂചിപ്പിക്കുന്നു. ഭക്തി, കർമയോഗം, നിയമിത സാധന എന്നിവ ഈ ജാതകന്റെ വളർച്ചയ്ക്ക് ശുപാർശ ചെയ്യുന്ന മാർഗങ്ങളാണ്.',
running:'നടക്കുന്ന',antardasha:'അന്തർദശ'
}
};

const L_EXPERT={en:{
labels:{overview:'Soul Blueprint',journey:'Your Life Journey',career:'Career & Purpose',partner:'Relationships & Partnerships',strengths:'Planetary Gifts',growth:'Growth & Development',spiritual:'Spiritual Path',current:'Current Phase: Deep Dive',challenge:'Key Challenge',suggestion:'Guidance',ages:'Ages',theme:'Theme'},
challenge:{sun:'Avoid arrogance and excessive need for recognition. Guard against ego-driven decisions in authority roles.',moon:'Avoid emotional reactivity and over-attachment. Stillness and inner nourishment are essential practices.',mars:'Channel drive constructively — avoid impulsive action, unnecessary conflict, or overexertion.',mercury:'Avoid mental scatteredness and overthinking. Direct intellectual energy into focused, purposeful work.',jupiter:'Beware of overconfidence or moralizing. True wisdom involves listening as much as teaching.',venus:'Avoid indulgence or emotional dependency. Balance enjoyment with purposeful effort.',saturn:'Patience is paramount. Avoid shortcuts and resentment — steady, disciplined effort is the only key.',rahu:'Ground ambitions in ethical action. Avoid obsessive desire or deception in pursuing goals.',ketu:'Avoid excessive withdrawal or self-doubt. Integrate inner gifts with active present-world engagement.'},
suggest:{sun:'Step into leadership and public service with confidence. Surya Namaskar and morning sun practice strengthen solar energy and vitality.',moon:'Nurture emotional well-being through creative expression, time near water, and family connection. Journaling and meditation bring inner clarity.',mars:'Direct energy into physical fitness, entrepreneurial ventures, or property matters. Take bold but calculated action — Hanuman puja supports courage and protection.',mercury:'Invest in learning, writing, teaching, or skill-building. Launch communication-heavy or analytical projects and strengthen business foundations.',jupiter:'Pursue higher education, teaching, and philosophical inquiry. Expand through travel or study. Charitable giving amplifies Jupiter\'s blessings considerably.',venus:'Invest in relationships, art, and creative expression. Social connection, diplomacy, and gratitude practices are all highly favoured.',saturn:'Build long-term foundations with patience and integrity. Focus on disciplined service and karma yoga. Saturn richly rewards sincere, unglamorous hard work.',rahu:'Embrace innovation and transformative opportunities boldly. Study new fields, engage with foreign connections, and take thoughtful unconventional paths.',ketu:'Deepen meditation and spiritual study. Service to the underprivileged brings peace. Ancestral healing practices and pilgrimage are beneficial.'},
overview:(ln,mn,mr,sp,yc)=>`This chart is rooted in ${ln} Lagna — shaping the native's core personality, physical constitution, and fundamental approach to life. The Moon in ${mn} Nakshatra (${mr}) colours the emotional world with sensitivity, intuition, and inner depth. ${sp.length>0?'Exceptional planetary strength flows through '+sp.join(' and ')+', bestowing natural mastery in those domains.':'The planetary energies are broadly distributed, creating a versatile and multi-faceted personality.'} ${yc>0?yc+' Raja or Dhana Yoga'+(yc>1?'s are':' is')+' present — a strong indicator of above-average potential for recognition, influence, and prosperity.':''}`,
career:(pk,tl,tlh,sp)=>{const t={sun:'government, administration, medicine, leadership, and public-facing authority roles',moon:'hospitality, healing, public service, the food industry, and caring or nurturing professions',mars:'engineering, military, sports, surgery, real estate, construction, and entrepreneurship',mercury:'technology, finance, writing, education, media, consultancy, and communications',jupiter:'law, education, banking, counseling, philosophy, spiritual guidance, and management',venus:'arts, fashion, entertainment, hospitality, luxury goods, creative design, and diplomacy',saturn:'research, manufacturing, mining, government service, agriculture, and long-term structured work',rahu:'technology, foreign connections, media, politics, innovation, and unconventional cutting-edge fields',ketu:'research, medicine, occult sciences, spiritual guidance, technical expertise, and investigative work'};return`The 10th house of career is governed by ${tl} — placed in the ${tlh}th house — indicating natural aptitude and soul-level pull toward ${t[pk]||'fields requiring focused dedication'}. ${sp.includes('jupiter')?'Jupiter\'s strength adds wisdom, ethical authority, and a capacity for mentorship to the professional sphere. ':''} ${sp.includes('mercury')?'Mercury\'s prominence lends an analytical edge and excellent communication skills — thinking-intensive and expressive roles are especially rewarding. ':''} ${sp.includes('saturn')?'Saturn\'s strength promises that sustained, disciplined effort yields significant results — success builds steadily and grows more impactful with age. ':''} ${sp.includes('mars')?'Mars\'s strength brings bold initiative and competitive drive — entrepreneurial or leadership-oriented roles are a natural fit. ':''} ${sp.includes('venus')?'Venus\'s strength adds creative flair and social grace — people-oriented and artistic fields hold great appeal. ':''}`.replace(/\s+/g,' ').trim();},
partner:(sl,hm,vc)=>`The 7th house of marriage and partnerships is governed by ${sl} — indicating relationship dynamics carry the qualities and lessons of that planetary energy. ${hm?'Mangal Dosha is present. Conscious partner selection is essential — matching with a fellow Manglik and performing Mangal Shanti puja before marriage is strongly advised.':'Relationships are likely built on mutual respect, loyalty, and a shared sense of purpose.'} ${vc==='Strong'?'Venus is strong — this native possesses natural charm, warmth, and capacity for deep devotion. Marital happiness and fulfilling partnerships are strongly indicated.':vc==='Weak'?'Venus calls for conscious cultivation of appreciation, generosity, and emotional openness. As inner harmony grows, outer partnerships naturally flourish.':'Venus supports warm and balanced partnerships when genuine effort and emotional investment are consistently offered.'}`,
strengths:(n)=>`${n.join(', ')} ${n.length===1?'shines':'shine'} as a source of natural strength, ease, and soul-level mastery in this chart. ${n.length===1?'This planetary energy represents':'These planetary energies represent'} the native's deepest gifts — areas where talent flows effortlessly and leaning in creates the greatest impact.`,
growth:(n)=>`${n.join(', ')} ${n.length===1?'points':'point'} toward areas of karmic growth and conscious development in this lifetime. These are not weaknesses but sacred invitations to evolve. By working patiently with these energies — through remedies, awareness, and inner work — what begins as challenge gradually transforms into profound wisdom and strength.`,
spiritual:(nl,jh)=>`The 9th house of Dharma and higher learning is governed by ${nl} — flavouring the native's spiritual journey and life philosophy. ${jh===1||jh===9||jh===5?'Jupiter\'s placement in a profoundly auspicious dharmic house reveals a soul deeply oriented toward wisdom, grace, and spiritual service. Teaching, learning, and devotional practice come naturally.':jh===12?'Jupiter in the 12th house reveals a soul whose spiritual life is rich, private, and liberation-oriented. Inner silence, meditation, and surrender are the most natural expressions.':jh===4||jh===7||jh===10?'Jupiter in a Kendra gives spiritual foundations a strong, stable quality — wisdom grows through experience, relationships, and worldly engagement.':'Jupiter supports gradual unfolding of spiritual awareness through life\'s varied experiences and inner philosophical inquiry.'} Regular contemplative practice, study of sacred texts, and acts of selfless service are universally beneficial paths for this chart.`
},hi:{
labels:{overview:'आत्मा का खाका',journey:'आपकी जीवन यात्रा',career:'कर्म और उद्देश्य',partner:'संबंध और साझेदारी',strengths:'ग्रहीय वरदान',growth:'विकास और उन्नति',spiritual:'आध्यात्मिक मार्ग',current:'वर्तमान दशा: गहन विश्लेषण',challenge:'मुख्य चुनौती',suggestion:'मार्गदर्शन',ages:'आयु',theme:'थीम'},
challenge:{sun:'अहंकार और अत्यधिक मान्यता की इच्छा से बचें। अधिकार भूमिकाओं में अहंकार-चालित निर्णयों से सतर्क रहें।',moon:'भावनात्मक प्रतिक्रियाशीलता और अत्यधिक आसक्ति से बचें। स्थिरता और आंतरिक पोषण आवश्यक है।',mars:'ऊर्जा को रचनात्मक रूप से लगाएं — आवेगशील निर्णयों और अनावश्यक संघर्ष से बचें।',mercury:'मानसिक बिखराव और अतिविचार से बचें। बौद्धिक ऊर्जा को उद्देश्यपूर्ण कार्य में केंद्रित करें।',jupiter:'अत्यधिक आत्मविश्वास या नैतिक उपदेश से बचें। सच्चा ज्ञान उतना ही सुनने में है।',venus:'भोग-विलास या भावनात्मक निर्भरता से बचें। जीवन के आनंद और उद्देश्यपूर्ण प्रयास में संतुलन रखें।',saturn:'धैर्य आवश्यक है। शॉर्टकट और नाराजगी से बचें — स्थिर, अनुशासित प्रयास ही कुंजी है।',rahu:'महत्वाकांक्षाओं को नैतिक कार्यों में उतारें। जुनूनी इच्छा और छल से बचें।',ketu:'अत्यधिक वापसी या आत्म-संदेह से बचें। आंतरिक उपहारों को सक्रिय जगत से जोड़ें।'},
suggest:{sun:'नेतृत्व और सेवा में आत्मविश्वास से कदम रखें। सूर्य नमस्कार और सुबह की धूप अत्यंत लाभकारी है।',moon:'रचनात्मक अभिव्यक्ति, जल के निकट समय और पारिवारिक संबंध भावनात्मक कल्याण पोषित करते हैं।',mars:'शारीरिक फिटनेस या उद्यमी उद्यमों में ऊर्जा लगाएं। हनुमान पूजा साहस में सहायक है।',mercury:'सीखने, लेखन या कौशल-निर्माण में निवेश करें। संचार-आधारित परियोजनाएं शुरू करें।',jupiter:'शिक्षा, शिक्षण और दार्शनिक अनुसंधान करें। दान-कार्य गुरु के आशीर्वाद को बढ़ाता है।',venus:'संबंधों, कला और रचनात्मकता में निवेश करें। कृतज्ञता और सौंदर्य का अभ्यास करें।',saturn:'धैर्य और ईमानदारी से दीर्घकालिक नींव बनाएं। अनुशासित सेवा और कर्म योग पर ध्यान दें।',rahu:'नवाचार और परिवर्तनकारी अवसरों को साहस से अपनाएं। नए क्षेत्रों का अध्ययन करें।',ketu:'ध्यान और आध्यात्मिक अध्ययन गहरा करें। पितृ-तर्पण और वंचितों की सेवा शांति लाती है।'},
overview:(ln,mn,mr,sp,yc)=>`यह कुंडली ${ln} लग्न पर आधारित है — जो जातक के मूल व्यक्तित्व और जीवन के प्रति दृष्टिकोण को आकार देती है। ${mn} नक्षत्र (${mr}) में चंद्रमा भावनात्मक जगत को संवेदनशीलता और अंतर्ज्ञान से रंगता है। ${sp.length>0?sp.join(' और ')+' में असाधारण ग्रहीय शक्ति प्रवाहित होती है।':'ग्रहीय ऊर्जाएं व्यापक रूप से वितरित हैं, जो बहुमुखी व्यक्तित्व बनाती हैं।'} ${yc>0?yc+' राज/धन योग उपस्थित हैं — मान्यता और समृद्धि की उच्च संभावना का संकेत।':''}`,
career:(pk,tl,tlh,sp)=>{const t={sun:'शासन, प्रशासन, चिकित्सा और नेतृत्व',moon:'आतिथ्य, उपचार, सार्वजनिक सेवा और पोषण व्यवसाय',mars:'इंजीनियरिंग, सैन्य, खेल, रियल एस्टेट और उद्यमिता',mercury:'प्रौद्योगिकी, वित्त, लेखन, शिक्षा और संचार',jupiter:'कानून, शिक्षा, वित्त, परामर्श और आध्यात्मिक मार्गदर्शन',venus:'कला, फैशन, मनोरंजन, आतिथ्य और कूटनीति',saturn:'अनुसंधान, निर्माण, सरकारी सेवा और दीर्घकालिक कार्य',rahu:'प्रौद्योगिकी, विदेशी संबंध, मीडिया और नवाचार',ketu:'अनुसंधान, चिकित्सा और आध्यात्मिक विशेषज्ञता'};return`दशम भाव ${tl} द्वारा शासित है — ${tlh}वें भाव में स्थित — ${t[pk]||'विशेष क्षेत्रों'} में स्वाभाविक योग्यता दर्शाता है। ${sp.includes('jupiter')?'गुरु की शक्ति व्यावसायिक जीवन में ज्ञान और नैतिक अधिकार जोड़ती है। ':''} ${sp.includes('saturn')?'शनि की शक्ति निरंतर प्रयास से सुनिश्चित सफलता देती है। ':''}`.replace(/\s+/g,' ').trim();},
partner:(sl,hm,vc)=>`सप्तम भाव ${sl} द्वारा शासित है। ${hm?'इस कुंडली में मंगल दोष है — मांगलिक साथी और मंगल शांति पूजा अनिवार्य है।':'संबंध पारस्परिक सम्मान और साझे उद्देश्य पर बनने की संभावना है।'} ${vc==='Strong'?'शुक्र मजबूत है — वैवाहिक सुख दृढ़ता से संकेतित है।':vc==='Weak'?'शुक्र संबंधों में कृतज्ञता और उदारता के सचेत विकास का आह्वान करता है।':'शुक्र निरंतर प्रयास से संतुलित साझेदारी का समर्थन करता है।'}`,
strengths:(n)=>`${n.join(', ')} इस कुंडली में प्राकृतिक शक्ति और आत्मा-स्तरीय निपुणता के स्रोत के रूप में चमकते हैं। ये जातक के गहरे उपहार हैं जहाँ प्रतिभा सहजता से प्रवाहित होती है।`,
growth:(n)=>`${n.join(', ')} कार्मिक विकास के क्षेत्रों को इंगित करते हैं। ये कमजोरियाँ नहीं बल्कि विकसित होने के पवित्र निमंत्रण हैं। उपायों और जागरूकता से ये शक्तियाँ बनती हैं।`,
spiritual:(nl,jh)=>`नवम भाव ${nl} द्वारा शासित है। ${jh===1||jh===9||jh===5?'गुरु की शुभ स्थिति ज्ञान और आध्यात्मिक सेवा की ओर उन्मुख आत्मा दर्शाती है।':jh===12?'द्वादश में गुरु मुक्ति-उन्मुख आत्मा दर्शाता है।':'गुरु जीवन अनुभवों से आध्यात्मिक विकास का समर्थन करता है।'} नियमित साधना, शास्त्र अध्ययन और निःस्वार्थ सेवा इस कुंडली के लिए सर्वोत्तम मार्ग हैं।`
},kn:{
labels:{overview:'ಆತ್ಮದ ನಕ್ಷೆ',journey:'ನಿಮ್ಮ ಜೀವನ ಪ್ರಯಾಣ',career:'ಕರ್ಮ ಮತ್ತು ಉದ್ದೇಶ',partner:'ಸಂಬಂಧ ಮತ್ತು ಸಹಭಾಗಿತ್ವ',strengths:'ಗ್ರಹ ವರದಾನಗಳು',growth:'ಬೆಳವಣಿಗೆ ಮತ್ತು ಅಭಿವೃದ್ಧಿ',spiritual:'ಆಧ್ಯಾತ್ಮಿಕ ಮಾರ್ಗ',current:'ಪ್ರಸ್ತುತ ದಶೆ: ಆಳ ವಿಶ್ಲೇಷಣೆ',challenge:'ಪ್ರಮುಖ ಸವಾಲು',suggestion:'ಮಾರ್ಗದರ್ಶನ',ages:'ವಯಸ್ಸು',theme:'ವಿಷಯ'},
challenge:{sun:'ಅಹಂಕಾರ ಮತ್ತು ಅತಿ ಮನ್ನಣೆ ಬಯಕೆಯಿಂದ ದೂರವಿರಿ.',moon:'ಭಾವನಾತ್ಮಕ ಪ್ರತಿಕ್ರಿಯಾಶೀಲತೆ ಮತ್ತು ಅತಿ ಅಂಟುವಿಕೆಯಿಂದ ದೂರವಿರಿ.',mars:'ಶಕ್ತಿಯನ್ನು ರಚನಾತ್ಮಕವಾಗಿ ಬಳಸಿ — ಆವೇಗ ಮತ್ತು ಸಂಘರ್ಷದಿಂದ ದೂರವಿರಿ.',mercury:'ಮಾನಸಿಕ ಚದುರುವಿಕೆ ಮತ್ತು ಅತಿ ಚಿಂತನೆಯಿಂದ ದೂರವಿರಿ.',jupiter:'ಅತಿ ಆತ್ಮವಿಶ್ವಾಸ ಅಥವಾ ನೈತಿಕ ಬೋಧನೆಯಿಂದ ದೂರವಿರಿ.',venus:'ಭೋಗ ಅಥವಾ ಭಾವನಾತ್ಮಕ ಅವಲಂಬನೆಯಿಂದ ದೂರವಿರಿ.',saturn:'ತಾಳ್ಮೆ ಅತ್ಯಗತ್ಯ. ಶಾರ್ಟ್ಕಟ್ ಮತ್ತು ಅಸಮಾಧಾನ ಬಿಡಿ.',rahu:'ಮಹತ್ವಾಕಾಂಕ್ಷೆಗಳನ್ನು ನೈತಿಕ ಕಾರ್ಯದಲ್ಲಿ ಅಳವಡಿಸಿ.',ketu:'ಅತಿ ಹಿಂದೆ ಸರಿಯುವಿಕೆ ಅಥವಾ ಸ್ವ-ಸಂದೇಹ ಬಿಡಿ.'},
suggest:{sun:'ನಾಯಕತ್ವ ಮತ್ತು ಸೇವೆಯಲ್ಲಿ ಆತ್ಮವಿಶ್ವಾಸದಿಂದ ಹೆಜ್ಜೆ ಇಡಿ. ಸೂರ್ಯ ನಮಸ್ಕಾರ ಮತ್ತು ಬೆಳಗಿನ ಬೆಳಕಿನ ಅಭ್ಯಾಸ ಉಪಯುಕ್ತ.',moon:'ರಚನಾತ್ಮಕ ಅಭಿವ್ಯಕ್ತಿ ಮತ್ತು ಕುಟುಂಬ ಸಂಬಂಧ ಭಾವನಾತ್ಮಕ ಯೋಗಕ್ಷೇಮ ಕಾಪಾಡುತ್ತದೆ.',mars:'ದೈಹಿಕ ಫಿಟ್ನೆಸ್ ಅಥವಾ ಹೊಸ ಉದ್ಯಮಗಳಲ್ಲಿ ಶಕ್ತಿ ಹಾಕಿ. ಧೈರ್ಯಶಾಲಿ ಕ್ರಮ ತೆಗೆದುಕೊಳ್ಳಿ.',mercury:'ಕಲಿಕೆ, ಬರವಣಿಗೆ ಅಥವಾ ಕೌಶಲ ನಿರ್ಮಾಣದಲ್ಲಿ ಹೂಡಿಕೆ ಮಾಡಿ.',jupiter:'ಶಿಕ್ಷಣ, ಬೋಧನೆ ಮತ್ತು ಧರ್ಮ ಕಾರ್ಯಗಳಲ್ಲಿ ತೊಡಗಿ.',venus:'ಸಂಬಂಧಗಳು ಮತ್ತು ಕಲೆಯಲ್ಲಿ ಹೂಡಿಕೆ ಮಾಡಿ. ಕೃತಜ್ಞತೆ ಅಭ್ಯಾಸ ಮಾಡಿ.',saturn:'ತಾಳ್ಮೆಯಿಂದ ದೀರ್ಘಕಾಲೀನ ಅಡಿಪಾಯ ನಿರ್ಮಿಸಿ. ಅನುಶಾಸಿತ ಸೇವೆ ಮಾಡಿ.',rahu:'ನಾವೀನ್ಯ ಮತ್ತು ಪರಿವರ್ತನಕಾರಿ ಅವಕಾಶ ಸ್ವೀಕರಿಸಿ.',ketu:'ಧ್ಯಾನ ಮತ್ತು ಆಧ್ಯಾತ್ಮಿಕ ಅಧ್ಯಯನ ಆಳಗೊಳಿಸಿ.'},
overview:(ln,mn,mr,sp,yc)=>`ಈ ಕುಂಡಲಿ ${ln} ಲಗ್ನದ ಮೇಲೆ ನಿಂತಿದೆ — ಜಾತಕನ ವ್ಯಕ್ತಿತ್ವ ಮತ್ತು ಜೀವನ ವಿಧಾನವನ್ನು ರೂಪಿಸುತ್ತದೆ. ${mn} ನಕ್ಷತ್ರ (${mr}) ದಲ್ಲಿ ಚಂದ್ರ ಭಾವನಾತ್ಮಕ ಜಗತ್ತನ್ನು ಸೂಕ್ಷ್ಮತೆ ಮತ್ತು ಅಂತರ್ಜ್ಞಾನದಿಂದ ತುಂಬಿಸುತ್ತಾನೆ. ${sp.length>0?sp.join(' ಮತ್ತು ')+' ನಲ್ಲಿ ಅಸಾಧಾರಣ ಗ್ರಹ ಶಕ್ತಿ ಇದೆ.':'ಗ್ರಹ ಶಕ್ತಿಗಳು ಹರಡಿ ಬಹುಮುಖ ವ್ಯಕ್ತಿತ್ವ ಸೃಷ್ಟಿಸಿವೆ.'} ${yc>0?yc+' ರಾಜ/ಧನ ಯೋಗಗಳು ಉಪಸ್ಥಿತ.':''}`,
career:(pk,tl,tlh,sp)=>{const t={sun:'ಸರ್ಕಾರ, ಆಡಳಿತ, ವೈದ್ಯಕೀಯ ಮತ್ತು ನಾಯಕತ್ವ',moon:'ಆತಿಥ್ಯ, ಚಿಕಿತ್ಸೆ ಮತ್ತು ಸಾರ್ವಜನಿಕ ಸೇವೆ',mars:'ಎಂಜಿನಿಯರಿಂಗ್, ಸೈನ್ಯ, ಕ್ರೀಡೆ ಮತ್ತು ಉದ್ಯಮಶೀಲತೆ',mercury:'ತಂತ್ರಜ್ಞಾನ, ಹಣಕಾಸು, ಬರವಣಿಗೆ ಮತ್ತು ಮಾಧ್ಯಮ',jupiter:'ಕಾನೂನು, ಶಿಕ್ಷಣ, ಬ್ಯಾಂಕಿಂಗ್ ಮತ್ತು ಸಲಹಾ',venus:'ಕಲೆ, ಫ್ಯಾಶನ್, ಮನೋರಂಜನೆ ಮತ್ತು ಕೂಟನೀತಿ',saturn:'ಸಂಶೋಧನೆ, ಉತ್ಪಾದನೆ ಮತ್ತು ಸರ್ಕಾರಿ ಸೇವೆ',rahu:'ತಂತ್ರಜ್ಞಾನ, ವಿದೇಶಿ ಸಂಬಂಧ ಮತ್ತು ನಾವೀನ್ಯ',ketu:'ಸಂಶೋಧನೆ, ವೈದ್ಯಕೀಯ ಮತ್ತು ಆಧ್ಯಾತ್ಮಿಕ ಮಾರ್ಗದರ್ಶನ'};return`ದಶಮ ಭಾವ ${tl} ದಿಂದ ಆಳಲ್ಪಡುತ್ತದೆ — ${tlh}ನೇ ಭಾವದಲ್ಲಿ — ${t[pk]||'ಸಮರ್ಪಣೆ ಅಗತ್ಯ ಕ್ಷೇತ್ರಗಳ'} ಕಡೆ ಸ್ವಾಭಾವಿಕ ಯೋಗ್ಯತೆ. ${sp.includes('jupiter')?'ಗುರುವಿನ ಶಕ್ತಿ ಜ್ಞಾನ ಮತ್ತು ನೈತಿಕ ಅಧಿಕಾರ ನೀಡುತ್ತದೆ. ':''} ${sp.includes('saturn')?'ಶನಿಯ ಶಕ್ತಿ ನಿರಂತರ ಪ್ರಯತ್ನ ಫಲ ನೀಡುತ್ತದೆ. ':''}`.replace(/\s+/g,' ').trim();},
partner:(sl,hm,vc)=>`ಸಪ್ತಮ ಭಾವ ${sl} ದಿಂದ ಆಳಲ್ಪಡುತ್ತದೆ. ${hm?'ಮಂಗಳ ದೋಷ ಉಪಸ್ಥಿತ — ಮಾಂಗಲಿಕ ಸಂಗಾತಿ ಮತ್ತು ಮಂಗಳ ಶಾಂತಿ ಅತ್ಯಗತ್ಯ.':'ಸಂಬಂಧಗಳು ಗೌರವ ಮತ್ತು ಸಹಭಾಗ ಉದ್ದೇಶದ ಮೇಲೆ ನಿರ್ಮಿತ.'} ${vc==='Strong'?'ಶುಕ್ರ ಶಕ್ತಿಶಾಲಿ — ವೈವಾಹಿಕ ಸುಖ ಸ್ಪಷ್ಟ.':vc==='Weak'?'ಸಂಬಂಧಗಳಲ್ಲಿ ಕೃತಜ್ಞತೆ ಮತ್ತು ಮುಕ್ತತೆ ಬೆಳೆಸಿ.':'ಶುಕ್ರ ಪ್ರಾಮಾಣಿಕ ಪ್ರಯತ್ನದಿಂದ ಸಂತುಲಿತ ಸಹಭಾಗಿತ್ವ ಬೆಂಬಲಿಸುತ್ತಾನೆ.'}`,
strengths:(n)=>`${n.join(', ')} ಈ ಕುಂಡಲಿಯಲ್ಲಿ ಪ್ರಾಕೃತಿಕ ಶಕ್ತಿ ಮತ್ತು ಆತ್ಮ-ನಿಪುಣತೆಯ ಮೂಲ. ಇಲ್ಲಿ ಪ್ರತಿಭೆ ಸಹಜವಾಗಿ ಹರಿಯುತ್ತದೆ.`,
growth:(n)=>`${n.join(', ')} ಕರ್ಮದ ಬೆಳವಣಿಗೆ ಕ್ಷೇತ್ರ ಸೂಚಿಸುತ್ತದೆ. ಇವು ದೌರ್ಬಲ್ಯಗಳಲ್ಲ — ವಿಕಸಿತವಾಗಲು ಆಮಂತ್ರಣ. ಉಪಾಯ ಮತ್ತು ಜಾಗೃತಿಯಿಂದ ಶಕ್ತಿ ಬೆಳೆಯುತ್ತದೆ.`,
spiritual:(nl,jh)=>`ನವಮ ಭಾವ ${nl} ದಿಂದ ಆಳಲ್ಪಡುತ್ತದೆ. ${jh===1||jh===9||jh===5?'ಗುರುವಿನ ಶುಭ ಧಾರ್ಮಿಕ ಭಾವ ಸ್ಥಾನ ಜ್ಞಾನ ಮತ್ತು ಸೇವೆ ಕಡೆ ಉನ್ಮುಖ ಆತ್ಮ.':jh===12?'ದ್ವಾದಶದಲ್ಲಿ ಗುರು ಮುಕ್ತಿ-ಉನ್ಮುಖ ಆಧ್ಯಾತ್ಮಿಕ ಜೀವನ.':'ಗುರು ಜೀವನ ಅನುಭವದ ಮೂಲಕ ಆಧ್ಯಾತ್ಮಿಕ ಜಾಗೃತಿ ಬೆಂಬಲಿಸುತ್ತಾನೆ.'} ಧ್ಯಾನ, ಶಾಸ್ತ್ರ ಅಧ್ಯಯನ ಮತ್ತು ನಿಸ್ವಾರ್ಥ ಸೇವೆ ಸಾರ್ವತ್ರಿಕ ಲಾಭದ ಮಾರ್ಗಗಳು.`
},te:{
labels:{overview:'ఆత్మ ప్రణాళిక',journey:'మీ జీవన యాత్ర',career:'కర్మ మరియు ఉద్దేశ్యం',partner:'సంబంధాలు మరియు భాగస్వామ్యం',strengths:'గ్రహ వరాలు',growth:'వికాసం మరియు అభివృద్ధి',spiritual:'ఆధ్యాత్మిక మార్గం',current:'వర్తమాన దశ: లోతైన విశ్లేషణ',challenge:'ముఖ్య సవాలు',suggestion:'మార్గదర్శకత్వం',ages:'వయసు',theme:'విషయం'},
challenge:{sun:'అహంకారం మరియు అతిగా గుర్తింపు కోరటం మానుకోండి.',moon:'భావోద్వేగ ప్రతిస్పందన మరియు అతి అనుబంధం నుండి దూరంగా ఉండండి.',mars:'శక్తిని సృజనాత్మకంగా వినియోగించండి — ఆవేశ నిర్ణయాలు మరియు సంఘర్షణ మానుకోండి.',mercury:'మానసిక చెదురుమదురు మరియు అతి ఆలోచన మానుకోండి.',jupiter:'అతి ఆత్మవిశ్వాసం లేదా నైతిక బోధ మానుకోండి.',venus:'అతి భోగం లేదా భావోద్వేగ ఆధారపడటం మానుకోండి.',saturn:'ఓర్పు అత్యవసరం. సులభమార్గాలు మరియు అసంతృప్తి వదులుకోండి.',rahu:'లక్ష్యాలను నైతిక చర్యలలో ఉంచుకోండి.',ketu:'అతి వైదొలగడం లేదా ఆత్మ సందేహం మానుకోండి.'},
suggest:{sun:'నాయకత్వం మరియు సేవలో ధైర్యంగా అడుగు వేయండి. సూర్య నమస్కారాలు మేలు.',moon:'సృజనాత్మక అభివ్యక్తి మరియు కుటుంబ బంధాలు భావోద్వేగ ఆరోగ్యాన్ని పోషిస్తాయి.',mars:'శారీరక ఆరోగ్యం మరియు వ్యాపార సాహసాల్లో శక్తిని వినియోగించండి.',mercury:'నేర్చుకోవడం, రాయడం మరియు నైపుణ్యాల పెంపులో పెట్టుబడి పెట్టండి.',jupiter:'విద్య, బోధన భక్తి కార్యక్రమాల్లో పాల్గొనండి.',venus:'సంబంధాలు, కళలు మరియు సృజనాత్మకతలో పెట్టుబడి పెట్టండి.',saturn:'ఓర్పుతో దీర్ఘకాలిక పునాదులు నిర్మించండి. క్రమశిక్షణతో సేవ చేయండి.',rahu:'ఆవిష్కరణ మరియు మార్పును ధైర్యంగా స్వీకరించండి.',ketu:'ధ్యానం మరియు ఆధ్యాత్మిక అధ్యయనం లోతుగా చేయండి.'},
overview:(ln,mn,mr,sp,yc)=>`ఈ కুণ্ডలి ${ln} లగ్నం ఆధారంగా నిర్మించబడింది. ${mn} నక్షత్రంతో (${mr}) చంద్రుడు భావోద్వేగ ప్రపంచాన్ని సున్నితత్వంతో నింపుతాడు. ${sp.length>0?sp.join(' మరియు ')+' ప్రబలంగా ఉన్నాయి.':'గ్రహ శక్తులు విస్తృతంగా ఉంటాయి.'} ${yc>0?yc+' రాజ/ధన యోగాలు ఉన్నాయి.':''}`,
career:(pk,tl,tlh,sp)=>{const t={sun:'ప్రభుత్వం, పరిపాలన, వైద్యం',moon:'ఆతిథ్యం, ప్రజారోగ్యం',mars:'ఇంజనీరింగ్, సైన్యం, క్రీడలు',mercury:'సాంకేతికత, ఆర్థికి, రచన',jupiter:'చట్టం, విద్య, బ్యాంకింగ్',venus:'కళ, వినోదం',saturn:'పరిశోధన, ప్రభుత్వ సేవ',rahu:'సాంకేతికత, పరిశోధన',ketu:'ఆధ్యాత్మికత, వైద్య నిపుణత'};return`దశమ భావం ${tl} చే పాలింపబడుతుంది — ${tlh}వ భావంలో ఉంది. ${t[pk]||'ప్రత్యేక రంగాలలో'} కౌశలం. ${sp.includes('saturn')?'శని నిరంతర శ్రమ ద్వారా విజయం ఇస్తాడు.':''}`.replace(/\s+/g,' ').trim();},
partner:(sl,hm,vc)=>`సప్తమ భావం ${sl} చే పాలింపబడుతుంది. ${hm?'కుజ దోషం ఉంది — కుజశాంతి అవసరం.':'పరస్పర గౌరవంతో సంబంధాలు ఉంటాయి.'} ${vc==='Strong'?'శుక్రుడు బలంగా ఉన్నాడు.':'శుక్రుడు ప్రయత్నంతో సంబంధాలు ఇస్తాడు.'}`,
strengths:(n)=>`${n.join(', ')} మరియు ఆత్మ-స్థాయి నైపుణ్యం యొక్క మూలం. ఇక్కడ ప్రతిభ సహజంగా ప్రవహిస్తుంది.`,
growth:(n)=>`${n.join(', ')} ఈ జన్మలో కర్మ వికాస రంగాలను సూచిస్తుంది. ఇవి బలహీనతలు కావు — పరిణామం కోసం పిలుపు. ఉపాయాలు మరియు జాగరూకతతో సవాళ్ళు శక్తులుగా మారతాయి.`,
spiritual:(nl,jh)=>`నవమ భావం ${nl} చేత పరిపాలించబడుతోంది. ${jh===1||jh===9||jh===5?'గురువు శుభ ధర్మ భావంలో — జ్ఞానం మరియు సేవ వైపు లోతుగా ఉన్ముఖమైన ఆత్మ.':jh===12?'12వ భావంలో గురుడు — ముక్తి-ఉన్ముఖ ఆధ్యాత్మిక జీవనం.':'గురుడు జీవన అనుభవాల ద్వారా ఆధ్యాత్మిక వికాసాన్ని మద్దతు ఇస్తాడు.'} ధ్యానం, గ్రంథ అధ్యయనం మరియు నిస్వార్థ సేవ అన్నింటికీ ప్రయోజనకరమైన మార్గాలు.`
},ta:{
labels:{overview:'ஆன்ம அமைப்பு',journey:'உங்கள் வாழ்க்கை பயணம்',career:'கர்மம் மற்றும் நோக்கம்',partner:'உறவுகள் மற்றும் கூட்டுறவு',strengths:'கிரக வரங்கள்',growth:'வளர்ச்சி மற்றும் முன்னேற்றம்',spiritual:'ஆன்மீக பாதை',current:'தற்போதைய திசை: ஆழ்ந்த பகுப்பாய்வு',challenge:'முக்கிய சவால்',suggestion:'வழிகாட்டுதல்',ages:'வயது',theme:'தொனி'},
challenge:{sun:'ஆணவம் மற்றும் அதிகப்படியான அங்கீகார ஆசையிலிருந்து விலகுங்கள்.',moon:'உணர்வு நெறிமுறை மற்றும் அதிக பற்றிலிருந்து விலகுங்கள்.',mars:'ஆற்றலை ஆக்கபூர்வமாக பயன்படுத்துங்கள் — வேகக் கோபம் மற்றும் மோதலிலிருந்து விலகுங்கள்.',mercury:'மன சிதறல் மற்றும் அதிக சிந்தனையிலிருந்து விலகுங்கள்.',jupiter:'அதிக தன்னம்பிக்கை அல்லது ஒழுக்க உபதேசத்திலிருந்து விலகுங்கள்.',venus:'அளவுகடந்த இன்பம் அல்லது உணர்வு சார்பிலிருந்து விலகுங்கள்.',saturn:'பொறுமை இன்றியமையாதது. குறுக்கு வழிகள் மற்றும் அதிருப்தியை தவிர்க்கவும்.',rahu:'லட்சியங்களை நேர்மையான செயல்களில் வைக்கவும்.',ketu:'அதிக விலகல் அல்லது சந்தேகத்திலிருந்து விலகுங்கள்.'},
suggest:{sun:'தலைமை மற்றும் சேவையில் நம்பிக்கையுடன் நடங்கள். சூரிய நமஸ்காரம் மிகவும் பயனுள்ளது.',moon:'படைப்பு வெளிப்பாடு மற்றும் குடும்ப தொடர்பு உணர்வு நலனை வளர்க்கிறது.',mars:'உடல் தகுதி மற்றும் தொழில் முயற்சிகளில் ஆற்றலை வழிநடத்துங்கள்.',mercury:'கற்றல், எழுத்து மற்றும் திறன் வளர்ப்பில் முதலீடு செய்யுங்கள்.',jupiter:'கல்வி, கற்பித்தல் மற்றும் தர்ம செயல்களில் ஈடுபடுங்கள்.',venus:'உறவுகள், கலை மற்றும் படைப்பாற்றலில் முதலீடு செய்யுங்கள்.',saturn:'பொறுமையுடன் நீண்டகால அடித்தளங்களை உருவாக்குங்கள்.',rahu:'புதுமை மற்றும் மாற்றங்களை தைரியமாக ஏற்றுக்கொள்ளுங்கள்.',ketu:'தியானம் மற்றும் ஆன்மீக கல்வியை ஆழப்படுத்துங்கள்.'},
overview:(ln,mn,mr,sp,yc)=>`இந்த ஜாதகம் ${ln} லக்னத்தில் அடித்தளமிட்டுள்ளது — ஜாதகரின் ஆளுமை மற்றும் வாழ்க்கை அணுகுமுறையை உருவாக்குகிறது. ${mn} நட்சத்திரம் (${mr})இல் சந்திரன் உணர்வு உலகை உணர்திறன் மற்றும் உள்ளுணர்வால் நிரப்புகிறார். ${sp.length>0?sp.join(' மற்றும் ')+'இல் அசாதாரண கிரக வலிமை உள்ளது.':'கிரக சக்திகள் பரவலாக பரவி பல்துறை ஆளுமையை உருவாக்குகின்றன.'} ${yc>0?yc+' ராஜ/தன யோகங்கள் உள்ளன — அங்கீகாரம் மற்றும் செழிப்புக்கான அதிக சாத்தியம்.':''}`,
career:(pk,tl,tlh,sp)=>{const t={sun:'அரசு, நிர்வாகம், மருத்துவம் மற்றும் தலைமை',moon:'விருந்தோம்பல், குணப்படுத்துதல் மற்றும் பொது சேவை',mars:'பொறியியல், இராணுவம், விளையாட்டு மற்றும் தொழில்முனைவு',mercury:'தொழில்நுட்பம், நிதி, எழுத்து மற்றும் கல்வி',jupiter:'சட்டம், கல்வி, வங்கி மற்றும் ஆலோசனை',venus:'கலை, நாகரிகம், பொழுதுபோக்கு மற்றும் இராஜதந்திரம்',saturn:'ஆராய்ச்சி, உற்பத்தி மற்றும் அரசு சேவை',rahu:'தொழில்நுட்பம், வெளிநாட்டு தொடர்பு மற்றும் புதுமை',ketu:'ஆராய்ச்சி, மருத்துவம் மற்றும் ஆன்மீக வழிகாட்டுதல்'};return`தசம பாவம் ${tl} ஆல் ஆளப்படுகிறது — ${tlh}வது பாவத்தில் — ${t[pk]||'சிறப்பு துறைகளில்'} இயல்பான திறமை. ${sp.includes('jupiter')?'குருவின் வலிமை தொழில்முறை வாழ்வில் ஞானம் சேர்க்கிறது. ':''} ${sp.includes('saturn')?'சனியின் வலிமை தொடர்ந்த முயற்சி கனிகளை உறுதிசெய்கிறது. ':''}`.replace(/\s+/g,' ').trim();},
partner:(sl,hm,vc)=>`ஏழாம் பாவம் ${sl} ஆல் ஆளப்படுகிறது. ${hm?'செவ்வாய் தோஷம் உள்ளது — மாங்கலிக துணை மற்றும் செவ்வாய் சாந்தி அவசியம்.':'உறவுகள் பரஸ்பர மரியாதை மற்றும் பொதுவான நோக்கத்தின் மீது கட்டமைக்கப்படும்.'} ${vc==='Strong'?'சுக்கிரன் வலிமையாக உள்ளார் — திருமண இன்பம் தெளிவாக சுட்டப்படுகிறது.':vc==='Weak'?'உறவுகளில் நன்றியுணர்வு மற்றும் மனத்திறமை வளர்க்கவும்.':'சுக்கிரன் உண்மையான முயற்சியுடன் சமநிலையான கூட்டுறவை ஆதரிக்கிறார்.'}`,
strengths:(n)=>`${n.join(', ')} இந்த ஜாதகத்தில் இயல்பான வலிமை மற்றும் ஆத்மா-அளவிலான நிபுணத்துவத்தின் மூலம். இங்கே திறமை சுலபமாக ஓடுகிறது.`,
growth:(n)=>`${n.join(', ')} இந்த வாழ்வில் கர்ம வளர்ச்சி பகுதிகளை சுட்டுகிறது. இவை பலவீனங்கள் அல்ல — பரிணமிக்க அழைப்பு. உபாயங்கள் மற்றும் விழிப்புணர்வால் சவால்கள் வலிமையாகும்.`,
spiritual:(nl,jh)=>`நவம பாவம் ${nl} ஆல் ஆளப்படுகிறது. ${jh===1||jh===9||jh===5?'குருவின் சுபமான தர்ம பாவ நிலை ஞானம் மற்றும் சேவை நோக்கி ஆழமான ஆத்மா.':jh===12?'12ல் குரு — விடுதலை நோக்கி ஆன்மீக வாழ்வு.':'குரு வாழ்க்கை அனுபவங்கள் மூலம் ஆன்மீக விழிப்புணர்வை ஆதரிக்கிறார்.'} தியானம், நூல் படிப்பு மற்றும் நிஷ்காம்ய சேவை எல்லாருக்கும் நல்ல பாதைகள்.`
},sa:{
labels:{overview:'आत्मस्वरूपम्',journey:'जीवनयात्रा',career:'कर्म उद्देश्यश्च',partner:'सम्बन्धाः साझेदारी च',strengths:'ग्रहवरदानानि',growth:'विकासः उन्नतिश्च',spiritual:'आध्यात्मिकमार्गः',current:'वर्तमानदशा: गहनविश्लेषणम्',challenge:'प्रमुखाव्हानम्',suggestion:'मार्गदर्शनम्',ages:'वयः',theme:'विषयः'},
challenge:{sun:'अहंकारात् अत्यधिकमान्यताकाङ्क्षायाश्च दूरं तिष्ठतु।',moon:'भावनात्मकप्रतिक्रियाशीलतायाः अत्यासक्तेश्च दूरं तिष्ठतु।',mars:'शक्तिं रचनात्मकरूपेण उपयुञ्जतु — आवेगनिर्णयेभ्यः सङ्घर्षाच्च विरमतु।',mercury:'मानसिकविक्षेपात् अतिचिन्तनाच्च विरमतु।',jupiter:'अत्यात्मविश्वासात् नैतिकोपदेशाच्च विरमतु।',venus:'अतिभोगात् भावनात्मकावलम्बनाच्च विरमतु।',saturn:'धैर्यम् अत्यावश्यकम्। लघुमार्गान् असंतोषं च त्यजतु।',rahu:'महत्त्वाकाङ्क्षाः नैतिककार्येषु स्थापयतु।',ketu:'अत्यधिकवैराग्यात् आत्मसन्देहाच्च विरमतु।'},
suggest:{sun:'नेतृत्वे सेवायां च आत्मविश्वासेन अग्रे तिष्ठतु। सूर्यनमस्कारः प्रातः प्रकाशश्च हितकरौ।',moon:'रचनात्मकाभिव्यक्तिः परिवारसम्पर्कश्च भावनात्मककल्याणं पोषयतः।',mars:'शारीरिकसाधना उद्यमेषु च शक्तिम् उपयुञ्जतु।',mercury:'अध्ययने लेखने कौशलनिर्माणे च निवेशं करोतु।',jupiter:'शिक्षणे अध्यापने धर्मकार्येषु च भाग लभतु।',venus:'सम्बन्धेषु कलायां सर्जनात्मकतायां च निवेशं करोतु।',saturn:'धैर्येण दीर्घकालीनं मूलं निर्मातु। अनुशासितसेवां कर्मयोगं च करोतु।',rahu:'नवाचारं परिवर्तनकारीअवसरांश्च धैर्येण स्वीकरोतु।',ketu:'ध्यानम् आध्यात्मिकाध्ययनं च गम्भीरं करोतु।'},
overview:(ln,mn,mr,sp,yc)=>`इयं कुण्डली ${ln} लग्नस्य उपरि प्रतिष्ठिता — जातकस्य स्वभावं जीवनविधानं च निर्माति। ${mn} नक्षत्रे (${mr}) चन्द्रः भावनात्मकजगत् सूक्ष्मतया अन्तर्ज्ञानेन च पूरयति। ${sp.length>0?sp.join(' च ')+' असाधारणा ग्रहशक्तिः।':'ग्रहशक्तयः विस्तृता बहुमुखव्यक्तित्वं सृजन्ति।'} ${yc>0?yc+' राजधनयोगाः उपस्थिताः।':''}`,
career:(pk,tl,tlh,sp)=>`दशमभावः ${tl} इत्यनेन शासितः — ${tlh}तमे भावे — विशेषक्षेत्रेषु स्वाभाविकसामर्थ्यं सूचयति। ${sp.includes('jupiter')?'गुरोः शक्तिः व्यावसायिकजीवने ज्ञानम् अधिकारं च योजयति। ':''} ${sp.includes('saturn')?'शनेः शक्तिः निरन्तरप्रयत्नात् सफलतां ददाति। ':''}`.replace(/\s+/g,' ').trim(),
partner:(sl,hm,vc)=>`सप्तमभावः ${sl} इत्यनेन शासितः। ${hm?'मङ्गलदोषः उपस्थितः — माङ्गलिकसङ्गिनः मङ्गलशान्तिश्च अनिवार्यौ।':'सम्बन्धाः परस्परसम्मानस्य साझोद्देश्यस्य च आधारेण निर्मिताः।'} ${vc==='Strong'?'शुक्रः शक्तिशाली — विवाहसुखं स्पष्टतया सूचितम्।':vc==='Weak'?'सम्बन्धेषु कृतज्ञतां मुक्तभावं च संवर्धयतु।':'शुक्रः प्रयत्नेन सन्तुलितसाझेदारिं समर्थयति।'}`,
strengths:(n)=>`${n.join(', ')} अस्यां कुण्डल्यां प्राकृतिकशक्तेः आत्मनिपुणतायाश्च मूलम्। अत्र प्रतिभा स्वाभाविकतया प्रवहति।`,
growth:(n)=>`${n.join(', ')} कार्मिकविकासक्षेत्राणि सूचयति। एतानि दौर्बल्यानि न — विकासाय आमन्त्रणम्।`,
spiritual:(nl,jh)=>`नवमभावः ${nl} इत्यनेन शासितः। ${jh===1||jh===9||jh===5?'गुरोः शुभस्थानस्थितिः ज्ञानसेवयोः उन्मुखाम् आत्मानं दर्शयति।':jh===12?'द्वादशे गुरुः मोक्षोन्मुखं आध्यात्मिकजीवनं दर्शयति।':'गुरुः अनुभवैः आध्यात्मिकजागरणं समर्थयति।'} ध्यानम् शास्त्राध्ययनं निस्स्वार्थसेवा च सर्वेषां हितकराः मार्गाः।`
},mr:{
labels:{overview:'आत्म्याचा आराखडा',journey:'तुमचा जीवन प्रवास',career:'कर्म आणि उद्देश',partner:'संबंध आणि भागीदारी',strengths:'ग्रहीय वरदाने',growth:'विकास आणि उन्नती',spiritual:'आध्यात्मिक मार्ग',current:'सध्याची दशा: सखोल विश्लेषण',challenge:'मुख्य आव्हान',suggestion:'मार्गदर्शन',ages:'वय',theme:'थीम'},
challenge:{sun:'अहंकार आणि जास्त मान्यतेच्या इच्छेपासून दूर राहा.',moon:'भावनिक प्रतिक्रियाशीलता आणि अति आसक्तीपासून दूर राहा.',mars:'शक्ती रचनात्मकपणे वापरा — आवेगी निर्णय आणि संघर्षापासून दूर राहा.',mercury:'मानसिक विखुरलेपणा आणि अति विचारापासून दूर राहा.',jupiter:'अति आत्मविश्वास किंवा नैतिक उपदेशापासून दूर राहा.',venus:'अति भोगविलास किंवा भावनिक अवलंबित्वापासून दूर राहा.',saturn:'धैर्य अत्यावश्यक आहे. शॉर्टकट आणि असमाधानापासून दूर राहा.',rahu:'महत्त्वाकांक्षा नैतिक कार्यात ठेवा.',ketu:'अति माघार किंवा आत्म-संशयापासून दूर राहा.'},
suggest:{sun:'नेतृत्व आणि सेवेत आत्मविश्वासाने पाऊल टाका. सूर्य नमस्कार खूप उपयुक्त आहे.',moon:'सर्जनशील अभिव्यक्ती आणि कौटुंबिक बंध भावनिक आरोग्य पोषतात.',mars:'शारीरिक तंदुरुस्ती किंवा उद्योग उपक्रमात शक्ती वापरा.',mercury:'शिक्षण, लेखन किंवा कौशल्य विकासात गुंतवणूक करा.',jupiter:'शिक्षण, अध्यापन आणि दानकार्यात सहभागी व्हा.',venus:'संबंध, कला आणि सर्जनशीलतेत गुंतवणूक करा.',saturn:'धैर्याने दीर्घकालीन पाया बांधा. शिस्तबद्ध सेवा करा.',rahu:'नवोपक्रम आणि बदल धाडसाने स्वीकारा.',ketu:'ध्यान आणि आध्यात्मिक अभ्यास खोल करा.'},
overview:(ln,mn,mr,sp,yc)=>`ही कुंडली ${ln} लग्नावर आधारित आहे — जातकाचे व्यक्तिमत्त्व आणि जीवनदृष्टी घडवते. ${mn} नक्षत्र (${mr})मध्ये चंद्र भावनिक जगत सूक्ष्मता आणि अंतर्ज्ञानाने भरतो. ${sp.length>0?sp.join(' आणि ')+'मध्ये असाधारण ग्रहशक्ती आहे.':'ग्रहशक्ती व्यापकपणे पसरलेली असून बहुमुखी व्यक्तिमत्त्व बनवते.'} ${yc>0?yc+' राज/धन योग उपस्थित — मान्यता आणि समृद्धीची उच्च क्षमता.':''}`,
career:(pk,tl,tlh,sp)=>{const t={sun:'शासन, प्रशासन, वैद्यकीय आणि नेतृत्व',moon:'आदरातिथ्य, उपचार आणि सार्वजनिक सेवा',mars:'अभियांत्रिकी, सैन्य, क्रीडा आणि उद्योजकता',mercury:'तंत्रज्ञान, वित्त, लेखन आणि शिक्षण',jupiter:'कायदा, शिक्षण, बँकिंग आणि सल्लागार',venus:'कला, फॅशन, मनोरंजन आणि मुत्सद्देगिरी',saturn:'संशोधन, उत्पादन आणि सरकारी सेवा',rahu:'तंत्रज्ञान, परदेशी संबंध आणि नवोपक्रम',ketu:'संशोधन, वैद्यकीय आणि आध्यात्मिक तज्ञता'};return`दशम भाव ${tl} द्वारे शासित — ${tlh}व्या भावात — ${t[pk]||'विशेष क्षेत्रांत'} नैसर्गिक क्षमता. ${sp.includes('jupiter')?'गुरूची शक्ती व्यावसायिक जीवनात ज्ञान आणि नैतिक अधिकार देते. ':''} ${sp.includes('saturn')?'शनीची शक्ती निरंतर प्रयत्नातून यश निश्चित करते. ':''}`.replace(/\s+/g,' ').trim();},
partner:(sl,hm,vc)=>`सप्तम भाव ${sl} द्वारे शासित आहे. ${hm?'मंगळ दोष आहे — मांगलिक जोडीदार आणि मंगळ शांती आवश्यक.':'संबंध पारस्परिक आदर आणि साझ्या उद्देशावर बांधले जातात.'} ${vc==='Strong'?'शुक्र बलवान — वैवाहिक सुख स्पष्टपणे सूचित.':vc==='Weak'?'संबंधांत कृतज्ञता आणि मनमोकळेपणा वाढवा.':'शुक्र प्रामाणिक प्रयत्नाने संतुलित भागीदारी समर्थन करतो.'}`,
strengths:(n)=>`${n.join(', ')} या कुंडलीत नैसर्गिक शक्ती आणि आत्मा-पातळीवरील निपुणतेचे स्रोत आहेत. येथे प्रतिभा सहजपणे वाहते.`,
growth:(n)=>`${n.join(', ')} या जन्मात कार्मिक विकास क्षेत्र सूचित करतात. ही कमजोरी नव्हे — उत्क्रांतीसाठी आमंत्रण आहे.`,
spiritual:(nl,jh)=>`नवम भाव ${nl} द्वारे शासित आहे. ${jh===1||jh===9||jh===5?'गुरूची शुभ धर्म भावातील स्थिती ज्ञान आणि सेवेकडे उन्मुख आत्मा दर्शवते.':jh===12?'बाराव्या भावात गुरू — मोक्ष-उन्मुख आध्यात्मिक जीवन.':'गुरू जीवन अनुभवातून आध्यात्मिक विकास समर्थन करतो.'} साधना, शास्त्र अभ्यास आणि नि:स्वार्थ सेवा सर्वांसाठी उत्तम मार्ग आहेत.`
},gu:{
labels:{overview:'આત્માની યોજના',journey:'તમારી જીવન યાત્રા',career:'કર્મ અને ઉદ્દેશ',partner:'સંબંધ અને ભાગીદારી',strengths:'ગ્રહ વરદાન',growth:'વિકાસ અને પ્રગતિ',spiritual:'આધ્યાત્મિક માર્ગ',current:'વર્તમાન દશા: ઊંડું વિશ્લેષણ',challenge:'મુખ્ય પડકાર',suggestion:'માર્ગદર્શન',ages:'ઉંમર',theme:'થીમ'},
challenge:{sun:'અહંકાર અને વધુ પ્રખ્યાતિની ઇચ્છાથી દૂર રહો.',moon:'ભાવનાત્મક પ્રતિક્રિયા અને અતિ આસક્તિથી દૂર રહો.',mars:'શક્તિ સર્જનાત્મક રીતે વાપરો — આવેગ અને સંઘર્ષ ટાળો.',mercury:'મન ભ્રમ અને અતિ વિચારથી દૂર રહો.',jupiter:'અતિ આત્મવિશ્વાસ અથવા નૈતિક ઉપદેશ ટાળો.',venus:'અતિ ભોગ અથવા ભાવનાત્મક નિર્ભરતા ટાળો.',saturn:'ધૈર્ય અત્યંત જરૂરી. ટૂંકા રસ્તા અને અસંતોષ ટાળો.',rahu:'ધ્યેય નૈતિક ક્રિયામાં રાખો.',ketu:'અતિ ખસવું અથવા આત્મ-સંદેહ ટાળો.'},
suggest:{sun:'નેતૃત્વ અને સેવામાં આત્મવિશ્વાસ સાથે આગળ વધો. સૂર્ય નમસ્કાર ઉપકારી છે.',moon:'સૃજનાત્મક અભિવ્યક્તિ અને કૌટુંબિક સંપર્ક ભાવનાત્મક સ્વાસ્થ્ય જાળવે છે.',mars:'શારીરિક ફિટનેસ અથવા ઉદ્યોગ ઉપક્રમોમાં શક્તિ વાપરો.',mercury:'શિક્ષણ, લેખન અથવા કૌશલ્ય નિર્માણમાં રોકાણ કરો.',jupiter:'શિક્ષણ, અધ્યાપન અને ધર્મ કાર્યોમાં ભાગ લો.',venus:'સંબંધો, કળા અને સૃજનાત્મકતામાં રોકાણ કરો.',saturn:'ધૈર્ય સાથે લાંબા ગાળાના પાયા બાંધો.',rahu:'નવીનતા અને પરિવર્તન ધૈર્ય સાથે સ્વીકારો.',ketu:'ધ્યાન અને આધ્યાત્મિક અભ્યાસ ઊંડો કરો.'},
overview:(ln,mn,mr,sp,yc)=>`આ કુંડળી ${ln} લગ્ન પર આધારિત છે — જ્ઞાતિની મૂળ વ્યક્તિત્વ અને જીવન અભિગમ ઘડે છે. ${mn} નક્ષત્ર (${mr})માં ચંદ્ર ભાવનાત્મક દુનિયાને સૂક્ષ્મતા અને અંર્જ્ઞાનથી ભરે છે. ${sp.length>0?sp.join(' અને ')+'માં અસાધારણ ગ્રહ શક્તિ છે.':'ગ્રહ શક્તિ વ્યાપક રીતે ફેલાઈ બહુમુખ વ્યક્તિત્વ બનાવે છે.'} ${yc>0?yc+' રાજ/ધન યોગ ઉપસ્થિત.':''}`,
career:(pk,tl,tlh,sp)=>{const t={sun:'સરકાર, વહીવટ, તબીબ અને નેતૃત્વ',moon:'આતિથ્ય, ઉપચાર અને સાર્વજનિક સેવા',mars:'ઇજનેરી, સૈન્ય, રમતગમત અને ઉદ્યોગ',mercury:'ટેક્નોલોજી, નાણાં, લેખન અને શિક્ષણ',jupiter:'કાયદો, શિક્ષણ, બેન્કિંગ અને સલાહ',venus:'કળા, ફેશન, મનોરંજન અને રાજદ્વારી',saturn:'સંશોધન, ઉત્પાદન અને સરકારી સેવા',rahu:'ટેક્નોલોજી, વિદેશ સંબંધ અને નવીનતા',ketu:'સંશોધન, તબીબ અને આધ્યાત્મિક નિષ્ણાતતા'};return`દશમ ભાવ ${tl} દ્વારા શાસિત — ${tlh}માં ભાવમાં — ${t[pk]||'ખાસ ક્ષેત્રોમાં'} સ્વાભાવિક ક્ષમતા. ${sp.includes('jupiter')?'ગુરુની શક્તિ વ્યાવસાયિક જીવનમાં જ્ઞાન અને નૈતિક અધિકાર ઉમેરે છે. ':''} ${sp.includes('saturn')?'શનિની શક્તિ નિરંતર મહેનત સફળ કરે છે. ':''}`.replace(/\s+/g,' ').trim();},
partner:(sl,hm,vc)=>`સાતમો ભાવ ${sl} દ્વારા શાસિત. ${hm?'મંગળ દોષ છે — માંગળિક સાથી અને મંગળ શાંતિ જરૂરી.':'સંબંધ પારસ્પરિક સન્માન અને સહ ઉદ્દેશ પર બાંધવામાં આવે છે.'} ${vc==='Strong'?'શુક્ર બળવાન — વૈવાહિક સુખ સ્પષ્ટ.':vc==='Weak'?'સંબંધોમાં કૃતજ્ઞતા અને ઉદારતા વધારો.':'શુક્ર સાચા પ્રયત્ન સાથે સંતુલિત ભાગીદારી ટેકો આપે છે.'}`,
strengths:(n)=>`${n.join(', ')} આ કુંડળીમાં કુદરતી શક્તિ અને આત્મ-નિપુણતાનો સ્ત્રોત. અહીં પ્રતિભા સહજ રીતે વહે છે.`,
growth:(n)=>`${n.join(', ')} આ જન્મમાં કર્મ વિકાસ ક્ષેત્ર સૂચવે છે. આ નબળાઈ નથી — ઉત્ક્રાંતિ માટે આમંત્રણ.`,
spiritual:(nl,jh)=>`નવમ ભાવ ${nl} દ્વારા શાસિત. ${jh===1||jh===9||jh===5?'ગુરુની શુભ ધર્મ ભાવ સ્થિતિ જ્ઞાન અને સેવા તરફ ઉન્મુખ આત્મા.':jh===12?'બારમા ભાવમાં ગુરુ — મોક્ષ-ઉન્મુખ આધ્યાત્મિક જીવન.':'ગુરુ અનુભવ દ્વારા આધ્યાત્મિક વિકાસ ટેકો આપે છે.'} ધ્યાન, ગ્રંથ અભ્યાસ અને નિઃસ્વાર્થ સેવા સૌ માટે ઉત્તમ માર્ગ.`
},bn:{
labels:{overview:'আত্মার নকশা',journey:'আপনার জীবন যাত্রা',career:'কর্ম ও উদ্দেশ্য',partner:'সম্পর্ক ও অংশীদারিত্ব',strengths:'গ্রহীয় বরদান',growth:'বিকাশ ও উন্নতি',spiritual:'আধ্যাত্মিক পথ',current:'বর্তমান দশা: গভীর বিশ্লেষণ',challenge:'মূল চ্যালেঞ্জ',suggestion:'পথনির্দেশ',ages:'বয়স',theme:'থিম'},
challenge:{sun:'অহংকার ও অতিরিক্ত স্বীকৃতির আকাঙ্ক্ষা থেকে দূরে থাকুন।',moon:'আবেগীয় প্রতিক্রিয়া ও অতি আসক্তি থেকে দূরে থাকুন।',mars:'শক্তি গঠনমূলকভাবে ব্যবহার করুন — আবেগী সিদ্ধান্ত ও দ্বন্দ্ব এড়িয়ে চলুন।',mercury:'মানসিক বিক্ষিপ্ততা ও অতি চিন্তা থেকে দূরে থাকুন।',jupiter:'অতি আত্মবিশ্বাস বা নৈতিক উপদেশ থেকে দূরে থাকুন।',venus:'অতি ভোগ বা আবেগীয় নির্ভরতা থেকে দূরে থাকুন।',saturn:'ধৈর্য অপরিহার্য। শর্টকাট ও অসন্তোষ এড়িয়ে চলুন।',rahu:'উচ্চাকাঙ্ক্ষা নৈতিক কাজে রাখুন।',ketu:'অতি প্রত্যাহার বা আত্ম-সন্দেহ থেকে দূরে থাকুন।'},
suggest:{sun:'নেতৃত্ব ও সেবায় আত্মবিশ্বাসের সাথে এগিয়ে যান। সূর্য নমস্কার অত্যন্ত উপকারী।',moon:'সৃজনশীল প্রকাশ ও পারিবারিক সম্পর্ক আবেগীয় স্বাস্থ্য পুষ্ট করে।',mars:'শারীরিক সক্ষমতা বা উদ্যোগে শক্তি লাগান।',mercury:'শেখা, লেখা বা দক্ষতা নির্মাণে বিনিয়োগ করুন।',jupiter:'শিক্ষা, শিক্ষণ ও দানকার্যে অংশ নিন।',venus:'সম্পর্ক, শিল্প ও সৃজনশীলতায় বিনিয়োগ করুন।',saturn:'ধৈর্যের সাথে দীর্ঘমেয়াদী ভিত্তি গড়ুন।',rahu:'উদ্ভাবন ও পরিবর্তন সাহসিকতার সাথে গ্রহণ করুন।',ketu:'ধ্যান ও আধ্যাত্মিক অধ্যয়ন গভীর করুন।'},
overview:(ln,mn,mr,sp,yc)=>`এই কুণ্ডলী ${ln} লগ্নের উপর ভিত্তি করে গড়ে উঠেছে — জাতকের মূল ব্যক্তিত্ব ও জীবনের পদ্ধতি গঠন করে। ${mn} নক্ষত্র (${mr})এ চন্দ্র আবেগের জগৎকে সূক্ষ্মতা ও অন্তর্জ্ঞান দিয়ে পূর্ণ করে। ${sp.length>0?sp.join(' ও ')+'তে অসাধারণ গ্রহশক্তি প্রবাহিত।':'গ্রহশক্তি ব্যাপকভাবে বিতরণ করে বহুমুখী ব্যক্তিত্ব তৈরি করে।'} ${yc>0?yc+' রাজ/ধন যোগ উপস্থিত।':''}`,
career:(pk,tl,tlh,sp)=>{const t={sun:'সরকার, প্রশাসন, চিকিৎসা ও নেতৃত্ব',moon:'আতিথেয়তা, নিরাময় ও সর্বজনীন সেবা',mars:'প্রকৌশল, সামরিক, ক্রীড়া ও উদ্যোক্তা',mercury:'প্রযুক্তি, অর্থ, লেখা ও শিক্ষা',jupiter:'আইন, শিক্ষা, ব্যাংকিং ও পরামর্শ',venus:'শিল্প, ফ্যাশন, বিনোদন ও কূটনীতি',saturn:'গবেষণা, উৎপাদন ও সরকারি সেবা',rahu:'প্রযুক্তি, বিদেশ সম্পর্ক ও উদ্ভাবন',ketu:'গবেষণা, চিকিৎসা ও আধ্যাত্মিক দক্ষতা'};return`দশম ভাব ${tl} দ্বারা শাসিত — ${tlh}তম ভাবে — ${t[pk]||'বিশেষ ক্ষেত্রে'} স্বাভাবিক সামর্থ্য। ${sp.includes('jupiter')?'বৃহস্পতির শক্তি পেশাজীবনে জ্ঞান ও নৈতিক কর্তৃত্ব যোগ করে। ':''} ${sp.includes('saturn')?'শনির শক্তি নিরন্তর প্রচেষ্টায় সাফল্য নিশ্চিত করে। ':''}`.replace(/\s+/g,' ').trim();},
partner:(sl,hm,vc)=>`সপ্তম ভাব ${sl} দ্বারা শাসিত। ${hm?'মঙ্গল দোষ আছে — মাঙ্গলিক সঙ্গী ও মঙ্গল শান্তি অপরিহার্য।':'সম্পর্ক পারস্পরিক সম্মান ও ভাগাভাগি লক্ষ্যের উপর গড়ে উঠবে।'} ${vc==='Strong'?'শুক্র শক্তিশালী — বৈবাহিক সুখ স্পষ্টভাবে নির্দেশিত।':vc==='Weak'?'সম্পর্কে কৃতজ্ঞতা ও উদারতা বিকাশ করুন।':'শুক্র সত্যিকারের প্রচেষ্টায় সুষম অংশীদারিত্ব সমর্থন করে।'}`,
strengths:(n)=>`${n.join(', ')} এই কুণ্ডলীতে প্রাকৃতিক শক্তি ও আত্মা-স্তরীয় দক্ষতার উৎস। এখানে প্রতিভা সহজভাবে প্রবাহিত হয়।`,
growth:(n)=>`${n.join(', ')} এই জন্মে কার্মিক বিকাশের ক্ষেত্র নির্দেশ করে। এগুলো দুর্বলতা নয় — বিবর্তনের আমন্ত্রণ।`,
spiritual:(nl,jh)=>`নবম ভাব ${nl} দ্বারা শাসিত। ${jh===1||jh===9||jh===5?'বৃহস্পতির শুভ ধর্ম ভাব অবস্থান জ্ঞান ও সেবামুখী আত্মা প্রকাশ করে।':jh===12?'দ্বাদশে বৃহস্পতি — মোক্ষমুখী আধ্যাত্মিক জীবন।':'বৃহস্পতি অভিজ্ঞতা দিয়ে আধ্যাত্মিক বিকাশ সমর্থন করে।'} ধ্যান, শাস্ত্র অধ্যয়ন ও নিস্বার্থ সেবা সবার জন্য শুভ পথ।`
},ml:{
labels:{overview:'ആത്മാവിന്റെ ബ്ലൂപ്രിന്റ്',journey:'നിങ്ങളുടെ ജീവിത യാത്ര',career:'കർമ്മവും ഉദ്ദേശ്യവും',partner:'ബന്ധങ്ങളും പങ്കാളിത്തവും',strengths:'ഗ്രഹ വരദാനങ്ങൾ',growth:'വളർച്ചയും വികാസവും',spiritual:'ആത്മീയ പാത',current:'വർത്തമാന ദശ: ആഴത്തിലുള്ള വിശകലനം',challenge:'പ്രധാന വെല്ലുവിളി',suggestion:'മാർഗദർശനം',ages:'പ്രായം',theme:'വിഷയം'},
challenge:{sun:'അഹംഭാവവും അമിത അംഗീകാര ആഗ്രഹവും ഒഴിവാക്കൂ.',moon:'വൈകാരിക പ്രതിക്രിയയും അമിത ആസക്തിയും ഒഴിവാക്കൂ.',mars:'ഊർജ്ജം ഗഠനാത്മകമായി ഉപയോഗിക്കൂ — ആവേശ തീരുമാനങ്ങൾ ഒഴിവാക്കൂ.',mercury:'മാനസിക ചിതറൽ അഥവ അതിചിന്ത ഒഴിവാക്കൂ.',jupiter:'അമിത ആത്മവിശ്വാസം അഥവ ധർമ്മ ഉപദേശം ഒഴിവാക്കൂ.',venus:'അമിത ഭോഗം അഥവ വൈകാരിക ആശ്രയം ഒഴിവാക്കൂ.',saturn:'ക്ഷമ അത്യന്തം ആവശ്യം. ചുരുക്കുവഴികൾ ഒഴിവാക്കൂ.',rahu:'ലക്ഷ്യങ്ങൾ നൈതിക കർമ്മത്തിൽ നിലനിർത്തൂ.',ketu:'അമിത പിൻവലിയൽ അഥവ ആത്മ സംശയം ഒഴിവാക്കൂ.'},
suggest:{sun:'നേതൃത്വത്തിലും സേവനത്തിലും ആത്മവിശ്വാസത്തോടെ മുന്നേറൂ. സൂര്യ നമസ്ക്കാരം ഏറ്റവും ഉചിതം.',moon:'സൃജനാത്മക ആവിഷ്ക്കാരവും കുടുംബ ബന്ധങ്ങളും വൈകാരിക ആരോഗ്യം പോഷിപ്പിക്കുന്നു.',mars:'ശാരീരിക ക്ഷമതയിലോ ഉദ്യോഗ സംരംഭങ്ങളിലോ ഊർജ്ജം വഴിതിരിക്കൂ.',mercury:'പഠനം, എഴുത്ത്, കഴിവ് നിർമ്മാണം എന്നിവയിൽ നിക്ഷേപിക്കൂ.',jupiter:'വിദ്യ, അധ്യാപനം, ദാനകർമ്മം എന്നിവ ഏറ്റെടുക്കൂ.',venus:'ബന്ധങ്ങൾ, കല, സൃജനാത്മകത എന്നിവയിൽ നിക്ഷേപിക്കൂ.',saturn:'ക്ഷമയോടെ ദീർഘകാല അടിത്തറ നിർമ്മിക്കൂ.',rahu:'നവീനതയും മാറ്റങ്ങളും ധൈര്യത്തോടെ സ്വീകരിക്കൂ.',ketu:'ധ്യാനവും ആത്മീയ പഠനവും ആഴത്തിലാക്കൂ.'},
overview:(ln,mn,mr,sp,yc)=>`ഈ ജാതകം ${ln} ലഗ്നത്തിൽ അടിത്തറ ഇട്ടിരിക്കുന്നു — ജാതകന്റെ മൂല വ്യക്തിത്വവും ജീവിത സമീപനവും രൂപപ്പെടുത്തുന്നു. ${mn} നക്ഷത്രം (${mr})ൽ ചന്ദ്രൻ വൈകാരിക ലോകത്തെ സൂക്ഷ്മതയും ഉൾക്കാഴ്ചയും കൊണ്ട് നിറക്കുന്നു. ${sp.length>0?sp.join(' ഉം ')+'ൽ അസാധാരണ ഗ്രഹ ശക്തി ഒഴുകുന്നു.':'ഗ്രഹ ശക്തികൾ വിശാലമായി വ്യാപിച്ച് ബഹുമുഖ വ്യക്തിത്വം സൃഷ്ടിക്കുന്നു.'} ${yc>0?yc+' രാജ/ധന യോഗങ്ങൾ ഉണ്ട്.':''}`,
career:(pk,tl,tlh,sp)=>{const t={sun:'ഗവൺമെന്റ്, ഭരണം, വൈദ്യശാസ്ത്രം, നേതൃത്വം',moon:'ആതിഥ്യം, ചികിത്സ, പൊതു സേവനം',mars:'എഞ്ചിനീയറിംഗ്, സൈന്യം, കായികം, സംരംഭം',mercury:'സാങ്കേതികവിദ്യ, ധനകാര്യം, എഴുത്ത്, വിദ്യ',jupiter:'നിയമം, വിദ്യ, ബാങ്കിംഗ്, ഉപദേശം',venus:'കല, ഫാഷൻ, വിനോദം, നയതന്ത്രം',saturn:'ഗവേഷണം, ഉൽപ്പാദനം, ഗവൺമെന്റ് സേവനം',rahu:'സാങ്കേതികവിദ്യ, വിദേശ ബന്ധം, നവീനത',ketu:'ഗവേഷണം, വൈദ്യശാസ്ത്രം, ആത്മീയ വൈദഗ്ധ്യം'};return`ദശമ ഭാവം ${tl} ഭരിക്കുന്നു — ${tlh}ആം ഭാവത്തിൽ — ${t[pk]||'പ്രത്യേക മേഖലകളിൽ'} സ്വഭാവിക സാമർഥ്യം. ${sp.includes('jupiter')?'വ്യാഴത്തിന്റെ ശക്തി തൊഴിൽ ജീവിതത്തിൽ ജ്ഞാനം ചേർക്കുന്നു. ':''} ${sp.includes('saturn')?'ശനിയുടെ ശക്തി നിരന്തര പ്രയത്നം ഫലം നൽകുമെന്ന് ഉറപ്പ് നൽകുന്നു. ':''}`.replace(/\s+/g,' ').trim();},
partner:(sl,hm,vc)=>`ഏഴാം ഭാവം ${sl} ഭരിക്കുന്നു. ${hm?'ചൊവ്വ ദോഷം ഉണ്ട് — മാംഗലിക പങ്കാളി, ചൊവ്വ ശാന്തി അനിവാര്യം.':'ബന്ധങ്ങൾ പരസ്പര ബഹുമാനത്തിലും ഒത്തൊരുമിച്ച ലക്ഷ്യത്തിലും നിർമ്മിക്കപ്പെടും.'} ${vc==='Strong'?'ശുക്രൻ ശക്തൻ — വൈവാഹിക സുഖം വ്യക്തമായി സൂചിതം.':vc==='Weak'?'ബന്ധങ്ങളിൽ കൃതജ്ഞതയും ഉദാരതയും വളർത്തൂ.':'ശുക്രൻ യഥാർഥ ശ്രമത്തോടൊപ്പം സന്തുലിത പങ്കാളിത്തം പിന്തുണക്കുന്നു.'}`,
strengths:(n)=>`${n.join(', ')} ഈ ജാതകത്തിൽ സ്വഭാവിക ശക്തിയുടെയും ആത്മ-നൈപുണ്യത്തിന്റെയും ഉറവിടം. ഇവിടെ പ്രതിഭ സ്വഭാവമായി ഒഴുകുന്നു.`,
growth:(n)=>`${n.join(', ')} ഈ ജന്മത്തിൽ കർമ്മ വളർച്ചയുടെ മേഖലകൾ സൂചിപ്പിക്കുന്നു. ഇവ ദൗർബ്ബല്യങ്ങൾ അല്ല — പരിണാമത്തിനുള്ള ക്ഷണം.`,
spiritual:(nl,jh)=>`നവം ഭാവം ${nl} ഭരിക്കുന്നു. ${jh===1||jh===9||jh===5?'വ്യാഴത്തിന്റെ ശുഭ ധർമ്മ ഭാവ സ്ഥാനം ജ്ഞാനത്തിലും സേവനത്തിലും ആഴ്ന്ന ആത്മാവ്.':jh===12?'12ൽ വ്യാഴം — മോക്ഷ-ഉന്മുഖ ആത്മീയ ജീവിതം.':'വ്യാഴം അനുഭവങ്ങൾ വഴി ആത്മീയ ഉണർവ് പിന്തുണക്കുന്നു.'} ധ്യാനം, ഗ്രന്ഥ പഠനം, നിസ്സ്വാർഥ സേവനം — ഏവർക്കും ഗുണകരം.`
}};


const L_STRUCT={
en:{inKendra:'in Kendra',relationship:'relationship',conjunct:'conjunct',ownExalt:'in own/exalted sign',inHouse:'in {n}th house',allPlanets:'All planets',between:'between',axis:'axis'},
hi:{inKendra:'केंद्र में',relationship:'संबंध',conjunct:'युति',ownExalt:'स्वगृही/उच्च राशि में',inHouse:'{n}वें भाव में',allPlanets:'सभी ग्रह',between:'के बीच',axis:'अक्ष'},
kn:{inKendra:'ಕೇಂದ್ರದಲ್ಲಿ',relationship:'ಸಂಬಂಧ',conjunct:'ಯುತಿ',ownExalt:'ಸ್ವಕ್ಷೇತ್ರ/ಉಚ್ಚ ರಾಶಿಯಲ್ಲಿ',inHouse:'{n}ನೇ ಭಾವದಲ್ಲಿ',allPlanets:'ಎಲ್ಲಾ ಗ್ರಹಗಳು',between:'ನಡುವೆ',axis:'ಅಕ್ಷ'},
te:{inKendra:'కేంద్రంలో',relationship:'సంబంధం',conjunct:'యుతి',ownExalt:'స్వక్షేత్ర/ఉచ్చ రాశిలో',inHouse:'{n}వ భావంలో',allPlanets:'అన్ని గ్రహాలు',between:'మధ్య',axis:'అక్షం'},
ta:{inKendra:'கேந்திரத்தில்',relationship:'உறவு',conjunct:'சேர்க்கை',ownExalt:'சொந்த/உச்ச ராசியில்',inHouse:'{n}ஆம் பாவத்தில்',allPlanets:'அனைத்து கிரகங்களும்',between:'இடையே',axis:'அச்சு'},
sa:{inKendra:'केन्द्रे',relationship:'सम्बन्धः',conjunct:'युतिः',ownExalt:'स्वक्षेत्रे/उच्चराशौ',inHouse:'{n}भावे',allPlanets:'सर्वे ग्रहाः',between:'मध्ये',axis:'अक्षः'},
mr:{inKendra:'केंद्रात',relationship:'संबंध',conjunct:'युती',ownExalt:'स्वगृही/उच्च राशीत',inHouse:'{n}व्या भावात',allPlanets:'सर्व ग्रह',between:'दरम्यान',axis:'अक्ष'},
gu:{inKendra:'કેન્દ્રમાં',relationship:'સંબંધ',conjunct:'યુતિ',ownExalt:'સ્વક્ષેત્ર/ઉચ્ચ રાશિમાં',inHouse:'{n}મા ભાવમાં',allPlanets:'બધા ગ્રહો',between:'વચ્ચે',axis:'અક્ષ'},
bn:{inKendra:'কেন্দ্রে',relationship:'সম্পর্ক',conjunct:'যুতি',ownExalt:'স্বক্ষেত্র/উচ্চ রাশিতে',inHouse:'{n}ম ভাবে',allPlanets:'সমস্ত গ্রহ',between:'মধ্যে',axis:'অক্ষ'},
ml:{inKendra:'കേന്ദ്രത്തിൽ',relationship:'ബന്ധം',conjunct:'യുതി',ownExalt:'സ്വക്ഷേത്ര/ഉച്ച രാശിയിൽ',inHouse:'{n}ാം ഭാവത്തിൽ',allPlanets:'എല്ലാ ഗ്രഹങ്ങളും',between:'ഇടയിൽ',axis:'അക്ഷം'}
};
function localizeYogaPlanets(str, lang) {
  if (!str || lang === 'en') return str;
  const G = L_GRAHA[lang] || L_GRAHA.en;
  const P = L_STRUCT[lang] || L_STRUCT.en;
  let s = str;
  s = s.replace(/\bSun\b/g, G.sun).replace(/\bMoon\b/g, G.moon).replace(/\bMars\b/g, G.mars);
  s = s.replace(/\bMercury\b/g, G.mercury).replace(/\bJupiter\b/g, G.jupiter).replace(/\bVenus\b/g, G.venus);
  s = s.replace(/\bSaturn\b/g, G.saturn).replace(/\bRahu\b/g, G.rahu).replace(/\bKetu\b/g, G.ketu);
  s = s.replace(/in Kendra/g, P.inKendra).replace(/relationship/g, P.relationship);
  s = s.replace(/conjunct/g, P.conjunct);
  s = s.replace(/in own\/exalted sign/g, P.ownExalt);
  s = s.replace(/in (\d+)th house/g, (m,n) => P.inHouse.replace('{n}',n));
  s = s.replace(/All planets/g, P.allPlanets).replace(/between/g, P.between);
  return s;
}


const L_HMONTH={
en:['Chaitra','Vaisakha','Jyeshtha','Ashadha','Shravana','Bhadrapada','Ashvina','Kartika','Margashirsha','Pausha','Magha','Phalguna'],
hi:['चैत्र','वैशाख','ज्येष्ठ','आषाढ','श्रावण','भाद्रपद','आश्विन','कार्तिक','मार्गशीर्ष','पौष','माघ','फाल्गुन'],
kn:['ಚೈತ್ರ','ವೈಶಾಖ','ಜ್ಯೇಷ್ಠ','ಆಷಾಢ','ಶ್ರಾವಣ','ಭಾದ್ರಪದ','ಆಶ್ವಿನ','ಕಾರ್ತಿಕ','ಮಾರ್ಗಶಿರ','ಪೌಷ','ಮಾಘ','ಫಾಲ್ಗುಣ'],
te:['చైత్రం','వైశాఖం','జ్యేష్ఠం','ఆషాఢం','శ్రావణం','భాద్రపదం','ఆశ్వయుజం','కార్తీకం','మార్గశిరం','పుష్యం','మాఘం','ఫాల్గుణం'],
ta:['சித்திரை','வைகாசி','ஆனி','ஆடி','ஆவணி','புரட்டாசி','ஐப்பசி','கார்த்திகை','மார்கழி','தை','மாசி','பங்குனி'],
sa:['चैत्रः','वैशाखः','ज्येष्ठः','आषाढः','श्रावणः','भाद्रपदः','आश्विनः','कार्तिकः','मार्गशीर्षः','पौषः','माघः','फाल्गुनः'],
mr:['चैत्र','वैशाख','ज्येष्ठ','आषाढ','श्रावण','भाद्रपद','आश्विन','कार्तिक','मार्गशीर्ष','पौष','माघ','फाल्गुन'],
gu:['ચૈત્ર','વૈશાખ','જ્યેષ્ઠ','અષાઢ','શ્રાવણ','ભાદ્રપદ','આસો','કાર્તિક','માર્ગશીર્ષ','પોષ','મહા','ફાગણ'],
bn:['চৈত্র','বৈশাখ','জ্যৈষ্ঠ','আষাঢ','শ্রাবণ','ভাদ্র','আশ্বিন','কার্তিক','অগ্রহায়ণ','পৌষ','মাঘ','ফাল্গুন'],
ml:['ചൈത്രം','വൈശാഖം','ജ്യേഷ്ഠം','ആഷാഢം','ശ്രാവണം','ഭാദ്രപദം','ആശ്വിനം','കാർത്തിക','മാർഗശീർഷം','പൗഷം','മാഘം','ഫാൽഗുനം']};
const SAMVATSARA=['Prabhava','Vibhava','Shukla','Pramoda','Prajapati','Angirasa','Shreemukha','Bhava','Yuva','Dhatri','Ishvara','Bahudhanya','Pramathi','Vikrama','Vrisha','Chitrabhanu','Subhanu','Tarana','Parthiva','Vyaya','Sarvajit','Sarvadharin','Virodhi','Vikrita','Khara','Nandana','Vijaya','Jaya','Manmatha','Durmukhi','Hevilambi','Vilambi','Vikari','Sharvari','Plava','Shubhakruti','Sobhakruti','Krodhi','Vishvavasu','Parabhava','Plavanga','Keelaka','Saumya','Sadharana','Virodhakrit','Paridhaavi','Pramadeecha','Ananda','Rakshasa','Nala','Pingala','Kalayukti','Siddhartha','Raudra','Durmathi','Dundubhi','Rudhirodgari','Raktakshi','Krodhana','Akshaya'];
export function localizePanchang(pan, lang) {
  if (!pan || lang === 'en') return pan;
  const tA=L_TITHI[lang]||L_TITHI.en, vA=L_VARA[lang]||L_VARA.en, pO=L_PAKSHA[lang]||L_PAKSHA.en;
  const yA=L_YOGA_PANCH[lang]||L_YOGA_PANCH.en, kA=L_KARANA[lang]||L_KARANA.en, nA=L_NAKS[lang]||L_NAKS.en;
  const ti=pan.tithiIdx!=null?(tA[pan.tithiIdx]||pan.tithi.split(' (')[0])+' ('+(pO[pan.pakshaKey]||'')+')':pan.tithi;
  const va=pan.varaIdx!=null?(vA[pan.varaIdx]||pan.vara):pan.vara;
  const na=pan.nakIdx!=null?(nA[pan.nakIdx]||pan.nakshatra):pan.nakshatra;
  const yo=pan.yogaIdx!=null?(yA[pan.yogaIdx]||pan.yoga):pan.yoga;
  const ka=pan.karanaIdx!=null?(kA[pan.karanaIdx]||pan.karana):pan.karana;
  return{tithi:ti,vara:va,nakshatra:na,yoga:yo,karana:ka};
}

// ════════════════════════════════════════════════════════════════
// LOCALIZATION: PANCHANG, PREDICTIONS, PHASES
// ════════════════════════════════════════════════════════════════
const L_PANCHANG={
en:{title:"Today's Drik Panchang",core:'Core Panchang',astro:'Astronomical Data',inaus:'Inauspicious Timings',ausp:'Auspicious Timings',
tithi:'Tithi',vara:'Vara',nakshatra:'Nakshatra',yoga:'Yoga',karana:'Karana',paksha:'Paksha',
sunrise:'Sunrise',sunset:'Sunset',moonrise:'Moonrise',moonPhase:'Moon Phase',sunRashi:'Sun (Rashi)',moonRashi:'Moon (Rashi)',
ayanamsa:'Ayanamsa',vsMonth:'VS & Month',rahuKala:'Rahu Kala',yamaghanda:'Yamaghanda',gulika:'Gulika',
abhijit:'Abhijit Muhurta',hora:'Current Hora',footer:'Expert-level Drik Panchang · Based on your location',
shukla:'Shukla',krishna:'Krishna'},
hi:{title:'आज का दृक् पंचांग',core:'मूल पंचांग',astro:'खगोलीय आँकड़े',inaus:'अशुभ समय',ausp:'शुभ समय',
tithi:'तिथि',vara:'वार',nakshatra:'नक्षत्र',yoga:'योग',karana:'करण',paksha:'पक्ष',
sunrise:'सूर्योदय',sunset:'सूर्यास्त',moonrise:'चंद्रोदय',moonPhase:'चंद्र कला',sunRashi:'सूर्य (राशि)',moonRashi:'चंद्र (राशि)',
ayanamsa:'अयनांश',vsMonth:'संवत् एवं माह',rahuKala:'राहु काल',yamaghanda:'यमघंट',gulika:'गुलिक',
abhijit:'अभिजित मुहूर्त',hora:'वर्तमान होरा',footer:'विशेषज्ञ दृक् पंचांग · आपके स्थान पर आधारित',
shukla:'शुक्ल',krishna:'कृष्ण'},
kn:{title:'ಇಂದಿನ ದೃಕ್ ಪಂಚಾಂಗ',core:'ಮೂಲ ಪಂಚಾಂಗ',astro:'ಖಗೋಳ ಮಾಹಿತಿ',inaus:'ಅಶುಭ ಸಮಯ',ausp:'ಶುಭ ಸಮಯ',
tithi:'ತಿಥಿ',vara:'ವಾರ',nakshatra:'ನಕ್ಷತ್ರ',yoga:'ಯೋಗ',karana:'ಕರಣ',paksha:'ಪಕ್ಷ',
sunrise:'ಸೂರ್ಯೋದಯ',sunset:'ಸೂರ್ಯಾಸ್ತ',moonrise:'ಚಂದ್ರೋದಯ',moonPhase:'ಚಂದ್ರ ಕಲೆ',sunRashi:'ಸೂರ್ಯ (ರಾಶಿ)',moonRashi:'ಚಂದ್ರ (ರಾಶಿ)',
ayanamsa:'ಅಯನಾಂಶ',vsMonth:'ಸಂವತ್ ಮತ್ತು ಮಾಸ',rahuKala:'ರಾಹು ಕಾಲ',yamaghanda:'ಯಮಘಂಟ',gulika:'ಗುಳಿಕ',
abhijit:'ಅಭಿಜಿತ್ ಮುಹೂರ್ತ',hora:'ಪ್ರಸ್ತುತ ಹೋರಾ',footer:'ತಜ್ಞ-ಮಟ್ಟದ ದೃಕ್ ಪಂಚಾಂಗ · ನಿಮ್ಮ ಸ್ಥಳದ ಆಧಾರ',
shukla:'ಶುಕ್ಲ',krishna:'ಕೃಷ್ಣ'},
te:{title:'నేటి దృక్ పంచాంగం',core:'ప్రధాన పంచాంగం',astro:'ఖగోళ సమాచారం',inaus:'అశుభ సమయాలు',ausp:'శుభ సమయాలు',
tithi:'తిథి',vara:'వారం',nakshatra:'నక్షత్రం',yoga:'యోగం',karana:'కరణం',paksha:'పక్షం',
sunrise:'సూర్యోదయం',sunset:'సూర్యాస్తమయం',moonrise:'చంద్రోదయం',moonPhase:'చంద్ర కళ',sunRashi:'సూర్యుడు (రాశి)',moonRashi:'చంద్రుడు (రాశి)',
ayanamsa:'అయనాంశ',vsMonth:'సంవత్ & మాసం',rahuKala:'రాహు కాలం',yamaghanda:'యమఘంట',gulika:'గుళిక',
abhijit:'అభిజిత్ ముహూర్తం',hora:'ప్రస్తుత హోర',footer:'నిపుణ-స్థాయి దృక్ పంచాంగం · మీ స్థానం ఆధారంగా',
shukla:'శుక్ల',krishna:'కృష్ణ'},
ta:{title:'இன்றைய திருக் பஞ்சாங்கம்',core:'அடிப்படை பஞ்சாங்கம்',astro:'வானியல் தரவு',inaus:'தீய நேரங்கள்',ausp:'நல்ல நேரங்கள்',
tithi:'திதி',vara:'வாரம்',nakshatra:'நட்சத்திரம்',yoga:'யோகம்',karana:'கரணம்',paksha:'பக்ஷம்',
sunrise:'சூரிய உதயம்',sunset:'சூரிய அஸ்தமனம்',moonrise:'சந்திர உதயம்',moonPhase:'சந்திர கலை',sunRashi:'சூரியன் (ராசி)',moonRashi:'சந்திரன் (ராசி)',
ayanamsa:'அயனாம்சம்',vsMonth:'சம்வత் & மாதம்',rahuKala:'ராகு காலம்',yamaghanda:'யமகண்டம்',gulika:'குளிகை',
abhijit:'அபிஜித் முகூர்த்தம்',hora:'தற்போதைய ஹோரா',footer:'நிபுணர்-நிலை திருக் பஞ்சாங்கம் · உங்கள் இடத்தின் அடிப்படையில்',
shukla:'சுக்ல',krishna:'கிருஷ்ண'},
sa:{title:'अद्यतनं दृक् पञ्चाङ्गम्',core:'मूलपञ्चाङ्गम्',astro:'खगोलसूचनाः',inaus:'अशुभसमयाः',ausp:'शुभसमयाः',
tithi:'तिथिः',vara:'वारः',nakshatra:'नक्षत्रम्',yoga:'योगः',karana:'करणम्',paksha:'पक्षः',
sunrise:'सूर्योदयः',sunset:'सूर्यास्तः',moonrise:'चन्द्रोदयः',moonPhase:'चन्द्रकला',sunRashi:'सूर्यः (राशिः)',moonRashi:'चन्द्रः (राशिः)',
ayanamsa:'अयनांशः',vsMonth:'संवत् मासश्च',rahuKala:'राहुकालः',yamaghanda:'यमघण्टः',gulika:'गुलिकः',
abhijit:'अभिजित्मुहूर्तम्',hora:'वर्तमानहोरा',footer:'विशेषज्ञस्तरीयं दृक्पञ्चाङ्गम् · भवतः स्थानाधारितम्',
shukla:'शुक्लः',krishna:'कृष्णः'},
mr:{title:'आजचे दृक् पंचांग',core:'मूळ पंचांग',astro:'खगोलशास्त्रीय माहिती',inaus:'अशुभ वेळा',ausp:'शुभ वेळा',
tithi:'तिथी',vara:'वार',nakshatra:'नक्षत्र',yoga:'योग',karana:'करण',paksha:'पक्ष',
sunrise:'सूर्योदय',sunset:'सूर्यास्त',moonrise:'चंद्रोदय',moonPhase:'चंद्रकला',sunRashi:'सूर्य (राशी)',moonRashi:'चंद्र (राशी)',
ayanamsa:'अयनांश',vsMonth:'संवत् व मास',rahuKala:'राहुकाळ',yamaghanda:'यमघंट',gulika:'गुलिक',
abhijit:'अभिजित मुहूर्त',hora:'सध्याची होरा',footer:'तज्ञ-स्तरीय दृक् पंचांग · आपल्या स्थानावर आधारित',
shukla:'शुक्ल',krishna:'कृष्ण'},
gu:{title:'આજનું દୃક્ પંચાંગ',core:'મૂળ પંચાંગ',astro:'ખગોળીય માહિતી',inaus:'અશુભ સમય',ausp:'શુભ સમય',
tithi:'તિથિ',vara:'વાર',nakshatra:'નક્ષત્ર',yoga:'યોગ',karana:'કરણ',paksha:'પક્ષ',
sunrise:'સૂર્યોદય',sunset:'સૂર્યાસ્ત',moonrise:'ચંદ્રોદય',moonPhase:'ચંદ્ર કળા',sunRashi:'સૂર્ય (રાશિ)',moonRashi:'ચંદ્ર (રાશિ)',
ayanamsa:'અયનાંશ',vsMonth:'સંવત્ અને માસ',rahuKala:'રાહુ કાળ',yamaghanda:'યમઘંટ',gulika:'ગુલિક',
abhijit:'અભિજિત મુહૂર્ત',hora:'વર્તમાન હોરા',footer:'નિષ્ણાત-સ્તરનું દૃક્ પંચાંગ · તમારા સ્થાનના આધારે',
shukla:'શુક્લ',krishna:'કૃષ્ણ'},
bn:{title:'আজকের দৃক্ পঞ্চাঙ্গ',core:'মূল পঞ্চাঙ্গ',astro:'জ্যোতির্বৈজ্ঞানিক তথ্য',inaus:'অশুभ সময়',ausp:'शुभ सময়',
tithi:'तिथि',vara:'बार',nakshatra:'नक्षत्र',yoga:'योग',karana:'करण',paksha:'पक्ष',
sunrise:'सूर्योदय',sunset:'सूर्यास्त',moonrise:'चंद्रोदय',moonPhase:'चंद्र कला',sunRashi:'सूर्य (राशि)',moonRashi:'चंद्र (राशि)',
ayanamsa:'अयनांश',vsMonth:'संवत् व मास',rahuKala:'राहु काल',yamaghanda:'यमघंट',gulika:'गुलिक',
abhijit:'अभिजित मुहूर्त',hora:'वर्तमान होरा',footer:'विशेषज्ञ-मानের दৃक् পঞ্চাঙ্গ · आपके स्थान के आधार पर',
shukla:'শুক্ল',krishna:'কৃष्ণ'},
ml:{title:'ഇന്നത്തെ ദൃക് പഞ്ചാംഗം',core:'അടിസ്ഥാന പഞ്ചാംഗം',astro:'ജ്യോതിശാസ്ത്ര വിവരങ്ങൾ',inaus:'അശുഭ സമയം',ausp:'ശുഭ സമയം',
tithi:'തിഥി',vara:'വാരം',nakshatra:'നക്ഷത്രം',yoga:'യോഗം',karana:'കരണം',paksha:'പക്ഷം',
sunrise:'സൂര്യോദയം',sunset:'സൂര്യാസ്തമയം',moonrise:'ചന്ദ്രോദയം',moonPhase:'ചന്ദ്ര കല',sunRashi:'സൂര്യൻ (രാശി)',moonRashi:'ചന്ദ്രൻ (രാശി)',
ayanamsa:'അയനാംശം',vsMonth:'സംവത് & മാസം',rahuKala:'രാഹു കാലം',yamaghanda:'യമഘണ്ടം',gulika:'ഗുളികൻ',
abhijit:'അഭിജിത് മുഹൂർത്തം',hora:'നിലവിലെ ഹോര',footer:'വിദഗ്ധ-നിലവാരം ദൃക് പഞ്ചാംഗം · നിങ്ങളുടെ സ്ഥാനത്തെ അടിസ്ഥാനമാക്കി',
shukla:'ശുക്ല',krishna:'കൃഷ്ണ'}
};

const L_LUNAR_PHASE={
en:['New Moon','Waxing Crescent','First Quarter','Waxing Gibbous','Full Moon','Waning Gibbous','Last Quarter','Waning Crescent'],
hi:['अमावस्या','शुक्ल अर्धचंद्र','शुक्ल अष्टमी','शुक्ल गibbस','पूर्णिमा','कृष्ण गibbस','कृष्ण अष्टमी','कृष्ण अर्धचंद्र'],
kn:['ಅಮಾವಾಸ್ಯೆ','ಶುಕ್ಲ ಅರ್ಧಚಂದ್ರ','ಶುಕ್ಲ ಅಷ್ಟಮಿ','ಶುಕ್ಲ ಗಿಬಸ್','ಪೂರ್ಣಿಮೆ','ಕೃಷ್ಣ ಗಿಬಸ್','ಕೃಷ್ಣ ಅಷ್ಟಮಿ','ಕೃಷ್ಣ ಅರ್ಧಚಂದ್ರ'],
te:['అమావాస్య','శుక్ల అర్ధచంద్రుడు','శుక్ల అష్టమి','శుక్ల గిబ్బస్','పూర్ణిమ','కృష్ణ గిబ్బస్','కృష్ణ అష్టమి','కృష్ణ అర్ధచంద్రుడు'],
ta:['அமாவாசை','வளர்பிறை','அஷ்டமி','வளர் கிப்பஸ்','பௌர்ணமி','தேய் கிப்பஸ்','தேய் அஷ்டமி','தேய்பிறை'],
sa:['अमावास्या','शुक्लार्धचन्द्रः','शुक्लाष्टमी','शुक्लगिब्बसः','पूर्णिमा','कृष्णगिब्बसः','कृष्णाष्टमी','कृष्णार्धचन्द्रः'],
mr:['अमावास्या','शुक्ल अर्धचंद्र','शुक्ल अष्टमी','शुक्ल गibbस','पौर्णिमा','कृष्ण गibbस','कृष्ण अष्टमी','कृष्ण अर्धचंद्र'],
gu:['અમાવસ્યા','શુક્લ અર્ધચંદ્ર','શુક્લ અષ્ટમી','શુક્લ ગિબસ','પૂર્ણિમા','કૃષ્ણ ગિબસ','કૃષ્ણ અષ્ટમી','કૃષ્ણ અર્ધચંદ્ર'],
bn:['অমাবস্যা','শুক্ল অর্ধচন্দ্র','শুক্ল অষ্টমী','শুক্ল গিবস','পূর্ণিমা','কৃष्ण গिबस','कृष्ण अष्टमी','कृष्ण अर्धचन्द्र'],
ml:['അമാവാസി','ശുക്ല അർധചന്ദ്രൻ','ശുക്ല അഷ്ടമി','ശുക്ല ഗിബ്ബസ്','പൗർണ്ണമി','കൃഷ്ണ ഗിബ്ബസ്','കൃഷ്ണ അഷ്ടമി','കൃഷ്ണ അർധചന്ദ്രൻ']
};

// ════════════════════════════════════════════════════════════════
// DAILY PANCHANG & PREDICTIVE HELPERS
// ════════════════════════════════════════════════════════════════

// Accurate sunrise/sunset using solar declination + hour angle
function sunRiseSet(jd, lat, lng, utcOffset) {
  const T = (jd - 2451545) / 36525;
  const L0 = norm(280.46646 + 36000.76983 * T);
  const M = norm(357.52911 + 35999.05029 * T);
  const C = (1.914602 - 0.004817 * T) * Math.sin(M * DEG) + 0.019993 * Math.sin(2 * M * DEG);
  const sunLon = norm(L0 + C);
  const eps = (23.439 - 0.00013 * T) * DEG;
  const dec = Math.asin(Math.sin(eps) * Math.sin(sunLon * DEG));
  const cosHA = (Math.sin(-0.8333 * DEG) - Math.sin(lat * DEG) * Math.sin(dec)) / (Math.cos(lat * DEG) * Math.cos(dec));
  if (cosHA < -1 || cosHA > 1) return { rise: 6, set: 18 };
  const HA = Math.acos(cosHA) / DEG;
  const lngCorr = lng / 15;
  const B = 2 * Math.PI * ((jd - 2451545) % 365.25) / 365.25;
  const EoT = 229.18 * (0.000075 + 0.001868 * Math.cos(B) - 0.032077 * Math.sin(B) - 0.014615 * Math.cos(2*B) - 0.04089 * Math.sin(2*B)) / 60;
  const solarNoon = 12 - lngCorr - EoT + utcOffset;
  const rise = solarNoon - HA / 15;
  const set = solarNoon + HA / 15;
  return { rise, set };
}

// Format hours (decimal) to HH:MM AM/PM string
function fmtTime(h) {
  const hh = ((Math.floor(h) % 24) + 24) % 24;
  const mm = Math.floor((h % 1) * 60);
  const ap = hh >= 12 ? 'PM' : 'AM';
  return `${hh % 12 || 12}:${String(mm).padStart(2, '0')} ${ap}`;
}

// Rahu Kala, Yamaghanda, Gulika Kala
function inauspiciousPeriods(sunrise, sunset, dayOfWeek) {
  const dayDur = sunset - sunrise;
  const eighth = dayDur / 8;
  const rahuSlot = [8, 2, 7, 5, 6, 4, 3][dayOfWeek];
  const yamaSlot = [5, 4, 3, 2, 1, 7, 6][dayOfWeek];
  const gulikaSlot = [7, 6, 5, 4, 3, 2, 1][dayOfWeek];

  const period = (slot) => {
    const start = sunrise + (slot - 1) * eighth;
    const end = start + eighth;
    return { start, end, str: `${fmtTime(start)} – ${fmtTime(end)}` };
  };

  return {
    rahuKala: period(rahuSlot),
    yamaghanda: period(yamaSlot),
    gulikaKala: period(gulikaSlot)
  };
}

// Abhijit Muhurta (midday auspicious period)
function abhijitMuhurta(sunrise, sunset) {
  const noon = (sunrise + sunset) / 2;
  return { start: noon - 0.4, end: noon + 0.4, str: `${fmtTime(noon - 0.4)} – ${fmtTime(noon + 0.4)}` };
}

// Lunar phase
function lunarPhase(sunLon, moonLon, lang) {
  const elongation = norm(moonLon - sunLon);
  const illumination = (1 - Math.cos(elongation * DEG)) / 2 * 100;
  let idx;
  if (elongation < 22.5) idx = 0;
  else if (elongation < 67.5) idx = 1;
  else if (elongation < 112.5) idx = 2;
  else if (elongation < 157.5) idx = 3;
  else if (elongation < 202.5) idx = 4;
  else if (elongation < 247.5) idx = 5;
  else if (elongation < 292.5) idx = 6;
  else if (elongation < 337.5) idx = 7;
  else idx = 0;
  const phases = L_LUNAR_PHASE[lang] || L_LUNAR_PHASE.en;
  return { illumination: illumination.toFixed(1), phase: phases[idx] };
}

// Hora lord (planetary hour)
function horaLord(sunrise, currentHour, dayOfWeek) {
  const HORA_SEQ = ['sun','moon','mars','mercury','jupiter','venus','saturn'];
  const dayLordIdx = [0, 1, 2, 3, 4, 5, 6][dayOfWeek];
  const hoursSinceSunrise = currentHour - sunrise;
  if (hoursSinceSunrise < 0) return HORA_SEQ[dayLordIdx];
  const horaNum = Math.floor(hoursSinceSunrise);
  return HORA_SEQ[(dayLordIdx + horaNum) % 7];
}

// Approximate moonrise
function approxMoonrise(moonLon, sunLon, sunrise, sunset) {
  const elong = norm(moonLon - sunLon);
  const moonriseHr = sunrise + (elong / 360) * 24.8;
  const normalized = ((moonriseHr % 24) + 24) % 24;
  return normalized;
}

// Chandrabala (Moon strength)
function chandrabala(moonRashi, lagnaRashi) {
  const diff = ((moonRashi - lagnaRashi + 12) % 12) + 1;
  const good = [1, 3, 6, 7, 10, 11];
  return good.includes(diff) ? 'Strong' : 'Weak';
}

// Tarabala (Star strength)
function tarabala(transitNakIdx, birthNakIdx) {
  const diff = ((transitNakIdx - birthNakIdx + 27) % 27);
  const tara = Math.floor(diff / 3) + 1;
  const TARA_NAMES = ['Janma','Sampat','Vipat','Kshema','Pratyari','Sadhaka','Vadha','Mitra','Ati-Mitra'];
  const good = [2, 4, 6, 8, 9];
  return { tara: TARA_NAMES[(tara - 1) % 9], num: tara, good: good.includes(tara) };
}

// House themes for predictions
const HOUSE_THEMES = ['','Self & Personality','Wealth & Family','Courage & Siblings','Home & Happiness','Intelligence & Children','Health & Enemies','Partnerships & Marriage','Transformation & Longevity','Dharma & Fortune','Career & Status','Gains & Aspirations','Losses & Liberation'];

// Planetary lordships (rashi lords)
const SIGN_LORD = ['mars','venus','mercury','moon','sun','mercury','venus','mars','jupiter','saturn','saturn','jupiter'];

// Given a planet key and lagna rashi, find which houses (1-12) that planet rules
function housesRuled(planetKey, lagnaRashi) {
  const houses = [];
  for (let i = 0; i < 12; i++) {
    if (SIGN_LORD[i] === planetKey) {
      houses.push(((i - lagnaRashi + 12) % 12) + 1);
    }
  }
  return houses;
}

// ════════════════════════════════════════════════════════════════
// CHART COMPONENTS
// ════════════════════════════════════════════════════════════════
const SI_POS=[[1,0],[2,0],[3,0],[3,1],[3,2],[3,3],[2,3],[1,3],[0,3],[0,2],[0,1],[0,0]];

function SouthChart({planets,lagnaR,size=320,small=false,title,lang='en'}){
  const cell=size/4;
  const pfs=small?10:14,rfs=small?8:10;
  const byRashi=r=>planets.filter(p=>p.rashi===r);
  return(
    <div style={{textAlign:'center'}}>
      {title&&<p style={{fontSize:small?10:13,fontWeight:700,color:'#7C3AED',marginBottom:5,fontFamily:'inherit'}}>{title}</p>}
      <svg className="responsive-svg" viewBox={`0 0 ${size} ${size}`} width={size} height={size} style={{border:'1px solid var(--border-light)',borderRadius:6,background:'transparent',display:'block',margin:'0 auto',boxShadow:'inset 0 0 20px rgba(0,0,0,0.5)'}}>
        {[1,2,3].map(i=>(
          <g key={i}>
            <line x1={cell*i} y1={0} x2={cell*i} y2={size} stroke="var(--border-light)" strokeWidth={1}/>
            <line x1={0} y1={cell*i} x2={size} y2={cell*i} stroke="var(--border-light)" strokeWidth={1}/>
          </g>
        ))}
        <rect x={cell} y={cell} width={cell*2} height={cell*2} fill="rgba(212,175,55,0.03)" stroke="var(--accent-gold)" strokeWidth={1.5}/>
        <text x={size/2} y={size/2-(small?4:8)} textAnchor="middle" fontSize={small?18:28} fill="var(--accent-gold)" opacity={0.15}>☀</text>
        {SI_POS.map(([col,row],ri)=>{
          const x=col*cell,y=row*cell,ps=byRashi(ri),isL=ri===lagnaR;
          return(
            <g key={ri}>
              {isL&&<rect x={x+1} y={y+1} width={cell-2} height={cell-2} fill="rgba(212,175,55,0.15)" rx={2}/>}
              <text x={x+3} y={y+rfs+2} fontSize={rfs} fill="var(--text-muted)">{ri+1}</text>
              <text x={x+cell-3} y={y+rfs+2} textAnchor="end" fontSize={rfs} fill="var(--text-muted)">{((L_RASHI[lang]||L_RASHI.en)[ri]||RASHIS[ri]).slice(0,small?3:4)}</text>
              {isL&&<text x={x+3} y={y+cell-3} fontSize={rfs+1} fill="var(--accent-gold)" fontWeight="bold">{t('ch.asc',lang)}</text>}
              {ps.map((p,pi)=>{
                const cols=ps.length>3?2:1;
                const cx=cols===2?pi%2:0,cy=cols===2?Math.floor(pi/2):pi;
                return(
                  <text key={pi} x={x+4+cx*(cell/2-3)} y={y+(small?18:24)+cy*(small?11:16)} fontSize={pfs} fill={p.retro?'#EF4444':'var(--text-main)'} fontWeight="700">
                    {(L_ABBR[lang]||L_ABBR.en)[p.key]||ABBR[p.key]}{(p.retro && p.key !== 'rahu' && p.key !== 'ketu')?'(R)':''}{p.exalted?'↑':''}{p.debil?'↓':''}
                  </text>
                );
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

const NI_PATHS=[
  'M200,30L270,100L200,170L130,100Z','M270,100L370,30L370,170L270,100Z',
  'M370,30L370,170L270,100Z','M370,170L270,100L370,300Z',
  'M370,170L370,370L270,300L370,170Z','M270,300L370,370L200,370Z',
  'M200,170L270,300L200,370L130,300Z','M130,300L200,370L30,370Z',
  'M30,370L130,300L30,170L130,300Z','M30,170L130,300L130,100Z',
  'M30,30L130,100L30,170Z','M30,30L200,30L130,100Z'
];
const NI_LABEL=[[200,95],[320,110],[350,60],[350,240],[320,310],[265,350],[200,290],[135,350],[50,310],[50,240],[50,60],[135,45]];

function NorthChart({planets,lagnaR,size=320,small=false,title,lang='en'}){
  const sc=size/400;
  const byHouse=h=>planets.filter(p=>p.house===h);
  const houseRashi=h=>(lagnaR+h-1)%12;
  const SHORT=(L_RASHI[lang]||L_RASHI.en).map(r=>r.slice(0,2));
  return(
    <div style={{textAlign:'center'}}>
      {title&&<p style={{fontSize:small?10:13,fontWeight:700,color:'#7C3AED',marginBottom:5,fontFamily:'inherit'}}>{title}</p>}
      <svg className="responsive-svg" viewBox="0 0 400 400" width={size} height={size} style={{border:'1px solid var(--border-light)',borderRadius:6,background:'transparent',display:'block',margin:'0 auto',boxShadow:'inset 0 0 20px rgba(0,0,0,0.5)'}}>
        {NI_PATHS.map((path,i)=>{
          const house=i+1,ps=byHouse(house),[lx,ly]=NI_LABEL[i],isL=house===1;
          return(
            <g key={i}>
              <path d={path} fill={isL?'rgba(212,175,55,0.15)':'transparent'} stroke="var(--border-light)" strokeWidth={1.5}/>
              <text x={lx} y={ly-12} textAnchor="middle" fontSize={small?8:10} fill="var(--text-muted)">{house}</text>
              <text x={lx} y={ly} textAnchor="middle" fontSize={small?9:12} fill="#9CA3AF">{SHORT[houseRashi(house)]}</text>
              {isL&&<text x={lx} y={ly+14} textAnchor="middle" fontSize={small?9:12} fill="var(--accent-gold)" fontWeight="bold">{t('ch.asc',lang)}</text>}
              {ps.map((p,pi)=>(
                <text key={pi} x={lx} y={ly+(isL?28:14)+pi*(small?10:13)} textAnchor="middle" fontSize={small?10:14} fill="var(--text-main)" fontWeight="700">
                  {(L_ABBR[lang]||L_ABBR.en)[p.key]||ABBR[p.key]}{(p.retro && p.key !== 'rahu' && p.key !== 'ketu')?'(R)':''}
                </text>
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// INPUT FORM
// ════════════════════════════════════════════════════════════════

function DailyPanchang({ lang }){
    const[location,setLocation]=React.useState(null);
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

    const dailyPan=React.useMemo(()=>{
      const now=new Date();
      const year=now.getFullYear();
      const utcH=now.getUTCHours(),utcM=now.getUTCMinutes();
      const utcOff=now.getTimezoneOffset()/-60;
      const lat=location?location.lat:28.6139; // Loc fallback
      const lng=location?location.lng:77.2090;
      const jd=toJD(now.getUTCFullYear(),now.getUTCMonth()+1,now.getUTCDate(),utcH,utcM,0);
      const K=computeKundali({year:now.getUTCFullYear(),month:now.getUTCMonth()+1,day:now.getUTCDate(),hour:utcH,minute:utcM,utcOffset:0,lat,lng});
      const sunSet=sunRiseSet(jd,lat,lng,utcOff);
      const dayOfWeek=now.getDay();
      const inaus=inauspiciousPeriods(sunSet.rise,sunSet.set,dayOfWeek);
      const abhijit=abhijitMuhurta(sunSet.rise,sunSet.set);
      const tMoon=K.planets.find(p=>p.key==='moon');
      const tSun=K.planets.find(p=>p.key==='sun');
      const moonNakRaw=nakshatra(tMoon.lon);
      const L_NN = L_PANCHANG[lang]?.nakNames || {};
      const moonNak = { ...moonNakRaw, name: L_NN[moonNakRaw.name] || moonNakRaw.name };
      const pMatch=K.panchang.tithi.match(/\((.*?)\)/);
      const pakshaRaw = pMatch?pMatch[1]:'';
      const tithiRaw = K.panchang.tithi.split(' (')[0];
      const L_TN = L_PANCHANG[lang]?.tithiNames || {};
      const tithiOnly = L_TN[tithiRaw] || tithiRaw;
      const paksha = pakshaRaw.includes('Shukla') ? t_astro('shukla', lang) : pakshaRaw.includes('Krishna') ? t_astro('krishna', lang) : pakshaRaw;
      return{K,utcOff,now,sunSet,inaus,abhijit,moonNak,tMoon,tSun,paksha,tithiOnly,dayOfWeek,jd,hasLoc:!!location,year};
    },[location]);

    if(!dailyPan)return null;
    const{K,now,sunSet,inaus,abhijit,moonNak,tMoon,tSun,paksha,tithiOnly,hasLoc,year}=dailyPan;
    const lp = localizePanchang(K.panchang,lang);
    const dateStr = now.toLocaleDateString(lang==='en'?'en-US':lang, {weekday:'short', month:'short', day:'numeric'});

    return (
      <div style={{background:'var(--bg-card)', borderBottom:'1px solid var(--border-light)'}}>
        <div style={{maxWidth:1100, margin:'0 auto', padding:'8px 16px', fontSize:11, color:'var(--text-muted)', display:'flex', flexWrap:'wrap', gap:'8px 16px', alignItems:'center', justifyContent:'center', letterSpacing:0.5}}>
          <strong style={{color:'var(--accent-gold)'}}>☽ {(LP.title||'Today').toUpperCase()} ({dateStr}) </strong>
          <span style={{color:'var(--border-light)'}}>|</span>
          <span style={{display:'flex', gap:10, flexWrap:'wrap', alignItems:'center'}}>
             <span>{t_astro("tithi", lang)}: <strong style={{color:'var(--text-main)'}}>{lp.tithi}</strong></span>
             <span>{t_astro("nak", lang)}: <strong style={{color:'var(--text-main)'}}>{lp.nakshatra}</strong></span>
             <span>{t_astro("yoga", lang)}: <strong style={{color:'var(--text-main)'}}>{lp.yoga}</strong></span>
             <span>{t_astro("kar", lang)}: <strong style={{color:'var(--text-main)'}}>{lp.karana}</strong></span>
             <strong style={{color:'var(--border-light)', marginLeft:4, marginRight:4}}>•</strong>
             <span>{t_astro("moon", lang)}: <strong style={{color:'var(--text-main)'}}>{RASHI_N[tMoon.rashi]}</strong></span>
             <span>{t_astro("sun", lang)}: <strong style={{color:'var(--text-main)'}}>{RASHI_N[tSun.rashi]}</strong></span>
             <span>{t_astro("vs", lang)}: <strong style={{color:'var(--text-main)'}}>{year+57}</strong></span>
          </span>
          {hasLoc && (
             <React.Fragment>
                <span style={{color:'var(--border-light)'}}>|</span>
                <span style={{display:'flex', gap:10, flexWrap:'wrap', alignItems:'center'}}>
                   <span>{t_astro("sun", lang)}: <strong style={{color:'var(--text-main)'}}>{fmtTime(sunSet.rise, lang)} - {fmtTime(sunSet.set, lang)}</strong></span>
                   <strong style={{color:'var(--border-light)', marginLeft:4, marginRight:4}}>•</strong>
                   <span>{t_astro("rahu", lang)}: <strong style={{color:'var(--text-main)'}}>{inaus.rahuKala.str}</strong></span>
                   <span>{t_astro("yama", lang)}: <strong style={{color:'var(--text-main)'}}>{inaus.yamaghanda.str}</strong></span>
                </span>
             </React.Fragment>
          )}
        </div>
      </div>
    );
  }


function InputForm({onSubmit,lang,setLang,onOpenTerms}){
  const[form,setForm]=React.useState({dob:'',tob:'',city:'',country:'India',gender:'',lat:null,lng:null,utcOffset:5.5,timezone:'Asia/Kolkata'});
  const[name,setName]=React.useState('');
  const[cityQ,setCityQ]=React.useState('');
  const[suggs,setSuggs]=React.useState([]);
  const[showS,setShowS]=React.useState(false);
  const[loading,setLoading]=React.useState(false);
  const[errs,setErrs]=React.useState({});
  const[prog,setProg]=React.useState(0);
  const dbRef=React.useRef(null);

  const FALLBACK=[
    {name:'Bangalore',country:'India',lat:12.9716,lng:77.5946,tz:'Asia/Kolkata',disp:'Bangalore, Karnataka, India'},
    {name:'Mumbai',country:'India',lat:19.076,lng:72.8777,tz:'Asia/Kolkata',disp:'Mumbai, Maharashtra, India'},
    {name:'Delhi',country:'India',lat:28.6139,lng:77.209,tz:'Asia/Kolkata',disp:'New Delhi, India'},
    {name:'Chennai',country:'India',lat:13.0827,lng:80.2707,tz:'Asia/Kolkata',disp:'Chennai, Tamil Nadu, India'},
    {name:'Hyderabad',country:'India',lat:17.385,lng:78.4867,tz:'Asia/Kolkata',disp:'Hyderabad, Telangana, India'},
    {name:'Kolkata',country:'India',lat:22.5726,lng:88.3639,tz:'Asia/Kolkata',disp:'Kolkata, West Bengal, India'},
    {name:'Pune',country:'India',lat:18.5204,lng:73.8567,tz:'Asia/Kolkata',disp:'Pune, Maharashtra, India'},
    {name:'Ahmedabad',country:'India',lat:23.0225,lng:72.5714,tz:'Asia/Kolkata',disp:'Ahmedabad, Gujarat, India'},
    {name:'London',country:'UK',lat:51.5074,lng:-0.1278,tz:'Europe/London',disp:'London, UK'},
    {name:'New York',country:'USA',lat:40.7128,lng:-74.006,tz:'America/New_York',disp:'New York, USA'},
    {name:'Dubai',country:'UAE',lat:25.2048,lng:55.2708,tz:'Asia/Dubai',disp:'Dubai, UAE'},
    {name:'Singapore',country:'Singapore',lat:1.3521,lng:103.8198,tz:'Asia/Singapore',disp:'Singapore'},
    {name:'Sydney',country:'Australia',lat:-33.8688,lng:151.2093,tz:'Australia/Sydney',disp:'Sydney, Australia'},
    {name:'Toronto',country:'Canada',lat:43.6532,lng:-79.3832,tz:'America/Toronto',disp:'Toronto, Canada'},
  ];
  function getOffset(tz){
    try {
      const d=new Date();
      const formatter=new Intl.DateTimeFormat('en-US',{timeZone:tz,year:'numeric',month:'numeric',day:'numeric',hour:'numeric',minute:'numeric',second:'numeric',hour12:false});
      const parts=formatter.formatToParts(d);
      const getVal=(type)=>parts.find(p=>p.type===type)?.value||'0';
      const yStr=getVal('year'),mStr=getVal('month'),dStr=getVal('day');
      let hStr=getVal('hour');const minStr=getVal('minute'),sStr=getVal('second');
      if(hStr==='24')hStr='00';
      const localTime=new Date(Date.UTC(Number(yStr),Number(mStr)-1,Number(dStr),Number(hStr),Number(minStr),Number(sStr)));
      const utcTime=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate(),d.getUTCHours(),d.getUTCMinutes(),d.getUTCSeconds()));
      const diff=(localTime.getTime()-utcTime.getTime())/3600000;
      return isNaN(diff)?5.5:diff;
    } catch {
      return 5.5;
    }
  }
  function searchCity(q){
    const r=FALLBACK.filter(c=>c.name.toLowerCase().includes(q.toLowerCase())||c.disp.toLowerCase().includes(q.toLowerCase()));
    setSuggs(r.slice(0,6));
    fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&language=en&format=json`)
      .then(r=>r.json()).then(d=>{
        if(d.results&&d.results.length){
          const meteoSuggs=d.results.map(g=>({name:g.name,country:g.country,lat:g.latitude,lng:g.longitude,tz:g.timezone||'UTC',disp:`${g.name}${g.admin1?', '+g.admin1:''}, ${g.country}`}));
          setSuggs(prev=>{
            const existing=new Set(prev.map(p=>p.disp));
            return [...prev, ...meteoSuggs.filter(m=>!existing.has(m.disp))].slice(0, 6);
          });
        }
      }).catch(()=>{});
  }

  function selectCity(c){
    setCityQ(c.disp);
    setForm(f=>({...f,city:c.name,country:c.country,lat:c.lat,lng:c.lng,utcOffset:getOffset(c.tz),timezone:c.tz}));
    setShowS(false);setErrs(e=>({...e,city:null}));
  }

  function validate(){
    const e={};
    if(!name.trim())e.name=t('validation.required',lang)||t('required',lang);
    if(!form.dob)e.dob=t('validation.required',lang)||t('required',lang);
    if(!form.tob)e.tob=t('validation.required',lang)||t('required',lang);
    if(!form.lat)e.city=t('validation.selectCity',lang)||t('selectCity',lang);
    if(!form.gender)e.gender=t('validation.required',lang)||t('required',lang);
    setErrs(e);return Object.keys(e).length===0;
  }

  React.useEffect(()=>{
    if(loading){const t=setInterval(()=>setProg(p=>Math.min(p+20,90)),120);return()=>clearInterval(t)}
    else setProg(0);
  },[loading]);

  function submit(e){
    e.preventDefault();if(!validate())return;
    setLoading(true);
    const[year,month,day]=form.dob.split('-').map(Number);
    const[hour,minute]=form.tob.split(':').map(Number);
    setTimeout(()=>onSubmit({name:name.trim()||'Anonymous',year,month,day,hour,minute,utcOffset:form.utcOffset,lat:form.lat,lng:form.lng,city:form.city,country:form.country,timezone:form.timezone,gender:form.gender,dob:form.dob,tob:form.tob}),600);
  }

  const IS={};
  const LS={display:'block',fontSize:11,fontWeight:600,color:'var(--text-muted)',marginBottom:6,textTransform:'uppercase',letterSpacing:1.5};

  
  return(
    <div style={{minHeight:'100vh'}}>
      
      <div style={{textAlign:'center',padding:'50px 24px 20px'}}>
        
        <h2 className="serif" style={{margin:'0 0 10px',fontSize:32,color:'var(--text-main)',letterSpacing:1}}>{t('inputTitle',lang)}</h2>
        <p style={{margin:0,color:'var(--text-muted)',fontSize:14,maxWidth:500,marginInline:'auto',lineHeight:1.7}}>{t('inputSubtitle',lang)}</p>
      </div>
      <main style={{flex:1,display:'flex',alignItems:'flex-start',justifyContent:'center',padding:'20px 24px 60px'}}>
        <div className="lux-card" style={{width:'100%',maxWidth:580,padding:0,overflow:'visible'}}>
          <div style={{padding:'24px 34px',borderBottom:'1px solid var(--border-light)'}}>
            <h3 className="serif" style={{margin:0,fontSize:20,fontWeight:400,color:'var(--accent-gold)',letterSpacing:1.5}}>{t('birthDetails',lang)}</h3>
            <p style={{margin:'6px 0 0',fontSize:13,color:'var(--text-muted)'}}>{t('formNote',lang)}</p>
          </div>
          <form onSubmit={submit} style={{padding:'34px'}}>
            <div style={{marginBottom:24}}>
              <label style={LS}>{t("fullName",lang)}</label>
              <input type="text" className="lux-input" value={name} onChange={e=>{setName(e.target.value);setErrs(er=>({...er,name:null}))}} placeholder={t("namePlaceholder",lang)} style={{borderColor:errs.name?'var(--error-color)':'var(--border-light)'}} required />
              {errs.name&&<p style={{color:'var(--error-color)',fontSize:11,margin:'4px 0 0'}}>{errs.name}</p>}
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:24}}>
              <div>
                <label style={LS}>{t('dob',lang)}</label>
                <input type="date" required value={form.dob} max={new Date().toISOString().slice(0,10)} min="1900-01-01"
                  onChange={e=>{setForm(f=>({...f,dob:e.target.value}));setErrs(er=>({...er,dob:null}))}}
                  className="lux-input" style={{borderColor:errs.dob?'#EF4444':undefined}}/>
                {errs.dob&&<p style={{color:'#EF4444',fontSize:11,marginTop:4}}>{errs.dob}</p>}
              </div>
              <div>
                <label style={LS}>{t('tob',lang)}</label>
                <input type="time" required value={form.tob}
                  onChange={e=>{setForm(f=>({...f,tob:e.target.value}));setErrs(er=>({...er,tob:null}))}}
                  className="lux-input" style={{borderColor:errs.tob?'#EF4444':undefined}}/>
                {errs.tob&&<p style={{color:'#EF4444',fontSize:11,marginTop:4}}>{errs.tob}</p>}
              </div>
            </div>
            <p style={{margin:'-10px 0 16px',fontSize:12,color:'var(--text-muted)'}}>{t('inputAccuracy',lang)}</p>
            <div style={{marginBottom:20,position:'relative'}}>
              <label style={LS}>{t('city',lang)}</label>
              <input type="text" placeholder={t('cityPlaceholder',lang)} value={cityQ}
                onChange={e=>{setCityQ(e.target.value);setForm(f=>({...f,lat:null}));setShowS(true);clearTimeout(dbRef.current);dbRef.current=setTimeout(()=>searchCity(e.target.value),300)}}
                onFocus={()=>suggs.length>0&&setShowS(true)}
                onBlur={()=>setTimeout(()=>setShowS(false),180)}
                className="lux-input" style={{borderColor:errs.city?'#EF4444':undefined}}/>
              {errs.city&&<p style={{color:'#EF4444',fontSize:11,marginTop:4}}>{errs.city}</p>}
              {showS&&suggs.length>0&&(
                <div style={{position:'absolute',top:'100%',left:0,right:0,background:'var(--bg-input)',border:'1px solid var(--accent-gold)',borderRadius:8,boxShadow:'0 10px 30px var(--bg-surface)',zIndex:100,maxHeight:220,overflowY:'auto',marginTop:4}}>
                  {suggs.map((c,i)=>(
                    <div key={i} onMouseDown={()=>selectCity(c)}
                      style={{padding:'12px 16px',cursor:'pointer',fontSize:14,color:'var(--text-main)',borderBottom:'1px solid var(--border-light)',transition:'background 0.2s'}}
                      onMouseEnter={e=>e.currentTarget.style.background='var(--bg-card)'}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <strong style={{color:'var(--accent-gold)',fontWeight:500}}>{c.name}</strong> <span style={{color:'var(--text-muted)',fontSize:12}}>{c.disp.replace(c.name,'')}</span>
                    </div>
                  ))}
                </div>
              )}
              {form.lat&&<p style={{fontSize:12,color:'#10B981',marginTop:6}}>✓ {form.lat.toFixed(3)}°, {form.lng.toFixed(3)}° · {form.timezone}</p>}
            </div>
            {form.country&&<div style={{marginBottom:24}}>
              <label style={LS}>{t('country',lang)}</label>
              <div style={{padding:'14px 16px',borderRadius:6,border:'1px solid var(--border-light)',background:'rgba(255,255,255,0.02)',fontSize:14,color:'var(--text-secondary)'}}>{form.country}</div>
            </div>}
            <div style={{marginBottom:30}}>
              <label style={{...LS,marginBottom:12}}>{t('gender',lang)}</label>
              <div style={{display:'flex',gap:10}}>
                {[['Male',t('male',lang)],['Female',t('female',lang)],['Other',t('other',lang)]].map(([val,lbl])=>(
                  <button key={val} type="button" onClick={()=>{setForm(f=>({...f,gender:val}));setErrs(er=>({...er,gender:null}))}}
                    style={{flex:1,padding:'12px',borderRadius:6,border:form.gender===val?'1px solid var(--accent-gold)':'1px solid var(--border-light)',background:form.gender===val?'var(--bg-dark)':'transparent',color:form.gender===val?'var(--accent-gold)':'var(--text-secondary)',fontWeight:form.gender===val?500:400,cursor:'pointer',fontSize:14,fontFamily:'inherit',transition:'all 0.3s ease',boxShadow:form.gender===val?'0 0 10px var(--accent-glow)':'none'}}>
                    {lbl}
                  </button>
                ))}
              </div>
              {errs.gender&&<p style={{color:'#EF4444',fontSize:11,marginTop:4}}>{errs.gender}</p>}
            </div>
            <button type="submit" disabled={loading} className="lux-btn" style={{width:'100%',padding:'16px',background:'var(--accent-gold)',color:'#000',border:'none'}}>
              <strong style={{letterSpacing:1}}>{loading?t('computing',lang):t('generate',lang)}</strong>
            </button>
            {loading&&<div style={{marginTop:16}}>
              <div style={{width:'100%',height:3,background:'var(--border-light)',borderRadius:2,overflow:'hidden'}}>
                <div style={{width:`${prog}%`,height:'100%',background:'var(--accent-gold)',borderRadius:2,transition:'width 0.15s ease',boxShadow:'0 0 8px var(--accent-gold)'}}/>
              </div>
              <p style={{fontSize:11,color:'var(--accent-gold)',marginTop:8,textAlign:'center',letterSpacing:1.5,textTransform:'uppercase'}}>{t('inputLoading',lang)}</p>
            </div>}
          </form>
          <div style={{padding:'16px 34px 24px',borderTop:'1px solid var(--border-light)',textAlign:'center'}}>
            <p style={{margin:0,fontSize:11,color:'var(--text-muted)'}}>{t('inputPrivacy',lang)}</p>
          </div>
        </div>
      </main>
      <footer className="no-print" style={{textAlign:'center',padding:'24px',marginTop:'auto'}}>
        <a href="/terms.html" target="_blank" rel="noreferrer" style={{color:'var(--text-muted)',textDecoration:'underline',fontSize:12,fontFamily:'inherit',transition:'color 0.2s'}} onMouseOver={e=>e.currentTarget.style.color='var(--accent-gold)'} onMouseOut={e=>e.currentTarget.style.color='var(--text-muted)'}>Terms of Service</a>
      </footer>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// RESULTS TABS
// ════════════════════════════════════════════════════════════════
function Card({children,style={},left}){
  return<div className="lux-card" style={{padding:20,borderLeft:left?`3px solid ${left}`:undefined,...style}}>{children}</div>;
}


function OverviewTab({K,fmt,lang='en'}){
  const{lagna,planets,dasha,panchang,sunrise,sunset,lst,ayanamsaDMS}=K;
  const lpan=localizePanchang(panchang,lang);
  const moon=planets.find(p=>p.key==='moon'),sun=planets.find(p=>p.key==='sun');
  const cur=dasha.mahadashas.find(m=>m.isCurrent)||dasha.mahadashas[0];
  const curA=cur?.antars?.find(a=>a.isCurrent)||cur?.antars?.[0];
  const navP=planets.map(p=>({...p,rashi:K.divCharts.D9?.[p.key]??p.rashi}));
  const C=fmt==='south'?SouthChart:NorthChart;
  const moonNakLore = (NAKSHATRA_LORE[lang] || NAKSHATRA_LORE['en'])[moon.nIdx];
  return(
    <div style={{animation:'slideIn 0.2s ease'}}>
      {/* Janma Vivaranam removed per user request */}
      <div className="responsive-grid-2" style={{marginBottom:18}}>
        <C planets={planets} lagnaR={lagna.rashi} title={t('ov.rashiChart',lang)} size={300} lang={lang}/>
        <C planets={navP} lagnaR={lagna.rashi} title={t('ov.navamsa',lang)} size={300} lang={lang}/>
      </div>
      <div className="responsive-grid-3" style={{marginBottom:18}}>
        {[[`${(L_RASHI[lang]||L_RASHI.en)[lagna.rashi]}`,lagna.degFmt,t('ov.lagna',lang),'#7C3AED'],
          [`${(L_RASHI[lang]||L_RASHI.en)[moon.rashi]}`,`${(L_NAKS[lang]||L_NAKS.en)[moon.nIdx]||moon.nakshatraName} ${t('pdf.pada',lang)||'Pd'} ${moon.pada}`,t('ov.moon',lang),'#8B5CF6'],
          [`${(L_RASHI[lang]||L_RASHI.en)[sun.rashi]}`,`${(L_NAKS[lang]||L_NAKS.en)[sun.nIdx]||sun.nakshatraName} ${t('pdf.pada',lang)||'Pd'} ${sun.pada}`,t('ov.sun',lang),'#D97706']].map(([val,sub,lbl,clr])=>(
          <Card key={lbl} style={{textAlign:'center',borderTop:`3px solid ${clr}`}}>
            <p style={{margin:'0 0 3px',fontSize:10,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:1}}>{lbl}</p>
            <p style={{margin:'0 0 2px',fontSize:15,fontWeight:700,color:clr}}>{val}</p>
            <p style={{margin:0,fontSize:11,color:'var(--text-muted)'}}>{sub}</p>
          </Card>
        ))}
      </div>
      
      {moonNakLore && (
        <Card style={{ marginBottom: 18, background: 'linear-gradient(135deg, #1E3A5F 0%, #0F172A 100%)', color: 'white', border: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 16, color: '#E5D5C0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>✨</span>
              {t('ov.janmaNak', lang)}: {moonNakLore.name}
            </h3>
            <span style={{ fontSize: 12, background: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: 20, color: '#FCD34D' }}>
              {t('ov.moonsConst', lang)}
            </span>
          </div>
          
          <p style={{ fontSize: 13, lineHeight: 1.5, color: '#CBD5E1', margin: '0 0 16px' }}>
            {moonNakLore.myth}
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 10 }}>
            {[
              [t('nak_ruling_planet', lang) || 'Ruling Planet', moonNakLore.planet],
              [t('nak_deity', lang) || 'Ruling Deity', moonNakLore.deity],
              [t('nak_symbol', lang) || 'Symbol', moonNakLore.symbol],
              [t('nak_gana', lang) || 'Gana (Type)', moonNakLore.gana],
              [t('nak_nature', lang) || 'Nature (Quality)', moonNakLore.nature],
              [t('nak_animal', lang) || 'Animal (Yoni)', moonNakLore.animal],
              [t('nak_goal', lang) || 'Goal (Purushartha)', moonNakLore.goal],
              [t('nak_guna', lang) || 'Guna', moonNakLore.guna]
            ].map(([lbl, val]) => val && (
              <div key={lbl} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: 6, borderLeft: '2px solid #7C3AED' }}>
                <div style={{ fontSize: 10, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5, marginRight: 8 }}>{lbl}</div>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#FDE68A', textAlign: 'right' }}>{val}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <h3 style={{margin:'0 0 12px',fontSize:14,color:'var(--text-main)',fontWeight:700}}>{t('ov.curDasha',lang)}</h3>
        <div className="responsive-grid-3" style={{gap:12}}>
          {[{lbl:t('ov.maha',lang),p:(L_GRAHA[lang]||L_GRAHA.en)[cur?.planet]||cur?.planet,period:`${cur?.startStr}–${cur?.endStr}`,bg:'var(--bg-badge-purple)',clr:'var(--text-badge-purple)'},
            {lbl:t('ov.antar',lang),p:(L_GRAHA[lang]||L_GRAHA.en)[curA?.planet]||curA?.planet,period:`${curA?.startStr}–${curA?.endStr}`,bg:'var(--bg-badge-orange)',clr:'var(--text-badge-orange)'},
            {lbl:t('ov.birth',lang),p:(L_GRAHA[lang]||L_GRAHA.en)[dasha.nakLord]||dasha.nakLord,period:`${t('ov.nakshatra',lang)}: ${(L_NAKS[lang]||L_NAKS.en)[K.planets.find(p=>p.key==='moon')?.nIdx]||dasha.nakName}`,bg:'var(--bg-badge-green)',clr:'var(--text-badge-green)'}].map(({lbl,p,period,bg,clr})=>(
            <div key={lbl} style={{background:bg,borderRadius:10,padding:12,textAlign:'center'}}>
              <p style={{margin:'0 0 3px',fontSize:10,color:clr,textTransform:'uppercase',letterSpacing:1,fontWeight:600}}>{lbl}</p>
              <p style={{margin:'0 0 3px',fontSize:18,fontWeight:700,color:'var(--text-main)',textTransform:'capitalize'}}>{p||'—'}</p>
              <p style={{margin:0,fontSize:11,color:'var(--text-muted)'}}>{period}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function ChartsTab({K,fmt,setFmt,lang='en'}){
  const[exp,setExp]=React.useState(null);
  const C=fmt==='south'?SouthChart:NorthChart;
  const VLIST=['D1','D2','D3','D4','D7','D9','D10','D12','D16','D20','D24','D27','D30','D40','D45','D60'];
  const VDESC=(L_VDESC[lang]||L_VDESC.en);
  return(
    <div style={{animation:'slideIn 0.2s ease'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <h3 style={{margin:0,fontSize:15,color:'var(--text-main)',fontWeight:700}}>{t('tabs.charts',lang)} — {t('ch.shodasha',lang)}</h3>
        <div style={{display:'flex',gap:3,background:'var(--bg-input)',borderRadius:7,padding:3}}>
          {['south','north'].map(f=><button key={f} onClick={()=>setFmt(f)} style={{padding:'5px 12px',borderRadius:5,border:'none',background:fmt===f?'var(--text-main)':'transparent',boxShadow:fmt===f?'0 1px 3px rgba(0,0,0,0.1)':'none',cursor:'pointer',fontSize:12,fontFamily:'inherit',fontWeight:fmt===f?700:400,color:fmt===f?'var(--bg-card)':'var(--text-main)'}}>{f==='south'?t('ch.south',lang):t('ch.north',lang)}</button>)}
        </div>
      </div>
      <div className="responsive-grid-2" style={{marginBottom:20}}>
        <C planets={K.planets} lagnaR={K.lagna.rashi} title={t('ov.rashiChart',lang)||'D1 · Rashi Chart'} size={280} lang={lang}/>
        <C planets={K.planets.map(p=>({...p,rashi:K.divCharts.D9?.[p.key]??p.rashi}))} lagnaR={K.lagna.rashi} title={t('ov.navamsa',lang)||'D9 · Navamsa'} size={280} lang={lang}/>
      </div>
      {K.planets.filter(p=>p.vargottama).length>0&&<div style={{background:'rgba(212,175,55,0.05)',borderRadius:8,padding:'8px 12px',marginBottom:16,fontSize:12,color:'var(--accent-gold)'}}>✦ <strong>{t('ch.vargottama',lang)}:</strong> {K.planets.filter(p=>p.vargottama).map(p=>(L_GRAHA[lang]||L_GRAHA.en)[p.key]||p.key).join(', ')}</div>}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',gap:10}}>
        {VLIST.map(v=>{
          const ps=K.planets.map(p=>({...p,rashi:K.divCharts[v]?.[p.key]??p.rashi}));
          return(
            <div key={v} onClick={()=>setExp(exp===v?null:v)} style={{cursor:'pointer'}}
              onMouseEnter={e=>e.currentTarget.style.transform='scale(1.04)'}
              onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'} >
              <div style={{background:'var(--bg-card)',borderRadius:8,border:`1.5px solid ${exp===v?'#7C3AED':'#E5D5C0'}`,padding:6,transition:'all 0.15s'}}>
                <C planets={ps} lagnaR={K.lagna.rashi} size={140} small lang={lang}/>
                <p style={{margin:'4px 0 0',fontSize:10,textAlign:'center',color:'var(--accent-gold)',fontWeight:700}}>{v}</p>
                <p style={{margin:'1px 0 0',fontSize:8,textAlign:'center',color:'var(--text-muted)'}}>{VDESC[v]}</p>
              </div>
            </div>
          );
        })}
      </div>
      {exp&&<div style={{marginTop:16,background:'var(--bg-card)',border:'2px solid #7C3AED',borderRadius:12,padding:20}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <h3 style={{margin:0,fontSize:15,color:'var(--accent-gold)',fontWeight:700}}>{exp} · {VDESC[exp]}</h3>
          <button onClick={()=>setExp(null)} style={{background:'none',border:'none',fontSize:22,cursor:'pointer',color:'var(--text-muted)'}}>×</button>
        </div>
        <C planets={K.planets.map(p=>({...p,rashi:K.divCharts[exp]?.[p.key]??p.rashi}))} lagnaR={K.lagna.rashi} size={300} lang={lang}/>
      </div>}
    </div>
  );
}

function PlanetsTab({K,lang='en'}){
  const{planets,lagna}=K;
  const Badge=({t,bg,clr})=><span style={{background:'transparent',color:clr,border:`1px solid ${clr}66`,padding:'1px 6px',borderRadius:4,fontSize:10,fontWeight:600,marginRight:2,display:'inline-block'}}>{t}</span>;
  const HNAMES=(L_HNAMES[lang]||L_HNAMES.en);
  return(
    <div style={{animation:'slideIn 0.2s ease'}}>
      <div style={{background:'var(--bg-card)',border:'1px solid var(--border-light)',borderRadius:10,padding:'12px 18px',marginBottom:14,display:'flex',gap:20,flexWrap:'wrap',fontSize:13}}>
        {[[t('pl.lagnaLabel',lang),`${(L_RASHI[lang]||L_RASHI.en)[lagna.rashi]}`,lagna.degFmt],[t('pl.lagnaLord',lang),(L_GRAHA[lang]||L_GRAHA.en)[RASHI_LORD[lagna.rashi]]||RASHI_LORD[lagna.rashi],'']].map(([k,v,s])=>(
          <div key={k}><span style={{fontSize:10,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:0.5,display:'block'}}>{k}</span><span style={{fontSize:16,fontWeight:700,color:'var(--accent-gold)'}}>{v}</span>{s&&<span style={{fontSize:12,color:'var(--text-muted)'}}> · {s}</span>}</div>
        ))}
      </div>
      <div style={{background:'var(--bg-card)',borderRadius:10,border:'1px solid var(--border-light)',overflow:'hidden',marginBottom:18}}>
        <div className="table-scroll-wrapper">
          <table style={{width:'100%',fontSize:12}}>
            <thead><tr style={{background:'rgba(212,175,55,0.05)'}}>
              {[t('pl.graha',lang),t('pl.rashi',lang),t('pl.deg',lang),t('pl.nak',lang),t('pl.pada',lang),t('pl.nakL',lang),t('pl.signL',lang),t('pl.bhava',lang),t('pl.status',lang)].map(h=><th key={h} style={{padding:'9px 10px',textAlign:'left',fontWeight:700,color:'var(--accent-gold)',fontSize:10,textTransform:'uppercase',borderBottom:'1.5px solid #E5D5C0',whiteSpace:'nowrap'}}>{h}</th>)}
            </tr></thead>
            <tbody>{planets.map((p,i)=>(
              <tr key={i} style={{borderBottom:'1px solid var(--border-light)'}}
                onMouseEnter={e=>e.currentTarget.style.background='rgba(212,175,55,0.05)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <td style={{padding:'10px 10px'}}><span style={{width:8,height:8,borderRadius:'50%',background:PCOLOR[p.key],display:'inline-block',marginRight:6}}/><strong>{(L_GRAHA[lang]||L_GRAHA.en)[p.key]||p.name}</strong></td>
                <td style={{padding:'10px 10px',color:'var(--text-main)'}}>{(L_RASHI[lang]||L_RASHI.en)[p.rashi]}</td>
                <td style={{padding:'10px 10px',fontFamily:'monospace',color:'var(--text-main)',fontSize:11}}>{p.degFmt}</td>
                <td style={{padding:'10px 10px',color:'var(--text-main)'}}>{(L_NAKS[lang]||L_NAKS.en)[p.nIdx]||p.nakshatraName}</td>
                <td style={{padding:'10px 10px',textAlign:'center',color:'var(--text-main)'}}>{p.pada}</td>
                <td style={{padding:'10px 10px',color:'var(--text-main)'}}>{(L_GRAHA[lang]||L_GRAHA.en)[p.nakshatraLord]||p.nakshatraLord}</td>
                <td style={{padding:'10px 10px',color:'var(--text-main)'}}>{(L_GRAHA[lang]||L_GRAHA.en)[RASHI_LORD[p.rashi]]||RASHI_LORD[p.rashi]}</td>
                <td style={{padding:'10px 10px',textAlign:'center',fontWeight:600}}>{p.house}</td>
                <td style={{padding:'10px 10px'}}>
                  {p.retro&&<Badge t={'(R) '+((L_STATUS[lang]||L_STATUS.en).retrograde)} bg="#FEE2E2" clr="#DC2626"/>}
                  {p.combust&&<Badge t={(L_STATUS[lang]||L_STATUS.en).combust} bg="#FEF3C7" clr="#D97706"/>}
                  {p.exalted&&<Badge t={'↑ '+((L_STATUS[lang]||L_STATUS.en).exalted)} bg="#DCFCE7" clr="#16A34A"/>}
                  {p.debil&&<Badge t={'↓ '+((L_STATUS[lang]||L_STATUS.en).debilitated)} bg="#FEE2E2" clr="#DC2626"/>}
                  {p.vargottama&&<Badge t={(L_STATUS[lang]||L_STATUS.en).vargottama} bg="var(--bg-badge-purple)" clr="var(--text-badge-purple)"/>}
                  {!p.retro&&!p.combust&&!p.exalted&&!p.debil&&!p.vargottama&&<span style={{color:'var(--text-muted)'}}>—</span>}
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
      <h3 style={{fontSize:14,fontWeight:700,color:'var(--text-main)',marginBottom:10}}>{t('pl.bhavaTitle',lang)}</h3>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:8}}>
        {Array.from({length:12},(_,i)=>i+1).map(h=>{
          const hr=(lagna.rashi+h-1)%12;
          const ps=planets.filter(p=>p.house===h);
          return<div key={h} style={{background:'var(--bg-card)',border:'1px solid var(--border-light)',borderRadius:8,padding:'10px 12px'}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
              <div><span style={{fontSize:10,color:'var(--text-muted)',fontWeight:600}}>{t('pl.house',lang)} {h} · {HNAMES[h-1]}</span><p style={{margin:0,fontSize:12,fontWeight:600,color:'var(--text-main)'}}>{(L_RASHI[lang]||L_RASHI.en)[hr]}</p></div>
              <span style={{fontSize:11,color:'var(--accent-gold)',fontWeight:600}}>{t('pl.lord',lang)}: {(L_GRAHA[lang]||L_GRAHA.en)[RASHI_LORD[hr]]||RASHI_LORD[hr]}</span>
            </div>
            {ps.length>0?<div style={{display:'flex',flexWrap:'wrap',gap:4,marginTop:4}}>{ps.map(p=><span key={p.key} style={{padding:'1px 7px',borderRadius:12,fontSize:11,fontWeight:600,background:PCOLOR[p.key]+'22',color:PCOLOR[p.key],border:`1px solid ${PCOLOR[p.key]}44`}}>{(L_GRAHA[lang]||L_GRAHA.en)[p.key]||p.key}</span>)}</div>:<p style={{margin:'4px 0 0',fontSize:11,color:'var(--text-muted)'}}>{t('pl.empty',lang)}</p>}
          </div>;
        })}
      </div>
    </div>
  );
}

function DashaTab({K,lang='en'}){
  const[exp,setExp]=React.useState(null);
  const{dasha}=K;
  const{mahadashas,current}=dasha;
  return(
    <div style={{animation:'slideIn 0.2s ease'}}>
      <h3 style={{margin:'0 0 14px',fontSize:15,color:'var(--text-main)',fontWeight:700}}>{t('da.title',lang)}</h3>
      <Card style={{marginBottom:18}}>
        <div style={{display:'flex',height:50,borderRadius:8,overflow:'hidden',border:'1px solid var(--border-light)'}}>
          {mahadashas.map((d,i)=>(
            <div key={i} style={{flex:DASHA_YRS[d.planet]||d.yrs,background:PCOLOR[d.planet]||'#9CA3AF',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',outline:d.isCurrent?'3px solid #F59E0B':'none',outlineOffset:-3,opacity:d.isCurrent?1:0.75}} onClick={()=>setExp(exp===i?null:i)} title={`${d.planet} ${d.startStr}–${d.endStr}`}>
              <span style={{color:'white',fontSize:(DASHA_YRS[d.planet]||10)>8?12:9,fontWeight:700,textShadow:'0 1px 2px rgba(0,0,0,0.4)',textTransform:'capitalize'}}>{(DASHA_YRS[d.planet]||10)>8?((L_GRAHA[lang]||L_GRAHA.en)[d.planet]||d.planet):((L_ABBR[lang]||L_ABBR.en)[d.planet]||d.planet.slice(0,2))}</span>
            </div>
          ))}
        </div>
        <p style={{marginTop:8,fontSize:12,color:'var(--accent-gold)',textAlign:'center'}}>{t('da.cur',lang)}: <strong>{(L_GRAHA[lang]||L_GRAHA.en)[current?.planet]||current?.planet}</strong> {t('ov.maha',lang)} ({current?.startStr}–{current?.endStr})</p>
      </Card>
      <div style={{display:'grid',gap:7}}>
        {mahadashas.map((m,i)=>(
          <div key={i} style={{background:'var(--bg-card)',border:`1px solid ${m.isCurrent?'#F59E0B':'#E5D5C0'}`,borderRadius:10,overflow:'hidden',boxShadow:m.isCurrent?'0 2px 10px rgba(245,158,11,0.15)':'none'}}>
            <div style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px',cursor:'pointer'}} onClick={()=>setExp(exp===i?null:i)}>
              <div style={{width:10,height:10,borderRadius:'50%',background:PCOLOR[m.planet]||'#9CA3AF',flexShrink:0}}/>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <span style={{fontSize:14,fontWeight:700,color:'var(--text-main)'}}>{(L_GRAHA[lang]||L_GRAHA.en)[m.planet]||m.planet}</span>
                  <span style={{fontSize:12,color:'var(--text-muted)'}}>· {DASHA_YRS[m.planet]} {t('da.yrs',lang)}</span>
                  {m.isCurrent&&<span style={{fontSize:10,background:'#F59E0B',color:'white',padding:'1px 7px',borderRadius:8,fontWeight:700}}>{t('da.active',lang)}</span>}
                </div>
                <p style={{margin:'1px 0 0',fontSize:12,color:'var(--text-muted)'}}>{m.startStr} → {m.endStr}</p>
              </div>
              <span style={{color:'var(--text-muted)'}}>{exp===i?'▲':'▼'}</span>
            </div>
            {exp===i&&<div style={{borderTop:'1px solid var(--border-light)',background:'#FAFAF8'}}>
              <div style={{padding:'8px 16px',fontSize:10,color:'var(--text-muted)',fontWeight:600,textTransform:'uppercase',letterSpacing:0.5}}>{t('da.antars',lang)}</div>
              {(m.antars||[]).map((a,ai)=>(
                <div key={ai} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 16px 8px 30px',borderBottom:'1px solid var(--border-light)',background:a.isCurrent?'var(--bg-badge-purple)':'transparent'}}>
                  <div style={{display:'flex',alignItems:'center',gap:7}}>
                    <div style={{width:7,height:7,borderRadius:'50%',background:PCOLOR[a.planet]||'#9CA3AF'}}/>
                    <span style={{fontSize:13,fontWeight:a.isCurrent?700:400,color:a.isCurrent?'#7C3AED':'#4B5563'}}>{(L_GRAHA[lang]||L_GRAHA.en)[m.planet]||m.planet}/{(L_GRAHA[lang]||L_GRAHA.en)[a.planet]||a.planet}</span>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:7}}>
                    <span style={{fontSize:11,color:'var(--text-muted)'}}>{a.startStr} – {a.endStr}</span>
                    {a.isCurrent&&<span style={{fontSize:10,background:'#7C3AED',color:'white',padding:'1px 6px',borderRadius:8,fontWeight:700}}>{t('da.now',lang)}</span>}
                  </div>
                </div>
              ))}
            </div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function YogaTab({K,lang='en'}){
  const{yogas:ys}=K;
  const raja=ys.filter(y=>y.type==='raja'),dhana=ys.filter(y=>y.type==='dhana'),dosha=ys.filter(y=>y.type==='dosha');
  
  const getTranslatedVars = (vars) => {
    const res = {};
    for (const [k, v] of Object.entries(vars || {})) {
      if (['p1', 'p2'].includes(k)) res[k] = t(`pl.${v}`, lang) || v;
      else if (k === 'rashi') res[k] = t(`yo.rashi.${v}`, lang) || v;
      else res[k] = t(`yo.val.${v}`, lang) || v;
    }
    return res;
  };

  const YCard=({y})=>{
    const tVars = getTranslatedVars(y.vars);
    let calcStr = t(`yo.calc.${y.key}`, lang) || '';
    for (const [k, v] of Object.entries(tVars)) {
      calcStr = calcStr.replace(`{${k}}`, v);
    }
    return(
    <div style={{background:'var(--bg-card)',border:`1px solid var(--border-color)`,borderRadius:10,padding:18,borderLeft:`4px solid ${y.type==='dosha'?'var(--text-badge-red)':y.type==='dhana'?'var(--text-badge-green)':'var(--text-badge-purple)'}`}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:7}}>
        <h4 style={{margin:0,fontSize:14,fontWeight:700,color:y.type==='dosha'?'var(--text-badge-red)':'var(--text-main)'}}>{t(`yo.name.${y.key}`, lang)}</h4>
        <span style={{fontSize:10,padding:'2px 9px',borderRadius:10,fontWeight:700,textTransform:'uppercase',background:y.type==='dosha'?'var(--bg-badge-red)':y.type==='dhana'?'var(--bg-badge-green)':'var(--bg-badge-purple)',color:y.type==='dosha'?'var(--text-badge-red)':y.type==='dhana'?'var(--text-badge-green)':'var(--text-badge-purple)'}}>{y.type==='dosha'?t('yo.doshaLabel',lang):y.type==='dhana'?t('yo.dhanaYoga',lang):t('yo.rajaYoga',lang)}</span>
      </div>
      <p style={{margin:'0 0 7px',fontSize:12,color:'var(--accent-gold)'}}>
        {t('yo.formedBy',lang)}: <span style={{color:'var(--text-muted)'}}>{calcStr}</span>
      </p>
      <p style={{margin:0,fontSize:13,color:'var(--text-main)',lineHeight:1.75}}>{t(`yo.eff.${y.key}`, lang)}</p>
      {y.type === 'dosha' && (
        <div style={{ marginTop: 12, padding: 12, background: 'var(--bg-badge-red)', borderRadius: 6, border: '1px dashed var(--text-badge-red)' }}>
          <strong style={{ color: 'var(--text-badge-red)', fontSize: 12 }}>{t('yo.remedyLabel', lang) || 'Remedies'}:</strong>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-main)', lineHeight: 1.5 }}>
            {t(`yo.rem.${y.key}`, lang)}
          </p>
        </div>
      )}
    </div>
  )};
  const Sec=({title,items,empty,icon})=>(
    <div style={{marginBottom:20}}>
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
        <span style={{fontSize:16}}>{icon}</span>
        <h3 style={{margin:0,fontSize:14,fontWeight:700,color:'var(--text-main)'}}>{title}</h3>
        <span style={{fontSize:12,color:'var(--text-muted)'}}>({items.length})</span>
      </div>
      {items.length>0?<div style={{display:'grid',gap:10}}>{items.map((y,i)=><YCard key={i} y={y}/>)}</div>:<div style={{background:'#FAFAF8',borderRadius:8,padding:'12px 16px',border:'1px dashed #E5D5C0',color:'var(--text-muted)',fontSize:13}}>{empty}</div>}
    </div>
  );
  return(
    <div style={{animation:'slideIn 0.2s ease'}}>
      {ys.length===0&&<div style={{background:'rgba(217, 119, 6, 0.05)',borderRadius:10,padding:16,border:'1px solid #FDE68A',marginBottom:14,color:'#92400E',fontSize:13}}>{t('yo.noYogaMsg',lang)}</div>}
      <Sec title={`${t('yo.rajaYoga',lang)} & ${t('yo.panchaMaha',lang)}`} items={raja} empty={t('yo.noRaja',lang).replace('{raja}',t('yo.rajaYoga',lang))} icon="👑"/>
      <Sec title={`${t('yo.dhanaYoga',lang)} (${t('yo.wealth',lang)})`} items={dhana} empty={t('yo.noDhana',lang).replace('{dhana}',t('yo.dhanaYoga',lang))} icon="💰"/>
      <Sec title={`${t('yo.doshaLabel',lang)} (${t('yo.afflictions',lang)})`} items={dosha} empty={t('yo.noDosha',lang)} icon="⚠️"/>
    </div>
  );
}

function ShadbalaTab({K,lang='en'}){
  const{shadbala:sb}=K;
  const entries=Object.entries(sb);
  const mx=Math.max(...entries.map(([,v])=>v.total));
  return(
    <div style={{animation:'slideIn 0.2s ease'}}>
      <h3 style={{margin:'0 0 14px',fontSize:15,color:'var(--text-main)',fontWeight:700}}>{t('sh.title',lang)} — {t('sh.virupas',lang)}</h3>
      <div style={{background:'var(--bg-card)',border:'1px solid var(--border-light)',borderRadius:10,overflow:'hidden',marginBottom:20}}>
        <div className="table-scroll-wrapper">
          <table style={{width:'100%',fontSize:12}}>
            <thead><tr style={{background:'rgba(212,175,55,0.05)'}}>
              {[t('sh.graha',lang),t('sh.sthana',lang),t('sh.dig',lang),t('sh.kala',lang),t('sh.chesta',lang),t('sh.naisargika',lang),t('sh.drik',lang),t('sh.total',lang),t('sh.strength',lang)].map(h=><th key={h} style={{padding:'9px 10px',textAlign:h==='Graha'?'left':'center',fontWeight:700,color:'var(--accent-gold)',fontSize:10,textTransform:'uppercase',borderBottom:'1.5px solid #E5D5C0',whiteSpace:'nowrap'}}>{h}</th>)}
            </tr></thead>
            <tbody>{entries.map(([key,s])=>(
              <tr key={key} style={{borderBottom:'1px solid var(--border-light)'}}
                onMouseEnter={e=>e.currentTarget.style.background='rgba(212,175,55,0.05)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <td style={{padding:'9px 10px'}}><span style={{width:8,height:8,borderRadius:'50%',background:PCOLOR[key],display:'inline-block',marginRight:6}}/><strong>{(L_GRAHA[lang]||L_GRAHA.en)[key]||s.planet}</strong></td>
                {[s.sthana,s.dig,s.kala,s.chesta,s.naisargika,s.drik].map((v,i)=><td key={i} style={{padding:'9px 10px',textAlign:'center',color:'var(--text-main)'}}>{v}</td>)}
                <td style={{padding:'9px 10px',textAlign:'center',fontWeight:700,fontSize:14,color:s.total>=350?'#16A34A':s.total>=250?'#D97706':'#DC2626'}}>{s.total}</td>
                <td style={{padding:'9px 10px',textAlign:'center'}}><span style={{padding:'2px 9px',borderRadius:10,fontSize:11,fontWeight:600,background:s.cls==='Strong'?'#DCFCE7':s.cls==='Moderate'?'#FEF3C7':'#FEE2E2',color:s.cls==='Strong'?'#16A34A':s.cls==='Moderate'?'#D97706':'#DC2626'}}>{s.cls==='Strong'?t('sh.strong',lang):s.cls==='Moderate'?t('sh.moderate',lang):t('sh.weak',lang)}</span></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
      <Card>
        <h4 style={{margin:'0 0 14px',fontSize:13,fontWeight:700,color:'var(--text-main)'}}>{t('sh.comparative',lang)}</h4>
        {entries.map(([key,s])=>{
          const pct=Math.round((s.total/(mx*1.1))*100);
          const bar=s.total>=350?'linear-gradient(90deg,#7C3AED,#10B981)':s.total>=250?'linear-gradient(90deg,#F59E0B,#D97706)':'linear-gradient(90deg,#EF4444,#DC2626)';
          return<div key={key} style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
            <div style={{display:'flex',alignItems:'center',gap:5,width:80}}><span style={{width:8,height:8,borderRadius:'50%',background:PCOLOR[key],display:'inline-block',flexShrink:0}}/><span style={{fontSize:12,fontWeight:600}}>{(L_GRAHA[lang]||L_GRAHA.en)[key]||s.planet}</span></div>
            <div style={{flex:1,height:20,background:'var(--bg-input)',borderRadius:4,overflow:'hidden'}}>
              <div style={{width:`${pct}%`,height:'100%',background:bar,borderRadius:4,display:'flex',alignItems:'center',justifyContent:'flex-end',paddingRight:5}}>
                <span style={{fontSize:10,color:'white',fontWeight:700,textShadow:'0 1px 2px rgba(0,0,0,0.3)'}}>{s.total}</span>
              </div>
            </div>
            <span style={{fontSize:11,fontWeight:700,width:55,color:s.cls==='Strong'?'#16A34A':s.cls==='Moderate'?'#D97706':'#DC2626'}}>{s.cls==='Strong'?t('sh.strong',lang):s.cls==='Moderate'?t('sh.moderate',lang):t('sh.weak',lang)}</span>
          </div>;
        })}
      </Card>
    </div>
  );
}


function AshtakavargaTab({K,lang='en'}){
  const{ashtakavarga:{BAV,SAV}}=K;
  const PKS=['sun','moon','mars','mercury','jupiter','venus','saturn'];
  const PDN=(L_GRAHA[lang]||L_GRAHA.en);
  const cc=v=>v>=5?{bg:'var(--bg-badge-green)',c:'var(--text-badge-green)'}:v>=4?{bg:'var(--bg-badge-yellow)',c:'var(--text-badge-yellow)'}:v>=3?{bg:'var(--bg-badge-purple)',c:'var(--text-badge-purple)'}:v>=2?{bg:'var(--bg-badge-orange)',c:'var(--text-badge-orange)'}:{bg:'var(--bg-badge-red)',c:'var(--text-badge-red)'};
  const sc=v=>v>=30?{bg:'var(--bg-badge-green)',c:'var(--text-badge-green)'}:v>=22?{bg:'var(--bg-badge-purple)',c:'var(--text-badge-purple)'}:{bg:'var(--bg-badge-red)',c:'var(--text-badge-red)'};
  return(
    <div style={{animation:'slideIn 0.2s ease'}}>
      <h3 style={{margin:'0 0 6px',fontSize:15,color:'var(--text-main)',fontWeight:700}}>{t('av.title',lang)} — {t('av.bindu',lang)}</h3>
      <p style={{margin:'0 0 18px',fontSize:13,color:'var(--text-muted)'}}>{t('av.binduDesc',lang)}</p>
      {PKS.map(p=>{
        const row=BAV[p]||new Array(12).fill(0),tot=row.reduce((a,b)=>a+b,0);
        return<div key={p} style={{background:'var(--bg-card)',border:'1px solid var(--border-light)',borderRadius:10,overflow:'hidden',marginBottom:12}}>
          <div style={{display:'flex',alignItems:'center',gap:8,padding:'9px 14px',borderBottom:'1px solid var(--border-light)',background:'var(--bg-input)'}}>
            <span style={{width:9,height:9,borderRadius:'50%',background:PCOLOR[p],display:'inline-block'}}/>
            <h4 style={{margin:0,fontSize:12,fontWeight:700,color:'var(--text-main)'}}>{PDN[p]} {t('av.bav',lang)}</h4>
            <span style={{marginLeft:'auto',fontSize:11,color:'var(--text-muted)'}}>{t('ashtakavarga.total',lang)}: <strong style={{color:'var(--accent-gold)'}}>{tot}</strong></span>
          </div>
          <div className="table-scroll-wrapper">
            <table style={{width:'100%',tableLayout:'fixed'}}>
              <thead><tr>{(L_RASHI[lang]||L_RASHI.en).map((r,i)=><th key={i} style={{padding:'5px 3px',fontSize:9,fontWeight:600,color:'var(--text-muted)',textAlign:'center',borderBottom:'1px solid var(--border-light)',minWidth:55}}>{r.slice(0,4)}</th>)}</tr></thead>
              <tbody><tr>{row.map((v,i)=>{const{bg,c}=cc(v);return<td key={i} style={{padding:'7px 3px',textAlign:'center',background:bg}}><span style={{fontSize:13,fontWeight:700,color:c}}>{v}</span></td>})}</tr></tbody>
            </table>
          </div>
        </div>;
      })}
      <div style={{background:'var(--bg-card)',border:'2px solid #7C3AED',borderRadius:10,overflow:'hidden',marginBottom:16}}>
        <div style={{padding:'10px 14px',borderBottom:'1.5px solid #E5D5C0',background:'rgba(212,175,55,0.05)'}}>
          <h3 style={{margin:0,fontSize:13,fontWeight:700,color:'var(--accent-gold)'}}>{t('av.sav',lang)} — {t('av.savDesc',lang)}</h3>
          <p style={{margin:'3px 0 0',fontSize:11,color:'var(--text-muted)'}}>{t('av.stdTotal',lang)} = 337 · {t('av.yours',lang)}: {SAV.reduce((a,b)=>a+b,0)}</p>
        </div>
        <div className="table-scroll-wrapper">
          <table style={{width:'100%',tableLayout:'fixed'}}>
            <thead><tr>{(L_RASHI[lang]||L_RASHI.en).map((r,i)=><th key={i} style={{padding:'7px 3px',fontSize:10,fontWeight:700,color:'var(--accent-gold)',textAlign:'center',borderBottom:'1.5px solid #E5D5C0',minWidth:60}}>{r.slice(0,5)}</th>)}</tr></thead>
            <tbody><tr>{SAV.map((v,i)=>{const{bg,c}=sc(v);return<td key={i} style={{padding:'9px 3px',textAlign:'center',background:bg,borderBottom:'1px solid var(--border-light)'}}><div style={{fontSize:16,fontWeight:700,color:c}}>{v}</div><div style={{fontSize:9,color:'var(--text-muted)'}}>{(L_RASHI[lang]||L_RASHI.en)[i].slice(0,3)}</div></td>})}</tr></tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// PDF GENERATOR
// ════════════════════════════════════════════════════════════════
function makeSVGChart(planets,lagnaR,size,lang='en'){
  const cell=size/4;
  const SI_POS=[[1,0],[2,0],[3,0],[3,1],[3,2],[3,3],[2,3],[1,3],[0,3],[0,2],[0,1],[0,0]];
  const ABBR2=(L_ABBR[lang]||L_ABBR.en);
  const PCLR2={sun:'#F59E0B',moon:'#8B5CF6',mars:'#EF4444',mercury:'#10B981',jupiter:'#D97706',venus:'#EC4899',saturn:'#6366F1',rahu:'#1E3A5F',ketu:'#7C3AED'};
  let s=`<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" style="border:2px solid #7C3AED;border-radius:6px;background:#FFFCF5;display:block;margin:0 auto">`;
  for(let i=1;i<=3;i++){s+=`<line x1="${cell*i}" y1="0" x2="${cell*i}" y2="${size}" stroke="var(--border-light)" stroke-width="1"/><line x1="0" y1="${cell*i}" x2="${size}" y2="${cell*i}" stroke="var(--border-light)" stroke-width="1"/>`;}
  s+=`<rect x="${cell}" y="${cell}" width="${cell*2}" height="${cell*2}" fill="rgba(212,175,55,0.03)" stroke="var(--accent-gold)" stroke-width="1.5"/><text x="${size/2}" y="${size/2+8}" text-anchor="middle" font-size="22" fill="#7C3AED" opacity="0.25">☀</text>`;
  SI_POS.forEach(([col,row],ri)=>{
    const x=col*cell,y=row*cell,ps=planets.filter(p=>p.rashi===ri),isL=ri===lagnaR;
    if(isL)s+=`<rect x="${x+1}" y="${y+1}" width="${cell-2}" height="${cell-2}" fill="rgba(212,175,55,0.15)" rx="2"/>`;
    s+=`<text x="${x+3}" y="${y+11}" font-size="9" fill="var(--text-muted)" font-family="Georgia,serif">${ri+1}</text>`;
    if(isL)s+=`<text x="${x+cell-4}" y="${y+11}" font-size="9" fill="#7C3AED" text-anchor="end" font-weight="bold" font-family="Georgia,serif">${(STRINGS[lang]||STRINGS.en)['ch.asc']||'Lg'}</text>`;
    ps.forEach((p,pi)=>{
      const ab=(ABBR2[p.key]||ABBR2[p.key]||p.key.slice(0,2)),fl=((p.retro && p.key !== 'rahu' && p.key !== 'ketu')?'(R)':'')+(p.exalted?'↑':p.debil?'↓':''),clr=PCLR2[p.key]||'#1E3A5F';
      s+=`<text x="${x+4}" y="${y+22+pi*13}" font-size="11" fill="${clr}" font-weight="600" font-family="Georgia,serif">${ab}${fl}</text>`;
    });
  });
  return s+'</svg>';
}

function downloadPDF(K,lang,PK){
  try {


  const browserNow=new Date();
  const todayK=computeKundali({year:browserNow.getUTCFullYear(),month:browserNow.getUTCMonth()+1,day:browserNow.getUTCDate(),hour:browserNow.getUTCHours(),minute:browserNow.getUTCMinutes(),utcOffset:0,lat:K.input.lat,lng:K.input.lng});
  const tMoon=todayK.planets.find(p=>p.key==='moon');
  const natMoon=K.planets.find(p=>p.key==='moon');
  const tJup=todayK.planets.find(p=>p.key==='jupiter');
  const natJup=K.planets.find(p=>p.key==='jupiter');
  const tSat=todayK.planets.find(p=>p.key==='saturn');
  
  const moonFromNat=(tMoon.rashi-natMoon.rashi+12)%12+1;
  const jupFromLagna=(tJup.rashi-K.lagna.rashi+12)%12+1;
  
  const XP=L_EXPERT[lang]||L_EXPERT.en;
  const RNV=L_RASHI[lang]||L_RASHI.en;
  const GNV=L_GRAHA[lang]||L_GRAHA.en;

  const S=STRINGS[lang]||STRINGS.en;
  const{input,lagna,planets,dasha,yogas:ys,shadbala:sb,ashtakavarga:av,panchang:pan,ayanamsaDMS,sunrise,sunset,lst}=K;
  const lpan=localizePanchang(pan,lang);
  const moon=planets.find(p=>p.key==='moon'),sun2=planets.find(p=>p.key==='sun');
  const cur=dasha.mahadashas.find(m=>m.isCurrent)||dasha.mahadashas[0];
  const curA=cur?.antars?.find(a=>a.isCurrent)||cur?.antars?.[0];
  const d9pl=planets.map(p=>({...p,rashi:K.divCharts.D9?.[p.key]??p.rashi}));
  const d1svg=makeSVGChart(planets,lagna.rashi,260,lang);
  const d9svg=makeSVGChart(d9pl,lagna.rashi,260,lang);
  const strong=Object.entries(sb).filter(([,v])=>v?.cls==='Strong').map(([k])=>k);
  const weak=Object.entries(sb).filter(([,v])=>v?.cls==='Weak').map(([k])=>k);
  const formDate=new Date(input.year,input.month-1,input.day).toLocaleDateString(lang==='en'?'en-IN':lang==='hi'?'hi-IN':lang==='kn'?'kn-IN':lang==='te'?'te-IN':lang==='ta'?'ta-IN':lang==='mr'?'mr-IN':lang==='gu'?'gu-IN':lang==='bn'?'bn-IN':lang==='ml'?'ml-IN':'en-IN',{day:'numeric',month:'long',year:'numeric'});
  const LAGNA_R=(L_LAGNA[lang]||L_LAGNA.en);
  const DASHA_M=(L_DASHA[lang]||L_DASHA.en);
  const yogaRows=ys.map(y=>{const ly=(L_YOGA[lang]||L_YOGA.en)[y.name]||{name:y.name,effect:y.effect};return`<tr><td style="padding:6px 8px;border:1px solid #E5D5C0;font-weight:600">${ly.name}</td><td style="padding:6px 8px;border:1px solid #E5D5C0;color:${y.type==='dosha'?'#EF4444':y.type==='raja'?'#7C3AED':'#10B981'};font-size:11px;text-transform:uppercase">${y.type}</td><td style="padding:6px 8px;border:1px solid #E5D5C0;font-size:12px">${ly.effect}</td></tr>`}).join('');
  const LS=(L_STATUS[lang]||L_STATUS.en);const planetRows=planets.map(p=>`<tr style="border-bottom:1px solid #F3F4F6"><td style="padding:5px 8px;border:1px solid #E5D5C0;font-weight:600;color:${PCOLOR[p.key]||'#1E3A5F'}">${(L_GRAHA[lang]||L_GRAHA.en)[p.key]||p.name}</td><td style="padding:5px 8px;border:1px solid #E5D5C0">${(L_RASHI[lang]||L_RASHI.en)[p.rashi]}</td><td style="padding:5px 8px;border:1px solid #E5D5C0;font-family:monospace;font-size:11px">${p.degFmt}</td><td style="padding:5px 8px;border:1px solid #E5D5C0;font-size:12px">${(L_NAKS[lang]||L_NAKS.en)[p.nIdx]||p.nakshatraName}</td><td style="padding:5px 8px;border:1px solid #E5D5C0;text-align:center">${p.pada}</td><td style="padding:5px 8px;border:1px solid #E5D5C0;text-align:center">${p.house}</td><td style="padding:5px 8px;border:1px solid #E5D5C0;font-size:11px">${[p.exalted?LS.exalted:p.debil?LS.debilitated:'',(p.retro && p.key !== 'rahu' && p.key !== 'ketu')?LS.retrograde:'',p.combust?LS.combust:'',p.vargottama?LS.vargottama:''].filter(Boolean).join(', ')||'—'}</td></tr>`).join('');
  const dashaRows=dasha.mahadashas.map(m=>`<tr style="${m.isCurrent?'background:#FFF9E6':''}"><td style="padding:5px 8px;border:1px solid #E5D5C0;font-weight:600;color:${PCOLOR[m.planet]||'#1E3A5F'}">${(L_GRAHA[lang]||L_GRAHA.en)[m.planet]||m.planet}${m.isCurrent?' ★':''}</td><td style="padding:5px 8px;border:1px solid #E5D5C0">${DASHA_YRS[m.planet]} ${S['da.yrs']||S.da?.yrs||'yrs'}</td><td style="padding:5px 8px;border:1px solid #E5D5C0">${m.startStr}</td><td style="padding:5px 8px;border:1px solid #E5D5C0">${m.endStr}</td><td style="padding:5px 8px;border:1px solid #E5D5C0;font-size:11px">${m.isCurrent?(curA?`${S.ov?.antar||S['pdf.antardasha']||'Antardasha'}: ${(L_GRAHA[lang]||L_GRAHA.en)[curA.planet]||curA.planet} (${curA.startStr}–${curA.endStr})`:S['da.active']||'Active'):'—'}</td></tr>`).join('');
  const sbRows=Object.entries(sb).map(([k,v])=>`<tr><td style="padding:5px 8px;border:1px solid #E5D5C0;font-weight:600">${(L_GRAHA[lang]||L_GRAHA.en)[k]||k}</td><td style="padding:5px 8px;border:1px solid #E5D5C0;text-align:center">${v?.total?.toFixed(1)||'—'}</td><td style="padding:5px 8px;border:1px solid #E5D5C0;text-align:center;color:${v?.cls==='Strong'?'#16A34A':v?.cls==='Weak'?'#DC2626':'#D97706'}">${(v?.cls==='Strong'?(S.shadbala?.strong||S['shadbala.strong']||'Strong'):v?.cls==='Moderate'?(S.shadbala?.moderate||S['shadbala.moderate']||'Moderate'):v?.cls==='Weak'?(S.shadbala?.weak||S['shadbala.weak']||'Weak'):'—')}</td></tr>`).join('');
  
  // Ashtakavarga HTML
  let extraHTML = '<div class="page-break"></div>';
  extraHTML += `<h2>${S.avarga||'Ashtakavarga'}</h2><table><thead><tr>${[1,2,3,4,5,6,7,8,9,10,11,12].map(h=>'<th>H'+h+'</th>').join('')}<th>Total</th></tr></thead><tbody><tr>${K.ashtakavarga.SAV.map(score => '<td style="text-align:center;font-weight:600;color:'+(score>=28?'#16A34A':'#DC2626')+'">'+score+'</td>').join('')}<td style="text-align:center;font-weight:700">337</td></tr></tbody></table>`;

  // Daily Forecast
  let tmState = 'mix';
  if ([1, 3, 6, 7, 10, 11].includes(moonFromNat)) tmState = 'fav';
  else if ([4, 8, 12].includes(moonFromNat)) tmState = 'unf';
  
  extraHTML += `<div class="page-break"></div><h2>${S.ov?.dailyWeather||'Daily Cosmic Weather'}</h2>
    <div style="background:rgba(0,0,0,0.03);padding:14px;border-left:3px solid #D97706;margin-bottom:16px;">
      <strong>${S.ov?.transitRationale?.replace('{rashi}', RNV[tMoon.rashi]).replace('{house}', moonFromNat)||`Transit Moon in ${moonFromNat}th house`}</strong>
    </div>
    <div class="reading-section"><div class="reading-label">${S.ov?.favorable||'Favorable'}</div><p>${S.ov?.[`favorableDesc_${tmState}`] || S.ov?.favorableDesc || ''}</p></div>
    <div class="reading-section"><div class="reading-label">${S.ov?.avoid||'Avoid'}</div><p>${S.ov?.[`avoidDesc_${tmState}`] || S.ov?.avoidDesc || ''}</p></div>
    <div class="reading-section"><div class="reading-label">${S.ov?.mantra||'Mantra'}</div><p><em>${S.ov?.[`mantraDesc_${tmState}`] || S.ov?.mantraDesc || ''}</em></p></div>
  `;

  // Compatibility HTML
  if (PK) {
    const match = calculateMatch(K, PK);
    const C = S;
    extraHTML += `<div class="page-break"></div><h2>${C['comp.title']||'Relationship Compatibility'} — ${match.p2.name}</h2>
    <div style="background:#FAFAF8;border:1px solid #E5D5C0;border-radius:8px;padding:16px;margin-bottom:12px;text-align:center">
      <div style="font-size:28px;color:#7C3AED;font-weight:700;margin-bottom:8px">${match.totalScore.toFixed(1)} / 36</div>
      <div style="font-size:14px;color:#1E3A5F;font-weight:600">${match.totalScore >= 18 ? (C.ov?.favorable||'Favorable Match') : (C.ov?.avoid||'Challenging Match')}</div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
      <div class="stat-box" style="background:#FFF"><span class="stat-label">${match.p1.name} (User)</span><span class="stat-val">${RNV[match.p1.rashiIndex]||match.p1.rashi}</span><div class="stat-sub">Manglik: ${match.p1.isManglik?'Yes':'No'}</div></div>
      <div class="stat-box" style="background:#FFF"><span class="stat-label">${match.p2.name} (Partner)</span><span class="stat-val">${RNV[match.p2.rashiIndex]||match.p2.rashi}</span><div class="stat-sub">Manglik: ${match.p2.isManglik?'Yes':'No'}</div></div>
    </div>
    <table><thead><tr><th>${C['comp.koota']||'Koota'}</th><th>${C['comp.score']||'Score'}</th><th>${C['comp.details']||'Details'}</th></tr></thead><tbody>
      ${match.elements.map(k=>'<tr><td style="padding:6px 8px;border:1px solid #E5D5C0;font-weight:600">'+(C['comp.'+k.key]||k.name)+'</td><td style="padding:6px 8px;border:1px solid #E5D5C0;text-align:center;color:'+(k.score<k.max/2?'#EF4444':'#10B981')+'">'+k.score+' / '+k.max+'</td><td style="padding:6px 8px;border:1px solid #E5D5C0;font-size:11.5px">'+(C['comp.'+k.descKey]||k.desc)+'</td></tr>').join('')}
    </tbody></table>`;
  }
  const html=`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${S.pdf.title} — ${input.city||''}</title><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Georgia,serif;background:white;color:#1E3A5F;font-size:13px;line-height:1.5}@media print{body{margin:0}.no-print{display:none!important}.page-break{page-break-before:always}}h1{font-size:22px;color:#7C3AED;margin-bottom:4px}h2{font-size:16px;color:#1E3A5F;margin:18px 0 8px;padding-bottom:5px;border-bottom:2px solid #E5D5C0}h3{font-size:13px;color:#7C3AED;margin:12px 0 6px}table{width:100%;border-collapse:collapse;font-size:12px;margin-bottom:12px}th{background:#F5F0FF;color:#7C3AED;text-align:left;padding:7px 8px;border:1px solid #E5D5C0;font-size:11px;text-transform:uppercase;letter-spacing:0.5px}td{padding:6px 8px;border:1px solid #E5D5C0;vertical-align:top}.page{max-width:800px;margin:0 auto;padding:28px 32px}.header-band{background:linear-gradient(135deg,#1E3A5F,#4C1D95,#7C3AED);color:white;padding:20px 32px;margin:-28px -32px 20px}.stat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px}.stat-box{background:#F8F4FF;border:1px solid #E5D5C0;border-radius:6px;padding:10px;text-align:center}.stat-label{font-size:10px;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.5px;display:block;margin-bottom:2px}.stat-val{font-size:15px;font-weight:700;color:#7C3AED}.stat-sub{font-size:11px;color:#6B7280;margin-top:2px}.panchang-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:16px}.panch-item{background:#FFF7ED;border:1px solid #E5D5C0;border-radius:6px;padding:8px;text-align:center}.chart-row{display:flex;gap:24px;justify-content:center;margin:16px 0}.chart-box{text-align:center}.chart-title{font-size:12px;font-weight:700;color:#7C3AED;margin-bottom:6px}.reading-section{background:#FAFAF8;border:1px solid #E5D5C0;border-radius:8px;padding:14px;margin-bottom:12px}.reading-label{font-size:11px;font-weight:700;color:#7C3AED;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px}.disc{font-size:11px;color:#9CA3AF;font-style:italic;border-top:1px solid #E5D5C0;padding-top:10px;margin-top:10px}.print-btn{display:inline-block;margin:16px 8px 0 0;padding:10px 20px;background:#7C3AED;color:white;border:none;border-radius:8px;font-family:Georgia,serif;font-size:14px;cursor:pointer}.close-btn{display:inline-block;margin:16px 0 0;padding:10px 20px;background:white;color:#7C3AED;border:1px solid #7C3AED;border-radius:8px;font-family:Georgia,serif;font-size:14px;cursor:pointer}</style></head><body>
<div class="page">
<div class="header-band">
  <div style="display:flex;justify-content:space-between;align-items:flex-start">
    <div>
      <div style="font-size:13px;opacity:0.7;letter-spacing:2px;margin-bottom:4px">${S.pdf.by} · ${S.pdf.lahiri} · ${S.pdf.para}</div>
      <h1 style="color:white;font-size:24px;margin-bottom:6px">${S.pdf.title}</h1>
      <div style="font-size:15px;opacity:0.9">${input.city}, ${input.country} &nbsp;·&nbsp; ${formDate}, ${input.tob}</div>
    </div>
    <div style="text-align:right;opacity:0.8;font-size:12px"><div>📍 ${input.lat?.toFixed(3)}°, ${input.lng?.toFixed(3)}°</div><div style="margin-top:4px">${S.pdf?.ayanamsa||S["pdf.ayanamsa"]||"Ayanamsa"}: ${ayanamsaDMS}</div></div>
  </div>
</div>

<div class="stat-grid">
  <div class="stat-box"><span class="stat-label">${S.ov.lagna}</span><span class="stat-val">${(L_RASHI[lang]||L_RASHI.en)[lagna.rashi]}</span><div class="stat-sub">${lagna.degFmt}</div></div>
  <div class="stat-box"><span class="stat-label">${S.ov.moon}</span><span class="stat-val">${(L_RASHI[lang]||L_RASHI.en)[moon.rashi]}</span><div class="stat-sub">${(L_NAKS[lang]||L_NAKS.en)[moon.nIdx]||moon.nakshatraName} ${S['pdf.pada']||'Pd'} ${moon.pada}</div></div>
  <div class="stat-box"><span class="stat-label">${S.ov.sun}</span><span class="stat-val">${(L_RASHI[lang]||L_RASHI.en)[sun2.rashi]}</span><div class="stat-sub">${(L_NAKS[lang]||L_NAKS.en)[sun2.nIdx]||sun2.nakshatraName} ${S['pdf.pada']||'Pd'} ${sun2.pada}</div></div>
</div>

<div class="panchang-grid">
  ${[[S.ov.tithi,lpan.tithi],[S.ov.vara,lpan.vara],[S.ov.nakshatra,lpan.nakshatra],[S.ov.yoga,lpan.yoga],[S.ov.karana,lpan.karana]].map(([l,v])=>`<div class="panch-item"><span class="stat-label">${l}</span><div style="font-size:13px;font-weight:600;color:#1E3A5F">${v}</div></div>`).join('')}
</div>

<div style="background:#F5F0FF;border:1px solid #C4B5FD;border-radius:8px;padding:12px;margin-bottom:16px;display:flex;gap:24px">
  <div><span style="font-size:10px;color:#7C3AED;text-transform:uppercase;letter-spacing:0.5px;display:block">${S.ov.maha}</span><strong style="font-size:16px;color:#1E3A5F">${(L_GRAHA[lang]||L_GRAHA.en)[cur?.planet]||cur?.planet}</strong> <span style="font-size:12px;color:#6B7280">(${cur?.startStr} – ${cur?.endStr})</span></div>
  ${curA?`<div><span style="font-size:10px;color:#D97706;text-transform:uppercase;letter-spacing:0.5px;display:block">${S.ov.antar}</span><strong style="font-size:15px;color:#1E3A5F">${(L_GRAHA[lang]||L_GRAHA.en)[cur?.planet]||cur?.planet}/${(L_GRAHA[lang]||L_GRAHA.en)[curA?.planet]||curA?.planet}</strong> <span style="font-size:12px;color:#6B7280">(${curA?.startStr} – ${curA?.endStr})</span></div>`:''}
  <div><span style="font-size:10px;color:#E11D48;text-transform:uppercase;letter-spacing:0.5px;display:block">${S.ov.birth}</span><strong style="font-size:15px;color:#1E3A5F">${(L_GRAHA[lang]||L_GRAHA.en)[dasha.nakLord]||dasha.nakLord}</strong> <span style="font-size:12px;color:#6B7280">${dasha.nakName}</span></div>
</div>

<div class="chart-row">
  <div class="chart-box"><div class="chart-title">${S['ov.rashiChart']||S.ov?.rashiChart||'D1 · Rashi Chart'}</div>${d1svg}</div>
  <div class="chart-box"><div class="chart-title">${S['ov.navamsa']||S.ov?.navamsa||'D9 · Navamsa'}</div>${d9svg}</div>
</div>

<div class="page-break"></div>

<h2>${S.pl.title}</h2>
<table><thead><tr><th>${S.pl.graha}</th><th>${S.pl.rashi}</th><th>${S.pl.deg}</th><th>${S.pl.nak}</th><th>${S.pl.pada}</th><th>${S.pl.bhava}</th><th>${S.pl.status}</th></tr></thead><tbody>${planetRows}</tbody></table>

<h2>${S.da.title}</h2>
<table><thead><tr><th>${S.pl.graha}</th><th>${S['pdf.years']||S.pdf?.years||'Years'}</th><th>${S['pdf.start']||S.pdf?.start||'Start'}</th><th>${S['pdf.end']||S.pdf?.end||'End'}</th><th>${S.da.cur} ${S.ov?.antar||S['pdf.antardasha']||'Antardasha'}</th></tr></thead><tbody>${dashaRows}</tbody></table>

${ys.length>0?`<h2>${S.yo.title}</h2><table><thead><tr><th>${S['pdf.yogaDosha']||'Yoga / Dosha'}</th><th>${S['pdf.type']||'Type'}</th><th>${S['pdf.effect']||'Effect'}</th></tr></thead><tbody>${yogaRows}</tbody></table>`:`<h2>${S.yo.title}</h2><p style="color:#9CA3AF;font-style:italic;margin-bottom:12px">${S.yo.none}</p>`}

<h2>${S.sh.title}</h2>
<table><thead><tr><th>${S['pdf.planet']||'Planet'}</th><th>${S['pdf.totalStrength']||'Total Strength'}</th><th>${S['pdf.classification']||'Classification'}</th></tr></thead><tbody>${sbRows}</tbody></table>

<div class="page-break"></div>

<h2>${S.rd.title}</h2>
<div class="reading-section"><div class="reading-label">${S.rd.lagnaA}</div><p>${LAGNA_R[lagna.rashi]||''}</p></div>
<div class="reading-section"><div class="reading-label">${S.rd.moonA||S.rd?.chandra||''}</div><p>${(L_READING[lang]||L_READING.en).chandra((L_NAKS[lang]||L_NAKS.en)[moon.nIdx]||moon.nakshatraName,(L_RASHI[lang]||L_RASHI.en)[moon.rashi],moon.exalted,moon.retro)}</p></div>
<div class="reading-section"><div class="reading-label">${S.rd.dashaR}</div><p><strong>${(L_GRAHA[lang]||L_GRAHA.en)[cur?.planet]}</strong> ${S.ov.maha} (${cur?.startStr} – ${cur?.endStr}). ${DASHA_M[cur?.planet]||''}${curA&&DASHA_M[curA?.planet]?` <strong>${(L_GRAHA[lang]||L_GRAHA.en)[curA.planet]}</strong> ${S.ov.antar} (${curA?.startStr}–${curA?.endStr}): ${DASHA_M[curA?.planet]}.`:''}</p></div>
${ys.filter(y=>y.type!=='dosha').length>0?`<div class="reading-section"><div class="reading-label">${S.rd.yogaI}</div><p>${ys.filter(y=>y.type!=='dosha').map(y=>{const ly=(L_YOGA[lang]||L_YOGA.en)[y.name]||{name:y.name,effect:y.effect};return`<strong>${ly.name}</strong> — ${ly.effect}`}).join(' &nbsp;·&nbsp; ')}</p></div>`:''}
${ys.filter(y=>y.type==='dosha').length>0?`<div class="reading-section" style="border-left:4px solid #EF4444"><div class="reading-label" style="color:#EF4444">${(L_STATUS[lang]||L_STATUS.en).combust?S.yo?.dosha||'Dosha':'Dosha'}</div><p>${ys.filter(y=>y.type==='dosha').map(y=>{const ly=(L_YOGA[lang]||L_YOGA.en)[y.name]||{name:y.name,effect:y.effect};return`<strong>${ly.name}</strong> — ${ly.effect}`}).join(' &nbsp;·&nbsp; ')}</p></div>`:''}
${strong.length>0?`<div class="reading-section"><div class="reading-label">${S.rd.strengthR}</div><p>${strong.map(k=>(L_GRAHA[lang]||L_GRAHA.en)[k]).join(', ')}${weak.length>0?' · '+weak.map(k=>(L_GRAHA[lang]||L_GRAHA.en)[k]).join(', '):''}</p></div>`:''}
<div class="disc">${S.rd.disc}</div>
${extraHTML}

<div class="no-print" style="margin-top:20px;border-top:1px solid #E5D5C0;padding-top:16px">
  <button class="print-btn" onclick="window.print()">🖨 ${S['pdf.printBtn']||'Print / Save as PDF'}</button>
  <button class="close-btn" onclick="window.close()">✕ ${S['pdf.closeBtn']||'Close'}</button>
</div>
</div></body></html>`;
  const iframe = document.createElement('iframe');
  // Chrome instantly aborts print dialogs if the iframe has opacity 0 or 0x0 size!
  // Move it entirely off-screen but keep it 'visible' and 'large' to trick the spooler.
  iframe.style.position = 'absolute';
  iframe.style.top = '-10000px';
  iframe.style.left = '-10000px';
  iframe.style.width = '800px';
  iframe.style.height = '1200px';
  iframe.style.border = '0';
  document.body.appendChild(iframe);
  iframe.contentWindow.document.open();
  iframe.contentWindow.document.write(html);
  iframe.contentWindow.document.close();
  
  setTimeout(() => {
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      // Use only a long fallback cleanup to ensure the dialog stays open
      setTimeout(() => { try { document.body.removeChild(iframe); } catch(e){} }, 300000); // 5 mins
    } catch(e) {}
  }, 400);
  
  } catch (e) {
    alert("PDF Error: " + e.message + "\n" + e.stack);
    console.error("PDF Generation Error:", e);
  }
}

// ════════════════════════════════════════════════════════════════
// RESULTS PAGE
// ════════════════════════════════════════════════════════════════
const TABS_DEF=[
  {id:'charts',label:'Charts',icon:'⊞'},
  {id:'planets',label:'Graha Sthiti',icon:'♃'},
  {id:'dasha',label:'Dasha',icon:'⏳'},
  {id:'yoga',label:'Yoga & Dosha',icon:'⚡'},
  {id:'shadbala',label:'Shadbala',icon:'⚖'},
  {id:'avarga',label:'Ashtakavarga',icon:'🔢'},
  {id:'reading',label:'Expert Reading',icon:'📜'},
];

function ResultsPage({K,onBack,lang,onSwitchProfile,user,onRequireLogin,onForceSync,onOpenTerms,onDeleteProfile}){
    React.useEffect(() => { window.scrollTo({top: 0, behavior: 'smooth'}); }, []);
    const [dashboardMode, setDashboardMode] = React.useState('kundali');

  const[savedProfiles, setSavedProfiles]=React.useState([]);
  React.useEffect(() => {
    const fetchProfiles = () => {
      try {
        const saved = localStorage.getItem('jd_profiles');
        if (saved) {
           const parsed = JSON.parse(saved);
           setSavedProfiles(Array.isArray(parsed) ? parsed : []);
        }
      } catch(e) {}
    };
    fetchProfiles();
    window.addEventListener('jd_profiles_updated', fetchProfiles);
    return () => window.removeEventListener('jd_profiles_updated', fetchProfiles);
  }, [K]);

  const[tab,setTab]=React.useState('charts');
  const[fmt,setFmt]=React.useState('south');
  const[copied,setCopied]=React.useState(false);
  const[menuOpen,setMenuOpen]=React.useState(false);
  const activeProfilesCount = savedProfiles.filter(p => !p.isDeleted).length;
  const menuRef = React.useRef(null);
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef]);
  const[partnerKundali, setPartnerKundali]=React.useState(null);
  const[showPartnerForm, setShowPartnerForm]=React.useState(false);
  const[isSynastryExpanded, setIsSynastryExpanded]=React.useState(true);

  React.useEffect(() => {
    try {
      if (K?.input?.partner) {
        const pk = computeKundali(K.input.partner);
        pk.name = K.input.partner.name;
        setPartnerKundali(pk);
      } else {
        setPartnerKundali(null);
      }
      setShowPartnerForm(false);
      setIsSynastryExpanded(true);
    } catch(e) { 
      setPartnerKundali(null); 
    }
  }, [K]);


  const{input,lagna,panchang:pan,ayanamsaDMS,planets}=K;
  const lpan=localizePanchang(pan,lang);
  const formattedDate=new Date(input.year,input.month-1,input.day).toLocaleDateString(lang==='en'?'en-IN':lang==='hi'?'hi-IN':lang==='kn'?'kn-IN':lang==='te'?'te-IN':lang==='ta'?'ta-IN':lang==='mr'?'mr-IN':lang==='gu'?'gu-IN':lang==='bn'?'bn-IN':lang==='ml'?'ml-IN':'en-IN',{day:'numeric',month:'long',year:'numeric'});
  
  async function handleShare() {
    if (navigator.share) {
      try {
        const moonRashi = planets.find(p=>p.name==='Moon')?.rashi ?? 0;
        await navigator.share({
          title: `Vedic Birth Chart - ${input.city}`,
          text: `Kundali for ${formattedDate} at ${input.tob}.\nLagna: ${(L_RASHI[lang]||L_RASHI.en)[lagna.rashi]} | Moon Sign: ${(L_RASHI[lang]||L_RASHI.en)[moonRashi]}`,
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
      <div className="no-print" style={{maxWidth:1100,margin:'0 auto',padding:'24px 40px 0',display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,flexWrap:'wrap'}}>
        <div></div>
        <div style={{display:'flex', gap:10}}>
          <button onClick={handleShare} className="lux-btn" style={{padding:'8px 16px'}}>
            ⇧ {t('share',lang)}
          </button>
          <button onClick={()=>downloadPDF(K,lang,partnerKundali)} className="lux-btn" style={{padding:'8px 16px',background:'var(--accent-gold)',color:'#000'}}>
            ↓ {t('download',lang)}
          </button>
        </div>
      </div>
      {/* Banner */}
      <div style={{background:'var(--bg-header-gradient)',borderBottom:'1px solid var(--border-light)',padding:'30px 40px', position:'relative'}} ref={menuRef}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <div style={{display:'flex', alignItems:'center', justifyContent: 'space-between', width: '100%', gap:20, flexWrap:'wrap', marginBottom: 12}}>
            <div style={{display:'flex', alignItems:'center', gap:20, flexWrap:'wrap'}}>
              <div style={{display:'inline-block', position:'relative'}}>
              <h2 onClick={()=>setMenuOpen(!menuOpen)} className="serif" style={{margin:0,fontSize:28,fontWeight:400,color:'var(--accent-gold)',letterSpacing:1, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:10, paddingBottom: 4, borderBottom: '1px dashed rgba(212, 175, 55, 0.4)', userSelect:'none'}}>
                {K.input.name || t('inputTitle',lang)}
                <span style={{fontSize:12, opacity:0.8, color:'var(--text-muted)', transform: menuOpen ? 'rotate(180deg)' : 'none', transition:'transform 0.2s'}}>▼</span>
              </h2>
              
              {menuOpen && (
                <div style={{position:'absolute', top:'100%', left:0, background:'var(--bg-surface)', border:'1px solid var(--border-light)', borderRadius:12, minWidth:260, zIndex:100, boxShadow:'0 4px 20px rgba(0,0,0,0.4)', overflow:'hidden', marginTop:4}}>
                  <div style={{padding:'12px 16px', fontSize:11, textTransform:'uppercase', letterSpacing:1, color:'var(--text-muted)', borderBottom:'1px solid var(--border-light)', background:'var(--bg-card)'}}>
                    {t('profile',lang) || 'Profiles'}
                  </div>
                  {savedProfiles && savedProfiles.filter(p => !p.isDeleted).map((p, i) => {
                    let pNak = '';
                    try {
                      const jd = toJD(p.year, p.month, p.day, p.hour, p.minute, p.utcOffset||5.5);
                      const moon = allPlanets(jd).sid.moon.lon;
                      pNak = (L_NAKS[lang] || L_NAKS.en)[nakshatra(moon).idx];
                    } catch(e){}
                    return (
                    <div key={p.name + i} style={{display:'flex', alignItems:'stretch', borderBottom:'1px solid var(--border-light)', background: i===0?'var(--bg-badge-green)':'transparent', transition:'background 0.2s'}}>
                      <div onClick={() => { if(i!==0 && onSwitchProfile) {onSwitchProfile(p);} setMenuOpen(false); }} style={{padding:'12px 16px', cursor: i===0 ? 'default':'pointer', display:'flex', alignItems:'center', gap:10, flex:1}} onMouseOver={e=>e.currentTarget.style.background=i===0?'':'var(--bg-card)'} onMouseOut={e=>e.currentTarget.style.background=i===0?'':'transparent'}>
                        <div style={{width:22,height:22,borderRadius:'50%',background:i===0?'var(--text-badge-green)':'var(--bg-card)',border:i===0?'none':'1px solid var(--border-light)',display:'flex',alignItems:'center',justifyContent:'center',color:i===0?'var(--bg-app)':'var(--text-muted)',fontSize:11,flexShrink:0}}>{i===0?'✓':i+1}</div>
                        <div style={{flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color: i===0?'var(--text-badge-green)':'var(--text-main)', fontWeight: i===0?600:400, fontSize:15}}>
                          {p.name || `Profile ${i+1}`}
                        </div>
                      </div>
                      
                      <div onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setMenuOpen(false);
                        if (onDeleteProfile) {
                           onDeleteProfile(p);
                        } else {
                           alert('Delete profile handler is missing!');
                        }
                      }} style={{padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)', borderLeft: '1px solid var(--border-light)', zIndex: 10}} title={t('deleteProfile',lang) || 'Delete Profile'} onMouseOver={e=>{e.currentTarget.style.background='rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color='#ef4444';}} onMouseOut={e=>{e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--text-muted)';}}>
                        ✕
                      </div>
                    </div>
                  )})}
                  
                  <div onClick={() => { if(activeProfilesCount >= 6) return; setMenuOpen(false); onBack(); }} style={{padding:'14px 16px', cursor: activeProfilesCount >= 6 ? 'not-allowed' : 'pointer', color:'var(--accent-gold)', borderBottom:'1px solid var(--border-light)', display:'flex', alignItems:'center', gap:10, fontWeight:500, transition:'background 0.2s', background:'var(--bg-card)', opacity: activeProfilesCount >= 6 ? 0.4 : 1}} onMouseOver={e=>{if(activeProfilesCount < 6) e.currentTarget.style.background='var(--border-light)'}} onMouseOut={e=>e.currentTarget.style.background='var(--bg-card)'} title={activeProfilesCount >= 6 ? "Limit of 6 profiles reached. Please delete one to create a new Kundali." : (t('newChart',lang) || 'New Kundali')}>
                    <span style={{fontSize:16, width:24, textAlign:'center'}}>➕</span> {t('newChart',lang) || 'New Kundali'}
                  </div>
                </div>
              )}
            </div>

            {/* PARTNER BUTTON */}
            <div style={{display:'flex', alignItems:'center', gap: 12}}>
              {!partnerKundali ? (
                  <button id="add-partner-header-btn" onClick={() => {
                     const opening = !showPartnerForm;
                     setShowPartnerForm(opening); 
                     setIsSynastryExpanded(true);
                     if (opening) {
                       setTimeout(() => {
                         const el = document.getElementById('synastry-form-ctr');
                         if (el) {
                           const y = el.getBoundingClientRect().top + window.scrollY - 80;
                           window.scrollTo({ top: y, behavior: 'smooth' });
                         }
                       }, 100);
                     }
                  }} style={{ background: 'transparent', color: 'var(--accent-gold)', border: '1px dashed var(--accent-gold)', padding: '6px 12px', fontSize: '12px', fontWeight: 'bold', fontFamily: '"Cinzel", serif', cursor: 'pointer', borderRadius: '4px', transition: 'all 0.2s', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8 }} onMouseOver={e=>{e.currentTarget.style.opacity=1; e.currentTarget.style.background='rgba(212,175,55,0.1)'}} onMouseOut={e=>{e.currentTarget.style.opacity=0.8; e.currentTarget.style.background='transparent'}}>
                    {t('comp.addP', lang) || '+ ADD PARTNER'}
                 </button>
              ) : (
                 <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                   <span style={{color: 'var(--accent-gold)', fontSize: 28, fontFamily: '"Cinzel", serif', opacity: 0.5}}>&</span>
                   <h2 className="serif" onClick={() => setIsSynastryExpanded(!isSynastryExpanded)} style={{margin:0,fontSize:28,fontWeight:400,color:'var(--accent-gold)',letterSpacing:1, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:10, paddingBottom: 4, borderBottom: '1px dashed rgba(212, 175, 55, 0.4)', userSelect:'none', transition:'opacity 0.2s'}} title="Toggle Compatibility Details" onMouseOver={e=>e.currentTarget.style.opacity=0.8} onMouseOut={e=>e.currentTarget.style.opacity=1}>
                     {partnerKundali.name || 'Partner'}
                     <span style={{fontSize:12, opacity:0.8, color:'var(--text-muted)', transform: isSynastryExpanded ? 'rotate(180deg)' : 'none', transition:'transform 0.2s'}}>▼</span>
                   </h2>
                   <button onClick={() => {
                     setPartnerKundali(null); 
                     setShowPartnerForm(false);
                     saveProfile({ ...K.input, partner: null });
                   }} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', outline: 'none', padding: '0 8px', marginLeft: 4 }} title="Remove Partner">
                     ✕
                   </button>
                 </div>
              )}
            </div>
            
            </div> {/* END LEFT GROUP */}

            {/* RIGHT GROUP: NEW KUNDALI BUTTON */}
            <div style={{display:'flex', alignItems:'center'}}>
              <button onClick={() => { if(activeProfilesCount >= 6) return; setMenuOpen(false); onBack(); }} style={{fontSize:13, fontWeight:500, padding:'6px 14px', borderRadius:20, background:'var(--bg-card)', color:'var(--accent-gold)', border:'1px solid rgba(212, 175, 55, 0.3)', cursor: activeProfilesCount >= 6 ? 'not-allowed' : 'pointer', display:'inline-flex', alignItems:'center', gap:6, transition:'all 0.2s', boxShadow:'0 2px 5px rgba(0,0,0,0.2)', opacity: activeProfilesCount >= 6 ? 0.4 : 1}} onMouseOver={e=>{if(activeProfilesCount < 6) { e.currentTarget.style.background='rgba(212, 175, 55, 0.1)'; e.currentTarget.style.borderColor='var(--accent-gold)'; }}} onMouseOut={e=>{if(activeProfilesCount < 6) { e.currentTarget.style.background='var(--bg-card)'; e.currentTarget.style.borderColor='rgba(212, 175, 55, 0.3)'; }}} title={activeProfilesCount >= 6 ? "Limit of 6 profiles reached. Please delete one from the dropdown menu first." : (t('newChart',lang) || 'New Kundali')}>
                <span style={{fontSize:14}}>➕</span> {t('newChart',lang) || 'New Kundali'}
              </button>
            </div>
          </div>
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

      <div style={{maxWidth:1100,margin:'0 auto',padding:'40px 24px 80px', fontFamily:'"Cinzel", serif'}}>

        {/* Global Synastry Form Dropdown */}
        {(showPartnerForm || (partnerKundali && isSynastryExpanded)) && (
        <div id="synastry-form-ctr" style={{ position: 'relative', marginBottom: 40, padding: '24px', background: 'var(--bg-input)', border: '1px solid var(--border-light)', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.2)', animation: 'fadeIn 0.4s ease' }}>
          <button onClick={() => { setIsSynastryExpanded(false); setShowPartnerForm(false); }} style={{ position: 'absolute', top: '12px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '20px', cursor: 'pointer', outline: 'none', transition: 'color 0.2s', padding: 0 }} onMouseOver={e=>e.currentTarget.style.color='var(--accent-gold)'} onMouseOut={e=>e.currentTarget.style.color='var(--text-muted)'} title="Close">
            ✕
          </button>
          {showPartnerForm && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', marginBottom: partnerKundali ? '24px' : '0' }}>
              <CompatibilityInputForm onGeneratePartner={(inputParams) => { 
                try { 
                  const pk = computeKundali(inputParams); 
                  pk.name = inputParams.name;
                  setPartnerKundali(pk); 
                  saveProfile({ ...K.input, partner: inputParams });
                  setShowPartnerForm(false);
                  setIsSynastryExpanded(true);
                } catch(e) { 
                  alert("Celestial misalignment. Please verify the birth coordinates."); 
                  setShowPartnerForm(false);
                } 
              }} onCancel={() => setShowPartnerForm(false)} lang={lang} t={(k)=>t(k,lang)} />
            </div>
          )}
          {partnerKundali && isSynastryExpanded && (
            <CompatibilityMatch primaryKundali={K} partnerKundali={partnerKundali} lang={lang} t={(k)=>t(k,lang)} />
          )}
        </div>
        )}

        {dashboardMode === 'kundali' && (
          <div style={{animation:'fadeIn 0.5s ease'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'40px', borderBottom:'1px solid #b8860b', paddingBottom:'16px', flexWrap:'wrap', gap:'16px'}}>
              <h2 style={{ fontSize: '42px', margin: 0, fontFamily: '"Cinzel", serif', color: 'var(--accent-gold)', textShadow: '0 2px 4px var(--bg-surface)' }}>{t('Kundali',lang)}</h2>
            </div>

            
            {/* Layer 1: My Insights */}
            <div style={{ marginBottom: 40 }}>
              <OverviewTab K={K} fmt={fmt} lang={lang}/>
            </div>

            {/* HERO BANNER FOR REVEAL LIFE PATHS */}
            <div className="no-print reveal-hero-banner" style={{ background: 'var(--bg-hero-gradient)', borderRadius: '12px', border: '1px solid var(--accent-gold)', padding: '40px 24px', marginBottom: '60px', position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-hero)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
               <div style={{ position: 'absolute', opacity: 0.05, fontSize: '200px', top: '-50px', left: '-50px', pointerEvents: 'none' }}>🌀</div>
               <div style={{ position: 'absolute', opacity: 0.05, fontSize: '200px', bottom: '-80px', right: '-40px', pointerEvents: 'none' }}>✨</div>
               <h3 style={{ fontSize: '32px', fontFamily: '"Cinzel", serif', color: 'var(--accent-gold)', margin: '0 0 16px', zIndex: 2, textTransform: 'uppercase', letterSpacing: '2px' }}>{t('revealLifePathTitle', lang) || 'Reveal Life Paths'}</h3>
               <p style={{ fontSize: '18px', color: 'var(--text-main)', margin: '0 0 32px', maxWidth: '700px', lineHeight: 1.6, fontFamily: 'serif', zIndex: 2, fontStyle: 'italic' }}>{t('revealLifePathDesc', lang) || 'Reveal Life dimensions of Dharma, Wealth, Health, and Relationships through precise Shastric Pathways.'}</p>
               <button onClick={()=>{setDashboardMode('pathways'); setTimeout(() => { const el = document.getElementById('mock-dashboard-top'); if (el) { const y = el.getBoundingClientRect().top + window.scrollY - 80; window.scrollTo({top: y, behavior: 'smooth'}); } else { window.scrollTo({top:0, behavior:'smooth'}); }}, 100); }} style={{ zIndex: 2, background:'var(--accent-gold)', border:'none', color:'var(--bg-app)', padding:'14px 40px', cursor:'pointer', borderRadius:'30px', fontFamily:'"Cinzel", serif', fontSize:'16px', fontWeight:'bold', display:'flex', alignItems:'center', gap:'12px', transition:'all 0.3s', textTransform:'uppercase', letterSpacing:'1px', whiteSpace:'nowrap', boxShadow:'0 0 20px rgba(212, 175, 55, 0.4)' }} onMouseOver={e=>{e.currentTarget.style.transform='scale(1.03)'; e.currentTarget.style.boxShadow='0 0 25px rgba(212, 175, 55, 0.8)'}} onMouseOut={e=>{e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.boxShadow='0 0 20px rgba(212, 175, 55, 0.4)'}}>
                 <span style={{fontSize: '20px'}}>👁️</span> {(t('revealLifePathTitle', lang) || 'Reveal Life Paths')} ➔
               </button>
            </div>

            {/* Layer 3: Jyotish Desk (Technical Charts) */}
            <div>
              <h2 style={{color:'var(--accent-gold)', borderBottom:'1px solid #b8860b', paddingBottom:'12px', marginBottom: '24px'}}>⌬ {t('headers.desk', lang)}</h2>
              
              {/* ── Tab Bar ── */}
              <div className="no-print desktop-only-block" style={{background:'var(--bg-card)',border:'1px solid #b8860b', borderRadius: '8px', marginBottom: '24px', overflow:'hidden'}}>
                <div style={{display:'flex',overflowX:'auto',whiteSpace:'nowrap',scrollbarWidth:'none', padding: '0 8px'}}>
                  {TABS_DEF.map(tb=><button key={tb.id} onClick={()=>setTab(tb.id)} style={{background:tab===tb.id?'var(--bg-input)':'transparent', color:tab===tb.id?'var(--accent-gold)':'var(--text-muted)', border:'none', padding:'12px 24px', cursor:'pointer', fontFamily:'"Cinzel", serif', fontWeight:tab===tb.id?'bold':'normal', transition:'all 0.2s', whiteSpace:'nowrap'}}><span style={{fontSize:14,marginRight:6}}>{tb.icon}</span>{t(`tabs.${tb.id}`,lang)}</button>)}
                </div>
              </div>
              
              {/* ── Tab Content ── */}
              <div className="mobile-vertical-tab-stack" style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '12px', border: '1px solid #b8860b', color: 'var(--text-main)' }}>
                 <div className={tab==='charts'?'desktop-active-tab mobile-show-always':'desktop-hidden-tab mobile-show-always'}><ChartsTab K={K} fmt={fmt} setFmt={setFmt} lang={lang}/></div>
                 <div className={tab==='planets'?'desktop-active-tab mobile-show-always':'desktop-hidden-tab mobile-show-always'}><PlanetsTab K={K} lang={lang}/></div>
                 <div className={tab==='dasha'?'desktop-active-tab mobile-show-always':'desktop-hidden-tab mobile-show-always'}><DashaTab K={K} lang={lang}/></div>
                 <div className={tab==='yoga'?'desktop-active-tab mobile-show-always':'desktop-hidden-tab mobile-show-always'}><YogaTab K={K} lang={lang}/></div>
                 <div className={tab==='shadbala'?'desktop-active-tab mobile-show-always':'desktop-hidden-tab mobile-show-always'}><ShadbalaTab K={K} lang={lang}/></div>
                 <div className={tab==='avarga'?'desktop-active-tab mobile-show-always':'desktop-hidden-tab mobile-show-always'}><AshtakavargaTab K={K} lang={lang}/></div>
                 <div className={tab==='reading'?'desktop-active-tab mobile-show-always':'desktop-hidden-tab mobile-show-always'}><ExpertReadingTab kundali={K} lang={lang}/></div>
              </div>
              <div style={{ height: '100px' }} className="no-print"></div> {/* spacer for sticky footer */}
            </div>
            
            {/* STICKY FOOTER FOR REVEAL LIFE PATHS */}
            <div className="no-print sticky-reveal-footer" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '16px 24px', background: 'var(--bg-sticky-footer)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', borderTop: '1px solid rgba(212, 175, 55, 0.4)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 -4px 20px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', width: '100%', maxWidth: '1400px', justifyContent: 'space-between', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 300px', minWidth: 0 }}>
                   <h4 style={{ margin: '0 0 4px', fontSize: '15px', color: 'var(--accent-gold)', fontFamily: '"Cinzel", serif', letterSpacing: '1px', textTransform: 'uppercase' }}>{(t('revealLifePathTitle', lang) || 'Reveal Life Paths')}</h4>
                   <p className="hide-on-very-small" style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'serif', paddingRight: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t('revealLifePathDesc', lang) || 'Reveal Life dimensions of Dharma, Wealth, Health, and Relationships through precise Shastric Pathways.'}</p>
                </div>
                <button onClick={()=>{setDashboardMode('pathways'); setTimeout(() => { const el = document.getElementById('mock-dashboard-top'); if (el) { const y = el.getBoundingClientRect().top + window.scrollY - 80; window.scrollTo({top: y, behavior: 'smooth'}); } else { window.scrollTo({top:0, behavior:'smooth'}); }}, 100); }} style={{ flexShrink: 0, background:'var(--accent-gold)', border:'none', color:'var(--bg-app)', padding:'12px 24px', cursor:'pointer', borderRadius:'30px', fontFamily:'"Cinzel", serif', fontSize:'14px', fontWeight:'bold', display:'flex', alignItems:'center', gap:'8px', transition:'all 0.2s', textTransform:'uppercase', letterSpacing:'1px', whiteSpace:'nowrap', boxShadow:'0 0 15px rgba(212, 175, 55, 0.5)' }} onMouseOver={e=>{e.currentTarget.style.transform='translateY(-2px)'}} onMouseOut={e=>{e.currentTarget.style.transform='none'}}>
                  {(t('revealLifePathTitle', lang) || 'Reveal Life Paths')} ➔
                </button>
              </div>
            </div>
          </div>
        )}

        {dashboardMode === 'pathways' && (
          <div style={{animation:'fadeIn 0.5s ease'}}>
            <MockDashboard 
              K={K} 
              lang={lang} 
              t={(k)=>t(k,lang)} 
              user={user} 
              onRequireLogin={onRequireLogin} 
              onOpenJyotishDesk={() => {
                setDashboardMode('kundali');
                window.scrollTo({top: 0, behavior: 'smooth'});
              }} 
              partnerKundali={partnerKundali}
            />
            <div style={{ height: '100px' }} className="no-print"></div> {/* spacer for sticky footer */}
            
            {/* STICKY FOOTER FOR REVEAL KUNDALI */}
            <div className="no-print sticky-reveal-footer" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '16px 24px', background: 'var(--bg-sticky-footer)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', borderTop: '1px solid rgba(212, 175, 55, 0.4)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 -4px 20px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', width: '100%', maxWidth: '1400px', justifyContent: 'space-between', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 300px', minWidth: 0 }}>
                   <h4 style={{ margin: '0 0 4px', fontSize: '15px', color: 'var(--accent-gold)', fontFamily: '"Cinzel", serif', letterSpacing: '1px', textTransform: 'uppercase' }}>{(t('revealKundaliTitle', lang) || 'Reveal Kundali')}</h4>
                   <p className="hide-on-very-small" style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'serif', paddingRight: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t('revealKundaliDesc', lang) || 'Dive into your complete Parashari D1 matrix with planetary strengths, dashas, and traditional astrometrics.'}</p>
                </div>
                <button onClick={()=>{setDashboardMode('kundali');window.scrollTo({top:0,behavior:'smooth'});}} style={{ flexShrink: 0, background:'var(--accent-gold)', border:'none', color:'var(--bg-app)', padding:'12px 24px', cursor:'pointer', borderRadius:'30px', fontFamily:'"Cinzel", serif', fontSize:'14px', fontWeight:'bold', display:'flex', alignItems:'center', gap:'8px', transition:'all 0.2s', textTransform:'uppercase', letterSpacing:'1px', whiteSpace:'nowrap', boxShadow:'0 0 15px rgba(212, 175, 55, 0.5)' }} onMouseOver={e=>{e.currentTarget.style.transform='translateY(-2px)'}} onMouseOut={e=>{e.currentTarget.style.transform='none'}}>
                  <span style={{fontSize: '18px'}}>🌌</span> {(t('revealKundaliTitle', lang) || 'Reveal Kundali')} ➔
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <footer className="no-print" style={{textAlign:'center',padding:'24px 24px 100px',borderTop:'1px solid var(--border-light)',background:'var(--bg-dark)'}}>
        <a href="/terms.html" target="_blank" rel="noreferrer" style={{color:'var(--accent-gold)',textDecoration:'underline',fontSize:12,fontFamily:'inherit',transition:'opacity 0.2s',opacity:0.8}} onMouseOver={e=>e.currentTarget.style.opacity=1} onMouseOut={e=>e.currentTarget.style.opacity=0.8}>Terms of Service</a>
      </footer>
    </div>
  );
}


// ════════════════════════════════════════════════════════════════
// ROOT APP
// ════════════════════════════════════════════════════════════════
const ASTRO_DICT = {
    hi: { moon:'चंद्र', sun:'सूर्य', rahu:'राहु', yama:'यम', vs:'वि.सं', tithi:'तिथि', nak:'नक्षत्र', yoga:'योग', kar:'करण', shukla:'शुक्ल पक्ष', krishna:'कृष्ण पक्ष' },
    kn: { moon:'ಚಂದ್ರ', sun:'ಸೂರ್ಯ', rahu:'ರಾಹು', yama:'ಯಮ', vs:'ವಿ.ಸಂ', tithi:'ತಿಥಿ', nak:'ನಕ್ಷತ್ರ', yoga:'ಯೋಗ', kar:'ಕರಣ', shukla:'ಶುಕ್ಲ ಪಕ್ಷ', krishna:'ಕೃಷ್ಣ ಪಕ್ಷ' },
    te: { moon:'చంద్ర', sun:'సూర్య', rahu:'రాహు', yama:'యమ', vs:'వి.సం', tithi:'తిథి', nak:'నక్షత్రం', yoga:'యోగం', kar:'కరణం', shukla:'శుక్ల పక్షం', krishna:'కృష్ణ పక్షం' },
    ta: { moon:'சந்திரன்', sun:'சூரியன்', rahu:'ராகு', yama:'எமகண்டம்', vs:'வி.சம்', tithi:'திதி', nak:'நட்சத்திரம்', yoga:'யோகம்', kar:'கரணம்', shukla:'சுக்ல பட்சம்', krishna:'கிருஷ்ண பட்சம்' }
};
function t_astro(key, lang) {
    if(ASTRO_DICT[lang] && ASTRO_DICT[lang][key]) return ASTRO_DICT[lang][key];
    const enDict = { moon:'Moon', sun:'Sun', rahu:'Rahu', yama:'Yama', vs:'VS', tithi:'Tithi', nak:'Nak', yoga:'Yoga', kar:'Karana', shukla:'Shukla Paksha', krishna:'Krishna Paksha' }
function t_meridiem(meridiem, lang) {
    const dict = {
        hi: { AM:'पूर्वाह्न', PM:'अपराह्न' },
        kn: { AM:'ಬೆಳಿಗ್ಗೆ', PM:'ಸಂಜೆ' }, // roughly
        te: { AM:'ఉదయం', PM:'సాయంత్రం' },
        ta: { AM:'காலை', PM:'மாலை' },
        sa: { AM:'पूर्वाह्नम्', PM:'अपराह्नम्' },
        mr: { AM:'सकाळ', PM:'संध्याकाळ' },
        bn: { AM:'পূর্বাহ্ন', PM:'অপরাহ্ন' },
        ml: { AM:'രാവിലെ', PM:'വൈകുന്നേരം' },
        gu: { AM:'સવાર', PM:'સાંજ' },
        en: { AM:'AM', PM:'PM' }
    };
    meridiem = meridiem.toUpperCase();
    if(dict[lang] && dict[lang][meridiem]) return dict[lang][meridiem];
    return meridiem;
};
    return enDict[key] || key;
}


function SyncIndicator({ status, onForceSync }) {
  if (!status || status === 'offline') return null;
  const ICONS = {
    syncing: { icon: '🔄', color: 'var(--accent-gold)', title: 'Syncing to cloud...' },
    synced:  { icon: '☁️✓', color: '#10B981', title: 'Saved to cloud. Click to force sync.' },
    error:   { icon: '☁️⚠', color: '#EF4444', title: 'Cloud sync failed. Click to retry.' }
  };
  const ui = ICONS[status];
  if (!ui) return null;
  return (
    <span onClick={(e) => { e.stopPropagation(); if (onForceSync && status !== 'syncing') onForceSync(); }} title={ui.title} style={{ display: 'inline-flex', alignItems: 'center', marginLeft: 8, fontSize: 13, color: ui.color, animation: status==='syncing'?'spin 2s linear infinite':'', cursor: status !== 'syncing' ? 'pointer' : 'default' }}>
      {ui.icon}
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </span>
  );
}

function AppHeader({ user, syncStatus, syncToast, onLoginClick, onLogoutClick, onForceSync, onOpenPrefs }) {
  const { lang, theme } = usePreferences();

  const LANGS=[{code:'en',label:'English'},{code:'hi',label:'हिन्दी'},{code:'kn',label:'ಕನ್ನಡ'},{code:'te',label:'తెలుగు'},{code:'ta',label:'தமிழ்'},{code:'sa',label:'संस्कृतम्'},{code:'mr',label:'मराठी'},{code:'gu',label:'ગુજરાતી'},{code:'bn',label:'বাংলা'},{code:'ml',label:'മലയാളം'}];
  return (
      <header className="app-header" style={{borderBottom:'1px solid var(--border-light)',background:'var(--bg-surface)',backdropFilter:'blur(12px)',position:'sticky',top:0,zIndex:20}}>
        <div className="app-header-content" style={{maxWidth:1100, margin:'0 auto', display:'flex', flexWrap:'wrap', justifyContent:'space-between',alignItems:'center',padding:'12px 16px', gap:14}}>
          <div style={{display:'flex',alignItems:'center',gap:14, minWidth:0, flexShrink:1}}>
            <div style={{width:40,height:40,flexShrink:0,background:'transparent',border:'1px solid var(--accent-gold)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 12px var(--accent-glow)'}}>
              <span style={{color:'var(--accent-gold)',fontSize:20}}>☀</span>
            </div>
            <div style={{minWidth:0}}><h1 className="serif" style={{margin:0,fontSize:20,color:'var(--accent-gold)',letterSpacing:2,textTransform:'uppercase',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>Jyotish Darshan</h1><p style={{margin:'2px 0 0',fontSize:10,color:'var(--text-muted)',letterSpacing:3,textTransform:'uppercase',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t('tagline',lang)}</p></div>
          </div>
          <div className="app-header-right" style={{display:'flex', gap:16, flexShrink:0, alignItems:'center'}}>
            <button type="button" onClick={onOpenPrefs} style={{background:'transparent', border:'1px solid var(--border-light)', borderRadius:'50%', width:36, height:36, color:'var(--accent-gold)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.2s', boxShadow:'0 2px 8px rgba(0,0,0,0.2)'}} onMouseOver={e=>e.currentTarget.style.transform='scale(1.05)'} onMouseOut={e=>e.currentTarget.style.transform='scale(1)'} title="Global Preferences">
              <span style={{fontSize:16}}>⚙️</span>
            </button>
            <UserHub 
               user={user} 
               syncStatus={syncStatus} 
               syncToast={syncToast} 
               onLoginClick={onLoginClick} 
               onLogoutClick={onLogoutClick} 
               onForceSync={onForceSync} 
            />
          </div>
        </div>
      </header>
  );
}

function App(){
  const { lang, isRegenerating } = usePreferences();
  const [showPrefModal, setShowPrefModal] = React.useState(false);
  const[screen,setScreen]=React.useState('input');
  const [profileToDelete, setProfileToDelete] = React.useState(null);
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const[kundali,setKundali]=React.useState(null);
  const[err,setErr]=React.useState(null);
  const { user, syncStatus, syncToast, forceSync, syncRequestedProfile, clearSyncProfile, deleteProfile, saveProfile, logoutUser } = useSync();
  
  const [engineReady, setEngineReady] = React.useState(false);
  const [loadMsg, setLoadMsg] = React.useState('Synthesizing Ephemeris data...');
  const [loadPct, setLoadPct] = React.useState(0);

  React.useEffect(()=>{
    let mounted = true;
    initializeAstroEngine((pct, msg) => {
      if(mounted){ setLoadPct(pct); setLoadMsg(msg); }
    }).then(() => {
      if(!mounted) return;
      setEngineReady(true);
      
      const p=new URLSearchParams(location.search);
      const k=p.get('k');
      if(k){try{const d=JSON.parse(decodeURIComponent(atob(k)));handleSubmit({year:d.y,month:d.mo,day:d.d,hour:d.h,minute:d.mi,utcOffset:d.ut,lat:d.la,lng:d.ln,city:d.ci,country:d.co,timezone:d.tz,gender:d.ge,dob:`${d.y}-${String(d.mo).padStart(2,'0')}-${String(d.d).padStart(2,'0')}`,tob:`${String(d.h).padStart(2,'0')}:${String(d.mi).padStart(2,'0')}`})}catch(e){console.warn('Invalid share link')}}
      else {
        try {
          const saved = localStorage.getItem('jd_profiles');
          if (saved) {
            const profiles = JSON.parse(saved);
            const validProfiles = (Array.isArray(profiles) ? profiles : []).filter(p => !p.isDeleted);
            if (validProfiles.length > 0) {
              setErr(null);
              setKundali(computeKundali(validProfiles[0]));
              setScreen('results');
            }
          }
        } catch (e) {}
      }
    }).catch(err => {
      if(mounted) setLoadMsg("Error loading astronomy engine: " + err.message);
    });
    
    return () => { mounted = false; };
  },[]);

  React.useEffect(() => {
    if (engineReady && syncRequestedProfile) {
      setKundali(computeKundali(syncRequestedProfile));
      setScreen('results');
      clearSyncProfile();
    }
  }, [engineReady, syncRequestedProfile]);

  function handleSubmit(inp){
    try{
      setErr(null);
      setKundali(computeKundali(inp));
      setScreen('results');
      saveProfile(inp);
    }
    catch(e){console.error(e);setErr(t('computeError',lang))}
  }
  async function handleDeleteConfirm() {
    if (!profileToDelete) return;
    const deleted = await deleteProfile(profileToDelete);
    
    if (deleted) {
      if ((kundali?.input?.name || 'User').toLowerCase() === (profileToDelete.name || 'User').toLowerCase() || (kundali?.input?.id && kundali.input.id === profileToDelete.id)) {
         
         let remaining = [];
         try {
           const saved = JSON.parse(localStorage.getItem('jd_profiles') || '[]');
           remaining = (Array.isArray(saved) ? saved : []).filter(p => !p.isDeleted);
         } catch(e) {}

         if (remaining.length > 0) {
           // Auto-load the next available profile in the vault
           await handleSubmit(remaining[0]);
         } else {
           // Vault is totally empty, return to the creation form
           setKundali(null);
           setScreen('input');
         }
      }
    }
    setProfileToDelete(null);
  }

  function handleBack(){setScreen('input');history.replaceState({},'',location.pathname)}

  if(err)return<div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg-app)',fontFamily:'serif'}}><div style={{background:'var(--bg-card)',borderRadius:12,padding:28,maxWidth:400,border:'1px solid var(--border-light)',textAlign:'center'}}><p style={{fontSize:32,margin:'0 0 10px'}}>⚠️</p><p style={{color:'var(--text-main)',fontSize:14,marginBottom:14}}>{err}</p><button onClick={()=>setErr(null)} style={{padding:'9px 22px',borderRadius:8,border:'none',background:'var(--accent-gold)',color:'#000',cursor:'pointer',fontFamily:'inherit',fontSize:14}}><strong>{t('tryAgain',lang)}</strong></button></div></div>;
  
  if (!engineReady || isRegenerating) {
    return (
      <div style={{minHeight:'100vh',background:'var(--bg-main)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',fontFamily:'var(--font-sans)',color:'var(--text-main)',padding:20}}>
        
        {/* RECONSTRUCTED LOGO FROM ATTACHMENT */}
        <div style={{display:'flex',alignItems:'center',gap:24,marginBottom:40}}>
          {/* Sun Crest */}
          <div style={{
            width: 72, height: 72, 
            borderRadius: '50%', 
            border: '2px solid var(--accent-gold)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 15px rgba(245, 158, 11, 0.2)',
            position: 'relative'
          }}>
            {/* Inner Sun Geometry */}
            <svg width="40" height="40" viewBox="0 0 24 24" fill="var(--accent-gold)" stroke="var(--accent-gold)" strokeWidth="1" style={{position:'absolute'}}>
              <circle cx="12" cy="12" r="5" fill="var(--accent-gold)"></circle>
              {/* Top/Bottom/Left/Right rays */}
              <line x1="12" y1="2" x2="12" y2="5" strokeWidth="2"></line>
              <line x1="12" y1="19" x2="12" y2="22" strokeWidth="2"></line>
              <line x1="2" y1="12" x2="5" y2="12" strokeWidth="2"></line>
              <line x1="19" y1="12" x2="22" y2="12" strokeWidth="2"></line>
              {/* Diagonal rays */}
              <line x1="4.93" y1="4.93" x2="7.05" y2="7.05" strokeWidth="2"></line>
              <line x1="16.95" y1="16.95" x2="19.07" y2="19.07" strokeWidth="2"></line>
              <line x1="4.93" y1="19.07" x2="7.05" y2="16.95" strokeWidth="2"></line>
              <line x1="16.95" y1="7.05" x2="19.07" y2="4.93" strokeWidth="2"></line>
            </svg>
          </div>

          {/* Typography */}
          <div style={{display:'flex', flexDirection:'column', justifyContent:'center'}}>
            <h1 style={{margin:0, fontSize:36, fontWeight:700, fontFamily:'serif', color:'var(--accent-gold)', letterSpacing:'2px', textShadow:'0 2px 4px rgba(0,0,0,0.5)'}}>
              JYOTISH DARSHAN
            </h1>
            <p style={{margin:'4px 0 0 0', fontSize:14, color:'#9ca3af', letterSpacing:'4px', textTransform:'uppercase', fontWeight:500, display:'flex', alignItems:'center', gap:8}}>
              VEDIC BIRTH CHART <span style={{fontSize:10}}>•</span> <span style={{letterSpacing:'1px', fontFamily:'sans-serif'}}>ज्योतिष दर्शन</span>
            </p>
          </div>
        </div>
        {/* END LOGO */}

        <div style={{maxWidth:400, width:'100%', textAlign:'center'}}>
          <div style={{background:'var(--bg-card)',height:4,borderRadius:2,overflow:'hidden',width:'100%',margin:'0 0 16px 0',boxShadow:'inset 0 1px 3px rgba(0,0,0,0.4)', position:'relative'}}>
            {/* Flashing indeterminate state if loadPct === 0, else deterministic bar */}
            {loadPct === 0 ? (
               <div style={{height:'100%',background:'var(--accent-gold)',width:'30%',animation:'indeterminate 1.5s infinite ease-in-out',position:'absolute',left:0}}></div>
            ) : (
               <div style={{height:'100%',background:'linear-gradient(90deg, var(--accent-gold), #fff)',width:`${loadPct}%`,transition:'width 0.4s ease-out'}}></div>
            )}
          </div>
          <p style={{margin:0,fontSize:13,fontWeight:500,color:'var(--text-muted)',letterSpacing:'0.5px'}}>{loadMsg}</p>
        </div>
        
        <style dangerouslySetInnerHTML={{__html:`
          @keyframes indeterminate {
            0% { left: -30%; }
            50% { left: 100%; }
            100% { left: 100%; }
          }
        `}} />
      </div>
    );
  }

  const goBack = () => { setScreen('input'); history.replaceState({},'',location.pathname); };
  return (
    <div style={{minHeight:'100vh', display:'flex', flexDirection:'column'}}>
      {showAuthModal && <AuthModal lang={lang} t={t} onLogin={() => setShowAuthModal(false)} onClose={() => setShowAuthModal(false)} />}
      <AppHeader user={user} syncStatus={syncStatus} syncToast={syncToast} onLoginClick={() => setShowAuthModal(true)} onLogoutClick={logoutUser} onForceSync={forceSync} onOpenPrefs={() => setShowPrefModal(true)} />
      <DailyPanchang lang={lang} />
      {screen==='results'&&kundali ? <ResultsPage K={kundali} onBack={goBack} lang={lang} onSwitchProfile={handleSubmit} user={user} onRequireLogin={() => setShowAuthModal(true)} onForceSync={forceSync} onDeleteProfile={setProfileToDelete} /> : <InputForm onSubmit={handleSubmit} lang={lang} />}
      <UserPreferencesModal isOpen={showPrefModal} onClose={() => setShowPrefModal(false)} />
      <ConfirmModal 
        isOpen={!!profileToDelete} 
        title="Delete Kundali Core?" 
        message={profileToDelete ? `Are you sure you want to completely erase the astrological chart for ${profileToDelete.name || 'this soul'}? This action will permanently remove it from your cloud profile.` : ''}
        confirmText="Erase from Cosmos"
        onConfirm={handleDeleteConfirm}
        onClose={() => setProfileToDelete(null)}
        type="danger"
      />
    </div>
  );
}


export default App;
