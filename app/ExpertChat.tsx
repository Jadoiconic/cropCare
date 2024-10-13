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
  Modal,
  Pressable,
} from 'react-native';
import { collection, query, onSnapshot, addDoc, Timestamp, orderBy, where } from 'firebase/firestore'; 
import { db, auth } from '@/services/config'; 
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system'; // Import FileSystem for downloading images
import { Ionicons } from '@expo/vector-icons';

interface User {
  id: string;
  name: string;
}

interface Message {
  text: string;
  timestamp: Timestamp;
  sender: string;
  imageUrl?: string;
}

const ExpertChatScreen = () => {
  const [farmers, setFarmers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState<string>('');
  const [loadingMessages, setLoadingMessages] = useState<boolean>(true);
  const [showChat, setShowChat] = useState<boolean>(false);
  const [selectedFarmer, setSelectedFarmer] = useState<User | null>(null);
  const [imageModalVisible, setImageModalVisible] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
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

      await addDoc(collection(db, `chats/${chatId}/messages`), messageData);
      setMessage(''); // Clear the input field
      Keyboard.dismiss(); // Dismiss the keyboard
    } catch (error) {
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  const sendImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync();
    if (result.cancelled) return;

    const imageData: Message = {
      text: '', // Optional text field
      timestamp: Timestamp.now(),
      sender: user.uid,
      imageUrl: result.uri, // Save the image URI
    };

    try {
      await addDoc(collection(db, `chats/${chatId}/messages`), imageData);
    } catch (error) {
      Alert.alert('Error', 'Failed to send image. Please try again.');
    }
  };

  const openImage = (uri: string) => {
    setSelectedImage(uri);
    setImageModalVisible(true);
  };

  const downloadImage = async (uri: string) => {
    const fileUri = `${FileSystem.documentDirectory}${Date.now()}.jpg`; // Save the image with a timestamp to avoid naming conflicts
    const downloadResumable = FileSystem.createDownloadResumable(
      uri,
      fileUri,
      {},
      {}
    );

    try {
      const { uri: localUri } = await downloadResumable.downloadAsync();
      Alert.alert('Image Downloaded', `Image saved to ${localUri}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to download image. Please try again.');
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
              {item.imageUrl && (
                <TouchableOpacity onPress={() => openImage(item.imageUrl)}>
                  <Image source={{ uri: item.imageUrl }} style={styles.image} />
                </TouchableOpacity>
              )}
              {item.text ? <Text>{item.text}</Text> : null}
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
              <TouchableOpacity onPress={sendImage}>
                <Ionicons name="image" size={24} color="black" />
              </TouchableOpacity>
              <TouchableOpacity onPress={sendMessage}>
                <Ionicons name="send" size={24} color="black" />
              </TouchableOpacity>
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

        {/* Modal for viewing image */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={imageModalVisible}
          onRequestClose={() => setImageModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            {selectedImage && (
              <View style={styles.modalContent}>
                <Image source={{ uri: selectedImage }} style={styles.modalImage} />
                <Pressable style={styles.downloadButton} onPress={() => downloadImage(selectedImage)}>
                  <Text style={styles.downloadButtonText}>Download Image</Text>
                </Pressable>
                <Pressable onPress={() => setImageModalVisible(false)}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </Pressable>
              </View>
            )}
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  chatContainer: {
    flex: 1,
  },
  farmerListContainer: {
    flex: 1,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  farmerCard: {
    padding: 15,
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
    marginBottom: 10,
  },
  farmerName: {
    fontSize: 18,
  },
  messagesList: {
    flex: 1,
    marginBottom: 10,
  },
  messagesContainer: {
    paddingBottom: 10,
  },
  messageCard: {
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  userMessage: {
    backgroundColor: '#d1fcd1',
    alignSelf: 'flex-end',
  },
  otherMessage: {
    backgroundColor: '#f1f0f0',
    alignSelf: 'flex-start',
  },
  timestamp: {
    fontSize: 10,
    color: '#666',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
  image: {
    width: 200,
    height: 150,
    marginBottom: 5,
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: 'blue',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContent: {
    alignItems: 'center',
  },
  modalImage: {
    width: 300,
    height: 300,
    borderRadius: 10,
  },
  downloadButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: 'blue',
    borderRadius: 5,
  },
  downloadButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  closeButtonText: {
    color: 'white',
    marginTop: 10,
  },
});

export default ExpertChatScreen;
