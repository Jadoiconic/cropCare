import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity, Platform, ScrollView } from 'react-native';
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
  const [crop, setCrop] = useState<string>('');
  const [plantingDate, setPlantingDate] = useState<Date>(new Date());
  const [farmName, setFarmName] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [schedules, setSchedules] = useState<ScheduleData[]>([]);

  useEffect(() => {
    loadSchedules();
  }, []);

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

  const generateSchedule = (cropType: string, startDate: Date): Task[] => {
    if (cropType === 'potato') {
      return [
        { date: addDays(startDate, 0), task: 'Plant seed potatoes' },
        { date: addDays(startDate, 14), task: 'First weeding and pest control' },
        { date: addDays(startDate, 30), task: 'Apply nitrogen fertilizer' },
        { date: addDays(startDate, 60), task: 'Second weeding and pest control' },
        { date: addDays(startDate, 90), task: 'Monitor for pests and diseases' },
        { date: addDays(startDate, 120), task: 'Harvest potatoes' },
      ];
    } else if (cropType === 'maize') {
      return [
        { date: addDays(startDate, 0), task: 'Sow maize seeds' },
        { date: addDays(startDate, 15), task: 'First weeding and pest control' },
        { date: addDays(startDate, 30), task: 'Apply nitrogen fertilizer' },
        { date: addDays(startDate, 60), task: 'Second weeding and pest control' },
        { date: addDays(startDate, 90), task: 'Foliar feeding and disease check' },
        { date: addDays(startDate, 120), task: 'Harvest maize' },
      ];
    }
    return [];
  };

  const handleSubmit = async () => {
    if (!crop || !plantingDate || !farmName) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    const newSchedule = generateSchedule(crop, plantingDate);

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
      const updatedSchedules = [...schedules, newScheduleData];
      await AsyncStorage.setItem('schedules', JSON.stringify(updatedSchedules));

      newSchedule.forEach((task) => {
        scheduleNotification(task.task, task.date);
      });

      Alert.alert('Schedule Saved', 'You will receive reminders for each task!');
      setSchedules(updatedSchedules);
    } catch (error) {
      console.error('Error saving schedule:', error);
    }
  };

  const scheduleNotification = async (task: string, date: Date) => {
    await Notifications.scheduleNotificationAsync({
      content: { title: 'Crop Management Task', body: task },
      trigger: { date },
    });
  };

  const deleteSchedule = async (index: number) => {
    const updatedSchedules = schedules.filter((_, i) => i !== index);
    await AsyncStorage.setItem('schedules', JSON.stringify(updatedSchedules));
    setSchedules(updatedSchedules);
    Alert.alert('Schedule Deleted', 'The schedule has been successfully deleted.');
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setPlantingDate(selectedDate);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Select Crop</Text>
      <Picker selectedValue={crop} onValueChange={(value) => setCrop(value)} style={styles.picker}>
        <Picker.Item label="Select Crop" value="" />
        <Picker.Item label="Maize" value="maize" />
        <Picker.Item label="Potato" value="potato" />
      </Picker>

      <Text style={styles.label}>Enter Planting Date</Text>
      <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
        <Text style={styles.dateButtonText}>{plantingDate.toDateString() || 'Select Date'}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker value={plantingDate} mode="date" display="default" onChange={onDateChange} />
      )}

      <Text style={styles.label}>Enter Farm Name</Text>
      <TextInput
        value={farmName}
        onChangeText={setFarmName}
        placeholder="Farm Name"
        style={styles.input}
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Set Schedule</Text>
      </TouchableOpacity>

      {/* Display scheduled tasks */}
      {schedules.length > 0 && (
        <View style={styles.scheduleContainer}>
          <Text style={styles.scheduleHeader}>Scheduled Tasks:</Text>
          {schedules.map((schedule, index) => (
            <View key={index} style={styles.schedule}>
              <Text style={styles.scheduleCrop}>{schedule.crop} - {schedule.farmName}</Text>
              <Text style={styles.scheduleDate}>Planting Date: {new Date(schedule.plantingDate).toDateString()}</Text>
              {schedule.tasks.map((task, taskIndex) => (
                <Text key={taskIndex} style={styles.taskDetail}>{`${new Date(task.date).toDateString()}: ${task.task}`}</Text>
              ))}
              <TouchableOpacity style={styles.deleteButton} onPress={() => deleteSchedule(index)}>
                <Text style={styles.deleteButtonText}>Delete Schedule</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1, // Use flexGrow to allow scrolling for all content
    padding: 20,
    backgroundColor: '#f9fafb',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#1f2937',
  },
  picker: {
    height: 50,
    marginBottom: 20,
  },
  dateButton: {
    padding: 15,
    backgroundColor: '#e5e7eb',
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  dateButtonText: {
    color: '#1f2937',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    backgroundColor: '#ffffff',
  },
  submitButton: {
    backgroundColor: '#2563eb',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  scheduleContainer: {
    marginTop: 20,
  },
  scheduleHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 10,
  },
  schedule: {
    marginBottom: 10,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
  },
  scheduleCrop: {
    fontSize: 16,
    fontWeight: '500',
  },
  scheduleDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  taskDetail: {
    fontSize: 14,
    color: '#1f2937',
  },
  deleteButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#ef4444',
    borderRadius: 5,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#ffffff',
  },
});

export default ScheduleCrop;
