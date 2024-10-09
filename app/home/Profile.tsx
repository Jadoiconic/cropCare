import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ActivityIndicator,
    FlatList,
    ScrollView, // Import ScrollView
} from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { useEffect, useState } from "react";
import { auth, db } from "@/services/config"; // Adjusted import statement for Firebase
import { doc, getDoc, setDoc, collection, query, getDocs } from "firebase/firestore"; // Import Firestore methods
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth"; // Import createUserWithEmailAndPassword for registering new users

const UserManagementScreen = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [userDetails, setUserDetails] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [newUserEmail, setNewUserEmail] = useState("");
    const [newUserPassword, setNewUserPassword] = useState("");
    const [newUserName, setNewUserName] = useState(""); // New field for user's name
    const [role, setRole] = useState("Expert"); // Default role for new user

    useEffect(() => {
        const fetchUserData = async () => {
            const user = auth.currentUser;
            if (user) {
                const docRef = doc(db, "farmers", user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setUserDetails({ id: user.uid, ...docSnap.data() });
                    if (docSnap.data().role === "Admin") {
                        fetchAllUsers();
                    }
                }
            }
            setLoading(false);
        };

        fetchUserData();
    }, []);

    const fetchAllUsers = async () => {
        const usersCollection = collection(db, "farmers");
        const q = query(usersCollection);
        const querySnapshot = await getDocs(q);
        const usersList: any[] = [];
        querySnapshot.forEach((doc) => {
            usersList.push({ id: doc.id, ...doc.data() });
        });
        setUsers(usersList);
    };

    const handleUpdatePassword = async (newPassword: string) => {
        const user = auth.currentUser;
        if (user) {
            await user.updatePassword(newPassword);
            alert("Password updated successfully!");
        }
    };

    const handleRegisterUser = async () => {
        // Register a new user with the Expert role
        if (newUserEmail && newUserPassword && newUserName) {
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, newUserEmail, newUserPassword);
                const user = userCredential.user;

                // Store new user data in Firestore
                await setDoc(doc(db, "farmers", user.uid), {
                    name: newUserName, // Save the user's name
                    email: user.email,
                    role: role,
                    createdAt: new Date().toISOString(),
                });

                alert("User registered successfully!");
                setNewUserEmail("");
                setNewUserPassword("");
                setNewUserName("");
            } catch (error) {
                alert("Registration failed! " + error.message);
            }
        }
    };

    return (
        <ScrollView style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <View style={{ width: "100%", padding: 20 }}>
                    {userDetails && (
                        <View style={styles.userInfo}>
                            <Text style={styles.title}>Your Details</Text>
                            <Text style={styles.label}>Name: {userDetails.name}</Text>
                            <Text style={styles.label}>Email: {userDetails.email}</Text>
                            <Text style={styles.label}>Role: {userDetails.role}</Text>

                            <TextInput
                                placeholder="New Password"
                                onChangeText={setNewUserPassword}
                                style={styles.input}
                                secureTextEntry
                            />
                            <TouchableOpacity
                                style={styles.button}
                                onPress={() => handleUpdatePassword(newUserPassword)}
                            >
                                <Text style={styles.buttonText}>Update Password</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {userDetails.role === "Admin" && (
                        <View style={styles.registerContainer}>
                            <Text style={styles.title}>Register New User</Text>
                            <TextInput
                                placeholder="User Name"
                                value={newUserName}
                                onChangeText={setNewUserName}
                                style={styles.input}
                            />
                            <TextInput
                                placeholder="User Email"
                                value={newUserEmail}
                                onChangeText={setNewUserEmail}
                                style={styles.input}
                            />
                            <TextInput
                                placeholder="User Password"
                                value={newUserPassword}
                                onChangeText={setNewUserPassword}
                                style={styles.input}
                                secureTextEntry
                            />
                            <TouchableOpacity
                                style={styles.button}
                                onPress={handleRegisterUser}
                            >
                                <Text style={styles.buttonText}>Register User</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <Text style={styles.title}>User List</Text>
                    <FlatList
                        data={users}
                        renderItem={({ item }) => (
                            <View style={styles.userItem}>
                                <Text>{item.name} - {item.email} - {item.role}</Text>
                            </View>
                        )}
                        keyExtractor={(item) => item.id}
                    />
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
    },
    label: {
        fontSize: 18,
    },
    input: {
        width: "100%",
        height: 50,
        borderWidth: 1,
        borderColor: "gray",
        borderRadius: 5,
        paddingHorizontal: 20,
        fontSize: 18,
        marginBottom: 10,
    },
    button: {
        backgroundColor: "#6C63FF",
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 5,
        alignItems: "center",
        marginBottom: 20,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 18,
    },
    userInfo: {
        marginBottom: 20,
        padding: 10,
        borderWidth: 1,
        borderColor: "lightgray",
        borderRadius: 5,
        width: "100%",
    },
    registerContainer: {
        marginBottom: 20,
        padding: 10,
        borderWidth: 1,
        borderColor: "lightgray",
        borderRadius: 5,
        width: "100%",
    },
    userItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: "lightgray",
    },
});

export default UserManagementScreen;
