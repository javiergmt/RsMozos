import { Stack } from "expo-router"
import Colors from "../../../constants/Colors"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "react-native"
import { useLoginStore } from "../../store/useLoginStore"
import { useEffect, useState } from "react"
import { mesaType } from "../../ApiFront/Types/BDTypes"
import React from "react"

const NewsStacK = () => {
const [ultMesa, setUltMesa] = useState<mesaType>()
const [titulo, setTitulo] = useState('')
const { getUltMesa,mozo } = useLoginStore();

useEffect(() => { 
    const m = getUltMesa()
    setUltMesa(m)
    setTitulo(m.nroMesa.toString())
    console.log('Traigo Mesa:',m)
  }, [] )

return (
    <>

    <Stack  screenOptions={{
            headerStyle: {
                backgroundColor: Colors.background,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
                fontWeight: 'bold',
            },
            
        }}>
        <Stack.Screen name="index" options={{headerTitle: `Mesa ${titulo} - Mozo: ${mozo.nombre}`, headerTitleAlign: 'center'}} />
        <Stack.Screen name="selTam" options={{headerTitle: `Mesa ${titulo} - Mozo: ${mozo.nombre}`, headerTitleAlign: 'center'}} /> 
        <Stack.Screen name="selCombo" options={{headerTitle:`Mesa ${titulo} - Mozo: ${mozo.nombre}`, headerTitleAlign: 'center'}} /> 
    </Stack>

    </>
    )
}

export default NewsStacK