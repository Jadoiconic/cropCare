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

const RegisterScreen = () => {
    const router = useRouter();
    const [email, setEmail] = useState(""); // State for email
    const [password, setPassword] = useState(""); // State for password
    const [newUserName, setNewUserName] = useState(""); // State for first name
    const [loading, setLoading] = useState(false); // State for loading indicator
    const [role] = useState("Expert"); // Default role

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
            alert("Registration Successful!");
            router.push("/manages"); 
        } catch (error) {
            alert("Registration failed! " + error.message); // Display error message
        } finally {
            setLoading(false); // Reset loading state
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Register</Text>
            <View style={{ width: "100%", padding: 40 }}>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>First Name</Text>
                    <TextInput
                        placeholder="John"
                        value={newUserName}
                        onChangeText={setNewUserName} // Corrected to update state
                        style={styles.input}
                    />
                </View>
                
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        placeholder="example@gmail.com"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                        style={styles.input}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        style={styles.input}
                        secureTextEntry
                    />
                </View>

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: loading ? "gray" : "#6C63FF" }]}
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
    },
    input: {
        width: "100%",
        height: 50,
        borderWidth: 1,
        borderColor: "gray",
        borderRadius: 5,
        paddingHorizontal: 20,
        fontSize: 20,
    },
    label: {
        fontSize: 20,
        fontWeight: "bold",
    },
    inputContainer: {
        paddingBottom: 10,
    },
    title: {
        fontSize: 30,
        fontWeight: "bold",
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
});

export default RegisterScreen;
