import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ImageBackground, Image } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useUser } from '@clerk/clerk-expo';
import { SafeAreaView } from 'react-native-safe-area-context';


const ChatListScreen = () => {
  const { user } = useUser();
  const [chats, setChats] = useState([]);
  const navigation = useNavigation();
  const [socket, setSocket] = useState(null);

  const fetchChatList = async () => {
    try {
      const response = await fetch(`http://192.168.43.160:3000/api/chats/${user.primaryEmailAddress.emailAddress}`);
      const data = await response.json();
      setChats(data.chats);
    } catch (error) {
      console.error('Error fetching chat list:', error);
    }
  };

  const handleChatItemClick = (chat) => {
    
    navigation.navigate('ChatScreen', { chat });
  };

  // Fetch chat list on screen focus
  useFocusEffect(
    React.useCallback(() => {
      fetchChatList();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('./p2.jpg')}
        style={styles.backgroundImage}
      >
        <FlatList
          data={chats}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleChatItemClick(item)} style={styles.chatItem}>
              <View style={styles.avatarContainer}>
                <Image source={{ uri: `data:image/png;base64,${item.profile}` }} style={styles.avatar} />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.username}>{item.username}</Text>
                <Text style={styles.lastMessage} numberOfLines={1} ellipsizeMode="tail">
                  Last message here...
                </Text>
                {/* Add timestamp or icons here */}
              </View>
            </TouchableOpacity>
          )}
        />
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff', // White background for a professional look
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    borderRadius: 10, // Slightly rounded corners
    marginVertical: 8,
    marginHorizontal: 16,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#5cb85c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 99,
  },
  textContainer: {
    flex: 1,
    marginLeft: 15,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333', // Darker text color
  },
  lastMessage: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
});

export default ChatListScreen;
