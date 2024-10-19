// app/components/Weather.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import { fetchWeatherData, fetchStoredWeatherData, storeWeatherData } from '../services/weatherService'; // Import your weather service

const Weather: React.FC = () => {
    const apiKey = '646e427364d976db752529e161940cd0'; // Replace with your API key
    const [weatherData, setWeatherData] = useState<any>(null);
    const [locationMessage, setLocationMessage] = useState('Fetching your location...');
    const [detailedLocation, setDetailedLocation] = useState('Locating...');

    useEffect(() => {
        getLocationAndFetchWeather();
    }, []);

    // Get location and fetch weather
    const getLocationAndFetchWeather = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setLocationMessage('Permission to access location was denied');
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;

            // Fetch address from coordinates
            await getAddressFromCoordinates(latitude, longitude);

            // Fetch weather data and store it
            const data = await fetchWeatherData(latitude, longitude);
            if (data) {
                setWeatherData(data);
                await storeWeatherData(data); // Store the fetched data
            } else {
                // If fetching live data fails, get the stored data
                const storedData = await fetchStoredWeatherData();
                if (storedData) {
                    setWeatherData(storedData);
                }
            }
        } catch (error) {
            setLocationMessage('Could not fetch location. Please enable location services.');
        }
    };

    // Fetch address from coordinates
    const getAddressFromCoordinates = async (lat: number, lon: number) => {
        try {
            const location = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
            if (location.length > 0) {
                const place = location[0];
                setDetailedLocation(`${place.city}, ${place.region}`);
            }
        } catch (error) {
            setDetailedLocation('Unable to get location details.');
        }
    };

    // Simplify weather descriptions
    const simplifyDescription = (description: string) => {
        switch (description) {
            case 'clear sky':
                return 'Clear Sky';
            case 'few clouds':
                return 'A Few Clouds';
            case 'scattered clouds':
                return 'Scattered Clouds';
            case 'broken clouds':
                return 'Broken Clouds';
            case 'shower rain':
                return 'Light Rain';
            case 'rain':
                return 'Rainy';
            case 'thunderstorm':
                return 'Thunderstorm';
            case 'snow':
                return 'Snowy';
            case 'mist':
                return 'Foggy';
            default:
                return description.charAt(0).toUpperCase() + description.slice(1);
        }
    };

    // Render the current weather card
    const renderCurrentWeather = () => {
        if (!weatherData) {
            return <Text style={styles.infoText}>{locationMessage}</Text>;
        }

        const currentWeather = weatherData.current;
        const description = currentWeather.weather[0].description;
        const temp = currentWeather.temp;
        const iconCode = currentWeather.weather[0].icon;

        return (
            <View style={styles.weatherCard}>
                <Text style={styles.cardTitle}>Current Weather</Text>
                <Text style={styles.locationText}>{detailedLocation}</Text>
                <View style={styles.weatherRow}>
                    <Image
                        source={{ uri: `https://openweathermap.org/img/w/${iconCode}.png` }}
                        style={styles.weatherIcon}
                    />
                    <View>
                        <Text style={styles.temperature}>{temp}°C</Text>
                        <Text style={styles.description}>{simplifyDescription(description)}</Text>
                    </View>
                </View>
            </View>
        );
    };

    // Render 7-day forecast
    const renderDailyForecast = () => {
        if (!weatherData || !weatherData.daily) return null;

        return weatherData.daily.slice(1, 8).map((day: any, index: number) => {
            const date = new Date(day.dt * 1000).toLocaleDateString(undefined, { weekday: 'long' });
            const description = simplifyDescription(day.weather[0].description);
            const temp = day.temp.day;
            const iconCode = day.weather[0].icon;

            return (
                <View key={index} style={styles.dailyCard}>
                    <Text style={styles.dayText}>{date}</Text>
                    <Image
                        source={{ uri: `https://openweathermap.org/img/w/${iconCode}.png` }}
                        style={styles.weatherIcon}
                    />
                    <Text style={styles.dailyTemp}>{temp}°C</Text>
                    <Text style={styles.dailyDescription}>{description}</Text>
                </View>
            );
        });
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.appTitle}>Weather App</Text>
            {weatherData ? (
                <>
                    {renderCurrentWeather()}
                    <Text style={styles.sectionTitle}>7-Day Forecast</Text>
                    {renderDailyForecast()}
                </>
            ) : (
                <ActivityIndicator size="large" color="#00ff00" />
            )}
        </ScrollView>
    );
};

export default Weather;

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    appTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#4A90E2',
        textAlign: 'center',
        marginBottom: 16,
    },
    infoText: {
        textAlign: 'center',
        color: '#888',
        fontSize: 16,
        marginVertical: 20,
    },
    weatherCard: {
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
        marginBottom: 20,
    },
    cardTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#4A90E2',
        marginBottom: 8,
    },
    locationText: {
        fontSize: 18,
        color: '#333',
        marginBottom: 16,
    },
    weatherRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    weatherIcon: {
        width: 60,
        height: 60,
        marginRight: 16,
    },
    temperature: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#4A90E2',
    },
    description: {
        fontSize: 20,
        color: '#4A90E2',
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#4A90E2',
        marginBottom: 16,
        textAlign: 'center',
    },
    dailyCard: {
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
        marginBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dayText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4A90E2',
    },
    dailyTemp: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#4A90E2',
    },
    dailyDescription: {
        fontSize: 16,
        color: '#4A90E2',
    },
    dailyWeatherIcon: {
        width: 50,
        height: 50,
    },
});
