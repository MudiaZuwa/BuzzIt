// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

import {
  getDatabase,
  ref,
  set,
  onValue,
  push,
  get,
  update,
  child,
  onDisconnect,
  onChildAdded,
  off,
} from "firebase/database";

import {
  getAuth,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";

import {
  getStorage,
  uploadBytes,
  ref as storageRef,
  getDownloadURL,
  uploadBytesResumable,
} from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB0US8vBzOKJlpb1bkixDZQCB8ka1h1DiY",
  authDomain: "buzzit-45162.firebaseapp.com",
  projectId: "buzzit-45162",
  storageBucket: "buzzit-45162.appspot.com",
  messagingSenderId: "253955480738",
  appId: "1:253955480738:web:0c6a1788a784aff90b0bfb",
  measurementId: "G-XJP4GD0B21",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase();

export default app;
export {
  getDatabase,
  database,
  ref,
  set,
  onValue,
  get,
  push,
  off,
  update,
  child,
  onChildAdded,
  getAuth,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  getStorage,
  uploadBytes,
  storageRef,
  getDownloadURL,
  uploadBytesResumable,
  GoogleAuthProvider,
  signInWithPopup,
  onDisconnect,
};
