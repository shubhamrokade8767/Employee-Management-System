import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { db } from '@/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const EditEmployee = () => {
  const { employeeId } = useLocalSearchParams();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [employeeIdField, setEmployeeIdField] = useState('');
  const [salary, setSalary] = useState('');
  const [position, setPosition] = useState('');
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false); // State for loader

  useEffect(() => {
    const fetchEmployee = async () => {
      const docRef = doc(db, 'employees', employeeId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setName(data.name);
        setEmail(data.email);
        setGender(data.gender);
        setBirthDate(data.birthDate);
        setMobileNo(data.mobileNo);
        setEmployeeIdField(data.employeeId);
        setSalary(data.salary);
        setPosition(data.position);
        setAddress(data.address);
      }
    };

    fetchEmployee();
  }, [employeeId]);

  const handleUpdate = async () => {
    if (!name || !email || !gender || !birthDate || !mobileNo || !employeeIdField || !salary || !position || !address) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    setIsLoading(true); // Start loading

    try {
      await updateDoc(doc(db, 'employees', employeeId), {
        name,
        email,
        gender,
        birthDate,
        mobileNo,
        employeeId: employeeIdField,
        salary,
        position,
        address,
      });
      Alert.alert('Success', 'Employee updated successfully!');
      router.push(`/employeeDetail?employeeId=${employeeId}`);
    } catch (error) {
      console.error('Error updating employee: ', error);
      Alert.alert('Error', 'Failed to update employee.');
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Edit Employee</Text>

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

      <Text style={styles.label}>Gender *</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Gender"
        value={gender}
        onChangeText={setGender}
      />

      <Text style={styles.label}>Birth Date *</Text>
      <TextInput
        style={styles.input}
        placeholder="YY / MM / DD"
        value={birthDate}
        onChangeText={setBirthDate}
      />

      <Text style={styles.label}>Phone Number *</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Phone Number"
        value={mobileNo}
        onChangeText={setMobileNo}
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Employee ID *</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Employee ID"
        value={employeeIdField}
        onChangeText={setEmployeeIdField}
      />

      <Text style={styles.label}>Position *</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Position"
        value={position}
        onChangeText={setPosition}
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

      <TouchableOpacity
        style={styles.updateButton}
        onPress={handleUpdate}
        disabled={isLoading} // Disable button while loading
      >
        {isLoading ? (
          <ActivityIndicator color="#FFF" /> // Show loader
        ) : (
          <Text style={styles.buttonText}>Update</Text> // Show update text
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  updateButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditEmployee;