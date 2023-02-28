// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDyo_MUl9o0zPM7qnHLCK_0gQegeXSXTuY",
  authDomain: "k-techy.firebaseapp.com",
  projectId: "k-techy",
  storageBucket: "k-techy.appspot.com",
  messagingSenderId: "436183000470",
  appId: "1:436183000470:web:1ad0ca29d6e06e67b2e9b7"
};

// Initialize Firebase
initializeApp(firebaseConfig);
export const db = getFirestore();