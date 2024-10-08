import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, ScrollView } from 'react-native';
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/services/config';

const Forum = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // Fetch current user
  const currentUser = auth.currentUser;

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
      setMessages(fetchedMessages);
    });

    return () => unsubscribe();
  }, []);

  // Function to send a new message
  const sendMessage = async () => {
    if (newMessage.trim() === '') return;

    const messageData = {
      text: newMessage,
      createdAt: new Date(),
      userId: currentUser.uid,
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
