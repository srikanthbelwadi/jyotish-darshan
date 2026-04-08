import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, getRedirectResult, signInWithRedirect } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getAnalytics, logEvent } from "firebase/analytics";

const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: isDev ? import.meta.env.VITE_FIREBASE_AUTH_DOMAIN : (typeof window !== 'undefined' ? window.location.host : import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app, auth, googleProvider, db, functions, analytics;

try {
  // Only initialize if the API key is present to prevent blank screen crashes
  if (firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    db = getFirestore(app);
    functions = getFunctions(app);
    if (typeof window !== 'undefined') {
      analytics = getAnalytics(app);
    }
  }
} catch (e) {
  console.error("Firebase initialization failed", e);
}

// Global invocation to unbox OAuth tokens purely ONCE across the entire app execution
// This natively prevents 'INTERNAL ASSERTION FAILED: Pending promise was never set' inside StrictMode loops
if (auth) {
  getRedirectResult(auth).catch(e => console.error("Firebase Auth redirect unboxing error:", e));
}

export { auth, googleProvider, db, functions, analytics };

export const trackEvent = (eventName, eventParams = {}) => {
  if (analytics) {
    try {
      logEvent(analytics, eventName, eventParams);
    } catch (e) {
      console.warn("Analytics error", e);
    }
  }
};

export const syncProfileToCloud = async (userId, profiles) => {
  if (!db) return false;
  try {
    const userRef = doc(db, "users", userId);
    // Stamp profiles with updatedAt if missing for deterministic merging
    const stamped = profiles.map(p => ({ ...p, updatedAt: p.updatedAt || Date.now() }));
    await setDoc(userRef, { lastSynced: Date.now(), profiles: stamped }, { merge: true });
    return true;
  } catch (e) {
    console.error("Failed to sync profile to cloud", e);
    return false;
  }
};

export const syncSettingsToCloud = async (userId, settings) => {
  if (!db) return false;
  try {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, { settings }, { merge: true });
    return true;
  } catch (e) {
    console.error("Failed to sync settings to cloud", e);
    return false;
  }
};

export const fetchCloudProfiles = async (userId) => {
  if (!db) return null;
  try {
    const userRef = doc(db, "users", userId);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      return docSnap.data().profiles;
    }
  } catch (e) {
    console.error("Failed to fetch profiles from cloud", e);
  }
  return null;
};

export const fetchCloudUserData = async (userId) => {
  if (!db) return null;
  try {
    const userRef = doc(db, "users", userId);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
  } catch (e) {
    console.error("Failed to fetch user data from cloud", e);
  }
  return null;
};

export const signInWithGooglePopup = () => {
    if (!auth) {
        return Promise.reject(new Error("Firebase is not configured locally or in Vercel. Please add VITE_FIREBASE_API_KEY environment variables."));
    }
    return signInWithPopup(auth, googleProvider).catch((error) => {
        if (error.code === 'auth/popup-blocked') {
            console.warn('Popup blocked, falling back to redirect...');
            return signInWithRedirect(auth, googleProvider);
        }
        throw error;
    });
};

export const callOracle = async (data) => {
  if (!functions) throw new Error("Firebase Functions not initialized");
  const func = httpsCallable(functions, 'generateOracle');
  const result = await func(data);
  return result.data;
};

export const callPathway = async (data) => {
  if (!functions) throw new Error("Firebase Functions not initialized");
  const func = httpsCallable(functions, 'generatePathway');
  const result = await func(data);
  return result.data;
};

export const syncDepartedSoulsToCloud = async (userId, departedSouls) => {
  if (!db) return false;
  if (!Array.isArray(departedSouls) || departedSouls.length > 5) {
    console.warn("Departed souls limit reached or invalid list.");
    departedSouls = departedSouls.slice(0, 5); // Enforce max 5 limit
  }
  try {
    const userRef = doc(db, "users", userId);
    // Stamp entries with updatedAt if missing 
    const stamped = departedSouls.map(p => ({ ...p, updatedAt: p.updatedAt || Date.now() }));
    await setDoc(userRef, { lastSynced: Date.now(), departedSouls: stamped }, { merge: true });
    return true;
  } catch (e) {
    console.error("Failed to sync departed souls to cloud", e);
    return false;
  }
};

export const fetchCloudDepartedSouls = async (userId) => {
  if (!db) return [];
  try {
    const userRef = doc(db, "users", userId);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists() && docSnap.data().departedSouls) {
      return docSnap.data().departedSouls;
    }
  } catch (e) {
    console.error("Failed to fetch departed souls from cloud", e);
  }
  return [];
};
