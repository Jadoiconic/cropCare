import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

interface WeatherData {
    list: Array<{
        dt: number;
        main: { temp: number };
        weather: Array<{ description: string }>;
    }>;
}

const Weather: React.FC = () => {
    const apiKey = '646e427364d976db752529e161940cd0';
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [locationMessage, setLocationMessage] = useState('Turi gushaka aho uri...');
    const [detailedLocation, setDetailedLocation] = useState('Turi gukurikirana aho uri...');
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        loadStoredWeatherData();
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsOffline(!state.isConnected);
            if (state.isConnected) {
                getLocationAndFetchWeather();
            }
        });
        return () => unsubscribe();
    }, []);

    const loadStoredWeatherData = async () => {
        try {
            const storedData = await AsyncStorage.getItem('weatherData');
            if (storedData) {
                setWeatherData(JSON.parse(storedData));
            }
        } catch (error) {
            console.error('Ikosa ryo gufungura amakuru y’ububiko:', error);
        }
    };

    const saveWeatherData = async (data: WeatherData) => {
        try {
            await AsyncStorage.setItem('weatherData', JSON.stringify(data));
        } catch (error) {
            console.error('Ikosa ryo kubika amakuru y’iteganyagihe:', error);
        }
    };

    const getLocationAndFetchWeather = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setLocationMessage('Ububasha bwo kubona aho uri bwanzwe.');
                return;
            }
            const location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;
            await getAddressFromCoordinates(latitude, longitude);
            await fetchWeatherData(latitude, longitude);
        } catch (error) {
            setLocationMessage('Ntitwabashije kubona aho uri. Nyamuneka wemeze ko serivisi z\'aho uri zifunguye.');
        }
    };

    const fetchWeatherData = async (lat: number, lon: number) => {
        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
            );
            if (!response.ok) {
                throw new Error('Byanze kubikuza amakuru y\'iteganyagihe');
            }
            const data: WeatherData = await response.json();
            setWeatherData(data);
            saveWeatherData(data);
        } catch (error) {
            setLocationMessage('Byanze kubona amakuru y\'iteganyagihe. Nyamuneka gerageza kongera nyuma.');
        }
    };

    const getAddressFromCoordinates = async (lat: number, lon: number) => {
        try {
            const location = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
            if (location.length > 0) {
                const place = location[0];
                setDetailedLocation(`${place.city}, ${place.region}`);
            }
        } catch (error) {
            setDetailedLocation('Ntitwabashije kubona amakuru y’aho uri.');
        }
    };

    const simplifyDescription = (description: string) => {
        const descriptions: { [key: string]: string } = {
            'clear sky': 'Ikirere Gisa Neza',
            'few clouds': 'Ibicu bike',
            'scattered clouds': 'Ibicu bitatanye',
            'broken clouds': 'Ibicu bikomeye',
            'shower rain': 'Imvura y\'ubuyaga',
            'rain': 'Imvura nyinshi',
            'thunderstorm': 'Umuyaga Wiganjemo Inkuba',
            'snow': 'Urubura',
            'mist': 'Igihu',
        };
        return descriptions[description] || 'Ibicu bihindutse';
    };

    const getFarmingAdvice = (description: string) => {
        const advice: { [key: string]: string } = {
            'clear sky': 'Numunsi mwiza wo gusarura cyangwa kuhira imyaka.',
            'few clouds': 'Numunsi mwiza wo gufata neza imyaka, kandi kuzirikana ku kuhira.',
            'scattered clouds': 'Iminsi myiza yo gutera imbuto cyangwa kugenzura uburyo bwo kuhira.',
            'broken clouds': 'Kwitegura impinduka zishobora kuba mu bihe by\'ikirere.',
            'shower rain': 'Imvura y\'ubuyaga irimo gutanga ububasha, nta mpamvu yo kuhira uyu munsi.',
            'rain': 'Witonde amazi ashobora kugwa neza ku bihingwa byawe.',
            'thunderstorm': 'Guma mu nzu kandi wirinde ibikoresho byawe byo mu murima. Irinde kujya mu murima mugihe cy\'inkuba.',
            'snow': 'Kurinda ibihingwa cyangwa amatungo yawe kubera ubukonje bukabije.',
            'mist': 'Kwitegura uburyo bwo kugenzura uburwayi bw’ibihingwa bishobora guterwa n’ubushuhe bukabije.',
        };
        return advice[description] || 'Ikirere nticyitezwe neza. Genza neza ibikoresho n\'uburyo bwo guhinga.';
    };

    const renderCurrentWeather = () => {
        if (!weatherData) return null;
        const currentWeather = weatherData.list[0];
        const description = simplifyDescription(currentWeather.weather[0].description);
        const farmingAdvice = getFarmingAdvice(currentWeather.weather[0].description);

        return (
            <View style={styles.currentWeatherCard}>
                <Text style={styles.location}>{detailedLocation}</Text>
                <Text style={styles.temperature}>{`${currentWeather.main.temp.toFixed(2)}°C`}</Text>
                <Text style={styles.weatherDescription}>{description}</Text>
                <Text style={styles.advice}>{farmingAdvice}</Text>
            </View>
        );
    };

    const render7DayForecast = () => {
        if (!weatherData) return null;
        return weatherData.list.slice(0, 7).map((day, index) => (
            <View key={index} style={styles.forecastCard}>
                <Text style={styles.forecastDay}>{new Date(day.dt * 1000).toLocaleDateString()}</Text>
                <Text style={styles.forecastTemp}>{`${day.main.temp.toFixed(2)}°C`}</Text>
                <Text style={styles.weatherDescription}>{simplifyDescription(day.weather[0].description)}</Text>
            </View>
        ));
    };

    const renderHourlyForecast = () => {
        if (!weatherData) return null;
        return weatherData.list.slice(0, 5).map((hour, index) => (
            <View key={index} style={styles.hourlyCard}>
                <Text style={styles.hourlyTime}>{new Date(hour.dt * 1000).toLocaleTimeString()}</Text>
                <Text style={styles.hourlyTemp}>{`${hour.main.temp.toFixed(2)}°C`}</Text>
            </View>
        ));
    };

    return (
        <ScrollView style={styles.container}>
            {weatherData ? (
                <>
                    {renderCurrentWeather()}
                    <Text style={styles.sectionTitle}>Iteganyagihe Rya Cyumweru</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {render7DayForecast()}
                    </ScrollView>
                    <Text style={styles.sectionTitle}>Iteganyagihe Rya Saha</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {renderHourlyForecast()}
                    </ScrollView>
                </>
            ) : (
                <ActivityIndicator size="large" color="#00b894" style={styles.loadingIndicator} />
            )}
            {isOffline && (
                <Text style={styles.offlineText}>Nta murongo wa interineti. Amakuru ni aya nyuma yo kuvugurura.</Text>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    currentWeatherCard: {
        padding: 16,
        backgroundColor: '#e0f7fa',
        borderRadius: 8,
        marginBottom: 16,
    },
    location: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    temperature: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#00796b',
    },
    weatherDescription: {
        fontSize: 18,
        fontStyle: 'italic',
    },
    advice: {
        fontSize: 16,
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 16,
    },
    forecastCard: {
        padding: 16,
        backgroundColor: '#c8e6c9',
        borderRadius: 8,
        marginRight: 16,
    },
    forecastDay: {
        fontSize: 18,
    },
    forecastTemp: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    hourlyCard: {
        padding: 16,
        backgroundColor: '#ffe0b2',
        borderRadius: 8,
        marginRight: 16,
    },
    hourlyTime: {
        fontSize: 16,
    },
    loadingIndicator: {
        marginTop: 50,
    },
    offlineText: {
        color: 'red',
        textAlign: 'center',
        marginTop: 16,
    },
});

export default Weather;
