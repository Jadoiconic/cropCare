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
  Image,
  Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { collection, query, onSnapshot, addDoc, Timestamp, orderBy, where } from 'firebase/firestore'; 
import { db, auth, storage } from '@/services/config';
import { Ionicons } from '@expo/vector-icons';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';

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
  const [image, setImage] = useState<string | null>(null);
  const user = auth.currentUser;
  const [chatId, setChatId] = useState<string | null>(null);
  const [sendingMessage, setSendingMessage] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
    if (!message && !image) {
      Alert.alert('Empty Message', 'Please enter a message or select an image.');
      return;
    }

    if (!chatId || !user) {
      Alert.alert('No Chat Selected', 'Please select a farmer to chat with.');
      return;
    }

    setSendingMessage(true);

    try {
      const messageData: Message = {
        text: message ? message.trim() : undefined,
        timestamp: Timestamp.now(),
        sender: user.uid,
      };

      if (image) {
        const imageUrl = await uploadImage(image);
        messageData.imageUrl = imageUrl;
      }

      await addDoc(collection(db, `chats/${chatId}/messages`), messageData);
      setMessage('');
      setImage(null);
      Keyboard.dismiss();
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message.');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleImagePick = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'Permission to access camera roll is required!');
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

  // Function to open image in full-screen modal
  const handleImagePress = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setModalVisible(true);
  };

  const renderMessagesList = () => (
    <FlatList
      data={messages}
      keyExtractor={(item, index) => index.toString()}
      renderItem={({ item }) => (
        <View style={[styles.messageCard, item.sender === user?.uid ? styles.userMessage : styles.otherMessage]}>
          {item.text ? <Text>{item.text}</Text> : null}
          {item.imageUrl ? (
            <TouchableOpacity onPress={() => handleImagePress(item.imageUrl)}>
              <Image source={{ uri: item.imageUrl }} style={styles.imageMessage} />
            </TouchableOpacity>
          ) : null}
          <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
        </View>
      )}
      style={styles.messagesList}
      contentContainerStyle={styles.messagesContainer}
    />
  );

  const formatTimestamp = (timestamp: Timestamp): string => {
    const date = timestamp.toDate();
    return date.toLocaleString();
  };

  return (
    <SafeAreaView style={styles.container}>
      {showChat ? (
        <View style={styles.chatContainer}>
          <TouchableOpacity onPress={() => setShowChat(false)} style={styles.backButton}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.header}>Chat with {selectedFarmer?.name}</Text>
          {renderMessagesList()}
          {loadingMessages && <ActivityIndicator size="large" color="#0000ff" />}
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Write your message..."
              value={message}
              onChangeText={setMessage}
              style={styles.input}
              multiline={true}
            />
            <TouchableOpacity
              onPress={handleImagePick}
              style={styles.iconButton}
            >
              <Ionicons name="image" size={24} color={image ? '#4CAF50' : '#2196F3'} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={sendMessage}
              style={styles.iconButton}
              disabled={sendingMessage || (!message && !image)}
            >
              <Ionicons name="send" size={24} color={sendingMessage || (!message && !image) ? '#ccc' : '#4CAF50'} />
            </TouchableOpacity>
          </View>
          {image && <Image source={{ uri: image }} style={styles.previewImage} />}
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

      {/* Modal for full-screen image */}
      <Modal visible={modalVisible} transparent={true}>
        <View style={styles.modalContainer}>
          <Image source={{ uri: selectedImage }} style={styles.fullScreenImage} />
          <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // Set a white background for the entire screen
  },
  chatContainer: {
    flex: 1,
    padding: 10, // Add padding to the chat container
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc', // Add a top border for better separation
  },
  input: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    padding: 10,
    borderRadius: 25, // Make the input field more rounded
    maxHeight: 100,
    borderColor: '#ddd', // Light border for input
    borderWidth: 1,
    fontSize: 16, // Increase font size for better readability
  },
  iconButton: {
    marginLeft: 10,
    padding: 10, // Add padding around icon buttons
    borderRadius: 25, // Make icon buttons rounded
    backgroundColor: '#e1e1e1', // Light gray background for buttons
  },
  messageCard: {
    padding: 10,
    marginBottom: 10,
    borderRadius: 15, // More rounded corners for message bubbles
    maxWidth: '80%',
    shadowColor: '#000', // Adding shadow for depth
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3, // For Android shadow
  },
  userMessage: {
    backgroundColor: '#d1ffd1', // Lighter green for user messages
    alignSelf: 'flex-end',
  },
  otherMessage: {
    backgroundColor: '#f2f2f2',
    alignSelf: 'flex-start',
  },
  imageMessage: {
    width: 200,
    height: 200,
    borderRadius: 15, // More rounded corners for image messages
    marginVertical: 5, // Add space around images
  },
  timestamp: {
    fontSize: 10,
    color: '#888',
    marginTop: 5,
    alignSelf: 'flex-end', // Align timestamp to the right
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    paddingVertical: 10,
  },
  backButton: {
    padding: 10,
    backgroundColor: '#007AFF', // Background color for back button
    borderRadius: 5, // Rounded corners
    alignItems: 'center', // Center the text
  },
  backButtonText: {
    color: '#ffffff', // White text for contrast
    fontWeight: 'bold', // Bold text for emphasis
  },
  farmerCard: {
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5, // Rounded corners for farmer cards
  },
  farmerListContainer: {
    paddingBottom: 10,
  },
  header: {
    fontSize: 20, // Larger font size for header
    fontWeight: 'bold',
    marginVertical: 10,
    textAlign: 'center', // Centered header
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '90%',
    height: '80%',
    borderRadius: 10,
  },
  closeButton: {
    padding: 10,
    backgroundColor: '#007AFF',
    marginTop: 20,
    borderRadius: 5, // Rounded corners for close button
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold', // Bold text for close button
  },
});



export default ExpertChatScreen;
