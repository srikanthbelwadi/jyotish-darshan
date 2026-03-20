import { RASHIS } from '../../engine/constants.js';

function buildReading(kundali) {
  const { lagna, planets, yogas, dasha, shadbala } = kundali;
  const moonPlanet = planets.find(p => p.key === 'moon');
  const sunPlanet = planets.find(p => p.key === 'sun');
  const lagnaRashi = RASHIS[lagna.rashi];
  const moonRashi = RASHIS[moonPlanet.rashi];
  const sunRashi = RASHIS[sunPlanet.rashi];
  const lagnaLord = planets.find(p => p.key === lagnaRashi.lord);
  const currentMaha = dasha.mahadashas.find(m => m.isCurrent) || dasha.mahadashas[0];
  const currentAntar = currentMaha?.antardashas?.find(a => a.isCurrent) || currentMaha?.antardashas?.[0];

  const rajaYogas = yogas.filter(y => y.type === 'raja').map(y => y.name);
  const doshas = yogas.filter(y => y.type === 'dosha').map(y => y.name);

  const strongPlanets = Object.entries(shadbala).filter(([, v]) => v.classification === 'Strong').map(([k]) => k);
  const weakPlanets = Object.entries(shadbala).filter(([, v]) => v.classification === 'Weak').map(([k]) => k);

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

  const careerPlanet = planets.find(p => p.house === 10) || lagnaLord;
  const careerHint = strongPlanets.includes('jupiter') ? 'Jupiter\'s strength indicates success in teaching, law, finance, or spiritual guidance.' :
                     strongPlanets.includes('mercury') ? 'Mercury\'s prominence suggests excellence in technology, writing, commerce, or communications.' :
                     strongPlanets.includes('saturn') ? 'Saturn\'s strength points toward sustained success through discipline in engineering, administration, or service professions.' :
                     'The career trajectory shows promise through consistent effort and application of natural talents.';

  const marriageHouse7 = planets.filter(p => p.house === 7);
  const venusStatus = planets.find(p => p.key === 'venus');
  const marriageHint = doshas.includes('Mangal Dosha (Kuja Dosha)')
    ? 'The presence of Kuja Dosha calls for careful partner selection. Matching with a Manglik native and performing Mangal Shanti before marriage is strongly recommended.'
    : venusStatus?.isExalted
    ? 'Venus being exalted promises a devoted, cultured, and affectionate partner. Marital life holds the promise of genuine companionship.'
    : 'The 7th house configuration suggests a relationship built on mutual respect and shared values.';

  const currentPeriod = `${currentMaha?.planet} Mahadasha${currentAntar ? `, ${currentAntar.planet} Antardasha` : ''}`;
  const periodYears = `${currentMaha?.start} to ${currentMaha?.end}`;

  const yogaText = rajaYogas.length > 0
    ? `The chart is graced by ${rajaYogas.slice(0, 2).join(' and ')}, powerful combinations that elevate the native's potential for achievement and recognition.`
    : 'While major named yogas may not be prominently present, the chart holds its own unique constellation of strengths that will express through consistent effort.';

  return {
    personality: LAGNA_READINGS[lagna.rashi] || '',
    nakshatra: `The Moon placed in ${moonPlanet.nakshatraName} Nakshatra (${moonRashi.name}) bestows ${nakshatraQuality}. This reflects the inner emotional landscape — how the native processes experience, seeks comfort, and relates to the mother principle.`,
    career: `${careerHint} ${yogaText}`,
    marriage: marriageHint,
    currentPeriod,
    periodYears,
    currentAnalysis: buildPeriodAnalysis(currentMaha?.planet, currentAntar?.planet, lagna.rashi),
    spiritual: buildSpiritualReading(planets, lagna.rashi),
  };
}

function buildPeriodAnalysis(mahaPlanet, antarPlanet, lagnaRashi) {
  const DASHA_MEANINGS = {
    sun: 'a period of vitality, authority, and recognition. Solar energy brings clarity of purpose and success through personal effort.',
    moon: 'a period of emotional sensitivity, heightened intuition, and growth through nurturing. Travel, mother-related matters, and public prominence are activated.',
    mars: 'a period of action, courage, and decisive moves. Property, siblings, and competitive endeavors are highlighted.',
    mercury: 'a period of intellectual expansion, communication, business acumen, and learning. Beneficial for education, writing, and trade.',
    jupiter: 'an auspicious period of wisdom, spiritual growth, prosperity, and family blessings. Guru\'s benefic rays open doors of grace.',
    venus: 'a period of creative flourishing, marital happiness, artistic expression, and material comforts. Relationships and aesthetic pursuits prosper.',
    saturn: 'a period of karmic consolidation, disciplined effort, and lessons in responsibility. Hard work now plants seeds for lasting achievement.',
    rahu: 'a period of ambition, foreign connections, unconventional paths, and material desires. Innovation and intensity characterize this phase.',
    ketu: 'a period of spiritualization, detachment, and inner turning. Mystical experiences, research, and liberation from past patterns.',
  };
  const mahaText = DASHA_MEANINGS[mahaPlanet] || 'a significant period of personal development.';
  const antarText = antarPlanet ? `The current Antardasha of ${antarPlanet} adds ${DASHA_MEANINGS[antarPlanet] || 'its own coloration'}.` : '';
  return `The running ${mahaPlanet?.charAt(0).toUpperCase() + mahaPlanet?.slice(1)} Mahadasha is ${mahaText} ${antarText}`;
}

