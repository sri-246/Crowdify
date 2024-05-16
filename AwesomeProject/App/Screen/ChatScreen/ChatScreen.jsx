// ChatScreen.jsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '@clerk/clerk-expo';
import io from 'socket.io-client';

const ChatScreen = ({ route, navigation }) => {
  const { user } = useUser();
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const { chat } = route.params;
  const recipient = chat.email;

  useEffect(() => {
    if (socket) {
      socket.disconnect();
    }
    const newSocket = io('https://crowdify.onrender.com');
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
      socket.on('chatmessage', (msg) => {
        setMessages(prevMessages => [...prevMessages, msg]);
      });
    }
  }, [socket]);

  const fetchPreviousChatMessages = async () => {
    try {
      const sender = user.primaryEmailAddress.emailAddress;
      const response = await fetch(`https://crowdify.onrender.com/api/chatmessages/${sender}/${recipient}`);
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

  // Clear messages when navigating away from the chat screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      setMessages([]);
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <SafeAreaView>
      <ScrollView>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          {messages.map((msg, index) => (
            <View key={index} style={{ alignSelf: msg.sender === user.primaryEmailAddress.emailAddress ? 'flex-end' : 'flex-start', margin: 5 }}>
              <Text style={{ backgroundColor: msg.sender === user.primaryEmailAddress.emailAddress ? '#5cb85c' : '#5bc0de', padding: 10, borderRadius: 10, color: 'white' }}>{msg.content}</Text>
            </View>
          ))}
        </ScrollView>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TextInput
            style={{ flex: 1, borderWidth: 1, borderColor: 'gray', borderRadius: 5, padding: 5 }}
            value={message}
            onChangeText={setMessage}
            placeholder="Type your message..."
          />
          <Button title="Send" onPress={sendMessage} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ChatScreen;
