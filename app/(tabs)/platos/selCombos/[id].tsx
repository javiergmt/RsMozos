// Se arman y se dan a seleccionar los Combos con sus secciones
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { useLoginStore } from '../../../store/useLoginStore'
import { comboDetType, comboPostType, comboSecType, combosGustosType, gustosType, mesaDetType, platosType } from '../../../ApiFront/Types/BDTypes'
import { getComboDet, getComboSec, getGustos, getPlato_Precio } from '../../../ApiFront/Gets/GetDatos'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import Colors from '../../../../constants/Colors'
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { getHoraActual } from '../../../Funciones/deConversion'
import { showToast } from '../../../Funciones/deInfo'
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { Redirect, Stack, useLocalSearchParams } from 'expo-router'
import { AntDesign } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import InputSpinner from "react-native-input-spinner";
import { tapHandlerName } from 'react-native-gesture-handler/lib/typescript/handlers/TapGestureHandler'
import FlashMessage from "react-native-flash-message";
import { showMessage, hideMessage } from "react-native-flash-message";


type Gustos ={
  idSeccion: number;
  idPlato: number;
  idGusto: number;
  descGusto: string;
  cant:number;
  idPlatoRel:number;
}

const selCombos = () => {
  const {id} = useLocalSearchParams() // id es lo que recibe
  const { urlBase ,getUltItem,ultMesa,ultDetalle,mesaDet,
          setUltDetalle,setMesaDet,getUltDescTam,BaseDatos,comensales,ultRubro} = useLoginStore()
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
  const snapPoints = ['80%', '80%'];
  // SafeArea
  const { bottom, top, right, left } = useSafeAreaInsets();

  const handleConfirmar = async () => {
    
    const detalleGustos = (idPlato:number,idSeccion:number)  => {
      let detg = [] as combosGustosType[]
      combosGustos.forEach((g) => {      
        if (g.idPlato == idPlato && g.idSeccion == idSeccion) {
         
          detg.push({
            idSeccion: g.idSeccion, 
            idPlato: g.idPlato, 
            idGusto: g.idGusto, 
            descripcion: g.descGusto,
            idPlatoRel: g.idPlatoRel,})
        }                
      })
      //console.log('Gustos:',detg)
      return detg 
    }

    const hora = getHoraActual()
    const platopcio = await getPlato_Precio(item.idPlato, 0, ultMesa.idSector, hora, urlBase,BaseDatos)

    const detcombo = [] as comboPostType[]
      
    comboDet.forEach(async (cd) => {
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
        }) // Fin del forEach        
    })
    
    let ndet = 1
    const det:mesaDetType = { 
        nroMesa: ultMesa.nroMesa,
        idPlato: item.idPlato,
        idDetalle: ultDetalle + ndet,
        cant: 1,
        pcioUnit: (platopcio ? platopcio[0].pcioUnit : 0),
        importe: (platopcio ? platopcio[0].pcioUnit : 0),
        descripcion: item.descripcion,
        obs: '',
        esEntrada: false,
        cocido: '',
        idTamanio: 0,
        descTam: getUltDescTam(),
        idSectorExped: (platopcio ? platopcio[0].idSectorExped : 0),
        impCentralizada: (platopcio ? platopcio[0].impCentralizada : 0),
        gustos: [],
        combos: detcombo,
        idTipoConsumo: 'CB'
    } 
    mesaDet.push(det)
    setMesaDet(mesaDet)

    console.log('combosGustos:',combosGustos)
    combosGustos.forEach(async (g) => {
      
      if (g.idPlatoRel > 0) {
        const platopcio = await getPlato_Precio(g.idPlatoRel, 0, ultMesa.idSector, hora, urlBase,BaseDatos)
        ndet = ndet + 1
        const det:mesaDetType = { 
          nroMesa: ultMesa.nroMesa,
          idPlato: g.idPlatoRel,
          idDetalle: ultDetalle + ndet,
          cant: 1,
          pcioUnit: (platopcio ? platopcio[0].pcioUnit : 0),
          importe: (platopcio ? platopcio[0].pcioUnit : 0),
          descripcion: g.descGusto,
          obs: '',
          esEntrada: false,
          cocido: '',
          idTamanio: 0,
          descTam: '',
          idSectorExped: (platopcio ? platopcio[0].idSectorExped : 0),
          gustos: [],  
          idTipoConsumo: 'CD',
          impCentralizada: (platopcio ? platopcio[0].impCentralizada : 0)
        } 
        mesaDet.push(det)
        setMesaDet(mesaDet)
      }
    })
    
    setUltDetalle(ultDetalle+ndet+1)
    //showToast('Combo Agregado!!')
    showMessage({
      message: "Combo Agregado!!",
      description: "El Combo fue agregado a la Comanda",
      type: "success",
      duration: 3000,
    });
    setTimeout(() => setSalir(true),
    1000
    )
 
  }

  // Control de cada seccion que se selecciona
  const handleSecciones = (id:number,cmax:number,auto:boolean,descCorta:string) => {
    console.log('Seccion:',id,cmax,auto,descCorta)
    setUltSeccion(id)
    setCantMax(cmax) 
    setIsOk(true)  
    if (auto) {
      setAutocompletar(true)
      setUnicoPlato(descCorta)
      
    } else {
      setAutocompletar(false)
      setUnicoPlato('')
      
    }

  }

  // Control de los gustos de un Plato seleccionado
  const handleGustosInc = (cantg:number,inc:number, id:number,descrip:string,idPlatoRel:number) => {
      let cant = cantGustos + inc
      let noEsta = true       
      
      combosGustos.forEach((m) => {
        if (m.idGusto == id) {
          m.cant = 1
          noEsta = false
        }
       })
      if (noEsta) {
          setCombosGustos([...combosGustos,{idSeccion:ultSeccion,idPlato:ultPlato,idGusto:id,descGusto:descrip,cant:1,idPlatoRel:idPlatoRel}])
      }
        setCantGustos(cant)
        if (cant > cantMaxGustos) {
         Alert.alert('Atención','No puede seleccionar más de '+cantMaxGustos.toString()+' Variedades')
      } 
        
      //console.log('MesaGustos:',mesaGustos)
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

  const handleBottomSheet = () => { 
    //console.log('Comensales Grabados:',res)
    if (cantGustos == 0 ) {
      sheetRef.current?.expand()
    }
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
          //const seccion = await cargaSeccion(s.idSeccion,urlBase,BaseDatos,0,0,0)  
          const seccion = await getComboDet(s.idSeccion,urlBase,BaseDatos);
          // console.log('Carga Seccion:',seccion)
          if (seccion.length > 1) {  
            seccion.forEach((r) => {
              r.selected = false
            }) 
          }
          console.log('Seccion:',seccion)    
          sec.push(seccion)
        })
        setComboDet(sec)
      })
 
  },[] )

  return (
  <GestureHandlerRootView style={{ flex: 1 }}>
  <View style={styles.container}>
    <Stack.Screen options={{headerTitle: `Mesa ${ultMesa.nroMesa} -  ${comensales} Pers.`, headerTitleAlign: 'center'}} /> 
    <FlashMessage position="top" />
     
    <View style={styles.containerTitulo}>
       <Text style={styles.tituloText}> {item.descripcion} {id} </Text>
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
  
      <View style={{flex: 1}}>
      <ScrollView contentContainerStyle={styles.containerScrollv} >
      {comboDet && autocompletar &&
           <Text style={styles.checkbox}><AntDesign name="check" size={25} color={Colors.colorazulboton} /> {unicoPlato} </Text>
      }       
      
      {comboDet && !autocompletar &&
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
         enablePanDownToClose={false}
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
          {/* 
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
          */}

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
      )}      
      </BottomSheetScrollView>
      
      </View>
       
    </BottomSheet> 
   
    }
    {
      salir && <Redirect href={`platos/${ultRubro}`} />
    }
    
      <View>
     
  </View>  
  
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
});  

export default selCombos