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
import * as MediaLibrary from 'expo-media-library'; // Import MediaLibrary
import { collection, query, onSnapshot, addDoc, Timestamp, orderBy, where } from 'firebase/firestore';
import { db, auth, storage } from '@/services/config';
import { Ionicons } from '@expo/vector-icons';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';

interface Expert {
  id: string;
  name: string;
}

interface Message {
  text?: string;
  imageUrl?: string;
  timestamp: Timestamp;
  sender: string;
}

const FarmerChatScreen = () => {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState<string>('');
  const [loadingMessages, setLoadingMessages] = useState<boolean>(true);
  const [showChat, setShowChat] = useState<boolean>(false);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const user = auth.currentUser;
  const [chatId, setChatId] = useState<string | null>(null);
  const [sendingMessage, setSendingMessage] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    requestMediaLibraryPermission(); // Request permission on mount
    fetchExperts();
  }, []);

  // Function to request media library permissions
  const requestMediaLibraryPermission = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Permission to access camera roll is required!');
    }
  };

  const fetchExperts = () => {
    const expertsQuery = query(collection(db, 'farmers'), where('role', '==', 'Expert'));
    const unsubscribe = onSnapshot(
      expertsQuery,
      (snapshot) => {
        const expertList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Expert[];
        setExperts(expertList);
      },
      (error) => {
        console.error('Error fetching experts:', error);
        Alert.alert('Error', 'Failed to load experts.');
      }
    );

    return () => unsubscribe();
  };

  const handleExpertSelect = (expert: Expert) => {
    if (!user) {
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
    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const messagesList = snapshot.docs.map((doc) => doc.data() as Message);
        setMessages(messagesList);
        setLoadingMessages(false);
      },
      (error) => {
        console.error('Error fetching messages:', error);
        setLoadingMessages(false);
        Alert.alert('Error', 'Failed to load messages.');
      }
    );

    return () => unsubscribe();
  };

  const sendMessage = async () => {
    if (!message && !image) {
      Alert.alert('Empty Message', 'Please enter a message or select an image.');
      return;
    }

    if (!chatId || !user) {
      Alert.alert('No Chat Selected', 'Please select an expert to chat with.');
      return;
    }

    setSendingMessage(true);

    try {
      const messageData: Message = {
        text: message.trim() || undefined,
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
      setImage(result.assets[0].uri);
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
          {item.text && <Text>{item.text}</Text>}
          {item.imageUrl && (
            <TouchableOpacity onPress={() => handleImagePress(item.imageUrl)}>
              <Image source={{ uri: item.imageUrl }} style={styles.imageMessage} />
            </TouchableOpacity>
          )}
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
        <>
          <View style={styles.chatHeader}>
            
            <TouchableOpacity onPress={() => setShowChat(false)} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="green" />
            </TouchableOpacity>
            <Text style={styles.expertName}>Chat with {selectedExpert?.name}</Text>
          </View>

          {loadingMessages ? <ActivityIndicator size="large" color="green" /> : renderMessagesList()}

          <View style={styles.inputContainer}>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Type your message"
              style={styles.messageInput}
            />
            <TouchableOpacity onPress={handleImagePick} style={styles.imagePickerButton}>
              <Ionicons name="image" size={24} color="green" />
            </TouchableOpacity>
            <TouchableOpacity onPress={sendMessage} style={styles.sendButton} disabled={sendingMessage}>
              {image && <Image source={{ uri: image }} style={styles.previewImage} />}
              <Ionicons name="send" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {selectedImage && (
            <Modal visible={modalVisible} transparent={true} onRequestClose={() => setModalVisible(false)}>
              <View style={styles.modalContainer}>
                <Image source={{ uri: selectedImage }} style={styles.fullScreenImage} />
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </Modal>
          )}
        </>
      ) : (
        <><View style={styles.textContainer}>
            <Text style={styles.text}>Ganira Numujyanama mubuhinzi</Text>
          </View>
        <FlatList

            data={experts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <>
                <TouchableOpacity onPress={() => handleExpertSelect(item)} style={styles.expertCard}>
                  <Text style={styles.expertName}>{item.name}</Text>
                </TouchableOpacity></>
            )}
            contentContainerStyle={styles.expertListContainer} /></>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backButton: {
    marginRight: 10,
  },
  expertName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  messagesList: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f1f1f1',
  },
  messagesContainer: {
    paddingBottom: 20,
  },
  messageCard: {
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
    maxWidth: '80%',
  },
  userMessage: {
    backgroundColor: '#d1f8d3',
    alignSelf: 'flex-end',
  },
  otherMessage: {
    backgroundColor: '#f0f0f0',
    alignSelf: 'flex-start',
  },
  imageMessage: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginVertical: 5,
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  messageInput: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 10,
  },
  imagePickerButton: {
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 20,
  },
  previewImage: {
    width: 40,
    height: 40,
    borderRadius: 5,
    marginRight: 10,
  },
  expertCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 10,
    marginHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  expertListContainer: {
    paddingTop: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '90%',
    height: '70%',
    borderRadius: 10,
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'red',
    borderRadius: 20,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  textContainer: {
    backgroundColor: '#f0f0f0', // Light background for contrast
    padding: 16, // Add some padding around the text
    borderRadius: 8, // Rounded corners for a softer look
    margin: 16, // Add margin around the container
    shadowColor: '#000', // Shadow for depth
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2, // Android shadow
  },
  text: {
    fontSize: 20, // Increased font size for readability
    fontWeight: 'bold', // Bold text for emphasis
    color: '#333', // Darker color for contrast
    textAlign: 'center', // Center text
  },
});


export default FarmerChatScreen;
