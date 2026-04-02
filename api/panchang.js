import { initializeAstroEngine } from './engine/swissephLoader.js';
import { computeDailyPanchang, findJanmaTithi, findVarshikaTithi } from './engine/PanchangCalculator.js';

export const maxDuration = 30;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  // Panchang calculations are public domain astronomy, no rigorous auth needed here 
  // (unless user strictly wants to gate EVERYTHING).
  try {
    await initializeAstroEngine();
    
    const { action, params } = req.body;
    
    if (action === 'computeDailyPanchang') {
       const result = computeDailyPanchang(params.date, params.lat, params.lng, params.tzOffset);
       return res.status(200).json(result);
    }
    
    if (action === 'findJanmaTithi') {
       const result = findJanmaTithi(params.birthDate, params.lat, params.lng, params.targetYear, params.tzOffset);
       return res.status(200).json(result);
    }
    
    if (action === 'computeVarshikaTithi') {
       const result = findVarshikaTithi(params.deathDate, params.lat, params.lng, params.targetYear, params.tzOffset);
       return res.status(200).json(result);
    }

    if (action === 'computeMonthlyCalendar') {
       const days = [];
       for (let d = 1; d <= params.daysInMonth; d++) {
           const dateObj = new Date(params.year, params.month, d, 12, 0, 0); 
           const panchang = computeDailyPanchang(dateObj, params.lat, params.lng, params.tzOffset);
           const birthdays = findJanmaTithi(panchang, params.livingProfiles || []);
           const memorials = findVarshikaTithi(panchang, params.departedSouls || []);
           days.push({ date: d, panchang, birthdays, memorials, dateObjStr: dateObj.toISOString() });
       }
       return res.status(200).json(days);
    }

    return res.status(400).json({ error: 'Invalid Panchang Action requested.' });
  } catch (err) {
    console.error('Panchang Serverless Error:', err);
    res.status(500).json({ error: 'Internal server error computing panchang.' });
  }
}
