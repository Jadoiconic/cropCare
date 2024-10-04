


import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyARw17qrGKOpggDF42BEg7rhJwbxFsv2BQ",
    authDomain: "cropcare-4e289.firebaseapp.com",
    projectId: "cropcare-4e289",
    storageBucket: "cropcare-4e289.appspot.com",
    messagingSenderId: "412161345719",
    appId: "1:412161345719:web:3db6339dae243c5650a532"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
auth.useDeviceLanguage();
const db = getFirestore(app);

const persistAuthState = async (user: any) => {
    try {
        if (user) {
            await AsyncStorage.setItem('user', JSON.stringify(user));
        } else {
            await AsyncStorage.removeItem('user');
        }
    } catch (error) {
        console.log('Error persisting auth state:');
    }
};

// Listen for changes in authentication state and persist the state
onAuthStateChanged(auth, (user) => {
    persistAuthState(user);
});


export { db, app, auth, persistAuthState };
