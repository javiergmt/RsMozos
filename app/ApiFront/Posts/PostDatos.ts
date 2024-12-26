import { mozoType,mesaDetPost, ReservasType } from "../Types/BDTypes"
import { modificarPlatoPost } from "./ConvDatos"
import { showToast } from '../../Funciones/deInfo'
import { Alert } from "react-native"

export default function PostDatos(){
    return null;
}

const requestOptionPost = (parametros: object, operacion = 'POST',base:string) => {
    // console.log("PARAMETROS: ", JSON.stringify(parametros), " OPERACION: ", operacion)
    return {
        method: operacion,
        headers: {'Content-Type': 'application/json',
                  'bd': base
        },
        body: JSON.stringify(parametros)
    }
}

async function isOcupada(nroMesa: number, url:string, base:string) {
    const response = await fetch(url+ "mesa/" + `${nroMesa}/-1`,
        {   method: 'get', 
            headers: new Headers({
              'bd': base,
            })
        }
    )
    const mesa = await response.json()
    return (mesa[0]?.cerrada === 2)
 
}

export const LiberarMesa = async (nroMesaLiberar = 0, borrarMesa = false,url:string,base:string) => {
    if (borrarMesa) EliminarMesa(nroMesaLiberar,url,base)
    return fetch(url+"mesa_desbloquear/",
        requestOptionPost({ nromesa: nroMesaLiberar},'POST',base))
        .then(response => response.json())
        .catch(error => console.log(error))
}

export const BloquearMesa = async (nroMesaBloquear: number,mozo:number, url:string,base:string) => {
    
    console.log("BLOQUEAR MESA: ", nroMesaBloquear, "MOZO: ", mozo)
    const res = await isOcupada(nroMesaBloquear,url,base)
    
    console.log("RES: ", res)    

    if (!res) {
    return fetch(url+"mesa_bloquear/",
        requestOptionPost({ nromesa: nroMesaBloquear,idMozo: mozo },'POST',base))
        .then(response => response.json())
        .catch(error => console.log(error))
        // .then(response => console.log("RESPONSE BLOQUEAR MESA \n", response))
    } else {
       return {"mesa": 0 , "res": "Mesa ocupada"}
    }
   

}

export const AbrirMesa = async (nroMesa: number, mozo: mozoType, url:string,base:string) => {
    const accesoInvalido = await isOcupada(nroMesa,url,base)
    if (accesoInvalido) return accesoInvalido
    const acceso = await fetch(url+"mesa_abrir/",
        requestOptionPost({
            nromesa: nroMesa,
            mozo: mozo?.idMozo
        },'POST',base))
        .then(response => response.json())
    return acceso
}

export const CerrarMesa = async (nroMesa: number, url:string,base) => {
    // const accesoInvalido = await isOcupada(nroMesa,url)
    // if (accesoInvalido) return accesoInvalido
    const acceso = await fetch(url+"mesa_cerrar/",
        requestOptionPost({
            nromesa: nroMesa,
            pagos: 0,
            descTipo: 0,
            descImporte: 0,
            idCliente: 0,
            nombre: "",
            direccion: "",
            localidad: "",
            telefono: "",
            telefono2: "",
            telefono3: "",
            email: "",
            idZona: 0,
            fechaNac: "2024-07-31T22:33:43.764Z",
            cuit: "",
            idIva: "",
            tarjeta: ""
        },'POST',base))
        .then(response => response.json())
    return acceso
}

export const GrabarComensales = async (nroMesa: number, comensales: number, url:string,base) => {    
    const comens = await fetch(url+"mesa_comensales/",
        requestOptionPost({
            nroMesa: nroMesa,
            cant: comensales
        },'POST',base))
        .then(response => response.json())
        .catch(error => console.log(error))
    return comens
}

export const EliminarMesa = (nroMesa: number, url:string,base:string) => {
    try {
        return fetch(url+"mesa_borrar/",
            requestOptionPost({
                nromesa: nroMesa,
            }, 'DELETE',base))
        // .then(response => response.json())
        // .then(response => console.log("RESPONSE DELETE ", response))
        // .catch(error => console.log("ERROR DELETE MESA:", error))
    } catch (error) {
        console.log(error)
    }
}

export const GrabarMesa = async (det:mesaDetPost[] ,url:string,base:string) => {
    //console.log("BODY JSON: ", JSON.stringify(det.toString()))
    //const body = requestOptionPost({det})
     return fetch(url+"mesa_dest_mult/", {method: 'POST',
        headers: {'Content-Type': 'application/json',
            'bd': base
        },
        body: JSON.stringify(det) })        
        .then(response => response.json())
        .catch(error => console.log(error))
}

export const CambiarReserva = async (r:ReservasType ,url:string, base:string) => {    
    console.log("RESERVA: ", r,url,base)
    const reserva = await fetch(url+"reserva_cambiar/",
        requestOptionPost({
            idReserva: r.idReserva,
            fecha: r.fecha.toISOString(),
            turno: r.turno,
            nombre: r.nombre,
            hora: r.hora,
            cant: r.cant,
            obs: r.obs,
            telefono: r.telefono,
            idSector: r.idSector,
            mesa: r.mesa,
            idCliente: r.idCliente,
            confirmada: true,
            cumplida: r.cumplida,
            usuario: r.usuario,

        },'POST',base))
        .then(response => console.log(response.json()))
        .catch(error => console.log(error))
       
    return reserva
}

const respuesta = (mens:string) => {
    console.log('Respuesta',mens)
    if (mens === 'commit') showToast('Datos grabados')
    else
    Alert.alert('ATENCION !! Hubo un error, revise las comandas y que los datos se hayan grabado!!',mens)
}

export const AgregarDetalleMulti = (detalles: object[], url:string,base) => {
  console.log("DETALLES: ", detalles)
  const body = requestOptionPost({ mesaDetM: detalles.map((detalle) => modificarPlatoPost(detalle)) }, 'POST',base)
  const endpoint = url+ "mesa_det_mult/"
  let mensaje = ""
  fetch(endpoint, body)
    .then(response => response.json())
    .then(response => { respuesta(response.mensaje) })
      //console.log("RESPUESTA AGREGAR DETALLE: ", response, "\n DETALLE: ", body, "\n ENDPOINT", endpoint)
      
    //) 
    .catch(error => {
      console.log("ERROR AGREGAR DETALLE: ", error)
      console.log("BODY: ", body)
      console.log("ENDPOINT", endpoint)
      respuesta(error.message)
    })
    
}