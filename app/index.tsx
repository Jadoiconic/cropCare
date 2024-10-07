import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Linking, TextInput, Button, Alert } from 'react-native';

import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth } from '@/services/config';

const Discover = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');


    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            Alert.alert('Passwords do not match');
            return;
        }

        const user = auth.currentUser;
        if (!user) {
            Alert.alert('No user is logged in');
            return;
        }

        // Create a credential with the current password
        const credential = EmailAuthProvider.credential(user.email, currentPassword);

        try {
            // Re-authenticate the user
            await reauthenticateWithCredential(user, credential);
            // Update the password
            await updatePassword(user, newPassword);
            Alert.alert('Password updated successfully');
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView>

                {/* Password Change Form */}
                <View style={styles.passwordChangeContainer}>
                    <Text style={styles.formTitle}>Change Password</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Current Password"
                        secureTextEntry
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="New Password"
                        secureTextEntry
                        value={newPassword}
                        onChangeText={setNewPassword}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Confirm New Password"
                        secureTextEntry
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                    />
                    <Button title="Change Password" onPress={handleChangePassword} />
                </View>
            </ScrollView>
        </View>
    );
};

export default Discover;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#7f8c8d',
        marginBottom: 20,
    },
    resourceContainer: {
        marginBottom: 20,
        backgroundColor: '#f9f9f9',
        padding: 15,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    resourceTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#34495e',
        marginBottom: 5,
    },
    resourceDescription: {
        fontSize: 14,
        color: '#7f8c8d',
        marginBottom: 10,
    },
    button: {
        backgroundColor: '#27ae60',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    passwordChangeContainer: {
        marginTop: 30,
        padding: 15,
        backgroundColor: '#f1f1f1',
        borderRadius: 10,
    },
    formTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#dcdcdc',
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
        fontSize: 16,
    },
});
