import translate from '@iamtraction/google-translate';
import fs from 'fs';

// All Dictionaries
const dictPanchang = {
  'pc.title': 'Personalized Drik Panchang',
  'pc.subtitle': "Track daily Tithi, major festivals, living birthdays, and your departed loved ones' Varshika Tithi automatically.",
  'pc.ancestors': 'Ancestors & Memorials',
  'pc.Sun': 'Sun', 'pc.Mon': 'Mon', 'pc.Tue': 'Tue', 'pc.Wed': 'Wed', 'pc.Thu': 'Thu', 'pc.Fri': 'Fri', 'pc.Sat': 'Sat',
  'pc.defaultLocation': 'Using Default Location (Delhi). Enable GPS for local timings.',
  'pc.sec1': 'The Five Core Elements',
  'pc.sec2': 'Time & Planetary Positions',
  'pc.sec3': 'Calendar Identifiers',
  'pc.sec4': 'Auspicious Timings',
  'pc.sec5': 'Inauspicious Timings',
  'pc.sec6': 'Daily Guidelines & Festivals',
  'pc.vaar': 'Vaar:', 'pc.tithi': 'Tithi:', 'pc.nakshatra': 'Nakshatra:', 'pc.yoga': 'Yoga:', 'pc.karanas': 'Karanas:',
  'pc.sunrise': 'Sunrise:', 'pc.sunset': 'Sunset:', 'pc.sunSign': 'Sun Sign:', 'pc.moonSign': 'Moon Sign:',
  'pc.samvat': 'Samvat:', 'pc.masa': 'Masa:', 'pc.paksha': 'Paksha:', 'pc.ritu': 'Ritu:', 'pc.ayana': 'Ayana:',
  'pc.brahma': 'Brahma Muhurat:', 'pc.abhijit': 'Abhijit Muhurat:', 'pc.amrit': 'Amrit Kaal:', 'pc.amritDesc': 'Approx 1/8th of day active',
  'pc.vijay': 'Vijay Muhurat:', 'pc.rahu': 'Rahu Kaal:', 'pc.yama': 'Yamaganda:', 'pc.guli': 'Gulikai Kaal:',
  'pc.noEvents': 'No major festivals or personalized events today.',
  'pc.purnima': 'Purnima', 'pc.purnimaDesc': 'The auspicious day of the full moon.',
  'pc.amavasya': 'Amavasya', 'pc.amavasyaDesc': 'The new moon day, suitable for honoring ancestors.',
  'pc.ekadashi': 'Ekadashi', 'pc.ekadashiDesc': 'Auspicious day for fasting and spiritual progress.',
  'pc.sankashti': 'Sankashti Chaturthi', 'pc.sankashtiDesc': 'Auspicious day dedicated to Lord Ganesha for obstacle removal.',
  'pc.livingBirthday': 'Living Birthday (Tithi)', 'pc.varshikaTithi': 'Varshika Tithi (Memorial)',
  'pc.paksha.Shukla': 'Shukla Paksha (Waxing)', 'pc.paksha.Krishna': 'Krishna Paksha (Waning)',
  'pc.ritu.Vasant': 'Vasant (Spring)', 'pc.ritu.Grishma': 'Grishma (Summer)', 'pc.ritu.Varsha': 'Varsha (Monsoon)',
  'pc.ritu.Sharad': 'Sharad (Autumn)', 'pc.ritu.Hemanta': 'Hemanta (Pre-Winter)', 'pc.ritu.Shishira': 'Shishira (Winter)',
  'pc.ayana.Uttarayana': 'Uttarayana (Northward)', 'pc.ayana.Dakshinayana': 'Dakshinayana (Southward)',
  'pc.fest.makar_sankranti.n': 'Makar Sankranti', 'pc.fest.makar_sankranti.d': 'Sun transits to Capricorn, marking the end of winter.',
  'pc.fest.pongal.n': 'Pongal', 'pc.fest.pongal.d': 'South Indian harvest festival.',
  'pc.fest.vasant_panchami.n': 'Vasant Panchami', 'pc.fest.vasant_panchami.d': 'Dedicated to Goddess Saraswati, marking the arrival of spring.',
  'pc.fest.maha_shivaratri.n': 'Maha Shivaratri', 'pc.fest.maha_shivaratri.d': 'The great night of Lord Shiva.',
  'pc.fest.holi.n': 'Holi', 'pc.fest.holi.d': 'Festival of colors and spring.',
  'pc.fest.ugadi.n': 'Ugadi / Gudi Padwa', 'pc.fest.ugadi.d': 'The traditional New Year in many parts of India.',
  'pc.fest.rama_navami.n': 'Rama Navami', 'pc.fest.rama_navami.d': 'Birth anniversary of Lord Rama.',
  'pc.fest.hanuman_jayanti.n': 'Hanuman Jayanti', 'pc.fest.hanuman_jayanti.d': 'Marks the birth of Lord Hanuman, celebrating strength and devotion.',
  'pc.fest.akshaya_tritiya.n': 'Akshaya Tritiya', 'pc.fest.akshaya_tritiya.d': 'Highly auspicious day for new beginnings, investments, and wealth.',
  'pc.fest.buddha_purnima.n': 'Buddha Purnima', 'pc.fest.buddha_purnima.d': 'Calculates the birth, enlightenment, and death of Gautama Buddha.',
  'pc.fest.vat_savitri.n': 'Vat Savitri Vrat', 'pc.fest.vat_savitri.d': 'A fast observed by married women for the well-being of their husbands.',
  'pc.fest.nirjala_ekadashi.n': 'Nirjala Ekadashi', 'pc.fest.nirjala_ekadashi.d': 'The strictest Ekadashi, observed without food and water.',
  'pc.fest.rath_yatra.n': 'Rath Yatra', 'pc.fest.rath_yatra.d': 'The grand chariot festival of Lord Jagannath.',
  'pc.fest.guru_purnima.n': 'Guru Purnima', 'pc.fest.guru_purnima.d': 'A day to honor spiritual and academic gurus.',
  'pc.fest.nag_panchami.n': 'Nag Panchami', 'pc.fest.nag_panchami.d': 'Traditional worship of serpents.',
  'pc.fest.raksha_bandhan.n': 'Raksha Bandhan', 'pc.fest.raksha_bandhan.d': 'Celebrates the bond between brothers and sisters.',
  'pc.fest.krishna_janmashtami.n': 'Krishna Janmashtami', 'pc.fest.krishna_janmashtami.d': 'Birth anniversary of Lord Krishna.',
  'pc.fest.ganesh_chaturthi.n': 'Ganesh Chaturthi', 'pc.fest.ganesh_chaturthi.d': 'Ten-day festival celebrating the arrival of Lord Ganesha.',
  'pc.fest.onam.n': 'Onam', 'pc.fest.onam.d': 'Harvest festival of Kerala.',
  'pc.fest.pitru_paksha.n': 'Pitru Paksha Begins', 'pc.fest.pitru_paksha.d': 'Fortnight dedicated to honoring ancestors.',
  'pc.fest.sarva_pitru_amavasya.n': 'Sarva Pitru Amavasya', 'pc.fest.sarva_pitru_amavasya.d': 'Final day of Pitru Paksha to honor all ancestors.',
  'pc.fest.navaratri_begins.n': 'Navaratri Begins', 'pc.fest.navaratri_begins.d': 'Nine nights dedicated to the Divine Mother.',
  'pc.fest.durga_ashtami.n': 'Durga Ashtami', 'pc.fest.durga_ashtami.d': 'The eighth day of Navaratri, honoring Goddess Durga.',
  'pc.fest.maha_navami.n': 'Maha Navami', 'pc.fest.maha_navami.d': 'The ninth day of Navaratri.',
  'pc.fest.vijayadashami.n': 'Vijayadashami / Dussehra', 'pc.fest.vijayadashami.d': 'Celebrates the victory of good over evil.',
  'pc.fest.karwa_ चौथ.n': 'Karwa Chauth', 'pc.fest.karwa_ चौथ.d': 'Fast observed by married women for the longevity of their husbands.',
  'pc.fest.dhanteras.n': 'Dhanteras', 'pc.fest.dhanteras.d': 'Initiates the Diwali festivities; auspicious for wealth and health.',
  'pc.fest.diwali.n': 'Diwali / Deepavali', 'pc.fest.diwali.d': 'The festival of lights.',
  'pc.fest.bhai_dooj.n': 'Bhai Dooj', 'pc.fest.bhai_dooj.d': 'Celebrates the sibling bond.',
  'pc.fest.champa_shashthi.n': 'Champa Shashthi', 'pc.fest.champa_shashthi.d': 'Dedicated to Lord Khandoba.',
  'pc.fest.gita_jayanti.n': 'Gita Jayanti', 'pc.fest.gita_jayanti.d': 'The day the Bhagavad Gita was revealed to Arjuna.',
  'pc.fest.duttatreya_jayanti.n': 'Dattatreya Jayanti', 'pc.fest.duttatreya_jayanti.d': 'Birth of Lord Dattatreya (Brahma, Vishnu, Shiva combined).',
  'pc.fest.vow_baisakhi.n': 'Baisakhi / Vishu / Puthandu / Pohela Boishakh', 'pc.fest.vow_baisakhi.d': 'Sun transits to Aries, marking the regional Solar New Year.',

  // AUTO-INJECTED 90 FESTIVALS
  'pc.fest.sheetala_ashtami.n': 'Sheetala Ashtami',
  'pc.fest.sheetala_ashtami.d': 'Observance of Sheetala Ashtami.',
  'pc.fest.papmochani_ekadashi.n': 'Papmochani Ekadashi',
  'pc.fest.papmochani_ekadashi.d': 'Observance of Papmochani Ekadashi.',
  'pc.fest.gudi_padwa_ugadi.n': 'Gudi Padwa / Ugadi',
  'pc.fest.gudi_padwa_ugadi.d': 'Observance of Gudi Padwa / Ugadi.',
  'pc.fest.cheti_chand.n': 'Cheti Chand',
  'pc.fest.cheti_chand.d': 'Observance of Cheti Chand.',
  'pc.fest.gangaur.n': 'Gangaur',
  'pc.fest.gangaur.d': 'Observance of Gangaur.',
  'pc.fest.matsya_jayanti.n': 'Matsya Jayanti',
  'pc.fest.matsya_jayanti.d': 'Observance of Matsya Jayanti.',
  'pc.fest.yamuna_chhath.n': 'Yamuna Chhath',
  'pc.fest.yamuna_chhath.d': 'Observance of Yamuna Chhath.',
  'pc.fest.rama_navami.n': 'Rama Navami',
  'pc.fest.rama_navami.d': 'Observance of Rama Navami.',
  'pc.fest.kamada_ekadashi.n': 'Kamada Ekadashi',
  'pc.fest.kamada_ekadashi.d': 'Observance of Kamada Ekadashi.',
  'pc.fest.hanuman_jayanti.n': 'Hanuman Jayanti',
  'pc.fest.hanuman_jayanti.d': 'Observance of Hanuman Jayanti.',
  'pc.fest.varuthini_ekadashi.n': 'Varuthini Ekadashi',
  'pc.fest.varuthini_ekadashi.d': 'Observance of Varuthini Ekadashi.',
  'pc.fest.parashurama_jayanti.n': 'Parashurama Jayanti',
  'pc.fest.parashurama_jayanti.d': 'Observance of Parashurama Jayanti.',
  'pc.fest.akshaya_tritiya.n': 'Akshaya Tritiya',
  'pc.fest.akshaya_tritiya.d': 'Observance of Akshaya Tritiya.',
  'pc.fest.shankaracharya_jayanti.n': 'Shankaracharya Jayanti',
  'pc.fest.shankaracharya_jayanti.d': 'Observance of Shankaracharya Jayanti.',
  'pc.fest.ganga_saptami.n': 'Ganga Saptami',
  'pc.fest.ganga_saptami.d': 'Observance of Ganga Saptami.',
  'pc.fest.sita_navami.n': 'Sita Navami',
  'pc.fest.sita_navami.d': 'Observance of Sita Navami.',
  'pc.fest.mohini_ekadashi.n': 'Mohini Ekadashi',
  'pc.fest.mohini_ekadashi.d': 'Observance of Mohini Ekadashi.',
  'pc.fest.narasimha_jayanti.n': 'Narasimha Jayanti',
  'pc.fest.narasimha_jayanti.d': 'Observance of Narasimha Jayanti.',
  'pc.fest.buddha_purnima.n': 'Buddha Purnima',
  'pc.fest.buddha_purnima.d': 'Observance of Buddha Purnima.',
  'pc.fest.narada_jayanti.n': 'Narada Jayanti',
  'pc.fest.narada_jayanti.d': 'Observance of Narada Jayanti.',
  'pc.fest.apara_ekadashi.n': 'Apara Ekadashi',
  'pc.fest.apara_ekadashi.d': 'Observance of Apara Ekadashi.',
  'pc.fest.shani_jayanti.n': 'Shani Jayanti',
  'pc.fest.shani_jayanti.d': 'Observance of Shani Jayanti.',
  'pc.fest.vat_savitri_vrat.n': 'Vat Savitri Vrat',
  'pc.fest.vat_savitri_vrat.d': 'Observance of Vat Savitri Vrat.',
  'pc.fest.ganga_dussehra.n': 'Ganga Dussehra',
  'pc.fest.ganga_dussehra.d': 'Observance of Ganga Dussehra.',
  'pc.fest.nirjala_ekadashi.n': 'Nirjala Ekadashi',
  'pc.fest.nirjala_ekadashi.d': 'Observance of Nirjala Ekadashi.',
  'pc.fest.vat_purnima_vrat.n': 'Vat Purnima Vrat',
  'pc.fest.vat_purnima_vrat.d': 'Observance of Vat Purnima Vrat.',
  'pc.fest.yogini_ekadashi.n': 'Yogini Ekadashi',
  'pc.fest.yogini_ekadashi.d': 'Observance of Yogini Ekadashi.',
  'pc.fest.jagannath_rath_yatra.n': 'Jagannath Rath Yatra',
  'pc.fest.jagannath_rath_yatra.d': 'Observance of Jagannath Rath Yatra.',
  'pc.fest.devshayani_ekadashi.n': 'Devshayani Ekadashi',
  'pc.fest.devshayani_ekadashi.d': 'Observance of Devshayani Ekadashi.',
  'pc.fest.guru_purnima.n': 'Guru Purnima',
  'pc.fest.guru_purnima.d': 'Observance of Guru Purnima.',
  'pc.fest.kamika_ekadashi.n': 'Kamika Ekadashi',
  'pc.fest.kamika_ekadashi.d': 'Observance of Kamika Ekadashi.',
  'pc.fest.hariyali_teej.n': 'Hariyali Teej',
  'pc.fest.hariyali_teej.d': 'Observance of Hariyali Teej.',
  'pc.fest.nag_panchami.n': 'Nag Panchami',
  'pc.fest.nag_panchami.d': 'Observance of Nag Panchami.',
  'pc.fest.kalki_jayanti.n': 'Kalki Jayanti',
  'pc.fest.kalki_jayanti.d': 'Observance of Kalki Jayanti.',
  'pc.fest.tulsidas_jayanti.n': 'Tulsidas Jayanti',
  'pc.fest.tulsidas_jayanti.d': 'Observance of Tulsidas Jayanti.',
  'pc.fest.shravana_putrada_ekadashi.n': 'Shravana Putrada Ekadashi',
  'pc.fest.shravana_putrada_ekadashi.d': 'Observance of Shravana Putrada Ekadashi.',
  'pc.fest.raksha_bandhan.n': 'Raksha Bandhan',
  'pc.fest.raksha_bandhan.d': 'Observance of Raksha Bandhan.',
  'pc.fest.gayathri_jayanti.n': 'Gayathri Jayanti',
  'pc.fest.gayathri_jayanti.d': 'Observance of Gayathri Jayanti.',
  'pc.fest.kajari_teej.n': 'Kajari Teej',
  'pc.fest.kajari_teej.d': 'Observance of Kajari Teej.',
  'pc.fest.bahula_chaturthi.n': 'Bahula Chaturthi',
  'pc.fest.bahula_chaturthi.d': 'Observance of Bahula Chaturthi.',
  'pc.fest.balarama_jayanti.n': 'Balarama Jayanti',
  'pc.fest.balarama_jayanti.d': 'Observance of Balarama Jayanti.',
  'pc.fest.krishna_janmashtami.n': 'Krishna Janmashtami',
  'pc.fest.krishna_janmashtami.d': 'Observance of Krishna Janmashtami.',
  'pc.fest.aja_ekadashi.n': 'Aja Ekadashi',
  'pc.fest.aja_ekadashi.d': 'Observance of Aja Ekadashi.',
  'pc.fest.hartalika_teej.n': 'Hartalika Teej',
  'pc.fest.hartalika_teej.d': 'Observance of Hartalika Teej.',
  'pc.fest.ganesh_chaturthi.n': 'Ganesh Chaturthi',
  'pc.fest.ganesh_chaturthi.d': 'Observance of Ganesh Chaturthi.',
  'pc.fest.rishi_panchami.n': 'Rishi Panchami',
  'pc.fest.rishi_panchami.d': 'Observance of Rishi Panchami.',
  'pc.fest.radha_ashtami.n': 'Radha Ashtami',
  'pc.fest.radha_ashtami.d': 'Observance of Radha Ashtami.',
  'pc.fest.parsva_ekadashi.n': 'Parsva Ekadashi',
  'pc.fest.parsva_ekadashi.d': 'Observance of Parsva Ekadashi.',
  'pc.fest.vamana_jayanti.n': 'Vamana Jayanti',
  'pc.fest.vamana_jayanti.d': 'Observance of Vamana Jayanti.',
  'pc.fest.anant_chaturdashi.n': 'Anant Chaturdashi',
  'pc.fest.anant_chaturdashi.d': 'Observance of Anant Chaturdashi.',
  'pc.fest.pitru_paksha_begins.n': 'Pitru Paksha Begins',
  'pc.fest.pitru_paksha_begins.d': 'Observance of Pitru Paksha Begins.',
  'pc.fest.indira_ekadashi.n': 'Indira Ekadashi',
  'pc.fest.indira_ekadashi.d': 'Observance of Indira Ekadashi.',
  'pc.fest.mahalaya_amavasya.n': 'Mahalaya Amavasya',
  'pc.fest.mahalaya_amavasya.d': 'Observance of Mahalaya Amavasya.',
  'pc.fest.sharad_navratri_begins.n': 'Sharad Navratri Begins',
  'pc.fest.sharad_navratri_begins.d': 'Observance of Sharad Navratri Begins.',
  'pc.fest.lalita_panchami.n': 'Lalita Panchami',
  'pc.fest.lalita_panchami.d': 'Observance of Lalita Panchami.',
  'pc.fest.saraswati_avahan.n': 'Saraswati Avahan',
  'pc.fest.saraswati_avahan.d': 'Observance of Saraswati Avahan.',
  'pc.fest.durga_ashtami.n': 'Durga Ashtami',
  'pc.fest.durga_ashtami.d': 'Observance of Durga Ashtami.',
  'pc.fest.maha_navami.n': 'Maha Navami',
  'pc.fest.maha_navami.d': 'Observance of Maha Navami.',
  'pc.fest.dussehra_vijayadashami.n': 'Dussehra (Vijayadashami)',
  'pc.fest.dussehra_vijayadashami.d': 'Observance of Dussehra (Vijayadashami).',
  'pc.fest.papankusha_ekadashi.n': 'Papankusha Ekadashi',
  'pc.fest.papankusha_ekadashi.d': 'Observance of Papankusha Ekadashi.',
  'pc.fest.sharad_purnima.n': 'Sharad Purnima',
  'pc.fest.sharad_purnima.d': 'Observance of Sharad Purnima.',
  'pc.fest.valmiki_jayanti.n': 'Valmiki Jayanti',
  'pc.fest.valmiki_jayanti.d': 'Observance of Valmiki Jayanti.',
  'pc.fest.karwa_chauth.n': 'Karwa Chauth',
  'pc.fest.karwa_chauth.d': 'Observance of Karwa Chauth.',
  'pc.fest.ahoi_ashtami.n': 'Ahoi Ashtami',
  'pc.fest.ahoi_ashtami.d': 'Observance of Ahoi Ashtami.',
  'pc.fest.rama_ekadashi.n': 'Rama Ekadashi',
  'pc.fest.rama_ekadashi.d': 'Observance of Rama Ekadashi.',
  'pc.fest.dhanteras.n': 'Dhanteras',
  'pc.fest.dhanteras.d': 'Observance of Dhanteras.',
  'pc.fest.narak_chaturdashi.n': 'Narak Chaturdashi',
  'pc.fest.narak_chaturdashi.d': 'Observance of Narak Chaturdashi.',
  'pc.fest.diwali_deepavali.n': 'Diwali (Deepavali)',
  'pc.fest.diwali_deepavali.d': 'Observance of Diwali (Deepavali).',
  'pc.fest.govardhan_puja.n': 'Govardhan Puja',
  'pc.fest.govardhan_puja.d': 'Observance of Govardhan Puja.',
  'pc.fest.bhai_dooj.n': 'Bhai Dooj',
  'pc.fest.bhai_dooj.d': 'Observance of Bhai Dooj.',
  'pc.fest.chhath_puja.n': 'Chhath Puja',
  'pc.fest.chhath_puja.d': 'Observance of Chhath Puja.',
  'pc.fest.gopashtami.n': 'Gopashtami',
  'pc.fest.gopashtami.d': 'Observance of Gopashtami.',
  'pc.fest.akshaya_navami.n': 'Akshaya Navami',
  'pc.fest.akshaya_navami.d': 'Observance of Akshaya Navami.',
  'pc.fest.devutthana_ekadashi.n': 'Devutthana Ekadashi',
  'pc.fest.devutthana_ekadashi.d': 'Observance of Devutthana Ekadashi.',
  'pc.fest.tulsi_vivah.n': 'Tulsi Vivah',
  'pc.fest.tulsi_vivah.d': 'Observance of Tulsi Vivah.',
  'pc.fest.dev_deepawali.n': 'Dev Deepawali',
  'pc.fest.dev_deepawali.d': 'Observance of Dev Deepawali.',
  'pc.fest.utpanna_ekadashi.n': 'Utpanna Ekadashi',
  'pc.fest.utpanna_ekadashi.d': 'Observance of Utpanna Ekadashi.',
  'pc.fest.vivah_panchami.n': 'Vivah Panchami',
  'pc.fest.vivah_panchami.d': 'Observance of Vivah Panchami.',
  'pc.fest.gita_jayanti.n': 'Gita Jayanti',
  'pc.fest.gita_jayanti.d': 'Observance of Gita Jayanti.',
  'pc.fest.mokshada_ekadashi.n': 'Mokshada Ekadashi',
  'pc.fest.mokshada_ekadashi.d': 'Observance of Mokshada Ekadashi.',
  'pc.fest.dattatreya_jayanti.n': 'Dattatreya Jayanti',
  'pc.fest.dattatreya_jayanti.d': 'Observance of Dattatreya Jayanti.',
  'pc.fest.saphala_ekadashi.n': 'Saphala Ekadashi',
  'pc.fest.saphala_ekadashi.d': 'Observance of Saphala Ekadashi.',
  'pc.fest.pausha_putrada_ekadashi.n': 'Pausha Putrada Ekadashi',
  'pc.fest.pausha_putrada_ekadashi.d': 'Observance of Pausha Putrada Ekadashi.',
  'pc.fest.shattila_ekadashi.n': 'Shattila Ekadashi',
  'pc.fest.shattila_ekadashi.d': 'Observance of Shattila Ekadashi.',
  'pc.fest.mauni_amavasya.n': 'Mauni Amavasya',
  'pc.fest.mauni_amavasya.d': 'Observance of Mauni Amavasya.',
  'pc.fest.vasant_panchami.n': 'Vasant Panchami',
  'pc.fest.vasant_panchami.d': 'Observance of Vasant Panchami.',
  'pc.fest.ratha_saptami.n': 'Ratha Saptami',
  'pc.fest.ratha_saptami.d': 'Observance of Ratha Saptami.',
  'pc.fest.bhishma_ashtami.n': 'Bhishma Ashtami',
  'pc.fest.bhishma_ashtami.d': 'Observance of Bhishma Ashtami.',
  'pc.fest.maha_shivaratri.n': 'Maha Shivaratri',
  'pc.fest.maha_shivaratri.d': 'Observance of Maha Shivaratri.',
  'pc.fest.holika_dahan_holi.n': 'Holika Dahan / Holi',
  'pc.fest.holika_dahan_holi.d': 'Observance of Holika Dahan / Holi.',
};

