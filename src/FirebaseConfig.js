import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    appId: import.meta.env.VITE_FIREBASE_APPID,
    messaginSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    measurementID: import.meta.env.VITE_FIREBASE_MEASUREMENTID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET

};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);  