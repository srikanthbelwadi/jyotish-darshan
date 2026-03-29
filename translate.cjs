const translate = require('@iamtraction/google-translate');
const fs = require('fs');
const path = require('path');

const PILLAR_DATA = {
  'dharma': { title: 'Dharma & Duty', desc: 'D9 & 9th House Rectitude', prompt: 'The foundation of life rests upon Righteousness (Dharma). Which aspect of duty seeks clarity?' },
  'vivaha': { title: 'Marriage & Unions', desc: 'D9 Navamsa Harmony', prompt: 'The sacred union of Vivaha binds two souls karmically. What is your inquiry regarding marital bonds?' },
  'dhana': { title: 'Wealth & Treasury', desc: 'D2 Hora Liquidity', prompt: 'The 2nd house and D2 chart govern accumulated treasures, gold, and grains. What is your material focus?' },
  'arogya': { title: 'Health & Ayurveda', desc: 'D6 Bodily Humors', prompt: 'The D6 map exposes imbalances in the Vata, Pitta, and Kapha doshas. What anomaly requires attention?' },
  'muhurta': { title: 'Auspicious Timing', desc: 'Panchanga Engine', prompt: 'Muhurta aligns human action with divine time. What auspicious event are you planning?' },
  'shanti': { title: 'Cosmic Remedies', desc: 'Dosha Mitigation', prompt: 'Afflictions demand propitiation. Which traditional remedial measure do you seek to enact?' },
  'santhana': { title: 'Progeny & Lineage', desc: 'D7 Saptamsa Matrix', prompt: 'The expansion of the bloodline is governed by the 5th house. What concerns the legacy of your lineage?' },
  'yatra': { title: 'Pilgrimage & Travel', desc: '12th/9th House Vectors', prompt: 'Travel for spiritual merit or foreign expansion requires alignment. What is the nature of the journey?' },
  'vyavahara': { title: 'Disputes & Courts', desc: 'D30 Trimsamsa', prompt: 'The 6th house governs open enemies, disputes, and royal punishments. What conflict plagues you?' },
  'vidya': { title: 'Education & Wisdom', desc: 'D24 Chaturvimsamsa', prompt: 'The pursuit of Vidya removes darkness. What intellectual or spiritual knowledge do you seek?' },
  'bhumi': { title: 'Land & Properties', desc: 'D4 Chaturthamsa', prompt: 'The 4th house governs fixed assets, land, and the comfort of the home. What earthly matter arises?' },
  'moksha': { title: 'Spiritual Liberation', desc: 'D60 Shashtiamsa', prompt: 'The ultimate aim is liberation from the cycle of birth and death. What blocks your spiritual ascent?' },
  'pitru': { title: 'Ancestral Karma', desc: 'D40 Khavedamsa', prompt: 'We carry the unsolved debts of our forefathers. What ancestral affliction requires propitiation?' },
  'gupta_dhana': { title: 'Sudden Gains', desc: '8th House Mysteries', prompt: 'The 8th house rules unearned wealth, buried treasures, and sudden reversals. What hidden matter stirs?' },
  'bhratru': { title: 'Siblings & Courage', desc: 'D3 Drekkana', prompt: 'The 3rd house rules valor (Parakrama), siblings, and the right arm. Where is your courage directed?' },
  'mata_pita': { title: 'Parents & Elders', desc: 'D12 Dwadasamsa', prompt: 'The D12 chart reveals the absolute karmic ties to the mother and father. What is the inquiry?' },
  'sukha': { title: 'Mental Peace & Home', desc: '4th House Tranquility', prompt: 'True wealth is internal peace (Sukha) and a harmonious home. What disturbs the waters of the mind?' },
  'diksha': { title: 'Guru & Initiation', desc: 'D20 Vimsamsa', prompt: 'The D20 charts your spiritual receptivity and readiness for Mantra Diksha. Are you prepared to receive?' },
  'swapna': { title: 'Dreams & Omens', desc: 'Swapna Shastra', prompt: 'The subconscious mind receives signals from the astral plane. What omens are manifesting?' },
  'kirti': { title: 'Fame & Royal Favor', desc: 'Arudha Lagna Profile', prompt: 'The Arudha Lagna dictates the Maya—how the world perceives your status and renown. What is your public aim?' },
  'mrityu': { title: 'Dangers & Longevity', desc: 'Maraka & Badhaka', prompt: 'The Maraka (Death-inflicting) houses command periods of immense physical danger. Scan for immediate threats.' },
  'dinacharya': { title: 'Daily Rites', desc: '6th House Discipline', prompt: 'The 6th house requires the rhythmic discipline of daily life to suppress diseases and enemies. What needs correction?' },
  'sangha': { title: 'Community & Guilds', desc: '11th House Gains', prompt: 'The 11th house dictates your ability to extract wealth and favors from large societies or guilds. What is the objective?' },
  'tantra': { title: 'Occult & Mysticism', desc: 'D8 Ashtamsa Matrix', prompt: 'The 8th house and D8 chart govern Tantra, hidden dimension, and the manipulation of occult energies. Do you dare look?' }
};

const LANGS = ['hi', 'te', 'ta', 'kn', 'mr', 'gu', 'bn', 'ml']; 
// sa depends on translation accuracy for sanskrit, google translate might use hi or sa, google translate uses 'sa' for sanskrit now.

async function run() {
  const result = {};
  for (const lang of LANGS) {
    result[lang] = {};
    for (const [key, val] of Object.entries(PILLAR_DATA)) {
      try {
        const titleTr = await translate(val.title, { to: lang });
        const descTr = await translate(val.desc, { to: lang });
        const promptTr = await translate(val.prompt, { to: lang });
        result[lang][`pillar.${key}.title`] = titleTr.text;
        result[lang][`pillar.${key}.desc`] = descTr.text;
        result[lang][`pillar.${key}.prompt`] = promptTr.text;
        console.log(`Translated ${key} to ${lang}`);
      } catch (e) {
        console.error(`Error translating ${key} to ${lang}`);
      }
    }
  }

  // Also translate NAKSHATRA READINGS
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

  for (const lang of LANGS) {
    for (const [naks, text] of Object.entries(NAKSHATRA_READINGS)) {
      try {
        const tr = await translate(text, { to: lang });
        result[lang][`naks.read.${naks}`] = tr.text;
      } catch(e) {}
    }
  }

  fs.writeFileSync('./src/i18n/dashboardTranslations.json', JSON.stringify(result, null, 2));
  console.log('Done!');
}
run();
