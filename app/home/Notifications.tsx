// Notification.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Alert, TouchableOpacity, TextInput, FlatList, ScrollView } from 'react-native';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { auth, db } from '@/services/config';
import { collection, addDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'expo-router';

const Notification: React.FC = () => {
    const [plantingDate, setPlantingDate] = useState<Date | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [cropType, setCropType] = useState<'Ibigori' | 'Ibirayi' | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [performedActions, setPerformedActions] = useState<string>('');
    const [farmName, setFarmName] = useState<string>('');
    const [scheduleList, setScheduleList] = useState<any[]>([]);

    const router = useRouter();

    useEffect(() => {
        const requestPermissions = async () => {
            const { status } = await Notifications.getPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Notification Error', 'Please enable notifications in your settings.');
            }
        };
        requestPermissions();

        loadLocalSchedule();
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                setUserId(null);
                router.replace('/auth');
            }
        });

        return () => unsubscribe();
    }, []);

    const loadLocalSchedule = async () => {
        try {
            const localSchedule = await AsyncStorage.getItem('localPlantingSchedule');
            if (localSchedule) {
                const scheduleData = JSON.parse(localSchedule);
                if (Array.isArray(scheduleData)) {
                    const formattedSchedules = scheduleData.map(item => ({
                        ...item,
                        plantingDate: new Date(item.plantingDate),
                        actionPerformedDate: new Date(item.actionPerformedDate),
                    }));

                    formattedSchedules.sort((a, b) => b.plantingDate - a.plantingDate);
                    setScheduleList(formattedSchedules);
                }
            }
        } catch (error) {
            console.error('Failed to load local schedule:', error);
        }
    };

    const formatDate = (date: any) => {
        if (!date) return 'N/A';

        if (typeof date === 'string') {
            return date;
        } else if (date && typeof date === 'object' && 'seconds' in date && 'nanoseconds' in date) {
            return new Date(date.seconds * 1000).toDateString();
        } else if (date instanceof Date) {
            return date.toDateString();
        } else {
            return new Date(date).toDateString();
        }
    };

    const calculateRemainingDays = (targetDate) => {
        const today = new Date();
        const target = new Date(targetDate);
        const timeDifference = target - today;
        const remainingDays = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
        return remainingDays >= 0 ? remainingDays : 'Expired';
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Remaining Schedules</Text>

            {/* Display Table of Planting Schedules */}
            {scheduleList.length > 0 && (
                <View style={styles.tableContainer}>
                    <FlatList
                        data={scheduleList.filter(item => calculateRemainingDays(item.plantingDate) <= 2)}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item, index }) => (
                            <View style={styles.tableRow}>
                                <Text style={styles.tableCell}>
                                    <Text style={styles.label}>Crop: </Text>
                                    {item.cropName || 'N/A'}
                                </Text>
                                <Text style={styles.tableCell}>
                                    <Text style={styles.label}>Planted on: </Text>
                                    {formatDate(item.plantingDate) || 'N/A'}
                                </Text>
                                <Text style={styles.tableCell}>
                                    <Text style={styles.label}>Location: </Text>
                                    {item.farmName || 'N/A'}
                                </Text>
                                <Text style={styles.tableCell}>
                                    <Text style={styles.label}>Action: </Text>
                                    {item.performedActions || 'N/A'}
                                </Text>
                                <Text style={styles.tableCell}>
                                    <Text style={styles.label}>Performed on: </Text>
                                    {formatDate(item.actionPerformedDate) || 'N/A'}
                                </Text>
                                <Text style={styles.tableCell}>
                                    <Text style={styles.label}>Status: </Text>
                                    {item.status || 'N/A'}
                                </Text>
                                <Text style={styles.tableCell}>
                                    <Text style={styles.label}>Duration: </Text>
                                    {calculateRemainingDays(item.plantingDate) !== 'Expired'
                                        ? `${calculateRemainingDays(item.plantingDate)} days remaining`
                                        : 'Expired'}
                                </Text>
                            </View>
                        )}
                    />

                </View>
            )}
        </ScrollView>
    );
};

export default Notification;

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#E5F4E3' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    tableContainer: { marginTop: 20, backgroundColor: '#FFF3E0', borderRadius: 10, padding: 10 },
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
});
