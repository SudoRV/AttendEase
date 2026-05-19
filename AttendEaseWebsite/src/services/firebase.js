import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";
import { onMessage } from "firebase/messaging";

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