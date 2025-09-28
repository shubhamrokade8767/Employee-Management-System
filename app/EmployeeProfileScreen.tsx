import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator, // Import ActivityIndicator
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { db } from "@/firebaseConfig"; // Ensure Firebase is correctly configured
import { doc, updateDoc } from "firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";

const EmployeeProfileScreen = () => {
  const employeeData = useLocalSearchParams(); // Get employee data from router params

  // Fields to display
  const displayFields = [
    "name",
    "employeeId",
    "mobileNo",
    "position",
    "birthDate",
    "address",
    "email",
    "gender",
    "password",
  ];

  const nonEditableFields = ["salary", "salaryStatus", "paidDate"]; // Fields that cannot be edited

  // Store employee details in state
  const [editableData, setEditableData] = useState(employeeData);
  const [isEditing, setIsEditing] = useState(false); // Editing state
  const [loading, setLoading] = useState(false); // Loading state for save operation

  // Handle input changes
  const handleChange = (key, value) => {
    setEditableData({ ...editableData, [key]: value });
  };

  // Save updated data to Firestore
  const handleSave = async () => {
    setLoading(true); // Start loading
    try {
      const employeeRef = doc(db, "employees", editableData.employeeId);
      await updateDoc(employeeRef, editableData);
      Alert.alert("Success", "Employee details updated successfully!");
      setIsEditing(false); // Exit editing mode
    } catch (error) {
      console.error("Error updating document: ", error);
      Alert.alert("Error", "Failed to update employee details.");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <LinearGradient colors={["white", "black"]} style={styles.gradientContainer}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Employee Profile</Text>

        {Object.keys(employeeData).length === 0 ? (
          <Text style={styles.noDataText}>No employee data available</Text>
        ) : (
          [...displayFields, ...nonEditableFields].map((key) => (
            <View style={styles.infoContainer} key={key}>
              <Text style={styles.label}>{formatKey(key)}:</Text>
              {nonEditableFields.includes(key) ? (
                <Text style={[styles.value, styles.disabledText]}>
                  {editableData[key] || "N/A"}
                </Text>
              ) : isEditing ? (
                <TextInput
                  style={styles.input}
                  value={editableData[key]}
                  onChangeText={(value) => handleChange(key, value)}
                />
              ) : (
                <Text style={styles.value}>{editableData[key] || "N/A"}</Text>
              )}
            </View>
          ))
        )}

        {/* Edit / Save Button */}
        {loading ? (
          <ActivityIndicator size="large" color="#ff4b2b" style={styles.loader} />
        ) : (
          <TouchableOpacity
            onPress={isEditing ? handleSave : () => setIsEditing(true)}
          >
            <LinearGradient colors={["#ff416c", "#ff4b2b"]} style={styles.button}>
              <Text style={styles.buttonText}>
                {isEditing ? "Save Changes" : "Edit Profile"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </ScrollView>
    </LinearGradient>
  );
};

// Function to format database keys into readable labels
const formatKey = (key) => {
  return key
    .replace(/_/g, " ") // Replace underscores with spaces
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter of each word
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "black",
    marginBottom: 20,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  infoContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
  },
  value: {
    fontSize: 16,
    color: "white",
    marginTop: 5,
  },
  disabledText: {
    color: "#ddd",
    fontStyle: "italic",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 8,
    fontSize: 16,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    color: "#333",
  },
  button: {
    padding: 15,
    borderRadius: 30,
    marginTop: 20,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  noDataText: {
    fontSize: 18,
    textAlign: "center",
    color: "#eee",
  },
  loader: {
    marginTop: 20,
  },
});

export default EmployeeProfileScreen;