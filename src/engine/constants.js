/** Vedic Astrology Constants */

export const RASHIS = [
  { id: 0,  name: 'Mesha',      en: 'Aries',       symbol: '♈', lord: 'mars',    element: 'fire',  quality: 'movable' },
  { id: 1,  name: 'Vrishabha',  en: 'Taurus',      symbol: '♉', lord: 'venus',   element: 'earth', quality: 'fixed'   },
  { id: 2,  name: 'Mithuna',    en: 'Gemini',       symbol: '♊', lord: 'mercury', element: 'air',   quality: 'dual'    },
  { id: 3,  name: 'Karka',      en: 'Cancer',       symbol: '♋', lord: 'moon',    element: 'water', quality: 'movable' },
  { id: 4,  name: 'Simha',      en: 'Leo',          symbol: '♌', lord: 'sun',     element: 'fire',  quality: 'fixed'   },
  { id: 5,  name: 'Kanya',      en: 'Virgo',        symbol: '♍', lord: 'mercury', element: 'earth', quality: 'dual'    },
  { id: 6,  name: 'Tula',       en: 'Libra',        symbol: '♎', lord: 'venus',   element: 'air',   quality: 'movable' },
  { id: 7,  name: 'Vrischika',  en: 'Scorpio',      symbol: '♏', lord: 'mars',    element: 'water', quality: 'fixed'   },
  { id: 8,  name: 'Dhanu',      en: 'Sagittarius',  symbol: '♐', lord: 'jupiter', element: 'fire',  quality: 'dual'    },
  { id: 9,  name: 'Makara',     en: 'Capricorn',    symbol: '♑', lord: 'saturn',  element: 'earth', quality: 'movable' },
  { id: 10, name: 'Kumbha',     en: 'Aquarius',     symbol: '♒', lord: 'saturn',  element: 'air',   quality: 'fixed'   },
  { id: 11, name: 'Meena',      en: 'Pisces',       symbol: '♓', lord: 'jupiter', element: 'water', quality: 'dual'    },
];

export const NAKSHATRAS = [
  { id: 0,  name: 'Ashwini',     lord: 'ketu',    deity: 'Ashwins',      span: [0, 13.333] },
  { id: 1,  name: 'Bharani',     lord: 'venus',   deity: 'Yama',         span: [13.333, 26.667] },
  { id: 2,  name: 'Krittika',    lord: 'sun',     deity: 'Agni',         span: [26.667, 40] },
  { id: 3,  name: 'Rohini',      lord: 'moon',    deity: 'Brahma',       span: [40, 53.333] },
  { id: 4,  name: 'Mrigashira',  lord: 'mars',    deity: 'Soma',         span: [53.333, 66.667] },
  { id: 5,  name: 'Ardra',       lord: 'rahu',    deity: 'Rudra',        span: [66.667, 80] },
  { id: 6,  name: 'Punarvasu',   lord: 'jupiter', deity: 'Aditi',        span: [80, 93.333] },
  { id: 7,  name: 'Pushya',      lord: 'saturn',  deity: 'Brihaspati',   span: [93.333, 106.667] },
  { id: 8,  name: 'Ashlesha',    lord: 'mercury', deity: 'Nagas',        span: [106.667, 120] },
  { id: 9,  name: 'Magha',       lord: 'ketu',    deity: 'Pitrs',        span: [120, 133.333] },
  { id: 10, name: 'Purva Phalguni', lord: 'venus', deity: 'Bhaga',       span: [133.333, 146.667] },
  { id: 11, name: 'Uttara Phalguni', lord: 'sun', deity: 'Aryaman',      span: [146.667, 160] },
  { id: 12, name: 'Hasta',       lord: 'moon',    deity: 'Savitar',      span: [160, 173.333] },
  { id: 13, name: 'Chitra',      lord: 'mars',    deity: 'Vishwakarma',  span: [173.333, 186.667] },
  { id: 14, name: 'Swati',       lord: 'rahu',    deity: 'Vayu',         span: [186.667, 200] },
  { id: 15, name: 'Vishakha',    lord: 'jupiter', deity: 'Indra-Agni',   span: [200, 213.333] },
  { id: 16, name: 'Anuradha',    lord: 'saturn',  deity: 'Mitra',        span: [213.333, 226.667] },
  { id: 17, name: 'Jyeshtha',    lord: 'mercury', deity: 'Indra',        span: [226.667, 240] },
  { id: 18, name: 'Mula',        lord: 'ketu',    deity: 'Nirrti',       span: [240, 253.333] },
  { id: 19, name: 'Purva Ashadha', lord: 'venus', deity: 'Apas',         span: [253.333, 266.667] },
  { id: 20, name: 'Uttara Ashadha', lord: 'sun',  deity: 'Vishwadevas',  span: [266.667, 280] },
  { id: 21, name: 'Shravana',    lord: 'moon',    deity: 'Vishnu',       span: [280, 293.333] },
  { id: 22, name: 'Dhanishtha',  lord: 'mars',    deity: 'Vasus',        span: [293.333, 306.667] },
  { id: 23, name: 'Shatabhisha', lord: 'rahu',    deity: 'Varuna',       span: [306.667, 320] },
  { id: 24, name: 'Purva Bhadrapada', lord: 'jupiter', deity: 'Aja Ekapada', span: [320, 333.333] },
  { id: 25, name: 'Uttara Bhadrapada', lord: 'saturn', deity: 'Ahir Budhnya', span: [333.333, 346.667] },
  { id: 26, name: 'Revati',      lord: 'mercury', deity: 'Pushan',       span: [346.667, 360] },
];

