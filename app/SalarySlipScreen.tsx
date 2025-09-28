import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

const SalarySlipScreen = () => {
  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bonus, setBonus] = useState(0);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const storedEmployeeId = await AsyncStorage.getItem("employeeId");
        if (!storedEmployeeId) {
          console.error("No employee ID found.");
          return;
        }

        const employeeDoc = await getDoc(doc(db, "employees", storedEmployeeId));

        if (employeeDoc.exists()) {
          const data = employeeDoc.data();

          // Ensure salary is numeric and generate random bonus
          const numericSalary = Number(data.salary) || 0;
          const randomBonus = Math.floor(Math.random() * (10000 - 5000 + 1)) + 5000;

          setEmployeeData({
            name: data.name,
            position: data.position,
            salary: numericSalary,
            status: data.salaryStatus || "Unpaid", // Default to "Unpaid"
            totalSalary: numericSalary + randomBonus,
          });
          setBonus(randomBonus);
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching employee data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeData();
  }, []);

  const generatePdf = async () => {
    if (!employeeData) return;

    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; color: #333; }
            .detail { display: flex; justify-content: space-between; margin-bottom: 10px; }
            .label { font-weight: bold; color: #555; }
            .value { color: #333; }
            .totalSalary { font-weight: bold; color: #4CAF50; }
            .status { display: flex; justify-content: space-between; margin-top: 20px; }
            .statusValue.paid { color: #4CAF50; }
            .statusValue.unpaid { color: #F44336; }
          </style>
        </head>
        <body>
          <h1>Salary Slip</h1>
          <div class="detail">
            <span class="label">Name:</span>
            <span class="value">${employeeData.name}</span>
          </div>
          <div class="detail">
            <span class="label">Position:</span>
            <span class="value">${employeeData.position}</span>
          </div>
          <div class="detail">
            <span class="label">Salary:</span>
            <span class="value">₹${employeeData.salary.toLocaleString()}</span>
          </div>
          <div class="detail">
            <span class="label">Bonus:</span>
            <span class="value">₹${bonus.toLocaleString()}</span>
          </div>
          <div class="detail">
            <span class="label">Total Salary:</span>
            <span class="totalSalary">₹${employeeData.totalSalary.toLocaleString()}</span>
          </div>
          <div class="status">
            <span class="label">Salary Status:</span>
            <span class="statusValue ${employeeData.status === "Paid" ? "paid" : "unpaid"}">
              ${employeeData.status}
            </span>
          </div>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri, { mimeType: "application/pdf", dialogTitle: "Download Salary Slip" });
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Fetching Salary Details...</Text>
      </View>
    );
  }

  if (!employeeData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error fetching salary details.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Salary Slip</Text>

      <View style={styles.detailContainer}>
        <Text style={styles.label}>Name:</Text>
        <Text style={styles.value}>{employeeData.name}</Text>
      </View>

      <View style={styles.detailContainer}>
        <Text style={styles.label}>Position:</Text>
        <Text style={styles.value}>{employeeData.position}</Text>
      </View>

      <View style={styles.detailContainer}>
        <Text style={styles.label}>Salary:</Text>
        <Text style={styles.value}>₹{employeeData.salary.toLocaleString()}</Text>
      </View>

      <View style={styles.detailContainer}>
        <Text style={styles.label}>Bonus:</Text>
        <Text style={styles.value}>₹{bonus.toLocaleString()}</Text>
      </View>

      <View style={styles.detailContainer}>
        <Text style={styles.label}>Total Salary:</Text>
        <Text style={styles.totalSalary}>₹{employeeData.totalSalary.toLocaleString()}</Text>
      </View>

      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Salary Status:</Text>
        <Text style={[styles.statusValue, employeeData.status === "Paid" ? styles.paid : styles.unpaid]}>
          {employeeData.status}
        </Text>
      </View>

      <TouchableOpacity style={styles.downloadButton} onPress={generatePdf}>
        <Text style={styles.downloadButtonText}>Download Salary Slip</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SalarySlipScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  detailContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#555",
  },
  value: {
    fontSize: 16,
    color: "#333",
  },
  totalSalary: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#555",
  },
  statusValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  paid: {
    color: "#4CAF50",
  },
  unpaid: {
    color: "#F44336",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    marginTop: 10,
    color: "#555",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: "#F44336",
  },
  downloadButton: {
    backgroundColor: "#4A90E2",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  downloadButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});