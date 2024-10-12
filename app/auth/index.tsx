import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { useEffect, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/services/config"; // Import Firebase configuration
import { useRouter } from "expo-router";
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
        return () => unsubscribe(); // Cleanup subscription
    }, [router]);

    // Function to redirect user based on role
    const handleRoleRedirect = async (uid: string) => {
        const docRef = doc(db, "farmers", uid); // Reference to user's Firestore document
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const userData = docSnap.data();
            const role = userData.role; // Get the role from the document

            // Navigate based on user role
            switch (role) {
                case "Admin":
                    router.navigate("/home/admin_home"); // Admin dashboard
                    break;
                case "Expert":
                    router.navigate("/home/expert_home"); // Expert dashboard
                    break;
                case "Farmer":
                    router.navigate("/home/"); // Farmer dashboard
                    break;
                default:
                    alert("Role not recognized!"); // Handle unrecognized roles
            }
        } else {
            alert("User does not exist in the database!");
        }
    };

    // Function to handle login
    const handleLogin = async () => {
        setLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            if (userCredential) {
                handleRoleRedirect(userCredential.user.uid); // Check role after login
            }
        } catch (error) {
            alert("Invalid Email or Password!"); // Display error message
        } finally {
            setLoading(false); // Reset loading state
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome to Crop Care</Text>
            <View style={{ width: "100%", padding: 40 }}>
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
                    style={{ marginTop: 10 }}
                    onPress={() => {
                        // Handle forgot password action here
                    }}
                >
                    <Text style={[styles.buttonText, { color: "green", textAlign: "right" }]}>
                        Forgot Password?
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push("/auth/Register")}>
                    <Text style={{ color: "blue", textAlign: "center" }}>
                        Don't have an account? Register here
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

export default SignInScreen;
