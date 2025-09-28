import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getFirestore, collection, doc, addDoc, getDocs } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { app } from '../firebaseConfig';

// Initialize Firestore
const db = getFirestore(app);

const LeaveScreen = () => {
  const [employeeId, setEmployeeId] = useState('');
  const [leaveType, setLeaveType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const leaveBalance = {
    casual: 5,
    sick: 3,
    earned: 10,
  };

  // Load Employee ID and Fetch Leave History when the component mounts
  useEffect(() => {
    const loadEmployeeId = async () => {
      try {
        const storedId = await AsyncStorage.getItem('employeeId');
        if (storedId) {
          setEmployeeId(storedId);
          fetchLeaveHistory(storedId);
        }
      } catch (error) {
        console.error('Error loading Employee ID:', error);
      }
    };
    loadEmployeeId();
  }, []);

  // Fetch leave history
  const fetchLeaveHistory = async (id) => {
    setLoading(true);
    try {
      const leaveRef = collection(doc(db, "employees", id), "leave");
      const snapshot = await getDocs(leaveRef);
      const leaveData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLeaveHistory(leaveData);
    } catch (error) {
      console.error("Error fetching leave history:", error);
      Alert.alert('Error', 'Failed to load leave history.');
    }
    setLoading(false);
  };

  // Handle Apply Leave
  const handleApplyLeave = async () => {
    if (!employeeId || !leaveType || !startDate || !endDate || !reason) {
      Alert.alert('Error', 'Please fill all the fields.');
      return;
    }

    try {
      const leaveRef = collection(doc(db, "employees", employeeId), "leave");

      await addDoc(leaveRef, {
        leaveType,
        startDate,
        endDate,
        reason,
        status: "Pending",
        appliedAt: new Date(),
      });

      Alert.alert('Success', 'Leave application submitted successfully!');
      fetchLeaveHistory(employeeId); // Refresh leave history

      // Reset form fields
      setLeaveType('');
      setStartDate('');
      setEndDate('');
      setReason('');
    } catch (error) {
      console.error("Error submitting leave:", error);
      Alert.alert('Error', 'Failed to submit leave. Try again.');
    }
  };

  // Handle Employee ID Change
  const handleEmployeeIdChange = async (id) => {
    setEmployeeId(id);
    await AsyncStorage.setItem('employeeId', id); // Store ID
    fetchLeaveHistory(id); // Fetch history for the new ID
  };

  return (
    <LinearGradient colors={['#FFFFFF', '#F5F5F5']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Leave Balance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Leave Balance</Text>
          <View style={styles.balanceContainer}>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>Casual Leave</Text>
              <Text style={styles.balanceValue}>{leaveBalance.casual} days</Text>
            </View>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>Sick Leave</Text>
              <Text style={styles.balanceValue}>{leaveBalance.sick} days</Text>
            </View>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>Earned Leave</Text>
              <Text style={styles.balanceValue}>{leaveBalance.earned} days</Text>
            </View>
          </View>
        </View>

        {/* Apply Leave Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Apply for Leave</Text>
          <TextInput
            style={styles.input}
            placeholder="Employee ID"
            value={employeeId}
            onChangeText={handleEmployeeIdChange}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Leave Type (e.g., Casual, Sick)"
            value={leaveType}
            onChangeText={setLeaveType}
          />
          <TextInput
            style={styles.input}
            placeholder="Start Date (YYYY-MM-DD)"
            value={startDate}
            onChangeText={setStartDate}
          />
          <TextInput
            style={styles.input}
            placeholder="End Date (YYYY-MM-DD)"
            value={endDate}
            onChangeText={setEndDate}
          />
          <TextInput
            style={[styles.input, styles.reasonInput]}
            placeholder="Reason for Leave"
            value={reason}
            onChangeText={setReason}
            multiline
          />
          <TouchableOpacity style={styles.applyButton} onPress={handleApplyLeave}>
            <Text style={styles.applyButtonText}>Apply for Leave</Text>
          </TouchableOpacity>
        </View>

        {/* Leave History Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Leave History</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#4CAF50" />
          ) : leaveHistory.length > 0 ? (
            leaveHistory.map((leave) => (
              <View key={leave.id} style={styles.historyItem}>
                <Text style={styles.historyText}>
                  {leave.leaveType} Leave: {leave.startDate} to {leave.endDate}
                </Text>
                <Text style={[styles.historyText, styles[`status${leave.status}`]]}>
                  {leave.status}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.noHistoryText}>No leave history available.</Text>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default LeaveScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { padding: 20 },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  balanceContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  balanceItem: { backgroundColor: '#FFF', borderRadius: 10, padding: 15, width: '30%', alignItems: 'center', elevation: 3 },
  input: { backgroundColor: '#FFF', borderRadius: 10, padding: 15, marginBottom: 15, elevation: 3 },
  applyButton: { backgroundColor: '#4CAF50', borderRadius: 10, padding: 15, alignItems: 'center' },
  applyButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  historyItem: { backgroundColor: '#FFF', borderRadius: 10, padding: 15, marginBottom: 10, elevation: 3 },
  noHistoryText: { fontSize: 16, color: '#777', textAlign: 'center' },
  statusApproved: { color: '#4CAF50' },
  statusPending: { color: '#FFC107' },
  statusRejected: { color: '#F44336' },
});
