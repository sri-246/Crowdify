import { View, Text,StyleSheet } from 'react-native'
import React from 'react'

export default function ChatScreen() {
  return (
    <View style={styles.container}>
      <Text>ChatScreen</Text>
    </View>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', // Center vertically
    alignItems: 'center', // Center horizontally
  },
});
