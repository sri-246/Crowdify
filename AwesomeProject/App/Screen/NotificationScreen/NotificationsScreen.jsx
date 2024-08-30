import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../Utils/Colors';
import { useUser } from '@clerk/clerk-expo';
import { Audio } from 'expo-av';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { MotiView, ScrollView } from 'moti';
import { useFonts } from 'expo-font';

const { width: screenWidth } = Dimensions.get('window');

export default function NotificationsScreen() {
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [fontsLoaded] = useFonts({
    'pjs': require('../../Utils/PlusJakartaSans-VariableFont_wght.ttf'),
    "pjsBold": require('../../Utils/PlusJakartaSans-Bold.ttf'),
  });
  const { user } = useUser();
  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      fetchReceivedMessages();
    }, [])
  );

  const fetchReceivedMessages = async () => {
    try {
      const email = user.primaryEmailAddress.emailAddress;
      const response = await fetch(`http://192.168.43.16/api/fetchmessage/${email}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
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
      const response = await fetch('http://192.168.43.16/api/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          acceptorEmail: user.primaryEmailAddress.emailAddress,
          senderEmail: selectedMessage.Sender.email,
        }),
      });
      const data = await response.json();
      closeModal();
      navigation.navigate('ChatListScreen');
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const renderMessageItem = ({ item, index }) => {
    return (
      <MotiView
        style={styles.listContainer}
        from={{ opacity: 0, translateY: 50 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 1000 + index * 200 }}
        key={item._id.toString()} // Adding key to ensure uniqueness
      >
        <TouchableWithoutFeedback onPress={() => handleSenderPress(item)}>
          <View>
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: `data:image/png;base64,${item.Sender.profile}` }}
                style={styles.image}
              />
            </View>
            <Text style={styles.username} numberOfLines={1}>{item.Sender.username}</Text>
            <Text style={styles.content} numberOfLines={2}>{item.Content}</Text>
            <TouchableWithoutFeedback onPress={() => handleSenderPress(item)}>
              <View style={styles.button}>
                <Text style={styles.buttonText}>View Message</Text>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </MotiView>
    );
  };

  const renderModalContent = () => {
    if (!selectedMessage) return null;
    const { Content, ImageUri, AudioUri } = selectedMessage;
    const imageUri = ImageUri ? `data:image/jpeg;base64,${ImageUri}` : null;
    const audioUri = AudioUri ? `data:audio/3gp;base64,${AudioUri}` : null;

    return (
      <View style={styles.modalContent}>
        <Text style={styles.modalText}>{Content}</Text>
        {ImageUri && <Image source={{ uri: imageUri }} style={styles.modalImage} />}
        {AudioUri && (
          <TouchableWithoutFeedback onPress={() => handlePlayAudio(audioUri)}>
            <Text style={styles.audioLink}>Play Audio</Text>
          </TouchableWithoutFeedback>
        )}
        <View style={styles.buttonContainer}>
          <TouchableWithoutFeedback onPress={handleAccept}>
            <View style={[styles.button, styles.acceptButton]}>
              <Text style={styles.buttonText}>Accept</Text>
            </View>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={() => console.log('Decline')}>
            <View style={[styles.button, styles.declineButton]}>
              <Text style={styles.buttonText}>Decline</Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
        <TouchableWithoutFeedback onPress={closeModal}>
          <Text style={styles.closeButton}>Close</Text>
        </TouchableWithoutFeedback>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'right', 'left']}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Requests</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color={Colors.blue} style={{ alignSelf: 'center', width: 55, height: 55 }} />
      ) : (
        <FlatList
          data={receivedMessages}
          renderItem={renderMessageItem}
          keyExtractor={(item) => item._id.toString()}
          numColumns={2}
          showsVerticalScrollIndicator={false}
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
  } catch (error) {
    console.error('Error playing audio:', error);
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  headerContainer: {
    backgroundColor: 'honeydew',
    paddingVertical: 25,
    borderBottomLeftRadius: 65,
    borderBottomRightRadius: 65,
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontFamily: 'pjs',
    color: 'black',
  },
  listContainer: {
    width: screenWidth / 2 - 20,
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 20,
  },
  imageContainer: {
    margin: 15,
    borderRadius: 10,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: undefined,
    aspectRatio: 1,
  },
  username: {
    color: 'black',
    fontFamily: 'pjs',
    marginHorizontal: 15,
  },
  content: {
    color: '#666',
    fontFamily: 'pjs',
    marginHorizontal: 15,
    minHeight:35,
    marginVertical: 10,
  },
  button: {
    backgroundColor: 'honeydew',
    padding: 10,
    margin: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: 'black',
    textAlign: 'center',
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
    width: '80%',
    alignItems: 'center',
  },
  modalText: {
    marginBottom: 10,
    fontSize: 18,
    fontFamily: 'pjs',
  },
  modalImage: {
    width: 200,
    height: 200,
    marginBottom: 10,
  },
  audioLink: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  closeButton: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  acceptButton: {
    backgroundColor: 'green',
    padding: 10,
    margin: 15,
    borderRadius: 10,
  },
  declineButton: {
    backgroundColor: 'red',
    padding: 10,
    margin: 15,
    borderRadius: 10,
  },
});


