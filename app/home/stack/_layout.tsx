
import React from 'react'
import { Stack } from 'expo-router'

const StackNavigator = () => {
    return (
        <Stack>
            <Stack.Screen name="Weather" options={{
                headerTitle: "Iteganya gihe"
            }} />
            <Stack.Screen name="Lessons" options={{
                headerTitle: "Amasomo kubuhinzi"
            }} />
        </Stack>
    )
}
