import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useUser } from '@clerk/clerk-expo';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../../Utils/Colors';

const { width, height } = Dimensions.get('window');

const ChatListScreen = () => {
  const { user } = useUser();
  const [chats, setChats] = useState([]);
  const navigation = useNavigation();

  const fetchChatList = async () => {
    try {
      const response = await fetch(
        `http://192.168.43.16/api/chats/${user.primaryEmailAddress.emailAddress}`
      );
      const data = await response.json();
      setChats(data.chats);
    } catch (error) {
      console.error('Error fetching chat list:', error);
    }
  };

  const handleChatItemClick = (chat) => {
    navigation.navigate('ChatScreen', { chat });
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchChatList();
    }, [])
  );

  return (
    <LinearGradient colors={[Colors.gradientStart, Colors.gradientEnd]} style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Chats</Text>
        </View>
        <ScrollView horizontal style={styles.horizontalScroll} contentContainerStyle={styles.participantList}>
          {chats.map((chat, index) => (
            <TouchableOpacity key={index} onPress={() => handleChatItemClick(chat)} style={styles.participantItem}>
              <Image source={{ uri: `data:image/png;base64,${chat.profile}` }} style={styles.participantAvatar} />
              <Text style={styles.participantName}>{chat.username}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <View style={styles.chatListWrapper}>
        <View style={styles.chatListContainer}>
          <FlatList
            data={chats}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleChatItemClick(item)} style={styles.chatItem}>
                <Image source={{ uri: `data:image/png;base64,${item.profile}` }} style={styles.chatAvatar} />
                <View style={styles.textContainer}>
                  <Text style={styles.username}>{item.username}</Text>
                  <Text style={styles.lastMessage} numberOfLines={1} ellipsizeMode="tail">
                    Last message here...
                  </Text>
                </View>
                <Text style={styles.time}>{new Date(item.lastMessageTime).toLocaleTimeString()}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    backgroundColor: 'transparent',
    paddingBottom: height * 0.01,
  },
  header: {
    padding: width * 0.04,
    marginTop: height * 0.03,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: width * 0.06,
    fontWeight: 'bold',
    color: Colors.white,
  },
  horizontalScroll: {
    paddingVertical: height * 0.015,
  },
  participantList: {
    alignItems: 'center',
  },
  participantItem: {
    alignItems: 'center',
    marginHorizontal: width * 0.025,
  },
  participantAvatar: {
    width: width * 0.15,
    height: width * 0.15,
    borderRadius: width * 0.075,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  participantName: {
    marginTop: height * 0.01,
    color: Colors.white,
    fontSize: width * 0.03,
  },
  chatListWrapper: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  chatListContainer: {
    flex: 1,
    backgroundColor: Colors.white,
    borderTopLeftRadius: width * 0.075,
    borderTopRightRadius: width * 0.075,
    paddingTop: height * 0.01,
    marginTop: -height * 0.0, // Adjust this value to fit your design
    overflow: 'hidden',
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: width * 0.04,
    backgroundColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  chatAvatar: {
    width: width * 0.125,
    height: width * 0.125,
    borderRadius: width * 0.0625,
    marginRight: width * 0.025,
  },
  textContainer: {
    flex: 1,
  },
  username: {
    fontSize: width * 0.04,
    fontWeight: 'bold',
    color: Colors.black,
  },
  lastMessage: {
    fontSize: width * 0.035,
    color: Colors.black,
    marginTop: height * 0.007,
  },
  time: {
    fontSize: width * 0.025,
    color: Colors.black,
  },
});

export default ChatListScreen;