import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/services/config'; // Adjust the import to your Firebase config
import { doc, getDoc } from 'firebase/firestore';

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

const Greeting: React.FC = () => {
    const [userName, setUserName] = useState<string | null>(null);
    const currentDate: Date = new Date();

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
        const fetchUserName = async (userId: string) => {
            const userDoc = doc(db, 'farmers', userId); // Adjust to your Firebase document path
            const userSnapshot = await getDoc(userDoc);
            if (userSnapshot.exists()) {
                const userData = userSnapshot.data();
                setUserName(userData?.name || 'Umukoresha');
            }
        };

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                fetchUserName(user.uid);
            } else {
                setUserName(null);
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.greetingText}>
                {getGreeting()}!
            </Text>
            {userName && <Text style={styles.userNameText}>{userName}</Text>}
            <Text style={styles.dateText}>{formattedDate}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#f9f9f9',
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
});

export default Greeting;