const dictMemorials = {
  'pc.mem.title': 'Ancestors & Memorials',
  'pc.mem.desc': 'Track the annual ceremonial dates (Varshika Tithi) for departed souls. The Panchang calendar will automatically identify these sacred dates based on the precise Lunar Month and Tithi of their passing.',
  'pc.mem.loading': 'Loading...',
  'pc.mem.noDates': 'No memorial dates added.',
  'pc.mem.remove': 'Remove',
  'pc.mem.addBtn': '+ Add Departed Soul',
  'pc.mem.maxLimit': 'Maximum limit of 5 entries reached.',
  'pc.mem.newEntry': 'New Memorial Entry',
  'pc.mem.nameLbl': 'Name',
  'pc.mem.namePh': 'Name of the departed...',
  'pc.mem.dateLbl': 'Date of Passing',
  'pc.mem.timeLbl': 'Time (Optional)',
  'pc.mem.placeLbl': 'Place (Optional)',
  'pc.mem.placePh': 'Location of passing...',
  'pc.mem.cancel': 'Cancel',
  'pc.mem.saveEntry': 'Save Entry',
  'pc.mem.discard': 'Discard Changes',
  'pc.mem.saveMem': 'Save Memorials',
  'pc.mem.saving': 'Saving...',
};

const dictValues = {'pc.openCal': 'Open Lunar Calendar ➔'};
const SAMVATSARAS = ["Prabhava", "Vibhava", "Shukla", "Pramoda", "Prajapathi", "Angirasa", "Shrimukha", "Bhava", "Yuva", "Dhatri", "Ishvara", "Bahudhanya", "Pramathi", "Vikrama", "Vrushapraja", "Chitrabhanu", "Subhanu", "Tarana", "Parthiva", "Vyaya", "Sarvajit", "Sarvadhari", "Virodhi", "Vikruti", "Khara", "Nandana", "Vijaya", "Jaya", "Manmatha", "Durmukha", "Hevilambi", "Vilambi", "Vikari", "Sharvari", "Plava", "Shubhakrut", "Shobhakrut", "Krodhi", "Vishvavasu", "Parabhava", "Plavanga", "Kilaka", "Saumya", "Sadharana", "Virodhikrut", "Paridhavi", "Pramadi", "Ananda", "Rakshasa", "Nala", "Pingala", "Kalayukti", "Siddharthi", "Raudra", "Durmati", "Dundubhi", "Rudhirodgari", "Raktaksha", "Krodhana", "Akshaya"];
const NAKSHATRAS = ["Ashvini", "Bharani", "Krittika", "Rohini", "Mrigashirsha", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"];
const YOGAS = ["Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma", "Dhriti", "Shula", "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyan", "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"];
const RASHIS = ["Aries (Mesha)", "Taurus (Vrishabha)", "Gemini (Mithuna)", "Cancer (Karka)", "Leo (Simha)", "Virgo (Kanya)", "Libra (Tula)", "Scorpio (Vrishchika)", "Sagittarius (Dhanu)", "Capricorn (Makara)", "Aquarius (Kumbha)", "Pisces (Meena)"];
const MASAS = ["Chaitra", "Vaishakha", "Jyeshtha", "Ashadha", "Shravana", "Bhadrapada", "Ashvina", "Kartika", "Margashirsha", "Pausha", "Magha", "Phalguna"];
const KARANA_LIST = ["Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti", "Kintughna", "Shakuni", "Chatushpada", "Naga"];
SAMVATSARAS.forEach(s => dictValues[`pc.samv.${s}`] = s);
NAKSHATRAS.forEach(s => dictValues[`pc.nak.${s}`] = s);
YOGAS.forEach(s => dictValues[`pc.yog.${s}`] = s);
RASHIS.forEach(s => dictValues[`pc.rsh.${s}`] = s);
MASAS.forEach(s => dictValues[`pc.mas.${s}`] = s);
KARANA_LIST.forEach(s => dictValues[`pc.kar.${s}`] = s);

const MASTER_DICT = { ...dictPanchang, ...dictMemorials, ...dictValues };
const LANGS = ['hi', 'kn', 'te', 'ta', 'mr', 'gu', 'bn', 'ml'];

async function run() {
  const file = './src/i18n/dashboardTranslations.json';
  let db = {};
  if (fs.existsSync(file)) {
    db = JSON.parse(fs.readFileSync(file, 'utf8'));
  }

  // FORCE English bindings for all strings in master tree to ensure no fallback dropouts
  if (!db['en']) db['en'] = {};
  for (const [key, text] of Object.entries(MASTER_DICT)) {
    db['en'][key] = text;
  }

  for (const lang of LANGS) {
    if (!db[lang]) db[lang] = {};
    console.log(`Analyzing block translations for ${lang}...`);
    
    const entries = Object.entries(MASTER_DICT);
    for (let i = 0; i < entries.length; i++) {
        const [key, text] = entries[i];
      if (!db[lang][key]) { 
        try {
          const res = await translate(text, { to: lang });
          db[lang][key] = res.text;
          console.log(`  [${lang}] ${key} -> ${res.text}`);
          await new Promise(r => setTimeout(r, 80));
        } catch(e) {
          console.error(`  Failed on ${key}: ${e.message}`);
        }
      }
    }
    // Write checkpoints so even if manually killed, we save state.
    fs.writeFileSync(file, JSON.stringify(db, null, 2));
  }

  fs.writeFileSync(file, JSON.stringify(db, null, 2));
  console.log('Successfully fully healed and synced dashboardTranslations.json!');
}

run();
