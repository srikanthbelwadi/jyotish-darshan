import { RASHIS } from '../../engine/constants.js';

export function buildReading(kundali) {
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
  const LAGNA_READINGS = {
    0: 'The native with Mesha (Aries) Lagna is endowed with courage, enterprise, and an innately pioneering spirit. Ruled by Mangal (Mars), this Lagna bestows a direct, energetic personality with natural leadership instincts. There is a restless creative energy that seeks constant new challenges.',
    1: 'With Vrishabha (Taurus) Lagna, the native is blessed with endurance, aesthetic sensibility, and a deep appreciation for material comforts. Venus-ruled, this chart promises a love of beauty, music, and refined pleasures, alongside a steadfast and loyal nature.',
    2: 'Mithuna (Gemini) Lagna, ruled by Budha, gifts the native with an exceptionally agile mind, wit, and communicative brilliance. The native is intellectually curious, adaptable, and often gifted in writing, teaching, or commerce.',
    3: 'The Karka (Cancer) Lagna native, with Chandra as Lagnesh, is deeply empathetic, nurturing, and emotionally intelligent. There is an intuitive connection to family lineage and the collective consciousness. The native often serves as an emotional anchor for others.',
    4: 'Simha (Leo) Lagna, graced by Surya, blesses the native with natural charisma, authority, and a magnetic presence. There is a natural inclination toward leadership, creative self-expression, and a generous, noble heart.',
    5: 'Kanya (Virgo) Lagna, ruled by Budha, produces an analytical, methodical, and highly service-oriented native. Excellence in health, craft, and discernment are hallmarks. The native possesses an exceptional eye for detail and a deep commitment to improvement.',
    6: 'Tula (Libra) Lagna, governed by Shukra, bestows natural charm, diplomatic finesse, and a deep instinct for harmony and justice. The native navigates relationships with grace and possesses refined artistic and aesthetic sensibilities.',
    7: 'Vrischika (Scorpio) Lagna, co-ruled by Mangal and Ketu, produces a deeply intense, psychologically perceptive, and transformative personality. There is a magnetic quality and an ability to see beneath the surface of all matters.',
    8: 'Dhanu (Sagittarius) Lagna, under the benefic guidance of Guru, creates a philosophical, generous, and truth-seeking nature. The native is drawn to wisdom traditions, higher learning, and often becomes a teacher or spiritual guide.',
    9: 'Makara (Capricorn) Lagna, governed by Shani, produces disciplined, ambitious, and practically minded individuals. The native achieves through persistence and structured effort, earning lasting recognition through dedication.',
    10: 'Kumbha (Aquarius) Lagna, ruled by Shani, creates a humanitarian, innovative, and socially conscious personality. The native is drawn to collective wellbeing, progressive ideas, and often contributes to society in meaningful ways.',
    11: 'Meena (Pisces) Lagna, blessed by Guru, produces a deeply spiritual, empathetic, and creative soul. The native carries an innate understanding of the impermanent nature of existence and is naturally drawn toward the transcendent.',
  };

  // Moon nakshatra reading
  const NAKSHATRA_READINGS = {
    'Ashwini': 'dynamic, pioneering, healing instincts',
    'Bharani': 'intense transformation, creative power, Yama\'s discipline',
    'Krittika': 'sharp intellect, leadership, purifying fire',
    'Rohini': 'material abundance, artistic gifts, magnetic beauty',
    'Mrigashira': 'searching mind, love of travel, gentle nature',
    'Ardra': 'storm of transformation, intellectual intensity',
    'Punarvasu': 'renewal, optimism, philosophical nature',
    'Pushya': 'nurturing wisdom, spiritual authority, prosperity',
    'Ashlesha': 'penetrating insight, kundalini energy, serpentine wisdom',
    'Magha': 'ancestral blessings, leadership, royal dignity',
    'Purva Phalguni': 'creative joy, marital happiness, Bhaga\'s grace',
    'Uttara Phalguni': 'service, organizational skill, solar strength',
    'Hasta': 'skilled hands, healing, craftsmanship',
    'Chitra': 'creative brilliance, architectural mind, Vishwakarma\'s gift',
    'Swati': 'independence, balance, entrepreneurial spirit',
    'Vishakha': 'focused ambition, transformative power',
    'Anuradha': 'deep devotion, disciplined friendship, Mitra\'s grace',
    'Jyeshtha': 'leadership by merit, protective power',
    'Mula': 'root investigation, liberation from attachments',
    'Purva Ashadha': 'invincibility, purifying vision',
    'Uttara Ashadha': 'universal victory, dharmic resolve',
    'Shravana': 'listening wisdom, Vishnu\'s grace, sacred learning',
    'Dhanishtha': 'musical gifts, material success, warrior spirit',
    'Shatabhisha': 'healing secrets, mystical knowledge, independence',
    'Purva Bhadrapada': 'intense spiritual fire, transformation',
    'Uttara Bhadrapada': 'depth, cosmic wisdom, serpent of the deep',
    'Revati': 'completeness, gentle nourishment, Pushan\'s care',
  };

  const nakshatraQuality = NAKSHATRA_READINGS[moonPlanet.nakshatraName] || 'profound depth and spiritual awareness';

  // 10th Lord / Career
  const careerPlanet = planets.find(p => p.house === 10) || lagnaLord;
  const careerHint = strongPlanets.includes('jupiter') ? 'Jupiter\'s strength indicates success in teaching, law, finance, or spiritual guidance.' :
                     strongPlanets.includes('mercury') ? 'Mercury\'s prominence suggests excellence in technology, writing, commerce, or communications.' :
                     strongPlanets.includes('saturn') ? 'Saturn\'s strength points toward sustained success through discipline in engineering, administration, or service professions.' :
                     'The career trajectory shows promise through consistent effort and application of natural talents.';
  
  const yogaText = rajaYogas.length > 0
    ? `The chart is graced by ${rajaYogas.slice(0, 2).join(' and ')}, powerful combinations that elevate the native's potential for achievement and recognition.`
    : 'While major named yogas may not be prominently present, the chart holds its own unique constellation of strengths that will express through consistent effort.';

  const careerSummary = `${careerHint} ${yogaText}`;

  // 7th House / Relationships
  const venusStatus = planets.find(p => p.key === 'venus');
  const marriageSummary = doshas.includes('Mangal Dosha (Kuja Dosha)')
    ? 'The presence of Kuja Dosha calls for careful partner selection. Matching with a Manglik native and performing Mangal Shanti before marriage is strongly recommended.'
    : venusStatus?.isExalted
    ? 'Venus being exalted promises a devoted, cultured, and affectionate partner. Marital life holds the promise of genuine companionship.'
    : 'The 7th house configuration suggests a relationship built on mutual respect and shared values.';

  // Spiritual / 9th/12th
  const buildSpiritualReading = () => {
    const jupiter = planets.find(p => p.key === 'jupiter');
    const ketu = planets.find(p => p.key === 'ketu');
    const jupHouse = jupiter?.house;
    if (jupHouse === 9 || jupHouse === 12 || jupHouse === 1) {
      return 'Jupiter\'s placement in a Dharmic or Moksha house indicates a soul deeply oriented toward spiritual evolution. The native is naturally drawn to Vedantic study, philosophical inquiry, and service to others as a path to liberation (Moksha).';
    }
    if (ketu?.house === 12 || ketu?.house === 9) {
      return 'Ketu\'s position in a Moksha-oriented house suggests accumulated spiritual merit from past lifetimes. The native may experience profound inner realizations and is drawn toward meditation (Dhyana) and renunciation of attachment.';
    }
    return 'The chart indicates a gradual unfolding of spiritual awareness through life\'s experiences. Bhakti (devotion), Karma Yoga (selfless action), and regular Sadhana (spiritual practice) are the recommended paths for this native\'s growth.';
  };

  const spiritualSummary = buildSpiritualReading();

  // Create Soul Blueprint
  const strongPlanetsStr = strongPlanets.length > 0 
    ? ` Exceptional planetary strength flows through ${strongPlanets.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')}, bestowing natural mastery in those domains.` 
    : '';
  const soulBlueprint = `${LAGNA_READINGS[lagna.rashi] || ''} This chart is rooted in ${lagnaRashi.name} Lagna — shaping the native\'s core personality, physical constitution, and fundamental approach to life. The Moon in ${moonPlanet.nakshatraName} Nakshatra (${moonRashi.name}) colours the emotional world with ${nakshatraQuality}.${strongPlanetsStr}`;

  // Build the Dasha Dictionary
  const DASHA_DICT = {
    sun: {
      desc: 'Sun period elevates authority and spiritual awareness.',
      challenge: 'Avoid arrogance and excessive need for recognition. Guard against ego-driven decisions in authority roles.',
      guidance: 'Step into leadership and public service with confidence. Surya Namaskar and morning sun practice strengthen solar energy and vitality.'
    },
    moon: {
      desc: 'Moon period brings emotional depth and public recognition.',
      challenge: 'Avoid emotional reactivity and over-attachment. Stillness and inner nourishment are essential practices.',
      guidance: 'Nurture emotional well-being through creative expression, time near water, and family connection. Journaling and meditation bring inner clarity.'
    },
    mars: {
      desc: 'Mars period activates courage, property matters, and competitive drive.',
      challenge: 'Channel drive constructively — avoid impulsive action, unnecessary conflict, or overexertion.',
      guidance: 'Direct energy into physical fitness, entrepreneurial ventures, or property matters. Take bold but calculated action — Hanuman puja supports courage and protection.'
    },
    rahu: {
      desc: 'Rahu period creates intense worldly ambition and unconventional breakthroughs.',
      challenge: 'Ground ambitions in ethical action. Avoid obsessive desire or deception in pursuing goals.',
      guidance: 'Embrace innovation and transformative opportunities boldly. Study new fields, engage with foreign connections, and take thoughtful unconventional paths.'
    },
    jupiter: {
      desc: 'Jupiter period bestows wisdom, expansion, and spiritual growth.',
      challenge: 'Beware of overconfidence or moralizing. True wisdom involves listening as much as teaching.',
      guidance: 'Pursue higher education, teaching, and philosophical inquiry. Expand through travel or study. Charitable giving amplifies Jupiter\'s blessings considerably.'
    },
    saturn: {
      desc: 'Saturn period teaches discipline through challenges and builds lasting structures.',
      challenge: 'Patience is paramount. Avoid shortcuts and resentment — steady, disciplined effort is the only key.',
      guidance: 'Build long-term foundations with patience and integrity. Focus on disciplined service and karma yoga. Saturn richly rewards sincere, unglamorous hard work.'
    },
    mercury: {
      desc: 'Mercury period enhances intellect, commerce, and communication.',
      challenge: 'Avoid mental scatteredness and overthinking. Direct intellectual energy into focused, purposeful work.',
      guidance: 'Invest in learning, writing, teaching, or skill-building. Launch communication-heavy or analytical projects and strengthen business foundations.'
    },
    ketu: {
      desc: 'Ketu period deepens spiritual insight and detachment from material pursuits.',
      challenge: 'Avoid excessive withdrawal or self-doubt. Integrate inner gifts with active present-world engagement.',
      guidance: 'Deepen meditation and spiritual study. Service to the underprivileged brings peace. Ancestral healing practices and pilgrimage are beneficial.'
    },
    venus: {
      desc: 'Venus period brings luxury, relationships, and artistic expression.',
      challenge: 'Avoid indulgence or emotional dependency. Balance enjoyment with purposeful effort.',
      guidance: 'Invest in relationships, art, and creative expression. Social connection, diplomacy, and gratitude practices are all highly favoured.'
    }
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

     const sYear = parseInt(maha.startStr.split('-')[0]);
     const eYear = parseInt(maha.endStr.split('-')[0]);
     const ageStart = Math.max(0, sYear - birthYear);
     const ageEnd = Math.max(0, eYear - birthYear);

     return {
        planet: maha.planet,
        start: maha.startStr,
        end: maha.endStr,
        years: maha.years,
        ageStr: `Ages ${ageStart}-${ageEnd} (${maha.years} yrs)`,
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
      start: currentAntar.startStr,
      end: currentAntar.endStr,
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

export default function ExpertReadingTab({ kundali }) {
  const reading = buildReading(kundali);

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
            <h3 style={{ margin: 0, fontSize: 18, color: 'var(--accent-gold)', fontWeight: 700 }}>Expert Jyotish Reading</h3>
            <p style={{ margin: '3px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>Parashara Hora Shastra · Lahiri Ayanamsa</p>
          </div>
        </div>

        {/* Soul Blueprint */}
        <div style={{ marginBottom: 40 }}>
          <SectionTitle icon="🌟" title="Soul Blueprint" />
          <p style={{ fontSize: 14, color: 'var(--text-main)', lineHeight: 1.85, margin: 0 }}>
            {reading.soulBlueprint}
          </p>
        </div>

        {/* Thematic Summaries */}
        <div style={{ marginBottom: 40, borderLeft: '3px solid #7C3AED', paddingLeft: 16 }}>
          <SectionTitle icon="📜" title="Life Themes Overview" />
          <div style={{ marginBottom: 12 }}>
            <strong style={{ color: 'var(--accent-gold)' }}>Career & Purpose:</strong>
            <span style={{ fontSize: 14, color: 'var(--text-main)', marginLeft: 8 }}>{reading.themesSummary.career}</span>
          </div>
          <div style={{ marginBottom: 12 }}>
            <strong style={{ color: 'var(--accent-gold)' }}>Relationships:</strong>
            <span style={{ fontSize: 14, color: 'var(--text-main)', marginLeft: 8 }}>{reading.themesSummary.marriage}</span>
          </div>
          <div>
            <strong style={{ color: 'var(--accent-gold)' }}>Spiritual Path:</strong>
            <span style={{ fontSize: 14, color: 'var(--text-main)', marginLeft: 8 }}>{reading.themesSummary.spiritual}</span>
          </div>
        </div>

        {/* Life Journey */}
        <div style={{ marginBottom: 40 }}>
          <SectionTitle icon="🗺️" title="Your Life Journey" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {reading.lifeJourney.map(maha => (
              <div key={maha.planet} style={{ 
                background: maha.isCurrent ? 'var(--bg-badge-purple)' : 'var(--bg-input)', 
                border: maha.isCurrent ? '1px solid #7C3AED' : '1px solid var(--border-light)', 
                borderRadius: 8, padding: 16, position: 'relative'
              }}>
                {maha.isCurrent && (
                  <div style={{ position: 'absolute', top: 12, right: 12, background: '#7C3AED', color: 'white', fontSize: 11, fontWeight: 'bold', padding: '2px 8px', borderRadius: 12 }}>
                    NOW
                  </div>
                )}
                <div style={{ marginBottom: 8 }}>
                  <span style={{ color: 'var(--accent-gold)', fontWeight: 700, fontSize: 15, textTransform: 'capitalize' }}>{maha.planet}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: 13, marginLeft: 10 }}>{maha.ageStr}</span>
                </div>
                <p style={{ color: 'var(--text-main)', fontSize: 13, lineHeight: 1.6, margin: '0 0 12px 0' }}>{maha.description}</p>
                <div style={{ background: 'var(--bg-card)', padding: 12, borderRadius: 6, border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: 13, marginBottom: 6 }}>
                    <strong style={{ color: 'var(--text-badge-red)' }}>Key Challenge:</strong> <span style={{ color: 'var(--text-main)' }}>{maha.keyChallenge}</span>
                  </div>
                  <div style={{ fontSize: 13 }}>
                    <strong style={{ color: 'var(--text-badge-green)' }}>Guidance:</strong> <span style={{ color: 'var(--text-main)' }}>{maha.guidance}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Phase: Deep Dive */}
        <div style={{ marginBottom: 30 }}>
          <SectionTitle icon="⏳" title="Current Phase: Deep Dive" />
          <div style={{ background: 'var(--bg-badge-purple)', border: '1px solid var(--border-light)', borderRadius: 8, padding: 20 }}>
            
            {/* Mahadasha */}
            <h5 style={{ margin: '0 0 8px', color: 'var(--accent-gold)', fontSize: 15, textTransform: 'capitalize' }}>
              {reading.deepDive.maha.planet} Mahadasha — {reading.deepDive.maha.start} to {reading.deepDive.maha.end}
            </h5>
            <p style={{ color: 'var(--text-main)', fontSize: 13, lineHeight: 1.6, margin: '0 0 16px 0' }}>
              {reading.deepDive.maha.description}
            </p>
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1, background: 'var(--bg-badge-red)', padding: 12, borderRadius: 6, border: '1px solid var(--border-light)' }}>
                <strong style={{ color: 'var(--text-badge-red)', display: 'block', marginBottom: 4, fontSize: 12 }}>Key Challenge</strong>
                <span style={{ color: 'var(--text-main)', fontSize: 12 }}>{reading.deepDive.maha.keyChallenge}</span>
              </div>
              <div style={{ flex: 1, background: 'var(--bg-badge-green)', padding: 12, borderRadius: 6, border: '1px solid var(--border-light)' }}>
                <strong style={{ color: 'var(--text-badge-green)', display: 'block', marginBottom: 4, fontSize: 12 }}>Core Guidance</strong>
                <span style={{ color: 'var(--text-main)', fontSize: 12 }}>{reading.deepDive.maha.guidance}</span>
              </div>
            </div>

            {/* Antardasha */}
            {reading.deepDive.antar && (
              <div style={{ borderTop: '1px dashed var(--border-light)', paddingTop: 16 }}>
                <h5 style={{ margin: '0 0 8px', color: 'var(--accent-gold)', fontSize: 14 }}>
                  ↳ {reading.deepDive.antar.planet.charAt(0).toUpperCase() + reading.deepDive.antar.planet.slice(1)} Antardasha — {reading.deepDive.antar.start} to {reading.deepDive.antar.end}
                </h5>
                <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.6, margin: 0 }}>
                  This active sub-period adds its own coloration to the overarching phase: {reading.deepDive.antar.dict.desc} Focus on integrating {reading.deepDive.antar.planet} energies productively to mitigate its challenge: {reading.deepDive.antar.dict.challenge.toLowerCase()}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <div style={{ padding: '14px 18px', background: 'var(--bg-badge-yellow)', borderRadius: 8, border: '1px solid var(--border-light)' }}>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-badge-yellow)', lineHeight: 1.6 }}>
            <strong>Note:</strong> This reading is based on classical Parashari Jyotish principles. For a comprehensive personal analysis, consult a qualified Jyotishi.
          </p>
        </div>
      </div>
    </div>
  );
}
