import { initializeAstroEngine } from './engine/swissephLoader.js';
import { generateMuhuratCalendar, getAuspiciousWindow } from './engine/muhuratEngine.js';

export const maxDuration = 30;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    await initializeAstroEngine();
    
    const { action, params } = req.body;
    
    if (action === 'generateMuhuratCalendar') {
       const result = generateMuhuratCalendar(
          params.baseKundali, 
          params.partnerKundali, 
          params.eventCategory, 
          params.lat, 
          params.lng, 
          params.startDate, 
          params.endDate, 
          params.tzOffset
       );
       return res.status(200).json(result);
    }
    
    if (action === 'getAuspiciousWindow') {
       const result = getAuspiciousWindow(params.bestJd, params.lat, params.lng, params.tzOffset);
       return res.status(200).json(result);
    }

    return res.status(400).json({ error: 'Invalid Muhurat Action requested.' });
  } catch (err) {
    console.error('Muhurat Server Error:', err);
    res.status(500).json({ error: 'Internal server error computing muhurat combinations.' });
  }
}
