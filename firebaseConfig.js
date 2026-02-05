// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAMA6HfWO8sbn3pqUiJfPBVTZWT11P-eVk",
    authDomain: "farmer-cab.firebaseapp.com",
    projectId: "farmer-cab",
    storageBucket: "farmer-cab.firebasestorage.app",
    messagingSenderId: "624983656299",
    appId: "1:624983656299:web:8323eb71d96c4f76c22e2e",
    measurementId: "G-8056DF1YTH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
});
