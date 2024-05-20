import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Alert } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

const MapScreen = ({ route }) => {
  const { senderLocation, recipientLocation } = route.params;
  const [distance, setDistance] = useState(null);

  useEffect(() => {
    // Calculate distance between sender and recipient locations
    const calculateDistance = () => {
      const R = 6371; // Radius of the earth in km
      const dLat = deg2rad(recipientLocation.latitude - senderLocation.latitude);
      const dLon = deg2rad(recipientLocation.longitude - senderLocation.longitude);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(senderLocation.latitude)) * Math.cos(deg2rad(recipientLocation.latitude)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const d = R * c; // Distance in km
      setDistance(d.toFixed(2)); // Set distance with 2 decimal places
    };

    calculateDistance();
  }, [senderLocation, recipientLocation]);

  // Convert degrees to radians
  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  // Swap sender and recipient locations for the direction route
  const directions = [
    senderLocation,
    recipientLocation
  ];

  // Show distance in a popup
  const showDistancePopup = () => {
    Alert.alert('Distance', `The distance between sender and recipient is ${distance} km`);
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: (senderLocation.latitude + recipientLocation.latitude) / 2,
          longitude: (senderLocation.longitude + recipientLocation.longitude) / 2,
          latitudeDelta: Math.abs(senderLocation.latitude - recipientLocation.latitude) * 2,
          longitudeDelta: Math.abs(senderLocation.longitude - recipientLocation.longitude) * 2,
        }}
      >
        {/* Render markers for sender and recipient */}
        <Marker
          coordinate={{
            latitude: senderLocation.latitude,
            longitude: senderLocation.longitude,
          }}
          title="Recipient Location"
          pinColor="green"
          onPress={showDistancePopup}
        />
        <Marker
          coordinate={{
            latitude: recipientLocation.latitude,
            longitude: recipientLocation.longitude,
          }}
          title="Sender Location"
          pinColor="blue"
          onPress={showDistancePopup}
        />
        {/* Render polyline for directions */}
        <Polyline
          coordinates={directions}
          strokeColor="#F00" // Color for the route
          strokeWidth={3}
        />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});

export default MapScreen;