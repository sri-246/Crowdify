//ProfileScreen.jsx

import { View, Text, Image, FlatList, TouchableOpacity } from 'react-native'
import React from 'react'
import { useFonts } from 'expo-font';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons'
import { useUser, useClerk } from '@clerk/clerk-react'; // Import useClerk for authentication management
import Colors from '../../Utils/Colors';
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
  const [fontsLoaded] = useFonts({
    'qs': require('../../Utils/Quicksand-VariableFont_wght.ttf'),
  });
  const { user } = useUser();
  const { signOut } = useClerk(); // Get signOut function from useClerk
  const navigation = useNavigation();

  if (!fontsLoaded) {
    return <Image
      source={require('./../../../assets/images/HomeLogoIcon.png')}
      style={{ alignSelf: 'center', width: 55, height: 55 }}
    />;
  }
  
  const ProfileMenu = [
    {
      id: 1,
      name: "About",
      icon: 'information-circle',
    },
    {
      id: 2,
      name: "Help",
      icon: 'people-sharp',
    },
    {
      id: 3,
      name: "Setting",
      icon: 'settings',
    },
  ];

  const handleLogout = () => {
    signOut()
      .then(() => {
        // Navigate back to the Login screen
        console.log("logged out")
      })
      .catch(error => {
        console.error("Error signing out:", error);
      });
  };

  return (
    <SafeAreaView>
      <View style={{ padding: 20, paddingTop: 30, backgroundColor: Colors.db }}>
        <Text style={{ fontSize: 30, fontFamily: 'qs', color: Colors.white }}>Profile</Text>
        <View style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}>
          <Image source={{ uri: user.imageUrl }}
            style={{ width: 90, height: 90, borderRadius: 99 }} />
          <Text style={{ fontSize: 26, marginTop: 8, fontFamily: 'qs', color: Colors.white }}>{user.fullName}</Text>
          <Text style={{ fontSize: 18, marginTop: 8, fontFamily: 'qs', color: Colors.white }}>{user?.primaryEmailAddress.emailAddress}</Text>
        </View>
      </View>

      <View style={{ paddingTop: 60 }}>
        <FlatList
          data={ProfileMenu}
          renderItem={({ item, index }) => (
            <TouchableOpacity style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20, paddingHorizontal: 80 }}>
              <Ionicons name={item.icon} size={40} color="black" />
              <Text style={{ fontFamily: 'qs', fontSize: 20 }}>{item.name}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id.toString()} // Add key extractor for FlatList
        />
      </View>

      <TouchableOpacity onPress={handleLogout} style={{ alignSelf: 'center', backgroundColor: Colors.bg, padding: 10, borderRadius: 10, marginTop: 20 }}>
        <Text style={{ fontFamily: 'qs', fontSize: 20, color: Colors.white }}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}
