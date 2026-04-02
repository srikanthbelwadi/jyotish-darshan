import fs from 'fs';
import path from 'path';

const rawData = `
1	Sheetala Ashtami	Chaitra	Krishna Paksha	Ashtami (8th)	Mula / Purva Ashadha
2	Papmochani Ekadashi	Chaitra	Krishna Paksha	Ekadashi (11th)	Shravana / Dhanishta
3	Gudi Padwa / Ugadi	Chaitra	Shukla Paksha	Pratipada (1st)	Revati / Ashwini
4	Cheti Chand	Chaitra	Shukla Paksha	Dwitiya (2nd)	Ashwini / Bharani
5	Gangaur	Chaitra	Shukla Paksha	Tritiya (3rd)	Bharani / Krittika
6	Matsya Jayanti	Chaitra	Shukla Paksha	Tritiya (3rd)	Rohini / Mrigashira
7	Yamuna Chhath	Chaitra	Shukla Paksha	Shashthi (6th)	Mrigashira / Ardra
8	Rama Navami	Chaitra	Shukla Paksha	Navami (9th)	Punarvasu (Defining)
9	Kamada Ekadashi	Chaitra	Shukla Paksha	Ekadashi (11th)	Magha / Purva Phalguni
10	Hanuman Jayanti	Chaitra	Shukla Paksha	Purnima (Full Moon)	Chitra / Swati
11	Varuthini Ekadashi	Vaishakha	Krishna Paksha	Ekadashi (11th)	Shatabhisha / Purva Bhadrapada
12	Parashurama Jayanti	Vaishakha	Shukla Paksha	Tritiya (3rd)	Rohini / Mrigashira
13	Akshaya Tritiya	Vaishakha	Shukla Paksha	Tritiya (3rd)	Rohini (Defining)
14	Shankaracharya Jayanti	Vaishakha	Shukla Paksha	Panchami (5th)	Ardra / Punarvasu
15	Ganga Saptami	Vaishakha	Shukla Paksha	Saptami (7th)	Pushya / Ashlesha
16	Sita Navami	Vaishakha	Shukla Paksha	Navami (9th)	Pushya (Defining)
17	Mohini Ekadashi	Vaishakha	Shukla Paksha	Ekadashi (11th)	Purva Phalguni / Uttara Phalguni
18	Narasimha Jayanti	Vaishakha	Shukla Paksha	Chaturdashi (14th)	Swati (Defining)
19	Buddha Purnima	Vaishakha	Shukla Paksha	Purnima (Full Moon)	Vishakha / Anuradha
20	Narada Jayanti	Jyeshtha	Krishna Paksha	Pratipada (1st)	Anuradha / Jyeshtha
21	Apara Ekadashi	Jyeshtha	Krishna Paksha	Ekadashi (11th)	Revati / Ashwini
22	Shani Jayanti	Jyeshtha	Krishna Paksha	Amavasya (New Moon)	Rohini / Mrigashira
23	Vat Savitri Vrat	Jyeshtha	Krishna Paksha	Amavasya (New Moon)	Jyeshtha / Mula
24	Ganga Dussehra	Jyeshtha	Shukla Paksha	Dashami (10th)	Hasta (Defining)
25	Nirjala Ekadashi	Jyeshtha	Shukla Paksha	Ekadashi (11th)	Chitra / Swati
26	Vat Purnima Vrat	Jyeshtha	Shukla Paksha	Purnima (Full Moon)	Jyeshtha / Mula
27	Yogini Ekadashi	Ashadha	Krishna Paksha	Ekadashi (11th)	Bharani / Krittika
28	Jagannath Rath Yatra	Ashadha	Shukla Paksha	Dwitiya (2nd)	Pushya / Ashlesha
29	Devshayani Ekadashi	Ashadha	Shukla Paksha	Ekadashi (11th)	Anuradha / Jyeshtha
30	Guru Purnima	Ashadha	Shukla Paksha	Purnima (Full Moon)	Purva Ashadha / Uttara Ashadha
31	Kamika Ekadashi	Shravana	Krishna Paksha	Ekadashi (11th)	Rohini / Mrigashira
32	Hariyali Teej	Shravana	Shukla Paksha	Tritiya (3rd)	Purva Phalguni / Uttara Phalguni
33	Nag Panchami	Shravana	Shukla Paksha	Panchami (5th)	Hasta / Chitra
34	Kalki Jayanti	Shravana	Shukla Paksha	Shashthi (6th)	Chitra / Swati
35	Tulsidas Jayanti	Shravana	Shukla Paksha	Saptami (7th)	Swati / Vishakha
36	Shravana Putrada Ekadashi	Shravana	Shukla Paksha	Ekadashi (11th)	Mula / Purva Ashadha
37	Raksha Bandhan	Shravana	Shukla Paksha	Purnima (Full Moon)	Shravana / Dhanishta
38	Gayathri Jayanti	Shravana	Shukla Paksha	Purnima (Full Moon)	Shravana / Dhanishta
39	Kajari Teej	Bhadrapada	Krishna Paksha	Tritiya (3rd)	Purva Bhadrapada / Uttara Bhadrapada
40	Bahula Chaturthi	Bhadrapada	Krishna Paksha	Chaturthi (4th)	Uttara Bhadrapada / Revati
41	Balarama Jayanti	Bhadrapada	Krishna Paksha	Shashthi (6th)	Ashwini / Bharani
42	Krishna Janmashtami	Bhadrapada	Krishna Paksha	Ashtami (8th)	Rohini (Defining)
43	Aja Ekadashi	Bhadrapada	Krishna Paksha	Ekadashi (11th)	Punarvasu / Pushya
44	Hartalika Teej	Bhadrapada	Shukla Paksha	Tritiya (3rd)	Chitra / Swati
45	Ganesh Chaturthi	Bhadrapada	Shukla Paksha	Chaturthi (4th)	Swati / Vishakha
46	Rishi Panchami	Bhadrapada	Shukla Paksha	Panchami (5th)	Anuradha / Jyeshtha
47	Radha Ashtami	Bhadrapada	Shukla Paksha	Ashtami (8th)	Jyeshtha / Mula
48	Parsva Ekadashi	Bhadrapada	Shukla Paksha	Ekadashi (11th)	Shravana / Dhanishta
49	Vamana Jayanti	Bhadrapada	Shukla Paksha	Dwadashi (12th)	Shravana (Defining)
50	Anant Chaturdashi	Bhadrapada	Shukla Paksha	Chaturdashi (14th)	Purva Bhadrapada / Uttara Bhadrapada
51	Pitru Paksha Begins	Bhadrapada	Shukla Paksha	Purnima (Full Moon)	Uttara Bhadrapada / Revati
52	Indira Ekadashi	Ashvin	Krishna Paksha	Ekadashi (11th)	Magha / Purva Phalguni
53	Mahalaya Amavasya	Ashvin	Krishna Paksha	Amavasya (New Moon)	Uttara Phalguni / Hasta
54	Sharad Navratri Begins	Ashvin	Shukla Paksha	Pratipada (1st)	Chitra / Hasta
55	Lalita Panchami	Ashvin	Shukla Paksha	Panchami (5th)	Anuradha / Jyeshtha
56	Saraswati Avahan	Ashvin	Shukla Paksha	Saptami (7th)	Mula (Defining)
57	Durga Ashtami	Ashvin	Shukla Paksha	Ashtami (8th)	Purva Ashadha
58	Maha Navami	Ashvin	Shukla Paksha	Navami (9th)	Uttara Ashadha
59	Dussehra (Vijayadashami)	Ashvin	Shukla Paksha	Dashami (10th)	Shravana (Defining)
60	Papankusha Ekadashi	Ashvin	Shukla Paksha	Ekadashi (11th)	Dhanishta / Shatabhisha
61	Sharad Purnima	Ashvin	Shukla Paksha	Purnima (Full Moon)	Revati / Ashwini
62	Valmiki Jayanti	Ashvin	Shukla Paksha	Purnima (Full Moon)	Revati / Ashwini
63	Karwa Chauth	Kartika	Krishna Paksha	Chaturthi (4th)	Krittika / Rohini
64	Ahoi Ashtami	Kartika	Krishna Paksha	Ashtami (8th)	Pushya / Ashlesha
65	Rama Ekadashi	Kartika	Krishna Paksha	Ekadashi (11th)	Purva Phalguni / Uttara Phalguni
66	Dhanteras	Kartika	Krishna Paksha	Trayodashi (13th)	Hasta / Chitra
67	Narak Chaturdashi	Kartika	Krishna Paksha	Chaturdashi (14th)	Swati / Vishakha
68	Diwali (Deepavali)	Kartika	Krishna Paksha	Amavasya (New Moon)	Swati / Vishakha
69	Govardhan Puja	Kartika	Shukla Paksha	Pratipada (1st)	Anuradha / Jyeshtha
70	Bhai Dooj	Kartika	Shukla Paksha	Dwitiya (2nd)	Jyeshtha / Mula
71	Chhath Puja	Kartika	Shukla Paksha	Shashthi (6th)	Purva Ashadha / Uttara Ashadha
72	Gopashtami	Kartika	Shukla Paksha	Ashtami (8th)	Shravana / Dhanishta
73	Akshaya Navami	Kartika	Shukla Paksha	Navami (9th)	Dhanishta / Shatabhisha
74	Devutthana Ekadashi	Kartika	Shukla Paksha	Ekadashi (11th)	Purva Bhadrapada / Uttara Bhadrapada
75	Tulsi Vivah	Kartika	Shukla Paksha	Dwadashi (12th)	Revati / Ashwini
76	Dev Deepawali	Kartika	Shukla Paksha	Purnima (Full Moon)	Krittika / Rohini
77	Utpanna Ekadashi	Margashirsha	Krishna Paksha	Ekadashi (11th)	Chitra / Swati
78	Vivah Panchami	Margashirsha	Shukla Paksha	Panchami (5th)	Shravana / Dhanishta
79	Gita Jayanti	Margashirsha	Shukla Paksha	Ekadashi (11th)	Ashwini / Bharani
80	Mokshada Ekadashi	Margashirsha	Shukla Paksha	Ekadashi (11th)	Ashwini / Bharani
81	Dattatreya Jayanti	Margashirsha	Shukla Paksha	Purnima (Full Moon)	Mrigashira / Ardra
82	Saphala Ekadashi	Pausha	Krishna Paksha	Ekadashi (11th)	Anuradha / Jyeshtha
83	Pausha Putrada Ekadashi	Pausha	Shukla Paksha	Ekadashi (11th)	Krittika / Rohini
84	Shattila Ekadashi	Magha	Krishna Paksha	Ekadashi (11th)	Purva Ashadha / Uttara Ashadha
85	Mauni Amavasya	Magha	Krishna Paksha	Amavasya (New Moon)	Shravana / Dhanishta
86	Vasant Panchami	Magha	Shukla Paksha	Panchami (5th)	Revati / Ashwini
87	Ratha Saptami	Magha	Shukla Paksha	Saptami (7th)	Bharani / Krittika
88	Bhishma Ashtami	Magha	Shukla Paksha	Ashtami (8th)	Krittika / Rohini
89	Maha Shivaratri	Phalguna	Krishna Paksha	Chaturdashi (14th)	Shravana / Dhanishta
90	Holika Dahan / Holi	Phalguna	Shukla Paksha	Purnima (Full Moon)	Purva Phalguni / Uttara Phalguni
`;

