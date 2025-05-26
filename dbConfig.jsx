// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBp3fiCqEZeNvvAhT15-14DB3JxLYr_HpY",
  authDomain: "thsports-24787.firebaseapp.com",
  projectId: "thsports-24787",
  storageBucket: "thsports-24787.firebasestorage.app",
  messagingSenderId: "966041305700",
  appId: "1:966041305700:web:9c228fa7ccdcb6e0f45571"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);