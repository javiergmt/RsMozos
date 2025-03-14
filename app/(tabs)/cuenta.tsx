import { View, Text, Button, ScrollView, TouchableOpacity,StyleSheet, TextInput, ActivityIndicator, Alert } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { Redirect, Stack } from 'expo-router'
import { useLoginStore } from '../store/useLoginStore'
import { getComboDet, getComboSec, getGustos, getInfoComboSec, getMesaDet,getPlato_Precio,getPlatos } from '../ApiFront/Gets/GetDatos'
import { mesaDetType,mesaDetPost,platosType, comboSecType, comboDetType, comboInfoSecType, gustosType, combosGustosType, comboPostType } from '../ApiFront/Types/BDTypes'
import Colors from '../../constants/Colors'
import { EliminarMesa, LiberarMesa, AgregarDetalleMulti, CerrarMesa, BorrarRenglon } from '../ApiFront/Posts/PostDatos'
import { AntDesign ,Entypo } from '@expo/vector-icons';
import { capitalize, getHoraActual } from '../Funciones/deConversion'
import FlashMessage from "react-native-flash-message";
import { showMessage, hideMessage } from "react-native-flash-message";
import BouncyCheckbox from 'react-native-bouncy-checkbox'
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet'
import InputSpinner from 'react-native-input-spinner'
import { GestureHandlerRootView } from 'react-native-gesture-handler'


type Gustos ={
  idSeccion: number;
  idPlato: number;
  idGusto: number;
  descGusto: string;
  cant:number;
  idPlatoRel:number;
}

