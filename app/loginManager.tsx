import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { auth } from "@/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";

const LoginManager = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // State for loader
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in both email and password.", [{ text: "OK" }]);
      return;
    }

    setIsLoading(true); // Start loading

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      router.push("/managerHome");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image source={require("@/assets/images/maneger.jpg")} style={styles.image} />
        <TextInput
          placeholder="Enter Your Email"
          style={styles.textinput}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Enter Your Password"
            secureTextEntry={!passwordVisible}
            style={styles.passwordInput}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)} style={styles.eyeButton}>
            <Text style={styles.eyeIcon}>{passwordVisible ? "👁️" : "👁️‍🗨️"}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={isLoading} // Disable button while loading
        >
          {isLoading ? (
            <ActivityIndicator color="#FFF" /> // Show loader
          ) : (
            <Text style={styles.loginButtonText}>Login</Text> // Show login text
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginManager;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  content: {
    width: "80%",
    alignItems: "center",
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: 30,
    borderRadius: 75,
  },
  textinput: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 15,
    width: "100%",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#DDD",
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    backgroundColor: "#FFF",
    paddingHorizontal: 15,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
  },
  eyeButton: {
    padding: 10,
  },
  eyeIcon: {
    fontSize: 18,
  },
  loginButton: {
    backgroundColor: "#1E90FF",
    borderRadius: 10,
    paddingVertical: 15,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  loginButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  registerButton: {
    marginTop: 10,
  },
  registerButtonText: {
    color: "#1E90FF",
    fontSize: 16,
    fontWeight: "bold",
  },
});