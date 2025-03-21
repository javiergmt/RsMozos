import { View, Text, Button, SafeAreaView, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useLoginStore } from './store/useLoginStore';
import { GetMozoPass, getDisp, getNoticias, getParamMozos, getRubrosSub } from './ApiFront/Gets/GetDatos';
import CustomDialPad from './components/teclado/CustomDialPad';
import { Link, Redirect } from 'expo-router';
import Colors from '../constants/Colors';
import convColores from './Funciones/convColores';
import { SimpleLineIcons } from '@expo/vector-icons';
import { version } from '../package.json';
import FlashMessage from "react-native-flash-message"
import { showMessage, hideMessage } from "react-native-flash-message";

const mozos = () => {
  const [pass,setPass] = useState([]);
  const [isLogin, setIsLogin] = useState(false)
  const [isError, setIsError] = useState(false)
  const [parametros, setParametros] = useState([])
  const [msgError, setMsgError] = useState('')
  const [isPending, setIsPending] = useState(true)
  const {setMozoId,setMozoName,setIdTipoMozo,setRubros,setParam,setUltSector,
         getUrl,urlBase,getBaseDatos,BaseDatos} = useLoginStore()
 
  const [volver, setVolver] = useState(false)
  const onPress = () => {
    setVolver(true)
  }

  // Obtiene Parametros de la base de datos
  const traerParam = async (url:string,base:string) => {
    console.log('traerParam:',url,base)
    const { param, isError, isPending } = await getParamMozos(url,base)
    setIsPending(isPending)
    setMsgError(isError)
    return param
  }

  //Obtienen los rubros de la base de datos
  const traerRubros = async (url:string,base:string) => {
    console.log('traerRubros:',url,base)
    const { rubros, isError, isPending } = await getRubrosSub(url,base)
    setIsPending(isPending)
    return rubros
  }

  //Obtiene las Noticias de Mozos
  const traerNoticias = async (url:string,base:string) => {
    const noticias = await getNoticias(url,base)
    return noticias
  }

  //Valida el mozo con el codigo ingresado IsLogin = true si es valido
  const validMozo = async (id:any) => {   
    //const urlBase = getUrl() 
    //const base = getBaseDatos()
    setIsLogin(false)

    const { data, isError, isPending } = await GetMozoPass(id, urlBase, BaseDatos)
    if (isError) {  
      setIsError(true)
    } else {
      if (data) {
        if (data.length > 0) {
          setMozoId(data[0].idMozo)
          setMozoName(data[0].nombre)
          setIdTipoMozo(data[0].idTipoMozo)
          setIsLogin(true)
          // Busco si hay alguna Noticia y la muestro
          traerNoticias(urlBase,BaseDatos).then((res) => {
            if (res.length > 0) {
              res.map((item) => {
              if ( (item.idMozo ==0)  || (item.idMozo == data[0].idMozo) ) {
                //Alert.alert('AVISO !!',item.descNoticia)
                showMessage({
                            message: "AVISO !!",
                            description: item.descNoticia,
                            type: "info",
                     });
              } 
            })
              
            }
            
          }).catch((err) => {console.log('Error en carga de noticias:',err)
          })
        } else {
          //Alert.alert('ATENCION !!','Codigo de mozo incorrecto')
          showMessage({
            message: "AVISO !!",
            description: "Codigo de mozo incorrecto",
            type: "danger",
     });
        }
      }  
    }  
  }

  useEffect( () => {  
    //const urlBase = getUrl()
    //const baseDatos = getBaseDatos()
    console.log('UseEffect urlBase:',urlBase,' BaseDatos:',BaseDatos)
    const param = traerParam(urlBase,BaseDatos)
    param.then((res) => {
      res.map((item) => {
         item.colorMesaCerrada = convColores(item.colorMesaCerrada)
         item.colorMesaNormal = convColores(item.colorMesaNormal)
         item.colorMesaOcupada = convColores(item.colorMesaOcupada)
         item.colorPostre = convColores(item.colorPostre)
      })
      setParam(res)
      setParametros(res) 
      setUltSector(res[0].sector_ini)
    }).catch((err) => {console.log('Error en carga de parametros:',err)
    
    })
    
    const rubros = traerRubros(urlBase,BaseDatos)
    rubros.then((res) => {
      //console.log('Rubros:',res)
      setRubros(res)      
    }).catch((err) => {console.log('Error en carga de rubros:',err)
      
    })
  }, [urlBase]); 

  useEffect(() => {    
    console.log('loginmozo: ',pass,isLogin,parametros.length)
    if (pass) {
        const stPass = pass.toString().replace(/,/g, '');
        if (stPass.length > 0) {
          validMozo(stPass).finally(() => {
          //console.log(pass,isLogin)
          })
        }   
    } 
  }, [pass]);

  return (
    <SafeAreaView style={styles.container}>
      <FlashMessage position="top" />
        <View style={styles.body}>
        { isPending  &&
        <View style={styles.activ}>          
          <ActivityIndicator size="large" color="#0000ff"/> 
        </View>
        }

        {msgError != '' &&
        <View>
          <Text style={styles.text}> {msgError}</Text>
        </View>
        }

        {/* Si no esta logueado, ingrese el codigo de mozo con el teclado  */}
        { ( !isLogin && !isPending ) && <CustomDialPad setPass={setPass}/>}  
        <View>
        <Link href="/config" replace asChild>   
          <TouchableOpacity>
          {urlBase ?
          <Text style={styles.text2}>{urlBase} {BaseDatos} <SimpleLineIcons name="settings" size={20} color={Colors.colorazulboton}/> </Text>
          :
          <Text style={styles.text}> Ir a configuracion <SimpleLineIcons name="settings" size={20} color={Colors.colorazulboton}/> </Text>
          }
          </TouchableOpacity>   
        </Link>
        </View>

        <View>
          <Text style={styles.textver}>Version {version}</Text>
        </View>
       
        {/* Si esta logueado redirige a la pagina de mesas */}
        { isLogin ? <Redirect href="/mesas" /> : <Text> </Text>} 
        
        {/* { isError && <Text> Error en la validacion del mozo</Text>} */}
        

        </View>
    </SafeAreaView>
  )
}

export default mozos


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

  textver: {
    fontSize: 15,
    fontWeight: 'bold',
    alignSelf: 'center',  
    color: 'lightblue',
    paddingTop: 10,
  },

  text2: {
    fontSize: 15,
    alignSelf: 'center',  
    color: 'white',
    paddingTop: 10,
  },

  activ: {
    margin: 20,
  }
})


