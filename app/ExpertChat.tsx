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
import { collection, query, onSnapshot, addDoc, Timestamp, orderBy, where } from 'firebase/firestore'; 
import { db, auth, storage } from '@/services/config'; // Firebase configuration file
import { Ionicons } from '@expo/vector-icons'; // Icons from Ionicons
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage'; // For Firebase Storage

interface Farmer {
  id: string;
  name: string;
}

interface Message {
  text?: string;
  imageUrl?: string;
  timestamp: Timestamp;
  sender: string;
}

const ExpertChatScreen = () => {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState<string>('');
  const [loadingMessages, setLoadingMessages] = useState<boolean>(true);
  const [showChat, setShowChat] = useState<boolean>(false);
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
  const [image, setImage] = useState<string | null>(null); // To hold the image URI
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
      })) as Farmer[];
      setFarmers(farmerList);
    }, (error) => {
      console.error('Error fetching farmers:', error);
      Alert.alert('Error', 'Failed to load farmers.');
    });

    return () => unsubscribe();
  };

  const handleFarmerSelect = (farmer: Farmer) => {
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
      console.error('Error fetching messages:', error);
      setLoadingMessages(false);
      Alert.alert('Error', 'Failed to load messages.');
    });

    return () => unsubscribe();
  };

  const sendMessage = async () => {
    if (message.trim() === '' && !image) {
      Alert.alert('Empty Message', 'Please enter a message or select an image.');
      return;
    }

    if (!chatId || !user) {
      Alert.alert('No Chat Selected', 'Please select a farmer to chat with.');
      return;
    }

    try {
      const messageData: Message = {
        text: message.trim() === '' ? undefined : message.trim(),
        timestamp: Timestamp.now(),
        sender: user.uid,
      };

      if (image) {
        const imageUrl = await uploadImage(image); // Upload the image and get the URL
        messageData.imageUrl = imageUrl;
      }

      await addDoc(collection(db, `chats/${chatId}/messages`), messageData);
      setMessage(''); // Clear the input field
      setImage(null); // Clear the image URI
      Keyboard.dismiss(); // Dismiss the keyboard
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message.');
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
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      const imageUri = result.assets[0].uri;
      setImage(imageUri);
    }
  };

  const uploadImage = async (uri: string) => {
    const blob = await fetch(uri).then((response) => response.blob());
    const storageRef = ref(storage, `images/${Date.now()}_${user?.uid}.jpg`);
    const uploadTask = uploadBytesResumable(storageRef, blob);

    return new Promise<string>((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        () => {},
        (error) => {
          console.error('Image upload failed:', error);
          reject('Error uploading image. Please try again.');
        },
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadUrl);
        }
      );
    });
  };

  const renderMessagesList = () => (
    <FlatList
      data={messages}
      keyExtractor={(item, index) => index.toString()}
      renderItem={({ item }) => (
        <View style={[styles.messageCard, item.sender === user?.uid ? styles.userMessage : styles.otherMessage]}>
          {item.text ? <Text>{item.text}</Text> : null}
          {item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={styles.imageMessage} /> : null}
          <Text style={styles.timestamp}>{item.timestamp.toDate().toLocaleString()}</Text>
        </View>
      )}
      style={styles.messagesList}
      contentContainerStyle={styles.messagesContainer}
    />
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
                placeholder="Write your message..."
                value={message}
                onChangeText={setMessage}
                style={styles.input}
                multiline={true}
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
          <FlatList
            data={farmers}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.farmerCard} onPress={() => handleFarmerSelect(item)}>
                <Text>{item.name}</Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.farmerListContainer}
          />
        )}
        {loadingMessages && <ActivityIndicator size="large" color="#0000ff" />}
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
    padding: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f0f0f0',
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    marginRight: 10,
  },
  iconButton: {
    padding: 10,
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
    backgroundColor: '#DCF8C6',
    alignSelf: 'flex-end',
  },
  otherMessage: {
    backgroundColor: '#F1F0F0',
    alignSelf: 'flex-start',
  },
  timestamp: {
    fontSize: 10,
    marginTop: 5,
    color: '#555',
  },
  imageMessage: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginTop: 5,
  },
  backButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  farmerCard: {
    padding: 20,
    backgroundColor: '#f9f9f9',
    marginBottom: 10,
    borderRadius: 10,
  },
  farmerListContainer: {
    padding: 10,
  },
});

export default ExpertChatScreen;
