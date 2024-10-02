import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { DrawerContentScrollView, DrawerItem, DrawerItemList } from '@react-navigation/drawer'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const CustomDrawerContent = (props: any) => {
    const { bottom, top } = useSafeAreaInsets()

    const router = useRouter()
    return (
        <View style={styles.container}>
            <DrawerContentScrollView {...props} contentContainerStyle={{ backgroundColor: 'green' }} scrollEnabled={false}>
                <View style={styles.header}>
                    <Text style={styles.title}>Admin Menu</Text>
                </View>
                <View style={{ backgroundColor: '#fff', paddingTop: 10  }}>
                    <DrawerItemList {...props} />
                    {/* <DrawerItem label={`Logout ${bottom}`} onPress={() => router.replace("/")} /> */}
                </View>
            </DrawerContentScrollView>
            <View style={styles.footer}>
                <TouchableOpacity
                    onPress={() => router.replace("/")}
                    style={{ flexDirection: 'row', gap: 20, alignItems: 'center' }}>
                    <MaterialCommunityIcons name="logout" size={24} color="black" />
                    <Text>Logout</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default CustomDrawerContent

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    header: {
        height: 150,
        paddingLeft: 20,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 24,
        color: '#fff'
    },
    footer: {
        borderTopColor: '#ddefe',
        borderTopWidth: 1,
        padding: 20,
        paddingBottom: 20
    }
})