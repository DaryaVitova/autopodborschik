import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBIBSVqprnVx3Oipi2KBu3S7JOi9YvU4sc",
  authDomain: "autopicker-37e28.firebaseapp.com",
  projectId: "autopicker-37e28",
  storageBucket: "autopicker-37e28.firebasestorage.app",
  messagingSenderId: "887170374774",
  appId: "1:887170374774:web:ca7bb138572d3afbefd357",
  measurementId: "G-8M7QGNLV74"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, app };
