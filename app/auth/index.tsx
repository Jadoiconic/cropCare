import React, { useState } from "react";
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/services/config"; // Firebase config
import { collection, getDocs, query, where } from "firebase/firestore";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage

const LoginScreen = () => {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setLoading(true);

        try {
            // Query the Firestore to find user with the provided username
            const userQuery = query(
                collection(db, "farmers"),
                where("name", "==", username)
            );
            const querySnapshot = await getDocs(userQuery);

            // Check if the username exists
            if (querySnapshot.empty) {
                alert("Izina Winjije Ntabwo Ribashije Kuboneka Reba Ko Waryanditse neza Wongere Ugerageze");
                setLoading(false);
                return;
            }

            // Retrieve the email from the document
            const userData = querySnapshot.docs[0].data();
            const userEmail = userData.email;

            // Authenticate with Firebase Auth using the email and password
            await signInWithEmailAndPassword(auth, userEmail, password);

            // Store user data in AsyncStorage
            await AsyncStorage.setItem("user", JSON.stringify(userData));

            alert("Kwinjira Byagenze Neza!");
            router.push("/home"); // Adjust route as needed
        } catch (error) {
            alert("Kwinjira Byanze! " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Injira</Text>
            <View style={styles.form}>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Izina</Text>
                    <TextInput
                        placeholder="Injiza Izina Ukoresha"
                        value={username}
                        onChangeText={setUsername}
                        style={styles.input}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Ijambo Banga</Text>
                    <TextInput
                        placeholder="Injiza Ijambo Banga"
                        value={password}
                        onChangeText={setPassword}
                        style={styles.input}
                        secureTextEntry
                    />
                </View>
                <View>
                <TouchableOpacity onPress={() => router.push("/auth/resetPassword")}>
                    <Text style={styles.linkTextt}>Niba Wibagiwe Ijambo Banga Kanda Hano</Text>
                </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: loading ? "gray" : "#4CAF50" }]}
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

                <TouchableOpacity onPress={() => router.push("/auth/Register")}>
                    <Text style={styles.linkText}>Muhinzi Niba Nta Konti Ufite Iyandikishe Hano</Text>
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
    linkTextt: {
        color: "red",
        textAlign: "center",
        marginTop: 20,
    },
});

export default LoginScreen;
