import { StyleSheet, TouchableOpacity, Text, View, ScrollView } from 'react-native';
import React from 'react';
import Greeting from '@/components/Greeting';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const Index = () => { // Renamed to uppercase
    const router = useRouter();
    return (
        <ScrollView style={styles.container}>
            <Greeting />

            <View style={styles.gridContainer}>
                <View style={styles.row}>
                    <TouchableOpacity
                        onPress={() => router.push("/Weather")} // Changed to push
                        style={styles.cardContainer}
                        accessibilityLabel="Navigate to Weather Screen"
                    >
                        <Ionicons name="cloud" size={40} color="#4A90E2" />
                        <Text style={styles.cardLabel}>Iteganya igihe</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.push("/Lessons")} // Changed to push
                        style={styles.cardContainer}
                        accessibilityLabel="Navigate to Lessons Screen"
                    >
                        <Ionicons name="stats-chart-outline" size={40} color="#8BC34A" />
                        <Text style={styles.cardLabel}>Amasomo kubuhinzi</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.row}>
                    <TouchableOpacity
                        onPress={() => router.push("/CropManagement")} // Changed to push
                        style={styles.cardContainer}
                        accessibilityLabel="Navigate to Crop Management Screen"
                    >
                        <Ionicons name="leaf-outline" size={40} color="#8BC34A" />
                        <Text style={styles.cardLabel}>Gukurikirana Igihingwa</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => router.push("/home/Forum")} // Changed to push
                        style={styles.cardContainer}
                        accessibilityLabel="Navigate to Forum Screen"
                    >
                        <Ionicons name="people-outline" size={40} color="#8BC34A" />
                        <Text style={styles.cardLabel}>Uruganiriro</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.row}>
                    <TouchableOpacity
                        onPress={() => router.push("/Watering")} // Changed to push
                        style={styles.cardContainer}
                        accessibilityLabel="Navigate to Watering Screen"
                    >
                        <MaterialCommunityIcons name="watering-can-outline" size={40} color="#8BC34A" />
                        <Text style={styles.cardLabel}>Kuhira no Kuvomera</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => router.push("/Pests")} // Changed to push
                        style={styles.cardContainer}
                        accessibilityLabel="Navigate to Pests Screen"
                    >
                        <Ionicons name="bug-outline" size={40} color="#8BC34A" />
                        <Text style={styles.cardLabel}>Ibyonyi n' Indwara</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

export default Index; // Updated to match the component name

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
});
