// SOBRE TIEMPO: 

export default function deConversion(){
    return null;
}

/**
 * Genera un array con la hora actual. Utiliza un expresión regular para dividir
 * el string que viene de new Date().toISOString(). En la posición 1 se guarda la hora
 * descartando segundos, dia, mesa y año.
 * @return {string}
 */
export function getHoraActual() {

    return /(\d{2}:\d{2})/.exec(new Date().toISOString())[1]
}

export function getFechaActual() {
    
    return /(\d{4}-\d{2}-\d{2})T/.exec(new Date().toISOString())[1]
}



export function calcularHoras(hora:string){
    // @ts-expect-error: No se porque chilla acá
    const diferenciaEnMillis = new Date() - new Date(hora);
    return `${Math.floor(diferenciaEnMillis / (1000 * 60 *60))}`
}


//SOBRE STRINGS: 

export function capitalizeArray(array:string[]){
    return array.map(word => capitalize(word))
}

export function capitalize(word:string):string{
    /* console.log("CPITALIZE: ", word) */
    try{
        return word[0].toUpperCase() + word.slice(1, word.length).toLowerCase()
    }catch (error){
        console.log("ERROR CAPITALIZE: ", error)
        return ''
    }
}

export function hyphenatedText (text:string) {
    text
    .split(' ')
    .map((word) => word.split('').join('\u00AD'))
    .join(' ');
    return text;
  }

export function getNumberOfString(chain:string):string[] | null {
    // let number = /(\d+)/.test(chain)

    return /^\((\d+)\)(\w+)/.exec(chain)
}

export function isAlphabetic(str: string) {
    return /^[a-zA-Z]+$/.test(str)
}

export function isDigit(value: string) {
    return /^\d+(\.\d+)?$/.test(value)
}

export function convUrlBase(url:string,port:string){
    return 'http://'+url + ':' + port + '/'
}

export function deconvUrl(urlBase:string){
    const pos = urlBase.indexOf('/')
    const url2 = urlBase.substring(pos+2)
    const pos2 = url2.indexOf(':')
    const url = url2.substring(0,pos2)
    //console.log(urlBase,url2,pos,pos2,url)
    return (url)
}
export function deconvPort(urlBase:string){
    const pos = urlBase.indexOf('/')
    const url2 = urlBase.substring(pos+2)
    const pos2 = url2.indexOf(':')
    const pos3 = url2.indexOf('/')
    const url3 = url2.substring(pos2+1)
    const port = url3.substring(0,url3.length-1)  
    //console.log(url2,pos2,pos3,port)  
    return (port)
}

export function izqRellena(cadena:string, longitud:number){
    console.log('cadena:',cadena,' longitud:',longitud, ' cadena.length:',cadena.length)
    let cadret = cadena.padStart(longitud - cadena.length,'0')
    console.log('cadena:',cadret)
    return cadret
        
}


