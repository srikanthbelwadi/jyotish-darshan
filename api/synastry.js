import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { initializeAstroEngine } from './engine/swissephLoader.js';
import { calculateMatch } from './engine/matchmaking.js';

if (!getApps().length) {
  try {
    const sa = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (sa) initializeApp({ credential: cert(JSON.parse(sa)) });
    else initializeApp();
  } catch(e) {}
}

export const maxDuration = 30;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing Firebase Bearer Token' });
  }

  try {
    const token = authHeader.split('Bearer ')[1];
    if (getApps().length > 0 && process.env.FIREBASE_SERVICE_ACCOUNT) {
      await getAuth().verifyIdToken(token);
    }
  } catch (error) {
    return res.status(403).json({ error: 'Forbidden: Invalid Token' });
  }

  try {
    await initializeAstroEngine();
    
    const { primaryKundali, partnerKundali } = req.body;
    if (!primaryKundali || !partnerKundali) return res.status(400).json({ error: 'Missing chart contexts' });

    const synastryResult = calculateMatch(primaryKundali, partnerKundali);
    res.status(200).json(synastryResult);
  } catch (err) {
    console.error('Synastry computation failed:', err);
    res.status(500).json({ error: 'Internal server error computing match.' });
  }
}
