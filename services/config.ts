import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // Importing Firebase Storage
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAqiyLvxos-LJjtkyuPeepJj61eo_ENKY0",
    authDomain: "rwandan-farmer.firebaseapp.com",
    projectId: "rwandan-farmer",
    storageBucket: "rwandan-farmer.appspot.com",
    messagingSenderId: "829606692020",
    appId: "1:829606692020:web:b6b116f123845b8505c3e1",
    measurementId: "G-5S1M04ZM80"
};

// Initialize Firebase only if there are no existing apps
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
auth.useDeviceLanguage(); // Ensure that the auth messages are shown in the device's language
const db = getFirestore(app);
const storage = getStorage(app); // Initialize Firebase Storage
//persist authenticationn state
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

// Export Firebase services
export { db, app, auth, storage, persistAuthState };
