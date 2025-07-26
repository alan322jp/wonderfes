import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
apiKey: "AIzaSyCutpRL9d8xIYSyOXZgJNFrCCFiDcLN2ww",
  authDomain: "wonderfes-30bfe.firebaseapp.com",
  projectId: "wonderfes-30bfe",
  storageBucket: "wonderfes-30bfe.firebasestorage.app",
  messagingSenderId: "140845688414",
  appId: "1:140845688414:web:53efff7e05e8f19b7e36cf",
  measurementId: "G-Y1052GWH83"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);