import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, setDoc, doc, getDoc, deleteDoc, collectionGroup } from "firebase/firestore";

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

// NOTE: Since we are running in Node, we don't have the current user's auth state.
// We will look for a user document or just migrate for the specific user UID.
// I will query users collection to find the single user, or I can just use a hardcoded UID if I know it.
// Let's query the 'users' collection or read a task to find the user UID.
async function migrate() {
  try {
    // 1. Find user UID from a task or habit
    const tasksSnap = await getDocs(collectionGroup(db, "tasks"));
    let uid = null;
    for (const d of tasksSnap.docs) {
      if (d.ref.parent && d.ref.parent.parent) {
        uid = d.ref.parent.parent.id;
        break;
      }
    }
    
    if (!uid) {
      console.log("Could not find a valid user UID from tasks!");
      process.exit(1);
    }
    console.log(`Migrating for user UID: ${uid}`);

    // 2. Migrate categories
    const catSnap = await getDocs(collection(db, "categories"));
    for (const d of catSnap.docs) {
      const data = d.data();
      await setDoc(doc(db, `users/${uid}/categories`, d.id), data);
      await deleteDoc(d.ref); // Clean up global
      console.log(`Migrated category: ${data.name}`);
    }

    // 3. Migrate transactions
    const txSnap = await getDocs(collection(db, "transactions"));
    for (const d of txSnap.docs) {
      const data = d.data();
      await setDoc(doc(db, `users/${uid}/transactions`, d.id), data);
      await deleteDoc(d.ref); // Clean up global
      console.log(`Migrated transaction: ${d.id}`);
    }

    // 4. Migrate global finance settings
    const settingsDoc = await getDoc(doc(db, "settings", "global"));
    if (settingsDoc.exists()) {
      const data = settingsDoc.data();
      await setDoc(doc(db, `users/${uid}/settings`, "global"), data, { merge: true });
      await deleteDoc(settingsDoc.ref); // Clean up global
      console.log(`Migrated global settings`);
    }

    console.log("Migration Complete!");
    process.exit(0);
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  }
}

migrate();
