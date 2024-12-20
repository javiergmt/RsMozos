// Se muestran los Rubros , Favoritos y Barra de Busqueda
// Aca se cargan las imagenes de los rubros

import { View, Text,  ScrollView, TouchableOpacity, StyleSheet, Image, ListRenderItem, FlatList, TextInput } from 'react-native'
import React, {  useState } from 'react'
import { Link, Redirect, Stack } from 'expo-router'
import { useLoginStore } from '../../store/useLoginStore'
import Colors from '../../../constants/Colors'
import { hyphenatedText, capitalize } from '../../Funciones/deConversion'
import { AntDesign } from '@expo/vector-icons';
import Imagen from '../../../assets/image';
import { EliminarMesa, LiberarMesa } from '../../ApiFront/Posts/PostDatos'

const retImagen = (iconoApp:string) => {
  const imagen = {
    'sandwich': Imagen.sandwich,
    'cafe': Imagen.cafe,
    'cerveza': Imagen.cerveza,
    'alcohol': Imagen.alcohol,
    'vino': Imagen.vino,
    'lata': Imagen.lata,
    'gaseosa': Imagen.gaseosa,
    'carne': Imagen.carne,
    'batido': Imagen.batido,
    'botellaAgua': Imagen.botellaAgua,
    'cacerola': Imagen.cacerola,
    'cerdo': Imagen.cerdo,
    'chorizo': Imagen.chorizo,
    'coctel': Imagen.coctel,
    'combo': Imagen.combo,
    'desayuno': Imagen.desayuno,
    'empanadas': Imagen.empanadas,
    'ensalada': Imagen.ensalada,
    'gallina': Imagen.gallina,
    'jugos': Imagen.jugos,
    'infusiones': Imagen.infusiones,
    'marisco': Imagen.marisco,
    'medialuna': Imagen.medialuna,
    'muffin': Imagen.muffin,
    'pan': Imagen.pan,
    'papasfritas': Imagen.papasfritas,
    'parrila': Imagen.parrilla,
    'pescado': Imagen.pescado,
    'pizza': Imagen.pizza,
    'platosCalientes': Imagen.platosCalientes,
    'pollo': Imagen.pollo,
    'quesos': Imagen.quesos,
    'sushi': Imagen.sushi,
    'tragos': Imagen.tragos,
    'wisky': Imagen.wisky,
    'woks': Imagen.woks,
    'vinoBot': Imagen.vinoBot,
    'vaca': Imagen.vaca,
    'tortas': Imagen.tortas,
    'brunch': Imagen.brunch,
    'macaron': Imagen.macaron,
    'cubiertos': Imagen.cubiertos,

  };
  return imagen[iconoApp]
}

const index = () => {
  //const rubros = useLoginStore( (state) => state.Rubros )
  const {ultMesa,urlBase,mozo,BaseDatos,Rubros} = useLoginStore()
  const [salir, setSalir] = useState(false)
 
  const [text, onChangeText] = useState('');

  const handleSalir = async () => {
    // Desbloquear la mesa o Elimirarla en caso de que no tenga detalle
    if (  ultMesa.ocupada == 'N' ) {
      const res = await EliminarMesa(ultMesa.nroMesa,urlBase,BaseDatos)
     } else {
      const res = await LiberarMesa(ultMesa.nroMesa,false,urlBase,BaseDatos)
     }
     setSalir(true)
  }   

  return (
   
    <View style={styles.container}>
     <Stack.Screen options={
        {headerTitle: `Mesa ${ultMesa.nroMesa} - Mozo: ${mozo.nombre}`,
         headerTitleAlign: 'center',
        headerRight:() => (
          <View style={{flexDirection: 'row',paddingRight: 10}}>
          <TouchableOpacity onPress={() => handleSalir()} >
          <AntDesign name="closecircle" size={30} color={Colors.colorBackBoton} />
          </TouchableOpacity>
          </View>
        )
        }
        } /> 
    { salir && <Redirect href="/mesas" />}
    <View style={styles.container_input}> 
      <TextInput
        style={styles.input}
        onChangeText={onChangeText}
        value={text}     
        placeholder='Buscar Platos'   
        placeholderTextColor='grey'
      />     
      { text != '' &&
      <View style={{marginLeft:10}}>
        <Link href={`platos/selPlatos/@${text}`} asChild>
        <TouchableOpacity >
        <AntDesign name="search1" size={38} color={Colors.colorborderubro} />
        </TouchableOpacity>
        </Link>
      </View>
      }
    </View>   

    <View style={styles.container_input}>  
       <Text  style={styles.textRubro}>Rubros</Text>
      <Link href={`/(tabs)/platos/0`} asChild>
        <TouchableOpacity >
          <Text style={styles.textTitulo}><AntDesign name="appstore1" size={20} color={Colors.colorborderubro} /> Ver Todos </Text>
        </TouchableOpacity>
      </Link>
      <Link href={`/(tabs)/platos/-1`} asChild>
        <TouchableOpacity >
          <Text style={styles.textTitulo}><AntDesign name="heart" size={20} color={Colors.colorborderubro} /> Favoritos</Text>
        </TouchableOpacity>
      </Link>
    </View>  

    <View style={styles.separador1}></View>

    <ScrollView contentContainerStyle={styles.container_rubros}>
      {Rubros.filter( r => r.idRubro > 0).map((r) => (
        <View key={r.idRubro} >     
          <Link href={`/(tabs)/platos/${r.idRubro}`} asChild> 
          <TouchableOpacity >
           <View style={styles.containerImage}>
            { r.iconoApp != '' ?
                <Image style={styles.itemImage} source={retImagen(r.iconoApp)}/>
              :
                <Text style={styles.textRubro}>{r.descripcion.charAt(0).toUpperCase()}</Text>
            }
            </View>
            <View style={styles.textContainer}>
            <Text style={[styles.text]}>{hyphenatedText(capitalize(r.descripcion))}</Text>        
            </View>
          
           </TouchableOpacity>
           </Link>
        
        </View>
       ))}
      
    </ScrollView>

    </View>
  
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    height: '100%',
    alignContent: 'center',
    justifyContent: 'center',
  },
  container_rubros: { 
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    gap: 10,
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
  card: {
    flexWrap: 'wrap',
    backgroundColor: Colors.backbotones,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.colorborderubro,
    paddingVertical: 10,
    paddingHorizontal: 10,
    width: 80,
    height: 80,
    marginVertical: 5,
  },
  container_input: { 
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',  
   
  },
  containerImage: {
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
  itemImage: {
    width: 60,
    height: 60,
    //marginTop: 8,
    //marginLeft: 8,
    objectFit: 'contain',
    
  },
  input: {
    fontSize: 20,
    fontWeight: 'bold',
    height: 40,
    width: '80%',
    borderWidth: 1,
    borderColor: Colors.colorborderubro,
    padding: 5,
    color: 'white',
    //backgroundColor: Colors.backbotones,
    borderRadius: 8,
    paddingBottom: 10,
    
    
  },
  textinput: {
    fontSize: 20,
    fontWeight: 'bold',
    alignSelf: 'center',  
    color: 'white',
    paddingTop: 10,
    paddingLeft: 10,
  },
  separador : {
    backgroundColor: '#fff',
    width: '100%',
    height: StyleSheet.hairlineWidth,
    
  },
  separador1 : {
    backgroundColor: '#fff',
    width: '100%',
    height: 0.5,
    
  }

})

export default index