import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// TODO: Replace with your Firebase configuration object
// You can find this in your Firebase Console -> Project Settings -> General -> Your apps
// If using the CLI, you might be able to use `firebase apps:sdkconfig`
const firebaseConfig = {
    apiKey: "AIzaSyALU2FDkrYAUmMUdMkb6Y8908p6PSNxC8s",
    authDomain: "planetfall-odyssey.firebaseapp.com",
    projectId: "planetfall-odyssey",
    storageBucket: "planetfall-odyssey.firebasestorage.app",
    messagingSenderId: "184189588302",
    appId: "1:184189588302:web:2b31a529338213cebf441f"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
