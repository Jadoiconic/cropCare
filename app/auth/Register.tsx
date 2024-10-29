import React, { useState } from "react";
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/services/config"; // Firebase config
import { doc, setDoc, getDocs, collection, query, where } from "firebase/firestore";
import { useRouter } from "expo-router";

const RegisterScreen = () => {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [newUserName, setNewUserName] = useState("");
    const [loading, setLoading] = useState(false);
    const [role] = useState("Farmer"); // Default role

    const handleRegister = async () => {
        setLoading(true);

        try {
            // Check if the username is unique
            const usernameQuery = query(
                collection(db, "farmers"),
                where("name", "==", newUserName)
            );
            const usernameSnapshot = await getDocs(usernameQuery);

            if (!usernameSnapshot.empty) {
                alert("Username already exists. Please choose a different username.");
                setLoading(false);
                return;
            }

            // Register with Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Store user data in Firestore after registration
            await setDoc(doc(db, "farmers", user.uid), {
                email: user.email,
                name: newUserName,
                role: role,
                createdAt: new Date().toISOString(),
            });

            alert("Registration successful!");
            router.push("/auth/"); // Adjust route as needed
        } catch (error) {
            alert("Registration failed! " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Register</Text>
            <View style={styles.form}>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Username</Text>
                    <TextInput
                        placeholder="Enter username"
                        value={newUserName}
                        onChangeText={setNewUserName}
                        style={styles.input}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        placeholder="Enter email"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                        style={styles.input}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        placeholder="Enter password"
                        value={password}
                        onChangeText={setPassword}
                        style={styles.input}
                        secureTextEntry
                    />
                </View>

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: loading ? "gray" : "#4CAF50" }]}
                    disabled={loading}
                    onPress={handleRegister}
                >
                    <View>
                        {loading ? (
                            <ActivityIndicator size={30} color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Register</Text>
                        )}
                    </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push("/auth/")}>
                    <Text style={styles.linkText}>Already have an account? Sign in</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        padding: 20,
    },
    form: {
        width: "100%",
        padding: 20,
    },
    input: {
        width: "100%",
        height: 50,
        borderWidth: 1,
        borderColor: "#BDBDBD",
        borderRadius: 5,
        paddingHorizontal: 20,
        fontSize: 18,
    },
    label: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 5,
    },
    inputContainer: {
        marginBottom: 15,
    },
    title: {
        fontSize: 30,
        fontWeight: "bold",
        marginBottom: 20,
    },
    button: {
        paddingVertical: 15,
        paddingHorizontal: 60,
        borderRadius: 8,
        marginTop: 20,
    },
    buttonText: {
        fontWeight: "bold",
        fontSize: 20,
        color: "white",
        textAlign: "center",
    },
    linkText: {
        color: "#4CAF50",
        textAlign: "center",
        marginTop: 20,
    },
});

export default RegisterScreen;
