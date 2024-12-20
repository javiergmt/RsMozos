import { useEffect, useState } from "react";
import { ReservasType } from "./ApiFront/Types/BDTypes";
import { useLoginStore } from "./store/useLoginStore";
import { getReservas } from "./ApiFront/Gets/GetDatos";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ActivityIndicator, ListRenderItem, View, Text, StyleSheet, TouchableOpacity, FlatList, SafeAreaView, } from "react-native";

import { capitalize, getHoraActual } from './Funciones/deConversion';
import { Link } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React from "react";
import Colors from "../constants/Colors";

const reservas = () => {
    const [reservas, setReservas] = useState<ReservasType[]>([]);
    const {getUrl,getBaseDatos,BaseDatos} = useLoginStore();
    const [isOk, setIsOk] = useState(false);
    const [isPending, setIsPending] = useState(false); 
    const urlBase = getUrl()
    const base = getBaseDatos()

    // SafeArea
    const { bottom, top, right, left } = useSafeAreaInsets();

    const handleItem = (item: ReservasType) => {
        console.log('Reserva:',item)
    }

    const renderItem: ListRenderItem<any> = ({ item }) => (
      
        <View style={styles.renglonContainer} >
  
          <TouchableOpacity onPress={() => handleItem(item)}> 
  
          <View style={styles.itemContainer}>       
            <Text style={styles.itemName}>{item.hora} - {item.cant} - {capitalize(item.nombre)}</Text>
            <Text style={styles.itemName}>confirmada</Text>
          </View>

          </TouchableOpacity>
          
        </View>
          
      );

    useEffect(() => {
   
      const load = async () => {
          const result = await getReservas(urlBase,base,'2024-12-20');
          setReservas(result);
      };
      load();    
    }, []);

    return (<>
    <SafeAreaView style={styles.container}>     
    <View style={styles.body}>
    { isPending  &&
       <View style={styles.activ}>          
           <ActivityIndicator size="large" color="#0000ff"/> 
       </View>
    }

    <Text style={styles.itemName}>Reservas</Text>

  
    <FlatList data={reservas} renderItem={renderItem} keyExtractor={(item) => item.idReserva.toString()} />
            
        <View style={[{bottom, },styles.cont_Pie  ]}>
        <Link href="/mozos" replace asChild>  
            <TouchableOpacity> 
                <Text style={styles.textBtSalir}>Salir</Text> 
            </TouchableOpacity>
        </Link>
        </View>
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
body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
  },
renglonContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.colorborderubro,
    backgroundColor: 'lightgray',
},
itemContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: Colors.background,  
},
itemName: {
   fontSize: 20,
   color: Colors.colorfondoBoton,
   paddingLeft: 10,
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
});

