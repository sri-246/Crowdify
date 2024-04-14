import { View, Text ,Image ,FlatList, TouchableOpacity } from 'react-native'
import React from 'react'
import {Ionicons} from '@expo/vector-icons'
import {useUser} from '@clerk/clerk-expo';
import Colors from '../../Utils/Colors';

export default function ProfileScreen() {

  const {user}=useUser()
  const ProfileMenu=[
    {
      id:1,
      name:"About",
      icon:'information-circle',
    },
    {
      id:2,
      name:"Help",
      icon:'people-sharp',
    },
    {
      id:3,
      name:"Setting",
      icon:'settings',
    },
    {
      id:4,
      name:"Logout",
      icon:'log-out',
    }
  ]
  return (
    <View>
    <View style={{padding:20,paddingTop:30,backgroundColor:Colors.db}}>
      <Text style={{fontSize:30,fontFamily:'outfit-bold',color:Colors.white}}>Profile</Text>
      <View style={{display:'flex',
    justifyContent:'center',
    alignItems:'center',
    padding:20,
    }}>
       <Image source={{uri:user.imageUrl}} 
       style={{width:90,height:90,borderRadius:99}} /> 
       <Text style={{fontSize:26,marginTop:8,fontFamily:'outfit-medium',color:Colors.white}}>{user.fullName}</Text>
       <Text style={{fontSize:18,marginTop:8,fontFamily:'outfit-medium',color:Colors.white}}>{user?.primaryEmailAddress.emailAddress}</Text>
      </View>
    </View>

    <View style={{paddingTop:60}}>
      <FlatList 
      data={ProfileMenu}
      renderItem={({item,index})=>(
       <TouchableOpacity style={{display:'flex',flexDirection:'row',alignItems:'center',gap:10,marginBottom:20,
       paddingHorizontal:80}}>
        <Ionicons name={item.icon} size={40} color="black" />
        <Text style={{fontFamily:'outfit',fontSize:20}}>{item.name}
        
        </Text>
        </TouchableOpacity> 
      )}
      
      />
    </View>
    </View>
  )
}

