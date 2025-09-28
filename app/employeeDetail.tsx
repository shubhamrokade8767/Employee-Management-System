import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { db } from '@/firebaseConfig';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';

const EmployeeDetail = () => {
  const { employeeId } = useLocalSearchParams(); // Access the employeeId parameter
  const router = useRouter();
  const [employee, setEmployee] = useState(null);

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      const docRef = doc(db, 'employees', employeeId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setEmployee(docSnap.data());
      } else {
        console.log('No such document!');
      }
    };

    fetchEmployeeDetails();
  }, [employeeId]);

  // Handle delete employee
  const handleDelete = async () => {
    Alert.alert(
      'Delete Employee',
      'Are you sure you want to delete this employee?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'employees', employeeId));
              Alert.alert('Success', 'Employee deleted successfully!');
              router.push('/showAllEmployee'); // Navigate back to the employee list
            } catch (error) {
              console.error('Error deleting employee: ', error);
              Alert.alert('Error', 'Failed to delete employee.');
            }
          },
        },
      ]
    );
  };

  // Handle edit employee
  const handleEdit = () => {
    router.push(`/EditEmployee?employeeId=${employeeId}`); // Navigate to the edit screen
  };

  if (!employee) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{employee.name}</Text>
      <Text style={styles.detail}>Email: {employee.email}</Text>
      <Text style={styles.detail}>Gender: {employee.gender}</Text>
      <Text style={styles.detail}>Birth Date: {employee.birthDate}</Text>
      <Text style={styles.detail}>Phone Number: {employee.mobileNo}</Text>
      <Text style={styles.detail}>Employee ID: {employee.employeeId}</Text>
      <Text style={styles.detail}>Position: {employee.position}</Text>
      <Text style={styles.detail}>Salary: {employee.salary}</Text>
      <Text style={styles.detail}>Address: {employee.address}</Text>

      {/* Edit and Delete Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  detail: {
    fontSize: 16,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  editButton: {
    backgroundColor: '#007bff', // Blue color for edit button
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#dc3545', // Red color for delete button
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EmployeeDetail;