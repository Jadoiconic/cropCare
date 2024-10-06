import { Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { Tabs, useNavigation } from 'expo-router'
import { AntDesign, Entypo, FontAwesome, Ionicons } from '@expo/vector-icons'
import { DrawerActions } from '@react-navigation/native'

const _layout = () => {
    const navigation = useNavigation()
    return (
        <Tabs screenOptions={{
            headerLeft: () => (<TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())} style={{ paddingHorizontal: 10 }}><Entypo name="menu" size={24} color="white" /></TouchableOpacity>),
            headerRight: () => (<TouchableOpacity onPress={() => { }} style={{ paddingHorizontal: 10 }}><Ionicons name="person-circle-outline" size={30} color="white" /></TouchableOpacity>),
            tabBarActiveTintColor: 'green',
            tabBarLabelStyle: {
                fontWeight: 'bold'
            },
            headerStyle: {
                backgroundColor: 'green',
            },
            headerTitleStyle: {
                color: 'white'
            }
        }}>
            <Tabs.Screen
                name='index'
                options={{
                    title: "Home",
                    tabBarIcon: ({ size, color }) => (
                        <Ionicons name='home' size={size} color={color} />
                    )
                }}
            />

            <Tabs.Screen
                name='Forum'
                options={{
                    title: "Forum",
                    tabBarIcon: ({ size, color }) => (
                        <AntDesign name='message1' size={size} color={color} />
                    )
                }}
            />
            <Tabs.Screen
                name='Notifications'
                options={{
                    title: "Notification",
                    tabBarIcon: ({ size, color }) => (
                        <FontAwesome name='bell' size={size} color={color} />
                    )
                }}
            />
            <Tabs.Screen
                name='Profile'
                options={{
                    title: "Profile",
                    tabBarIcon: ({ size, color }) => (
                        <Ionicons name='person' size={size} color={color} />
                    )
                }}
            />
            <Tabs.Screen
                name="crop-management/PlantingSchedule"
                options={{
                    tabBarButton: () => null,
                }}
            />
            <Tabs.Screen
                name="crop-management/Fertilization"
                options={{
                    tabBarButton: () => null,
                }}
            />
            <Tabs.Screen
                name="crop-management/PestControl"
                options={{
                    tabBarButton: () => null,
                }}
            />
        </Tabs>
    )
}

export default _layout