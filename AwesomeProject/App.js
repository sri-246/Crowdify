import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Login from './App/Screen/LoginScreen/Login';
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/clerk-expo';
import * as SecureStore from "expo-secure-store";

const tokenCache = {
  async getToken(key) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key, value) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

export default function App() {;
  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey='pk_test_c2FjcmVkLWVsZXBoYW50LTIxLmNsZXJrLmFjY291bnRzLmRldiQ'>
    <View style={styles.container}>
    <SignedIn>
          <Text>You are Signed in</Text>
    </SignedIn>
    <SignedOut>
      <Login/>
    </SignedOut>
      
      <StatusBar style="auto" />
    </View>
    </ClerkProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    fontSize:'145px',
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container1:{
    fontSize:80,
    fontFamily:'MarckScriptRegular',
  }
});
