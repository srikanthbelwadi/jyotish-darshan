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
  let rawBody = req.body;
  if (Buffer.isBuffer(rawBody)) {
    rawBody = rawBody.toString('utf8');
  }
  let parsedBody = {};
  if (typeof rawBody === 'string') {
    try { parsedBody = JSON.parse(rawBody); } catch(e) {}
  } else if (rawBody) {
    parsedBody = rawBody;
  }
  const bodyToken = parsedBody.firebaseToken;
  
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split('Bearer ')[1];
  } else if (bodyToken) {
    token = bodyToken;
  }

  if (!token && !parsedBody.isPanchang && req.query?.panchang !== '1') {
    console.warn("NO TOKEN EXTRACTED. Headers: ", Object.keys(req.headers));
    return res.status(401).json({ error: 'Backend Authorization Failure: Token utterly absent from both Headers and Body' });
  }

  try {
    if (token && getApps().length > 0 && process.env.FIREBASE_SERVICE_ACCOUNT) {
      await getAuth().verifyIdToken(token);
    } else if (!token && !parsedBody.isPanchang && req.query?.panchang !== '1') {
      throw new Error("Missing token");
    }
  } catch (error) {
    console.error("Auth verification failed:", error);
    return res.status(403).json({ error: 'Auth Verification Failed: ' + error.message });
  }

  try {
    // 1. Initialize our secure Server-side WebAssembly Engine
    await initializeAstroEngine();

    // 2. Compute proprietary mathematics entirely on the backend
    const inputParams = parsedBody || {};

    
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
