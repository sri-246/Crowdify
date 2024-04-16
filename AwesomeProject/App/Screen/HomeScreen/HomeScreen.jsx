import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import Colors from '../../Utils/Colors'; // Import your Colors file
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useUser } from '@clerk/clerk-expo';

export default function HomeScreen() {
  const [imageUri, setImageUri] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { user } = useUser();

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
      console.log("acna",result.assets[0].uri)
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
        sender: user.fullName,
        content: textInput,
        imageUri: base64Image,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setUploading(true);

      await fetch('http://172.17.18.148:3000/api/message', {
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
    <View style={styles.container}>
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
    </View>
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
