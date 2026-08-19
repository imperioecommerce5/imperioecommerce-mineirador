import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDQTXuzRMDP4vtpvpzvkTBd5Cl_0_aCM5g',
  authDomain: 'imperioecommerce-mineirador.firebaseapp.com',
  projectId: 'imperioecommerce-mineirador',
  storageBucket: 'imperioecommerce-mineirador.firebasestorage.app',
  messagingSenderId: '805172672001',
  appId: '1:805172672001:web:77e71eddea97aa9550f200',
};

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(firebaseApp);
