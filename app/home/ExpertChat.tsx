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
import { collection, query, onSnapshot, addDoc, Timestamp, orderBy, where, updateDoc, doc } from 'firebase/firestore'; 
import { db, auth, storage } from '@/services/config';
import { Ionicons } from '@expo/vector-icons';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';

interface Farmer {
  id: string;
  name: string;
  unreadCount: number;
}

interface Message {
  text?: string;
  imageUrl?: string;
  timestamp: Timestamp;
  sender: string;
  read: boolean;
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
    requestCameraRollPermission(); // Request permission on mount
  }, []);

  const requestCameraRollPermission = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'Permission to access camera roll is required!');
    }
  };

  const fetchFarmers = () => {
    const farmersQuery = query(collection(db, 'farmers'), where('role', '==', 'Farmer'));
    const unsubscribe = onSnapshot(farmersQuery, async (snapshot) => {
      const farmerList: Farmer[] = await Promise.all(snapshot.docs.map(async (doc) => {
        const farmerData = { id: doc.id, ...doc.data() } as Farmer;

        // Fetch unread messages count for each farmer
        const generatedChatId = generateChatId(user?.uid ?? '', farmerData.id);
        const unreadMessagesQuery = query(
          collection(db, `chats/${generatedChatId}/messages`),
          where('read', '==', false),
          where('sender', '!=', user?.uid) // Exclude messages sent by the current user
        );
        const unreadMessagesSnapshot = await onSnapshot(unreadMessagesQuery, (unreadSnapshot) => {
          farmerData.unreadCount = unreadSnapshot.size;
        });

        return farmerData;
      }));

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
    const messagesQuery = query(
      collection(db, `chats/${chatId}/messages`),
      orderBy('timestamp', 'desc') // Fetch newest messages first
    );
    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesList = snapshot.docs.map((doc) => doc.data() as Message);
      setMessages(messagesList);

      // Mark messages as read after fetching
      snapshot.docs.forEach(async (doc) => {
        if (doc.data().sender !== user?.uid && !doc.data().read) {
          await updateDoc(doc.ref, { read: true });
        }
      });

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
        read: false, // Mark as unread initially
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
          {item.text ? <Text style={styles.messageText}>{item.text}</Text> : null}
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
      inverted // Ensures new messages appear at the top
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
          <TouchableOpacity style={styles.backButton} onPress={() => setShowChat(false)}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.header}>Your Conversation with {selectedFarmer?.name}</Text>

          {loadingMessages ? (
            <ActivityIndicator size="large" color="#000" />
          ) : (
            renderMessagesList()
          )}

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={message}
              onChangeText={setMessage}
              placeholder="Type your message..."
            />
            <TouchableOpacity style={styles.iconButton} onPress={handleImagePick}>
              <Ionicons name="image-outline" size={24} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={sendMessage} disabled={sendingMessage}>
              <Ionicons name="send-outline" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          {image && (
            <Image source={{ uri: image }} style={styles.previewImage} />
          )}
        </>
      ) : (
        <FlatList
          data={farmers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.farmerCard} onPress={() => handleFarmerSelect(item)}>
              <Text>{item.name}</Text>
              {item.unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.farmerListContainer}
        />
      )}

      <Modal visible={modalVisible} transparent>
        <View style={styles.modalContainer}>
          <Image source={{ uri: selectedImage }} style={styles.fullScreenImage} />
          <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  chatContainer: { flex: 1 },
  header: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  backButton: { padding: 10, backgroundColor: '#f0f0f0', alignSelf: 'flex-start', borderRadius: 5 },
  backButtonText: { color: '#000', fontSize: 16 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 10 },
  input: { flex: 1, backgroundColor: '#f0f0f0', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, marginRight: 5 },
  iconButton: { padding: 5 },
  previewImage: { width: 100, height: 100, margin: 10 },
  messagesList: { flex: 1 },
  messagesContainer: { paddingBottom: 50 },
  messageCard: { marginVertical: 5, padding: 10, borderRadius: 10 },
  userMessage: { backgroundColor: '#e0ffe0', alignSelf: 'flex-end' },
  otherMessage: { backgroundColor: '#e0f0ff', alignSelf: 'flex-start' },
  messageText: { fontSize: 16 },
  imageMessage: { width: 200, height: 200, marginTop: 5 },
  timestamp: { fontSize: 12, color: '#888', textAlign: 'right' },
  farmerCard: { padding: 10, backgroundColor: '#f0f0f0', marginVertical: 5, borderRadius: 10 },
  farmerListContainer: { paddingVertical: 10 },
  badge: { backgroundColor: 'red', borderRadius: 12, paddingHorizontal: 6, paddingVertical: 2, position: 'absolute', right: 10, top: 10 },
  badgeText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.8)' },
  fullScreenImage: { width: '100%', height: '80%' },
  closeButton: { position: 'absolute', top: 30, right: 20, padding: 10, backgroundColor: '#f0f0f0', borderRadius: 10 },
  closeButtonText: { color: '#000', fontSize: 16 },
});

export default ExpertChatScreen;
