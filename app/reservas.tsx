import { useEffect, useState } from "react";
import { mesasType, ReservasType, sectoresType, turnosType } from "./ApiFront/Types/BDTypes";
import { useLoginStore } from "./store/useLoginStore";
import { getMesas, getReservas, getSectores, getTurnos } from "./ApiFront/Gets/GetDatos";
import { ActivityIndicator,View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Button, ScrollView, TextInput, Alert, } from "react-native";
import { capitalize, getHoraActual, izqRellena } from './Funciones/deConversion';
import { Link, Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React from "react";
import Colors from "../constants/Colors";
import DateTimePicker from '@react-native-community/datetimepicker';
import { AbrirMesa, CambiarReserva, ConfCumpReserva, GrabarComensales, isSoloOcupada, LiberarMesa } from "./ApiFront/Posts/PostDatos";
import { AntDesign } from '@expo/vector-icons';


const reservas = () => {
    const [reservas, setReservas] = useState<ReservasType[]>([]);
    const [reserva, setReserva] = useState<ReservasType>();
    const [turnos, setTurnos] = useState<turnosType[]>([]);
    const [sectores, setSectores] = useState<sectoresType[]>([]);
    const [mesas, setMesas] = useState<mesasType[]>([]);
    const {getUrl,getBaseDatos,BaseDatos,mozo} = useLoginStore();
    const [isOk, setIsOk] = useState(false);
    const [isPending, setIsPending] = useState(false); 
    const urlBase = getUrl()
    const base = getBaseDatos()
    const [text, onChangeText] = useState('');
    const [idTurnoSel, setIdTurnoSel] = useState(0);
    const [turnoSel, setTurnoSel] = useState('Todos');

    // Datetime Picker
    const [date, setDate] = useState(new Date());
    const [mode, setMode] = useState('date');
    const [show, setShow] = useState(false);

    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate;
        setShow(false);
        setDate(currentDate);
    };

    const showMode = (currentMode) => {
        setShow(true);
        setMode(currentMode);
    };

    const showDatepicker = () => {
        showMode('date');
    };

    // Seelct Picker Turnos
    const [showSelect, setShowSelect] = useState(false);
    const handleSelect = () => {
        setShowSelect(true);
    }

    // SafeArea
    const { bottom, top, right, left } = useSafeAreaInsets();

    const [ubicarReserva, setUbicarReserva] = useState(false);
    const [idSector, setIdSector] = useState(0);
    const [sectorSel, setSectorSel] = useState('');
    const [actReservas, setActReservas] = useState(false);


    //console.log('Reserva:',r)
   

    const handleReservas = async(r: ReservasType) => {
        console.log('intento de ocupacion / confirmacion',r.confirmada,r.mesa)
        if (r.confirmada){
          setReserva(r);
          if  (r.mesa > 0) {
            const ocup = await isSoloOcupada(r.mesa,urlBase,base)
            if (ocup) {
              Alert.alert('La mesa '+ r.mesa +' ya esta ocupada, por favor seleccione otra');
              setUbicarReserva(true);
            } else {  
              // Si ya tiene mesa asignada la ocupo
              const res = await AbrirMesa(r.mesa,mozo,urlBase,base)
              console.log('Abrir Mesa:',res)
              const res1 = await GrabarComensales(r.mesa,r.cant,urlBase,base)
              const res2 = await LiberarMesa(r.mesa,false,urlBase,BaseDatos)
              const res3 = await ConfCumpReserva(r.idReserva,true,true,urlBase,BaseDatos)
              setActReservas(!actReservas);
              Alert.alert('La Mesa '+r.mesa+' fue ocupada');
            }  
          } else { 
            setUbicarReserva(true);
          }
        } else {    
          // Confirmar Reserva
          const res = await ConfCumpReserva(r.idReserva,true,false,urlBase,BaseDatos)
          setActReservas(!actReservas);
          Alert.alert('Reserva Confirmada');
        }
    } 

    const handleSector = (s: sectoresType) => {
      // Obtengo los sectores de las mesas
      const load = async () => {
        const { mesas, isError, isPending } = await getMesas(s.idSector,urlBase,base);
        setMesas(mesas.filter(m => m.ocupada == 'N'));
      };
      setIdSector(s.idSector);
      setSectorSel(s.descripcion);
      load();

  }

  const handleMesas = async (m:mesasType) => {     
    console.log('Mesa:',m.nroMesa)
    if (m.ocupada == 'N') {
       // Ocupo la mesa seleccionada
       const res = await AbrirMesa(m.nroMesa,mozo,urlBase,base)
       const res1 = await GrabarComensales(m.nroMesa,2,urlBase,base)
       const res2 = await LiberarMesa(m.nroMesa,false,urlBase,BaseDatos)
       const res3 = await ConfCumpReserva(reserva.idReserva,true,true,urlBase,BaseDatos)
       Alert.alert('Se ocupo la Mesa '+m.nroMesa);
       setActReservas(!actReservas);
    } else {
      Alert.alert('La mesa '+ m.nroMesa +'ya esta ocupada');
    }
    setUbicarReserva(false);
    setIdSector(0);

}

    const handleTurno = async (t:turnosType) => {
      setShowSelect(false);
      setIdTurnoSel(t.idTurno);
      setTurnoSel(t.descripcion);
  }

  const handleBuscar =  () => { 
    setActReservas(!actReservas);
}

    useEffect(() => {   
      const load = async () => {
        const result = await getTurnos(urlBase,base);
        setTurnos(result);
    };
        load();    
    }, []); 
      
    useEffect(() => {   
        const load = async () => {
            const result = await getSectores(urlBase,base);
            setSectores(result);
        };
        load();    
    }, []);  

    useEffect(() => {
      const load = async () => {
          const res = await getReservas(urlBase,base,date.toISOString(),idTurnoSel);
          setReservas(res.filter(r => !r.cumplida && r.nombre.toUpperCase().includes(text.toUpperCase())) );
          onChangeText('');
      };
      load();    
    }, [actReservas,idTurnoSel,date]);

    return (<>
          <Stack.Screen options={
            {headerTitle: `RESERVAS`, headerTitleAlign: 'center'}
            } /> 
    <SafeAreaView style={styles.container}>     
   
        <View style={styles.container_input}>
        <TouchableOpacity onPress={showDatepicker} >
          {/* <Text style={styles.input_fecha} >{date.toISOString()}</Text> 
          <Text style={styles.input_fecha} >{/(\d{4}-\d{2}-\d{2})T-/.exec(date.toISOString())[1]}</Text>
          <Text style={styles.input_fecha} >{ date.getDate() + "-"+ date.getMonth() +"-"+date.getFullYear()}</Text>
          */}
          <Text style={styles.input_fecha} >{ date.toLocaleDateString() }</Text>
         </TouchableOpacity>
         <TouchableOpacity onPress={handleSelect}>
          <Text style={styles.input_turno} >{turnoSel}</Text>
         </TouchableOpacity>
          <TextInput
                  style={styles.input_text}
                  onChangeText={onChangeText}
                  value={text}     
                  placeholder='Buscar x Nombre'   
                  placeholderTextColor='grey'
                />  
        
          <View style={{marginLeft:10}}>
           
            <TouchableOpacity onPress={handleBuscar}>
            <AntDesign name="search1" size={28} color={Colors.colorborderubro} />
            </TouchableOpacity>
       
          </View>
           
        </View>

        {/* Despliego las reservas */
         !ubicarReserva && !showSelect &&
        
         <View style={{flex:1, height:'100%', margin:20, backgroundColor: Colors.background, }}>
           <ScrollView> 
            {
             reservas.map((r) => (
              <View key={r.idReserva}>
                 <View style={styles.cont_reservas}>
                 <TouchableOpacity onPress={() => handleReservas(r)}>
                   <View >     
                       <Text style={[ r.confirmada ? styles.textResConf : styles.textResSinConf ]}>
                        {r.hora} &nbsp;-&nbsp; ({r.cant}) &nbsp;-&nbsp; {r.nombre}&nbsp;{r.mesa > 0 ? ' M: ' + r.mesa : ''}
                        </Text>
                   </View>
                 </TouchableOpacity>
                 </View>
              </View>  
             ))
             }
           </ScrollView>
         </View> 
         }


        {showSelect &&
        <View style={{flex:1, height:'100%', margin:20, backgroundColor: Colors.background, }}>
          <Text style={styles.text}>Seleccione un Turno</Text>
          <ScrollView > 
          {
          turnos.map((t) => (
            <View key={t.idTurno}>
              <View style={styles.cont_turnos}>
              <TouchableOpacity key={t.idTurno} onPress={() => handleTurno(t)}>
                <View >     
                  <Text style={styles.text }>{t.descripcion}</Text>
                </View>
              </TouchableOpacity>
            </View>
            </View>
          ))
          }
          </ScrollView>
        </View>
        } 
        {show && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          locale="es-ES"
          timeZoneName={'America/Argentina/Buenos_Aires'}
          is24Hour={true}
          onChange={onChange}
        />
        )}

    

        {/* Ubicar Reserva */
        ubicarReserva && idSector == 0 &&
        <View style={{flex:1, height:'100%', margin:20, backgroundColor: Colors.background, }}>
          <Text style={styles.text}>Seleccione un Sector</Text>
          <ScrollView> 
           {
            sectores.map((s) => (
              <View  key={s.idSector}>
              <View style={styles.cont_sectores}>
                <TouchableOpacity onPress={() => handleSector(s)}>
                  <View >     
                      <Text style={styles.text }>{s.descripcion}</Text>
                  </View>
                </TouchableOpacity>
              </View>
             </View>
            ))
            }
          </ScrollView>
        </View>
        }

         {/* Ubicar Reserva */
        ubicarReserva && idSector > 0 &&
        <View style={{flex:1, height:'100%', margin:20, backgroundColor: Colors.background, }}>
          <Text style={styles.text}>Seleccione una Mesa</Text>
          <ScrollView> 
           {
            mesas.map((m) => (
              <View  key={m.nroMesa}>
              <View style={styles.cont_sectores}>
                <TouchableOpacity onPress={() => handleMesas(m)}>
                  <View >     
                      <Text style={styles.text }>Mesa &nbsp;{m.nroMesa}</Text>
                  </View>
                </TouchableOpacity>
              </View>
             </View>
            ))
            }
          </ScrollView>
        </View>
        }
    
        <View style={[{bottom, },styles.cont_Pie  ]}>
          <Link href="/mozos" replace asChild>  
              <TouchableOpacity> 
                  <Text style={styles.textBtSalir}>Salir</Text> 
              </TouchableOpacity>
          </Link>
        </View>

  
    </SafeAreaView>
    </>
    )
}
export default reservas

