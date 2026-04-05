import http from 'http';
import fs from 'fs';
import url from 'url';
import querystring from 'querystring';
import { initializeAstroEngine } from './api/engine/swissephLoader.js';
import { computeKundali } from './api/engine/vedic.js';
import { computeDailyPanchang } from './api/engine/PanchangCalculator.js';
import { NAKSHATRAS } from './src/engine/constants.js';
import { RASHI_NAMES, getGrahaName, getRashiName } from './src/i18n/astroTerms.js';
import { t } from './src/i18n/uiStrings.js';
import { L_NAKS } from './src/i18n/astroMappings.js';
async function startServer() {
    console.log("Initializing Swiss Ephemeris engine...");
    await initializeAstroEngine();

    const server = http.createServer((req, res) => {
        const parsedUrl = url.parse(req.url);
        const query = querystring.parse(parsedUrl.query);

        if (parsedUrl.pathname === '/') {
            try {
                const content = fs.readFileSync('public/3d-sky.html');
                res.writeHead(200, { 
                    'Content-Type': 'text/html',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                });
                res.end(content);
            } catch(e) {
                res.writeHead(404);
                res.end("Not found");
            }
            return;
        }

        const handleRequest = async (payloadQuery) => {
            if (parsedUrl.pathname === '/api/compute' || parsedUrl.pathname === '/api/astrosky' || parsedUrl.pathname === '/api/kundali') {
            try {
                const params = {
                    year: parseInt(payloadQuery.year) || 1974,
                    month: parseInt(payloadQuery.month) || 9,
                    day: parseInt(payloadQuery.day) || 3,
                    hour: parseInt(payloadQuery.hour) || 18,
                    minute: parseInt(payloadQuery.minute) || 30,
                    lat: parseFloat(payloadQuery.lat) || 12.9716,
                    lng: parseFloat(payloadQuery.lng) || 77.5946,
                    utcOffset: parseFloat(payloadQuery.utcOffset || payloadQuery.utc) || 5.5,
                    name: payloadQuery.name || 'User',
                    city: payloadQuery.city || 'Bangalore',
                    country: payloadQuery.country || 'India',
                    tob: payloadQuery.tob || '18:30',
                    dob: payloadQuery.dob || '1974-09-03'
                };
                
                const d = new Date(params.year, params.month - 1, params.day, params.hour, params.minute);
                const lang = payloadQuery.lang || 'en';
                
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
                
                kundali.input = params; // Mirror exactly what /api/kundali.js does
                
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
                    ayanamsa: t("comp.ayanamsa", lang) || "Ayanamsa",
                    lagna: t("comp.lagna", lang) || "Lagna",
                    tithi: t("comp.tithi", lang) || "Tithi",
                    vara: t("comp.vara", lang) || "Vara",
                    nakshatraLabel: t("pc.nakshatra", lang) || "Nakshatra:",
                    sunSign: t("pc.sunSign", lang) || "Sun Sign",
                    moonSign: t("pc.moonSign", lang) || "Moon Sign",
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

                res.writeHead(200, { 'Content-Type': 'application/json' });
                
                if (parsedUrl.pathname === '/api/kundali') {
                     res.end(JSON.stringify(kundali));
                } else {
                     res.end(JSON.stringify({
                         kundali,
                         panchang,
                         vara: dayOfWeek,
                         nakshatras: NAKSHATRAS,
                         localizedRashis,
                         uiDict
                     }));
                }
            } catch (e) {
                console.error("Computation error:", e);
                res.writeHead(500);
                res.end(JSON.stringify({ error: e.message }));
            }
        } else {
            res.writeHead(404);
            res.end("Not Found");
        }
        };

        if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => body += chunk.toString());
            req.on('end', () => {
                let parsedBody = {};
                try { parsedBody = JSON.parse(body); } catch(e) {}
                handleRequest({ ...query, ...parsedBody });
            });
        } else {
            handleRequest(query);
        }
    });

    server.listen(4000, () => {
        console.log('\n======================================================');
        console.log('🚀 Interactive 3D Jyotish Prototype Running!');
        console.log('👉 Open your browser to: http://localhost:4000');
        console.log('======================================================\n');
    });
}

startServer().catch(console.error);
