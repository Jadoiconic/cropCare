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
            // Fetch weather data
            fetchWeatherData(latitude, longitude);
        } catch (error) {
            setLocationMessage('Could not fetch location. Please enable location services.');
        }
    };

    // Fetch weather data based on coordinates using fetch API
    const fetchWeatherData = async (lat: number, lon: number) => {
        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
            );
            if (!response.ok) {
                throw new Error('Failed to fetch weather data');
            }
            const data = await response.json();
            setWeatherData(data);
        } catch (error) {
            setLocationMessage('Failed to fetch weather data. Please try again later.');
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
                return 'Ikirere Gisaneza';
            case 'few clouds':
                return 'Ibicu Bicye';
            case 'scattered clouds':
                return 'Ibicu bitatanye';
            case 'broken clouds':
                return 'Igicu Kiremereye';
            case 'shower rain':
                return 'Imvura Yoroheje';
            case 'rain':
                return 'Imvura Nyinshi';
            case 'thunderstorm':
                return 'Inkuba';
            case 'snow':
                return 'Urubura';
            case 'mist':
                return 'Igihu';
            default:
                return "Igicu cyijimye";
        }
    };

    // Generate farming advice based on weather description
    const getFarmingAdvice = (description: string) => {
        switch (description) {
            case 'clear sky':
                return 'Numunsi mwiza wo gusarura imyaka cyangwa kuhira imirima yawe.';
            case 'few clouds':
                return 'Umunsi mwiza wo gufata neza ubuhinzi. Menya neza ko ibihingwa byuhira neza.';
            case 'scattered clouds':
                return 'Igicu ariko cyumye - igihe cyiza cyo gutera imbuto cyangwa kugenzura uburyo bwo kuhira.';
            case 'broken clouds':
                return 'Witondere impinduka zishobora kubaho mubihe. Kurikirana ibihingwa neza.';
            case 'shower rain':
                return 'Imvura yoroheje nibyiza kubihingwa byawe. Nta mpamvu yo kuhira uyu munsi.';
            case 'rain':
                return 'Imvura nyinshi ishobora gutera amazi. Reba amazi mumirima yawe.';
            case 'thunderstorm':
                return 'Guma mu nzu kandi urinde ibikoresho byawe byo guhinga. Irinde imirimo yo mu murima mugihe cy\'inkuba.';
            case 'snow':
                return 'Kurinda amatungo n\'ibihingwa imbeho.Tekereza uburyo bwo gushyushya cyangwa gutwikira imyaka.';
            case 'mist':
                return 'Ibihe bibi bishobora kongera ubushuhe; gukurikirana ibihingwa byawe byindwara zifata.';
            default:
                return 'Ikirere ntigiteganijwe. Menya neza ko ufata ingamba zo guhinga n\'ibikoresho byawe.';
        }
    };

    // Render the current weather card with farming advice
    const renderCurrentWeather = () => {
        if (!weatherData) {
            return <Text style={styles.infoText}>{locationMessage}</Text>;
        }

        const currentWeather = weatherData.list[0];
        const description = currentWeather.weather[0].description;
        const temp = currentWeather.main.temp;
        const iconCode = currentWeather.weather[0].icon;

        return (
            <View style={styles.weatherCard}>
                <Text style={styles.cardTitle}>Ikirere Cyubu</Text>
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
                <View style={{ borderRadius: 10, overflow: 'hidden', padding: 10, backgroundColor: '#dfe6e9', }}>
                    <Text style={styles.adviceText}>
                        {getFarmingAdvice(simplifyDescription(description))}
                    </Text>
                </View>
            </View>
        );
    };

    // Render 7-day forecast
    const render7DayForecast = () => {
        if (!weatherData) return null;

        // Get unique days for the forecast
        const dailyForecast = weatherData.list.filter((item: any) =>
            item.dt_txt.endsWith("12:00:00") // Getting forecasts at 12:00 PM (noon)
        );

        return (
            <View style={styles.forecastContainer}>
                {dailyForecast.map((forecast: any, index: number) => {
                    const date = new Date(forecast.dt * 1000);
                    const day = date.toLocaleDateString('en-US', { weekday: 'long' });
                    const description = simplifyDescription(forecast.weather[0].description);
                    const temp = forecast.main.temp;
                    const iconCode = forecast.weather[0].icon;

                    return (
                        <View key={index} style={styles.forecastCard}>
                            <Text style={styles.forecastDay}>{day}</Text>
                            <Image
                                source={{ uri: `https://openweathermap.org/img/w/${iconCode}.png` }}
                                style={styles.forecastIcon}
                            />
                            <Text style={styles.forecastTemp}>{temp}°C</Text>
                            <Text style={styles.forecastDescription}>{description}</Text>
                        </View>
                    );
                })}
            </View>
        );
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {weatherData ? (
                <>
                    {renderCurrentWeather()}
                    <View>
                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#4A90E2' }}> Iteganyagihe Ry'Iminsi 7</Text>
                    </View>
                    {render7DayForecast()}
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
        fontSize: 24,
        color: 'black',
        fontWeight: 'bold',
        marginHorizontal: 10,
        marginVertical: 6
    },
    adviceText: {
        fontSize: 20,
        color: 'green',
        marginTop: 8,
        textAlign: 'center',
        fontWeight: 'bold',
        borderRadius: 10
    },
    forecastContainer: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    forecastCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    forecastDay: {
        fontSize: 18,
        color: '#333',
        flex: 1,
    },
    forecastIcon: {
        width: 40,
        height: 40,
    },
    forecastTemp: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    forecastDescription: {
        fontSize: 16,
        color: '#666',
        flex: 2,
        textAlign: 'right',
    },
});
