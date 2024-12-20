import { Stack } from "expo-router"
import Colors from '../constants/Colors';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from "react";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { FontAwesome5 } from '@expo/vector-icons';
import { useLoginStore } from "./store/useLoginStore";
import { Image } from 'react-native'
import React from "react";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function StackLayout()  {
    
    const { mozo,setUrl,setDispId } = useLoginStore();
    const [loaded, error] = useFonts({
        SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
        ...FontAwesome.font,
      });
       
     useEffect(() => {
        if (error) throw error;
      }, [error]);
    
      useEffect(() => {       
        if (loaded) {
          SplashScreen.hideAsync();
        }
      }, [loaded]);

      if (!loaded) {
        return null;
      }

    return (
        <>
        <StatusBar style="light" /> 
        
        <Stack
            screenOptions={{
            headerStyle: {
                backgroundColor: Colors.background,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
                fontWeight: 'bold',
            },
            
            }}>

            <Stack.Screen name="index" options={{headerTitle: 'Restosoft',
                                                 headerTitleAlign: 'center'                                                 
                                                 }} />
                                             
            <Stack.Screen name="mesas" options={{headerTitle: `Mozo: (${mozo.idMozo}) ${mozo.nombre} ` , headerTitleAlign: 'center'}}/>    
            
            <Stack.Screen name="reservas" options={{headerTitle: `Mozo: (${mozo.idMozo}) ${mozo.nombre} ` , headerTitleAlign: 'center'}}/>    

            <Stack.Screen name="mozos" options={{headerTitle: () => ( // App Logo
              <Image
                style={{ width: 300, height: 100 }}
                source={require('../assets/logo-rs-2.png')}
                resizeMode='contain'
              />
            ), headerTitleAlign: 'center'}}/>   

            <Stack.Screen name="(tabs)" options={{headerShown: false}}  />     
            
            <Stack.Screen name="config" options={{headerTitle: 'Configuracion', headerTitleAlign: 'center'}}/>                            
      
            </Stack>    
        </>
    );

  }