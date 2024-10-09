import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, Button, Alert, TouchableOpacity, TextInput, FlatList, ScrollView, ActivityIndicator
} from 'react-native';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { auth, db } from '@/services/config';
import { collection, addDoc, query, where, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import moment from 'moment'; // To easily calculate remaining days

const PlantingSchedule: React.FC = () => {
    const [plantingDate, setPlantingDate] = useState<Date | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [cropType, setCropType] = useState<'Ibigori' | 'Ibirayi' | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [performedActions, setPerformedActions] = useState<string>('');
    const [farmName, setFarmName] = useState<string>('');
    const [scheduleList, setScheduleList] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const router = useRouter();

    useEffect(() => {
        const requestPermissions = async () => {
            const { status } = await Notifications.getPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission error', 'Please enable notifications in your settings.');
            }
        };
        requestPermissions();
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
                fetchUserSchedules(user.uid);
            } else {
                setUserId(null);
                router.replace('/auth');
            }
        });
        return () => unsubscribe();
    }, []);

    const fetchUserSchedules = async (userId: string) => {
        const schedulesRef = collection(db, 'PlantingSchedules');
        const q = query(schedulesRef, where('userId', '==', userId));

        onSnapshot(q, async (querySnapshot) => {
            const schedules: any[] = [];
            querySnapshot.forEach((doc) => {
                schedules.push({ id: doc.id, ...doc.data() });
            });
            setScheduleList(schedules);
            setLoading(false);
            await AsyncStorage.setItem(userId, JSON.stringify(schedules)); // Store in AsyncStorage
        });

        const storedSchedules = await AsyncStorage.getItem(userId);
        if (storedSchedules) {
            setScheduleList(JSON.parse(storedSchedules));
            setLoading(false);
        }
    };

    const formatDate = (date: any) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-GB');
    };

    const calculateRemainingDays = (plantingDate: string) => {
        const currentDate = moment();
        const plantedDate = moment(plantingDate);
        const diffDays = currentDate.diff(plantedDate, 'days');
        return diffDays >= 30 ? 0 : 30 - diffDays; // Treatment starts after 30 days for potatoes
    };

    const savePlantingDate = async () => {
        if (!plantingDate || !cropType || performedActions.trim() === '' || farmName.trim() === '') {
            Alert.alert('Input error', 'Please fill in all required fields.');
            return;
        }

        try {
            const newScheduleData = {
                cropName: cropType,
                userId,
                status: 'Pending',
                farmName,
                plantingDate: plantingDate.toISOString(),
                performedActions,
            };

            await addDoc(collection(db, 'PlantingSchedules'), newScheduleData);
            setScheduleList([...scheduleList, newScheduleData]);

            await scheduleInitialNotification(plantingDate);

            Alert.alert('Success', `The planting schedule for ${cropType} has been saved on ${plantingDate.toLocaleDateString()}.`);
            clearForm();
        } catch (error) {
            Alert.alert('Save error', 'Could not save planting schedule.');
            console.error('Firestore Error:', error);
        }
    };

    const clearForm = () => {
        setPlantingDate(null);
        setCropType(null);
        setPerformedActions('');
        setFarmName('');
    };

    const markAsComplete = async (scheduleId: string) => {
        try {
            const scheduleRef = doc(db, 'PlantingSchedules', scheduleId);
            await updateDoc(scheduleRef, { status: 'Completed' });
            Alert.alert('Success', 'Schedule marked as completed.');
        } catch (error) {
            Alert.alert('Error', 'Could not update the schedule status.');
            console.error('Update Error:', error);
        }
    };

    const deleteSchedule = async (scheduleId: string) => {
        try {
            const scheduleRef = doc(db, 'PlantingSchedules', scheduleId);
            await deleteDoc(scheduleRef);
            Alert.alert('Success', 'Schedule deleted.');
        } catch (error) {
            Alert.alert('Error', 'Could not delete the schedule.');
            console.error('Delete Error:', error);
        }
    };

    const scheduleInitialNotification = async (date: Date) => {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: 'Reminder from CropCare',
                body: `It's time to perform your ${cropType} task!`,
                sound: true,
            },
            trigger: { date: new Date(date.getTime() + 24 * 60 * 60 * 1000) }, // Next day
        });
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setPlantingDate(selectedDate);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Planting Schedule</Text>
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
            <Button title="Select Planting Date" onPress={() => setShowDatePicker(true)} />
            {showDatePicker && (
                <DateTimePicker
                    maximumDate={new Date()} value={plantingDate || new Date()} mode="date" display="default" onChange={handleDateChange} />
            )}
            <TextInput
                style={styles.input}
                placeholder="Action to perform (e.g., Irrigation, Fertilizing)"
                value={performedActions}
                onChangeText={setPerformedActions}
            />
            <TextInput
                style={styles.input}
                placeholder="Farm Name"
                value={farmName}
                onChangeText={setFarmName}
            />
            <TouchableOpacity onPress={savePlantingDate} style={styles.saveButton}>
                <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>

            {loading && <ActivityIndicator size="large" color="#0000ff" />}

            {scheduleList.length > 0 && (
                <View style={styles.tableContainer}>
                    <Text style={styles.tableHeader}>Scheduled Tasks</Text>
                    <FlatList
                        data={scheduleList}
                        scrollEnabled={false}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <View style={styles.tableRow}>
                                <Text style={styles.tableCell}>
                                    <Text style={styles.label}>Crop: </Text>
                                    {item.cropName || 'N/A'}
                                </Text>
                                <Text style={styles.tableCell}>
                                    <Text style={styles.label}>Planting Date: </Text>
                                    {formatDate(item.plantingDate) || 'N/A'}
                                </Text>
                                <Text style={styles.tableCell}>
                                    <Text style={styles.label}>Action: </Text>
                                    {item.performedActions || 'N/A'}
                                </Text>
                                <Text style={styles.tableCell}>
                                    <Text style={styles.label}>Farm: </Text>
                                    {item.farmName || 'N/A'}
                                </Text>
                                <Text style={styles.tableCell}>
                                    <Text style={styles.label}>Remaining Days: </Text>
                                    {item.status === 'Completed' ? 'Completed' : calculateRemainingDays(item.plantingDate)}
                                </Text>
                                <TouchableOpacity onPress={() => markAsComplete(item.id)} style={styles.completeButton}>
                                    <Text style={styles.buttonText}>Mark as Completed</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => deleteSchedule(item.id)} style={styles.deleteButton}>
                                    <Text style={styles.buttonText}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    />
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    cropSelection: { flexDirection: 'row', marginBottom: 20 },
    cropButton: {
        flex: 1, padding: 10, borderWidth: 1, borderColor: '#ccc', alignItems: 'center',
        justifyContent: 'center', borderRadius: 5, marginHorizontal: 5
    },
    selectedButton: { backgroundColor: '#007bff', borderColor: '#007bff' },
    buttonText: { color: '#000' },
    input: { height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingLeft: 10 },
    saveButton: { backgroundColor: '#28a745', padding: 15, alignItems: 'center', borderRadius: 5 },
    saveButtonText: { color: 'white', fontWeight: 'bold' },
    tableContainer: { marginTop: 20 },
    tableHeader: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
    tableRow: { marginBottom: 10, borderBottomWidth: 1, borderColor: '#ccc', paddingVertical: 10 },
    tableCell: { flexDirection: 'row', justifyContent: 'space-between', padding: 5 },
    label: { fontWeight: 'bold' },
    completeButton: { backgroundColor: '#ffc107', padding: 5, marginVertical: 5, alignItems: 'center' },
    deleteButton: { backgroundColor: '#dc3545', padding: 5, marginVertical: 5, alignItems: 'center' }
});

export default PlantingSchedule;
