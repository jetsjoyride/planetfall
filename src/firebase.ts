import { initializeApp } from 'firebase/app';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyALU2FDkrYAUmMUdMkb6Y8908p6PSNxC8s",
    authDomain: "planetfall-odyssey.firebaseapp.com",
    projectId: "planetfall-odyssey",
    storageBucket: "planetfall-odyssey.firebasestorage.app",
    messagingSenderId: "184189588302",
    appId: "1:184189588302:web:2b31a529338213cebf441f"
};

const app = initializeApp(firebaseConfig);
// Initialize Firestore with persistent local cache
export const db = initializeFirestore(app, {
    localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
    })
});
