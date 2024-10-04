import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "./config";

interface loginProps {
    email: string;
    password: string;
}

export const login = async ({ email, password }: loginProps) => {
    try {
        const userCredential = await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        return userCredential;
    } catch (error) {
        console.log("Invalid Email or Password!")
    }
};


export const signup = async ({ email, password }: loginProps) => {
    const userCredentials = await createUserWithEmailAndPassword(
        auth,
        email,
        password
    );
    return userCredentials;
};