const MONTH_MAP = {
    'Chaitra': 1, 'Vaishakha': 2, 'Jyeshtha': 3, 'Ashadha': 4,
    'Shravana': 5, 'Bhadrapada': 6, 'Ashvin': 7, 'Kartika': 8,
    'Margashirsha': 9, 'Pausha': 10, 'Magha': 11, 'Phalguna': 12
};

const TITHI_MAP = {
    'Pratipada (1st)': 1, 'Dwitiya (2nd)': 2, 'Tritiya (3rd)': 3, 'Chaturthi (4th)': 4,
    'Panchami (5th)': 5, 'Shashthi (6th)': 6, 'Saptami (7th)': 7, 'Ashtami (8th)': 8,
    'Navami (9th)': 9, 'Dashami (10th)': 10, 'Ekadashi (11th)': 11, 'Dwadashi (12th)': 12,
    'Trayodashi (13th)': 13, 'Chaturdashi (14th)': 14, 'Purnima (Full Moon)': 15, 'Amavasya (New Moon)': 15
};

const processedMap = {};

rawData.trim().split('\n').forEach(line => {
    const parts = line.split('\t');
    if (parts.length < 5) return;
    
    let name = parts[1].trim();
    let month = parts[2].trim();
    let paksha = parts[3].trim();
    let tithiLabel = parts[4].trim();
    
    let m = MONTH_MAP[month];
    let t = TITHI_MAP[tithiLabel];
    
    let isAmavasya = tithiLabel.includes('Amavasya');
    let isFullMoon = tithiLabel.includes('Purnima');
    
    if (paksha === 'Krishna Paksha' && !isAmavasya) {
        m = m === 1 ? 12 : m - 1;
        t = t + 15;
    } else if (isAmavasya) {
        m = m === 1 ? 12 : m - 1;
        t = 30;
    }
    
    let id = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    let icon = '🌺';
    
    if (id.includes('ekadashi')) icon = '🚫';
    if (id.includes('purnima')) icon = '🌕';
    if (id.includes('amavasya')) icon = '🌑';
    if (id.includes('jayanti')) icon = '🪔';
    if (id.includes('diwali') || id.includes('deepawali') || id.includes('dhanteras')) icon = '🪙';
    if (id.includes('holi')) icon = '🎨';
    if (id.includes('shivaratri')) icon = '🔱';
    if (id.includes('ganesh')) icon = '🐘';
    if (id.includes('janmashtami')) icon = '🦚';
    if (id.includes('rath_yatra')) icon = '🛕';
    if (id === 'akshaya_tritiya') icon = '💰';
    if (id.includes('nag_panchami')) icon = '🐍';
    if (id.includes('raksha_bandhan')) icon = '🧵';
    if (id.includes('navratri') || id.includes('dussehra')) icon = '🏹';
    if (id.includes('saraswati')) icon = '🪕';
    if (id.includes('govardhan')) icon = '⛰️';
    if (id.includes('chhath')) icon = '🌞';

    let key = `${m}-${t}`;
    if (!processedMap[key]) {
        processedMap[key] = { key, id, name, icon };
    } else {
        processedMap[key].id += `_${id}`;
        processedMap[key].name += ` & ${name}`;
        processedMap[key].icon += ` ${icon}`;
    }
});

