import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  TextInput,
  Button,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { collection, query, onSnapshot, addDoc, Timestamp, orderBy, where } from 'firebase/firestore';
import { db, auth } from '@/services/config'; // Ensure your Firebase config is correct

interface User {
  id: string;
  name: string;
}

interface Message {
  text: string;
  timestamp: Timestamp;
  sender: string;
}

const ExpertChatScreen = () => {
  const [farmers, setFarmers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState<string>('');
  const [loadingMessages, setLoadingMessages] = useState<boolean>(true);
  const [showChat, setShowChat] = useState<boolean>(false);
  const [selectedFarmer, setSelectedFarmer] = useState<User | null>(null);
  const user = auth.currentUser;
  const [chatId, setChatId] = useState<string | null>(null);

  useEffect(() => {
    fetchFarmers();
  }, []);

  const fetchFarmers = () => {
    const farmersQuery = query(collection(db, 'farmers'), where('role', '==', 'Farmer'));
    const unsubscribe = onSnapshot(farmersQuery, (snapshot) => {
      const farmerList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as User[];
      setFarmers(farmerList);
    }, (error) => {
      Alert.alert('Error', 'Failed to load farmers. Please try again later.');
    });

    return () => unsubscribe();
  };

  const handleFarmerSelect = (farmer: User) => {
    if (!user) {
      Alert.alert('Not Authenticated', 'You need to log in to chat.');
      return;
    }

    const generatedChatId = generateChatId(user.uid, farmer.id);
    setChatId(generatedChatId);
    setSelectedFarmer(farmer);
    fetchMessages(generatedChatId);
    setShowChat(true);
  };

  const generateChatId = (uid1: string, uid2: string): string => {
    return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
  };

  const fetchMessages = (chatId: string) => {
    setLoadingMessages(true);
    const messagesQuery = query(collection(db, `chats/${chatId}/messages`), orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesList = snapshot.docs.map((doc) => doc.data() as Message);
      setMessages(messagesList);
      setLoadingMessages(false);
    }, (error) => {
      Alert.alert('Error', 'Failed to load messages. Please try again later.');
      setLoadingMessages(false);
    });

    return () => unsubscribe();
  };

  const sendMessage = async () => {
    if (message.trim() === '') {
      Alert.alert('Empty Message', 'Please enter a message to send.');
      return;
    }

    if (!chatId || !user) {
      Alert.alert('No Chat Selected', 'Please select a farmer to chat with.');
      return;
    }

    try {
      const messageData: Message = {
        text: message.trim(),
        timestamp: Timestamp.now(),
        sender: user.uid,
      };

      // Send the message to the messages subcollection
      await addDoc(collection(db, `chats/${chatId}/messages`), messageData);

      setMessage(''); // Clear the input field
      Keyboard.dismiss(); // Dismiss the keyboard
    } catch (error) {
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  const renderFarmerCard = ({ item }: { item: User }) => (
    <TouchableOpacity style={styles.farmerCard} onPress={() => handleFarmerSelect(item)}>
      <Text style={styles.farmerName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderMessagesList = () => (
    <>
      {loadingMessages ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={[styles.messageCard, item.sender === user?.uid ? styles.userMessage : styles.otherMessage]}>
              <Text>{item.text}</Text>
              <Text style={styles.timestamp}>{item.timestamp.toDate().toLocaleString()}</Text>
            </View>
          )}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContainer}
          inverted
        />
      )}
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        {showChat ? (
          <View style={styles.chatContainer}>
            <TouchableOpacity onPress={() => setShowChat(false)} style={styles.backButton}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.header}>Chat with {selectedFarmer?.name}</Text>
            {renderMessagesList()}
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Write your message here..."
                value={message}
                onChangeText={setMessage}
                style={styles.input}
                multiline={true}
                numberOfLines={3}
              />
              <Button title="Send" onPress={sendMessage} color="#4CAF50" />
            </View>
          </View>
        ) : (
          <View style={styles.farmerListContainer}>
            <Text style={styles.header}>Farmers</Text>
            <FlatList
              data={farmers}
              keyExtractor={(item) => item.id}
              renderItem={renderFarmerCard}
              style={styles.farmerList}
            />
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  farmerCard: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 10,
  },
  farmerName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  chatContainer: {
    flex: 1,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    paddingBottom: 20,
  },
  messageCard: {
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#4CAF50',
    color: '#fff',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f1f1',
  },
  timestamp: {
    fontSize: 10,
    color: '#888',
    marginTop: 5,
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    color: '#007BFF',
  },
  farmerListContainer: {
    flex: 1,
  },
  farmerList: {
    marginTop: 10,
  },
});

export default ExpertChatScreen;
