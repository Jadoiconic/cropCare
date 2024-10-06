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
import { auth } from "@/services/config";
import { useRouter } from "expo-router";


const SiginInScreen = () => {
    const route = useRouter()
    useEffect(() => {
        const unsbscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                route.navigate("/home");
            }
        });
        return unsbscribe
    }, [])

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setLoading(true);
        try {
            const user = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            if (user) {
                route.navigate("/home");
            }
        } catch (error) {
            alert("Invalid Email or Password!")
            // throw error;
        } finally {
            setLoading(false)
        }
    };
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome to Crop Care</Text>

            <View style={{ width: "100%", height: "50%", padding: 40 }}>
                <View>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            placeholder="example@gmail.com"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={(e) => {
                                setEmail(e);
                                setLoading(false);
                            }}
                            style={styles.input}
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            placeholder="Password"
                            value={password}
                            onChangeText={(e) => setPassword(e)}
                            style={styles.input}
                            secureTextEntry
                        />
                    </View>
                </View>
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: !email || !password.length || loading ? "#9C99ff" : "#6C63FF", }]}
                    disabled={(!email || !password) && loading ? true : false}
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
                        //   navigation.navigate("Home");
                    }}
                >
                    <View>
                        <Text
                            style={[styles.buttonText, { color: "green", textAlign: "right" }]}
                        >
                            forgot a Password?
                        </Text>
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
        backgroundColor: "green",
        marginTop: 20,
    },
    buttonText: {
        fontWeight: "bold",
        fontSize: 20,
        color: "white",
        textAlign: "center",
    },
});

export default SiginInScreen;