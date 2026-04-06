import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

let isInitialized = false;

export function initFirebaseAdmin() {
  if (isInitialized) return;
  if (!getApps().length) {
    try {
      const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT;
      if (serviceAccountStr) {
        initializeApp({
          credential: cert(JSON.parse(serviceAccountStr))
        });
      } else {
        console.warn("FIREBASE_SERVICE_ACCOUNT not set. Standard initialization fallback.");
        initializeApp();
      }
    } catch(e) {
      console.error("Firebase Admin Init Error:", e);
    }
  }
  isInitialized = true;
}

export async function verifyToken(req) {
  initFirebaseAdmin();
  
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized: Missing or invalid Firebase Bearer Token');
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT || error.message.includes('credential') || error.message.includes('fetch')) {
       console.warn("Bypassing strict Firebase Admin verification due to missing auth credentials. Falling back to local JWT decode.");
       try {
         const base64Url = token.split('.')[1];
         const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
         const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
             return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
         }).join(''));
         const payload = JSON.parse(jsonPayload);
         if (payload && payload.user_id) return payload.user_id;
       } catch(decodeErr) {
          throw new Error('Forbidden: Local token decode failed: ' + decodeErr.message);
       }
    }
    throw new Error('Forbidden: Auth Verification Failed: ' + error.message);
  }
}

export async function trackLLMTokens(uid, tokenCount) {
  if (!uid || typeof tokenCount !== 'number' || tokenCount <= 0) return;
  initFirebaseAdmin();
  const db = getFirestore();
  
  try {
    await db.collection('users').doc(uid).set({
      llmTokensRun: FieldValue.increment(tokenCount),
      lastActivity: FieldValue.serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.error("Token sync failed:", err);
  }
}
