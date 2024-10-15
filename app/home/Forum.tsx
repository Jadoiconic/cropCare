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
    const currentUser = auth.currentUser?.email;

    useEffect(() => {
        if (!currentUser) {
            router.push("/auth");
            return;
        }

        const fetchPosts = async () => {
            try {
                const fetchedPosts = await getPosts();
                setPosts(fetchedPosts);
            } catch (error) {
                console.error("Error fetching posts:", error);
            }
        };

        fetchPosts();
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
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            alert("Sorry, we need camera roll permissions to make this work!");
            return;
        }

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
        setSelectedImage(null); // Clear the selected image
    };

    return (
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Andika igitekerezo..."
                    value={newPostContent}
                    onChangeText={setNewPostContent}
                />
                <Button title="Posta" onPress={handleCreatePost} />
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

            <TouchableOpacity style={styles.chatButton} onPress={() => router.push('/home/hats')}>
                <Text style={styles.chatButtonText}>Twandikire Abajyanama</Text>
            </TouchableOpacity>

            <Modal visible={modalVisible} transparent={true}>
                <View style={styles.modalContainer}>
                    <Image source={{ uri: selectedImage }} style={styles.fullScreenImage} />
                    <TouchableOpacity onPress={closeImageModal} style={styles.closeButton}>
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
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
                        placeholder="Andika igisubizo..."
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
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 10,
    },
    imagePickerText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    imagePreview: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        marginBottom: 10,
    },
    chatButton: {
        backgroundColor: '#28a745',
        padding: 10,
        borderRadius: 10,
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
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
        backgroundColor: '#fff',
        borderRadius: 5,
        padding: 10,
    },
    closeButtonText: {
        color: '#000',
        fontWeight: 'bold',
    },
    post: {
        backgroundColor: '#f8f9fa',
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
    },
    postText: {
        fontSize: 16,
    },
    postOwnerText: {
        fontSize: 12,
        color: '#666',
    },
    postImage: {
        width: '100%',
        height: 150,
        borderRadius: 10,
        marginTop: 10,
    },
    replyText: {
        color: '#007bff',
        marginTop: 10,
    },
    replyInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    repliesContainer: {
        marginTop: 5,
        marginLeft: 20,
    },
});
