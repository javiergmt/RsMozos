// Se muestran los platos del Rubros,Subrubros,Favoritos,Todos
// Aca se seleccionan los platos

import { View, Text, StyleSheet, ListRenderItem, TouchableOpacity, FlatList, ToastAndroid, Button, TextInput } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { Redirect, Stack, useLocalSearchParams } from 'expo-router'
import { getPlato_Precio, getPlatos } from '../../../ApiFront/Gets/GetDatos'
import { useLoginStore } from '../../../store/useLoginStore'
import { platosType, rubrosSubType } from '../../../ApiFront/Types/BDTypes'
import { capitalize, getHoraActual } from '../../../Funciones/deConversion'
import { AntDesign , Entypo} from '@expo/vector-icons';
import { showToast } from '../../../Funciones/deInfo'
import Colors from '../../../../constants/Colors'
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context'
import FlashMessage from "react-native-flash-message";
import { showMessage, hideMessage} from "react-native-flash-message";

const rubSub = (id:any,rubros:rubrosSubType[]) => {
    const pos = id.indexOf('-')
    const cadena = 'x'
    // Si empieza con @ es una cadena
    if (id.charAt(0) == '@') {
      return { desc:'Busqueda' ,rub: 0, sub: 0, cadena: id.slice(1),tipo:'B' }
    }
    if (pos > 0) {
        // Es un subrubro
        
        const rub = id.slice(0,pos)
        const sub = id.slice(pos+1) 
        const subr = rubros.filter((r) => r.idRubro == rub).map((r) => { return r.subrubros})
        const desc =  subr[0].filter((s) => s.idSubRubro == sub).map((r) => { return capitalize(r.descripcion)})
         
        return { desc ,rub , sub, cadena ,tipo: rub==-1 ? 'F' : 'S'}
    } else {
         // Es un rubro
         const desc = rubros.filter((r) => r.idRubro == id).map((r) => { return capitalize(r.descripcion)})
         const rub = id
         const sub = 0
         return { desc , rub , sub , cadena ,tipo: rub==-1 ? 'F' : 'R'}
    }
    
}

