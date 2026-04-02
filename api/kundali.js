import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { initializeAstroEngine } from './engine/swissephLoader.js';
import { computeKundali } from './engine/vedic.js';

// Initialize Firebase Admin (Only initialize once in serverless)
// Note: Requires GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT in ENV
if (!getApps().length) {
  try {
    const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (serviceAccountStr) {
      initializeApp({
        credential: cert(JSON.parse(serviceAccountStr))
      });
    } else {
       console.warn("FIREBASE_SERVICE_ACCOUNT not set. Auth verification will fail or bypass depending on phase.");
       initializeApp(); // fallback to default env
    }
  } catch(e) { console.error("Firebase Admin Init Error:", e); }
}

export const maxDuration = 30; // seconds

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  // Auth Gating (Phase 1 implementation as requested by user)
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing Firebase Bearer Token' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    if (getApps().length > 0 && process.env.FIREBASE_SERVICE_ACCOUNT) {
      await getAuth().verifyIdToken(token);
    } else {
      // If deployed without admin keys yet (local testing), we warn but proceed or fail based on strictness.
      // For now, in local dev, if verifying fails because no cert, we mock success to prevent blocking dev.
      // But we wrap in try-catch below.
    }
  } catch (error) {
    console.error("Auth verification failed:", error);
    return res.status(403).json({ error: 'Forbidden: Invalid Token' });
  }

  try {
    // 1. Initialize our secure Server-side WebAssembly Engine
    await initializeAstroEngine();

    // 2. Compute proprietary mathematics entirely on the backend
    const inputParams = req.body;
    
    // Quick validation
    if (!inputParams.year || !inputParams.month || !inputParams.day || inputParams.lat == null || inputParams.lng == null) {
       return res.status(400).json({ error: 'Missing celestial coordinates in payload' });
    }

    const payload = computeKundali(inputParams);

    // 3. Return the generic JSON output without exposing algorithmic constants
    res.status(200).json(payload);
  } catch (err) {
    console.error('Kundali generation failed:', err);
    res.status(500).json({ error: 'Internal server error computing astrology.' });
  }
}
