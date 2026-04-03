import { RASHIS } from '../../engine/constants.js';
import { L_LAGNA, L_DASHA } from '../../App.jsx';
import { EXPERT_TRANSLATIONS } from '../../i18n/expertTranslations.js';
import { DYNAMIC_STRINGS } from '../../i18n/dynamicTranslations.js';

export function buildReading(kundali, lang = 'en') {
  const t = (key) => (EXPERT_TRANSLATIONS[lang] || EXPERT_TRANSLATIONS.en)[key] || 
                     (DYNAMIC_STRINGS[lang] || DYNAMIC_STRINGS.en)[key] || 
                     EXPERT_TRANSLATIONS.en[key] || 
                     DYNAMIC_STRINGS.en[key] || key;

  const { lagna, planets, yogas, dasha, shadbala, input } = kundali;
  const moonPlanet = planets.find(p => p.key === 'moon');
  const sunPlanet = planets.find(p => p.key === 'sun');
  const lagnaRashi = RASHIS[lagna.rashi];
  const moonRashi = RASHIS[moonPlanet.rashi];
  const sunRashi = RASHIS[sunPlanet.rashi];
  const lagnaLord = planets.find(p => p.key === lagnaRashi.lord);
  const currentMaha = dasha.mahadashas.find(m => m.isCurrent) || dasha.mahadashas[0];
  const currentAntar = currentMaha?.antars?.find(a => a.isCurrent) || currentMaha?.antars?.[0];

  const rajaYogas = yogas.filter(y => y.type === 'raja').map(y => y.name);
  const doshas = yogas.filter(y => y.type === 'dosha').map(y => y.name);

  const strongPlanets = Object.entries(shadbala).filter(([, v]) => v.classification === 'Strong').map(([k]) => k);
  const weakPlanets = Object.entries(shadbala).filter(([, v]) => v.classification === 'Weak').map(([k]) => k);

  const birthYear = input?.dob ? parseInt(input.dob.split('-')[0]) : new Date().getFullYear();

  // Lagna-based personality
  const LAGNA_READINGS = L_LAGNA[lang] || L_LAGNA.en;

  // Moon nakshatra reading
  const NAKSHATRA_READINGS = {
    'Ashwini': t('naks.read.Ashwini') !== 'naks.read.Ashwini' ? t('naks.read.Ashwini') : 'dynamic, pioneering, healing instincts',
    'Bharani': t('naks.read.Bharani') !== 'naks.read.Bharani' ? t('naks.read.Bharani') : 'intense transformation, creative power, Yama\'s discipline',
    'Krittika': t('naks.read.Krittika') !== 'naks.read.Krittika' ? t('naks.read.Krittika') : 'sharp intellect, leadership, purifying fire',
    'Rohini': t('naks.read.Rohini') !== 'naks.read.Rohini' ? t('naks.read.Rohini') : 'material abundance, artistic gifts, magnetic beauty',
    'Mrigashira': t('naks.read.Mrigashira') !== 'naks.read.Mrigashira' ? t('naks.read.Mrigashira') : 'searching mind, love of travel, gentle nature',
    'Ardra': t('naks.read.Ardra') !== 'naks.read.Ardra' ? t('naks.read.Ardra') : 'storm of transformation, intellectual intensity',
    'Punarvasu': t('naks.read.Punarvasu') !== 'naks.read.Punarvasu' ? t('naks.read.Punarvasu') : 'renewal, optimism, philosophical nature',
    'Pushya': t('naks.read.Pushya') !== 'naks.read.Pushya' ? t('naks.read.Pushya') : 'nurturing wisdom, spiritual authority, prosperity',
    'Ashlesha': t('naks.read.Ashlesha') !== 'naks.read.Ashlesha' ? t('naks.read.Ashlesha') : 'penetrating insight, kundalini energy, serpentine wisdom',
    'Magha': t('naks.read.Magha') !== 'naks.read.Magha' ? t('naks.read.Magha') : 'ancestral blessings, leadership, royal dignity',
    'Purva Phalguni': t('naks.read.Purva Phalguni') !== 'naks.read.Purva Phalguni' ? t('naks.read.Purva Phalguni') : 'creative joy, marital happiness, Bhaga\'s grace',
    'Uttara Phalguni': t('naks.read.Uttara Phalguni') !== 'naks.read.Uttara Phalguni' ? t('naks.read.Uttara Phalguni') : 'service, organizational skill, solar strength',
    'Hasta': t('naks.read.Hasta') !== 'naks.read.Hasta' ? t('naks.read.Hasta') : 'skilled hands, healing, craftsmanship',
    'Chitra': t('naks.read.Chitra') !== 'naks.read.Chitra' ? t('naks.read.Chitra') : 'creative brilliance, architectural mind, Vishwakarma\'s gift',
    'Swati': t('naks.read.Swati') !== 'naks.read.Swati' ? t('naks.read.Swati') : 'independence, balance, entrepreneurial spirit',
    'Vishakha': t('naks.read.Vishakha') !== 'naks.read.Vishakha' ? t('naks.read.Vishakha') : 'focused ambition, transformative power',
    'Anuradha': t('naks.read.Anuradha') !== 'naks.read.Anuradha' ? t('naks.read.Anuradha') : 'deep devotion, disciplined friendship, Mitra\'s grace',
    'Jyeshtha': t('naks.read.Jyeshtha') !== 'naks.read.Jyeshtha' ? t('naks.read.Jyeshtha') : 'leadership by merit, protective power',
    'Mula': t('naks.read.Mula') !== 'naks.read.Mula' ? t('naks.read.Mula') : 'root investigation, liberation from attachments',
    'Purva Ashadha': t('naks.read.Purva Ashadha') !== 'naks.read.Purva Ashadha' ? t('naks.read.Purva Ashadha') : 'invincibility, purifying vision',
    'Uttara Ashadha': t('naks.read.Uttara Ashadha') !== 'naks.read.Uttara Ashadha' ? t('naks.read.Uttara Ashadha') : 'universal victory, dharmic resolve',
    'Shravana': t('naks.read.Shravana') !== 'naks.read.Shravana' ? t('naks.read.Shravana') : 'listening wisdom, Vishnu\'s grace, sacred learning',
    'Dhanishtha': t('naks.read.Dhanishtha') !== 'naks.read.Dhanishtha' ? t('naks.read.Dhanishtha') : 'musical gifts, material success, warrior spirit',
    'Shatabhisha': t('naks.read.Shatabhisha') !== 'naks.read.Shatabhisha' ? t('naks.read.Shatabhisha') : 'healing secrets, mystical knowledge, independence',
    'Purva Bhadrapada': t('naks.read.Purva Bhadrapada') !== 'naks.read.Purva Bhadrapada' ? t('naks.read.Purva Bhadrapada') : 'intense spiritual fire, transformation',
    'Uttara Bhadrapada': t('naks.read.Uttara Bhadrapada') !== 'naks.read.Uttara Bhadrapada' ? t('naks.read.Uttara Bhadrapada') : 'depth, cosmic wisdom, serpent of the deep',
    'Revati': t('naks.read.Revati') !== 'naks.read.Revati' ? t('naks.read.Revati') : 'completeness, gentle nourishment, Pushan\'s care',
  };

  const nakshatraQuality = NAKSHATRA_READINGS[moonPlanet.nakshatraName] || t('er.profoundDepth');

  // 10th Lord / Career
  const careerPlanet = planets.find(p => p.house === 10) || lagnaLord;
  const careerHint = strongPlanets.includes('jupiter') ? t('er.careerJupiter') :
                     strongPlanets.includes('mercury') ? t('er.careerMercury') :
                     strongPlanets.includes('saturn') ? t('er.careerSaturn') :
                     t('er.careerDefault');
  
  const yogaText = rajaYogas.length > 0
    ? t('er.yogaGraced').replace('{yogas}', rajaYogas.slice(0, 2).join(' & '))
    : t('er.yogaDefault');

  const careerSummary = `${careerHint} ${yogaText}`;

  // 7th House / Relationships
  const venusStatus = planets.find(p => p.key === 'venus');
  const marriageSummary = doshas.includes('Mangal Dosha (Kuja Dosha)')
    ? t('er.mangalDosha')
    : venusStatus?.isExalted
    ? t('er.venusExalted')
    : t('er.marriageDefault');

  // Spiritual / 9th/12th
  const buildSpiritualReading = () => {
    const jupiter = planets.find(p => p.key === 'jupiter');
    const ketu = planets.find(p => p.key === 'ketu');
    const jupHouse = jupiter?.house;
    if (jupHouse === 9 || jupHouse === 12 || jupHouse === 1) {
      return t('er.spiritJupiter');
    }
    if (ketu?.house === 12 || ketu?.house === 9) {
      return t('er.spiritKetu');
    }
    return t('er.spiritDefault');
  };

  const spiritualSummary = buildSpiritualReading();

  // Create Soul Blueprint
  const strongPlanetsStr = strongPlanets.length > 0 
    ? t('er.strongPlanets').replace('{planets}', strongPlanets.map(p => t(`pl.${p}`) || p.charAt(0).toUpperCase() + p.slice(1)).join(', ')) 
    : '';
    
  const trRashiName = t(`yo.rashi.${lagna.rashi}`) || lagnaRashi.name;
  const trMoonRashi = t(`yo.rashi.${moonPlanet.rashi}`) || moonRashi.name;

  const soulBlueprint = t('er.blueprintFormat')
    .replace('{lagnaReading}', LAGNA_READINGS[lagna.rashi] || '')
    .replace('{lagnaRashi}', trRashiName)
    .replace('{nakshatra}', moonPlanet.nakshatraName)
    .replace('{moonRashi}', trMoonRashi)
    .replace('{nakshatraQuality}', nakshatraQuality)
    .replace('{strength}', strongPlanetsStr);

  // Build the Dasha Dictionary
  const dashaLocale = L_DASHA[lang] || L_DASHA.en;
  const DASHA_DICT = {
    sun: { desc: dashaLocale.sun, challenge: t('er.chal.sun') || 'Avoid arrogance and ego-driven decisions.', guidance: t('er.guid.sun') || 'Step into leadership with confidence. Surya Namaskar supports vitality.' },
    moon: { desc: dashaLocale.moon, challenge: t('er.chal.moon') || 'Avoid emotional reactivity.', guidance: t('er.guid.moon') || 'Nurture emotional well-being through creative expression.' },
    mars: { desc: dashaLocale.mars, challenge: t('er.chal.mars') || 'Channel drive constructively.', guidance: t('er.guid.mars') || 'Direct energy into physical fitness or property matters.' },
    rahu: { desc: dashaLocale.rahu, challenge: t('er.chal.rahu') || 'Ground ambitions in ethical action.', guidance: t('er.guid.rahu') || 'Embrace innovation and transformative opportunities boldly.' },
    jupiter: { desc: dashaLocale.jupiter, challenge: t('er.chal.jupiter') || 'Beware of overconfidence.', guidance: t('er.guid.jupiter') || 'Pursue higher education and philosophical inquiry.' },
    saturn: { desc: dashaLocale.saturn, challenge: t('er.chal.saturn') || 'Patience is paramount.', guidance: t('er.guid.saturn') || 'Build long-term foundations with steady discipline.' },
    mercury: { desc: dashaLocale.mercury, challenge: t('er.chal.mercury') || 'Avoid mental scatteredness.', guidance: t('er.guid.mercury') || 'Invest in writing, teaching, or skill-building.' },
    ketu: { desc: dashaLocale.ketu, challenge: t('er.chal.ketu') || 'Avoid excessive withdrawal.', guidance: t('er.guid.ketu') || 'Deepen meditation and spiritual study.' },
    venus: { desc: dashaLocale.venus, challenge: t('er.chal.venus') || 'Avoid indulgence.', guidance: t('er.guid.venus') || 'Invest in relationships, art, and creative expression.' }
  };

  // Map Mahadashas and inject thematic summaries
  const lifeJourney = dasha.mahadashas.map(maha => {
     let dict = DASHA_DICT[maha.planet] || { desc: '', challenge: '', guidance: '' };
     let desc = dict.desc;
     
     // Thematic Injections based on planetary rule
     // Inject Career into 10th lord or strongest career planet (fallback Saturn)
     if (maha.planet === careerPlanet.key || (careerPlanet.key==='lagna' && maha.planet==='saturn')) {
       desc += ` ${careerSummary}`;
     }
     // Inject Marriage into 7th lord or Venus
     if (maha.planet === 'venus' || planets.find(p=>p.house===7)?.key === maha.planet) {
       desc += ` ${marriageSummary}`;
     }
     // Inject Spiritual into Jupiter or Ketu
     if (maha.planet === 'jupiter' || maha.planet === 'ketu') {
       desc += ` ${spiritualSummary}`;
     }

     const sYear = parseInt(maha.start.split('-')[0]);
     const eYear = parseInt(maha.end.split('-')[0]);
     const ageStart = Math.max(0, sYear - birthYear);
     const ageEnd = Math.max(0, eYear - birthYear);

     return {
        planet: maha.planet,
        start: maha.start,
        end: maha.end,
        years: maha.years,
        ageStr: `${t('er.ages') || 'Ages'} ${ageStart}-${ageEnd} (${maha.years || '?'} ${t('er.yrs') || 'yrs'})`,
        isCurrent: maha.isCurrent,
        description: desc,
        keyChallenge: dict.challenge,
        guidance: dict.guidance
     }
  });

  const deepDive = {
    maha: lifeJourney.find(m => m.isCurrent) || lifeJourney[0],
    antar: currentAntar ? {
      planet: currentAntar.planet,
      trPlanet: t(`pl.${currentAntar.planet}`) || currentAntar.planet,
      start: currentAntar.start,
      end: currentAntar.end,
      dict: DASHA_DICT[currentAntar.planet] || { desc: '', challenge: '', guidance: '' }
    } : null
  };

  return {
    soulBlueprint,
    themesSummary: {
      career: careerSummary,
      marriage: marriageSummary,
      spiritual: spiritualSummary
    },
    lifeJourney,
    deepDive
  };
}

