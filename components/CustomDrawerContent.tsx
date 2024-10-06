import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { signOut } from 'firebase/auth'; // Import signOut function from Firebase
import { auth } from '@/services/config'; // Import Firebase auth from your config

const CustomDrawerContent = (props: any) => {
    const { bottom, top } = useSafeAreaInsets();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            // Perform Firebase logout
            await signOut(auth);
            // Navigate to the /auth screen after logging out
            router.navigate('/auth');
        } catch (error) {
            console.error('Logout Error: ', error);
        }
    };

    return (
        <View style={styles.container}>
            <DrawerContentScrollView {...props} contentContainerStyle={{ backgroundColor: 'green' }} scrollEnabled={false}>
                <View style={styles.header}>
                    <Text style={styles.title}>Admin Menu</Text>
                </View>
                <View style={{ backgroundColor: '#fff', paddingTop: 10 }}>
                    <DrawerItemList {...props} />
                </View>
            </DrawerContentScrollView>
            <View style={styles.footer}>
                <TouchableOpacity
                    onPress={handleLogout} // Call the logout function
                    style={{ flexDirection: 'row', gap: 20, alignItems: 'center' }}>
                    <MaterialCommunityIcons name="logout" size={24} color="black" />
                    <Text>Logout</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default CustomDrawerContent;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        height: 150,
        paddingLeft: 20,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 24,
        color: '#fff',
    },
    footer: {
        borderTopColor: '#eee',
        borderTopWidth: 1,
        padding: 20,
        paddingBottom: 20,
    },
});
