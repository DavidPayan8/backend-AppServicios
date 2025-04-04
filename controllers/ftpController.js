const { example } = require("../models/ftpModel");


const obtenerListadoFtp = async (req,res) =>{
    try {
        await example()
    } catch (error) {
        console.log(error)
    }
}


module.exports = {
    obtenerListadoFtp
}