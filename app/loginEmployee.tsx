import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { db } from "@/firebaseConfig"; // Import Firestore
import { doc, getDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage

const loginEmployee = () => {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // State for loader
  const router = useRouter();

  const handleLogin = async () => {
    if (!employeeId || !password) {
      Alert.alert("Error", "Please fill in both employee ID and password.", [{ text: "OK" }]);
      return;
    }

    setIsLoading(true); // Start loading

    try {
      // Fetch employee data from Firestore using employee ID
      const employeeRef = doc(db, "employees", employeeId);
      const employeeSnap = await getDoc(employeeRef);

      if (!employeeSnap.exists()) {
        Alert.alert("Error", "Employee ID not found.", [{ text: "OK" }]);
        return;
      }

      const employeeData = employeeSnap.data();

      if (password !== employeeData.password) {
        Alert.alert("Error", "Incorrect password.", [{ text: "OK" }]);
        return;
      }

      // ✅ Store Employee ID in AsyncStorage for later access
      await AsyncStorage.setItem("employeeId", employeeId);
      router.push("/employeeHome"); // Navigate to Employee Home
    } catch (error) {
      console.error("Error during login: ", error);
      Alert.alert("Error", "An error occurred during login. Please try again.", [{ text: "OK" }]);
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image source={require("@/assets/images/maneger.jpg")} style={styles.image} />
        <TextInput
          placeholder="Enter Your Employee ID"
          style={styles.textinput}
          value={employeeId}
          onChangeText={setEmployeeId}
          keyboardType="numeric"
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

export default loginEmployee;

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
});