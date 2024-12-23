import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    TextInput,
    TouchableOpacity,
    Button,
    Image,
    Modal,
    Alert
} from 'react-native';
import { collection, addDoc, getDocs, getDoc, serverTimestamp, doc } from 'firebase/firestore';
import { auth, db } from '@/services/config';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

// Fetch posts from Firestore
const getPosts = async () => {
    const postsSnapshot = await getDocs(collection(db, 'Posts'));
    let posts = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return posts.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
};

// Fetch replies for a specific post
const getReplies = async (postId) => {
    const repliesSnapshot = await getDocs(collection(db, `Posts/${postId}/replies`));
    return repliesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Get the username for a specific user ID
const getUserName = async (userId) => {
    const userDoc = await getDoc(doc(db, 'farmers', userId));
    return userDoc.exists() ? userDoc.data().name : 'Unknown';
};

// Create a new post
const createPost = async (content, imageUri) => {
    const userId = auth.currentUser?.uid;
    const userName = await getUserName(userId);
    await addDoc(collection(db, 'Posts'), {
        content,
        userId,
        userName,
        imageUri,
        createdAt: serverTimestamp(),
    });
};

// Create a reply to a post
const createReply = async (postId, replyText) => {
    const userId = auth.currentUser?.uid;
    const userName = await getUserName(userId);
    await addDoc(collection(db, `Posts/${postId}/replies`), {
        replyText,
        userId,
        userName,
        createdAt: serverTimestamp(),
    });
};

const Forum = () => {
    const [posts, setPosts] = useState([]);
    const [newPostContent, setNewPostContent] = useState('');
    const [imageUri, setImageUri] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const currentUser = auth.currentUser; // Get the current user

    // Request camera roll permission on mount
    useEffect(() => {
        const requestCameraRollPermission = async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Uruhushya Rurakenewe', 'Kugirango mubashe kubona amafoto murasabwa kwemeza uruhushya!');
            }
        };

        requestCameraRollPermission();
    }, []);

    // Fetch posts on component mount
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const fetchedPosts = await getPosts();
                setPosts(fetchedPosts);
            } catch (error) {
                console.error("Error fetching posts:", error);
            }
        };

        if (currentUser) {
            fetchPosts();
        }
    }, [currentUser]);

    const handleCreatePost = async () => {
        if (newPostContent.trim()) {
            try {
                await createPost(newPostContent, imageUri);
                setNewPostContent('');
                setImageUri(null);
                const fetchedPosts = await getPosts();
                setPosts(fetchedPosts);
            } catch (error) {
                console.error("Error creating post:", error);
            }
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync();
        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    const openImage = (uri) => {
        setSelectedImage(uri);
        setModalVisible(true);
    };

    const closeImageModal = () => {
        setModalVisible(false);
        setSelectedImage(null);
    };

    // Conditional rendering for authenticated and unauthenticated users
    return (
        <View style={styles.container}>
            {currentUser ? (
                <>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Andika igitekerezo cg icyo ushaka gutangaza..."
                            value={newPostContent}
                            onChangeText={setNewPostContent}
                        />
                        <Button title="Tangaza" onPress={handleCreatePost} />
                    </View>
                    <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                        <Text style={styles.imagePickerText}>Hitamo ifoto</Text>
                    </TouchableOpacity>
                    {imageUri && <Image source={{ uri: imageUri }} style={styles.imagePreview} />}
                    
                    <FlatList
                        data={posts}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => <Post post={item} onImagePress={openImage} />}
                        extraData={posts}
                    />

                    <TouchableOpacity style={styles.chatButton} onPress={() => router.push('/home/Chats')}>
                        <Text style={styles.chatButtonText}>Twandikire Abajyanama</Text>
                    </TouchableOpacity>

                    <Modal visible={modalVisible} transparent={true}>
                        <View style={styles.modalContainer}>
                            <Image source={{ uri: selectedImage }} style={styles.fullScreenImage} />
                            <TouchableOpacity onPress={closeImageModal} style={styles.closeButton}>
                                <Text style={styles.closeButtonText}>Funga</Text>
                            </TouchableOpacity>
                        </View>
                    </Modal>
                </>
            ) : (
                <View style={styles.unauthContainer}>
                    <Text style={styles.unauthText}>Kugirango Mukoreshe Uruganiriro rusange Murasabwa Kwinjira.</Text>
                    <TouchableOpacity
                        style={styles.redirectButton}
                        onPress={() => router.push('/auth')}
                    >
                        <Text style={styles.redirectButtonText}>Jya Aho Binjirira</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const Post = ({ post, onImagePress }) => {
    const [repliesVisible, setRepliesVisible] = useState(false);
    const [replies, setReplies] = useState([]);
    const [newReplyText, setNewReplyText] = useState('');
    const [replyInputVisible, setReplyInputVisible] = useState(false);

    useEffect(() => {
        const fetchReplies = async () => {
            if (repliesVisible) {
                const fetchedReplies = await getReplies(post.id);
                setReplies(fetchedReplies);
            }
        };

        fetchReplies();
    }, [repliesVisible, post.id]);

    const toggleReplies = () => {
        setRepliesVisible(!repliesVisible);
    };

    const handleCreateReply = async () => {
        if (newReplyText.trim()) {
            try {
                await createReply(post.id, newReplyText);
                setNewReplyText('');
                setRepliesVisible(true);
            } catch (error) {
                console.error("Error creating reply:", error);
            }
        }
    };

    return (
        <View style={styles.post}>
            <Text style={styles.postText}>{post.content}</Text>
            <Text style={styles.postOwnerText}>Yanditswe na: {post.userName}</Text>
            {post.imageUri && (
                <TouchableOpacity onPress={() => onImagePress(post.imageUri)}>
                    <Image source={{ uri: post.imageUri }} style={styles.postImage} />
                </TouchableOpacity>
            )}

            {!replyInputVisible ? (
                <TouchableOpacity onPress={() => setReplyInputVisible(true)}>
                    <Text style={styles.replyText}>Subiza</Text>
                </TouchableOpacity>
            ) : (
                <View style={styles.replyInputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Andika igisubizo cg icyo ubitekerezaho..."
                        value={newReplyText}
                        onChangeText={setNewReplyText}
                    />
                    <TouchableOpacity onPress={handleCreateReply}>
                        <Text style={styles.replyButton}>Subiza</Text>
                    </TouchableOpacity>
                </View>
            )}

            <TouchableOpacity onPress={toggleReplies}>
                <Text style={styles.replyText}>
                    {replies.length} {replies.length === 1 ? 'Igisubizo' : 'Ibitekerezo'}
                </Text>
            </TouchableOpacity>

            {repliesVisible && (
                <View style={styles.repliesContainer}>
                    {replies.map((reply) => (
                        <Text key={reply.id} style={styles.replyText}>
                            - {reply.replyText} (na {reply.userName})
                        </Text>
                    ))}
                </View>
            )}
        </View>
    );
};

export default Forum;

// Updated Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginRight: 10,
    },
    imagePicker: {
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginVertical: 10,
    },
    imagePickerText: {
        color: '#fff',
    },
    imagePreview: {
        width: 100,
        height: 100,
        borderRadius: 10,
        marginVertical: 10,
    },
    post: {
        marginBottom: 15,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
    },
    postText: {
        fontSize: 16,
        marginBottom: 5,
    },
    postOwnerText: {
        fontSize: 12,
        color: '#555',
    },
    postImage: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        marginVertical: 10,
    },
    replyText: {
        color: '#007bff', // Bootstrap blue color
        marginVertical: 5,
    },
    replyInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 5,
    },
    replyButton: {
        color: '#28a745', // Green color
    },
    repliesContainer: {
        paddingLeft: 10,
    },
    chatButton: {
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
    },
    chatButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    fullScreenImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 18,
    },
    unauthContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    unauthText: {
        fontSize: 18,
        marginBottom: 20,
    },
    redirectButton: {
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 5,
    },
    redirectButtonText: {
        color: '#fff',
        fontSize: 16,
    },
});
