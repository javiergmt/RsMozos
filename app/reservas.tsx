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
import { CambiarReserva } from "./ApiFront/Posts/PostDatos";


const reservas = () => {
    const [reservas, setReservas] = useState<ReservasType[]>([]);
    const [turnos, setTurnos] = useState<turnosType[]>([]);
    const [sectores, setSectores] = useState<sectoresType[]>([]);
    const [mesas, setMesas] = useState<mesasType[]>([]);
    const {getUrl,getBaseDatos,BaseDatos} = useLoginStore();
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


    const handleReserva = async(r: ReservasType) => {
        console.log('Reserva:',r)
        //if (r.confirmada){
        //  setUbicarReserva(true);
        //} else {
          
          // Confirmar Reserva
          const result = await CambiarReserva(r,urlBase,base);
         
          //console.log('Reserva confirmada:',result)
            //setActReservas(!actReservas);
            Alert.alert('Reserva Confirmada');
      
        
        //  }  
    }

    const handleSector = (s: sectoresType) => {
      console.log('Sectores:',s)
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
    setUbicarReserva(false);
    setIdSector(0);
    

}

    const handleTurno = async (t:turnosType) => {
     
      console.log('Turno:',t.idTurno)
      setShowSelect(false);
      setIdTurnoSel(t.idTurno);
      setTurnoSel(t.descripcion);
      

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
          const result = await getReservas(urlBase,base,date.toISOString(),idTurnoSel);
          setReservas(result);
      };
      load();    
    }, [idTurnoSel,date]);

    return (<>
          <Stack.Screen options={
            {headerTitle: `RESERVAS`, headerTitleAlign: 'center'}
            } /> 
    <SafeAreaView style={styles.container}>     
   
        <View style={styles.container_input}>
        <TouchableOpacity onPress={showDatepicker} >
          <Text style={styles.input_fecha} >{/(\d{4}-\d{2}-\d{2})T/.exec(date.toISOString())[1]}</Text>
         </TouchableOpacity>
         <TouchableOpacity onPress={handleSelect}>
          <Text style={styles.input_turno} >{turnoSel}</Text>
         </TouchableOpacity>
          <TextInput
                  style={styles.input}
                  onChangeText={onChangeText}
                  value={text}     
                  placeholder='Buscar x Nombre'   
                  placeholderTextColor='grey'
                />    
        </View>

        {/* Despliego las reservas */
         !ubicarReserva && !showSelect &&
        
         <View style={{flex:1, height:'100%', margin:20, backgroundColor: Colors.background, }}>
           <ScrollView> 
            {
             reservas.map((r) => (
              <View key={r.idReserva}>
                 <View style={styles.cont_reservas}>
                 <TouchableOpacity onPress={() => handleReserva(r)}>
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
  marginLeft: 15,
  marginRight: 15,
},
input: {
    fontSize: 20,
    fontWeight: 'bold',
    height: 40,
    width: '50%',
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
    width: 120,
    borderWidth: 1,
    borderColor: Colors.colorborderubro,
    padding: 5,
    color: 'white',
    //backgroundColor: Colors.backbotones,
    borderRadius: 8,
    paddingBottom: 10,
    marginRight: 5,
    marginLeft: 5,
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
    marginRight: 5,
    marginLeft: 5,
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

