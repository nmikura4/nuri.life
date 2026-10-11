import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

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
  const uid = "l9U27614DxW0M68qemKiIQCHeV43";
  console.log(`Checking tasks for User ${uid}:`);
  const tasks = await getDocs(collection(db, "users", uid, "tasks"));
  if (!tasks.empty) {
    console.log(tasks.docs[0].data());
  }

  process.exit(0);
}

check();
