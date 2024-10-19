// app/screens/Home.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, ScrollView, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const Home: React.FC = () => {
    const router = useRouter();
    const [currentLocation, setCurrentLocation] = useState<string | null>(null);
    const [loadingLocation, setLoadingLocation] = useState(true);
    const [currentSeason, setCurrentSeason] = useState<string | null>(null);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            await getCurrentLocation();
            await getSeason();
            await loadCachedData();
        };

        fetchData();
    }, []);

    // Get current location
    const getCurrentLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setCurrentLocation('Location permission denied');
                setLoadingLocation(false);
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const place = await Location.reverseGeocodeAsync(location.coords);
            const { city, region } = place[0];
            setCurrentLocation(`${city}, ${region}`);
        } catch (error) {
            setCurrentLocation('Could not fetch location');
        } finally {
            setLoadingLocation(false);
        }
    };

    // Get current farming season
    const getSeason = () => {
        const month = new Date().getMonth(); // 0-11
        const season = month >= 3 && month <= 8 ? 'Planting Season' : 'Harvesting Season';
        setCurrentSeason(season);
    };

    // Load cached data for offline use
    const loadCachedData = async () => {
        try {
            const cachedData = await AsyncStorage.getItem('farmingData');
            if (cachedData) {
                // Load cached data
                const parsedData = JSON.parse(cachedData);
                // Set state with cached data (if necessary)
                console.log(parsedData); // Here you can use the parsedData if needed
            }
        } catch (error) {
            console.error('Failed to load cached data:', error);
        } finally {
            setLoadingData(false);
        }
    };

    // Function to synchronize data when online (you can expand this function)
    const synchronizeData = async () => {
        // This function would include logic to fetch fresh data and cache it
        console.log('Synchronizing data...');
        // Example: await fetchAndCacheData();
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Farming Season Tips</Text>

            {loadingLocation ? (
                <ActivityIndicator size="large" color="#4A90E2" />
            ) : (
                <Text style={styles.locationText}>Current Location: {currentLocation}</Text>
            )}

            <Text style={styles.seasonText}>Current Season: {currentSeason}</Text>

            {loadingData ? (
                <ActivityIndicator size="large" color="#4A90E2" />
            ) : (
                <>
                    <Text style={styles.infoText}>
                        Here are some important tips for the current farming season:
                    </Text>

                    <View style={styles.tipContainer}>
                        <Text style={styles.cropTitle}>🌽 Maize Tips</Text>
                        <Text style={styles.tipText}>
                            - **Soil Preparation:** Ensure the soil is well-tilled and free of weeds. Add organic matter to improve soil fertility.
                        </Text>
                        <Text style={styles.tipText}>
                            - **Best Planting Date:** Aim to plant maize seeds by March 15 to take advantage of moisture during the rainy season.
                        </Text>
                        <Text style={styles.tipText}>
                            - **Spacing:** Space maize plants 30-50 cm apart for proper growth.
                        </Text>
                        <Text style={styles.tipText}>
                            - **Watering:** Ensure consistent watering, especially during dry spells. Maize requires 500-800 mm of water during its growing season.
                        </Text>
                        <Text style={styles.tipText}>
                            - **Pest Management:** Monitor for pests like the Fall Armyworm and apply recommended pesticides when necessary.
                        </Text>
                    </View>

                    <View style={styles.tipContainer}>
                        <Text style={styles.cropTitle}>🥔 Irish Potato Tips</Text>
                        <Text style={styles.tipText}>
                            - **Soil Preparation:** Prepare well-drained, fertile soil. Add well-rotted manure or compost to improve nutrient content.
                        </Text>
                        <Text style={styles.tipText}>
                            - **Seed Selection:** Use certified disease-free seeds to ensure healthy growth.
                        </Text>
                        <Text style={styles.tipText}>
                            - **Best Planting Date:** Plant Irish potatoes by March 5, ideally before the first heavy rains.
                        </Text>
                        <Text style={styles.tipText}>
                            - **Fertilization:** Apply fertilizers rich in phosphorus and potassium at planting and side-dress with nitrogen two weeks after emergence.
                        </Text>
                        <Text style={styles.tipText}>
                            - **Disease Control:** Regularly check for signs of blight and apply fungicides as needed.
                        </Text>
                    </View>

                    <Text style={styles.sectionTitle}>Seed Selection</Text>
                    <Text style={styles.infoText}>
                        Choose the following seeds for the current season:
                    </Text>
                    <View style={styles.seedContainer}>
                        <Text style={styles.seedTitle}>🌽 Maize Seeds:</Text>
                        <Text style={styles.seedText}>
                            - **Hybrid Varieties:** Consider seeds like 'H520', which are resistant to local pests and yield high.
                        </Text>
                        <Text style={styles.seedText}>
                            - **Open Pollinated Varieties:** Such as 'Katumani', suitable for diverse weather conditions.
                        </Text>
                        
                        <Text style={styles.seedTitle}>🥔 Irish Potato Seeds:</Text>
                        <Text style={styles.seedText}>
                            - **Varieties:** Use 'Dutch Robjin' or 'Shangi' for good yield and disease resistance.
                        </Text>
                        <Text style={styles.seedText}>
                            - **Certified Seeds:** Ensure to use certified seeds to minimize risks of diseases.
                        </Text>
                    </View>

                    <Text style={styles.sectionTitle}>Scheduling Reminders</Text>
                    <Text style={styles.infoText}>
                        Set reminders for important farming activities:
                    </Text>
                    <View style={styles.reminderContainer}>
                        <Text style={styles.reminderText}>
                            - **Maize Sowing Date:** Plant your maize seeds by March 15 for optimal growth.
                        </Text>
                        <Text style={styles.reminderText}>
                            - **Maize Fertilization:** Fertilize your maize crops two weeks after planting (around March 29).
                        </Text>
                        <Text style={styles.reminderText}>
                            - **Irish Potato Sowing Date:** Aim to plant Irish potatoes by March 5.
                        </Text>
                        <Text style={styles.reminderText}>
                            - **Irish Potato Fertilization:** Apply fertilizers at planting and again on March 19.
                        </Text>
                    </View>

                    <Button title="Set Reminder" onPress={() => router.push('/home/crop-management/setReminder')} />
                </>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#4A90E2',
        textAlign: 'center',
        marginBottom: 16,
    },
    locationText: {
        fontSize: 18,
        color: '#333',
        textAlign: 'center',
        marginBottom: 8,
    },
    seasonText: {
        fontSize: 18,
        color: '#333',
        textAlign: 'center',
        marginBottom: 16,
        fontWeight: 'bold',
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#4A90E2',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 16,
        color: '#333',
        marginBottom: 16,
    },
    tipContainer: {
        marginBottom: 20,
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cropTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#4A90E2',
        marginBottom: 8,
    },
    tipText: {
        fontSize: 16,
        color: '#555',
        marginBottom: 8,
    },
    seedContainer: {
        marginBottom: 20,
        padding: 10,
        backgroundColor: '#e0f7fa',
        borderRadius: 8,
    },
    seedTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#00796b',
    },
    seedText: {
        fontSize: 16,
        color: '#555',
        marginBottom: 8,
    },
    reminderContainer: {
        marginBottom: 20,
        padding: 10,
        backgroundColor: '#ffe0b2',
        borderRadius: 8,
    },
    reminderText: {
        fontSize: 16,
        color: '#555',
        marginBottom: 8,
    },
});

export default Home;
