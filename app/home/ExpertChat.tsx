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
    requestCameraRollPermission(); // Request permission on mount
  }, []);

  const requestCameraRollPermission = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Uruhushya Rurakenewe', 'Kugirango Mubashe Kubona amafoto Mwemeze Uruhushya!');
    }
  };

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
      Alert.alert('Ntabwo Winjyiye', 'kugirango ukoreshe Uruganiriro Urabanza winjire.');
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
      Alert.alert('Murikohereza Ubusa Mubutumwa', 'Mgire Ubutumwa Mwandika.');
      return;
    }

    if (!chatId || !user) {
      Alert.alert('Ntawo kuganira nawe mwahisemo', 'Hitamo Uwo muganira.');
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
      Alert.alert('Byanze', 'Mwandike Ijambo Rijyana Nifoto.');
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
          reject('Kwinjiza Ifoto Byanze. Mwongere Mugerageze.');
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
            <Text style={styles.backButtonText}>Subira Inyuma</Text>
          </TouchableOpacity>
          <Text style={styles.header}>Ganira Na {selectedFarmer?.name}</Text>
          {renderMessagesList()}
          {loadingMessages && <ActivityIndicator size="large" color="#0000ff" />}
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Injiza Ubutumwa..."
              value={message}
              onChangeText={setMessage}
              style={styles.input}
              multiline={true}
              placeholderTextColor="#888" // Placeholder color for better readability
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

      <Modal visible={modalVisible} transparent={true}>
        <View style={styles.modalContainer}>
          <Image source={{ uri: selectedImage }} style={styles.fullScreenImage} />
          <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
            <Text style={styles.closeButtonText}>Funga</Text>
          </TouchableOpacity>
        </View>
      </Modal>
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
  farmerListContainer: {
    paddingBottom: 16,
  },
  farmerCard: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backButton: {
    marginBottom: 16,
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  messagesList: {
    flex: 1,
    marginBottom: 16,
  },
  messagesContainer: {
    paddingBottom: 16,
  },
  messageCard: {
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#e0f7fa',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f1f1',
  },
  messageText: {
    fontSize: 16,
  },
  imageMessage: {
    width: 100,
    height: 100,
    borderRadius: 5,
    marginTop: 5,
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    backgroundColor: '#f9f9f9', // Improved readability
  },
  iconButton: {
    marginLeft: 10,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 5,
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
});

export default ExpertChatScreen;
