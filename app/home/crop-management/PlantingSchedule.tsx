import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Button,
    Alert,
    TouchableOpacity,
    TextInput,
    FlatList,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { auth, db } from '@/services/config';
import { collection, addDoc, query, where, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import moment from 'moment';

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

            // Store in AsyncStorage only if schedules exist
            if (schedules && schedules.length > 0) {
                await AsyncStorage.setItem(userId, JSON.stringify(schedules));
            }
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
            Alert.alert('Input error', 'Mwihangane, Mwuzuze amakuru yose Akenewe.');
            return;
        }

        try {
            const newScheduleData = {
                cropName: cropType,
                userId,
                status: 'Igikorwa kiracyategereje',
                farmName,
                plantingDate: plantingDate.toISOString(),
                performedActions,
            };

            await addDoc(collection(db, 'PlantingSchedules'), newScheduleData);
            setScheduleList((prevList) => [...prevList, newScheduleData]);

            await scheduleInitialNotification(plantingDate);

            Alert.alert('Byakunze', `Igena bikorwa ry' ${cropType} Ribitswe kuwa ${plantingDate.toLocaleDateString()}.`);
            clearForm();
        } catch (error) {
            Alert.alert('Save error', 'Kubika Igenabikorwa ntibyakunze.');
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
            await updateDoc(scheduleRef, { status: 'Igikorwa Cyarangiye' });
            Alert.alert('Byakunze', 'Kwemeza ko Igikorwa Cyarangiye Byakozwe Neza.');
        } catch (error) {
            Alert.alert('Error', 'Kwemeza ko igikorwa cyarangiye ntibikunze.');
            console.error('Update Error:', error);
        }
    };

    const deleteSchedule = async (scheduleId: string) => {
        try {
            const scheduleRef = doc(db, 'PlantingSchedules', scheduleId);
            await deleteDoc(scheduleRef);
            Alert.alert('Byakunze', 'Igikorwa Cyasibwe.');
        } catch (error) {
            Alert.alert('Error', 'Gusiba Igikorwa ntibikunze.');
            console.error('Delete Error:', error);
        }
    };

    const scheduleInitialNotification = async (date: Date) => {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: 'Kwibutsa Biturutse Kuri CropCare',
                body: `Ni igihe cyo ${cropType} igikorwa!`,
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
            <Text style={styles.title}>Iteganya migambi kugihingwa</Text>
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
            <Button title="Kanda Hano Uhitemo Itariki Watereyeho!" onPress={() => setShowDatePicker(true)} />
            {showDatePicker && (
                <DateTimePicker
                    maximumDate={new Date()}
                    value={plantingDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                />
            )}
            <TextInput
                style={styles.input}
                placeholder="Injiza Igikorwa Upanga Gukora (Urug., kuhira, kubagara, Gutera Umuti...)"
                value={performedActions}
                onChangeText={setPerformedActions}
            />
            <TextInput
                style={styles.input}
                placeholder="Injiza Aho Umurima Uherereye"
                value={farmName}
                onChangeText={setFarmName}
            />
            <TouchableOpacity onPress={savePlantingDate} style={styles.saveButton}>
                <Text style={styles.saveButtonText}>Bika Amakuru</Text>
            </TouchableOpacity>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0000ff" />
                    <Text style={styles.loadingText}>Tegereza gato... Amakuru arashakwa.</Text>
                </View>
            ) : (
                <FlatList
                    data={scheduleList}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => {
                        const remainingDays = calculateRemainingDays(item.plantingDate);
                        return (
                            <View style={styles.scheduleItem}>
                                <Text style={styles.scheduleText}>Igihingwa: {item.cropName}</Text>
                                <Text style={styles.scheduleText}>Itariki yo gutera: {formatDate(item.plantingDate)}</Text>
                                <Text style={styles.scheduleText}>Amakuru yakorewe: {item.performedActions}</Text>
                                <Text style={styles.scheduleText}>Aho Umurima: {item.farmName}</Text>
                                <Text style={styles.scheduleText}>Icyiciro: {item.status}</Text>
                                <Text style={styles.scheduleText}>Amasaha asigaye: {remainingDays} iminsi</Text>
                                {item.status !== 'Igikorwa Cyarangiye' && (
                                    <TouchableOpacity onPress={() => markAsComplete(item.id)} style={styles.actionButton}>
                                        <Text style={styles.actionButtonText}>Shyiraho Ko Cyarangiye</Text>
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity onPress={() => deleteSchedule(item.id)} style={styles.deleteButton}>
                                    <Text style={styles.deleteButtonText}>Siba</Text>
                                </TouchableOpacity>
                            </View>
                        );
                    }}
                />
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    cropSelection: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    cropButton: {
        flex: 1,
        padding: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 5,
        alignItems: 'center',
    },
    selectedButton: {
        backgroundColor: '#4CAF50',
    },
    buttonText: {
        marginTop: 5,
        color: 'black',
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    saveButton: {
        backgroundColor: '#4CAF50',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 20,
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
    },
    loadingContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    loadingText: {
        marginTop: 10,
    },
    scheduleItem: {
        backgroundColor: '#f9f9f9',
        padding: 15,
        borderRadius: 5,
        marginBottom: 10,
    },
    scheduleText: {
        fontSize: 16,
        marginVertical: 2,
    },
    actionButton: {
        backgroundColor: '#4CAF50',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginVertical: 5,
    },
    actionButtonText: {
        color: 'white',
    },
    deleteButton: {
        backgroundColor: 'red',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    deleteButtonText: {
        color: 'white',
    },
});

export default PlantingSchedule;
