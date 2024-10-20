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
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage

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
                const { role, ...userData } = docSnap.data(); // Extract role and user data from document
                await AsyncStorage.setItem("userData", JSON.stringify(userData)); // Save user data to local storage
                await AsyncStorage.setItem("userRole", role); // Save user role to local storage
                
                switch (role) {
                    case "Admin":
                    case "Expert":
                    case "Farmer":
                        router.navigate("/home/");
                        break;
                    default:
                        alert("Role not recognized!");
                }
            } else {
                alert("Ntabwo Mwiyandikishije! Mubanze Mwiyandikise");
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
            alert("Andika Neza Imeyili Cg Ijambo Banga!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Ikaze Kuri CropCare</Text>
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
                    <Text style={styles.label}>Ijambo Banga</Text>
                    <TextInput
                        placeholder="Ijambo banga"
                        value={password}
                        onChangeText={setPassword}
                        style={styles.input}
                        secureTextEntry
                    />
                </View>

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: loading ? "gray" : "#4CAF50" }]} // Primary color set to green
                    disabled={loading}
                    onPress={handleLogin}
                >
                    <View>
                        {loading ? (
                            <ActivityIndicator size={30} color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Injira</Text>
                        )}
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.forgotPassword}
                    onPress={() => {
                        // Handle forgot password action here
                    }}
                >
                    <Text style={styles.forgotPasswordText}>Kanda hano niba Wibagiwe Ijambo Banga?</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push("/auth/Register")}>
                    <Text style={styles.registerText}>Nta Konte ufite? kanda hano Wiyandikishe</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f7f7f7", // Light background for contrast
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
    },
    form: {
        width: "100%",
        padding: 40,
        backgroundColor: "#fff", // White background for the form
        borderRadius: 10, // Rounded corners for the form
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 5, // Shadow for Android
    },
    inputContainer: {
        marginBottom: 15,
    },
    input: {
        width: "100%",
        height: 50,
        borderWidth: 1,
        borderColor: "#4CAF50", // Green border
        borderRadius: 5,
        paddingHorizontal: 20,
        fontSize: 16,
        backgroundColor: "#f9f9f9", // Light gray background for inputs
    },
    label: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 5,
        color: "#333", // Darker text for better readability
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 20,
        color: "#4CAF50", // Green title color
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
        color: "#4CAF50", // Green color for "Forgot Password?"
        textAlign: "right",
    },
    registerText: {
        color: "#4CAF50", // Green color for register text
        textAlign: "center",
        marginTop: 20,
    },
});

export default SignInScreen;
