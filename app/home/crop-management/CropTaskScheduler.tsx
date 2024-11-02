import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

// Utility function to add days to a date
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Define types for task and schedule data
interface Task {
  date: Date;
  task: string;
}

interface ScheduleData {
  crop: string;
  plantingDate: string;
  farmName: string;
  tasks: Task[];
}

const ScheduleCrop = () => {
  const [crop, setCrop] = useState<string>(''); // Selected crop type
  const [plantingDate, setPlantingDate] = useState<Date>(new Date()); // Planting date
  const [farmName, setFarmName] = useState<string>(''); // Farm name
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false); // State to show/hide date picker
  const [schedules, setSchedules] = useState<ScheduleData[]>([]); // List of schedules

  // Load saved schedules on component mount
  useEffect(() => {
    loadSchedules();
  }, []);

  // Function to load schedules from AsyncStorage
  const loadSchedules = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('schedules');
      if (jsonValue != null) {
        const savedSchedules: ScheduleData[] = JSON.parse(jsonValue);
        const updatedSchedules = savedSchedules.map(schedule => ({
          ...schedule,
          plantingDate: new Date(schedule.plantingDate),
          tasks: schedule.tasks.map(task => ({
            ...task,
            date: new Date(task.date),
          })),
        }));
        setSchedules(updatedSchedules);
      }
    } catch (error) {
      console.error('Error loading schedules:', error);
    }
  };

  // Generate schedule tasks based on selected crop type and planting date
  const generateSchedule = (cropType: string, startDate: Date): Task[] => {
    if (cropType === 'Ibirayi') {
      return [
        { date: addDays(startDate, 0), task: 'Gutera Ibirayi' },
        { date: addDays(startDate, 14), task: 'Gukuraho ibyatsi no kurwanya udukoko' },
        { date: addDays(startDate, 30), task: 'Gushyiraho ifumbire ya azote' },
        { date: addDays(startDate, 60), task: 'Gukuraho ibyatsi no kurwanya udukoko bwa kabiri' },
        { date: addDays(startDate, 90), task: 'Kugenzura indwara n’udukoko' },
        { date: addDays(startDate, 120), task: 'Kwimbura Ibirayi' },
      ];
    } else if (cropType === 'Ibigori') {
      return [
        { date: addDays(startDate, 0), task: 'Gutera ibigori' },
        { date: addDays(startDate, 15), task: 'Gukuraho ibyatsi no kurwanya udukoko' },
        { date: addDays(startDate, 30), task: 'Gushyiraho ifumbire ya azote' },
        { date: addDays(startDate, 60), task: 'Gukuraho ibyatsi no kurwanya udukoko bwa kabiri' },
        { date: addDays(startDate, 90), task: 'Kongerera ibigori ibiribwa no kugenzura indwara' },
        { date: addDays(startDate, 120), task: 'Kwimbura ibigori' },
      ];
    }
    return [];
  };

  // Handle form submission for creating a new schedule
  const handleSubmit = async () => {
    if (!crop || !plantingDate || !farmName) {
      Alert.alert('Ikosa', 'Nyamuneka wujuje ibisabwa byose.');
      return;
    }

    // Generate tasks based on selected crop type and planting date
    const newSchedule = generateSchedule(crop, plantingDate);

    // Create a new schedule object
    const newScheduleData: ScheduleData = {
      crop,
      plantingDate: plantingDate.toISOString(),
      farmName,
      tasks: newSchedule.map(task => ({
        date: task.date.toISOString(),
        task: task.task,
      })),
    };

    try {
      // Update the schedules array and save it to AsyncStorage
      const updatedSchedules = [...schedules, newScheduleData];
      await AsyncStorage.setItem('schedules', JSON.stringify(updatedSchedules));

      // Schedule notifications for each task in the new schedule
      newSchedule.forEach((task) => {
        scheduleNotification(task.task, task.date);
      });

      Alert.alert('Impuruza Zahinduwe', 'Uzabona impuruza ku kazi kose!');
      setSchedules(updatedSchedules); // Update the schedules state
    } catch (error) {
      console.error('Error saving schedule:', error);
    }
  };

  // Function to schedule notifications for tasks at exact time and one day before
  const scheduleNotification = async (task: string, date: Date) => {
    // Schedule notification at the exact time of the task
    await Notifications.scheduleNotificationAsync({
      content: { title: 'Kazi mu bijyanye n’ubuhinzi', body: task },
      trigger: { date },
    });

    // Schedule notification one day before the task date
    const oneDayBefore = new Date(date);
    oneDayBefore.setDate(date.getDate() - 1); // Set to one day before

    await Notifications.scheduleNotificationAsync({
      content: { title: 'Ikibutsa ku kazi k\'ejo', body: `Ejo uzakora: ${task}` },
      trigger: { date: oneDayBefore },
    });
  };

  // Function to delete a schedule
  const deleteSchedule = async (index: number) => {
    const updatedSchedules = schedules.filter((_, i) => i !== index);
    await AsyncStorage.setItem('schedules', JSON.stringify(updatedSchedules));
    setSchedules(updatedSchedules);
    Alert.alert('Impuruza Ihinduwe', 'Gahunda Yasibwe.');
  };

  // Function to handle date change from DateTimePicker
  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setPlantingDate(selectedDate);
    }
  };

  // Format the date to Kinyarwanda locale
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('rw-RW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Gahunda y'Ubuhinzi</Text>

      <Text style={styles.label}>Hitamo Igihingwa</Text>
      <Picker selectedValue={crop} onValueChange={(value) => setCrop(value)} style={styles.picker}>
        <Picker.Item label="Hitamo Igihingwa" value="" />
        <Picker.Item label="Ibigori" value="Ibigori" />
        <Picker.Item label="Ibirayi" value="Ibirayi" />
      </Picker>

      <Text style={styles.label}>Andika Itariki yo Gutera</Text>
      <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
        <Text style={styles.dateButtonText}>{formatDate(plantingDate) || 'Hitamo Itariki'}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker value={plantingDate} mode="date" display="default" onChange={onDateChange} />
      )}

      <Text style={styles.label}>Andika Izina ry’Umurima</Text>
      <TextInput
        value={farmName}
        onChangeText={setFarmName}
        placeholder="Izina ry'Umurima"
        style={styles.input}
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Gushyiraho Gahunda</Text>
      </TouchableOpacity>

      {schedules.length > 0 && (
        <View style={styles.scheduleContainer}>
          <Text style={styles.scheduleHeader}>Ibigomba Gukorwa:</Text>
          {schedules.map((schedule, index) => (
            <View key={index} style={styles.schedule}>
              <Text style={styles.scheduleCrop}>{schedule.crop} - {schedule.farmName}</Text>
              <Text style={styles.scheduleDate}>Itariki yo Gutera: {formatDate(new Date(schedule.plantingDate))}</Text>
              {schedule.tasks.map((task, taskIndex) => (
                <Text key={taskIndex} style={styles.task}>{formatDate(new Date(task.date))}: {task.task}</Text>
              ))}
              <TouchableOpacity style={styles.deleteButton} onPress={() => deleteSchedule(index)}>
                <Text style={styles.deleteButtonText}>Siba Gahunda</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

// Define component styles
const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 16, marginBottom: 8 },
  picker: { height: 50, width: '100%', marginBottom: 20 },
  dateButton: { padding: 12, backgroundColor: '#eee', alignItems: 'center', marginBottom: 20 },
  dateButtonText: { fontSize: 16 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 10, marginBottom: 20 },
  submitButton: { backgroundColor: '#28a745', padding: 12, alignItems: 'center', marginBottom: 20 },
  submitButtonText: { color: '#fff', fontSize: 16 },
  scheduleContainer: { marginTop: 20 },
  scheduleHeader: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  schedule: { padding: 15, borderWidth: 1, borderColor: '#ddd', marginBottom: 10 },
  scheduleCrop: { fontSize: 18, fontWeight: 'bold' },
  scheduleDate: { fontSize: 14, color: '#666' },
  task: { fontSize: 14, color: '#333', fontWeight: 'bold' }, // Bolded task date
  deleteButton: { marginTop: 10, alignItems: 'center', backgroundColor: '#dc3545', padding: 8 },
  deleteButtonText: { color: '#fff', fontSize: 14 },
});

export default ScheduleCrop;
