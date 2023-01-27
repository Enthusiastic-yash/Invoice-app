import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDCDwh5eZJlAiyIPQuYdFPsDG-YJVlH2Ww",
  authDomain: "invoice-app-fdd1e.firebaseapp.com",
  projectId: "invoice-app-fdd1e",
  storageBucket: "invoice-app-fdd1e.appspot.com",
  messagingSenderId: "249882570452",
  appId: "1:249882570452:web:26bf889e2a4a45ed7e5541",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
