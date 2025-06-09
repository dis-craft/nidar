// src/services/firebase.ts

// Initialize Firebase using CDN
declare global {
  interface Window {
    firebase: any;
  }
}

const firebaseConfig = {
  apiKey: "AIzaSyDjrkqCiDrNI3168kOpkYMSlSAjH8zaoU0",
  authDomain: "nidar-db.firebaseapp.com",
  databaseURL: "https://nidar-db-default-rtdb.firebaseio.com",
  projectId: "nidar-db",
  storageBucket: "nidar-db.appspot.com",
  messagingSenderId: "503739888226",
  appId: "1:503739888226:web:2465ab1981a8f6bea0173b",
  measurementId: "G-3RE9KDPYXR"
};

// Initialize Firebase
if (!window.firebase.apps.length) {
  window.firebase.initializeApp(firebaseConfig);
}

// Initialize services
export const database = window.firebase.database();
export const auth = window.firebase.auth();
export const storage = window.firebase.storage();
