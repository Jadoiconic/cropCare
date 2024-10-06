
import React from 'react'
import { Stack } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'



const RootStack = () => {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Stack screenOptions={{
                headerShown: false,
                headerShadowVisible: false,
            }}>
                <Stack.Screen name='index' />
                <Stack.Screen name='resetPassword' />
            </Stack>
        </GestureHandlerRootView>
    )
}

export default RootStack