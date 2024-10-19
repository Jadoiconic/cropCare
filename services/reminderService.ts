// app/services/reminderService.ts
import * as Notifications from 'expo-notifications';

// Function to request notification permissions
export const requestNotificationPermissions = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        return newStatus === 'granted';
    }
    return true;
};

// Function to schedule a reminder notification
export const scheduleReminder = async (title: string, body: string, trigger: Notifications.ScheduleNotificationInput) => {
    try {
        // Schedule the notification
        await Notifications.scheduleNotificationAsync({
            content: {
                title: title,
                body: body,
                sound: 'default',
            },
            trigger: trigger,
        });
    } catch (error) {
        console.error('Error scheduling reminder:', error);
        throw error; // Rethrow error for further handling
    }
};

// Function to cancel a scheduled notification by ID
export const cancelReminder = async (notificationId: string) => {
    try {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
        console.error('Error cancelling reminder:', error);
    }
};

// Function to get all scheduled notifications
export const getAllScheduledNotifications = async () => {
    try {
        const notifications = await Notifications.getAllScheduledNotificationsAsync();
        return notifications;
    } catch (error) {
        console.error('Error fetching scheduled notifications:', error);
        return [];
    }
};
