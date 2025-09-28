import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { db } from '@/firebaseConfig'; // Import Firestore
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient'; // For gradient background

const SalaryEmployee = () => {
  const router = useRouter();
  const [employees, setEmployees] = useState([]);

  const isNumeric = (id) => {
    return /^\d+$/.test(id); // Checks if the string contains only digits
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'employees'));
        const employeesList = [];
        querySnapshot.forEach((doc) => {
          if (isNumeric(doc.id)) {
            employeesList.push({ id: doc.id, ...doc.data() });
          }
        });
        setEmployees(employeesList);
      } catch (error) {
        console.error('Error fetching employees: ', error);
        Alert.alert('Error', 'Failed to fetch employees.');
      }
    };

    fetchEmployees();
  }, []);

  const updateSalaryStatus = async (employeeId, status) => {
    try {
      const employeeRef = doc(db, 'employees', employeeId);
      const updateData = { salaryStatus: status };

      if (status === 'Paid') {
        updateData.paidDate = new Date().toISOString().split('T')[0];
      }

      await updateDoc(employeeRef, updateData);
      Alert.alert('Success', `Salary marked as ${status}`);

      const updatedEmployees = employees.map((emp) =>
        emp.id === employeeId ? { ...emp, ...updateData } : emp
      );
      setEmployees(updatedEmployees);
    } catch (error) {
      console.error('Error updating salary status: ', error);
      Alert.alert('Error', 'Failed to update salary status.');
    }
  };

  // Calculate the number of paid and unpaid employees
  const paidEmployees = employees.filter(emp => emp.salaryStatus === 'Paid').length;
  const unpaidEmployees = employees.length - paidEmployees;

  return (
    <LinearGradient colors={['white', 'black']} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Employee Salary Management</Text>
        
        {/* Status Bar */}
        <View style={styles.statusBar}>
          <View style={styles.statusItem}>
            <Text style={styles.statusText}>Paid: {paidEmployees}</Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusText}>Unpaid: {unpaidEmployees}</Text>
          </View>
        </View>

        {employees.map((employee) => (
          <View key={employee.id} style={styles.employeeCard}>
            <Text style={styles.employeeName}>{employee.name}</Text>
            <Text style={styles.employeeInfo}>Position: {employee.position}</Text>
            <Text style={styles.employeeInfo}>Salary: ${employee.salary}</Text>
            <Text style={styles.employeeInfo}>
              Salary Status: {employee.salaryStatus || 'Not Updated'}
            </Text>
            {employee.salaryStatus === 'Paid' && employee.paidDate && (
              <Text style={styles.employeeInfo}>Paid Date: {employee.paidDate}</Text>
            )}

            <View style={styles.buttonContainer}>
              {employee.salaryStatus !== 'Paid' ? (
                <TouchableOpacity
                  style={[styles.button, styles.paidButton]}
                  onPress={() => updateSalaryStatus(employee.id, 'Paid')}
                >
                  <Text style={styles.buttonText}>Mark as Paid</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.button, styles.notPaidButton]}
                  onPress={() => updateSalaryStatus(employee.id, 'Not Paid')}
                >
                  <Text style={styles.buttonText}>Mark as Not Paid</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
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
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 10,
  },
  statusItem: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  employeeCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  employeeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  employeeInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    width: '48%',
  },
  paidButton: {
    backgroundColor: '#4CAF50',
  },
  notPaidButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default SalaryEmployee;