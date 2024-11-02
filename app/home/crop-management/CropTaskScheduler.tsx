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

  const handleSubmit = async () => {
    if (!crop || !plantingDate || !farmName) {
      Alert.alert('Ikosa', 'Nyamuneka wujuje ibisabwa byose.');
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

      Alert.alert('Impuruza Zahinduwe', 'Uzabona impuruza ku kazi kose!');
      setSchedules(updatedSchedules);
    } catch (error) {
      console.error('Error saving schedule:', error);
    }
  };

  const scheduleNotification = async (task: string, date: Date) => {
    await Notifications.scheduleNotificationAsync({
      content: { title: 'Kazi mu bijyanye n’ubuhinzi', body: task },
      trigger: { date },
    });
  };

  const deleteSchedule = async (index: number) => {
    const updatedSchedules = schedules.filter((_, i) => i !== index);
    await AsyncStorage.setItem('schedules', JSON.stringify(updatedSchedules));
    setSchedules(updatedSchedules);
    Alert.alert('Impuruza Ihinduwe', 'Gahunda Yasibwe.');
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setPlantingDate(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('rw-RW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
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
                <Text key={taskIndex} style={styles.taskDetail}>{`${formatDate(new Date(task.date))}: ${task.task}`}</Text>
              ))}
              <TouchableOpacity style={styles.deleteButton} onPress={() => deleteSchedule(index)}>
                <Text style={styles.deleteButtonText}>Kuraho Gahunda</Text>
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
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f9fafb',
  },
  label: {
    fontSize: 18,
    marginBottom: 5,
    color: '#374151',
    fontWeight: '500',
  },
  picker: {
    height: 50,
    marginBottom: 20,
  },
  dateButton: {
    padding: 15,
    backgroundColor: '#d1fae5',
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  dateButtonText: {
    color: '#065f46',
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
    backgroundColor: '#10b981',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  scheduleContainer: {
    marginTop: 20,
  },
  scheduleHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#065f46',
    marginBottom: 10,
  },
  schedule: {
    backgroundColor: '#ecfdf5',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  scheduleCrop: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#065f46',
  },
  scheduleDate: {
    fontSize: 16,
    color: '#065f46',
  },
  taskDetail: {
    fontSize: 14,
    color: '#065f46',
  },
  deleteButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f87171',
    borderRadius: 5,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#ffffff',
  },
});

export default ScheduleCrop;
