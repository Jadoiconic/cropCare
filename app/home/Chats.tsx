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
import { collection, query, onSnapshot, addDoc, Timestamp, orderBy, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { db, auth } from '@/services/config'; // Make sure Firebase config is properly set up

interface User {
  id: string;
  name: string;
}

interface Message {
  text: string;
  timestamp: Timestamp;
  sender: string;
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
  const [conversations, setConversations] = useState<User[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);

  const user = auth.currentUser;

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
  }, [isExpert]);

  const fetchUsers = () => {
    if (isExpert) {
      fetchConversations();
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

  const fetchConversations = () => {
    const conversationQuery = query(collection(db, 'chats'), where('expertId', '==', auth.currentUser?.uid));
    const unsubscribe = onSnapshot(conversationQuery, async (snapshot) => {
      const conversationList = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const { farmerId } = doc.data();
          const farmerDoc = await doc(db, 'farmers', farmerId).get();
          return { id: farmerDoc.id, ...farmerDoc.data() } as User;
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

      // Check if the chat document exists
      const chatDocRef = doc(db, 'chats', chatId);
      const chatDocSnapshot = await getDocs(query(chatDocRef));

      if (chatDocSnapshot.empty) {
        // Create chat document if it doesn't exist
        await setDoc(chatDocRef, {
          chatId: chatId,
          createdAt: Timestamp.now(),
          expertId: selectedUser?.id,
          farmerId: auth.currentUser?.uid,
        });
      }

      // Add message to Firestore
      await addDoc(collection(db, `chats/${chatId}/messages`), messageData);
      console.log('Message sent:', messageData);

      setMessage('');
      Keyboard.dismiss();
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  const renderUserCard = ({ item }: { item: User }) => (
    <TouchableOpacity style={styles.userCard} onPress={() => handleUserSelect(item)}>
      <Text style={styles.userName}>{item.name}</Text>
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
          <View style={styles.userListContainer}>
            <Text style={styles.header}>
              {isExpert ? 'Your Conversations' : 'Available Experts'}
            </Text>
            {loadingUsers ? (
              <ActivityIndicator size="large" color="#0000ff" />
            ) : (
              <FlatList
                data={isExpert ? conversations : users}
                keyExtractor={(item) => item.id}
                renderItem={renderUserCard}
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
    padding: 10,
  },
  userCard: {
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
  },
  userName: {
    fontSize: 18,
  },
  chatContainer: {
    flex: 1,
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    color: '#007BFF',
  },
  header: {
    fontSize: 22,
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  input: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    marginRight: 10,
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    paddingBottom: 20,
  },
  messageCard: {
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    maxWidth: '75%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
  },
  timestamp: {
    fontSize: 10,
    color: '#808080',
  },
  userList: {
    flex: 1,
  },
  userListContainer: {
    flex: 1,
  },
});

export default CombinedChatScreen;