function buildSpiritualReading(planets, lagnaRashi) {
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
}

export default function ExpertReadingTab({ kundali }) {
  const reading = buildReading(kundali);
  const { lagna, planets, dasha } = kundali;
  const currentMaha = dasha.mahadashas.find(m => m.isCurrent) || dasha.mahadashas[0];

  const Section = ({ title, children }) => (
    <div style={{ marginBottom: 24 }}>
      <h4 style={{ margin: '0 0 10px', fontSize: 15, fontWeight: 700, color: '#7C3AED', borderBottom: '1px solid #EDE9FE', paddingBottom: 6 }}>{title}</h4>
      <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.85 }}>{children}</div>
    </div>
  );

  return (
    <div style={{ animation: 'slideIn 0.25s ease' }}>
      <div style={{ background: 'white', border: '1px solid #E5D5C0', borderRadius: 12, padding: 28 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24, paddingBottom: 18, borderBottom: '1px solid #E5D5C0' }}>
          <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg, #7C3AED, #F59E0B)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: 'white', fontSize: 24 }}>☀</span>
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 17, color: '#1E3A5F', fontWeight: 700 }}>Jyotish Vivechanam</h3>
            <p style={{ margin: '3px 0 0', fontSize: 12, color: '#9CA3AF' }}>Expert Vedic Astrology Reading · Based on Lahiri Ayanamsa & classical Parashara Hora Shastra</p>
          </div>
        </div>

        {/* Personality */}
        <Section title="🌟 Lagna Analysis — Personality & Temperament">
          <p>{reading.personality}</p>
        </Section>

        {/* Moon */}
        <Section title="🌙 Chandra — Emotional Nature & Janma Nakshatra">
          <p>{reading.nakshatra}</p>
        </Section>

        {/* Career */}
        <Section title="💼 Artha — Career, Wealth & Dharmic Purpose">
          <p>{reading.career}</p>
        </Section>

        {/* Relationships */}
        <Section title="💫 Kama — Relationships & Marriage Outlook">
          <p>{reading.marriage}</p>
        </Section>

        {/* Current Dasha */}
        <Section title={`⏳ Dasha Phala — Current Period Analysis (${reading.currentPeriod})`}>
          <div style={{ background: '#F5F0FF', borderRadius: 8, padding: '12px 16px', marginBottom: 10 }}>
            <p style={{ margin: 0, fontSize: 12, color: '#7C3AED', fontWeight: 600 }}>
              Period active: {reading.periodYears}
            </p>
          </div>
          <p>{reading.currentAnalysis}</p>
          {currentMaha?.antardashas?.find(a => a.isCurrent) && (
            <p style={{ marginTop: 10 }}>
              For the remainder of this period, the native should focus on harnessing the combined energies of the ruling planets.
              Regular worship of their respective deities and observance of related fasting days will amplify positive results.
            </p>
          )}
        </Section>

        {/* Spiritual */}
        <Section title="🪷 Moksha — Spiritual Inclinations & Soul Path">
          <p>{reading.spiritual}</p>
        </Section>

        {/* Disclaimer */}
        <div style={{ marginTop: 20, padding: '14px 18px', background: '#FFF7ED', borderRadius: 8, border: '1px solid #FDE68A' }}>
          <p style={{ margin: 0, fontSize: 12, color: '#92400E', lineHeight: 1.6 }}>
            <strong>Jyotish Vivechanam Note:</strong> This reading is generated using classical Jyotish Shastra principles applied to your computed birth chart. It is intended for self-reflection, personal insight, and spiritual guidance. For major life decisions — particularly marriage, career transitions, or health matters — consultation with an experienced, qualified Jyotishi (Vedic astrologer) is strongly recommended.
          </p>
        </div>
      </div>
    </div>
  );
}
