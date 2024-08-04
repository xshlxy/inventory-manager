// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import {getFirestore} from 'firebase/firestore';
import { getAuth, EmailAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { firebaseConfig } from './firebase.config';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional






// Initialize Firebase
const app = initializeApp(firebaseConfig);

//let analytics;
//if (typeof window !== 'undefined' && isSupported()) {
//  analytics = getAnalytics(app);
//}

const firestore = getFirestore(app);
const auth = getAuth(app);

export {firestore, auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut};