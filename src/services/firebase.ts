// src/services/firebase.ts

const firebaseConfig = {
  apiKey: "AIzaSyDjrkqCiDrNI3168kOpkYMSlSAjH8zaoU0",
  authDomain: "nidar-db.firebaseapp.com",
  projectId: "nidar-db",
  storageBucket: "nidar-db.firebasestorage.app",
  messagingSenderId: "503739888226",
  appId: "1:503739888226:web:2465ab1981a8f6bea0173b",
  measurementId: "G-3RE9KDPYXR",
  databaseURL: "https://nidar-db-default-rtdb.firebaseio.com"
};

// Initialize Firebase App + Analytics + Database
const app = firebase.initializeApp(firebaseConfig);
const analytics = firebase.analytics(app);
const database = firebase.database(app);

export { app, analytics, database };
