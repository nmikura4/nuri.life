import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCCpkHCbaqcZUxM902OOQo6WNOZxLPsz3Q",
  authDomain: "nurimika-bc85f.firebaseapp.com",
  projectId: "nurimika-bc85f",
  storageBucket: "nurimika-bc85f.firebasestorage.app",
  messagingSenderId: "666404503756",
  appId: "1:666404503756:web:5451c4b955a926c6ebc269"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
