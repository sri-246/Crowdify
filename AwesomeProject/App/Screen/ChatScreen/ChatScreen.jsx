import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, ScrollView, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '@clerk/clerk-expo';
import io from 'socket.io-client';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../Utils/Colors';
import * as Location from 'expo-location';

const ChatScreen = ({ route, navigation }) => {
  const { user } = useUser();
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [locationRequests, setLocationRequests] = useState([]);
  const { chat } = route.params;
  const recipient = chat.email;

  useEffect(() => {
    if (socket) {
      socket.disconnect();
    }
    const newSocket = io('http://172.17.9.215:4000');
    setSocket(newSocket);
    fetchPreviousChatMessages();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [route.params.socket]);

  useEffect(() => {
    if (socket) {
      socket.emit('register', user.primaryEmailAddress.emailAddress);
      socket.on('chatmessage', (msg) => {
        setMessages((prevMessages) => [...prevMessages, msg]);
      });

      socket.on('locationrequest', (request) => {
        if (request.recipient === user.primaryEmailAddress.emailAddress) {
          setLocationRequests((prevRequests) => [...prevRequests, request]);
        }
      });

      socket.on('locationresponse', async (response) => {
        console.log("respones",response.recipient,response.latitude)
        console.log("curUser",user.primaryEmailAddress.emailAddress)
        if (response.recipient === user.primaryEmailAddress.emailAddress) {
          Alert.alert('Location Received', `Latitude: ${response.latitude}, Longitude: ${response.longitude}`);
          const senderLocation = await getCurrentLocation();
          console.log('Sender',senderLocation)
          const recipientLocation = {
            latitude: response.latitude,
            longitude: response.longitude,
          };

          if (senderLocation && recipientLocation) {
            console.log('Navigating to MapScreen with locations:', { senderLocation, recipientLocation });
            navigateToMapScreen(senderLocation, recipientLocation);
          } else {
            console.error('One of the locations is undefined:', { senderLocation, recipientLocation });
          }
        }
      });
    }
  }, [socket]);

  const fetchPreviousChatMessages = async () => {
    try {
      const sender = user.primaryEmailAddress.emailAddress;
      const response = await fetch(`http://192.168.43.16/api/chatmessages/${sender}/${recipient}`);
      const data = await response.json();
      const serializedData = JSON.parse(JSON.stringify(data)); // Serialize data
      setMessages(serializedData);
    } catch (error) {
      console.error('Error fetching chat messages:', error);
    }
  };

  const sendMessage = () => {
    if (message.trim() !== '') {
      const newMessage = {
        sender: user.primaryEmailAddress.emailAddress,
        recipient: recipient,
        content: message,
      };
      if (socket) {
        socket.emit('chatmessage', newMessage);
      }
      setMessage('');
    }
  };

  const requestLocation = async () => {
    const senderLocation = await getCurrentLocation();
    if (senderLocation) {
      const newRequest = {
        sender: user.primaryEmailAddress.emailAddress,
        recipient: recipient,
        senderLocation: senderLocation,
      };
      if (socket) {
        socket.emit('locationrequest', newRequest);
      }
    } else {
      console.error('Cannot request location. Sender location is undefined');
    }
  };
  

  const respondToLocationRequest = async (request) => {
    const location = await getCurrentLocation();
    const response = {
      sender: user.primaryEmailAddress.emailAddress,
      recipient: request.sender,
      latitude: location?.latitude,
      longitude: location?.longitude,
    };
    if (socket) {
      socket.emit('locationresponse', response);
    }
    setLocationRequests((prevRequests) => prevRequests.filter((r) => r !== request));

    if (location) {
      const senderLocation = { latitude: location.latitude, longitude: location.longitude };
      const recipientLocation = request.senderLocation;//here it is trying to access sender location
      if (senderLocation && recipientLocation) {
        console.log('Navigating to MapScreen with locations:', { senderLocation, recipientLocation });
        navigateToMapScreen(senderLocation, recipientLocation);
      } else {
        console.error('One of the locations is undefined:', { senderLocation, recipientLocation });
      }
    }
  };

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Location Access Denied', 'Permission to access location was denied');
        return null;
      }

      let location = await Location.getCurrentPositionAsync({});

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      Alert.alert('Location Error', 'Error fetching current location');
      console.error('Error fetching current location:', error);
      return null;
    }
  };

  const navigateToMapScreen = (senderLocation, recipientLocation) => {
    if (senderLocation && recipientLocation) {
      navigation.navigate('MapScreen', {
        senderLocation,
        recipientLocation,
      });
    } else {
      console.error('Cannot navigate to MapScreen. One of the locations is undefined:', { senderLocation, recipientLocation });
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      setMessages([]);
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <LinearGradient colors={[Colors.gradientStart, Colors.white]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Image source={{ uri: `data:image/png;base64,${chat.profile}` }} style={styles.headerAvatar} />
          <Text style={styles.headerName}>{chat.username}</Text>
        </View>
        <ScrollView contentContainerStyle={styles.messageContainer}>
          {messages.map((msg, index) => (
            <View
              key={index}
              style={{
                alignSelf: msg.sender === user.primaryEmailAddress.emailAddress ? 'flex-end' : 'flex-start',
                backgroundColor: msg.sender === user.primaryEmailAddress.emailAddress ? '#5cb85c' : '#5bc0de',
                padding: 10,
                borderRadius: 10,
                margin: 5,
              }}
            >
              <Text style={{ color: 'white' }}>{msg.content}</Text>
            </View>
          ))}
        </ScrollView>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="Type your message..."
            placeholderTextColor="#ccc"
          />
          <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
            <Ionicons name="send" size={24} color="white" />
          </TouchableOpacity>
        </View>
        <View style={styles.locationButtons}>
          <Button title="Request Location" onPress={requestLocation} color={Colors.gradientStart} />
          {locationRequests.map((request, index) => (
            <View key={index} style={styles.locationRequest}>
              <Text style={styles.locationRequestText}>{request.sender} is requesting your location</Text>
              <Button title="Share Location" onPress={() => respondToLocationRequest(request)} />
            </View>
          ))}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.white,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  headerName: {
    marginLeft: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  messageContainer: {
    flexGrow: 1,
    padding: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  input: {
    flex: 1,
    height: 40,
    paddingHorizontal: 10,
    borderColor: Colors.gradientStart,
    borderWidth: 1,
    borderRadius: 20,
    color: 'black',
  },
  sendButton: {
    marginLeft: 10,
    padding: 10,
    backgroundColor: Colors.gradientEnd,
    borderRadius: 20,
  },
  locationButtons: {
    padding: 10,
  },
  locationRequest: {
    marginTop: 10,
  },
  locationRequestText: {
    color: 'black',
    marginBottom: 5,
  },
});

export default ChatScreen;
