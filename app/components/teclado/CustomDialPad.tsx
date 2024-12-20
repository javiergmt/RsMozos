import {
    SafeAreaView,
    StyleSheet,
    Text,
    View,
    Dimensions,
    TouchableOpacity,
   } from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import DialpadKeypad from "../teclado/DialPadKeyPad";
import Colors from '../../../constants/Colors'
import { useSafeAreaInsets } from "react-native-safe-area-context";
   
const { width } = Dimensions.get("window");

const dialPadContent = [1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "X"];

const dialPadSize = width * 0.17;
const dialPadTextSize = dialPadSize * 0.37;

const pinLength = 4;

const CustomDialPad = ({setPass}) => {

const { bottom, top, right, left } = useSafeAreaInsets(); 
const [code, setCode] = useState([]);    
const onTerminar = () => {
   setPass(code)
}
return (
      
        <View style={styles.container}>

           <View style={styles.textContainer}>
              <Text style={styles.pinText}>{code}</Text>
           </View>

           <View style={{flex: 1}}>
              <DialpadKeypad
                dialPadContent={dialPadContent}
                setCode={setCode}
                code={code}
                dialPadSize={dialPadSize}
                dialPadTextSize={dialPadTextSize}
              />
          </View>

          <View style={{ bottom, height: 50, }}>         
              <TouchableOpacity onPress={onTerminar}>
                <Text style={styles.valText} >Validar Mozo</Text>
              </TouchableOpacity>
          </View>

        </View>
    
);
};
   
export default CustomDialPad ;
   
   const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.background, 
    },
    textContainer: {
      justifyContent: "center",
      alignItems: "center",      
      position: "relative",
      backgroundColor: Colors.background,
      height: 50
    },
    valText: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#ffffff",
        backgroundColor: Colors.colorfondoBoton,
        padding: 5,
        borderRadius: 10,
        textAlign: "center",
      },
    pinText: {
      fontSize: 30,
      fontWeight: "bold",
      color: "#ffffff",
   
    },
    // pinSubText: {
    //   fontSize: 18,
    //   fontWeight: "bold",
    //   color: "#5E454B",
    //   marginVertical: 20,
    // },
    // Pie: {
    //   //position: 'absolute',
    //   //width: '100%',
    //   height: 50,
      
    // },
});