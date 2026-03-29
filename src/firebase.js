import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app, auth, googleProvider, db, functions;

try {
  // Only initialize if the API key is present to prevent blank screen crashes
  if (firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    db = getFirestore(app);
    functions = getFunctions(app);
  }
} catch (e) {
  console.error("Firebase initialization failed", e);
}

export { auth, googleProvider, db, functions };

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
    return signInWithPopup(auth, googleProvider);
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
