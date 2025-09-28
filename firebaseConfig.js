// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, setDoc, doc } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDnld8KukEbC70tOV7MlBkvn4NbomUA2C8",
  authDomain: "employeemanagementsystem-cbeac.firebaseapp.com",
  projectId: "employeemanagementsystem-cbeac",
  storageBucket: "employeemanagementsystem-cbeac.firebasestorage.app",
  messagingSenderId: "817100875041",
  appId: "1:817100875041:web:c642e1e150dd83982b0a60"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };