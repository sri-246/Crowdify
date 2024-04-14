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
    'caveat': require('../../Utils/Caveat-VariableFont_wght.ttf'),
    'as': require('../../Utils/AlbertSans.ttf'),
  });
  if (!fontsLoaded) {
    return <Image
    source={require('./../../../assets/images/HomeLogoIcon.png')}
    style={{alignSelf:'center',width:55, 
    height:55}}
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
        <Text style={styles.hometext}>Welcome to <Text style={{fontWeight:'900'}}>CROWDIFY</Text></Text>
        <Text style={styles.hometext2}><Text style={{fontWeight:'900'}}>S</Text>tay
        <Text style={{fontWeight:'900'}}> C</Text>onnected 
        <Text style={{fontWeight:'900'}}> W</Text>ith 
        <Text style={{fontWeight:'900'}}> P</Text>eople</Text>
        <TouchableOpacity style={styles.button} onPress={onPress}>
          <Text style={{ textAlign: "center", color: Colors.bg, fontSize: wp('4.5%'), fontFamily: 'as' }}>SignIn or SignUp</Text>
        </TouchableOpacity>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    alignSelf:'center',
    justifyContent: 'center', 
    alignItems: 'center',
  },
  homelogo: {
    width: wp('80%'), 
    height: hp('25%'),
    alignSelf:'center',
  },
  hometext2: {
    fontSize: wp('6%'),
    fontFamily: 'as',
    color:'white',
    alignSelf: 'baseline',
    paddingLeft: wp('5%'),
    paddingRight: wp('5%'),
    maxWidth:wp('50%')
  },
  hometext: {
    alignSelf:'baseline',
    paddingBottom: wp('5%'),
    paddingLeft: wp('5%'),
    paddingRight: wp('5%'),
    fontSize: wp('6%'),
    fontFamily:'as',
    color: 'white',
  },
  subcon: {
    backgroundColor:Colors.bg,
    width:wp('80%'),
    borderRadius:50, 
    paddingTop: hp('10%'),
    paddingBottom: hp('10%'),
    alignSelf:'center',
    justifyContent: 'center', // Center vertically
    alignItems: 'center',
    marginBottom:100,
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