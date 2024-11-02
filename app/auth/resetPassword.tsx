import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { auth, db } from "@/services/config"; // Ensure this path is correct based on your project structure
import { sendPasswordResetEmail } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function ResetPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert("Ikosa ry'Icyinjiza", "Injiza aderesi y'imeri yawe.");
      return;
    }

    setLoading(true);

    try {
      // Check if the email exists in Firestore
      const emailQuery = query(
        collection(db, "farmers"),
        where("email", "==", email.trim())
      );
      const querySnapshot = await getDocs(emailQuery);

      if (querySnapshot.empty) {
        Alert.alert(
          "Ikosa",
          "Imeli Winjije Ntabwo Igaragara. Reba Ko Waryanditse Neza Wongere Ugerageze."
        );
        return;
      }

      // Send the reset password email if the email exists
      await sendPasswordResetEmail(auth, email.trim());
      Alert.alert(
        "Ubwoherejwe",
        "Email yo gushyiraho ijambo banga rishya yoherejwe! Reba imeri yawe."
      );
      setEmail(""); // Clear the input field
    } catch (error) {
      console.error("Ikibazo mu kohereza email yo gushyiraho ijambo banga rishya: ", error);
      Alert.alert("Ikosa", error.message || "Kohereza email yo gushyiraho ijambo banga rishya byanze. Ongera ugerageze.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require("@/assets/logo.jpg")} style={styles.logo} />
      <Text style={styles.title}>Simbuza Ijambo Banga</Text>

      <TextInput
        style={styles.input}
        placeholder="Injiza aderesi y'imeri yawe"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TouchableOpacity
        style={[styles.resetButton, loading && styles.buttonDisabled]}
        onPress={handleResetPassword}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Ohereza Email yo Guhindura</Text>
        )}
      </TouchableOpacity>
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
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: "bold",
    color: "#4CAF50", // Green as primary color
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: 15,
    borderWidth: 1,
    borderColor: "#4CAF50", // Green as primary color
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  resetButton: {
    width: "100%",
    padding: 15,
    backgroundColor: "#4CAF50", // Green as primary color
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    backgroundColor: "#A5D6A7", // Lighter green when disabled
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
