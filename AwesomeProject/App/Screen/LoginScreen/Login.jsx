import { StyleSheet,View, Text, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import Colors from '../../Utils/Colors'
import { useFonts } from "expo-font";
import { AppRegistry } from 'react-native-web'

export default function Login() {
  const [fontsLoaded] = useFonts({
    'mr': require('../../Utils/MarckScriptRegular.ttf'),
     'qs':require('../../Utils/Quicksand-VariableFont_wght.ttf'),
  });
  if (!fontsLoaded) {
    return <Text>Loading...</Text>;
  }
  return (
    <>
    <View >
      <Image source={require('./../../../assets/images/HomeLogo.png')}
        style={styles.homelogo}
      />
    </View>
    <View style={styles.subcon}>
     <Text style={styles.hometext}>Welcome to Crowdify</Text>
     <Text style={styles.hometext2}>STAY CONNECTED WITH PEOPLE</Text>
     <TouchableOpacity style={styles.button} onPress={()=>console.log("button clicked")}>
      <Text style={{textAlign:"center",color:Colors.dg,fontSize:17,fontFamily:'mr'}}>Let's Get Started</Text>
     </TouchableOpacity>
    </View>
    </>
  )
}

const styles = StyleSheet.create({
  homelogo:{
    width:230,
    height:230,
    marginTop:100
  },
  hometext2:{
    fontSize:20,
    fontFamily:'qs',
    color:Colors.lg,
    alignSelf:'center',
    width:150
  },
  hometext:{
    alignSelf:'center',
    padding:25,
    fontSize:35,
    fontFamily:'mr',
    color:'white',
    marginTop:10
  },
  subcon:{
    width:'100%',
    backgroundColor:Colors.dg,
    height:'40%',
    marginTop:150,
    borderTopLeftRadius:30,
    borderTopRightRadius:30,
  },
  button:{
    alignSelf:'center',
    backgroundColor:'white',
    padding:15,
    width:'80%',
    marginTop:40,
    borderRadius:50,
  }
})