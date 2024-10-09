import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import { db } from "@/services/config"; // Import your Firebase config
import { collection, getDocs } from "firebase/firestore";
import { useRouter } from "expo-router";

interface Farmer {
    id: string;
    name: string;
    email: string;
}

const AdminScreen: React.FC = () => {
    const router = useRouter();
    const [farmers, setFarmers] = useState<Farmer[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchFarmers = async () => {
            try {
                const farmersCollection = collection(db, "farmers");
                const farmersSnapshot = await getDocs(farmersCollection);
                const farmersList = farmersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Farmer[];
                setFarmers(farmersList);
            } catch (error) {
                console.error("Error fetching farmers: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFarmers();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Admin Dashboard</Text>
            {loading ? (
                <ActivityIndicator size={30} color="#000" />
            ) : (
                <FlatList
                    data={farmers}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.farmerItem}>
                            <Text>{item.name}</Text>
                            <Text>{item.email}</Text>
                        </View>
                    )}
                />
            )}
            <TouchableOpacity onPress={() => router.push("/auth/Register")}>
                <Text style={styles.link}>Register a new farmer</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },
    title: {
        fontSize: 30,
        fontWeight: "bold",
    },
    farmerItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: "gray",
        width: "100%",
    },
    link: {
        color: "blue",
        marginTop: 20,
    },
});

export default AdminScreen;
