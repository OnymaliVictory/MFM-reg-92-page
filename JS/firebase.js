// /JS/firebase.js
// Single module to initialize Firebase and export db + storage

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyDazF8P4J-E6UE8J0ERG3K-6m_p_LAWHfs",
  authDomain: "mfmc-829c0.firebaseapp.com",
  projectId: "mfmc-829c0",
  storageBucket: "mfmc-829c0.firebasestorage.app",
  messagingSenderId: "332488323280",
  appId: "1:332488323280:web:e379be4ba2a496b3a32ed5",
  measurementId: "G-9PTSB7XH82"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Also attach for scripts that expect window.db (optional)
window.db = db;
window.storage = storage;
