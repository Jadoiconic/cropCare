import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, ActivityIndicator, StyleSheet, Image } from 'react-native';
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
    // Check for empty fields
    if (!name || !email || !password || !cropExpertise) {
      Alert.alert('Ikosa', 'Nyamuneka uzuzemo imirongo yose, harimo n’ubuhanga mu buhinzi.');
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

      Alert.alert('Success', 'Umujyanama yanditswe neza.');
    } catch (error) {
      Alert.alert('Ikosa mu kwiyandikisha', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('@/assets/logo.jpg')} style={styles.logo} />
      <Text style={styles.title}>Iyandikishe nk’Umujyanama</Text>

      <TextInput
        placeholder="Amazina"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder="Imeyili"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        style={styles.input}
      />
      <TextInput
        placeholder="Ijambo ry'ibanga"
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
        <Picker.Item label="Hitamo Ubwoko Bwumujyanama mu buhinzi" value="" />
        <Picker.Item label="Umujyanama ku Buhinzi bw'Ibirayi" value="Umujyanama ku Buhinzi bw'Ibirayi" />
        <Picker.Item label="Umujyanama ku Buhinzi bw'Ibigori" value="Umujyanama ku Buhinzi bw'Ibigori" />
      </Picker>

      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : (
        <Button title="Iyandikishe" onPress={handleRegister} color="#4CAF50" />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center', // Center items horizontally
  },
  logo: {
    width: 100, // Adjust the width as needed
    height: 100, // Adjust the height as needed
    marginBottom: 20, // Space between logo and title
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
    width: '100%', // Make inputs take full width
  },
});

export default RegisterExpertScreen;
