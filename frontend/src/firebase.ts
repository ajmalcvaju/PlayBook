// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  // apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  apiKey:"AIzaSyDGxYgna2c4ununyf_t3DP0-JCxmq3ap8E",
  authDomain: "playbook-9082d.firebaseapp.com",
  projectId: "playbook-9082d",
  storageBucket: "playbook-9082d.firebasestorage.app",
  messagingSenderId: "396700384657",
  appId: "1:396700384657:web:2af9465cc078d6ceab2e30",
  measurementId: "G-SW3P9VCBFC"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
