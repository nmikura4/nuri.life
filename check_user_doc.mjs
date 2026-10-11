import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCCpkHCbaqcZUxM902OOQo6WNOZxLPsz3Q",
  authDomain: "nurimika-bc85f.firebaseapp.com",
  projectId: "nurimika-bc85f",
  storageBucket: "nurimika-bc85f.firebasestorage.app",
  messagingSenderId: "666404503756",
  appId: "1:666404503756:web:5451c4b955a926c6ebc269"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  const uids = ["l9U27614DxW0M68qemKiIQCHeV43", "TUHxT3KYOqgRepJYq6TxEdBBqI43"];
  for (const uid of uids) {
    console.log(`\nChecking root document for User ${uid}:`);
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      console.log(userDoc.data());
    } else {
      console.log("No root document found in 'users' collection.");
    }
  }
  process.exit(0);
}

check();
