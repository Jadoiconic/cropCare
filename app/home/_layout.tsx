import { Text, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { router, Tabs, useNavigation } from 'expo-router';
import { AntDesign, Entypo, FontAwesome, Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/services/config';

const _layout = () => {
    const navigation = useNavigation();
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const fetchUserRole = async () => {
            const user = auth.currentUser;
            if (user) {
                try {
                    console.log("Fetching user document for:", user.uid); // Check the UID
                    const userDoc = await getDoc(doc(db, 'users', user.uid));

                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        console.log("User Data: ", userData); // Ensure the user data is retrieved
                        setIsAdmin(userData?.role === 'admin');
                    } else {
                        console.log("No user document found for this UID.");
                    }
                } catch (error) {
                    console.log('Error fetching user data: ', error);
                }
            } else {
                console.log("No user is authenticated.");
            }
        };

        fetchUserRole();
    }, []);

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
                headerRight: () => (
                    <TouchableOpacity onPress={() => router.navigate("/home/Chats")} style={{ paddingHorizontal: 10 }}>
                        <Ionicons name="person-circle-outline" size={30} color="white" />
                    </TouchableOpacity>
                ),
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
            }}
        >
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
                    title: "Planting Schedule"
                }}
            />
            <Tabs.Screen
                name="crop-management/Fertilization"
                options={{
                    tabBarButton: () => null,
                    title: "Fertilization"
                }}
            />
            <Tabs.Screen
                name="admin/index"
                options={{
                    tabBarButton: () => null,
                    title: "Fertilization"
                }}
            />
            <Tabs.Screen
                name="expert/index"
                options={{
                    tabBarButton: () => null,
                    title: "Fertilization"
                }}
            />
            <Tabs.Screen
                name="crop-management/PestControl"
                options={{
                    tabBarButton: () => null,
                    title: "Pest Control"
                }}
            />
            <Tabs.Screen
                name="Chats"
                options={{
                    tabBarButton: () => null,
                    title: "Pest Control"
                }}
            />
        </Tabs>
    );
};

export default _layout;
