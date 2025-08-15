// firebase.js
import { initializeApp, getApp, getApps } from "firebase/app";
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore/lite";

const firebaseConfig = {
  apiKey: "AIzaSyA9Ax1Ujlf2uRPk3sJOex9NGPJ-0GiR-Ck",
  authDomain: "book-explorer-3f830.firebaseapp.com",
  projectId: "book-explorer-3f830",
  storageBucket: "book-explorer-3f830.firebasestorage.app",
  messagingSenderId: "742469285475",
  appId: "1:742469285475:web:e6b547a7e8058e05e1aa56",
  measurementId: "G-NXX78J1QZL",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  auth = getAuth(app);
}

const db = getFirestore(app);

export { app, auth, db };
