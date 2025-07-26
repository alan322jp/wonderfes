import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDf5RvoJ64xac-9K1Asq9dAufvOCPrNliY",
  authDomain: "wonderfes2025.firebaseapp.com",
  projectId: "wonderfes2025",
  storageBucket: "wonderfes2025.firebasestorage.app",
  messagingSenderId: "675206214247",
  appId: "1:675206214247:web:b332f6e80508f4cf0cdac2",
  measurementId: "G-NL8NSGMJ3Z"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
