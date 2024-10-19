import { StyleSheet, Text, View, ScrollView, TouchableOpacity, GestureResponderEvent } from 'react-native';
import React, { useEffect, useState } from 'react';
import Greeting from '@/components/Greeting';
import { useRouter } from 'expo-router';
import { auth, db } from '@/services/config';
import { getDoc, doc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

const HomeScreen = () => {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [role, setRole] = useState<string | null>(null); // State to store the user's role
    const [userId, setUserId] = useState<string | null>(null); // State to store user ID

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                setIsLoggedIn(true);
                setUserId(user.uid); // Set user ID
                const userDoc = await getDoc(doc(db, 'farmers', user.uid)); // Assume user roles are stored in 'farmers' collection
                const userData = userDoc.data();
                setRole(userData?.role); // Get the role (Admin, Expert, Farmer) from Firestore
            } else {
                router.push('/auth/'); // Redirect to the auth page if not logged in
            }
        });

        return () => unsubscribe();
    }, [router]);

    // Optionally, return a loading indicator while checking authentication
    if (!isLoggedIn || !role) {
        return null; // or a loading spinner
    }

    const renderContent = () => {
        const farmerItems = [
            { onPress: () => router.push("/Weather"), icon: "cloud", label: "Iteganya igihe" },
            { onPress: () => router.push("/Lessons"), icon: "stats-chart-outline", label: "Amasomo kubuhinzi" },
            { onPress: () => router.push("/CropManagement"), icon: "leaf-outline", label: "Gukurikirana Igihingwa" },
            { onPress: () => router.push("/home/Forum"), icon: "people-outline", label: "Uruganiriro" },
            { onPress: () => router.push("/Watering"), icon: "water", label: "Kuhira no Kuvomera" },
            { onPress: () => router.push("/Pests"), icon: "bug-outline", label: "Ibyonyi n' Indwara" }
        ];

        const expertItems = [
            ...farmerItems.slice(0, 2),
            { onPress: () => router.push("/addfile"), icon: "book-outline", label: "Kongeraho Amasomo" },
            ...farmerItems.slice(3),
            { onPress: () => router.push("/home/ExpertChat"), icon: "chatbubble", label: "Ganiriza Umuhinzi" }
        ];

        const adminItems = [
            ...farmerItems.slice(0, 2),
            { onPress: () => router.push("/manages"), icon: "person", label: "Abakoresha App" },
            { onPress: () => router.push("/addfile"), icon: "book", label: "Kongeraho Infasha Nyigisho" },
            ...farmerItems.slice(2)
        ];

        const items = role === 'Farmer' ? farmerItems
            : role === 'Expert' ? expertItems : adminItems;

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
                    {row.map((item: { onPress: ((event: GestureResponderEvent) => void) | undefined; icon: string | undefined; label: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; }, index: React.Key | null | undefined) => (
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

    return (
        <View style={styles.container}>
            {userId && role && ( // Pass userId and role to Greeting
                <Greeting userId={userId} role={role} />
            )}
            <ScrollView style={styles.scrollContainer}>
                {renderContent()}
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
});
