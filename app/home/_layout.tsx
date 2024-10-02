import { Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { Tabs, useNavigation } from 'expo-router'
import { AntDesign, Entypo, FontAwesome, Ionicons } from '@expo/vector-icons'
import { DrawerActions } from '@react-navigation/native'

const _layout = () => {
    const navigation = useNavigation()
    return (
        <Tabs screenOptions={{
            headerLeft: () => (<TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())} style={{ paddingHorizontal: 10 }}><Entypo name="menu" size={24} color="black" /></TouchableOpacity>),
            headerRight: () => (<TouchableOpacity onPress={() => {}} style={{ paddingHorizontal: 10 }}><Ionicons name="person-circle-outline" size={30} color="black" /></TouchableOpacity>)
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
                name='Discover'
                options={{
                    title: "Home",
                    tabBarIcon: ({ size, color }) => (
                        <FontAwesome name="compass" size={size} color={color} />
                    )
                }}
            />
            <Tabs.Screen
                name='Forum'
                options={{
                    title: "Home",
                    tabBarIcon: ({ size, color }) => (
                        <AntDesign name='message1' size={size} color={color} />
                    )
                }}
            />
        </Tabs>
    )
}

export default _layout