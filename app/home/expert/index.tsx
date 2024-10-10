import React, { useState } from "react";
import { StyleSheet, Text, View, Button, Alert, TextInput } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { db, auth, storage } from "@/services/config";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function UploadScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  
  const uploadPdf = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "application/pdf" });
      
      if (result.type === 'cancel') {
        Alert.alert('Upload Cancelled', 'No file was selected.');
        return;
      }
      
      if (result.assets && result.assets.length > 0) {
        const { uri, name } = result.assets[0];
        const pdfRef = ref(storage, `pdfFiles/${name}`);
        
        // Fetch the file and upload to Firebase Storage
        const response = await fetch(uri);
        const blob = await response.blob();
        await uploadBytes(pdfRef, blob);
        
        // Get the download URL
        const downloadURL = await getDownloadURL(pdfRef);
        
        // Create document metadata
        const pdfDoc = {
          title,          // Include title
          description,    // Include description
          name,
          url: downloadURL,
          uploaderId: auth.currentUser?.uid,
          createdAt: new Date().toISOString(),
        };
        
        // Save document to Firestore
        await addDoc(collection(db, 'pdfFiles'), pdfDoc);
        Alert.alert('Success', 'PDF uploaded successfully!');
        
        // Clear the input fields after successful upload
        setTitle("");
        setDescription("");
      } else {
        Alert.alert('Upload Error', 'No file selected or upload failed.');
      }
    } catch (error) {
      console.error("Error uploading file: ", error);
      Alert.alert('Upload Error', 'Failed to upload PDF. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload PDF</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Enter Title"
        value={title}
        onChangeText={setTitle}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Enter Description"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
      />

      <Button title="Select and Upload PDF" onPress={uploadPdf} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 15,
  },
});
