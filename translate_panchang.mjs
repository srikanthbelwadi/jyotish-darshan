import translate from '@iamtraction/google-translate';
import fs from 'fs';

const sourceDict = {
  // UI Headers
  'pc.title': 'Personalized Drik Panchang',
  'pc.subtitle': "Track daily Tithi, major festivals, living birthdays, and your departed loved ones' Varshika Tithi automatically.",
  'pc.ancestors': 'Ancestors & Memorials',
  'pc.defaultLocation': 'Using Default Location (Delhi). Enable GPS for local timings.',
  
  // Section Headers
  'pc.sec1': 'The Five Core Elements',
  'pc.sec2': 'Time & Planetary Positions',
  'pc.sec3': 'Calendar Identifiers',
  'pc.sec4': 'Auspicious Timings',
  'pc.sec5': 'Inauspicious Timings',
  'pc.sec6': 'Daily Guidelines & Festivals',

  // Inline Labels
  'pc.vaar': 'Vaar:',
  'pc.tithi': 'Tithi:',
  'pc.nakshatra': 'Nakshatra:',
  'pc.yoga': 'Yoga:',
  'pc.karanas': 'Karanas:',
  'pc.sunrise': 'Sunrise:',
  'pc.sunset': 'Sunset:',
  'pc.sunSign': 'Sun Sign:',
  'pc.moonSign': 'Moon Sign:',
  'pc.samvat': 'Samvat:',
  'pc.masa': 'Masa:',
  'pc.paksha': 'Paksha:',
  'pc.ritu': 'Ritu:',
  'pc.ayana': 'Ayana:',
  
  // Muhurat Labels
  'pc.brahma': 'Brahma Muhurat:',
  'pc.abhijit': 'Abhijit Muhurat:',
  'pc.amrit': 'Amrit Kaal:',
  'pc.amritDesc': 'Approx 1/8th of day active',
  'pc.vijay': 'Vijay Muhurat:',
  'pc.rahu': 'Rahu Kaal:',
  'pc.yama': 'Yamaganda:',
  'pc.guli': 'Gulikai Kaal:',

  // Event Descriptions
  'pc.purnimaDesc': 'The auspicious day of the full moon.',
  'pc.amavasyaDesc': 'The new moon day, suitable for honoring ancestors.',
  'pc.ekadashiDesc': 'Auspicious day for fasting and spiritual progress.',
  'pc.sankashtiDesc': 'Auspicious day dedicated to Lord Ganesha for obstacle removal.',
  'pc.livingBirthday': 'Living Birthday (Tithi)',
  'pc.varshikaTithi': 'Varshika Tithi (Memorial)',
  'pc.noEvents': 'No major festivals or personalized events today.',
  
  // Dynamic identifiers
  'pc.paksha.Shukla': 'Shukla',
  'pc.paksha.Krishna': 'Krishna',
  'pc.ritu.Vasant': 'Vasant (Spring)',
  'pc.ritu.Grishma': 'Grishma (Summer)',
  'pc.ritu.Varsha': 'Varsha (Monsoon)',
  'pc.ritu.Sharad': 'Sharad (Autumn)',
  'pc.ritu.Hemanta': 'Hemanta (Pre-Winter)',
  'pc.ritu.Shishira': 'Shishira (Winter)',
  'pc.ayana.Uttarayana': 'Uttarayana (Northward)',
  'pc.ayana.Dakshinayana': 'Dakshinayana (Southward)',

  // Short Days of Week
  'pc.Sun': 'Sun',
  'pc.Mon': 'Mon',
  'pc.Tue': 'Tue',
  'pc.Wed': 'Wed',
  'pc.Thu': 'Thu',
  'pc.Fri': 'Fri',
  'pc.Sat': 'Sat',

  // Festivals
  'pc.fest.hanuman_jayanti.n': 'Hanuman Jayanti',
  'pc.fest.hanuman_jayanti.d': 'Marks the birth of Lord Hanuman, celebrating strength and devotion.',
  'pc.fest.akshaya_tritiya.n': 'Akshaya Tritiya',
  'pc.fest.akshaya_tritiya.d': 'An highly auspicious day for new beginnings, investments, and wealth.',
  'pc.fest.buddha_purnima.n': 'Buddha Purnima',
  'pc.fest.buddha_purnima.d': 'Celebrates the birth, enlightenment, and death of Gautama Buddha.',
  'pc.fest.vat_savitri.n': 'Vat Savitri Vrat',
  'pc.fest.vat_savitri.d': 'A fast observed by married women for the well-being of their husbands.',
  'pc.fest.nirjala_ekadashi.n': 'Nirjala Ekadashi',
  'pc.fest.nirjala_ekadashi.d': 'A strict, waterless fast dedicated to Lord Vishnu.',
  'pc.fest.rath_yatra.n': 'Jagannath Rath Yatra',
  'pc.fest.rath_yatra.d': 'The grand chariot festival honoring Lord Jagannath.',
  'pc.fest.guru_purnima.n': 'Guru Purnima',
  'pc.fest.guru_purnima.d': 'A day of reverence to honor spiritual and academic teachers.',
  'pc.fest.hariyali_teej.n': 'Hariyali Teej',
  'pc.fest.hariyali_teej.d': 'Welcomes the monsoon season; dedicated to Lord Shiva and Goddess Parvati.',
  'pc.fest.nag_panchami.n': 'Nag Panchami',
  'pc.fest.nag_panchami.d': 'The traditional worship of snakes and serpent deities.',
  'pc.fest.raksha_bandhan.n': 'Raksha Bandhan',
  'pc.fest.raksha_bandhan.d': 'Celebrates the bond of protection and love between brothers and sisters.',
  'pc.fest.ganesh_chaturthi.n': 'Ganesh Chaturthi',
  'pc.fest.ganesh_chaturthi.d': 'A 10-day festival marking the arrival of Lord Ganesha to earth.',
  'pc.fest.anant_chaturdashi.n': 'Anant Chaturdashi',
  'pc.fest.anant_chaturdashi.d': 'The final day of the Ganesha festival (Visarjan).',
  'pc.fest.janmashtami.n': 'Krishna Janmashtami',
  'pc.fest.janmashtami.d': 'Celebrates the birth of Lord Krishna.',
  'pc.fest.navratri.n': 'Sharad Navratri',
  'pc.fest.navratri.d': 'The start of the 9-day worship of Goddess Durga.',
  'pc.fest.durga_ashtami.n': 'Durga Ashtami',
  'pc.fest.durga_ashtami.d': 'The eighth, and often most significant, day of the Navratri festival.',
  'pc.fest.dussehra.n': 'Dussehra',
  'pc.fest.dussehra.d': 'Marks the victory of good over evil.',
  'pc.fest.karwa_chauth.n': 'Karwa Chauth',
  'pc.fest.karwa_chauth.d': 'A fast kept by married women for their husbands longevity.',
  'pc.fest.dhanteras.n': 'Dhanteras',
  'pc.fest.dhanteras.d': 'Marks the beginning of the Diwali festivities and the worship of wealth.',
  'pc.fest.narak_chaturdashi.n': 'Narak Chaturdashi',
  'pc.fest.narak_chaturdashi.d': 'Also known as Chhoti Diwali; celebrates the defeat of Narakasura.',
  'pc.fest.diwali.n': 'Diwali',
  'pc.fest.diwali.d': 'The grand festival of lights, honoring Goddess Lakshmi and Lord Ganesha.',
  'pc.fest.govardhan.n': 'Govardhan Puja',
  'pc.fest.govardhan.d': 'Honors Lord Krishnas defeat of Indra by lifting Govardhan Hill.',
  'pc.fest.bhai_dooj.n': 'Bhai Dooj',
  'pc.fest.bhai_dooj.d': 'Celebrates the lifelong bond and affection between brothers and sisters.',
  'pc.fest.chhath.n': 'Chhath Puja',
  'pc.fest.chhath.d': 'An ancient festival dedicated to the Sun God (Surya) and Usha.',
  'pc.fest.dev_deepawali.n': 'Dev Deepawali',
  'pc.fest.dev_deepawali.d': 'The Diwali of the Gods in Varanasi.',
  'pc.fest.vasant_panchami.n': 'Vasant Panchami',
  'pc.fest.vasant_panchami.d': 'Dedicated to Goddess Saraswati; officially marks the preparation for spring.',
  'pc.fest.shivaratri.n': 'Maha Shivaratri',
  'pc.fest.shivaratri.d': 'The Great Night of Shiva, honoring Lord Shivas cosmic dance.',
  'pc.fest.holi.n': 'Holi',
  'pc.fest.holi.d': 'The vibrant festival of colors celebrating love and the onset of spring.',
  'pc.fest.baisakhi.n': 'Baisakhi / Vishu',
  'pc.fest.baisakhi.d': 'A harvest festival and solar New Year celebrated in various regions.',
  'pc.fest.makar_sankranti.n': 'Makar Sankranti / Pongal',
  'pc.fest.makar_sankranti.d': 'A major harvest festival marking the suns transit into the Makara zodiac.'
};

