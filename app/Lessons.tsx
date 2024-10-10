import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert } from "react-native";
import { db } from "@/services/config";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import * as FileSystem from 'expo-file-system';
import * as Linking from 'expo-linking';

interface PdfFile {
  id: string;
  name: string;
  url: string;
  uploaderId: string;
  createdAt: string;
  title: string;        // Added title
  description: string;  // Added description
}

export default function FilesScreen() {
  const [pdfFiles, setPdfFiles] = useState<PdfFile[]>([]);

  useEffect(() => {
    fetchPdfFiles();
  }, []);

  const fetchPdfFiles = async () => {
    try {
      const q = query(collection(db, 'pdfFiles'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const files: PdfFile[] = [];
      querySnapshot.forEach((doc) => {
        files.push({ id: doc.id, ...doc.data() } as PdfFile);
      });
      setPdfFiles(files);
    } catch (error) {
      console.error("Error fetching PDF files:", error);
    }
  };

  const openPdf = async (url: string, filename: string) => {
    try {
      const localUri = `${FileSystem.documentDirectory}${filename}`;
      const downloadedFile = await FileSystem.downloadAsync(url, localUri);
      
      if (downloadedFile.status === 200) {
        await Linking.openURL(downloadedFile.uri);
      } else {
        Alert.alert('Error', 'Failed to download the file');
      }
    } catch (error) {
      console.error("Error opening PDF:", error);
      Alert.alert('Error', 'Could not open the PDF file');
    }
  };

  const renderPdfItem = ({ item }: { item: PdfFile }) => (
    <TouchableOpacity 
      style={styles.pdfItem}
      onPress={() => openPdf(item.url, item.name)}
    >
      <Text style={styles.pdfTitle}>{item.title}</Text>
      <Text style={styles.pdfDescription}>{item.description}</Text>
      <Text style={styles.uploadDate}>
        Uploaded: {new Date(item.createdAt).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Files</Text>
      <FlatList
        data={pdfFiles}
        renderItem={renderPdfItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8', // Light background for better contrast
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: '#333', // Dark color for better readability
  },
  list: {
    flex: 1,
  },
  pdfItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: '#fff', // White background for PDF items
    borderRadius: 5,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2, // Elevation for Android
  },
  pdfTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007BFF', // Blue color for titles
  },
  pdfDescription: {
    fontSize: 14,
    color: '#555', // Grey color for descriptions
    marginVertical: 5,
  },
  uploadDate: {
    fontSize: 12,
    color: '#999', // Lighter color for upload date
  },
});
