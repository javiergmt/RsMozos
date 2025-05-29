import { View, Text, Button, SafeAreaView, StyleSheet, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useLoginStore } from './store/useLoginStore';
import { getDisp } from './ApiFront/Gets/GetDatos';
import Colors from '../constants/Colors';
import * as SecureStore from 'expo-secure-store';
import { Redirect } from 'expo-router';
import FlashMessage from "react-native-flash-message";
import { version } from '../package.json';


const index = () => {
  const [msgError, setMsgError] = useState('')
  const [isPending, setIsPending] = useState(true)
  const [isValido, setIsValido] = useState(false)
  const [irConfig, setIrConfig] = useState(false)
  const { setUrl,setDispId,setBaseDatos,urlBase,BaseDatos,dispId } = useLoginStore();
  
  // Valido Dispositivo
  const validarDisp = async (id:number,url:string,base:string) => {
     const data = await getDisp(id,url,base) 
     setIsPending(data.isPending)
      if (data.isError) {
        setMsgError('Error en la validacion del dispositivo: '+data.isError)
      } else {
        if (data.disp[0].valido == 1) {
          setIsValido(true)
        }
      }
     
     return data
  }

  const getValueFor = async (key:string) => {
    let result = await SecureStore.getItemAsync(key);
    return result
 
}

const configurar = () => {
    setIrConfig(true)
}

const grabarStore = async (url:string,disp:string,base:string) => {
    setUrl(url)
    setDispId(disp)
    setBaseDatos(base)
}

useEffect(() => {    
    const load = async () => {
      // Leo los valores grabados en el Store
      const url = await getValueFor('url')
      const id = await getValueFor('disp')
      const base = await getValueFor('bd')
      grabarStore(url,id,base)
      console.log('url:',url,' id:',id,' base:',base)
      //const url = 'http://192.168.1.1:1234/'
      const {disp,isError,isPending} = await validarDisp(parseInt(id),url,base)
      
      return 
    };
    load()
    
}, [isValido]);
return (
     <>
     <SafeAreaView style={styles.container}>       
     <FlashMessage position="top" /> 
        <View style={styles.body}>
          <Text style={styles.text}>Url: {urlBase}</Text>    
          <Text style={styles.text}>BD : {BaseDatos}</Text>     
          <Text style={styles.text}>Id : {dispId}</Text>          
          <Text style={styles.text}>Ver. {version}</Text>
        </View>
        
        {isValido ? < Redirect href="/mozos" /> :
        //< Redirect href="/config" />
          <View>
            <Text style={styles.text}>{msgError} </Text>
            < Button title='Ir a Configuracion' onPress={ configurar }></Button>  
          </View>
        }

        { isPending  &&
        <View style={styles.activ}>          
          <ActivityIndicator size="large" color="#0000ff"/> 
        </View>
        }

        { irConfig && < Redirect href="/config" />}
        
        
      </SafeAreaView>
      </>  
    )
}

export default index

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    height: '100%',
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
  },
  
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    alignSelf: 'center',  
    color: 'white',
    paddingTop: 10,
  },

  activ: {
    margin: 20,
  }
})


