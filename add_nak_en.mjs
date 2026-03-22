import fs from 'fs';

const data = [
  {"planet":"Ketu", "gana":"Deva", "nature":"Light & Swift", "animal":"Male Horse", "goal":"Dharma", "guna":"Sattva"},
  {"planet":"Venus", "gana":"Manushya", "nature":"Fierce & Severe", "animal":"Male Elephant", "goal":"Artha", "guna":"Rajas"},
  {"planet":"Sun", "gana":"Rakshasa", "nature":"Mixed", "animal":"Female Sheep", "goal":"Kama", "guna":"Rajas"},
  {"planet":"Moon", "gana":"Manushya", "nature":"Fixed & Steady", "animal":"Male Serpent", "goal":"Moksha", "guna":"Rajas"},
  {"planet":"Mars", "gana":"Deva", "nature":"Soft & Mild", "animal":"Female Serpent", "goal":"Moksha", "guna":"Tamas"},
  {"planet":"Rahu", "gana":"Manushya", "nature":"Fierce & Severe", "animal":"Female Dog", "goal":"Kama", "guna":"Tamas"},
  {"planet":"Jupiter", "gana":"Deva", "nature":"Movable", "animal":"Female Cat", "goal":"Artha", "guna":"Sattva"},
  {"planet":"Saturn", "gana":"Deva", "nature":"Light & Swift", "animal":"Male Sheep", "goal":"Dharma", "guna":"Tamas"},
  {"planet":"Mercury", "gana":"Rakshasa", "nature":"Sharp & Dreadful", "animal":"Male Cat", "goal":"Dharma", "guna":"Sattva"},
  {"planet":"Ketu", "gana":"Rakshasa", "nature":"Fierce & Severe", "animal":"Male Rat", "goal":"Artha", "guna":"Tamas"},
  {"planet":"Venus", "gana":"Manushya", "nature":"Fierce & Severe", "animal":"Female Rat", "goal":"Kama", "guna":"Rajas"},
  {"planet":"Sun", "gana":"Manushya", "nature":"Fixed & Steady", "animal":"Male Cow", "goal":"Moksha", "guna":"Rajas"},
  {"planet":"Moon", "gana":"Deva", "nature":"Light & Swift", "animal":"Female Buffalo", "goal":"Moksha", "guna":"Rajas"},
  {"planet":"Mars", "gana":"Rakshasa", "nature":"Soft & Mild", "animal":"Female Tiger", "goal":"Kama", "guna":"Tamas"},
  {"planet":"Rahu", "gana":"Deva", "nature":"Movable", "animal":"Male Buffalo", "goal":"Artha", "guna":"Tamas"},
  {"planet":"Jupiter", "gana":"Rakshasa", "nature":"Mixed", "animal":"Male Tiger", "goal":"Dharma", "guna":"Sattva"},
  {"planet":"Saturn", "gana":"Deva", "nature":"Soft & Mild", "animal":"Female Deer", "goal":"Dharma", "guna":"Tamas"},
  {"planet":"Mercury", "gana":"Rakshasa", "nature":"Sharp & Dreadful", "animal":"Male Deer", "goal":"Artha", "guna":"Sattva"},
  {"planet":"Ketu", "gana":"Rakshasa", "nature":"Sharp & Dreadful", "animal":"Male Dog", "goal":"Kama", "guna":"Tamas"},
  {"planet":"Venus", "gana":"Manushya", "nature":"Fierce & Severe", "animal":"Male Monkey", "goal":"Moksha", "guna":"Rajas"},
  {"planet":"Sun", "gana":"Manushya", "nature":"Fixed & Steady", "animal":"Male Mongoose", "goal":"Moksha", "guna":"Rajas"},
  {"planet":"Moon", "gana":"Deva", "nature":"Movable", "animal":"Female Monkey", "goal":"Artha", "guna":"Rajas"},
  {"planet":"Mars", "gana":"Rakshasa", "nature":"Movable", "animal":"Female Lion", "goal":"Dharma", "guna":"Tamas"},
  {"planet":"Rahu", "gana":"Rakshasa", "nature":"Movable", "animal":"Female Horse", "goal":"Dharma", "guna":"Tamas"},
  {"planet":"Jupiter", "gana":"Manushya", "nature":"Fierce & Severe", "animal":"Male Lion", "goal":"Artha", "guna":"Sattva"},
  {"planet":"Saturn", "gana":"Manushya", "nature":"Fixed & Steady", "animal":"Female Cow", "goal":"Kama", "guna":"Tamas"},
  {"planet":"Mercury", "gana":"Deva", "nature":"Soft & Mild", "animal":"Female Elephant", "goal":"Moksha", "guna":"Sattva"}
];

let content = fs.readFileSync('src/data/nakshatra_lore.js', 'utf-8');

// Match the NAKSHATRA_LORE object parsing
const lines = content.split('\n');
let insideEn = false;
let currentIdx = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('"en": {')) {
    insideEn = true;
  } else if (lines[i].includes('},') && lines[i+1] && lines[i+1].includes('"hi": {')) {
    insideEn = false;
  }

  if (insideEn) {
    const match = lines[i].match(/"(\d+)": \{/);
    if (match) {
      currentIdx = parseInt(match[1]);
    }

    if (lines[i].includes('"famous":')) {
      // Remove famous line by commenting it out or deleting.
      lines[i] = ''; 
    }
    
    // Add the new data if we find symbol
    if (lines[i].includes('"symbol":')) {
      const d = data[currentIdx];
      const newProps = `      "planet": "${d.planet}",
      "gana": "${d.gana}",
      "nature": "${d.nature}",
      "animal": "${d.animal}",
      "goal": "${d.goal}",
      "guna": "${d.guna}",`;
      lines[i] = newProps + '\n' + lines[i];
    }
  } else if (currentIdx !== -1) {
    // Also remove famous from other languages
    if (lines[i].includes('"famous":')) {
      lines[i] = '';
    }
  }
}

fs.writeFileSync('src/data/nakshatra_lore.js', lines.filter(l => l !== '').join('\n'));
console.log('Added English traits to nakshatra_lore.js');
