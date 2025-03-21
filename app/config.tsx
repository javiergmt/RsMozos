import { View, Text, Button, SafeAreaView, TextInput, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Link, Redirect } from 'expo-router'
import { useLoginStore } from './store/useLoginStore'
import * as SecureStore from 'expo-secure-store';
import { deconvPort, deconvUrl } from './Funciones/deConversion';
import { getDisp } from './ApiFront/Gets/GetDatos';
import Colors from '../constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FlashMessage from "react-native-flash-message"
import { showMessage, hideMessage } from "react-native-flash-message";

const config = () => {
  const {setUrl,urlBase,setDispId,setBaseDatos,BaseDatos} = useLoginStore()  
  const [text, onChangeText] = useState('');
  const [number, onChangeNumber] = useState('1234');
  const [disp, onChangeDisp] = useState('0');
  const [base, onChangeBase] = useState('');
  const [grabarOk, setGrabarOk] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const { bottom, top, right, left } = useSafeAreaInsets();
  const [isOk, setIsOk] = useState(false)
  const [pass, onChangePass] = useState('')
  const [showPassword, setShowPassword] = useState(false); 
  
  const validarPass = () => {
      if (pass == '6736' || pass == 'Rest0.s0ft') {
        setIsOk(true)
      } else {
        //Alert.alert('Clave Incorrecta')
        showMessage({
                    message: "ATENCION !!",
                    description: "Clave Incorrecta",
                    type: "danger",
              });
        setGrabarOk(true)
      }
  }; 

  const getDisp = async () => {
   //const mac = await DeviceInfo.getMacAddress()
   //setDispId(mac)
  
  };

  async function save(key, value) {
    await SecureStore.setItemAsync(key, value);
  }

  const handleGrabar = () => {  
    setGrabarOk(true)
    setUrl('http://'+text+':'+number+'/')
    save('url','http://'+text+':'+number+'/');
    setDispId(disp)
    setBaseDatos(base)
    save('disp',disp);
    save('bd',base);    
  }

  useEffect(() => {
    async function getValueFor(key) {
    let result = await SecureStore.getItemAsync(key);
    return result
    }
  
    getValueFor('url').then((res) => {
      onChangeText(deconvUrl(res))
      onChangeNumber(deconvPort(res))
    })
    
    getValueFor('disp').then((res) => {
      onChangeDisp(res)
    }) 
       
    getValueFor('bd').then((res) => {
      onChangeBase(res)
    })

   }, []);

  return (
    <View style={styles.container}>
    <FlashMessage position="top" />
      { isPending  &&
        <View >          
        <ActivityIndicator size="large" color="#0000ff"/> 
        </View>
      }
       
      { !isOk && 
        <View style={styles.container}>
          <Text style={styles.text}>Ingresar Clave</Text>
          <TextInput
            secureTextEntry={!showPassword} 
            style={styles.input}
            onChangeText={onChangePass}
            value={pass}   
           
          />    
          <View style={[{bottom, },styles.cont_Pie  ]}>
            <TouchableOpacity onPress={validarPass}> 
                <Text style={styles.textBtSalir}>Validar Clave</Text> 
            </TouchableOpacity>
          </View> 
        </View>

      }

      { isOk &&
      <View style={styles.container}>
        <Text style={styles.text}>IP / Host</Text>
        <TextInput
          style={styles.input}
          onChangeText={onChangeText}
          value={text}        
        />    
      
        <Text style={styles.text}>Port: </Text>
        <TextInput
          style={styles.input}
          onChangeText={onChangeNumber}
          value={number}
          keyboardType="numeric"
        />

        <Text style={styles.text}>Base de Datos: </Text>
        <TextInput
          style={styles.input}
          onChangeText={onChangeBase}
          value={base}
        />

        <Text style={styles.text}>Id Dispositivo: </Text>
        <TextInput
          style={styles.input}
          onChangeText={onChangeDisp}
          value={disp}
          keyboardType="numeric"
        />
        
        <View style={[{bottom, },styles.cont_Pie  ]}>
        
          <TouchableOpacity onPress={handleGrabar}> 
              <Text style={styles.textBtSalir}>Grabar</Text> 
          </TouchableOpacity>
        
        </View> 
      </View>
      }

      {grabarOk && <Redirect href='/' />}
  

     
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //justifyContent: 'center',
    alignItems: 'center',
    //margin: 10,
    backgroundColor: Colors.background,
  },
  input: {
    fontSize: 20,
    fontWeight: 'bold',
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 5,
    borderRadius: 10,
    backgroundColor: Colors.backsombra,
    width: 300,
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    alignSelf: 'center',  
    color: 'white',
    paddingTop: 10,
  },
  textBtSalir: {
    width:200,
    textAlign:'center',
    fontSize:20,
    fontWeight:'500',
    marginBottom:5,
    color:'white',
    //height:50,
    borderRadius:10,
    backgroundColor:Colors.colorfondoBoton,  
   
  },
  cont_Pie: {
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 30,
    width: '100%',
  },
  
});
export default config

function validarDisp(disp: string, urlBase: string) {
  throw new Error('Function not implemented.');
}
