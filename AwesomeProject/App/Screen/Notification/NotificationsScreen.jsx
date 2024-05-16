// NotificationsScreen.jsx

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../Utils/Colors';
import { useUser } from '@clerk/clerk-expo';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Audio } from 'expo-av';
import { useNavigation, useFocusEffect } from '@react-navigation/native';


export default function NotificationsScreen() {
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const { user } = useUser();
  const navigation =useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      fetchReceivedMessages();
    }, [])
  );

  const fetchReceivedMessages = async () => {
    try {
      // Assuming userId is available in your context or state
      const email = user.primaryEmailAddress.emailAddress; // Replace '123' with actual userId
      console.log(email);
      // Fetch received messages from backend API
      const response = await fetch(`http://192.168.43.160:3000/api/fetchmessage/${email}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      // Update state with received messages
      setReceivedMessages(data.receivedMessages);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching received messages:', error);
      setLoading(false);
    }
  };

  const handleSenderPress = (message) => {
    setSelectedMessage(message);
  };

  const closeModal = () => {
    setSelectedMessage(null);
  };

  const handleAccept = async () => {
    try {
      // Send a request to backend to handle accept action
      const response = await fetch('http://192.168.43.160:3000/api/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          acceptorEmail: user.primaryEmailAddress.emailAddress,
          senderEmail: selectedMessage.Sender,
        }), // Pass the messageId, acceptorEmail, and senderEmail
      });
      const data = await response.json();
      console.log(data.message);
      closeModal(); // Close the modal after accepting
      navigation.navigate('ChatListScreen')
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };
  
  const renderMessageItem = ({ item }) => {
    return (
      <TouchableOpacity onPress={() => handleSenderPress(item)}>
        <View style={styles.senderContainer}>
          <Text style={styles.sender}>{item.Sender}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderModalContent = () => {
    if (!selectedMessage) return null;
    
    const { Content, ImageUri, AudioUri } = selectedMessage;
    console.log(AudioUri)
    const uri = ImageUri ? `data:image/jpeg;base64,${ImageUri}` : null;
    const urii = AudioUri?`data:audio/3gp;base64,${AudioUri}`:null;
    return (
      <View style={styles.modalContent}>
        <Text style={styles.modalText}>{Content}</Text>
        {ImageUri && <Image source={{ uri }} style={styles.modalImage} />}
        {AudioUri && (
          <TouchableOpacity onPress={() => handlePlayAudio(urii)}>
            <Text style={styles.audioLink}>Play Audio</Text>
          </TouchableOpacity>
        )}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.button, styles.acceptButton]} onPress={handleAccept}>
            <Text style={styles.buttonText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.declineButton]} >
            <Text style={styles.buttonText}>Decline</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={closeModal}>
          <Text style={styles.closeButton}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headCon}>
        <Text style={styles.header}>Received Messages</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color={Colors.blue} />
      ) : (
        <FlatList
          data={receivedMessages}
          renderItem={renderMessageItem}
          keyExtractor={(item) => item._id.toString()}
        />
      )}
      <Modal
        visible={!!selectedMessage}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          {renderModalContent()}
        </View>
      </Modal>
    </SafeAreaView>
  );
}
const handlePlayAudio = async (audioUri) => {
  try {
    const { sound } = await Audio.Sound.createAsync(
      { uri: audioUri },
      { shouldPlay: true }
    );
    // Store the sound object in state or a variable to manage playback
  } catch (error) {
    console.error('Error playing audio:', error);
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor:'white',
    alignItems: 'center',
  },
  headCon:{
    alignContent:'flex-start',
    width:'100%',
    height:hp('10%'),
  },
  audioLink: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
  header: {
    fontSize: 24,
    color:'white',
    fontWeight: 'bold',
    backgroundColor:Colors.bg,
    marginBottom: 20,
  },
  senderContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  sender: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    width: '80%',
    alignItems: 'center',
  },
  modalText: {
    marginBottom: 10,
    fontSize: 18,
  },
  modalImage: {
    width: 200,
    height: 200,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  closeButton: {
    color: 'blue',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  acceptButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
  },
  declineButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
  },
});
