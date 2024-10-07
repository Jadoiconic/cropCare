import { StyleSheet, Text, View, TouchableOpacity, Image, TextInput } from 'react-native';
import React, { useState, useEffect } from 'react';
import { signOut, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/services/config';
import { router } from 'expo-router';

const Profile = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [newUserRole, setNewUserRole] = useState('user'); // Default role is 'user'
    const [creationError, setCreationError] = useState('');
    const user = auth.currentUser;
    const [currentUser] = useState(user);

    useEffect(() => {
        const fetchUserData = async () => {
            const user = auth.currentUser;
            if (user) {
                try {
                    const userDoc = await getDoc(doc(db, 'Users', user.uid)); // Ensure 'Users' is correct
                    const userData = userDoc.data();
                    if (userData) {
                        setUserData(userData);
                    } else {
                        setUserData(null);
                    }
                } catch (error) {
                    console.log('Error fetching user data: ', error);
                }
            }
            setLoading(false);
            router.navigate("/auth")
        };
        fetchUserData();
    }, []);

    // Function to handle creating a new user by the admin
    const handleCreateUser = async () => {
        try {
            // Create user with email and password in Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, newUserEmail, newUserPassword);
            const newUser = userCredential.user;

            // Save the new user's details to Firestore (in 'Users' collection)
            await setDoc(doc(db, 'Users', newUser.uid), {
                email: newUserEmail,
                role: newUserRole, // Store the selected role
                userId: newUser.uid,
                createdAt: new Date(),
            });

            // Reset input fields after successful creation
            setNewUserEmail('');
            setNewUserPassword('');
            setNewUserRole('user');
            setCreationError('');
            console.log('New user created successfully');
        } catch (error) {
            console.log('Error creating user: ', error);
            setCreationError('Error creating user. Please try again.');
        }
    };

    const handleLogout = () => {
        signOut(auth).catch(error => console.log('Error logging out: ', error));
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Profile</Text>
            <Text style={styles.header}>{auth.currentUser?.email}</Text>
            {currentUser ? (
                <>
                    <View style={styles.infoContainer}>
                        <Text style={styles.infoLabel}>Names:</Text>
                        <Text style={styles.infoText}>{currentUser.displayName}</Text>
                    </View>
                    <View style={styles.infoContainer}>
                        <Text style={styles.infoLabel}>Email:</Text>
                        <Text style={styles.infoText}>{currentUser.email}</Text>
                    </View>



                    {/* Logout Button */}
                    <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>

                    {/* If user is an admin, show form to create a new user */}
                    {currentUser.email === 'test@gmail.com' && (
                        <>
                            <Text style={styles.adminHeader}>Create New User</Text>
                            <TextInput
                                placeholder="Display Name"
                                value={newUserEmail}
                                onChangeText={setNewUserEmail}
                                style={styles.input}
                            />
                            <TextInput
                                placeholder="New User Email"
                                value={newUserEmail}
                                onChangeText={setNewUserEmail}
                                style={styles.input}
                                keyboardType="email-address"
                            />
                            <TextInput
                                placeholder="New User Password"
                                value={newUserPassword}
                                onChangeText={setNewUserPassword}
                                style={styles.input}
                                secureTextEntry
                            />
                            <TextInput
                                placeholder="Role (expert/farmer)"
                                value={newUserRole}
                                onChangeText={setNewUserRole}
                                style={styles.input}
                            />
                            <TouchableOpacity onPress={handleCreateUser} style={styles.createUserButton}>
                                <Text style={styles.createUserText}>Create User</Text>
                            </TouchableOpacity>

                            {creationError ? <Text style={styles.errorText}>{creationError}</Text> : null}
                        </>
                    )}
                </>
            ) : (
                <Text>No user data available</Text>
            )}
        </View>
    );
};
export default Profile;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: 'green'
    },
    infoContainer: {
        marginBottom: 15,
    },
    infoLabel: {
        fontWeight: 'bold',
        fontSize: 16,
        color: 'gray'
    },
    infoText: {
        fontSize: 18,
        color: 'black'
    },
    logoutButton: {
        marginTop: 30,
        backgroundColor: 'green',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    logoutText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    adminHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 30,
        color: 'green',
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    createUserButton: {
        backgroundColor: 'green',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
    },
    createUserText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    errorText: {
        color: 'red',
        marginTop: 10,
        textAlign: 'center',
    },
});
