import { View, Text } from 'react-native'
import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../Screen/HomeScreen/HomeScreen';
import ChatScreen from '../Screen/ChatScreen/ChatScreen';
import ProfileScreen from '../Screen/ProfileScreen/ProfileScreen';
import { FontAwesome5 } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import Colors from '../Utils/Colors';


const Tab = createBottomTabNavigator();

export default function TabNavigation() {
  return (
    <Tab.Navigator 
    screenOptions={{headerShown:false}}
    >
      <Tab.Screen name='home' component={HomeScreen}
      options={{
       tabBarLabel:({color})=>(
        <Text></Text>
       ),
       tabBarIcon:({color,size})=>(
        <FontAwesome5 name="home" size={24} style={{color:Colors.bg}} />
       )
      }
      }/>
      <Tab.Screen name='chat' component={ChatScreen}options={{
       tabBarLabel:({color})=>(
        <Text></Text>
       ),
       tabBarIcon:({color,size})=>(
        <Ionicons name="chatbubbles-outline" size={24} style={{color:Colors.bg}} />
       )
      }
      }/>
      <Tab.Screen name='profile' component={ProfileScreen}options={{
       tabBarLabel:({color})=>(
        <Text></Text>
       ),
       tabBarIcon:({color,size})=>(
        <AntDesign name="profile" size={24} style={{color:Colors.bg}} />
       )
      }
      }/>
   </Tab.Navigator>
  )
}








