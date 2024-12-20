import { View, Text,  ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native'
import React, {  useEffect, useRef, useState } from 'react'
import { Link, Redirect} from 'expo-router'
import { mesasType, sectoresType, paramType, mesaType } from './ApiFront/Types/BDTypes';
import { getMesas, getSectores } from './ApiFront/Gets/GetDatos';
import { useLoginStore } from "../app/store/useLoginStore"
import Colors from '../constants/Colors';
import { AbrirMesa, BloquearMesa, GrabarComensales } from './ApiFront/Posts/PostDatos';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AntDesign } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const mesaForma = (forma:number) => {

  switch (forma) {
    case 0:
      return styles.rectangulo;
    case 1:      
      return styles.cuadrado;
    case 3:
      return styles.cuadrado_red;
    case 2:
      return styles.rectangulo_red;
    case 5:
      return styles.circulo;
    case 4:
      return styles.elipse;
    default:
      return styles.cuadrado;
  }
}

const mesaColor = (param:paramType[],ocupada:string,cerrada:number,conPostre:boolean,idMozo:number,idMozoSel:number,soloOcupada:boolean) => {
  
  if ( idMozoSel != idMozo && ocupada=='S' && cerrada==0) {
    return 'gray'
  } else {
    if (conPostre) {
      return param[0].colorPostre
    } else {
      if (soloOcupada) {
        return 'lightgray'
      } else {
        if (cerrada == 1) {
          return param[0].colorMesaCerrada
        } else {
          if (ocupada == 'N') {
            return param[0].colorMesaNormal
          } else {
            return param[0].colorMesaOcupada
          }
        }
    }  
  }
  }
}

