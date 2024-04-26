//TabNavigation.jsx

import { View, Text } from 'react-native';
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../Screen/HomeScreen/HomeScreen';
import ChatScreen from '../Screen/ChatScreen/ChatScreen';
import ProfileScreen from '../Screen/ProfileScreen/ProfileScreen';
import NotificationsScreen from '../Screen/Notification/NotificationsScreen';
import { FontAwesome5 } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import Colors from '../Utils/Colors';

const Tab = createBottomTabNavigator();

export default function TabNavigation() {
  return (
    <Tab.Navigator 
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.bg
      }}
    >
      <Tab.Screen 
        name='home' 
        component={HomeScreen}
        options={{
          tabBarLabel: ({ color }) => (
            <Text></Text>
          ),
          tabBarIcon: ({ color, size, focused }) => (
            <FontAwesome5 name="home" size={24} color={focused ? Colors.bg : 'black'} />
          )
        }}
      />
      
      <Tab.Screen 
        name='chat' 
        component={ChatScreen}
        options={{
          tabBarLabel: ({ color }) => (
            <Text></Text>
          ),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name="chatbubbles-outline" size={24} color={focused ? Colors.bg : 'black'} />
          )
        }}
      />
      
      <Tab.Screen 
        name='notifications' 
        component={NotificationsScreen}
        options={{
          tabBarLabel: ({ color }) => (
            <Text></Text>
          ),
          tabBarIcon: ({ color, size, focused }) => (
            <AntDesign name="notification" size={24} color={focused ? Colors.bg : 'black'} />
          )
        }}
      />
      
      <Tab.Screen 
        name='profile' 
        component={ProfileScreen}
        options={{
          tabBarLabel: ({ color }) => (
            <Text></Text>
          ),
          tabBarIcon: ({ color, size, focused }) => (
            <AntDesign name="profile" size={24} color={focused ? Colors.bg : 'black'} />
          )
        }}
      />
    </Tab.Navigator>
  );
}
