// src/firebase/config.js
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Suas configurações reais do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDB9h7WjFukfO5T-lpLmYI_pYmPiXOgTIU",
  authDomain: "habit-trackerv1.firebaseapp.com",
  projectId: "habit-trackerv1",
  storageBucket: "habit-trackerv1.firebasestorage.app",
  messagingSenderId: "988878396336",
  appId: "1:988878396336:web:bf2845cffb76c3eed45475",
  measurementId: "G-9J6ZRHC9V2"
};

// 🔧 Verificar se já existe app inicializado
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// 🎯 Conectar ao Firestore
export const db = getFirestore(app);

// 🔐 Conectar ao Authentication
export const auth = getAuth(app);