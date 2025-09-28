import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome, Entypo, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import { db } from '@/firebaseConfig'; // Import Firestore instance
import { doc, getDoc } from 'firebase/firestore';

const ManagerHome = () => {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch employee data from Firestore on component mount
  useEffect(() => {
    const fetchEmployeeName = async () => {
      try {
        const employeeEmail = 'shubhamrokade8767@gmail.com'; // Replace with the logged-in employee's email
        const employeeRef = doc(db, 'employees', employeeEmail);
        const docSnap = await getDoc(employeeRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setEmployeeName(data.nickname); // Set the employee's name in the state
        } else {
          console.log('No such document!');
          setEmployeeName('Unknown Employee'); // Fallback name
        }
      } catch (error) {
        console.error('Error fetching employee data: ', error);
        setEmployeeName('Error Loading Name'); // Fallback name
      } finally {
        setIsLoading(false); // Stop loading
      }
    };

    fetchEmployeeName();
  }, []);

  // Update date and time every second
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const date = now.toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric' });
      const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      setCurrentDate(date);
      setCurrentTime(time);
    };

    updateDateTime();
    const intervalId = setInterval(updateDateTime, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const onContinue = () => {
    router.navigate("/managerProfile");
  };
  const onContinue1 = () => {
    router.navigate('/addEmployee');
  };
  const onContinue2 = () => {
    router.navigate('/showAllEmployee');
  };
  const onContinue3 = () => {
    router.navigate('/AddManager');
  };
  const onContinue4 = () => {
    router.navigate('/salleryEmployee');
  };
  const onContinue5 = () => {
    router.navigate('/PerformanceScreen');
  };
  const onContinue6 = () => {
    router.navigate('/AcceptLeaveScreen');
  };

  const menuItems = [
    { title: "Add Employee", icon: <FontAwesome name="user-plus" size={30} color="#FF6392" />, onPress: onContinue1 },
    { title: "Add Admin", icon: <FontAwesome name="user-secret" size={30} color="#FF6392" />, onPress: onContinue3},
    { title: "Show All Employees", icon: <FontAwesome name="users" size={30} color="#FF6392" />, onPress: onContinue2},
    { title: "Salary Slip", icon: <FontAwesome name="file-text" size={30} color="#FF6392" />, onPress: onContinue4},
    { title: "Employee Performance", icon: <Entypo name="line-graph" size={30} color="#FF6392" />, onPress: onContinue5},
    { title: "Leaves Request", icon: <MaterialIcons name="event-available" size={30} color="#FF6392" />, onPress: onContinue6}, // Updated title and icon
  ];

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <LinearGradient colors={["#0A1D56", "#0F2C96"]} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Welcome, </Text>
          <TouchableOpacity onPress={onContinue}>
            <Image
              source={{ uri: "https://wallpapers.com/images/high/cool-minimalist-profile-pictures-oib9ltzxmonk5hxz.webp" }}
              style={styles.profilePic}
            />
          </TouchableOpacity>
        </View>
        <View>
          <Text style={styles.headerTitle1}>
            {isLoading ? "Loading..." : employeeName}
            <Text style={{ fontStyle: 'normal', fontSize: 26 }}>😊</Text>
          </Text>
        </View>
        <View style={styles.dateTimeContainer}>
          <Text style={styles.date}>Date:- {currentDate}</Text>
          <Text style={styles.time}>{currentTime}</Text>
        </View>
      </LinearGradient>

      {/* Menu Items */}
      <View style={styles.menuGrid}>
        {menuItems.map((item, index) => (
          <TouchableOpacity key={index} style={styles.menuItem} onPress={item.onPress}>
            {item.icon}
            <Text style={styles.menuText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default ManagerHome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  header: {
    height: 230,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingTop: 30,
    paddingHorizontal: 20,
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 10,
  },
  headerTitle: {
    color: "#FFF",
    fontSize: 36,
    fontWeight: "bold",
  },
  headerTitle1: {
    color: "#FFF",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 40,
  },
  dateTimeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  date: {
    color: "#FFF",
    fontSize: 20,
  },
  time: {
    color: "#FFF",
    fontSize: 20,
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#FFF",
  },
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-evenly",
    marginTop: 40,
    paddingHorizontal: 10,
  },
  menuItem: {
    width: "40%",
    height: 120,
    backgroundColor: "#FFF",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  menuText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
});