import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Button,
    ProgressBarAndroid, // For Android
    Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Reminder {
    title: string; // Title of the reminder
    body: string; // Description of the reminder
    time: number; // Time in Unix timestamp format
}

const Reminders: React.FC = () => {
    const [reminders, setReminders] = useState<Reminder[]>([]);

    useEffect(() => {
        loadReminders();
    }, []);

    const loadReminders = async () => {
        try {
            const savedReminders = await AsyncStorage.getItem('reminders');
            if (savedReminders) {
                const remindersArray: Reminder[] = JSON.parse(savedReminders);
                setReminders(remindersArray);
            }
        } catch (error) {
            console.error('Error loading reminders:', error);
        }
    };

    const addReminder = async (newReminder: Reminder) => {
        const updatedReminders = [...reminders, newReminder];
        setReminders(updatedReminders);
        await AsyncStorage.setItem('reminders', JSON.stringify(updatedReminders));
    };

    const getTimeRemaining = (time: number) => {
        const currentTime = Math.floor(Date.now() / 1000);
        const remainingTime = time - currentTime;
        return remainingTime > 0 ? remainingTime : 0; // Ensure time is not negative
    };

    const renderProgressBar = (remainingTime: number, totalDuration: number) => {
        const progress = Math.min(remainingTime / totalDuration, 1);

        if (Platform.OS === 'android') {
            return (
                <ProgressBarAndroid
                    styleAttr="Horizontal"
                    color="#4CAF50"
                    progress={progress}
                />
            );
        } else {
            return (
                <View style={styles.progressBar}>
                    <View style={[styles.progress, { width: `${progress * 100}%` }]} />
                </View>
            );
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Reminders for Farmers</Text>
            <Text style={styles.instructions}>
                Here are your upcoming reminders. Keep track of your farming tasks!
            </Text>
            <Button
                title="Add Reminder"
                onPress={() => {
                    // Example reminder object
                    const newReminder: Reminder = {
                        title: 'Water the crops',
                        body: 'Remember to water your crops today.',
                        time: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
                    };
                    addReminder(newReminder);
                }}
            />
            <ScrollView contentContainerStyle={styles.scrollView}>
                {reminders.length === 0 ? (
                    <Text style={styles.noReminders}>No reminders set yet!</Text>
                ) : (
                    reminders.map((reminder, index) => {
                        const remainingTime = getTimeRemaining(reminder.time);
                        const isExpired = remainingTime <= 0;

                        return (
                            <View key={index} style={styles.reminderContainer}>
                                <Text style={styles.reminderTitle}>{reminder.title}</Text>
                                <Text style={styles.reminderBody}>{reminder.body}</Text>
                                <Text style={styles.reminderTime}>
                                    Time Left: {isExpired ? 'Time has passed' : `${Math.floor(remainingTime / 60)} minutes left`}
                                </Text>
                                {renderProgressBar(isExpired ? 0 : remainingTime, reminder.time)}
                                {isExpired && <Text style={styles.status}>Status: Past Due</Text>}
                            </View>
                        );
                    })
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
        color: '#333',
    },
    instructions: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
        color: '#555',
    },
    scrollView: {
        paddingBottom: 20,
    },
    noReminders: {
        textAlign: 'center',
        fontSize: 18,
        color: '#999',
        marginTop: 20,
    },
    reminderContainer: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 1,
    },
    reminderTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    reminderBody: {
        fontSize: 16,
        marginVertical: 5,
    },
    reminderTime: {
        fontSize: 14,
        color: '#777',
    },
    progressBar: {
        height: 10,
        borderRadius: 5,
        backgroundColor: '#e0e0e0',
        overflow: 'hidden',
        marginTop: 10,
    },
    progress: {
        height: '100%',
        backgroundColor: '#4CAF50',
    },
    status: {
        marginTop: 5,
        color: 'red',
        fontWeight: 'bold',
    },
});

export default Reminders;
