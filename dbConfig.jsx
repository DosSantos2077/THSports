// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBNZ0H37F6LautglUXJ-l2XtRbD77dbNks",
  authDomain: "thsport-69cd7.firebaseapp.com",
  projectId: "thsport-69cd7",
  storageBucket: "thsport-69cd7.firebasestorage.app",
  messagingSenderId: "977171152976",
  appId: "1:977171152976:web:dcfd92fdba7aba76f51155"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);