import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import { db } from "@/services/config"; // Import your Firebase config
import { collection, getDocs } from "firebase/firestore";
import { useRouter } from "expo-router";

interface ExpertRequest {
    id: string;
    requestDescription: string;
    requesterEmail: string;
}

const ExpertScreen: React.FC = () => {
    const router = useRouter();
    const [expertRequests, setExpertRequests] = useState<ExpertRequest[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchExpertRequests = async () => {
            try {
                const requestsCollection = collection(db, "expertRequests"); // Assuming you have a collection for expert requests
                const requestsSnapshot = await getDocs(requestsCollection);
                const requestsList = requestsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ExpertRequest[];
                setExpertRequests(requestsList);
            } catch (error) {
                console.error("Error fetching expert requests: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchExpertRequests();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Expert Dashboard</Text>
            {loading ? (
                <ActivityIndicator size={30} color="#000" />
            ) : (
                <FlatList
                    data={expertRequests}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.requestItem}>
                            <Text>{item.requestDescription}</Text>
                            <Text>{item.requesterEmail}</Text>
                        </View>
                    )}
                />
            )}
            <TouchableOpacity onPress={() => {/* Navigate to create new request */}}>
                <Text style={styles.link}>Create New Request</Text>
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
    requestItem: {
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

export default ExpertScreen;
