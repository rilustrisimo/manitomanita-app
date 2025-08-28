import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  "projectId": "manitomatch",
  "appId": "1:286510485002:web:c478640f4d0e289efe59f3",
  "storageBucket": "manitomatch.firebasestorage.app",
  "apiKey": "AIzaSyA01XVcAWKx4Hh51OYpASUohm3Hw6M43QA",
  "authDomain": "manitomatch.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "286510485002"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
