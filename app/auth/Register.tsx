import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/services/config"; // Adjusted import statement for Firebase
import { doc, setDoc } from "firebase/firestore"; // Import Firestore methods
import { useRouter } from "expo-router";
import React from "react";

const RegisterScreen = () => {
    const router = useRouter();
    const [email, setEmail] = useState(""); // State for email
    const [password, setPassword] = useState(""); // State for password
    const [newUserName, setNewUserName] = useState(""); // State for first name
    const [loading, setLoading] = useState(false); // State for loading indicator
    const [role] = useState("Farmer"); // Default role

    const handleRegister = async () => {
        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // After successful registration, store user data in Firestore
            await setDoc(doc(db, "farmers", user.uid), {
                email: user.email,
                name: newUserName,
                role: role,
                createdAt: new Date().toISOString(), // Optional: Add timestamp
                // Add other fields as necessary
            });

            // Navigate to login or another screen after successful registration
            alert("Kwiyandikisha Byagenze Neza!");
            router.push("/auth/"); // Change this to your login screen route
        } catch (error) {
            alert("Kwiyandikisha Ntibyakunze! " + error.message); // Display error message
        } finally {
            setLoading(false); // Reset loading state
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>IYANDIKISHE</Text>
            <View style={styles.form}>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Amazina</Text>
                    <TextInput
                        placeholder="Injiza Amazina"
                        value={newUserName}
                        onChangeText={setNewUserName} // Corrected to update state
                        style={styles.input}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        placeholder="Injiza Imeli"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                        style={styles.input}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Injiza Ijambo Banga</Text>
                    <TextInput
                        placeholder="Ijambo banga"
                        value={password}
                        onChangeText={setPassword}
                        style={styles.input}
                        secureTextEntry
                    />
                </View>

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: loading ? "gray" : "#4CAF50" }]} // Green primary color
                    disabled={loading}
                    onPress={handleRegister}
                >
                    <View>
                        {loading ? (
                            <ActivityIndicator size={30} color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Iyandikishe</Text>
                        )}
                    </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push("/auth/")}>
                    <Text style={styles.linkText}>
                        Usanzwe Ufite Konti? Injira
                    </Text>
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
        padding: 20, // Added padding for better spacing
    },
    form: {
        width: "100%",
        padding: 20, // Adjusted form padding
    },
    input: {
        width: "100%",
        height: 50,
        borderWidth: 1,
        borderColor: "#BDBDBD", // Changed border color for better visibility
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
        marginBottom: 20, // Added margin for spacing
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
        color: "#4CAF50", // Green color for the link
        textAlign: "center",
        marginTop: 20,
    },
});

export default RegisterScreen;
