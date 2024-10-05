import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Define a function to get the day name from the date
const getDayName = (date: Date): string => {
    const days: string[] = ['Kucyumweru', 'Kuwa Mbere', 'Kuwa Kabiri', 'Kuwa Gatatu', 'Kuwa Kane', 'Kuwa Gatanu', 'Kuwa Gatandatu'];
    return days[date.getDay()];
};

// Define a function to get the month name from the date
const getMonthName = (date: Date): string => {
    const months: string[] = [
        'Mutarama', 'Gashyantare', 'Werurwe', 'Mata', 'Gicurasi', 'Kamena',
        'Nyakanga', 'Kanama', 'Nzeri', 'Ukwakira', 'Ugushyingo', 'Ukuboza'
    ];
    return months[date.getMonth()];
};

const Greeting: React.FC = () => {
    const currentDate: Date = new Date();

    // Get current hour for the greeting
    const currentHour: number = currentDate.getHours();

    // Get current day, month, and year
    const dayName: string = getDayName(currentDate);
    const monthName: string = getMonthName(currentDate);
    const day: number = currentDate.getDate();
    const year: number = currentDate.getFullYear();

    // Format the date string (e.g., "Wednesday, 2 October, 2024")
    const formattedDate: string = `${dayName}, ${day} ${monthName}, ${year}`;

    // Determine greeting based on the hour
    const getGreeting = (): string => {
        if (currentHour < 12) {
            return 'Mwaramutse!';
        } else if (currentHour < 18) {
            return 'Mwiriwe!';
        } else {
            return 'Muraho!';
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.greetingText}>{getGreeting()}</Text>
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
    dateText: {
        fontSize: 16,
        color: '#888',
        marginTop: 10,
    },
});

export default Greeting;
