import fs from 'fs';
import path from 'path';

const file = path.join(process.cwd(), 'src', 'i18n', 'locales', 'en.json');
const en = JSON.parse(fs.readFileSync(file, 'utf8'));

// Populate the rest of the astrological arrays
const NAKSHATRAS = ["Ashvini", "Bharani", "Krittika", "Rohini", "Mrigashirsha", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"];
const YOGAS = ["Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma", "Dhriti", "Shula", "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyan", "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"];
const KARANAS = ["Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti", "Kintughna", "Shakuni", "Chatushpada", "Naga"];
const MASAS = ["Chaitra", "Vaishakha", "Jyeshtha", "Ashadha", "Shravana", "Bhadrapada", "Ashvina", "Kartika", "Margashirsha", "Pausha", "Magha", "Phalguna"];

en.astro = en.astro || {};

en.astro.nakshatras = {};
NAKSHATRAS.forEach((n, i) => en.astro.nakshatras[i] = n);

en.astro.yogas = {};
YOGAS.forEach((y, i) => en.astro.yogas[i] = y);

en.astro.karanas = {};
KARANAS.forEach((k, i) => en.astro.karanas[i] = k);

en.astro.masas = {};
MASAS.forEach((m, i) => en.astro.masas[i] = m);

fs.writeFileSync(file, JSON.stringify(en, null, 2));
console.log('Updated en.json with Nakshatras, Yogas, Karanas, and Masas');
