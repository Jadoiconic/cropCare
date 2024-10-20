import { Text, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { router, Tabs, useNavigation } from 'expo-router';
import { AntDesign, Entypo, FontAwesome, Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/services/config';

const _layout = () => {
  const navigation = useNavigation();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          console.log('Fetching user document for:', user.uid);
          const userDoc = await getDoc(doc(db, 'users', user.uid));

          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('User Data: ', userData);
            setUserRole(userData?.role); // Set user role (Admin, Expert, Farmer)
          } else {
            console.log('No user document found for this UID.');
          }
        } catch (error) {
          console.log('Error fetching user data: ', error);
        }
      } else {
        console.log('No user is authenticated.');
      }
    };

    fetchUserRole();
  }, []);

  const handleTabPress = () => {
    if (userRole === 'Expert') {
      router.replace('/home/expert_home');
    } else if (userRole === 'Admin') {
      router.replace('/home/admin_home');
    } else {
      router.replace('/home'); // Redirect Farmer or any other role to index
    }
  };

  return (
    <Tabs
      screenOptions={{
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            style={{ paddingHorizontal: 10 }}>
            <Entypo name="menu" size={24} color="white" />
          </TouchableOpacity>
        ),
        tabBarActiveTintColor: 'green',
        tabBarLabelStyle: {
          fontWeight: 'bold',
        },
        headerStyle: {
          backgroundColor: 'green',
        },
        headerTitleStyle: {
          color: 'white',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ahabanza',
          tabBarIcon: ({ size, color }) => <Ionicons name="home" size={size} color={color} />,
          tabBarButton: (props) => (
            <TouchableOpacity {...props} onPress={handleTabPress} />
          ),
        }}
      />
      <Tabs.Screen
        name="Forum"
        options={{
          title: 'Uruganiriro',
          tabBarIcon: ({ size, color }) => <AntDesign name="message1" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="Notifications"
        options={{
          title: 'Amamenyesha',
          tabBarIcon: ({ size, color }) => <FontAwesome name="bell" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          title: 'Umwirondoro',
          tabBarIcon: ({ size, color }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="crop-management/PlantingSchedule"
        options={{
          tabBarButton: () => null,
          title: 'Pangira Igihingwa',
        }}
      />
      <Tabs.Screen
        name="crop-management/Fertilization"
        options={{
          tabBarButton: () => null,
          title: 'Uko Bafumbira',
        }}
      />
      
      <Tabs.Screen
        name="crop-management/PestControl"
        options={{
          tabBarButton: () => null,
          title: 'Genzura Ibyonnyi',
        }}
      />
      <Tabs.Screen
        name="Chats"
        options={{
          tabBarButton: () => null,
          title: 'Ganira',
        }}
      />
      <Tabs.Screen
        name="ExpertChat"
        options={{
          tabBarButton: () => null,
          title: 'Ganira',
        }}
      />
       <Tabs.Screen
        name="crop-management/setReminder"
        options={{
          tabBarButton: () => null,
          title: 'Pangira igihingwa',
        }}
      />
      <Tabs.Screen
        name="manages"
        options={{
          tabBarButton: () => null,
          title: 'Admin Management',
        }}
      />
      
    </Tabs>
  );
};

export default _layout;
