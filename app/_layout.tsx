import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import CustomDrawerContent from '@/components/CustomDrawerContent';

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer drawerContent={CustomDrawerContent} screenOptions={{
        drawerHideStatusBarOnOpen: true,
        drawerActiveBackgroundColor: '#5363df',
        drawerActiveTintColor: '#fff',
        drawerLabelStyle: {marginLeft: -20}
      }}>
        <Drawer.Screen
          name='index'
          options={{
            drawerLabel: 'Home',
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
          name='Profile'
          options={{
            drawerLabel: 'Profile',
            headerTitle: 'Profile',
            drawerIcon: ({ size, color }) => (<Ionicons name='person' size={size} color={color} />)
          }}
        />
        <Drawer.Screen
          name='Settings'
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
