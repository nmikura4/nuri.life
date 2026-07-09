import { initializeApp } from "firebase/app";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyASsa8I3IUmN97jVxOpMIMZCgWKnLmokaw",
  authDomain: "nuri-life-v2.firebaseapp.com",
  projectId: "nuri-life-v2",
  storageBucket: "nuri-life-v2.firebasestorage.app",
  messagingSenderId: "260743925049",
  appId: "1:260743925049:web:1e8ad543b7b5f78a926ce8"
};

const app = initializeApp(firebaseConfig);

// Initialize Firestore with offline persistence
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const storage = getStorage(app);