const selPlatos = () => {
  const {id} = useLocalSearchParams() as { id: string } // id es lo que recibe
  const [platos, setPlatos] = useState([])  
  const { urlBase,setUltItem,ultMesa,mozo,mesaDet,setMesaDet,setUltRubro,setUltRubSub,
          ultDetalle,setUltDetalle, origDetalle,Rubros,BaseDatos,comensales } = useLoginStore();
  const { desc, rub, sub , cadena , tipo} = rubSub(id,Rubros)
  const [selTam, setSelTam ] = useState(false)
  const [selGusto, setSelGusto ] = useState(false)
  const [selectCombo, setSelectCombo ] = useState(false)
  const [descRubro, setDescRubro] = useState(desc)
  const [pedirCant, setPedirCant] = useState(false)
  const [cantItem, setCantItem] = useState(1)
  const [itemSel, setItemSel] = useState<platosType>()
  const [text, onChangeText] = useState('');
  const [esEntSel, setEsEntSel] = useState(false)
   // Control del bottomSheet
  const sheetRef = useRef<BottomSheet>(null); 
  const snapPoints = ["60%","50%"];
  

  const AgregaModifItem = (item:platosType) => {
    // Agrego el item a la mesa
    sheetRef.current?.close()
    let estaEnMesa = false
   
    mesaDet.forEach((m) => {
      if (m.idPlato == item.idPlato && m.idDetalle > origDetalle && m.obs == text) {
        m.cant = m.cant + cantItem
        m.importe = m.cant * m.pcioUnit
        estaEnMesa = true
      }
    })
    if (!estaEnMesa) {
      const hora = getHoraActual()
      const platoprecio = getPlato_Precio(item.idPlato,0,ultMesa.idSector,hora,urlBase,BaseDatos)
      platoprecio.then((res) => { 
      const det = { 
      nroMesa: ultMesa.nroMesa,
      idPlato: item.idPlato,
      idDetalle: ultDetalle + 1,
      cant: cantItem,
      pcioUnit: (res ? res[0].pcioUnit : 0) ,
      importe: (res ? res[0].pcioUnit * cantItem: 0) ,
      descripcion: item.descripcion,
      obs: text,
      esEntrada: esEntSel,
      cocido: '',
      idTamanio: 0,
      descTam: '',
      idSectorExped: (res ? res[0].idSectorExped : 0),
      gustos: [],
      idTipoConsumo: item.idTipoConsumo,
      impCentralizada: (res ? res[0].impCentralizada : 0) 
      }
      mesaDet.push(det)
      setUltDetalle(ultDetalle+1)
      setEsEntSel(false)
      onChangeText('')
      })
    }  
    setMesaDet(mesaDet)
    console.log('MesaDet:',mesaDet)
    //showToast('Plato Agregado!!')
    showMessage({
      message: "Plato Agregado!!",
      description: "El Plato se ha agregado a la mesa",
      type: "success",
    });
    setPedirCant(false)
    setCantItem(1)
  }

  const handleCantidad = (cant) => {
    if (cantItem + cant >= 1) {
      setCantItem(cantItem + cant) 
    } 
    
  }

  const handleCancelar = () => {
    sheetRef.current?.close()
    setCantItem(1)
    setPedirCant(false)
  }

  const handleItem = (item:platosType) => {
    setUltItem(item)  
    setUltRubro(Number(id));
    console.log('ultdetalle',ultDetalle)
    if ( item.idTipoConsumo == 'CV' ) {
      if ( !item.tamanioUnico ) {
        // Selecciona el tamaño
        setSelTam(true)    
      }
      // Selecciona el gusto
      setUltRubSub(id);
      setSelGusto(true)
      return
    }
    if ( item.idTipoConsumo == 'CB' ) {
      // Arma el combo
      setSelectCombo(true)
      return
    }
    if ( !item.tamanioUnico ) {
      // Selecciona el tamaño
      setSelTam(true)    
      return
    }
    setPedirCant(true)
    setItemSel(item)
    
  }
  
  const renderItem: ListRenderItem<any> = ({ item }) => (
      
      <View style={styles.renglonContainer} >
        <FlashMessage position="top" /> 
        <TouchableOpacity onPress={() => handleItem(item)}> 

        <View style={styles.itemContainer}>       
          <Text style={styles.itemName}>{capitalize(item.descripcion)}</Text>
          {
           (item.idTipoConsumo == 'CV' || item.idTipoConsumo == 'CB' || !item.tamanioUnico) ? 
          <AntDesign style={styles.itemIcon}  name="right" size={30} color="wihte" />
          :
          <AntDesign style={styles.itemIcon}  name="pluscircleo" size={30} color="wihte" />
          }
        </View>

        <View style={styles.detContainer}> 
          {/* Esto es para no mostrar los precios
           ( item.tamanioUnico) ? 
          <Text style={styles.itemPcio}>${item.pcioUnit.toFixed(2).toString().padStart(8,'')}</Text> 
          :
          <Text ></Text>
          */}
          <Text style={styles.itemPcio}>{ 
            item.idTipoConsumo == 'CV' ? 'Seleccionar Variedad' :
            item.idTipoConsumo == 'CB' ? 'Armar Combo' : ''}
          </Text>   
          <Text style={styles.itemPcio}>{
            item.tamanioUnico ? '' : 'Seleccionar Modificador'
            }
          </Text> 
        </View>

        </TouchableOpacity>
        
      </View>
      

    );

    useEffect(() => { 
      sheetRef.current?.snapToIndex(-1);
      const load = async () => { 
        //console.log('Busco Platos:',tipo,cadena,rub,sub,urlBase)
        const result = await getPlatos(tipo,cadena,rub,sub,urlBase,BaseDatos)
        setPlatos(result)
      }
      load()
      //setUltRubro(Number(rub));
    }, [rub , sub, cadena ,tipo] )

    return (
     <> 
      <Stack.Screen options={
        {headerTitle: `Mesa ${ultMesa.nroMesa} - ${comensales} Pers`, headerTitleAlign: 'center'}
        } /> 
      <GestureHandlerRootView style={styles.container}>
        
        { selTam && <Redirect href="platos/selTam" />}
        { selGusto && <Redirect href={`/(tabs)/platos/selGustos/0`} />}
        { selectCombo && <Redirect href= {`/(tabs)/platos/selCombos/0`}/>}
      
        { (!selTam && !selGusto) && platos.length > 0 &&
        <View style={styles.container}>
        <View style={styles.container_titulo}>  
        <Text style={styles.titulo}> {descRubro} </Text>
        </View> 
          <FlatList data={platos} renderItem={renderItem} keyExtractor={(item) => item.idPlato.toString()} />
        </View>
        }

        { pedirCant && 
        <BottomSheet
        ref={sheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
       
        //onClose={() => AgregaModifItem(itemSel)}
        onClose={() => handleCancelar()}
        backgroundStyle={{backgroundColor: Colors.colorBackModal}}
          >
          <BottomSheetView >
          <Text style={styles.bottomText}>{itemSel.descCorta}</Text>
          <View style={{ flexDirection: 'row', alignItems:'center', justifyContent: 'center' }}>
              
            <TouchableOpacity style={styles.bottombutton} onPress={() => handleCantidad(-1)} >
            <AntDesign name="minuscircle" size={30} color={Colors.colorfondoBoton} />
            </TouchableOpacity>

            <Text style={styles.bottomText}>{cantItem}</Text>

            <TouchableOpacity style={styles.bottombutton} onPress={() => handleCantidad(+1)} >
            <AntDesign name="pluscircle" size={30} color={Colors.colorfondoBoton} />
            </TouchableOpacity>
            
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              onChangeText={onChangeText}
              value={text}     
              placeholder='Observaciones'   
            />
          </View>

          <View style={styles.itemEntContainer} >    
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
            <TouchableOpacity onPress={() => handleCancelar()} > 
              <Text style={styles.textBtCancelar}>Cancelar</Text> 
            </TouchableOpacity>
            <TouchableOpacity onPress={() => AgregaModifItem(itemSel)} >
              <Text style={styles.textBtSalir}>Confirmar</Text> 
            </TouchableOpacity>
          </View>
          
          </BottomSheetView>    
        </BottomSheet> 
        }
      </GestureHandlerRootView>
     </>

    )
  } 

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
 
  },

  itemName: {
    fontSize: 20,
    color: 'white',
    paddingLeft: 10,
  },
  itemIcon: {
    fontSize: 20,
    color: 'white',
    paddingRight: 10,

  },
  itemPcio: {
    fontSize: 15,
    color: 'white',
    paddingLeft: 10,
  },
  renglonContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.colorborderubro,
  },
  detContainer: {
    flexDirection: 'row',
    //gap: 10,
    //marginBottom: 15,
    //alignItems: '',
    backgroundColor: Colors.background,
    //borderBottomWidth: 1,
    //borderBottomColor: 'light-grey',
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,  
  },
  // iconContainer: {
  //   flexDirection: 'row',
  //   flexWrap: 'wrap',
  //   justifyContent: 'space-between',
  //   alignContent: 'space-between',
  //   alignSelf: 'flex-end',
  //   backgroundColor: 'red',
  
  // },
  separador1 : {
    backgroundColor: '#fff',
    width: '100%',
    height: 0.5,
  },
  container_titulo: { 
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',  
   
  }, 
  titulo: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 5,
    color: Colors.colorazulboton,
  },
  bottomText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.colorfondoBoton,
    textAlign: 'center',
    lineHeight: 50,
   
  },
  textBtSalir: {
    width:150,
    textAlign:'center',
    fontSize:20,
    fontWeight:'500',
    marginBottom:5,
    marginLeft:5,
    color:'white',
    //height:50,
    borderRadius:10,
    backgroundColor:Colors.colorfondoBoton,  
   
  },
  textBtCancelar: {
    width:150,
    textAlign:'center',
    fontSize:20,
    fontWeight:'500',
    marginBottom:5,
    marginRight:5,
    color:'white',
    //height:50,
    borderRadius:10,
    backgroundColor:Colors.colorBackBoton,  
  }, 
  bottombutton: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    padding: 10,
    alignItems: 'center',
   
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    margin: 10,
   
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
  itemSelContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginRight: 10,
    //padding: 5,
    paddingLeft: 5,
    paddingBottom: 5,

  },
  itemEntContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginRight: 10,
  }

 
});

export default selPlatos