// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCN-Hakwxe24U_Ph66jK0MfzyERHZRy99k",
  authDomain: "crowdify-9669.firebaseapp.com",
  projectId: "crowdify-9669",
  storageBucket: "crowdify-9669.appspot.com",
  messagingSenderId: "952308799218",
  appId: "1:952308799218:web:70df7506e3dff36e52a26b",
  measurementId: "G-JFMXMM5DP6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);