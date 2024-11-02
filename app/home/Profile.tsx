import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    Image,
} from "react-native";
import { TextInput } from "react-native";
import { useEffect, useState } from "react";
import { auth, db } from "@/services/config";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";

const UserManagementScreen = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [userDetails, setUserDetails] = useState<any>(null);
    const [newUserPassword, setNewUserPassword] = useState("");

    useEffect(() => {
        const loadUserData = async () => {
            const user = auth.currentUser;

            if (user) {
                try {
                    const storedUserData = await AsyncStorage.getItem("userDetails");
                    if (storedUserData) {
                        setUserDetails(JSON.parse(storedUserData));
                        setLoading(false);
                    } else {
                        await fetchUserData();
                    }
                } catch (error) {
                    console.error("Failed to parse stored user data:", error);
                    await fetchUserData();
                }
            } else {
                alert("Nyamuneka winjire kugirango ugerweho iyi paji.");
                router.replace('/auth');
            }
        };

        const fetchUserData = async () => {
            const user = auth.currentUser;
            if (user) {
                const docRef = doc(db, "farmers", user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = { id: user.uid, ...docSnap.data() };
                    setUserDetails(data);
                    await AsyncStorage.setItem("userDetails", JSON.stringify(data));
                }
            }
            setLoading(false);
        };

        loadUserData();
    }, []);

    return (
        <ScrollView style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#008000" />
            ) : (
                <View style={styles.content}>
                    <View style={styles.logoContainer}>
                        <Image
                            source={require("@/assets/logo.jpg")} // Ensure logo.png is in the correct path
                            style={styles.logo}
                        />
                    </View>
                    {userDetails && (
                        <View style={styles.userInfo}>
                            <Text style={styles.title}>Amakuru yawe</Text>
                            <Text style={styles.label}>Izina: {userDetails.name}</Text>
                            <Text style={styles.label}>Imeli: {userDetails.email}</Text>
                            <Text style={styles.label}>Umwanya: {userDetails.role}</Text>
                        </View>
                    )}
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F3F4F6",
    },
    content: {
        width: "100%",
        padding: 20,
    },
    logoContainer: {
        alignItems: "center",
        marginBottom: 20,
    },
    logo: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: "#008000",
    },
    title: {
        fontSize: 26,
        fontWeight: "700",
        color: "#008000",
        marginBottom: 10,
        textAlign: "center",
    },
    label: {
        fontSize: 18,
        color: "#333",
        marginBottom: 8,
        lineHeight: 24,
    },
    userInfo: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 10,
        borderColor: "#D1D5DB",
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        marginBottom: 20,
    },
    input: {
        width: "100%",
        height: 50,
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 10,
        paddingHorizontal: 16,
        fontSize: 16,
        backgroundColor: "#fff",
        marginBottom: 16,
    },
    button: {
        backgroundColor: "#008000",
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 20,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 18,
    },
});

export default UserManagementScreen;
