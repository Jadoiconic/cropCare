import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity, Button } from 'react-native';
import { collection, addDoc, getDocs, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/services/config';

// Helper function to get posts
const getPosts = async () => {
    const postsSnapshot = await getDocs(collection(db, 'Posts'));
    let posts = [];
    postsSnapshot.forEach((doc) => {
        posts.push({ id: doc.id, ...doc.data() });
    });
    return posts;
};

// Helper function to get replies for a post
const getReplies = async (postId) => {
    const repliesSnapshot = await getDocs(collection(db, `Posts/${postId}/replies`));
    let replies = [];
    repliesSnapshot.forEach((doc) => {
        replies.push({ id: doc.id, ...doc.data() });
    });
    return replies;
};

// Helper function to get the user's name
const getUserName = async (userId) => {
    const userDoc = await getDoc(doc(db, 'users', userId)); // Assuming 'users' is the collection name
    if (userDoc.exists()) {
        return userDoc.data().name; // Fetch the user's name from the Firestore document
    }
    return 'Unknown'; // Default name if not found
};

// Helper function to create a new post
const createPost = async (content) => {
    const userId = auth.currentUser?.uid;  
    const userName = await getUserName(userId);  // Fetching user name
    await addDoc(collection(db, 'Posts'), {
        content,
        userId,
        userName, 
        createdAt: serverTimestamp(),
    });
};

// Helper function to create a new reply
const createReply = async (postId, replyText) => {
    const userId = auth.currentUser?.uid;  
    const userName = await getUserName(userId);  // Fetching user name
    await addDoc(collection(db, `Posts/${postId}/replies`), {
        replyText,
        userId,
        userName,
        createdAt: serverTimestamp(),
    });
};

// Forum Component
const Forum = () => {
    const [posts, setPosts] = useState([]);
    const [newPostContent, setNewPostContent] = useState('');

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const fetchedPosts = await getPosts();
                setPosts(fetchedPosts);
            } catch (error) {
                console.error("Error fetching posts:", error);
            }
        };
        fetchPosts();
    }, []);

    const handleCreatePost = async () => {
        if (newPostContent.trim()) {
            try {
                await createPost(newPostContent);
                setNewPostContent('');  
                const fetchedPosts = await getPosts();  
                setPosts(fetchedPosts);
            } catch (error) {
                console.error("Error creating post:", error);
            }
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Write a post..."
                    value={newPostContent}
                    onChangeText={setNewPostContent}
                />
                <Button title="Post" onPress={handleCreatePost} />
            </View>

            <FlatList
                data={posts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <Post post={item} />}
            />

            <TouchableOpacity style={styles.chatButton}>
                <Text style={styles.chatButtonText}>Chat with Experts</Text>
            </TouchableOpacity>
        </View>
    );
};

// Post Component
const Post = ({ post }) => {
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
                setRepliesVisible(true); // Automatically show replies after creating one
            } catch (error) {
                console.error("Error creating reply:", error);
            }
        }
    };

    return (
        <View style={styles.post}>
            <Text style={styles.postText}>{post.content}</Text>
            <Text style={styles.postOwnerText}>Posted by: {post.userName}</Text>

            {!replyInputVisible && (
                <TouchableOpacity onPress={() => setReplyInputVisible(true)}>
                    <Text style={styles.replyText}>Reply</Text>
                </TouchableOpacity>
            )}

            {replyInputVisible && (
                <View style={styles.replyInputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Write a reply..."
                        value={newReplyText}
                        onChangeText={setNewReplyText}
                    />
                    <TouchableOpacity onPress={handleCreateReply}>
                        <Text style={styles.replyButton}>Reply</Text>
                    </TouchableOpacity>
                </View>
            )}

            <TouchableOpacity onPress={toggleReplies}>
                <Text style={styles.replyText}>
                    {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
                </Text>
            </TouchableOpacity>

            {repliesVisible && (
                <View style={styles.repliesContainer}>
                    {replies.map((reply) => (
                        <Text key={reply.id} style={styles.replyText}>
                            - {reply.replyText} (by {reply.userName}) {/* Displaying userName instead of email */}
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
        padding: 20,
        backgroundColor: '#f0f4f8', // Light background for a pleasant look
        flex: 1,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        backgroundColor: '#ffffff', // White background for input area
        borderRadius: 10,
        padding: 10,
        shadowColor: '#000', // Adding shadow for elevation
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
        elevation: 5, // For Android shadow
    },
    input: {
        height: 40,
        width: '75%', // Adjusted width for better input space
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 10, // Rounded input corners
        paddingHorizontal: 10,
        backgroundColor: '#fafafa', // Light grey for input background
    },
    post: {
        backgroundColor: '#ffffff', // White background for posts
        padding: 15,
        marginVertical: 10,
        borderRadius: 10,
        shadowColor: '#000', // Adding shadow for elevation
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 5, // For Android shadow
    },
    postText: {
        fontSize: 16,
        color: '#333', // Dark text for better readability
    },
    postOwnerText: {
        fontSize: 12,
        color: '#888', // Lighter text color for owner name
        marginBottom: 10,
    },
    replyText: {
        color: '#007BFF',
        marginVertical: 5,
        fontWeight: 'bold', // Bold text for replies
    },
    repliesContainer: {
        paddingLeft: 20,
        marginTop: 5,
    },
    chatButton: {
        backgroundColor: '#007BFF',
        padding: 12,
        borderRadius: 10,
        marginTop: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 5, // For Android shadow
    },
    chatButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold', // Bold text for the chat button
    },
    replyInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
    },
    replyButton: {
        color: '#007BFF',
        marginLeft: 10,
        fontWeight: 'bold', // Bold text for reply button
    },
});
