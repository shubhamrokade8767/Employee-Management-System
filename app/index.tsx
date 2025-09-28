import { ImageBackground, Text, View, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from 'expo-router';


export default function Index() {
  const router = useRouter();

  const onContinue = () => {
    router.navigate("/loginManager");
  };

  const onregister = () => {
    router.navigate("/loginEmployee");
  };
  return (
    <View style={styles.container}>
      {/* Image */}
      <Image
        source={require("@/assets/images/profile.webp")} // Replace with your image path
        style={styles.image}
      />
      <Text style={styles.subText}>Login</Text>

      {/* Buttons using TouchableOpacity */}
      <TouchableOpacity
        style={styles.button}
        onPress={onContinue}
      >
        <Text style={styles.buttonText}>Manager</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={onregister}
      >
        <Text style={styles.buttonText}>Employee</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F5F5F5', // Light background for contrast
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: 10, // Increased margin for better spacing
    borderRadius: 75, // Make the image circular
  },
  button: {
    backgroundColor: '#000000', // Black background color
    paddingVertical: 15, // Increased padding for better touch area
    paddingHorizontal: 40, // Wider buttons
    borderRadius: 25, // More rounded corners
    marginBottom: 25, // Space between buttons
    width: '80%', // Set button width
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000', // Shadow for depth
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // Elevation for Android
  },
  buttonText: {
    color: '#FFFFFF', // White text color
    fontSize: 18, // Slightly larger font size
    fontWeight: 'bold',
    textTransform: 'uppercase', // Uppercase text for emphasis
  },
  subText: {
    marginTop: 0, // Space between button and text
    marginBottom: 20, // Space before the next button
    color: '#666', // Subtle text color
    fontSize: 22,
    fontWeight:800
  },
});

export default Index;