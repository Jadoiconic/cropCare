import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, ScrollView, TouchableOpacity } from 'react-native';
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/services/config';
import * as Notifications from 'expo-notifications';

const chatrooms = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [replyTo, setReplyTo] = useState(null); // State to hold the message being replied to

  const currentUser = auth.currentUser;

  useEffect(() => {
    const requestPermission = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('You need to enable notifications in the app settings.');
      }
    };

    requestPermission();
  }, []);

  useEffect(() => {
    const messagesRef = collection(db, 'chatrooms', 'general', 'messages');
    const q = query(messagesRef, orderBy('createdAt'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

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

  const sendMessage = async () => {
    if (newMessage.trim() === '') return;

    const messageData = {
      text: newMessage,
      createdAt: new Date(),
      userId: currentUser?.uid,
      userName: currentUser?.email,
      replyTo: replyTo ? { id: replyTo.id, text: replyTo.text, userName: replyTo.userName } : null, // Add reply information
    };

    const messagesRef = collection(db, 'chatrooms', 'general', 'messages');
    await addDoc(messagesRef, messageData);

    setNewMessage('');
    setReplyTo(null); // Clear reply state after sending the message
  };

  const handleReply = (message) => {
    setReplyTo(message); // Set the selected message to reply to
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
            {message.replyTo && (
              <View style={styles.replyContainer}>
                <Text style={styles.replyText}>
                  Reply to {message.replyTo.userName}: {message.replyTo.text}
                </Text>
              </View>
            )}
            <Text style={styles.messageText}>{message.text}</Text>
            <TouchableOpacity onPress={() => handleReply(message)}>
              <Text style={styles.replyButton}>Reply</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {replyTo && (
        <View style={styles.replyInfo}>
          <Text>Replying to {replyTo.userName}: {replyTo.text}</Text>
        </View>
      )}

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

export default chatrooms;

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
    backgroundColor: '#dcf8c6',
    alignSelf: 'flex-end',
  },
  incomingMessage: {
    backgroundColor: '#f1f0f0',
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
  replyButton: {
    color: 'blue',
    marginTop: 5,
  },
  replyContainer: {
    backgroundColor: '#e0e0e0',
    padding: 5,
    borderRadius: 5,
    marginBottom: 5,
  },
  replyText: {
    fontStyle: 'italic',
  },
  replyInfo: {
    padding: 5,
    backgroundColor: '#e6e6e6',
    marginBottom: 10,
    borderRadius: 10,
  },
});
