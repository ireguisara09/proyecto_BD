
require("dotenv").config();
const mysql = require("mysql2");

// Configuración de la conexión a la base de datos

const host = process.env.DB_HOST || "localhost";
const port = Number(process.env.DB_PORT) || 3306;
const user = process.env.DB_USER || "root";
const password = process.env.DB_PASSWORD || "";
const database = process.env.DB_NAME || "tienda";

// Opciones de configuración

const configuracion = {
    host,
    port,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Si el host es remoto (TiDB Cloud), habilitar SSL
if (host !== "localhost" && host !== "127.0.0.1") {
    configuracion.ssl = {
        minVersion: "TLSv1.2",
        rejectUnauthorized: true
    };
}

// Crear un pool de conexiones MySQL
const conexion = mysql.createPool(configuracion);

// Verificar la conexión a la base de datos
conexion.getConnection((error, connection) => {

    if (error) {
        console.error(
            "Error al conectar con la Base de Datos:",
            error.message
        );
        return;
    }

    console.log(
        `Conexión exitosa con la Base de Datos (${host}:${port})`
    );

    // Liberar la conexión para que pueda reutilizarse
    connection.release();
});

// Exportar el pool para utilizarlo en las rutas del servidor
module.exports = conexion;
