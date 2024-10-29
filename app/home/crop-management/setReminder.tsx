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
        Alert.alert('Icyemezo gikenewe', 'Icyemezo cya notification kirakenewe kugirango ushyireho amamenyesha.');
    }
};

// Schedule a reminder with sound and vibration
const scheduleReminder = async (title: string, body: string, trigger: Notifications.ScheduleNotificationTriggerInput): Promise<void> => {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: title,
            body: body,
            sound: true,
            vibrate: [0, 250, 250, 250],
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
    const [timeUnit, setTimeUnit] = useState<string>(''); // Placeholder
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

    const validateInput = (title: string, body: string, time?: number): boolean => {
        const titleValid = title.trim() !== '' && /[a-zA-Z]/.test(title); // Must be non-empty and contain letters
        const bodyValid = /^[A-Za-z0-9\s]+$/.test(body) && /[a-zA-Z]/.test(body); // Must be alphanumeric and contain letters
        const timeValid = time !== undefined && time > 0; // Must be a positive number

        return titleValid && bodyValid && timeValid;
    };

    const handleSetReminder = async (): Promise<void> => {
        if (!validateInput(reminderTitle, reminderBody, reminderTime) || timeUnit === "") {
            let errorMsg = 'Nyamuneka filled byose mu bibuga, kandi hitamo igihe.';
            if (!validateInput(reminderTitle, reminderBody, reminderTime)) {
                if (reminderTitle.trim() === '') {
                    errorMsg = 'Umutwe w’amamenyesha ntushobora kuba ubusa.';
                } else if (!/[a-zA-Z]/.test(reminderTitle)) {
                    errorMsg = 'Umutwe w’amamenyesha ugomba kugira inyuguti.';
                } else if (!/^[A-Za-z0-9\s]+$/.test(reminderBody)) {
                    errorMsg = 'Ibisobanuro by’amamenyesha bigomba kuba alphanumeric.';
                } else if (!/[a-zA-Z]/.test(reminderBody)) {
                    errorMsg = 'Ibisobanuro by’amamenyesha bigomba kugira inyuguti.';
                } else if (reminderTime === undefined || reminderTime <= 0) {
                    errorMsg = 'Igihe kigomba kuba umubare mwiza.';
                }
            }
            Alert.alert('Error', errorMsg);
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

            Alert.alert('Success', 'Amamenyesha yashyizweho neza!');
            clearInputs();
        } catch (error) {
            console.error('Error setting reminder:', error);
            Alert.alert('Error', 'Gukora amamenyesha byananiranye.');
        }
    };

    const convertTimeToSeconds = (time: number, unit: string): number => {
        const timeUnits: { [key: string]: number } = {
            seconds: 1,
            minutes: 60,
            days: 86400,
            weeks: 604800,
            months: 2628000,
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

    const deleteReminder = async (reminderToDelete: Reminder): Promise<void> => {
        const updatedReminders = reminders.filter(reminder => reminder !== reminderToDelete);
        setReminders(updatedReminders);
        await AsyncStorage.setItem('reminders', JSON.stringify(updatedReminders));

        const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
        const reminderNotification = allNotifications.find(notification => notification.content.title === reminderToDelete.title && notification.content.body === reminderToDelete.body);
        if (reminderNotification) {
            await Notifications.cancelScheduledNotificationAsync(reminderNotification.id);
        }
        
        Alert.alert('Success', 'Amamenyesha yarakuweho neza!');
    };

    const clearInputs = (): void => {
        setReminderTitle('');
        setReminderBody('');
        setReminderTime(undefined);
        setTimeUnit('');
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollView}>
                <Text style={styles.title}>Shyiraho Amamenyesha</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Andika umutwe w'amamenyesha"
                    value={reminderTitle}
                    onChangeText={setReminderTitle}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Andika ibisobanuro by'amamenyesha"
                    value={reminderBody}
                    onChangeText={setReminderBody}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Andika igihe (umubare)"
                    value={reminderTime?.toString()}
                    onChangeText={(value) => {
                        const numericValue = Number(value);
                        if (!isNaN(numericValue)) {
                            setReminderTime(numericValue);
                        }
                    }}
                    keyboardType="numeric"
                />
                <Picker
                    selectedValue={timeUnit}
                    style={styles.picker}
                    onValueChange={(itemValue) => setTimeUnit(itemValue)}
                >
                    <Picker.Item label="Hitamo Igihe" value="" />
                    <Picker.Item label="Amasegonda" value="seconds" />
                    <Picker.Item label="Amasaha" value="minutes" />
                    <Picker.Item label="Iminsi" value="days" />
                    <Picker.Item label="Icyumweru" value="weeks" />
                    <Picker.Item label="Ukwezi" value="months" />
                </Picker>
                <TouchableOpacity style={styles.button} onPress={handleSetReminder}>
                    <Text style={styles.buttonText}>Shyiraho Amamenyesha</Text>
                </TouchableOpacity>

                {/* Display the saved reminders */}
                <DisplayReminders reminders={reminders} onDeleteReminder={deleteReminder} />
            </ScrollView>
        </View>
    );
};

// DisplayReminders Component
const DisplayReminders: React.FC<{ reminders: Reminder[], onDeleteReminder: (reminder: Reminder) => Promise<void> }> = ({ reminders, onDeleteReminder }) => {
    const calculateTimeRemaining = (time: number): string => {
        const currentTime = new Date().getTime();
        const timeDifference = time - currentTime;

        if (timeDifference <= 0) {
            return 'Byarangije';
        }

        const seconds = Math.floor((timeDifference / 1000) % 60);
        const minutes = Math.floor((timeDifference / (1000 * 60)) % 60);
        const hours = Math.floor((timeDifference / (1000 * 60 * 60)) % 24);

        return `${hours}h ${minutes}m ${seconds}s`;
    };

    return (
        <View>
            <Text style={styles.remindersTitle}>Amamenyesha Abitswe:</Text>
            {reminders.length === 0 ? (
                <Text style={styles.reminderText}>Nta mamenyesha abitswe.</Text>
            ) : (
                reminders.map((reminder, index) => (
                    <View key={index} style={styles.reminderContainer}>
                        <Text style={styles.reminderText}>{reminder.title}: {reminder.body}</Text>
                        <Text style={styles.reminderTimeRemaining}>{calculateTimeRemaining(reminder.time)}</Text>
                        <TouchableOpacity onPress={() => onDeleteReminder(reminder)} style={styles.deleteButton}>
                            <Text style={styles.deleteButtonText}>Kuraho</Text>
                        </TouchableOpacity>
                    </View>
                ))
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    scrollView: {
        paddingBottom: 100,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
    },
    picker: {
        height: 50,
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#28a745',
        borderRadius: 5,
        padding: 15,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    remindersTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
    },
    reminderContainer: {
        marginBottom: 10,
        padding: 10,
        borderRadius: 5,
        backgroundColor: '#f8f9fa',
    },
    reminderText: {
        fontSize: 16,
    },
    reminderTimeRemaining: {
        fontSize: 14,
        color: 'gray',
    },
    deleteButton: {
        marginTop: 10,
        backgroundColor: '#dc3545',
        borderRadius: 5,
        padding: 10,
        alignItems: 'center',
    },
    deleteButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default Home;
