import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import CustomDrawerContent from '@/components/CustomDrawerContent';
import { useState, useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';

export default function Layout() {
  const [user, setUser] = useState<Object | null>(null);  // Initially, user is null (not authenticated)
  const router = useRouter();  // To perform navigation

  // Simulate an authentication check
  useEffect(() => {
    const checkAuth = async () => {
      // Simulate a delay and authenticate
      setTimeout(() => {
        const isAuthenticated = true; // Replace with actual logic (check token, etc.)
        if (isAuthenticated) {
          setUser({ name: "User" });  // Set user if authenticated
        } else {
          router.replace('/auth');  // Redirect to auth page if not authenticated
        }
      }, 100);
    };
    checkAuth();
  }, []);

  // If user is not authenticated, show the auth screen
  if (!user) {
    return (
      <Stack>
        <Stack.Screen name="auth" options={{ headerShown: false }} />
      </Stack>
    );
  }

  // Render the Drawer navigation after authentication
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer drawerContent={CustomDrawerContent} screenOptions={{
        drawerHideStatusBarOnOpen: true,
        drawerActiveBackgroundColor: 'green',
        drawerActiveTintColor: '#fff',
        drawerLabelStyle: { marginLeft: -20 }
      }}>
        <Drawer.Screen
          name='home'
          options={{
            drawerLabel: 'Home',
            headerShown: false,
            headerTitle: 'Crop Care',
            drawerIcon: ({ size, color }) => (<Ionicons name='home' size={size} color={color} />)
          }}
        />
        <Drawer.Screen
          name='Notifications'
          options={{
            drawerLabel: 'Notifications',
            headerTitle: 'Notifications',
            drawerIcon: ({ size, color }) => (<FontAwesome name='bell' size={size} color={color} />)
          }}
        />

        <Drawer.Screen
          name='index'
          options={{
            drawerLabel: 'Settings',
            headerTitle: 'Settings',
            drawerIcon: ({ size, color }) => (<Ionicons name="settings-sharp" size={size} color={color} />)
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
