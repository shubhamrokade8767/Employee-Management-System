import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getFirestore, collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { app } from '../firebaseConfig';

// Initialize Firestore
const db = getFirestore(app);

const AcceptLeaveScreen = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all leave requests
  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    setLoading(true);
    try {
      const employeesRef = collection(db, "employees");
      const employeesSnapshot = await getDocs(employeesRef);
      let allLeaves = [];

      for (let employee of employeesSnapshot.docs) {
        const employeeId = employee.id;
        const leaveRef = collection(doc(db, "employees", employeeId), "leave");
        const leaveSnapshot = await getDocs(leaveRef);

        leaveSnapshot.forEach(doc => {
          allLeaves.push({ id: doc.id, employeeId, ...doc.data() });
        });
      }

      setLeaveRequests(allLeaves);
    } catch (error) {
      console.error("Error fetching leave requests:", error);
      Alert.alert('Error', 'Failed to load leave requests.');
    }
    setLoading(false);
  };

  // Handle Accept or Reject Leave
  const handleLeaveDecision = async (leaveId, employeeId, decision) => {
    try {
      const leaveDocRef = doc(db, "employees", employeeId, "leave", leaveId);
      await updateDoc(leaveDocRef, { status: decision });

      Alert.alert('Success', `Leave ${decision} successfully!`);
      fetchLeaveRequests(); // Refresh list
    } catch (error) {
      console.error(`Error updating leave status: ${error}`);
      Alert.alert('Error', 'Failed to update leave status.');
    }
  };

  return (
    <LinearGradient colors={['#FFFFFF', '#F5F5F5']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.header}>Leave Requests</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#4CAF50" />
        ) : leaveRequests.length > 0 ? (
          leaveRequests.map((leave) => (
            <View key={leave.id} style={styles.leaveItem}>
              <Text style={styles.leaveText}>Employee ID: {leave.employeeId}</Text>
              <Text style={styles.leaveText}>Type: {leave.leaveType}</Text>
              <Text style={styles.leaveText}>Dates: {leave.startDate} to {leave.endDate}</Text>
              <Text style={styles.leaveText}>Reason: {leave.reason}</Text>
              <Text style={[styles.leaveText, styles[`status${leave.status}`]]}>Status: {leave.status}</Text>

              {leave.status === "Pending" && (
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.button, styles.acceptButton]}
                    onPress={() => handleLeaveDecision(leave.id, leave.employeeId, "Approved")}
                  >
                    <Text style={styles.buttonText}>Accept</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, styles.rejectButton]}
                    onPress={() => handleLeaveDecision(leave.id, leave.employeeId, "Rejected")}
                  >
                    <Text style={styles.buttonText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.noRequestsText}>No leave requests available.</Text>
        )}
      </ScrollView>
    </LinearGradient>
  );
};

export default AcceptLeaveScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { padding: 20 },
  header: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 15, textAlign: 'center' },
  leaveItem: { backgroundColor: '#FFF', borderRadius: 10, padding: 15, marginBottom: 10, elevation: 3 },
  leaveText: { fontSize: 16, color: '#333', marginBottom: 5 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  button: { borderRadius: 8, padding: 10, alignItems: 'center', width: '48%' },
  acceptButton: { backgroundColor: '#4CAF50' },
  rejectButton: { backgroundColor: '#F44336' },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  statusApproved: { color: '#4CAF50' },
  statusRejected: { color: '#F44336' },
  statusPending: { color: '#FFC107' },
  noRequestsText: { fontSize: 18, color: '#777', textAlign: 'center', marginTop: 20 },
});
