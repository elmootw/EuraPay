import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: 
  authDomain: 
  projectId: 
  databaseURL: 
  storageBucket: 
  messagingSenderId: 
  appId: 
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
