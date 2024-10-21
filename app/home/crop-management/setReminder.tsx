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

// Request notification permissions
const requestNotificationPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
        Alert.alert('Permission required', 'Notification permissions are required to set reminders.');
    }
};

// Schedule a reminder
const scheduleReminder = async (title: string, body: string, trigger: Notifications.ScheduleNotificationTriggerInput) => {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: title,
            body: body,
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
    const [reminders, setReminders] = useState<any[]>([]);

    useEffect(() => {
        requestNotificationPermissions();
        loadSavedReminders();
    }, []);

    const loadSavedReminders = async () => {
        try {
            const savedReminders = await AsyncStorage.getItem('reminders');
            if (savedReminders) {
                const remindersArray = JSON.parse(savedReminders);
                const sortedReminders = remindersArray.sort((a: any, b: any) => (b.time || 0) - (a.time || 0));
                setReminders(sortedReminders);
            }
        } catch (error) {
            console.error('Error loading reminders:', error);
        }
    };

    const handleSetReminder = async () => {
        if (!reminderTitle || !reminderBody || reminderTime === undefined) {
            Alert.alert('Byanze', 'Mwuzuze Imyanya Yose Yagenwe');
            return;
        }

        let timeInSeconds = reminderTime;
        if (timeUnit === 'minutes') {
            timeInSeconds *= 60;
        } else if (timeUnit === 'days') {
            timeInSeconds *= 86400;
        } else if (timeUnit === 'weeks') {
            timeInSeconds *= 604800;
        } else if (timeUnit === 'months') {
            timeInSeconds *= 2628000;
        }

        const trigger: Notifications.ScheduleNotificationTriggerInput = {
            seconds: timeInSeconds,
            repeats: false,
        };

        try {
            await scheduleReminder(reminderTitle, reminderBody, trigger);

            const reminder = {
                title: reminderTitle,
                body: reminderBody,
                time: new Date().getTime() + timeInSeconds * 1000,
                unit: timeUnit,
            };
            await saveReminder(reminder);

            setReminders((prevReminders) => {
                const updatedReminders = [...prevReminders, reminder];
                return updatedReminders.sort((a, b) => (b.time || 0) - (a.time || 0));
            });

            Alert.alert('Byakunze', 'Urwibutso Rwashyizweho Neza!');
            clearInputs();
        } catch (error) {
            console.error('Error setting reminder:', error);
            Alert.alert('Error', 'Gushyiraho Urwibutso Ntibyakunze');
        }
    };

    const saveReminder = async (reminder: { title: string; body: string; time: number; unit: string }) => {
        try {
            const savedReminders = await AsyncStorage.getItem('reminders');
            const remindersArray = savedReminders ? JSON.parse(savedReminders) : [];
            remindersArray.push(reminder);
            await AsyncStorage.setItem('reminders', JSON.stringify(remindersArray));
        } catch (error) {
            console.error('Error saving reminder:', error);
        }
    };

    const clearInputs = () => {
        setReminderTitle('');
        setReminderBody('');
        setReminderTime(undefined);
        setTimeUnit('seconds');
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollView}>
                <Text style={styles.title}>Shyiraho Urwibutso</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Injza umutwe W'urwibutso"
                    value={reminderTitle}
                    onChangeText={setReminderTitle}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Injizamo Icyo ushaka Kuzibutswa"
                    value={reminderBody}
                    onChangeText={setReminderBody}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Injazmo igihe"
                    value={reminderTime?.toString()}
                    onChangeText={(value) => setReminderTime(Number(value))}
                    keyboardType="numeric"
                />
                <Picker
                    selectedValue={timeUnit}
                    style={styles.picker}
                    onValueChange={(itemValue) => setTimeUnit(itemValue)}
                >
                    <Picker.Item label="Amasegonda" value="seconds" />
                    <Picker.Item label="Iminota" value="minutes" />
                    <Picker.Item label="Imisi" value="days" />
                    <Picker.Item label="Ibyumweru" value="weeks" />
                    <Picker.Item label="Amezi" value="months" />
                </Picker>
                <TouchableOpacity style={styles.button} onPress={handleSetReminder}>
                    <Text style={styles.buttonText}>Shyiraho Urwibutso</Text>
                </TouchableOpacity>

                {/* Display the saved reminders */}
                <DisplayReminders reminders={reminders} />
            </ScrollView>
        </View>
    );
};

// DisplayReminders Component
const DisplayReminders: React.FC<{ reminders: any[] }> = ({ reminders }) => {
    const calculateTimeRemaining = (time: number) => {
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
