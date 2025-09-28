import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Animated } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { auth, db } from '@/firebaseConfig'; // Import auth and db
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient'; // For gradient background

const addEmployee = () => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('Female');
  const [birthDate, setBirthDate] = useState('');
  const [password, setPassword] = useState('');
  const [mobileNo, setmobileNo] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [salary, setSalary] = useState('');
  const [position, setPosition] = useState('');
  const [address, setAddress] = useState('');

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current; // Initial value for opacity: 0
  const buttonScale = useRef(new Animated.Value(1)).current; // Initial scale for button: 1

  // Fade-in animation when the component mounts
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1, // Animate to opacity: 1
      duration: 1000, // Duration of the animation
      useNativeDriver: true, // Use native driver for better performance
    }).start();
  }, [fadeAnim]);

  // Button press animation
  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.9, // Scale down to 90%
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1, // Scale back to 100%
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleRegister = async () => {
    animateButton(); // Trigger button press animation
    try {
      // Step 1: Create a user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Step 2: Save additional employee data to Firestore using employeeId as the document ID
      await setDoc(doc(db, 'employees', employeeId), {
        name,
        email,
        gender,
        birthDate,
        mobileNo,
        employeeId,
        salary,
        position,
        address,
        password,
        createdAt: new Date().toISOString(),
        uid: user.uid, // Optionally store the Firebase Auth UID for reference
      });

      Alert.alert('Success', 'Employee registered successfully!');
      // Clear the form
      setName('');
      setEmail('');
      setGender('Female');
      setBirthDate('');
      setPassword('');
      setmobileNo('');
      setEmployeeId('');
      setSalary('');
      setPosition('');
      setAddress('');
    } catch (error) {
      console.error('Error registering employee: ', error);
      Alert.alert('Error', error.message);
    }
  };

  return (
    <LinearGradient colors={['white','black']} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.title}>Add Employee</Text>

          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Full Name"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: johndoe@mail.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <Text style={styles.label}>Phone Number *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Phone Number"
            value={mobileNo}
            onChangeText={setmobileNo}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Employee ID *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Employee ID"
            value={employeeId}
            onChangeText={setEmployeeId}
          />

          <Text style={styles.label}>Position *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Position"
            value={position}
            onChangeText={setPosition}
          />

          <Text style={styles.label}>Gender *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={gender}
              style={styles.picker}
              onValueChange={(itemValue) => setGender(itemValue)}
            >
              <Picker.Item label="Female" value="Female" />
              <Picker.Item label="Male" value="Male" />
            </Picker>
          </View>

          <Text style={styles.label}>Birth Date *</Text>
          <TextInput
            style={styles.input}
            placeholder="YY / MM / DD"
            value={birthDate}
            onChangeText={setBirthDate}
          />

          <Text style={styles.label}>Salary *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Salary"
            value={salary}
            onChangeText={setSalary}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Address *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter Address"
            value={address}
            onChangeText={setAddress}
            multiline
          />

          <Text style={styles.label}>Password *</Text>
          <TextInput
            style={styles.input}
            placeholder="Min 6 characters"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity style={styles.button} onPress={handleRegister}>
              <Text style={styles.buttonText}>Add Employee</Text>
            </TouchableOpacity>
          </Animated.View>

          <Text style={styles.footerText}>
            By clicking Add Employee, you agree to our User Agreement, Privacy Policy, and Cookie Policy.
          </Text>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: 'black',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#ff6f61',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerText: {
    fontSize: 12,
    color: '#fff',
    marginTop: 20,
    textAlign: 'center',
  },
});

export default addEmployee;