import { StyleSheet, TouchableOpacity, Text, View } from 'react-native'
import React from 'react'
import Greeting from '@/components/Greeting'
import { ScrollView } from 'react-native-gesture-handler'
import { useRouter } from 'expo-router'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'

const index = () => {
    const router = useRouter()
    return (
        <ScrollView style={styles.container}>
            <Greeting />

            <View style={styles.gridContainer}>
                <View style={styles.row}>
                    <TouchableOpacity
                        onPress={() => {

                            router.replace("/home/stack/Weather");
                        }}
                        style={styles.cardContainer}
                    >
                        <Ionicons name="cloud" size={40} color="#4A90E2" />
                        <Text style={styles.cardLabel}>Iteganya gihe</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => {

                            router.replace("/home/stack/Lessons");
                        }}
                        style={styles.cardContainer}
                    >
                        <Ionicons name="stats-chart-outline" size={40} color="#8BC34A" />
                        <Text style={styles.cardLabel}>Amasomo kubuhinzi</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.row}>
                    <TouchableOpacity
                        onPress={() => {

                            router.replace("/home/stack/CropManagement");
                        }}
                        style={styles.cardContainer}
                    >
                        <Ionicons name="leaf-outline" size={40} color="#8BC34A" />
                        <Text style={styles.cardLabel}>Gukurikirana Igihingwa</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {

                            router.replace("/home/Forum");
                        }}
                        style={styles.cardContainer}
                    >
                        <Ionicons name="people-outline" size={40} color="#8BC34A" />
                        <Text style={styles.cardLabel}>Uruganiriro</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.row}>
                    <TouchableOpacity
                        onPress={() => {

                            router.replace("/home/stack/Watering");
                        }}
                        style={styles.cardContainer}
                    >
                        <MaterialCommunityIcons name="watering-can-outline" size={40} color="#8BC34A" />
                        <Text style={styles.cardLabel}>Kuhira no Kuvomera</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {

                            router.replace("/home/stack/Pests");
                        }}
                        style={styles.cardContainer}
                    >
                        <Ionicons name="bug-outline" size={40} color="#8BC34A" />
                        <Text style={styles.cardLabel}>Ibyonyi n' Indwara</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    )
}

export default index

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    gridContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
    },
    row: {
        flexDirection: 'row',
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
        width: 150,
        height: 150,
        margin: 10,
    },
    cardLabel: {
        marginTop: 10,
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
        color: '#333',
    },
})