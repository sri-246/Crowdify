import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../Utils/Colors';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useUser } from '@clerk/clerk-expo';
import { useSession } from './SessionContext';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import registerForPushNotificationsAsync from './registerForPushNotificationsAsync';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';

import { startRecording, stopRecording } from './audioUtils';
import { ScrollView } from 'react-native-gesture-handler';

const { width, height } = Dimensions.get('window');

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

        const response = await fetch(`http://192.168.43.16/api/user/location`, {
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
  const [successMessage, setSuccessMessage] = useState('');
  const { user } = useUser();
  const { isAuthenticated } = useSession();
  const [recording, setRecording] = useState(null);
  const [base64Audio, setBase64Audio] = useState(null);
  const [acceptedUsers, setAcceptedUsers] = useState([]);

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
      const img = user.imageUrl;
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

      fetch(`http://192.168.43.16/api/user`, {
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
      console.log("Image uri", result.assets[0].uri);
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
        audioUri: base64Audio,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setUploading(true);

      await fetch(`http://192.168.43.16/api/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });

      setTextInput('');
      setImageUri(null);
      setBase64Audio(null);
      setSuccessMessage('Message Sent');
      showAlert('Success', 'Message Sent');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const showAlert = (title, message) => {
    Alert.alert(
      title,
      message,
      [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
      { cancelable: false }
    );
  };
  useEffect(() => {
    // Assuming accepted users are fetched from some API or database
    // Replace this with actual fetching logic
    const mockAcceptedUsers = [
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Doe' },
      { id: 3, name: 'Alice' },
      {id: 4, name: 'Alicee' },
      {id: 5, name: 'Aliwce' },
    ];
    setAcceptedUsers(mockAcceptedUsers);
  }, []);

  const renderAcceptedUsers = () => {
    if (acceptedUsers.length === 0) {
      return <Text style={styles.noUsersText}>No one accepted till now</Text>;
    }

    return acceptedUsers.map(user => (
      <TouchableOpacity key={user.id} style={styles.acceptedUserItem}>
        <Text style={styles.acceptedUserName}>{user.name}</Text>
      </TouchableOpacity>
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Image source={require('./p2.jpg')} style={styles.scrollImage} />
          <Image source={require('./p2.jpg')} style={styles.scrollImage} />
          <Image source={require('./p2.jpg')} style={styles.scrollImage} />
        </ScrollView>
        <TextInput
          style={styles.textInput}
          placeholder="Type your message here..."
          value={textInput}
          onChangeText={setTextInput}
          textAlignVertical="top"
        />
        {imageUri && (
          <Image source={{ uri: imageUri }} style={styles.image} />
        )}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleImageSelection}>
            <LinearGradient
              colors={[Colors.gradientStart, Colors.gradientEnd]}
              style={styles.buttonGradient}
            >
              <FontAwesome name="image" size={22} color="white" />
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={recording ? () => stopRecording(recording, setRecording, setBase64Audio) : () => startRecording(setRecording)}
          >
            <LinearGradient
              colors={[Colors.gradientStart, Colors.gradientEnd]}
              style={styles.buttonGradient}
            >
              <FontAwesome
                name={recording ? "stop" : "microphone"}
                size={22}
                color="white"
                style= {{padding: width * 0.03}}
              />
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleSend}>
            <LinearGradient
              colors={[Colors.gradientEnd, Colors.gradientEnd]}
              style={styles.buttonGradient}
            >
              <FontAwesome name="send" size={22} color={Colors.white} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
        {uploading && <ActivityIndicator size="large" color="#FFA500" />}
      <View style={styles.acceptedUsersContainer}>
        <ScrollView>
          {renderAcceptedUsers()}
        </ScrollView>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
gradientBackground:{
  
},
  scrollView: {
    marginBottom: height * 0.04,
  },
  scrollImage: {
    width: width * 0.6,
    height: height * 0.20,
    borderRadius: width * 0.05,
    marginHorizontal: width * 0.02,
    marginVertical:width * 0.02
  },
  textInput: {
    height: height * 0.1,
    borderColor: Colors.gradientStart,
    borderWidth: width * 0.01,
    borderRadius: width * 0.05,
    backgroundColor: '#fff',
    paddingHorizontal: width * 0.03,
    paddingVertical: width * 0.03,
    marginHorizontal: width * 0.02,
    marginBottom: height * 0.04,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    marginHorizontal: width * 0.01,
  },
  buttonGradient: {
    borderRadius: width * 0.03,
    padding: width * 0.03,
    alignItems: 'center',
  },
  noUsersText: {
    textAlign: 'center',
    fontSize: 16,
    color: Colors.black,
    marginTop: 20,
  },
  acceptedUsersContainer: {
    flex: 1,
    backgroundColor: Colors.lightGray,
    marginHorizontal:40,
    paddingVertical: 10,
    maxHeight:height * 0.3,
    borderRadius:width * 0.05,
    borderWidth:5,
    borderColor:'pink'
  },
  acceptedUserItem: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray,
  },
  acceptedUserName: {
    fontSize: 18,
    color: Colors.black,
  },
});
