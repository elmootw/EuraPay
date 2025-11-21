import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyA9y1jfIsIBILLTMS-Fop_V7qJheJeNA9g",
  authDomain: "eurapay-5aaf2.firebaseapp.com",
  projectId: "eurapay-5aaf2",
  databaseURL: "https://eurapay-5aaf2-default-rtdb.asia-southeast1.firebasedatabase.app",
  storageBucket: "eurapay-5aaf2.firebasestorage.app",
  messagingSenderId: "1037695318692",
  appId: "1:1037695318692:web:94f8327f9918750785c431"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
