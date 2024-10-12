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

interface Farmer {
    id: string;
    name: string;
    email: string;
    role: string; // Added role
    password: string; // Added password
}

const AdminScreen: React.FC = () => {
    const router = useRouter();
    const [farmers, setFarmers] = useState<Farmer[]>([]);
    const [filteredFarmers, setFilteredFarmers] = useState<Farmer[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>(""); // State for search query
    const [showUsers, setShowUsers] = useState<boolean>(false); // State to control visibility of users list

    // Edit Modal states
    const [isEditModalVisible, setEditModalVisible] = useState<boolean>(false);
    const [editUser, setEditUser] = useState<Farmer | null>(null);
    const [editName, setEditName] = useState<string>("");
    const [editEmail, setEditEmail] = useState<string>("");
    const [editRole, setEditRole] = useState<string>(""); // State for user role
    const [editPassword, setEditPassword] = useState<string>(""); // State for user password

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
                setFilteredFarmers(farmersList); // Initialize filtered farmers with all farmers
            } catch (err) {
                console.error("Error fetching farmers: ", err);
                setError("Failed to load farmers. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchFarmers();
    }, []);

    // Count users by role
    const countUsersByRole = () => {
        const counts = { admin: 0, expert: 0, farmer: 0 };

        farmers.forEach((farmer) => {
            if (farmer.role === "Admin") counts.admin++;
            else if (farmer.role === "Expert") counts.expert++;
            else if (farmer.role === "Farmer") counts.farmer++;
        });

        return counts;
    };

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
            setFilteredFarmers(farmers); // Reset to original list if search query is empty
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

        if (farmers.length === 0) {
            return (
                <Text style={styles.noFarmersText}>No farmers registered yet.</Text>
            );
        }

        return (
            <FlatList
                data={filteredFarmers}
                keyExtractor={(item) => item.id}
                numColumns={2} // Display farmers in a grid format
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

    const userCounts = countUsersByRole(); // Get counts for rendering

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Admin Dashboard</Text>

            {/* Grid Section */}
            <View style={styles.gridContainer}>
                <TouchableOpacity
                    style={styles.gridItem}
                    onPress={() => setShowUsers((prev) => !prev)} // Toggle users list visibility
                >
                    <Text style={styles.gridText}>Users</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.gridItem}
                    onPress={() => router.push("/registerexpert")}
                >
                    <Text style={styles.gridText}>Register Expert</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.gridItem}
                    onPress={() => router.push("/registerfarmer")}
                >
                    <Text style={styles.gridText}>Register Farmer</Text>
                </TouchableOpacity>
            </View>

            {/* Conditionally render the list of users */}
            {showUsers && (
                <>
                    {/* Display User Counts */}
                    <View style={styles.userCountContainer}>
                        <Text style={styles.userCountText}>
                            Admins: {userCounts.admin}
                        </Text>
                        <Text style={styles.userCountText}>
                            Experts: {userCounts.expert}
                        </Text>
                        <Text style={styles.userCountText}>
                            Farmers: {userCounts.farmer}
                        </Text>
                    </View>

                    {/* Search Input */}
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChangeText={handleSearch}
                    />

                    <ScrollView style={styles.scrollView}>
                        {renderUsersList()}
                    </ScrollView>
                </>
            )}

            {/* Edit Modal */}
            <Modal
                visible={isEditModalVisible}
                animationType="slide"
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Edit User</Text>
                    <TextInput
                        style={styles.modalInput}
                        placeholder="Name"
                        value={editName}
                        onChangeText={setEditName}
                    />
                    <TextInput
                        style={styles.modalInput}
                        placeholder="Email"
                        value={editEmail}
                        onChangeText={setEditEmail}
                    />
                    <TextInput
                        style={styles.modalInput}
                        placeholder="Role"
                        value={editRole}
                        onChangeText={setEditRole}
                    />
                    <TextInput
                        style={styles.modalInput}
                        placeholder="Password"
                        value={editPassword}
                        onChangeText={setEditPassword}
                        secureTextEntry
                    />
                    <Button title="Save" onPress={handleEdit} />
                    <Button
                        title="Cancel"
                        onPress={() => setEditModalVisible(false)}
                    />
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
    },
    gridContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 20,
    },
    gridItem: {
        backgroundColor: "#4CAF50",
        padding: 20,
        borderRadius: 10,
        width: "30%",
        alignItems: "center",
    },
    gridText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    userCountContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 10,
    },
    userCountText: {
        fontSize: 16,
    },
    searchInput: {
        height: 40,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    scrollView: {
        flex: 1,
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
    },
    farmerCard: {
        backgroundColor: "#f9f9f9",
        padding: 15,
        margin: 10,
        borderRadius: 8,
        flex: 1,
        alignItems: "center",
    },
    farmerName: {
        fontSize: 18,
        fontWeight: "bold",
    },
    farmerEmail: {
        fontSize: 14,
        color: "#666",
    },
    farmerRole: {
        fontSize: 14,
        color: "#666",
    },
    actions: {
        flexDirection: "row",
        marginTop: 10,
    },
    actionButton: {
        backgroundColor: "#4CAF50",
        padding: 10,
        borderRadius: 5,
        marginHorizontal: 5,
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        padding: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
    },
    modalInput: {
        height: 40,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 10,
    },
});

export default AdminScreen;
