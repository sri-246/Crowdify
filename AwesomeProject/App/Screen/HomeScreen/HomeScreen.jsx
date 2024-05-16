// HomeScreen.jsx

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
import AsyncStorage from '@react-native-async-storage/async-storage';
import registerForPushNotificationsAsync from './registerForPushNotificationsAsync';
import { Audio } from 'expo-av'; // Import Audio module from expo-av

const LOCATION_TASK_NAME = 'background-location-tjgask';

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Background location task error:', error.message);
    return;
  }
  if (data) {
    const { locations } = data;

    const userId = await AsyncStorage.getItem('userId');
    console.log("mailll :", userId)
    console.log('Received background location update:');
    locations.forEach(async (location) => {
      try {
        const locationUpdate = {
          email: userId,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        }

        const response = await fetch(`https://crowdify.onrender.com/api/user/location`, {
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
  const { user } = useUser();
  const { isAuthenticated } = useSession();
  const [recording, setRecording] = useState(null); // State to manage recording
  const [base64Audio, setBase64Audio] = useState(null); // State to store base64 audio

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
        timeInterval: 5000,
        distanceInterval: 0,
        deferredUpdatesInterval: 5000,
        deferredUpdatesDistance: 0,
        pausesUpdatesAutomatically: false,
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
      const img = user.imageUrl
      const response = await fetch(img);
      const blob = await response.blob();
      const reader = new FileReader();
      await new Promise((resolve, reject) => {
        reader.onload = () => resolve();
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      const b64Image = reader.result.split(',')[1];
      const userData = {
        username: user.fullName,
        email: user.primaryEmailAddress.emailAddress,
        profile: b64Image,
        location: location,
        pushToken: pushToken
      };

      console.log("Data Collected", userData);

      fetch(`https://crowdify.onrender.com/api/user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })
        .then(response => response.json())
        .then(data => {
          console.log('Location Sent Success:', data);
        })
        .catch(error => {
          console.error('Error sending location:', error);
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
  
  const startRecording = async () => {
    console.log('Starting recording..');
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to record audio not granted');
        return;
      }
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await recording.startAsync();
      setRecording(recording);
    } catch (error) {
      console.error('Failed to start recording', error);
    }
  };
 
  const stopRecording = async () => {
    console.log('Stopping recording..');
    setRecording(undefined);
    await recording.stopAndUnloadAsync();
    const uri1 = recording.getURI(); // Get the URI of the recorded audio
    console.log('Recording stopped and stored at', uri1);
  
    // Convert the recorded audio file to base64
    try {
      const response = await fetch(uri1);
      const audioBlob = await response.blob();
      const reader = new FileReader();
      await new Promise((resolve, reject) => {
        reader.onload = () => resolve();
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
      });
      const base64Audio = reader.result.split(',')[1]; //this
      setBase64Audio(base64Audio);
      //log
      
      // Now you can do something with the base64Audio, such as storing it in state or sending it to the backend
    } catch (error) {
      console.error('Error converting audio to base64:', error);
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
        audioUri: base64Audio,// want to be sent here
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
  
      setUploading(true);
  
      await fetch(`https://crowdify.onrender.com/api/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });
  
      setTextInput('');
      setImageUri(null);
      setRecording(null);
      setBase64Audio(null);
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
      <TouchableOpacity
        style={[styles.button, recording ? { backgroundColor: 'red' } : null]}
        onPressIn={startRecording} // Start recording when pressed
        onPressOut={stopRecording} // Stop recording when released
      >
        <Text style={styles.buttonText}>{recording ? 'Recording...' : 'Record Audio'}</Text>
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

