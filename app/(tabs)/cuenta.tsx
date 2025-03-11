import { View, Text, Button, ScrollView, TouchableOpacity,StyleSheet, TextInput, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Redirect, Stack } from 'expo-router'
import { useLoginStore } from '../store/useLoginStore'
import { getMesaDet } from '../ApiFront/Gets/GetDatos'
import { mesaDetType,mesaDetPost } from '../ApiFront/Types/BDTypes'
import Colors from '../../constants/Colors'
import { EliminarMesa, LiberarMesa, AgregarDetalleMulti, CerrarMesa } from '../ApiFront/Posts/PostDatos'
import { AntDesign ,Entypo } from '@expo/vector-icons';
import { capitalize, getHoraActual } from '../Funciones/deConversion'
import FlashMessage from "react-native-flash-message";
import { showMessage, hideMessage } from "react-native-flash-message";

const cuenta = () => {
  const {mozo,ultMesa,ultDetalle,setUltDetalle,getParam,
    mesaDet,mesaDetGustos,mesaDetModif,urlBase,
    setMesaDet,origDetalle,setOrigDetalle,
    getBaseDatos,BaseDatos, comensales} = useLoginStore()
  const [cuenta, setCuenta] = useState<mesaDetType[]>([])
  const [verAnt, setVerAnt] = useState(true)
  const [isError, setIsError] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [origDet, setOrigDet] = useState(0)
  const [comandar, setComandar] = useState(false)
  const [itemSel, setItemSel] = useState(0) 
  const [info, setInfo] = useState(false)
  const [text, onChangeText] = useState('');
  const [descSel, setDescSel] = useState('')
  const [esEntSel, setEsEntSel] = useState(false)
  const [salir, setSalir] = useState(false)
  const Param = getParam()
  const [refreshing,setRefreshing] =useState(false);

  // Trae los datos de En_NesaDet
  const traerCuenta = async (url:string,base:string) => {
    const { cuenta, isError, isPending } = await getMesaDet(ultMesa.nroMesa,url,base)
    return cuenta
  }

  const handleinfotext = () => { 
    mesaDet.forEach((m) =>{
      if(m.idDetalle == itemSel){
        m.obs = text
        m.esEntrada = esEntSel
      }})
    setInfo(false)
    onChangeText('')
  }

  const handleInfo = () => {  
    if (itemSel != 0) {
      mesaDet.forEach((m) =>{
        if(m.idDetalle == itemSel){
          setDescSel(m.descripcion)
          setEsEntSel(m.esEntrada)
          onChangeText(m.obs) 
        }})
     setInfo(true)
    }  
  }

  const handleCerrar = async () => {  
    
    const res = await CerrarMesa(ultMesa.nroMesa,urlBase,BaseDatos)
    setSalir(true)
   
   
    
    return
  }

  const handleComandar = async (ok:boolean) => {
   if (!ok) {
      // Desbloquear la mesa o Elimirarla en caso de que no tenga detalle
      if (  ultMesa.ocupada == 'N' ) {
       const res = await EliminarMesa(ultMesa.nroMesa,urlBase,BaseDatos)
      } else {
       const res = await LiberarMesa(ultMesa.nroMesa,false,urlBase,BaseDatos)
       
    }
      // No grabo nada y vuelvo a mesas
      
      setComandar(true)
      return
    }

    // Desbloquear la mesa o Elimirarla en caso de que no tenga detalle
    if ( ( origDetalle == ultDetalle) && ultDetalle == 0 && ultMesa.ocupada == 'N' ) {
       const res = await EliminarMesa(ultMesa.nroMesa,urlBase,BaseDatos)
    } else {
       const res = await LiberarMesa(ultMesa.nroMesa,false,urlBase,BaseDatos)       
    }
    
    // Grabo la mesa y vuelvo a mesas
    const mDet = mesaDet.filter((m) => m.idDetalle > origDetalle)
    const detalle =[] as mesaDetPost[]
    mDet.forEach((m) => {

        const det ={ 
          nroMesa: ultMesa.nroMesa,
          idDetalle: m.idDetalle,          
          idPlato: m.idPlato,
          idTipoConsumo: m.idTipoConsumo,
          cant: m.cant,
          pcioUnit: m.pcioUnit,
          importe: m.importe,
          obs: m.obs,
          idTamanio: m.idTamanio,
          tamanio: m.descTam,
          procesado: true,
          hora: getHoraActual(),
          idMozo: mozo.idMozo,
          nombreMozo: mozo.nombre,
          idUsuario: 0,
          cocinado: true,
          esEntrada: m.esEntrada,
          descripcion: m.descripcion,
          fechaHora: new Date().toISOString(),
          comanda: true,
          idSectorExped: m.idSectorExped,
          impCentralizada: m.impCentralizada,
          gustos: m.gustos,
          combos: m.combos,
         
        }
        
        detalle.push(det)
      })

      if (mDet.length > 0){
        // Esta es la grabacion del detalle de la mesa
        // Los errores se chekean en la funcion AgregarDetalleMulti
        // y se generan mensajes informando el resultado 
        const res = AgregarDetalleMulti(detalle,urlBase,BaseDatos)
       
      }

      mesaDet.splice(0,mesaDet.length)
      mesaDetGustos.splice(0,mesaDetGustos.length)
      mesaDetModif.splice(0,mesaDetModif.length) 
  
      //setComandar(true)  
      showMessage({
        message: "Plato con Modif Agregado!!",
        description: "El Plato fue agregado a la Comanda",
        type: "success",
     
      });
      setTimeout(() => setComandar(true),
      1000
      )   
  }  

  const handleVerAnt = () => {  
    setVerAnt(!verAnt)
  }

  const handleSelec = (id:number) => {
    if (!info) {
    setItemSel(id)
    }
  }

  const handleBorrar = () => {
    // Borrar el item seleccionado
    if (itemSel != 0) {
      const mDet = mesaDet.filter((m) => m.idDetalle != itemSel)
      setMesaDet(mDet)
      setCuenta(mDet)
    }
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

  const handleCantidad = (cant:number) => {
    // Cambiar la cantidad del item seleccionado
    if (itemSel != 0) {
    mesaDet.forEach((m) =>{
       if(m.idDetalle == itemSel){
          if (m.cant + cant <= 0) {
              m.cant = 0
              m.importe = 0
              const mDet = mesaDet.filter((m) => m.idDetalle != itemSel)
              setMesaDet(mDet)
              setCuenta(mDet)
              return
          } else {    
              m.cant = m.cant + cant
              m.importe = m.cant * m.pcioUnit
              setMesaDet(mesaDet)
              setCuenta(mesaDet)
              return
          }          
       }
    })
    
    }
  
  }

  useEffect(() => {
    if (mesaDet.length == 0) {
      // Es la primera vez que se carga la cuenta
      
      // Traigo la cuenta de la mesa de En_mesadet ( puede ser vacia )
      const cuenta = traerCuenta(urlBase,BaseDatos)
      cuenta.then((res) => {
        const result = res.length > 0 ? res[res.length-1].idDetalle : 0
        setMesaDet(res)
        setCuenta(res)       
        setUltDetalle(result)
        setOrigDetalle(result)
        setOrigDet(result)
      })  
    
    } else {
      // Ya se cargo la cuenta
      setCuenta(mesaDet)

    }

    //console.log('orig ',origDet)
    
  }, []);

  return (
   
    <View style={styles.container}>
     
     <Stack.Screen options={{
                              headerTitle: `Mesa ${ultMesa.nroMesa} - ${comensales} Pers.`,
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
                                <AntDesign name="closecircle" size={35} color={Colors.colorBackBoton} />
                                </TouchableOpacity>
                                </View>
                              )                                 
                              }}
                              />
                              
                              
                                               
        { salir && <Redirect href="/mesas" />}                      
        <View>                      
        <Text style={styles.titulo}>Detalle de la cuenta</Text> 
        </View>

       
        <ScrollView >
       
        { isPending && 
        <View>
        <ActivityIndicator size="large" color="#0000ff"/>
        </View>
        }

        {cuenta.length>0 && cuenta.map((c) => (
          <View  key={c.idDetalle} >
          { (c.idDetalle > origDet) && 
         
            <View style={styles.itemContainer} >    
              <TouchableOpacity style={styles.itemSelContainer} onPress={()=>handleSelec(c.idDetalle)} >
              {c.idDetalle == itemSel ?
              <Entypo name="vinyl" size={20} color={Colors.colorcheckbox} />
              :
              <Entypo name="circle" size={20} color={Colors.colorcheckbox} />
              }
              <Text style={styles.item}> {c.cant.toFixed(2).toString().padStart(8,'')} </Text>
              <Text style={styles.item}> {capitalize(c.descripcion)}</Text>
              </TouchableOpacity>  
            </View>
     
          }
          {c.idDetalle <= origDet && verAnt && 
          <View style={styles.itemContainer}>     
          <Entypo name="circle" size={15} color={Colors.background} />
          <Text style={styles.itemorig}> {c.cant.toFixed(2).toString().padStart(8,'')} </Text>
          <Text style={styles.itemorig}> {capitalize(c.descripcion)}</Text>
          </View>
          }
        </View>

        ))}
          
      </ScrollView>
      

      {info &&
       <View style={styles.modalContainer}>
       <Text style={styles.titulo}>Observaciones</Text>
       <Text style={styles.iteminput}>{descSel}</Text>
       <View style={styles.inputContainer}>
       <TextInput
         style={styles.input}
         onChangeText={onChangeText}
         value={text}     
         placeholder='Observaciones'   
       />
       </View>
       <View style={styles.itemContainer} >    
              <TouchableOpacity style={styles.itemSelContainer} onPress={()=>setEsEntSel(!esEntSel)} >
              {esEntSel ?
              <Entypo name="vinyl" size={20} color={Colors.colorcheckbox} />
              :
              <Entypo name="circle" size={20} color={Colors.colorcheckbox} />
              }              
              <Text style={styles.iteminput}> Es Entrada</Text>
              </TouchableOpacity>  
        </View>
      
        <View style={styles.bottombutton} >
              <TouchableOpacity onPress={() => handleinfotext()} > 
                <Text style={styles.textBtSalir}>Confirmar</Text> 
              </TouchableOpacity>
        </View>
         
       </View>
      }

      <View style={styles.pieContainer}>
      {Param[0].mozosCierranMesa && cuenta.length <= origDet && cuenta.length > 0 &&
      <TouchableOpacity onPress={() => handleCerrar()}  >
      <AntDesign name="filetext1" size={40} color={Colors.colorazulboton} />
      </TouchableOpacity>
      }
      <TouchableOpacity  onPress={()=>handleCantidad(-1)} >
      <AntDesign name="minuscircle" size={40} color="white" />
      </TouchableOpacity>
      <TouchableOpacity onPress={()=>handleCantidad(1)} >
      <AntDesign name="pluscircle" size={40} color="white" />
      </TouchableOpacity>      
      <TouchableOpacity  onPress={()=>handleBorrar()} >
      <AntDesign name="delete" size={40} color="white" />
      </TouchableOpacity>     
      <TouchableOpacity onPress={()=>handleInfo()}>
      <AntDesign name="form" size={40} color="white" />
      </TouchableOpacity>     
      <TouchableOpacity onPress={() => handleVerAnt()}  >
      {verAnt ? <AntDesign name="eye" size={40} color="white" /> 
              : <AntDesign name="eyeo" size={40} color="white" />}  
   
      </TouchableOpacity>      

      <TouchableOpacity onPress={() => handleComandar(true)}  >
      <AntDesign name="printer" size={40} color={Colors.colorazulboton} />
      </TouchableOpacity>
      </View> 

      {
          comandar ?<Redirect href={`/mesas`}  /> : <Text></Text>
      }
       

    </View>

     
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,    
    justifyContent: 'center',
    margin: 0,
    backgroundColor: Colors.background,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginRight: 10,

    //padding: 5,
  },modalContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    margin: 10,                      
    borderRadius: 8,
    borderWidth: 2,
    backgroundColor: Colors.colorBackModal,
    //padding: 5,
  },
  itemSelContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginRight: 10,
    //padding: 5,
    paddingLeft: 5,
    paddingBottom: 5,

  },
  item: {
    fontSize: 18,
    fontWeight: 'bold',
    alignSelf: 'center',
    color: Colors.colorazulboton,
    paddingLeft: 10,
  },
  itemorig: {
    fontSize: 18,
    fontWeight: 'bold',
    alignSelf: 'center',
    color: Colors.itemsviejos,
    paddingLeft: 20,
  },
  label: {
    margin: 8,
  },
  titulo: {
    fontSize: 30,
    fontWeight: 'bold',
    alignSelf: 'center',
    color: Colors.colorazulboton,    
 },
  pieContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    marginTop: 10
  },
  textinput: {
    fontSize: 20,
    fontWeight: 'bold',
    alignSelf: 'center',  
    paddingTop: 10,
  },
  input: {
    fontSize: 20,
    fontWeight: 'bold',
    height: 40,
    width: '100%',
    borderWidth: 1,
    padding: 5,
    borderRadius: 8,
  },
  iteminput: {
    fontSize: 18,
    fontWeight: 'bold',
    alignSelf: 'center',
    color: Colors.colorfondoBoton,
    paddingLeft: 10,
  },
  textBtSalir: {
    width:300,
    textAlign:'center',
    fontSize:25,
    fontWeight:'500',
    marginBottom:5,
    color:'white',
    //height:50,
    borderRadius:10,
    backgroundColor:Colors.colorfondoBoton,  
   
  },
  bottombutton: {
    padding: 10,
    alignItems: 'center',
  },
});


export default cuenta