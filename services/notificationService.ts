import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native';

// Request permissions for notifications
export const requestNotificationPermissions = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
        Alert.alert('Permission Required', 'You need to enable notifications to use this feature.');
        return false; // Return false if permission is not granted
    }
    return true; // Return true if permission is granted
};

// Schedule a notification
export const scheduleNotification = async (date: Date, cropType: string) => {
    // First, request notification permissions
    const isGranted = await requestNotificationPermissions();
    if (!isGranted) return; // Do not schedule if permission is not granted

    await Notifications.scheduleNotificationAsync({
        content: {
            title: 'Kwibutsa Biturutse Kuri CropCare',
            body: `Ni igihe cyo ${cropType} igikorwa!`,
            sound: true,
        },
        trigger: { date: new Date(date.getTime() + 24 * 60 * 60 * 1000) }, // Schedule for the next day
    });
};

// Optionally, you can also create a method to cancel notifications
export const cancelNotification = async (identifier: string) => {
    await Notifications.cancelScheduledNotificationAsync(identifier);
};
