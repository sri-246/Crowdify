import React, { useEffect, useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Icon, { Icons } from './Icons';
import * as Animatable from 'react-native-animatable';
import HomeScreen from '../Screen/HomeScreen/HomeScreen';
import ChatScreen from '../Screen/ChatScreen/ChatScreen';
import ProfileScreen from '../Screen/ProfileScreen/ProfileScreen';
import NotificationsScreen from '../Screen/NotificationScreen/NotificationsScreen';
import ChatListScreen from '../Screen/ChatScreen/ChatListScreen';
import MapScreen from '../Screen/MapScreen/MapScreen';
import Colors from '../Utils/Colors';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TabArr = [
  { route: 'Home', label: 'Home', type: Icons.Ionicons, activeIcon: 'grid', inActiveIcon: 'grid-outline', component: HomeScreen },
  { route: 'chatlist', label: 'Chat', type: Icons.Ionicons, activeIcon: 'chatbubbles', inActiveIcon: 'chatbubbles-outline', component: ChatListScreen },
  { route: 'notifications', label: 'Notifications', type: Icons.AntDesign, activeIcon: 'notification', inActiveIcon: 'notification', component: NotificationsScreen },
  { route: 'profile', label: 'Profile', type: Icons.FontAwesome, activeIcon: 'user-circle', inActiveIcon: 'user-circle-o', component: ProfileScreen },
];

const TabButton = (props) => {
  const { item, onPress, accessibilityState } = props;
  const focused = accessibilityState.selected;
  const viewRef = useRef(null);

  useEffect(() => {
    if (focused) {
      viewRef.current.animate({ 0: { scale: .5, rotate: '0deg' }, 1: { scale: 1.5, rotate: '360deg' } });
    } else {
      viewRef.current.animate({ 0: { scale: 1.5, rotate: '360deg' }, 1: { scale: 1, rotate: '0deg' } });
    }
  }, [focused]);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={1}
      style={[styles.container, { top: 0 }]}>
      <Animatable.View
        ref={viewRef}
        duration={1000}
      >
        <Icon type={item.type}
          name={focused ? item.activeIcon : item.inActiveIcon}
          color={focused ? Colors.primary : Colors.primaryLite} />
      </Animatable.View>
    </TouchableOpacity>
  );
};

function AnimTabNavigator() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            height: 60,
            position: 'absolute',
            margin: 16,
            borderRadius: 16,
            justifyContent: 'center',
            alignItems: 'center',
          }
        }}
      >
        {TabArr.map((item, index) => {
          return (
            <Tab.Screen key={index} name={item.route} component={item.component}
              options={{
                tabBarShowLabel: false,
                tabBarButton: (props) => <TabButton {...props} item={item} />
              }}
            />
          )
        })}
      </Tab.Navigator>
    </SafeAreaView>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="main" component={AnimTabNavigator} options={{ headerShown: false }}/>
      <Stack.Screen name="ChatScreen" component={ChatScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ChatListScreen" component={ChatListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MapScreen" component={MapScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 60,
  }
});
