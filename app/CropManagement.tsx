import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';

const CropManagement: React.FC = () => {
    const [activeTab, setActiveTab] = useState('Irish Potatoes');
    const [scaleAnim1] = useState(new Animated.Value(1));
    const [scaleAnim2] = useState(new Animated.Value(1));
    const [scaleAnim3] = useState(new Animated.Value(1));

    const handlePressIn = (scaleAnim: Animated.Value) => {
        Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }).start();
    };

    const handlePressOut = (scaleAnim: Animated.Value) => {
        Animated.spring(scaleAnim, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }).start();
    };

    return (
        <View style={styles.container}>
            
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Card 1: Planting Schedule */}
                <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim1 }] }]}>
                    <Link href="/home/crop-management/PlantingSchedule" asChild>
                        <Pressable
                            onPressIn={() => handlePressIn(scaleAnim1)}
                            onPressOut={() => handlePressOut(scaleAnim1)}
                            style={styles.cardButton}
                        >
                            <Ionicons name="calendar" size={30} color="#fff" style={styles.icon} />
                            <View style={styles.cardContent}>
                                <Text style={styles.cardTitle}>Planting Schedule</Text>
                                <Text style={styles.cardText}>
                                    Best time to plant Irish Potatoes is during the early rainy season to ensure optimal growth.
                                </Text>
                            </View>
                        </Pressable>
                    </Link>
                </Animated.View>

                {/* Card 2: Fertilization */}
                <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim2 }] }]}>
                    <Link href="/home/crop-management/Fertilization" asChild>
                        <Pressable
                            onPressIn={() => handlePressIn(scaleAnim2)}
                            onPressOut={() => handlePressOut(scaleAnim2)}
                            style={styles.cardButton}
                        >
                            <Ionicons name="leaf" size={30} color="#fff" style={styles.icon} />
                            <View style={styles.cardContent}>
                                <Text style={styles.cardTitle}>Fertilization</Text>
                                <Text style={styles.cardText}>
                                    Apply nitrogen-rich fertilizers to support the growth of Irish Potatoes and increase yield.
                                </Text>
                            </View>
                        </Pressable>
                    </Link>
                </Animated.View>

                {/* Card 3: Pest Control */}
                <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim3 }] }]}>
                    <Link href="/home/crop-management/PestControl" asChild>
                        <Pressable
                            onPressIn={() => handlePressIn(scaleAnim3)}
                            onPressOut={() => handlePressOut(scaleAnim3)}
                            style={styles.cardButton}
                        >
                            <Ionicons name="bug" size={30} color="#fff" style={styles.icon} />
                            <View style={styles.cardContent}>
                                <Text style={styles.cardTitle}>Pest Control</Text>
                                <Text style={styles.cardText}>
                                    Use organic pesticides to keep common pests such as armyworms away from Irish Potatoes fields.
                                </Text>
                            </View>
                        </Pressable>
                    </Link>
                </Animated.View>
            </ScrollView>
        </View>
    );
};

export default CropManagement;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#E5F4E3' },
    tabContainer: { flexDirection: 'row', marginHorizontal: 15, marginBottom: 20, backgroundColor: '#FFFFFF', borderRadius: 5 },
    tab: { flex: 1, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
    activeTab: { backgroundColor: '#66BB6A' },
    inactiveTab: { backgroundColor: '#E0E0E0' },
    tabText: { fontSize: 16, fontWeight: 'bold' },
    activeTabText: { color: '#FFFFFF' },
    inactiveTabText: { color: '#000000' },
    scrollContainer: { alignItems: 'center', paddingHorizontal: 15 },
    card: { backgroundColor: '#A5D6A7', width: '100%', borderRadius: 15, marginVertical: 10, padding: 15, elevation: 3 },
    cardButton: { flexDirection: 'row', alignItems: 'center' },
    icon: { marginRight: 15 },
    cardContent: { flex: 1 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#004D40' },
    cardText: { fontSize: 14, color: '#004D40', marginTop: 5 },
});
