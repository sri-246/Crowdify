import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import HomeScreen from '../Screen/HomeScreen/HomeScreen';
import ChatScreen from '../Screen/ChatScreen/ChatScreen';
import ProfileScreen from '../Screen/ProfileScreen/ProfileScreen';
import NotificationsScreen from '../Screen/Notification/NotificationsScreen';
import ChatListScreen from '../Screen/ChatScreen/ChatListScreen';
import MapScreen from '../Screen/MapScreen/MapScreen';
import { FontAwesome5 } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import Colors from '../Utils/Colors';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function BottomTabs() {
  return (
    <Tab.Navigator 
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.bg,
      }}
    >
      <Tab.Screen 
        name='home' 
        component={HomeScreen}
        options={{
          tabBarLabel: () => (<Text></Text>),
          tabBarIcon: ({ focused }) => (
            <FontAwesome5 name="home" size={24} color={focused ? Colors.bg : 'black'} />
          ),
        }}
      />
      <Tab.Screen 
        name='chatlist' 
        component={ChatListScreen}
        options={{
          tabBarLabel: () => (<Text></Text>),
          tabBarIcon: ({ focused }) => (
            <Ionicons name="chatbubbles-outline" size={24} color={focused ? Colors.bg : 'black'} />
          ),
        }}
      />
      <Tab.Screen 
        name='notifications' 
        component={NotificationsScreen}
        options={{
          tabBarLabel: () => (<Text></Text>),
          tabBarIcon: ({ focused }) => (
            <AntDesign name="notification" size={24} color={focused ? Colors.bg : 'black'} />
          ),
        }}
      />
      <Tab.Screen 
        name='profile' 
        component={ProfileScreen}
        options={{
          tabBarLabel: () => (<Text></Text>),
          tabBarIcon: ({ focused }) => (
            <AntDesign name="profile" size={24} color={focused ? Colors.bg : 'black'} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator >
      <Stack.Screen name="main" component={BottomTabs} options={{ headerShown: false }}/>
      <Stack.Screen name="ChatScreen" component={ChatScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ChatListScreen" component={ChatListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MapScreen" component={MapScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}