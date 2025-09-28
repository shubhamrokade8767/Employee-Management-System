import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { auth, db } from "@/firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const AddManager = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields.", [{ text: "OK" }]);
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.", [{ text: "OK" }]);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "employees", user.uid), {
        email: email,
        role: "manager",
        createdAt: new Date().toISOString(),
      });

      Alert.alert("Success", "Account created successfully!");
      router.push("/managerHome");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const buttonScale = useRef(new Animated.Value(1)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  const handleButtonPressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handleButtonPressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    Animated.timing(contentOpacity, {
      toValue: 1,
      duration: 500,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <LinearGradient colors={["white", "black"]} style={styles.container}>
      <Animated.View style={[styles.content, { opacity: contentOpacity }]}> 
        <Text style={styles.heading}>Add Manager</Text>
        <TextInput
          placeholder="Enter Your Email"
          style={styles.textinput}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          placeholder="Enter Your Password"
          secureTextEntry
          style={styles.textinput}
          value={password}
          onChangeText={setPassword}
        />
        <TextInput
          placeholder="Confirm Your Password"
          secureTextEntry
          style={styles.textinput}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity
          style={styles.registerButton}
          onPressIn={handleButtonPressIn}
          onPressOut={handleButtonPressOut}
          onPress={handleRegister}
          activeOpacity={1}
        >
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <Text style={styles.registerButtonText}>Register</Text>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
};

export default AddManager;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    width: "85%",
    alignItems: "center",
    padding: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  textinput: {
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
    width: "100%",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#DDD",
    fontSize: 16,
    color: "#333",
  },
  registerButton: {
    backgroundColor: "#007BFF",
    borderRadius: 12,
    paddingVertical: 16,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  registerButtonText: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "bold",
  },
});
