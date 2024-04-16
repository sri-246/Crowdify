import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import Colors from '../../Utils/Colors';
import { useFonts } from "expo-font";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useOAuth } from "@clerk/clerk-expo";
import { useWarmUpBrowser } from "../../hooks/useWarmUpBrowser";
import * as WebBrowser from "expo-web-browser";
import * as Location from 'expo-location';

WebBrowser.maybeCompleteAuthSession();

export default function Login() {
  useWarmUpBrowser();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const [location, setLocation] = useState(null);

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location.coords);
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const onPress = React.useCallback(async () => {
    try {
      const { createdSessionId, signIn, signUp, setActive } =
        await startOAuthFlow();

      if (createdSessionId) {
        setActive({ session: createdSessionId });
       
        // Send user data to backend
        const userData = {
          username:'dd',
          email: 'example@example.com',
          location: location // Pass the location obtained earlier
        };
        console.log(userData);
        // Replace 'YOUR_BACKEND_URL' with the actual URL of your backend API endpoint
        fetch('http://172.17.18.148:3000/api/user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        })
        .then(response => response.json())
        .then(data => {
          console.log('Success:', data);
          // Handle success response from backend
        })
        .catch(error => {
          console.error('Error:', error);
          // Handle error from backend
        });

      } else {
        // Use signIn or signUp for next steps such as MFA
      }
    } catch (err) {
      console.error("OAuth error", err);
    }
  }, [location]);

  const [fontsLoaded] = useFonts({
    'mr': require('../../Utils/MarckScriptRegular.ttf'),
    'qs': require('../../Utils/Quicksand-VariableFont_wght.ttf'),
    'caveat': require('../../Utils/Caveat-VariableFont_wght.ttf'),
    'as': require('../../Utils/AlbertSans.ttf'),
  });

  if (!fontsLoaded) {
    return <Image
      source={require('./../../../assets/images/HomeLogoIcon.png')}
      style={{ alignSelf: 'center', width: 55, height: 55 }}
    />;
  }

  return (
    <>
      <View style={styles.container}>
        <Image
          source={require('./../../../assets/images/HomeLogo.png')}
          style={styles.homelogo}
        />
      </View>
      <View style={styles.subcon}>
        <Text style={styles.hometext}>Welcome to <Text style={{ fontWeight: '900' }}>CROWDIFY</Text></Text>
        <Text style={styles.hometext2}><Text style={{ fontWeight: '900' }}>S</Text>tay
          <Text style={{ fontWeight: '900' }}> C</Text>onnected
          <Text style={{ fontWeight: '900' }}> W</Text>ith
          <Text style={{ fontWeight: '900' }}> P</Text>eople</Text>
        <TouchableOpacity style={styles.button} onPress={onPress}>
          <Text style={{ textAlign: "center", color: Colors.bg, fontSize: wp('4.5%'), fontFamily: 'as' }}>SignIn or SignUp</Text>
        </TouchableOpacity>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  homelogo: {
    width: wp('80%'),
    height: hp('25%'),
    alignSelf: 'center',
  },
  hometext2: {
    fontSize: wp('6%'),
    fontFamily: 'as',
    color: 'white',
    alignSelf: 'baseline',
    paddingLeft: wp('5%'),
    paddingRight: wp('5%'),
    maxWidth: wp('50%')
  },
  hometext: {
    alignSelf: 'baseline',
    paddingBottom: wp('5%'),
    paddingLeft: wp('5%'),
    paddingRight: wp('5%'),
    fontSize: wp('6%'),
    fontFamily: 'as',
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
})