export const GRAHA_NAMES = {
  sun:     { en: 'Sun',     sa: 'Surya',   hi: 'सूर्य',    kn: 'ಸೂರ್ಯ',   symbol: '☉', color: '#F59E0B' },
  moon:    { en: 'Moon',    sa: 'Chandra', hi: 'चन्द्र',   kn: 'ಚಂದ್ರ',    symbol: '☽', color: '#818CF8' },
  mars:    { en: 'Mars',    sa: 'Mangal',  hi: 'मंगल',     kn: 'ಮಂಗಳ',    symbol: '♂', color: '#EF4444' },
  mercury: { en: 'Mercury', sa: 'Budha',   hi: 'बुध',       kn: 'ಬುಧ',      symbol: '☿', color: '#10B981' },
  jupiter: { en: 'Jupiter', sa: 'Guru',    hi: 'गुरु',      kn: 'ಗುರು',     symbol: '♃', color: '#F59E0B' },
  venus:   { en: 'Venus',   sa: 'Shukra',  hi: 'शुक्र',    kn: 'ಶುಕ್ರ',    symbol: '♀', color: '#EC4899' },
  saturn:  { en: 'Saturn',  sa: 'Shani',   hi: 'शनि',       kn: 'ಶನಿ',      symbol: '♄', color: '#6366F1' },
  rahu:    { en: 'Rahu',    sa: 'Rahu',    hi: 'राहु',      kn: 'ರಾಹು',     symbol: '☊', color: '#8B5CF6' },
  ketu:    { en: 'Ketu',    sa: 'Ketu',    hi: 'केतु',      kn: 'ಕೇತು',     symbol: '☋', color: '#7C3AED' },
};

export const PLANET_ORDER = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'];

// Exaltation and debilitation degrees
export const EXALTATION = {
  sun:     { rashi: 0,  degree: 10 },  // Mesha 10°
  moon:    { rashi: 1,  degree: 3  },  // Vrishabha 3°
  mars:    { rashi: 9,  degree: 28 },  // Makara 28°
  mercury: { rashi: 5,  degree: 15 },  // Kanya 15°
  jupiter: { rashi: 3,  degree: 5  },  // Karka 5°
  venus:   { rashi: 11, degree: 27 },  // Meena 27°
  saturn:  { rashi: 6,  degree: 20 },  // Tula 20°
  rahu:    { rashi: 2,  degree: 20 },  // Mithuna 20°
  ketu:    { rashi: 8,  degree: 20 },  // Dhanu 20°
};

