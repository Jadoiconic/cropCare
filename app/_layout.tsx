import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import CustomDrawerContent from '@/components/CustomDrawerContent';
import { useState, useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
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
          router.navigate('/auth');  // Redirect to auth page if not authenticated
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
            drawerLabel: 'Ahabanza',
            headerShown: false,
            headerTitle: 'Crop Care',
            drawerIcon: ({ size, color }) => (<Ionicons name='home' size={size} color={color} />)
          }}
        />

        <Drawer.Screen
          name='Weather'
          options={{
            drawerLabel: 'Iteganyagihe',
            headerTitle: 'Iteganyagihe',
            drawerIcon: ({ size, color }) => (<Ionicons name='cloud' size={size} color={color} />)
          }}
        />
        <Drawer.Screen
          name='CropManagement'
          options={{
            drawerLabel: 'Gukurikirana Igihingwa',
            headerTitle: 'Gukurikirana Igihingwa',
            drawerIcon: ({ size, color }) => (<Ionicons name='leaf-outline' size={size} color={color} />)
          }}
        />
        <Drawer.Screen
          name='Lessons'
          options={{
            drawerLabel: 'Amasomo kubuhinzi',
            headerTitle: 'Amasomo kubuhinzi',
            drawerIcon: ({ size, color }) => (<Ionicons name='book' size={size} color={color} />)
          }}
        />
        <Drawer.Screen
          name='Pests'
          options={{
            drawerLabel: 'Ibyonyi & Indwara',
            headerTitle: 'Ibyonyi & Indwara',
            drawerIcon: ({ size, color }) => (<FontAwesome5 name="hand-holding-water" size={size} color={color} />)
          }}
        />
        <Drawer.Screen
          name='Watering'
          options={{
            drawerLabel: 'Kuhira no Kuvomera',
            headerTitle: 'Kuhira no Kuvomera',
            drawerIcon: ({ size, color }) => (<Ionicons name='bug-outline' size={size} color={color} />)
          }}
        />
        <Drawer.Screen
          name='Discover'
          options={{
            drawerLabel: 'Menya Ibindi',
            headerTitle: 'Menya Ibindi',
            drawerIcon: ({ size, color }) => (<FontAwesome name='compass' size={size} color={color} />)
          }}
        />

        <Drawer.Screen
          name='index'
          options={{
            drawerLabel: 'Igenamiterere',
            headerTitle: 'Igenamiterere',
            drawerIcon: ({ size, color }) => (<Ionicons name="settings-sharp" size={size} color={color} />)
          }}
        />
        <Drawer.Screen
          name="auth"
          options={{
            drawerItemStyle: { display: 'none' },
            headerShown: false,
          }} 
        />
        <Drawer.Screen
          name="addfile"
          options={{
            drawerItemStyle: { display: 'none' },
            headerShown: false,
          }} 
        />
        <Drawer.Screen
          name="manages"
          options={{
            drawerItemStyle: { display: 'none' },
            headerShown: false,
          }} 
        />
        <Drawer.Screen
          name="ExpertChat"
          options={{
            drawerItemStyle: { display: 'none' },
            headerShown: false,
          }} 
        />
        <Drawer.Screen
          name="registerexpert"
          options={{
            drawerItemStyle: { display: 'none' },
            headerShown: false,
          }} 
        />
        <Drawer.Screen
          name="registerfarmer"
          options={{
            drawerItemStyle: { display: 'none' },
            headerShown: false,
          }} 
        />
      </Drawer>
      
    </GestureHandlerRootView>
  );
}
