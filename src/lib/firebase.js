// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCjG51UL-iCEWa3fSfasq4YPzqEMWPmDUw",
  authDomain: "xplore-18a85.firebaseapp.com",
  databaseURL: "https://xplore-18a85-default-rtdb.firebaseio.com",
  projectId: "xplore-18a85",
  storageBucket: "xplore-18a85.firebasestorage.app",
  messagingSenderId: "467214770165",
  appId: "1:467214770165:web:01b4acfa11d61469a20abc",
  measurementId: "G-DGFTNJZWRG"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
import { enableIndexedDbPersistence } from "firebase/firestore";
if (typeof window !== "undefined") {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') {
      console.log('Persistence failed: Multiple tabs open');
    } else if (err.code == 'unimplemented') {
      console.log('Persistence not supported');
    }
  });
}
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, db, auth, googleProvider };
