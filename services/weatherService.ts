// app/services/weatherService.ts
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Make sure to install this package

const API_KEY = Constants.manifest.extra.API_KEY;

// Fetch weather data based on the current device location
export const fetchWeatherData = async () => {
    try {
        // Request permission to access location
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            alert('Permission to access location was denied');
            return null;
        }

        // Get the current location
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        // Fetch weather data from OpenWeather API
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();

        // Store the fetched data in local storage
        await storeWeatherData(data);
        
        return data;
    } catch (error) {
        console.error("Error fetching weather data:", error);
        throw error; // Rethrow to handle in the component
    }
};

// Function to store weather data in local storage
export const storeWeatherData = async (data: any) => {
    try {
        await AsyncStorage.setItem('weatherData', JSON.stringify(data));
    } catch (error) {
        console.error('Error storing weather data', error);
    }
};

// Function to fetch stored weather data
export const fetchStoredWeatherData = async () => {
    try {
        const data = await AsyncStorage.getItem('weatherData');
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error fetching stored weather data', error);
        return null;
    }
};
