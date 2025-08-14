// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "flexfit-snq6v",
  "appId": "1:832306055128:web:84c220f5b2c6421d2994ad",
  "storageBucket": "flexfit-snq6v.firebasestorage.app",
  "apiKey": "AIzaSyAXAkgpzEWq8iku_11lDay4EC_NGxgqKHQ",
  "authDomain": "flexfit-snq6v.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "832306055128"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
