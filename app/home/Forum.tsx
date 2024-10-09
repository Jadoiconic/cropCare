import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, Button, TouchableOpacity } from 'react-native';
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

// Helper function to create a new post
const createPost = async (content) => {
    const userId = auth.currentUser?.uid;  // Get the current user's ID
    const userName = auth.currentUser?.email;  // Get the current user's ID
    await addDoc(collection(db, 'Posts'), {
        content,
        userId,
        userName, // Store the userId
        createdAt: serverTimestamp(),
    });
};

// Helper function to create a new reply
const createReply = async (postId, replyText) => {
    await addDoc(collection(db, `Posts/${postId}/replies`), {
        replyText,
        createdAt: serverTimestamp(),
    });
};

// Helper function to get the post owner's name
const getPostOwnerName = async (userId) => {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
        return userDoc.data().name;  // Assuming the user's name is stored in the "name" field
    }
    return 'Unknown';  // Fallback in case the user doesn't exist
};

// Forum Component
const Forum = () => {
    const [posts, setPosts] = useState([]);
    const [newPostContent, setNewPostContent] = useState('');

    useEffect(() => {
        // Fetch posts from Firestore on component mount
        const fetchPosts = async () => {
            const fetchedPosts = await getPosts();
            setPosts(fetchedPosts);
        };
        fetchPosts();
    }, []);

    // Handle creating a new post
    const handleCreatePost = async () => {
        if (newPostContent) {
            await createPost(newPostContent);
            setNewPostContent('');  // Clear input after submission
            const fetchedPosts = await getPosts();  // Refresh posts
            setPosts(fetchedPosts);
        }
    };

    return (
        <View style={styles.container}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
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
        </View>
    );
};

// Post Component
const Post = ({ post }) => {
    const [repliesVisible, setRepliesVisible] = useState(false);
    const [replies, setReplies] = useState([]);
    const [newReplyText, setNewReplyText] = useState('');
    const [postOwnerName, setPostOwnerName] = useState('');
    const [replyInputVisible, setReplyInputVisible] = useState(false); // Track if reply input is visible

    useEffect(() => {
        const fetchPostOwner = async () => {
            const currentUserId = auth.currentUser?.uid;
            if (post.userId === currentUserId) {
                setPostOwnerName('you');
            } else {
                const ownerName = await getPostOwnerName(post.userId);
                setPostOwnerName(ownerName);
            }
        };

        fetchPostOwner();
    }, [post.userId]);

    const toggleReplies = async () => {
        if (!repliesVisible) {
            const fetchedReplies = await getReplies(post.id);
            setReplies(fetchedReplies);
        }
        setRepliesVisible(!repliesVisible);
    };

    const handleCreateReply = async () => {
        if (newReplyText) {
            await createReply(post.id, newReplyText);
            setNewReplyText('');
            const fetchedReplies = await getReplies(post.id);
            setReplies(fetchedReplies);
        }
    };

    const toggleReplyInput = () => {
        setReplyInputVisible(!replyInputVisible);
    };

    return (
        <View style={styles.post}>
            <Text style={styles.postText}>{post.content}</Text>
            <Text>Posted by: {postOwnerName}</Text>

            {!replyInputVisible && (
                <TouchableOpacity onPress={toggleReplyInput}>
                    <Text style={styles.replyText}>Reply</Text>
                </TouchableOpacity>
            )}

            {replyInputVisible && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                    <TextInput
                        style={styles.input}
                        placeholder="Write a reply..."
                        value={newReplyText}
                        onChangeText={setNewReplyText}
                    />
                    <TouchableOpacity onPress={handleCreateReply}>
                        <Text>Reply</Text>
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
                        <Text key={reply.id} style={styles.replyText}>- {reply.replyText}</Text>
                    ))}
                </View>
            )}
        </View>
    );
};

export default Forum;

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#fff',
        flex: 1,
    },
    input: {
        height: 40,
        width: '80%',
        borderColor: '#ccc',
        borderWidth: 1,
        paddingHorizontal: 10,
        marginBottom: 10,
        borderRadius: 5,
    },
    post: {
        padding: 10,
        marginBottom: 20,
        backgroundColor: '#f8f8f8',
        borderRadius: 5,
    },
    postText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    repliesContainer: {
        paddingLeft: 20,
    },
    replyText: {
        fontSize: 14,
        color: '#666',
    },
});
