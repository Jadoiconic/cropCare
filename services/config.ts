// services/config.ts
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyARw17qrGKOpggDF42BEg7rhJwbxFsv2BQ",
    authDomain: "cropcare-4e289.firebaseapp.com",
    projectId: "cropcare-4e289",
    storageBucket: "cropcare-4e289.appspot.com",
    messagingSenderId: "412161345719",
    appId: "1:412161345719:web:3db6339dae243c5650a532",
};

// Initialize Firebase only if there are no existing apps
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
auth.useDeviceLanguage(); // Ensure that the auth messages are shown in the device's language
const db = getFirestore(app);

// Persist Authentication State
const persistAuthState = async (user: any) => {
    try {
        if (user) {
            await AsyncStorage.setItem('user', JSON.stringify(user));
            console.log('User persisted to local storage:', user);
        } else {
            await AsyncStorage.removeItem('user');
            console.log('User removed from local storage');
        }
    } catch (error) {
        console.error('Error persisting auth state:', error);
    }
};

// Listen for changes in authentication state and persist the state
onAuthStateChanged(auth, (user) => {
    persistAuthState(user);
});

export { db, app, auth, persistAuthState };
