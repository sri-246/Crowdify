import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Login from './App/Screen/LoginScreen/Login';
import { useFonts } from "expo-font";

export default function App() {;
  return (
    <View style={styles.container}>
      <Login/>
      <StatusBar style="auto" />
    </View>
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
