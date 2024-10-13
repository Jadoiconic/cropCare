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
import { db, auth, storage } from '@/services/config'; // Adjust the import path as necessary
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
    fetchExperts();  // Fetch the list of available experts on screen load
  }, []);

  // Fetch all experts for the farmer to chat with
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

  // Handle expert selection by the farmer
  const handleExpertSelect = (expert: Expert) => {
    if (!user) {
      Alert.alert('Not Authenticated', 'You need to log in to chat.');
      return;
    }

    const generatedChatId = generateChatId(user.uid, expert.id);
    setChatId(generatedChatId);
    setSelectedExpert(expert);
    fetchMessages(generatedChatId);  // Load previous messages for this farmer-expert chat
    setShowChat(true);
  };

  // Generate a chat ID that is unique for the farmer-expert pair
  const generateChatId = (uid1: string, uid2: string): string => {
    return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
  };

  // Fetch chat messages for the selected expert
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

  // Handle sending of text and image messages
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
        text: message ? message.trim() : undefined,
        timestamp: Timestamp.now(),
        sender: user.uid,
      };

      if (image) {
        const imageUrl = await uploadImage(image);  // Upload image if selected
        messageData.imageUrl = imageUrl;
      }

      await addDoc(collection(db, `chats/${chatId}/messages`), messageData);
      setMessage('');
      setImage(null);
      Keyboard.dismiss();  // Close keyboard after sending
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message.');
    } finally {
      setSendingMessage(false);
    }
  };

  // Pick an image from the gallery
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
      setImage(imageUri);  // Set selected image
    }
  };

  // Upload image to Firebase storage
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

  // Display full image in a modal when an image message is clicked
  const handleImagePress = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setModalVisible(true);
  };

  // Render the list of messages between farmer and expert
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
              <Ionicons name="send" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {selectedImage && (
            <Modal visible={modalVisible} transparent={true}>
              <View style={styles.modalContainer}>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Image source={{ uri: selectedImage }} style={styles.fullImage} />
                </TouchableOpacity>
              </View>
            </Modal>
          )}
        </>
      ) : (
        <FlatList
          data={experts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleExpertSelect(item)} style={styles.expertItem}>
              <Text>{item.name}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.expertList}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f1f1f1',
  },
  expertName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  backButton: {
    padding: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
  },
  imagePickerButton: {
    marginLeft: 10,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    paddingBottom: 10,
  },
  messageCard: {
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#d4edda',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f8d7da',
  },
  timestamp: {
    fontSize: 10,
    color: '#888',
    marginTop: 5,
  },
  imageMessage: {
    width: 100,
    height: 100,
    borderRadius: 5,
    marginTop: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  fullImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  expertItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  expertList: {
    paddingBottom: 10,
  },
});

export default FarmerChatScreen;