export default function ExpertReadingTab({ kundali, lang = 'en' }) {
  const reading = buildReading(kundali, lang);
  const t = (key) => (EXPERT_TRANSLATIONS[lang] || EXPERT_TRANSLATIONS.en)[key] || 
                     (DYNAMIC_STRINGS[lang] || DYNAMIC_STRINGS.en)[key] || 
                     EXPERT_TRANSLATIONS.en[key] || 
                     DYNAMIC_STRINGS.en[key] || key;

  const SectionTitle = ({ icon, title }) => (
    <h4 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-light)', paddingBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
      <span>{icon}</span> {title}
    </h4>
  );

  return (
    <div style={{ animation: 'slideIn 0.25s ease' }}>
      <div className="lux-card" style={{ padding: '28px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32, paddingBottom: 18, borderBottom: '1px solid var(--border-light)' }}>
          <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg, #7C3AED, #F59E0B)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: 'white', fontSize: 24 }}>☀</span>
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, color: 'var(--accent-gold)', fontWeight: 700 }}>{t('er.title')}</h3>
            <p style={{ margin: '3px 0 0', fontSize:  17, color: 'var(--text-muted)' }}>{t('er.subtitle')}</p>
          </div>
        </div>

        {/* Soul Blueprint */}
        <div style={{ marginBottom: 40 }}>
          <SectionTitle icon="🌟" title={t('er.soulBlueprint')} />
          <p style={{ fontSize: 16, color: 'var(--text-main)', lineHeight: 1.85, margin: 0 }}>
            {reading.soulBlueprint}
          </p>
        </div>

        {/* Thematic Summaries */}
        <div style={{ marginBottom: 40, borderLeft: '3px solid #7C3AED', paddingLeft: 16 }}>
          <SectionTitle icon="📜" title={t('er.lifeThemes')} />
          <div style={{ marginBottom: 12 }}>
            <strong style={{ color: 'var(--accent-gold)' }}>{t('er.career')}</strong>
            <span style={{ fontSize: 16, color: 'var(--text-main)', marginLeft: 8 }}>{reading.themesSummary.career}</span>
          </div>
          <div style={{ marginBottom: 12 }}>
            <strong style={{ color: 'var(--accent-gold)' }}>{t('er.relationships')}</strong>
            <span style={{ fontSize: 16, color: 'var(--text-main)', marginLeft: 8 }}>{reading.themesSummary.marriage}</span>
          </div>
          <div>
            <strong style={{ color: 'var(--accent-gold)' }}>{t('er.spiritualPath')}</strong>
            <span style={{ fontSize: 16, color: 'var(--text-main)', marginLeft: 8 }}>{reading.themesSummary.spiritual}</span>
          </div>
        </div>

        {/* Life Journey */}
        <div style={{ marginBottom: 40 }}>
          <SectionTitle icon="🗺️" title={t('er.lifeJourney')} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {reading.lifeJourney.map(maha => (
              <div key={maha.planet} style={{ 
                background: maha.isCurrent ? 'var(--bg-badge-purple)' : 'var(--bg-input)', 
                border: maha.isCurrent ? '1px solid #7C3AED' : '1px solid var(--border-light)', 
                borderRadius: 8, padding: 16, position: 'relative'
              }}>
                {maha.isCurrent && (
                  <div style={{ position: 'absolute', top: 12, right: 12, background: '#7C3AED', color: 'white', fontSize: 11, fontWeight: 'bold', padding: '2px 8px', borderRadius: 12 }}>
                    {t('er.now')}
                  </div>
                )}
                <div style={{ marginBottom: 8 }}>
                  <span style={{ color: 'var(--accent-gold)', fontWeight: 700, fontSize: 15, textTransform: 'capitalize' }}>{t(`pl.${maha.planet}`) || maha.planet}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: 15, marginLeft: 10 }}>{maha.ageStr}</span>
                </div>
                <p style={{ color: 'var(--text-main)', fontSize:  17, lineHeight: 1.6, margin: '0 0 12px 0' }}>{maha.description}</p>
                <div style={{ background: 'var(--bg-card)', padding: 12, borderRadius: 6, border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: 15, marginBottom: 6 }}>
                    <strong style={{ color: 'var(--text-badge-red)' }}>{t('er.keyChallenge')}</strong> <span style={{ color: 'var(--text-main)' }}>{maha.keyChallenge}</span>
                  </div>
                  <div style={{ fontSize: 15 }}>
                    <strong style={{ color: 'var(--text-badge-green)' }}>{t('er.guidance')}</strong> <span style={{ color: 'var(--text-main)' }}>{maha.guidance}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Phase: Deep Dive */}
        <div style={{ marginBottom: 30 }}>
          <SectionTitle icon="⏳" title={t('er.currentPhase')} />
          <div style={{ background: 'var(--bg-badge-purple)', border: '1px solid var(--border-light)', borderRadius: 8, padding: 20 }}>
            
            {/* Mahadasha */}
            <h5 style={{ margin: '0 0 8px', color: 'var(--accent-gold)', fontSize: 15, textTransform: 'capitalize' }}>
              {t(`pl.${reading.deepDive.maha.planet}`) || reading.deepDive.maha.planet} {t('er.mahadasha') || 'Mahadasha'} — {t('er.dateRange') ? t('er.dateRange').replace('{start}', reading.deepDive.maha.start).replace('{end}', reading.deepDive.maha.end) : `${reading.deepDive.maha.start} to ${reading.deepDive.maha.end}`}
            </h5>
            <p style={{ color: 'var(--text-main)', fontSize:  17, lineHeight: 1.6, margin: '0 0 16px 0' }}>
              {reading.deepDive.maha.description}
            </p>
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1, background: 'var(--bg-badge-red)', padding: 12, borderRadius: 6, border: '1px solid var(--border-light)' }}>
                <strong style={{ color: 'var(--text-badge-red)', display: 'block', marginBottom: 4, fontSize: 14 }}>{t('er.keyChallenge')}</strong>
                <span style={{ color: 'var(--text-main)', fontSize: 14 }}>{reading.deepDive.maha.keyChallenge}</span>
              </div>
              <div style={{ flex: 1, background: 'var(--bg-badge-green)', padding: 12, borderRadius: 6, border: '1px solid var(--border-light)' }}>
                <strong style={{ color: 'var(--text-badge-green)', display: 'block', marginBottom: 4, fontSize: 14 }}>{t('er.coreGuidance')}</strong>
                <span style={{ color: 'var(--text-main)', fontSize: 14 }}>{reading.deepDive.maha.guidance}</span>
              </div>
            </div>

            {/* Antardasha */}
            {reading.deepDive.antar && (
              <div style={{ padding: 16, borderTop: '1px solid rgba(212, 175, 55, 0.2)', background: 'rgba(212, 175, 55, 0.05)', borderRadius: '0 0 8px 8px' }}>
                <h6 style={{ margin: '0 0 8px', color: 'var(--accent-gold)', fontSize: 15 }}>
                  ↪ {reading.deepDive.antar.trPlanet} {t('er.antardasha') || 'Antardasha'} — {t('er.dateRange') ? t('er.dateRange').replace('{start}', reading.deepDive.antar.start).replace('{end}', reading.deepDive.antar.end) : `${reading.deepDive.antar.start} to ${reading.deepDive.antar.end}`}
                </h6>
                <p style={{ color: 'var(--text-muted)', fontSize:  17, lineHeight: 1.6, margin: 0 }}>
                  {t('er.antarFormat')
                    .replace('{desc}', reading.deepDive.antar.dict.desc)
                    .replace('{planet}', reading.deepDive.antar.trPlanet)
                    .replace('{challenge}', reading.deepDive.antar.dict.challenge.toLowerCase())
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <div style={{ padding: '14px 18px', background: 'var(--bg-badge-yellow)', borderRadius: 8, border: '1px solid var(--border-light)' }}>
          <p style={{ margin: 0, fontSize:  16, color: 'var(--text-badge-yellow)', lineHeight: 1.6 }}>
            <strong>{t('er.note')}</strong> {t('er.noteText')}
          </p>
        </div>
      </div>
    </div>
  );
}
