import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Calendar } from 'react-native-calendars';
import { db } from '@/firebaseConfig';
import { collection, addDoc, getDocs, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AttendanceScreen = () => {
  const { employeeId } = useLocalSearchParams();
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [totalTime, setTotalTime] = useState(null);
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(true);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    if (!employeeId) {
      Alert.alert('Error', 'Employee ID is missing.');
      return;
    }
    fetchAttendance();
    loadTimerState();
  }, [employeeId]);

  useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const loadTimerState = async () => {
    try {
      const savedCheckInTime = await AsyncStorage.getItem('checkInTime');
      const savedTotalTime = await AsyncStorage.getItem('totalTime');
      if (savedCheckInTime) {
        const checkInTime = new Date(savedCheckInTime);
        const currentTime = new Date();
        const elapsedSeconds = Math.floor((currentTime - checkInTime) / 1000);

        setCheckInTime(checkInTime);
        setTimer(elapsedSeconds);
        setIsTimerRunning(true);
      }
      if (savedTotalTime) {
        setTotalTime(savedTotalTime);
      }
    } catch (error) {
      console.error('Error loading timer state:', error);
    }
  };

  const saveTimerState = async (checkInTime) => {
    try {
      await AsyncStorage.setItem('checkInTime', checkInTime.toISOString());
    } catch (error) {
      console.error('Error saving timer state:', error);
    }
  };

  const saveTotalTime = async (totalTime) => {
    try {
      await AsyncStorage.setItem('totalTime', totalTime);
    } catch (error) {
      console.error('Error saving total time:', error);
    }
  };

  const clearTimerState = async () => {
    try {
      await AsyncStorage.removeItem('checkInTime');
      await AsyncStorage.removeItem('totalTime');
    } catch (error) {
      console.error('Error clearing timer state:', error);
    }
  };

  const fetchAttendance = async () => {
    try {
      const attendanceRef = collection(db, 'employees', employeeId, 'attendance');
      const q = query(attendanceRef, orderBy('timestamp', 'asc'));
      const snapshot = await getDocs(q);

      const attendanceRecords = {};
      let lastCheckIn = null;
      let lastCheckOut = null;
      let lastTotalTime = null;
      let lastStatus = null;

      snapshot.forEach((doc) => {
        const data = doc.data();
        const dateKey = data.time.toDate().toISOString().split('T')[0];

        if (data.type === 'Check-In') {
          lastCheckIn = data.time.toDate();
        } else if (data.type === 'Check-Out') {
          lastCheckOut = data.time.toDate();
          lastTotalTime = data.totalTime;
          lastStatus = data.status;
        }

        attendanceRecords[dateKey] = {
          selected: true,
          selectedColor: getStatusColor(data.status),
          status: data.status,
        };
      });

      setAttendanceData(attendanceRecords);
      setCheckInTime(lastCheckIn);
      setCheckOutTime(lastCheckOut);
      setTotalTime(lastTotalTime);

      if (lastCheckIn && !lastCheckOut) {
        const elapsedSeconds = Math.floor((new Date() - lastCheckIn) / 1000);
        setTimer(elapsedSeconds);
        setIsTimerRunning(true);
        saveTimerState(lastCheckIn);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!employeeId) return Alert.alert('Error', 'Invalid Employee ID.');

    const currentTime = new Date();
    setCheckInTime(currentTime);
    setIsTimerRunning(true);
    setTimer(0);

    try {
      await addDoc(collection(db, 'employees', employeeId, 'attendance'), {
        type: 'Check-In',
        time: currentTime,
        timestamp: serverTimestamp(),
      });

      saveTimerState(currentTime);
      Alert.alert('Checked In', `Checked in at ${currentTime.toLocaleTimeString()}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to save check-in.');
    }
  };

  const handleCheckOut = async () => {
    if (!checkInTime) return Alert.alert('Error', 'Check-in required first!');
    if (!employeeId) return Alert.alert('Error', 'Invalid Employee ID.');

    const currentTime = new Date();
    setCheckOutTime(currentTime);
    setIsTimerRunning(false);

    const timeDiff = (currentTime - checkInTime) / 1000;
    const hours = Math.floor(timeDiff / 3600);
    const minutes = Math.floor((timeDiff % 3600) / 60);
    const currentSessionTime = `${hours} hrs ${minutes} mins`;

    // Add previous total time if it exists
    let totalTimeStr = currentSessionTime;
    if (totalTime) {
      const [prevHours, prevMinutes] = totalTime.split(' ').filter((val) => !isNaN(val));
      const totalHours = parseInt(prevHours, 10) + hours;
      const totalMinutes = parseInt(prevMinutes, 10) + minutes;
      totalTimeStr = `${totalHours} hrs ${totalMinutes} mins`;
    }

    setTotalTime(totalTimeStr);
    saveTotalTime(totalTimeStr);

    let status = hours >= 5 ? 'Full Day' : hours >= 2.5 ? 'Half Day' : 'Leave';
    const currentDate = currentTime.toISOString().split('T')[0];

    setAttendanceData((prev) => ({
      ...prev,
      [currentDate]: { selected: true, selectedColor: getStatusColor(status), status },
    }));

    try {
      await addDoc(collection(db, 'employees', employeeId, 'attendance'), {
        type: 'Check-Out',
        time: currentTime,
        totalTime: totalTimeStr,
        status,
        timestamp: serverTimestamp(),
      });

      clearTimerState();
      Alert.alert('Checked Out', `Checked out at ${currentTime.toLocaleTimeString()}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to save check-out.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Full Day': return '#4CAF50';
      case 'Half Day': return '#FFC107';
      case 'Leave': return '#F44336';
      default: return '#DDD';
    }
  };

  const formatTimer = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <Text style={styles.headerText}>Attendance System</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleCheckIn}>
          <Icon name="hand-peace-o" size={50} color="#4CAF50" />
          <Text style={styles.buttonText}>Check In</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleCheckOut}>
          <Icon name="hand-stop-o" size={50} color="#F44336" />
          <Text style={styles.buttonText}>Check Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatTimer(timer)}</Text>
      </View>

      <View style={styles.horizontalLine} />

      <View style={styles.calendarContainer}>
        <Calendar
          markedDates={attendanceData}
          markingType="multi-dot"
          theme={{
            calendarBackground: '#FFF',
            selectedDayBackgroundColor: '#4CAF50',
            selectedDayTextColor: '#FFF',
            todayTextColor: '#4CAF50',
            dayTextColor: '#333',
            textDisabledColor: '#DDD',
          }}
        />
      </View>

      <ScrollView style={styles.activityContainer}>
        {checkInTime && <Text style={styles.timeText}>Check-In: {checkInTime.toLocaleTimeString()}</Text>}
        {checkOutTime && <Text style={styles.timeText}>Check-Out: {checkOutTime.toLocaleTimeString()}</Text>}
        {totalTime && <View style={styles.totalTimeContainer}><Text style={styles.totalTimeText}>Total Time: {totalTime}</Text></View>}
      </ScrollView>
    </View>
  );
};

export default AttendanceScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerBar: { backgroundColor: '#4CAF50', paddingVertical: 20, alignItems: 'center' },
  headerText: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 20, backgroundColor: '#FFF' },
  button: { alignItems: 'center' },
  buttonText: { marginTop: 10, fontSize: 16, color: '#555' },
  timerContainer: { alignItems: 'center', marginVertical: 10 },
  timerText: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  horizontalLine: { borderBottomColor: '#DDD', borderBottomWidth: 1, marginVertical: 10 },
  calendarContainer: { margin: 10, borderRadius: 10, backgroundColor: '#FFF' },
  activityContainer: { flex: 1, paddingHorizontal: 20 },
  timeText: { fontSize: 18, marginBottom: 10, color: '#333' },
  totalTimeContainer: { padding: 20, backgroundColor: '#FFF', alignItems: 'center' },
  totalTimeText: { fontSize: 20, fontWeight: 'bold', color: '#4CAF50' },
});