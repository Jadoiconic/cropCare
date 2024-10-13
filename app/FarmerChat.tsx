// FarmerChat.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { collection, query, orderBy, onSnapshot, addDoc } from 'firebase/firestore';
import { auth, db } from '@/services/config'; // Use your pre-configured Firebase
import AsyncStorage from '@react-native-async-storage/async-storage';

const FarmerChat = () => {
  const [experts, setExperts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [currentExpertId, setCurrentExpertId] = useState(null);

  const user = auth.currentUser || {
    uid: 'farmer123',
    displayName: 'Farmer Jane Doe',
  };

  useEffect(() => {
    const fetchExperts = () => {
      const expertsQuery = query(collection(db, 'experts'));

      const unsubscribe = onSnapshot(expertsQuery, (snapshot) => {
        const expertsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setExperts(expertsList);
      });

      return () => unsubscribe();
    };

    fetchExperts();
  }, []);

  const openChat = (expertId) => {
    setCurrentExpertId(expertId);
    fetchMessages(expertId);
  };

  const fetchMessages = (expertId) => {
    const q = query(collection(db, `chats/${expertId}/messages`), orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesList = snapshot.docs.map(doc => doc.data());
      setMessages(messagesList);
    });

    return () => unsubscribe();
  };

  const sendMessage = async () => {
    if (message) {
      try {
        await addDoc(collection(db, `chats/${currentExpertId}/messages`), {
          text: message,
          timestamp: new Date(),
          sender: user.uid,
        });
        setMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
        Alert.alert('Failed to send message.');
      }
    }
  };

  if (!currentExpertId) {
    return (
      <View style={{ padding: 20 }}>
        <Text>Experts List</Text>
        <FlatList
          data={experts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => openChat(item.id)}>
              <Text>{item.name}</Text>
              <Text>{item.crop}</Text>
              <Text>{item.phone}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <FlatList
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View>
            {item.text ? <Text>{item.text}</Text> : null}
          </View>
        )}
      />
      <TextInput
        value={message}
        onChangeText={setMessage}
        placeholder="Type a message..."
      />
      <Button title="Send" onPress={sendMessage} />
    </View>
  );
};

export default FarmerChat;
