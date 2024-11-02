import React, { useState } from "react";
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ActivityIndicator,
    Image,
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

        // Check for valid name
        const nameRegex = /^(?=.*[a-zA-Z])[a-zA-Z0-9]+$/; // At least one letter, followed by letters or numbers
        if (!newUserName || !nameRegex.test(newUserName)) {
            alert("Izina rigomba kuba riri hagati y'inyuguti n'imibare. Ntibishobora kuba imibare gusa Cg ngo Hajyemo Ibimenyetso.");
            setLoading(false);
            return;
        }

        // Check for valid password length
        if (password.length < 6) {
            alert("Ijambo ry'ibanga rigomba kuba rifite nibura inyuguti 6.");
            setLoading(false);
            return;
        }

        // Check for valid email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            alert("Email wanditse ntabwo ari mu buryo bwemewe. Nyamuneka ongera ugerageze.");
            setLoading(false);
            return;
        }

        try {
            // Check if the username is unique
            const usernameQuery = query(
                collection(db, "farmers"),
                where("name", "==", newUserName)
            );
            const usernameSnapshot = await getDocs(usernameQuery);

            if (!usernameSnapshot.empty) {
                alert("Izina ryo kwiyandikisha ryarafashwe. Hitamo irindi zina cyangwa wongere umubare wihariye inyuma y'izina.");
                setLoading(false);
                return;
            }

            // Check if the email is already in use
            const emailQuery = query(
                collection(db, "farmers"),
                where("email", "==", email)
            );
            const emailSnapshot = await getDocs(emailQuery);

            if (!emailSnapshot.empty) {
                alert("Imeli yarafashwe. Nyamuneka ongera ugerageze n'indi Imeli.");
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

            alert("Kwiyandikisha byagenze neza!");
            router.push("/auth/"); // Adjust route as needed
        } catch (error) {
            alert("Kwiyandikisha byanze! Reba ko wanditse imeli neza wongere ugerageze"); // Use Kinyarwanda for error message
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Image 
                source={require('@/assets/logo.jpg')} // Update this path according to your project structure
                style={styles.logo} 
            />
            <Text style={styles.title}>Kwiyandikisha</Text>
            <View style={styles.form}>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Izina ryo kwiyandikisha</Text>
                    <TextInput
                        placeholder="Andika izina"
                        value={newUserName}
                        onChangeText={setNewUserName}
                        style={styles.input}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        placeholder="Andika Imeli"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                        style={styles.input}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Ijambo ry'ibanga</Text>
                    <TextInput
                        placeholder="Andika ijambo ry'ibanga"
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
                            <Text style={styles.buttonText}>Kwiyandikisha</Text>
                        )}
                    </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push("/auth/")}>
                    <Text style={styles.linkTexts}>Ufite konti? Injira Hano</Text>
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
    logo: {
        width: 100, // Adjust the width according to your logo size
        height: 100, // Adjust the height according to your logo size
        marginBottom: 20, // Space between logo and title
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
    linkTexts: {
        color: "blue",
        textAlign: "center",
        marginTop: 20,
    },
});

export default RegisterScreen;
