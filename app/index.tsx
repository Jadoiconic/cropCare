// app/index.tsx

import React from 'react';
import { Stack, Redirect } from 'expo-router';
import PlantingSchedule from './home/crop-management/PlantingSchedule';

const App = () => {
  return (
    <Stack>
      {/* Redirect to the Auth screen */}
      <Redirect href="/auth" />
      {/* Define your routes here */}
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="manages" options={{ headerShown: false }} />
      {/* Add other screens as necessary */}
    </Stack>
  );
};

export default App;
