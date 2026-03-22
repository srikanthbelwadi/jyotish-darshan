import translate from '@iamtraction/google-translate';
import fs from 'fs';

const texts = {
  H1: "Happiness & Comfort",
  H2: "Financial Restrictions",
  H3: "Courage & Success",
  H4: "Mental Stress",
  H5: "Delays & Worries",
  H6: "Victory & Health",
  H7: "Success & Joy",
  H8: "Unexpected Troubles",
  H9: "Fatigue & Bad Luck",
  H10: "Success & Honor",
  H11: "Income & Gains",
  H12: "High Expenses"
};

const languages = ['hi', 'kn', 'te', 'ta', 'mr', 'gu', 'bn', 'ml', 'sa'];
const results = { en: texts };

async function run() {
  for (const lang of languages) {
    console.log(`Translating for ${lang}...`);
    results[lang] = {};
    for (const [key, text] of Object.entries(texts)) {
      try {
        const res = await translate(text, { from: 'en', to: lang });
        results[lang][key] = res.text;
      } catch (err) {
        console.error(`Error translating ${key} to ${lang}:`, err);
        results[lang][key] = text; // fallback
      }
    }
  }
  
  fs.writeFileSync('house_translations.json', JSON.stringify(results, null, 2));
  console.log('Translations saved to house_translations.json');
}

run();
