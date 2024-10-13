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
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  Timestamp, 
  orderBy, 
  where, 
  doc, 
  getDoc, 
  setDoc, 
  limit
} from 'firebase/firestore';
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

interface Conversation {
  id: string;
  farmerName: string;
  latestMessage: string;
}

const CombinedChatScreen = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState<string>('');
  const [loadingMessages, setLoadingMessages] = useState<boolean>(true);
  const [showChat, setShowChat] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true);
  const [isExpert, setIsExpert] = useState<boolean>(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const user = auth.currentUser;
  const [chatId, setChatId] = useState<string | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      const userRef = collection(db, 'farmers');
      const userQuery = query(userRef, where('email', '==', user?.email));
      const unsubscribe = onSnapshot(userQuery, (snapshot) => {
        const currentUserData = snapshot.docs[0]?.data();
        if (currentUserData) {
          setIsExpert(currentUserData.role === 'Expert');
        }
      });

      return () => unsubscribe();
    };

    fetchRole();
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    if (isExpert) {
      fetchConversationsWithLatestMessage();
    } else {
      const usersQuery = query(collection(db, 'farmers'), where('role', '==', 'Expert'));
      const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
        const userList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as User[];
        setUsers(userList);
        setLoadingUsers(false);
      }, (error) => {
        Alert.alert('Error', 'Failed to load experts. Please try again later.');
        setLoadingUsers(false);
      });

      return () => unsubscribe();
    }
  };

  const fetchConversationsWithLatestMessage = () => {
    const conversationQuery = query(collection(db, 'chats'), where('expertId', '==', auth.currentUser?.uid));
    const unsubscribe = onSnapshot(conversationQuery, async (snapshot) => {
      const conversationList = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const { farmerId } = doc.data();
          const farmerDoc = await getDoc(doc(db, 'farmers', farmerId));
          const farmerName = farmerDoc.data()?.name || 'Unknown Farmer';

          // Get the latest message from this chat
          const messagesRef = collection(db, `chats/${doc.id}/messages`);
          const latestMessageQuery = query(messagesRef, orderBy('timestamp', 'desc'), limit(1));
          const latestMessageSnapshot = await getDoc(latestMessageQuery);
          const latestMessage = latestMessageSnapshot.exists()
            ? latestMessageSnapshot.data()?.text || 'No messages yet'
            : 'No messages yet';

          return {
            id: farmerDoc.id,
            farmerName,
            latestMessage,
          };
        })
      );
      setConversations(conversationList);
      setLoadingUsers(false);
    }, (error) => {
      Alert.alert('Error', 'Failed to load conversations. Please try again later.');
      setLoadingUsers(false);
    });

    return () => unsubscribe();
  };

  const handleUserSelect = (user: User) => {
    if (!user) {
      Alert.alert('Not Authenticated', 'You need to log in to chat.');
      return;
    }

    const generatedChatId = generateChatId(auth.currentUser?.uid || '', user.id);
    setChatId(generatedChatId);
    setSelectedUser(user);
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
      Alert.alert('No Chat Selected', 'Please select a user to chat with.');
      return;
    }

    try {
      const messageData: Message = {
        text: message.trim(),
        timestamp: Timestamp.now(),
        sender: user.uid,
      };

      // Reference to the chat document
      const chatDocRef = doc(db, 'chats', chatId);

      // Check if the chat document exists
      const chatDocSnapshot = await getDoc(chatDocRef);

      if (!chatDocSnapshot.exists()) {
        // Create chat document if it doesn't exist
        await setDoc(chatDocRef, {
          chatId: chatId,
          createdAt: Timestamp.now(),
          expertId: selectedUser?.id,
          farmerId: auth.currentUser?.uid,
        });
      }

      // Add the message to Firestore
      await addDoc(collection(db, `chats/${chatId}/messages`), messageData);
      console.log('Message sent:', messageData);

      setMessage(''); // Clear the input field after sending
      Keyboard.dismiss();
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  const renderConversationCard = ({ item }: { item: Conversation }) => (
    <TouchableOpacity style={styles.userCard} onPress={() => handleUserSelect(item)}>
      <Text style={styles.userName}>{item.farmerName}</Text>
      <Text style={styles.latestMessage}>{item.latestMessage}</Text>
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
            <Text style={styles.header}>Chat with {selectedUser?.name}</Text>
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
          <View style={styles.conversationContainer}>
            <Text style={styles.header}>Your Conversations</Text>
            {loadingUsers ? (
              <ActivityIndicator size="large" color="#0000ff" />
            ) : (
              <FlatList
                data={conversations}
                keyExtractor={(item) => item.id}
                renderItem={renderConversationCard}
                style={styles.userList}
              />
            )}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  chatContainer: {
    flex: 1,
    padding: 16,
  },
  conversationContainer: {
    flex: 1,
    padding: 16,
  },
  userCard: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    marginBottom: 10,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  latestMessage: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
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
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
  },
  backButton: {
    marginBottom: 20,
  },
  backButtonText: {
    color: '#0000ff',
    fontSize: 16,
  },
  messageCard: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    alignSelf: 'flex-start',
  },
  userMessage: {
    backgroundColor: '#DCF8C6',
    alignSelf: 'flex-end',
  },
  otherMessage: {
    backgroundColor: '#E5E5EA',
  },
  timestamp: {
    fontSize: 10,
    color: '#666',
    marginTop: 5,
  },
  userList: {
    marginTop: 10,
  },
});

export default CombinedChatScreen;