export const DEBILITATION = {
  sun:     { rashi: 6  },
  moon:    { rashi: 7  },
  mars:    { rashi: 3  },
  mercury: { rashi: 11 },
  jupiter: { rashi: 9  },
  venus:   { rashi: 5  },
  saturn:  { rashi: 0  },
  rahu:    { rashi: 8  },
  ketu:    { rashi: 2  },
};

// Vimshottari Dasha periods
export const DASHA_PERIODS = {
  ketu:    7,
  venus:   20,
  sun:     6,
  moon:    10,
  mars:    7,
  rahu:    18,
  jupiter: 16,
  saturn:  19,
  mercury: 17,
};

export const DASHA_ORDER = ['ketu','venus','sun','moon','mars','rahu','jupiter','saturn','mercury'];
export const DASHA_TOTAL = 120;

// Nakshatra to Dasha lord mapping (index = nakshatra id)
export const NAKSHATRA_DASHA_LORD = NAKSHATRAS.map(n => n.lord);

// Planet colors for UI
export const PLANET_COLORS = {
  sun:     '#F59E0B',
  moon:    '#8B5CF6',
  mars:    '#EF4444',
  mercury: '#10B981',
  jupiter: '#D97706',
  venus:   '#EC4899',
  saturn:  '#6366F1',
  rahu:    '#1E3A5F',
  ketu:    '#7C3AED',
};

// Short symbols for chart display
export const PLANET_ABBR = {
  sun: 'Su', moon: 'Mo', mars: 'Ma', mercury: 'Bu',
  jupiter: 'Gu', venus: 'Sk', saturn: 'Sa', rahu: 'Ra', ketu: 'Ke',
};

// South Indian chart: fixed Rashi positions [col, row] in 4x4 grid
// Pisces=top-left, going clockwise: Pi, Ar, Ta, Ge, Ca, Le, Vi, Li, Sc, Sa, Cp, Aq
export const SI_POSITIONS = [
  [0, 0], // Mesha 0   (row0 col0 = top-left-corner area)
  [1, 0], // Vrishabha 1
  [2, 0], // Mithuna 2
  [3, 0], // Karka 3
  [3, 1], // Simha 4
  [3, 2], // Kanya 5
  [3, 3], // Tula 6
  [2, 3], // Vrischika 7
  [1, 3], // Dhanu 8
  [0, 3], // Makara 9
  [0, 2], // Kumbha 10
  [0, 1], // Meena 11
];

