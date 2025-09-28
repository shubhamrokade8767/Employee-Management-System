import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFonts, Inter_400Regular, Inter_700Bold } from "@expo-google-fonts/inter";
import { db } from "@/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "react-native";



const EmployeeHome = () => {
  const [employeeId, setEmployeeId] = useState(null);
  const [employeeName, setEmployeeName] = useState("Loading...");
  const [loading, setLoading] = useState(true);
  const [employeeData, setEmployeeData] = useState(null);
  const router = useRouter();

  let [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
  });

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const storedEmployeeId = await AsyncStorage.getItem("employeeId");
        if (!storedEmployeeId) {
          Alert.alert("Error", "No stored employee ID found.");
          return;
        }

        setEmployeeId(storedEmployeeId);

        const employeeDoc = await getDoc(doc(db, "employees", storedEmployeeId));
        if (employeeDoc.exists()) {
          setEmployeeName(employeeDoc.data().name);
          setEmployeeData(employeeDoc.data());
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching employee data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeData();
  }, []);

  if (!fontsLoaded || loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const handleAttendance = () => {
    if (!employeeId) {
      Alert.alert("Error", "Employee ID is missing.");
      return;
    }
    router.push({ pathname: "/AttendanceScreen", params: { employeeId } });
  };

  const handleLeave = () => {
    router.push("/LeaveScreen");
  };

  const handleSalarySlip = () => {
    if (!employeeId) {
      Alert.alert("Error", "Employee ID is missing.");
      return;
    }
    router.push({ pathname: "/SalarySlipScreen", params: { employeeId } });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#003973" />

      <LinearGradient colors={["#4A90E2", "#003973"]} style={styles.navbar}>
        <Text style={styles.navbarTitle}>Employee Dashboard</Text>
        <TouchableOpacity onPress={() => router.push({ pathname: "/EmployeeProfileScreen", params: employeeData })}>
          <Ionicons name="person-circle-outline" size={36} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.manageContainer}>
        <Text style={styles.manageTitle}>Manage</Text>
        <Text style={styles.manageSubtitle}>Organize workflow.</Text>
        <Text style={styles.employeeName}>Welcome, {employeeName}.</Text>
      </View>

      <View style={styles.optionsContainer}>
        <TouchableOpacity style={[styles.optionButton, styles.attendanceButton]} onPress={handleAttendance}>
          <Ionicons name="calendar-outline" size={28} color="white" />
          <Text style={styles.optionButtonText}>Attendance</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.optionButton, styles.leaveButton]} onPress={handleLeave}>
          <Ionicons name="log-out-outline" size={28} color="white" />
          <Text style={styles.optionButtonText}>Leaves</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.optionButton, styles.salaryButton]} onPress={handleSalarySlip}>
          <Ionicons name="document-text-outline" size={28} color="white" />
          <Text style={styles.optionButtonText}>Salary Slip</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.optionButton, styles.otherButton]}>
          <Ionicons name="ellipsis-horizontal-outline" size={28} color="white" />
          <Text style={styles.optionButtonText}>Other</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "black",
    paddingTop: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  navbarTitle: {
    color: "white",
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  manageContainer: {
    padding: 20,
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: "white",
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  manageTitle: {
    fontSize: 24,
    color: "#333",
    fontFamily: "Inter_700Bold",
  },
  manageSubtitle: {
    fontSize: 16,
    color: "#666",
    fontFamily: "Inter_400Regular",
    marginTop: 5,
  },
  employeeName: {
    fontSize: 18,
    color: "#4A90E2",
    fontFamily: "Inter_700Bold",
    marginTop: 10,
  },
  optionsContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  optionButton: {
    width: "100%",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "flex-start",
    marginVertical: 10,
    flexDirection: "row",
    gap: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  attendanceButton: {
    backgroundColor: "#34C759", // Green for Attendance
  },
  leaveButton: {
    backgroundColor: "#FF3B30", // Red for Leaves
  },
  salaryButton: {
    backgroundColor: "#4A90E2", // Blue for Salary Slip
  },
  otherButton: {
    backgroundColor: "#A8A8A8", // Gray for Other
  },
  optionButtonText: {
    color: "white",
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default EmployeeHome;