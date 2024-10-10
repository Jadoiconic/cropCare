// app/services/weatherService.ts
import Constants from 'expo-constants';

const API_KEY = Constants.manifest.extra.API_KEY;

export const fetchWeatherData = async () => {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=Kigali,RW&appid=${API_KEY}&units=metric`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching weather data:", error);
        throw error; // Rethrow to handle in the component
    }
};