const styles = StyleSheet.create({
container: {
    flex: 1,
    backgroundColor: Colors.background,
    height: '100%', 
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
activ: {
    margin: 20,
},
container_input: { 
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',  
  marginLeft: 10,
  marginRight: 10,
  //backgroundColor: Colors.colorFondoInput,
},
input_text: {
    fontSize: 15,
    fontWeight: 'bold',
    height: 40,
    width: '40%',
    borderWidth: 1,
    borderColor: Colors.colorborderubro,
    padding: 5,
    color: 'white',
    //backgroundColor: Colors.backbotones,
    borderRadius: 8,
    paddingBottom: 10,
  },
  input_fecha: {
    fontSize: 15,
    fontWeight: 'bold',
    height: 40,
    width: 100,
    borderWidth: 1,
    borderColor: Colors.colorborderubro,
    padding: 5,
    color: 'white',
    //backgroundColor: Colors.backbotones,
    borderRadius: 8,
    paddingBottom: 10,
    //marginRight: 5,
    
    //marginLeft: 5,
  },  
  input_turno: {
    fontSize: 15,
    fontWeight: 'bold',
    height: 40,
    width: 80,
    borderWidth: 1,
    borderColor: Colors.colorborderubro,
    padding: 5,
    color: 'white',
    //backgroundColor: Colors.backbotones,
    borderRadius: 8,
    paddingBottom: 10,
    //marginRight: 5,
    //marginLeft: 5,
  },    

  cont_reservas: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    padding: 10,
    shadowColor: "white",
    shadowOpacity: 0.26,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 5,
    borderRadius: 10,
    backgroundColor:  Colors.background,
  },

  cont_turnos: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    padding: 8,
    backgroundColor:  'grey',
  },

  cont_sectores: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    padding: 10,
    //shadowColor: "white",
    //shadowOpacity: 0.26,
    //shadowOffset: { width: 0, height: 2 },
    //shadowRadius: 8,
    //elevation: 5,
    borderRadius: 10,
    backgroundColor:  'grey',
  },
  
  text: {
    fontFamily: "openSansBold",
    fontSize: 20,
    color: 'white',
  },

 textResConf: {
    fontFamily: "openSansBold",
    fontSize: 20,
    color: 'white',
  },

 textResSinConf: {
    fontFamily: "openSansBold",
    fontSize: 20,
    color: 'grey',
    //backgroundColor: 'grey',
  },  
});

