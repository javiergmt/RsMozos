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
import InputSpinner from "react-native-input-spinner";
import FlashMessage from "react-native-flash-message";
import { showMessage, hideMessage } from "react-native-flash-message";
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry'


type Gustos ={
  idGusto: number;
  descGusto: string;
  cant:number;
  idPlatoRel:number;
}

const selGustos = () => {
  const {id} = useLocalSearchParams() // id es lo que recibe
  const idTam = Number(id)
  const { urlBase ,getUltItem,setMesaDet,setUltDetalle,getUltDescTam,setUltDescTam,getUltRubro,
          mesaDet,ultMesa,ultDetalle,mozo,BaseDatos,comensales,ultRubSub,totMesa,setTotMesa} = useLoginStore()
  const [item, setItem] = useState<platosType>( getUltItem() )
  const [gustos, setGustos] = useState( [] as gustosType[])
  const [cantGustos, setCantGustos] = useState(0)
  const [cantMaxGustos, setCantMaxGustos] = useState(0)
  const [grabarGustos, setGrabarGustos] = useState(false)
  const [mesaGustos, setMesaGustos] = useState( [] as Gustos[]) 
  const [rubrosub, setRubroSub] = useState("")
  console.log('UltRubroenGustos:',rubrosub)

  const handleGustosInc = (cantg:number,inc:number, id:number,descrip:string,idPlatoRel:number) => {
    let cant = cantGustos + inc
    let noEsta = true       
    mesaGustos.forEach((m) => {
        if (m.idGusto == id) {
          m.cant = cantg
          noEsta = false
        }
    })
    if (noEsta) {
        setMesaGustos([...mesaGustos,{idGusto:id,descGusto:descrip,cant:cantg,idPlatoRel:idPlatoRel}])
    }
      setCantGustos(cant)
      if (cant > cantMaxGustos) {
       //Alert.alert('Atención','No puede seleccionar más de '+cantMaxGustos.toString()+' Variedades')
       showMessage({
              message: "ATENCION !!",
              description: "No puede seleccionar más de "+cantMaxGustos.toString()+" Variedades",
              type: "danger",
              });
    } 
      
    //console.log('MesaGustos:',mesaGustos)
  }

 const handleConfirmar = async () => {
    //console.log('MesaGustos:',mesaGustos)
    const hora = getHoraActual()
    let nDet = 1;
    const platopcio = await getPlato_Precio(item.idPlato, idTam, ultMesa.idSector, hora, urlBase,BaseDatos)
      const detgus = [] as gustosDet[]
      let detalle = ''
      mesaGustos.forEach((m) => {
        if (m.cant > 0) {
          detgus.push({ idGusto: m.idGusto, descripcion: m.cant > 1 ? '('+m.cant+')'+m.descGusto : m.descGusto,idPlatoRel: m.idPlatoRel })
          detalle = detalle + m.descGusto + ','
        }
      })

      //console.log('Gustos:',detgus)
      setTotMesa(totMesa + (platopcio ? platopcio[0].pcioUnit : 0) )
      const det:mesaDetType = { 
      nroMesa: ultMesa.nroMesa,
      idPlato: item.idPlato,
      idDetalle: ultDetalle + nDet,
      cant: 1,
      pcioUnit: (platopcio ? platopcio[0].pcioUnit : 0),
      importe: (platopcio ? platopcio[0].pcioUnit : 0),
      descripcion: item.descripcion,
      obs: '',
      esEntrada: false,
      cocido: '',
      idTamanio: idTam,
      descTam: getUltDescTam(),
      idSectorExped: (platopcio ? platopcio[0].idSectorExped : 0),
      gustos: detgus,  
      idTipoConsumo: item.idTipoConsumo,
      impCentralizada:  (platopcio ? platopcio[0].idSectorExped : 0),
      detalles: detalle
      } 
      //console.log('Detalle:',det)
      nDet = nDet + 1;
    
      mesaDet.push(det)
      setMesaDet(mesaDet) 
     
      // Recorro los gustos y si hay platos relacionados los agrego a mesaDet
      mesaGustos.forEach(async (m) =>  {
      if ( (m.cant > 0) && (m.idPlatoRel > 0) ) {
      
        const platopcio = await getPlato_Precio(m.idPlatoRel, 0, ultMesa.idSector, hora, urlBase,BaseDatos)

          //console.log('Plato Rel:',platopcio)
          
          const det:mesaDetType = { 
            nroMesa: ultMesa.nroMesa,
            idPlato: m.idPlatoRel,
            idDetalle: ultDetalle + nDet,
            cant: 1,
            pcioUnit: (platopcio ? platopcio[0].pcioUnit : 0),
            importe: (platopcio ? platopcio[0].pcioUnit : 0),
            descripcion: m.descGusto,
            obs: '',
            esEntrada: false,
            cocido: '',
            idTamanio: 0,
            descTam: '',
            idSectorExped: (platopcio ? platopcio[0].idSectorExped : 0),
            gustos: [],  
            idTipoConsumo: 'CD',
            impCentralizada:  (platopcio ? platopcio[0].idSectorExped : 0),
            detalles: ''
            } 
            //console.log('det2',det)

            mesaDet.push(det)
            setMesaDet(mesaDet) 
            nDet = nDet + 1;
            //console.log('Mesadet c/extra',mesaDet)
          
      }
      })  
    
      showMessage({
        message: "Plato con gustos Agregado!!",
        description: "El Plato fue agregado a la Comanda",
        type: "success",
   
      });
    setUltDetalle(ultDetalle+nDet+1)
    setRubroSub(ultRubSub)
    setUltDescTam('')
    setTimeout(() => setGrabarGustos(true),
      1000
    )
    
    //showToast('Plato con gustos Agregado!!')
  
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
     <Stack.Screen options={{headerTitle: `Mesa ${ultMesa.nroMesa} -  ${comensales} Pers.`, headerTitleAlign: 'center'}} /> 
      <FlashMessage position="top" />
       <View> 
        <Text style={styles.tituloText}>  {item.descripcion}  </Text>
       </View> 
       <View> 
         { !grabarGustos && cantGustos > 0 && cantGustos <= cantMaxGustos ?
          <TouchableOpacity onPress={handleConfirmar}  >
            <Text style={styles.valText}>Confirmar seleccion</Text>
          </TouchableOpacity>
          :<Text style={styles.valText}>Seleccionar - Max: {item.cantgustos}</Text>
          }
          </View>
       <ScrollView>

       { !grabarGustos && gustos.map((g) => ( 
        <View style={styles.checkboxContainer} key={g.idGusto}>
          
            <View style={styles.col}>
						<Text style={styles.text}>{g.descGusto}</Text>
						<InputSpinner
							value={0}
							style={styles.spinner}
							color={Colors.colorcheckbox}
            
              onIncrease={(value) => { handleGustosInc(value as number,1,g.idGusto,g.descGusto,g.idPlatoRel)
              }}
              onDecrease={(value) => { handleGustosInc(value as number,-1,g.idGusto,g.descGusto,g.idPlatoRel)
              }}
						/>
					  </View>
        </View>
         
         ))}
  
          {
          grabarGustos ? <Redirect href={`platos/${ultRubSub}`} /> : <Text></Text>
          }  
          </ScrollView>
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

  col: {
		flex: 1,
		marginBottom: 5,
		flexDirection: "row",
		alignItems: "center",
		textAlign: "left",
		textAlignVertical: "center",
	},
	text: {
		flex: 3,
		marginRight: 20,
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.colorazulboton,
	},
	title: {
		marginBottom: 40,
		fontSize: 30,
	},
	spinner: {
		flex: 1,
		marginRight: 10,
		minWidth: 50,
    backgroundColor: 'white',
	},
})

export default selGustos