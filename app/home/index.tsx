import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import Greeting from '@/components/Greeting';
import { useRouter } from 'expo-router';
import { auth, db } from '@/services/config';
import { getDoc, doc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

const HomeScreen = () => {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [role, setRole] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            setLoading(true); // Start loading
            if (user) {
                setIsLoggedIn(true);
                setUserId(user.uid);
                try {
                    const userDoc = await getDoc(doc(db, 'farmers', user.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        setRole(userData?.role); // Store user role
                    } else {
                        console.error("User document does not exist.");
                        setRole(null);
                    }
                } catch (error) {
                    console.error("Error fetching user role:", error);
                    setRole(null);
                }
            } else {
                setIsLoggedIn(false);
                setRole(null);
                setUserId(null);
            }
            setLoading(false); // End loading
        });

        return () => unsubscribe();
    }, [router]);

    const renderContent = () => {
        // Define common items accessible to all users
        const commonItems = [
            { onPress: () => router.push("/Weather"), icon: "cloud", label: "Iteganya igihe" },
            { onPress: () => router.push("/Lessons"), icon: "stats-chart-outline", label: "Amasomo kubuhinzi" },
            { onPress: () => router.push("/CropManagement"), icon: "leaf-outline", label: "Gukurikirana Igihingwa" },
            { onPress: () => router.push("/home/Forum"), icon: "people-outline", label: "Uruganiriro" }, // No restriction
            { onPress: () => router.push("/Watering"), icon: "water", label: "Kuhira no Kuvomera" },
            { onPress: () => router.push("/Pests"), icon: "bug-outline", label: "Ibyonyi n' Indwara" } // No restriction
        ];

        // Define role-based items for authenticated users
        const expertItems = [
            ...commonItems.slice(0, 2),
            { onPress: () => router.push("/addfile"), icon: "book-outline", label: "Kongeraho Amasomo" },
            ...commonItems.slice(3),
            { onPress: () => router.push("/home/ExpertChat"), icon: "chatbubble", label: "Ganiriza Umuhinzi" } // No restriction
        ];

        const adminItems = [
            ...commonItems.slice(0, 2),
            { onPress: () => router.push("/home/manages"), icon: "person", label: "Abakoresha App" },
            { onPress: () => router.push("/addfile"), icon: "book", label: "Kongeraho Infasha Nyigisho" },
            ...commonItems.slice(2)
        ];

        // Determine items based on login and role
        let items = commonItems; // Default to common items
        if (isLoggedIn) {
            if (role === 'Farmer') {
                items = commonItems; // Farmers see common items
            } else if (role === 'Expert') {
                items = expertItems; // Experts see expert items
            } else if (role === 'Admin') {
                items = adminItems; // Admins see admin items
            }
        }

        return (
            items.reduce((rows, item, index) => {
                if (index % 2 === 0) {
                    rows.push([item]);
                } else {
                    rows[rows.length - 1].push(item);
                }
                return rows;
            }, []).map((row, index) => (
                <View key={index} style={styles.row}>
                    {row.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={item.onPress}
                            style={styles.cardContainer}
                        >
                            <Ionicons name={item.icon} size={40} color="#8BC34A" />
                            <Text style={styles.cardLabel}>{item.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            ))
        );
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    return (
        <View style={styles.container}>
            {isLoggedIn && userId && role && (
                <Greeting userId={userId} role={role} />
            )}
            <ScrollView style={styles.scrollContainer}>
                {renderContent()}
                {!isLoggedIn && (
                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={() => router.push('/auth/')}
                    >
                        <Text style={styles.loginButtonText}>Injira</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </View>
    );
};

export default HomeScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
    },
    scrollContainer: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginVertical: 10,
    },
    cardContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        elevation: 3,
        width: '45%',
        aspectRatio: 1,
        margin: 10,
    },
    cardLabel: {
        marginTop: 10,
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
        color: '#333',
    },
    loginButton: {
        backgroundColor: '#8BC34A',
        borderRadius: 5,
        padding: 10,
        alignItems: 'center',
        marginVertical: 20,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
