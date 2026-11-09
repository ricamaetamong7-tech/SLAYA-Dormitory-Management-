// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCttb4Ahfw8yQGG3_FotbcC0bH4Eyuq7f8",
  authDomain: "slaya-dormitory-management.firebaseapp.com",
  projectId: "slaya-dormitory-management",
  storageBucket: "slaya-dormitory-management.firebasestorage.app",
  messagingSenderId: "456075802808",
  appId: "1:456075802808:web:1f540c118ce7d570e41c4d",
  measurementId: "G-M6P11Z3GNB"
};

// Initialize Firebase only once to prevent duplicate app errors
const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApp();

// Export auth and db so your sign-up / login screens can access them
export const auth = getAuth(app);
export const db = getFirestore(app);