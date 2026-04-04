import { initializeAstroEngine } from './engine/swissephLoader.js';
import { computeKundali } from './engine/vedic.js';
import { computeDailyPanchang } from './engine/PanchangCalculator.js';
import { NAKSHATRAS } from '../src/engine/constants.js';
import { RASHI_NAMES, getGrahaName, getRashiName } from '../src/i18n/astroTerms.js';
import { t } from '../src/i18n/uiStrings.js';
import { L_NAKS } from '../src/i18n/astroMappings.js';

export const maxDuration = 30; // seconds

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const query = req.query;

    console.log("Initializing Swiss Ephemeris engine...");
    await initializeAstroEngine();

    // Default to Bangalore Sept 3 1974 if not provided
    const params = {
      year: parseInt(query.year) || 1974,
      month: parseInt(query.month) || 9,
      day: parseInt(query.day) || 3,
      hour: parseInt(query.hour) || 18,
      minute: parseInt(query.minute) || 30,
      lat: parseFloat(query.lat) || 12.9716,
      lng: parseFloat(query.lng) || 77.5946,
      utcOffset: parseFloat(query.utcOffset) || 5.5
    };
    
    const d = new Date(params.year, params.month - 1, params.day, params.hour, params.minute);
    const lang = query.lang || 'en';
    
    // Get Tithi & Vara
    const panchang = computeDailyPanchang(d, params.lat, params.lng);
    const kundali = computeKundali(params);

    // Translate Planets and Lagna Response
    kundali.planets.forEach(p => {
        p.name = getGrahaName(p.key, lang) || p.name;
    });
    if(kundali.lagna && kundali.lagna.rashi != null) {
        kundali.lagna.rashiName = getRashiName(kundali.lagna.rashi, lang);
    }
    
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayOfWeek = daysOfWeek[d.getDay()];

    const localizedRashis = RASHI_NAMES[lang] || RASHI_NAMES['en'];
    
    // Construct uiDict mapping for the front-end string replacement
    const TT_STRINGS = {
        en: { tt: "Time Travel", yr: "YEAR", mo: "MONTH", da: "DAY", ti: "TIME", bt: "Birth Time", no: "Now" },
        hi: { tt: "समय यात्रा", yr: "वर्ष", mo: "मास", da: "दिन", ti: "समय", bt: "जन्म समय", no: "अभी" },
        kn: { tt: "ಸಮಯ ಪ್ರಯಾಣ", yr: "ವರ್ಷ", mo: "ತಿಂಗಳು", da: "ದಿನ", ti: "ಸಮಯ", bt: "ಜನನ ಸಮಯ", no: "ಈಗ" },
        te: { tt: "సమయ ప్రయాణం", yr: "సంవత్సరం", mo: "నెల", da: "రోజు", ti: "సమయం", bt: "జనన సమయం", no: "ఇప్పుడు" },
        ta: { tt: "கால பயணம்", yr: "ஆண்டு", mo: "மாதம்", da: "நாள்", ti: "நேரம்", bt: "பிறந்த நேரம்", no: "இப்போது" },
        mr: { tt: "वेळ प्रवास", yr: "वर्ष", mo: "महिना", da: "दिवस", ti: "वेळ", bt: "जन्म वेळ", no: "आता" },
        gu: { tt: "સમય યાત્રા", yr: "વર્ષ", mo: "મહિનો", da: "દિવસ", ti: "સમય", bt: "જન્મ સમય", no: "હવે" },
        bn: { tt: "সময় ভ্রমণ", yr: "বছর", mo: "মাস", da: "দিন", ti: "সময়", bt: "জন্মের সময়", no: "এখন" },
        ml: { tt: "സമയ യാത്ര", yr: "വർഷം", mo: "മാസം", da: "ദിവസം", ti: "സമയം", bt: "ജനന സമയം", no: "ഇപ്പോൾ" },
        sa: { tt: "समय यात्रा", yr: "वर्षम्", mo: "मासः", da: "दिनम्", ti: "समयः", bt: "जन्मसमयः", no: "अधुना" }
    };
    const ttTrans = TT_STRINGS[lang] || TT_STRINGS['en'];

    const uiDict = {
        ayanamsa: t("ov.ayanamsa", lang) || "Ayanamsa",
        lagna: t("pl.lagnaLabel", lang) || "Lagna",
        tithi: t("ov.tithi", lang) || "Tithi",
        vara: t("ov.vara", lang) || "Vara",
        nakshatraLabel: t("ov.nakLabel", lang) || "Nakshatra:",
        sunSign: t("ov.sunSign", lang) || "Sun Sign",
        moonSign: t("ov.moonSign", lang) || "Moon Sign",
        celestialNorthPole: { hi: "खगोलीय उत्तरी ध्रुव", kn: "ಖಗೋಳ ಉತ್ತರ ಧ್ರುವ", te: "ఖగోళ ఉత్తర ధృవం", ta: "வான்வட துருவம்", mr: "खगोलीय उत्तर ध्रुव", gu: "ખગોળીય ઉત્તર ધ્રુવ", bn: "খগোলিক উত্তর মেরু", ml: "ഖഗോള ഉത്തര ധ്രുവം", sa: "खगोलोत्तरध्रुवः" }[lang] || "Celestial North Pole",
        nakshatras: L_NAKS[lang] || L_NAKS['en'],
        timeTravelLabel: ttTrans.tt,
        yearLabel: ttTrans.yr,
        monthLabel: ttTrans.mo,
        dayLabel: ttTrans.da,
        timeLabel: ttTrans.ti,
        birthTimeLabel: ttTrans.bt,
        nowLabel: ttTrans.no
    };

    res.status(200).json({
        kundali,
        panchang,
        vara: dayOfWeek,
        nakshatras: NAKSHATRAS,
        localizedRashis,
        uiDict
    });

  } catch (e) {
      console.error("Computation error:", e);
      res.status(500).json({ error: e.message });
  }
}
