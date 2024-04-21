import React, { useEffect, useState, useRef } from 'react';
import { View, Text } from 'react-native';
import * as Notifications from 'expo-notifications';

export default function App() {
  const [notification, setNotification] = useState(null);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Register for push notifications
    registerForPushNotificationsAsync().then(token => {
      console.log(token);
    });

    // Listen for notifications when the app is in the foreground
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    // Listen for notification responses
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    // Define notification handler for foreground notifications
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    // Clean up listeners when component unmounts
    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  const registerForPushNotificationsAsync = async () => {
    // Implementation for registering push notifications
    // For example, you can use Expo's push notification API
    // See: https://docs.expo.dev/push-notifications/overview/
    // This function should return the push token
    return 'ExpoPushToken';
  };

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
