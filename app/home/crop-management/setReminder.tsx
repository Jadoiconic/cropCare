import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    TextInput,
    ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Picker } from '@react-native-picker/picker';

// Types for Reminders
interface Reminder {
    title: string;
    body: string;
    time: number;
    unit: string;
}

// Request notification permissions
const requestNotificationPermissions = async (): Promise<void> => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
        Alert.alert('Permission required', 'Notification permissions are required to set reminders.');
    }
};

// Schedule a reminder with sound and vibration
const scheduleReminder = async (title: string, body: string, trigger: Notifications.ScheduleNotificationTriggerInput): Promise<void> => {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: title,
            body: body,
            sound: true,  // Enable sound
            vibrate: [0, 250, 250, 250],  // Add vibration pattern
            priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: trigger,
    });
};

// Home Component
const Home: React.FC = () => {
    const [reminderTitle, setReminderTitle] = useState<string>('');
    const [reminderBody, setReminderBody] = useState<string>('');
    const [reminderTime, setReminderTime] = useState<number | undefined>(undefined);
    const [timeUnit, setTimeUnit] = useState<string>('seconds');
    const [reminders, setReminders] = useState<Reminder[]>([]);

    useEffect(() => {
        requestNotificationPermissions();
        loadSavedReminders();
    }, []);

    const loadSavedReminders = async (): Promise<void> => {
        try {
            const savedReminders = await AsyncStorage.getItem('reminders');
            if (savedReminders) {
                const remindersArray: Reminder[] = JSON.parse(savedReminders);
                setReminders(remindersArray.sort((a, b) => b.time - a.time));
            }
        } catch (error) {
            console.error('Error loading reminders:', error);
        }
    };

    const handleSetReminder = async (): Promise<void> => {
        if (!reminderTitle || !reminderBody || reminderTime === undefined) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }

        const timeInSeconds = convertTimeToSeconds(reminderTime, timeUnit);

        const trigger: Notifications.ScheduleNotificationTriggerInput = {
            seconds: timeInSeconds,
            repeats: false,
        };

        try {
            await scheduleReminder(reminderTitle, reminderBody, trigger);

            const reminder: Reminder = {
                title: reminderTitle,
                body: reminderBody,
                time: new Date().getTime() + timeInSeconds * 1000,
                unit: timeUnit,
            };
            await saveReminder(reminder);

            setReminders((prevReminders) => {
                const updatedReminders = [...prevReminders, reminder];
                return updatedReminders.sort((a, b) => b.time - a.time);
            });

            Alert.alert('Success', 'Reminder set successfully!');
            clearInputs();
        } catch (error) {
            console.error('Error setting reminder:', error);
            Alert.alert('Error', 'Failed to set the reminder.');
        }
    };

    const convertTimeToSeconds = (time: number, unit: string): number => {
        const timeUnits: { [key: string]: number } = {
            seconds: 1,
            minutes: 60,
            days: 86400,
            weeks: 604800,
            months: 2628000,  // Approximate month duration
        };
        return time * (timeUnits[unit] || 1);
    };

    const saveReminder = async (reminder: Reminder): Promise<void> => {
        try {
            const savedReminders = await AsyncStorage.getItem('reminders');
            const remindersArray: Reminder[] = savedReminders ? JSON.parse(savedReminders) : [];
            remindersArray.push(reminder);
            await AsyncStorage.setItem('reminders', JSON.stringify(remindersArray));
        } catch (error) {
            console.error('Error saving reminder:', error);
        }
    };

    const clearInputs = (): void => {
        setReminderTitle('');
        setReminderBody('');
        setReminderTime(undefined);
        setTimeUnit('seconds');
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollView}>
                <Text style={styles.title}>Set Reminder</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter reminder title"
                    value={reminderTitle}
                    onChangeText={setReminderTitle}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Enter reminder details"
                    value={reminderBody}
                    onChangeText={setReminderBody}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Enter time"
                    value={reminderTime?.toString()}
                    onChangeText={(value) => setReminderTime(Number(value))}
                    keyboardType="numeric"
                />
                <Picker
                    selectedValue={timeUnit}
                    style={styles.picker}
                    onValueChange={(itemValue) => setTimeUnit(itemValue)}
                >
                    <Picker.Item label="Seconds" value="seconds" />
                    <Picker.Item label="Minutes" value="minutes" />
                    <Picker.Item label="Days" value="days" />
                    <Picker.Item label="Weeks" value="weeks" />
                    <Picker.Item label="Months" value="months" />
                </Picker>
                <TouchableOpacity style={styles.button} onPress={handleSetReminder}>
                    <Text style={styles.buttonText}>Set Reminder</Text>
                </TouchableOpacity>

                {/* Display the saved reminders */}
                <DisplayReminders reminders={reminders} />
            </ScrollView>
        </View>
    );
};

// DisplayReminders Component
const DisplayReminders: React.FC<{ reminders: Reminder[] }> = ({ reminders }) => {
    const calculateTimeRemaining = (time: number): string => {
        const currentTime = new Date().getTime();
        const timeDifference = time - currentTime;

        if (timeDifference <= 0) {
            return 'Expired';
        } else {
            const hours = Math.floor(timeDifference / (1000 * 60 * 60));
            const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
            return `Pending - ${hours}h ${minutes}m remaining`;
        }
    };

    return (
        <View>
            {reminders.map((reminder, index) => (
                <View key={index} style={styles.reminderItem}>
                    <Text style={styles.reminderTitle}>{reminder.title}</Text>
                    <Text>{reminder.body}</Text>
                    <Text style={styles.reminderStatus}>
                        {calculateTimeRemaining(reminder.time)}
                    </Text>
                </View>
            ))}
        </View>
    );
};

// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    scrollView: {
        paddingBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333',
    },
    input: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 15,
        paddingHorizontal: 15,
        backgroundColor: '#fff',
        fontSize: 16,
    },
    picker: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 15,
        backgroundColor: '#fff',
    },
    button: {
        backgroundColor: '#4CAF50',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
    },
    reminderItem: {
        backgroundColor: '#fff',
        padding: 10,
        marginVertical: 5,
        borderRadius: 5,
    },
    reminderTitle: {
        fontWeight: 'bold',
        fontSize: 18,
    },
    reminderStatus: {
        marginTop: 5,
        color: 'gray',
    },
});

export default Home;
