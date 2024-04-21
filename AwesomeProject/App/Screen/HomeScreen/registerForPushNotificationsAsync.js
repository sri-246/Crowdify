//registerForPushNotificationsAsync.js

import * as Notifications from 'expo-notifications';


const registerForPushNotificationsAsync = async () => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus === 'granted') {
      let projectId = "29a37adb-2c24-486e-9c2f-302ea5fd028d"
      if (!projectId) {
        throw new Error("No 'projectId' found. Ensure it's configured in app.json or pass it directly.");
      }
      const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      return token;
    } else {
      console.log('Permission to receive push notifications denied');
    }
  } catch (error) {
    console.error('Error fetching Expo token:', error);
  }
};

export default registerForPushNotificationsAsync;
