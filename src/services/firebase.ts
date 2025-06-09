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
let database: any;
let auth: any;
let storage: any;

if (typeof window !== 'undefined' && window.firebase) {
  if (!window.firebase.apps.length) {
    window.firebase.initializeApp(firebaseConfig);
  }
  database = window.firebase.database();
  auth = window.firebase.auth();
  storage = window.firebase.storage();
}

export { database, auth, storage };
