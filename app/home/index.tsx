import { StyleSheet, TouchableOpacity, Text, View, ScrollView, Alert } from 'react-native'; 
import React, { useEffect, useState } from 'react';
import Greeting from '@/components/Greeting';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '@/services/config'; // Ensure your Firebase config is imported

const HomeScreen = () => {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) {
                setIsLoggedIn(true);
            } else {
                // Redirect to login page if not logged in
                router.push('/auth/'); // Redirect to the auth page
            }
        });

        return () => unsubscribe();
    }, [router]);

    // Optionally, return a loading indicator while checking authentication
    if (!isLoggedIn) {
        return null; // or a loading spinner
    }

    return (
        <ScrollView style={styles.container}>
            <Greeting />
            
            {/* Chat Button */}
            <TouchableOpacity 
                onPress={() => router.navigate("/home/Chats")} 
                style={styles.chatButton}
            >
                <Ionicons name="chatbubble" size={30} color="white" />
                <Text style={styles.chatText}>Chat</Text>
            </TouchableOpacity>

            {/* Grid of Options */}
            <View style={styles.gridContainer}>
                {renderRow([
                    { onPress: () => router.push("/Weather"), icon: "cloud", label: "Iteganya igihe" },
                    { onPress: () => router.push("/Lessons"), icon: "stats-chart-outline", label: "Amasomo kubuhinzi" }
                ])}
                {renderRow([
                    { onPress: () => router.push("/CropManagement"), icon: "leaf-outline", label: "Gukurikirana Igihingwa" },
                    { onPress: () => router.push("/home/Forum"), icon: "people-outline", label: "Uruganiriro" }
                ])}
                {renderRow([
                    { onPress: () => router.push("/Watering"), icon: "water", label: "Kuhira no Kuvomera" },
                    { onPress: () => router.push("/Pests"), icon: "bug-outline", label: "Ibyonyi n' Indwara" }
                ])}
            </View>
        </ScrollView>
    );
}

// Helper function to render rows
const renderRow = (items) => (
    <View style={styles.row}>
        {items.map((item, index) => (
            <TouchableOpacity
                key={index} // Use index as key, consider using a unique ID in a real scenario
                onPress={item.onPress}
                style={styles.cardContainer}
                accessibilityLabel={`Navigate to ${item.label} Screen`}
            >
                <Ionicons name={item.icon} size={40} color="#8BC34A" />
                <Text style={styles.cardLabel}>{item.label}</Text>
            </TouchableOpacity>
        ))}
    </View>
);

export default HomeScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gridContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 20,
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
    chatButton: {
        position: 'absolute', // Absolute positioning for the button
        top: 10, // Adjust this value for vertical placement
        right: 10, // Place it on the right side
        backgroundColor: 'green', // Background color for visibility
        borderRadius: 50, // Make it circular
        padding: 10, // Padding around the icon and text
        elevation: 5, // Shadow effect for depth
        flexDirection: 'row', // Align icon and text horizontally
        alignItems: 'center', // Center them vertically
    },
    chatText: {
        marginLeft: 5, // Space between icon and text
        color: 'white', // Text color for contrast
    },
});
