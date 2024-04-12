import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import Colors from '../../Utils/Colors'
import { useFonts } from "expo-font";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useOAuth } from "@clerk/clerk-expo";
import { useWarmUpBrowser } from "../../hooks/useWarmUpBrowser";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

export default function Login() {
  useWarmUpBrowser();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
 
  const onPress = React.useCallback(async () => {
    try {
      const { createdSessionId, signIn, signUp, setActive } =
        await startOAuthFlow();
 
      if (createdSessionId) {
        setActive({ session: createdSessionId });
      } else {
        // Use signIn or signUp for next steps such as MFA
      }
    } catch (err) {
      console.error("OAuth error", err);
    }
  }, []);
  const [fontsLoaded] = useFonts({
    'mr': require('../../Utils/MarckScriptRegular.ttf'),
    'qs': require('../../Utils/Quicksand-VariableFont_wght.ttf'),
  });
  if (!fontsLoaded) {
    return <Text>Loading...</Text>;
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
        <Text style={styles.hometext}>Welcome to Crowdify</Text>
        <Text style={styles.hometext2}>STAY CONNECTED WITH PEOPLE</Text>
        <TouchableOpacity style={styles.button} onPress={onPress}>
          <Text style={{ textAlign: "center", color: Colors.dg, fontSize: wp('4.5%'), fontFamily: 'mr' }}>Let's Get Started</Text>
        </TouchableOpacity>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  homelogo: {
    width: wp('60%'), 
    height: hp('20%'),
  },
  hometext2: {
    fontSize: wp('5%'),
    fontFamily: 'qs',
    color:'white',
    alignSelf: 'center',
    paddingLeft: wp('5%'),
    paddingRight: wp('5%'),
  },
  hometext: {
    alignSelf: 'center',
    paddingBottom: wp('5%'),
    paddingLeft: wp('5%'),
    paddingRight: wp('5%'),
    fontSize: wp('8%'),
    fontFamily: 'mr',
    color: 'white', 
  },
  subcon: {
    backgroundColor: Colors.dg,
    alignItems: 'center', 
    borderRadius: wp('10%'), 
    paddingTop: hp('10%'), 
  },
  button: {
    alignSelf: 'center',
    backgroundColor: 'white',
    padding: wp('3%'), 
    width: wp('60%'), 
    marginTop: hp('5%'),
    marginBottom: hp('10%'), 
    borderRadius: wp('10%'), 
  }
})
