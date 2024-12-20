// Se arman y se dan a seleccionar los Combos con sus secciones

import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { useLoginStore } from '../../store/useLoginStore'
import { comboDetType, comboPostType, comboSecType, combosGustosType, gustosType, mesaDetType, platosType } from '../../ApiFront/Types/BDTypes'
import { getComboDet, getComboSec, getGustos, getPlato_Precio } from '../../ApiFront/Gets/GetDatos'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import Colors from '../../../constants/Colors'
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { getHoraActual } from '../../Funciones/deConversion'
import { showToast } from '../../Funciones/deInfo'
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { Redirect } from 'expo-router'
import { AntDesign } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Gustos ={
  idSeccion: number;
  idPlato: number;
  idGusto: number;
  descGusto: string;
  cant:number
}

const selCombo = () => {
  const { urlBase ,getUltItem,ultMesa,ultDetalle,mesaDet,
          setUltDetalle,setMesaDet,getUltDescTam,BaseDatos} = useLoginStore()
  const [item, setItem] = useState<platosType>( getUltItem() )
  const [comboSec, setComboSec] = useState( [] as comboSecType[]) 
  const [comboDet, setComboDet] = useState( [] as comboDetType[][])  
  const [cantMax, setCantMax] = useState(0)  
  const [ultSeccion, setUltSeccion] = useState(0)
  const [ultPlato, setUltPlato] = useState(0)
  const [isOk, setIsOk] = useState(false)
  const [salir, setSalir] = useState(false)
  const [isGustos, setIsGustos] = useState(false)
  const [gustos, setGustos] = useState( [] as gustosType[])
  const [combosGustos, setCombosGustos] = useState( [] as Gustos[])
  const [cantGustos, setCantGustos] = useState(0)
  const [cantMaxGustos, setCantMaxGustos] = useState(0)
  const [autocompletar, setAutocompletar] = useState(false)
  const [unicoPlato, setUnicoPlato] = useState('')
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = ['80%', '60%'];
  // SafeArea
  const { bottom, top, right, left } = useSafeAreaInsets();

  const handleConfirmar = () => {
    
    const detalleGustos = (idPlato:number,idSeccion:number)  => {
      let detg = [] as combosGustosType[]
      combosGustos.forEach((g) => {      
        if (g.idPlato == idPlato && g.idSeccion == idSeccion) {
         
          detg.push({
            idSeccion: g.idSeccion, 
            idPlato: g.idPlato, 
            idGusto: g.idGusto, 
            descripcion: g.descGusto})
        }                
      })
      //console.log('Gustos:',detg)
      return detg 
    }

    const hora = getHoraActual()
    const platoprecio = getPlato_Precio(item.idPlato, 0, ultMesa.idSector, hora, urlBase,BaseDatos)
    platoprecio.then((res) => { 
      const detcombo = [] as comboPostType[]
      
      comboDet.forEach((cd) => {
        let detgustos = [] as combosGustosType[]
        cd.forEach((d) => {
          //console.log('Gustos',d.idPlato,detgustos,detgustos.filter( (g) => {g.idPlato == d.idPlato}))
          if (d.selected) {

            if (d.idTipoConsumo == 'CV') { 
              detgustos = detalleGustos(d.idPlato,d.idSeccion)
              //console.log('Gustos:', d.idPlato, detgustos          
            } 
           
            detcombo.push(
              { idSeccion: d.idSeccion,
                idPlato: d.idPlato, 
                procesado: false,
                cocinado: false,                 
                cant: 1,
                idTamanio: d.idTamanio,
                tamanio: d.tamanio,
                obs: '',
                fechaHora: new Date().toISOString(),
                comanda: true,
                descripcion: d.descripcion,
                idSectorExped: d.idSectorExped, 
                impCentralizada: d.impCentralizada,              
                combosGustos: detgustos.length > 0 ? detgustos : []                
              })           
              
          }         
        })        
      })

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
        idTamanio: 0,
        descTam: getUltDescTam(),
        idSectorExped: (res ? res[0].idSectorExped : 0),
        impCentralizada: (res ? res[0].impCentralizada : 0),
        gustos: [],
        combos: detcombo,
        idTipoConsumo: 'CB'
      } 

      mesaDet.push(det)
      setUltDetalle(ultDetalle+1)
      setMesaDet(mesaDet)
      showToast('Combo Agregado!!')
      setSalir(true)
    })
  }

  // Control de cada seccion que se selecciona
  const handleSecciones = async (id:number,cmax:number,auto:boolean,descCorta:string) => {
    setUltSeccion(id)
    setCantMax(cmax)
    setAutocompletar(auto)
    if (auto) {
       setUnicoPlato(descCorta)
       setIsOk(true)
    }
  }

  // Control de los gustos de un Plato seleccionado
  const handlePressGusto = (isChecked:boolean, idGusto:number, descGusto:string) => { 
    let cant = cantGustos
    if (isChecked) {   
       let noEsta = true      
       cant = cant + 1
       combosGustos.forEach((m) => {
        if (m.idGusto == idGusto) {
          m.cant = 1
          noEsta = false
        }
       })
       if (noEsta){
        setCombosGustos([...combosGustos,{idSeccion:ultSeccion,idPlato:ultPlato,idGusto:idGusto,descGusto:descGusto,cant:1}])
       }  
      } else {  
       cant = cant - 1
       combosGustos.forEach((m) => {
         if (m.idGusto == idGusto) {
           m.cant = 0
         }
     })
    }
    setCantGustos(cant)
    if (cant > cantMaxGustos) {
        Alert.alert('Atención','No puede seleccionar más de '+cantMaxGustos.toString()+' Variedades')
    } 
    //console.log('Gustos:',combosGustos)
  }

  // Control de la seleccion de platos de cada seccion
  const handlePress = (isChecked:boolean, idSeccion:number,idPlato:number,idTipoConsumo:string,cantGustos:number ) => {
    const loadGustos = async () => {
      const result = await getGustos(idPlato,urlBase,BaseDatos);
      setGustos(result); 
      setUltPlato(idPlato)   
      setCantMaxGustos(cantGustos)  
    };    
    
    comboDet.forEach((cd) => {
      const csel = cd.filter (d => d.idSeccion == idSeccion && d.selected == true).length 
      if (csel+1 > cantMax && isChecked) {
        setIsOk(false)
        Alert.alert('Atención','No puede seleccionar más de '+cantMax+' platos')
      } else {
        setIsOk(true)
        cd.filter (d => d.idSeccion == idSeccion).forEach((d) => {
             if (d.idPlato == idPlato) {
                 d.selected = isChecked
             }
        })
        // Si es consumo variable cargo los gustos
        if (idTipoConsumo == 'CV') {
          setCantGustos(0)
          setCantMaxGustos(0)
          setIsGustos(isChecked)
          loadGustos()
        }  
      }  
    })       
  } 

  const cargaSeccion = (id:number) => {
      const load = async () => {     
      const result = await getComboDet(id,urlBase,BaseDatos);
      if (result.length > 1) {  
        result.forEach((r) => {
          r.selected = false                  
        })    
      } else {
        result.forEach((r) => {
          r.selected = true       
        })
      }     
     
      return result        
    };
    const res = load();
   
    return res    
  }

  const handleBottomSheet = () => { 
    //console.log('Comensales Grabados:',res)
  }

  const handleConfirmarGustos = () => {
    sheetRef.current?.close()
    setCantGustos(0)
    setIsGustos(false)
    
  }

  useEffect(() => {
    const it = getUltItem()
    setItem(it)
    console.log('Traigo Item:',it)
    setComboDet(null)
    const load = async () => {
      const result = await getComboSec(it.idPlato,urlBase,BaseDatos);
      return result
    } 
   
    load().then((res) => {
      setComboSec(res)
      let sec = [] as comboDetType[][]
      res.map (async (s) => {
        const seccion = await cargaSeccion(s.idSeccion)  
        //console.log('Seccion:',seccion)    
        sec.push(seccion)
      })
      setComboDet(sec)
    })

  },[] )

  return (
  <GestureHandlerRootView style={{ flex: 1 }}>
  <View style={styles.container}>
 
    <View style={styles.containerTitulo}>
       <Text style={styles.tituloText}> {item.descripcion}  </Text>
    </View>   

    {/* Despliego las Secciones de Combos */}
    { comboSec &&
    <View>
    <ScrollView horizontal contentContainerStyle={styles.containerScrollh}>
      { comboSec.map((s) => (
            
         <TouchableOpacity key={s.idSeccion} onPress={() => handleSecciones(s.idSeccion,s.cantMax,s.autocompletar,s.descCorta)}>
           <View style={[styles.card]}>     
              <Text style={[styles.heading]}>{s.descripcion+' ('+s.cantMax+')'}</Text>
            </View>
         </TouchableOpacity>
    
     
      ))}
    </ScrollView >
    </View>
    }
    
    {/* Despliego los Platos de la seccion*/}
 
    { comboDet && autocompletar &&
      <View style={{flex: 1}}>
      <ScrollView contentContainerStyle={styles.containerScrollv} >
      
        <Text style={styles.checkbox}><AntDesign name="check" size={25} color={Colors.colorazulboton} /> {unicoPlato} </Text>
      
      </ScrollView>
      </View>
    }
    { comboDet && !autocompletar &&
      <View style={{flex: 1}}>
      <ScrollView contentContainerStyle={styles.containerScrollv} >
      {
        comboDet.map((cd) => (
        cd.filter (d => d.idSeccion == ultSeccion).map((d) => (
         
        <View style={styles.checkboxContainer} key={d.idPlato} >         
          <BouncyCheckbox           
            size={25}
            fillColor={Colors.colorcheckbox}
            //unFillColor="#FFFFFF"
            isChecked={d.selected}
            text={' '+d.descripcion +' '+d.tamanio}
            textStyle={{  color: "white",textDecorationLine: "none" }}
            //iconStyle={{ borderColor: "blue" }}
            innerIconStyle={{ borderWidth: 2 }}
            onPress={(isChecked: boolean) => {handlePress(isChecked, d.idSeccion,d.idPlato,d.idTipoConsumo,d.cantGustos)}}
          />           
        </View>
       
        ))
        ))
      }

      </ScrollView>
      </View>
     
      
    }
   
    {isOk && 
       <View style={styles.containerTitulo}>
        <TouchableOpacity onPress={handleConfirmar}  >
            <Text style={styles.textBtSalir}>Confirmar</Text>
        </TouchableOpacity>
        </View>
     }    


   {isGustos &&
   
   <BottomSheet
         ref={sheetRef}
         snapPoints={snapPoints}
         enablePanDownToClose={true}
         onClose={() => handleBottomSheet()}
      >
      
      <View style={{ flex: 1 }}>

      <View>
          { cantGustos > 0 && cantGustos <= cantMaxGustos ?    
          <TouchableOpacity onPress={handleConfirmarGustos}  >
            <Text style={styles.valText}>Confirmar Gustos</Text>
          </TouchableOpacity>
          :<Text style={styles.valTextSel} >Seleccionar Gustos</Text>
          }
      </View>  
      
      <BottomSheetScrollView contentContainerStyle={styles.containerScrollvSheet}>
      { gustos.map((g) => 
        <View style={styles.checkboxContainer} key={g.idGusto}>
          <BouncyCheckbox
            size={25}
            fillColor={Colors.colorcheckbox}
            //unFillColor="#FFFFFF"
            text={g.descGusto}
            textStyle={{  color: "black",textDecorationLine: "none" }}
            //iconStyle={{ borderColor: "blue" }}
            innerIconStyle={{ borderWidth: 2 }}
            onPress={(isChecked: boolean) => {handlePressGusto(isChecked, g.idGusto, g.descGusto)}}  
          />
        </View>
      )}      
      </BottomSheetScrollView>
      
      </View>
       
    </BottomSheet> 
   
    }
    {
      salir ? <Redirect href={`platos/${item.idRubro}`} /> : <Text></Text>
    }
  </View>
  </GestureHandlerRootView>
   
    
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  containerTitulo: {
    alignContent: 'center', // tiene efecto si esta el wrap    
    height: 50,
    alignItems: 'center',
    marginTop: 20,   
  },
  containerScrollh: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap:10,
    marginLeft: 10,
    //alignContent: 'center', // tiene efecto si esta el wrap
   
    
  },
  containerScrollv: { 
    //alignContent: 'center', // tiene efecto si esta el wrap
    marginBottom: 20,  
  },
  containerScrollvSheet: { 
    //alignContent: 'center', // tiene efecto si esta el wrap
    //marginBottom: 20,  
  },
  containerTituloSheet: {
    alignContent: 'center', // tiene efecto si esta el wrap    
    height: 50,
    alignItems: 'center',
    //marginTop: 20,   
  },
  cont_Pie: {
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    width: '100%',
    height: 60,
  },

  heading: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 5,
    color: 'white',
  },
  card: {
    backgroundColor: Colors.backbotones,
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 10,
    width: '100%',
    height: 40,
    marginRight: 15,
  },
  
  checkboxContainer: {
    flexDirection: 'row',  
    alignItems: 'center',
    justifyContent: 'center',    
    marginLeft: 20,
    padding: 10,
    gap: 10,
  
  },
  checkbox: {
    fontSize: 15,
    //fontWeight: 'bold',
    marginLeft: 25,
    alignSelf: 'flex-start',
    color: 'white',
    
  },
  tituloText: {
    fontSize: 35,
    fontWeight: "bold",
    color: Colors.colorazulboton,
    alignSelf: 'center',
    //marginBottom: 10,
    //borderBottomWidth: 1,
    //borderColor: Colors.colorborderubro,
    
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
  valTextSel: {
    fontSize: 25,
    fontWeight: "bold",
    color: Colors.colorfondoBoton,
    //backgroundColor: Colors.colorBackBoton,
    padding: 5,
    borderRadius: 10,
    textAlign: "center",
    margin: 20
  },
  textBtSalir: {
    width:350,
    textAlign:'center',
    fontSize:20,
    fontWeight:'bold',
    padding:5,
    color:'white',
    height:40,
    borderRadius:10,
    backgroundColor:Colors.colorfondoBoton,  
   
  },
});  

export default selCombo