const LANGS = ['hi', 'te', 'ta', 'kn', 'mr', 'gu', 'bn', 'ml'];

async function run() {
  const file = './src/i18n/dashboardTranslations.json';
  let db = {};
  if (fs.existsSync(file)) {
    db = JSON.parse(fs.readFileSync(file, 'utf8'));
  }

  // Pre-seed English so we don't translate into English, but we still inject it!
  if (!db['en']) db['en'] = {};
  for (const [key, text] of Object.entries(sourceDict)) {
    db['en'][key] = text;
  }

  for (const lang of LANGS) {
    if (!db[lang]) db[lang] = {};
    console.log(`Translating to ${lang}...`);
    
    // Process each key sequentially
    for (const [key, text] of Object.entries(sourceDict)) {
      if (!db[lang][key]) { 
        try {
          const res = await translate(text, { to: lang });
          db[lang][key] = res.text;
          console.log(`  [${lang}] ${key} -> ${res.text}`);
          // Add a tiny delay to not overload standard ping API
          await new Promise(r => setTimeout(r, 100));
        } catch(e) {
          console.error(`  Failed on ${key}: ${e.message}`);
        }
      }
    }
  }

  fs.writeFileSync(file, JSON.stringify(db, null, 2));
  console.log('Successfully wrote to dashboardTranslations.json!');
}

run();