const mesas = () => {
  const [mesas, setMesas] = useState<mesasType[]>([]);
  const [sectores, setSectores] = useState<sectoresType[]>([]);
  const [sector, setSector] = useState<number>(2);
  const {getUrl,mozo,ultSector,setUltSector,getParam,setUltMesa,
         setOrigDetalle,setUltDetalle,setMesaDet,setComensales,
        getBaseDatos,BaseDatos} = useLoginStore()
  const urlBase = getUrl()
  const base = getBaseDatos()
  const Param = getParam()
  const [isOk, setIsOk] = useState(false)
  const [isOcup, setIsOcup] = useState('N')
  const [isPending, setIsPending] = useState(false);  
  const [comensalesOk, setComensalesOk] = useState(!Param[0].pedirCubiertos)
  const [cantComensales, setCantComensales] = useState(1)
  const [mesaSeleccionada, setMesaSeleccionada] = useState(0)

  // Control del bottomSheet
  const sheetRef = useRef<BottomSheet>(null); 
  const snapPoints = ["40%","60%"];

  // SafeArea
  const { bottom, top, right, left } = useSafeAreaInsets();
 
  // Caargo las mesas del Sector
  const handleMesas = (idSector:number) => {
    const load = async () => {
      const { mesas, isError, isPending }  = await getMesas(idSector,urlBase,base);
      setIsPending(isPending)
      setMesas(mesas);
      setUltSector(idSector);
    };
    load();
 } 

 // Bloqueo la mesa y la abro si esta cerrada 
 const handleMesa = async (mesa:mesaType) => {
 if ( ( mesa.idMozo == 0 && mesa.ocupada == 'N' && mesa.cerrada == 0) 
    || ( mesa.idMozo == mozo.idMozo && mesa.ocupada == 'S' && mesa.cerrada == 0)
    )
    {
      const res = await BloquearMesa(mesa.nroMesa,urlBase,base)
      console.log('Mesa Bloqueada',res)
      if (res.mesa != 0) {
        setUltSector(mesa.idSector);
        setUltMesa(
          { nroMesa:mesa.nroMesa,
            idSector:mesa.idSector,
            ocupada:mesa.ocupada,
            idMozo:mesa.idMozo,
            cerrada:mesa.cerrada,
            cantPersonas:mesa.cantPersonas,
            activa:mesa.activa
          });
          setIsOk(true)
          setIsOcup(mesa.ocupada)
          if (mesa.ocupada == 'N') {
            console.log('Creo la mesa')
            const res = await AbrirMesa(mesa.nroMesa,mozo,urlBase,base)
            console.log('Mesa Abierta',res)
            setUltDetalle(0)
          }
          setMesaSeleccionada(mesa.nroMesa)
      }
  } else {
    if (mesa.cerrada == 1) {
      Alert.alert('ATENCION !!','Mesa Cerrada ')
    } else {
      if (mesa.idMozo != mozo.idMozo) {
        Alert.alert('ATENCION !!','Mesa Ocupada por otro Mozo')
      } else {
        Alert.alert('ATENCION !!','Mesa en Uso')
      }
      
    }  
  }
}
const handleComensales = (cant:number) => {
  const cantidad = cantComensales
  if (cantidad + cant > 0) {
    setCantComensales(cantidad + cant) 
  } else{
    setCantComensales(1)
  }
}

const handleBottomSheet = () => { 
  if (cantComensales == 0) {
    Alert.alert('ATENCION !!','Debe ingresar la cantidad de Comensales')
    return
  }
  setComensales(cantComensales)
  setComensalesOk(true)
  const res = GrabarComensales(mesaSeleccionada,cantComensales,urlBase,base)
  //console.log('Comensales Grabados:',res)
}

useEffect(() => {
  //console.log('Busco Mesas')
  sheetRef.current?.snapToIndex(-1);
  handleMesas(ultSector); 
  const load = async () => {
      const result = await getSectores(urlBase,base);
      setSectores(result);
  };
  load();
  setOrigDetalle(0)
  setUltDetalle(0)
  setMesaDet([])
 
}, []);

return (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <View  style={{flex:1}}>
     
    {/* Despliego los Sectores  */}
    {!isOk &&
    <View style={styles.container}>
    <ScrollView horizontal contentContainerStyle={styles.container} >
      { sectores.map((s) => (
            
         <TouchableOpacity key={s.idSector} onPress={() => handleMesas(s.idSector)}>
           <View  style={[ultSector == s.idSector ? styles.cardSel : styles.card]} >     
              <Text style={[styles.heading]}>{s.descripcion}</Text>
            </View>
         </TouchableOpacity>
    
     
      ))}
    </ScrollView>
    </View>
    }

    {/* Despliego las mesas del Sector */}
  
    <View style={{flex:1, height:'100%',  backgroundColor: Colors.background, }}>
    <ScrollView contentContainerStyle={styles.cont_mesas}> 
     { isPending && 
        <View>
        <ActivityIndicator size="large" color="#0000ff"/>
        </View>
     }    
     {!isOk && !isPending &&
      mesas.map((m) => (
       
          <TouchableOpacity key={m.nroMesa} onPress={() => handleMesa(m)}>
            <View >     
                <Text style={[styles.itemText, mesaForma(m.forma),m.reservada && {borderColor:'white',borderWidth:5},{backgroundColor:mesaColor(Param,m.ocupada,m.cerrada,m.conPostre,m.idMozo,mozo.idMozo,m.soloOcupada)}]}>{m.nroMesa}</Text>
            </View>
          </TouchableOpacity>
      
        
      ))}
    </ScrollView>
    </View> 

    <View style={styles.separador}></View> 

    <View style={[{bottom, },styles.cont_Pie  ]}>
    <Link href="/mozos" replace asChild>  
        <TouchableOpacity> 
            <Text style={styles.textBtSalir}>Salir</Text> 
        </TouchableOpacity>
    </Link>
    { mozo.idTipoMozo == 4 &&
    <Link href="/reservas" replace asChild>  
        <TouchableOpacity> 
            <Text style={styles.textBtSalir}>Reservas</Text> 
        </TouchableOpacity>
    </Link>
    }
    </View> 

    {/* Redirecciono a la pagina Cuenta o Rubros segun si esta Ocupada o Libre   */}  
    { (isOk && isOcup=='N' && comensalesOk) && <Redirect href="/(tabs)/platos/" /> }
    { (isOk && isOcup=='S') && <Redirect href="/(tabs)/cuenta" /> }
   

    {/* Pido Comensales */}
    { (isOk && isOcup=='N'&& !comensalesOk) && 
    <BottomSheet
         ref={sheetRef}
         snapPoints={snapPoints}
         enablePanDownToClose={true}
         onClose={() => handleBottomSheet()}
         backgroundStyle={{backgroundColor: Colors.colorBackModal}}
      >
      <BottomSheetView>
      <Text style={styles.bottomText}>Comensales</Text>
      <View style={{ flexDirection: 'row', alignItems:'center', justifyContent: 'center' }}>
        
        
        <TouchableOpacity style={styles.bottombutton} onPress={() => handleComensales(-5)} >
        <AntDesign name="minuscircleo" size={50} color={Colors.colorfondoBoton} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottombutton} onPress={() => handleComensales(-1)} >
        <AntDesign name="minuscircle" size={50} color={Colors.colorfondoBoton} />
        </TouchableOpacity>

        <Text style={styles.bottomText}>{cantComensales}</Text>

        <TouchableOpacity style={styles.bottombutton} onPress={() => handleComensales(1)} >
        <AntDesign name="pluscircle" size={50} color={Colors.colorfondoBoton} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottombutton} onPress={() => handleComensales(5)} >
        <AntDesign name="pluscircleo" size={50} color={Colors.colorfondoBoton}/>
        </TouchableOpacity>
   
      </View>
      <View style={styles.bottombutton} >
        <TouchableOpacity onPress={() => handleBottomSheet()}> 
            <Text style={styles.textBtSalir}>Confirmar</Text> 
        </TouchableOpacity>
      </View>
      </BottomSheetView>    
    </BottomSheet> 
    } 
  </View>
  </GestureHandlerRootView>  
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    gap: 10,
    backgroundColor: Colors.background,
    //height: '100%',
  },

  cont_mesas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    gap: 10,
    backgroundColor: Colors.background,
    //height: '100%',
  },
  cont_Pie: {
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    width: '100%',
  },
  separador : {
    backgroundColor: '#fff',
    width: '100%',
    height: StyleSheet.hairlineWidth,
    
  },
  separador1 : {
    backgroundColor: '#fff',
    width: '100%',
    height: 1,
  },
 
  activ: {
    margin: 20,
  },
  
  bottombutton: {
    padding: 10,
    alignItems: 'center',
  },
  item: {
    padding: 10,
    height: 50,
    flexDirection: 'row',
    
  },
  itemText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    lineHeight: 50,
    
  },
  bottomText: {
    fontSize: 25,
    fontWeight: 'bold',
    color: Colors.colorfondoBoton,
    textAlign: 'center',
    lineHeight: 50,
   
  },
  sectorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
    lineHeight: 50,
    borderRadius: 10,
    borderColor: 'black',
    borderStyle: 'solid',
    borderWidth: 1,
    paddingLeft: 10,
    paddingRight: 10,
  },
  card: {
    backgroundColor: Colors.backbotones,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 10,
    width: '100%',
    height: 45,
    marginVertical: 0,
  },
  cardSel: {
    backgroundColor: Colors.colorcheckbox,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 10,
    width: '100%',
    height: 45,
    marginVertical: 0,
  },
  elevation: {
    elevation: 20,
    shadowColor: Colors.backsombra,
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
  heading: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 5,
    color: 'white',
    textAlign: 'center',
  },
  cuadrado: {
    width: 50,
    height: 50,
    borderColor: 'black',
    borderStyle: 'solid',
    borderWidth: 1,
    
  },
  cuadrado_red: {
    width: 50,
    height: 50,
    borderRadius: 10,
    borderColor: 'black',
    borderStyle: 'solid',
    borderWidth: 1,
  },
  rectangulo: {
    width: 100,
    height: 50,
    borderColor: 'black',
    borderStyle: 'solid',
    borderWidth: 1,
  },
  rectangulo_red: {
    width: 100,
    height: 50,
    borderRadius: 10,
    borderColor: 'black',
    borderStyle: 'solid',
    borderWidth: 1,
  },
  circulo: {
    width: 50,
    height: 50,
    borderRadius: 50,
    borderColor: 'black',
    borderStyle: 'solid',
    borderWidth: 1,
  },
  elipse: {
    width: 50,
    height: 50,   
    borderRadius: 50,
    transform: [{ scaleX: 2 }],
    marginLeft: 25,
    marginRight: 25,
    borderColor: 'black',
    borderStyle: 'solid',
    borderWidth: 1,
  },
  fixedBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 50,
    backgroundColor: 'gray',
  },
  button: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginTop: 5,
    margin: 3,
    backgroundColor: '#4267b2',
    borderColor: '#ffffff',
    alignItems: 'center'
  },
  buttonStyleContainer: {
    flex: 1,
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 5,
   },
   buttonStyle: {
    marginHorizontal: 20,
    marginTop: 5,
  },

});

export default mesas