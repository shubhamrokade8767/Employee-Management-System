import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import { db } from '@/firebaseConfig';
import { collection, query, getDocs } from 'firebase/firestore';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width - 40; // Adjusted width to fit properly

const PerformanceScreen = () => {
  const [employeeId, setEmployeeId] = useState('');
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dailyHours, setDailyHours] = useState([]);

  const convertToHours = (totalTime) => {
    if (!totalTime) return 0;
    const match = totalTime.match(/(\d+)\s*hrs?\s*(\d+)?\s*mins?/);
    if (!match) return 0;
    const hours = parseInt(match[1], 10) || 0;
    const minutes = parseInt(match[2], 10) || 0;
    return hours + minutes / 60;
  };

  const fetchPerformance = async () => {
    if (!employeeId.trim()) {
      Alert.alert('Error', 'Please enter an Employee ID.');
      return;
    }

    setLoading(true);
    try {
      const attendanceRef = collection(db, 'employees', employeeId, 'attendance');
      const q = query(attendanceRef);
      const snapshot = await getDocs(q);

      let totalHours = 0;
      let fullDays = 0;
      let halfDays = 0;
      let leaves = 0;
      const hoursData = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.type === 'Check-Out' && data.totalTime) {
          const hours = convertToHours(data.totalTime);
          totalHours += hours;
          hoursData.push(hours);

          if (hours >= 5) {
            fullDays++;
          } else if (hours >= 2.5) {
            halfDays++;
          } else {
            leaves++;
          }
        }
      });

      setPerformanceData({
        totalHours: totalHours.toFixed(2),
        fullDays,
        halfDays,
        leaves,
      });

      setDailyHours(hoursData);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch performance data.');
      console.error('Firestore query error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGraphColor = () => {
    const averageHours = dailyHours.length > 0 ? dailyHours.reduce((sum, hours) => sum + hours, 0) / dailyHours.length : 0;
    return averageHours >= 5 ? '#4CAF50' : '#F44336';
  };

  const defaultPoints = [4, 5];
  const graphData = [...defaultPoints, ...dailyHours];

  return (
    <LinearGradient colors={['white', 'black']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Employee Performance</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter Employee ID"
          value={employeeId}
          onChangeText={setEmployeeId}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.searchButton} onPress={fetchPerformance}>
          <Icon name="search" size={20} color="#FFF" />
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FFF" />
          <Text style={{ color: '#FFF' }}>Loading...</Text>
        </View>
      ) : performanceData ? (
        <ScrollView style={styles.performanceContainer}>
          <View style={styles.performanceCard}>
            <Text style={styles.performanceTitle}>Performance Summary</Text>
            <View style={styles.summaryContainer}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Total Working Hours</Text>
                <Text style={styles.summaryValue}>{performanceData.totalHours} hrs</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Full Days</Text>
                <Text style={styles.summaryValue}>{performanceData.fullDays}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Half Days</Text>
                <Text style={styles.summaryValue}>{performanceData.halfDays}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Leaves</Text>
                <Text style={styles.summaryValue}>{performanceData.leaves}</Text>
              </View>
            </View>
          </View>

          {graphData.length > 0 && (
            <View style={styles.graphContainer}>
              <Text style={styles.graphTitle}>Daily Performance Trend</Text>
              <LineChart
                data={{
                  labels: graphData.map((_, index) => `Day ${index + 1}`),
                  datasets: [{ data: graphData }],
                }}
                width={screenWidth}
                height={220}
                yAxisSuffix=" hrs"
                chartConfig={{
                  backgroundColor: '#fff',
                  backgroundGradientFrom: '#6a11cb',
                  backgroundGradientTo: '#2575fc',
                  decimalPlaces: 1,
                  color: (opacity = 1) => `rgba(75,192,192,${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  propsForDots: { r: '6', strokeWidth: '2', stroke: '#fff' },
                }}
                bezier
                style={styles.graph}
              />
            </View>
          )}
        </ScrollView>
      ) : (
        <View style={styles.center}>
          <Text style={{ color: '#FFF' }}>Enter an Employee ID to view performance.</Text>
        </View>
      )}
    </LinearGradient>
  );
};

export default PerformanceScreen;

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 20 },
  header: { paddingVertical: 20, alignItems: 'center' },
  headerText: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  searchContainer: { padding: 20, flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#FFF', borderRadius: 10, padding: 10, marginRight: 10 },
  searchButton: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 10, flexDirection: 'row', alignItems: 'center' },
  searchButtonText: { color: '#FFF', marginLeft: 10, fontWeight: 'bold' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  performanceContainer: { paddingHorizontal: 20 },
  performanceCard: { backgroundColor: '#FFF', borderRadius: 10, padding: 20, elevation: 5, marginBottom: 20 },
  performanceTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 20, textAlign: 'center' },
  summaryContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  summaryItem: { width: '48%', backgroundColor: '#f0f0f0', borderRadius: 10, padding: 15, marginBottom: 10, alignItems: 'center' },
  summaryLabel: { fontSize: 16, color: '#555', marginBottom: 5 },
  summaryValue: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  graphContainer: { backgroundColor: '#FFF', borderRadius: 10, padding: 20, elevation: 5 },
  graphTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 10, textAlign: 'center' },
  graph: { borderRadius: 16, alignSelf: 'center', margin: 5 },
});