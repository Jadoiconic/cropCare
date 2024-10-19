import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Alert,
    TextInput,
    Modal,
    Button,
    ScrollView,
} from "react-native";
import { db } from "@/services/config"; // Import your Firebase config
import {
    collection,
    getDocs,
    doc,
    deleteDoc,
    updateDoc,
} from "firebase/firestore";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons"; // Import Material Icons
import { Picker } from '@react-native-picker/picker'; // Import Picker for dropdown

interface Farmer {
    id: string;
    name: string;
    email: string;
    role: string;
    password: string;
}

const AdminScreen: React.FC = () => {
    const router = useRouter();
    const [farmers, setFarmers] = useState<Farmer[]>([]);
    const [filteredFarmers, setFilteredFarmers] = useState<Farmer[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [showUsers, setShowUsers] = useState<boolean>(false); // Add showUsers state

    // Edit Modal states
    const [isEditModalVisible, setEditModalVisible] = useState<boolean>(false);
    const [editUser, setEditUser] = useState<Farmer | null>(null);
    const [editName, setEditName] = useState<string>("");
    const [editEmail, setEditEmail] = useState<string>("");
    const [editRole, setEditRole] = useState<string>("Farmer"); // Default role
    const [editPassword, setEditPassword] = useState<string>("");

    useEffect(() => {
        const fetchFarmers = async () => {
            try {
                const farmersCollection = collection(db, "farmers");
                const farmersSnapshot = await getDocs(farmersCollection);
                const farmersList = farmersSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Farmer[];
                setFarmers(farmersList);
                setFilteredFarmers(farmersList);
            } catch (err) {
                console.error("Error fetching farmers: ", err);
                setError("Failed to load farmers. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchFarmers();
    }, []);

    // Search Functionality
    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (query.trim()) {
            const filtered = farmers.filter(
                (farmer) =>
                    farmer.name.toLowerCase().includes(query.toLowerCase()) ||
                    farmer.email.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredFarmers(filtered);
        } else {
            setFilteredFarmers(farmers);
        }
    };

    // Open Edit Modal
    const openEditModal = (farmer: Farmer) => {
        setEditUser(farmer);
        setEditName(farmer.name);
        setEditEmail(farmer.email);
        setEditRole(farmer.role);
        setEditPassword(farmer.password);
        setEditModalVisible(true);
    };

    // Edit Functionality
    const handleEdit = async () => {
        if (!editUser) return;
        try {
            const farmerDoc = doc(db, "farmers", editUser.id);
            await updateDoc(farmerDoc, {
                name: editName,
                email: editEmail,
                role: editRole,
                password: editPassword,
            });
            setFarmers((prevFarmers) =>
                prevFarmers.map((farmer) =>
                    farmer.id === editUser.id
                        ? {
                              ...farmer,
                              name: editName,
                              email: editEmail,
                              role: editRole,
                              password: editPassword,
                          }
                        : farmer
                )
            );
            setFilteredFarmers((prevFarmers) =>
                prevFarmers.map((farmer) =>
                    farmer.id === editUser.id
                        ? {
                              ...farmer,
                              name: editName,
                              email: editEmail,
                              role: editRole,
                              password: editPassword,
                          }
                        : farmer
                )
            );
            Alert.alert("Success", "User updated successfully!");
            setEditModalVisible(false);
        } catch (error) {
            console.error("Error updating user: ", error);
            Alert.alert("Error", "Failed to update user.");
        }
    };

    // Delete Functionality
    const handleDelete = async (id: string) => {
        try {
            await deleteDoc(doc(db, "farmers", id));
            setFarmers((prevFarmers) =>
                prevFarmers.filter((farmer) => farmer.id !== id)
            );
            setFilteredFarmers((prevFarmers) =>
                prevFarmers.filter((farmer) => farmer.id !== id)
            );
            Alert.alert("Success", "User deleted successfully!");
        } catch (error) {
            console.error("Error deleting user: ", error);
            Alert.alert("Error", "Failed to delete user.");
        }
    };

    const renderUsersList = () => {
        if (loading) {
            return (
                <ActivityIndicator size={40} color="#4CAF50" style={styles.loader} />
            );
        }

        if (error) {
            Alert.alert("Error", error);
            return <Text style={styles.errorText}>{error}</Text>;
        }

        if (filteredFarmers.length === 0) {
            return (
                <Text style={styles.noFarmersText}>No farmers registered yet.</Text>
            );
        }

        return (
            <FlatList
                data={filteredFarmers}
                keyExtractor={(item) => item.id}
                numColumns={1} // Set to 1 for a single row layout
                renderItem={({ item }) => (
                    <View style={styles.farmerCard}>
                        <Text style={styles.farmerName}>{item.name}</Text>
                        <Text style={styles.farmerEmail}>{item.email}</Text>
                        <Text style={styles.farmerRole}>{item.role}</Text>
                        <View style={styles.actions}>
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => openEditModal(item)}
                            >
                                <MaterialIcons name="edit" size={24} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => handleDelete(item.id)}
                            >
                                <MaterialIcons name="delete" size={24} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                contentContainerStyle={styles.container}
            />
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Aho Bagenzurira</Text>

            <View style={styles.gridContainer}>
                <TouchableOpacity
                    style={styles.gridItem}
                    onPress={() => setShowUsers((prev) => !prev)}
                >
                    <Text style={styles.gridText}>Imyirondoro</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.gridItem}
                    onPress={() => router.push("/registerexpert")}
                >
                    <Text style={styles.gridText}>Andikisha Umujyanama</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.gridItem}
                    onPress={() => router.push("/registerfarmer")}
                >
                    <Text style={styles.gridText}>Andikisa Umuhinzi</Text>
                </TouchableOpacity>
            </View>

            {showUsers && (
                <>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Shakisha Ukoresheje izina Cg Emeyili"
                        value={searchQuery}
                        onChangeText={handleSearch}
                    />

                    <ScrollView style={styles.scrollView}>
                        {renderUsersList()}
                    </ScrollView>
                </>
            )}

            <Modal
                visible={isEditModalVisible}
                animationType="slide"
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Vugurura Umwirondoro</Text>
                    <TextInput
                        style={styles.modalInput}
                        placeholder="Amazina"
                        value={editName}
                        onChangeText={setEditName}
                    />
                    <TextInput
                        style={styles.modalInput}
                        placeholder="Email"
                        value={editEmail}
                        onChangeText={setEditEmail}
                    />
                    <Picker
                        selectedValue={editRole}
                        style={styles.picker}
                        onValueChange={(itemValue) => setEditRole(itemValue)}
                    >
                        <Picker.Item label="Farmer" value="Farmer" />
                        <Picker.Item label="Expert" value="Expert" />
                        <Picker.Item label="Admin" value="Admin" />
                    </Picker>
                    <TextInput
                        style={styles.modalInput}
                        placeholder="Ijambo Banga"
                        value={editPassword}
                        onChangeText={setEditPassword}
                        secureTextEntry
                    />
                    <View style={styles.modalActions}>
                        <Button title="Emeza" onPress={handleEdit} />
                        <Button
                            title="Funga"
                            onPress={() => setEditModalVisible(false)}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 16,
        textAlign: "center",
    },
    gridContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    gridItem: {
        flex: 1,
        padding: 16,
        backgroundColor: "#4CAF50",
        borderRadius: 8,
        margin: 4,
        alignItems: "center",
    },
    gridText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    searchInput: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 8,
        marginBottom: 16,
    },
    scrollView: {
        flex: 1,
    },
    farmerCard: {
        backgroundColor: "#f9f9f9",
        padding: 15,
        margin: 10,
        borderRadius: 5,
        elevation: 1,
        flexDirection: "column",
        alignItems: "flex-start",
    },
    farmerName: {
        fontSize: 18,
        fontWeight: "bold",
    },
    farmerEmail: {
        fontSize: 14,
        color: "#555",
    },
    farmerRole: {
        fontSize: 14,
        color: "#555",
    },
    actions: {
        flexDirection: "row",
        marginTop: 10,
    },
    actionButton: {
        backgroundColor: "#4CAF50",
        padding: 10,
        borderRadius: 5,
        marginRight: 5,
    },
    loader: {
        marginTop: 20,
    },
    errorText: {
        color: "red",
        textAlign: "center",
        marginTop: 20,
    },
    noFarmersText: {
        textAlign: "center",
        marginTop: 20,
        fontSize: 16,
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        padding: 20,
        backgroundColor: "#fff",
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
    },
    modalInput: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        marginBottom: 16,
    },
    picker: {
        height: 50,
        width: "100%",
        marginBottom: 16,
    },
    modalActions: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
});

export default AdminScreen;