const cuenta = () => {
  const {mozo,ultMesa,ultDetalle,setUltDetalle,getParam,
    mesaDet,mesaDetGustos,mesaDetModif,urlBase,
    setMesaDet,origDetalle,setOrigDetalle,setUltItem,getUltItem,
    getBaseDatos,BaseDatos, comensales} = useLoginStore()
  const [cuenta, setCuenta] = useState<mesaDetType[]>([])
  const [verAnt, setVerAnt] = useState(true)
  const [isError, setIsError] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [origDet, setOrigDet] = useState(0)
  const [comandar, setComandar] = useState(false)
  const [itemSel, setItemSel] = useState(0) 
  const [info, setInfo] = useState(false)
  const [text, onChangeText] = useState('')
  const [descSel, setDescSel] = useState('')
  const [esEntSel, setEsEntSel] = useState(false)
  const [salir, setSalir] = useState(false)
  const Param = getParam()
  const [refreshing,setRefreshing] =useState(false)
  const [selectCombo, setSelectCombo] = useState(false)
  const [idDetalle, setIdDetalle] = useState(0)
  // Modif de Combos
  const [item, setItem] = useState<platosType>( getUltItem() )
  const [comboSec, setComboSec] = useState( [] as comboSecType[]) 
  const [comboDet, setComboDet] = useState( [] as comboDetType[][])  
  
  const [cantMax, setCantMax] = useState(0)  
  const [ultSeccion, setUltSeccion] = useState(0)
  const [ultPlato, setUltPlato] = useState(0)
  const [isOk, setIsOk] = useState(false)
  const [autocompletar, setAutocompletar] = useState(false)
  const [unicoPlato, setUnicoPlato] = useState('')
  const [isGustos, setIsGustos] = useState(false)
  const [gustos, setGustos] = useState( [] as gustosType[])
  const [combosGustos, setCombosGustos] = useState( [] as Gustos[])
  const [cantGustos, setCantGustos] = useState(0)
  const [cantMaxGustos, setCantMaxGustos] = useState(0)
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = ['80%', '80%'];


  // Trae los datos de En_NesaDet
  const traerCuenta = async (url:string,base:string) => {
    const { cuenta, isError, isPending } = await getMesaDet(ultMesa.nroMesa,url,base)
    return cuenta
  }

  const handleinfotext = () => { 
    mesaDet.forEach((m) =>{
      if(m.idDetalle == itemSel){
        m.obs = text
        m.esEntrada = esEntSel
      }})
    setInfo(false)
    onChangeText('')
  }

  const handleInfo = () => {  
    if (itemSel != 0) {
      mesaDet.forEach((m) =>{
        if(m.idDetalle == itemSel){
          setDescSel(m.descripcion)
          setEsEntSel(m.esEntrada)
          onChangeText(m.obs) 
        }})
     setInfo(true)
    }  
  }

  const handleCerrar = async () => {  
    const res = await CerrarMesa(ultMesa.nroMesa,urlBase,BaseDatos)
    setSalir(true)
    return
  }

  const handleComandar = async (ok:boolean) => {
   if (!ok) {
      // Desbloquear la mesa o Elimirarla en caso de que no tenga detalle
      if (  ultMesa.ocupada == 'N' ) {
       const res = await EliminarMesa(ultMesa.nroMesa,urlBase,BaseDatos)
      } else {
       const res = await LiberarMesa(ultMesa.nroMesa,false,urlBase,BaseDatos)
       
    }
      // No grabo nada y vuelvo a mesas
      
      setComandar(true)
      return
    }

    // Desbloquear la mesa o Elimirarla en caso de que no tenga detalle
    if ( ( origDetalle == ultDetalle) && ultDetalle == 0 && ultMesa.ocupada == 'N' ) {
       const res = await EliminarMesa(ultMesa.nroMesa,urlBase,BaseDatos)
    } else {
       const res = await LiberarMesa(ultMesa.nroMesa,false,urlBase,BaseDatos)       
    }
    
    // Grabo la mesa y vuelvo a mesas
    const mDet = mesaDet.filter((m) => m.idDetalle > origDetalle)
    const detalle =[] as mesaDetPost[]
    mDet.forEach((m) => {

        const det ={ 
          nroMesa: ultMesa.nroMesa,
          idDetalle: m.idDetalle,          
          idPlato: m.idPlato,
          idTipoConsumo: m.idTipoConsumo,
          cant: m.cant,
          pcioUnit: m.pcioUnit,
          importe: m.importe,
          obs: m.obs,
          idTamanio: m.idTamanio,
          tamanio: m.descTam,
          procesado: true,
          hora: getHoraActual(),
          idMozo: mozo.idMozo,
          nombreMozo: mozo.nombre,
          idUsuario: 0,
          cocinado: true,
          esEntrada: m.esEntrada,
          descripcion: m.descripcion,
          fechaHora: new Date().toISOString(),
          comanda: true,
          idSectorExped: m.idSectorExped,
          impCentralizada: m.impCentralizada,
          gustos: m.gustos,
          combos: m.combos,
         
        }
        
        detalle.push(det)
      })

      if (mDet.length > 0){
        // Esta es la grabacion del detalle de la mesa
        // Los errores se chekean en la funcion AgregarDetalleMulti
        // y se generan mensajes informando el resultado 
        const res = AgregarDetalleMulti(detalle,urlBase,BaseDatos)
       
      }

      mesaDet.splice(0,mesaDet.length)
      mesaDetGustos.splice(0,mesaDetGustos.length)
      mesaDetModif.splice(0,mesaDetModif.length) 
  
      setComandar(true)  
      /*
      showMessage({
        message: "Plato con Modif Agregado!!",
        description: "El Plato fue agregado a la Comanda",
        type: "success",
     
      });
      setTimeout(() => setComandar(true),
      1000
      ) 
      */  
  }  

  const handleVerAnt = () => {  
    setVerAnt(!verAnt)
  }

  const handleSelec = async (c:mesaDetType) => {
    if (!info) {
      setItemSel(c.idDetalle)
    }
    if (c.idTipoConsumo == "CB") {
      const plato = await getPlatos('C',c.idPlato.toString(),'0','0',urlBase,BaseDatos)
    
      setUltItem(plato[0])
      setIdDetalle(c.idDetalle)
      const it = plato[0]
       
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
            
            const infoSecc = await getInfoComboSec(ultMesa.nroMesa,c.idDetalle,0,urlBase,BaseDatos)
            const seccion = await getComboDet(s.idSeccion,urlBase,BaseDatos);
            // console.log('Carga Seccion:',seccion)
            if (seccion.length > 1) {  
                seccion.forEach((r) => {
                  r.selected = false
                  infoSecc.forEach((i) => {
                      if (i.idSeccion == r.idSeccion && i.idPlato == r.idPlato) {
                        r.selected = true
                        r.comandado = true
                      }
                  })
                }) 
            }
            sec.push(seccion)
          })
          
          setIdDetalle(c.idDetalle)
          setComboDet(sec)
        
      })
      setSelectCombo(true) 
    }  
    return
  }

  const handleBorrar = () => {
    // Borrar el item seleccionado
    if (itemSel != 0) {
      const mDet = mesaDet.filter((m) => m.idDetalle != itemSel)
      setMesaDet(mDet)
      setCuenta(mDet)
    }
  }

  const handleSalir = async () => {
    // Desbloquear la mesa o Elimirarla en caso de que no tenga detalle
    if (  ultMesa.ocupada == 'N' ) {
      const res = await EliminarMesa(ultMesa.nroMesa,urlBase,BaseDatos)
     } else {
      const res = await LiberarMesa(ultMesa.nroMesa,false,urlBase,BaseDatos)
     }

     setSalir(true)
  }   

  const handleCantidad = (cant:number) => {
    // Cambiar la cantidad del item seleccionado
    if (itemSel != 0) {
    mesaDet.forEach((m) =>{
       if(m.idDetalle == itemSel){
          if (m.cant + cant <= 0) {
              m.cant = 0
              m.importe = 0
              const mDet = mesaDet.filter((m) => m.idDetalle != itemSel)
              setMesaDet(mDet)
              setCuenta(mDet)
              return
          } else {    
              m.cant = m.cant + cant
              m.importe = m.cant * m.pcioUnit
              setMesaDet(mesaDet)
              setCuenta(mesaDet)
              return
          }          
       }
    })
    
    }
  
  }

  // Modif. Combos
  const handleSecciones = async (id:number,cmax:number,auto:boolean,descCorta:string) => {
    // Seleccionar la seccion de combos
    console.log('Seccion:',id,cmax,auto,descCorta)
    setUltSeccion(id)
    setCantMax(cmax)   
    if (auto) {
      setAutocompletar(true)
      setUnicoPlato(descCorta)
      setIsOk(true)
    } else {
      setAutocompletar(false)
      setUnicoPlato('')
      setIsOk(false)
    }
    return
  }   

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
                   d.comandado = false
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

  const handleModifCombo = async () => {
    // Grabo la mesa y vuelvo a mesas
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
                    comanda: d.comandado,
                    descripcion: d.descripcion,
                    idSectorExped: d.idSectorExped, 
                    impCentralizada: d.impCentralizada,              
                    combosGustos: detgustos.length > 0 ? detgustos : []                
                  })           
                  
              }        
            })        
    }) // Fin del forEach
    console.log('Detalle Combo:',comboDet)
    const mDet = mesaDet.filter((m) => m.idDetalle == idDetalle)
    console.log('Detalle:',mDet)
  
    const detalle =[] as mesaDetPost[]
    //mDet.forEach((m) => {
    const det:mesaDetPost ={ 
          nroMesa: ultMesa.nroMesa,
          idDetalle: ultDetalle+1,          
          idPlato: mDet[0].idPlato,
          idTipoConsumo: mDet[0].idTipoConsumo,
          cant: mDet[0].cant,
          pcioUnit: mDet[0].pcioUnit,
          importe: mDet[0].importe,
          obs: "",
          idTamanio: 1,
          tamanio: "",
          procesado: true,
          hora: getHoraActual(),
          idMozo: mozo.idMozo,
          nombreMozo: mozo.nombre,
          idUsuario: 0,
          cocinado: true,
          esEntrada: false,
          descripcion: mDet[0].descripcion,
          fechaHora: new Date().toISOString(),
          comanda: true,
          idSectorExped: 0,
          impCentralizada: 0,
          gustos: [],
          combos: detcombo.length > 0 ? detcombo : [],
         
    }
    detalle.push(det)
    console.log('Detalle:',detalle[0])
    const res1 = AgregarDetalleMulti(detalle,urlBase,BaseDatos)    
    const res2 = await BorrarRenglon(ultMesa.nroMesa,idDetalle,1,"CB",urlBase,BaseDatos)
    setSelectCombo(false)
    const cuenta = traerCuenta(urlBase,BaseDatos)
      cuenta.then((res) => {
        const result = res.length > 0 ? res[res.length-1].idDetalle : 0
        console.log('renglones ',res)
        setMesaDet(res)
        setCuenta(res)       
        setUltDetalle(result)
        setOrigDetalle(result)
        setOrigDet(result)
      })  
    
}  

  useEffect(() => {
    console.log('mesaDet',mesaDet)
    if (mesaDet.length == 0) {
      // Es la primera vez que se carga la cuenta
      
      // Traigo la cuenta de la mesa de En_mesadet ( puede ser vacia )
      const cuenta = traerCuenta(urlBase,BaseDatos)
      cuenta.then((res) => {
        const result = res.length > 0 ? res[res.length-1].idDetalle : 0
        console.log('renglones ',res)
        setMesaDet(res)
        setCuenta(res)       
        setUltDetalle(result)
        setOrigDetalle(result)
        setOrigDet(result)
      })  
    
    } else {
      // Ya se cargo la cuenta
      setCuenta(mesaDet)

    }

    //console.log('orig ',origDet)
    
  }, [mesaDet]);

  return (
   <GestureHandlerRootView style={{ flex: 1 }}>
    <View style={styles.container}>
     
     <Stack.Screen options={{
                              headerTitle: `Mesa ${ultMesa.nroMesa} - ${comensales} Pers.`,
                              headerTitleAlign: 'center',
                              headerStyle: {
                                backgroundColor: Colors.background,
                              },
                              headerTintColor: '#fff',
                              headerTitleStyle: {
                                  fontWeight: 'bold',
                              },
                              headerRight:() => (
                                <View style={{flexDirection: 'row',paddingRight: 10}}>
                                <TouchableOpacity onPress={() => handleSalir()} >
                                <AntDesign name="closecircle" size={35} color={Colors.colorBackBoton} />
                                </TouchableOpacity>
                                </View>
                              )                                 
                              }}
                              />
                              
                              
                                               
        { salir && <Redirect href="/mesas" />}     

        {!selectCombo &&
        <View>                      
        <Text style={styles.titulo}>Detalle de la cuenta</Text> 
        </View>
        }

        {selectCombo &&
        <View>                      
        <Text style={styles.titulo}>Modificacion de Combo</Text> 
        </View>
        }
       
        <ScrollView >
       
        { isPending && 
        <View>
        <ActivityIndicator size="large" color="#0000ff"/>
        </View>
        }

        {!selectCombo && cuenta.length>0 && cuenta.map((c) => (
          <View  key={c.idDetalle} >
          { (c.idDetalle > origDet ) && 
         
            <View style={styles.itemContainer} >    
              <TouchableOpacity style={styles.itemSelContainer} onPress={()=>handleSelec(c)} >
              {c.idDetalle == itemSel ?
              <Entypo name="vinyl" size={20} color={Colors.colorcheckbox} />
              :
              <Entypo name="circle" size={20} color={Colors.colorcheckbox} />
              }
              <Text style={styles.item}> {c.cant.toFixed(2).toString().padStart(8,'')} </Text>
              <Text style={styles.item}> {capitalize(c.descripcion)}</Text>
              </TouchableOpacity>  
            </View>
     
          }
          {c.idDetalle <= origDet && verAnt && c.idTipoConsumo=="CB" &&
      
          <View style={styles.itemContainer} >    
              <TouchableOpacity style={styles.itemSelContainer} onPress={()=>handleSelec(c)} >
              {c.idDetalle == itemSel ?
              <Entypo name="dots-three-horizontal" size={20} color={Colors.colorcheckbox} />
              :
              <Entypo name="dots-three-horizontal" size={20} color={Colors.colorcheckbox} />
              }
              <Text style={styles.item}> {c.cant.toFixed(2).toString().padStart(8,'')} </Text>
              <Text style={styles.item}> {capitalize(c.descripcion)}</Text>
              </TouchableOpacity>  
          </View>
          }
          {c.idDetalle <= origDet && verAnt && c.idTipoConsumo!="CB" &&
          <View style={styles.itemContainer}>     
            <Entypo name="circle" size={15} color={Colors.background} />
            <Text style={styles.itemorig}> {c.cant.toFixed(2).toString().padStart(8,'')} </Text>
            <Text style={styles.itemorig}> {capitalize(c.descripcion)}</Text>
          </View>
          }
        </View>

        ))}

        { selectCombo && comboSec &&
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
        {comboDet && selectCombo &&
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
      
      
      {isGustos && selectCombo &&
      
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

      {info &&
       <View style={styles.modalContainer}>
       <Text style={styles.titulo}>Observaciones</Text>
       <Text style={styles.iteminput}>{descSel}</Text>
       <View style={styles.inputContainer}>
       <TextInput
         style={styles.input}
         onChangeText={onChangeText}
         value={text}     
         placeholder='Observaciones'   
       />
       </View>
       <View style={styles.itemContainer} >    
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
              <TouchableOpacity onPress={() => handleinfotext()} > 
                <Text style={styles.textBtSalir}>Confirmar</Text> 
              </TouchableOpacity>
        </View>
         
       </View>
      }

      {!selectCombo &&
      <View style={styles.pieContainer}>
      {Param[0].mozosCierranMesa && cuenta.length <= origDet && cuenta.length > 0 &&
      <TouchableOpacity onPress={() => handleCerrar()}  >
      <AntDesign name="filetext1" size={40} color={Colors.colorazulboton} />
      </TouchableOpacity>
      }
      <TouchableOpacity  onPress={()=>handleCantidad(-1)} >
      <AntDesign name="minuscircle" size={40} color="white" />
      </TouchableOpacity>
      <TouchableOpacity onPress={()=>handleCantidad(1)} >
      <AntDesign name="pluscircle" size={40} color="white" />
      </TouchableOpacity>      
      <TouchableOpacity  onPress={()=>handleBorrar()} >
      <AntDesign name="delete" size={40} color="white" />
      </TouchableOpacity>     
      <TouchableOpacity onPress={()=>handleInfo()}>
      <AntDesign name="form" size={40} color="white" />
      </TouchableOpacity>     
      <TouchableOpacity onPress={() => handleVerAnt()}  >
      {verAnt ? <AntDesign name="eye" size={40} color="white" /> 
              : <AntDesign name="eyeo" size={40} color="white" />}  
   
      </TouchableOpacity>      

      <TouchableOpacity onPress={() => handleComandar(true)}  >
      <AntDesign name="printer" size={40} color={Colors.colorazulboton} />
      </TouchableOpacity>
      </View> 
      }

      { 
        selectCombo && !isGustos && 
        <View style={styles.pieContainer}>
        <TouchableOpacity onPress={() => handleModifCombo()}  >
          <AntDesign name="checkcircle" size={40} color={Colors.colorazulboton} />
        </TouchableOpacity> 
        <TouchableOpacity onPress={() =>  setSelectCombo(false)}  >
          <AntDesign name="closecircle" size={40} color={Colors.colorazulboton}  />
        </TouchableOpacity>
        </View>        
      } 
      
      {
        comandar ?<Redirect href={`/mesas`}  /> : <Text></Text>
      }

  

    </View>
  </GestureHandlerRootView>
     
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,    
    justifyContent: 'center',
    margin: 0,
    backgroundColor: Colors.background,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginRight: 10,

    //padding: 5,
  },modalContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    margin: 10,                      
    borderRadius: 8,
    borderWidth: 2,
    backgroundColor: Colors.colorBackModal,
    //padding: 5,
  },
  itemSelContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginRight: 10,
    //padding: 5,
    paddingLeft: 5,
    paddingBottom: 5,

  },
  item: {
    fontSize: 20,
    fontWeight: 'bold',
    alignSelf: 'center',
    color: Colors.colorazulboton,
    paddingLeft: 10,
  },
  itemorig: {
    fontSize: 20,
    fontWeight: 'bold',
    alignSelf: 'center',
    color: Colors.itemsviejos,
    paddingLeft: 20,
  },
  label: {
    margin: 8,
  },
  titulo: {
    fontSize: 30,
    fontWeight: 'bold',
    alignSelf: 'center',
    color: Colors.colorazulboton,    
 },
 pieContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 5,
 },
 inputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    marginTop: 10
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
 bottombutton: {
    padding: 10,
    alignItems: 'center',
 },

 containerScrollh: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap:10,
    marginLeft: 10,
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
  containerScrollvSheet: { 
            //alignContent: 'center', // tiene efecto si esta el wrap
            //marginBottom: 20,  
  },
});


export default cuenta