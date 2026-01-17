
import { View,Text, SafeAreaView , StyleSheet, TouchableOpacity, TextInput, ScrollView} from "react-native"
import { useLoginStore } from '../store/useLoginStore'
import FlashMessage from "react-native-flash-message"
import { showMessage, hideMessage } from "react-native-flash-message";
import { Redirect, Stack } from "expo-router"
import Colors from '../../constants/Colors'
import React, { useEffect, useState } from "react"
import { AntDesign } from '@expo/vector-icons'
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { getLugaresSectores, getMensajesComanda } from "../ApiFront/Gets/GetDatos"
import { lugSectImpreType, mensajesComandaType } from "../ApiFront/Types/BDTypes"
import { EliminarMesa, GrabarMensaje, LiberarMesa } from "../ApiFront/Posts/PostDatos"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const mensajes = () => {
const {ultMesa,comensales,urlBase,BaseDatos,mozo} = useLoginStore()
const [salir, setSalir] = useState(false)
const [text, onChangeText] = useState('');
const [textImpre, onChangeTextImpre] = useState('');
const [idImpre,setIdImpre] = useState(0);
const [idSectImpre,setIdSectImpre] = useState(0);
const [selImpre,setSelImpre] = useState(false);
const [selMensaje,setSelMensaje] = useState(false);
const [idMensaje,setIdMensaje] = useState(0);
const [mensajes, setMensajes] = useState( [] as mensajesComandaType[])
const [lugares, setLugares] = useState( [] as lugSectImpreType[])
const { bottom, top, right, left } = useSafeAreaInsets();

const handleLugar = (l: lugSectImpreType) => {
  setIdImpre(l.idImpresora)
  setIdSectImpre(l.idSectorExped)
  onChangeTextImpre(l.descripcion)
  setSelImpre(false)
}

const handleMensaje = (m: mensajesComandaType) => {
  setIdMensaje(m.idMensaje)
  onChangeText(m.descripcion)
  setSelMensaje(false)
}

const handleSalir = async () => {
    // Desbloquear la mesa o Elimirarla en caso de que no tenga detalle
    if (  ultMesa.ocupada == 'N' ) {
      const res = await EliminarMesa(ultMesa.nroMesa,urlBase,BaseDatos)
     } else {
      const res = await LiberarMesa(ultMesa.nroMesa,false,urlBase,BaseDatos)
     }
     setSalir(true)
} 

const traerLugares = async (url:string,base:string) => {
    const lug = await getLugaresSectores(url,base)
    return lug
}  

const traerMensajes = async (url:string,base:string) => {
    const mens = await getMensajesComanda(url,base)
    return mens
}  

const handleGrabar = async () => {
  if ( (text == '') || (idImpre == 0) ) {
    showMessage({
      message: "Atención",
      description: "Debe ingresar un mensaje y seleccionar una impresora",
      type: "danger",
    });
    return
  }
  // Desbloquear la mesa o Elimirarla en caso de que no tenga detalle
  const res = await GrabarMensaje(text,ultMesa.idMozo,mozo.nombre,ultMesa.nroMesa,idSectImpre,idImpre,urlBase,BaseDatos)
  
  if (  ultMesa.ocupada == 'N' ) {
    const res = await EliminarMesa(ultMesa.nroMesa,urlBase,BaseDatos)
   } else {
    const res = await LiberarMesa(ultMesa.nroMesa,false,urlBase,BaseDatos)
   }
   showMessage({
           message: "Mensaje Enviado!!",
           description: "El mensaje fue enviado a la Comanda",
           type: "success",
      
         });
         setTimeout(() => setSalir(true),
         1000
       )      
   
}


useEffect(() => {
  const getLugares = async () => {
    const lug = await traerLugares(urlBase,BaseDatos)
    setLugares(lug)
  }
  const getMensajes = async () => {
    const mens = await traerMensajes(urlBase,BaseDatos) 
    setMensajes(mens)
  }
  getMensajes()
  getLugares()
  
  if (lugares.length > 0) {
    onChangeTextImpre(lugares[0].descripcion)
    setIdImpre(lugares[0].idImpresora)
    setIdSectImpre(lugares[0].idSectorExped)
  }
},[] )

 return (
 
  <SafeAreaView style={{ flex: 1 }}>
     <View style={styles.container}>    
        <FlashMessage position="top" />
        <Stack.Screen options={{headerTitle: `Mesa ${ultMesa.nroMesa} ${ultMesa.descMesa} -  ${comensales} Pers.`, 
                    headerTitleAlign: 'center',
                    headerStyle: {
                                  backgroundColor: Colors.background,
                    },
                    headerTintColor: '#fff',
                    headerTitleStyle: {
                                    fontWeight: 'bold',
                    },
                    headerRight:() => (
                        <View style={{flexDirection: 'row',paddingRight: 10}}>
                         <TouchableOpacity onPress={() => handleSalir()} >
                            <AntDesign name="close" size={35} color={Colors.colorBackBoton} />
                        </TouchableOpacity>
                        </View>
                      ) 
        }} />
        
        
        { salir && <Redirect href="/mesas" />} 
        <View>                      
            <Text style={styles.titulo}>Mensajes x comanda</Text> 
        </View>
        { !selImpre && !selMensaje &&
        <View>
        <Text style={styles.text}>Mensaje</Text>
                <TextInput
                  multiline={true}
                  numberOfLines={4}
                  maxLength={100}
                  
                  style={styles.textInput}
                  onChangeText={onChangeText}
                  value={text}        
                />    
                <TouchableOpacity onPress={() => setSelMensaje(true)} >
                  <AntDesign name="ellipsis1" size={35} color={Colors.colorBackBoton} />
                </TouchableOpacity> 
         <Text style={styles.text}>Impresora</Text>
                <TextInput
                  style={styles.input}
                  onChangeText={onChangeTextImpre}
                  value={textImpre}   
                  /> 
         <TouchableOpacity onPress={() => setSelImpre(true)} >
              <AntDesign name="ellipsis1" size={35} color={Colors.colorBackBoton} />
         </TouchableOpacity> 
         
         </View>
        }
        { selImpre &&
            <View style={{flex:1, height:'100%', margin:20, backgroundColor: Colors.background, }}>
              <Text style={styles.text}>Seleccionar Impresora</Text>
              <ScrollView > 
              {
              lugares.map((l) => (
                <View key={l.idLugarExped.toString()+l.idSectorExped.toString()}>
                  
                  <TouchableOpacity  onPress={() => handleLugar(l)}>
                  <View style={styles.cont_lugares}>
                    <View >     
                      <Text style={styles.text }>{l.descripcion}</Text>
                    </View>
                  </View>  
                  </TouchableOpacity>
                
                </View>
              ))
              }
              </ScrollView>
            </View>
        }
        { selMensaje &&
            <View style={{flex:1, height:'100%', margin:20, backgroundColor: Colors.background, }}>
              <Text style={styles.text}>Seleccionar Mensaje</Text>
              <ScrollView > 
              {
              mensajes.map((m) => (
                <View key={m.idMensaje.toString()}>
                  
                  <TouchableOpacity  onPress={() => handleMensaje(m)}>
                  <View style={styles.cont_lugares}>
                    <View >     
                      <Text style={styles.text }>{m.descripcion}</Text>
                    </View>
                  </View>  
                  </TouchableOpacity>
                
                </View>
              ))
              }
              </ScrollView>
            </View>
        }

         <View style={[{bottom, },styles.cont_Pie  ]}>
                
                  <TouchableOpacity onPress={handleGrabar}> 
                      <Text style={styles.textBtSalir}>Enviar Mensaje</Text> 
                  </TouchableOpacity>
                
          </View> 
    </View> 
 </SafeAreaView>  
      
 )
}

const styles = StyleSheet.create({
container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
},
input: {
    fontSize: 20,
    fontWeight: 'bold',
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 5,
    borderRadius: 10,
    lineHeight: 20,
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
  textInput: {
    backgroundColor: Colors.backsombra,
    padding: 10,
    textAlignVertical: "top",
    minHeight: 100,
    borderRadius:10,
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
  cont_lugares: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    padding: 8,
    backgroundColor:  'grey',
  },
  titulo: {
     fontSize: 30,
     fontWeight: 'bold',
     alignSelf: 'center',
     color: Colors.colorazulboton,    
  }, 
  cont_Pie: {
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 30,
    width: '100%',
  },  
  })  

  export default mensajes