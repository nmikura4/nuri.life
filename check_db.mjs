import { initializeApp } from "firebase/app";
import { getFirestore, collectionGroup, getDocs, doc, getDoc } from "firebase/firestore";

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
  console.log("Checking all tasks...");
  const tasks = await getDocs(collectionGroup(db, "tasks"));
  console.log("Total tasks:", tasks.size);
  
  const uids = new Set();
  tasks.docs.forEach(d => {
    if (d.ref.parent && d.ref.parent.parent) {
      uids.add(d.ref.parent.parent.id);
    }
  });

  const notes = await getDocs(collectionGroup(db, "notes"));
  console.log("Total notes:", notes.size);
  notes.docs.forEach(d => {
    if (d.ref.parent && d.ref.parent.parent) uids.add(d.ref.parent.parent.id);
  });

  console.log("User UIDs found:", Array.from(uids));

  for (const uid of uids) {
    console.log(`\nUser ${uid}:`);
    const tx = await getDocs(collectionGroup(db, "transactions"));
    console.log(`  - Total global transactions in subcollections: ${tx.size}`);
    const cat = await getDocs(collectionGroup(db, "categories"));
    console.log(`  - Total global categories in subcollections: ${cat.size}`);
    const fin = await getDocs(collectionGroup(db, "finances"));
    console.log(`  - Total global finances in subcollections: ${fin.size}`);
    
    const settings = await getDoc(doc(db, "users", uid, "settings", "global"));
    if (settings.exists()) {
        console.log(`  - Settings global data:`, settings.data());
    } else {
        console.log(`  - Settings global missing`);
    }
  }

  process.exit(0);
}

check();
