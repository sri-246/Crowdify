//HomeScreen.jsx

import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import Colors from '../../Utils/Colors';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useUser } from '@clerk/clerk-expo';
import { useSession } from './SessionContext';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import {serverIp} from "@env"
import AsyncStorage from '@react-native-async-storage/async-storage';
import registerForPushNotificationsAsync from './registerForPushNotificationsAsync';


const LOCATION_TASK_NAME = 'background-location-tjgask';


TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Background location task error:', error.message);
    return;
  }
  if (data) {
    
    const { locations } = data;

    const userId = await AsyncStorage.getItem('userId');
    console.log("mailll :",userId)
    console.log('Received background location update:');
    locations.forEach(async (location) => {
      try {
        const locationUpdate ={
          //need unique identifier of user,
          email:userId,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        
         // Add any other relevant data you want to send to the backend
          }

      const response = await fetch(`http://${serverIp}/api/user/location`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(locationUpdate),
        });

        const responseData = await response.json();
        console.log('Location sent to backend:', responseData);
      } catch (error) {
        console.error('Error sending location to backend:', error);
      }
    });
  }
});

export default function HomeScreen() {
  const [imageUri, setImageUri] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const {user} = useUser();
  const { isAuthenticated } = useSession();

  useEffect(() => {
    if (isAuthenticated) {
      getLocation();
    }
    return () => {
      stopBackgroundLocationUpdates();
    };
  }, [isAuthenticated]);

  const startBackgroundLocationUpdates = async () => {
    try {
      await AsyncStorage.setItem('userId', user.primaryEmailAddress.emailAddress);

      let { status } = await Location.requestBackgroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Background location permission denied');
        return;
      }
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000, // Update interval in milliseconds
        distanceInterval: 0, // Minimum distance between updates in meters
        deferredUpdatesInterval: 5000, // Interval to defer updates when the app is in the background
        deferredUpdatesDistance: 0, // Distance to defer updates when the app is in the background
        pausesUpdatesAutomatically: false,// Allow location updates to continue when the app is in the background
        
      });
      console.log('Background location updates started');
    } catch (error) {
      console.error('Error starting background location updates:', error);
    }
  };
  
  const stopBackgroundLocationUpdates = async () => {
    try {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      console.log('Background location updates stopped');
    } catch (error) {
      console.error('Error stopping background location updates:', error);
    }
  };

  const getLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        return;
      }

      let { status: status1 } = await Notifications.requestPermissionsAsync();
      if (status1 !== 'granted') {
        console.log('Notification permission denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      if (location) {
        sendLocation(location);
        startBackgroundLocationUpdates();
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const sendLocation = async (location) => {
    try {
      const pushToken = await registerForPushNotificationsAsync();

      const userData = { 
        username: user.fullName,
        email: user.primaryEmailAddress.emailAddress,
        location: location,
        pushToken: pushToken
      };

      console.log("Data Collected", userData);

      fetch(`http://${serverIp}/api/user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })
        .then(response => response.json())
        
        .then(data => {
          console.log('Location Sent Success:', data);
          // Handle success response from backend if needed
        })
        .catch(error => {
          console.error('Error sending location:', error);
          // Handle error from backend if needed
        });
    } catch (err) {
      console.error("OAuth error", err);
    }
  };

  const handleImageSelection = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.cancelled) {
        setImageUri(result.assets[0].uri);
      }
      console.log("Image uri", result.assets[0].uri)
    } catch (error) {
      console.error('Error selecting image:', error);
    }
  };

  const handleSend = async () => {
    try {
      setLoading(true);

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        return;
      }
      let location = await Location.getCurrentPositionAsync({});

      let base64Image = null;
      if (imageUri) {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const reader = new FileReader();
        await new Promise((resolve, reject) => {
          reader.onload = () => resolve();
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        base64Image = reader.result.split(',')[1];
      }

      const messageData = {
        sender: user.primaryEmailAddress.emailAddress,
        content: textInput,
        imageUri: base64Image,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setUploading(true);

      await fetch(`http://${serverIp}/api/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });

      setTextInput('');
      setImageUri(null);
      setLoading(false);
      setUploading(false);
      alert('Message sent successfully!');
    } catch (error) {
      console.error('Error sending message:', error);
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Type your message..."
        onChangeText={setTextInput}
        value={textInput}
      />
      <TouchableOpacity style={styles.button} onPress={handleImageSelection}>
        <Text style={styles.buttonText}>Select Image</Text>
      </TouchableOpacity>
      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}
      {loading && <ActivityIndicator size="large" color={Colors.blue} />}
      {uploading && <Text>Uploading...</Text>}
      <TouchableOpacity style={[styles.button, { backgroundColor: Colors.bg }]} onPress={handleSend}>
        <Text style={styles.buttonText}>Send</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    width: '80%',
  },
  button: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  image: {
    width: '80%',
    height: 200,
    marginBottom: 20,
  },
});