// Yoga rules (simplified set of major yogas)
export const YOGA_RULES = [
  {
    name: 'Gaj Kesari Yoga',
    check: (planets, lagna) => {
      const moRashi = planets.moon?.rashi;
      const guRashi = planets.jupiter?.rashi;
      if (moRashi == null || guRashi == null) return false;
      const diff = Math.abs(moRashi - guRashi);
      const angularDiff = Math.min(diff, 12 - diff);
      return angularDiff % 3 === 0; // Kendra from moon
    },
    effect: 'Bestows wisdom, wealth, fame, and long-lasting prosperity. The native commands great respect and possesses a magnetic, charismatic presence.',
    type: 'raja',
  },
  {
    name: 'Budhaditya Yoga',
    check: (planets) => planets.sun?.rashi === planets.mercury?.rashi,
    effect: 'Grants sharp intellect, eloquent speech, and success in academic and administrative pursuits. The native excels in communication, analysis, and persuasion.',
    type: 'raja',
  },
  {
    name: 'Chandra-Mangal Yoga',
    check: (planets) => planets.moon?.rashi === planets.mars?.rashi,
    effect: 'Confers financial acumen, bold initiative, and commercial success. The native is driven, ambitious, and capable of generating substantial wealth through effort.',
    type: 'dhana',
  },
  {
    name: 'Sasa Yoga (Pancha Mahapurusha)',
    check: (planets, lagna) => {
      const saRashi = planets.saturn?.rashi;
      if (saRashi == null) return false;
      const house = ((saRashi - lagna.rashi + 12) % 12) + 1;
      const isKendra = [1, 4, 7, 10].includes(house);
      const isExalted = saRashi === 6; // Tula
      const isOwn = saRashi === 9 || saRashi === 10; // Makara or Kumbha
      return isKendra && (isExalted || isOwn);
    },
    effect: 'One of the Pancha Mahapurusha Yogas. Confers authority, discipline, longevity, and material success earned through persistent effort and leadership.',
    type: 'raja',
  },
  {
    name: 'Ruchaka Yoga (Pancha Mahapurusha)',
    check: (planets, lagna) => {
      const maRashi = planets.mars?.rashi;
      if (maRashi == null) return false;
      const house = ((maRashi - lagna.rashi + 12) % 12) + 1;
      const isKendra = [1, 4, 7, 10].includes(house);
      const isExalted = maRashi === 9; // Makara
      const isOwn = maRashi === 0 || maRashi === 7; // Mesha or Vrischika
      return isKendra && (isExalted || isOwn);
    },
    effect: 'Blesses the native with exceptional courage, physical strength, military or executive authority. The native possesses commanding leadership qualities.',
    type: 'raja',
  },
  {
    name: 'Hamsa Yoga (Pancha Mahapurusha)',
    check: (planets, lagna) => {
      const guRashi = planets.jupiter?.rashi;
      if (guRashi == null) return false;
      const house = ((guRashi - lagna.rashi + 12) % 12) + 1;
      const isKendra = [1, 4, 7, 10].includes(house);
      const isExalted = guRashi === 3; // Karka
      const isOwn = guRashi === 8 || guRashi === 11; // Dhanu or Meena
      return isKendra && (isExalted || isOwn);
    },
    effect: 'Grants wisdom, spiritual authority, noble character, and philanthropic nature. The native is respected as a teacher, counselor, or spiritual guide.',
    type: 'raja',
  },
  {
    name: 'Malavya Yoga (Pancha Mahapurusha)',
    check: (planets, lagna) => {
      const skRashi = planets.venus?.rashi;
      if (skRashi == null) return false;
      const house = ((skRashi - lagna.rashi + 12) % 12) + 1;
      const isKendra = [1, 4, 7, 10].includes(house);
      const isExalted = skRashi === 11; // Meena
      const isOwn = skRashi === 1 || skRashi === 6; // Vrishabha or Tula
      return isKendra && (isExalted || isOwn);
    },
    effect: 'Bestows beauty, artistic talent, material luxury, marital happiness, and refined aesthetic sensibilities. The native enjoys abundant comforts and affection.',
    type: 'raja',
  },
  {
    name: 'Mangal Dosha (Kuja Dosha)',
    check: (planets, lagna) => {
      const maRashi = planets.mars?.rashi;
      if (maRashi == null) return false;
      const house = ((maRashi - lagna.rashi + 12) % 12) + 1;
      return [1, 2, 4, 7, 8, 12].includes(house);
    },
    effect: 'Indicates challenges in marital harmony and relationships. Mangal Shanti Puja and matching with another Manglik native are recommended remedies.',
    type: 'dosha',
  },
  {
    name: 'Kaal Sarp Dosha',
    check: (planets) => {
      const rahuLon = planets.rahu?.longitude;
      const ketuLon = planets.ketu?.longitude;
      if (rahuLon == null) return false;
      const allPlanets = ['sun','moon','mars','mercury','jupiter','venus','saturn'];
      let start = Math.min(rahuLon, ketuLon);
      let end = Math.max(rahuLon, ketuLon);
      return allPlanets.every(p => {
        const lon = planets[p]?.longitude;
        if (lon == null) return false;
        return lon >= start && lon <= end;
      });
    },
    effect: 'All planets are hemmed between Rahu and Ketu, indicating karmic delays and obstacles. Regular worship of Naga Devatas and Rahu-Ketu Shanti is advised.',
    type: 'dosha',
  },
];

export const HOUSE_NAMES = [
  'Tanu (Self & Body)',
  'Dhana (Wealth & Family)',
  'Sahaja (Siblings & Communication)',
  'Matru (Mother & Home)',
  'Putra (Children & Creativity)',
  'Shatru (Enemies & Health)',
  'Kalatra (Partner & Marriage)',
  'Mrityu (Longevity & Transformation)',
  'Dharma (Higher Learning & Fortune)',
  'Karma (Career & Public Life)',
  'Labha (Gains & Social Network)',
  'Vyaya (Losses & Spiritual Liberation)',
];
