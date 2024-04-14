import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import React from 'react';
import Colors from '../../Utils/Colors'; // Import your Colors file

export default function HomeScreen() {
  const [imageUri, setImageUri] = React.useState(null);
  const [textInput, setTextInput] = React.useState('');

  const handleImageSelection = async () => {
    // Implement image selection logic here
  };

  const handleSend = async () => {
    // Implement send functionality here
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
