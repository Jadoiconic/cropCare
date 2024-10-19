import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '@/services/config';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router'; // Import useRouter

// Function to get the day name from the date
const getDayName = (date: Date): string => {
    const days: string[] = ['Kucyumweru', 'Kuwa Mbere', 'Kuwa Kabiri', 'Kuwa Gatatu', 'Kuwa Kane', 'Kuwa Gatanu', 'Kuwa Gatandatu'];
    return days[date.getDay()];
};

// Function to get the month name from the date
const getMonthName = (date: Date): string => {
    const months: string[] = [
        'Mutarama', 'Gashyantare', 'Werurwe', 'Mata', 'Gicurasi', 'Kamena',
        'Nyakanga', 'Kanama', 'Nzeri', 'Ukwakira', 'Ugushyingo', 'Ukuboza'
    ];
    return months[date.getMonth()];
};

const Greeting: React.FC<{ userId: string; role: string | null }> = ({ userId, role }) => {
    const [userName, setUserName] = useState<string | null>(null);
    const currentDate: Date = new Date();
    const router = useRouter(); // Initialize the router

    // Get current hour for the greeting
    const currentHour: number = currentDate.getHours();

    // Get current day, month, and year
    const dayName: string = getDayName(currentDate);
    const monthName: string = getMonthName(currentDate);
    const day: number = currentDate.getDate();
    const year: number = currentDate.getFullYear();

    // Format the date string
    const formattedDate: string = `${dayName}, ${day} ${monthName}, ${year}`;

    // Determine greeting based on the hour
    const getGreeting = (): string => {
        if (currentHour < 12) {
            return 'Mwaramutse';
        } else if (currentHour < 18) {
            return 'Mwiriwe';
        } else {
            return 'Muraho';
        }
    };

    // Fetch the logged-in user's name
    useEffect(() => {
        const fetchUserName = async () => {
            const userDoc = doc(db, 'farmers', userId); // Adjust to your Firebase document path
            const userSnapshot = await getDoc(userDoc);
            if (userSnapshot.exists()) {
                const userData = userSnapshot.data();
                setUserName(userData?.name || 'Umukoresha');
            }
        };

        if (userId) {
            fetchUserName();
        }
    }, [userId]);

    return (
        <View style={styles.cardContainer}>
            <View style={styles.headerContainer}>
                <View style={styles.container}>
                    <Text style={styles.greetingText}>{getGreeting()}!</Text>
                    {userName && <Text style={styles.userNameText}>{userName}</Text>}
                    <Text style={styles.dateText}>{formattedDate}</Text>
                </View>

                {role === 'Farmer' && ( // Render chat button only for Farmers
                    <TouchableOpacity 
                        onPress={() => router.push('/home/Chats')} // Navigate to the chat screen
                        style={styles.chatButton}
                    >
                        <Ionicons name="chatbubble" size={30} color="white" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        padding: 20,
        margin: 20,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        elevation: 3,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    container: {
        // No need for additional padding here
    },
    greetingText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#000',
    },
    userNameText: {
        fontSize: 20,
        fontWeight: '500',
        color: '#555',
        marginTop: 5, // Space between greeting and username
    },
    dateText: {
        fontSize: 16,
        color: '#888',
        marginTop: 10,
    },
    chatButton: {
        backgroundColor: '#A8E6CE', // White-green color
        padding: 10,
        borderRadius: 20,
        alignSelf: 'flex-start', // Adjust to align at top right
    },
});

export default Greeting;
