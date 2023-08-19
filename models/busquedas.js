const fs = require("fs");
const axios = require("axios");

class Busquedas {

    historial = [];
    dbPath = "./db/database.json"

    constructor() {
        //TODO: Leer DB si existe
        this.leerDB();
    }

    get historialCapitalizado() {
        //Capitalizar cada palabra
        return this.historial.map( el => {

            let palabras = el.split(" ");
            palabras = palabras.map(palabra => {
                return palabra[0].toUpperCase() + palabra.substring(1)
            })

            return palabras.join(" ")
        });
    }

    get paramsMapbox () {
        return {
            "access_token": process.env.MAPBOX_KEY, 
            "limit": 5,
            "lenguaje": "es"
        }
    }

    get paramsWeather() {
        return {
                appid: process.env.OPENWEATHER_KEY,
                units: "metric",
                lang: "es"
            }
    }

    async ciudad(lugar = "") {
        
        try {
            
            //petición HTTP
            const intance = axios.create({
               baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
                params: this.paramsMapbox
            });

            const resp = await intance.get();

            // const resp = await axios.get("https://reqres.in/api/users?page=2")
            //const resp = await axios.get(`${"https://api.mapbox.com/geocoding/v5/mapbox.places/ottawa.json?proximity=ip&language=es&access_token=pk.eyJ1IjoiZmFicmljaW9sZWxsIiwiYSI6ImNsbDJwenJmMjAwN3QzcnA5OThnY3B5ZGkifQ.8Dzk911dtZRPGIkeBdSAIw"}`, {
                //headers: {
                //"accept-encoding": null
                //}
                //})
            
                return resp.data.features.map(el => {
                    
                    return {
                        id: el.id,
                        nombre: el.place_name,
                        lng: el.center[0],
                        lat: el.center[1]
                    }
                })
                
        } catch (error) {
                return []
        }
        
        // return []; //return los lugares
    }

    async climaLugar( lat,lon ) {

        const intance = axios.create({
            baseURL: `https://api.openweathermap.org/data/2.5/weather?`,
            params: {...this.paramsWeather, lat, lon}
        }) 

        const resp = await intance.get();
        const { weather,main } = resp.data;
        
        try {

            return {
                desc: weather[0].description,
                min: main.temp_min,
                max: main.temp_max,
                temp: main.temp
            }

        } catch (error) {
            console.log(error)
        }
    }


    agregarHistorial(lugar = "") {
         
        if(this.historial.includes(lugar.toLocaleLowerCase() ) ) {
            return;
        }

        this.historial = this.historial.splice(0,5);

        //TODO: prevenir duplicado
        this.historial.unshift(lugar.toLocaleLowerCase())

        //Grabar en DB
        this.guardarDB()
    }

    guardarDB(){

        const payload = {
            historial: this.historial
        }
        fs.writeFileSync(this.dbPath, JSON.stringify(payload))
    }

    leerDB() {

        if ( !fs.existsSync(this.dbPath)) {
            return;
        }
        
        const info = fs.readFileSync(this.dbPath, {encoding: "utf-8"});
        const data = JSON.parse(info);

        this.historial = data.historial;
    }
}

module.exports = Busquedas;