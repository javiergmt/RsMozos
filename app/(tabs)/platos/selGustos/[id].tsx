// Para platos de consumo variable, permite seleccionar los gustos del plato.
// Recibe un parametro id que es el id del modificador seleccionado o 0.
// Es para los casos que un plato de tipo CV tenga modificadores

import { View, Text, SafeAreaView ,ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useLoginStore } from '../../../store/useLoginStore'
import { getGustos, getPlato_Precio } from '../../../ApiFront/Gets/GetDatos'
import { Link, Redirect, Stack, useLocalSearchParams } from 'expo-router'
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { gustosDet, gustosType, mesaDetGustosType, mesaDetType, platosType } from '../../../ApiFront/Types/BDTypes'
import { getHoraActual } from '../../../Funciones/deConversion'
import { showToast } from '../../../Funciones/deInfo'
import Colors from '../../../../constants/Colors'


type Gustos ={
  idGusto: number;
  descGusto: string;
  cant:number
}

const selGustos = () => {
  const {id} = useLocalSearchParams() // id es lo que recibe
  const idTam = Number(id)
  const { urlBase ,getUltItem,setMesaDet,setUltDetalle,getUltDescTam,setUltDescTam,
          mesaDet,ultMesa,ultDetalle,mozo,BaseDatos} = useLoginStore()
  const [item, setItem] = useState<platosType>( getUltItem() )
  const [gustos, setGustos] = useState( [] as gustosType[])
  const [cantGustos, setCantGustos] = useState(0)
  const [cantMaxGustos, setCantMaxGustos] = useState(0)
  const [grabarGustos, setGrabarGustos] = useState(false)
  const [mesaGustos, setMesaGustos] = useState( [] as Gustos[]) 
  
  const handlePress = (isChecked:boolean, id:number,descrip:string ) => {
    let cant = cantGustos
    if (isChecked) { 
      let noEsta = true       
      cant = cant + 1
      mesaGustos.forEach((m) => {
        if (m.idGusto == id) {
          m.cant = 1
          noEsta = false
        }
      })
      if (noEsta) {
        setMesaGustos([...mesaGustos,{idGusto:id,descGusto:descrip,cant:1}])
      }
    } else {  
      cant = cant - 1
      mesaGustos.forEach((m) => {
        if (m.idGusto == id) {
          m.cant = 0
        }
      })
    }
    setCantGustos(cant)
    if (cant > cantMaxGustos) {
       Alert.alert('Atención','No puede seleccionar más de '+cantMaxGustos.toString()+' Variedades')
    } 
    console.log('Gustos:',mesaGustos)
  }
  
 const handleConfirmar = () => {
    
    const hora = getHoraActual()
    const platoprecio = getPlato_Precio(item.idPlato, idTam, ultMesa.idSector, hora, urlBase,BaseDatos)
  
    platoprecio.then((res) => { 

      const detgus = [] as gustosDet[]
      mesaGustos.forEach((m) => {
        if (m.cant > 0) {
          detgus.push({ idGusto: m.idGusto, descripcion: m.descGusto })
        }
      })

      //console.log('Gustos:',detgus)

      const det:mesaDetType = { 
      nroMesa: ultMesa.nroMesa,
      idPlato: item.idPlato,
      idDetalle: ultDetalle + 1,
      cant: 1,
      pcioUnit: (res ? res[0].pcioUnit : 0),
      importe: (res ? res[0].pcioUnit : 0),
      descripcion: item.descripcion,
      obs: '',
      esEntrada: false,
      cocido: '',
      idTamanio: idTam,
      descTam: getUltDescTam(),
      idSectorExped: (res ? res[0].idSectorExped : 0),
      gustos: detgus,  
      idTipoConsumo: item.idTipoConsumo,
      impCentralizada:  (res ? res[0].idSectorExped : 0)
      } 
      console.log('Detalle:',det)
    
      mesaDet.push(det)
      setUltDetalle(ultDetalle+1)
      setMesaDet(mesaDet)
      setGrabarGustos(true)
      setUltDescTam('')
      //console.log('mesaDet con gustos:',mesaDet)
      showToast('Plato con gustos Agregado!!')
    })    
    
  }

  useEffect(() => {
    const it = getUltItem()
    setItem(it)
    console.log('Traigo Item:',it)
    setCantMaxGustos(it.cantgustos)
    const load = async () => {
      const result = await getGustos(it.idPlato,urlBase,BaseDatos);
      setGustos(result);
      console.log('Traigo gustos:',result)
    };
    load();
   
  },[item] )
 
  return (
    <SafeAreaView style={styles.container}>
     <View >
     <Stack.Screen options={{headerTitle: `Mesa ${ultMesa.nroMesa} - Mozo: ${mozo.nombre}`, headerTitleAlign: 'center'}} /> 
  
       <View> 
        <Text style={styles.tituloText}>  {item.descripcion} - Max: {item.cantgustos} </Text>
       </View> 

       { !grabarGustos && gustos.map((g) => ( 
        //<View style={styles.checkboxContainer} key={g.idGusto}>
        <ScrollView contentContainerStyle={styles.cont_checkbox} key={g.idGusto} >   
          <BouncyCheckbox
            size={25}
            fillColor={Colors.colorcheckbox}
            //unFillColor="#FFFFFF"
            text={g.descGusto}
            textStyle={{  color: "white" ,textDecorationLine: "none",}}
            //iconStyle={{ borderColor: "blue" }}
            innerIconStyle={{ borderWidth: 2 }}
            onPress={(isChecked: boolean) => {handlePress(isChecked, g.idGusto, g.descGusto)}}
          />  
          {/* <Text style={styles.checkbox}>{g.descGusto}</Text> */}
         </ScrollView>
         //</View>
         ))}
   
     
         <View> 
         { !grabarGustos && cantGustos > 0 && cantGustos <= cantMaxGustos ?
          <TouchableOpacity onPress={handleConfirmar}  >
            <Text style={styles.valText}>Confirmar</Text>
          </TouchableOpacity>
          :<Text></Text>
          }
          </View>
          {
          grabarGustos ? <Redirect href={`platos/${item.idRubro}`} /> : <Text></Text>
          }  
         </View>
          
     </SafeAreaView>
  
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,

  },
  checkboxContainer: {
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'center',    
    marginLeft: 20,  
    marginBottom: 10, 
    marginTop: 10,

  },
  cont_checkbox: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 20,  
    marginBottom: 5, 
    marginTop: 5,
      //height: '100%',
    },
  checkbox: {
    fontSize: 20,
    fontWeight: 'bold',
    alignSelf: 'center',
    color: 'white',
   
  },
  label: {
    margin: 8,
  },

  tituloText: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.colorazulboton,
    alignSelf: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderColor: Colors.colorborderubro,
    
  },
  valText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    backgroundColor: Colors.colorfondoBoton,
    padding: 5,
    borderRadius: 10,
    textAlign: "center",
    margin: 20
  },
})

export default selGustos