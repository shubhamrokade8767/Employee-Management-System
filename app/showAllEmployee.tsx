import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, TextInput, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { db } from '@/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient'; // Import LinearGradient

const ShowAllEmployee = () => {
  const router = useRouter();
  const [employees, setEmployees] = useState([]); // All employees fetched from Firestore
  const [filteredEmployees, setFilteredEmployees] = useState([]); // Employees filtered by search
  const [searchQuery, setSearchQuery] = useState(''); // Search query state

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

  useEffect(() => {
    const fetchEmployees = async () => {
      const querySnapshot = await getDocs(collection(db, 'employees'));
      const employeesList = [];
      querySnapshot.forEach((doc) => {
        const employeeId = doc.id;
        // Check if the ID contains only numeric characters
        if (/^\d+$/.test(employeeId)) {
          employeesList.push({ id: employeeId, ...doc.data() });
        }
      });
      setEmployees(employeesList);
      setFilteredEmployees(employeesList); // Initialize filtered list with all employees
    };

    fetchEmployees();
  }, []);

  // Handle search button press
  const handleSearch = () => {
    animateButton(); // Trigger button press animation
    if (searchQuery) {
      const filtered = employees.filter((employee) =>
        employee.id.includes(searchQuery) // Filter employees by ID
      );
      setFilteredEmployees(filtered);
    } else {
      setFilteredEmployees(employees); // Reset to all employees if search query is empty
    }
  };

  // Automatically reset to all employees when search bar is empty
  useEffect(() => {
    if (!searchQuery) {
      setFilteredEmployees(employees);
    }
  }, [searchQuery, employees]);

  const renderItem = ({ item }) => (
    <Animated.View style={{ opacity: fadeAnim }}>
      <TouchableOpacity
        style={styles.item}
        onPress={() => router.push(`/employeeDetail?employeeId=${item.id}`)} // Pass employeeId as a query parameter
      >
        <Text style={styles.idText}>ID: {item.id}</Text>
        <Text style={styles.nameText}>Name: {item.name}</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <LinearGradient
      colors={['white', 'black']} // Black to grey gradient
      style={styles.gradient}
    >
      <View style={styles.container}>
        <Text style={styles.header}>Employee List</Text>

        {/* Search Bar and Button */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchBar}
            placeholder="Search by Employee ID"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            keyboardType="numeric" // Restrict input to numeric keyboard
          />
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
              <Text style={styles.buttonText}>Search</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Employee List */}
        <FlatList
          data={filteredEmployees}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No employees found.</Text>
          }
        />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'black', // White color for header
    marginBottom: 20,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  searchBar: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginRight: 10,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3, // For Android shadow
  },
  searchButton: {
    backgroundColor: '#ff6f61', // Coral color for the button
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3, // For Android shadow
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  item: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Semi-transparent white background
    padding: 20,
    marginVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3, // For Android shadow
  },
  idText: {
    fontSize: 14,
    color: '#666', // Gray color for ID
    marginBottom: 5,
  },
  nameText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333', // Dark color for name
  },
  emptyText: {
    fontSize: 16,
    color: '#fff', // White color for empty text
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ShowAllEmployee;