// app/screens/Home.tsx
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Button,
    StyleSheet,
    Alert,
    TextInput,
} from 'react-native';
import { requestNotificationPermissions, scheduleReminder } from '@/services/reminderService';

const Home: React.FC = () => {
    const [reminderTitle, setReminderTitle] = useState<string>('');
    const [reminderBody, setReminderBody] = useState<string>('');
    const [reminderTime, setReminderTime] = useState<number | undefined>(undefined);

    useEffect(() => {
        // Request notification permissions on component mount
        requestNotificationPermissions();
    }, []);

    const handleSetReminder = async () => {
        if (!reminderTitle || !reminderBody || !reminderTime) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        const trigger: Notifications.ScheduleNotificationInput = {
            seconds: reminderTime, // Set the reminder time in seconds
            repeats: false,
        };

        try {
            await scheduleReminder(reminderTitle, reminderBody, trigger);
            Alert.alert('Success', 'Reminder set successfully!');
        } catch (error) {
            console.error('Error setting reminder:', error);
            Alert.alert('Error', 'Failed to set reminder');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Set a Reminder</Text>
            <TextInput
                style={styles.input}
                placeholder="Reminder Title"
                value={reminderTitle}
                onChangeText={setReminderTitle}
            />
            <TextInput
                style={styles.input}
                placeholder="Reminder Body"
                value={reminderBody}
                onChangeText={setReminderBody}
            />
            <TextInput
                style={styles.input}
                placeholder="Time in seconds"
                value={reminderTime?.toString()}
                onChangeText={(value) => setReminderTime(Number(value))}
                keyboardType="numeric"
            />
            <Button title="Set Reminder" onPress={handleSetReminder} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
    },
});

export default Home;
