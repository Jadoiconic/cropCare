// app/screens/Home.tsx
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
import { requestNotificationPermissions, scheduleReminder } from '@/services/reminderService';
import { Picker } from '@react-native-picker/picker'; // Import Picker from the new package

const Home: React.FC = () => {
    const [reminderTitle, setReminderTitle] = useState<string>('');
    const [reminderBody, setReminderBody] = useState<string>('');
    const [reminderTime, setReminderTime] = useState<number | undefined>(undefined);
    const [timeUnit, setTimeUnit] = useState<string>('seconds'); // State to hold the selected time unit

    useEffect(() => {
        // Request notification permissions on component mount
        requestNotificationPermissions();
        loadSavedReminders();
    }, []);

    const loadSavedReminders = async () => {
        try {
            const savedReminders = await AsyncStorage.getItem('reminders');
            if (savedReminders) {
                const remindersArray = JSON.parse(savedReminders);
                console.log('Loaded reminders:', remindersArray);
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

        // Convert the reminder time based on the selected unit
        let timeInSeconds = reminderTime;
        if (timeUnit === 'minutes') {
            timeInSeconds *= 60;
        } else if (timeUnit === 'days') {
            timeInSeconds *= 86400; // 24 * 60 * 60
        } else if (timeUnit === 'weeks') {
            timeInSeconds *= 604800; // 7 * 24 * 60 * 60
        } else if (timeUnit === 'months') {
            timeInSeconds *= 2628000; // Approximate for a month
        }

        const trigger: Notifications.ScheduleNotificationInput = {
            seconds: timeInSeconds, // Set the reminder time in seconds
            repeats: false,
        };

        try {
            await scheduleReminder(reminderTitle, reminderBody, trigger);

            // Save the reminder to local storage
            const reminder = { title: reminderTitle, body: reminderBody, time: reminderTime, unit: timeUnit };
            await saveReminder(reminder);

            Alert.alert('Byakunze', 'Urwibutso Rwashyizweho Neza!');
            clearInputs();
        } catch (error) {
            console.error('Error setting reminder:', error);
            Alert.alert('Error', 'Gushyiraho Urwibutso Ntibyakunze');
        }
    };

    const saveReminder = async (reminder: { title: string; body: string; time: number | undefined; unit: string }) => {
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
        setTimeUnit('seconds'); // Reset time unit to default
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
        fontWeight: 'bold',
    },
});

export default Home;
