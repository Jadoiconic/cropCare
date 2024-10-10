import { StyleSheet, TouchableOpacity, Text, View, ScrollView, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import Greeting from '@/components/Greeting';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { fetchWeatherData } from '@/services/weatherService';

const HomeScreen = () => {
    const router = useRouter();
    const [weatherData, setWeatherData] = useState(null);
    const [loading, setLoading] = useState(true);

    const cropManagementAdvice = [
        "Itangirire mbere y'igihe, ukore gahunda yo kuhira. Igihe cyose ukwiye gutegura ikigega cy'amatungo y'amazi ku murima wawe, kugira ngo ubashe kuhira igihe cyose, cyane cyane mu bihe by'ubukonje cyangwa ikirere cy'itumba.",
        "Kurwanya indwara n'ibyonnyi bigira ingaruka ku bihingwa. Igihe cyose, jya ugira gahunda yo gupima ibihingwa byawe no gusuzuma niba hari ibimenyetso by'indwara cyangwa ibyonnyi, hanyuma ukoreshe imiti ikwiye mu buryo bwihuse.",
        "Koresha ifumbire ikwiye kugira ngo ubone umusaruro mwiza. Menya neza ko ukoresha ifumbire ifite intungamubiri zikwiye, nk'ifumbire y'ibinyampeke n'ifumbire ikomoka ku nyamaswa, kugira ngo uhe ibihingwa byawe ibikenerwa byose mu gihe cy'iterambere.",
        "Kora isuku mu murima no mu bihingwa byawe. Isuku ni ingenzi mu kurwanya indwara no kugabanya ibyonnyi. Jya ukora isuku y'ibihingwa, ukanakuraho ibibabi byangiritse n'ibihingwa bitakiriho, kugira ngo ugaragaze ibihingwa byawe.",
        "Gukurikirana ibihingwa byawe buri gihe ni ingenzi. Kumenya uko ibihingwa byawe bimeze bituma ushobora gufata ingamba mu gihe gikwiye. Jya wita ku bikorwa nk'ihinga, gupima ibihingwa, no gucunga ibyangiritse kugirango ube wizeye umusaruro mwiza.",
    ];

    useEffect(() => {
        const getWeather = async () => {
            try {
                const data = await fetchWeatherData();
                setWeatherData(data);
            } catch (error) {
                console.error("Error fetching weather data:", error);
                setWeatherData(null); // Handle error case
            } finally {
                setLoading(false);
            }
        };

        getWeather();
    }, []);

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />;
    }

    return (
        <ScrollView style={styles.container}>
            <Greeting />

            <View style={styles.gridContainer}>
                <View style={styles.row}>
                    <TouchableOpacity
                        onPress={() => router.push("/Weather")}
                        style={styles.cardContainer}
                        accessibilityLabel="Navigate to Weather Screen"
                    >
                        <Ionicons name="cloud" size={40} color="#4A90E2" />
                        <Text style={styles.cardLabel}>Iteganya igihe</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.push("/Lessons")}
                        style={styles.cardContainer}
                        accessibilityLabel="Navigate to Lessons Screen"
                    >
                        <Ionicons name="stats-chart-outline" size={40} color="#8BC34A" />
                        <Text style={styles.cardLabel}>Amasomo kubuhinzi</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.row}>
                    <TouchableOpacity
                        onPress={() => router.push("/CropManagement")}
                        style={styles.cardContainer}
                        accessibilityLabel="Navigate to Crop Management Screen"
                    >
                        <Ionicons name="leaf-outline" size={40} color="#8BC34A" />
                        <Text style={styles.cardLabel}>Gukurikirana Igihingwa</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => router.push("/home/Forum")}
                        style={styles.cardContainer}
                        accessibilityLabel="Navigate to Forum Screen"
                    >
                        <Ionicons name="people-outline" size={40} color="#8BC34A" />
                        <Text style={styles.cardLabel}>Uruganiriro</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.row}>
                    <TouchableOpacity
                        onPress={() => router.push("/Watering")}
                        style={styles.cardContainer}
                        accessibilityLabel="Navigate to Watering Screen"
                    >
                        <MaterialCommunityIcons name="watering-can-outline" size={40} color="#8BC34A" />
                        <Text style={styles.cardLabel}>Kuhira no Kuvomera</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => router.push("/Pests")}
                        style={styles.cardContainer}
                        accessibilityLabel="Navigate to Pests Screen"
                    >
                        <Ionicons name="bug-outline" size={40} color="#8BC34A" />
                        <Text style={styles.cardLabel}>Ibyonyi n' Indwara</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.adviceContainer}>
                <Text style={styles.adviceTitle}>Inama ku Gukurikirana Igihingwa:</Text>
                {cropManagementAdvice.map((advice, index) => (
                    <Text key={index} style={styles.adviceText}>
                        • {advice}
                    </Text>
                ))}

                {/* Display Weather Information */}
                <Text style={styles.weatherTitle}>Ibiranga Igihe:</Text>
                {weatherData ? (
                    <Text style={styles.weatherText}>
                        {`Ikirere: ${weatherData.weather[0].description}\n` +
                        `Temperatire: ${weatherData.main.temp}°C\n` +
                        `Umuyaga: ${weatherData.wind.speed} m/s`}
                    </Text>
                ) : (
                    <Text style={styles.weatherText}>Nta makuru aboneka ku kirere.</Text>
                )}
            </View>
        </ScrollView>
    );
};

export default HomeScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gridContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 20,
        marginVertical: 10,
    },
    cardContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        elevation: 3,
        width: '45%', // Responsive width
        aspectRatio: 1, // Maintain square shape
        margin: 10,
    },
    cardLabel: {
        marginTop: 10,
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
        color: '#333',
    },
    adviceContainer: {
        marginTop: 20,
        paddingHorizontal: 20,
        backgroundColor: '#e0f7fa',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 3 },
        elevation: 3,
    },
    adviceTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
        textAlign: 'center',
        color: '#00796b',
    },
    adviceText: {
        fontSize: 14,
        color: '#333',
        marginVertical: 3,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    weatherTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 10,
        textAlign: 'center',
        color: '#00796b',
    },
    weatherText: {
        fontSize: 14,
        color: '#333',
        marginVertical: 5,
        textAlign: 'center',
    },
});
