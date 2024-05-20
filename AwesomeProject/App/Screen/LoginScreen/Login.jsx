//Login.jsx

import { StyleSheet, View, Text, Image, TouchableOpacity, PermissionsAndroid } from 'react-native';
import React, { useEffect, useState } from 'react';
import Colors from '../../Utils/Colors';
import { useFonts } from "expo-font";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useOAuth } from "@clerk/clerk-expo";
import { useWarmUpBrowser } from "../../hooks/useWarmUpBrowser";
import * as WebBrowser from "expo-web-browser";
import { useSession } from '../HomeScreen/SessionContext';
import { SafeAreaView } from 'react-native-safe-area-context';

WebBrowser.maybeCompleteAuthSession();

export default function Login() {
  useWarmUpBrowser();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const { setIsAuthenticated } = useSession();
  const [fontsLoaded] = useFonts({
    'mr': require('../../Utils/MarckScriptRegular.ttf'),
    'qs': require('../../Utils/Quicksand-VariableFont_wght.ttf'),
    'caveat': require('../../Utils/Caveat-VariableFont_wght.ttf'),
    'as': require('../../Utils/AlbertSans.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      // Fonts are loaded, you can proceed with the rest of the component initialization
      requestPermissions(); // Request permissions once fonts are loaded
    }
  }, [fontsLoaded]);

  const requestPermissions = async () => {
    try {
      // Request multiple permissions using PermissionsAndroid.requestMultiple
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      ]);

      // Check if all permissions are granted
      const allGranted = Object.values(granted).every((permission) => permission === PermissionsAndroid.RESULTS.GRANTED);
      
      if (!allGranted) {
        // Handle case where not all permissions are granted
        console.log("Some permissions are not granted");
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  };
  const onPress = async () => {
    try {
      const { createdSessionId, signIn, signUp, setActive } = await startOAuthFlow();
  
      if (createdSessionId) {
        setActive({ session: createdSessionId });
      }
      
      // Update the authentication state
      setIsAuthenticated(true);
    } catch (error) {
      console.log("Error during OAuth flow:", error);
    }
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Image source={require('./../../../assets/images/HomeLogoIcon.png')} style={{ alignSelf: 'center', width: 55, height: 55 }} />
      </View>
    );
  }

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <Image source={require('./../../../assets/images/HomeLogo.png')} style={styles.homelogo} />
      </View>
      <View style={styles.subcon}>
        <Text style={styles.hometext}>Welcome to <Text style={{ fontWeight: 'bold' }}>CROWDIFY</Text></Text>
        <Text style={styles.hometext2}>Stay Connected With People</Text>
        <TouchableOpacity style={styles.button} onPress={onPress}>
          <Text style={{ textAlign: "center", color: Colors.bg, fontSize: wp('4.5%'), fontFamily: 'normal' }}>Let's Get Started</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  homelogo: {
    width: wp('80%'),
    height: hp('25%'),
    alignSelf: 'center',
  },
  hometext2: {
    fontSize: wp('5%'),
    color: 'white',
    alignSelf: 'baseline',
    paddingLeft: wp('5%'),
    paddingRight: wp('5%'),
    
  },
  hometext: {
    alignSelf: 'baseline',
    paddingBottom: wp('2%'),
    paddingLeft: wp('5%'),
    paddingRight: wp('5%'),
    fontSize: wp('6%'),
    fontFamily: 'normal',
    color: 'white',
  },
  subcon: {
    backgroundColor: Colors.bg,
    width: wp('80%'),
    borderRadius: 50,
    paddingTop: hp('10%'),
    paddingBottom: hp('10%'),
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 100,
  },
  button: {
    alignSelf: 'center',
    backgroundColor: 'white',
    padding: wp('3%'),
    width: wp('60%'),
    marginTop: hp('5%'),
    borderRadius: wp('10%'),
  }
});