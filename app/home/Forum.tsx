import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, ScrollView } from 'react-native';
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/services/config';
import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';

const Forum = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // Fetch current user
  const currentUser = auth.currentUser;

  useEffect(() => {
    // Request notification permissions when the app loads
    const requestPermission = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('You need to enable notifications in the app settings.');
      }
    };

    requestPermission();
  }, []);

  useEffect(() => {
    // Query to get all chat messages, ordered by timestamp
    const messagesRef = collection(db, 'chatrooms', 'general', 'messages');
    const q = query(messagesRef, orderBy('createdAt'));

    // Real-time listener for new messages
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Check for new incoming messages and trigger a notification
      if (fetchedMessages.length > messages.length) {
        const latestMessage = fetchedMessages[fetchedMessages.length - 1];
        if (latestMessage.userId !== currentUser?.uid) {
          triggerNotification(latestMessage);
        }
      }

      setMessages(fetchedMessages);
    });

    return () => unsubscribe();
  }, [messages]);

  // Function to trigger a local notification
  const triggerNotification = (message) => {
    Notifications.scheduleNotificationAsync({
      content: {
        title: 'New Message',
        body: `${message.userName}: ${message.text}`,
        sound: true,
      },
      trigger: { seconds: 1 },
    });
  };

  // Function to send a new message
  const sendMessage = async () => {
    if (newMessage.trim() === '') return;

    const messageData = {
      text: newMessage,
      createdAt: new Date(),
      userId: currentUser?.uid,
      userName: currentUser?.email, // Store the username or any relevant user data
    };

    // Add message to Firestore
    const messagesRef = collection(db, 'chatrooms', 'general', 'messages');
    await addDoc(messagesRef, messageData);

    setNewMessage(''); // Clear input after sending
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.messagesContainer}>
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageBubble,
              message.userId === currentUser.uid ? styles.outgoingMessage : styles.incomingMessage,
            ]}
          >
            {message.userId !== currentUser.uid && <Text style={{ color: 'gray' }}>{message.userName}</Text>}
            <Text style={styles.messageText}>{message.text}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>

        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <Button title="Send" onPress={sendMessage} />
      </View>
    </View>
  );
};

export default Forum;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  messagesContainer: {
    flex: 1,
    marginBottom: 10,
  },
  messageBubble: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    maxWidth: '70%',
  },
  outgoingMessage: {
    backgroundColor: '#dcf8c6', // Light green for outgoing messages
    alignSelf: 'flex-end',
  },
  incomingMessage: {
    backgroundColor: '#f1f0f0', // Light grey for incoming messages
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    width: '80%',
    borderColor: '#ccc',
    borderRadius: 20,
    padding: 10,
    marginBottom: 10,
  },
});
