import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '@clerk/clerk-expo';

const LOCATION_TASK_NAME = 'background-location-tjgask';

export const startBackgroundLocationUpdates = async (user) => {
  try {
    await AsyncStorage.setItem('userId', user.primaryEmailAddress.emailAddress);

    let { status } = await Location.requestBackgroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Background location permission denied');
      return;
    }
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 5000,
      distanceInterval: 0,
      deferredUpdatesInterval: 5000,
      deferredUpdatesDistance: 0,
      pausesUpdatesAutomatically: false,
    });
    console.log('Background location updates started');
  } catch (error) {
    console.error('Error starting background location updates:', error);
  }
};

export const stopBackgroundLocationUpdates = async () => {
  try {
    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    console.log('Background location updates stopped');
  } catch (error) {
    console.error('Error stopping background location updates:', error);
  }
};
