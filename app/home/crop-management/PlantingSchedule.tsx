// PlantingSchedule.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Alert, TouchableOpacity, TextInput, FlatList, ScrollView } from 'react-native';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { auth, db } from '@/services/config';
import { collection, addDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'expo-router'; // Corrected import

const PlantingSchedule: React.FC = () => {
    const [plantingDate, setPlantingDate] = useState<Date | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [cropType, setCropType] = useState<'Ibigori' | 'Ibirayi' | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [performedActions, setPerformedActions] = useState<string>('');
    const [farmName, setFarmName] = useState<string>('');
    const [scheduleList, setScheduleList] = useState<any[]>([]);
    const [remainingDays, setRemainingDays] = useState('');

    const router = useRouter(); // Initialize router

    useEffect(() => {
        const requestPermissions = async () => {
            const { status } = await Notifications.getPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Notification Error', 'Please enable notifications in your settings.');
            }
        };
        requestPermissions();

        // Load any locally stored planting schedules
        loadLocalSchedule();
    }, []);

    useEffect(() => {
        // This listens for auth state changes (e.g., when the user signs in or out)
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // User is signed in, set the userId
                setUserId(user.uid);
            } else {
                // User is signed out, redirect to auth page
                setUserId(null);
                router.replace('/auth');
            }
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    // Load planting schedule from AsyncStorage
    const loadLocalSchedule = async () => {
        try {
            const localSchedule = await AsyncStorage.getItem('localPlantingSchedule');
            if (localSchedule) {
                const scheduleData = JSON.parse(localSchedule);
                if (Array.isArray(scheduleData)) {
                    // Convert any Firebase Timestamp objects to readable dates
                    const formattedSchedules = scheduleData.map(item => ({
                        ...item,
                        plantingDate: new Date(item.plantingDate), // Convert to Date object
                        actionPerformedDate: new Date(item.actionPerformedDate), // Convert to Date object
                    }));

                    // Sort the schedules by plantingDate in descending order
                    formattedSchedules.sort((a, b) => b.plantingDate - a.plantingDate);

                    setScheduleList(formattedSchedules);
                }
            }
        } catch (error) {
            console.error('Failed to load local schedule:', error);
        }
    };


    // Helper function to format the date
    const formatDate = (date: any) => {
        if (!date) return 'N/A';

        if (typeof date === 'string') {
            // Assume date is already a string
            return date;
        } else if (date && typeof date === 'object' && 'seconds' in date && 'nanoseconds' in date) {
            // Convert Firebase Timestamp to JavaScript Date
            return new Date(date.seconds * 1000).toDateString();
        } else if (date instanceof Date) {
            return date.toDateString();
        } else {
            return new Date(date).toDateString();
        }
    };



    // Save the planting date, crop type, and schedule in Firestore and local storage
    const savePlantingDate = async () => {
        if (!plantingDate || !cropType || performedActions.trim() === '' || farmName.trim() === '') {
            Alert.alert('Input Error', 'Please fill all required fields.');
            return;
        }

        try {
            const newScheduleData = {
                cropName: cropType,
                userId,
                status: "Pending",
                farmName,
                plantingDate: plantingDate.toDateString(),
                planningDate: new Date(plantingDate.getTime() + 30 * 24 * 60 * 60 * 1000).toDateString(),
                performedActions: performedActions,
                actionPerformedDate: new Date().toDateString(),
            };

            // Save to Firestore
            await addDoc(collection(db, 'PlantingSchedules'), newScheduleData);

            // Retrieve existing schedule data from AsyncStorage
            const localSchedule = await AsyncStorage.getItem('localPlantingSchedule');
            const existingSchedules = localSchedule ? JSON.parse(localSchedule) : [];

            // Append the new schedule entry and sort it
            const updatedSchedules = Array.isArray(existingSchedules)
                ? [...existingSchedules, newScheduleData]
                : [newScheduleData];

            // Sort the schedules by plantingDate in descending order
            updatedSchedules.sort((a, b) => new Date(b.plantingDate) - new Date(a.plantingDate));

            // Save the updated schedules back to AsyncStorage
            await AsyncStorage.setItem('localPlantingSchedule', JSON.stringify(updatedSchedules));

            // Update state to reflect the new schedule entry
            setScheduleList(updatedSchedules);

            // Schedule the initial notification for the new planting date
            await scheduleInitialNotification(plantingDate);

            Alert.alert('Success', `Planting date saved for ${cropType} on ${plantingDate.toDateString()} and stored locally and in the database.`);
        } catch (error) {
            Alert.alert('Save Error', 'Failed to save the planting schedule to the database.');
            console.error('Firestore Error:', error);
        }
    };


    // Function to delete a schedule
    const deleteSchedule = async (index: number) => {
        try {
            // Remove the schedule from the state list
            const updatedScheduleList = [...scheduleList];
            updatedScheduleList.splice(index, 1);
            setScheduleList(updatedScheduleList);

            // Update the local storage
            await AsyncStorage.setItem('localPlantingSchedule', JSON.stringify(updatedScheduleList));

            Alert.alert('Success', 'Schedule deleted successfully.');
        } catch (error) {
            console.error('Error deleting schedule:', error);
            Alert.alert('Delete Error', 'Failed to delete the schedule.');
        }
    };

    // Function to edit a schedule
    const approveSchedule = async (index: number) => {
        try {
            // Update the status to 'Approved'
            const updatedScheduleList = [...scheduleList];
            updatedScheduleList[index].status = 'Approved';
            setScheduleList(updatedScheduleList);

            // Update local storage
            await AsyncStorage.setItem('localPlantingSchedule', JSON.stringify(updatedScheduleList));

            Alert.alert('Success', 'Schedule approved successfully.');
        } catch (error) {
            console.error('Error approving schedule:', error);
            Alert.alert('Approve Error', 'Failed to approve the schedule.');
        }
    };

    // Function to schedule initial notification for the planting date
    const scheduleInitialNotification = async (date: Date) => {
        const firstNotificationTime = new Date(date);
        firstNotificationTime.setMonth(firstNotificationTime.getMonth() + 1);

        await Notifications.scheduleNotificationAsync({
            content: {
                title: 'CropCare Reminder',
                body: `It's time to apply insecticide to your ${cropType}. Keep your crops healthy!`,
                sound: true,
            },
            trigger: { date: firstNotificationTime, repeats: false },
        });

        await scheduleWeeklyNotifications(firstNotificationTime);
    };

    // Function to schedule weekly notifications starting from the initial date
    const scheduleWeeklyNotifications = async (startDate: Date) => {
        for (let week = 1; week <= 12; week++) {
            const weeklyNotificationTime = new Date(startDate);
            weeklyNotificationTime.setDate(weeklyNotificationTime.getDate() + 7 * week);

            const message = getWeeklyNotificationMessage(week);

            await Notifications.scheduleNotificationAsync({
                content: {
                    title: 'CropCare Weekly Reminder',
                    body: message,
                    sound: true,
                },
                trigger: { date: weeklyNotificationTime, repeats: false },
            });
        }
    };

    const calculateRemainingDays = (targetDate) => {
        const today = new Date();
        const target = new Date(targetDate);

        // Calculate the time difference in milliseconds
        const timeDifference = target - today;

        // Convert time difference from milliseconds to days
        const remainingDays = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

        return remainingDays >= 0 ? remainingDays : 'Expired';
    };

    // Generate the message for weekly notifications
    const getWeeklyNotificationMessage = (week: number): string => {
        if (cropType === 'Ibirayi') {
            return week % 2 === 0 ? 'Time to apply fertilizer to boost potato growth.' : 'Check for pests and diseases in your potato fields.';
        } else if (cropType === 'Ibigori') {
            return week % 3 === 0 ? 'Apply pest control to protect your Ibigori crops from insects.' : 'Irrigate your Ibigori fields to maintain soil moisture.';
        }
        return 'Remember to check your crops!';
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setPlantingDate(selectedDate);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Igihe cyo gutera</Text>
            <View style={styles.cropSelection}>
                <TouchableOpacity
                    style={[styles.cropButton, cropType === 'Ibigori' && styles.selectedButton]}
                    onPress={() => setCropType('Ibigori')}
                >
                    <MaterialCommunityIcons name="corn" size={30} color={cropType === 'Ibigori' ? 'white' : 'black'} />
                    <Text style={styles.buttonText}>Ibigori</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.cropButton, cropType === 'Ibirayi' && styles.selectedButton]}
                    onPress={() => setCropType('Ibirayi')}
                >
                    <MaterialCommunityIcons name="nutrition" size={30} color={cropType === 'Ibirayi' ? 'white' : 'black'} />
                    <Text style={styles.buttonText}>Ibirayi</Text>
                </TouchableOpacity>
            </View>
            <Button title="Kanda hano uhitemo itariki watereyeho" onPress={() => setShowDatePicker(true)} />
            {showDatePicker && (
                <DateTimePicker
                    maximumDate={new Date()} value={plantingDate || new Date()} mode="date" display="default" onChange={handleDateChange} />
            )}
            <TextInput
                style={styles.input}
                placeholder="Igikorwa giteganijwe (e.g., Irrigation, Fertilizing)"
                value={performedActions}
                onChangeText={setPerformedActions}
            />
            <TextInput
                style={styles.input}
                placeholder="Aho umurima uherereye (e.g: Karambi)"
                value={farmName}
                onChangeText={setFarmName}
            />
            <TouchableOpacity onPress={savePlantingDate} style={{ backgroundColor: '#0984e3', padding: 10, borderRadius: 5, marginTop: 10, alignContent:'center' }}>
                <Text style={{color:'white', textAlign:'center', fontWeight:'bold', fontSize:20}}>Bika amakuru!</Text>
            </TouchableOpacity>

            {/* Display Table of Planting Schedules */}
            {scheduleList.length > 0 && (
                <View style={styles.tableContainer}>
                    <Text style={styles.tableHeader}>Ibiteganijwe</Text>
                    <FlatList
                        data={scheduleList}
                        scrollEnabled={false}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item, index }) => (
                            <View style={styles.tableRow}>
                                <Text style={styles.tableCell}>
                                    <Text style={styles.label}>Igihingwa: </Text>
                                    {item.cropName || 'N/A'}
                                </Text>
                                <Text style={styles.tableCell}>
                                    <Text style={styles.label}>Gutera: </Text>
                                    {formatDate(item.plantingDate) || 'N/A'}
                                </Text>
                                <Text style={styles.tableCell}>
                                    <Text style={styles.label}>Umurima: </Text>
                                    {item.farmName || 'N/A'}
                                </Text>
                                <Text style={styles.tableCell}>
                                    <Text style={styles.label}>Igikorwa: </Text>
                                    {item.performedActions || 'N/A'}
                                </Text>
                                <Text style={styles.tableCell}>
                                    <Text style={styles.label}>Byakozwe: </Text>
                                    {formatDate(item.actionPerformedDate) || 'N/A'}
                                </Text>
                                <Text style={styles.tableCell}>
                                    <Text style={styles.label}>Aho bigeze: </Text>
                                    {formatDate(item.status) || 'N/A'}
                                </Text>
                                <Text style={styles.tableCell}>
                                    <Text style={styles.label}>Duration: </Text>
                                    {calculateRemainingDays(item.planningDate) !== 'Expired'
                                        ? `${calculateRemainingDays(item.planningDate)} days remaining`
                                        : 'Expired'}
                                </Text>

                                <View style={styles.buttonRow}>
                                    <Button
                                        title="Delete"
                                        onPress={() => deleteSchedule(index)}
                                        color="#ff4d4d"
                                    />
                                    <Button
                                        title="Approve"
                                        onPress={() => approveSchedule(index)}
                                        color="#5cb85c"
                                    />
                                </View>

                            </View>

                        )}
                    />
                </View>
            )}
        </ScrollView>
    );
};

export default PlantingSchedule;

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#E5F4E3' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    cropSelection: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
    cropButton: { padding: 15, borderRadius: 10, borderWidth: 1, borderColor: 'black', alignItems: 'center' },
    selectedButton: { backgroundColor: 'green', borderColor: 'green' },
    buttonText: { fontSize: 16, fontWeight: 'bold', marginTop: 5 },
    input: { height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 20, paddingHorizontal: 10, borderRadius: 5 },
    tableContainer: { marginTop: 20, backgroundColor: '#FFF3E0', borderRadius: 10, padding: 10 },
    tableHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
    tableRow: {
        flexDirection: 'column',
        padding: 10,
        marginVertical: 5,
        backgroundColor: '#f8f8f8',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,  // For Android shadow
    },
    tableCell: {
        fontSize: 16,
        paddingVertical: 4,
        color: '#333',
    },
    label: {
        fontWeight: 'bold',
        color: '#666',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        paddingHorizontal: 20,
    },
});
