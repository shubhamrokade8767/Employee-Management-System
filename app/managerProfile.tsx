import { StyleSheet, Text, View, Image, TouchableOpacity, TextInput, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { db } from '@/firebaseConfig'; // Import Firestore instance
import { doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { MaterialIcons, Ionicons } from '@expo/vector-icons'; // For icons
import * as ImagePicker from 'expo-image-picker'; // For image picker

const ManagerProfile = () => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false); // State to toggle edit mode
  const [employee, setEmployee] = useState({
    name: 'Rokade Shubham Prakash',
    email: 'shubhamrokade8767@gmail.com',
    birthdate: 'November 16 2003',
    nickname:'Shubham',
    post: 'Senior Manager',
    profilePicture: 'https://via.placeholder.com/150', // Default profile picture
  });

  const onContinue = () => {
    router.navigate('/loginManager');
  };
  

  // Function to navigate back
  const goBack = () => {
    router.back(); // Navigate back to the previous screen
  };

  // Function to store employee data in Firestore
  const storeEmployeeData = async () => {
    try {
      const employeeRef = doc(db, 'employees', employee.email); // Use email as the document ID
      await setDoc(employeeRef, employee);
    } catch (error) {
      console.error('Error storing employee data: ', error);
    }
  };

  // Function to update employee data in Firestore
  const updateEmployeeData = async () => {
    try {
      const employeeRef = doc(db, 'employees', employee.email);
      await updateDoc(employeeRef, employee);
      Alert.alert('Success', 'Employee data updated successfully!');
      setIsEditing(false); // Exit edit mode after saving
    } catch (error) {
      Alert.alert('Error', 'Failed to update employee data.');
    }
  };

  // Request permission to access the camera and photo library
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please allow access to your photo library to change the profile picture.');
      }
    })();
  }, []);

  // Function to pick an image from the gallery
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Square aspect ratio
      quality: 1,
    });

    if (!result.canceled) {
      const newProfilePicture = result.assets[0].uri;
      setEmployee({ ...employee, profilePicture: newProfilePicture });

      // Update Firestore with the new image URI
      try {
        const employeeRef = doc(db, 'employees', employee.email);
        await updateDoc(employeeRef, { profilePicture: newProfilePicture });
      } catch (error) {
        console.error('Error updating profile picture: ', error);
      }
    }
  };

  // Fetch employee data from Firestore on component mount
  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const employeeRef = doc(db, 'employees', employee.email);
        const docSnap = await getDoc(employeeRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setEmployee({
            name: data.name,
            email: data.email,
            birthdate: data.birthdate,
            nickname: data.nickname,
            post: data.post,
            profilePicture: data.profilePicture || 'https://via.placeholder.com/150', // Default image if none exists
          });
        }
      } catch (error) {
        console.error('Error fetching employee data: ', error);
      }
    };

    fetchEmployeeData();
  }, []);

  // Ensure Firestore document exists on component mount
  useEffect(() => {
    const initializeEmployeeData = async () => {
      try {
        const employeeRef = doc(db, 'employees', employee.email);
        const docSnap = await getDoc(employeeRef);

        if (!docSnap.exists()) {
          await setDoc(employeeRef, employee);
        }
      } catch (error) {
        console.error('Error initializing employee data: ', error);
      }
    };

    initializeEmployeeData();
  }, []);

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={goBack}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Profile Picture and Edit Icon */}
      <View style={styles.profilePictureContainer}>
        <TouchableOpacity onPress={pickImage}>
          <Image
            source={{ uri: employee.profilePicture }}
            style={styles.profilePicture}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.editIcon}
          onPress={() => setIsEditing(!isEditing)}
        >
          <MaterialIcons name="edit" size={24} color="#0A1D56" />
        </TouchableOpacity>
      </View>

      {/* Employee Details */}
      <View style={styles.detailsContainer}>
        {isEditing ? (
          // Edit Form
          <>
            <TextInput
              style={styles.input}
              value={employee.name}
              onChangeText={(text) => setEmployee({ ...employee, name: text })}
              placeholder="Name"
              placeholderTextColor="#999"
            />
            <TextInput
              style={styles.input}
              value={employee.email}
              onChangeText={(text) => setEmployee({ ...employee, email: text })}
              placeholder="Email"
              placeholderTextColor="#999"
              editable={false} // Email should not be editable
            />
            <TextInput
              style={styles.input}
              value={employee.nickname}
              onChangeText={(text) => setEmployee({ ...employee, nickname: text })}
              placeholder="Nickname"
              placeholderTextColor="#999"
            />
            <TextInput
              style={styles.input}
              value={employee.birthdate}
              onChangeText={(text) => setEmployee({ ...employee, birthdate: text })}
              placeholder="Birthdate"
              placeholderTextColor="#999"
            />
            <TextInput
              style={styles.input}
              value={employee.post}
              onChangeText={(text) => setEmployee({ ...employee, post: text })}
              placeholder="Post"
              placeholderTextColor="#999"
            />
          </>
        ) : (
          // Display Data
          <>
            <Text style={styles.detailText}>Name: {employee.name}</Text>
            <Text style={styles.detailText}>Email: {employee.email}</Text>
            <Text style={styles.detailText}>Birthdate: {employee.birthdate}</Text>
            <Text style={styles.detailText}>Nickname: {employee.nickname}</Text>
            <Text style={styles.detailText}>Post: {employee.post}</Text>
          </>
        )}
      </View>

      {/* Save Button (Visible Only in Edit Mode) */}
      {isEditing && (
        <TouchableOpacity
          style={styles.saveButton}
          onPress={updateEmployeeData}
        >
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      )}

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={onContinue}>
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ManagerProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginBottom: 80,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: '#0F2C96',
    borderRadius: 20,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  profilePictureContainer: {
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  profilePicture: {
    width: 150,
    height: 150,
    borderRadius: 75, // Makes the image circular
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  editIcon: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  detailsContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20,
  },
  detailText: {
    fontSize: 16,
    marginBottom: 15,
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    fontSize: 16,
    marginBottom: 15,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 5,
    textAlign: 'center',
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: '#0A1D56',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: '#0F2C96',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});