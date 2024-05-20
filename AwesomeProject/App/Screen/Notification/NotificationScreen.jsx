import React, { useEffect, useState, useRef } from 'react';
import { View, Text } from 'react-native';
import * as Notifications from 'expo-notifications';

export default function App() {
  const [notification, setNotification] = useState(null);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      console.log(token);
    });

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      // Update state to handle foreground notifications
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });
    Notifications.setNotificationCategoryAsync('foreground', [
      {
        identifier: 'foreground',
        actions: [],
        options: {
          isOverlay: false,
        },
      },
    ]);
    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  const registerForPushNotificationsAsync = async () => {
    // Implement push notification registration here
    return 'ExpoPushToken';
  };

  // Update notification handler for foreground notifications
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>App Content</Text>
      {notification && (
        <View style={{ marginTop: 20 }}>
          <Text>Received Notification:</Text>
          <Text>{JSON.stringify(notification, null, 2)}</Text>
        </View>
      )}
    </View>
  );
}