const sql = require('mssql');
const config = require('../config/dbConfig');

let pool;

const connectToDb = async () => {
    if (!pool) {
        pool = await sql.connect(config);
    }
    return pool;
};

const ficharEntrada = async (userId, date, horaEntrada) => {
    try {
        const pool = await connectToDb();

        await pool.request()
            .input('userId', sql.Int, userId)
            .input('fecha', sql.Date, date)
            .input('horaEntrada',  sql.VarChar, horaEntrada)
            .query(`INSERT INTO CONTROL_ASISTENCIAS ( id_usuario, fecha, hora_entrada) 
                    VALUES ( @userId, @fecha, @horaEntrada)`);
    } catch (error) {
        console.error('Error al fichar entrada:', error.message);
        throw error;
    }
};

const ficharSalida = async (id, horaSalida) => {
    try {
        const pool = await connectToDb();

        await pool.request()
            .input('id', sql.Int, id)
            .input('horaSalida',  sql.VarChar, horaSalida)
            .query(`UPDATE CONTROL_ASISTENCIAS 
                    SET hora_salida = @horaSalida 
                    WHERE id = @id`);
    } catch (error) {
        console.error('Error al fichar salida:', error.message);
        throw error;
    }
};

const getPartesUsuarioFecha = async (userId, date) => {
    try {
        const pool = await connectToDb();

        let result = await pool.request()
        .input('userId', sql.Int, userId)
        .input('date', sql.Date, date)
        .query(`SELECT * FROM CONTROL_ASISTENCIAS 
                WHERE id_usuario = @userId AND fecha = @date`);
        return result.recordset;
    } catch (error) {
        console.error('Error al obtener registro de asistencia:', error.message);
        throw error;
    }
};

const getParteAbierto = async (userId, date) => {
    try {
        const pool = await connectToDb();
        
        let result = await pool.request()
            .input('userId', sql.Int, userId)
            .input('date', sql.Date, date)
            .query(`SELECT * FROM CONTROL_ASISTENCIAS 
                    WHERE id_usuario = @userId AND fecha = @date AND hora_salida IS NULL`);
        return result.recordset[0];
    } catch (error) {
        console.error('Error al obtener registro de asistencia:', error.message);
        throw error;
    }
};

module.exports = {
    ficharEntrada, 
    ficharSalida, 
    getParteAbierto,
    getPartesUsuarioFecha,
};