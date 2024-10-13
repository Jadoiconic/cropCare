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
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { collection, query, onSnapshot, addDoc, Timestamp, orderBy, where } from 'firebase/firestore'; 
import { db, auth } from '@/services/config'; 
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons

interface User {
  id: string;
  name: string;
}

interface Message {
  text?: string; // text can be undefined for image messages
  imageUrl?: string; // URL of the image
  timestamp: Timestamp;
  sender: string;
}

const FarmerChatScreen = () => {
  const [experts, setExperts] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState<string>('');
  const [loadingMessages, setLoadingMessages] = useState<boolean>(true);
  const [showChat, setShowChat] = useState<boolean>(false);
  const [selectedExpert, setSelectedExpert] = useState<User | null>(null);
  const user = auth.currentUser;
  const [chatId, setChatId] = useState<string | null>(null);

  // Fetch experts on component mount
  useEffect(() => {
    fetchExperts();
  }, []);

  const fetchExperts = () => {
    const expertsQuery = query(collection(db, 'farmers'), where('role', '==', 'Expert'));
    const unsubscribe = onSnapshot(expertsQuery, (snapshot) => {
      const expertList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as User[];
      setExperts(expertList);
    }, (error) => {
      console.error('Error fetching experts:', error);
      Alert.alert('Error', 'Failed to load experts. Please try again later.');
    });

    return () => unsubscribe();
  };

  const handleExpertSelect = (expert: User) => {
    if (!user) {
      console.log('User not authenticated.');
      Alert.alert('Not Authenticated', 'You need to log in to chat.');
      return;
    }

    const generatedChatId = generateChatId(user.uid, expert.id);
    setChatId(generatedChatId);
    setSelectedExpert(expert);
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
      console.log('Fetched Messages:', messagesList);
      setMessages(messagesList);
      setLoadingMessages(false);
    }, (error) => {
      console.error('Error fetching messages:', error);
      Alert.alert('Error', 'Failed to load messages. Please try again later.');
      setLoadingMessages(false);
    });

    return () => unsubscribe();
  };

  const sendMessage = async () => {
    if (message.trim() === '' && !image) {
      Alert.alert('Empty Message', 'Please enter a message or select an image to send.');
      return;
    }

    if (!chatId || !user) {
      Alert.alert('No Chat Selected', 'Please select an expert to chat with.');
      return;
    }

    try {
      const messageData: Message = {
        text: message.trim() === '' ? undefined : message.trim(),
        timestamp: Timestamp.now(),
        sender: user.uid,
      };

      await addDoc(collection(db, `chats/${chatId}/messages`), messageData);
      setMessage(''); // Clear the input field
      Keyboard.dismiss(); // Dismiss the keyboard
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  const handleImagePick = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      const imageUri = result.assets[0].uri;
      console.log('Picked Image URI:', imageUri);
      await uploadImage(imageUri);
    }
  };

  const uploadImage = async (uri: string) => {
    const fileName = uri.split('/').pop();
    const newPath = `${FileSystem.documentDirectory}${fileName}`;

    await FileSystem.moveAsync({
      from: uri,
      to: newPath,
    });

    const messageData: Message = {
      imageUrl: newPath,
      timestamp: Timestamp.now(),
      sender: user?.uid,
    };

    await addDoc(collection(db, `chats/${chatId}/messages`), messageData);
  };

  const renderExpertCard = ({ item }: { item: User }) => (
    <TouchableOpacity style={styles.expertCard} onPress={() => handleExpertSelect(item)}>
      <Text style={styles.expertName}>{item.name}</Text>
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
              {item.text ? (
                <Text>{item.text}</Text>
              ) : item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.imageMessage} />
              ) : null}
              <Text style={styles.timestamp}>{item.timestamp.toDate().toLocaleString()}</Text>
            </View>
          )}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContainer}
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
            <Text style={styles.header}>Chat with {selectedExpert?.name}</Text>
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
              <TouchableOpacity onPress={sendMessage} style={styles.iconButton}>
                <Ionicons name="send" size={24} color="#4CAF50" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleImagePick} style={styles.iconButton}>
                <Ionicons name="image" size={24} color="#2196F3" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.expertListContainer}>
            <Text style={styles.header}>Experts</Text>
            <FlatList
              data={experts}
              keyExtractor={(item) => item.id}
              renderItem={renderExpertCard}
              style={styles.expertList}
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
  expertCard: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 10,
  },
  expertName: {
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
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    maxWidth: '80%',
  },
  userMessage: {
    backgroundColor: '#d1ffd1',
    alignSelf: 'flex-end',
  },
  otherMessage: {
    backgroundColor: '#f0f0f0',
    alignSelf: 'flex-start',
  },
  timestamp: {
    fontSize: 10,
    color: '#888',
    marginTop: 5,
  },
  imageMessage: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    color: '#2196F3',
    fontSize: 16,
  },
  iconButton: {
    marginLeft: 10,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expertListContainer: {
    flex: 1,
  },
  expertList: {
    marginTop: 10,
  },
});

export default FarmerChatScreen;
