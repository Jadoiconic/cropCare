import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { db, auth, storage } from "@/services/config";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function UploadScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [fileType, setFileType] = useState("");
  const [files, setFiles] = useState([]);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "pdfFiles"));
      const filesArray = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFiles(filesArray);
    } catch (error) {
      console.error("Error fetching files: ", error);
    }
  };

  const uploadPdf = async () => {
    // Validation for title and description
    const titleValidation = /^(?=.*[a-zA-Z])[a-zA-Z0-9\s]+$/; // must contain at least one letter, allows alphanumeric and spaces
    const descriptionValidation = /^(?=.*[a-zA-Z])[a-zA-Z0-9\s]+$/; // must contain at least one letter, allows alphanumeric and spaces

    if (!title.trim() || !description.trim()) {
      Alert.alert("Input Error", "Please enter both title and description.");
      return;
    }

    if (!titleValidation.test(title)) {
      Alert.alert("Input Error", "Title must contain at least one letter and can include letters, numbers, and spaces.");
      return;
    }

    if (!descriptionValidation.test(description)) {
      Alert.alert("Input Error", "Description must contain at least one letter and can include letters, numbers, and spaces.");
      return;
    }

    // Proceed with file selection only after validation
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "application/pdf" });

      if (result.type === "cancel") {
        Alert.alert("Upload Cancelled", "No file was selected.");
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const { uri, name, size, mime } = result.assets[0];
        setFileName(name);
        setFileSize(size);
        setFileType(mime);

        const pdfRef = ref(storage, `pdfFiles/${name}`);

        const existingFilesQuery = query(
          collection(db, "pdfFiles"),
          where("name", "==", name)
        );
        const existingFilesSnapshot = await getDocs(existingFilesQuery);

        if (!existingFilesSnapshot.empty) {
          const confirmReplace = await new Promise((resolve) => {
            Alert.alert(
              "File Exists",
              "A file with this name already exists. Do you want to replace it?",
              [
                { text: "Cancel", onPress: () => resolve(false), style: "cancel" },
                { text: "Replace", onPress: () => resolve(true) },
              ]
            );
          });

          if (!confirmReplace) return;
        }

        setLoading(true);

        const response = await fetch(uri);
        const blob = await response.blob();
        await uploadBytes(pdfRef, blob);

        const downloadURL = await getDownloadURL(pdfRef);

        const pdfDoc = {
          title,
          description,
          name,
          url: downloadURL,
          uploaderId: auth.currentUser?.uid,
          createdAt: new Date().toISOString(),
        };

        await addDoc(collection(db, "pdfFiles"), pdfDoc);
        setUploadSuccess(true);
        Alert.alert("Success", "PDF uploaded successfully!");

        fetchFiles();
        resetForm();
      } else {
        Alert.alert("Upload Error", "No file selected or upload failed.");
      }
    } catch (error) {
      console.error("Error uploading file: ", error);
      Alert.alert("Upload Error", "Failed to upload PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const deleteFile = async (fileId: string) => {
    try {
      await deleteDoc(doc(db, "pdfFiles", fileId));
      Alert.alert("Success", "File deleted successfully!");
      fetchFiles();
    } catch (error) {
      console.error("Error deleting file: ", error);
      Alert.alert("Delete Error", "Failed to delete the file. Please try again.");
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setFileName("");
    setFileSize("");
    setFileType("");
  };

  const renderFileItem = ({ item }: { item: any }) => (
    <View style={styles.fileCard}>
      <Text style={styles.fileTitle}>{item.title}</Text>
      <Text style={styles.fileInfo}>Size: {item.size} bytes</Text>
      <Text style={styles.fileInfo}>Type: {item.type}</Text>
      <TouchableOpacity style={styles.deleteButton} onPress={() => deleteFile(item.id)}>
        <Text style={styles.buttonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Shyiraho Ibitabo Byubuhinzi</Text>

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

      {fileName && (
        <View>
          <Text style={styles.filePreview}>Selected File: {fileName}</Text>
          <Text style={styles.fileInfo}>Size: {fileSize} bytes</Text>
          <Text style={styles.fileInfo}>Type: {fileType}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.uploadButton} onPress={uploadPdf}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Select and Upload PDF</Text>
        )}
      </TouchableOpacity>

      {uploadSuccess && <Text style={styles.successMessage}>PDF uploaded successfully!</Text>}

      <Text style={styles.existingFilesTitle}>Ibitabo Bisanzwe Bihari</Text>
      <FlatList
        data={files}
        renderItem={renderFileItem}
        keyExtractor={(item) => item.id}
        style={styles.filesList}
        numColumns={1}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
    fontWeight: "bold",
    color: "#333",
  },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#007bff",
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  uploadButton: {
    width: "100%",
    padding: 15,
    backgroundColor: "#007bff",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  successMessage: {
    marginTop: 15,
    color: "green",
    fontSize: 16,
  },
  filePreview: {
    marginBottom: 10,
    color: "#555",
  },
  fileInfo: {
    marginBottom: 5,
    color: "#888",
  },
  existingFilesTitle: {
    fontSize: 20,
    marginTop: 20,
    fontWeight: "bold",
    color: "#333",
  },
  filesList: {
    width: "100%",
    marginTop: 10,
  },
  fileCard: {
    margin: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  fileTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  deleteButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#dc3545",
    borderRadius: 8,
    alignItems: "center",
  },
});
