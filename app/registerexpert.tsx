import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Correct Picker import
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/services/config'; // Firebase configuration

const RegisterExpertScreen = () => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [cropExpertise, setCropExpertise] = useState<string>(''); // Expertise state
  const [loading, setLoading] = useState<boolean>(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !cropExpertise) {
      Alert.alert('Error', 'Please fill in all fields, including crop expertise.');
      return;
    }

    setLoading(true);

    try {
      // Register user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Add user details to Firestore under 'farmers'
      await setDoc(doc(db, 'farmers', user.uid), {
        name,
        email,
        role: 'Expert', // Fixed role as "Expert"
        cropExpertise,  // Store the selected expertise
        createdAt: new Date(),
      });

      setLoading(false);
      Alert.alert('Success', 'Expert registered successfully.');
    } catch (error) {
      setLoading(false);
      Alert.alert('Registration Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register as an Expert</Text>

      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <Picker
        selectedValue={cropExpertise}
        style={styles.input}
        onValueChange={(itemValue) => setCropExpertise(itemValue)}
      >
        <Picker.Item label="Select Crop Expertise" value="" />
        <Picker.Item label="Umujyanama ku Buhinzi bw'Ibirayi (Potato Expert)" value="Umujyanama ku Buhinzi bw'Ibirayi" />
        <Picker.Item label="Umujyanama ku Buhinzi bw'Ibigori (Maize Expert)" value="Umujyanama ku Buhinzi bw'Ibigori" />
      </Picker>

      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : (
        <Button title="Register" onPress={handleRegister} color="#4CAF50" />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
  },
});

export default RegisterExpertScreen;
