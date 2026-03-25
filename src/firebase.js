import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app, auth, googleProvider;

try {
  // Only initialize if the API key is present to prevent blank screen crashes
  if (firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
  }
} catch (e) {
  console.error("Firebase initialization failed", e);
}

export { auth, googleProvider };

export const signInWithGooglePopup = () => {
    if (!auth) {
        return Promise.reject(new Error("Firebase is not configured locally or in Vercel. Please add VITE_FIREBASE_API_KEY environment variables."));
    }
    return signInWithPopup(auth, googleProvider);
};
