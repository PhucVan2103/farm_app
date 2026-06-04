import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCAUs1-MFHiRFTSYb3HbWZrJna_jGMqFSs",
  authDomain: "farm-app-cb7e0.firebaseapp.com",
  projectId: "farm-app-cb7e0",
  storageBucket: "farm-app-cb7e0.firebasestorage.app",
  messagingSenderId: "314343662236",
  appId: "1:314343662236:web:1d0eb2811400a59c054359"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);