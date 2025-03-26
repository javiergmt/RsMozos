import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useLoginStore } from '../../store/useLoginStore'
import { platosType, modifType } from '../../ApiFront/Types/BDTypes'
import { getModif, getPlato_Precio } from '../../ApiFront/Gets/GetDatos'
import { Redirect, Stack } from 'expo-router'
import { getHoraActual } from '../../Funciones/deConversion'
import { showToast } from '../../Funciones/deInfo'
import { Entypo } from '@expo/vector-icons';
import Colors from '../../../constants/Colors'
import FlashMessage from "react-native-flash-message";
import { showMessage, hideMessage } from "react-native-flash-message";


const selTam = () => {
  const { urlBase ,getUltItem, getUltSector,mesaDet,mesaDetModif,ultMesa,ultDetalle,ultSector,
    setUltDetalle,setMesaDet,setUltDescTam,BaseDatos,comensales,ultRubro,ultRubSub} = useLoginStore()

  const [item, setItem] = useState<platosType>()
  const [modif, setModif] = useState( [] as modifType[])
  const [grabarTam, setGrabarTam] = useState(false) 
  const [descPlato, setDescPlato] = useState('')
  const [goGustos, setGoGustos] = useState(0)

  const handleConfirmar = (id:number,descrip:string) => {
    if (item.idTipoConsumo == "CV") {
      setGoGustos(id)
      setUltDescTam(descrip)
      return
    } else {
      const hora = getHoraActual()
      const platoprecio = getPlato_Precio(item.idPlato,id,ultMesa.idSector,hora,urlBase,BaseDatos)
        platoprecio.then((res) => {     
        const det = { 
        nroMesa: ultMesa.nroMesa,
        idPlato: item.idPlato,
        idDetalle: ultDetalle + 1,
        cant: 1,
        pcioUnit: (res ? res[0].pcioUnit : 0) ,
        importe: (res ? res[0].pcioUnit : 0) ,
        descripcion: item.descripcion + ' ' + descrip,
        obs: '',
        esEntrada: false,
        cocido: '',
        idTamanio: id,
        descTam: descrip,
        idSectorExped: (res ? res[0].idSectorExped : 0),
        impCentralizada: (res ? res[0].impCentralizada : 0),
        gustos: [],
        idTipoConsumo: item.idTipoConsumo,
        detalles: '',
        }
        mesaDet.push(det)

        setUltDetalle(ultDetalle+1)
        setMesaDet(mesaDet)
        
        //showToast('Plato con Modif Agregado!!')
        showMessage({
              message: "Plato con Modif Agregado!!",
              description: "El Plato fue agregado a la Comanda",
              type: "success",
           
            });
            setTimeout(() => setGrabarTam(true),
            1000
            )     
      })   
    }
  }

  useEffect(() => {
    const it = getUltItem()
    const sec = getUltSector()
    setItem(it)
    console.log('Traigo Item:',it)
    setDescPlato(it.descripcion)
    
    const load = async () => {
      const result = await getModif(it.idPlato,ultSector,urlBase,BaseDatos);
      if (result.length == 0) {
        const result = await getModif(it.idPlato,0,urlBase,BaseDatos);
        setModif(result);
      } else {
        setModif(result);
      }
      
      console.log('Traigo modif:',sec, result)
    };
    load();
  
  },[] )

  return (
    <SafeAreaView style={styles.container}>
    <View >
      <Stack.Screen options={{headerTitle: `Mesa ${ultMesa.nroMesa} -  ${comensales} Pers.`, headerTitleAlign: 'center'}} /> 
      <FlashMessage position="top" /> 
          
       <View> 
        <Text style={styles.tituloText}> {descPlato}</Text>
       </View> 
       {(goGustos != 0) ? <Redirect href={`/(tabs)/platos/selGustos/${goGustos}`} /> : <Text></Text> }
       {!grabarTam && modif.map((m) => ( 
        <View  key={m.idPlato.toString()+m.idTamanio.toString()}>
          <View style={styles.modifContainer}>
           <TouchableOpacity style={styles.modifContainer} onPress={() =>handleConfirmar(m.idTamanio,m.descTam)}  >
           <Text style={styles.modif}><Entypo name="circle" size={20} color={Colors.colorazulboton} /></Text>
           <Text style={styles.modif}>{m.descTam}</Text>
           </TouchableOpacity>
           </View>
        </View>
             ))}

         {
          grabarTam ? <Redirect href={`platos/${ultRubSub}`} /> : <Text></Text>
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
modifContainer: {
  flexDirection: 'row',
  //justifyContent: 'space-evenly',
  paddingRight: 10,
  paddingBottom: 10,
},
modif: {
  fontSize: 18,
  //fontWeight: 'bold',
  alignSelf: 'center',
  color: 'white',
  paddingLeft: 20,
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
})

export default selTam