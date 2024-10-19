import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    Button,
} from 'react-native';
import { auth, db } from '@/services/config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const ScheduledReminders: React.FC = () => {
    const [reminders, setReminders] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null); // Error state

    useEffect(() => {
        const fetchReminders = async () => {
            try {
                const userId = auth.currentUser?.uid;
                const remindersRef = collection(db, 'PlantingSchedules');
                const q = query(remindersRef, where('userId', '==', userId));

                const unsubscribe = onSnapshot(q, (querySnapshot) => {
                    const schedules: any[] = [];
                    querySnapshot.forEach((doc) => {
                        schedules.push({ id: doc.id, ...doc.data() });
                    });

                    setReminders(schedules);
                    setLoading(false);
                }, (error) => {
                    setError(error.message);
                    setLoading(false);
                });

                // Clean up the listener on unmount
                return () => unsubscribe();
            } catch (err) {
                setError((err as Error).message);
                setLoading(false);
            }
        };

        fetchReminders();
    }, []);

    // Function to calculate next action date based on planting date and predefined intervals
    const calculateNextActionDate = (plantingDate: string, cropType: string) => {
        const date = new Date(plantingDate);
        let nextActionDays = 0;

        // Define action intervals based on crop type or predefined actions
        if (cropType === 'Potatoes') {
            nextActionDays = 30; // Example: fertilize after 30 days for potatoes
        } else if (cropType === 'Maize') {
            nextActionDays = 40; // Example: weed control after 40 days for maize
        } else {
            nextActionDays = 20; // Default action after 20 days
        }

        const nextActionDate = new Date(date);
        nextActionDate.setDate(date.getDate() + nextActionDays);
        return nextActionDate.toLocaleDateString();
    };

    const renderReminderItem = ({ item }: { item: any }) => (
        <View style={styles.reminderItem}>
            <Text style={styles.reminderText}>Crop: {item.cropName}</Text>
            <Text style={styles.reminderText}>Farm: {item.farmName}</Text>
            <Text style={styles.reminderText}>Actions: {item.performedActions}</Text>
            <Text style={styles.reminderText}>
                Planting Date: {new Date(item.plantingDate).toLocaleDateString()}
            </Text>
            <Text style={styles.reminderText}>
                Next Action Date: {calculateNextActionDate(item.plantingDate, item.cropName)}
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Scheduled Reminders</Text>
            {loading ? (
                <ActivityIndicator size="large" color="#007bff" style={styles.loadingIndicator} />
            ) : error ? (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Error: {error}</Text>
                    <Button title="Retry" onPress={() => {
                        setLoading(true);
                        setError(null);
                        // Optionally, re-fetch reminders
                        fetchReminders();
                    }} />
                </View>
            ) : reminders.length === 0 ? (
                <Text style={styles.emptyText}>No scheduled reminders found.</Text>
            ) : (
                <FlatList
                    data={reminders}
                    keyExtractor={(item) => item.id}
                    renderItem={renderReminderItem}
                    contentContainerStyle={styles.listContainer}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        flex: 1,
        backgroundColor: '#f9f9f9',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#333',
    },
    loadingIndicator: {
        marginVertical: 20,
    },
    reminderItem: {
        padding: 15,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 8,
        marginVertical: 5,
        backgroundColor: '#fff',
    },
    reminderText: {
        fontSize: 16,
        color: '#555',
    },
    errorContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginBottom: 10,
    },
    emptyText: {
        textAlign: 'center',
        fontSize: 18,
        color: '#888',
        marginTop: 20,
    },
    listContainer: {
        paddingBottom: 20,
    },
});

export default ScheduledReminders;