const processed = Object.values(processedMap);

// Build the festMap JS object code
let festMapCode = '  const festMap = {\n';
processed.forEach(p => {
    festMapCode += `    "${p.key}": {id: "${p.id}", icon: "${p.icon}"},\n`;
});
festMapCode += '  };';

// Build the translation injection strings
let translationsCode = '';
processed.forEach(p => {
    translationsCode += `  'pc.fest.${p.id}.n': '${p.name.replace("'", "\\'")}',\n`;
    translationsCode += `  'pc.fest.${p.id}.d': 'Observance of ${p.name.replace("'", "\\'")}.',\n`;
});

// Read and Patch PanchangCalculator.js
const calcPath = path.resolve('src/engine/PanchangCalculator.js');
let calcContents = fs.readFileSync(calcPath, 'utf8');

const festMapRegex = /const festMap = \{[\s\S]*?\n  \};/m;
if (festMapRegex.test(calcContents)) {
    calcContents = calcContents.replace(festMapRegex, festMapCode.trim());
    fs.writeFileSync(calcPath, calcContents, 'utf8');
    console.log("✅ PanchangCalculator.js patched with 90 festivals.");
} else {
    console.log("❌ Could not find festMap in PanchangCalculator.js");
}

// Read and Patch rebuild_panchang_translations.mjs
const rebuildPath = path.resolve('rebuild_panchang_translations.mjs');
let rebuildContents = fs.readFileSync(rebuildPath, 'utf8');

// There is a dictPanchang section
const translationRegex = /const dictPanchang = \{[\s\S]*?\n\};/m;
if (translationRegex.test(rebuildContents)) {
    let oldBlock = rebuildContents.match(translationRegex)[0];
    
    // Just inject the new keys before the closing brace
    let newBlock = oldBlock.replace(/\n\};/m, ',\n\n  // AUTO-INJECTED 90 FESTIVALS\n' + translationsCode + '\n};');
    
    rebuildContents = rebuildContents.replace(translationRegex, newBlock);
    fs.writeFileSync(rebuildPath, rebuildContents, 'utf8');
    console.log("✅ rebuild_panchang_translations.mjs patched.");
} else {
    console.log("❌ Could not find dictPanchang in rebuild_panchang_translations.mjs");
}

console.log("🎉 SUCCESS!");
