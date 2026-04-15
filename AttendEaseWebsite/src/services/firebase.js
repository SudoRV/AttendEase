// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getMessaging } from "firebase/messaging";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAvfH_ZkssBugFWpqTQVMNEFjWPmieIHfw",
  authDomain: "scheduler-56a76.firebaseapp.com",
  projectId: "scheduler-56a76",
  storageBucket: "scheduler-56a76.firebasestorage.app",
  messagingSenderId: "959032391778",
  appId: "1:959032391778:web:caa9762a8f0a737a95793b",
  measurementId: "G-T7TPC66ENT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export const messaging = getMessaging(app);