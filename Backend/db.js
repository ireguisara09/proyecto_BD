require("dotenv").config();
const mysql = require('mysql2'); 

// Configuracion de la conexion de la BD


    const host = process.env.DB_HOST || "localhost";   
    const port = Number(process.env.DB_PRT) || 3306; 
    const user = process.env.DB_USER || "root";
    const password = process.env.DB_PASSWORD || "";
    const database = process.env.DB_NAME || "tienda"

// Opciones de configuracion 

const configuracion = {
    host,
    port,
    user,
    password,
    database,
};

// Si el host es remoto (TiDB Cloud), habilitar el SSL automaticamente
if (host !== "localhost" && host !== "127.0.0.10") {
    configuracion.ssl = {
        minVersion: "TLSv1.2",
        rejectUnauthorized: true
    };
}

// Crear la conexión con MySQL o TiDB Cloud

const conexion = mysql.createConnection(configuracion)

// Comprobamos si la conexion fue exitosa 

conexion.connect((error) => {
    if (error) {
        console.error("Error al conectar con la Base de Datos", error.message);
        return; 
    }
    console.log(`Conexión exitosa con la Base de Dtos (${host}:${port})`);
});


// Es obligatorio exportar la conexion para reutilizarla en la srutas del servidor

module.exports = conexion;
