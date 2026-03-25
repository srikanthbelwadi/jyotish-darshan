import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app, auth, googleProvider, db;

try {
  // Only initialize if the API key is present to prevent blank screen crashes
  if (firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    db = getFirestore(app);
  }
} catch (e) {
  console.error("Firebase initialization failed", e);
}

export { auth, googleProvider, db };

export const syncProfileToCloud = async (userId, profiles) => {
  if (!db) return;
  try {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, { profiles }, { merge: true });
  } catch (e) {
    console.error("Failed to sync profile to cloud", e);
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

export const signInWithGooglePopup = () => {
    if (!auth) {
        return Promise.reject(new Error("Firebase is not configured locally or in Vercel. Please add VITE_FIREBASE_API_KEY environment variables."));
    }
    return signInWithPopup(auth, googleProvider);
};
