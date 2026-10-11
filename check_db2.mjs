import { initializeApp } from "firebase/app";
import { getFirestore, collectionGroup, getDocs } from "firebase/firestore";

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
  const tasks = await getDocs(collectionGroup(db, "tasks"));
  const notes = await getDocs(collectionGroup(db, "notes"));
  
  const userCounts = {};
  tasks.docs.forEach(d => {
    let uid = "root";
    if (d.ref.parent && d.ref.parent.parent) {
      uid = d.ref.parent.parent.id;
    }
    if (!userCounts[uid]) userCounts[uid] = { tasks: 0, notes: 0 };
    userCounts[uid].tasks++;
  });
  notes.docs.forEach(d => {
    let uid = "root";
    if (d.ref.parent && d.ref.parent.parent) {
      uid = d.ref.parent.parent.id;
    }
    if (!userCounts[uid]) userCounts[uid] = { tasks: 0, notes: 0 };
    userCounts[uid].notes++;
  });

  console.log("Counts per user for tasks and notes:");
  console.log(userCounts);
  
  process.exit(0);
}

check();
