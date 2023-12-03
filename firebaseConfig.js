import { initializeApp } from 'firebase/app';
import { getDatabase } from "firebase/database";

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAie_eWEQXXO9iFB2C8VEwgRvTSnVgCIi8",
    authDomain: "gait-eda72.firebaseapp.com",
    databaseURL: "https://gait-eda72-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "gait-eda72",
    storageBucket: "gait-eda72.appspot.com",
    messagingSenderId: "456703850606",
    appId: "1:456703850606:web:b19173b24585e078178e7f",
    measurementId: "G-N80YRTLXV8"
  };  

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);