// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: "AIzaSyA9Ax1Ujlf2uRPk3sJOex9NGPJ-0GiR-Ck",
  authDomain: "book-explorer-3f830.firebaseapp.com",
  projectId: "book-explorer-3f830",
  storageBucket: "book-explorer-3f830.firebasestorage.app",
  messagingSenderId: "742469285475",
  appId: "1:742469285475:web:e6b547a7e8058e05e1aa56",
  measurementId: "G-NXX78J1QZL"
  
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

