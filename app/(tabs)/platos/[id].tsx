// Seleciona subrubro o va directamente a los platos del rubro
// Si hay subrubros, luego de seleccionar el mismo se muestran los platos del rubro y subrubro seleccionados

import { View, Text, TouchableOpacity, ScrollView ,StyleSheet} from 'react-native'
import React, { useEffect, useState } from 'react'
import { Link, Redirect, Stack, useLocalSearchParams } from 'expo-router'
import { useLoginStore } from '../../store/useLoginStore'
import Colors from '../../../constants/Colors'
import { capitalize, hyphenatedText } from '../../Funciones/deConversion'

const rubros = () => {
  const {id} = useLocalSearchParams()
  const { Rubros, ultMesa ,mozo, comensales} = useLoginStore()
  const [rubrosfilt, setRubrosFilt] = useState([])
  const [subrubros, setSubrubros] = useState([])
  const [idRubro, setIdRubro] = useState(99999)   
  const [descRubro, setDescRubro] = useState('')   
  console.log('Rubro id:',id)
  useEffect(() => {
    if ( id.length > 0) {
       const rubrosfilt = Rubros.filter((r) => r.idRubro.toString() == id)
       setRubrosFilt(rubrosfilt)
       if (rubrosfilt.length > 0) {
        const subrubros = rubrosfilt[0].subrubros
        setSubrubros(subrubros)
        setIdRubro( rubrosfilt[0].idRubro)
        setDescRubro(capitalize(rubrosfilt[0].descripcion))
        
       }
    }
  }, [id]);

  return (
    <View style={styles.container}>
      
      <Stack.Screen options={{headerTitle: `Mesa ${ultMesa.nroMesa} - ${comensales} Pers.`, headerTitleAlign: 'center'}} /> 
      {/* <Text style={[styles.titulo]}>Platos del Rubro: {id}</Text> */}
      <View style={styles.container_titulo}>  
       <Text style={styles.textRubro}>SubRubros</Text>
      </View> 
      <View style={styles.container_titulo}>  
       <Text style={styles.textSubRubro}>{descRubro}</Text>
      </View> 

      <View style={styles.separador1}></View>

      { subrubros.length > 0 &&

        <ScrollView contentContainerStyle={styles.container_sub}>
        
        {subrubros.map((r) => (
          <View key={r.idSubRubro} >
          <Link href={`/(tabs)/platos/${idRubro.toString()+'-'+r.idSubRubro.toString()}`} asChild>
          <TouchableOpacity  >
            <View style={styles.card}> 
              <Text style={styles.textLetra}>{r.descripcion.charAt(0).toUpperCase()}</Text>
            </View>        
         
            <View style={styles.textContainer}>
              <Text style={[styles.text]}>{hyphenatedText(capitalize(r.descripcion))}</Text>        
            </View>
          </TouchableOpacity>
          </Link>
          </View>
          ))}
          
        </ScrollView>
        
    }
    {
      subrubros.length == 0 ? <Redirect href={`platos/selPlatos/${id}`} /> : <Text></Text>
    }

    </View>
   
         
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    height: '100%',
  },
  container_sub: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'flex-start',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    padding: 10,
    gap: 10,
  },
  container_titulo: { 
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',  
   
  }, 
  titulo: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 5,
    color: Colors.colorletrabotones,
  },

  card: {
    flexWrap: 'wrap',
    backgroundColor: Colors.colorborderubro,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.colorborderubro,
    paddingVertical: 10,
    paddingHorizontal: 10,
    width: 80,
    height: 80,
    marginVertical: 5,
  },
  textContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 80,
    height: 40,
  },
  textRubro: {
    fontSize: 40,
    fontWeight: 'bold',
    paddingLeft: 15,
    color: Colors.colorazulboton,
  },
  textLetra: {
    fontSize: 40,
    fontWeight: 'bold',
    paddingLeft: 15,
    color: 'white',
  },
  textSubRubro: {
    fontSize: 25,
    fontWeight: 'bold',
    paddingLeft: 15,
    color: Colors.colorazulboton,
  },
  textTitulo: {
    fontSize: 15,
    paddingLeft: 15,
    color: 'white',
    padding: 5,
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 5,
    marginLeft: 10,
    color: 'white',
  },
  separador1 : {
    backgroundColor: '#fff',
    width: '100%',
    height: 0.5,
  }
})

export default rubros