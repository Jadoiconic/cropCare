import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ActivityIndicator,
    TextInput,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "expo-router";
import { auth, db } from "@/services/config"; // Import Firebase configuration
import { doc, getDoc } from "firebase/firestore"; // Import Firestore methods

const SignInScreen = () => {
    const router = useRouter();
    const [email, setEmail] = useState(""); // State for email
    const [password, setPassword] = useState(""); // State for password
    const [loading, setLoading] = useState(false); // State for loading indicator

    // Effect to check if user is already authenticated
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                handleRoleRedirect(user.uid);
            }
        });
        return unsubscribe; // Cleanup subscription on unmount
    }, []);

    // Function to redirect user based on role
    const handleRoleRedirect = async (uid: string) => {
        try {
            const docRef = doc(db, "farmers", uid); // Reference to user's Firestore document
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const { role } = docSnap.data(); // Extract role from document data
                switch (role) {
                    case "Admin":
                        router.navigate("/home/");
                        break;
                    case "Expert":
                        router.navigate("/home/");
                        break;
                    case "Farmer":
                        router.navigate("/home/");
                        break;
                    default:
                        alert("Role not recognized!");
                }
            } else {
                alert("User does not exist in the database!");
            }
        } catch (error) {
            alert("Failed to retrieve user data.");
        }
    };

    // Function to handle login
    const handleLogin = async () => {
        setLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            if (userCredential) {
                handleRoleRedirect(userCredential.user.uid); // Redirect after login
            }
        } catch (error) {
            alert("Invalid Email or Password!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome to Crop Care</Text>
            <View style={styles.form}>
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
                    onPress={handleLogin}
                >
                    <View>
                        {loading ? (
                            <ActivityIndicator size={30} color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Sign In</Text>
                        )}
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.forgotPassword}
                    onPress={() => {
                        // Handle forgot password action here
                    }}
                >
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push("/auth/Register")}>
                    <Text style={styles.registerText}>Don't have an account? Register here</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
    },
    form: {
        width: "100%",
        padding: 40,
    },
    inputContainer: {
        marginBottom: 15,
    },
    input: {
        width: "100%",
        height: 50,
        borderWidth: 1,
        borderColor: "gray",
        borderRadius: 5,
        paddingHorizontal: 20,
        fontSize: 16,
    },
    label: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 5,
    },
    title: {
        fontSize: 28,
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
        fontSize: 18,
        color: "white",
        textAlign: "center",
    },
    forgotPassword: {
        marginTop: 10,
    },
    forgotPasswordText: {
        color: "green",
        textAlign: "right",
    },
    registerText: {
        color: "blue",
        textAlign: "center",
        marginTop: 20,
    },
});

export default SignInScreen;
