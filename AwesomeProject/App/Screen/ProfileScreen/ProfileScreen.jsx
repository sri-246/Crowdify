import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import React from 'react';
import { useFonts } from 'expo-font';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUser, useClerk } from '@clerk/clerk-react';
import Colors from '../../Utils/Colors';

const { height } = Dimensions.get('window');

export default function ProfileScreen() {
  const [fontsLoaded] = useFonts({
    'qs': require('../../Utils/Quicksand-VariableFont_wght.ttf'),
  });
  const { user } = useUser();
  const { signOut } = useClerk();

  if (!fontsLoaded) {
    return <Image
      source={require('./../../../assets/images/HomeLogoIcon.png')}
      style={{ alignSelf: 'center', width: 55, height: 55 }}
    />;
  }

  const handleLogout = () => {
    signOut()
      .then(() => {
        console.log("logged out");
      })
      .catch(error => {
        console.error("Error signing out:", error);
      });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Ionicons name="menu" size={24} color={Colors.white} />
          <View style={styles.iconGroup}>
            <Ionicons name="chatbubble-ellipses-outline" size={24} color={Colors.white} style={styles.icon} />
            <Ionicons name="notifications-outline" size={24} color={Colors.white} />
          </View>
        </View>
        <Image source={{ uri: user.imageUrl }} style={styles.profileImage} />
        <View style={styles.userInfoContainer}>
          <Text style={styles.userName}>{user.fullName}</Text>
          <TouchableOpacity style={styles.followButton}>
            <Text style={styles.followButtonText}>+ Follow</Text>
          </TouchableOpacity>
          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>4.8</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>1024</Text>
              <Text style={styles.statLabel}>Heat</Text>
            </View>
          </View>
          <View style={styles.contactInfo}>
            <Ionicons name="location-outline" size={20} color={Colors.white} />
            <Text style={styles.contactText}>281 Piper Ave. Utica, NY 13501</Text>
          </View>
          <Text style={styles.emailText}>{user?.primaryEmailAddress.emailAddress}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.db,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  iconGroup: {
    flexDirection: 'row',
  },
  icon: {
    marginHorizontal: 10,
  },
  profileImage: {
    width: '100%',
    height: height / 2,
  },
  userInfoContainer: {
    padding: 20,
  },
  userName: {
    fontSize: 26,
    fontFamily: 'qs',
    color: Colors.white,
    textAlign: 'center',
  },
  followButton: {
    alignSelf: 'center',
    backgroundColor: Colors.pink,
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 10,
  },
  followButtonText: {
    fontSize: 18,
    color: Colors.white,
    fontFamily: 'qs',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    color: Colors.white,
    fontFamily: 'qs',
  },
  statLabel: {
    fontSize: 16,
    color: Colors.white,
    fontFamily: 'qs',
  },
  contactInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  contactText: {
    fontSize: 18,
    color: Colors.white,
    fontFamily: 'qs',
    marginLeft: 10,
  },
  emailText: {
    fontSize: 18,
    color: Colors.white,
    fontFamily: 'qs',
    textAlign: 'center',
    marginTop: 10,
  },
  logoutButton: {
    backgroundColor: Colors.bg,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 40,
  },
  logoutButtonText: {
    fontSize: 20,
    color: Colors.white,
    fontFamily: 'qs',
  },
});